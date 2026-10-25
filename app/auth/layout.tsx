import AuthFooter from "@/components/auth/AuthFooter/AuthFooter";
import AuthHeader from "@/components/auth/AuthHeader/AuthHeader";
import ThemeToggle from "@/components/themeswitcher/ThemeSwitcher";
import styles from "./layout.module.css";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${styles.page} container`}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <AuthHeader />
          <ThemeToggle />
        </div>
      </header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        <AuthFooter />
      </footer>
    </div>
  );
}
