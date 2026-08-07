"use client";

import { useMemo, useState } from "react";
import { Check, CloudRain, Copy, RotateCcw } from "lucide-react";

import {
  CHECKLIST,
  LEGAL_MIN_TREAD_MM,
  NEW_TREAD_MM,
  WET_FOLLOWING_GAP_S,
  WET_SAFE_TREAD_MM,
  assessMonsoonReadiness,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DASH = "—";

const GROUP_ORDER = ["Tyres & brakes", "Visibility", "Sealing & electricals", "Documents & kit"];

const DEFAULT_CHECKED = {
  tread: true,
  pressure: true,
  sidewall: true,
  brakes: true,
  wipers: true,
  washer: true,
  demist: true,
  lights: true,
  wading: true,
  battery: true,
};

const DEFAULTS = { tread: "4", psi: "32", speed: "80" };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const TONE_CLASS = {
  success: "text-[var(--success)]",
  warn: "text-[var(--primary)]",
  danger: "text-[var(--danger)]",
};

const toNumber = (raw) => {
  const text = String(raw).trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [tread, setTread] = useState(DEFAULTS.tread);
  const [psi, setPsi] = useState(DEFAULTS.psi);
  const [speed, setSpeed] = useState(DEFAULTS.speed);
  const [checked, setChecked] = useState(DEFAULT_CHECKED);
  const [notApplicable, setNotApplicable] = useState({});
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      assessMonsoonReadiness({
        treadMm: toNumber(tread),
        pressurePsi: toNumber(psi),
        speedKmh: toNumber(speed),
        checked,
        notApplicable,
      }),
    [tread, psi, speed, checked, notApplicable],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Monsoon Driving Readiness",
      `Verdict: ${result.verdict}`,
      `Checklist: ${NUM.format(result.score)}% (${result.earned}/${result.available} points, ${result.blockers.length} essential item(s) open)`,
      `Tread ${tread} mm — ${result.band.label}, wet grip coefficient ${result.band.mu}`,
      `Stopping from ${speed} km/h: ${NUM1.format(result.dry.total)} m dry vs ${NUM1.format(result.wet.total)} m wet (+${NUM1.format(result.extraMetres)} m)`,
      `Aquaplaning starts near ${NUM.format(result.aquaplaneKmh)} km/h at ${psi} psi`,
      `Rain following gap: ${NUM.format(result.wetGapMetres)} m (${WET_FOLLOWING_GAP_S} seconds)`,
      `Equivalent safe rain speed: ${NUM.format(result.equivalentWetSpeedKmh)} km/h`,
    ].join("\n");
  }, [hasError, result, tread, psi, speed]);

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
    if (
      typeof window !== "undefined" &&
      !window.confirm("Reset the checklist? This clears every ticked control and cannot be undone.")
    ) {
      return;
    }
    setTread(DEFAULTS.tread);
    setPsi(DEFAULTS.psi);
    setSpeed(DEFAULTS.speed);
    setChecked(DEFAULT_CHECKED);
    setNotApplicable({});
    setCopied(false);
  };

  const toggle = (id) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleNa = (id) => setNotApplicable((prev) => ({ ...prev, [id]: !prev[id] }));

  const rows = hasError
    ? [
        ["Dry stopping distance", DASH],
        ["Wet stopping distance", DASH],
        ["Extra metres in the wet", DASH],
        ["Wet grip band", DASH],
        ["Usable tread left", DASH],
        ["Aquaplaning onset speed", DASH],
        ["Margin to aquaplaning", DASH],
        ["Rain following gap", DASH],
        ["Equivalent safe rain speed", DASH],
        ["Checklist points", DASH],
      ]
    : [
        [
          "Dry stopping distance",
          `${NUM1.format(result.dry.total)} m (${NUM1.format(result.dry.reaction)} m reacting)`,
        ],
        [
          "Wet stopping distance",
          `${NUM1.format(result.wet.total)} m (${NUM1.format(result.wet.reaction)} m reacting)`,
        ],
        [
          "Extra metres in the wet",
          `+${NUM1.format(result.extraMetres)} m (+${NUM.format(result.extraPercent)}%)`,
        ],
        ["Wet grip band", `${result.band.label} · μ ${result.band.mu}`],
        ["Usable tread left", `${NUM.format(result.treadRemainingPct)}%`],
        ["Aquaplaning onset speed", `${NUM.format(result.aquaplaneKmh)} km/h`],
        [
          "Margin to aquaplaning",
          result.aquaplaneMargin >= 0
            ? `${NUM.format(result.aquaplaneMargin)} km/h below onset`
            : `${NUM.format(Math.abs(result.aquaplaneMargin))} km/h above onset`,
        ],
        ["Rain following gap", `${NUM.format(result.wetGapMetres)} m (${WET_FOLLOWING_GAP_S} s)`],
        ["Equivalent safe rain speed", `${NUM.format(result.equivalentWetSpeedKmh)} km/h`],
        ["Checklist points", `${result.earned} of ${result.available}`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CloudRain className="h-4 w-4" aria-hidden="true" />
          Before the rains
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Monsoon Driving Readiness Checker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Your tread depth and tyre pressure decide how far the car takes to stop in rain and the
          speed at which it starts to float. Measure both, tick the checklist, and see the numbers.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Measure these first
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="monsoon-tread">
              Tread depth (mm)
            </label>
            <input
              id="monsoon-tread"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              max="20"
              step="0.1"
              value={tread}
              onChange={(event) => setTread(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Legal minimum {LEGAL_MIN_TREAD_MM} mm; a new tyre is about {NEW_TREAD_MM} mm.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="monsoon-psi">
              Cold tyre pressure (psi)
            </label>
            <input
              id="monsoon-psi"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="10"
              max="80"
              step="1"
              value={psi}
              onChange={(event) => setPsi(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="monsoon-speed">
              Speed you actually cruise at (km/h)
            </label>
            <input
              id="monsoon-speed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="200"
              step="5"
              value={speed}
              onChange={(event) => setSpeed(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Stopping distance in rain
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${hasError ? "text-[var(--danger)]" : TONE_CLASS[result.tone]}`}
              aria-live="polite"
            >
              {hasError ? DASH : `${NUM1.format(result.wet.total)} m`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]" aria-live="polite">
              {hasError ? "Fix the input above to see the numbers." : result.verdict}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy monsoon readiness result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
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

        {!hasError && result.notes.length > 0 && (
          <ul className="mt-4 space-y-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.notes.map((note) => (
              <li key={note} className="rounded-md bg-[var(--muted)] px-3 py-2">
                {note}
              </li>
            ))}
          </ul>
        )}
      </section>

      {GROUP_ORDER.map((group) => (
        <section key={group} className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {group}
            </h2>
            {!hasError && (
              <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                {NUM.format(
                  result.groupScores.find((bucket) => bucket.group === group)?.percent ?? 0,
                )}
                %
              </span>
            )}
          </div>
          <ul className="mt-3 space-y-2">
            {CHECKLIST.filter((item) => item.group === group).map((item) => {
              const na = Boolean(item.optional && notApplicable[item.id]);
              return (
                <li
                  key={item.id}
                  className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                >
                  <div className="flex items-start gap-3">
                    <input
                      id={`monsoon-item-${item.id}`}
                      type="checkbox"
                      checked={Boolean(checked[item.id]) && !na}
                      disabled={na}
                      onChange={() => toggle(item.id)}
                      className="mt-0.5 h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                    />
                    <label
                      htmlFor={`monsoon-item-${item.id}`}
                      className={`flex-1 text-sm leading-6 ${na ? "text-[var(--muted-foreground)] line-through" : "text-[var(--foreground)]"}`}
                    >
                      {item.label}
                      {item.critical && (
                        <span className="ml-2 rounded-full bg-[var(--danger-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--danger)]">
                          essential
                        </span>
                      )}
                    </label>
                  </div>
                  {item.optional && (
                    <button
                      type="button"
                      onClick={() => toggleNa(item.id)}
                      aria-pressed={na}
                      className="mt-2 ml-8 min-h-11 rounded-md px-2 text-xs font-semibold text-[var(--muted-foreground)] underline underline-offset-4 transition hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                    >
                      {na ? "Applies to me after all" : "My car does not have this"}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate. Friction coefficients are representative test values and real grip
        depends on your tyre compound, the road surface and how deep the water is; treat every figure
        as a floor, not a promise. Tread below {WET_SAFE_TREAD_MM} mm is the point most tyre makers
        advise replacement, well before the {LEGAL_MIN_TREAD_MM} mm legal limit. Never restart an
        engine that has stalled in standing water — that is what turns a tow into a rebuild.
      </p>
    </main>
  );
}
