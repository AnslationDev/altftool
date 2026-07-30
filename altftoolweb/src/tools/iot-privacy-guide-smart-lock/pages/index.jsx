"use client";

import { useMemo, useState } from "react";
import { Check, Copy, KeyRound, LockKeyhole, RotateCcw, TriangleAlert } from "lucide-react";

import {
  CHECKLIST,
  CRITICAL_CAP_PERCENT,
  DEFAULT_DONE,
  GROUPS,
  LOCKOUT_PRESETS,
  MAX_CODE_DIGITS,
  MIN_CODE_DIGITS,
  estimateCodeStrength,
  scoreChecklist,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const CRITICAL_COUNT = CHECKLIST.filter((item) => item.critical).length;

const CODE_DEFAULTS = {
  digits: "6",
  secondsPerTry: "2",
  lockoutId: "5x60",
  predictable: false,
};

export default function ToolHome() {
  const [done, setDone] = useState(() => DEFAULT_DONE.slice());
  const [digits, setDigits] = useState(CODE_DEFAULTS.digits);
  const [secondsPerTry, setSecondsPerTry] = useState(CODE_DEFAULTS.secondsPerTry);
  const [lockoutId, setLockoutId] = useState(CODE_DEFAULTS.lockoutId);
  const [predictable, setPredictable] = useState(CODE_DEFAULTS.predictable);
  const [copied, setCopied] = useState(false);

  const score = useMemo(() => scoreChecklist(done), [done]);

  const code = useMemo(
    () =>
      estimateCodeStrength({
        digits: digits.trim() === "" ? Number.NaN : Number(digits),
        secondsPerTry: secondsPerTry.trim() === "" ? Number.NaN : Number(secondsPerTry),
        lockoutId,
        predictable,
      }),
    [digits, secondsPerTry, lockoutId, predictable]
  );

  const toggle = (id) => {
    setDone((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
    setCopied(false);
  };

  const reset = () => {
    setDone(DEFAULT_DONE.slice());
    setDigits(CODE_DEFAULTS.digits);
    setSecondsPerTry(CODE_DEFAULTS.secondsPerTry);
    setLockoutId(CODE_DEFAULTS.lockoutId);
    setPredictable(CODE_DEFAULTS.predictable);
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (score.error) return "";
    const lines = [
      "Smart Lock Security Checklist",
      `Score: ${score.percent}% — ${score.bandLabel}`,
      `Controls done: ${score.completed} of ${score.total}`,
      `Critical controls missing: ${score.missingCritical.length}`,
    ];
    if (!code.error) {
      lines.push(
        `Keypad code: ${code.digits} digits, average time to guess ${code.readable} (${code.bandLabel})`
      );
    }
    lines.push("");
    if (score.remaining.length === 0) {
      lines.push("Nothing left — every control is ticked.");
    } else {
      lines.push("Still to do:");
      for (const item of score.remaining) {
        lines.push(`- ${item.title}${item.critical ? " (critical)" : ""}`);
      }
    }
    return lines.join("\n");
  }, [score, code]);

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

  const hasScore = !score.error;
  const hasCode = !code.error;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <LockKeyhole className="h-4 w-4" aria-hidden="true" />
          Home IoT security
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Smart Lock Security Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A smart lock adds a remote way in and a new way to get locked out. Work through the
          account, the codes, the door frame and the offline fallback; the score weights the
          controls that decide whether someone else can open your door.
        </p>
      </header>

      <section
        className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        aria-labelledby="score-heading"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p
              id="score-heading"
              className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]"
            >
              Lock security score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasScore ? `${score.percent}%` : DASH}
            </p>
            <p className="mt-1 text-sm font-semibold">{hasScore ? score.bandLabel : DASH}</p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasScore ? score.bandHint : "Fix the problem shown below to see a score."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the smart lock checklist result"
              className={GHOST_BTN}
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
              aria-label="Reset the checklist"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div
          className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
          role="img"
          aria-label={hasScore ? `Security score ${score.percent} out of 100` : "Score unavailable"}
        >
          <span
            className="block h-full bg-[var(--primary)]"
            style={{ width: `${hasScore ? score.percent : 0}%` }}
          />
        </div>

        {score.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {score.error}
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Controls completed", hasScore ? `${score.completed} of ${score.total}` : DASH],
            [
              "Weighted points",
              hasScore ? `${NUM.format(score.points)} / ${NUM.format(score.maxPoints)}` : DASH,
            ],
            [
              "Critical controls missing",
              hasScore ? `${score.missingCritical.length} of ${CRITICAL_COUNT}` : DASH,
            ],
            ["Score band", hasScore ? score.bandLabel : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {hasScore && score.capped ? (
          <p className="mt-4 flex items-start gap-2 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              Score held at {CRITICAL_CAP_PERCENT}% while a critical control is open. Tick every
              control marked critical to score higher.
            </span>
          </p>
        ) : null}

        {hasScore && score.nextActions.length > 0 ? (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Do these next
            </p>
            <ol className="mt-2 space-y-1 text-sm">
              {score.nextActions.map((item) => (
                <li key={item.id} className="flex gap-2">
                  <span className="font-semibold text-[var(--primary)]">+{item.weight}</span>
                  <span>{item.title}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
          <h2 className="text-base font-semibold">How long your keypad code survives guessing</h2>
        </div>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Average time for somebody standing at the door to reach your code, using a search of
          10<sup>n</sup> combinations and whatever lockout your lock enforces. Never type your real
          code anywhere &mdash; only describe it.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="lock-digits">
              Code length (digits)
            </label>
            <input
              id="lock-digits"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_CODE_DIGITS}
              max={MAX_CODE_DIGITS}
              step="1"
              value={digits}
              onChange={(event) => setDigits(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lock-seconds">
              Seconds to key one attempt
            </label>
            <input
              id="lock-seconds"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              step="0.5"
              value={secondsPerTry}
              onChange={(event) => setSecondsPerTry(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lock-lockout">
              Lockout after wrong tries
            </label>
            <select
              id="lock-lockout"
              className={`mt-2 ${INPUT_CLASS}`}
              value={lockoutId}
              onChange={(event) => setLockoutId(event.target.value)}
            >
              {LOCKOUT_PRESETS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label
              htmlFor="lock-predictable"
              className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 transition hover:border-[var(--primary)]"
            >
              <input
                id="lock-predictable"
                type="checkbox"
                checked={predictable}
                onChange={(event) => setPredictable(event.target.checked)}
                className="h-5 w-5 shrink-0 accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              />
              <span className="text-sm font-semibold">
                It is a date, birth year, repeat or keypad run
              </span>
            </label>
          </div>
        </div>

        {code.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {code.error}
          </p>
        ) : null}

        <div className="mt-5 rounded-xl bg-[var(--background)] p-4 ring-1 ring-[var(--border)]">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Average time to guess the code
          </p>
          <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
            {hasCode ? code.readable : DASH}
          </p>
          <p className="mt-1 text-sm font-semibold">{hasCode ? code.bandLabel : DASH}</p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {hasCode ? code.bandHint : "Fix the input above to see a figure."}
          </p>
          <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
            {[
              ["Possible codes of this length", hasCode ? NUM.format(code.fullSpace) : DASH],
              [
                "Codes an attacker realistically tries",
                hasCode ? NUM.format(code.space) : DASH,
              ],
              ["Attempts needed on average", hasCode ? NUM.format(code.averageTries) : DASH],
              ["Lockouts sat through", hasCode ? NUM.format(code.lockouts) : DASH],
              ["Lockout behaviour", hasCode ? code.lockoutLabel : DASH],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mt-6 space-y-4">
        {GROUPS.map((group) => {
          const items = CHECKLIST.filter((item) => item.group === group);
          const groupStat = hasScore ? score.groups.find((entry) => entry.name === group) : null;
          return (
            <div key={group} className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-semibold">{group}</h2>
                <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                  {groupStat ? `${groupStat.done}/${groupStat.total} done` : DASH}
                </span>
              </div>
              <ul className="mt-3 space-y-2">
                {items.map((item) => (
                  <li key={item.id}>
                    <label
                      htmlFor={`step-${item.id}`}
                      className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 transition hover:border-[var(--primary)]"
                    >
                      <input
                        id={`step-${item.id}`}
                        type="checkbox"
                        checked={done.includes(item.id)}
                        onChange={() => toggle(item.id)}
                        className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                      />
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold">{item.title}</span>
                          {item.critical ? (
                            <span className="rounded-full bg-[var(--danger-soft)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--danger)]">
                              Critical
                            </span>
                          ) : null}
                          <span className="text-[11px] font-semibold text-[var(--muted-foreground)]">
                            +{item.weight}
                          </span>
                        </span>
                        <span className="mt-1 block text-sm leading-6 text-[var(--muted-foreground)]">
                          {item.detail}
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Mistakes worth avoiding</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
          <li>
            Handing the same code to the cleaner, the dog walker and three neighbours, so the log
            cannot tell you who came in.
          </li>
          <li>
            Fitting a strong lock to a frame held by 15 mm screws &mdash; the door gives way long
            before the code does.
          </li>
          <li>
            Leaving the factory programming code in place, which lets anyone who knows the model add
            their own user code.
          </li>
          <li>
            Having no plan for flat batteries, then discovering the override key is inside the
            house.
          </li>
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Everything you tick stays in this browser tab &mdash; nothing is stored or sent, and the page
        never asks for your actual code. Guessing times are order-of-magnitude estimates for an
        attacker at the keypad; they say nothing about attacks on the app, the hub or the radio
        protocol, which the checklist covers separately.
      </p>
    </main>
  );
}
