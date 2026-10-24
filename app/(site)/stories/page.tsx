"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import StoryCard, {
  type Story as StoryCardStory,
} from "@/components/stories/StoryCard";
import {
  getCategories,
  getStories,
  type Story as ApiStory,
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
    savesCount: 0,
  };
}

export default function StoriesPage() {
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

  const handleSave = (storyId: string) => {
    console.info("Saving stories is not implemented yet:", storyId);
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

      {stories.length > 0 && (
        <ul className={styles.list}>
          {stories.map((story) => (
            <li key={story._id} className={styles.item}>
              <StoryCard story={story} isSaved={false} onSave={handleSave} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
