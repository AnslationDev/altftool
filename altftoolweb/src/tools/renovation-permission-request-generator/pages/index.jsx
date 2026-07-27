"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Hammer, RotateCcw } from "lucide-react";

import {
  DEFAULT_WORK_END,
  DEFAULT_WORK_START,
  WORK_ITEMS,
  buildRenovationRequest,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "min-h-[88px] w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  societyName: "Shanti Nivas Co-operative Housing Society Ltd.",
  societyAddress: "Plot 14, Sector 8, Vashi, Navi Mumbai 400703",
  memberName: "Anita R. Deshmukh",
  flatNumber: "B-704",
  wing: "B Wing",
  letterDate: "2026-08-03",
  startDate: "2026-09-01",
  endDate: "2026-09-30",
  workStart: DEFAULT_WORK_START,
  workEnd: DEFAULT_WORK_END,
  contractorName: "Kiran Interiors",
  contractorPhone: "99300 55221",
  workerCount: "6",
  debrisTrips: "12",
  tonnesPerTrip: "1.5",
  securityDeposit: "25000",
  contactPhone: "98200 11223",
  extraNote: "",
};

const DEFAULT_WORK = ["painting", "flooring", "bathroom"];

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [selectedWork, setSelectedWork] = useState(DEFAULT_WORK);
  const [workOnSundays, setWorkOnSundays] = useState(false);
  const [silenceZone, setSilenceZone] = useState(false);
  const [liftUse, setLiftUse] = useState(true);
  const [copied, setCopied] = useState(false);

  const set = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const toggleWork = (id) => {
    setSelectedWork((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const result = useMemo(
    () =>
      buildRenovationRequest({
        ...form,
        workerCount: form.workerCount === "" ? 0 : Number(form.workerCount),
        debrisTrips: form.debrisTrips === "" ? 0 : Number(form.debrisTrips),
        tonnesPerTrip: form.tonnesPerTrip === "" ? 0 : Number(form.tonnesPerTrip),
        securityDeposit: form.securityDeposit === "" ? 0 : Number(form.securityDeposit),
        selectedWork,
        workOnSundays,
        silenceZone,
        liftUse,
      }),
    [form, selectedWork, workOnSundays, silenceZone, liftUse],
  );

  const failed = Boolean(result.error);

  const copyLetter = async () => {
    if (failed) return;
    try {
      await navigator.clipboard.writeText(result.letter);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setSelectedWork(DEFAULT_WORK);
    setWorkOnSundays(false);
    setSilenceZone(false);
    setLiftUse(true);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Hammer className="h-4 w-4" aria-hidden="true" />
          Property notices
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Renovation Permission Request Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Writes the letter a flat owner sends the managing committee before starting interior work,
          and works out what the scope triggers — a structural engineer's certificate, a municipal
          permission, or a construction waste plan under the C&amp;D Waste Rules 2016.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Scope of work</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {WORK_ITEMS.map((item) => (
            <label
              key={item.id}
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              htmlFor={`rw-${item.id}`}
            >
              <input
                id={`rw-${item.id}`}
                type="checkbox"
                className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                checked={selectedWork.includes(item.id)}
                onChange={() => toggleWork(item.id)}
              />
              <span>
                {item.label}
                {item.structural ? (
                  <span className="ml-1 text-xs font-semibold text-[var(--danger)]">structural</span>
                ) : null}
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Flat, dates and hours</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rn-society">
              Society name
            </label>
            <input
              id="rn-society"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.societyName}
              onChange={set("societyName")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rn-address">
              Society address
            </label>
            <input
              id="rn-address"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.societyAddress}
              onChange={set("societyAddress")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rn-member">
              Member name
            </label>
            <input
              id="rn-member"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.memberName}
              onChange={set("memberName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rn-flat">
              Flat number
            </label>
            <input
              id="rn-flat"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.flatNumber}
              onChange={set("flatNumber")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rn-wing">
              Wing / building
            </label>
            <input
              id="rn-wing"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.wing}
              onChange={set("wing")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rn-letter-date">
              Date of the letter
            </label>
            <input
              id="rn-letter-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.letterDate}
              onChange={set("letterDate")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rn-start">
              Work starts on
            </label>
            <input
              id="rn-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.startDate}
              onChange={set("startDate")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rn-end">
              Work finishes on
            </label>
            <input
              id="rn-end"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.endDate}
              onChange={set("endDate")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rn-wstart">
              Daily start time
            </label>
            <input
              id="rn-wstart"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={form.workStart}
              onChange={set("workStart")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rn-wend">
              Daily finish time
            </label>
            <input
              id="rn-wend"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={form.workEnd}
              onChange={set("workEnd")}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          <label className="flex min-h-11 items-center gap-3 text-sm font-semibold" htmlFor="rn-sunday">
            <input
              id="rn-sunday"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={workOnSundays}
              onChange={(event) => setWorkOnSundays(event.target.checked)}
            />
            Ask for permission to work on Sundays and holidays
          </label>
          <label className="flex min-h-11 items-center gap-3 text-sm font-semibold" htmlFor="rn-silence">
            <input
              id="rn-silence"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={silenceZone}
              onChange={(event) => setSilenceZone(event.target.checked)}
            />
            The building is within a silence zone (near a hospital, school or court)
          </label>
          <label className="flex min-h-11 items-center gap-3 text-sm font-semibold" htmlFor="rn-lift">
            <input
              id="rn-lift"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={liftUse}
              onChange={(event) => setLiftUse(event.target.checked)}
            />
            Material will move through the service lift
          </label>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Contractor and debris</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rn-contractor">
              Contractor name
            </label>
            <input
              id="rn-contractor"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.contractorName}
              onChange={set("contractorName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rn-contractor-phone">
              Contractor phone
            </label>
            <input
              id="rn-contractor-phone"
              className={`mt-2 ${INPUT_CLASS}`}
              type="tel"
              value={form.contractorPhone}
              onChange={set("contractorPhone")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rn-workers">
              Workers on site
            </label>
            <input
              id="rn-workers"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="200"
              step="1"
              value={form.workerCount}
              onChange={set("workerCount")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rn-deposit">
              Security deposit offered (INR)
            </label>
            <input
              id="rn-deposit"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={form.securityDeposit}
              onChange={set("securityDeposit")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rn-trips">
              Debris trips planned
            </label>
            <input
              id="rn-trips"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={form.debrisTrips}
              onChange={set("debrisTrips")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rn-tonnes">
              Tonnes carried per trip
            </label>
            <input
              id="rn-tonnes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              max="40"
              step="0.5"
              value={form.tonnesPerTrip}
              onChange={set("tonnesPerTrip")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rn-phone">
              Your phone
            </label>
            <input
              id="rn-phone"
              className={`mt-2 ${INPUT_CLASS}`}
              type="tel"
              value={form.contactPhone}
              onChange={set("contactPhone")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rn-note">
              Anything else to add
            </label>
            <textarea
              id="rn-note"
              className={`mt-2 ${AREA_CLASS}`}
              value={form.extraNote}
              onChange={set("extraNote")}
              placeholder="Optional: neighbours already informed, a shorter noisy-work window, an inspection offer"
            />
          </div>
        </div>
      </section>

      {failed ? (
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
              Debris to be removed
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? "—" : `${NUM.format(result.debris.totalTonnes)} t`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the highlighted problem to build the request."
                : `${NUM.format(result.debris.perDayTonnes)} tonnes a day over ${result.durationDays} day(s)`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyLetter}
              disabled={failed}
              aria-label="Copy the renovation permission letter"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy letter"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the form" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Work period", failed ? "—" : `${result.durationDays} day(s)`],
            ["Hours on site each day", failed ? "—" : `${NUM.format(result.dailyHours)} h`],
            [
              "Structural engineer's certificate",
              failed ? "—" : result.scope.structural ? "Required" : "Not required",
            ],
            [
              "Local authority permission",
              failed ? "—" : result.scope.structural ? "Required" : "Not required",
            ],
            [
              "C&D waste management plan",
              failed ? "—" : result.debris.planRequired ? "Required" : "Not required",
            ],
            ["Daytime noise limit", failed ? "—" : `${result.noiseLimitDay} dB(A) Leq`],
            ["Night noise limit (10 p.m. to 6 a.m.)", failed ? "—" : `${result.noiseLimitNight} dB(A) Leq`],
            [
              "Security deposit offered",
              failed ? "—" : INR.format(Number(form.securityDeposit) || 0),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && result.warnings.length > 0 ? (
          <ul className="mt-4 grid gap-2">
            {result.warnings.map((warning) => (
              <li
                key={warning}
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
              >
                {warning}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {!failed ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Your letter</h2>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-6">
            {result.letter}
          </pre>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational template only, not legal or engineering advice. Bye-law numbers, deposit
        amounts and permitted hours differ between societies and municipal areas, and any work near
        a load-bearing member must be cleared by a licensed structural engineer before it starts.
      </p>
    </main>
  );
}
