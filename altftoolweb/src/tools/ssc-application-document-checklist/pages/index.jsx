"use client";

import { useMemo, useState } from "react";
import { Check, ClipboardList, Copy, RotateCcw } from "lucide-react";

import {
  AGE_BAND_PRESETS,
  AGE_RELAXATIONS,
  APPLICATION_FEE,
  CHECKLIST_GROUPS,
  CORRECTION_FEE_FIRST,
  CORRECTION_FEE_SECOND,
  applicationFee,
  checkAgeEligibility,
  checklistReadiness,
  itemKey,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  dob: "2002-06-15",
  cutoff: "2026-08-01",
  bandId: AGE_BAND_PRESETS[0].id,
  minAge: String(AGE_BAND_PRESETS[0].minAge),
  maxAge: String(AGE_BAND_PRESETS[0].maxAge),
  relaxId: AGE_RELAXATIONS[0].id,
  isWoman: false,
  isPwbd: false,
  isEsm: false,
};

const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;

export default function ToolHome() {
  const [dob, setDob] = useState(DEFAULTS.dob);
  const [cutoff, setCutoff] = useState(DEFAULTS.cutoff);
  const [bandId, setBandId] = useState(DEFAULTS.bandId);
  const [minAge, setMinAge] = useState(DEFAULTS.minAge);
  const [maxAge, setMaxAge] = useState(DEFAULTS.maxAge);
  const [relaxId, setRelaxId] = useState(DEFAULTS.relaxId);
  const [isWoman, setIsWoman] = useState(DEFAULTS.isWoman);
  const [isPwbd, setIsPwbd] = useState(DEFAULTS.isPwbd);
  const [isEsm, setIsEsm] = useState(DEFAULTS.isEsm);
  const [checked, setChecked] = useState({});
  const [copied, setCopied] = useState(false);

  const relaxation =
    AGE_RELAXATIONS.find((entry) => entry.id === relaxId) ?? AGE_RELAXATIONS[0];

  const age = useMemo(
    () =>
      checkAgeEligibility({
        dobISO: dob,
        cutoffISO: cutoff,
        minAge: Number(minAge),
        maxAge: Number(maxAge),
        relaxationYears: relaxation.years,
      }),
    [dob, cutoff, minAge, maxAge, relaxation.years],
  );

  const fee = useMemo(
    () => applicationFee({ isWoman, categoryId: relaxId, isPwbd, isEsm }),
    [isWoman, relaxId, isPwbd, isEsm],
  );

  const readiness = useMemo(() => checklistReadiness(checked), [checked]);
  const hasAgeError = Boolean(age.error);

  const pickBand = (id) => {
    setBandId(id);
    const band = AGE_BAND_PRESETS.find((entry) => entry.id === id);
    if (band) {
      setMinAge(String(band.minAge));
      setMaxAge(String(band.maxAge));
    }
  };

  const toggleItem = (key) => setChecked((current) => ({ ...current, [key]: !current[key] }));

  const tickAll = (value) => {
    setChecked(() => {
      if (!value) return {};
      const next = {};
      CHECKLIST_GROUPS.forEach((group) => {
        group.items.forEach((item) => {
          next[itemKey(group.id, item.id)] = true;
        });
      });
      return next;
    });
  };

  const summary = useMemo(() => {
    const lines = ["SSC application readiness"];
    lines.push(
      `Checklist: ${readiness.doneItems}/${readiness.totalItems} ticked, ${readiness.requiredDone}/${readiness.requiredItems} must-have items done`,
    );
    if (!readiness.ready) lines.push(`Still missing: ${readiness.blocking.join("; ")}`);
    if (!hasAgeError) {
      lines.push(
        `Age on ${cutoff}: ${NUM.format(age.ageOnCutoff)} years — ${age.eligible ? "within" : "outside"} the ${age.minAge}-${age.maxAge} band${age.relaxationYears > 0 ? ` with ${age.relaxationYears} year(s) relaxation` : ""}`,
      );
      lines.push(`Eligible DOB window: ${age.earliestDobISO} to ${age.latestDobISO}`);
    }
    lines.push(`Application fee: ${INR.format(fee.fee)}${fee.exempt ? " (exempt)" : ""}`);
    return lines.join("\n");
  }, [readiness, hasAgeError, age, cutoff, fee]);

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setDob(DEFAULTS.dob);
    setCutoff(DEFAULTS.cutoff);
    setBandId(DEFAULTS.bandId);
    setMinAge(DEFAULTS.minAge);
    setMaxAge(DEFAULTS.maxAge);
    setRelaxId(DEFAULTS.relaxId);
    setIsWoman(DEFAULTS.isWoman);
    setIsPwbd(DEFAULTS.isPwbd);
    setIsEsm(DEFAULTS.isEsm);
    setChecked({});
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ClipboardList className="h-4 w-4" aria-hidden="true" />
          Before the form opens
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          SSC Application Document Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Every detail the One-Time Registration and the exam form will ask for, the fee and
          exemption rules, and an age check against the cutoff date in the notice.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Documents and details</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {readiness.doneItems} of {readiness.totalItems} ticked ·{" "}
              {readiness.requiredDone}/{readiness.requiredItems} must-have
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => tickAll(true)} className={GHOST_BTN}>
              Tick everything
            </button>
            <button type="button" onClick={() => tickAll(false)} className={GHOST_BTN}>
              Clear
            </button>
          </div>
        </div>

        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
          <span
            className="block h-full bg-[var(--primary)]"
            style={{ width: `${Math.max(0, Math.min(100, readiness.percent))}%` }}
          />
        </div>
        <p className="mt-2 text-sm font-semibold">
          {readiness.ready ? (
            <span className="text-[var(--success)]">
              All must-have items ticked — {pct(readiness.percent)} of the list done.
            </span>
          ) : (
            <span className="text-[var(--muted-foreground)]">
              {pct(readiness.percent)} done. {readiness.blocking.length} must-have item
              {readiness.blocking.length === 1 ? "" : "s"} still open.
            </span>
          )}
        </p>

        {CHECKLIST_GROUPS.map((group) => (
          <div key={group.id} className="mt-5">
            <h3 className="text-sm font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              {group.title}
            </h3>
            <ul className="mt-2 space-y-2">
              {group.items.map((item) => {
                const key = itemKey(group.id, item.id);
                return (
                  <li key={key} className="rounded-md border border-[var(--border)] p-3">
                    <label className="flex min-h-11 cursor-pointer items-start gap-3" htmlFor={key}>
                      <input
                        id={key}
                        type="checkbox"
                        className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)]"
                        checked={Boolean(checked[key])}
                        onChange={() => toggleItem(key)}
                      />
                      <span>
                        <span className="text-sm font-medium">{item.label}</span>
                        {item.required ? (
                          <span className="ml-2 rounded-full bg-[var(--danger-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--danger)]">
                            must-have
                          </span>
                        ) : null}
                        {item.note ? (
                          <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                            {item.note}
                          </span>
                        ) : null}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Age check against the notice</h2>
        <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
          SSC tests age on the cutoff date printed in each notice, phrased as &quot;born not
          before / not later than&quot;. Pick the band for your post and your relaxation category.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ssc-dob">
              Date of birth (as in the matric certificate)
            </label>
            <input
              id="ssc-dob"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={dob}
              onChange={(event) => setDob(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ssc-cutoff">
              Age-reckoning cutoff date from the notice
            </label>
            <input
              id="ssc-cutoff"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={cutoff}
              onChange={(event) => setCutoff(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ssc-band">
              Age band for the post
            </label>
            <select
              id="ssc-band"
              className={`mt-2 ${INPUT_CLASS}`}
              value={bandId}
              onChange={(event) => pickBand(event.target.value)}
            >
              {AGE_BAND_PRESETS.map((band) => (
                <option key={band.id} value={band.id}>
                  {band.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ssc-relax">
              Relaxation category
            </label>
            <select
              id="ssc-relax"
              className={`mt-2 ${INPUT_CLASS}`}
              value={relaxId}
              onChange={(event) => setRelaxId(event.target.value)}
            >
              {AGE_RELAXATIONS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                  {entry.years > 0 ? ` (+${entry.years} years)` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ssc-min">
              Lower age limit
            </label>
            <input
              id="ssc-min"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="14"
              max="60"
              step="1"
              value={minAge}
              onChange={(event) => setMinAge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ssc-max">
              Upper age limit (before relaxation)
            </label>
            <input
              id="ssc-max"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="14"
              max="60"
              step="1"
              value={maxAge}
              onChange={(event) => setMaxAge(event.target.value)}
            />
          </div>
        </div>

        {hasAgeError ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {age.error}
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Age on the cutoff date
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasAgeError ? DASH : `${NUM.format(age.ageOnCutoff)} years`}
            </p>
            <p className="mt-1 max-w-md text-sm font-semibold">
              {hasAgeError ? (
                <span className="text-[var(--muted-foreground)]">
                  Fix the age inputs to see the verdict.
                </span>
              ) : age.eligible ? (
                <span className="text-[var(--success)]">
                  Within the {age.minAge}-{age.maxAge} band
                  {age.relaxationYears > 0
                    ? ` (upper limit ${age.maxWithRelax} with relaxation)`
                    : ""}
                  .
                </span>
              ) : (
                <span className="text-[var(--danger)]">
                  {age.tooYoung
                    ? `Below the lower limit by ${NUM.format(age.marginYears)} year(s) on the cutoff date.`
                    : `Above the upper limit by ${NUM.format(age.marginYears)} year(s), even after relaxation.`}
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the SSC application readiness summary"
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
              aria-label="Reset all inputs to defaults"
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
              "Eligible date-of-birth window",
              hasAgeError ? DASH : `${age.earliestDobISO} to ${age.latestDobISO}`,
            ],
            [
              "Upper limit after relaxation",
              hasAgeError ? DASH : `${NUM.format(age.maxWithRelax)} years`,
            ],
            ["Application fee for you", INR.format(fee.fee)],
            [
              "Correction charges, if needed later",
              `${INR.format(CORRECTION_FEE_FIRST)} first time, ${INR.format(CORRECTION_FEE_SECOND)} second (only two allowed)`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {[
            ["ssc-woman", "Woman candidate", isWoman, setIsWoman],
            ["ssc-pwbd", "PwBD candidate", isPwbd, setIsPwbd],
            ["ssc-esm", "Eligible ex-serviceman", isEsm, setIsEsm],
          ].map(([id, label, value, setter]) => (
            <label
              key={id}
              className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[var(--foreground)]"
              htmlFor={id}
            >
              <input
                id={id}
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                checked={value}
                onChange={(event) => setter(event.target.checked)}
              />
              {label}
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
          {fee.reason} The standard fee is {INR.format(APPLICATION_FEE)}.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational aid only. Age bands, cutoff dates, fee and upload rules are fixed by each
        SSC examination notice — read the current notice on ssc.gov.in before applying, and treat
        it as the only authority.
      </p>
    </main>
  );
}
