import { blockPrivateRoute } from "@/lib/auth/blockPrivateRoute";
import ProfileTabs from "@/components/profile/ProfileTabs/ProfileTabs";

export default async function ProfileLayout({
  children,
  stories,
}: {
  children: React.ReactNode;
  stories: React.ReactNode;
}) {
  await blockPrivateRoute();

  return (
    <>
      <h1>Профіль мандрівника</h1>

      <ProfileTabs />

      {children}
      {stories}
    </>
  );
}