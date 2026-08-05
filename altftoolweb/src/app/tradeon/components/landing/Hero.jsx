// src/app/tradeon/components/landing/Hero.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BarChart3, ArrowUpRight } from "lucide-react";

// Helper component for count-up animation from 0
function AnimatedNumber({ target, suffix = "" }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2000; // 2 seconds animation
    const frameRate = 1000 / 60; // 60 FPS
    const totalFrames = Math.round(duration / frameRate);
    const increment = target / totalFrames;

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, frameRate);

    return () => clearInterval(timer);
  }, [target]);

  // Format with commas if target is large (e.g., 15000 -> 15,000)
  const formatted =
    target >= 1000
      ? Math.floor(count).toLocaleString()
      : count.toFixed(target % 1 !== 0 ? 1 : 0);

  return (
    <span>
      {formatted}
      {suffix}
    </span>
  );
}

export default function Hero() {
  const bgImageUrl =
    "https://img.pikbest.com/back_our/20220610/bg/7a548966f1ae8.png!sw800";

  const stats = [
    { target: 15000, suffix: "+", label: "Active Viewers" },
    { target: 120, suffix: "+", label: "Global Markets" },
    { target: 2, suffix: "M+", label: "Charts Explored" },
    { target: 99.9, suffix: "%", label: "Data Uptime" },
  ];

  return (
    <section className="relative w-full h-screen min-h-[700px] overflow-hidden flex items-center justify-center mt-0 pt-0 font-sans">
      {/* ── 1. Full-Width Background Image Layer ── */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-0"
        style={{
          backgroundImage: `url('${bgImageUrl}')`,
        }}
      />

      {/* ── 2. Dark Tint Overlay for High Contrast ── */}
      <div className="absolute inset-0 bg-[#0b1220]/75 z-0 pointer-events-none" />

      {/* Subtle Vertical Grid Lines Overlay */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none z-[1]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px)",
          backgroundSize: "64px 100%",
        }}
      />

      {/* Staggered entrance keyframe animations */}
      <style jsx>{`
        @keyframes heroFadeUp {
          0% {
            opacity: 0;
            transform: translateY(28px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-hero-1 {
          animation: heroFadeUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards;
          opacity: 0;
        }
        .animate-hero-2 {
          animation: heroFadeUp 1.4s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards;
          opacity: 0;
        }
        .animate-hero-3 {
          animation: heroFadeUp 1.6s cubic-bezier(0.16, 1, 0.3, 1) 0.5s forwards;
          opacity: 0;
        }
        .animate-hero-4 {
          animation: heroFadeUp 1.8s cubic-bezier(0.16, 1, 0.3, 1) 0.7s forwards;
          opacity: 0;
        }
        .animate-hero-5 {
          animation: heroFadeUp 2s cubic-bezier(0.16, 1, 0.3, 1) 0.9s forwards;
          opacity: 0;
        }
      `}</style>

      {/* ── 3. Centered Content Block ── */}
      <div className="tdn-container flex flex-col items-center text-center max-w-4xl mx-auto relative z-10 px-4 -translate-y-4 sm:-translate-y-6">
        {/* Live Badge with Continuous Pulsing Dot */}
        <div className="animate-hero-1">
          <span
            className="tdn-chip !py-2 !px-4.5 !text-xs mb-6 inline-flex items-center gap-2.5 border border-cyan-500/30 rounded-full backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-transform duration-300 hover:scale-105"
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.75)",
              color: "#ffffff",
            }}
          >
            {/* Live Indicator Dot with Pulse Aura */}
            <span className="relative flex h-2.5 w-2.5 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            </span>

            <span className="!text-white font-medium tracking-wide uppercase text-[11px]">
              Live Data · AI Market Insights
            </span>
          </span>
        </div>

        {/* Main Title */}
        <div className="animate-hero-2">
          <h1 className="tdn-display text-[2.5rem] sm:text-[3.5rem] lg:text-[4.1rem] leading-[1.15] font-extrabold tracking-tight !text-white drop-shadow-md">
            Explore live stocks & crypto insights on{" "}
            <span className="font-mono font-black tracking-wider uppercase bg-gradient-to-r from-teal-300 via-emerald-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_22px_rgba(52,211,153,0.65)] px-1">
              Tradeon
            </span>
          </h1>
        </div>

        {/* Subtitle / Description */}
        <div className="animate-hero-3">
          <p className="mt-5 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl font-medium !text-slate-200 drop-shadow">
            View instant market analytics, interactive multi-asset chart previews,
            and explainable AI predictions across stocks, crypto, and global indices.
          </p>
        </div>

        {/* Interactive Pill Buttons */}
        <div className="animate-hero-4 flex flex-wrap items-center justify-center gap-4 mt-8">
          <a
            href="#markets"
            className="tdn-btn !rounded-full !px-8 !py-3.5 text-sm font-medium border border-white/20 !text-white bg-white/10 backdrop-blur-md transition-all duration-300 hover:bg-white/20 hover:border-white/40 active:scale-95 flex items-center gap-2 shadow-lg"
          >
            <BarChart3 size={18} className="text-cyan-400" /> How it works
          </a>
          <Link
            href="/tradeon/workspace"
            className="group tdn-btn tdn-btn-primary !rounded-full !px-8 !py-3.5 text-sm font-semibold !text-white shadow-[0_0_25px_rgba(52,211,153,0.35)] transition-all duration-300 hover:shadow-[0_0_35px_rgba(52,211,153,0.55)] hover:scale-105 active:scale-95 flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 border border-emerald-400/30"
          >
            Explore Workspace
            <ArrowUpRight size={18} className="text-white transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* ── 4. Metrics & Counter Animations ── */}
        <div className="animate-hero-5 mt-12 w-full max-w-3xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 sm:p-5 rounded-2xl bg-slate-900/40 border border-slate-700/50 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.3)]">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center justify-center p-2 text-center"
              >
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-300 bg-clip-text text-transparent min-w-[80px]">
                  <AnimatedNumber target={stat.target} suffix={stat.suffix} />
                </span>
                <span className="mt-1 text-xs sm:text-xs font-medium text-slate-400 tracking-wide uppercase">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}