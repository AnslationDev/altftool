"use client";

import { useMemo, useState } from "react";
import { Badge, Card } from "@altftool/ui";
import { CalendarClock, FileClock } from "lucide-react";

const sampleChanges = `2026-07-10 | v1.0 | Asha | Created launch brief and campaign goals
2026-07-11 | v1.1 | Omar | Added budget table and success metrics
2026-07-12 | v1.2 | Mei | Revised compliance notes and approval checklist
2026-07-14 | v2.0 | Asha | Finalized executive summary and owner sign-off`;

function parseChanges(value) {
  return value
    .split(/\n+/)
    .map((line) => line.split("|").map((part) => part.trim()))
    .filter(([date, version, owner, summary]) => date && version && owner && summary)
    .map(([date, version, owner, summary]) => ({ date, version, owner, summary }));
}

function themeFor(summary) {
  const text = summary.toLowerCase();
  if (/final|approve|sign/.test(text)) return "Approval";
  if (/budget|metric|table/.test(text)) return "Reporting";
  if (/compliance|legal|risk/.test(text)) return "Governance";
  return "Content";
}

export default function DocumentVersionTimelinePage() {
  const [input, setInput] = useState(sampleChanges);
  const changes = useMemo(() => parseChanges(input), [input]);
  const owners = new Set(changes.map((change) => change.owner)).size;

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-4 p-4 text-(--foreground)">
      <section className="rounded-lg border border-(--border) bg-(--card) p-5 shadow-sm">
        <Badge tone="primary">Version clarity</Badge>
        <h1 className="mt-3 text-2xl font-bold">Document Version Timeline</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-(--muted-foreground)">
          Transform lightweight changelog notes into a stakeholder-friendly timeline for docs, briefs, policies, and reports.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.42fr_0.58fr]">
        <Card className="p-4">
          <label className="text-sm font-semibold" htmlFor="timeline-input">Date | version | owner | summary</label>
          <textarea id="timeline-input" value={input} onChange={(event) => setInput(event.target.value)} className="mt-3 min-h-96 w-full rounded-lg border border-(--border) bg-(--background) p-3 font-mono text-sm outline-none focus:border-(--primary) focus:shadow-[var(--anslation-ds-focus-ring)]" />
        </Card>

        <div className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Card className="p-4"><p className="text-xs font-semibold uppercase text-(--muted-foreground)">Versions</p><p className="mt-2 text-3xl font-bold">{changes.length}</p></Card>
            <Card className="p-4"><p className="text-xs font-semibold uppercase text-(--muted-foreground)">Owners</p><p className="mt-2 text-3xl font-bold">{owners}</p></Card>
            <Card className="p-4"><p className="text-xs font-semibold uppercase text-(--muted-foreground)">Latest</p><p className="mt-2 text-lg font-bold">{changes.at(-1)?.version || "—"}</p></Card>
          </div>

          <Card className="p-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold"><FileClock className="h-5 w-5 text-(--primary)" /> Timeline</h2>
            <div className="mt-4 space-y-3">
              {changes.map((change) => (
                <article key={`${change.version}-${change.date}`} className="rounded-lg border border-(--border) bg-(--background) p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="primary">{change.version}</Badge>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-(--muted-foreground)"><CalendarClock className="h-3.5 w-3.5" /> {change.date}</span>
                    <span className="text-xs text-(--muted-foreground)">Owner: {change.owner}</span>
                  </div>
                  <p className="mt-3 text-sm font-medium">{change.summary}</p>
                  <p className="mt-2 text-xs text-(--muted-foreground)">Theme: {themeFor(change.summary)}</p>
                </article>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
