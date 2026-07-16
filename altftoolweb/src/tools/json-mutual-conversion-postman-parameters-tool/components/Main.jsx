import AnimatedBackground from "./AnimatedBackground";
import ConverterStudio from "./ConverterStudio";
import Hero from "./Hero";
import Navbar from "./Navbar";

export default function Main() {
  return (
    <div className="privacy-policy-tool postman-converter-tool pp-theme-ready">
      <AnimatedBackground />
      <div className="pp-shell relative z-10">
        <Navbar />
        <Hero />
        <ConverterStudio />
      </div>
    </div>
  );
}
