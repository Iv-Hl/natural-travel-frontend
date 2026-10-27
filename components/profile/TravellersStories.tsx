"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import StoryCard, { type Story } from "../stories/StoryCard";
import styles from "./TravellersStories.module.css";
import { fetchWithAuth } from "@/lib/api/fetchWithAuth";
import { getTravellerStories } from "@/lib/api/travellers";
import { useAuth } from "@/components/providers/AuthProvider";
import ErrorWhileSavingModal from "../ErrorWhileSavingModal/ErrorWhileSavingModal";
import MessageNoStories from "../shared/MessageNoStories";
import { usePathname } from "next/navigation";

interface StoriesResponse {
  stories: Array<Story & { author?: { name?: string } | null }>;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  pagination?: { totalPages?: number };
}

interface SaveStoryResponse {
  savedArticles?: string[];
  rate?: number;
  message?: string;
}

interface TravellersStoriesProps {
  travellerId?: string;
  isSavedTab?: boolean;
}

const DESKTOP_BREAKPOINT = 1440;

export default function TravellersStories({
  travellerId,
  isSavedTab: isSavedProp,
}: TravellersStoriesProps) {
  const pathname = usePathname();
  const isSavedTab = isSavedProp ?? pathname.includes("/saved");

  const { user, isLoading: isAuthLoading, updateSavedStory } = useAuth();
  const userId = user?._id;
  const [stories, setStories] = useState<Story[]>([]);
  const [limit, setLimit] = useState(4);
  useEffect(() => {
    const mediaQuery = window.matchMedia(
      `(min-width: ${DESKTOP_BREAKPOINT}px)`,
    );

    const updateLimit = () => {
      setLimit(mediaQuery.matches ? 6 : 4);
    };

    updateLimit();
    mediaQuery.addEventListener("change", updateLimit);

    return () => {
      mediaQuery.removeEventListener("change", updateLimit);
    };
  }, []);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [failedPage, setFailedPage] = useState<number | null>(null);
  const savedStoryIds = user?.savedArticles ?? [];
  const savedArticlesForTab =
    !travellerId && isSavedTab ? user?.savedArticles : undefined;
  const [savingStoryIds, setSavingStoryIds] = useState<string[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const currentUserIdRef = useRef(userId);
  const pendingSaves = useRef(new Set<string>());

  const firstNewStoryRef = useRef<HTMLLIElement | null>(null);
  const shouldScrollRef = useRef(false);
  const previousCountRef = useRef(0);
  const loadMoreControllerRef = useRef<AbortController | null>(null);
  const effectiveLimit = travellerId ? limit : 6;

  const fetchStories = useCallback(
    async (pageNumber: number, signal: AbortSignal) => {
      setIsLoading(true);
      setError(null);

      try {
        let storiesData: Story[];
        let pagesCount: number;

        if (travellerId) {
          const data = await getTravellerStories(
            travellerId,
            pageNumber,
            effectiveLimit,
            signal,
          );

          storiesData = data.stories.map((story) => ({
            ...story,
            savesCount: story.rate ?? 0,
            authorName: data.user.name,
          }));

          pagesCount = data.pagination.totalPages;
        } else {
          const endpoint = isSavedTab
            ? `/api/users/me/saved-stories?page=${pageNumber}&limit=${effectiveLimit}`
            : `/api/users/me/stories?page=${pageNumber}&limit=${effectiveLimit}`;
          const response = await fetchWithAuth(endpoint, { signal });

          if (!response.ok) {
            throw new Error("Не вдалося завантажити історії");
          }

          const data: StoriesResponse = await response.json();

          storiesData = data.stories.map((story) => ({
            ...story,
            authorName: story.authorName ?? story.author?.name,
            savesCount: story.rate ?? 0,
          }));
          pagesCount = isSavedTab
            ? (data.pagination?.totalPages ?? 0)
            : (data.totalPages ?? 0);
        }

        if (signal.aborted) return;
        setFailedPage(null);

        if (pageNumber === 1) {
          previousCountRef.current = 0;
          shouldScrollRef.current = false;
          setStories([
            ...new Map(storiesData.map((story) => [story._id, story])).values(),
          ]);
        } else {
          setStories((prev) => {
            const existingIds = new Set(prev.map((story) => story._id));
            const newStories = storiesData.filter((story) => {
              if (existingIds.has(story._id)) return false;
              existingIds.add(story._id);
              return true;
            });
            previousCountRef.current = prev.length;
            shouldScrollRef.current = newStories.length > 0;
            return [...prev, ...newStories];
          });
        }

        setTotalPages(pagesCount);
        setPage(pageNumber);
      } catch (err) {
        if (signal.aborted) return;

        setFailedPage(pageNumber);
        setError(
          err instanceof Error ? err.message : "Сталася невідома помилка",
        );
      } finally {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    },
    [travellerId, effectiveLimit, isSavedTab],
  );

  useEffect(() => {
    if (!travellerId && (isAuthLoading || !userId)) {
      setStories([]);
      setIsLoading(isAuthLoading);
      return;
    }

    const controller = new AbortController();

    // A bookmark change resets saved pagination so shifted pages cannot skip stories.
    void fetchStories(1, controller.signal);

    return () => {
      controller.abort();
      loadMoreControllerRef.current?.abort();
    };
  }, [fetchStories, travellerId, userId, isAuthLoading, savedArticlesForTab]);

  useEffect(() => {
    currentUserIdRef.current = userId;
  }, [userId]);

  useEffect(() => {
    if (shouldScrollRef.current && firstNewStoryRef.current) {
      firstNewStoryRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      shouldScrollRef.current = false;
    }
  }, [stories]);

  const handleLoadMore = () => {
    if (isLoading || page >= totalPages) return;

    const controller = new AbortController();
    loadMoreControllerRef.current = controller;

    void fetchStories(page + 1, controller.signal);
  };

  const handleSave = async (storyId: string) => {
    if (isAuthLoading) return;

    if (!userId) {
      setShowAuthModal(true);
      return;
    }

    if (pendingSaves.current.has(storyId)) return;

    const isSaved = savedStoryIds.includes(storyId);
    pendingSaves.current.add(storyId);
    setSaveError(null);
    setSavingStoryIds((prev) => [...prev, storyId]);

    try {
      const response = await fetchWithAuth(
        `/api/users/me/saved-stories/${encodeURIComponent(storyId)}`,
        { method: isSaved ? "DELETE" : "POST" },
      );
      const data: SaveStoryResponse = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(data.message ?? "Не вдалося змінити збережену історію");

      if (currentUserIdRef.current !== userId) return;

      const nextIsSaved = data.savedArticles
        ? data.savedArticles.map(String).includes(storyId)
        : !isSaved;
      updateSavedStory(userId, storyId, nextIsSaved);

      setStories((prev) => {
        if (!travellerId && isSavedTab && !nextIsSaved) {
          return prev.filter((story) => story._id !== storyId);
        }

        return prev.map((story) => {
          if (story._id !== storyId) return story;
          const rate =
            data.rate ??
            Math.max(0, (story.rate ?? 0) + (nextIsSaved ? 1 : -1));
          return { ...story, rate, savesCount: rate };
        });
      });
    } catch (err) {
      setSaveError(
        err instanceof Error
          ? err.message
          : "Не вдалося змінити збережену історію",
      );
    } finally {
      pendingSaves.current.delete(storyId);
      setSavingStoryIds((prev) => prev.filter((id) => id !== storyId));
    }
  };

  const handleRetry = () => {
    if (isLoading) return;

    const controller = new AbortController();
    loadMoreControllerRef.current?.abort();
    loadMoreControllerRef.current = controller;

    void fetchStories(failedPage ?? 1, controller.signal);
  };

  const emptyMessage = travellerId
    ? {
        text: "Цей користувач ще не публікував історій",
        buttonText: "Назад до історій",
        linkTo: "/stories",
      }
    : isSavedTab
      ? {
          text: "У вас ще немає збережених історій, мерщій збережіть вашу першу історію!",
          buttonText: "До історій",
          linkTo: "/stories",
        }
      : {
          text: "Ви ще нічого не публікували, поділіться своєю першою історією!",
          buttonText: "Опублікувати історію",
          linkTo: "/stories/new",
        };

  return (
    <section className={styles.container}>
      {saveError && <p role="alert">{saveError}</p>}

      {error && (
        <div>
          <p role="alert">{error}</p>

          <button
            type="button"
            onClick={handleRetry}
            disabled={isLoading}
            className={styles.retryButton}
          >
            Спробувати ще раз
          </button>
        </div>
      )}

      <ul className={styles.list}>
        {stories.map((story, index) => (
          <li
            key={story._id}
            className={styles.item}
            ref={
              index === previousCountRef.current && shouldScrollRef.current
                ? firstNewStoryRef
                : undefined
            }
          >
            <StoryCard
              story={story}
              isSaved={savedStoryIds.includes(story._id)}
              onSave={handleSave}
              isSaving={isAuthLoading || savingStoryIds.includes(story._id)}
            />
          </li>
        ))}
      </ul>

      {isLoading && <p>Завантаження...</p>}

      {!isLoading && !error && stories.length === 0 && (
        <MessageNoStories
          text={emptyMessage.text}
          buttonText={emptyMessage.buttonText}
          buttonVariant={travellerId ? "back" : isSavedTab ? "stories" : "publish"}
          linkTo={emptyMessage.linkTo}
        />
      )}

      {!error && page < totalPages && (
        <button
          type="button"
          onClick={handleLoadMore}
          disabled={isLoading}
          className={styles.loadMoreButton}
        >
          {isLoading ? "Завантаження..." : "Показати ще"}
        </button>
      )}

      {showAuthModal && (
        <ErrorWhileSavingModal onClose={() => setShowAuthModal(false)} />
      )}
    </section>
  );
}
