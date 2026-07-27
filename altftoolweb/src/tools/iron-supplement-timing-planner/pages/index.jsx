"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Droplet, Info, RotateCcw, TriangleAlert } from "lucide-react";

import {
  DOSE_FREQUENCIES,
  ELEMENTAL_DAILY,
  IRON_INTERACTIONS,
  IRON_SALTS,
  formatClockTime,
  formatGap,
  parseClockTime,
  planIronTiming,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none";

const DEFAULT_ITEMS = {
  meal: "13:00",
  tea: "08:00",
  dairy: "08:00",
  antacid: "",
  levothyroxine: "",
  vitaminC: "11:00",
};

const DEFAULTS = {
  doseTime: "11:00",
  saltKey: "sulfate",
  tabletMg: "325",
  tabletsPerDose: "1",
  frequency: "daily",
};

const toNum = (raw) => {
  const text = String(raw ?? "").trim();
  if (text === "") return NaN;
  const value = Number(text.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [doseTime, setDoseTime] = useState(DEFAULTS.doseTime);
  const [saltKey, setSaltKey] = useState(DEFAULTS.saltKey);
  const [tabletMg, setTabletMg] = useState(DEFAULTS.tabletMg);
  const [tabletsPerDose, setTabletsPerDose] = useState(DEFAULTS.tabletsPerDose);
  const [frequency, setFrequency] = useState(DEFAULTS.frequency);
  const [items, setItems] = useState(DEFAULT_ITEMS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const doseMinutes = parseClockTime(doseTime);
    if (doseMinutes === null) return { error: "Enter the tablet time as a valid time of day." };

    const itemMinutes = {};
    for (const item of IRON_INTERACTIONS) {
      const raw = items[item.key];
      if (!raw) continue;
      const parsed = parseClockTime(raw);
      if (parsed === null) {
        return { error: `The time entered for ${item.label.toLowerCase()} is not a valid time.` };
      }
      itemMinutes[item.key] = parsed;
    }

    return planIronTiming({
      doseMinutes,
      itemMinutes,
      saltKey,
      tabletMg: toNum(tabletMg),
      tabletsPerDose: toNum(tabletsPerDose),
      frequency,
    });
  }, [doseTime, saltKey, tabletMg, tabletsPerDose, frequency, items]);

  const hasError = Boolean(result.error);

  const setItem = (key, value) => {
    setItems((current) => ({ ...current, [key]: value }));
    setCopied(false);
  };

  const applySalt = (key) => {
    setSaltKey(key);
    setTabletMg(String(IRON_SALTS[key].typicalTabletMg));
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Iron supplement timing",
      `${result.tabletsPerDose} x ${result.tabletMg} mg ${result.salt.label} at ${result.doseLabel}`,
      `Elemental iron: ${result.perDoseElemental} mg per dose, ${result.elementalPerDay} mg/day, ${result.elementalPerWeek} mg/week (${result.frequency.label})`,
      `${result.clearCount} of ${result.blockerCount} separations clear`,
    ];
    for (const check of result.checks) {
      lines.push(
        `${check.ok ? "OK" : "TOO CLOSE"} — ${check.label} at ${check.itemLabel}: ${formatGap(check.actualGap)} ${check.direction} the dose, needs ${formatGap(check.requiredGap)}`,
      );
    }
    return lines.join("\n");
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
    setDoseTime(DEFAULTS.doseTime);
    setSaltKey(DEFAULTS.saltKey);
    setTabletMg(DEFAULTS.tabletMg);
    setTabletsPerDose(DEFAULTS.tabletsPerDose);
    setFrequency(DEFAULTS.frequency);
    setItems(DEFAULT_ITEMS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--primary)] uppercase">
          <Droplet className="h-4 w-4" aria-hidden="true" />
          Medication timing
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Iron Supplement Timing Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tea, dairy, antacids and meals all cut how much iron you actually absorb. Enter your
          routine to see which gaps are long enough, and how many milligrams of elemental iron the
          tablet really delivers.
        </p>
      </header>

      <section className={CARD}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="iron-salt">
              Iron salt on the pack
            </label>
            <select
              id="iron-salt"
              className={INPUT}
              value={saltKey}
              onChange={(event) => applySalt(event.target.value)}
            >
              {Object.values(IRON_SALTS).map((salt) => (
                <option key={salt.key} value={salt.key}>
                  {salt.label}
                  {salt.key === "elemental"
                    ? ""
                    : ` (${Math.round(salt.elementalFraction * 100)}% elemental)`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL} htmlFor="iron-mg">
              {saltKey === "elemental" ? "Elemental iron per tablet (mg)" : "Tablet strength (mg)"}
            </label>
            <input
              id="iron-mg"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="5"
              max="2000"
              step="5"
              value={tabletMg}
              onChange={(event) => {
                setTabletMg(event.target.value);
                setCopied(false);
              }}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="iron-count">
              Tablets per dose
            </label>
            <input
              id="iron-count"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0.5"
              max="4"
              step="0.5"
              value={tabletsPerDose}
              onChange={(event) => {
                setTabletsPerDose(event.target.value);
                setCopied(false);
              }}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="iron-freq">
              How often
            </label>
            <select
              id="iron-freq"
              className={INPUT}
              value={frequency}
              onChange={(event) => {
                setFrequency(event.target.value);
                setCopied(false);
              }}
            >
              {Object.values(DOSE_FREQUENCIES).map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL} htmlFor="iron-dose-time">
              Iron tablet taken at
            </label>
            <input
              id="iron-dose-time"
              className={INPUT}
              type="time"
              value={doseTime}
              onChange={(event) => {
                setDoseTime(event.target.value);
                setCopied(false);
              }}
            />
          </div>

          {IRON_INTERACTIONS.map((item) => (
            <div key={item.key}>
              <label className={LABEL} htmlFor={`iron-${item.key}`}>
                {item.label}
              </label>
              <input
                id={`iron-${item.key}`}
                className={INPUT}
                type="time"
                value={items[item.key]}
                onChange={(event) => setItem(item.key, event.target.value)}
              />
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {item.kind === "enhancer"
                  ? "Take it with the tablet · leave blank if it does not apply"
                  : `${formatGap(item.gapAfterDose)} if after the tablet, ${formatGap(item.gapBeforeDose)} if before · leave blank if it does not apply`}
              </p>
            </div>
          ))}
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

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[var(--muted-foreground)] uppercase">
              Elemental iron per dose
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM1.format(result.perDoseElemental)} mg`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the figures."
                : `${result.tabletsPerDose} x ${result.tabletMg} mg ${result.salt.label} at ${result.doseLabel}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the iron timing plan"
              className={GHOST_BTN}
              disabled={hasError}
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
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Elemental iron per day",
              hasError ? DASH : `${NUM1.format(result.elementalPerDay)} mg`,
            ],
            [
              "Elemental iron per week",
              hasError ? DASH : `${NUM1.format(result.elementalPerWeek)} mg`,
            ],
            [
              "Usual treatment band",
              `${ELEMENTAL_DAILY.low}-${ELEMENTAL_DAILY.high} mg elemental a day`,
            ],
            [
              "Separations clear",
              hasError ? DASH : `${result.clearCount} of ${result.blockerCount}`,
            ],
            [
              "Biggest shortfall",
              hasError || result.worstShortfall === 0 ? DASH : formatGap(result.worstShortfall),
            ],
            [
              "Suggested tablet time",
              hasError || !result.suggestedDoseLabel ? DASH : result.suggestedDoseLabel,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && result.checks.length > 0 ? (
        <section className={`mt-6 ${CARD}`}>
          <h2 className="text-base font-semibold">Gap by gap</h2>
          <ul className="mt-3 space-y-3">
            {result.checks.map((check) => (
              <li
                key={check.key}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    {check.ok ? (
                      <Check className="h-4 w-4 text-[var(--success)]" aria-hidden="true" />
                    ) : (
                      <TriangleAlert className="h-4 w-4 text-[var(--danger)]" aria-hidden="true" />
                    )}
                    {check.label} at {check.itemLabel}
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      check.ok ? "text-[var(--success)]" : "text-[var(--danger)]"
                    }`}
                  >
                    {formatGap(check.actualGap)} {check.direction} the dose
                    {check.kind === "blocker" ? ` · needs ${formatGap(check.requiredGap)}` : ""}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{check.why}</p>
                {check.suggestion ? (
                  <p className="mt-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-xs font-medium text-[var(--danger)]">
                    {check.suggestion}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {!hasError && result.notes.length > 0 ? (
        <section className={`mt-6 ${CARD}`}>
          <h2 className="text-base font-semibold">Worth knowing</h2>
          <ul className="mt-3 space-y-2">
            {result.notes.map((note) => (
              <li key={note} className="flex gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
                <Info className="mt-1 h-4 w-4 shrink-0 text-[var(--primary)]" aria-hidden="true" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not medical advice. Iron overdose is the leading cause of poisoning
        deaths in young children, so keep tablets out of reach. Do not start or increase iron without
        a ferritin or full blood count result, because iron loading is harmful in conditions such as
        haemochromatosis and thalassaemia. Times shown assume every item lands exactly at the clock
        time entered, starting from{" "}
        {hasError ? "the tablet time" : formatClockTime(result.doseMinutes)}.
      </p>
    </main>
  );
}
