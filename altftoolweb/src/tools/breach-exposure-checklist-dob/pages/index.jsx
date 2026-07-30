"use client";

import { useMemo, useState } from "react";
import { Cake, Check, Copy, RotateCcw, TriangleAlert } from "lucide-react";

import {
  CHECKLIST,
  CRITICAL_CAP_PERCENT,
  DEFAULT_DONE,
  DEFAULT_FIELDS,
  GROUPS,
  IDENTITY_FIELDS,
  combinationRisk,
  scoreChecklist,
  windowLabel,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");

const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const CRITICAL_COUNT = CHECKLIST.filter((item) => item.critical).length;

export default function ToolHome() {
  const [done, setDone] = useState(() => DEFAULT_DONE.slice());
  const [fields, setFields] = useState(() => DEFAULT_FIELDS.slice());
  const [copied, setCopied] = useState(false);

  const score = useMemo(() => scoreChecklist(done), [done]);
  const risk = useMemo(() => combinationRisk(fields), [fields]);

  const toggleStep = (id) => {
    setDone((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
    setCopied(false);
  };

  const toggleField = (id) => {
    setFields((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
    setCopied(false);
  };

  const reset = () => {
    setDone(DEFAULT_DONE.slice());
    setFields(DEFAULT_FIELDS.slice());
    setCopied(false);
  };

  const hasScore = !score.error;
  const hasRisk = !risk.error;

  const summary = useMemo(() => {
    if (!hasScore) return "";
    const lines = [
      "Date of Birth Exposure Checklist",
      `Response score: ${score.percent}% — ${score.bandLabel}`,
      `Steps done: ${score.completed} of ${score.total}`,
      `Critical steps still open: ${score.missingCritical.length} of ${CRITICAL_COUNT}`,
    ];
    if (hasRisk) {
      lines.push(
        `Combination risk: ${risk.tierLabel} (${risk.points}/${risk.maxPoints})`,
        `Also exposed: ${
          risk.fields.length === 0 ? "date of birth only" : risk.fields.map((f) => f.label).join(", ")
        }`
      );
    }
    lines.push("");
    if (score.remaining.length === 0) {
      lines.push("Nothing left — every step is ticked.");
    } else {
      lines.push("Still to do:");
      for (const item of score.remaining) {
        lines.push(`- [${windowLabel(item.window)}] ${item.title}${item.critical ? " (critical)" : ""}`);
      }
    }
    return lines.join("\n");
  }, [hasScore, hasRisk, score, risk]);

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

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Cake className="h-4 w-4" aria-hidden="true" />
          Breach response
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Date of Birth Exposure Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A birth date cannot be reissued, so the response is to stop it working as a secret. Mark
          what else leaked to see how far the combination goes, then work through the steps that take
          the date out of your PINs, security answers and call-centre identity checks.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]" aria-labelledby="score-heading">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p
              id="score-heading"
              className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]"
            >
              Response score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasScore ? `${score.percent}%` : DASH}
            </p>
            <p className="mt-1 text-sm font-semibold">{hasScore ? score.bandLabel : DASH}</p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasScore ? score.bandHint : "Fix the problem shown below to see a score."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the date of birth exposure plan"
              className={GHOST_BTN}
            >
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

        <div
          className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
          role="img"
          aria-label={hasScore ? `Response score ${score.percent} out of 100` : "Score unavailable"}
        >
          <span
            className="block h-full bg-[var(--primary)]"
            style={{ width: `${hasScore ? score.percent : 0}%` }}
          />
        </div>

        {score.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {score.error}
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Steps completed", hasScore ? `${score.completed} of ${score.total}` : DASH],
            [
              "Weighted points",
              hasScore ? `${NUM.format(score.points)} / ${NUM.format(score.maxPoints)}` : DASH,
            ],
            [
              "Critical steps still open",
              hasScore ? `${score.missingCritical.length} of ${CRITICAL_COUNT}` : DASH,
            ],
            ["Combination risk", hasRisk ? risk.tierLabel : DASH],
            [
              "Combination points",
              hasRisk ? `${NUM.format(risk.points)} / ${NUM.format(risk.maxPoints)}` : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {hasScore && score.capped ? (
          <p className="mt-4 flex items-start gap-2 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              Held at {CRITICAL_CAP_PERCENT}% while a critical step is open. Nothing else matters while
              the date is still acting as a PIN or a security answer.
            </span>
          </p>
        ) : null}

        {hasScore && score.nextActions.length > 0 ? (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Do these next
            </p>
            <ol className="mt-2 space-y-1 text-sm">
              {score.nextActions.map((item) => (
                <li key={item.id} className="flex gap-2">
                  <span className="font-semibold text-[var(--primary)]">+{item.weight}</span>
                  <span>{item.title}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">What else was in the same leak?</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Tick the categories only &mdash; never type the values. A birth date on its own proves little;
          with a name and an address it completes the set most telephone identity checks accept.
        </p>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {IDENTITY_FIELDS.map((field) => (
            <label
              key={field.id}
              htmlFor={`field-${field.id}`}
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 transition hover:border-[var(--primary)]"
            >
              <input
                id={`field-${field.id}`}
                type="checkbox"
                checked={fields.includes(field.id)}
                onChange={() => toggleField(field.id)}
                className="h-5 w-5 shrink-0 accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              />
              <span className="min-w-0 text-sm font-medium">{field.label}</span>
            </label>
          ))}
        </div>

        {risk.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {risk.error}
          </p>
        ) : (
          <div className="mt-4 rounded-md border border-[var(--border)] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Combination risk
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--primary)]">{risk.tierLabel}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">{risk.tierHint}</p>
            <div
              className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Combination risk ${risk.percent} out of 100`}
            >
              <span
                className="block h-full bg-[var(--warning)]"
                style={{ width: `${risk.percent}%` }}
              />
            </div>
            {risk.kbaComplete ? (
              <p className="mt-3 flex items-start gap-2 text-sm text-[var(--warning)]">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  Name, address and date of birth together answer the standard telephone identity
                  questions. The verbal-password and port-out steps below are the ones that matter.
                </span>
              </p>
            ) : null}
            {risk.applicationGrade ? (
              <p className="mt-2 flex items-start gap-2 text-sm text-[var(--danger)]">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  With a government ID number in the same leak this is an application-grade set. Treat
                  it as identity theft risk and freeze credit.
                </span>
              </p>
            ) : null}
          </div>
        )}
      </section>

      <section className="mt-6 space-y-4">
        {GROUPS.map((group) => {
          const items = CHECKLIST.filter((item) => item.group === group);
          const groupStat = hasScore ? score.groups.find((entry) => entry.name === group) : null;
          return (
            <div key={group} className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-semibold">{group}</h2>
                <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                  {groupStat ? `${groupStat.done}/${groupStat.total} done` : DASH}
                </span>
              </div>
              <ul className="mt-3 space-y-2">
                {items.map((item) => (
                  <li key={item.id}>
                    <label
                      htmlFor={`step-${item.id}`}
                      className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 transition hover:border-[var(--primary)]"
                    >
                      <input
                        id={`step-${item.id}`}
                        type="checkbox"
                        checked={done.includes(item.id)}
                        onChange={() => toggleStep(item.id)}
                        className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                      />
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold">{item.title}</span>
                          {item.critical ? (
                            <span className="rounded-full bg-[var(--danger-soft)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--danger)]">
                              Critical
                            </span>
                          ) : null}
                          <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[11px] font-semibold text-[var(--muted-foreground)]">
                            {windowLabel(item.window)}
                          </span>
                          <span className="text-[11px] font-semibold text-[var(--muted-foreground)]">
                            +{item.weight}
                          </span>
                        </span>
                        <span className="mt-1 block text-sm leading-6 text-[var(--muted-foreground)]">
                          {item.detail}
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Mistakes worth avoiding</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
          <li>
            Hiding the birthday on social media and stopping there, while the card PIN is still DDMM.
          </li>
          <li>
            Answering a security question truthfully. A stored random phrase is a better answer than a
            fact anyone can look up.
          </li>
          <li>
            Assuming SMS codes are safe. A birth date is often all a call centre needs before
            authorising a SIM swap.
          </li>
          <li>
            Emailing a full ID scan to prove the breach. That hands over the date, the number, the
            photo and the signature in one file.
          </li>
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, and not legal or financial advice. The page never asks for your actual
        birth date and nothing you tick leaves this browser tab. If money has already moved, contact
        your bank and the relevant cybercrime authority straight away.
      </p>
    </main>
  );
}
