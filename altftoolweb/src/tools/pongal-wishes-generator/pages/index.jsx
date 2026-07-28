"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Sun } from "lucide-react";

import {
  DAYS,
  THAI_POSSIBLE_DAYS,
  TONES,
  buildPongalWish,
  buildPongalWishSet,
  computePongalSchedule,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";

const DEFAULTS = {
  day: "thai",
  tone: "traditional",
  includeTamil: true,
  includeRoman: true,
  includeEnglish: false,
  recipient: "",
  sender: "",
  includeEmoji: false,
  year: "2027",
  thaiPongalDay: "14",
};

const DASH = "—";

const SCRIPT_TOGGLES = [
  ["includeTamil", "Tamil script"],
  ["includeRoman", "Roman transliteration"],
  ["includeEnglish", "English translation"],
];

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copiedId, setCopiedId] = useState("");

  const update = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));

  // Move to the current year only after mount so the server and client markup match.
  useEffect(() => {
    setForm((previous) => ({ ...previous, year: String(new Date().getFullYear()) }));
  }, []);

  const wishOptions = useMemo(
    () => ({
      day: form.day,
      tone: form.tone,
      includeTamil: form.includeTamil,
      includeRoman: form.includeRoman,
      includeEnglish: form.includeEnglish,
      recipient: form.recipient,
      sender: form.sender,
      includeEmoji: form.includeEmoji,
    }),
    [form],
  );

  const wish = useMemo(() => buildPongalWish(wishOptions), [wishOptions]);
  const alternatives = useMemo(
    () => buildPongalWishSet(wishOptions).filter((item) => item.tone !== form.tone),
    [wishOptions, form.tone],
  );
  const schedule = useMemo(
    () =>
      computePongalSchedule({
        year: Number(form.year),
        thaiPongalDay: Number(form.thaiPongalDay),
      }),
    [form.year, form.thaiPongalDay],
  );

  const hasError = Boolean(wish.error);

  const copyText = async (text, id) => {
    if (!text) return;
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
          <Sun className="h-4 w-4" aria-hidden="true" />
          Festival wishes
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Pongal Wishes Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A greeting for each of the four days — Bhogi, Thai Pongal, Maattu Pongal and Kaanum
          Pongal — in Tamil script with transliteration and an English line, plus the dates of all
          four days for the year you choose.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pongal-day">
              Day of the festival
            </label>
            <select
              id="pongal-day"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.day}
              onChange={(event) => update("day", event.target.value)}
            >
              {DAYS.map((day) => (
                <option key={day.id} value={day.id}>
                  {day.label} ({day.tamilLabel})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pongal-tone">
              Tone
            </label>
            <select
              id="pongal-tone"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.tone}
              onChange={(event) => update("tone", event.target.value)}
            >
              {TONES.map((tone) => (
                <option key={tone.id} value={tone.id}>
                  {tone.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pongal-recipient">
              Their name (optional)
            </label>
            <input
              id="pongal-recipient"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              value={form.recipient}
              onChange={(event) => update("recipient", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pongal-sender">
              Your name (optional)
            </label>
            <input
              id="pongal-sender"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              value={form.sender}
              onChange={(event) => update("sender", event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className={LABEL_CLASS}>Lines to include</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {SCRIPT_TOGGLES.map(([key, label]) => (
              <label
                key={key}
                htmlFor={`pongal-${key}`}
                className="inline-flex min-h-11 cursor-pointer items-center gap-3 text-sm"
              >
                <input
                  id={`pongal-${key}`}
                  type="checkbox"
                  className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:outline-none focus:ring-[3px] focus:ring-[var(--primary)]/25"
                  checked={form[key]}
                  onChange={(event) => update(key, event.target.checked)}
                />
                {label}
              </label>
            ))}
            <label
              htmlFor="pongal-emoji"
              className="inline-flex min-h-11 cursor-pointer items-center gap-3 text-sm"
            >
              <input
                id="pongal-emoji"
                type="checkbox"
                className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:outline-none focus:ring-[3px] focus:ring-[var(--primary)]/25"
                checked={form.includeEmoji}
                onChange={(event) => update("includeEmoji", event.target.checked)}
              />
              Harvest emoji
            </label>
          </div>
        </fieldset>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {wish.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Message length
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(wish.characters)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the selection above."
                : `characters · ${wish.sms.encoding} · ${wish.sms.segments} SMS part${wish.sms.segments === 1 ? "" : "s"}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copyText(wish.text, "main")}
              aria-label="Copy the Pongal greeting"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copiedId === "main" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copiedId === "main" ? "Copied!" : "Copy greeting"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the generator"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && (
          <div
            lang="ta"
            className="mt-5 whitespace-pre-line rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-lg leading-8"
          >
            {wish.text}
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Day", hasError ? DASH : `${wish.dayLabel} (${wish.dayTamil})`],
            ["Tone", hasError ? DASH : wish.toneLabel],
            ["Words", hasError ? DASH : NUM.format(wish.words)],
            ["Encoding", hasError ? DASH : wish.sms.encoding],
            [
              "SMS parts",
              hasError ? DASH : `${wish.sms.segments} (${wish.sms.perSegment} characters per part)`,
            ],
            [
              "Room left in this part",
              hasError ? DASH : `${NUM.format(wish.sms.remaining)} characters`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">{wish.dayAbout}</p>
        )}
      </section>

      {!hasError && alternatives.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Other tones for {wish.dayLabel}</h2>
          <ul className="mt-3 grid gap-3">
            {alternatives.map((item) => (
              <li key={item.tone} className="rounded-md border border-[var(--border)] px-3 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  {item.toneLabel}
                </p>
                <p lang="ta" className="mt-2 whitespace-pre-line text-sm leading-7">
                  {item.text}
                </p>
                <button
                  type="button"
                  onClick={() => copyText(item.text, item.tone)}
                  aria-label={`Copy the ${item.tone} Pongal greeting`}
                  className={`mt-3 ${GHOST_BTN}`}
                >
                  {copiedId === item.tone ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copiedId === item.tone ? "Copied!" : "Copy"}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The four days</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pongal-year">
              Year
            </label>
            <input
              id="pongal-year"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1900"
              max="2200"
              step="1"
              value={form.year}
              onChange={(event) => update("year", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pongal-thaiday">
              Thai Pongal date in January
            </label>
            <select
              id="pongal-thaiday"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.thaiPongalDay}
              onChange={(event) => update("thaiPongalDay", event.target.value)}
            >
              {THAI_POSSIBLE_DAYS.map((day) => (
                <option key={day} value={String(day)}>
                  {day} January
                </option>
              ))}
            </select>
          </div>
        </div>

        {schedule.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {schedule.error}
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Day
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Date
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Weekday
                  </th>
                </tr>
              </thead>
              <tbody>
                {schedule.schedule.map((entry) => (
                  <tr key={entry.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">
                      {entry.label}{" "}
                      <span lang="ta" className="font-normal text-[var(--muted-foreground)]">
                        {entry.tamilLabel}
                      </span>
                    </td>
                    <td className="py-2 pr-3">{entry.date}</td>
                    <td className="py-2 text-[var(--muted-foreground)]">{entry.weekday}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          Thai Pongal opens the Tamil month of Thai and lands on 14 or 15 January depending on the
          solar transit that year — check a Tamil panchangam before printing invitations.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Transliterations are a pronunciation guide, not a formal romanisation standard. Customs
        vary between districts and between Tamil Nadu, Sri Lanka and the diaspora, so adjust the
        wording to the family you are writing to.
      </p>
    </main>
  );
}
