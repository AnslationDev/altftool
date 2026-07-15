"use client";

import { useMemo, useState } from "react";
import { Badge, Card } from "@altftool/ui";
import { MessageSquareText, Sparkles } from "lucide-react";

const sampleFeedback = `Checkout is confusing on mobile and I could not find the coupon box.
The dashboard loads fast now. Great improvement.
Please add CSV export for invoices.
Login failed twice and the error message did not help.
Love the new design, but pricing details are hard to compare.`;

const categories = [
  { name: "Usability", pattern: /confusing|hard|find|unclear|mobile|design/i },
  { name: "Reliability", pattern: /failed|error|bug|broken|crash|slow/i },
  { name: "Feature request", pattern: /please|add|need|export|support|integrate/i },
  { name: "Pricing", pattern: /price|pricing|cost|plan|billing/i },
  { name: "Praise", pattern: /love|great|fast|improvement|thanks/i },
];

function sentimentFor(text) {
  const positive = /love|great|fast|improvement|thanks|good/i.test(text);
  const negative = /failed|confusing|hard|error|bug|broken|slow/i.test(text);
  if (positive && !negative) return "Positive";
  if (negative && !positive) return "Negative";
  return "Mixed";
}

export default function FeedbackCategorizerPage() {
  const [feedback, setFeedback] = useState(sampleFeedback);
  const items = useMemo(() => feedback.split(/\n+/).map((line) => line.trim()).filter(Boolean).map((line) => {
    const matched = categories.find((category) => category.pattern.test(line));
    const sentiment = sentimentFor(line);
    const priority = sentiment === "Negative" || /failed|checkout|billing|pricing/i.test(line) ? "High" : "Normal";
    return { text: line, category: matched?.name || "General", sentiment, priority };
  }), [feedback]);
  const highPriority = items.filter((item) => item.priority === "High").length;
  const grouped = categories.map((category) => ({ name: category.name, count: items.filter((item) => item.category === category.name).length })).filter((item) => item.count);

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-4 p-4 text-(--foreground)">
      <section className="rounded-lg border border-(--border) bg-(--card) p-5 shadow-sm">
        <Badge tone="primary">Voice of customer</Badge>
        <h1 className="mt-3 text-2xl font-bold">Feedback Categorizer</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-(--muted-foreground)">
          Paste customer comments to quickly cluster themes, identify sentiment, and decide what deserves product attention first.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.42fr_0.58fr]">
        <Card className="p-4">
          <label className="text-sm font-semibold" htmlFor="feedback-input">One feedback item per line</label>
          <textarea id="feedback-input" value={feedback} onChange={(event) => setFeedback(event.target.value)} className="mt-3 min-h-96 w-full rounded-lg border border-(--border) bg-(--background) p-3 text-sm outline-none focus:border-(--primary) focus:shadow-[var(--anslation-ds-focus-ring)]" />
        </Card>

        <div className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Card className="p-4"><p className="text-xs font-semibold uppercase text-(--muted-foreground)">Items</p><p className="mt-2 text-3xl font-bold">{items.length}</p></Card>
            <Card className="p-4"><p className="text-xs font-semibold uppercase text-(--muted-foreground)">High priority</p><p className="mt-2 text-3xl font-bold">{highPriority}</p></Card>
            <Card className="p-4"><p className="text-xs font-semibold uppercase text-(--muted-foreground)">Themes</p><p className="mt-2 text-3xl font-bold">{grouped.length}</p></Card>
          </div>

          <Card className="p-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold"><Sparkles className="h-5 w-5 text-(--primary)" /> Theme summary</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {grouped.map((group) => <Badge key={group.name} tone="neutral">{group.name}: {group.count}</Badge>)}
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold"><MessageSquareText className="h-5 w-5 text-(--primary)" /> Categorized feedback</h2>
            <div className="mt-4 space-y-3">
              {items.map((item, index) => (
                <article key={`${item.text}-${index}`} className="rounded-lg border border-(--border) bg-(--background) p-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge tone="primary">{item.category}</Badge>
                    <Badge tone="neutral">{item.sentiment}</Badge>
                    <Badge tone={item.priority === "High" ? "neutral" : "success"}>{item.priority}</Badge>
                  </div>
                  <p className="mt-3 text-sm leading-6">{item.text}</p>
                </article>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
