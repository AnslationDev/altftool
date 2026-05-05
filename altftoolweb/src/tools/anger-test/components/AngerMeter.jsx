"use client";

import { Smile, Meh, Frown, Angry, FlameKindling } from "lucide-react";

const LEVELS = [
  { label: "Calm",     Icon: Smile,         color: "text-emerald-500", activeColor: "text-emerald-600" },
  { label: "Mild",     Icon: Meh,           color: "text-lime-500",    activeColor: "text-lime-600"    },
  { label: "Moderate", Icon: Frown,         color: "text-amber-500",   activeColor: "text-amber-600"   },
  { label: "High",     Icon: Angry,         color: "text-orange-500",  activeColor: "text-orange-600"  },
  { label: "Extreme",  Icon: FlameKindling, color: "text-red-500",     activeColor: "text-red-600"     },
];

const getActiveIndex = (pct) => {
  if (pct <= 20) return 0;
  if (pct <= 40) return 1;
  if (pct <= 60) return 2;
  if (pct <= 80) return 3;
  return 4;
};

const BAR_COLORS = [
  "bg-emerald-500",
  "bg-lime-500",
  "bg-amber-500",
  "bg-orange-500",
  "bg-red-500",
];

const AngerMeter = ({ score }) => {
  const maxScore    = 50;
  const percentage  = Math.round((score / maxScore) * 100);
  const activeIndex = getActiveIndex(percentage);

  return (
    <div className="bg-(--card) border-2 border-(--border) rounded-2xl p-6 mb-6 ">

      {/* Title */}
      <h3 className="subheading flex justify-center items-center gap-2 mb-4">Your Anger Level</h3>

      {/* Bar */}
      <div className="w-full bg-(--border) rounded-full h-4 overflow-hidden">
        <div
          className={`h-4 rounded-full transition-all duration-700 ${BAR_COLORS[activeIndex]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Percentage */}
      <p className="description text-sm text-center mt-3">
        {percentage}% intensity
      </p>

      {/* Level indicators */}
      <div className="flex justify-between mt-5">
        {LEVELS.map(({ label, Icon, color, activeColor }, i) => {
          const isActive = i === activeIndex;
          return (
            <div
              key={i}
              className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                isActive ? "scale-110" : "opacity-50"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center border-2 transition-colors duration-300  ${
                  isActive
                    ? `border-current ${activeColor} bg-(--background)`
                    : `border-(--border) ${color} bg-(--card)`
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 1.5} />
              </div>
              <span
                className={`font-secondary text-xs font-medium transition-colors duration-300 ${
                  isActive ? activeColor : "text-(--muted-foreground)"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default AngerMeter;