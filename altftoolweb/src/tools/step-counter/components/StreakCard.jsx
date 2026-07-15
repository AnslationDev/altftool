"use client";

import { Check, Flame } from "lucide-react";
import { toneStyle } from "../utils/tones";
import { CARD } from "./ui.jsx";

const DAY_INITIALS = ["M", "T", "W", "T", "F", "S", "S"];

export default function StreakCard({ streak, week }) {
  let message = "Walk today to start a new streak.";
  if (streak >= 7) message = "Great job! Keep it up!";
  else if (streak > 0) message = "Nice pace — don't break the chain!";

  return (
    <section
      aria-label={`Streak: ${streak} ${streak === 1 ? "day" : "days"}`}
      className={`${CARD} p-4 sm:p-5`}
    >
      <div className="flex items-center gap-3">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-[10px]"
          style={toneStyle("warning")}
        >
          <Flame size={19} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-bold tracking-tight text-(--foreground)">Streak</h2>
          <p className="text-[22px] font-extrabold leading-tight tabular-nums text-(--foreground)">
            {streak} <span className="text-sm font-bold text-(--muted-foreground)">{streak === 1 ? "Day" : "Days"}</span>
          </p>
        </div>
      </div>

      <p className="mt-2 text-xs font-medium text-(--muted-foreground)">{message}</p>

      <ol
        className="mt-4 flex items-start justify-between gap-1 rounded-[10px] border border-(--border) bg-(--background) px-2.5 py-2.5"
        aria-label="This week's activity"
      >
        {week.map((day, index) => {
          const walked = day.steps > 0;
          let circle;
          if (walked) {
            circle = (
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full text-white shadow-[0_2px_8px_color-mix(in_srgb,var(--primary)_35%,transparent)]"
                style={{ background: "var(--anslation-ds-cta-gradient)" }}
              >
                <Check size={14} strokeWidth={3} aria-hidden="true" />
              </span>
            );
          } else if (day.isToday) {
            circle = (
              <span
                className="h-7 w-7 rounded-full border-2 border-dashed border-(--primary)"
                style={{ backgroundColor: "color-mix(in srgb, var(--primary) 8%, transparent)" }}
              />
            );
          } else {
            circle = (
              <span
                className={`h-7 w-7 rounded-full border border-(--border) bg-(--muted) ${day.isFuture ? "opacity-45" : ""}`}
              />
            );
          }

          return (
            <li key={day.key} className="flex flex-col items-center gap-1.5">
              <span
                className={`text-[10px] font-bold uppercase ${day.isToday ? "text-(--primary-hover) dark:text-(--primary)" : "text-(--muted-foreground)"}`}
                aria-hidden="true"
              >
                {DAY_INITIALS[index]}
              </span>
              {circle}
              <span className="sr-only">
                {day.label}: {walked ? `${day.steps} steps` : day.isFuture ? "upcoming" : "no steps"}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
