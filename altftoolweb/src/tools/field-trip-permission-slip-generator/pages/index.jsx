"use client";

import { useMemo, useState } from "react";
import { Bus, Check, Copy, RotateCcw } from "lucide-react";

import { SUPERVISION_BANDS, TRANSPORT_MODES, buildPermissionSlip } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] transition hover:border-[var(--primary)]";
const CHECKBOX =
  "mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  schoolName: "St Anne's High School",
  tripName: "Geography field study",
  destination: "Nandi Hills, Chikkaballapur",
  teacherName: "Ms R. Iyer",
  teacherContact: "+91 98450 11223",
  className: "Class 6B",
  activities: "Rock formation survey, guided nature walk, packed lunch at the viewpoint.",
  kitList: "Walking shoes, cap, water bottle, notebook, packed breakfast.",
  currencySymbol: "INR",
  tripDate: "2026-09-18",
  departTime: "08:30",
  returnTime: "16:45",
  bandId: "ks2",
  transportId: "coach",
  higherRisk: false,
  swimmingInvolved: false,
  photosOnTrip: true,
  students: "32",
  adultsAvailable: "4",
  nights: "0",
  transportTotalCost: "12000",
  entryCostPerStudent: "150",
  mealCostPerStudent: "100",
  contingencyPercent: "10",
  consentLeadDays: "10",
};

