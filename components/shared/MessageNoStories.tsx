import Link from "next/link";
import styles from "./MessageNoStories.module.css";

interface MessageNoStoriesProps {
  text: string;
  buttonText: string;
  linkTo: string;
}

export default function MessageNoStories({
  text,
  buttonText,
  linkTo,
}: MessageNoStoriesProps) {
  return (
    <div className={styles.card}>
      <p className={styles.text}>{text}</p>
      <Link href={linkTo} className={styles.button}>
        {buttonText}
      </Link>
    </div>
  );
}
