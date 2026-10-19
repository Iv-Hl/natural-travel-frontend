"use client";

import { useState } from "react";
import Link from "next/link";
import { routes } from "@/constants/routes";
import styles from "./Layout.module.css";
import Modal from "@/components/modals/Modal";
import MobileMenu from "@/components/authbar/AuthBar";
import ThemeToggle from "../themeswitcher/ThemeSwitcher";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => { setIsMenuOpen(false) };
  
  return (
    <header className={styles.header}>
      <Link href={routes.home} className={styles.logo}>
       <span className={styles.logoIcon} aria-hidden="true" />
          <span>Природні мандри</span>
      </Link>
      <ThemeToggle/>
        <nav
          aria-label="Основна навігація"
          className={styles.navigation}>
          <Link href={routes.home}>Головна</Link>
          <Link href={routes.stories}>Статті</Link>
          <Link href={routes.travellers}>Еко-Мандрівники</Link>
        </nav>
       
        <div className={styles.authLinks}>
              <Link href={routes.login} className={styles.loginLink}>
                Вхід
              </Link>
              <Link href={routes.register} className={styles.registerLink}>
                Реєстрація
              </Link>
        </div>
      
      <button className={styles.menuButton}
        aria-label="Відкрити меню"
        type="button"
        aria-expanded={isMenuOpen}
        aria-controls="mobile-navigation"
        onClick={() => setIsMenuOpen(true)}
      >
        <svg className={styles.menuIcon}
          aria-hidden="true">
          <use href="/icons/sprite.svg#burger" />
        </svg>
      </button>
  {isMenuOpen && (
        <Modal onClose={closeMenu}>
          <MobileMenu onClose={closeMenu} />
        </Modal>
  )}   
          
    </header>
  );
}