const NUMERIC_FIELDS = [
  "students",
  "adultsAvailable",
  "nights",
  "transportTotalCost",
  "entryCostPerStudent",
  "mealCostPerStudent",
  "contingencyPercent",
  "consentLeadDays",
];

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const result = useMemo(() => {
    const numbers = {};
    for (const key of NUMERIC_FIELDS) {
      numbers[key] = form[key] === "" ? NaN : Number(form[key]);
    }
    return buildPermissionSlip({ ...form, ...numbers });
  }, [form]);

  const hasError = Boolean(result.error);

  const money = (value) =>
    form.currencySymbol.trim().toUpperCase() === "INR"
      ? INR.format(value)
      : `${form.currencySymbol} ${NUM.format(value)}`;

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.slipText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Supervision ratio", DASH],
        ["Adults required", DASH],
        ["Adults confirmed", DASH],
        ["Trip duration", DASH],
        ["Travel cost per student", DASH],
        ["Entry + meals per student", DASH],
        ["Contingency added", DASH],
        ["Total collected", DASH],
        ["Total trip cost", DASH],
        ["Buffer left over", DASH],
        ["Slips due back by", DASH],
      ]
    : [
        ["Supervision ratio", `1 adult : ${result.pupilsPerAdult} pupils (${result.bandLabel})`],
        ["Adults required", `${result.adultsRequired}`],
        [
          "Adults confirmed",
          `${result.adultsAvailable} (working out at 1 : ${NUM1.format(result.actualPupilsPerAdult)})`,
        ],
        ["Trip duration", result.hoursLabel],
        ["Travel cost per student", money(result.transportPerStudent)],
        ["Entry + meals per student", money(result.baseCostPerStudent - result.transportPerStudent)],
        ["Contingency added", money(result.contingencyPerStudent)],
        ["Total collected", money(result.totalCollected)],
        ["Total trip cost", money(result.totalTripCost)],
        ["Buffer left over", money(result.surplus)],
        ["Slips due back by", `${result.replyByLabel} (${result.consentLeadDays} days before)`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Bus className="h-4 w-4" aria-hidden="true" />
          Consent forms
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Field Trip Permission Slip Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn the trip plan into a signable slip: supervision ratio and adults needed, the exact
          amount to collect per student, the reply-by date, and the medical and emergency-contact
          sections staff need on the day.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Trip</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ftp-school">
              School name
            </label>
            <input
              id="ftp-school"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.schoolName}
              onChange={(event) => set("schoolName", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ftp-trip">
              Trip name
            </label>
            <input
              id="ftp-trip"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.tripName}
              onChange={(event) => set("tripName", event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ftp-destination">
              Destination
            </label>
            <input
              id="ftp-destination"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.destination}
              onChange={(event) => set("destination", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ftp-teacher">
              Trip leader
            </label>
            <input
              id="ftp-teacher"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.teacherName}
              onChange={(event) => set("teacherName", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ftp-contact">
              Contact number on the day
            </label>
            <input
              id="ftp-contact"
              className={`mt-2 ${INPUT_CLASS}`}
              type="tel"
              value={form.teacherContact}
              onChange={(event) => set("teacherContact", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ftp-class">
              Class or group
            </label>
            <input
              id="ftp-class"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.className}
              onChange={(event) => set("className", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ftp-transport">
              Travelling by
            </label>
            <select
              id="ftp-transport"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.transportId}
              onChange={(event) => set("transportId", event.target.value)}
            >
              {TRANSPORT_MODES.map((mode) => (
                <option key={mode.id} value={mode.id}>
                  {mode.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ftp-date">
              Trip date
            </label>
            <input
              id="ftp-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.tripDate}
              onChange={(event) => set("tripDate", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ftp-nights">
              Nights away
            </label>
            <input
              id="ftp-nights"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="30"
              step="1"
              value={form.nights}
              onChange={(event) => set("nights", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ftp-depart">
              Departs school
            </label>
            <input
              id="ftp-depart"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={form.departTime}
              onChange={(event) => set("departTime", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ftp-return">
              Returns to school
            </label>
            <input
              id="ftp-return"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={form.returnTime}
              onChange={(event) => set("returnTime", event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ftp-activities">
              Planned activities
            </label>
            <textarea
              id="ftp-activities"
              className={`mt-2 ${AREA_CLASS}`}
              rows={3}
              value={form.activities}
              onChange={(event) => set("activities", event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ftp-kit">
              What to bring
            </label>
            <textarea
              id="ftp-kit"
              className={`mt-2 ${AREA_CLASS}`}
              rows={2}
              value={form.kitList}
              onChange={(event) => set("kitList", event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Group and supervision</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ftp-band">
              Age band
            </label>
            <select
              id="ftp-band"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.bandId}
              onChange={(event) => set("bandId", event.target.value)}
            >
              {SUPERVISION_BANDS.map((band) => (
                <option key={band.id} value={band.id}>
                  {band.label} {DASH} 1 : {band.pupilsPerAdult}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ftp-students">
              Students going
            </label>
            <input
              id="ftp-students"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="2000"
              step="1"
              value={form.students}
              onChange={(event) => set("students", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ftp-adults">
              Adults confirmed
            </label>
            <input
              id="ftp-adults"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={form.adultsAvailable}
              onChange={(event) => set("adultsAvailable", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ftp-lead">
              Slips due back (days before)
            </label>
            <input
              id="ftp-lead"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="3"
              max="120"
              step="1"
              value={form.consentLeadDays}
              onChange={(event) => set("consentLeadDays", event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          <label className={CHECK_ROW} htmlFor="ftp-risk">
            <input
              id="ftp-risk"
              className={CHECKBOX}
              type="checkbox"
              checked={form.higherRisk}
              onChange={(event) => set("higherRisk", event.target.checked)}
            />
            <span>Higher-risk activity (water, heights, adventure or remote location)</span>
          </label>
          <label className={CHECK_ROW} htmlFor="ftp-swim">
            <input
              id="ftp-swim"
              className={CHECKBOX}
              type="checkbox"
              checked={form.swimmingInvolved}
              onChange={(event) => set("swimmingInvolved", event.target.checked)}
            />
            <span>Swimming or water activity {DASH} add the swimming declaration</span>
          </label>
          <label className={CHECK_ROW} htmlFor="ftp-photos">
            <input
              id="ftp-photos"
              className={CHECKBOX}
              type="checkbox"
              checked={form.photosOnTrip}
              onChange={(event) => set("photosOnTrip", event.target.checked)}
            />
            <span>Staff will take photographs {DASH} add the photo permission line</span>
          </label>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Costs</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ftp-currency">
              Currency label
            </label>
            <input
              id="ftp-currency"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.currencySymbol}
              onChange={(event) => set("currencySymbol", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ftp-transport-cost">
              Total transport cost (shared)
            </label>
            <input
              id="ftp-transport-cost"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={form.transportTotalCost}
              onChange={(event) => set("transportTotalCost", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ftp-entry">
              Entry fee per student
            </label>
            <input
              id="ftp-entry"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={form.entryCostPerStudent}
              onChange={(event) => set("entryCostPerStudent", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ftp-meal">
              Meals per student
            </label>
            <input
              id="ftp-meal"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={form.mealCostPerStudent}
              onChange={(event) => set("mealCostPerStudent", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ftp-contingency">
              Contingency (%)
            </label>
            <input
              id="ftp-contingency"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="50"
              step="1"
              value={form.contingencyPercent}
              onChange={(event) => set("contingencyPercent", event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Collect per student
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.collectPerStudent)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the problem below to build the slip"
                : `Rounded up from ${money(result.rawCostPerStudent)} across ${NUM.format(result.students)} students`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the permission slip"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy slip"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {hasError && (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.warnings.length > 0 && (
          <ul className="mt-4 grid gap-2 text-sm text-[var(--muted-foreground)]">
            {result.warnings.map((warning) => (
              <li
                key={warning}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
              >
                {warning}
              </li>
            ))}
          </ul>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Permission slip</h2>
          <div className="mt-3 overflow-x-auto">
            <pre className="min-w-full whitespace-pre-wrap break-words font-sans text-sm leading-6">
              {result.slipText}
            </pre>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational template only, not legal or medical advice. The supervision figures are the
        planning ratios used in published school-visit guidance, not a statutory minimum {DASH} your
        own risk assessment and your school&apos;s educational visits policy come first, and
        early-years settings have their own statutory ratios.
      </p>
    </main>
  );
}
