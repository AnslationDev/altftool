"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PlugZap, RotateCcw } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import {
  CABLES,
  LOCK_STATES,
  MAX_INDEX,
  NON_MITIGATIONS,
  OS_STATES,
  POWER_SOURCES,
  RISK_FLAGS,
  assessJuiceJacking,
  formatExposure,
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

const DEFAULTS = {
  powerSource: "publicUsbPort",
  cable: "ownData",
  lockState: "lockedNearby",
  osState: "current",
  flags: [],
};

const DASH = "—";

export default function ToolHome() {
  const [powerSource, setPowerSource] = useState(DEFAULTS.powerSource);
  const [cable, setCable] = useState(DEFAULTS.cable);
  const [lockState, setLockState] = useState(DEFAULTS.lockState);
  const [osState, setOsState] = useState(DEFAULTS.osState);
  const [flags, setFlags] = useState(DEFAULTS.flags);
  const { copy, isCopied, announcement, reset: resetCopyState } = useCopyToClipboard();

  const result = useMemo(
    () => assessJuiceJacking({ powerSource, cable, lockState, osState, flags }),
    [powerSource, cable, lockState, osState, flags],
  );
  const summary = useMemo(() => formatExposure(result), [result]);
  const failed = Boolean(result.error);

  const toggleFlag = (id) => {
    setFlags((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
    resetCopyState();
  };

  const copyResult = () => copy("summary", summary, { label: "Juice jacking exposure result" });

  const reset = () => {
    setPowerSource(DEFAULTS.powerSource);
    setCable(DEFAULTS.cable);
    setLockState(DEFAULTS.lockState);
    setOsState(DEFAULTS.osState);
    setFlags(DEFAULTS.flags);
    resetCopyState();
  };

  const selects = [
    ["jj-source", "What are you plugging into?", POWER_SOURCES, powerSource, setPowerSource],
    ["jj-cable", "Which cable?", CABLES, cable, setCable],
    ["jj-lock", "Is the phone locked while it charges?", LOCK_STATES, lockState, setLockState],
    ["jj-os", "How current is the operating system?", OS_STATES, osState, setOsState],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <PlugZap className="h-4 w-4" aria-hidden="true" />
          Public charging
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Juice Jacking Risk Explainer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Juice jacking needs a USB data path. Describe your charging setup and this shows whether one
          exists at all, how much the phone&apos;s own defences already close it, and which fix removes
          the rest.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {selects.map(([id, label, options, value, setValue]) => (
            <div key={id}>
              <label className={LABEL_CLASS} htmlFor={id}>
                {label}
              </label>
              <select
                id={id}
                className={`mt-2 ${SELECT_CLASS}`}
                value={value}
                onChange={(event) => {
                  setValue(event.target.value);
                  resetCopyState();
                }}
              >
                {options.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <fieldset className="mt-6">
          <legend className="text-sm font-semibold">Anything else true of this phone?</legend>
          <div className="mt-2 grid gap-2">
            {RISK_FLAGS.map((flag) => {
              const checked = flags.includes(flag.id);
              return (
                <label
                  key={flag.id}
                  htmlFor={`flag-${flag.id}`}
                  className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 text-sm leading-6 transition ${
                    checked
                      ? "border-[var(--primary)] bg-[var(--primary)]/5"
                      : "border-[var(--border)] bg-[var(--background)]"
                  }`}
                >
                  <input
                    id={`flag-${flag.id}`}
                    type="checkbox"
                    className="mt-1.5 h-4 w-4 shrink-0 accent-[var(--primary)]"
                    checked={checked}
                    onChange={() => toggleFlag(flag.id)}
                  />
                  <span>{flag.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Relative exposure index
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
              aria-label={
                isCopied("summary")
                  ? "Copied the juice jacking exposure result to clipboard"
                  : "Copy the juice jacking exposure result"
              }
              className={GHOST_BTN}
              disabled={failed}
            >
              {isCopied("summary") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("summary") ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
            <span className="sr-only" role="status" aria-live="polite">
              {announcement}
            </span>
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
            ["USB data path in this setup", failed ? DASH : result.dataPathPresent ? "Present" : "None — attack not possible"],
            ["Combined multiplier on the base risk", failed ? DASH : `x${result.multiplier}`],
            ["Amplifiers switched on", failed ? DASH : result.flags.length > 0 ? result.flags.map((flag) => flag.label).join(", ") : "None"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="max-w-[60%] text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6">{result.band.advice}</p>
        )}
      </section>

      {!failed && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Why the number came out this way</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Factor</th>
                  <th scope="col" className="py-2 text-right font-semibold">Effect</th>
                </tr>
              </thead>
              <tbody>
                {result.drivers.map((driver) => (
                  <tr key={driver.label} className="border-b border-[var(--border)] last:border-0 align-top">
                    <td className="py-2 pr-3 leading-6">
                      <span className="font-semibold">{driver.label}</span>
                      <span className="block text-[var(--muted-foreground)]">{driver.note}</span>
                    </td>
                    <td className="py-2 text-right font-semibold whitespace-nowrap">{driver.effect}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {!failed && result.fixes.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">What actually closes it</h2>
          <dl className="mt-3 grid gap-3 text-sm leading-6">
            {result.fixes.map(([title, detail]) => (
              <div key={title}>
                <dt className="font-semibold">{title}</dt>
                <dd className="text-[var(--muted-foreground)]">{detail}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What does not help against this</h2>
        <dl className="mt-3 grid gap-3 text-sm leading-6 sm:grid-cols-2">
          {NON_MITIGATIONS.map(([title, detail]) => (
            <div key={title}>
              <dt className="font-semibold">{title}</dt>
              <dd className="text-[var(--muted-foreground)]">{detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, and deliberately unalarmed: public advisories exist, but publicly
        documented victim cases of juice jacking remain scarce, and a locked modern phone will not
        hand over data without your tap. The index is a relative comparison of setups, not a
        probability of being attacked.
      </p>
    </main>
  );
}
