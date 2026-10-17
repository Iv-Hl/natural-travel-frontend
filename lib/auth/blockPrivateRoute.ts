import { redirect } from "next/navigation";
import { routes } from "@/constants/routes";

export function blockPrivateRoute(): void {
  redirect(routes.login);
}
