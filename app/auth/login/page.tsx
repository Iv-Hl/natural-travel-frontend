import type { Metadata } from "next";
import Login from "@/components/auth/login/Login";

export const metadata: Metadata = { title: "Вхід" };

export default function LoginPage() {
  return <Login />;
}
