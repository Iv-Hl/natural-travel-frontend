import { blockPrivateRoute } from "@/lib/auth/blockPrivateRoute";

export default function ProfileLayout({
  children,
  stories,
}: {
  children: React.ReactNode;
  stories: React.ReactNode;
}) {
  blockPrivateRoute();

  return (
    <>
      {children}
      {stories}
    </>
  );
}
