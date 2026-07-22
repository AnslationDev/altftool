"use client";

import Card from "./ui/Card";
import { TONE_CLASSES } from "../lib/uiTone";

const CATEGORY_TONE = { spam: "danger", urgency: "warning", power: "success", personalization: "info" };
const CATEGORY_LABEL = { spam: "Spam risk", urgency: "Urgency", power: "Power word", personalization: "Personalization" };

function renderSegments(subject, spans) {
  if (!spans.length) return subject;

  const nodes = [];
  let cursor = 0;
  spans.forEach((span, index) => {
    if (span.start > cursor) nodes.push(subject.slice(cursor, span.start));
    const tone = TONE_CLASSES[CATEGORY_TONE[span.category]];
    nodes.push(
      <mark
        key={`${span.start}-${index}`}
        className={`rounded px-1 py-0.5 font-medium ${tone.soft} ${tone.text}`}
        title={CATEGORY_LABEL[span.category]}
      >
        {span.text}
      </mark>,
    );
    cursor = span.end;
  });
  if (cursor < subject.length) nodes.push(subject.slice(cursor));
  return nodes;
}

export default function HighlightedSubject({ subject, spans }) {
  if (!subject) {
    return (
      <Card className="p-6 text-sm text-(--muted-foreground)">
        Type a subject line to see spam, urgency, power and personalization words highlighted here.
      </Card>
    );
  }

  const usedCategories = [...new Set(spans.map((s) => s.category))];

  return (
    <Card className="p-6">
      <p className="break-words text-lg leading-relaxed text-(--foreground)">{renderSegments(subject, spans)}</p>
      {usedCategories.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-3 border-t border-(--border) pt-4 text-xs">
          {usedCategories.map((category) => {
            const tone = TONE_CLASSES[CATEGORY_TONE[category]];
            return (
              <span
                key={category}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium ${tone.soft} ${tone.text}`}
              >
                <span className={`h-2 w-2 rounded-full ${tone.bg}`} />
                {CATEGORY_LABEL[category]}
              </span>
            );
          })}
        </div>
      ) : (
        <p className="mt-4 text-xs text-(--muted-foreground)">
          No spam, urgency, power or personalization words detected in this subject.
        </p>
      )}
    </Card>
  );
}
