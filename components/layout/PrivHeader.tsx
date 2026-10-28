"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { routes } from "@/constants/routes";
import styles from "./PrivHeader.module.css";
import Modal from "@/components/modals/Modal";
import MobileMenu from "@/components/authbar/PrivAuthBar"; 
import { useAuth } from "@/components/providers/AuthProvider";
import ConfirmModal from "@/components/ConfirmModal/ConfirmModal";
import ThemeSwitcher from "@/components/themeswitcher/ThemeSwitcher";

export default function PrivHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1440px)");

    function handleResize(event: MediaQueryListEvent) {
      if (event.matches) {
        setIsMenuOpen(false);
      }
    }

    if (mediaQuery.matches) {
      setIsMenuOpen(false);
    }

    mediaQuery.addEventListener("change", handleResize);

    return () => {
      mediaQuery.removeEventListener("change", handleResize);
    };
  }, []);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen((isOpen) => !isOpen);
  };

  const requestLogout = () => {
    closeMenu();
    setIsLogoutConfirmOpen(true);
  };

  const handleLogout = async () => {
    await logout();
    setIsLogoutConfirmOpen(false);
  };

  const userName = user?.name || "Імʼя";

  return (
    <header className={styles.header}>
      <Link href={routes.home} className={styles.logo}>
        <span className={styles.logoIcon} aria-hidden="true" />
        <span className={styles.logoText}>
          Природні
          <br />
          Мандри
        </span>
      </Link>

      <nav aria-label="Основна навігація" className={styles.navigation}>
        <Link href={routes.home}>Головна</Link>
        <Link href={routes.stories}>Статті</Link>
        <Link href={routes.travellers}>Еко-Мандрівники</Link>
        <Link href={routes.profile}>Мій Профіль</Link>
      </nav>

      <div className={styles.actions}>
        <ThemeSwitcher />

        <div className={styles.desktopActions}>
          <Link href={routes.newStory} className={styles.publishBtn}>
            Опублікувати статтю
          </Link>

          <div className={styles.userProfile}>
            <div className={styles.avatar}>
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={userName} className={styles.avatarImg} />
              ) : (
                <svg className={styles.avatarIcon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-1.96-2.36L6.5 17h11l-3.54-4.71z"/>
                </svg>
              )}
            </div>
            <span className={styles.userName}>{userName}</span>
            <button
              className={styles.logoutBtn}
              aria-label="Вийти"
              type="button"
              onClick={requestLogout}
            >
              <svg className={styles.logoutIcon} aria-hidden="true" focusable="false">
                <use href="/icons/symbol-defs.svg#icon-logout" />
              </svg>
            </button>
          </div>
        </div>

        <div className={styles.tabletActions}>
          <Link href={routes.newStory} className={styles.tabletPublishBtn}>
            Опублікувати статтю
          </Link>

          <button
            className={styles.menuButton}
            aria-label={isMenuOpen ? "Закрити меню" : "Відкрити меню"}
            type="button"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            onClick={toggleMenu}
          >
            {isMenuOpen ? (
              <svg className={styles.menuIcon} aria-hidden="true" focusable="false">
                <use href="/icons/symbol-defs.svg#icon-close" />
              </svg>
            ) : (
              <svg className={styles.menuIcon} aria-hidden="true" focusable="false">
                <use href="/icons/symbol-defs.svg#icon-burger-menu" />
              </svg>
            )}
          </button>
        </div>

        <button
          className={`${styles.menuButton} ${styles.mobileMenuButton}`}
          aria-label={isMenuOpen ? "Закрити меню" : "Відкрити меню"}
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          onClick={toggleMenu}
        >
          {isMenuOpen ? (
              <svg className={styles.menuIcon} aria-hidden="true" focusable="false">
                <use href="/icons/symbol-defs.svg#icon-close" />
              </svg>
            ) : (
              <svg className={styles.menuIcon} aria-hidden="true" focusable="false">
                <use href="/icons/symbol-defs.svg#icon-burger-menu" />
              </svg>
            )}
        </button>
      </div>

      {isMenuOpen && (
        <Modal onClose={closeMenu} ariaLabel="Мобільна навігація">
          <MobileMenu onClose={closeMenu} onRequestLogout={requestLogout} />
        </Modal>
      )}

      {isLogoutConfirmOpen && (
        <ConfirmModal
          title="Вийти з акаунта?"
          description="Ви впевнені, що хочете вийти з акаунта?"
          cancelButtonText="Скасувати"
          confirmButtonText="Вийти"
          onCancel={() => setIsLogoutConfirmOpen(false)}
          onConfirm={handleLogout}
        />
      )}
    </header>
  );
}
