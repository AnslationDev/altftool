"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Scroll } from "lucide-react";

import { STYLES, TONES, buildThreadCeremonyInvitation } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  boyName: "Aditya Sharma",
  fatherName: "Rakesh Sharma",
  motherName: "Meera Sharma",
  grandparents: "grandson of Shri Ram Prasad Sharma and Smt. Kamla Devi",
  familyName: "Sharma",
  ceremonyDate: "2026-04-12",
  muhurthamTime: "07:30",
  venue: "Sharma Nivas, 21 Civil Lines, Kanpur",
  styleId: "north-janeu",
  toneId: "traditional",
  birthDate: "2018-05-15",
  rsvp: "98XXXXXX21",
  includeKashiYatra: true,
  includeMeal: true,
};

const EM_DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copiedId, setCopiedId] = useState("");

  const setField = (key) => (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    setForm((current) => ({ ...current, [key]: value }));
    setCopiedId("");
  };

  const result = useMemo(() => buildThreadCeremonyInvitation(form), [form]);
  const failed = Boolean(result.error);

  const copy = async (id, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(""), 1500);
    } catch {
      setCopiedId("");
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopiedId("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Scroll className="h-4 w-4" aria-hidden="true" />
          Invitation wording
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Thread Ceremony Invitation Wording
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Upanayanam, janeu, munj, janoi, brahmopadesam or vratabandha — pick the regional style and
          get the full card wording plus a short WhatsApp version with the muhurtham line.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Family details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tci-boy">
              Boy&apos;s name
            </label>
            <input
              id="tci-boy"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.boyName}
              onChange={setField("boyName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tci-family">
              Family name for the sign-off (optional)
            </label>
            <input
              id="tci-family"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.familyName}
              onChange={setField("familyName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tci-father">
              Father&apos;s name (optional)
            </label>
            <input
              id="tci-father"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.fatherName}
              onChange={setField("fatherName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tci-mother">
              Mother&apos;s name (optional)
            </label>
            <input
              id="tci-mother"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.motherName}
              onChange={setField("motherName")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tci-grandparents">
              Grandparents line (optional)
            </label>
            <input
              id="tci-grandparents"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="grandson of ..."
              value={form.grandparents}
              onChange={setField("grandparents")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tci-dob">
              Date of birth (optional)
            </label>
            <input
              id="tci-dob"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.birthDate}
              onChange={setField("birthDate")}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Used only to show his exact age on the day. It is not printed on the card.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tci-rsvp">
              RSVP contact (optional)
            </label>
            <input
              id="tci-rsvp"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.rsvp}
              onChange={setField("rsvp")}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Ceremony details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tci-style">
              Regional style
            </label>
            <select id="tci-style" className={`mt-2 ${INPUT_CLASS}`} value={form.styleId} onChange={setField("styleId")}>
              {STYLES.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tci-tone">
              Tone
            </label>
            <select id="tci-tone" className={`mt-2 ${INPUT_CLASS}`} value={form.toneId} onChange={setField("toneId")}>
              {TONES.map((tone) => (
                <option key={tone.id} value={tone.id}>
                  {tone.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tci-date">
              Ceremony date
            </label>
            <input
              id="tci-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.ceremonyDate}
              onChange={setField("ceremonyDate")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tci-time">
              Muhurtham time
            </label>
            <input
              id="tci-time"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={form.muhurthamTime}
              onChange={setField("muhurthamTime")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tci-venue">
              Venue
            </label>
            <textarea
              id="tci-venue"
              rows={2}
              className={`mt-2 ${TEXTAREA_CLASS}`}
              value={form.venue}
              onChange={setField("venue")}
            />
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3">
            <input
              id="tci-kashi"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
              checked={form.includeKashiYatra}
              onChange={setField("includeKashiYatra")}
            />
            <label className="text-sm text-[var(--muted-foreground)]" htmlFor="tci-kashi">
              Mention Gayatri upadesam, Bhikshandehi and Kashi Yatra
            </label>
          </div>
          <div className="flex items-center gap-3">
            <input
              id="tci-meal"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
              checked={form.includeMeal}
              onChange={setField("includeMeal")}
            />
            <label className="text-sm text-[var(--muted-foreground)]" htmlFor="tci-meal">
              Mention the meal after the ceremony
            </label>
          </div>
        </div>
      </section>

      {failed ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Muhurtham
            </p>
            <p className="mt-1 text-2xl font-semibold leading-snug text-[var(--primary)] sm:text-3xl">
              {failed ? EM_DASH : `${result.dateLong}, ${result.time12}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy("full", result.invitation)}
              disabled={failed}
              aria-label="Copy the full invitation wording"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copiedId === "full" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copiedId === "full" ? "Copied!" : "Copy card"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Ceremony name", failed ? EM_DASH : result.style.ceremonyName],
            ["Tone", failed ? EM_DASH : result.tone.label],
            ["Card wording", failed ? EM_DASH : `${result.wordCount} words`],
            ["Short version", failed ? EM_DASH : `${result.shortCharacterCount} characters`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 overflow-x-auto">
          <pre className="min-w-0 whitespace-pre-wrap break-words rounded-md bg-[var(--background)] p-4 text-center font-sans text-sm leading-7 text-[var(--foreground)] ring-1 ring-[var(--border)]">
            {failed ? EM_DASH : result.invitation}
          </pre>
        </div>

        {!failed && result.ageNote ? (
          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">{result.ageNote}</p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold">Short version for WhatsApp</h2>
          <button
            type="button"
            onClick={() => copy("short", result.shortInvitation)}
            disabled={failed}
            aria-label="Copy the short WhatsApp invitation"
            className={`${GHOST_BTN} disabled:opacity-50`}
          >
            {copiedId === "short" ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copiedId === "short" ? "Copied!" : "Copy"}
          </button>
        </div>
        <div className="mt-3 overflow-x-auto">
          <pre className="min-w-0 whitespace-pre-wrap break-words rounded-md bg-[var(--background)] p-4 font-sans text-sm leading-7 ring-1 ring-[var(--border)]">
            {failed ? EM_DASH : result.shortInvitation}
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Wording template only. Fix the muhurtham, the vidhi sequence and the exact honorifics with
        your family priest — customs differ by community, gotra and region.
      </p>
    </main>
  );
}
