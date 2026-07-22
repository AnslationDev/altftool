"use client";

import {
  Trophy,
  Target,
  TrendingUp,
  Clock,
  Flame,
  CheckCircle2,
  XCircle,
  Download,
  FileText,
  RotateCcw,
  BarChart3,
  Star,
  AlertTriangle,
} from "lucide-react";
import { getPerformanceReport, formatTime, exportToCSV, exportToPDF } from "../utils/scoring";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import SafeResponsiveContainer from "@/components/charts/SafeResponsiveContainer";

function MetricCard({ icon: Icon, label, value, detail, tone = "default" }) {
  const toneClass =
    tone === "good"
      ? "bg-emerald-500/10 text-emerald-600"
      : tone === "warn"
        ? "bg-rose-500/10 text-rose-600"
        : tone === "watch"
          ? "bg-amber-500/10 text-amber-600"
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

const PIE_COLORS = ["#14B8A6", "#EF4444"];

export default function Results({ answers, onRestart, onReset }) {
  const report = getPerformanceReport(answers, "easy");

  const pieData = [
    { name: "Correct", value: report.correctCount },
    { name: "Incorrect", value: report.incorrectCount },
  ];

  const topicData = report.topicBreakdown.map((t) => ({
    name: t.topic.length > 10 ? t.topic.substring(0, 10) + "…" : t.topic,
    accuracy: t.accuracy,
    correct: t.correct,
    total: t.total,
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          icon={Trophy}
          label="Total Score"
          value={report.totalScore}
          detail={`${report.skillLevel.emoji} ${report.skillLevel.level}`}
          tone="good"
        />
        <MetricCard
          icon={Target}
          label="Accuracy"
          value={`${report.accuracy}%`}
          detail={`${report.correctCount} correct of ${report.correctCount + report.incorrectCount}`}
          tone={report.accuracy >= 70 ? "good" : report.accuracy >= 50 ? "watch" : "warn"}
        />
        <MetricCard
          icon={Clock}
          label="Avg Time"
          value={`${report.averageTime}s`}
          detail={`Total: ${formatTime(report.totalTime)}`}
        />
        <MetricCard
          icon={Flame}
          label="Best Streak"
          value={answers.reduce((best, a, i) => {
            let streak = 0;
            for (let j = i; j >= 0 && answers[j].correct; j--) streak++;
            return Math.max(best, streak);
          }, 0)}
          detail="Consecutive correct"
          tone="good"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Accuracy Pie Chart */}
        <SectionCard title="Accuracy Breakdown" icon={BarChart3}>
          <div className="flex items-center gap-6">
            <div className="h-48 w-48">
              <SafeResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                </PieChart>
              </SafeResponsiveContainer>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="text-sm text-[var(--foreground)]">Correct: {report.correctCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500" />
                <span className="text-sm text-[var(--foreground)]">Incorrect: {report.incorrectCount}</span>
              </div>
              <div className="rounded-lg bg-[var(--section-highlight)] p-3">
                <p className="text-xs font-semibold text-[var(--muted-foreground)]">Skill Level</p>
                <p className="text-lg font-extrabold text-[var(--foreground)]">
                  {report.skillLevel.emoji} {report.skillLevel.level}
                </p>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Topic Breakdown Chart */}
        {topicData.length > 0 && (
          <SectionCard title="Topic Performance" icon={TrendingUp}>
            <div className="h-64">
              <SafeResponsiveContainer width="100%" height="100%">
                <BarChart data={topicData} margin={{ left: 0, right: 0, top: 5, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                      fontSize: 12,
                    }}
                    formatter={(value) => [`${value}%`, "Accuracy"]}
                  />
                  <Bar dataKey="accuracy" radius={[4, 4, 0, 0]}>
                    {topicData.map((entry, i) => (
                      <Cell key={i} fill={entry.accuracy >= 70 ? "#14B8A6" : entry.accuracy >= 50 ? "#F59E0B" : "#EF4444"} />
                    ))}
                  </Bar>
                </BarChart>
              </SafeResponsiveContainer>
            </div>
          </SectionCard>
        )}
      </div>

      {/* Weak & Strong Topics */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Weak Areas" icon={AlertTriangle}>
          {report.weakTopics.length > 0 ? (
            <div className="space-y-2">
              {report.weakTopics.map((topic) => (
                <div key={topic} className="flex items-center justify-between rounded-lg border border-rose-500/20 bg-rose-500/5 p-3">
                  <span className="text-sm font-semibold text-[var(--foreground)]">{topic}</span>
                  <span className="text-sm font-bold text-rose-600">Needs Practice</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--muted-foreground)]">No weak areas identified. Great job!</p>
          )}
        </SectionCard>

        <SectionCard title="Strong Areas" icon={Star}>
          {report.strongTopics.length > 0 ? (
            <div className="space-y-2">
              {report.strongTopics.map((topic) => (
                <div key={topic} className="flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                  <span className="text-sm font-semibold text-[var(--foreground)]">{topic}</span>
                  <span className="text-sm font-bold text-emerald-600">Strong</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--muted-foreground)]">Keep practicing to build strong areas!</p>
          )}
        </SectionCard>
      </div>

      {/* Answer Review */}
      <SectionCard title="Answer Review" icon={CheckCircle2}>
        <div className="max-h-96 space-y-2 overflow-y-auto">
          {answers.map((a, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 rounded-lg border p-3 ${
                a.correct
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : "border-rose-500/20 bg-rose-500/5"
              }`}
            >
              {a.correct ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <XCircle className="h-4 w-4 shrink-0 text-rose-600" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[var(--foreground)]">{a.question}</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Your answer: {a.userAnswer} | Correct: {a.displayAnswer || a.answer}
                </p>
              </div>
              <span className="shrink-0 text-xs text-[var(--muted-foreground)]">{a.timeTaken?.toFixed(1)}s</span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onRestart}
          className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110"
        >
          <RotateCcw className="h-4 w-4" />
          Play Again
        </button>
        <button
          onClick={onReset}
          className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-6 py-3 text-sm font-bold text-[var(--foreground)] shadow-sm transition-all hover:bg-[var(--section-highlight)]"
        >
          New Setup
        </button>
        <button
          onClick={() => exportToCSV(answers, report)}
          className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-6 py-3 text-sm font-bold text-[var(--foreground)] shadow-sm transition-all hover:bg-[var(--section-highlight)]"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
        <button
          onClick={() => exportToPDF(report)}
          className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-6 py-3 text-sm font-bold text-[var(--foreground)] shadow-sm transition-all hover:bg-[var(--section-highlight)]"
        >
          <FileText className="h-4 w-4" />
          Export Report
        </button>
      </div>
    </div>
  );
}
