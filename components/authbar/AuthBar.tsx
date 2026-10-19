import Link from "next/link";
import { routes } from "@/constants/routes";
import styles from "./AuthBar.module.css";

type MobileMenuProps = {
    onClose: () => void;
}
export default function MobileMenu({ onClose }: MobileMenuProps)
{
    return (
        <div className={styles.menu}>
        <div className={styles.topBar}>
            <Link href={routes.home}
                className={styles.logo}
                onClick={onClose}>
               <span className={styles.logoIcon} aria-hidden="true" />
                <span>Природні мандри</span>
            </Link>
            <button
                type="button"
                className={styles.closeButton}
                onClick={onClose}
                aria-label="Закрити меню">
                <svg className={styles.closeIcon} aria-hidden="true">
                    <use href="/icons/sprite.svg#close" />
                </svg>
            </button>
        </div>
        <nav className={styles.navigation}
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
            <Link href={routes.login} className={styles.login}>
                Вхід
            </Link>
            <Link href={routes.register} className={styles.register}>
                Реєстрація
            </Link>
        </div>
    </div>
);}
