"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";

import { StoryCard } from "../StoryCard/StoryCard";
import styles from "./PopularStories.module.css";

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
  data?: {
    stories?: Story[];
  };
  message?: string;
}

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

  if (typeof story.author === "string") {
    return story.author;
  }

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

        const res = await fetch("/api/stories?type=popular&limit=10", {
          signal: controller.signal,
        });

        const result: StoriesResponse = await res.json();

        if (!res.ok) {
          throw new Error(
            result.message || "Не вдалося завантажити популярні статті",
          );
        }

        setPopularStories(result.data?.stories ?? []);
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

  if (popularStories.length === 0) {
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
            768: {
              slidesPerView: 2,
            },
            1440: {
              slidesPerView: 3,
            },
          }}
          className={styles.swiperContainer}
        >
          {popularStories.map((story) => {
            const storyId = String(story._id || story.id || "");

            if (!storyId) {
              return null;
            }

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
            className={`${styles.navButton} ${
              isBeginning ? styles.disabled : ""
            }`}
            disabled={isBeginning}
            aria-label="Попередня стаття"
            onClick={() => swiperRef.current?.slidePrev()}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.09502 12.8518L12.5968 18.3533C12.7668 18.5236 12.8527 18.7236 12.8545 18.9533C12.8565 19.1829 12.7726 19.3836 12.6028 19.5553C12.4328 19.7274 12.2322 19.8125 12.001 19.8105C11.7699 19.8085 11.5686 19.7226 11.3973 19.5528L4.44727 12.6028C4.35627 12.5108 4.29011 12.4151 4.24877 12.3158C4.20727 12.2163 4.18652 12.1108 4.18652 11.9993C4.18652 11.8878 4.20727 11.7825 4.24877 11.6835C4.29011 11.5844 4.35627 11.4889 4.44727 11.3973L11.4033 4.44127C11.5791 4.27144 11.7805 4.18652 12.0075 4.18652C12.2344 4.18652 12.4328 4.27144 12.6028 4.44127C12.7726 4.61527 12.8575 4.81602 12.8575 5.04352C12.8575 5.27119 12.7726 5.47027 12.6028 5.64077L7.09502 11.1483H19.2978C19.5419 11.1483 19.7459 11.2291 19.9098 11.3908C20.0736 11.5524 20.1555 11.7555 20.1555 12C20.1555 12.2445 20.0736 12.4476 19.9098 12.6093C19.7459 12.7709 19.5419 12.8518 19.2978 12.8518H7.09502Z"
                fill="#1B391B"
              />
            </svg>
          </button>

          <button
            type="button"
            className={`${styles.navButton} ${isEnd ? styles.disabled : ""}`}
            disabled={isEnd}
            aria-label="Наступна стаття"
            onClick={() => swiperRef.current?.slideNext()}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16.9051 12.8517H4.70234C4.45767 12.8517 4.25459 12.7709 4.09309 12.6092C3.93142 12.4476 3.85059 12.2445 3.85059 12C3.85059 11.7555 3.93142 11.5524 4.09309 11.3907C4.25459 11.2291 4.45767 11.1482 4.70234 11.1482H16.9051L11.4033 5.64674C11.2333 5.47674 11.1473 5.27649 11.1451 5.04599C11.1428 4.81532 11.2267 4.61457 11.3968 4.44374C11.5672 4.27224 11.7679 4.18749 11.9991 4.18949C12.2303 4.19149 12.4315 4.2774 12.6028 4.44724L19.5528 11.3972C19.6438 11.4892 19.71 11.5849 19.7513 11.6842C19.7928 11.7837 19.8136 11.8892 19.8136 12.0007C19.8136 12.1122 19.7928 12.2175 19.7513 12.3165C19.71 12.4157 19.6438 12.5111 19.5528 12.6027L12.5968 19.5527C12.421 19.7266 12.2196 19.8135 11.9926 19.8135C11.7658 19.8135 11.5673 19.7261 11.3973 19.5512C11.2275 19.3811 11.1426 19.1823 11.1426 18.955C11.1426 18.7278 11.2275 18.5292 11.3973 18.3592L16.9051 12.8517Z"
                fill="#1B391B"
              />
            </svg>
          </button>
        </div>
      </div>

      <Link href="/stories" className={styles.endStoriesButton}>
        Всі статті
      </Link>
    </section>
  );
};
