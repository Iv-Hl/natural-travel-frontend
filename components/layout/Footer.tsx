import Link from 'next/link';
import Image from 'next/image';
import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Логотип */}
        <Link href="/" className={styles.logoLink}>
          <Image 
            src="/images/eco-mark.svg" 
            alt="Eco mark" 
            width={20} 
            height={20} 
            className={styles.logoIcon}
          />
          <span className={styles.logoText}>
            Природні<br />мандри
          </span>
        </Link>

        {/* Список соціальних мереж */}
        <ul className={styles.socialList}>
          <li>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              FB
            </a>
          </li>
          <li>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              IG
            </a>
          </li>
          <li>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              X
            </a>
          </li>
          <li>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              YT
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