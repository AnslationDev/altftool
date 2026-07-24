// src/tools/attention-span-test/components/ResultsDashboard.jsx
"use client";

import React from 'react';
import {
  Brain, Zap, Target, AlertTriangle, Activity, ArrowUpRight, Check,
  Download, Share2, Shield, BookOpen, Award, CheckCircle2, RotateCcw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const ResultsDashboard = ({ results, onRetakeTest, onShareReport, onExportResults }) => {
  if (!results) return null;

  const {
    focusScore,
    avgRt,
    accuracyPct,
    impulsivityScore,
    hits,
    misses,
    falseAlarms,
    correctRejections,
    totalTrials,
    timelineData,
    heatmapData,
    aiInsightText,
  } = results;

  return (
    <section className="w-full mt-8 space-y-6 animate-fade-in">
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Focus Score */}
        <div className="cpt-glass-card p-5 flex items-center justify-between rounded-xl">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] block">Focus Score</span>
            <span className="text-3xl font-black text-[var(--primary)] block">{focusScore}</span>
            <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
              <ArrowUpRight className="h-3.5 w-3.5" /> High Performance
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-[var(--primary-soft)] border border-[var(--primary)]/30 flex items-center justify-center text-[var(--primary)] shrink-0">
            <Brain className="h-6 w-6" />
          </div>
        </div>

        {/* KPI 2: Avg Reaction Time */}
        <div className="cpt-glass-card p-5 flex items-center justify-between rounded-xl">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] block">Avg Reaction</span>
            <span className="text-3xl font-black text-[var(--foreground)] block">{avgRt}ms</span>
            <span className="text-[11px] font-bold text-[var(--muted-foreground)]">Response Latency</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] flex items-center justify-center text-[var(--foreground)] shrink-0">
            <Zap className="h-6 w-6" />
          </div>
        </div>

        {/* KPI 3: Accuracy */}
        <div className="cpt-glass-card p-5 flex items-center justify-between rounded-xl">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] block">Accuracy</span>
            <span className="text-3xl font-black text-emerald-500 block">{accuracyPct}%</span>
            <span className="text-[11px] font-bold text-emerald-500">{hits} Target Hits</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shrink-0">
            <Target className="h-6 w-6" />
          </div>
        </div>

        {/* KPI 4: False Alarms */}
        <div className="cpt-glass-card p-5 flex items-center justify-between rounded-xl">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] block">False Alarms</span>
            <span className="text-3xl font-black text-rose-500 block">{falseAlarms}</span>
            <span className="text-[11px] font-bold text-rose-500">{impulsivityScore}% Impulsivity</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 shrink-0">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* 📉 Performance Chart & 🟩 Response Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reaction Time Line Chart */}
        <div className="lg:col-span-2 cpt-glass-card p-6 space-y-4 rounded-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <h3 className="font-bold text-base text-[var(--foreground)] tracking-tight flex items-center gap-2">
              <Activity className="h-5 w-5 text-[var(--primary)]" />
              Trial Reaction Time Chart
            </h3>
            <span className="text-xs font-mono font-bold text-[var(--muted-foreground)]">
              {totalTrials} Trials Total
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <XAxis dataKey="trial" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" unit="ms" />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "12px", color: "var(--foreground)" }}
                  labelStyle={{ color: "var(--foreground)" }}
                />
                <Line type="monotone" dataKey="rt" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Response Heatmap Grid */}
        <div className="cpt-glass-card p-6 space-y-4 rounded-xl">
          <div className="pb-3 border-b border-[var(--border)]">
            <h3 className="font-bold text-base text-[var(--foreground)] tracking-tight">Response Heatmap</h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Sequential trial performance</p>
          </div>

          <div className="grid grid-cols-6 gap-2 max-h-52 overflow-y-auto cpt-scrollbar pr-1">
            {heatmapData.map((cell) => {
              let bgClass = "bg-emerald-500 text-white"; // Green for Correct
              if (cell.status === "slow") bgClass = "bg-orange-500 text-white"; // Orange for Slow
              if (cell.status === "missed" || cell.status === "false_alarm") bgClass = "bg-rose-500 text-white"; // Red for Error

              return (
                <div
                  key={cell.id}
                  className={`h-7 w-7 rounded-lg ${bgClass} font-bold hover:scale-110 transition-all flex items-center justify-center text-[10px] font-mono shadow-xs cursor-default`}
                  title={`Trial ${cell.id + 1}: ${cell.status} (${cell.rt || 0}ms)`}
                >
                  {cell.id + 1}
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[var(--border)] flex justify-between text-[11px] font-bold">
            <span className="text-emerald-500 flex items-center gap-1">● Correct (Green)</span>
            <span className="text-orange-500 flex items-center gap-1">● Slow (Orange)</span>
            <span className="text-rose-500 flex items-center gap-1">● Error (Red)</span>
          </div>
        </div>
      </div>

      {/* 🧠 AI Insight Panel & 📊 Comparison Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Insight Panel */}
        <div className="lg:col-span-2 cpt-glass-card p-6 space-y-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[var(--primary-soft)] border border-[var(--primary)]/30 flex items-center justify-center text-[var(--primary)]">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[var(--foreground)] tracking-tight">AI Cognitive Insights</h3>
              <span className="text-xs text-[var(--muted-foreground)]">Neural fatigue &amp; vigilance analysis</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] leading-relaxed text-sm text-[var(--foreground)]">
            {aiInsightText}
          </div>
        </div>

        {/* Population Comparison Card */}
        <div className="cpt-glass-card p-6 space-y-4 rounded-xl">
          <h3 className="font-bold text-base text-[var(--foreground)] tracking-tight">Population Benchmark</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-[var(--foreground)]">Your Score</span>
                <span className="text-[var(--primary)]">{focusScore}</span>
              </div>
              <div className="h-3 w-full bg-[var(--surface-soft)] rounded-full overflow-hidden border border-[var(--border)]">
                <div className="h-full bg-[var(--primary)] rounded-full" style={{ width: `${focusScore}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-[var(--muted-foreground)]">Population Average</span>
                <span className="text-[var(--muted-foreground)]">81</span>
              </div>
              <div className="h-3 w-full bg-[var(--surface-soft)] rounded-full overflow-hidden border border-[var(--border)]">
                <div className="h-full bg-[var(--muted-foreground)]/40 rounded-full" style={{ width: "81%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 💡 Recommendations Checklist */}
      <div className="cpt-glass-card p-6 space-y-4 rounded-xl">
        <h3 className="font-bold text-base text-[var(--foreground)] tracking-tight">Cognitive Optimization Checklist</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Sleep Well", desc: "Ensure 7-8 hours of restful sleep for peak focus." },
            { title: "Remove Distractions", desc: "Minimize ambient noise during focus sessions." },
            { title: "Practice Mindfulness", desc: "Short meditation boosts inhibitory control." },
            { title: "Repeat Weekly", desc: "Track longitudinal vigilance & fatigue trends." },
          ].map((rec, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs text-[var(--foreground)]">{rec.title}</h4>
                <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5 leading-normal">{rec.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info & Export CTA */}
      <div className="cpt-glass-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl">
        <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
          <Shield className="h-4 w-4 text-[var(--primary)]" />
          <span>Continuous Performance Test (CPT) · Local Browser Storage Privacy</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onRetakeTest}
            className="px-5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--foreground)] font-bold text-xs hover:bg-[var(--card)] transition-all flex items-center gap-1.5"
            type="button"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Retake Assessment</span>
          </button>

          <button
            onClick={onExportResults}
            className="px-5 py-2.5 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] font-bold text-xs uppercase tracking-wider shadow-md hover:scale-105 transition-all flex items-center gap-1.5"
            type="button"
          >
            <Download className="h-4 w-4" />
            <span>Export Results</span>
          </button>
        </div>
      </div>
    </section>
  );
};
