"use client";

import { useMemo, useState } from "react";
import { Check, Copy, DoorOpen, RotateCcw } from "lucide-react";
import {
  CHALLENGE_SCRIPTS,
  CONTROLS,
  DEFAULT_TRIPS_PER_STAFF,
  ENTRY_TYPES,
  SENSITIVITY,
  TIERS,
  assessTailgating,
  formatTailgatingResult,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  staff: "50",
  visitors: "10",
  deliveries: "5",
  trips: String(DEFAULT_TRIPS_PER_STAFF),
  entryType: "badgeDoor",
  sensitivity: "customerData",
  inPlace: ["visibleBadge", "visitorLog"],
};

const DASH = "—";

export default function ToolHome() {
  const [staff, setStaff] = useState(DEFAULTS.staff);
  const [visitors, setVisitors] = useState(DEFAULTS.visitors);
  const [deliveries, setDeliveries] = useState(DEFAULTS.deliveries);
  const [trips, setTrips] = useState(DEFAULTS.trips);
  const [entryType, setEntryType] = useState(DEFAULTS.entryType);
  const [sensitivity, setSensitivity] = useState(DEFAULTS.sensitivity);
  const [inPlace, setInPlace] = useState(DEFAULTS.inPlace);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      assessTailgating({
        staff: staff === "" ? Number.NaN : staff,
        visitors: visitors === "" ? 0 : visitors,
        deliveries: deliveries === "" ? 0 : deliveries,
        tripsPerStaff: trips === "" ? Number.NaN : trips,
        entryType,
        sensitivity,
        inPlace,
      }),
    [staff, visitors, deliveries, trips, entryType, sensitivity, inPlace],
  );
  const summary = useMemo(() => formatTailgatingResult(result), [result]);
  const failed = Boolean(result.error);

  const toggle = (id) => {
    setInPlace((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
    setCopied(false);
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
    setStaff(DEFAULTS.staff);
    setVisitors(DEFAULTS.visitors);
    setDeliveries(DEFAULTS.deliveries);
    setTrips(DEFAULTS.trips);
    setEntryType(DEFAULTS.entryType);
    setSensitivity(DEFAULTS.sensitivity);
    setInPlace(DEFAULTS.inPlace);
    setCopied(false);
  };

  const numberFields = [
    ["tg-staff", "People using this entrance", staff, setStaff, 1, 100000],
    ["tg-trips", "Trips through it per person per day", trips, setTrips, 1, 20],
    ["tg-visitors", "Visitors per day", visitors, setVisitors, 0, 10000],
    ["tg-deliveries", "Deliveries and contractor visits per day", deliveries, setDeliveries, 0, 2000],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <DoorOpen className="h-4 w-4" aria-hidden="true" />
          Physical access
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Tailgating and Badge Policy Explainer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tailgating is someone walking in behind a person who is allowed to. This counts how many
          door openings a day nobody supervises, given your headcount and entrance type, then names
          the control tier that fits and the polite scripts that make challenging normal.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {numberFields.map(([id, label, value, setValue, min, max]) => (
            <div key={id}>
              <label className={LABEL_CLASS} htmlFor={id}>
                {label}
              </label>
              <input
                id={id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min={min}
                max={max}
                step="1"
                value={value}
                onChange={(event) => {
                  setValue(event.target.value);
                  setCopied(false);
                }}
              />
            </div>
          ))}
          <div>
            <label className={LABEL_CLASS} htmlFor="tg-entry">
              What is the entrance?
            </label>
            <select
              id="tg-entry"
              className={`mt-2 ${INPUT_CLASS}`}
              value={entryType}
              onChange={(event) => {
                setEntryType(event.target.value);
                setCopied(false);
              }}
            >
              {ENTRY_TYPES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tg-sensitivity">
              What is behind the door?
            </label>
            <select
              id="tg-sensitivity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sensitivity}
              onChange={(event) => {
                setSensitivity(event.target.value);
                setCopied(false);
              }}
            >
              {SENSITIVITY.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {!failed && (
          <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">{result.entry.note}</p>
        )}
      </section>

      <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Controls already in place</h2>
        {[1, 2, 3].map((tier) => (
          <fieldset key={tier} className="mt-4">
            <legend className="text-sm font-semibold text-[var(--muted-foreground)]">
              {TIERS[tier].label}
            </legend>
            <div className="mt-2 grid gap-2">
              {CONTROLS.filter((control) => control.tier === tier).map((control) => {
                const checked = inPlace.includes(control.id);
                return (
                  <label
                    key={control.id}
                    htmlFor={`tg-${control.id}`}
                    className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 text-sm leading-6 transition ${
                      checked
                        ? "border-[var(--primary)] bg-[var(--primary)]/5"
                        : "border-[var(--border)] bg-[var(--background)]"
                    }`}
                  >
                    <input
                      id={`tg-${control.id}`}
                      type="checkbox"
                      className="mt-1.5 h-4 w-4 shrink-0 accent-[var(--primary)]"
                      checked={checked}
                      onChange={() => toggle(control.id)}
                    />
                    <span>
                      <span className="font-medium">{control.label}</span>
                      <span className="block text-[var(--muted-foreground)]">{control.why}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
      </section>

      {failed && (
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
              Unsupervised door openings per day
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : NUM.format(result.unsupervisedPerDay)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? DASH
                : `about ${NUM.format(result.unsupervisedPerYear)} across a 250-day working year`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the tailgating exposure estimate"
              className={GHOST_BTN}
              disabled={failed}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Total door openings per day", failed ? DASH : NUM.format(result.totalOpenings)],
            ["Openings from staff alone", failed ? DASH : NUM.format(result.staffOpenings)],
            ["Openings that are supervised", failed ? DASH : `${result.supervisedPercent}%`],
            ["Residual share after your controls", failed ? DASH : `x${result.residualShare}`],
            ["Control tier required", failed ? DASH : result.requiredTierInfo.label],
            ["Control tier fully achieved", failed ? DASH : result.achievedTierInfo ? result.achievedTierInfo.label : "None complete"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="max-w-[55%] text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm leading-6 ${
              result.meetsTier
                ? "bg-[var(--success-soft)] text-[var(--success)]"
                : "bg-[var(--warning-soft)] text-[var(--warning)]"
            }`}
          >
            {result.meetsTier
              ? `The controls in place complete ${result.requiredTierInfo.label.toLowerCase()}. Re-check after any office move or headcount change.`
              : `${result.requiredTierInfo.label} is what this site calls for: ${result.requiredTierInfo.summary}`}
          </p>
        )}
      </section>

      {!failed && result.gapControls.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Missing for the required tier</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Control</th>
                  <th scope="col" className="py-2 text-right font-semibold">Tier</th>
                </tr>
              </thead>
              <tbody>
                {result.gapControls.map((control) => (
                  <tr key={control.id} className="border-b border-[var(--border)] align-top last:border-0">
                    <td className="py-2 pr-3 leading-6">
                      <span className="font-semibold">{control.label}</span>
                      <span className="block text-[var(--muted-foreground)]">{control.why}</span>
                    </td>
                    <td className="py-2 text-right font-semibold">{control.tier}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Polite ways to stop a tailgater</h2>
        <dl className="mt-3 grid gap-3 text-sm leading-6">
          {CHALLENGE_SCRIPTS.map(([situation, script]) => (
            <div key={situation}>
              <dt className="font-semibold">{situation}</dt>
              <dd className="text-[var(--muted-foreground)]">{script}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
          None of these work unless management says in writing that challenging is expected, and then
          visibly follows the rule themselves.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, and an estimate of opportunity rather than a count of incidents. It assumes
        each person passes the entrance the number of times you entered and a 250-day working year;
        never ask staff to physically block or detain anyone, and follow your fire-safety rules, which
        take precedence over any access control.
      </p>
    </main>
  );
}
