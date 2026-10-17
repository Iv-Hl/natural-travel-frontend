import Link from "next/link";
import { routes } from "@/constants/routes";

export default function LoginPage() {
  return (
    <>
      <h1>Вхід</h1>
      <p>Форму входу ще не підключено.</p>
      <Link href={routes.register}>Зареєструватися</Link>
    </>
  );
}
