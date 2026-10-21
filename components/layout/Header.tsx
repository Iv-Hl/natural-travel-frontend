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

  const toggleMenu = () => { setIsMenuOpen((prev) => !prev) };
  const closeMenu = () => { setIsMenuOpen(false) };
  
  return (
    <header className={styles.header}>
      <Link href={routes.home} className={styles.logo}>
       <span className={styles.logoIcon} aria-hidden="true" />
          <span>Природні мандри</span>
      </Link>
      <div className={styles.actions}>
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
      <div className={styles.blockButtons}>
      <ThemeToggle/>
      <button className={styles.menuButton}
            aria-label={isMenuOpen ? "Закрити меню" : "Відкрити меню"}
        type="button"
        aria-expanded={isMenuOpen}
        aria-controls="mobile-navigation"
        onClick={toggleMenu}
          >
            
            {isMenuOpen ? (
              <svg
                className={styles.menuIcon}
                aria-hidden="true"
                focusable="false"
              >
<use href="/icons/symbol-defs.svg#icon-close"/>
              </svg>
              
        ):(   
        <svg className={styles.menuIcon}
          aria-hidden="true"
          focusable="false">
          <use href="/icons/symbol-defs.svg#icon-burger-menu" />
          </svg>)
}
      </button>
        </div>
         

     </div>
        
       
  {isMenuOpen && (
        <Modal onClose={closeMenu}
        ariaLabel="Мобільна навігація">
          <MobileMenu onClose={closeMenu} />
        </Modal>
  )}   
          
    </header>
  );
}
