import Link from "next/link";
import { routes } from "@/constants/routes";
import styles from "./Layout.module.css";

export default function Header() {
  return (
    <header>
      <Link href={routes.home}>Природні мандри</Link>
      <nav aria-label="Основна навігація" className={styles.navigation}>
        <Link href={routes.home}>Головна</Link>
        <Link href={routes.stories}>Історії</Link>
        <Link href={routes.travellers}>Мандрівники</Link>
        <Link href={routes.profile}>Збережені історії</Link>
        <Link href={routes.ownStories}>Мої історії</Link>
        <Link href={routes.newStory}>Створити історію</Link>
        <Link href={routes.login}>Увійти</Link>
        <Link href={routes.register}>Зареєструватися</Link>
      </nav>
    </header>
  );
}
