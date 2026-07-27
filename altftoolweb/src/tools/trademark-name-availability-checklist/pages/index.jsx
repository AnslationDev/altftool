"use client";

import { useMemo, useState } from "react";
import { BadgeCheck, Check, Copy, RotateCcw, TriangleAlert } from "lucide-react";

import { INDUSTRIES, JURISDICTIONS, buildClearanceChecklist } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = { name: "Zyloqua", jurisdiction: "us", industry: "software" };
const DASH = "—";
const NUM = new Intl.NumberFormat("en-US");

const TONE_TEXT = {
  success: "text-[var(--success)]",
  warning: "text-[var(--primary)]",
  danger: "text-[var(--danger)]",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [done, setDone] = useState([]);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  };

  const result = useMemo(() => buildClearanceChecklist(form), [form]);

  const toggleStep = (title) => {
    setDone((prev) => (prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]));
    setCopied(false);
  };

  const stepTitles = result.error ? [] : result.steps.map((step) => step.title);
  const completed = stepTitles.filter((title) => done.includes(title)).length;

  const summary = useMemo(() => {
    if (result.error) return "";
    return [
      `Trademark clearance checklist — ${result.name}`,
      `Market: ${result.jurisdiction.label} (${result.jurisdiction.office})`,
      `Indicative distinctiveness: ${result.score}/100 — ${result.band.label}`,
      result.classes.length ? `Likely Nice classes: ${result.classes.join(", ")}` : "Nice classes: check the classification",
      "",
      ...result.steps.map((step) => `${done.includes(step.title) ? "[x]" : "[ ]"} ${step.title}\n    ${step.detail}`),
      "",
      "Informational only — not legal advice and not a legal clearance search.",
    ].join("\n");
  }, [result, done]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setDone([]);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BadgeCheck className="h-4 w-4" aria-hidden="true" />
          Brand naming
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Trademark Name Availability Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Score a candidate name against the distinctiveness spectrum, see the Nice classes it
          would file in, and work through a clearance checklist built for the office you will
          file with.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tm-name">
              Brand name you are considering
            </label>
            <input
              id="tm-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.name}
              onChange={set("name")}
              placeholder="Zyloqua"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tm-jurisdiction">
              Where do you want protection?
            </label>
            <select
              id="tm-jurisdiction"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.jurisdiction}
              onChange={set("jurisdiction")}
            >
              {Object.entries(JURISDICTIONS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tm-industry">
              What do you sell?
            </label>
            <select id="tm-industry" className={`mt-2 ${INPUT_CLASS}`} value={form.industry} onChange={set("industry")}>
              {Object.entries(INDUSTRIES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {result.error ? (
        <>
          <p
            role="alert"
            className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
          <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Indicative distinctiveness
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--muted-foreground)]">{DASH}</p>
            <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
              {["Verdict", "Likely Nice classes", "Opposition window", "Checklist progress"].map((label) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold text-[var(--muted-foreground)]">{DASH}</dd>
                </div>
              ))}
            </dl>
          </section>
        </>
      ) : (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Indicative distinctiveness
                </p>
                <p className={`mt-1 text-4xl font-semibold ${TONE_TEXT[result.band.tone]}`}>
                  {NUM.format(result.score)}
                  <span className="text-xl text-[var(--muted-foreground)]">/100</span>
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">{result.band.label}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={copyResult} aria-label="Copy the clearance checklist" className={GHOST_BTN}>
                  {copied ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copied ? "Copied!" : "Copy result"}
                </button>
                <button type="button" onClick={reset} aria-label="Reset the checklist" className={PRIMARY_BTN}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Office", `${result.jurisdiction.label} — ${result.jurisdiction.office}`],
                [
                  "Likely Nice classes",
                  result.classes.length ? result.classes.join(", ") : "Look up your goods in the classification",
                ],
                ["Opposition window", result.jurisdiction.oppositionWindow],
                ["Registration term", `${result.jurisdiction.renewalYears} years, renewable`],
                ["Checklist progress", `${completed} of ${stepTitles.length} done`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                  <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {result.flags.length > 0 && (
            <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-base font-semibold">What weakens this name</h2>
              <ul className="mt-3 space-y-2 text-sm leading-6">
                {result.flags.map((flag) => (
                  <li
                    key={flag.code}
                    className="flex items-start gap-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-[var(--danger)]"
                  >
                    <TriangleAlert className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>
                      <strong className="font-semibold">{flag.title}.</strong> {flag.detail}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Clearance checklist</h2>
            <ul className="mt-3 space-y-2">
              {result.steps.map((step, index) => (
                <li key={step.title} className="rounded-md bg-[var(--muted)] p-3">
                  <label className="flex cursor-pointer items-start gap-3" htmlFor={`tm-step-${index}`}>
                    <input
                      id={`tm-step-${index}`}
                      type="checkbox"
                      className="mt-0.5 h-5 w-5 shrink-0 rounded border border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                      checked={done.includes(step.title)}
                      onChange={() => toggleStep(step.title)}
                    />
                    <span className="min-w-0">
                      <span
                        className={`block text-sm font-semibold ${done.includes(step.title) ? "text-[var(--muted-foreground)] line-through" : "text-[var(--foreground)]"}`}
                      >
                        {step.title}
                      </span>
                      <span className="mt-1 block text-sm leading-6 text-[var(--muted-foreground)]">
                        {step.detail}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Worth knowing in {result.jurisdiction.label}</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
              {result.jurisdictionNotes.map((note) => (
                <li key={note} className="rounded-md bg-[var(--muted)] px-3 py-2">
                  {note}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice, and not a legal clearance search. The score is a
        heuristic based on the words in the name — a trademark attorney&apos;s opinion is what you
        rely on before spending money on the brand.
      </p>
    </main>
  );
}
