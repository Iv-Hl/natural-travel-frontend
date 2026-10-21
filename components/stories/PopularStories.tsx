"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";

import { StoryCard } from "../StoriesCard/StoryCard";
import styles from "./PopularStories.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface AuthorObj {
  name?: string;
  firstName?: string;
  lastName?: string;
}

interface Story {
  _id?: string;
  id?: string;
  title: string;
  category?: string;
  img?: string;
  rate?: number;
  savesCount?: number;
  ownerId?: AuthorObj | string | null;
  owner?: AuthorObj | string | null;
  author?: AuthorObj | string | null;
}

interface StoriesResponse {
  data?: { stories?: Story[] };
  message?: string;
}

// Допоміжна функція для визначення імені автора
const getAuthorName = (story: Story): string => {
  const authorObj =
    (typeof story.ownerId === "object" && story.ownerId) ||
    (typeof story.owner === "object" && story.owner) ||
    (typeof story.author === "object" && story.author);

  if (authorObj) {
    const fullName =
      `${authorObj.firstName || ""} ${authorObj.lastName || ""}`.trim();
    return authorObj.name || fullName || "Автор";
  }

  if (typeof story.author === "string") return story.author;

  return "Автор";
};

export const PopularStories = () => {
  const [popularStories, setPopularStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const swiperRef = useRef<SwiperType | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const updateNavigation = (swiper: SwiperType) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  useEffect(() => {
    const controller = new AbortController();

    const fetchPopularStories = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `${API_URL}/api/stories?type=popular&limit=10`,
          {
            signal: controller.signal,
          },
        );

        const result: StoriesResponse = await res.json();

        if (!res.ok) {
          throw new Error(
            result.message || "Не вдалося завантажити популярні статті",
          );
        }

        setPopularStories(result.data?.stories ?? []);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(
          err instanceof Error ? err.message : "Сталася невідома помилка",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchPopularStories();
    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Популярні статті</h2>
        <p>Завантаження статей...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Популярні статті</h2>
        <p role="alert">{error}</p>
      </section>
    );
  }

  if (popularStories.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.headerContainer}>
        <h2 className={styles.sectionTitle}>Популярні статті</h2>
        <Link href="/stories" className={styles.allStoriesButton}>
          Всі статті
        </Link>
      </div>

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
          spaceBetween={16}
          slidesPerView={1}
          watchOverflow
          breakpoints={{
            768: { slidesPerView: 2 },
            1440: { slidesPerView: 3 },
          }}
          className={styles.swiperContainer}
        >
          {popularStories.map((story) => {
            const storyId = String(story._id || story.id || "");
            if (!storyId) return null;

            return (
              <SwiperSlide key={storyId} className={styles.slideItem}>
                <StoryCard
                  storyId={storyId}
                  title={story.title}
                  category={story.category}
                  image={story.img}
                  author={getAuthorName(story)}
                  rate={story.rate ?? story.savesCount ?? 0}
                />
              </SwiperSlide>
            );
          })}
        </Swiper>

        <div className={styles.navButtonsContainer}>
          <button
            type="button"
            className={`${styles.navButton} ${isBeginning ? styles.disabled : ""}`}
            disabled={isBeginning}
            aria-label="Попередня стаття"
            onClick={() => swiperRef.current?.slidePrev()}
          >
            ←
          </button>

          <button
            type="button"
            className={`${styles.navButton} ${isEnd ? styles.disabled : ""}`}
            disabled={isEnd}
            aria-label="Наступна стаття"
            onClick={() => swiperRef.current?.slideNext()}
          >
            →
          </button>
        </div>
      </div>
      <Link href="/stories" className={styles.endStoriesButton}>
        Всі статті
      </Link>
    </section>
  );
};
