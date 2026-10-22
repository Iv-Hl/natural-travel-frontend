import { blockPrivateRoute } from "@/lib/auth/blockPrivateRoute";

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
      {children}
      {stories}
    </>
  );
}
