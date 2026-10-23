import Hero from "@/components/home/Hero";
import { PopularStories } from "@/components/PopularStories/PopularStories";
import Join from "@/components/home/join/join";

export default function HomePage() {
  return (
    <>
      <h1>Природні мандри</h1>
      <Hero />
      <PopularStories></PopularStories>
      <Hero />
      <Join isAuthenticated={false} />
    </>
  );
}
