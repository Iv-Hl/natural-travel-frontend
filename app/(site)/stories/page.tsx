"use client";

import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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

const STORIES_LIMIT = 10;

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
  const [savingIds, setSavingIds] = useState<string[]>([]);
  const [saveError, setSaveError] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const pendingSaves = useRef(new Set<string>());

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const storiesQuery = useQuery({
    queryKey: ["stories", selectedCategory],
    queryFn: () =>
      getStories({
        page: 1,
        limit: STORIES_LIMIT,
        category: selectedCategory || undefined,
      }),
  });

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
        queryClient.setQueriesData<Awaited<ReturnType<typeof getStories>>>(
          { queryKey: ["stories"] },
          (current) => {
            if (!current?.stories.some((story) => story._id === storyId)) {
              return current;
            }

            return {
              ...current,
              stories: current.stories.map((story) =>
                story._id === storyId
                  ? { ...story, savesCount: rate, rate }
                  : story,
              ),
            };
          },
        );
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

  const stories = (storiesQuery.data?.stories ?? []).map(toCardStory);

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
              onChange={(event) => setSelectedCategory(event.target.value)}
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
                onClick={() => setSelectedCategory("")}
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
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.category}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {storiesQuery.isLoading && (
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
            onClick={() => void storiesQuery.refetch()}
          >
            Спробувати ще раз
          </button>
        </div>
      )}

      {!storiesQuery.isLoading &&
        !storiesQuery.isError &&
        stories.length === 0 && (
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

      {showAuthModal && (
        <ErrorWhileSavingModal onClose={() => setShowAuthModal(false)} />
      )}
    </section>
  );
}
