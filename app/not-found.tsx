import Link from "next/link";
import { routes } from "@/constants/routes";

export default function NotFound() {
  return (
    <main>
      <h1>404 — Сторінку не знайдено</h1>
      <Link href={routes.home}>На головну</Link>
    </main>
  );
}
