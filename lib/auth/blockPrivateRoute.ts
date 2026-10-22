import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { routes } from "@/constants/routes";

export async function blockPrivateRoute(): Promise<void> {
  const cookieStore = await cookies();
  if (!cookieStore.has("sessionId") || !cookieStore.has("refreshToken")) {
    redirect(routes.login);
  }
}
