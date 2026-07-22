"use client";

import { Lightbulb, CheckCircle2 } from "lucide-react";
import Card from "./ui/Card";
import CopyButton from "./ui/CopyButton";

export default function SuggestionsPanel({ subject, suggestions }) {
  if (!subject) {
    return (
      <Card className="p-6 text-sm text-(--muted-foreground)">Type a subject line to get actionable suggestions.</Card>
    );
  }

  const isClean = suggestions.length === 1 && suggestions[0].startsWith("This subject line is well balanced");

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center gap-2">
        {isClean ? <CheckCircle2 className="h-5 w-5 text-success" /> : <Lightbulb className="h-5 w-5 text-(--primary)" />}
        <h3 className="text-lg font-semibold text-(--foreground)">
          {isClean ? "Looking good" : `${suggestions.length} suggestion${suggestions.length > 1 ? "s" : ""}`}
        </h3>
      </div>
      <ul className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <li
            key={index}
            className="flex items-start gap-3 rounded-xl border border-(--border) bg-(--background) p-3.5"
          >
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--primary)/10 text-xs font-bold text-(--primary)">
              {index + 1}
            </span>
            <p className="flex-1 text-sm leading-relaxed text-(--foreground)/90">{suggestion}</p>
            <CopyButton text={suggestion} label="" className="border-none px-1.5 py-1" />
          </li>
        ))}
      </ul>
    </Card>
  );
}
