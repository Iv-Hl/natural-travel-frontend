
"use client";

import { useEffect, useState } from "react";
import styles from "./ThemeSwitcher.module.css";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const appliedTheme = document.documentElement.dataset.theme;
    const savedTheme = localStorage.getItem("theme");

    const initialTheme: Theme =
      appliedTheme === "dark" || appliedTheme === "light"
        ? appliedTheme
        : savedTheme === "dark" || savedTheme === "light"
          ? savedTheme
          : "light";

    setTheme(initialTheme);
    document.documentElement.dataset.theme = initialTheme;
    localStorage.setItem("theme", initialTheme);
    setMounted(true);
  }, []);

  function toggleTheme() {
    const nextTheme: Theme = theme === "light" ? "dark" : "light";

    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem("theme", nextTheme);
    document.cookie = `theme=${nextTheme}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggleTheme}
      aria-label={
        theme === "light"
          ? "Увімкнути нічну тему"
          : "Увімкнути денну тему"
      }
      title={theme === "light" ? "Нічна тема" : "Денна тема"}
      disabled={!mounted}
    >
      <span aria-hidden="true">
        {theme === "light" ? "☀️" : "🌙"}
      </span>
    </button>
  );
}
