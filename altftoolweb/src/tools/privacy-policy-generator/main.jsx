import AnimatedBackground from "./AnimatedBackground";
import Hero from "./Hero";
import Navbar from "./Navbar";
import PolicyGenerator from "./PolicyGenerator";

export default function Main() {
  return (
    <div className="privacy-policy-tool">
      <AnimatedBackground />
      <div className="pp-shell relative z-10">
        <Navbar />
        <Hero />
        <PolicyGenerator />
      </div>
    </div>
  );
}