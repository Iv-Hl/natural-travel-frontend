"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import StoryCard, { type Story } from "../stories/StoryCard";
import styles from "./TravellersStories.module.css";
import { fetchWithAuth } from "@/lib/api/fetchWithAuth";
import { getTravellerStories } from "@/lib/api/travellers";
import MessageNoStories from "../shared/MessageNoStories";
import ErrorWhileSavingModal from "../ErrorWhileSavingModal/ErrorWhileSavingModal";
import { useAuth } from "../providers/AuthProvider";
import { useQueryClient } from "@tanstack/react-query";

interface StoriesResponse {
  stories: Story[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  pagination?: { totalPages?: number };
}

interface SavedStoriesResponse {
  savedArticles?: string[];
  rate?: number;
  message?: string;
}

interface TravellersStoriesProps {
  variant?: "own" | "saved";
  travellerId?: string;
}

const DESKTOP_BREAKPOINT = 1440;

export default function TravellersStories({
  variant = "own",
  travellerId,
}: TravellersStoriesProps) {
  const [publicLimit, setPublicLimit] = useState<number | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      `(min-width: ${DESKTOP_BREAKPOINT}px)`,
    );
    const updateLimit = () => setPublicLimit(mediaQuery.matches ? 6 : 4);
    updateLimit();
    mediaQuery.addEventListener("change", updateLimit);
    return () => mediaQuery.removeEventListener("change", updateLimit);
  }, []);

  const limit = travellerId ? publicLimit : 6;
  if (limit === null) return <p>Завантаження...</p>;

  return (
    <TravellersStoriesContent
      key={travellerId ? `public:${travellerId}` : `private:${variant}`}
      travellerId={travellerId}
      variant={variant}
      limit={limit}
    />
  );
}

