import Link from "next/link";
import styles from "./MessageNoStories.module.css";

interface MessageNoStoriesProps {
  text: string;
  buttonText: string;
  linkTo: string;
  isLarge?: boolean;
}

export default function MessageNoStories({
  text,
  buttonText,
  linkTo,
  isLarge = false,
}: MessageNoStoriesProps) {
  return (
    <div className={styles.card}>
      <p className={styles.text}>{text}</p>
      <Link href={linkTo} className={`${styles.button} ${isLarge ? styles.buttonLarge : styles.buttonSmall}`}
      >
        {buttonText}
      </Link>
    </div>
  );
}
