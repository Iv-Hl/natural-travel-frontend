import Image from "next/image";
import Link from "next/link";
import PageTitle from "@/components/PageTitle/PageTitle";
import { routes } from "@/constants/routes";
import styles from "./StoryDetails.module.css";

export type Story = {
  _id: string;
  img: string;
  title: string;
  article: string;
  date: string;
  author: {
    _id: string;
    name: string;
    avatarUrl: string | null;
  } | null;
  category: {
    _id: string;
    category: string;
  } | null;
};

type StoryDetailsProps = {
  story: Story;
};

function formatDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) return value;

  return `${match[3]}.${match[2]}.${match[1]}`;
}

export default function StoryDetails({ story }: StoryDetailsProps) {
  const paragraphs = story.article
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <article className={styles.story}>
      <header className={styles.header}>
        <div className={styles.info}>
          <Link href={routes.stories} className={styles.backLink}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="m14 6-6 6 6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Всі статті
          </Link>

          <PageTitle className={styles.title}>{story.title}</PageTitle>

          <dl className={styles.metadata}>
            <div className={styles.metadataRow}>
              <dt>Автор статті</dt>
              <dd>{story.author?.name || "Невідомий автор"}</dd>
            </div>

            <div className={styles.metadataRow}>
              <dt>Опубліковано</dt>
              <dd>
                <time dateTime={story.date}>{formatDate(story.date)}</time>
              </dd>
            </div>

            <div className={styles.metadataRow}>
              <dt className={styles.visuallyHidden}>Категорія</dt>
              <dd className={styles.category}>
                {story.category?.category || "Без категорії"}
              </dd>
            </div>
          </dl>
        </div>

        <div className={styles.imageWrapper}>
          <Image
            src={story.img}
            alt={story.title}
            fill
            priority
            unoptimized
            sizes="(min-width: 1440px) 755px, (min-width: 768px) 704px, 335px"
            className={styles.image}
          />
        </div>
      </header>

      <div className={styles.description}>
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}
