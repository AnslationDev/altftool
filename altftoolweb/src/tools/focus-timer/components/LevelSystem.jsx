"use client"

import { useState } from "react";
import {
  Trophy,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Lock,
} from "lucide-react";

const LEVELS = [
  { level: 1, minSessions: 0, title: "Beginner" },
  { level: 2, minSessions: 5, title: "Focused" },
  { level: 3, minSessions: 10, title: "Consistent" },
  { level: 4, minSessions: 20, title: "Productive" },
  { level: 5, minSessions: 35, title: "Deep Worker" },
  { level: 6, minSessions: 50, title: "Flow Seeker" },
  { level: 7, minSessions: 70, title: "Time Master" },
  { level: 8, minSessions: 100, title: "Iron Mind" },
  { level: 9, minSessions: 150, title: "Elite" },
  { level: 10, minSessions: 200, title: "Focus Master" },
];

function getCurrentLevel(totalSessions) {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (totalSessions >= lvl.minSessions) current = lvl;
  }
  return current;
}

function getNextLevel(totalSessions) {
  return LEVELS.find((lvl) => lvl.minSessions > totalSessions) || null;
}

export default function LevelSystem({ totalSessions = 0 }) {
  const [expanded, setExpanded] = useState(false);

  const currentLevel = getCurrentLevel(totalSessions);
  const nextLevel = getNextLevel(totalSessions);

  const progressPercent = nextLevel
    ? Math.round(
        ((totalSessions - currentLevel.minSessions) /
          (nextLevel.minSessions - currentLevel.minSessions)) *
          100,
      )
    : 100;

  return (
    <div className="bg-(--background) border border-(--border) rounded-xl mb-4 overflow-hidden">
      {/* MAIN CARD — always visible */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer"
        onClick={() => setExpanded((prev) => !prev)}
      >
        {/* Icon */}

        {/* Level info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-lg bg-(--muted) shrink-0">
              <Trophy size={16} className="text-(--primary)" />
            </div>
            <p className="text-sm font-bold font-primary text-(--foreground)">
              Level {currentLevel.level} — {currentLevel.title}
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-(--muted) rounded-full h-1.5 overflow-hidden">
            <div
              className="h-1.5 rounded-full bg-(--primary) transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Progress text */}
          <p className="text-xs text-(--muted-foreground) font-secondary mt-1">
            {nextLevel
              ? `${totalSessions} / ${nextLevel.minSessions} sessions → ${nextLevel.title}`
              : "Max level reached! 🏆"}
          </p>
        </div>

        {/* Chevron */}
        <div className="shrink-0 text-(--muted-foreground)">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* EXPANDED — all levels */}
      {expanded && (
        <div className="border-t border-(--border) px-4 py-3 flex flex-col gap-2">
          {LEVELS.map((lvl) => {
            const isCompleted = totalSessions >= lvl.minSessions;
            const isCurrent = lvl.level === currentLevel.level;

            return (
              <div
                key={lvl.level}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all
                  ${
                    isCurrent
                      ? "bg-(--primary) border-(--primary)"
                      : isCompleted
                        ? "bg-(--muted) border-(--border)"
                        : "bg-transparent border-(--border) opacity-40"
                  }`}
              >
                {/* Status icon */}

                {/* Level details */}
                <div className="flex-1">
                  <div className=" flex flex-row gap-1.5">
                    {" "}
                    {isCompleted ? (
                      <CheckCircle2
                        size={16}
                        className={
                          isCurrent
                            ? "text-white shrink-0"
                            : "text-green-500 shrink-0 mt-0.5"
                        }
                      />
                    ) : (
                      <Lock
                        size={16}
                        className="text-(--muted-foreground) shrink-0"
                      />
                    )}
                    <p
                      className={`text-sm font-bold font-primary
                    ${isCurrent ? "text-white" : isCompleted ? "text-(--foreground)" : "text-(--muted-foreground)"}`}
                    >
                      Level {lvl.level} — {lvl.title}
                    </p>{" "}
                  </div>
                  <p
                    className={`text-xs font-secondary
                    ${isCurrent ? "text-white/70" : "text-(--muted-foreground)"}`}
                  >
                    {lvl.minSessions} sessions required
                  </p>
                </div>

                {/* Current badge */}
                {isCurrent && (
                  <span className="text-xs font-primary font-bold text-white/80 border border-white/30 px-2 py-0.5 rounded-full shrink-0">
                    Current
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
