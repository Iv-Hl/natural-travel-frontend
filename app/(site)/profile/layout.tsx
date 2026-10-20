// import { blockPrivateRoute } from "@/lib/auth/blockPrivateRoute";

// export default function ProfileLayout({
//   children,
//   stories,
// }: {
//   children: React.ReactNode;
//   stories: React.ReactNode;
// }) {
//   blockPrivateRoute();

//   return (
//     <>
//       {children}
//       {stories}
//     </>
//   );
// }

import ProfileTabs from "@/components/profile/ProfileTabs/ProfileTabs";

export default function ProfileLayout({
  children,
  stories,
}: {
  children: React.ReactNode;
  stories: React.ReactNode;
}) {
  // Тимчасово тестуємо інтерфейс без перевірки авторизації.
  // Перед завершенням роботи потрібно відновити захист маршруту.

  return (
    <main>
      <h1>Профіль мандрівника</h1>

      <ProfileTabs />

      {children}
      {stories}
    </main>
  );
}
