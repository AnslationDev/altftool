"use client";

import { useMemo, useState } from "react";
import { BedDouble, Check, Copy, RotateCcw } from "lucide-react";
import {
  ALL_ITEMS,
  ITEM_GROUPS,
  MAX_INDEX,
  SENSITIVITY,
  TIER_LABEL,
  assessHotelRoom,
  formatHotelResult,
} from "../lib";

const INPUT_CLASS =
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

const DEFAULT_DONE = ["deadbolt", "doorClosed", "wifiName", "safeCode"];
const DEFAULT_NIGHTS = "3";
const DEFAULT_SENSITIVITY = "business";

const DASH = "—";

export default function ToolHome() {
  const [done, setDone] = useState(DEFAULT_DONE);
  const [nights, setNights] = useState(DEFAULT_NIGHTS);
  const [sensitivity, setSensitivity] = useState(DEFAULT_SENSITIVITY);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => assessHotelRoom({ doneIds: done, nights: nights === "" ? Number.NaN : nights, sensitivity }),
    [done, nights, sensitivity],
  );
  const summary = useMemo(() => formatHotelResult(result), [result]);
  const failed = Boolean(result.error);

  const toggle = (id) => {
    setDone((current) =>
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
    setDone(DEFAULT_DONE);
    setNights(DEFAULT_NIGHTS);
    setSensitivity(DEFAULT_SENSITIVITY);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BedDouble className="h-4 w-4" aria-hidden="true" />
          Travel security
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Hotel Room Tech Safety Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Eighteen actions across the door, the smart TV, the room network and the safe. Tick what you
          have done and the rest come back ranked, so the first ten minutes cover what actually
          matters.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="hotel-nights">
              Nights in this room
            </label>
            <input
              id="hotel-nights"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="365"
              step="1"
              value={nights}
              onChange={(event) => {
                setNights(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hotel-sensitivity">
              What are you travelling with?
            </label>
            <select
              id="hotel-sensitivity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sensitivity}
              onChange={(event) => {
                setSensitivity(event.target.value);
                setCopied(false);
              }}
            >
              {SENSITIVITY.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {ITEM_GROUPS.map((group) => (
        <section key={group.id} className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">{group.title}</h2>
          <div className="mt-3 grid gap-2">
            {group.items.map((item) => {
              const checked = done.includes(item.id);
              return (
                <label
                  key={item.id}
                  htmlFor={`item-${item.id}`}
                  className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 text-sm leading-6 transition ${
                    checked
                      ? "border-[var(--primary)] bg-[var(--primary)]/5"
                      : "border-[var(--border)] bg-[var(--background)]"
                  }`}
                >
                  <input
                    id={`item-${item.id}`}
                    type="checkbox"
                    className="mt-1.5 h-4 w-4 shrink-0 accent-[var(--primary)]"
                    checked={checked}
                    onChange={() => toggle(item.id)}
                  />
                  <span>
                    <span className="font-medium">{item.label}</span>
                    {item.tier === "critical" && (
                      <span className="ml-2 rounded-full bg-[var(--warning-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--warning)]">
                        {TIER_LABEL.critical}
                      </span>
                    )}
                    <span className="block text-[var(--muted-foreground)]">{item.how}</span>
                  </span>
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
            setDone(ALL_ITEMS.map((item) => item.id));
            setCopied(false);
          }}
          className={GHOST_BTN}
        >
          Mark everything done
        </button>
        <button
          type="button"
          onClick={() => {
            setDone([]);
            setCopied(false);
          }}
          className={GHOST_BTN}
        >
          Start a fresh check-in
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Room exposure index
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
              aria-label="Copy the hotel room checklist result"
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
            ["Actions completed", failed ? DASH : `${result.done.length} of ${ALL_ITEMS.length}`],
            ["Coverage by weight", failed ? DASH : `${result.coverage}%`],
            ["Outstanding weight", failed ? DASH : `${result.rawGap} of ${result.maxRaw}`],
            ["Stay multiplier", failed ? DASH : `x${result.stayFactor} for ${result.nights} night(s)`],
            ["Combined multiplier", failed ? DASH : `x${result.multiplier}`],
            ["First-ten-minutes items left", failed ? DASH : String(result.firstTenMinutes.length)],
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

      {!failed && result.outstanding.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Still to do, highest impact first</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Action</th>
                  <th scope="col" className="py-2 text-right font-semibold">Priority</th>
                </tr>
              </thead>
              <tbody>
                {result.outstanding.map((item) => (
                  <tr key={item.id} className="border-b border-[var(--border)] align-top last:border-0">
                    <td className="py-2 pr-3 leading-6">
                      <span className="font-semibold">{item.label}</span>
                      <span className="block text-[var(--muted-foreground)]">{item.how}</span>
                    </td>
                    <td className="py-2 text-right font-semibold whitespace-nowrap">{TIER_LABEL[item.tier]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Hidden cameras in hotel rooms are rare and a visual sweep cannot rule them
        out completely; if you find a device you believe is recording, do not dismantle it — leave the
        room, tell the property, and contact the police, who will need it left in place as evidence.
      </p>
    </main>
  );
}
