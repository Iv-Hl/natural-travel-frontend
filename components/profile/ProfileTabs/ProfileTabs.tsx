"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { routes } from "@/constants/routes";
import styles from "./ProfileTabs.module.css";

export default function ProfileTabs() {
  const pathname = usePathname();

  const isSavedActive = pathname === routes.profile;
  const isOwnActive = pathname === routes.ownStories;

  return (
    <nav className={styles.tabs} aria-label="Історії мандрівника">
      <Link
        href={routes.profile}
        className={`${styles.tab} ${isSavedActive ? styles.active : ""}`}
        aria-current={isSavedActive ? "page" : undefined}
      >
        Збережені історії
      </Link>

      <Link
        href={routes.ownStories}
        className={`${styles.tab} ${isOwnActive ? styles.active : ""}`}
        aria-current={isOwnActive ? "page" : undefined}
      >
        Мої історії
      </Link>
    </nav>
  );
}
