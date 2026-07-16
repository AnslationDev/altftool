import AnimatedBackground from "./AnimatedBackground";
import Hero from "./Hero";
import JsonGoGenerator from "./JsonGoGenerator";
import Navbar from "./Navbar";

export default function Main() {
  return (
    <div className="privacy-policy-tool json-go-tool pp-theme-ready">
      <AnimatedBackground />
      <div className="pp-shell relative z-10">
        <Navbar />
        <Hero />
        <JsonGoGenerator />
      </div>
    </div>
  );
}
