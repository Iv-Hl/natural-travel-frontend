import Hero from "@/components/home/Hero";
import { PopularStories } from "@/components/stories/PopularStories";

export default function HomePage() {
  return (
    <>
      <h1>Природні мандри</h1>
      <Hero />
      <PopularStories></PopularStories>
    </>
  );
}
