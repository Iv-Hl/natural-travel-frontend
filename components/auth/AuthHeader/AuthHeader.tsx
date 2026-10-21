import Link from "next/link";
import { routes } from "@/constants/routes";
import styles from "./AuthHeader.module.css";

export default function AuthHeader() {
  return (
    <Link
      className={styles.logo}
      href={routes.home}
      aria-label="Природні мандри — на головну"
    >
      <span className={styles.logoIcon} aria-hidden="true" />
      <span>
        Природні
        <br />
        Мандри
      </span>
    </Link>
  );
}
