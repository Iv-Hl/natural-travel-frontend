import { blockPrivateRoute } from "@/lib/auth/blockPrivateRoute";

export default async function NewStoryPage() {
  await blockPrivateRoute();
  return null;
}
