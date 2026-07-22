"use client";

import { ArrowUpRight, ArrowDownRight, Minus, Wand2 } from "lucide-react";
import Card from "./ui/Card";
import CopyButton from "./ui/CopyButton";
import { TONE_CLASSES, toneForGrade } from "../lib/uiTone";

function DeltaBadge({ delta }) {
  if (delta > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-success">
        <ArrowUpRight className="h-3.5 w-3.5" /> +{delta}
      </span>
    );
  }
  if (delta < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-danger">
        <ArrowDownRight className="h-3.5 w-3.5" /> {delta}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-(--muted-foreground)">
      <Minus className="h-3.5 w-3.5" /> 0
    </span>
  );
}

export default function VariationsPanel({ subject, variations, onApply }) {
  if (!subject) {
    return (
      <Card className="p-6 text-sm text-(--muted-foreground)">
        Type a subject line to generate rule-based improved variations.
      </Card>
    );
  }

  if (!variations.length) {
    return (
      <Card className="p-6 text-sm text-(--muted-foreground)">
        No distinct variations to suggest — this subject already covers every transform we try.
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center gap-2">
        <Wand2 className="h-5 w-5 text-(--primary)" />
        <h3 className="text-lg font-semibold text-(--foreground)">Suggested variations</h3>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {variations.map((variation) => {
          const tone = TONE_CLASSES[toneForGrade(variation.projectedGrade)];
          return (
            <div key={variation.id} className="flex flex-col rounded-xl border border-(--border) bg-(--background) p-4">
              <p className="text-sm font-medium leading-relaxed text-(--foreground)">{variation.text}</p>
              <p className="mt-2 text-xs text-(--muted-foreground)">{variation.rationale}</p>
              <div className="mt-3 flex items-center justify-between gap-2 border-t border-(--border) pt-3">
                <div className="flex items-center gap-2">
                  <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${tone.soft} ${tone.text}`}>
                    {variation.projectedGrade} · {variation.projectedScore}/100
                  </span>
                  <DeltaBadge delta={variation.scoreDelta} />
                </div>
                <div className="flex items-center gap-1.5">
                  {onApply && (
                    <button
                      type="button"
                      onClick={() => onApply(variation.text)}
                      className="cursor-pointer rounded-lg border border-(--border) px-2.5 py-1.5 text-xs font-medium text-(--muted-foreground) transition-colors hover:border-(--primary) hover:text-(--primary)"
                    >
                      Use this
                    </button>
                  )}
                  <CopyButton text={variation.text} label="" className="border-none px-1.5 py-1" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
