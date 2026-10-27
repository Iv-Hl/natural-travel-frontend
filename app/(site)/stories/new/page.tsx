import { blockPrivateRoute } from "@/lib/auth/blockPrivateRoute";
import NewStoryForm from "@/components/stories/NewStoryForm";

export default async function NewStoryPage() {
  await blockPrivateRoute();

  return <NewStoryForm />;
}
