"use client";

import {
  Trophy,
  Target,
  TrendingUp,
  Clock,
  Flame,
  CheckCircle2,
  XCircle,
  RotateCcw,
  BarChart3,
  AlertTriangle,
  Star,
  Download,
} from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
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

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
      <div className="flex items-center gap-2 border-b border-[var(--border)] px-6 py-4">
        {Icon && <Icon className="h-5 w-5 shrink-0 text-[var(--primary)]" />}
        <h3 className="text-base font-bold text-[var(--foreground)]">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

const PIE_COLORS = ["#14B8A6", "#EF4444"];

export default function Results({ answers, onRestart, onReset }) {
  const correct = answers.filter((a) => a.correct).length;
  const total = answers.length;
  const accuracy = total > 0 ? Math.round((correct / total) * 1000) / 10 : 0;
  const avgTime = total > 0 ? (answers.reduce((s, a) => s + (a.timeTaken || 0), 0) / total).toFixed(1) : "0.0";
  const totalTime = answers.reduce((s, a) => s + (a.timeTaken || 0), 0);
  const bestStreak = answers.reduce((best, _, i) => {
    let streak = 0;
    for (let j = i; j < total && answers[j].correct; j++) streak++;
    return Math.max(best, streak);
  }, 0);

  const pieData = [
    { name: "Correct", value: correct },
    { name: "Incorrect", value: total - correct },
  ];

  const topicStats = {};
  answers.forEach((a) => {
    const t = a.type || "mixed";
    if (!topicStats[t]) topicStats[t] = { correct: 0, total: 0 };
    topicStats[t].total++;
    if (a.correct) topicStats[t].correct++;
  });

  const topicData = Object.entries(topicStats).map(([topic, s]) => ({
    name: topic.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    accuracy: Math.round((s.correct / s.total) * 100),
    correct: s.correct,
    total: s.total,
  }));

  const weakTopics = topicData.filter((t) => t.accuracy < 70);
  const strongTopics = topicData.filter((t) => t.accuracy >= 80);

  const handleExportCSV = () => {
    const header = "Question,Your Answer,Correct Answer,Correct,Time (s),Type\n";
    const rows = answers
      .map(
        (a) =>
          `"${a.question}","${a.userAnswer}","${a.answer}",${a.correct ? "Yes" : "No"},${(a.timeTaken || 0).toFixed(1)},"${a.type}"`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const el = document.createElement("a");
    el.href = url;
    el.download = `percentage-practice-report-${Date.now()}.csv`;
    document.body.appendChild(el);
    el.click();
    el.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          icon={Trophy}
          label="Accuracy"
          value={`${accuracy}%`}
          detail={`${correct} of ${total} correct`}
          tone={accuracy >= 70 ? "good" : accuracy >= 50 ? "watch" : "warn"}
        />
        <MetricCard icon={Target} label="Correct" value={correct} detail={`${total - correct} incorrect`} tone="good" />
        <MetricCard icon={Clock} label="Avg Time" value={`${avgTime}s`} detail={`Total: ${(totalTime / 60).toFixed(1)} min`} />
        <MetricCard icon={Flame} label="Best Streak" value={bestStreak} detail="Consecutive correct" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Accuracy" icon={BarChart3}>
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
                <span className="text-sm text-[var(--foreground)]">Correct: {correct}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500" />
                <span className="text-sm text-[var(--foreground)]">Incorrect: {total - correct}</span>
              </div>
            </div>
          </div>
        </SectionCard>

        {topicData.length > 1 && (
          <SectionCard title="By Topic" icon={TrendingUp}>
            <div className="h-64">
              <SafeResponsiveContainer width="100%" height="100%">
                <BarChart data={topicData} margin={{ left: 0, right: 0, top: 5, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} interval={0} angle={-20} textAnchor="end" height={60} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)", fontSize: 12 }}
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

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Weak Areas" icon={AlertTriangle}>
          {weakTopics.length > 0 ? (
            <div className="space-y-2">
              {weakTopics.map((t) => (
                <div key={t.name} className="flex items-center justify-between rounded-lg border border-rose-500/20 bg-rose-500/5 p-3">
                  <span className="text-sm font-semibold text-[var(--foreground)]">{t.name}</span>
                  <span className="text-sm font-bold text-rose-600">{t.accuracy}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--muted-foreground)]">No weak areas. Great performance!</p>
          )}
        </SectionCard>

        <SectionCard title="Strong Areas" icon={Star}>
          {strongTopics.length > 0 ? (
            <div className="space-y-2">
              {strongTopics.map((t) => (
                <div key={t.name} className="flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                  <span className="text-sm font-semibold text-[var(--foreground)]">{t.name}</span>
                  <span className="text-sm font-bold text-emerald-600">{t.accuracy}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--muted-foreground)]">Keep practicing to build strong areas!</p>
          )}
        </SectionCard>
      </div>

      <SectionCard title="Answer Review" icon={CheckCircle2}>
        <div className="max-h-96 space-y-2 overflow-y-auto">
          {answers.map((a, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 rounded-lg border p-3 ${
                a.correct ? "border-emerald-500/20 bg-emerald-500/5" : "border-rose-500/20 bg-rose-500/5"
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
                  Your answer: {a.userAnswer} | Correct: {a.answer}{a.unit || ""}
                </p>
              </div>
              <span className="shrink-0 text-xs text-[var(--muted-foreground)]">{a.timeTaken?.toFixed(1)}s</span>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={onRestart}
          className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110"
        >
          <RotateCcw className="h-4 w-4" />
          Practice Again
        </button>
        <button
          onClick={onReset}
          className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-6 py-3 text-sm font-bold text-[var(--foreground)] shadow-sm transition-all hover:bg-[var(--section-highlight)]"
        >
          New Setup
        </button>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-6 py-3 text-sm font-bold text-[var(--foreground)] shadow-sm transition-all hover:bg-[var(--section-highlight)]"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>
    </div>
  );
}
