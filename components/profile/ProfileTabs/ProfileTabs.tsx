"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { routes } from "@/constants/routes";
import styles from "./ProfileTabs.module.css";

export default function ProfileTabs() {
  const pathname = usePathname();

  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    if (!pendingHref || pathname !== pendingHref) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setPendingHref(null);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [pathname, pendingHref]);

  const isSavedActive = pathname === routes.profile;
  const isOwnActive = pathname === routes.ownStories;

  return (
    <nav className={styles.tabs}>
      <Link
        href={routes.profile}
        className={`${styles.tab} ${isSavedActive ? styles.active : ""}`}
        aria-current={isSavedActive ? "page" : undefined}
        onClick={() => {
          if (!isSavedActive) {
            setPendingHref(routes.profile);
          }
        }}
      >
        Збережені історії
        <span
          className={`${styles.loadingIndicator} ${
            pendingHref === routes.profile ? styles.loadingIndicatorPending : ""
          }`}
          aria-hidden="true"
        />
      </Link>

      <Link
        onClick={() => {
          if (!isOwnActive) {
            setPendingHref(routes.ownStories);
          }
        }}
        href={routes.ownStories}
        className={`${styles.tab} ${isOwnActive ? styles.active : ""}`}
        aria-current={isOwnActive ? "page" : undefined}
      >
        Мої історії
        <span
          className={`${styles.loadingIndicator} ${
            pendingHref === routes.ownStories
              ? styles.loadingIndicatorPending
              : ""
          }`}
          aria-hidden="true"
        />
      </Link>
    </nav>
  );
}
