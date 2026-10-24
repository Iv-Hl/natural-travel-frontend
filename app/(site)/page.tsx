import Hero from "@/components/home/Hero";
import { PopularStories } from "@/components/PopularStories/PopularStories";
import Join from "@/components/home/join/join";

export default function HomePage() {
  return (
    <>
      <Hero />
      <PopularStories />
      <Join isAuthenticated={false} />
    </>
  );
}
