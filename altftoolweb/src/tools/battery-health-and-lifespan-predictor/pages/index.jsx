import { useState, useRef } from "react";
import BatteryForm from "../components/BatteryForm";
import DeviceSelector from "../components/DeviceSelector";
import ResultCard from "../components/ResultCard";
import { calculateBatteryHealth } from "../utils/batteryCalculator";

function GlassCard({ children, className = "" }) {
  return (
    <div className={`rounded-3xl border bg-[var(--card)]/80 backdrop-blur-2xl border-[var(--border)] shadow-sm hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-[transform,box-shadow] duration-300 ${className}`}>
      {children}
    </div>
  );
}

export default function App() {
  const [category, setCategory] = useState("consumer");
  const [device, setDevice] = useState("phone");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const resultRef = useRef(null);

  function handleChange(cat, dev) {
    setCategory(cat);
    setDevice(dev);
    setResult(null);
  }

  function handleAnalyze(data) {
    setLoading(true);
    setTimeout(() => {
      const res = calculateBatteryHealth({ category, device, ...data });
      setResult(res);
      setLoading(false);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }, 900);
  }

  return (
    <div className="min-h-screen px-4 py-10 bg-[var(--background)] text-[var(--foreground)] !transition-none">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-[var(--primary)] drop-shadow-sm">
            Battery Intelligence Platform
          </h1>
          <p className="text-[var(--secondary-foreground)]">
            Multi‑device battery analysis system
          </p>
        </div>

        <div className="rounded-3xl p-8 bg-[var(--card)] border border-[var(--border)] shadow-sm !transition-none">
          <DeviceSelector
            category={category}
            device={device}
            onChange={handleChange}
          />
        </div>

        <div className="flex justify-center">
          <GlassCard className="p-8 w-full max-w-3xl">
            <BatteryForm
              device={device}
              loading={loading}
              onCalculate={handleAnalyze}
            />
          </GlassCard>
        </div>

        {result && (
          <div ref={resultRef} className="animate-fadeIn">
            <ResultCard result={result} />
          </div>
        )}
      </div>
    </div>
  );
}