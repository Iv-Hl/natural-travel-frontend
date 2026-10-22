"use client";

import Link from "next/link";
import { routes } from "@/constants/routes";
import styles from "./AuthBar.module.css";
import { useAuth } from "@/components/providers/AuthProvider";


type MobileMenuProps = {
    onClose: () => void;
}
export default function MobileMenu({ onClose }: MobileMenuProps)
{
    const { user, logout } = useAuth();

    return (
        <div className={styles.menu}>
       
            <nav
            id="mobile-navigation"
            className={styles.navigation}
            aria-label="Мобільна навігація">
            <Link href={routes.home}
            onClick={onClose}
            >
                Головна
            </Link>
            <Link href={routes.stories}
                onClick={onClose}
            >
                Статті
            </Link>
            <Link href={routes.travellers}
                onClick={onClose}
            >
                Еко-Мандрівники
            </Link>
        </nav>
        <div className={styles.authLinks}>
            {user ? (
              <>
                <Link href={routes.profile} className={styles.login} onClick={onClose}>
                  Мій профіль
                </Link>
                <button
                  type="button"
                  className={styles.register}
                  onClick={() => void logout().then(onClose).catch(() => undefined)}
                >
                  Вийти
                </button>
              </>
            ) : (
              <>
                <Link href={routes.login} className={styles.login}
                onClick={onClose}>
                Вхід
            </Link>
                <Link href={routes.register} className={styles.register}
                onClick={onClose}>
                Реєстрація
            </Link>
              </>
            )}
        </div>
    </div>
);}
