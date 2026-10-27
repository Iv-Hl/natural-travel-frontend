import { About } from "@/components/home/About/About";
import Hero from "@/components/home/Hero";
import { PopularStories } from "@/components/PopularStories/PopularStories";
import Join from "@/components/home/join/join";
import { OurTravelersSection } from "@/components/travellers/OurTravelersSection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <PopularStories />
      <About />
      <OurTravelersSection />
      <Join />
    </>
  );
}
