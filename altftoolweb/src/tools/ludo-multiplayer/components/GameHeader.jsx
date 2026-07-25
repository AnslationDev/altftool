"use client";

import { motion } from "framer-motion";
import { Settings, BarChart3, Sparkles } from "lucide-react";

export default function GameHeader({
  mode,
  onToggleMode,
  onOpenSettings,
  onOpenStats,
  playerCount,
  onPlayerCountChange,
}) {
  const modes = [
    { key: "ai", label: "vs Computer", icon: "🤖" },
    { key: "pvp", label: "Local", icon: "👥" },
  ];

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-(--primary) to-(--secondary) flex items-center justify-center shadow-lg shadow-(--primary)/20">
            <span className="text-2xl">🎲</span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-(--primary) to-(--secondary) bg-clip-text text-transparent">
              Ludo Multiplayer
            </h1>
            <p className="text-xs sm:text-sm text-(--muted-foreground) flex items-center gap-1">
              <Sparkles size="13" className="text-(--secondary)" />
              Premium board game — challenge the AI or play with friends
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex items-center gap-2"
      >
        <div className="flex p-1 rounded-xl bg-(--card)/70 backdrop-blur border border-(--border) shadow-sm">
          {modes.map((m) => (
            <button
              key={m.key}
              onClick={() => onToggleMode(m.key)}
              aria-pressed={mode === m.key}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35 ${
                mode === m.key
                  ? "bg-(--primary) text-(--primary-foreground) shadow"
                  : "text-(--muted-foreground) hover:text-(--foreground)"
              }`}
            >
              <span>{m.icon}</span>
              {m.label}
            </button>
          ))}
        </div>

        {mode === "pvp" && (
          <div className="flex p-1 rounded-xl bg-(--card)/70 backdrop-blur border border-(--border) shadow-sm">
            {[2, 3, 4].map((n) => (
              <button
                key={n}
                onClick={() => onPlayerCountChange(n)}
                aria-label={`${n} players`}
                aria-pressed={playerCount === n}
                className={`w-8 py-1.5 rounded-lg text-xs font-bold transition focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35 ${
                  playerCount === n
                    ? "bg-(--secondary) text-(--foreground) shadow"
                    : "text-(--muted-foreground) hover:text-(--foreground)"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={onOpenSettings}
          aria-label="Open settings"
          className="p-2.5 min-w-11 min-h-11 inline-flex items-center justify-center rounded-xl bg-(--card)/70 backdrop-blur border border-(--border) text-(--muted-foreground) hover:text-(--foreground) hover:border-(--border-strong) transition shadow-sm active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"
          title="Settings"
        >
          <Settings size="18" />
        </button>
        <button
          onClick={onOpenStats}
          aria-label="Open statistics"
          className="p-2.5 min-w-11 min-h-11 inline-flex items-center justify-center rounded-xl bg-(--card)/70 backdrop-blur border border-(--border) text-(--muted-foreground) hover:text-(--foreground) hover:border-(--border-strong) transition shadow-sm active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"
          title="Statistics"
        >
          <BarChart3 size="18" />
        </button>
      </motion.div>
    </div>
  );
}
