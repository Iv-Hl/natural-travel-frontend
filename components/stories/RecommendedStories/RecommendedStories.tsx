"use client";

import { useId, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import StoryCard, {
  type Story as CardStory,
} from "@/components/stories/StoryCard";
import ErrorWhileSavingModal from "@/components/ErrorWhileSavingModal/ErrorWhileSavingModal";
import { useAuth } from "@/components/providers/AuthProvider";
import { getStories, type Story as ApiStory } from "@/lib/api/stories";
import { fetchWithAuth } from "@/lib/api/fetchWithAuth";
import styles from "./RecommendedStories.module.css";

interface RecommendedStoriesProps {
  storyId: string;
  categoryId?: string;
}

function toCardStory(story: ApiStory): CardStory {
  return {
    _id: story._id,
    title: story.title,
    img: story.img,
    date: story.date,
    ownerId: story.ownerId?._id ?? "",
    authorName: story.ownerId?.name ?? "Автор",
    rate: story.rate,
  };
}

async function getRecommendations(
  storyId: string,
  categoryId?: string,
): Promise<CardStory[]> {
  const uniqueStories = new Map<string, ApiStory>();

  const addStories = (stories: ApiStory[]) => {
    for (const story of stories) {
      if (story._id !== storyId) {
        uniqueStories.set(story._id, story);
      }
    }
  };

  const firstResult = await getStories({
    limit: 4,
    category: categoryId,
  });

  addStories(firstResult.stories);

  if (categoryId && uniqueStories.size < 3) {
    const otherStories = await getStories({ limit: 4 });
    addStories(otherStories.stories);
  }

  return Array.from(uniqueStories.values()).slice(0, 3).map(toCardStory);
}

export default function RecommendedStories({
  storyId,
  categoryId,
}: RecommendedStoriesProps) {
  const titleId = useId();
  const { user, isLoading: isAuthLoading, updateSavedStory } = useAuth();

  const [savingIds, setSavingIds] = useState<string[]>([]);
  const [saveError, setSaveError] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const pendingSaves = useRef(new Set<string>());

  const savedIds = user?.savedArticles ?? [];

  const recommendationsQuery = useQuery({
    queryKey: ["recommendedStories", storyId, categoryId ?? null],
    queryFn: () => getRecommendations(storyId, categoryId),
    staleTime: 60_000,
  });

  const handleSave = async (id: string) => {
    if (isAuthLoading) return;

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (pendingSaves.current.has(id)) return;

    pendingSaves.current.add(id);
    setSavingIds((current) => [...current, id]);
    setSaveError("");

    const wasSaved = savedIds.includes(id);

    try {
      const response = await fetchWithAuth(
        `/api/users/me/saved-stories/${encodeURIComponent(id)}`,
        {
          method: wasSaved ? "DELETE" : "POST",
        },
      );

      if (!response.ok) {
        throw new Error("Не вдалося змінити збережену історію.");
      }

      updateSavedStory(user._id, id, !wasSaved);
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Сталася помилка. Спробуйте ще раз.",
      );
    } finally {
      pendingSaves.current.delete(id);
      setSavingIds((current) => current.filter((item) => item !== id));
    }
  };

  const stories = recommendationsQuery.data ?? [];

  if (recommendationsQuery.isSuccess && stories.length === 0) {
    return null;
  }

  return (
    <section className={styles.section} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.title}>
        Вам також сподобається
      </h2>

      {recommendationsQuery.isPending && (
        <p className={styles.status} role="status">
          Завантаження рекомендованих історій...
        </p>
      )}

      {recommendationsQuery.isError && (
        <div className={styles.error} role="alert">
          <p>Не вдалося завантажити рекомендовані історії.</p>

          <button
            type="button"
            className={styles.retryButton}
            disabled={recommendationsQuery.isFetching}
            onClick={() => void recommendationsQuery.refetch()}
          >
            {recommendationsQuery.isFetching
              ? "Завантаження..."
              : "Спробувати ще раз"}
          </button>
        </div>
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
