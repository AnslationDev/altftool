"use client";

import { useState, useEffect, useRef } from "react";
import { CloudRain, RotateCcw, Play, Pause, Sliders, Info, Thermometer } from "lucide-react";

const FRONTS = [
  {
    id: "cold",
    name: "Cold Front",
    weather: "Heavy Rain, Thunderstorms, Violent Squalls",
    clouds: "Cumulonimbus & Towering Cumulus",
    pressure: "Sudden Drop followed by Sharp Rise",
    desc: "Dense cold air rapidly wedges under warm air, forcing rapid vertical lift and convective storms.",
  },
  {
    id: "warm",
    name: "Warm Front",
    weather: "Light to Moderate Steady Precipitation",
    clouds: "Cirrus → Altostratus → Nimbostratus",
    pressure: "Gradual Steady Fall",
    desc: "Warm moist air gently glides over denser cold air along a shallow incline, producing widespread cloudiness.",
  },
  {
    id: "stationary",
    name: "Stationary Front",
    weather: "Prolonged Cloudiness & Continuous Drizzle",
    clouds: "Stratus & Stratocumulus",
    pressure: "Nearly Constant / Unchanged",
    desc: "Cold and warm air masses stall alongside each other with neither advancing.",
  },
  {
    id: "occluded",
    name: "Occluded Front",
    weather: "Complex Heavy Rain & Cold Temperature Drop",
    clouds: "Cumulonimbus & Nimbostratus blend",
    pressure: "Reaches Lowest Point then Rises",
    desc: "A fast-moving cold front catches up to a warm front, trapping warm air aloft.",
  },
];

