"use client";

import { useMemo, useState } from "react";
import { Check, ClipboardList, Copy, RotateCcw } from "lucide-react";

import { OUTPUT_FORMATS, TONES, buildMeetingPrompt, formatMinutes } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const KIND_LABELS = {
  decision: "Decision",
  action: "Action",
  question: "Open question",
  context: "Context",
};

const DEFAULTS = {
  meetingTitle: "Weekly product sync",
  attendees: "Priya, Rohan, Sam",
  outputFormat: "action-first",
  tone: "neutral",
  audience: "the wider product team",
  notes: [
    "- Agreed to ship the billing fix in the 2.4 release",
    "- @priya will draft the migration plan by Friday",
    "- Rohan to review the pricing deck",
    "- Open question: do we need legal sign off for the EU rollout?",
    "- Discussed the support backlog, numbers looked fine",
    "- Action: send the revised SOW to the client by 12/08",
    "- Pricing tiers still TBD",
  ].join("\n"),
};

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  };

  const result = useMemo(() => buildMeetingPrompt(form), [form]);
  const ok = !result.error;

  const copyPrompt = async () => {
    if (!ok) return;
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
    ["Decisions found", ok ? NUM.format(result.decisions.length) : DASH],
    ["Commitments found", ok ? NUM.format(result.actions.length) : DASH],
    ["Open questions", ok ? NUM.format(result.questions.length) : DASH],
    [
      "Commitments with an owner",
      ok && result.ownerCoveragePct !== null ? `${NUM.format(result.ownerCoveragePct)}%` : DASH,
    ],
    [
      "Commitments with a date",
      ok && result.dateCoveragePct !== null ? `${NUM.format(result.dateCoveragePct)}%` : DASH,
    ],
    ["Names detected", ok ? (result.people.length ? result.people.join(", ") : "none") : DASH],
    ["Notes length", ok ? `${NUM.format(result.words)} words, ${formatMinutes(result.readingMinutes)} to read` : DASH],
    ["Prompt size", ok ? `${NUM.format(result.wordCount)} words, ~${NUM.format(result.tokenEstimate)} tokens` : DASH],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ClipboardList className="h-4 w-4" aria-hidden="true" />
          Knowledge prompts
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Meeting Notes Prompt Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste the notes exactly as you scribbled them. Each line is sorted into decision, commitment,
          open question or context, missing owners and dates are counted, and the prompt tells the
          assistant to mark those gaps rather than quietly invent an owner.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="mn-notes">
              Raw notes
            </label>
            <textarea
              id="mn-notes"
              rows={9}
              className={`mt-2 ${TEXTAREA_CLASS}`}
              value={form.notes}
              onChange={set("notes")}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="mn-title">
                Meeting title (optional)
              </label>
              <input
                id="mn-title"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                value={form.meetingTitle}
                onChange={set("meetingTitle")}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="mn-attendees">
                Attendees (optional)
              </label>
              <input
                id="mn-attendees"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                value={form.attendees}
                onChange={set("attendees")}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="mn-format">
                Output shape
              </label>
              <select
                id="mn-format"
                className={`mt-2 ${INPUT_CLASS}`}
                value={form.outputFormat}
                onChange={set("outputFormat")}
              >
                {OUTPUT_FORMATS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="mn-tone">
                Tone
              </label>
              <select id="mn-tone" className={`mt-2 ${INPUT_CLASS}`} value={form.tone} onChange={set("tone")}>
                {TONES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="mn-audience">
                Who will read it (optional)
              </label>
              <input
                id="mn-audience"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                value={form.audience}
                onChange={set("audience")}
              />
            </div>
          </div>
        </div>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Gaps to close
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? NUM.format(result.gapCount) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `missing owners, missing dates and unresolved questions across ${result.lineCount} lines`
                : "Fix the input above to analyse the notes"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPrompt}
              disabled={!ok}
              aria-label="Copy the generated meeting notes prompt"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
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
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Line by line</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Type</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Line</th>
                <th scope="col" className="py-2 text-right font-semibold">Owner / date</th>
              </tr>
            </thead>
            <tbody>
              {ok ? (
                result.lines.map((item, index) => (
                  <tr key={`${index}-${item.line}`} className="border-b border-[var(--border)] last:border-0">
                    <td className="whitespace-nowrap py-2 pr-3 font-semibold">{KIND_LABELS[item.kind]}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{item.line}</td>
                    <td className="whitespace-nowrap py-2 text-right">
                      {item.kind === "action" ? (
                        <span className={item.hasOwner && item.hasDate ? "text-[var(--success)]" : "text-[var(--danger)]"}>
                          {item.hasOwner ? item.owners.join(", ") : "no owner"}
                          {" / "}
                          {item.hasDate ? "dated" : "no date"}
                        </span>
                      ) : (
                        <span className="text-[var(--muted-foreground)]">{DASH}</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-2 pr-3" colSpan={3}>
                    {DASH}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your prompt</h2>
        <div className="mt-3 overflow-x-auto">
          <pre className="min-w-0 whitespace-pre-wrap break-words rounded-md bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)]">
            {ok ? result.prompt : DASH}
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Classification is keyword-based and runs entirely in your browser — nothing is uploaded. It
        will occasionally mislabel a line, so treat the counts as a checklist rather than a verdict,
        and read the table before you send the notes anywhere.
      </p>
    </main>
  );
}
