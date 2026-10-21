import Link from "next/link";
import { routes } from "@/constants/routes";
import styles from "./AuthNavigation.module.css";

type AuthNavigationProps = {
  activePage: "login" | "register";
};

export default function AuthNavigation({ activePage }: AuthNavigationProps) {
  return (
    <nav className={styles.navigation} aria-label="Авторизація">
      <Link
        className={`${styles.link} ${activePage === "register" ? styles.active : ""}`}
        href={routes.register}
        aria-current={activePage === "register" ? "page" : undefined}
      >
        Реєстрація
      </Link>
      <Link
        className={`${styles.link} ${activePage === "login" ? styles.active : ""}`}
        href={routes.login}
        aria-current={activePage === "login" ? "page" : undefined}
      >
        Вхід
      </Link>
    </nav>
  );
}
