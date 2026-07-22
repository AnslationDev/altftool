"use client";

import { motion } from "framer-motion";
import { Trophy, CheckCircle2, Lock } from "lucide-react";
import { ACHIEVEMENTS } from "../utils/achievements";

export default function AchievementsSection({ unlockedIds = [] }) {
  const total = ACHIEVEMENTS.length;
  const unlockedCount = unlockedIds.length;
  const progressPct = Math.round((unlockedCount / total) * 100);

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--anslation-ds-warning-soft)] text-[var(--anslation-ds-warning)]">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--foreground)]">Achievements &amp; Badges</h2>
            <p className="text-xs text-[var(--muted-foreground)]">Unlock special badges as you flip coins</p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-[var(--muted)] px-3.5 py-1 border border-[var(--border)] text-xs font-bold text-[var(--foreground)]">
          <span>{unlockedCount} / {total} Unlocked</span>
          <span className="text-[var(--muted-foreground)]">({progressPct}%)</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)] border border-[var(--border)]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPct}%` }}
          className="h-full bg-[var(--primary)]"
        />
      </div>

      {/* Achievements Cards Grid */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ACHIEVEMENTS.map((ach) => {
          const isUnlocked = unlockedIds.includes(ach.id);
          return (
            <motion.div
              key={ach.id}
              whileHover={{ y: -2 }}
              className={`relative flex items-center gap-3.5 rounded-xl p-3.5 border transition ${
                isUnlocked
                  ? "bg-[var(--background)] border-[var(--primary)]/40 shadow-sm"
                  : "bg-[var(--muted)]/50 border-[var(--border)] opacity-60"
              }`}
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl shadow-inner ${
                  isUnlocked
                    ? "bg-[var(--anslation-ds-primary-soft)] border border-[var(--primary)]/40"
                    : "bg-[var(--background)] border border-[var(--border)] text-[var(--muted-foreground)]"
                }`}
              >
                {ach.icon}
              </div>

              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h3
                    className={`text-xs font-bold truncate ${
                      isUnlocked ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]"
                    }`}
                  >
                    {ach.title}
                  </h3>
                  {isUnlocked ? (
                    <CheckCircle2 className="h-4 w-4 text-[var(--anslation-ds-success)] shrink-0" />
                  ) : (
                    <Lock className="h-3.5 w-3.5 text-[var(--muted-foreground)] shrink-0" />
                  )}
                </div>
                <p className="mt-0.5 text-[11px] text-[var(--muted-foreground)] leading-snug line-clamp-2">
                  {ach.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
