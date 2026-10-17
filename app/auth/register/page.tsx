import Link from "next/link";
import { routes } from "@/constants/routes";

export default function RegisterPage() {
  return (
    <>
      <h1>Реєстрація</h1>
      <p>Форму реєстрації ще не підключено.</p>
      <Link href={routes.login}>Увійти</Link>
    </>
  );
}
