"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileBadge, RotateCcw } from "lucide-react";

import {
  ACTIVITIES,
  LICENCE_TYPES,
  STATUS,
  evaluateFontUsage,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_LICENCE = "desktop";
const DEFAULT_ACTIVITIES = ["desktop-artwork", "pdf-print", "webfont", "mobile-app"];
const DEFAULT_LICENSED = "2";
const DEFAULT_NEEDED = "5";

const STATUS_LABEL = {
  [STATUS.ALLOWED]: "Covered",
  [STATUS.DEPENDS]: "Read the clause",
  [STATUS.BLOCKED]: "Not covered",
};

const STATUS_CLASS = {
  [STATUS.ALLOWED]: "bg-[var(--success)]/12 text-[var(--success)]",
  [STATUS.DEPENDS]: "bg-[var(--muted)] text-[var(--muted-foreground)]",
  [STATUS.BLOCKED]: "bg-[var(--danger-soft)] text-[var(--danger)]",
};

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return 0;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [licence, setLicence] = useState(DEFAULT_LICENCE);
  const [activities, setActivities] = useState(DEFAULT_ACTIVITIES);
  const [licensedUnits, setLicensedUnits] = useState(DEFAULT_LICENSED);
  const [neededUnits, setNeededUnits] = useState(DEFAULT_NEEDED);
  const [copied, setCopied] = useState(false);

  const licenceInfo = useMemo(
    () => LICENCE_TYPES.find((item) => item.id === licence) || LICENCE_TYPES[0],
    [licence],
  );

  const result = useMemo(() => {
    const licensed = toNumber(licensedUnits);
    const needed = toNumber(neededUnits);
    if (Number.isNaN(licensed) || Number.isNaN(needed)) {
      return { error: "Licence quantities must be numbers." };
    }
    return evaluateFontUsage({
      licence,
      activities,
      licensedUnits: licensed,
      neededUnits: needed,
    });
  }, [licence, activities, licensedUnits, neededUnits]);

  const summary = useMemo(() => {
    if (result.error) return "";
    const lines = [
      "Font Licence Usage Explainer",
      `Licence held: ${result.licence.name}`,
      `Checked ${result.totalChecked} activities — ${result.allowedCount} covered, ${result.dependsCount} depend on the EULA wording, ${result.blockedCount} not covered.`,
      "",
    ];
    result.verdicts.forEach((verdict) => {
      lines.push(`[${STATUS_LABEL[verdict.status]}] ${verdict.name}`);
      if (verdict.note) lines.push(`    ${verdict.note}`);
    });
    if (result.extraLicences.length > 0) {
      lines.push("");
      lines.push(`Also needed: ${result.extraLicences.map((l) => l.name).join(", ")}`);
    }
    if (!result.capacity.unlimited) {
      lines.push("");
      lines.push(
        `Capacity: ${NUM.format(result.capacity.licensed)} licensed vs ${NUM.format(result.capacity.needed)} needed ${result.capacity.metric}` +
          (result.capacity.shortfall > 0
            ? ` — short by ${NUM.format(result.capacity.shortfall)}.`
            : " — within your licence."),
      );
    }
    return lines.join("\n");
  }, [result]);

  const toggleActivity = (id) => {
    setActivities((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

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
    setLicence(DEFAULT_LICENCE);
    setActivities(DEFAULT_ACTIVITIES);
    setLicensedUnits(DEFAULT_LICENSED);
    setNeededUnits(DEFAULT_NEEDED);
    setCopied(false);
  };

  const dash = "—";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileBadge className="h-4 w-4" aria-hidden="true" />
          Creator rights
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Font Licence Usage Explainer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick the licence you actually bought, tick what you plan to do with the font, and see
          which uses are covered, which hang on the exact EULA wording and which need a separate
          licence.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div>
          <label className={LABEL_CLASS} htmlFor="font-licence">
            Licence you hold
          </label>
          <select
            id="font-licence"
            className={`mt-2 ${INPUT_CLASS}`}
            value={licence}
            onChange={(event) => setLicence(event.target.value)}
          >
            {LICENCE_TYPES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {licenceInfo.blurb}
          </p>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            What do you want to do with it?
          </legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {ACTIVITIES.map((activity) => {
              const id = `font-activity-${activity.id}`;
              const checked = activities.includes(activity.id);
              return (
                <label
                  key={activity.id}
                  htmlFor={id}
                  className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-md border p-3 text-sm transition ${
                    checked
                      ? "border-[var(--primary)] bg-[var(--primary)]/8"
                      : "border-[var(--border)] bg-[var(--background)]"
                  }`}
                >
                  <input
                    id={id}
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
                    checked={checked}
                    onChange={() => toggleActivity(activity.id)}
                  />
                  <span>
                    <span className="block font-semibold">{activity.name}</span>
                    <span className="mt-0.5 block text-xs leading-5 text-[var(--muted-foreground)]">
                      {activity.detail}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {!licenceInfo.unlimited && (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="font-licensed">
                {licenceInfo.metric} licensed
              </label>
              <input
                id="font-licensed"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={licensedUnits}
                onChange={(event) => setLicensedUnits(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="font-needed">
                {licenceInfo.metric} you actually need
              </label>
              <input
                id="font-needed"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={neededUnits}
                onChange={(event) => setNeededUnits(event.target.value)}
              />
            </div>
          </div>
        )}
      </section>

      {result.error ? (
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
              Uses covered by this licence
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {result.error ? dash : `${result.allowedCount} of ${result.totalChecked}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {result.error
                ? "Fix the input above to see the verdict."
                : `${result.dependsCount} depend on the exact wording, ${result.blockedCount} need another licence.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy font licence verdict"
              className={GHOST_BTN}
              disabled={Boolean(result.error)}
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
              aria-label="Reset the licence checker"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Licence held", result.error ? dash : result.licence.name],
            ["Activities checked", result.error ? dash : NUM.format(result.totalChecked)],
            ["Clearly covered", result.error ? dash : NUM.format(result.allowedCount)],
            ["Depends on the EULA wording", result.error ? dash : NUM.format(result.dependsCount)],
            ["Not covered at all", result.error ? dash : NUM.format(result.blockedCount)],
            [
              "Extra licences to buy",
              result.error
                ? dash
                : result.extraLicences.length === 0
                  ? "None"
                  : result.extraLicences.map((item) => item.name).join(", "),
            ],
            [
              `Capacity (${result.error ? "metered units" : result.licence.metric})`,
              result.error
                ? dash
                : result.capacity.unlimited
                  ? "Not metered"
                  : result.capacity.shortfall > 0
                    ? `Short by ${NUM.format(result.capacity.shortfall)}`
                    : "Within your licence",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!result.error && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Use by use</h2>
          <ul className="mt-3 space-y-3">
            {result.verdicts.map((verdict) => (
              <li
                key={verdict.id}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{verdict.name}</span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_CLASS[verdict.status]}`}
                  >
                    {STATUS_LABEL[verdict.status]}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                  {verdict.note}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. Every foundry writes its own EULA, so treat this as a
        map of where the usual boundaries sit and read the licence file that came with your font.
        For a contested or high-value use, ask the foundry in writing or speak to a lawyer.
      </p>
    </main>
  );
}
