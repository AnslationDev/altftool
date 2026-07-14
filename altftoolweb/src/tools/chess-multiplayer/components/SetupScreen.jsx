// components/SetupScreen.jsx
"use client";

import { motion } from "framer-motion";
import { Clock, Crown } from "lucide-react";

const TIME_CONTROLS = [
  { label: "Bullet", minutes: 1, sub: "1 min" },
  { label: "Blitz", minutes: 5, sub: "5 min" },
  { label: "Rapid", minutes: 10, sub: "10 min" },
  { label: "Classical", minutes: 30, sub: "30 min" },
  { label: "Unlimited", minutes: 0, sub: "no clock" },
];

export default function SetupScreen({ onStart }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-2xl"
    >
      <div className="rounded-2xl border border-(--border) bg-(--card) p-6 shadow-sm">
        <div className="mb-2 flex items-center gap-2 text-(--primary)">
          <Crown size={22} />
          <h2 className="text-lg font-semibold text-(--foreground)">
            New Match
          </h2>
        </div>
        <p className="mb-5 text-sm text-(--muted-foreground)">
          Pass-and-play locally on one device. Pick a time control, then take
          turns moving White and Black.
        </p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {TIME_CONTROLS.map((tc) => (
            <button
              key={tc.label}
              type="button"
              onClick={() => onStart(tc.minutes * 60)}
              className="group flex flex-col items-start gap-1 rounded-xl border border-(--border) bg-(--background) p-4 text-left transition-colors hover:border-(--primary) hover:bg-(--primary)/10 focus-visible:ring-2 focus-visible:ring-(--primary)"
            >
              <span className="flex items-center gap-1.5 text-sm font-semibold text-(--foreground)">
                <Clock size={15} className="text-(--primary)" />
                {tc.label}
              </span>
              <span className="text-xs text-(--muted-foreground)">{tc.sub}</span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
