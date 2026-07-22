"use client";

import { useMemo, useState } from "react";
import {
  BarChart2,
  Activity,
  Moon,
  Smile,
  Battery,
  Dumbbell,
} from "lucide-react";
import {
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import SafeResponsiveContainer from "@/components/charts/SafeResponsiveContainer";
import { calculateDailyScore } from "../utils/analytics";

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
        <h3 className="flex items-center gap-2 text-base font-bold text-[var(--foreground)]">
          {Icon && <Icon className="h-5 w-5 shrink-0 text-[var(--primary)]" />}
          {title}
        </h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function Charts({ checkIns }) {
  const [range, setRange] = useState(30);

  const chartData = useMemo(() => {
    const sorted = [...checkIns].sort((a, b) => a.date.localeCompare(b.date));
    return sorted.slice(-range).map((c) => ({
      date: c.date.slice(5),
      score: calculateDailyScore(c),
      sleep: c.sleepHours || 0,
      mood: (c.mood || 0) * 20,
      energy: (c.energyLevel || 0) * 20,
      exercise: Math.min(100, (c.exercise || 0) * 2.2),
    }));
  }, [checkIns, range]);

  const radarData = useMemo(() => {
    if (checkIns.length === 0) return [];
    const recent = checkIns.slice(0, 7);
    const avg = (id) => {
      const vals = recent.map((c) => c[id] || 0);
      return vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
    };

    return [
      { category: "Sleep", value: Math.min(100, (avg("sleepHours") / 9) * 100) },
      { category: "Mood", value: avg("mood") * 20 },
      { category: "Energy", value: avg("energyLevel") * 20 },
      { category: "Exercise", value: Math.min(100, (avg("exercise") / 60) * 100) },
      { category: "Study", value: Math.min(100, (avg("studyHours") / 8) * 100) },
      { category: "Meditation", value: Math.min(100, (avg("meditation") / 30) * 100) },
    ];
  }, [checkIns]);

  const weeklyBarData = useMemo(() => {
    const weeks = [];
    const sorted = [...checkIns].sort((a, b) => a.date.localeCompare(b.date));
    for (let i = 0; i < sorted.length; i += 7) {
      const chunk = sorted.slice(i, i + 7);
      const avgScore = Math.round(chunk.reduce((s, c) => s + calculateDailyScore(c), 0) / chunk.length);
      weeks.push({
        week: `W${Math.floor(i / 7) + 1}`,
        score: avgScore,
        date: chunk[0].date.slice(5),
      });
    }
    return weeks.slice(-12);
  }, [checkIns]);

  if (checkIns.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] p-12 text-center">
        <BarChart2 className="mb-4 h-12 w-12 text-[var(--muted-foreground)]" />
        <h3 className="text-lg font-bold text-[var(--foreground)]">No Charts Available</h3>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Complete at least one check-in to see visual analytics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end gap-2">
        {[7, 14, 30].map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              range === r
                ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                : "bg-[var(--section-highlight)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            {r} Days
          </button>
        ))}
      </div>

      <SectionCard title="Performance Timeline" icon={Activity}>
        <div className="h-64">
          <SafeResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "8px" }} />
              <Line type="monotone" dataKey="score" stroke="#14b8a6" strokeWidth={2} dot={{ r: 3 }} name="Score %" />
              <Line type="monotone" dataKey="mood" stroke="#8b5cf6" strokeWidth={1.5} dot={false} name="Mood" />
              <Line type="monotone" dataKey="energy" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="Energy" />
            </LineChart>
          </SafeResponsiveContainer>
        </div>
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Weekly Averages" icon={BarChart2}>
          <div className="h-64">
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyBarData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "8px" }} />
                <Bar dataKey="score" fill="#14b8a6" radius={[6, 6, 0, 0]} name="Avg Score %" />
              </BarChart>
            </SafeResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Habit Radar (7-Day Avg)" icon={Activity}>
          <div className="h-64">
            <SafeResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} />
                <Radar name="Score" dataKey="value" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </SafeResponsiveContainer>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
