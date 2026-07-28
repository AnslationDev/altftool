"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Flower, RotateCcw } from "lucide-react";

import { RELATIONSHIPS, TONES, buildOnamWish, buildOnamWishSet, computeOnamSchedule } from "../lib";

const NUM = new Intl.NumberFormat("en-IN");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";

const DEFAULTS = {
  relationship: "family",
  tone: "warm",
  includeMalayalam: true,
  includeRoman: true,
  includeEnglish: false,
  recipient: "",
  sender: "",
  includeEmoji: false,
  thiruvonam: "",
};

const DASH = "—";

const SCRIPT_TOGGLES = [
  ["includeMalayalam", "Malayalam script"],
  ["includeRoman", "Roman transliteration"],
  ["includeEnglish", "English translation"],
];

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copiedId, setCopiedId] = useState("");

  const update = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));

  const wishOptions = useMemo(
    () => ({
      relationship: form.relationship,
      tone: form.tone,
      includeMalayalam: form.includeMalayalam,
      includeRoman: form.includeRoman,
      includeEnglish: form.includeEnglish,
      recipient: form.recipient,
      sender: form.sender,
      includeEmoji: form.includeEmoji,
    }),
    [form],
  );

  const wish = useMemo(() => buildOnamWish(wishOptions), [wishOptions]);
  const alternatives = useMemo(
    () => buildOnamWishSet(wishOptions).filter((item) => item.tone !== form.tone),
    [wishOptions, form.tone],
  );
  const schedule = useMemo(() => computeOnamSchedule(form.thiruvonam), [form.thiruvonam]);

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
          <Flower className="h-4 w-4" aria-hidden="true" />
          Festival wishes
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Onam Wishes Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Malayalam Onam greetings written for the person you are actually sending them to —
          family, friends, the team, a client, a teacher or a neighbour — with a transliteration
          line, an optional English line and the full ten-day Atham to Thiruvonam schedule.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="onam-relationship">
              Who is it for
            </label>
            <select
              id="onam-relationship"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.relationship}
              onChange={(event) => update("relationship", event.target.value)}
            >
              {RELATIONSHIPS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="onam-tone">
              Tone
            </label>
            <select
              id="onam-tone"
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
            <label className={LABEL_CLASS} htmlFor="onam-recipient">
              Their name (optional)
            </label>
            <input
              id="onam-recipient"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              value={form.recipient}
              onChange={(event) => update("recipient", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="onam-sender">
              Your name (optional)
            </label>
            <input
              id="onam-sender"
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
                htmlFor={`onam-${key}`}
                className="inline-flex min-h-11 cursor-pointer items-center gap-3 text-sm"
              >
                <input
                  id={`onam-${key}`}
                  type="checkbox"
                  className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:outline-none focus:ring-[3px] focus:ring-[var(--primary)]/25"
                  checked={form[key]}
                  onChange={(event) => update(key, event.target.checked)}
                />
                {label}
              </label>
            ))}
            <label
              htmlFor="onam-emoji"
              className="inline-flex min-h-11 cursor-pointer items-center gap-3 text-sm"
            >
              <input
                id="onam-emoji"
                type="checkbox"
                className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:outline-none focus:ring-[3px] focus:ring-[var(--primary)]/25"
                checked={form.includeEmoji}
                onChange={(event) => update("includeEmoji", event.target.checked)}
              />
              Onam emoji
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
              aria-label="Copy the Onam greeting"
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
            lang="ml"
            className="mt-5 whitespace-pre-line rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-lg leading-8"
          >
            {wish.text}
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Written for", hasError ? DASH : wish.relationshipLabel],
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
          <h2 className="text-base font-semibold">Other tones for {wish.relationshipLabel}</h2>
          <ul className="mt-3 grid gap-3">
            {alternatives.map((item) => (
              <li key={item.tone} className="rounded-md border border-[var(--border)] px-3 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  {item.toneLabel}
                </p>
                <p lang="ml" className="mt-2 whitespace-pre-line text-sm leading-7">
                  {item.text}
                </p>
                <button
                  type="button"
                  onClick={() => copyText(item.text, item.tone)}
                  aria-label={`Copy the ${item.tone} Onam greeting`}
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
        <h2 className="text-base font-semibold">The ten days of Onam</h2>
        <div className="mt-3 sm:max-w-xs">
          <label className={LABEL_CLASS} htmlFor="onam-thiruvonam">
            Thiruvonam date (optional)
          </label>
          <input
            id="onam-thiruvonam"
            className={`mt-2 ${INPUT_CLASS}`}
            type="date"
            value={form.thiruvonam}
            onChange={(event) => update("thiruvonam", event.target.value)}
          />
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            Thiruvonam is fixed by the nakshatra, so take the date from a Malayalam panchangam and
            the other nine days are counted from it.
          </p>
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
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Day
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    {schedule.dated ? "Date" : "Offset"}
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    What happens
                  </th>
                </tr>
              </thead>
              <tbody>
                {schedule.schedule.map((entry) => (
                  <tr key={entry.day} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">
                      {entry.day}. {entry.name}{" "}
                      <span lang="ml" className="font-normal text-[var(--muted-foreground)]">
                        {entry.malayalam}
                      </span>
                    </td>
                    <td className="whitespace-nowrap py-2 pr-3">
                      {schedule.dated
                        ? `${entry.date} (${entry.weekday})`
                        : entry.offset === 0
                          ? "Thiruvonam"
                          : `${Math.abs(entry.offset)} days before`}
                    </td>
                    <td className="py-2 text-[var(--muted-foreground)]">{entry.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Transliterations are a pronunciation guide rather than a formal romanisation standard.
        Customs differ between central Travancore, Malabar and the diaspora, so adjust the wording
        for the family you are writing to.
      </p>
    </main>
  );
}
