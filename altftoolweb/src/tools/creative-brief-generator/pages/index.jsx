"use client";

import { useMemo, useState } from "react";
import { Check, ClipboardList, Copy, RotateCcw } from "lucide-react";

import { BRIEF_SECTIONS, buildCreativeBrief, completenessLabel } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  projectName: "Q3 trial-signup push",
  client: "Nimbus Analytics",
  owner: "Marketing",
  date: "2026-08-14",
  background:
    "Free-trial signups have been flat for two quarters while paid traffic costs keep rising. The product changed a lot in June and nobody outside the customer base knows.",
  objective: "Get finance teams who already export to spreadsheets to start a Nimbus trial.",
  successMetric: "Trial starts from paid social up 25% over the eight-week flight, at or below the current cost per trial.",
  audience:
    "Finance managers at 50-500 person companies who close the month in spreadsheets, own the reporting deadline and get blamed when a number is wrong.",
  insight: "They do not distrust their numbers — they distrust the twelve manual steps that produced them.",
  proposition: "Close the month without rebuilding the spreadsheet.",
  reasonsToBelieve:
    "Live connectors to the ledgers they already use\nEvery figure traces back to its source row in one click\nSet up in an afternoon, no engineering ticket",
  tone: "Calm, specific, peer-to-peer. Never breathless. No hustle language, no rocket emoji.",
  deliverables:
    "3 x static social 1080x1350\n2 x 15s vertical video 1080x1920\n1 x landing page hero + 3 sections\n4 x email subject-line variants",
  channels: "Paid social, search retargeting, lifecycle email",
  mandatories: "Logo lock-up on final frame\nNo customer names without written sign-off\nAccessible captions on all video",
  timing: "Concepts 21 Aug, internal review 28 Aug, sign-off 4 Sep, live 15 Sep",
  budget: "Production up to $18,000 excluding media",
};

const FIELD_ROWS = {
  background: 3,
  objective: 2,
  successMetric: 2,
  audience: 3,
  insight: 2,
  proposition: 2,
  reasonsToBelieve: 3,
  tone: 2,
  deliverables: 4,
  channels: 2,
  mandatories: 3,
  timing: 2,
  budget: 2,
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState("");

  const setField = (key) => (event) => {
    const { value } = event.target;
    setForm((current) => ({ ...current, [key]: value }));
  };

  const brief = useMemo(() => buildCreativeBrief(form), [form]);

  const copy = async (what, value) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(what);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied("");
  };

  const hasError = Boolean(brief.error);
  const dash = "—";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ClipboardList className="h-4 w-4" aria-hidden="true" />
          Creative brief
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Creative Brief Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Fill the thirteen sections of a standard one-page brief and get a formatted document, a
          completeness score and a check on whether your proposition is genuinely single-minded.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Project</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="brief-project">
              Project name
            </label>
            <input id="brief-project" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.projectName} onChange={setField("projectName")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="brief-client">
              Client or brand
            </label>
            <input id="brief-client" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.client} onChange={setField("client")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="brief-owner">
              Brief owner
            </label>
            <input id="brief-owner" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.owner} onChange={setField("owner")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="brief-date">
              Date
            </label>
            <input id="brief-date" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.date} onChange={setField("date")} />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The brief</h2>
        <div className="mt-4 grid gap-4">
          {BRIEF_SECTIONS.map((section) => (
            <div key={section.key}>
              <label className={LABEL_CLASS} htmlFor={`brief-${section.key}`}>
                {section.title}
                {section.list ? " (one per line)" : ""}
              </label>
              <textarea
                id={`brief-${section.key}`}
                className={`mt-2 ${TEXTAREA_CLASS}`}
                rows={FIELD_ROWS[section.key] || 2}
                value={form[section.key] || ""}
                onChange={setField(section.key)}
              />
              <p className={HINT_CLASS}>{section.hint}</p>
            </div>
          ))}
        </div>
      </section>

      {hasError ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {brief.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">Brief completeness</p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{hasError ? dash : `${brief.completeness}%`}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? dash : completenessLabel(brief.completeness)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy("text", brief.text)}
              aria-label="Copy the formatted creative brief"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied === "text" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied === "text" ? "Copied!" : "Copy brief"}
            </button>
            <button
              type="button"
              onClick={() => copy("markdown", brief.markdown)}
              aria-label="Copy the creative brief as Markdown"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied === "markdown" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied === "markdown" ? "Copied!" : "Markdown"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the brief to the sample" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError ? (
          <div className="mt-4">
            <div
              className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Brief is ${brief.completeness} percent complete`}
            >
              <span className="block h-full bg-[var(--primary)]" style={{ width: `${Math.max(0, Math.min(100, brief.completeness))}%` }} />
            </div>
          </div>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Sections filled", hasError ? dash : `${BRIEF_SECTIONS.length - brief.missing.length} of ${BRIEF_SECTIONS.length}`],
            ["Proposition length", hasError ? dash : `${brief.propositionWords} words`],
            ["Reasons to believe", hasError ? dash : String(brief.reasonsToBelieveCount)],
            ["Total words in the brief", hasError ? dash : String(brief.wordCount)],
            ["Still to complete", hasError ? dash : brief.missing.length ? brief.missing.join(", ") : "Nothing"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && brief.warnings.length > 0 ? (
          <ul className="mt-4 grid gap-2">
            {brief.warnings.map((warning) => (
              <li key={warning} className="rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
                {warning}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {!hasError ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Formatted brief</h2>
          <div className="mt-3 overflow-x-auto">
            <pre className="min-w-full font-mono text-xs leading-6 whitespace-pre-wrap text-[var(--foreground)]">{brief.text}</pre>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The completeness figure is a weighted count of the sections you filled in, not a judgement of
        the thinking. A brief still needs a conversation with the people who have to make the work.
      </p>
    </main>
  );
}
