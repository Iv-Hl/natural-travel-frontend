import type { Metadata } from "next";
import Register from "@/components/auth/register/Register";

export const metadata: Metadata = { title: "Реєстрація" };

export default function RegisterPage() {
  return <Register />;
}
