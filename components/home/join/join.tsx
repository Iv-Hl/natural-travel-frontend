"use client";

import Link from "next/link";
import { routes } from "@/constants/routes";
import styles from "./join.module.css";
import { useAuth } from "@/components/providers/AuthProvider";

export default function Join() {
  const { user } = useAuth();
  const isAuthenticated = Boolean(user);
  return (
    <section id="join" className={styles.section} aria-labelledby="join-title">
      <div className={styles.banner}>
        <div className={styles.content}>
          <h2 id="join-title" className={styles.title}>
            Приєднуйся до спільноти свідомих мандрівників
          </h2>
          <p className={styles.description}>
            Стань частиною ком’юніті, де подорожі стають не лише пригодою, а й
            внеском у збереження природи. Тут ти знайдеш однодумців, поради для
            сталих мандрів та натхнення для нових маршрутів Україною.
          </p>
          <Link
            href={isAuthenticated ? routes.profile : routes.register}
            className={styles.link}
          >
            {isAuthenticated ? "Збережені статті" : "Зареєструватися"}
          </Link>
        </div>
      </div>
    </section>
  );
}
