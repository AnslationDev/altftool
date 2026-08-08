"use client";
import React, { useState, useRef, useEffect } from "react";
import { Sparkles, HelpCircle, RefreshCw, Compass } from "lucide-react";

const FUTURISTIC_JOBS = [
  { name: "Asteroid Mining Superintendent", desc: "Coordinates autonomous extraction drones on near-Earth asteroids.", sector: "Space" },
  { name: "Time Travel Ethics Consultant", desc: "Consults governments on temporal shifts and butterfly-effect mitigation.", sector: "Legal" },
  { name: "Vertical Ocean Farm Architect", desc: "Designs floating kelp and micro-organism towers to restore oceanic balance.", sector: "Climate" },
  { name: "Synaptic Memory Restorer", desc: "Safely updates and debugs digital brain backups for trans-humans.", sector: "Healthcare" },
  { name: "Quantum Security Warden", desc: "Maintains encryption shields against brute-force quantum cyber attacks.", sector: "Cybersecurity" },
];

export default function FunFeatures() {
  const [activeJob, setActiveJob] = useState(FUTURISTIC_JOBS[0]);
  const [spinning, setSpinning] = useState(false);
  const spinTimeoutRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(spinTimeoutRef.current);
  }, []);

  const handleSpin = () => {
    setSpinning(true);
    clearTimeout(spinTimeoutRef.current);
    spinTimeoutRef.current = setTimeout(() => {
      const idx = Math.floor(Math.random() * FUTURISTIC_JOBS.length);
      setActiveJob(FUTURISTIC_JOBS[idx]);
      setSpinning(false);
    }, 800);
  };

  return (
    <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-6">
      
      {/* Header */}
      <div className="border-b border-border pb-4">
        <h3 className="font-extrabold text-lg text-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" /> Alternate Reality Simulator: 2050
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Step outside conventional career paths and simulate your futuristic workspace alternate destiny.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-center">
        
        {/* Left: Spinner Visual */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 bg-secondary/30 border border-border rounded-xl text-center space-y-4">
          <div className={`p-4 bg-primary/10 rounded-full border border-primary/20 ${spinning ? "animate-spin" : ""}`}>
            <Compass className="w-12 h-12 text-primary" />
          </div>
          <button
            onClick={handleSpin}
            disabled={spinning}
            className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/95 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Spin Destiny Wheel
          </button>
        </div>

        {/* Right: Selected Futuristic Job Profile */}
        <div className="w-full md:w-1/2 space-y-3">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">
            2050 Career Match Profile
          </span>
          
          <h4 className="text-xl font-black text-foreground tracking-tight">
            {activeJob.name}
          </h4>
          
          <span className="inline-block px-2.5 py-0.5 bg-secondary text-foreground text-[10px] font-bold rounded-md uppercase tracking-wider">
            Sector: {activeJob.sector}
          </span>

          <p className="text-xs text-muted-foreground leading-relaxed pt-2 border-t border-border/60">
            {activeJob.desc}
          </p>
        </div>

      </div>

    </div>
  );
}
