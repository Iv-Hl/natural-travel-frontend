"use client";

import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/AuthProvider";
import { fetchWithAuth } from "@/lib/api/fetchWithAuth";
import ErrorWhileSavingModal from "@/components/ErrorWhileSavingModal/ErrorWhileSavingModal";
import StoryCard, {
  type Story as StoryCardStory,
} from "@/components/stories/StoryCard";
import {
  getCategories,
  getStories,
  type Story as ApiStory,
  type StoriesResponse,
} from "@/lib/api/stories";
import styles from "./StoriesPage.module.css";

const STORIES_LIMIT = 10;

function toCardStory(story: ApiStory): StoryCardStory {
  return {
    _id: story._id,
    title: story.title,
    img: story.img,
    date: story.date,
    ownerId: story.ownerId._id,
    authorName: story.ownerId.name,
    savesCount: story.rate,
  };
}

export default function StoriesPage() {
  const { user, isLoading: isAuthLoading, updateSavedStory } = useAuth();
  const queryClient = useQueryClient();
  const pendingSavesRef = useRef(new Set<string>());
  const [savingIds, setSavingIds] = useState<string[]>([]);
  const [saveError, setSaveError] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

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
    if (isAuthLoading || pendingSavesRef.current.has(storyId)) return;
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const wasSaved = user.savedArticles.includes(storyId);
    pendingSavesRef.current.add(storyId);
    setSavingIds((current) => [...current, storyId]);
    setSaveError("");
    try {
      const response = await fetchWithAuth(
        `/api/users/me/saved-stories/${encodeURIComponent(storyId)}`,
        { method: wasSaved ? "DELETE" : "POST" },
      );
      const result: { rate?: number; savedArticles?: string[]; message?: string } =
        await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.message ?? "Не вдалося змінити збережену статтю.");
      }
      updateSavedStory(
        user._id,
        storyId,
        result.savedArticles?.includes(storyId) ?? !wasSaved,
      );
      const rate = result.rate;
      if (typeof rate === "number") {
        queryClient.setQueriesData<StoriesResponse["data"]>(
          { queryKey: ["stories"] },
          (current) => current ? {
            ...current,
            stories: current.stories.map((story) =>
              story._id === storyId ? { ...story, rate } : story,
            ),
          } : current,
        );
      }
      void queryClient.invalidateQueries({ queryKey: ["stories"] });
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Не вдалося зберегти статтю.");
    } finally {
      pendingSavesRef.current.delete(storyId);
      setSavingIds((current) => current.filter((id) => id !== storyId));
    }
  };

  const stories = (storiesQuery.data?.stories ?? []).map(toCardStory);

  return (
    <section className={styles.container}>
      <h1 className={styles.title}>Статті</h1>
      {saveError && <p role="alert">{saveError}</p>}

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

      {stories.length > 0 && (
        <ul className={styles.list}>
          {stories.map((story) => (
            <li key={story._id} className={styles.item}>
              <StoryCard
                story={story}
                isSaved={user?.savedArticles.includes(story._id) ?? false}
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
