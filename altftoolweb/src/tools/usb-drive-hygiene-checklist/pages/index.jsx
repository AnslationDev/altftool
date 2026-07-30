"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ShieldAlert, ShieldCheck, TriangleAlert, Usb } from "lucide-react";

import { CONTROLS, SCENARIOS, assessUsbScenario, formatUsbAssessment } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const TONE_CLASS = {
  danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
  warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
  success: "bg-[var(--success-soft)] text-[var(--success)]",
  primary: "bg-[var(--muted)] text-[var(--primary)]",
};

const DEFAULTS = {
  scenario: "found",
  controls: [],
};

const DASH = "—";

export default function ToolHome() {
  const [scenario, setScenario] = useState(DEFAULTS.scenario);
  const [controls, setControls] = useState(DEFAULTS.controls);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => assessUsbScenario({ scenario, controls }), [scenario, controls]);
  const summary = useMemo(() => formatUsbAssessment(result), [result]);
  const hasResult = !result.error;

  const toggleControl = (id) => {
    setControls((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
    setCopied(false);
  };

  const reset = () => {
    setScenario(DEFAULTS.scenario);
    setControls(DEFAULTS.controls);
    setCopied(false);
  };

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
          <Usb className="h-4 w-4" aria-hidden="true" />
          USB safety
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">USB Drive Hygiene Checklist</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The same drive is a different risk depending on where it came from, and the habit you rely
          on may not touch the threat that actually applies. Pick your situation, tick the controls you
          have in place, and see what is really left over &mdash; including which controls only feel
          like protection.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <label className={LABEL_CLASS} htmlFor="usb-scenario">
          Your USB situation
        </label>
        <select
          id="usb-scenario"
          className={`mt-2 ${INPUT_CLASS}`}
          value={scenario}
          onChange={(event) => {
            setScenario(event.target.value);
            setCopied(false);
          }}
        >
          {SCENARIOS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>

        {hasResult ? (
          <div className="mt-4 rounded-lg border border-[var(--border)] p-4">
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE_CLASS[result.scenario.ruleTone]}`}
            >
              {result.scenario.rule}
            </span>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              {result.scenario.detail}
            </p>
          </div>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Controls you already have</h2>
        <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
          Each control only reduces the threats listed against it. Leaving one unticked is honest &mdash;
          it keeps the score accurate.
        </p>
        <div className="mt-4 space-y-3">
          {CONTROLS.map((item) => (
            <div key={item.id}>
              <label
                htmlFor={`control-${item.id}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-sm leading-6"
              >
                <input
                  id={`control-${item.id}`}
                  type="checkbox"
                  className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                  checked={controls.includes(item.id)}
                  onChange={() => toggleControl(item.id)}
                />
                <span>{item.label}</span>
              </label>
              {controls.includes(item.id) && item.note ? (
                <p className="mt-1 pl-8 text-sm leading-6 text-[var(--muted-foreground)]">{item.note}</p>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        aria-labelledby="score-heading"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p
              id="score-heading"
              className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]"
            >
              Residual risk
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasResult ? `${result.riskScore}/100` : DASH}
            </p>
            <p className="mt-1 text-sm font-semibold">{hasResult ? result.band.label : DASH}</p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasResult
                ? `${result.controlsInPlace} control(s) in place · ${result.coverage}% covered for this scenario.`
                : "Choose a scenario to see a score."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the USB risk assessment"
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
          aria-label={hasResult ? `Residual risk ${result.riskScore} out of 100` : "Score unavailable"}
        >
          <span
            className={`block h-full ${hasResult && result.band.tone === "success" ? "bg-[var(--success)]" : hasResult && result.band.tone === "warning" ? "bg-[var(--warning)]" : "bg-[var(--danger)]"}`}
            style={{ width: `${hasResult ? result.riskScore : 0}%` }}
          />
        </div>

        {result.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
        ) : null}

        {hasResult ? (
          <div className="mt-5 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Threats, largest residual first
            </p>
            {result.rows.map((row) => (
              <div key={row.id} className="rounded-md border border-[var(--border)] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{row.label}</span>
                  <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                    {row.reductionPercent}% covered
                  </span>
                </div>
                <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{row.detail}</p>
                <div
                  className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                  role="img"
                  aria-label={`${row.label}: residual ${row.residual} of ${row.weight}`}
                >
                  <span
                    className={`block h-full ${row.uncovered ? "bg-[var(--danger)]" : "bg-[var(--warning)]"}`}
                    style={{ width: `${row.weight > 0 ? Math.min(100, (row.residual / row.weight) * 100) : 0}%` }}
                  />
                </div>
                {row.uncovered ? (
                  <p className="mt-1 text-xs font-semibold text-[var(--danger)]">No active control touches this</p>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {hasResult && result.falseComfort.length > 0 ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <ShieldAlert className="h-4 w-4 text-[var(--danger)]" aria-hidden="true" />
            False comfort
          </h2>
          <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
            These controls are in place, but they do not touch the largest threat left in this scenario.
          </p>
          <ul className="mt-3 space-y-2">
            {result.falseComfort.map((item) => (
              <li
                key={item.id}
                className="flex items-start gap-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm leading-6 text-[var(--danger)]"
              >
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  <span className="font-semibold">{item.label}</span> &mdash; {item.detail}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {hasResult && result.gaps.length > 0 ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Uncovered threats</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.gaps.map((item) => (
              <li key={item.id}>
                <span className="font-semibold text-[var(--foreground)]">{item.label}.</span> {item.detail}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {hasResult && result.suggestions.length > 0 ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <ShieldCheck className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
            Biggest wins available
          </h2>
          <ol className="mt-3 space-y-2 text-sm leading-6">
            {result.suggestions.map((item) => (
              <li key={item.id} className="flex gap-2">
                <span className="font-semibold text-[var(--primary)]">+{item.gain}</span>
                <span>{item.label}</span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Follow your own organisation&apos;s removable media policy where one
        exists. Nothing you select here leaves this browser tab.
      </p>
    </main>
  );
}
