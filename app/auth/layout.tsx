import Link from "next/link";
import { routes } from "@/constants/routes";
import styles from "@/components/layout/Layout.module.css";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`container ${styles.shell}`}>
      <header>
        <Link href={routes.home}>Природні мандри</Link>
      </header>
      <main>{children}</main>
    </div>
  );
}
