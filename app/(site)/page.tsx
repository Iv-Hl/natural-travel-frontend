import { About } from "@/components/home/About/About";
import Hero from "@/components/home/Hero";
import { PopularStories } from "@/components/stories/PopularStories";
import Join from "@/components/home/join/join";
import { OurTravelersSection } from "@/components/travellers/OurTravelersSection";

export default function HomePage() {
  return (
    <>
      <h1>Природні мандри</h1>
      <Hero />
      <PopularStories></PopularStories>
      <Hero />
      <About />
      <Join />
      <OurTravelersSection />
    </>
  );
}
