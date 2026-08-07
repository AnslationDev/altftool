"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Flame, RotateCcw } from "lucide-react";

import { WEIGHTS, WEIGHT_LABELS, auditFireSafety } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DEFAULT_HOME = {
  bedrooms: "3",
  levels: "1",
  lpg: true,
  fuelAppliance: true,
  fireplace: false,
  dryer: false,
  hasKids: false,
};

const HOME_FLAGS = [
  ["lpg", "We cook on LPG or piped gas"],
  ["fuelAppliance", "There is a fuel-burning appliance or an attached garage (gas geyser, generator, stove, car)"],
  ["fireplace", "There is a fireplace, wood stove or chimney"],
  ["dryer", "There is a tumble dryer"],
  ["hasKids", "Children live here"],
];

/** A realistic partly-done audit so the page shows a live verdict at first paint. */
const DEFAULT_CHECKED = [
  "alarmTest",
  "alarmBattery",
  "twoWays",
  "meetingPoint",
  "unattended",
  "clearance",
  "regulatorOff",
  "upright",
  "ventilation",
  "noDaisy",
  "damagedCords",
  "heaterClearance",
  "candles",
  "extinguisher",
];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

export default function ToolHome() {
  const [bedrooms, setBedrooms] = useState(DEFAULT_HOME.bedrooms);
  const [levels, setLevels] = useState(DEFAULT_HOME.levels);
  const [flags, setFlags] = useState({
    lpg: DEFAULT_HOME.lpg,
    fuelAppliance: DEFAULT_HOME.fuelAppliance,
    fireplace: DEFAULT_HOME.fireplace,
    dryer: DEFAULT_HOME.dryer,
    hasKids: DEFAULT_HOME.hasKids,
  });
  const [checked, setChecked] = useState(DEFAULT_CHECKED);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      auditFireSafety({
        checked,
        home: {
          bedrooms: bedrooms === "" ? 0 : Number(bedrooms),
          levels: levels === "" ? 0 : Number(levels),
          ...flags,
        },
      }),
    [checked, bedrooms, levels, flags],
  );

  const hasError = Boolean(result.error);

  const toggleFlag = (key) => (event) => {
    const next = event.target.checked;
    setFlags((current) => ({ ...current, [key]: next }));
  };

  const toggleItem = (id) => () => {
    setChecked((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const copyResult = async () => {
    if (hasError) return;
    const lines = [
      "Home fire safety audit",
      result.verdict,
      `Score: ${result.score}/${result.maxScore} (${result.percent}%)`,
      `Items passing: ${result.checkedCount}/${result.totalItems}`,
      "",
      "Equipment this home needs:",
      `Smoke alarms: ${result.equipment.smokeAlarms}`,
      `CO alarms: ${result.equipment.coAlarms}`,
      `ABC extinguishers: ${result.equipment.extinguishers}`,
      `Fire blankets: ${result.equipment.fireBlankets}`,
      "",
    ];
    if (result.missingCritical.length > 0) {
      lines.push("Critical gaps:");
      for (const item of result.missingCritical) lines.push(`- [${item.category}] ${item.label}`);
      lines.push("");
    }
    for (const category of result.byCategory) {
      lines.push(`${category.title}: ${category.done}/${category.total}`);
    }
    try {
      await navigator.clipboard.writeText(lines.join("\n").trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setBedrooms(DEFAULT_HOME.bedrooms);
    setLevels(DEFAULT_HOME.levels);
    setFlags({
      lpg: DEFAULT_HOME.lpg,
      fuelAppliance: DEFAULT_HOME.fuelAppliance,
      fireplace: DEFAULT_HOME.fireplace,
      dryer: DEFAULT_HOME.dryer,
      hasKids: DEFAULT_HOME.hasKids,
    });
    setChecked(DEFAULT_CHECKED);
    setCopied(false);
  };

  const levelTone =
    !hasError && result.level === "good"
      ? "text-[var(--success)]"
      : !hasError && result.level === "unsafe"
        ? "text-[var(--danger)]"
        : "text-[var(--primary)]";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Flame className="h-4 w-4" aria-hidden="true" />
          Home safety
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Home Fire Safety Checklist</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work through detection, escape planning, cooking, LPG, electrical and heating. Critical items
          score three points and any one left unchecked caps the verdict, because those are the
          failures that turn a fire into a fatality.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">About the home</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fs-bedrooms">
              Bedrooms
            </label>
            <input
              id="fs-bedrooms"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="20"
              step="1"
              value={bedrooms}
              onChange={(event) => setBedrooms(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fs-levels">
              Levels, including a basement
            </label>
            <input
              id="fs-levels"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="10"
              step="1"
              value={levels}
              onChange={(event) => setLevels(event.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 grid gap-2">
          {HOME_FLAGS.map(([key, label]) => (
            <label
              key={key}
              htmlFor={`fs-flag-${key}`}
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm"
            >
              <input
                id={`fs-flag-${key}`}
                type="checkbox"
                className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                checked={Boolean(flags[key])}
                onChange={toggleFlag(key)}
              />
              <span>{label}</span>
            </label>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Fire safety score
            </p>
            <p className={`mt-1 text-4xl font-semibold ${levelTone}`} aria-live="polite">
              {hasError ? DASH : `${NUM.format(result.percent)}%`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]" aria-live="polite">
              {hasError ? "Fix the input above to score the home." : result.verdict}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the fire safety audit"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy audit"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the audit" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Weighted score", hasError ? DASH : `${NUM.format(result.score)} / ${NUM.format(result.maxScore)} pts`],
            ["Items passing", hasError ? DASH : `${NUM.format(result.checkedCount)} / ${NUM.format(result.totalItems)}`],
            ["Critical gaps", hasError ? DASH : NUM.format(result.missingCritical.length)],
            ["Smoke alarms needed", hasError ? DASH : NUM.format(result.equipment.smokeAlarms)],
            ["CO alarms needed", hasError ? DASH : NUM.format(result.equipment.coAlarms)],
            ["ABC extinguishers needed", hasError ? DASH : NUM.format(result.equipment.extinguishers)],
            ["Fire blankets needed", hasError ? DASH : NUM.format(result.equipment.fireBlankets)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && result.missingCritical.length > 0 ? (
        <section
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]"
        >
          <p className="font-semibold">
            {result.missingCritical.length} critical gap
            {result.missingCritical.length === 1 ? "" : "s"} to close first:
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {result.missingCritical.map((item) => (
              <li key={item.id}>{item.label}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {hasError
        ? null
        : result.byCategory.map((category) => (
            <section
              key={category.id}
              className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base font-semibold">{category.title}</h2>
                <p className="text-sm font-semibold text-[var(--muted-foreground)]">
                  {category.done}/{category.total}
                </p>
              </div>
              {category.note ? (
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">{category.note}</p>
              ) : null}
              <div className="mt-3 grid gap-2">
                {category.items.map((item) => (
                  <label
                    key={item.id}
                    htmlFor={`fs-${item.id}`}
                    className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm"
                  >
                    <input
                      id={`fs-${item.id}`}
                      type="checkbox"
                      className="mt-0.5 h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                      checked={checked.includes(item.id)}
                      onChange={toggleItem(item.id)}
                    />
                    <span className="flex-1">
                      {item.label}
                      <span
                        className={`ml-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                          item.weight === "critical"
                            ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                            : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                        }`}
                      >
                        {WEIGHT_LABELS[item.weight]} · {WEIGHTS[item.weight]} pts
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </section>
          ))}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Educational information, not an inspection. It does not replace advice from your fire service,
        a licensed electrician or a gas fitter, and building codes differ by country and state. If you
        smell gas, do not touch a switch — turn the regulator off, open the windows, leave, and call
        for help from outside. Nothing you tick leaves your browser.
      </p>
    </main>
  );
}
