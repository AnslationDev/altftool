"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Minus, Plus, RotateCcw, Sunrise, Trash2 } from "lucide-react";

import {
  PACES,
  SEQUENCE,
  computeSession,
  computeStreak,
  formatDuration,
} from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  rounds: 12,
  paceId: "steady",
  weight: "70",
  bothSides: false,
  rest: "0",
};

const todayIso = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const shiftIso = (iso, deltaDays) => {
  const [year, month, day] = iso.split("-").map(Number);
  const stamp = Date.UTC(year, month - 1, day) + deltaDays * 86400000;
  return new Date(stamp).toISOString().slice(0, 10);
};

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [today] = useState(todayIso);
  const [rounds, setRounds] = useState(DEFAULTS.rounds);
  const [paceId, setPaceId] = useState(DEFAULTS.paceId);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [bothSides, setBothSides] = useState(DEFAULTS.bothSides);
  const [rest, setRest] = useState(DEFAULTS.rest);
  const [dates, setDates] = useState(() => {
    const base = todayIso();
    return [shiftIso(base, -2), shiftIso(base, -1), base];
  });
  const [newDate, setNewDate] = useState(() => todayIso());
  const [copied, setCopied] = useState(false);

  const session = useMemo(
    () =>
      computeSession({
        rounds,
        paceId,
        weightKg: toNumber(weight),
        bothSides,
        restSeconds: toNumber(rest),
      }),
    [rounds, paceId, weight, bothSides, rest],
  );

  const streak = useMemo(() => computeStreak({ dates, today }), [dates, today]);

  const hasError = Boolean(session.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Surya Namaskar session",
      `Rounds: ${NUM0.format(session.rounds)}${bothSides ? " (both sides — 2 sequences each)" : ""}`,
      `Postures: ${NUM0.format(session.postures)} · Breaths: ${NUM0.format(session.breaths)}`,
      `Pace: ${session.pace.label} (${session.pace.secondsPerSequence}s per sequence)`,
      `Time: ${formatDuration(session.totalSeconds)} (min:sec)`,
      `Energy: ${NUM0.format(session.calories)} kcal at ${NUM0.format(toNumber(weight))} kg (MET ${session.pace.met})`,
      `Streak: ${NUM0.format(streak.currentStreak || 0)} days current, ${NUM0.format(streak.longestStreak || 0)} days best`,
    ].join("\n");
  }, [hasError, session, bothSides, weight, streak]);

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
    setRounds(DEFAULTS.rounds);
    setPaceId(DEFAULTS.paceId);
    setWeight(DEFAULTS.weight);
    setBothSides(DEFAULTS.bothSides);
    setRest(DEFAULTS.rest);
    setDates([shiftIso(today, -2), shiftIso(today, -1), today]);
    setNewDate(today);
    setCopied(false);
  };

  const addDate = () => {
    if (!newDate) return;
    setDates((current) => (current.includes(newDate) ? current : [...current, newDate].sort()));
    setCopied(false);
  };

  const removeDate = (iso) => {
    setDates((current) => current.filter((item) => item !== iso));
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Sunrise className="h-4 w-4" aria-hidden="true" />
          Yoga practice
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Surya Namaskar Counter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tap out your rounds of the twelve-posture sequence and see breaths, session time and a
          MET-based energy estimate — plus how many days in a row you have kept the practice going.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Rounds completed
        </p>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            aria-label="One round fewer"
            onClick={() => setRounds((value) => Math.max(1, value - 1))}
            className={`${GHOST_BTN} h-14 w-14 px-0`}
          >
            <Minus className="h-5 w-5" aria-hidden="true" />
          </button>
          <output
            className="min-w-[5rem] flex-1 text-center text-5xl font-semibold tabular-nums text-[var(--primary)]"
            aria-live="polite"
          >
            {rounds}
          </output>
          <button
            type="button"
            aria-label="One more round"
            onClick={() => setRounds((value) => Math.min(1080, value + 1))}
            className={`${PRIMARY_BTN} h-14 w-14 px-0`}
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {[5, 11, 12, 21, 108].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setRounds(preset)}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset} rounds
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sn-pace">
              Practice pace
            </label>
            <select
              id="sn-pace"
              className={`mt-2 ${INPUT_CLASS}`}
              value={paceId}
              onChange={(event) => setPaceId(event.target.value)}
            >
              {PACES.map((pace) => (
                <option key={pace.id} value={pace.id}>
                  {pace.label} · {pace.secondsPerSequence}s
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sn-weight">
              Body weight (kg)
            </label>
            <input
              id="sn-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="20"
              max="300"
              step="0.5"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sn-rest">
              Rest between rounds (seconds)
            </label>
            <input
              id="sn-rest"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="300"
              step="5"
              value={rest}
              onChange={(event) => setRest(event.target.value)}
            />
          </div>
          <label
            className="flex min-h-11 items-center gap-3 self-end rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-medium"
            htmlFor="sn-both"
          >
            <input
              id="sn-both"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={bothSides}
              onChange={(event) => setBothSides(event.target.checked)}
            />
            One round = both legs (2 sequences)
          </label>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {session.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Session length
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : formatDuration(session.totalSeconds)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see the session."
                : `${NUM0.format(session.breaths)} breaths across ${NUM0.format(session.postures)} postures`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy Surya Namaskar session summary"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy summary"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the counter"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Sequences of 12 postures", hasError ? DASH : NUM0.format(session.sequences)],
            ["Breaths", hasError ? DASH : NUM0.format(session.breaths)],
            [
              "Seconds per posture",
              hasError ? DASH : `${NUM1.format(session.secondsPerPosture)} s`,
            ],
            [
              "Breathing rate while moving",
              hasError ? DASH : `${NUM1.format(session.breathsPerMinute)} breaths/min`,
            ],
            [
              "Energy used",
              hasError ? DASH : `${NUM0.format(session.calories)} kcal`,
            ],
            [
              "Per round",
              hasError ? DASH : `${NUM1.format(session.caloriesPerRound)} kcal`,
            ],
            [
              "MET-minutes",
              hasError ? DASH : `${NUM0.format(session.metMinutes)} (MET ${session.pace.met})`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        {!hasError && (
          <p className="mt-4 text-xs text-[var(--muted-foreground)]">
            MET value {session.pace.met} from the Compendium of Physical Activities ({session.pace.metSource}).
            Energy uses kcal/min = MET × 3.5 × kg ÷ 200.
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Practice streak</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          {[
            ["Current streak", `${NUM0.format(streak.currentStreak || 0)} days`],
            ["Longest streak", `${NUM0.format(streak.longestStreak || 0)} days`],
            ["Days logged", NUM0.format(streak.totalDays || 0)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-md border border-[var(--border)] px-3 py-3">
              <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">{label}</p>
              <p className="mt-1 text-xl font-semibold">{value}</p>
            </div>
          ))}
        </div>

        {streak.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {streak.error}
          </p>
        ) : (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">
            {streak.practisedToday
              ? "Logged for today — the streak is safe."
              : streak.lastGapDays === 1
                ? "Yesterday was your last practice. Log today to keep the streak."
                : "No recent practice logged. Any day you practise restarts the count."}
          </p>
        )}

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
          <div>
            <label className={LABEL_CLASS} htmlFor="sn-date">
              Log a practice day
            </label>
            <input
              id="sn-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              max={today}
              value={newDate}
              onChange={(event) => setNewDate(event.target.value)}
            />
          </div>
          <button type="button" onClick={addDate} className={`${PRIMARY_BTN} sm:mt-8`}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add day
          </button>
        </div>

        {dates.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {[...dates].sort().reverse().map((iso) => (
              <li key={iso}>
                <button
                  type="button"
                  onClick={() => removeDate(iso)}
                  aria-label={`Remove ${iso} from the practice log`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-medium transition hover:border-[var(--danger)] hover:text-[var(--danger)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {iso}
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 overflow-x-auto rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The twelve postures and their breath</h2>
        <table className="mt-3 w-full min-w-[320px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              <th scope="col" className="py-2 pr-3 font-semibold">
                #
              </th>
              <th scope="col" className="py-2 pr-3 font-semibold">
                Posture
              </th>
              <th scope="col" className="py-2 font-semibold">
                Breath
              </th>
            </tr>
          </thead>
          <tbody>
            {SEQUENCE.map(([sanskrit, english, breath], index) => (
              <tr
                key={`${sanskrit}-${index}`}
                className="border-b border-[var(--border)] last:border-0"
              >
                <td className="py-2 pr-3 font-semibold tabular-nums">{index + 1}</td>
                <td className="py-2 pr-3">
                  <span className="font-semibold">{sanskrit}</span>
                  <span className="block text-[var(--muted-foreground)]">{english}</span>
                </td>
                <td className="py-2 capitalize text-[var(--muted-foreground)]">{breath}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Calorie figures are population estimates from published MET values and will differ from your
        own metabolism. Informational only — if you are pregnant, have high blood pressure, a hernia
        or a back or wrist injury, get guidance from a qualified teacher or your doctor first.
      </p>
    </main>
  );
}
