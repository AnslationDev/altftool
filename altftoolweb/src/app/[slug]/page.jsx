import HeroSection from "./components/HeroSection";
import Section1Wrapper from "./components/Section1";
import Section2Wrapper from "./components/Section2";
import Section3Wrapper from "./components/Section3";

export default function Page() {
  return (
    <div>
      <HeroSection />
      <Section1Wrapper />
      <Section2Wrapper />
      <Section3Wrapper />
    </div>
  );
}