"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GlassWater, RotateCcw } from "lucide-react";

import { HOT_UPLIFT_PERCENT, PROFILES, planHydration } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  session: "180",
  profileId: PROFILES[0].id,
  sip: "150",
  hot: false,
};

const DASH = "—";

export default function ToolHome() {
  const [session, setSession] = useState(DEFAULTS.session);
  const [profileId, setProfileId] = useState(DEFAULTS.profileId);
  const [sip, setSip] = useState(DEFAULTS.sip);
  const [hot, setHot] = useState(DEFAULTS.hot);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      planHydration({
        sessionMinutes: session.trim() === "" ? Number.NaN : Number(session),
        profileId,
        sipMl: sip.trim() === "" ? Number.NaN : Number(sip),
        hot,
      }),
    [session, profileId, sip, hot],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Study hydration plan — ${NUM.format(result.sessionMinutes)} minute session (${result.profile.label}${result.hot ? ", hot weather" : ""})`,
      `Session target: ${NUM.format(result.targetMl)} ml`,
      `Drink about ${NUM.format(result.perSipMl)} ml every ${NUM.format(result.intervalMinutes)} minutes`,
      "",
      ...result.schedule.map(
        (stop) => `At ${stop.minute} min: drink (running total ${NUM.format(stop.cumulativeMl)} ml)`,
      ),
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
    setSession(DEFAULTS.session);
    setProfileId(DEFAULTS.profileId);
    setSip(DEFAULTS.sip);
    setHot(DEFAULTS.hot);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Session water target", DASH],
        ["Drink about", DASH],
        ["Daily drinks reference (EFSA)", DASH],
        ["Daily total water reference (EFSA)", DASH],
      ]
    : [
        ["Session water target", `${NUM.format(result.targetMl)} ml`],
        [
          "Drink about",
          `${NUM.format(result.perSipMl)} ml every ${NUM.format(result.intervalMinutes)} min`,
        ],
        ["Daily drinks reference (EFSA)", `${NUM.format(result.dailyFluidsMl)} ml`],
        ["Daily total water reference (EFSA)", `${NUM.format(result.dailyTotalMl)} ml`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <GlassWater className="h-4 w-4" aria-hidden="true" />
          Exam wellness
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Study Hydration Reminder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pro-rates the EFSA daily water intake over your study block and turns it into a simple
          sip schedule — how much, how often, and when.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="shr-session">
              Study session length (minutes)
            </label>
            <input
              id="shr-session"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="15"
              max="720"
              step="15"
              value={session}
              onChange={(event) => setSession(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="shr-profile">
              Who is studying?
            </label>
            <select
              id="shr-profile"
              className={`mt-2 ${INPUT_CLASS}`}
              value={profileId}
              onChange={(event) => setProfileId(event.target.value)}
            >
              {PROFILES.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="shr-sip">
              Comfortable amount per drink (ml)
            </label>
            <input
              id="shr-sip"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="30"
              max="500"
              step="10"
              value={sip}
              onChange={(event) => setSip(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              A few gulps is about 100–150 ml; a small glass is about 200 ml.
            </p>
          </div>
          <div className="flex items-end">
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[var(--foreground)]"
              htmlFor="shr-hot"
            >
              <input
                id="shr-hot"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                checked={hot}
                onChange={(event) => setHot(event.target.checked)}
              />
              Hot room or summer weather (adds ~{HOT_UPLIFT_PERCENT}%)
            </label>
          </div>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Water for this session
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.targetMl)} ml`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see your plan."
                : `About ${NUM.format(result.perSipMl)} ml every ${NUM.format(result.intervalMinutes)} minutes — ${result.sipCount} drink${result.sipCount === 1 ? "" : "s"} in total.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the hydration schedule"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy schedule"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Sip timeline</h2>
          <ol className="mt-3 space-y-2 text-sm">
            {result.schedule.map((stop) => (
              <li
                key={stop.minute}
                className="flex items-center justify-between gap-4 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
              >
                <span className="font-semibold">{stop.minute} min</span>
                <span className="text-[var(--muted-foreground)]">
                  drink · running total {NUM.format(stop.cumulativeMl)} ml
                </span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        General guidance based on EFSA adequate-intake values, not medical advice. Needs vary with
        heat, exercise and health conditions; thirst and pale-yellow urine are good practical
        checks. People on fluid-restricted treatment should follow their doctor's limits.
      </p>
    </main>
  );
}
