"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./StoryCard.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface StoryCardProps {
  storyId: string;
  title: string;
  category?: string;
  image?: string;
  author?: string;
  rate?: number;
  onClick?: () => void;
  readTime?: string;
  isInitiallySaved?: boolean;
  isAuthorized?: boolean;
  onOpenAuthModal?: () => void;
}

export const StoryCard = ({
  storyId,
  title,
  image,
  author,
  readTime,
  rate = 0,
  isInitiallySaved = false,
  isAuthorized = false,
  onOpenAuthModal,
}: StoryCardProps) => {
  const router = useRouter();

  const [isSaved, setIsSaved] = useState(isInitiallySaved);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleViewStory = () => {
    router.push(`/stories/${storyId}`);
  };

  const handleSaveToggle = async (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();

    if (loading) return;

    if (!isAuthorized) {
      onOpenAuthModal?.();
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const endpoint = `${API_URL}/api/users/me/saved-stories/${storyId}`;

      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const response = await fetch(endpoint, {
        method: isSaved ? "DELETE" : "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        let message = "Не вдалося оновити збережені статті";

        try {
          const data = await response.json();
          message = data.message || message;
        } catch {}

        throw new Error(message);
      }

      setIsSaved((previous) => !previous);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Сталася невідома помилка";

      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className={styles.card}>
      <div className={styles.imageContainer}>
        <Image
          src={image || "/default-story.jpg"}
          alt={title || "Історія мандрівки"}
          fill
          priority
          sizes="(max-width: 767px) 100vw, (max-width: 1439px) 50vw, 33vw"
          className={styles.image}
        />
      </div>

      <div className={styles.content}>
        <div className={styles.metaInfo}>
          <span className={styles.author}>{author || "Автор"}</span>

          <span className={styles.separator}>·</span>

          <span className={styles.rate} aria-label={`${rate} збережень`}>
            {rate}
            <BookmarkIcon />
          </span>
        </div>

        <h3 className={styles.title}>{title}</h3>

        {readTime && <p className={styles.readTime}>{readTime}</p>}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.viewButton}
            onClick={(event) => {
              event.stopPropagation();
              handleViewStory();
            }}
          >
            Переглянути статтю
          </button>

          <button
            type="button"
            className={`${styles.saveButton} ${isSaved ? styles.saved : ""}`}
            onClick={handleSaveToggle}
            disabled={loading}
            aria-label={isSaved ? "Видалити зі збережених" : "Зберегти статтю"}
            aria-pressed={isSaved}
          >
            {loading ? (
              <span
                className={styles.spinner}
                role="status"
                aria-label="Завантаження"
              />
            ) : (
              <BookmarkIcon filled={isSaved} />
            )}
          </button>
        </div>

        {errorMessage && (
          <p className={styles.error} role="alert">
            {errorMessage}
          </p>
        )}
      </div>
    </article>
  );
};

function BookmarkIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 4.75A1.75 1.75 0 0 1 7.75 3h8.5A1.75 1.75 0 0 1 18 4.75V21l-6-4-6 4V4.75Z" />
    </svg>
  );
}
