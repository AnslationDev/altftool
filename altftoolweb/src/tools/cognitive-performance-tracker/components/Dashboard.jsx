"use client";

import {
  Activity,
  Target,
  Brain,
  Flame,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  CheckCircle2,
  Award,
  BarChart2,
  Clock,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import SafeResponsiveContainer from "@/components/charts/SafeResponsiveContainer";
import { calculateDailyScore } from "../utils/analytics";

function MetricCard({ icon: Icon, label, value, detail, tone = "default" }) {
  const toneClass =
    tone === "good"
      ? "bg-emerald-500/10 text-emerald-600"
      : tone === "warn"
        ? "bg-rose-500/10 text-rose-600"
        : "bg-[var(--section-highlight)] text-[var(--primary)]";

  return (
    <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
      <div className="flex min-w-0 items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="break-words text-xs font-semibold uppercase text-[var(--muted-foreground)]">{label}</p>
          <p className="mt-1 text-xl font-extrabold text-[var(--foreground)]">{value}</p>
          {detail && <p className="mt-1 break-words text-sm leading-5 text-[var(--muted-foreground)]">{detail}</p>}
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children, action }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
        <h3 className="flex items-center gap-2 text-base font-bold text-[var(--foreground)]">
          {Icon && <Icon className="h-5 w-5 shrink-0 text-[var(--primary)]" />}
          {title}
        </h3>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function Dashboard({ tracker }) {
  const { checkIns, streak, weeklyAvg, monthlyAvg, timelineData, todayScore, totalCheckIns, insights } = tracker;

  const trendIcon =
    insights.trend === "improving" ? TrendingUp : insights.trend === "declining" ? TrendingDown : Minus;
  const TrendIcon = trendIcon;
  const trendColor =
    insights.trend === "improving"
      ? "text-emerald-500"
      : insights.trend === "declining"
        ? "text-rose-500"
        : "text-[var(--muted-foreground)]";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={Activity}
          label="Today's Score"
          value={todayScore !== null ? `${todayScore}%` : "—"}
          detail={todayScore !== null ? "Daily performance" : "No check-in yet"}
          tone={todayScore !== null ? (todayScore >= 70 ? "good" : todayScore >= 50 ? "default" : "warn") : "default"}
        />
        <MetricCard
          icon={Flame}
          label="Streak"
          value={`${streak} days`}
          detail={streak >= 7 ? "Great consistency!" : "Keep going!"}
          tone={streak >= 7 ? "good" : streak >= 3 ? "default" : "warn"}
        />
        <MetricCard
          icon={BarChart2}
          label="Weekly Avg"
          value={`${weeklyAvg}%`}
          detail="Last 7 days"
          tone={weeklyAvg >= 70 ? "good" : weeklyAvg >= 50 ? "default" : "warn"}
        />
        <MetricCard
          icon={Calendar}
          label="Total Check-ins"
          value={totalCheckIns}
          detail={`Monthly avg: ${monthlyAvg}%`}
          tone="default"
        />
      </div>

      {timelineData.length > 0 && (
        <SectionCard
          title="Performance Timeline"
          icon={Activity}
          action={
            <span className={`flex items-center gap-1 text-sm font-bold ${trendColor}`}>
              <TrendIcon className="h-4 w-4" />
              {insights.trend}
            </span>
          }
        >
          <div className="h-64">
            <SafeResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickFormatter={(d) => d.slice(5)} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "8px" }} />
                <Area type="monotone" dataKey="score" stroke="#14b8a6" strokeWidth={2} fill="url(#scoreGradient)" name="Score %" />
              </AreaChart>
            </SafeResponsiveContainer>
          </div>
        </SectionCard>
      )}

      {timelineData.length > 1 && (
        <SectionCard title="Multi-Metric Trends" icon={Brain}>
          <div className="h-64">
            <SafeResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickFormatter={(d) => d.slice(5)} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "8px" }} />
                <Line type="monotone" dataKey="score" stroke="#14b8a6" strokeWidth={2} dot={false} name="Score" />
                <Line type="monotone" dataKey="mood" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Mood" />
                <Line type="monotone" dataKey="energy" stroke="#f59e0b" strokeWidth={2} dot={false} name="Energy" />
              </LineChart>
            </SafeResponsiveContainer>
          </div>
        </SectionCard>
      )}

      {insights.strengths.length > 0 && (
        <SectionCard title="Strengths & Tips" icon={CheckCircle2}>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="mb-3 text-sm font-bold text-emerald-600">Strengths</h4>
              <div className="space-y-2">
                {insights.strengths.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-600">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    {s}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-bold text-amber-600">Suggestions</h4>
              <div className="space-y-2">
                {[...insights.improvements, ...insights.tips].slice(0, 4).map((t, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-600">
                    <Target className="h-4 w-4 shrink-0" />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>
      )}

      {checkIns.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] p-12 text-center">
          <Activity className="mb-4 h-12 w-12 text-[var(--muted-foreground)]" />
          <h3 className="text-lg font-bold text-[var(--foreground)]">No Data Yet</h3>
          <p className="mt-2 max-w-md text-sm text-[var(--muted-foreground)]">
            Start tracking your cognitive performance by completing your first daily check-in.
          </p>
        </div>
      )}
    </div>
  );
}
