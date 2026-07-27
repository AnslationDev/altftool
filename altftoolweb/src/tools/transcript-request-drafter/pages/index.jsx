"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ScrollText } from "lucide-react";

import {
  ADDRESSEE_OPTIONS,
  DELIVERY_OPTIONS,
  MAX_COPIES,
  MIN_COPIES,
  PURPOSE_OPTIONS,
  buildTranscriptRequest,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  studentName: "Priya Nair",
  enrollmentNumber: "REG/2018/04521",
  program: "B.Sc Physics",
  specialization: "",
  studyFrom: "2018",
  studyTo: "2021",
  yearOfPassing: "2021",
  copies: "3",
  addresseeId: "coe",
  universityName: "University of Kerala",
  universityCity: "Thiruvananthapuram, Kerala",
  deliveryId: "agency",
  deliveryAddress: "WES, Attn: Documentation Center, Ref No. 1234567 — via WES document portal",
  purposeId: "wes",
  customPurpose: "",
  letterDate: "2026-07-26",
  contact: "priya.nair@example.com",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const result = useMemo(() => buildTranscriptRequest(form), [form]);
  const hasError = Boolean(result.error);
  const delivery = DELIVERY_OPTIONS.find((option) => option.id === form.deliveryId);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.letter);
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

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ScrollText className="h-4 w-4" aria-hidden="true" />
          Document Vault
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Transcript Request Drafter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Draft a complete transcript application to your university's Controller of Examinations or
          Registrar — with sets required, delivery mode and the enclosure checklist.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="trd-name">
              Full name (as on records)
            </label>
            <input id="trd-name" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.studentName} onChange={set("studentName")} autoComplete="name" />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="trd-enrol">
              Enrolment / registration number
            </label>
            <input id="trd-enrol" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.enrollmentNumber} onChange={set("enrollmentNumber")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="trd-program">
              Programme
            </label>
            <input id="trd-program" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.program} onChange={set("program")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="trd-spec">
              Specialisation / branch (optional)
            </label>
            <input id="trd-spec" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.specialization} onChange={set("specialization")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="trd-from">
              Study period — start year
            </label>
            <input id="trd-from" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="numeric" min="1950" max="2100" value={form.studyFrom} onChange={set("studyFrom")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="trd-to">
              Study period — end year
            </label>
            <input id="trd-to" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="numeric" min="1950" max="2100" value={form.studyTo} onChange={set("studyTo")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="trd-pass">
              Year of passing
            </label>
            <input id="trd-pass" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="numeric" min="1950" max="2100" value={form.yearOfPassing} onChange={set("yearOfPassing")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="trd-copies">
              Transcript sets required ({MIN_COPIES}–{MAX_COPIES})
            </label>
            <input id="trd-copies" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="numeric" min={MIN_COPIES} max={MAX_COPIES} step="1" value={form.copies} onChange={set("copies")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="trd-addressee">
              Addressed to
            </label>
            <select id="trd-addressee" className={`mt-2 ${INPUT_CLASS}`} value={form.addresseeId} onChange={set("addresseeId")}>
              {ADDRESSEE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="trd-university">
              University / college name
            </label>
            <input id="trd-university" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.universityName} onChange={set("universityName")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="trd-city">
              University city (optional)
            </label>
            <input id="trd-city" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.universityCity} onChange={set("universityCity")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="trd-purpose">
              Purpose
            </label>
            <select id="trd-purpose" className={`mt-2 ${INPUT_CLASS}`} value={form.purposeId} onChange={set("purposeId")}>
              {PURPOSE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {form.purposeId === "other" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="trd-custom">
                Describe your purpose
              </label>
              <input id="trd-custom" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.customPurpose} onChange={set("customPurpose")} />
            </div>
          ) : null}
          <div>
            <label className={LABEL_CLASS} htmlFor="trd-delivery">
              Delivery mode
            </label>
            <select id="trd-delivery" className={`mt-2 ${INPUT_CLASS}`} value={form.deliveryId} onChange={set("deliveryId")}>
              {DELIVERY_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {delivery?.needsAddress ? (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="trd-address">
                Delivery address / email / agency reference
              </label>
              <input id="trd-address" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.deliveryAddress} onChange={set("deliveryAddress")} />
            </div>
          ) : null}
          <div>
            <label className={LABEL_CLASS} htmlFor="trd-date">
              Letter date
            </label>
            <input id="trd-date" className={`mt-2 ${INPUT_CLASS}`} type="date" value={form.letterDate} onChange={set("letterDate")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="trd-contact">
              Phone / email under signature (optional)
            </label>
            <input id="trd-contact" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.contact} onChange={set("contact")} />
          </div>
        </div>
      </section>

      {hasError ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Your application letter
            </p>
            <p className="mt-1 text-lg font-semibold text-[var(--primary)]">
              {hasError ? "—" : result.subject}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the drafted transcript request letter"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy letter"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields to the example values" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {hasError ? (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">
            Fix the highlighted input above to see the drafted letter.
          </p>
        ) : (
          <>
            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-md border border-[var(--border)] bg-[var(--background)] p-4 font-sans text-sm leading-6 text-[var(--foreground)]">
              {result.letter}
            </pre>
            <dl className="mt-4 text-sm">
              <div className="flex flex-col gap-1 py-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <dt className="shrink-0 font-semibold text-[var(--muted-foreground)]">
                  Tip for this purpose
                </dt>
                <dd className="text-[var(--foreground)] sm:text-right">{result.purposeNote}</dd>
              </div>
            </dl>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Transcript fees, processing times and application channels differ by university — many now
        accept online applications. This drafter is informational and produces a general-purpose
        letter; follow your university's prescribed form where one exists.
      </p>
    </main>
  );
}
