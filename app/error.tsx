"use client";

import Link from "next/link";
import { routes } from "@/constants/routes";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div role="alert">
      <h1>Не вдалося завантажити сторінку</h1>
      <p>Спробуйте ще раз або поверніться на головну.</p>
      <button type="button" onClick={() => reset()}>
        Спробувати ще раз
      </button>{" "}
      <Link href={routes.home}>На головну</Link>
    </div>
  );
}
