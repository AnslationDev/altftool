"use client";

import { useMemo, useState } from "react";
import { AlignLeft, Check, Copy, RotateCcw } from "lucide-react";
import { CONNECTOR_STYLES, POINTS_OF_VIEW, TONES, buildBulletToProsePrompt } from "../lib";

const DEFAULT_BULLETS = `- Migrated the billing service onto the new queue
- Cut p95 latency from 840 ms to 210 ms
  - measured over four weeks of production traffic
- Wrote the runbook and handed it to the on-call rota
- Two incidents during rollout, both caused by stale config`;

const DEFAULTS = {
  bullets: DEFAULT_BULLETS,
  audience: "Engineering leadership who did not follow the project week to week",
  tone: "neutral",
  pointOfView: "first-plural",
  connector: "claim-evidence",
  expansion: "2.5",
  wordsPerSentence: "18",
  sentencesPerParagraph: "4",
  overrideWords: "0",
  keepOrder: true,
  keepTerms: "p95, runbook, on-call rota",
};

const CONNECTOR_LABELS = {
  chronological: "Chronological",
  "cause-effect": "Cause and effect",
  "claim-evidence": "Claim then evidence",
  "general-specific": "General then specific",
};

const TONE_LABELS = {
  neutral: "Neutral",
  warm: "Warm",
  formal: "Formal",
  persuasive: "Persuasive",
  academic: "Academic",
};

const INPUT =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const HINT = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(
    () =>
      buildBulletToProsePrompt({
        bullets: form.bullets,
        audience: form.audience,
        tone: form.tone,
        pointOfView: form.pointOfView,
        connector: form.connector,
        expansion: form.expansion === "" ? 0 : Number(form.expansion),
        wordsPerSentence: form.wordsPerSentence === "" ? 0 : Number(form.wordsPerSentence),
        sentencesPerParagraph: form.sentencesPerParagraph === "" ? 0 : Number(form.sentencesPerParagraph),
        overrideWords: form.overrideWords === "" ? 0 : Number(form.overrideWords),
        keepOrder: form.keepOrder,
        keepTerms: form.keepTerms,
      }),
    [form],
  );

  const failed = Boolean(result.error);

  const copyResult = async () => {
    if (failed) return;
    try {
      await navigator.clipboard.writeText(result.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied(false);
  };

  const rows = [
    ["Bullets found", failed ? DASH : String(result.bulletCount)],
    ["Words in the notes", failed ? DASH : `${result.sourceWords} (avg ${result.avgWords} per bullet)`],
    ["Target prose length", failed ? DASH : `${result.targetWords} words`],
    ["Shape", failed ? DASH : `${result.paragraphs} paragraphs · ${result.sentences} sentences`],
    ["Reading time", failed ? DASH : `${result.readMinutes} min at 238 wpm`],
    ["Bullets over 30 words", failed ? DASH : String(result.longBulletCount)],
    ["Prompt length", failed ? DASH : `${result.wordCount} words · ~${result.tokenEstimate} tokens`],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <AlignLeft className="h-4 w-4" aria-hidden="true" />
          Knowledge prompts
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Bullet to Prose Prompt</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste your notes. The tool counts them, budgets the paragraphs and sentences they should
          become, and writes a prompt that forbids invented detail.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div>
          <label className={LABEL} htmlFor="bp-bullets">Your bullet points</label>
          <textarea id="bp-bullets" rows={8} className={`mt-2 ${TEXTAREA}`} value={form.bullets} onChange={set("bullets")} />
          <p className={HINT}>One idea per line. Indent a line by two spaces to make it a sub-point.</p>
        </div>

        <div className="mt-4">
          <label className={LABEL} htmlFor="bp-audience">Audience</label>
          <input id="bp-audience" className={`mt-2 ${INPUT}`} value={form.audience} onChange={set("audience")} />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="bp-tone">Tone</label>
            <select id="bp-tone" className={`mt-2 ${INPUT}`} value={form.tone} onChange={set("tone")}>
              {Object.keys(TONES).map((key) => (
                <option key={key} value={key}>{TONE_LABELS[key]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="bp-pov">Point of view</label>
            <select id="bp-pov" className={`mt-2 ${INPUT}`} value={form.pointOfView} onChange={set("pointOfView")}>
              {Object.entries(POINTS_OF_VIEW).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="bp-connector">How the points should connect</label>
            <select id="bp-connector" className={`mt-2 ${INPUT}`} value={form.connector} onChange={set("connector")}>
              {Object.keys(CONNECTOR_STYLES).map((key) => (
                <option key={key} value={key}>{CONNECTOR_LABELS[key]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="bp-expansion">Expansion factor (×)</label>
            <input id="bp-expansion" className={`mt-2 ${INPUT}`} type="number" inputMode="decimal" min="1" max="10" step="0.5" value={form.expansion} onChange={set("expansion")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="bp-override">Or fix the length (words)</label>
            <input id="bp-override" className={`mt-2 ${INPUT}`} type="number" inputMode="numeric" min="0" max="5000" step="50" value={form.overrideWords} onChange={set("overrideWords")} />
            <p className={HINT}>0 uses the expansion factor.</p>
          </div>
          <div>
            <label className={LABEL} htmlFor="bp-wps">Average sentence (words)</label>
            <input id="bp-wps" className={`mt-2 ${INPUT}`} type="number" inputMode="numeric" min="8" max="40" value={form.wordsPerSentence} onChange={set("wordsPerSentence")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="bp-spp">Sentences per paragraph</label>
            <input id="bp-spp" className={`mt-2 ${INPUT}`} type="number" inputMode="numeric" min="1" max="10" value={form.sentencesPerParagraph} onChange={set("sentencesPerParagraph")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="bp-terms">Terms to keep exactly</label>
            <input id="bp-terms" className={`mt-2 ${INPUT}`} value={form.keepTerms} onChange={set("keepTerms")} />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <input
            id="bp-order"
            type="checkbox"
            checked={form.keepOrder}
            onChange={(event) => setForm((prev) => ({ ...prev, keepOrder: event.target.checked }))}
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
          />
          <label className="text-sm font-semibold text-[var(--foreground)]" htmlFor="bp-order">
            Keep the bullets in the order I wrote them
          </label>
        </div>
      </section>

      {failed && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Target prose length
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${result.targetWords} words`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the highlighted input to generate your prompt."
                : `From ${result.sourceWords} words of notes across ${result.bulletCount} bullets.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} disabled={failed} aria-label="Copy the bullet to prose prompt" className={`${GHOST_BTN} disabled:opacity-50`}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy prompt"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your prompt</h2>
        <div className="mt-3 overflow-x-auto">
          <pre className="min-w-0 whitespace-pre-wrap break-words rounded-md bg-[var(--background)] p-4 text-sm leading-6 text-[var(--foreground)] ring-1 ring-[var(--border)]">
            {failed ? DASH : result.prompt}
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Everything happens in your browser — the notes are never sent anywhere by this page. The
        sentence-length default of 18 words follows plain-language guidance; reading time uses 238
        words per minute (Brysbaert, 2019).
      </p>
    </main>
  );
}
