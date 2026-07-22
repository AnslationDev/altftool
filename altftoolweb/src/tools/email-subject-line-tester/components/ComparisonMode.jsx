"use client";

import { useState } from "react";
import { Trophy } from "lucide-react";
import Card from "./ui/Card";
import { useSubjectAnalysis } from "../lib/useSubjectAnalysis";
import { TONE_CLASSES, toneForGrade } from "../lib/uiTone";
import { METRIC_CARDS } from "../lib/metricsConfig";

function pickWinner(a, b) {
  if (!a.subject && !b.subject) return null;
  if (!a.subject) return "b";
  if (!b.subject) return "a";
  if (a.scores.overall === b.scores.overall) {
    if (a.scores.clickability === b.scores.clickability) return "tie";
    return a.scores.clickability > b.scores.clickability ? "a" : "b";
  }
  return a.scores.overall > b.scores.overall ? "a" : "b";
}

export default function ComparisonMode() {
  const [subjectA, setSubjectA] = useState("");
  const [subjectB, setSubjectB] = useState("");
  const { analysis: analysisA } = useSubjectAnalysis(subjectA);
  const { analysis: analysisB } = useSubjectAnalysis(subjectB);

  const winner = pickWinner(analysisA, analysisB);
  const scoreMetrics = METRIC_CARDS.filter((metric) => metric.variant === "score");
  const columns = [
    { id: "a", label: "Subject A", value: subjectA, setValue: setSubjectA, analysis: analysisA },
    { id: "b", label: "Subject B", value: subjectB, setValue: setSubjectB, analysis: analysisB },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        {columns.map((col) => {
          const tone = TONE_CLASSES[toneForGrade(col.analysis.scores.grade)];
          const isWinner = winner === col.id;
          return (
            <Card key={col.id} className={`p-5 ${isWinner ? "ring-2 ring-(--primary)" : ""}`}>
              <div className="mb-3 flex items-center justify-between">
                <label htmlFor={`compare-${col.id}`} className="text-sm font-semibold text-(--foreground)">
                  {col.label}
                </label>
                {isWinner && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-(--primary)/10 px-2.5 py-1 text-xs font-bold text-(--primary)">
                    <Trophy className="h-3.5 w-3.5" aria-hidden="true" /> Winner
                  </span>
                )}
              </div>
              <textarea
                id={`compare-${col.id}`}
                value={col.value}
                onChange={(event) => col.setValue(event.target.value)}
                rows={2}
                placeholder={`Enter ${col.label.toLowerCase()}…`}
                className="w-full resize-none rounded-xl border border-(--border) bg-(--background) p-3 text-sm text-(--foreground) outline-none transition focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/30"
              />
              <div className="mt-3 flex items-center gap-3">
                <span
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold ${tone.soft} ${tone.text}`}
                >
                  {col.analysis.scores.grade}
                </span>
                <div>
                  <div className="text-xl font-bold text-(--foreground)">
                    {col.analysis.scores.overall}
                    <span className="text-sm font-normal text-(--muted-foreground)">/100</span>
                  </div>
                  <div className="text-xs text-(--muted-foreground)">{col.value.length} chars</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {(subjectA || subjectB) && (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-(--border) text-left text-(--muted-foreground)">
                  <th className="px-4 py-3 font-medium">Metric</th>
                  <th className="px-4 py-3 font-medium">Subject A</th>
                  <th className="px-4 py-3 font-medium">Subject B</th>
                </tr>
              </thead>
              <tbody>
                {scoreMetrics.map((metric) => {
                  const a = metric.getScore(analysisA);
                  const b = metric.getScore(analysisB);
                  const aGood = metric.invert ? -a : a;
                  const bGood = metric.invert ? -b : b;
                  return (
                    <tr key={metric.key} className="border-b border-(--border) last:border-0">
                      <td className="px-4 py-2.5 text-(--foreground)">{metric.label}</td>
                      <td className={`px-4 py-2.5 tabular-nums ${aGood > bGood ? "font-bold text-success" : "text-(--foreground)/80"}`}>
                        {a}
                      </td>
                      <td className={`px-4 py-2.5 tabular-nums ${bGood > aGood ? "font-bold text-success" : "text-(--foreground)/80"}`}>
                        {b}
                      </td>
                    </tr>
                  );
                })}
                <tr>
                  <td className="px-4 py-2.5 font-semibold text-(--foreground)">Overall</td>
                  <td className={`px-4 py-2.5 font-bold tabular-nums ${winner === "a" ? "text-success" : "text-(--foreground)/80"}`}>
                    {analysisA.scores.overall}
                  </td>
                  <td className={`px-4 py-2.5 font-bold tabular-nums ${winner === "b" ? "text-success" : "text-(--foreground)/80"}`}>
                    {analysisB.scores.overall}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
