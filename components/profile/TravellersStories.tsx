"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import StoryCard, { type Story } from "../stories/StoryCard";
import styles from "./TravellersStories.module.css";

interface StoriesResponse {
  stories: Story[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const LIMIT = 6;
const USE_MOCK_DATA = false;

const mockStories: Story[] = [
  {
    _id: "1",
    title: "Подорож Карпатамиffffffffffffffffff",
    img: "/images/test-1.jpg",
    date: "2026-09-10",
    ownerId: "test-user",
    authorName: "Анастасія Олійник",
    savesCount: 5,
  },
  {
    _id: "2",
    title: "Вихідні у Львові",
    img: "/images/test-2.jpg",
    date: "2026-09-12",
    ownerId: "test-user",
    authorName: "Анастасія Олійник",
    savesCount: 3,
  },
  {
    _id: "3",
    title:
      "Мандрівка до Одесиииииииииииииииииииииииииииииииииииииbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    img: "/images/test-3.jpg",
    date: "2026-09-15",
    ownerId: "test-user",
    authorName: "Анастасія Олійник",
    savesCount: 5,
  },
  {
    _id: "4",
    title: "Озеро Синевир",
    img: "/images/test-4.jpg",
    date: "2026-09-18",
    ownerId: "test-user",
    authorName: "Анастасія Олійник",
    savesCount: 2,
  },
  {
    _id: "5",
    title: "Замки України",
    img: "/images/test-5.jpg",
    date: "2026-09-20",
    ownerId: "test-user",
    authorName: "Анастасія Олійник",
    savesCount: 4,
  },
  {
    _id: "6",
    title: "Гори та природа",
    img: "/images/test-6.jpg",
    date: "2026-09-22",
    ownerId: "test-user",
    authorName: "Анастасія Олійник",
    savesCount: 10,
  },
];

export default function TravellersStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [savedStoryIds, setSavedStoryIds] = useState<string[]>([]);

  const firstNewStoryRef = useRef<HTMLLIElement | null>(null);
  const shouldScrollRef = useRef(false);
  const previousCountRef = useRef(0);

  const fetchStories = useCallback(
    async (pageNumber: number, signal: AbortSignal) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/users/me/stories?page=${pageNumber}&limit=${LIMIT}`,
          {
            credentials: "include",
            signal,
          },
        );

        if (!response.ok) {
          throw new Error("Не вдалося завантажити історії");
        }

        const data: StoriesResponse = await response.json();

        setStories((prev) => {
          previousCountRef.current = pageNumber === 1 ? 0 : prev.length;

          return pageNumber === 1 ? data.stories : [...prev, ...data.stories];
        });

        setTotalPages(data.totalPages);
        setPage(pageNumber);

        if (pageNumber > 1) {
          shouldScrollRef.current = true;
        }
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
    if (USE_MOCK_DATA) {
      setStories(mockStories);
      setTotalPages(1);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    void fetchStories(1, controller.signal);

    return () => controller.abort();
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

    void fetchStories(page + 1, controller.signal);
  };

  const handleSave = (storyId: string) => {
    setSavedStoryIds((prev) =>
      prev.includes(storyId)
        ? prev.filter((id) => id !== storyId)
        : [...prev, storyId],
    );
  };

  return (
    <section className={styles.container}>
      {error && <p role="alert">{error}</p>}

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

      {isLoading && <p>Завантаження...</p>}

      {!isLoading && !error && stories.length === 0 && (
        <p>У вас поки немає історій.</p>
      )}

      {page < totalPages && (
        <button type="button" onClick={handleLoadMore} disabled={isLoading}>
          {isLoading ? "Завантаження..." : "Показати ще"}
        </button>
      )}
    </section>
  );
}
