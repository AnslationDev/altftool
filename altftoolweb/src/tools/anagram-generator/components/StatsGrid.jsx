"use client";

import React from "react";
import { motion } from "framer-motion";
import { Type, Layers, Sparkles, CopyCheck, Star, Flame, BarChart3, Clock } from "lucide-react";

export default function StatsGrid({
  charCount = 0,
  wordCount = 0,
  generatedCount = 0,
  copiedTotal = 0,
  favoritesCount = 0,
  combinationsEstimate = "0",
  lastGenerationMs = null,
}) {
  const STATS = [
    {
      label: "Characters",
      value: charCount,
      icon: Type,
      bg: "bg-teal-500/10 border-teal-500/30 text-teal-600 dark:text-teal-400",
      accent: "text-teal-600 dark:text-teal-400",
    },
    {
      label: "Words",
      value: wordCount,
      icon: Layers,
      bg: "bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400",
      accent: "text-indigo-600 dark:text-indigo-400",
    },
    {
      label: "Generated",
      value: generatedCount,
      icon: Sparkles,
      bg: "bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400",
      accent: "text-purple-600 dark:text-purple-400",
    },
    {
      label: "Copied Total",
      value: copiedTotal,
      icon: CopyCheck,
      bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
      accent: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Favorites Saved",
      value: favoritesCount,
      icon: Star,
      bg: "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400",
      accent: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Est. Permutations",
      value: combinationsEstimate,
      icon: Flame,
      bg: "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400",
      accent: "text-rose-600 dark:text-rose-400",
    },
  ];

  return (
    <div className="space-y-5 w-full">
      {/* Top Section Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-500 shrink-0">
            <BarChart3 size={18} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider">
              Live Workspace Statistics & Analytics
            </h3>
            <p className="text-xs text-muted-foreground">Real-time metrics for input text, generation count, and user actions.</p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-surface-soft border border-border/80 text-muted-foreground shrink-0">
          REALTIME
        </span>
      </div>

      {/* Prominent Statistics Grid (Neatly Contained Icons) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
        {STATS.map((stat, idx) => {
          const IconComponent = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.06 }}
              whileHover={{ y: -3, scale: 1.01 }}
              className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-muted-foreground truncate pr-1">
                  {stat.label}
                </span>
                <div className={`p-2.5 rounded-xl border ${stat.bg} shadow-sm shrink-0`}>
                  <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>

              <div>
                <p className={`text-2xl sm:text-3xl lg:text-4xl font-black font-mono tracking-tight ${stat.accent} break-all`}>
                  {stat.value}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* System Status Details */}
      <div className="p-4 rounded-2xl bg-surface-soft/80 border border-border/60 flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock size={14} className="text-indigo-500 shrink-0" />
          <span>
            Last Generation Time:{" "}
            <strong className="text-emerald-500 font-mono">
              {lastGenerationMs != null ? `${lastGenerationMs.toFixed(1)}ms` : "—"}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
}
