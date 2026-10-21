import Hero from "@/components/home/Hero";
import Join from "@/components/home/join/join";
// import { getCurrentUser } from "@/lib/auth/getCurrentUser";

export default async function HomePage() {
  // const user = await getCurrentUser();

  return (
    <>
      <Hero />
      <Join isAuthenticated={false} />
      {/* {boolean(user)} */}
    </>
  );
}
