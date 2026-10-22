import { About } from "@/components/home/About/About";
import Hero from "@/components/home/Hero";
import Join from "@/components/home/join/join";
import { OurTravelersSection } from "@/components/travellers/OurTravelersSection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Join isAuthenticated={false} />
      <OurTravelersSection />
    </>
  );
}
