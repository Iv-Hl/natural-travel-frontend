import Image from "next/image";
import Link from "next/link";
import styles from "./StoryCard.module.css";

export interface Story {
  _id: string;
  title: string;
  img: string;
  date: string;
  ownerId: string;
  authorName?: string;
  rate?: number;
  savesCount?: number;
}

interface StoryCardProps {
  story: Story;
  isSaved: boolean;
  isSaving?: boolean;
  onSave: (id: string) => void;
  isSaving?: boolean;
}

export default function StoryCard({
  story,
  isSaved,
  onSave,
  isSaving = false,
}: StoryCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.imageWrapper}>
        <Image
          src={story.img}
          alt={story.title}
          width={421}
          height={421}
          className={styles.image}
          sizes="(max-width: 767px) 100vw, (max-width: 1439px) 50vw, 33vw"
        />
      </div>

      <div className={styles.cardContent}>
        <p className={styles.author}>
          <span>{story.authorName || "Автор"}</span>
          <span aria-hidden="true">·</span>

          <span className={styles.saves}>
            {story.rate ?? story.savesCount ?? 0}

            <Image src="/icons/bookmark.svg" alt="" width={16} height={16} />
          </span>
        </p>

        <h3 className={styles.title}>{story.title}</h3>

        <div className={styles.cardActions}>
          <Link href={`/stories/${story._id}`} className={styles.viewButton}>
            Переглянути статтю
          </Link>

          <button
            type="button"
            className={`${styles.saveButton} ${isSaved ? styles.saved : ""}`}
            onClick={() => onSave(story._id)}
            disabled={isSaving}
            aria-label={isSaved ? "Прибрати зі збережених" : "Зберегти історію"}
            aria-pressed={isSaved}
            aria-busy={isSaving}
          >
            {isSaving ? (
              <span className={styles.loader} aria-hidden="true" />
            ) : (
              <Image src="/icons/bookmark.svg" alt="" width={24} height={24} />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
