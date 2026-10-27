import Link from "next/link";
import styles from "./MessageNoStories.module.css";

interface MessageNoStoriesProps {
  text: string;
  buttonText: string;
  linkTo: string;
  isLarge?: boolean;
  buttonVariant?: "back" | "stories" | "publish";
}

export default function MessageNoStories({
  text,
  buttonText,
  linkTo,
  isLarge = false,
  buttonVariant,
}: MessageNoStoriesProps) {
  const variantClass =
    buttonVariant === "back"
      ? styles.buttonBack
      : buttonVariant === "stories"
        ? styles.buttonStories
        : buttonVariant === "publish"
          ? styles.buttonPublish
          : "";

  return (
    <div className={styles.card}>
      <p className={styles.text}>{text}</p>
      <Link
        href={linkTo}
        className={`${styles.button} ${variantClass} ${isLarge ? styles.buttonLarge : styles.buttonSmall}`}
      >
        {buttonText}
      </Link>
    </div>
  );
}
