"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Sparkles } from "lucide-react";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)]";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)]";

function buildOutput({ name, description, primary, audience, count }) {
  const safeCount = Math.max(3, Math.min(20, Number(count) || 6));
  const lower = name.toLowerCase();
  if (lower.includes("storage")) {
    const gbPerProject = Math.max(1, Number(primary) || 12);
    return [
      `${name} estimate`,
      `Audience/workflow: ${audience}`,
      `Per project: ${gbPerProject} GB`,
      `10 projects: ${gbPerProject * 10} GB`,
      `With 30% safety buffer: ${Math.ceil(gbPerProject * 10 * 1.3)} GB`,
      "Keep originals, working files and exports in separate folders; archive signed-off jobs monthly.",
    ].join("\n");
  }
  if (lower.includes("banner") || lower.includes("cover")) {
    return [
      `${name} layout brief`,
      `Format: ${primary || "social banner"}`,
      `Audience: ${audience}`,
      "Safe zone: keep face/logo/text in the central 60% of the canvas.",
      "Export: 2x PNG/JPG, sharpen lightly, avoid tiny text near edges.",
      "Alt text: describe the person, brand and visual promise in one sentence.",
    ].join("\n");
  }
  if (lower.includes("gear") || lower.includes("checklist")) {
    return [
      `${name}`,
      `Shoot/task: ${primary || "creator shoot"}`,
      "Pre-pack: camera/phone, batteries, charger, storage, mic, lights, tripod, tape, cloth, release forms.",
      "On-site: test audio, white balance, backup location, mark best takes.",
      "Wrap: duplicate files, label folders, charge batteries, note missing shots.",
    ].join("\n");
  }
  if (lower.includes("ugc") || lower.includes("brief")) {
    return [
      `${name}`,
      `Product: ${primary || "privacy-first tool"}`,
      `Creator/audience: ${audience}`,
      "Deliverables: 1 hook, 3 proof beats, 1 objection answer, 1 CTA.",
      "Usage: organic + paid usage must be stated with duration and territory.",
      "Do not script fake results; require disclosure and truthful demonstrations.",
    ].join("\n");
  }
  return [
    `${name}`,
    description,
    `Audience: ${audience}`,
    `Input/context: ${primary}`,
    "",
    ...Array.from({ length: safeCount }, (_, index) => `${index + 1}. ${primary || "Idea"} — make this specific, short and useful.`),
  ].join("\n");
}

export default function QuickUtilityPage({ config }) {
  const [primary, setPrimary] = useState(config.name);
  const [audience, setAudience] = useState("ALTFTool users");
  const [count, setCount] = useState("6");
  const [copied, setCopied] = useState(false);
  const output = useMemo(
    () => buildOutput({ name: config.name, description: config.description, primary, audience, count }),
    [config.name, config.description, primary, audience, count],
  );
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          Quick utility
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">{config.name}</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{config.description}</p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold" htmlFor="quick-primary">
              Main input
            </label>
            <input id="quick-primary" className={`mt-2 ${INPUT_CLASS}`} value={primary} onChange={(event) => setPrimary(event.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold" htmlFor="quick-count">
              Items
            </label>
            <input id="quick-count" className={`mt-2 ${INPUT_CLASS}`} type="number" min="3" max="20" value={count} onChange={(event) => setCount(event.target.value)} />
          </div>
          <div className="sm:col-span-3">
            <label className="block text-sm font-semibold" htmlFor="quick-audience">
              Audience / context
            </label>
            <input id="quick-audience" className={`mt-2 ${INPUT_CLASS}`} value={audience} onChange={(event) => setAudience(event.target.value)} />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-lg bg-[var(--surface-soft)] p-4 text-sm leading-6">{output}</pre>
        <div className="mt-5 flex flex-wrap gap-2">
          <button className={GHOST_BTN} type="button" onClick={() => { setPrimary(config.name); setAudience("ALTFTool users"); setCount("6"); }}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
          <button className={PRIMARY_BTN} type="button" onClick={copy}>
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied" : "Copy output"}
          </button>
        </div>
      </section>
    </main>
  );
}
