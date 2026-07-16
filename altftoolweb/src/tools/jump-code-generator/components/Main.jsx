import AnimatedBackground from "./AnimatedBackground";
import Hero from "./Hero";
import JumpCodeGenerator from "./JumpCodeGenerator";
import Navbar from "./Navbar";

export default function Main() {
  return (
    <div className="privacy-policy-tool jump-code-tool">
      <AnimatedBackground />
      <div className="pp-shell relative z-10">
        <Navbar />
        <Hero />
        <JumpCodeGenerator />
      </div>
    </div>
  );
}
