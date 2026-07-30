"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Eye, RotateCcw, ShieldAlert } from "lucide-react";

import {
  DISCLOSURE_ITEMS,
  HR_QUESTIONS,
  LEGAL_ANCHORS,
  PRACTICES,
  buildInformationRequest,
  scoreMonitoring,
  scoreTransparency,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DASH = "—";

const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";
const CHECK_ROW =
  "flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm transition hover:border-[var(--primary)] has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-[var(--primary)]/35";

const MONITOR_LABEL = {
  pervasive: "Pervasive coverage",
  high: "High coverage",
  moderate: "Moderate coverage",
  light: "Light coverage",
  none: "Nothing selected",
};
const MONITOR_TEXT = {
  pervasive: "text-[var(--danger)]",
  high: "text-[var(--warning)]",
  moderate: "text-[var(--warning)]",
  light: "text-[var(--primary)]",
  none: "text-[var(--muted-foreground)]",
};
const DISCLOSE_LABEL = {
  clear: "Well documented",
  partial: "Partly documented",
  thin: "Thinly documented",
  none: "Nothing in writing",
};
const DISCLOSE_TEXT = {
  clear: "text-[var(--success)]",
  partial: "text-[var(--primary)]",
  thin: "text-[var(--warning)]",
  none: "text-[var(--danger)]",
};

const DEFAULT_PRACTICES = ["email-logs", "web-proxy", "endpoint-agent", "activity-score"];
const DEFAULT_DISCLOSED = ["what", "why"];

export default function ToolHome() {
  const [practices, setPractices] = useState(() => new Set(DEFAULT_PRACTICES));
  const [disclosed, setDisclosed] = useState(() => new Set(DEFAULT_DISCLOSED));
  const [copied, setCopied] = useState(false);
  const [copiedDraft, setCopiedDraft] = useState(false);

  const monitoring = useMemo(
    () => scoreMonitoring({ practiceIds: Array.from(practices) }),
    [practices],
  );
  const transparency = useMemo(
    () => scoreTransparency({ disclosedIds: Array.from(disclosed) }),
    [disclosed],
  );
  const draft = useMemo(
    () =>
      buildInformationRequest({
        practiceIds: Array.from(practices),
        gapIds: transparency.error ? [] : transparency.gaps.map((item) => item.id),
      }),
    [practices, transparency],
  );

  const toggle = (setter) => (id) =>
    setter((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const togglePractice = toggle(setPractices);
  const toggleDisclosed = toggle(setDisclosed);

  const summary = useMemo(() => {
    const lines = ["Workplace monitoring — where I stand"];
    if (!monitoring.error) {
      lines.push(
        `Coverage: ${MONITOR_LABEL[monitoring.band]} (${monitoring.score} of ${monitoring.maxScore}, ${NUM.format(monitoring.percent)}%)`,
        monitoring.summary,
        monitoring.boundaryNote,
      );
    }
    if (!transparency.error) {
      lines.push(
        "",
        `Disclosure: ${DISCLOSE_LABEL[transparency.band]} (${NUM.format(transparency.percent)}%)`,
        transparency.summary,
      );
      if (transparency.gapCount > 0) {
        lines.push("Not in writing:");
        transparency.gaps.forEach((gap) => lines.push(`- ${gap.label}`));
      }
    }
    return lines.join("\n");
  }, [monitoring, transparency]);

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const copyDraft = async () => {
    if (draft.error) return;
    try {
      await navigator.clipboard.writeText(draft.text);
      setCopiedDraft(true);
      setTimeout(() => setCopiedDraft(false), 1500);
    } catch {
      setCopiedDraft(false);
    }
  };

  const reset = () => {
    setPractices(new Set(DEFAULT_PRACTICES));
    setDisclosed(new Set(DEFAULT_DISCLOSED));
    setCopied(false);
    setCopiedDraft(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Eye className="h-4 w-4" aria-hidden="true" />
          Privacy rights
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Employee Monitoring Rights Explainer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          What thirteen common workplace monitoring practices actually capture, how much of it your
          employer has written down, and a request you can send to close the gaps. Everything stays
          in your browser.
        </p>
      </header>

      <section className={CARD} aria-labelledby="practices-heading">
        <h2 id="practices-heading" className="text-base font-semibold">
          What is in place?
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Weights describe how much of your life a practice can capture, not whether it is lawful.
          Items marked as reaching further can extend beyond work hours or work equipment.
        </p>
        <ul className="mt-4 space-y-2">
          {PRACTICES.map((item) => {
            const id = `practice-${item.id}`;
            return (
              <li key={item.id}>
                <label htmlFor={id} className={CHECK_ROW}>
                  <input
                    id={id}
                    type="checkbox"
                    checked={practices.has(item.id)}
                    onChange={() => togglePractice(item.id)}
                    className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)]"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{item.label}</span>
                      {item.crossesBoundary ? (
                        <span className="rounded-sm bg-[var(--danger-soft)] px-1.5 py-0.5 text-xs font-semibold text-[var(--danger)]">
                          reaches further
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 block leading-6 text-[var(--muted-foreground)]">
                      {item.sees}
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="coverage-heading">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              id="coverage-heading"
              className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]"
            >
              Coverage of your working life
            </h2>
            <p className={`mt-1 text-4xl font-semibold ${MONITOR_TEXT[monitoring.band]}`}>
              {monitoring.score}
              <span className="text-xl text-[var(--muted-foreground)]"> / {monitoring.maxScore}</span>
            </p>
            <p className={`mt-1 text-sm font-semibold ${MONITOR_TEXT[monitoring.band]}`}>
              {MONITOR_LABEL[monitoring.band]}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the monitoring assessment" className={GHOST_BTN}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset every selection" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div
          className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
          role="img"
          aria-label={`Coverage is ${NUM.format(monitoring.percent)} percent of the maximum`}
        >
          <span
            className={`block h-full ${monitoring.band === "pervasive" ? "bg-[var(--danger)]" : "bg-[var(--primary)]"}`}
            style={{ width: `${Math.max(0, Math.min(100, monitoring.percent))}%` }}
          />
        </div>

        <p className="mt-4 text-sm leading-6">{monitoring.summary}</p>

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {[
            ["Practices selected", `${monitoring.matchedCount} of ${monitoring.totalPractices}`],
            ["Share of maximum", `${NUM.format(monitoring.percent)}%`],
            ["Reaching beyond work", String(monitoring.boundaryCount)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-3 flex gap-2 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6">
          <ShieldAlert className="mt-1 h-4 w-4 shrink-0 text-[var(--warning)]" aria-hidden="true" />
          <span>{monitoring.boundaryNote}</span>
        </p>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="disclosure-heading">
        <h2 id="disclosure-heading" className="text-base font-semibold">
          What has your employer actually told you?
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Tick only what exists in writing — a policy, a notice, an email. A verbal reassurance is
          not a disclosure you can rely on later.
        </p>
        <ul className="mt-4 space-y-2">
          {DISCLOSURE_ITEMS.map((item) => {
            const id = `disclose-${item.id}`;
            return (
              <li key={item.id}>
                <label htmlFor={id} className={CHECK_ROW}>
                  <input
                    id={id}
                    type="checkbox"
                    checked={disclosed.has(item.id)}
                    onChange={() => toggleDisclosed(item.id)}
                    className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                  />
                  <span className="flex-1 leading-6">{item.label}</span>
                </label>
              </li>
            );
          })}
        </ul>

        <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Disclosure score
        </p>
        <p className={`mt-1 text-4xl font-semibold ${DISCLOSE_TEXT[transparency.band]}`}>
          {NUM.format(transparency.percent)}%
        </p>
        <p className={`mt-1 text-sm font-semibold ${DISCLOSE_TEXT[transparency.band]}`}>
          {DISCLOSE_LABEL[transparency.band]}
        </p>

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {[
            ["Items documented", `${transparency.disclosedCount} of ${transparency.totalItems}`],
            ["Weighted score", `${transparency.score} / ${transparency.maxScore}`],
            ["Gaps", String(transparency.gapCount)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6">
          {transparency.summary}
        </p>

        {transparency.gapCount > 0 && (
          <>
            <h3 className="mt-5 text-sm font-semibold">Not in writing</h3>
            <ul className="mt-2 space-y-1.5 text-sm text-[var(--muted-foreground)]">
              {transparency.gaps.map((gap) => (
                <li key={gap.id} className="flex gap-2 leading-6">
                  <span aria-hidden="true" className="text-[var(--warning)]">
                    &bull;
                  </span>
                  <span>{gap.label}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="draft-heading">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 id="draft-heading" className="text-base font-semibold">
            A request you can send
          </h2>
          <button
            type="button"
            onClick={copyDraft}
            aria-label="Copy the draft request to HR"
            className={GHOST_BTN}
          >
            {copiedDraft ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copiedDraft ? "Copied!" : "Copy draft"}
          </button>
        </div>

        {draft.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {draft.error}
          </p>
        ) : (
          <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-md bg-[var(--muted)] px-3 py-3 text-sm leading-6">
            {draft.text}
          </pre>
        )}
        <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
          Written in a neutral register on purpose. A request framed as wanting to work within the
          policy gets answered far more often than one framed as a complaint.
        </p>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="questions-heading">
        <h2 id="questions-heading" className="text-base font-semibold">
          Questions worth asking
        </h2>
        <ol className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
          {HR_QUESTIONS.map((question, index) => (
            <li key={question} className="flex gap-2 leading-6">
              <span aria-hidden="true" className="font-semibold text-[var(--primary)]">
                {index + 1}.
              </span>
              <span>{question}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="law-heading">
        <h2 id="law-heading" className="text-base font-semibold">
          The legal backdrop
        </h2>
        <dl className="mt-4 divide-y divide-[var(--border)]">
          {LEGAL_ANCHORS.map((item) => (
            <div key={item.id} className="py-3 first:pt-0 last:pb-0">
              <dt className="text-sm font-semibold">{item.name}</dt>
              <dd className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{item.detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice, and no substitute for reading your own contract and
        policies. Whether a particular practice is lawful depends on the jurisdiction, the sector and
        the facts — consult a qualified employment lawyer or your union representative before acting
        on anything here.
      </p>
    </main>
  );
}
