"use client";

import { useMemo, useState } from "react";
import { Check, Copy, KeyRound, RotateCcw } from "lucide-react";

import {
  DEFAULT_OVERLAP_DAYS,
  REVOCATION_STEPS,
  ROTATION_PRESETS,
  computeRotationPlan,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const STATUS_COPY = {
  overdue: "Rotation is overdue — rotate now and restart the cadence from today.",
  "due-today": "Rotation is due today.",
  "due-soon": "Rotation falls inside the overlap window — start the swap now.",
  "on-track": "The key is inside its cryptoperiod.",
};

const todayIso = () => new Date().toISOString().slice(0, 10);

const buildDefaults = () => ({
  presetId: ROTATION_PRESETS[1].id, // standard 90-day baseline
  lastRotated: todayIso(),
  intervalDays: String(ROTATION_PRESETS[1].intervalDays),
  overlapDays: String(DEFAULT_OVERLAP_DAYS),
  referenceDate: todayIso(),
});

export default function ToolHome() {
  const initial = useMemo(() => buildDefaults(), []);
  const [presetId, setPresetId] = useState(initial.presetId);
  const [lastRotated, setLastRotated] = useState(initial.lastRotated);
  const [intervalDays, setIntervalDays] = useState(initial.intervalDays);
  const [overlapDays, setOverlapDays] = useState(initial.overlapDays);
  const [referenceDate, setReferenceDate] = useState(initial.referenceDate);
  const [copied, setCopied] = useState(false);

  const preset = ROTATION_PRESETS.find((p) => p.id === presetId) ?? ROTATION_PRESETS[1];

  const result = useMemo(
    () =>
      computeRotationPlan({
        lastRotatedDate: lastRotated,
        intervalDays: intervalDays.trim() === "" ? Number.NaN : Number(intervalDays),
        overlapDays: overlapDays.trim() === "" ? Number.NaN : Number(overlapDays),
        referenceDate,
      }),
    [lastRotated, intervalDays, overlapDays, referenceDate],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "API key rotation plan",
      `Last rotated: ${lastRotated}`,
      `Interval: ${result.intervalDays} days (${NUM.format(result.rotationsPerYear)} rotations/year)`,
      `Overlap window: ${result.overlapDays} days`,
      `Status: ${STATUS_COPY[result.status]}`,
      `Next rotation due: ${result.nextDue}`,
      "Upcoming schedule:",
      ...result.schedule.map(
        (s, i) =>
          `  ${i + 1}. Rotate ${s.immediate ? "immediately on" : "on"} ${s.rotateOn}, revoke the old key by ${s.revokeOldBy}`,
      ),
      "Revocation runbook:",
      ...REVOCATION_STEPS.map(([title], i) => `  ${i + 1}. ${title}`),
    ];
    return lines.join("\n");
  }, [hasError, result, lastRotated]);

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
    const next = buildDefaults();
    setPresetId(next.presetId);
    setLastRotated(next.lastRotated);
    setIntervalDays(next.intervalDays);
    setOverlapDays(next.overlapDays);
    setReferenceDate(next.referenceDate);
    setCopied(false);
  };

  const applyPreset = (id) => {
    setPresetId(id);
    const chosen = ROTATION_PRESETS.find((p) => p.id === id);
    if (chosen) setIntervalDays(String(chosen.intervalDays));
  };

  const statusIsBad = result.status === "overdue" || result.status === "due-today";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <KeyRound className="h-4 w-4" aria-hidden="true" />
          AI governance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          API Key Rotation Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Set a rotation cadence for your AI API keys from their exposure level, see the next due
          dates with a dual-key overlap window, and follow a six-step revocation runbook. Based on
          the NIST SP 800-57 cryptoperiod concept and the 90-day baseline cloud providers
          recommend.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="kr-preset">
              Key exposure level
            </label>
            <select
              id="kr-preset"
              className={`mt-2 ${INPUT_CLASS}`}
              value={presetId}
              onChange={(event) => applyPreset(event.target.value)}
            >
              {ROTATION_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} — every {p.intervalDays} days
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">{preset.note}</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kr-last">
              Key created / last rotated on
            </label>
            <input
              id="kr-last"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={lastRotated}
              onChange={(event) => setLastRotated(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kr-ref">
              Plan as of
            </label>
            <input
              id="kr-ref"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={referenceDate}
              onChange={(event) => setReferenceDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kr-interval">
              Rotation interval (days)
            </label>
            <input
              id="kr-interval"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={intervalDays}
              onChange={(event) => setIntervalDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kr-overlap">
              Dual-key overlap window (days)
            </label>
            <input
              id="kr-overlap"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={overlapDays}
              onChange={(event) => setOverlapDays(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Days both keys stay valid so every service picks up the new key before the old one
              is revoked.
            </p>
          </div>
        </div>
      </section>

      {hasError ? (
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
              Next rotation due
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                !hasError && statusIsBad ? "text-[var(--danger)]" : "text-[var(--primary)]"
              }`}
            >
              {hasError ? DASH : result.nextDue}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see a plan." : STATUS_COPY[result.status]}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the rotation plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(hasError
            ? [
                ["Key age", DASH],
                ["Days until due", DASH],
                ["Rotations per year", DASH],
              ]
            : [
                ["Key age", `${result.keyAgeDays} days`],
                [
                  result.status === "overdue" ? "Days overdue" : "Days until due",
                  `${result.status === "overdue" ? result.overdueDays : result.daysUntilDue} days`,
                ],
                ["Rotations per year at this cadence", NUM.format(result.rotationsPerYear)],
                ["Overlap window", `${result.overlapDays} days`],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <h2 className="mt-6 text-base font-semibold">Upcoming rotation schedule</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[360px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  #
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Rotate on
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Revoke old key by
                </th>
              </tr>
            </thead>
            <tbody>
              {hasError ? (
                <tr>
                  <td colSpan={3} className="py-3 text-center">
                    {DASH}
                  </td>
                </tr>
              ) : (
                result.schedule.map((s, i) => (
                  <tr key={s.rotateOn} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{i + 1}</td>
                    <td className="py-2 pr-3 font-semibold">
                      {s.rotateOn}
                      {s.immediate ? (
                        <span className="ml-2 rounded-full bg-[var(--danger-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--danger)]">
                          now
                        </span>
                      ) : null}
                    </td>
                    <td className="py-2 text-right">{s.revokeOldBy}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Revocation runbook</h2>
        <ol className="mt-3 space-y-3">
          {REVOCATION_STEPS.map(([title, detail], i) => (
            <li key={title} className="flex gap-3 text-sm">
              <span
                className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-xs font-bold text-[var(--primary)]"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <span>
                <span className="font-semibold">{title}.</span>{" "}
                <span className="text-[var(--muted-foreground)]">{detail}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational planning aid only. Follow your organisation's security policy and your AI
        provider's own key-management documentation; if a key may already be compromised, revoke it
        immediately rather than waiting for a scheduled window.
      </p>
    </main>
  );
}
