"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";

// import ErrorWhileSavingModal from "../ErrorWhileSavingModal/ErrorWhileSavingModal";
import StoryCard from "../StoryCard/StoryCard";
import type { Story } from "../StoryCard/StoryCard";
import PopularStoriesLoader from "./PopularStoriesLoader/PopularStoriesLoader";
import styles from "./PopularStories.module.css";

interface AuthorObj {
  name?: string;
  firstName?: string;
  lastName?: string;
}

interface ApiStory {
  _id?: string;
  id?: string;
  title: string;
  img?: string;
  rate?: number;
  savesCount?: number;
  ownerId?: AuthorObj | string | null;
  owner?: AuthorObj | string | null;
  author?: AuthorObj | string | null;
}

interface StoriesResponse {
  data?: {
    stories?: ApiStory[];
  };
  message?: string;
}

interface PopularStoriesProps {
  isAuthenticated?: boolean;
}

const getAuthorName = (story: ApiStory): string => {
  const authorObj =
    (typeof story.ownerId === "object" && story.ownerId) ||
    (typeof story.owner === "object" && story.owner) ||
    (typeof story.author === "object" && story.author);

  if (authorObj) {
    const fullName =
      `${authorObj.firstName || ""} ${authorObj.lastName || ""}`.trim();

    return authorObj.name || fullName || "Автор";
  }

  if (typeof story.author === "string") {
    return story.author;
  }

  return "Автор";
};

export const PopularStories = ({
  isAuthenticated = false,
}: PopularStoriesProps) => {
  const router = useRouter();

  const [stories, setStories] = useState<Story[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [savingIds, setSavingIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [saveError, setSaveError] = useState("");

  const swiperRef = useRef<SwiperType | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const updateNavigation = (swiper: SwiperType) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  useEffect(() => {
    const controller = new AbortController();

    const fetchStories = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/stories?type=popular&limit=10", {
          signal: controller.signal,
        });

        const result: StoriesResponse = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Не вдалося завантажити популярні статті",
          );
        }

        const items = result.data?.stories ?? [];

        const normalized: Story[] = items
          .filter((item) => Boolean(item._id || item.id))
          .map((item) => ({
            _id: String(item._id || item.id),
            title: item.title,
            img: item.img || "/default-story.jpg",
            date: "",
            ownerId: typeof item.ownerId === "string" ? item.ownerId : "",
            authorName: getAuthorName(item),
            savesCount: item.savesCount ?? item.rate ?? 0,
          }));

        if (!controller.signal.aborted) {
          setStories(normalized);
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error ? err.message : "Сталася невідома помилка",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchStories();

    return () => controller.abort();
  }, []);

  const handleSave = async (storyId: string) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (savingIds.includes(storyId)) {
      return;
    }

    setSaveError("");
    setSavingIds((current) => [...current, storyId]);

    const wasSaved = savedIds.includes(storyId);

    try {
      const response = await fetch(`/api/users/me/saved-stories/${storyId}`, {
        method: wasSaved ? "DELETE" : "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Не вдалося змінити збережену статтю.");
      }

      setSavedIds((current) =>
        wasSaved
          ? current.filter((id) => id !== storyId)
          : [...current, storyId],
      );
    } catch (err) {
      setSaveError(
        err instanceof Error
          ? err.message
          : "Сталася помилка під час збереження статті.",
      );
    } finally {
      setSavingIds((current) => current.filter((id) => id !== storyId));
    }
  };

  if (loading) {
    return <PopularStoriesLoader />;
  }
  if (error) {
    return (
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Популярні статті</h2>
        <p role="alert">{error}</p>
        <button type="button" onClick={() => router.refresh()}>
          Спробувати ще раз
        </button>
      </section>
    );
  }

  if (stories.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className={styles.headerContainer}>
        <h2 className={styles.sectionTitle}>Популярні статті</h2>

        <Link href="/stories" className={styles.allStoriesButton}>
          Всі статті
        </Link>
      </div>

      {saveError && (
        <p role="alert" aria-live="polite">
          {saveError}
        </p>
      )}

      <div className={styles.sliderWrapper}>
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            updateNavigation(swiper);
          }}
          onSlideChange={updateNavigation}
          onResize={updateNavigation}
          onBreakpoint={updateNavigation}
          onSlidesUpdated={updateNavigation}
          spaceBetween={24}
          slidesPerView={1}
          watchOverflow={true}
          breakpoints={{
            768: {
              slidesPerView: 2,
            },
            1440: {
              slidesPerView: 3,
            },
          }}
          className={styles.swiperContainer}
        >
          {stories.map((story) => (
            <SwiperSlide key={story._id} className={styles.slideItem}>
              <StoryCard
                story={story}
                isSaved={savedIds.includes(story._id)}
                isSaving={savingIds.includes(story._id)}
                onSave={handleSave}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        <div className={styles.navButtonsContainer}>
          <button
            type="button"
            className={`${styles.navButton} ${
              isBeginning ? styles.disabled : ""
            }`}
            disabled={isBeginning}
            aria-label="Попередні статті"
            onClick={() => swiperRef.current?.slidePrev()}
          >
            <svg width="24" height="24" aria-hidden="true">
              <use href="/icons/symbol-defs.svg#icon-arrow_back" />
            </svg>
          </button>

          <button
            type="button"
            className={`${styles.navButton} ${isEnd ? styles.disabled : ""}`}
            disabled={isEnd}
            aria-label="Наступні статті"
            onClick={() => swiperRef.current?.slideNext()}
          >
            <svg width="24" height="24" aria-hidden="true">
              <use href="/icons/symbol-defs.svg#icon-arrow_forward" />
            </svg>
          </button>
        </div>
      </div>

      <Link href="/stories" className={styles.endStoriesButton}>
        Всі статті
      </Link>

      {/* {showAuthModal && (
        <ErrorWhileSavingModal onClose={() => setShowAuthModal(false)} />
      )} */}
    </section>
  );
};
