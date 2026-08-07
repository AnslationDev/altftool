"use client";

import { useMemo, useState } from "react";
import { Briefcase, Check, Copy, RotateCcw } from "lucide-react";
import {
  BUSYNESS,
  CATEGORIES,
  CONTROLS,
  MAX_INDEX,
  SEAT_TYPES,
  assessCoworking,
  formatCoworkingResult,
} from "../lib";

const SELECT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const TONE_TEXT = {
  danger: "text-[var(--danger)]",
  warning: "text-[var(--warning)]",
  success: "text-[var(--success)]",
};
const TONE_BAR = {
  danger: "bg-[var(--danger)]",
  warning: "bg-[var(--warning)]",
  success: "bg-[var(--success)]",
};

const DEFAULT_IN_PLACE = ["autoLock", "diskEncryption", "wifiName", "noTailgate", "printCollect", "clearDesk"];
const DEFAULT_SEAT = "hotDesk";
const DEFAULT_BUSYNESS = "normal";

const DASH = "—";

export default function ToolHome() {
  const [inPlace, setInPlace] = useState(DEFAULT_IN_PLACE);
  const [seatType, setSeatType] = useState(DEFAULT_SEAT);
  const [busyness, setBusyness] = useState(DEFAULT_BUSYNESS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => assessCoworking({ inPlace, seatType, busyness }),
    [inPlace, seatType, busyness],
  );
  const summary = useMemo(() => formatCoworkingResult(result), [result]);
  const failed = Boolean(result.error);

  const toggle = (id) => {
    setInPlace((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
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

  const reset = () => {
    setInPlace(DEFAULT_IN_PLACE);
    setSeatType(DEFAULT_SEAT);
    setBusyness(DEFAULT_BUSYNESS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Briefcase className="h-4 w-4" aria-hidden="true" />
          Shared workspace
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Coworking Space Security Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          In a shared office the risk is people with legitimate access to your floor. These twenty
          controls are grouped into five categories and scored separately, so you can see which one is
          weak rather than one averaged number.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cw-seat">
              Where do you sit?
            </label>
            <select
              id="cw-seat"
              className={`mt-2 ${SELECT_CLASS}`}
              value={seatType}
              onChange={(event) => {
                setSeatType(event.target.value);
                setCopied(false);
              }}
            >
              {SEAT_TYPES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cw-busy">
              How busy is the floor?
            </label>
            <select
              id="cw-busy"
              className={`mt-2 ${SELECT_CLASS}`}
              value={busyness}
              onChange={(event) => {
                setBusyness(event.target.value);
                setCopied(false);
              }}
            >
              {BUSYNESS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {!failed && (
          <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">{result.seat.note}</p>
        )}
      </section>

      {CATEGORIES.map((category) => (
        <section key={category.id} className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">{category.label}</h2>
          <div className="mt-3 grid gap-2">
            {CONTROLS.filter((control) => control.category === category.id).map((control) => {
              const checked = inPlace.includes(control.id);
              return (
                <label
                  key={control.id}
                  htmlFor={`cw-${control.id}`}
                  className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 text-sm leading-6 transition ${
                    checked
                      ? "border-[var(--primary)] bg-[var(--primary)]/5"
                      : "border-[var(--border)] bg-[var(--background)]"
                  }`}
                >
                  <input
                    id={`cw-${control.id}`}
                    type="checkbox"
                    className="mt-1.5 h-4 w-4 shrink-0 accent-[var(--primary)]"
                    checked={checked}
                    onChange={() => toggle(control.id)}
                  />
                  <span>{control.label}</span>
                </label>
              );
            })}
          </div>
        </section>
      ))}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setInPlace(CONTROLS.map((control) => control.id));
            setCopied(false);
          }}
          className={GHOST_BTN}
        >
          Tick everything
        </button>
        <button
          type="button"
          onClick={() => {
            setInPlace([]);
            setCopied(false);
          }}
          className={GHOST_BTN}
        >
          Clear all
        </button>
      </div>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Workspace exposure index
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                failed ? "text-[var(--muted-foreground)]" : TONE_TEXT[result.band.tone]
              }`}
            >
              {failed ? DASH : `${result.index}/${MAX_INDEX}`}
            </p>
            <p className="mt-1 text-sm font-semibold">{failed ? DASH : result.band.label}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the coworking security result"
              className={GHOST_BTN}
              disabled={failed}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
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
          aria-label={failed ? "Exposure unavailable" : `Exposure index ${result.index} out of ${MAX_INDEX}`}
        >
          {!failed && (
            <span
              className={`block h-full ${TONE_BAR[result.band.tone]}`}
              style={{ width: `${Math.max(2, result.index)}%` }}
            />
          )}
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Controls in place", failed ? DASH : `${result.done.length} of ${CONTROLS.length}`],
            ["Coverage by weight", failed ? DASH : `${result.coverage}%`],
            ["Unprotected weight", failed ? DASH : `${result.rawGap} of ${result.maxRaw}`],
            ["Setting multiplier", failed ? DASH : `x${result.multiplier}`],
            ["Weakest category", failed ? DASH : result.weakest ? result.weakest.label : "None — all covered"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6">{result.band.advice}</p>
        )}
      </section>

      {!failed && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Coverage by category</h2>
          <ul className="mt-3 grid gap-3">
            {result.categories.map((category) => (
              <li key={category.id}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium">{category.label}</span>
                  <span className="font-semibold">{category.coverage}%</span>
                </div>
                <div
                  className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                  role="img"
                  aria-label={`${category.label}: ${category.coverage} percent covered`}
                >
                  <span
                    className={`block h-full ${category.coverage >= 80 ? "bg-[var(--success)]" : category.coverage >= 50 ? "bg-[var(--warning)]" : "bg-[var(--danger)]"}`}
                    style={{ width: `${Math.max(2, category.coverage)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!failed && result.missing.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Close these, highest impact first</h2>
          <ol className="mt-3 grid gap-3 text-sm leading-6">
            {result.missing.map((control, index) => (
              <li key={control.id} className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-xs font-semibold text-[var(--primary)]">
                  {index + 1}
                </span>
                <span>
                  <span className="font-semibold">{control.label}</span>
                  <span className="block text-[var(--muted-foreground)]">{control.fix}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Where you handle client, health or payment data, your contractual and
        regulatory obligations come first — use this as a habit check, not as evidence of compliance.
      </p>
    </main>
  );
}
