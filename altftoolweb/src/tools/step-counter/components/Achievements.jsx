"use client";

import {
  CalendarCheck2,
  Crown,
  Footprints,
  Lock,
  Medal,
  Trophy,
} from "lucide-react";
import { ACHIEVEMENTS, timeAgo } from "../utils/stepStore";
import { CARD, CARD_HOVER, SectionHeading } from "./ui.jsx";

const BADGE_ICONS = {
  "first-steps": Footprints,
  "5k-day": Medal,
  "10k-day": Trophy,
  "streak-7": Crown,
  "monthly-30": CalendarCheck2,
};

function BadgeIcon({ id, unlocked, size = "lg" }) {
  const Icon = BADGE_ICONS[id] || Trophy;
  const dimensions = size === "lg" ? "h-14 w-14" : "h-9 w-9";
  const iconSize = size === "lg" ? 24 : 16;

  if (unlocked) {
    return (
      <span
        className={`relative flex ${dimensions} shrink-0 items-center justify-center rounded-full text-white shadow-[0_6px_16px_color-mix(in_srgb,var(--primary)_30%,transparent)]`}
        style={{ background: "var(--anslation-ds-cta-gradient)" }}
      >
        <Icon size={iconSize} aria-hidden="true" />
        {/* medallion ring */}
        <span
          aria-hidden="true"
          className="absolute -inset-1 rounded-full border-2"
          style={{ borderColor: "color-mix(in srgb, var(--primary) 30%, transparent)" }}
        />
      </span>
    );
  }

  return (
    <span
      className={`flex ${dimensions} shrink-0 items-center justify-center rounded-full border border-(--border) bg-(--muted) text-(--muted-foreground)`}
    >
      <Icon size={iconSize} aria-hidden="true" />
    </span>
  );
}

export function RecentAchievements({ unlocked }) {
  return (
    <section aria-label="Recent achievements" className={`${CARD} flex flex-col p-4 sm:p-5`}>
      <SectionHeading
        eyebrow="Milestones"
        title="Recent Achievements"
        aside={
          <span className="rounded-full bg-(--muted) px-2.5 py-1 text-[11px] font-bold tabular-nums text-(--muted-foreground)">
            {unlocked.length}/{ACHIEVEMENTS.length} unlocked
          </span>
        }
      />

      {unlocked.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2.5 py-8 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-(--muted) text-(--muted-foreground)">
            <Trophy size={24} aria-hidden="true" />
          </span>
          <p className="text-sm font-bold text-(--foreground)">No achievements yet</p>
          <p className="max-w-[230px] text-xs leading-5 text-(--muted-foreground)">
            Start walking — your first badge unlocks at 1,000 total steps.
          </p>
        </div>
      ) : (
        <ol className="divide-y divide-(--border)">
          {unlocked.slice(0, 4).map((achievement) => (
            <li key={achievement.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <BadgeIcon id={achievement.id} unlocked size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-(--foreground)">
                  {achievement.name}
                </p>
                <p className="truncate text-xs text-(--muted-foreground)">
                  {achievement.description}
                </p>
              </div>
              <span className="shrink-0 text-[11px] font-medium text-(--muted-foreground)">
                {timeAgo(achievement.unlockedAt)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export function AchievementBadges({ achievements }) {
  const unlockedCount = ACHIEVEMENTS.filter((a) => achievements[a.id]).length;

  return (
    <section aria-label="All achievements">
      <SectionHeading
        eyebrow="Collection"
        title="Achievements"
        aside={
          <span className="text-xs font-semibold tabular-nums text-(--muted-foreground)">
            {unlockedCount} of {ACHIEVEMENTS.length} earned
          </span>
        }
      />
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {ACHIEVEMENTS.map((achievement) => {
          const unlocked = Boolean(achievements[achievement.id]);
          return (
            <li
              key={achievement.id}
              className={`${CARD} ${unlocked ? CARD_HOVER : ""} flex flex-col items-center p-4 pt-5 text-center`}
            >
              <BadgeIcon id={achievement.id} unlocked={unlocked} />
              <p
                className={`mt-3 text-sm font-bold ${unlocked ? "text-(--foreground)" : "text-(--muted-foreground)"}`}
              >
                {achievement.name}
              </p>
              <p className="mt-1 text-xs leading-5 text-(--muted-foreground)">
                {achievement.description}
              </p>
              {unlocked ? (
                <span
                  className="mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                  style={{
                    backgroundColor: "var(--anslation-ds-success-soft)",
                    color: "color-mix(in srgb, var(--anslation-ds-success) 72%, var(--foreground))",
                  }}
                >
                  Unlocked
                </span>
              ) : (
                <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-(--muted) px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-(--muted-foreground)">
                  <Lock size={10} aria-hidden="true" />
                  Locked
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
