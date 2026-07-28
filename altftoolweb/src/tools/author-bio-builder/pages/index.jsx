"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, UserPen } from "lucide-react";

import { LENGTHS, TONES, buildBio } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-[3px] focus:ring-[var(--primary)]/25";
const TEXTAREA_CLASS =
  "min-h-20 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-[3px] focus:ring-[var(--primary)]/25";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";
const BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  name: "Alex Morgan",
  role: "independent writer",
  niche: "digital privacy and practical technology",
  proof: "featured in workshops and trusted by small teams",
  audience: "curious readers",
  cta: "Read more at altftool.com.",
  tone: "professional",
  person: "third",
  length: "short",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);
  const result = useMemo(() => buildBio(form), [form]);

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setCopied(false);
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied(false);
  };

  const copyBio = async () => {
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <UserPen className="h-4 w-4" aria-hidden="true" />
          Writing helper
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Author Bio Builder
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted-foreground)] sm:text-base">
          Build a micro, short or long author bio in first or third person, with
          tone controls and live word counts for profiles, bylines and speaker pages.
        </p>
      </header>

      <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <div className={CARD}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className={LABEL_CLASS}>Name</span>
              <input className={`${INPUT_CLASS} mt-2`} value={form.name} onChange={(event) => update("name", event.target.value)} />
            </label>
            <label>
              <span className={LABEL_CLASS}>Role</span>
              <input className={`${INPUT_CLASS} mt-2`} value={form.role} onChange={(event) => update("role", event.target.value)} />
            </label>
            <label className="sm:col-span-2">
              <span className={LABEL_CLASS}>Niche / topic</span>
              <input className={`${INPUT_CLASS} mt-2`} value={form.niche} onChange={(event) => update("niche", event.target.value)} />
            </label>
            <label className="sm:col-span-2">
              <span className={LABEL_CLASS}>Proof / credibility</span>
              <textarea className={`${TEXTAREA_CLASS} mt-2`} value={form.proof} onChange={(event) => update("proof", event.target.value)} />
            </label>
            <label>
              <span className={LABEL_CLASS}>Audience</span>
              <input className={`${INPUT_CLASS} mt-2`} value={form.audience} onChange={(event) => update("audience", event.target.value)} />
            </label>
            <label>
              <span className={LABEL_CLASS}>CTA / link line</span>
              <input className={`${INPUT_CLASS} mt-2`} value={form.cta} onChange={(event) => update("cta", event.target.value)} />
            </label>
            <label>
              <span className={LABEL_CLASS}>Tone</span>
              <select className={`${INPUT_CLASS} mt-2`} value={form.tone} onChange={(event) => update("tone", event.target.value)}>
                {TONES.map((tone) => (
                  <option key={tone.id} value={tone.id}>{tone.label}</option>
                ))}
              </select>
            </label>
            <label>
              <span className={LABEL_CLASS}>Length</span>
              <select className={`${INPUT_CLASS} mt-2`} value={form.length} onChange={(event) => update("length", event.target.value)}>
                {LENGTHS.map((length) => (
                  <option key={length.id} value={length.id}>{length.label} · ~{length.words} words</option>
                ))}
              </select>
            </label>
            <label>
              <span className={LABEL_CLASS}>Person</span>
              <select className={`${INPUT_CLASS} mt-2`} value={form.person} onChange={(event) => update("person", event.target.value)}>
                <option value="third">Third person</option>
                <option value="first">First person</option>
              </select>
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" className={BTN} onClick={reset}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <aside className={`${CARD} self-start`} data-testid="tool-output">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Generated bio
              </p>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                {result.words} words · target around {result.targetWords}
              </p>
            </div>
            <button type="button" className={PRIMARY_BTN} onClick={copyBio}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="mt-5 rounded-lg bg-[var(--background)] p-4 text-sm leading-7 text-[var(--foreground)] ring-1 ring-[var(--border)]">
            {result.text}
          </div>
        </aside>
      </section>
    </main>
  );
}
