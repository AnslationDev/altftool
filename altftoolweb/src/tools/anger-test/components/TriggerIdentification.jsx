"use client";

import { Target } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Car,
  Briefcase,
  MessageSquareX,
  Clock,
  AlertCircle,
  Users,
  HeartCrack,
  Zap,
  Trophy,
} from "lucide-react";

const TRIGGER_MAP = [
  {
    id: "traffic",
    label: "Traffic & Driving",
    questionIds: [1, 10],
    Icon: Car,
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-950/20",
    border: "border-red-200 dark:border-red-800",
    bar: "bg-red-500",
  },
  {
    id: "work",
    label: "Work Pressure",
    questionIds: [2],
    Icon: Briefcase,
    color: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-950/20",
    border: "border-orange-200 dark:border-orange-800",
    bar: "bg-orange-500",
  },
  {
    id: "criticism",
    label: "Criticism & Feedback",
    questionIds: [3],
    Icon: MessageSquareX,
    color: "text-yellow-500",
    bg: "bg-yellow-50 dark:bg-yellow-950/20",
    border: "border-yellow-200 dark:border-yellow-800",
    bar: "bg-yellow-500",
  },
  {
    id: "waiting",
    label: "Delays & Waiting",
    questionIds: [4],
    Icon: Clock,
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-950/20",
    border: "border-purple-200 dark:border-purple-800",
    bar: "bg-purple-500",
  },
  {
    id: "unexpected",
    label: "Unexpected Problems",
    questionIds: [5],
    Icon: AlertCircle,
    color: "text-pink-500",
    bg: "bg-pink-50 dark:bg-pink-950/20",
    border: "border-pink-200 dark:border-pink-800",
    bar: "bg-pink-500",
  },
  {
    id: "relationships",
    label: "Relationship Conflicts",
    questionIds: [6],
    Icon: Users,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/20",
    border: "border-blue-200 dark:border-blue-800",
    bar: "bg-blue-500",
  },
  {
    id: "trust",
    label: "Broken Trust & Promises",
    questionIds: [7],
    Icon: HeartCrack,
    color: "text-rose-500",
    bg: "bg-rose-50 dark:bg-rose-950/20",
    border: "border-rose-200 dark:border-rose-800",
    bar: "bg-rose-500",
  },
  {
    id: "impulse",
    label: "Impulse & Physical Anger",
    questionIds: [8],
    Icon: Zap,
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/20",
    border: "border-amber-200 dark:border-amber-800",
    bar: "bg-amber-500",
  },
];

const rankLabel = (rank) => {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `#${rank}`;
};

const intensityLabel = (pct) => {
  if (pct >= 80) return "Severe";
  if (pct >= 60) return "High";
  if (pct >= 40) return "Moderate";
  if (pct >= 20) return "Mild";
  return "Low";
};

const loadTriggerScores = () => {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem("anger-answers");
    if (!raw) return [];

    const answers = JSON.parse(raw);
    if (!Array.isArray(answers)) return [];

    return TRIGGER_MAP.map((trigger) => {
      const relevant = answers.filter((a) =>
        trigger.questionIds.includes(a.questionId),
      );
      const total = relevant.reduce((sum, a) => sum + a.value, 0);
      const pct = Math.min(
        Math.round((total / (trigger.questionIds.length * 5)) * 100),
        100,
      );
      return { ...trigger, pct };
    }).sort((a, b) => b.pct - a.pct);
  } catch {
    return [];
  }
};

export default function TriggerIdentification() {
  const [triggers] = useState(loadTriggerScores);
  const [visible, setVisible] = useState(false);
  const hasData = triggers.length > 0;

  useEffect(() => {
    if (!hasData) return;

    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, [hasData]);

  if (!hasData) return null;

  const topTriggers = triggers.filter((t) => t.pct >= 40);

  return (
    <div className="bg-(--card) rounded-2xl p-6 mb-6 border-2 border-(--border)">
      {/* Header */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <h3 className="subheading flex items-center gap-2">
          <Target size={22} className="text-(--primary)" />
          Trigger Identification
        </h3>
        <span className="text-xs px-3 py-1 rounded-full bg-(--primary)/10 text-(--primary) font-secondary font-medium w-fit">
          {topTriggers.length} active triggers
        </span>
      </div>
      <p className="description text-sm mb-6">
        Based on your answers, here are the situations that trigger your anger
        the most.
      </p>

      {/* Top Triggers Highlight */}
      {topTriggers.length > 0 && (
        <div className="bg-(--background) rounded-xl p-4 mb-6 border-2 border-(--border)">
          <h4 className="subheading text-base flex items-start gap-2 mb-3">
            <Trophy size={16} className="text-(--primary) mt-1" />
            Your Top Anger Triggers
          </h4>
          <div className="space-y-2">
            {topTriggers.slice(0, 3).map((t, i) => (
              // Replace
              <div key={t.id} className="flex items-center gap-2">
                <span className="text-sm shrink-0">{rankLabel(i + 1)}</span>
                <t.Icon size={13} className={`${t.color} shrink-0`} />
                <span className="font-primary font-semibold text-(--foreground) text-xs sm:text-sm w-0 flex-1">
                  {t.label}
                </span>
                <span
                  className={`text-xs font-secondary font-bold shrink-0 ${t.color}`}
                >
                  {intensityLabel(t.pct)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full List */}
      <div className="space-y-3">
        {triggers.map((trigger, index) => {
          const { label, Icon, color, bg, bar, pct } = trigger;

          return (
            <div
              key={trigger.id}
              // ✅ Card always uses theme colors — no colored bg
              className="bg-(--background) border-2 border-(--border) rounded-xl p-4 transition-all duration-300"
              style={{
                opacity: visible ? (pct >= 40 ? 1 : 0.4) : 0,
                transform: visible ? "translateY(0)" : "translateY(10px)",
                transition: `opacity 0.3s ease ${index * 60}ms, transform 0.3s ease ${index * 60}ms`,
              }}
            >
              {/* // ✅ Replace with */}
              <div className="flex flex-col md:flex-row gap-2 md:items-center md:justify-between mb-2">
                {/* Left: Icon + Label */}
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg shrink-0 ${bg}`}>
                    <Icon size={14} className={color} />
                  </div>
                  <span className="font-primary font-semibold text-(--foreground) text-sm">
                    {label}
                  </span>
                </div>

                {/* Right: Intensity + % */}
                <div className="flex items-center justify-between md:justify-end gap-2">
                  <span className={`font-secondary text-xs font-bold ${color}`}>
                    {intensityLabel(pct)}
                  </span>
                  <span
                    className={`font-secondary text-xs font-semibold px-2 py-0.5 rounded-full ${color} border-(--border) bg-(--card)`}
                  >
                    {pct}%
                  </span>
                </div>
              </div>

              {/* ✅ Color only on bar */}
              <div className="w-full h-1.5 bg-(--border) rounded-full mt-2">
                <div
                  className={`h-1.5 rounded-full transition-all duration-700 ${bar}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* No strong triggers */}
      {topTriggers.length === 0 && (
        <div className="text-center py-4">
          <Trophy
            size={28}
            className="mx-auto mb-2 opacity-30 text-(--muted-foreground)"
          />
          <p className="description text-sm">
            No strong triggers detected. You handle most situations very well!
            🎉
          </p>
        </div>
      )}
    </div>
  );
}
