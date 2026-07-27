"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Link2, RotateCcw } from "lucide-react";

import {
  CHAIN_SIZES,
  LINKS_MEASURED,
  SLACK_SPECS,
  WEAR_REPLACE_PCT,
  assessChain,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";

const DEFAULTS = {
  chainSize: "520",
  span: "322",
  bikeType: "commuter",
  slack: "25",
  sealed: true,
  harsh: false,
  lastLube: "12000",
  currentOdo: "12350",
};

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
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [chainSize, setChainSize] = useState(DEFAULTS.chainSize);
  const [span, setSpan] = useState(DEFAULTS.span);
  const [bikeType, setBikeType] = useState(DEFAULTS.bikeType);
  const [slack, setSlack] = useState(DEFAULTS.slack);
  const [sealed, setSealed] = useState(DEFAULTS.sealed);
  const [harsh, setHarsh] = useState(DEFAULTS.harsh);
  const [lastLube, setLastLube] = useState(DEFAULTS.lastLube);
  const [currentOdo, setCurrentOdo] = useState(DEFAULTS.currentOdo);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      assessChain({
        chainSize,
        measuredSpanMm: toNumber(span),
        bikeType,
        measuredSlackMm: toNumber(slack),
        sealedChain: sealed,
        harshConditions: harsh,
        lastLubeOdo: toNumber(lastLube),
        currentOdo: toNumber(currentOdo),
      }),
    [chainSize, span, bikeType, slack, sealed, harsh, lastLube, currentOdo],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Chain Check",
      `Verdict: ${result.verdict}`,
      `Chain ${result.size.label}, pitch ${result.size.pitchMm} mm — new span over ${LINKS_MEASURED} links is ${NUM1.format(result.nominal)} mm`,
      `Measured ${span} mm = ${NUM2.format(result.elongationPct)}% elongation (${result.wearStatus}); limit ${NUM1.format(result.spanAtServiceLimit)} mm`,
      `Free play ${slack} mm against a ${result.spec.minMm}–${result.spec.maxMm} mm target — ${result.slackStatus}`,
      `Lube every ${NUM.format(result.lubeIntervalKm)} km; ${NUM.format(result.kmSinceLube)} km done, next at ${NUM.format(result.nextLubeAtOdo)} km`,
    ].join("\n");
  }, [hasError, result, span, slack]);

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
    setChainSize(DEFAULTS.chainSize);
    setSpan(DEFAULTS.span);
    setBikeType(DEFAULTS.bikeType);
    setSlack(DEFAULTS.slack);
    setSealed(DEFAULTS.sealed);
    setHarsh(DEFAULTS.harsh);
    setLastLube(DEFAULTS.lastLube);
    setCurrentOdo(DEFAULTS.currentOdo);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["New chain span over 20 links", DASH],
        ["Your measurement", DASH],
        ["Elongation", DASH],
        ["Service limit span", DASH],
        ["Measurement left before the limit", DASH],
        ["Target free play", DASH],
        ["Your free play", DASH],
        ["Adjustment needed", DASH],
        ["Lube interval", DASH],
        ["Ridden since last lube", DASH],
        ["Next lube due at", DASH],
      ]
    : [
        ["New chain span over 20 links", `${NUM1.format(result.nominal)} mm`],
        ["Your measurement", `${NUM1.format(toNumber(span))} mm`],
        ["Elongation", `${NUM2.format(result.elongationPct)}% (${result.wearStatus})`],
        ["Service limit span", `${NUM1.format(result.spanAtServiceLimit)} mm at ${WEAR_REPLACE_PCT}%`],
        ["Measurement left before the limit", `${NUM1.format(result.mmLeftToLimit)} mm`],
        ["Target free play", `${result.spec.minMm}–${result.spec.maxMm} mm (aim ${result.targetMidMm} mm)`],
        ["Your free play", `${NUM1.format(toNumber(slack))} mm — ${result.slackStatus}`],
        [
          "Adjustment needed",
          Math.abs(result.slackAdjustMm) < 0.5
            ? "none"
            : `${result.slackAdjustMm > 0 ? "add" : "remove"} ${NUM1.format(Math.abs(result.slackAdjustMm))} mm of play`,
        ],
        ["Lube interval", `${NUM.format(result.lubeIntervalKm)} km`],
        [
          "Ridden since last lube",
          `${NUM.format(result.kmSinceLube)} km (${NUM.format(result.lubeDuePct)}% of the interval)`,
        ],
        [
          "Next lube due at",
          result.lubeOverdue
            ? `${NUM.format(result.nextLubeAtOdo)} km — overdue by ${NUM.format(Math.abs(result.kmToNextLube))} km`
            : `${NUM.format(result.nextLubeAtOdo)} km`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Link2 className="h-4 w-4" aria-hidden="true" />
          Final drive
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Bike Chain Slack Guide</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Three checks in one: how much free play your suspension layout needs, how far the chain has
          worn against the {WEAR_REPLACE_PCT}% service limit, and when the next clean and lube is due.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Chain and bike
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="chain-size">
              Chain size
            </label>
            <select
              id="chain-size"
              className={`mt-2 ${INPUT_CLASS}`}
              value={chainSize}
              onChange={(event) => setChainSize(event.target.value)}
            >
              {CHAIN_SIZES.map((size) => (
                <option key={size.id} value={size.id}>
                  {size.label} · pitch {size.pitchMm} mm
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Stamped on the side plates of the chain.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="chain-type">
              Suspension layout
            </label>
            <select
              id="chain-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={bikeType}
              onChange={(event) => setBikeType(event.target.value)}
            >
              {SLACK_SPECS.map((spec) => (
                <option key={spec.id} value={spec.id}>
                  {spec.label} · {spec.minMm}–{spec.maxMm} mm
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="chain-span">
              Length across {LINKS_MEASURED} links (mm)
            </label>
            <input
              id="chain-span"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="0.5"
              value={span}
              onChange={(event) => setSpan(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Pin centre to pin centre, chain pulled taut, over 21 pins.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="chain-slack">
              Free play you measured (mm)
            </label>
            <input
              id="chain-slack"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="120"
              step="1"
              value={slack}
              onChange={(event) => setSlack(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Midpoint of the lower run, bike unladen, up-and-down total.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Lubrication
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="chain-last-lube">
              Odometer at the last lube (km)
            </label>
            <input
              id="chain-last-lube"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={lastLube}
              onChange={(event) => setLastLube(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="chain-current-odo">
              Odometer now (km)
            </label>
            <input
              id="chain-current-odo"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={currentOdo}
              onChange={(event) => setCurrentOdo(event.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3">
            <input
              id="chain-sealed"
              type="checkbox"
              checked={sealed}
              onChange={(event) => setSealed(event.target.checked)}
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            />
            <label htmlFor="chain-sealed" className="min-h-11 flex-1 py-3 text-sm font-semibold">
              Sealed O-ring / X-ring chain
            </label>
          </div>
          <div className="flex items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3">
            <input
              id="chain-harsh"
              type="checkbox"
              checked={harsh}
              onChange={(event) => setHarsh(event.target.checked)}
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            />
            <label htmlFor="chain-harsh" className="min-h-11 flex-1 py-3 text-sm font-semibold">
              Rain, dust or coastal riding
            </label>
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
              Chain wear used
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${hasError ? "text-[var(--danger)]" : TONE_CLASS[result.tone]}`}
            >
              {hasError ? DASH : `${NUM.format(Math.min(100, result.wearUsedPct))}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see the verdict." : result.verdict}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy chain check result"
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          How to measure
        </h2>
        <ol className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
          <li>
            <strong className="text-[var(--foreground)]">Free play:</strong> bike unladen and upright,
            in neutral. Find the midpoint of the lower chain run between the sprockets, push the chain
            up and let it drop — the total travel is the free play. Rotate the wheel and repeat at
            several points; set the adjustment at the tightest spot you find.
          </li>
          <li>
            <strong className="text-[var(--foreground)]">Stretch:</strong> put the bike in gear or hold
            the rear brake so the top run is taut, then measure from the centre of one pin to the
            centre of the pin {LINKS_MEASURED} links away.
          </li>
          <li>
            <strong className="text-[var(--foreground)]">Tight spot:</strong> a chain that reads correct
            at one point and tight 30 cm later is unevenly worn. That chain is finished whatever the
            average says.
          </li>
          <li>
            <strong className="text-[var(--foreground)]">Sprockets:</strong> hooked or shark-fin teeth
            mean the chain gets replaced with both sprockets. A new chain on worn sprockets wears out
            in a fraction of its life.
          </li>
        </ol>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational guidance, not a workshop manual. The free-play ranges here are typical for each
        suspension layout — the sticker on your swingarm or the figure in your owner&apos;s manual is the
        one to follow, and axle nut torque must be set with a torque wrench after any adjustment.
      </p>
    </main>
  );
}
