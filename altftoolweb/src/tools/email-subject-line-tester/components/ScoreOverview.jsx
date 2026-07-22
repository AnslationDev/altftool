"use client";

import { Gauge } from "lucide-react";
import ScoreGauge from "./ui/ScoreGauge";
import Card from "./ui/Card";
import { TONE_CLASSES, toneForGrade } from "../lib/uiTone";
import { OVERALL_WEIGHTS } from "../lib/scoringEngine";

const GRADE_LABELS = { "A+": "Excellent", A: "Great", B: "Good", C: "Needs Work", D: "High Risk" };

const WEIGHT_LABELS = {
  length: "Length",
  spamSafety: "Spam Safety",
  readability: "Readability",
  personalization: "Personalization",
  urgency: "Urgency",
  powerWords: "Power Words",
  capitalization: "Capitalization",
  numbers: "Numbers",
  emoji: "Emoji",
};

export default function ScoreOverview({ analysis }) {
  const { scores, chars, words, subject } = analysis;
  const tone = TONE_CLASSES[toneForGrade(scores.grade)];

  if (!subject) {
    return (
      <Card className="flex flex-col items-center gap-3 p-8 text-center text-(--muted-foreground)">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-(--muted)">
          <Gauge className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="text-sm">Type a subject line above to see its overall score and grade.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-8">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-10">
        <ScoreGauge score={scores.overall} grade={scores.grade} />
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
            <span
              className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold ${tone.soft} ${tone.text}`}
            >
              {scores.grade}
            </span>
            <h2 className="text-2xl font-bold text-(--foreground)">{GRADE_LABELS[scores.grade]}</h2>
          </div>
          <p className="mt-2 text-sm text-(--muted-foreground)">
            {chars} characters · {words} word{words === 1 ? "" : "s"} · Clickability {scores.clickability}/100
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-(--muted-foreground) sm:justify-start">
            <span className="font-semibold text-(--foreground)/80">Scored on:</span>
            {Object.entries(OVERALL_WEIGHTS).map(([key, weight]) => (
              <span key={key}>
                {WEIGHT_LABELS[key] ?? key} {Math.round(weight * 100)}%
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
