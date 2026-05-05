"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

const TABS = ["Button", "Card", "Navbar", "Text"];

export default function GradientUIPreview({ color1, color2, angle }) {
  const [activeTab, setActiveTab] = useState("Button");

  const gradient = `linear-gradient(${angle}deg, ${color1}, ${color2})`;

  return (
    <div className="sm:m-8 p-4 border border-(--border) rounded-xl shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Real UI Preview</h3>
        <p className="text-sm text-(--foreground) mt-1">
          See your gradient applied on real UI components
        </p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition cursor-pointer ${
              activeTab === tab
                ? "bg-blue-600 text-white border-blue-600"
                : "border-(--border) hover:bg-(--card)"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Preview Area */}
      <div className="min-h-64 flex items-center justify-center p-8 rounded-xl bg-(--card) border border-(--border)">
        {activeTab === "Button" && <ButtonPreview gradient={gradient} />}
        {activeTab === "Card" && (
          <CardPreview gradient={gradient} color1={color1} color2={color2} />
        )}
        {activeTab === "Navbar" && <NavbarPreview gradient={gradient} />}
        {activeTab === "Text" && (
          <TextPreview color1={color1} color2={color2} angle={angle} />
        )}
      </div>
    </div>
  );
}

/* ── Button Preview ── */
function ButtonPreview({ gradient }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-xs text-(--foreground)">Primary button</p>

      {/* Filled */}
      <button
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: gradient,
          opacity: hovered ? 0.85 : 1,
          transition: "opacity 0.2s",
        }}
        className="px-8 py-3 rounded-xl text-white font-semibold text-base shadow-md cursor-pointer"
      >
        Get Started
      </button>

      {/* Outlined */}
      <button
        style={{
          borderImage: gradient + " 1",
          borderWidth: "2px",
          borderStyle: "solid",
        }}
        className="px-8 py-3 rounded-xl font-semibold text-base cursor-pointer"
      >
        Learn More
      </button>

      {/* Pill */}
      <button
        style={{ background: gradient }}
        className="px-10 py-2 rounded-full text-white font-medium text-sm cursor-pointer"
      >
        Subscribe →
      </button>

      <p className="text-xs text-(--foreground) text-center">
        Hover the first button to see interaction
      </p>
    </div>
  );
}

/* ── Card Preview ── */
function CardPreview({ gradient, color1, color2 }) {
  return (
    <div className="w-full max-w-sm space-y-4">
      {/* Hero Card */}
      <div
        style={{ background: gradient }}
        className="rounded-2xl p-6 text-white shadow-lg"
      >
        <p className="text-xs uppercase tracking-widest opacity-75 mb-1">
          Premium Plan
        </p>
        <h2 className="text-2xl font-bold mb-1">$29 / mo</h2>
        <p className="text-sm opacity-80 mb-4">
          Everything you need to grow fast.
        </p>
        <button className="bg-white text-gray-800 text-sm font-semibold px-5 py-2 rounded-lg cursor-pointer">
          Upgrade Now
        </button>
      </div>

      {/* Stat card with gradient accent */}
      <div className="rounded-xl border border-(--border) overflow-hidden bg-(--background)">
        <div style={{ background: gradient }} className="h-1 w-full" />
        <div className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-(--foreground)">Total Revenue</p>
            <p className="text-xl font-semibold mt-0.5">$128,430</p>
          </div>
          <div
            style={{ background: gradient }}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
          >
            ↑
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Navbar Preview ── */
function NavbarPreview({ gradient }) {
  return (
    <div className="w-full space-y-4">
      {/* Full gradient navbar */}
      <div
        style={{ background: gradient }}
        className="w-full rounded-xl px-6 py-3 flex items-center justify-between text-white shadow"
      >
        <span className="font-bold text-base tracking-tight">⬡ MyApp</span>
        <div className="hidden sm:flex gap-5 text-sm opacity-90">
          <span className="cursor-pointer">Home</span>
          <span className="cursor-pointer">Docs</span>
          <span className="cursor-pointer">Pricing</span>
        </div>
        <button className="hidden sm:block bg-white text-gray-800 text-xs font-semibold px-4 py-1.5 rounded-lg cursor-pointer">
          Sign In
        </button>
        <button className="sm:hidden text-white">
          <Menu size={20} />
        </button>
      </div>

      {/* White navbar with gradient underline */}
      <div className="w-full rounded-xl px-6 py-3 flex items-center justify-between border border-(--border) bg-(--background) shadow-sm">
        <span className="font-bold text-base">⬡ MyApp</span>
        <div className="hidden sm:flex gap-5 text-sm text-(--foreground)">
          <span className="cursor-pointer">Home</span>
          <span className="cursor-pointer">Docs</span>
          <span className="cursor-pointer">Pricing</span>
        </div>
        <button
          style={{ background: gradient }}
          className="hidden sm:block bg-white text-gray-800 text-xs font-semibold px-4 py-1.5 rounded-lg cursor-pointer"
        >
          Sign In
        </button>
        <button className="sm:hidden text-(--foreground)">
          <Menu size={20} />
        </button>
      </div>

      <p className="text-xs text-(--foreground) text-center">
        Top: full gradient · Bottom: gradient accent only
      </p>
    </div>
  );
}

/* ── Text Preview ── */
function TextPreview({ color1, color2, angle }) {
  const textGradientStyle = {
    backgroundImage: `linear-gradient(${angle}deg, ${color1}, ${color2})`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  };

  return (
    <div className="w-full space-y-6 text-center">
      <div>
        <p className="text-xs text-(--foreground) mb-2">Hero heading</p>
        <h1
          style={textGradientStyle}
          className="text-2xl sm:text-4xl font-bold"
        >
          Build Something Beautiful
        </h1>
      </div>

      <div>
        <p className="text-xs text-(--foreground) mb-2">Subheading</p>
        <h2
          style={textGradientStyle}
          className="text-xl sm:text-2xl font-semibold"
        >
          Design without limits
        </h2>
      </div>

      <div>
        <p className="text-xs text-(--foreground) mb-2">Badge / label</p>
        <span
          style={textGradientStyle}
          className="text-sm font-bold uppercase tracking-widest"
        >
          ✦ New Feature
        </span>
      </div>

      <div>
        <p className="text-xs text-(--foreground) mb-2">Display number</p>
        <span style={textGradientStyle} className="text-6xl font-black">
          99%
        </span>
      </div>
    </div>
  );
}
