"use client";

import { useMemo, useState } from "react";
import { Check, Copy, House, RotateCcw } from "lucide-react";

import { LANGUAGES, MEALS, PUJAS, STYLES, buildInvitation } from "../lib";

const DEFAULTS = {
  hostNames: "Sharma Family",
  address: "Flat 402, Ashiana Heights\nSector 62, Noida",
  date: "2026-11-08",
  muhuratStart: "10:42",
  muhuratEnd: "12:06",
  puja: "vastu",
  meal: "lunch",
  language: "en",
  style: "traditional",
  rsvp: "",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const EM_DASH = "—";
const NUM = new Intl.NumberFormat("en-IN");

export default function ToolHome() {
  const [values, setValues] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const update = (key) => (event) =>
    setValues((current) => ({ ...current, [key]: event.target.value }));

  const result = useMemo(() => buildInvitation(values), [values]);

  const copyResult = async () => {
    if (result.error) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setValues(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <House className="h-4 w-4" aria-hidden="true" />
          Housewarming
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Griha Pravesh Invitation Wording
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the family name, the new address and the muhurat window and get complete griha
          pravesh invitation text in English, Hindi, Marathi or Gujarati.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="gp-hosts">
              Inviting family name
            </label>
            <input
              id="gp-hosts"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              value={values.hostNames}
              onChange={update("hostNames")}
              placeholder="Sharma Family"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="gp-address">
              Address of the new home
            </label>
            <textarea
              id="gp-address"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              rows={3}
              value={values.address}
              onChange={update("address")}
              placeholder={"Flat 402, Ashiana Heights\nSector 62, Noida"}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gp-date">
              Date
            </label>
            <input
              id="gp-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={values.date}
              onChange={update("date")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gp-puja">
              Puja being performed
            </label>
            <select
              id="gp-puja"
              className={`mt-2 ${INPUT_CLASS}`}
              value={values.puja}
              onChange={update("puja")}
            >
              {PUJAS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gp-start">
              Muhurat starts
            </label>
            <input
              id="gp-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={values.muhuratStart}
              onChange={update("muhuratStart")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gp-end">
              Muhurat ends (optional)
            </label>
            <input
              id="gp-end"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={values.muhuratEnd}
              onChange={update("muhuratEnd")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gp-meal">
              Meal
            </label>
            <select
              id="gp-meal"
              className={`mt-2 ${INPUT_CLASS}`}
              value={values.meal}
              onChange={update("meal")}
            >
              {MEALS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gp-language">
              Language
            </label>
            <select
              id="gp-language"
              className={`mt-2 ${INPUT_CLASS}`}
              value={values.language}
              onChange={update("language")}
            >
              {LANGUAGES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gp-style">
              Wording style
            </label>
            <select
              id="gp-style"
              className={`mt-2 ${INPUT_CLASS}`}
              value={values.style}
              onChange={update("style")}
            >
              {STYLES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gp-rsvp">
              RSVP contact (optional)
            </label>
            <input
              id="gp-rsvp"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              value={values.rsvp}
              onChange={update("rsvp")}
              placeholder="+91 98100 00000"
            />
          </div>
        </div>

        <div className="mt-4">
          <button type="button" onClick={reset} className={GHOST_BTN} aria-label="Reset all inputs">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Griha pravesh day
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {result.error ? EM_DASH : result.weekdayName}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {result.error ? "Fix the input to see the invitation" : result.dateText}
            </p>
          </div>
          <button
            type="button"
            onClick={copyResult}
            aria-label="Copy the griha pravesh invitation wording"
            className={PRIMARY_BTN}
            disabled={Boolean(result.error)}
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? "Copied!" : "Copy wording"}
          </button>
        </div>

        {result.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
        ) : (
          <>
            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Puja on the card", result.pujaName],
                ["Muhurat as printed", result.muhuratText],
                [
                  "Muhurat window",
                  result.windowMinutes === null
                    ? "Start time only"
                    : `${NUM.format(result.windowMinutes)} minutes`,
                ],
                ["Event heading", result.eventName],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-5 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <p lang={result.lang} className="whitespace-pre-line text-base leading-8">
                {result.text}
              </p>
            </div>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The weekday shown is calculated from the Gregorian date you entered. The muhurat itself comes
        from the panchang and should be confirmed with your priest before the cards are printed.
      </p>
    </main>
  );
}