function TravellersStoriesContent({
  variant = "own",
  travellerId,
  limit,
}: TravellersStoriesProps & { limit: number }) {
  const { user, isLoading: isAuthLoading, updateSavedStory } = useAuth();
  const queryClient = useQueryClient();
  const savedStoryIds = user?.savedArticles ?? [];
  const [stories, setStories] = useState<Story[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingStoryIds, setSavingStoryIds] = useState<string[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const firstNewStoryRef = useRef<HTMLLIElement | null>(null);
  const shouldScrollRef = useRef(false);
  const previousCountRef = useRef(0);
  const storiesCountRef = useRef(0);
  const loadMoreControllerRef = useRef<AbortController | null>(null);
  const pendingSavesRef = useRef(new Set<string>());
  const failedPageRef = useRef(1);
  const isMountedRef = useRef(false);
  const saveVersionRef = useRef(0);
  const savedRatesRef = useRef(new Map<string, { rate: number; version: number }>());

  useEffect(() => {
    storiesCountRef.current = stories.length;
  }, [stories]);

  const fetchStories = useCallback(
    async (pageNumber: number, signal: AbortSignal) => {
      const saveVersion = saveVersionRef.current;
      setIsLoading(true);
      setError(null);

      try {
        let storiesData: Story[];
        let pagesCount: number;

        if (travellerId) {
          const data = await getTravellerStories(
            travellerId,
            pageNumber,
            limit,
            signal,
          );
          storiesData = data.stories.map((story) => ({
            ...story,
            savesCount: story.rate,
            authorName: data.user.name,
          }));
          pagesCount = data.pagination.totalPages;
        } else {
          const response = await fetchWithAuth(
            `/api/users/me/${variant === "saved" ? "saved-stories" : "stories"}?page=${pageNumber}&limit=${limit}`,
            { signal },
          );

          if (!response.ok) {
            throw new Error("Не вдалося завантажити історії");
          }
          const data: StoriesResponse = await response.json();
          storiesData = data.stories;
          pagesCount = data.totalPages ?? data.pagination?.totalPages ?? 0;
        }

        if (signal.aborted) return;

        // A save may finish while this GET is still returning its older snapshot.
        storiesData = storiesData.map((story) => {
          const update = savedRatesRef.current.get(story._id);
          return update && update.version > saveVersion
            ? { ...story, rate: update.rate, savesCount: update.rate }
            : story;
        });

        if (pageNumber === 1) {
          previousCountRef.current = 0;
          shouldScrollRef.current = false;
          storiesCountRef.current = storiesData.length;

          setStories(storiesData);
        } else {
          previousCountRef.current = storiesCountRef.current;
          shouldScrollRef.current = storiesData.length > 0;
          storiesCountRef.current += storiesData.length;

          setStories((prev) => [...prev, ...storiesData]);
        }

        setTotalPages(pagesCount);
        setPage(pageNumber);
      } catch (err) {
        if (signal.aborted) return;

        failedPageRef.current = pageNumber;
        setError(
          err instanceof Error ? err.message : "Сталася невідома помилка",
        );
      } finally {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    },
    [variant, travellerId, limit],
  );

  useEffect(() => {
    isMountedRef.current = true;
    setStories([]);
    setPage(1);
    setTotalPages(0);
    previousCountRef.current = 0;
    storiesCountRef.current = 0;
    shouldScrollRef.current = false;
    failedPageRef.current = 1;
    const controller = new AbortController();

    void fetchStories(1, controller.signal);

    return () => {
      isMountedRef.current = false;
      controller.abort();
      loadMoreControllerRef.current?.abort();
    };
  }, [fetchStories]);

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
    if (isAuthLoading || pendingSavesRef.current.has(storyId)) return;
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const isSaved = savedStoryIds.includes(storyId);
    pendingSavesRef.current.add(storyId);
    setSaveError(null);
    setSavingStoryIds((prev) => [...prev, storyId]);

    try {
      const response = await fetchWithAuth(
        `/api/users/me/saved-stories/${encodeURIComponent(storyId)}`,
        { method: isSaved ? "DELETE" : "POST" },
      );
      const data: SavedStoriesResponse = await response
        .json()
        .catch(() => ({}));
      if (!response.ok)
        throw new Error(data.message ?? "Не вдалося змінити збережену історію");

      const nextIsSaved = data.savedArticles?.includes(storyId) ?? !isSaved;
      updateSavedStory(user._id, storyId, nextIsSaved);
      void queryClient.invalidateQueries({ queryKey: ["stories"] });
      if (!isMountedRef.current) return;

      if (typeof data.rate === "number") {
        savedRatesRef.current.set(storyId, {
          rate: data.rate,
          version: ++saveVersionRef.current,
        });
      }

      if (!travellerId && variant === "saved" && !nextIsSaved) {
        // Refill the page after deletion so pagination cannot skip a story.
        loadMoreControllerRef.current?.abort();
        const controller = new AbortController();
        loadMoreControllerRef.current = controller;
        await fetchStories(1, controller.signal);
      } else if (typeof data.rate === "number") {
        setStories((prev) =>
          prev.map((story) =>
            story._id === storyId ? { ...story, rate: data.rate } : story,
          ),
        );
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      setSaveError(
        err instanceof Error
          ? err.message
          : "Не вдалося змінити збережену історію",
      );
    } finally {
      pendingSavesRef.current.delete(storyId);
      if (isMountedRef.current) {
        setSavingStoryIds((prev) => prev.filter((id) => id !== storyId));
      }
    }
  };

  const handleRetry = () => {
    if (isLoading) return;

    const controller = new AbortController();
    loadMoreControllerRef.current?.abort();
    loadMoreControllerRef.current = controller;

    void fetchStories(
      failedPageRef.current,
      controller.signal,
    );
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
          text={
            travellerId
              ? "Цей мандрівник ще не опублікував жодної історії."
              : variant === "saved"
                ? "Ви ще не зберегли жодної історії."
                : "Ви ще нічого не публікували, поділіться своєю першою історією!"
          }
          buttonText={travellerId ? "Назад до історій" : variant === "saved" ? "Переглянути історії" : "Опублікувати історію"}
          linkTo={travellerId || variant === "saved" ? "/stories" : "/stories/new"}
        />
      )}
      {showAuthModal && (
        <ErrorWhileSavingModal onClose={() => setShowAuthModal(false)} />
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
    </section>
  );
}
