"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp, Flame, AlertTriangle, Zap,
  CloudRain, Smile, MinusCircle, Angry,
} from "lucide-react";

const cleanMood = (mood) =>
  mood?.replace(/[\u{1F000}-\u{1FFFF}]|[\u2600-\u27BF]/gu, "").trim();

const getMoodConfig = (mood) => {
  if (!mood || mood === "No data")
    return {
      color: "text-(--muted-foreground)",
      bg: "bg-(--background)",
      Icon: MinusCircle,
    };

  const lower = cleanMood(mood).toLowerCase();

  if (lower.includes("very angry") || lower.includes("very anger"))
    return { color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/20", Icon: Angry };

  if (lower.includes("angry") || lower.includes("high") || lower.includes("chronic"))
    return { color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/20", Icon: Flame };

  if (lower.includes("elevated") || lower.includes("reactive"))
    return { color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/20", Icon: AlertTriangle };

  if (lower.includes("moderate") || lower.includes("suppressed"))
    return { color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-950/20", Icon: Zap };

  if (lower.includes("low") || lower.includes("passive"))
    return { color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/20", Icon: CloudRain };

  return { color: "text-green-500", bg: "bg-green-50 dark:bg-green-950/20", Icon: Smile };
};

const barColor = (bar) => {
  if (bar >= 80) return "bg-red-500";
  if (bar >= 60) return "bg-orange-500";
  if (bar >= 40) return "bg-yellow-500";
  if (bar >= 20) return "bg-blue-500";
  return "bg-green-500";
};

const loadAngerTrend = () => {
  if (typeof window === "undefined") return [];

  try {
    const raw = JSON.parse(localStorage.getItem("anger-moods") || "{}");
    const moods = Object.fromEntries(
      Object.entries(raw).map(([date, val]) => [
        date,
        typeof val === "string" ? { level: val, score: null } : val,
      ])
    );

    const last7 = [];
    for (let i = 0; i <= 6; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key    = date.toISOString().split("T")[0];
      const entry  = moods[key];
      const rawMood = entry ? entry.level : "No data";
      const mood   = rawMood === "No data" ? rawMood : cleanMood(rawMood);
      const score  = entry?.score ?? null;
      const bar    = score !== null ? Math.min(Math.round((score / 50) * 100), 100) : 0;

      last7.push({
        day: i === 0 ? "Today" : i === 1 ? "Yesterday" : `${i} days ago`,
        date: key,
        mood,
        bar,
        hasRealScore: score !== null,
      });
    }

    return last7;
  } catch {
    return [];
  }
};

export default function ProgressDashboard() {
  const [trend] = useState(loadAngerTrend);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const hasData = trend.some((t) => t.mood !== "No data");

  return (
    <div className="bg-(--card) rounded-2xl p-6 mb-6 border-2 border-(--border)">

      {/* Header */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <h3 className="subheading flex items-start gap-2 leading-tight">
          <TrendingUp size={22} className="text-(--primary) mt-0 shrink-0" />
          Anger Trend (Last 7 Days)
        </h3>
        {hasData && (
<span className="text-xs px-3 py-1 rounded-full bg-(--primary)/10 text-(--primary) font-secondary font-medium w-fit self-start md:self-auto">
            {trend.filter((t) => t.mood !== "No data").length} entries
          </span>
        )}
      </div>

      {/* Trend List */}
      <div className="space-y-2">
        {trend.map((item, index) => {
          const { color, bg, Icon } = getMoodConfig(item.mood);
          const isNoData = item.mood === "No data";

          return (
            <div
              key={index}
              // ✅ Card always uses theme colors — color only on icon + bar
              className={`bg-(--background) border-2 border-(--border) rounded-xl overflow-hidden transition-all duration-300
                ${isNoData ? "opacity-50" : "hover:scale-[1.01] hover:shadow-md"}
              `}
              style={{
                opacity:    visible ? 1 : 0,
                transform:  visible ? "translateY(0)" : "translateY(10px)",
                transition: `opacity 0.3s ease ${index * 60}ms, transform 0.3s ease ${index * 60}ms`,
              }}
            >
              <div className="flex justify-between items-center p-3 px-4">
                <div className="flex items-center gap-3">
                  {/* ✅ Color only on icon bg */}
                  <div className={`p-1.5 rounded-lg ${!isNoData ? bg : "bg-(--card)"}`}>
                    <Icon size={16} className={color} />
                  </div>
                  <div className="text-left">
                    <p className="font-primary font-semibold text-(--foreground) text-sm">
                      {item.day}
                    </p>
                    <p className="description text-xs">{item.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`font-primary font-bold text-sm ${color}`}>
                    {item.mood}
                  </span>
                  {/* ✅ % badge uses theme bg, only text is colored */}
                  {!isNoData && item.hasRealScore && (
                    <span className={`font-secondary text-xs font-semibold px-2 py-0.5 rounded-full bg-(--card) border-(--border) border ${color}`}>
                      {item.bar}%
                    </span>
                  )}
                </div>
              </div>

              {/* ✅ Color only on bar */}
              {!isNoData && (
                <div className="h-1.5 w-full bg-(--border)">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-700 ${barColor(item.bar)}`}
                    style={{ width: `${item.bar}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {!hasData && (
        <div className="text-center py-6">
          <MinusCircle size={32} className="mx-auto mb-2 opacity-30 text-(--muted-foreground)" />
          <p className="description text-sm">
            Complete the assessment to start tracking your trend.
          </p>
        </div>
      )}

    </div>
  );
}
