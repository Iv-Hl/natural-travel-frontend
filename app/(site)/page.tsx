import { About } from "../../components/home/About/About";
import Hero from "@/components/home/Hero";
import Join from "@/components/home/join/join";

export default function HomePage() {
  return (
    <>
      <About/>
      <h1>Природні мандри</h1>
      <p>Тут буде головна сторінка спільноти мандрівників.</p>
      <Hero />
      <Join isAuthenticated={false} />
    </>
  );
}
