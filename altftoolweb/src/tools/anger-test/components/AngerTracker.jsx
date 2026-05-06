"use client";

import { useState } from "react";
import { Smile, Meh, Frown, Angry, FlameKindling, Calendar, TrendingUp, Clock , MinusCircle } from "lucide-react";

// ─── Mood config with Lucide icons ───────────────────────────────────────────
const MOOD_CONFIG = [
  { label: "Calm",               Icon: Smile,         color: "text-emerald-500", bg: "bg-emerald-50",  num: 1 },
  { label: "Slightly Irritated", Icon: Meh,           color: "text-lime-500",    bg: "bg-lime-50",     num: 2 },
  { label: "Frustrated",         Icon: Frown,         color: "text-amber-500",   bg: "bg-amber-50",    num: 3 },
  { label: "Angry",              Icon: Angry,         color: "text-orange-500",  bg: "bg-orange-50",   num: 4 },
  { label: "Very Angry",         Icon: FlameKindling, color: "text-red-500",     bg: "bg-red-50",      num: 5 },
];

const moodFromScore = (score) => {
  if (score <= 15) return "Calm";
  if (score <= 25) return "Slightly Irritated";
  if (score <= 35) return "Frustrated";
  if (score <= 42) return "Angry";
  return "Very Angry";
};

const moodToNumber = (label) => {
  const found = MOOD_CONFIG.find((m) => label?.includes(m.label));
  return found?.num ?? 0;
};

const averageLabel = (avg) => {
  if (avg <= 1.5) return "Calm";
  if (avg <= 2.5) return "Slightly Irritated";
  if (avg <= 3.5) return "Frustrated";
  if (avg <= 4.5) return "Angry";
  return "Very Angry";
};

const emptyTrackerState = {
  todayMood: null,
  yesterdayMood: null,
  weeklyAverage: null,
};

const getDateKey = (daysOffset = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split("T")[0];
};

const getMoodLabel = (entry) => (
  typeof entry === "string" ? entry : entry?.level
);

const loadAngerTrackerState = () => {
  if (typeof window === "undefined") return emptyTrackerState;

  try {
    const moods = JSON.parse(localStorage.getItem("anger-moods") || "{}");
    const today = getDateKey();
    const yesterday = getDateKey(-1);
    const raw = localStorage.getItem("anger-score");
    let todayMood = getMoodLabel(moods[today]) || null;

    if (raw !== null) {
      const mood = moodFromScore(Number(raw));
      moods[today] = mood;
      localStorage.setItem("anger-moods", JSON.stringify(moods));
      todayMood = mood;
    }

    let total = 0;
    let count = 0;
    for (let i = 1; i <= 7; i++) {
      const label = getMoodLabel(moods[getDateKey(-i)]);
      if (label) {
        const num = moodToNumber(label);
        if (num > 0) {
          total += num;
          count++;
        }
      }
    }

    return {
      todayMood,
      yesterdayMood: getMoodLabel(moods[yesterday]) || null,
      weeklyAverage: count > 0 ? averageLabel(total / count) : null,
    };
  } catch {
    return emptyTrackerState;
  }
};

// ─── Mood display chip ────────────────────────────────────────────────────────
const MoodChip = ({ label }) => {
  if (!label) return <span className="text-(--muted-foreground) text-sm">—</span>;
  const config = MOOD_CONFIG.find((m) => label.includes(m.label)) || MOOD_CONFIG[0];
  const { Icon, color, bg } = config;
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full ${bg} ${color}`}>
      <Icon size={14} strokeWidth={2} />
      {config.label}
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AngerTracker() {
  const [{ todayMood, yesterdayMood, weeklyAverage }] = useState(
    loadAngerTrackerState,
  );

  const rows = [
    { label: "Today's Mood",      Icon: Calendar,   value: todayMood },
    { label: "Yesterday",         Icon: Clock,      value: yesterdayMood },
    { label: "Last Week Average", Icon: TrendingUp, value: weeklyAverage },
  ];

  return (
    <div className="rounded-2xl p-6 mb-6 border-2 border-(--border) bg-(--card) text-left">
      <h3 className="subheading flex items-center gap-2 mb-4">
        <Calendar size={22} className="text-(--primary)" />
        Daily Anger Tracker
      </h3>

      <div className="space-y-4">
        {rows.map(({ label, Icon, value }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="flex items-start sm:items-center gap-2 text-sm font-medium text-(--foreground)">
              <Icon size={15} className="text-(--muted-foreground) shrink-0" />
  <span className="leading-tight">
    {label}
  </span>
            </span>
            {value
              ? <MoodChip label={value} />
              : (
  <span className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full bg-gray-100 text-(--muted-foreground)">
    <MinusCircle size={12} />
    No data
  </span>
)
            }
          </div>
        ))}
      </div>
    </div>
  );
}
