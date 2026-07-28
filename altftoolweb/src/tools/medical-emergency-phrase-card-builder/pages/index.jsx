"use client";

import { useMemo, useState } from "react";
import { Check, Copy, HeartPulse, RotateCcw } from "lucide-react";

import { BLOOD_GROUPS, COUNTRIES, COUNTRY_KEYS, LANGUAGES, LANGUAGE_KEYS, buildCard } from "../lib";

const NUM = new Intl.NumberFormat("en-IN");
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  name: "Asha Menon",
  bloodGroup: "B+",
  allergies: "Penicillin, peanuts",
  conditions: "Type 1 diabetes",
  medications: "Insulin glargine 20 units at night",
  contactName: "Rahul Menon",
  contactPhone: "+91 98200 12345",
  insurance: "Policy TA-99213",
  country: "japan",
  language: "japanese",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const card = useMemo(() => buildCard(form), [form]);
  const hasError = Boolean(card.error);

  const setField = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(card.text);
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
          <HeartPulse className="h-4 w-4" aria-hidden="true" />
          Travel safety
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Emergency Phrase Card Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Put your blood group, allergies, conditions, medication and emergency contact on one card,
          together with the emergency numbers for the country you are visiting and ten critical
          phrases in the local language. Print it and keep it in your wallet, not only on your phone.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Trip</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="card-country">
              Country you are visiting
            </label>
            <select id="card-country" className={`mt-2 ${INPUT_CLASS}`} value={form.country} onChange={setField("country")}>
              {COUNTRY_KEYS.map((key) => (
                <option key={key} value={key}>
                  {COUNTRIES[key].label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="card-language">
              Language for the phrases
            </label>
            <select id="card-language" className={`mt-2 ${INPUT_CLASS}`} value={form.language} onChange={setField("language")}>
              {LANGUAGE_KEYS.map((key) => (
                <option key={key} value={key}>
                  {LANGUAGES[key].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <h2 className="mt-6 text-base font-semibold">Medical details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="card-name">
              Name on the card
            </label>
            <input id="card-name" className={`mt-2 ${INPUT_CLASS}`} value={form.name} onChange={setField("name")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="card-blood">
              Blood group
            </label>
            <select id="card-blood" className={`mt-2 ${INPUT_CLASS}`} value={form.bloodGroup} onChange={setField("bloodGroup")}>
              {BLOOD_GROUPS.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="card-allergies">
              Allergies (comma separated)
            </label>
            <input
              id="card-allergies"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.allergies}
              onChange={setField("allergies")}
              placeholder="Penicillin, peanuts, latex"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="card-conditions">
              Conditions (comma separated)
            </label>
            <input
              id="card-conditions"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.conditions}
              onChange={setField("conditions")}
              placeholder="Type 1 diabetes, asthma, epilepsy"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="card-medications">
              Regular medication with dose
            </label>
            <textarea
              id="card-medications"
              rows={2}
              className={`mt-2 ${AREA_CLASS}`}
              value={form.medications}
              onChange={setField("medications")}
              placeholder="Insulin glargine 20 units at night, salbutamol inhaler as needed"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="card-contact">
              Emergency contact name
            </label>
            <input id="card-contact" className={`mt-2 ${INPUT_CLASS}`} value={form.contactName} onChange={setField("contactName")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="card-phone">
              Emergency contact number
            </label>
            <input
              id="card-phone"
              type="tel"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.contactPhone}
              onChange={setField("contactPhone")}
              placeholder="+91 98200 12345"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="card-insurance">
              Travel insurance reference (optional)
            </label>
            <input id="card-insurance" className={`mt-2 ${INPUT_CLASS}`} value={form.insurance} onChange={setField("insurance")} />
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {card.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Emergency number to dial
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : card.numbers.length ? card.numbers[0].number : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : `${card.numbers.length ? card.numbers[0].label : "Check locally"} in ${card.country.label}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the emergency card" className={GHOST_BTN} disabled={hasError}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the form" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Country", hasError ? DASH : card.country.label],
            [
              "All emergency numbers",
              hasError ? DASH : card.numbers.map((row) => `${row.label} ${row.number}`).join(" · ") || "Check locally",
            ],
            ["Phrase language", hasError ? DASH : card.language.label],
            ["Card fields completed", hasError ? DASH : `${NUM.format(card.fieldsFilled)} of ${NUM.format(card.fieldsTotal)}`],
            ["Lines on the card", hasError ? DASH : NUM.format(card.lineCount)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && card.country.note && (
          <p className="mt-4 text-xs text-[var(--muted-foreground)]">{card.country.note}</p>
        )}

        {!hasError && card.warnings.length > 0 && (
          <ul className="mt-4 grid gap-2">
            {card.warnings.map((warning) => (
              <li key={warning} className="rounded-md border border-[var(--border)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
                {warning}
              </li>
            ))}
          </ul>
        )}
      </section>

      {!hasError && (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Phrases on the card</h2>
            <ul className="mt-3 grid gap-3">
              {card.phrases.map((phrase) => (
                <li key={phrase.id} className="rounded-md border border-[var(--border)] p-3">
                  <p className="text-sm text-[var(--muted-foreground)]">{phrase.english}</p>
                  {phrase.script && <p className="mt-1 text-lg font-semibold">{phrase.script}</p>}
                  {phrase.roman && <p className="mt-1 text-sm">say: {phrase.roman}</p>}
                  {phrase.note && <p className="mt-1 text-xs text-[var(--muted-foreground)]">{phrase.note}</p>}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Printable card text</h2>
            <label className="sr-only" htmlFor="card-output">
              Printable card text
            </label>
            <textarea
              id="card-output"
              rows={14}
              readOnly
              className={`mt-3 ${AREA_CLASS} font-mono text-xs`}
              value={card.text}
            />
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Everything you type stays in this browser tab — nothing is uploaded and nothing is saved, so
        copy or print the card before you close the page. This is an informational aid, not medical
        advice: have your doctor confirm the wording of your conditions and doses, carry a signed
        prescription letter for controlled medication, and check the local emergency number on
        arrival, because it can differ by state or province.
      </p>
    </main>
  );
}
