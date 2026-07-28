"use client";

import { useMemo, useState } from "react";
import { Check, Copy, HeartHandshake, RotateCcw } from "lucide-react";

import { SIGNS, checkZodiacCompatibility } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const NUM = new Intl.NumberFormat("en-IN");

const ELEMENT_RELATION_LABEL = {
  same: "Same element",
  complementary: "Complementary elements",
  challenging: "Clashing elements",
};

const DEFAULTS = {
  mode: "signs",
  nameA: "",
  nameB: "",
  signA: "aries",
  signB: "leo",
  dateA: "1998-07-04",
  dateB: "1996-11-30",
};

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [nameA, setNameA] = useState(DEFAULTS.nameA);
  const [nameB, setNameB] = useState(DEFAULTS.nameB);
  const [signA, setSignA] = useState(DEFAULTS.signA);
  const [signB, setSignB] = useState(DEFAULTS.signB);
  const [dateA, setDateA] = useState(DEFAULTS.dateA);
  const [dateB, setDateB] = useState(DEFAULTS.dateB);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => checkZodiacCompatibility({ mode, signA, signB, dateA, dateB, nameA, nameB }),
    [mode, signA, signB, dateA, dateB, nameA, nameB],
  );

  const hasError = Boolean(result.error);
  const labelA = hasError ? "" : result.nameA || result.signA.name;
  const labelB = hasError ? "" : result.nameB || result.signB.name;

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `${result.signA.name} ${result.signA.symbol} + ${result.signB.name} ${result.signB.symbol}`,
      `Compatibility score: ${result.score}/100 — ${result.verdict}`,
      `Aspect: ${result.aspect.name} (${result.aspect.angle}°, ${result.aspect.quality})`,
      `Elements: ${result.signA.element} + ${result.signB.element} (${ELEMENT_RELATION_LABEL[result.elementRelation]})`,
      `Modalities: ${result.signA.modality} + ${result.signB.modality}`,
      `Ruling planets: ${result.signA.ruler} + ${result.signB.ruler}`,
      ...result.strengths.map((line) => `Works: ${line}`),
      ...result.frictions.map((line) => `Watch: ${line}`),
    ].join("\n");
  }, [hasError, result]);

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
    setMode(DEFAULTS.mode);
    setNameA(DEFAULTS.nameA);
    setNameB(DEFAULTS.nameB);
    setSignA(DEFAULTS.signA);
    setSignB(DEFAULTS.signB);
    setDateA(DEFAULTS.dateA);
    setDateB(DEFAULTS.dateB);
    setCopied(false);
  };

  const renderPerson = (index) => {
    const isFirst = index === 0;
    const name = isFirst ? nameA : nameB;
    const setName = isFirst ? setNameA : setNameB;
    const sign = isFirst ? signA : signB;
    const setSign = isFirst ? setSignA : setSignB;
    const date = isFirst ? dateA : dateB;
    const setDate = isFirst ? setDateA : setDateB;
    const slot = isFirst ? "a" : "b";

    return (
      <div className="grid gap-4">
        <div>
          <label className={LABEL_CLASS} htmlFor={`zc-name-${slot}`}>
            {isFirst ? "First person" : "Second person"} name (optional)
          </label>
          <input
            id={`zc-name-${slot}`}
            type="text"
            className={`mt-2 ${INPUT_CLASS}`}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={isFirst ? "You" : "Them"}
          />
        </div>
        {mode === "signs" ? (
          <div>
            <label className={LABEL_CLASS} htmlFor={`zc-sign-${slot}`}>
              Zodiac sign
            </label>
            <select
              id={`zc-sign-${slot}`}
              className={`mt-2 ${INPUT_CLASS}`}
              value={sign}
              onChange={(event) => setSign(event.target.value)}
            >
              {SIGNS.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.symbol} {option.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className={LABEL_CLASS} htmlFor={`zc-date-${slot}`}>
              Birth date
            </label>
            <input
              id={`zc-date-${slot}`}
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <HeartHandshake className="h-4 w-4" aria-hidden="true" />
          Sun sign match
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Zodiac Compatibility Checker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick two signs, or enter two birth dates. The score comes from the classical
          aspect between the signs on the 360° wheel — trine and sextile easy, square and
          quincunx tense — plus a bonus for a shared ruling planet.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <fieldset>
          <legend className={`${LABEL_CLASS} mb-2`}>How do you want to enter it?</legend>
          <div className="flex flex-wrap gap-2">
            {[
              ["signs", "Pick signs"],
              ["dates", "Use birth dates"],
            ].map(([value, text]) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                aria-pressed={mode === value}
                className={mode === value ? PRIMARY_BTN : GHOST_BTN}
              >
                {text}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          {renderPerson(0)}
          {renderPerson(1)}
        </div>
      </section>

      {hasError ? (
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
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Compatibility score
            </p>
            <p className="mt-1 text-5xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.score)}/100`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the match."
                : `${labelA} (${result.signA.name}) and ${labelB} (${result.signB.name}) — ${result.verdict}. ${result.aspect.summary}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the zodiac compatibility result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset both people to the defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div
          className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]"
          role="img"
          aria-label={
            hasError ? "No score available" : `Score ${result.score} out of 100`
          }
        >
          <div
            className="h-full rounded-full bg-[var(--primary)]"
            style={{ width: hasError ? "0%" : `${result.score}%` }}
          />
        </div>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Aspect</dt>
            <dd className="text-sm font-semibold">
              {hasError ? DASH : `${result.aspect.name} (${result.aspect.angle}°)`}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Signs apart</dt>
            <dd className="text-sm font-semibold">
              {hasError ? DASH : `${result.aspect.distance} of 6`}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Elements</dt>
            <dd className="text-sm font-semibold">
              {hasError
                ? DASH
                : `${result.signA.element} + ${result.signB.element} · ${ELEMENT_RELATION_LABEL[result.elementRelation]}`}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Modalities</dt>
            <dd className="text-sm font-semibold">
              {hasError ? DASH : `${result.signA.modality} + ${result.signB.modality}`}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Ruling planets</dt>
            <dd className="text-sm font-semibold">
              {hasError ? DASH : `${result.signA.ruler} + ${result.signB.ruler}`}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Polarity</dt>
            <dd className="text-sm font-semibold">
              {hasError
                ? DASH
                : `${result.signA.polarity} + ${result.signB.polarity}`}
            </dd>
          </div>
        </dl>

        {!hasError && result.notes.length > 0 ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            {result.notes.join(" ")}
          </p>
        ) : null}

        {!hasError ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <h2 className="text-sm font-semibold text-[var(--success)]">What works</h2>
              <ul className="mt-2 space-y-2">
                {result.strengths.length === 0 ? (
                  <li className="text-sm text-[var(--muted-foreground)]">
                    Nothing in this pairing is traditionally read as easy.
                  </li>
                ) : (
                  result.strengths.map((line) => (
                    <li key={line} className="text-sm leading-6">
                      {line}
                    </li>
                  ))
                )}
              </ul>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[var(--danger)]">What to watch</h2>
              <ul className="mt-2 space-y-2">
                {result.frictions.length === 0 ? (
                  <li className="text-sm text-[var(--muted-foreground)]">
                    No classic friction point between these two signs.
                  </li>
                ) : (
                  result.frictions.map((line) => (
                    <li key={line} className="text-sm leading-6">
                      {line}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        ) : null}

        <p className="mt-5 text-xs text-[var(--muted-foreground)]">
          Sun sign compatibility is a tradition, not evidence. Read it for fun.
        </p>
      </section>
    </main>
  );
}
