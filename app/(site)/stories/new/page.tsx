import { blockPrivateRoute } from "@/lib/auth/blockPrivateRoute";

export default function NewStoryPage() {
  blockPrivateRoute();
  return null;
}
