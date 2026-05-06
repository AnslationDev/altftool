"use client";

import { useMemo } from "react";
import { Flame, Brain, Timer, Shield, ActivitySquare } from "lucide-react";

const PATIENCE_QUESTIONS = [1, 4, 10];
const CONTROL_QUESTIONS  = [5, 8, 9];

const calcPct = (answers, questionIds, invert = false) => {
  const relevant = answers.filter((a) => questionIds.includes(a.questionId));
  if (!relevant.length) return 0;
  const total = relevant.reduce((s, a) => s + a.value, 0);
  const pct   = Math.round((total / (relevant.length * 5)) * 100);
  return invert ? 100 - pct : pct;
};

const METRICS = [
  { key: "anger",    label: "Anger",    Icon: Flame,  color: "text-red-500",    bar: "bg-red-500"    },
  { key: "stress",   label: "Stress",   Icon: Brain,  color: "text-orange-500", bar: "bg-orange-500" },
  { key: "patience", label: "Patience", Icon: Timer,  color: "text-blue-500",   bar: "bg-blue-500"   },
  { key: "control",  label: "Control",  Icon: Shield, color: "text-green-500",  bar: "bg-green-500"  },
];

export default function EmotionalBalanceScore({ score, stressCorrelation }) {
  const metrics = useMemo(() => {
    if (typeof window === "undefined") return null;

    try {
      const raw = localStorage.getItem("anger-answers");
      if (!raw) return null;
      const answers = JSON.parse(raw);
      if (!Array.isArray(answers)) return null;

      return {
        anger:    Math.min(Math.round((score / 50) * 100), 100),
        stress:   stressCorrelation ?? 0,
        patience: calcPct(answers, PATIENCE_QUESTIONS, true),
        control:  calcPct(answers, CONTROL_QUESTIONS,  true),
      };
    } catch {
      return null;
    }
  }, [score, stressCorrelation]);

  if (!metrics) return null;

  return (
    <div className="bg-(--card) rounded-2xl p-6 mb-6 border-2 border-(--border)">

      {/* Header */}
      <h3 className="subheading flex items-start gap-2 mb-4 leading-tight">
        <ActivitySquare size={22} className="text-(--primary) mt-0.5 shrink-0" />
        Emotional Balance Score
      </h3>

      {/* Metrics */}
      <div className="space-y-4">
        {METRICS.map(({ key, label, Icon, color, bar }) => {
          const value = metrics[key];
          return (
            <div key={key}>
              {/* Label + value */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Icon size={16} className={color} />
                  <span className="font-primary font-semibold text-(--foreground) text-sm">
                    {label}
                  </span>
                </div>
                <span className={`font-primary font-bold ${color}`}>
                  {value}%
                </span>
              </div>

              {/* Bar */}
              <div className="w-full h-2 bg-(--border) rounded-full">
                <div
                  className={`h-2 rounded-full ${bar}`}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
