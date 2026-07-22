"use client";

import Card from "./ui/Card";
import ProgressBar from "./ui/ProgressBar";
import { toneForScore, TONE_CLASSES } from "../lib/uiTone";

const INSIGHT_ROWS = [
  { key: "curiosity", label: "Curiosity" },
  { key: "trust", label: "Trust" },
  { key: "professionalism", label: "Professionalism" },
  { key: "urgency", label: "Urgency" },
  { key: "emotionalImpact", label: "Emotional Impact" },
  { key: "readability", label: "Readability" },
];

export default function InsightsDashboard({ subject, insights }) {
  if (!subject) {
    return (
      <Card className="p-6 text-sm text-(--muted-foreground)">
        Type a subject line to see the persuasion insights dashboard.
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="mb-5 text-lg font-semibold text-(--foreground)">Insights dashboard</h3>
      <div className="space-y-4">
        {INSIGHT_ROWS.map((row) => {
          const value = insights[row.key];
          const tone = TONE_CLASSES[toneForScore(value)];
          return (
            <div key={row.key}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium text-(--foreground)">{row.label}</span>
                <span className={`font-semibold tabular-nums ${tone.text}`}>{value}/100</span>
              </div>
              <ProgressBar value={value} colorClass={tone.bg} height="h-2.5" />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
