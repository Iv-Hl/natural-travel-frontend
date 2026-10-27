import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerContainer}`}>
        {/* Логотип */}
        <Link href="/" className={styles.logoLink}>
          <span className={styles.logoIcon} aria-hidden="true" />
          <span className={styles.logoText}>
            Природні
            <br />
            мандри
          </span>
        </Link>

        {/* Список соціальних мереж */}
        <ul className={styles.socialList}>
          <li>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <svg className={styles.socialIcon} aria-hidden="true">
                <use href="/icons/symbol-defs.svg#icon-facebook" />
              </svg>
            </a>
          </li>
          <li>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <svg className={styles.socialIcon} aria-hidden="true">
                <use href="/icons/symbol-defs.svg#icon-Instagram" />
              </svg>
            </a>
          </li>
          <li>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
            >
              <svg className={styles.socialIcon} aria-hidden="true">
                <use href="/icons/symbol-defs.svg#icon-Xtwitter" />
              </svg>
            </a>
          </li>
          <li>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
            >
              <svg className={styles.socialIcon} aria-hidden="true">
                <use href="/icons/symbol-defs.svg#icon-Youtube" />
              </svg>
            </a>
          </li>
        </ul>

        {/* Навігація */}
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            <li>
              <Link href="/">Головна</Link>
            </li>
            <li>
              <Link href="/stories">Статті</Link>
            </li>
            <li>
              <Link href="/travellers">Еко-Мандрівники</Link>
            </li>
          </ul>
        </nav>

        {/* Copyright */}
        <div className={styles.copyright}>
          <p>© {currentYear} Природні мандри. Усі права захищені.</p>
        </div>
      </div>
    </footer>
  );
}
