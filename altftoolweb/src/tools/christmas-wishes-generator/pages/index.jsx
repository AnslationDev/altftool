"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gift, RotateCcw } from "lucide-react";

import {
  LANGUAGES,
  TONES,
  buildChristmasWish,
  buildChristmasWishSet,
  computeChristmasDates,
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
  languageId: "en",
  tone: "warm",
  recipient: "",
  sender: "",
  includeRoman: true,
  includeEmoji: false,
  year: "2026",
};

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copiedId, setCopiedId] = useState("");

  const update = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));

  const wish = useMemo(
    () =>
      buildChristmasWish({
        languageId: form.languageId,
        tone: form.tone,
        recipient: form.recipient,
        sender: form.sender,
        includeRoman: form.includeRoman,
        includeEmoji: form.includeEmoji,
      }),
    [form],
  );

  const alternatives = useMemo(
    () =>
      buildChristmasWishSet({
        languageId: form.languageId,
        recipient: form.recipient,
        sender: form.sender,
        includeRoman: form.includeRoman,
        includeEmoji: form.includeEmoji,
      }).filter((item) => item.tone !== form.tone),
    [form],
  );

  const dates = useMemo(() => computeChristmasDates(Number(form.year)), [form.year]);

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
          <Gift className="h-4 w-4" aria-hidden="true" />
          Festival wishes
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Christmas Wishes Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Thirty languages, three tones, and the greeting written the way a native speaker sends it
          — with a transliteration line for non-Latin scripts and a live count of how many SMS parts
          the message costs.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="xmas-language">
              Language
            </label>
            <select
              id="xmas-language"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.languageId}
              onChange={(event) => update("languageId", event.target.value)}
            >
              {LANGUAGES.map((language) => (
                <option key={language.id} value={language.id}>
                  {language.label} ({language.native})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="xmas-tone">
              Tone
            </label>
            <select
              id="xmas-tone"
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
            <label className={LABEL_CLASS} htmlFor="xmas-recipient">
              Their name (optional)
            </label>
            <input
              id="xmas-recipient"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              value={form.recipient}
              onChange={(event) => update("recipient", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="xmas-sender">
              Your name (optional)
            </label>
            <input
              id="xmas-sender"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              value={form.sender}
              onChange={(event) => update("sender", event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          <label
            htmlFor="xmas-roman"
            className="inline-flex min-h-11 cursor-pointer items-center gap-3 text-sm"
          >
            <input
              id="xmas-roman"
              type="checkbox"
              className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:outline-none focus:ring-[3px] focus:ring-[var(--primary)]/25"
              checked={form.includeRoman}
              onChange={(event) => update("includeRoman", event.target.checked)}
            />
            Add the transliteration line for non-Latin scripts
          </label>
          <label
            htmlFor="xmas-emoji"
            className="inline-flex min-h-11 cursor-pointer items-center gap-3 text-sm"
          >
            <input
              id="xmas-emoji"
              type="checkbox"
              className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:outline-none focus:ring-[3px] focus:ring-[var(--primary)]/25"
              checked={form.includeEmoji}
              onChange={(event) => update("includeEmoji", event.target.checked)}
            />
            Add a tree emoji (this forces UCS-2 encoding)
          </label>
        </div>
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
              aria-label="Copy the Christmas greeting"
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
            lang={wish.languageId}
            className="mt-5 whitespace-pre-line rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-lg leading-8"
          >
            {wish.text}
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Language", hasError ? DASH : `${wish.languageLabel} (${wish.languageNative})`],
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
      </section>

      {!hasError && alternatives.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Other tones in {wish.languageLabel}</h2>
          <ul className="mt-3 grid gap-3">
            {alternatives.map((item) => (
              <li key={item.tone} className="rounded-md border border-[var(--border)] px-3 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  {item.toneLabel}
                </p>
                <p lang={item.languageId} className="mt-2 whitespace-pre-line text-sm leading-7">
                  {item.text}
                </p>
                <button
                  type="button"
                  onClick={() => copyText(item.text, item.tone)}
                  aria-label={`Copy the ${item.tone} Christmas greeting`}
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
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-base font-semibold">Christmas calendar</h2>
          <div className="w-full sm:w-40">
            <label className={LABEL_CLASS} htmlFor="xmas-year">
              Year
            </label>
            <input
              id="xmas-year"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1583"
              max="2400"
              step="1"
              value={form.year}
              onChange={(event) => update("year", event.target.value)}
            />
          </div>
        </div>

        {dates.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {dates.error}
          </p>
        ) : (
          <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
            {[
              ["Advent Sunday (first of four)", dates.adventSunday],
              ["Fourth Sunday of Advent", dates.fourthAdvent],
              ["Christmas Day", dates.christmas],
              ["Twelfth Night", dates.twelfthNight],
              ["Epiphany", dates.epiphany],
              [
                "Julian-calendar Christmas",
                `${dates.orthodoxChristmas} (Julian calendar is ${dates.julianOffsetDays} days behind)`,
              ],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Transliterations are a pronunciation guide rather than a formal romanisation standard, and
        regional wording varies — a Bavarian, a Viennese and a Swiss greeting all differ. Read the
        line aloud before you send it to someone senior.
      </p>
    </main>
  );
}
