"use client";

import {
  Brain,
  Target,
  Clock,
  CheckCircle2,
  XCircle,
  BarChart2,
  Trophy,
  Activity,
  Repeat,
  Download,
  Printer,
  Copy,
  Share2,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import SafeResponsiveContainer from "@/components/charts/SafeResponsiveContainer";
import { safeCopyText } from "@/shared/utils/clipboard";

const CHART_COLORS = ["#14b8a6", "#22d3ee", "#8b5cf6", "#f59e0b", "#ef4444", "#10b981", "#6366f1"];

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

export default function ResultsReport({ results, onRestart, onLeaderboard }) {
  if (!results) return null;

  const categoryData = (results.categoryBreakdown || []).map((c) => ({
    name: c.category.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    accuracy: c.accuracy,
    correct: c.correct,
    total: c.total,
  }));

  const radarData = categoryData.map((c) => ({
    category: c.name.split(" ")[0],
    score: c.accuracy,
    fullMark: 100,
  }));

  const scoreColor =
    results.score >= 80
      ? "text-emerald-500"
      : results.score >= 60
        ? "text-amber-500"
        : "text-rose-500";

  const copySummary = () => {
    const lines = [
      `IQ Style Mini Quiz Results`,
      `Score: ${results.score}% (${results.correct}/${results.totalQuestions} correct)`,
      `Rating: ${results.rating.rating} (${results.rating.range})`,
      `Accuracy: ${results.accuracy}%`,
      `Avg Response: ${results.avgResponseTime}ms`,
      `Difficulty: ${results.difficultyLabel}`,
      `Total Time: ${results.totalTime}s`,
      ``,
      `Category Breakdown:`,
      ...results.categoryBreakdown.map(
        (c) => `  ${c.category}: ${c.correct}/${c.total} (${c.accuracy}%)`
      ),
      ``,
      `Note: This is not a clinical IQ test. Scores are estimates for entertainment purposes.`,
    ];
    safeCopyText(lines.join("\n"));
  };

  const shareText = () => {
    const text = `I scored ${results.score}% on the IQ Style Mini Quiz! My estimated rating: ${results.rating.rating}. Try it yourself!`;
    if (navigator.share) {
      navigator.share({ title: "IQ Style Mini Quiz", text });
    } else {
      safeCopyText(text);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col items-center rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-md">
        <div className={`mb-4 flex h-20 w-20 items-center justify-center rounded-full ${
          results.rating.tone === "good"
            ? "bg-emerald-500/10 text-emerald-500"
            : results.rating.tone === "warn"
              ? "bg-rose-500/10 text-rose-500"
              : "bg-blue-500/10 text-blue-500"
        }`}>
          <Brain className="h-10 w-10" />
        </div>
        <h2 className="text-3xl font-extrabold text-[var(--foreground)]">
          <span className={scoreColor}>{results.score}%</span> Score
        </h2>
        <p className="mt-2 text-lg font-semibold text-[var(--muted-foreground)]">
          Estimated Rating: {results.rating.rating}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Estimated Cognitive Range: {results.rating.range}
        </p>
        <p className="mt-4 max-w-lg rounded-xl bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400">
          This is not a clinically validated IQ test. Scores are estimates based on quiz performance for entertainment and learning purposes.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={onRestart} className="btn-primary rounded-xl px-6 py-3 text-sm">
            <Repeat className="h-4 w-4" />
            Retake Quiz
          </button>
          <button onClick={onLeaderboard} className="btn-secondary rounded-xl px-6 py-3 text-sm">
            <Trophy className="h-4 w-4" />
            Leaderboard
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={CheckCircle2}
          label="Correct"
          value={results.correct}
          detail={`${results.totalQuestions} total questions`}
          tone="good"
        />
        <MetricCard
          icon={XCircle}
          label="Wrong"
          value={results.wrong}
          detail={results.wrong === 0 ? "Perfect!" : `${results.wrong} incorrect`}
          tone={results.wrong === 0 ? "good" : results.wrong > 3 ? "warn" : "default"}
        />
        <MetricCard
          icon={Target}
          label="Accuracy"
          value={`${results.accuracy}%`}
          detail={`Answered ${results.answeredCount}/${results.totalQuestions}`}
          tone={results.accuracy >= 80 ? "good" : results.accuracy < 60 ? "warn" : "default"}
        />
        <MetricCard
          icon={Clock}
          label="Avg Response"
          value={`${results.avgResponseTime}ms`}
          detail={`Total: ${results.totalTime}s`}
          tone={results.avgResponseTime < 8000 ? "good" : results.avgResponseTime > 15000 ? "warn" : "default"}
        />
      </div>

      {categoryData.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard title="Category Performance" icon={BarChart2}>
            <div className="h-64">
              <SafeResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    interval={0}
                    angle={-30}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "8px" }} />
                  <Bar dataKey="accuracy" radius={[6, 6, 0, 0]} name="Accuracy %">
                    {categoryData.map((_, i) => (
                      <Cell key={`cell-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </SafeResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard title="Cognitive Profile" icon={Activity}>
            <div className="h-64">
              <SafeResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="category" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#14b8a6"
                    fill="#14b8a6"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </RadarChart>
              </SafeResponsiveContainer>
            </div>
          </SectionCard>
        </div>
      )}

      <SectionCard title="Category Breakdown" icon={BarChart2}>
        <div className="space-y-3">
          {results.categoryBreakdown.map((cat) => (
            <div key={cat.category} className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--section-highlight)] p-4">
              <div>
                <p className="text-sm font-bold capitalize text-[var(--foreground)]">
                  {cat.category.replace(/-/g, " ")}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {cat.correct}/{cat.total} correct | Avg {cat.avgTime}ms
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-24 overflow-hidden rounded-full bg-[var(--border)]">
                  <div
                    className={`h-full rounded-full ${
                      cat.accuracy >= 80 ? "bg-emerald-500" : cat.accuracy >= 50 ? "bg-amber-500" : "bg-rose-500"
                    }`}
                    style={{ width: `${cat.accuracy}%` }}
                  />
                </div>
                <span className="min-w-[3rem] text-right text-sm font-bold text-[var(--foreground)]">
                  {cat.accuracy}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Strengths & Improvements" icon={Target}>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h4 className="mb-3 text-sm font-bold text-emerald-600">Strength Areas</h4>
            <div className="space-y-2">
              {results.categoryBreakdown
                .filter((c) => c.accuracy >= 80)
                .map((c) => (
                  <div key={c.category} className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-600">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span className="capitalize">{c.category.replace(/-/g, " ")}</span>
                    <span className="ml-auto font-bold">{c.accuracy}%</span>
                  </div>
                ))}
              {results.categoryBreakdown.filter((c) => c.accuracy >= 80).length === 0 && (
                <p className="text-sm text-[var(--muted-foreground)]">Keep practicing to build strengths!</p>
              )}
            </div>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-bold text-amber-600">Areas to Improve</h4>
            <div className="space-y-2">
              {results.categoryBreakdown
                .filter((c) => c.accuracy < 80)
                .map((c) => (
                  <div key={c.category} className="flex items-center gap-2 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-600">
                    <Target className="h-4 w-4 shrink-0" />
                    <span className="capitalize">{c.category.replace(/-/g, " ")}</span>
                    <span className="ml-auto font-bold">{c.accuracy}%</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </SectionCard>

      <div className="flex flex-wrap gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
        <span className="text-sm font-bold text-[var(--foreground)]">Export:</span>
        <button onClick={copySummary} className="btn-secondary rounded-lg px-4 py-2 text-xs">
          <Copy className="h-3.5 w-3.5" /> Copy Summary
        </button>
        <button onClick={() => window.print()} className="btn-secondary rounded-lg px-4 py-2 text-xs">
          <Printer className="h-3.5 w-3.5" /> Print
        </button>
        <button onClick={shareText} className="btn-secondary rounded-lg px-4 py-2 text-xs">
          <Share2 className="h-3.5 w-3.5" /> Share
        </button>
      </div>
    </div>
  );
}
