"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import StoryCard, { type Story } from "../stories/StoryCard";
import styles from "./TravellersStories.module.css";
import { fetchWithAuth } from "@/lib/api/fetchWithAuth";
import MessageNoStories from "../shared/MessageNoStories";

interface StoriesResponse {
  stories: Story[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface EmptyStateProps {
  text: string;
  buttonText?: string;
  linkTo?: string;
}

interface TravellersStoriesProps {
  source: {
    type: "saved" | "own";
  };
  emptyState?: EmptyStateProps;
  limit?: number;
}

const LIMIT = 6;

export default function TravellersStories( { source, emptyState, limit }: TravellersStoriesProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedStoryIds, setSavedStoryIds] = useState<string[]>([]);

  const firstNewStoryRef = useRef<HTMLLIElement | null>(null);
  const shouldScrollRef = useRef(false);
  const previousCountRef = useRef(0);
  const storiesCountRef = useRef(0);
  const loadMoreControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    storiesCountRef.current = stories.length;
  }, [stories]);

  const fetchStories = useCallback(
    async (pageNumber: number, signal: AbortSignal) => {
      setIsLoading(true);
      setError(null);

      try {
        const urlPath = source?.type === "saved" ? "saved-stories" : "stories"; 
        const response = await fetchWithAuth(
          `/api/users/me/${urlPath}?page=${pageNumber}&limit=${LIMIT}`,
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

        setTotalPages(data.totalPages);
        setPage(pageNumber);
      } catch (err) {
        if (signal.aborted) return;

        setError(
          err instanceof Error ? err.message : "Сталася невідома помилка",
        );
      } finally {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    },
    [],
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

  const handleSave = (storyId: string) => {
    setSavedStoryIds((prev) =>
      prev.includes(storyId)
        ? prev.filter((id) => id !== storyId)
        : [...prev, storyId],
    );
  };

  const handleRetry = () => {
    if (isLoading) return;

    const controller = new AbortController();
    loadMoreControllerRef.current?.abort();
    loadMoreControllerRef.current = controller;

    void fetchStories(
      error && stories.length === 0 ? 1 : page + 1,
      controller.signal,
    );
  };

  return (
    <section className={styles.container}>
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
            />
          </li>
        ))}
      </ul>

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

      {!isLoading && !error && stories.length === 0 && (
        <MessageNoStories
          text={
            source?.type === "saved"
              ? "У вас ще немає збережених історій, мерщій збережіть вашу першу історію!"
              : "Ви ще нічого не публікували, поділіться своєю першою історією!"
          }
          buttonText={
            source?.type === "saved" ? "До історій" : "Опублікувати історію"
          }
          linkTo={
            source?.type === "saved" ? "/stories" : "/stories/new"
          }
          isLarge={source?.type === "own"}
        />
      )}

    </section>
  );
}
