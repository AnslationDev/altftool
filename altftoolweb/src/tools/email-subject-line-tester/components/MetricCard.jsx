"use client";

import { Info } from "lucide-react";
import Card from "./ui/Card";
import ProgressBar from "./ui/ProgressBar";
import Tooltip from "./ui/Tooltip";
import { toneForScore, TONE_CLASSES } from "../lib/uiTone";

export default function MetricCard({ metric, analysis }) {
  const Icon = metric.icon;
  let content = null;

  if (metric.variant === "score") {
    const score = metric.getScore(analysis);
    const tone = TONE_CLASSES[toneForScore(score, { invert: metric.invert })];
    content = (
      <>
        <div className="flex items-baseline justify-between">
          <span className={`text-2xl font-bold tabular-nums ${tone.text}`}>{score}</span>
          <span className="text-xs text-(--muted-foreground)">/ 100</span>
        </div>
        <ProgressBar value={score} colorClass={tone.bg} className="mt-2" />
      </>
    );
  } else if (metric.variant === "count") {
    content = <div className="text-2xl font-bold tabular-nums text-(--foreground)">{metric.getValue(analysis)}</div>;
  } else if (metric.variant === "boolean") {
    const value = metric.getValue(analysis);
    const tone = TONE_CLASSES[value ? "success" : "warning"];
    content = (
      <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${tone.soft} ${tone.text}`}>
        {value ? "Yes" : "No"}
      </span>
    );
  } else if (metric.variant === "label") {
    content = <div className="text-lg font-semibold text-(--foreground)">{metric.getValue(analysis)}</div>;
  }

  const caption = metric.getCaption?.(analysis);

  return (
    <Card className="p-4 transition-transform hover:-translate-y-0.5 sm:p-5">
      <div className="flex items-center gap-2 text-sm font-medium text-(--muted-foreground)">
        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="truncate">{metric.label}</span>
        <Tooltip label={metric.description} className="ml-auto shrink-0">
          <Info className="h-3.5 w-3.5 cursor-help opacity-60" aria-hidden="true" />
        </Tooltip>
      </div>
      <div className="mt-3">{content}</div>
      {caption && <p className="mt-2 text-xs leading-snug text-(--muted-foreground)">{caption}</p>}
    </Card>
  );
}
