"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import StoryCard, { type Story } from "../stories/StoryCard";
import styles from "./TravellersStories.module.css";
import { fetchWithAuth } from "@/lib/api/fetchWithAuth";
import MessageNoStories from "../shared/MessageNoStories";
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

const LIMIT = 6;

export default function TravellersStories({
  variant = "own",
}: {
  variant?: "own" | "saved";
}) {
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

  const firstNewStoryRef = useRef<HTMLLIElement | null>(null);
  const shouldScrollRef = useRef(false);
  const previousCountRef = useRef(0);
  const storiesCountRef = useRef(0);
  const loadMoreControllerRef = useRef<AbortController | null>(null);
  const pendingSavesRef = useRef(new Set<string>());
  const failedPageRef = useRef(1);

  useEffect(() => {
    storiesCountRef.current = stories.length;
  }, [stories]);

  const fetchStories = useCallback(
    async (pageNumber: number, signal: AbortSignal) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchWithAuth(
          `/api/users/me/${variant === "saved" ? "saved-stories" : "stories"}?page=${pageNumber}&limit=${LIMIT}`,
          {
            signal,
          },
        );

        if (!response.ok) {
          throw new Error("Не вдалося завантажити історії");
        }

        const data: StoriesResponse = await response.json();

        if (signal.aborted) return;

        if (pageNumber === 1) {
          previousCountRef.current = 0;
          shouldScrollRef.current = false;
          storiesCountRef.current = data.stories.length;

          setStories(data.stories);
        } else {
          previousCountRef.current = storiesCountRef.current;
          shouldScrollRef.current = data.stories.length > 0;
          storiesCountRef.current += data.stories.length;

          setStories((prev) => [...prev, ...data.stories]);
        }

        setTotalPages(data.totalPages ?? data.pagination?.totalPages ?? 0);
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
    [variant],
  );

  useEffect(() => {
    const controller = new AbortController();

    void fetchStories(1, controller.signal);

    return () => {
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
    if (isAuthLoading || !user || pendingSavesRef.current.has(storyId)) return;

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

      if (variant === "saved" && !nextIsSaved) {
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
      setSaveError(
        err instanceof Error
          ? err.message
          : "Не вдалося змінити збережену історію",
      );
    } finally {
      pendingSavesRef.current.delete(storyId);
      setSavingStoryIds((prev) => prev.filter((id) => id !== storyId));
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
          text={variant === "saved" ? "Ви ще не зберегли жодної історії." : "Ви ще нічого не публікували, поділіться своєю першою історією!"}
          buttonText={variant === "saved" ? "Переглянути історії" : "Опублікувати історію"}
          linkTo={variant === "saved" ? "/stories" : "/stories/new"}
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
    </section>
  );
}
