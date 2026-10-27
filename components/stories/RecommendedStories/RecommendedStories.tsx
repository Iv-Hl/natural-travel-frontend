"use client";

import { useId, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import StoryCard, {
  type Story as CardStory,
} from "@/components/stories/StoryCard";
import ErrorWhileSavingModal from "@/components/ErrorWhileSavingModal/ErrorWhileSavingModal";
import { useAuth } from "@/components/providers/AuthProvider";
import { fetchWithAuth } from "@/lib/api/fetchWithAuth";
import styles from "./RecommendedStories.module.css";

interface RecommendedStoriesProps {
  storyId: string;
}

interface RecommendationStory {
  _id: string;
  title: string;
  img: string;
  date: string;
  ownerId: string;
  rate: number;
  author: {
    id: string;
    name: string;
    avatarUrl: string | null;
  } | null;
}

interface RecommendationsResponse {
  items: RecommendationStory[];
  page: number;
  limit: number;
  total: number;
  hasNextPage: boolean;
}

function toCardStory(story: RecommendationStory): CardStory {
  return {
    _id: story._id,
    title: story.title,
    img: story.img,
    date: story.date,
    ownerId: String(story.ownerId ?? ""),
    authorName: story.author?.name ?? "Автор",
    rate: story.rate,
    savesCount: story.rate ?? 0,
  };
}

async function getRecommendations(storyId: string): Promise<CardStory[]> {
  const response = await fetch(
    `/api/stories/${encodeURIComponent(storyId)}/recommendations?limit=3`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error("Не вдалося завантажити рекомендовані історії.");
  }

  const data: RecommendationsResponse = await response.json();
  return data.items.map(toCardStory);
}

export default function RecommendedStories({
  storyId,
}: RecommendedStoriesProps) {
  const queryClient = useQueryClient();
  const titleId = useId();
  const { user, isLoading: isAuthLoading, updateSavedStory } = useAuth();

  const [savingIds, setSavingIds] = useState<string[]>([]);
  const [saveError, setSaveError] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const pendingSaves = useRef(new Set<string>());

  const savedIds = user?.savedArticles ?? [];

  const recommendationsQuery = useQuery({
    queryKey: ["recommendedStories", storyId],
    queryFn: () => getRecommendations(storyId),
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
      void queryClient.invalidateQueries({
        queryKey: ["recommendedStories", storyId],
      });
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
