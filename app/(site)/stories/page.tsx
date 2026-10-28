"use client";

import { useEffect, useRef, useState } from "react";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import ErrorWhileSavingModal from "@/components/ErrorWhileSavingModal/ErrorWhileSavingModal";
import { useAuth } from "@/components/providers/AuthProvider";
import StoryCard, {
  type Story as StoryCardStory,
} from "@/components/stories/StoryCard";
import {
  getCategories,
  getStories,
  type Story as ApiStory,
} from "@/lib/api/stories";
import { fetchWithAuth } from "@/lib/api/fetchWithAuth";
import styles from "./StoriesPage.module.css";

type CatalogStory = ApiStory & { savesCount?: number };

function toCardStory(story: CatalogStory): StoryCardStory {
  return {
    _id: story._id,
    title: story.title,
    img: story.img,
    date: story.date,
    ownerId: story.ownerId._id,
    authorName: story.ownerId.name,
    savesCount: story.savesCount ?? story.rate,
  };
}

export default function StoriesPage() {
  const queryClient = useQueryClient();
  const { user, isLoading: isAuthLoading, updateSavedStory } = useAuth();
  const savedIds = user?.savedArticles ?? [];

  const [selectedCategory, setSelectedCategory] = useState("");
  const [limit, setLimit] = useState<number | null>(null);
  const [savingIds, setSavingIds] = useState<string[]>([]);
  const [saveError, setSaveError] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const pendingSaves = useRef(new Set<string>());

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1440px)");
    const updateLimit = () => {
      const nextLimit = mediaQuery.matches ? 9 : 8;
      queryClient.removeQueries({
        queryKey: ["stories", nextLimit],
        type: "inactive",
      });
      setLimit(nextLimit);
    };

    updateLimit();
    mediaQuery.addEventListener("change", updateLimit);
    return () => mediaQuery.removeEventListener("change", updateLimit);
  }, [queryClient]);

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const storiesQuery = useInfiniteQuery({
    queryKey: ["stories", limit, selectedCategory],
    enabled: limit !== null,
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getStories({
        page: pageParam,
        limit: limit ?? 8,
        category: selectedCategory || undefined,
      }),
    getNextPageParam: (lastPage) => {
      const meta = lastPage.meta;
      return meta && meta.currentPage < meta.totalPages
        ? meta.currentPage + 1
        : undefined;
    },
  });

  const handleCategoryChange = (category: string) => {
    void queryClient.resetQueries({
      queryKey: ["stories", limit, category],
      exact: true,
    });
    setSelectedCategory(category);
  };

  const handleLoadMore = () => {
    if (!storiesQuery.hasNextPage || storiesQuery.isFetching) return;

    void storiesQuery.fetchNextPage({ cancelRefetch: false });
  };

  const handleSave = async (storyId: string) => {
    if (isAuthLoading) return;

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (pendingSaves.current.has(storyId)) return;

    pendingSaves.current.add(storyId);
    setSavingIds((current) => [...current, storyId]);
    setSaveError("");

    const wasSaved = savedIds.includes(storyId);

    try {
      const response = await fetchWithAuth(
        `/api/users/me/saved-stories/${encodeURIComponent(storyId)}`,
        { method: wasSaved ? "DELETE" : "POST" },
      );

      if (!response.ok) {
        throw new Error("Не вдалося змінити збережену історію.");
      }

      const result: unknown = await response.json().catch(() => null);
      const rate =
        result && typeof result === "object" && "rate" in result
          ? result.rate
          : undefined;

      updateSavedStory(user._id, storyId, !wasSaved);

      if (typeof rate === "number" && Number.isFinite(rate) && rate >= 0) {
        queryClient.setQueriesData<
          InfiniteData<Awaited<ReturnType<typeof getStories>>>
        >({ queryKey: ["stories"] }, (current) => {
          if (
            !current?.pages?.some((page) =>
              page.stories.some((story) => story._id === storyId),
            )
          ) {
            return current;
          }

          return {
            ...current,
            pages: current.pages.map((page) => ({
              ...page,
              stories: page.stories.map((story) =>
                story._id === storyId
                  ? { ...story, savesCount: rate, rate }
                  : story,
              ),
            })),
          };
        });
      } else {
        void queryClient.invalidateQueries({ queryKey: ["stories"] });
      }
    } catch {
      setSaveError("Не вдалося змінити збережену історію. Спробуйте ще раз.");
    } finally {
      pendingSaves.current.delete(storyId);
      setSavingIds((current) => current.filter((id) => id !== storyId));
    }
  };

  const seenIds = new Set<string>();
  const stories = (storiesQuery.data?.pages ?? [])
    .flatMap((page) => page.stories)
    .filter((story) => {
      if (seenIds.has(story._id)) return false;
      seenIds.add(story._id);
      return true;
    })
    .map(toCardStory);

  return (
    <section className={styles.container}>
      <h1 className={styles.title}>Статті</h1>

      <div className={styles.filter}>
        {categoriesQuery.isLoading ? (
          <p className={styles.status}>Завантаження категорій...</p>
        ) : categoriesQuery.isError ? (
          <p className={styles.error} role="alert">
            Не вдалося завантажити категорії. Онови сторінку та спробуй ще раз.
          </p>
        ) : (
          <>
            <label
              className={`${styles.categoryLabel} sr-only`}
              htmlFor="story-category"
            >
              Категорії
            </label>
            <select
              id="story-category"
              className={styles.categorySelect}
              value={selectedCategory}
              onChange={(event) => handleCategoryChange(event.target.value)}
            >
              <option value="">Всі статті</option>
              {categoriesQuery.data?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.category}
                </option>
              ))}
            </select>

            <div className={styles.categoryButtons}>
              <button
                type="button"
                className={`${styles.categoryButton} ${
                  selectedCategory === "" ? styles.categoryButtonActive : ""
                }`}
                aria-pressed={selectedCategory === ""}
                onClick={() => handleCategoryChange("")}
              >
                Всі статті
              </button>
              {categoriesQuery.data?.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className={`${styles.categoryButton} ${
                    selectedCategory === category.id
                      ? styles.categoryButtonActive
                      : ""
                  }`}
                  aria-pressed={selectedCategory === category.id}
                  onClick={() => handleCategoryChange(category.id)}
                >
                  {category.category}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {storiesQuery.isPending && (
        <p className={styles.status} role="status">
          Завантаження історій...
        </p>
      )}

      {storiesQuery.isError && (
        <div className={styles.error} role="alert">
          <p>Не вдалося завантажити історії. Спробуй ще раз.</p>
          <button
            type="button"
            className={styles.retryButton}
            disabled={storiesQuery.isFetching}
            onClick={() =>
              storiesQuery.isFetchNextPageError
                ? handleLoadMore()
                : void storiesQuery.refetch()
            }
          >
            {storiesQuery.isFetching ? "Завантаження..." : "Спробувати ще раз"}
          </button>
        </div>
      )}

      {storiesQuery.isSuccess && stories.length === 0 && (
        <p className={styles.status}>У цій категорії поки немає історій.</p>
      )}

      {saveError && (
        <p className={styles.error} role="alert">
          {saveError}
        </p>
      )}

      {stories.length > 0 && (
        <ul className={styles.list}>
          {stories.map((story) => (
            <li key={story._id} className={styles.item}>
              <StoryCard
                story={story}
                isSaved={savedIds.includes(story._id)}
                isSaving={isAuthLoading || savingIds.includes(story._id)}
                onSave={handleSave}
              />
            </li>
          ))}
        </ul>
      )}

      {storiesQuery.hasNextPage &&
        stories.length > 0 &&
        !storiesQuery.isError && (
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.loadMore}
              onClick={handleLoadMore}
              disabled={storiesQuery.isFetching}
              aria-busy={storiesQuery.isFetching}
            >
              {storiesQuery.isFetching ? "Завантаження..." : "Показати ще"}
            </button>
          </div>
        )}

      {showAuthModal && (
        <ErrorWhileSavingModal onClose={() => setShowAuthModal(false)} />
      )}
    </section>
  );
}
