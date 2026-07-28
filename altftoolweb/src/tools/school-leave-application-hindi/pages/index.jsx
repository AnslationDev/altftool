"use client";

import { useMemo, useState } from "react";
import { Check, Copy, NotebookPen, RotateCcw } from "lucide-react";

import { GENDERS, REASONS, RECIPIENTS, buildHindiLeaveLetter } from "../lib";

const DEFAULTS = {
  studentName: "अनन्या शर्मा",
  genderId: "female",
  className: "9-ब",
  rollNumber: "23",
  schoolName: "सरस्वती विद्या मंदिर",
  city: "पुणे",
  recipientId: "principal-f",
  reasonId: "fever",
  customReason: "",
  from: "2026-08-03",
  to: "2026-08-05",
  letterDate: "2026-08-02",
  attachProof: true,
  devanagariDigits: true,
};

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_LABEL =
  "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const result = useMemo(() => buildHindiLeaveLetter(form), [form]);

  const copyResult = async () => {
    if (result.error) return;
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
          <NotebookPen className="h-4 w-4" aria-hidden="true" />
          औपचारिक पत्र
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Hindi School Leave Application</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          विद्यालय के लिए अवकाश प्रार्थना पत्र — सेवा में, विषय, संबोधन, सविनय निवेदन और हस्ताक्षर
          खंड सहित। छात्र या छात्रा चुनते ही क्रिया रूप (रहूँगा / रहूँगी) अपने आप बदल जाते हैं।
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="hi-name">
              छात्र/छात्रा का नाम
            </label>
            <input
              id="hi-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.studentName}
              onChange={(event) => setField("studentName", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hi-gender">
              लिंग (क्रिया रूप के लिए)
            </label>
            <select
              id="hi-gender"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.genderId}
              onChange={(event) => setField("genderId", event.target.value)}
            >
              {GENDERS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hi-class">
              कक्षा
            </label>
            <input
              id="hi-class"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.className}
              onChange={(event) => setField("className", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hi-roll">
              अनुक्रमांक (वैकल्पिक)
            </label>
            <input
              id="hi-roll"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.rollNumber}
              onChange={(event) => setField("rollNumber", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hi-school">
              विद्यालय का नाम
            </label>
            <input
              id="hi-school"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.schoolName}
              onChange={(event) => setField("schoolName", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hi-city">
              नगर (वैकल्पिक)
            </label>
            <input
              id="hi-city"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.city}
              onChange={(event) => setField("city", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hi-recipient">
              पत्र किसे
            </label>
            <select
              id="hi-recipient"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.recipientId}
              onChange={(event) => setField("recipientId", event.target.value)}
            >
              {RECIPIENTS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hi-reason">
              अवकाश का कारण
            </label>
            <select
              id="hi-reason"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.reasonId}
              onChange={(event) => setField("reasonId", event.target.value)}
            >
              {REASONS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hi-from">
              अवकाश की पहली तारीख़
            </label>
            <input
              id="hi-from"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.from}
              onChange={(event) => setField("from", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hi-to">
              अवकाश की अंतिम तारीख़
            </label>
            <input
              id="hi-to"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.to}
              onChange={(event) => setField("to", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hi-letterdate">
              पत्र की तारीख़
            </label>
            <input
              id="hi-letterdate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.letterDate}
              onChange={(event) => setField("letterDate", event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="hi-custom">
              अपने शब्दों में कारण (वैकल्पिक)
            </label>
            <textarea
              id="hi-custom"
              rows={2}
              className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              value={form.customReason}
              onChange={(event) => setField("customReason", event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <label htmlFor="hi-proof" className={CHECK_LABEL}>
            <input
              id="hi-proof"
              type="checkbox"
              className="h-4 w-4 accent-[var(--primary)]"
              checked={form.attachProof}
              onChange={(event) => setField("attachProof", event.target.checked)}
            />
            प्रमाण पत्र संलग्न है
          </label>
          <label htmlFor="hi-digits" className={CHECK_LABEL}>
            <input
              id="hi-digits"
              type="checkbox"
              className="h-4 w-4 accent-[var(--primary)]"
              checked={form.devanagariDigits}
              onChange={(event) => setField("devanagariDigits", event.target.checked)}
            />
            देवनागरी अंक (०-९)
          </label>
          <button type="button" onClick={reset} aria-label="सभी फ़ील्ड रीसेट करें" className={GHOST_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            रीसेट
          </button>
        </div>
      </section>

      {result.error ? (
        <>
          <p
            role="alert"
            className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              कुल अवकाश दिवस
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{DASH}</p>
            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {["विषय", "संबोधन", "हस्ताक्षर", "शब्द संख्या"].map((label) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{DASH}</dd>
                </div>
              ))}
            </dl>
          </section>
        </>
      ) : (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  कुल अवकाश दिवस
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{result.days}</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {result.dayWord} दिन — पहला और अंतिम दोनों दिन गिने जाते हैं
                </p>
              </div>
              <button
                type="button"
                onClick={copyResult}
                aria-label="प्रार्थना पत्र कॉपी करें"
                className={GHOST_BTN}
              >
                {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {copied ? "कॉपी हुआ!" : "पत्र कॉपी करें"}
              </button>
            </div>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["विषय", result.subject.replace("विषय: ", "")],
                ["संबोधन", result.salutation],
                ["हस्ताक्षर", result.signOff],
                ["शब्द संख्या", String(result.wordCount)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold">आपका प्रार्थना पत्र</h2>
              <button type="button" onClick={copyResult} className={PRIMARY_BTN}>
                {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {copied ? "कॉपी हुआ!" : "कॉपी"}
              </button>
            </div>
            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-7">
              {result.letter}
            </pre>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">
              प्रारूप जाँच सूची ({result.completedItems}/{result.totalItems})
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              {result.checklist.map((entry) => (
                <li key={entry.item} className="flex items-start gap-2">
                  <span
                    className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      entry.done
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border border-[var(--border)] text-[var(--muted-foreground)]"
                    }`}
                    aria-hidden="true"
                  >
                    {entry.done ? "✓" : ""}
                  </span>
                  <span className={entry.done ? "" : "text-[var(--muted-foreground)]"}>{entry.item}</span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        अवकाश की स्वीकृति, आवश्यक प्रमाण पत्र और उपस्थिति के नियम प्रत्येक विद्यालय के अपने होते हैं।
        भेजने से पहले पत्र एक बार पढ़ लें और विद्यालय के नियम देख लें।
      </p>
    </main>
  );
}
