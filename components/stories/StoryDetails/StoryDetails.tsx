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

function formatDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  return match ? `${match[3]}.${match[2]}.${match[1]}` : value;
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
            <Image
              src="/icons/chevron-left.svg"
              alt=""
              width={24}
              height={24}
              aria-hidden="true"
            />
            Всі статті
          </Link>

          <PageTitle className={styles.title}>{story.title}</PageTitle>

          <div className={styles.details}>
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
            </dl>

            {story.category && (
              <span className={styles.category}>
                <span className={styles.visuallyHidden}>Категорія: </span>
                {story.category.category}
              </span>
            )}
          </div>
        </div>

        <div className={styles.imageWrapper}>
          <Image
            src={story.img}
            alt={story.title}
            fill
            priority
            unoptimized
            sizes="(min-width: 1366px) 755px, (min-width: 768px) 704px, 100vw"
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
