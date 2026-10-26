// import Link from "next/link";
// import { routes } from "@/constants/routes";
// import styles from "./PrivAuthBar.module.css";
// import { useAuth } from "@/components/providers/AuthProvider";

// type MobileMenuAuthProps = {
//     onClose: () => void;
// }

// export default function MobileMenuAuth({ onClose }: MobileMenuAuthProps) {
//     const { user, logout } = useAuth();
//     const userName = user?.name || "Імʼя";

//     return (
//         <div className={styles.menu}>
//             <nav
//                 id="mobile-navigation"
//                 className={styles.navigation}
//                 aria-label="Мобільна навігація"
//             >
//                 <Link href={routes.home} onClick={onClose}>
//                     Головна
//                 </Link>
//                 <Link href={routes.stories} onClick={onClose}>
//                     Статті
//                 </Link>
//                 <Link href={routes.travellers} onClick={onClose}>
//                     Еко-Мандрівники
//                 </Link>
//                 <Link href={routes.profile} onClick={onClose}>
//                     Мій Профіль
//                 </Link>
//             </nav>

//             <div className={styles.bottomSection}>
//                 <Link
//                     href={routes.newStory}
//                     className={styles.publishBtnMobile}
//                     onClick={onClose}
//                 >
//                     Опублікувати статтю
//                 </Link>

//                 <div className={styles.userProfileMobile}>
//                     <div className={styles.avatar}>
//                         {user?.avatarUrl ? (
//                             <img src={user.avatarUrl} alt={userName} className={styles.avatarImg} />
//                         ) : (
//                             <svg className={styles.avatarIcon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
//                                 <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-1.96-2.36L6.5 17h11l-3.54-4.71z"/>
//                             </svg>
//                         )}
//                     </div>
//                     <span className={styles.userName}>{userName}</span>
//                     <button
//                         className={styles.logoutBtn}
//                         aria-label="Вийти"
//                         type="button"
//                         onClick={() => {
//                             logout();
//                             onClose();
//                         }}
//                     >
//                         <svg className={styles.logoutIcon} aria-hidden="true" focusable="false">
//                             <use href="/icons/symbol-defs.svg#icon-logout" />
//                         </svg>
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// }


import Link from "next/link";
import { routes } from "@/constants/routes";
import styles from "./PrivAuthBar.module.css";
import { useAuth } from "@/components/providers/AuthProvider";

type MobileMenuAuthProps = {
    onClose: () => void;
}

export default function MobileMenuAuth({ onClose }: MobileMenuAuthProps) {
    const { user, logout } = useAuth();
    const userName = user?.name || "Імʼя";

    const handleLogout = async () => {
        try {
            await logout();
            onClose();
        } catch (error) {
            console.error("Не вдалося вийти з системи:", error);
        }
    };

    return (
        <div className={styles.menu}>
            <nav
                id="mobile-navigation"
                className={styles.navigation}
                aria-label="Мобільна навігація"
            >
                <Link href={routes.home} onClick={onClose}>
                    Головна
                </Link>
                <Link href={routes.stories} onClick={onClose}>
                    Статті
                </Link>
                <Link href={routes.travellers} onClick={onClose}>
                    Еко-Мандрівники
                </Link>
                <Link href={routes.profile} onClick={onClose}>
                    Мій Профіль
                </Link>
            </nav>

            <div className={styles.bottomSection}>
                <Link
                    href={routes.newStory}
                    className={styles.publishBtnMobile}
                    onClick={onClose}
                >
                    Опублікувати статтю
                </Link>

                <div className={styles.userProfileMobile}>
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
                        onClick={handleLogout}
                    >
                        <svg className={styles.logoutIcon} aria-hidden="true" focusable="false">
                            <use href="/icons/symbol-defs.svg#icon-logout" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}