export default function WeatherFrontSimulator() {
  const [front, setFront] = useState(FRONTS[0]);
  const [tempContrast, setTempContrast] = useState(15); // °C
  const [moisture, setMoisture] = useState(70); // %
  const [isPlaying, setIsPlaying] = useState(true);

  const canvasRef = useRef(null);
  const animOffsetRef = useRef(0);
  const animationFrameRef = useRef(null);

  const handleReset = () => {
    setFront(FRONTS[0]);
    setTempContrast(15);
    setMoisture(70);
    setIsPlaying(true);
    animOffsetRef.current = 0;
  };

  // Canvas Atmospheric Cross-Section Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let disposed = false;

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const nextWidth = Math.max(1, Math.round(rect.width * dpr));
      const nextHeight = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth;
        canvas.height = nextHeight;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const w = rect.width;
      const h = rect.height;
      const groundY = h - 40;

      ctx.clearRect(0, 0, w, h);

      if (isPlaying) {
        animOffsetRef.current = (animOffsetRef.current + 1.5) % 100;
      }
      const offset = animOffsetRef.current;

      // 1. Sky & Ground
      ctx.fillStyle = "#0F172A";
      ctx.fillRect(0, 0, w, groundY);

      ctx.fillStyle = "#15803D"; // Ground
      ctx.fillRect(0, groundY, w, 40);

      // 2. Cold Air Mass (Blue) & Warm Air Mass (Red) Regions
      if (front.id === "cold") {
        // Cold air wedge pushing from Left to Right
        ctx.fillStyle = "rgba(59, 130, 246, 0.4)";
        ctx.beginPath();
        ctx.moveTo(0, 20);
        ctx.lineTo(w * 0.45, groundY);
        ctx.lineTo(0, groundY);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "rgba(239, 68, 68, 0.35)";
        ctx.beginPath();
        ctx.moveTo(w * 0.45, groundY);
        ctx.lineTo(0, 20);
        ctx.lineTo(w, 20);
        ctx.lineTo(w, groundY);
        ctx.closePath();
        ctx.fill();

        // Convective Clouds (Towering)
        ctx.fillStyle = "rgba(226, 232, 240, 0.7)";
        ctx.beginPath();
        ctx.arc(w * 0.35, groundY - 140, 45, 0, Math.PI * 2);
        ctx.arc(w * 0.45, groundY - 180, 55, 0, Math.PI * 2);
        ctx.arc(w * 0.52, groundY - 120, 40, 0, Math.PI * 2);
        ctx.fill();

        // Rain particles
        ctx.strokeStyle = "#38BDF8";
        ctx.lineWidth = 2;
        for (let i = 0; i < 20; i++) {
          const rx = w * 0.3 + (i * 12);
          const ry = groundY - 100 + ((offset * 3 + i * 20) % 100);
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx - 4, ry + 12);
          ctx.stroke();
        }

      } else if (front.id === "warm") {
        // Shallow slope warm air over cold air
        ctx.fillStyle = "rgba(59, 130, 246, 0.4)";
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(w, groundY - 120);
        ctx.lineTo(w, groundY);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "rgba(239, 68, 68, 0.35)";
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(w, groundY - 120);
        ctx.lineTo(w, 20);
        ctx.lineTo(0, 20);
        ctx.closePath();
        ctx.fill();

        // Nimbostratus Clouds along slope
        ctx.fillStyle = "rgba(226, 232, 240, 0.6)";
        ctx.beginPath();
        ctx.ellipse(w * 0.5, groundY - 80, 140, 25, 0, 0, Math.PI * 2);
        ctx.fill();

        // Light rain
        ctx.strokeStyle = "#38BDF8";
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 25; i++) {
          const rx = w * 0.2 + (i * 15);
          const ry = groundY - 60 + ((offset * 2 + i * 15) % 60);
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx - 2, ry + 8);
          ctx.stroke();
        }
      }

      // Air Mass Labels
      ctx.fillStyle = "#38BDF8";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText("Cold Air Mass", 30, groundY - 20);

      ctx.fillStyle = "#FCA5A5";
      ctx.fillText("Warm Air Mass", w - 120, 50);

      if (isPlaying && !disposed) {
        animationFrameRef.current = requestAnimationFrame(render);
      }
    };

    render();
    return () => {
      disposed = true;
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [front, isPlaying, tempContrast, moisture]);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Hero Section */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                Science / Meteorology
              </span>
              <span className="text-xs text-muted-foreground">Atmospheric Physics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-2">
              Weather Front Simulator
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              Simulate cold, warm, stationary, and occluded frontal boundaries, atmospheric lifting, and cloud condensation.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition shadow-md"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? "Pause Airflow" : "Animate Front"}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold border border-border bg-card hover:bg-surface-soft transition"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          </div>
        </div>

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Controls Panel (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <Sliders className="w-4 h-4" /> Air Mass Parameters
              </h2>

              {/* Front Type Select */}
              <div>
                <label className="text-xs font-semibold mb-1.5 block">Weather Front Type</label>
                <div className="space-y-1.5">
                  {FRONTS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFront(f)}
                      className={`w-full px-3 py-2 rounded-lg text-xs font-medium border text-left flex items-center justify-between transition ${
                        front.id === f.id ? "bg-primary text-white border-primary" : "border-border hover:bg-surface-soft"
                      }`}
                    >
                      <span>{f.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Temperature Contrast Slider */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Temperature Contrast ($\Delta T$)</span>
                  <span className="text-primary font-mono">{tempContrast} °C</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={tempContrast}
                  onChange={(e) => setTempContrast(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              {/* Relative Humidity / Moisture */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Air Moisture Content</span>
                  <span className="text-primary font-mono">{moisture}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={moisture}
                  onChange={(e) => setMoisture(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            </div>

            {/* Weather Forecast Telemetry Card */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-sm">
              <div className="border-b border-border pb-2">
                <h2 className="text-base font-bold text-foreground">{front.name}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{front.desc}</p>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Expected Weather:</div>
                  <div className="text-xs font-bold text-foreground mt-0.5">{front.weather}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Cloud Formations:</div>
                  <div className="text-xs font-bold text-primary mt-0.5">{front.clouds}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-soft border border-border">
                  <div className="text-muted-foreground">Barometric Pressure:</div>
                  <div className="text-xs font-mono text-foreground mt-0.5">{front.pressure}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Atmospheric Cross-Section Canvas (8 cols) */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            <div className="relative rounded-2xl border border-border bg-card overflow-hidden shadow-sm flex-1 min-h-[440px]">
              <canvas ref={canvasRef} className="w-full h-full block" />
              <div className="absolute top-3 left-4 text-xs font-mono bg-card/80 backdrop-blur border border-border px-3 py-1 rounded-lg text-primary font-bold">
                Frontal Incline & Atmospheric Condensation
              </div>
            </div>

            {/* Educational Notes */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-2 shadow-sm">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" /> Educational Principles: Frontal Lifting
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                When warm moist air is forced upwards along a frontal boundary, it expands and cools adiabatically. When the dew point is reached, water vapor condenses into clouds and precipitation.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
