"use client";

import { useMemo, useState } from "react";
import { Cake, Check, Copy, RotateCcw, Shuffle } from "lucide-react";

import {
  MAX_AGE_YEARS,
  MAX_WISHES,
  RELATIONS,
  SCRIPTS,
  TONES,
  generateWishes,
} from "../lib";

const DEFAULTS = {
  name: "Sushanta",
  relation: "friend",
  tone: "warm",
  script: "odia",
  count: 3,
  ageYears: "",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const EM_DASH = "—";
const NUM = new Intl.NumberFormat("en-IN");

export default function ToolHome() {
  const [name, setName] = useState(DEFAULTS.name);
  const [relation, setRelation] = useState(DEFAULTS.relation);
  const [tone, setTone] = useState(DEFAULTS.tone);
  const [script, setScript] = useState(DEFAULTS.script);
  const [count, setCount] = useState(String(DEFAULTS.count));
  const [ageYears, setAgeYears] = useState(DEFAULTS.ageYears);
  const [seed, setSeed] = useState(0);
  const [copiedId, setCopiedId] = useState("");

  const result = useMemo(
    () =>
      generateWishes({
        name,
        relation,
        tone,
        script,
        count: Number(count),
        ageYears,
        variantSeed: seed,
      }),
    [name, relation, tone, script, count, ageYears, seed],
  );

  const allText = useMemo(() => {
    if (result.error) return "";
    return result.wishes.map((wish) => wish.text).join("\n\n");
  }, [result]);

  const copy = async (text, id) => {
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
    setName(DEFAULTS.name);
    setRelation(DEFAULTS.relation);
    setTone(DEFAULTS.tone);
    setScript(DEFAULTS.script);
    setCount(String(DEFAULTS.count));
    setAgeYears(DEFAULTS.ageYears);
    setSeed(0);
    setCopiedId("");
  };

  const isOdiaScript = script === "odia";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Cake className="h-4 w-4" aria-hidden="true" />
          Odia wishes
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Odia Birthday Wishes Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Choose the relationship and the tone and get complete Odia birthday messages, written
          either in Odia script or in Roman letters for phones without an Odia keyboard.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="od-name">
              Name of the birthday person
            </label>
            <input
              id="od-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Sushanta"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="od-relation">
              Your relationship
            </label>
            <select
              id="od-relation"
              className={`mt-2 ${INPUT_CLASS}`}
              value={relation}
              onChange={(event) => setRelation(event.target.value)}
            >
              {RELATIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="od-tone">
              Tone
            </label>
            <select
              id="od-tone"
              className={`mt-2 ${INPUT_CLASS}`}
              value={tone}
              onChange={(event) => setTone(event.target.value)}
            >
              {TONES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="od-script">
              Script
            </label>
            <select
              id="od-script"
              className={`mt-2 ${INPUT_CLASS}`}
              value={script}
              onChange={(event) => setScript(event.target.value)}
            >
              {SCRIPTS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="od-age">
              Age turning (optional)
            </label>
            <input
              id="od-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_AGE_YEARS}
              step="1"
              value={ageYears}
              onChange={(event) => setAgeYears(event.target.value)}
              placeholder="e.g. 21"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="od-count">
              How many wishes
            </label>
            <select
              id="od-count"
              className={`mt-2 ${INPUT_CLASS}`}
              value={count}
              onChange={(event) => setCount(event.target.value)}
            >
              {Array.from({ length: MAX_WISHES }, (_, index) => index + 1).map((value) => (
                <option key={value} value={String(value)}>
                  {NUM.format(value)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSeed((value) => value + 1)}
            className={GHOST_BTN}
            aria-label="Show a different set of Odia birthday wishes"
          >
            <Shuffle className="h-4 w-4" aria-hidden="true" />
            Shuffle wording
          </button>
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
              Wishes ready to send
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {result.error ? EM_DASH : NUM.format(result.wishes.length)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => copy(allText, "all")}
            aria-label="Copy all Odia birthday wishes"
            className={PRIMARY_BTN}
            disabled={Boolean(result.error)}
          >
            {copiedId === "all" ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copiedId === "all" ? "Copied!" : "Copy all"}
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
                ["Addressed as", result.address],
                ["Script", isOdiaScript ? "Odia" : "Roman (Latin letters)"],
                ["Tone", TONES.find((item) => item.id === result.tone)?.label ?? EM_DASH],
                ["Wordings in this tone", NUM.format(result.poolSize)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>

            <ul className="mt-5 space-y-3">
              {result.wishes.map((wish) => (
                <li
                  key={wish.id}
                  className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
                >
                  <p
                    lang={result.lang}
                    className={`leading-9 ${isOdiaScript ? "text-lg" : "text-base"}`}
                  >
                    {wish.text}
                  </p>
                  <button
                    type="button"
                    onClick={() => copy(wish.text, wish.id)}
                    aria-label="Copy this Odia birthday wish"
                    className={`mt-3 ${GHOST_BTN}`}
                  >
                    {copiedId === wish.id ? (
                      <Check className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Copy className="h-4 w-4" aria-hidden="true" />
                    )}
                    {copiedId === wish.id ? "Copied!" : "Copy"}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Odia script needs a Unicode Odia font such as Noto Sans Oriya. If the letters render as empty
        boxes on an older device, switch to the Roman option.
      </p>
    </main>
  );
}
