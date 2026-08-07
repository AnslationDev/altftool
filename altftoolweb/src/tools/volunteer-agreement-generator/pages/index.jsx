"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Handshake, RotateCcw } from "lucide-react";
import { CLAUSES, buildVolunteerAgreement, formatLongDate } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const OPTIONAL_CLAUSES = CLAUSES.filter((clause) => !clause.required);
const REQUIRED_CLAUSES = CLAUSES.filter((clause) => clause.required);

const DEFAULTS = {
  organisationName: "Asha Foundation",
  organisationAddress: "12 Gandhi Marg, New Delhi 110001",
  coordinatorName: "Priya Menon",
  coordinatorContact: "priya@example.org",
  volunteerName: "Arjun Rao",
  volunteerAddress: "8 Rose Lane, New Delhi 110024",
  volunteerPhone: "98xxxxxx31",
  volunteerEmail: "arjun.rao@example.com",
  volunteerIsMinor: false,
  guardianName: "",
  roleTitle: "Weekend reading mentor",
  roleSummary: "Run a two-hour reading circle for children aged 8 to 12 at the community centre",
  location: "Sarai Kale Khan community centre",
  agreementDate: "2026-01-25",
  startDate: "2026-02-01",
  weeks: "26",
  hoursPerWeek: "6",
  daysPerWeek: "2",
  kmPerWeek: "40",
  ratePerKm: "8",
  mealRatePerDay: "150",
  monthlyStipend: "2000",
  noticeDays: "14",
  insuranceNote: "Group personal accident cover up to INR 2,00,000 while on site",
  governingCity: "New Delhi",
};

export default function ToolHome() {
  const [organisationName, setOrganisationName] = useState(DEFAULTS.organisationName);
  const [organisationAddress, setOrganisationAddress] = useState(DEFAULTS.organisationAddress);
  const [coordinatorName, setCoordinatorName] = useState(DEFAULTS.coordinatorName);
  const [coordinatorContact, setCoordinatorContact] = useState(DEFAULTS.coordinatorContact);
  const [volunteerName, setVolunteerName] = useState(DEFAULTS.volunteerName);
  const [volunteerAddress, setVolunteerAddress] = useState(DEFAULTS.volunteerAddress);
  const [volunteerPhone, setVolunteerPhone] = useState(DEFAULTS.volunteerPhone);
  const [volunteerEmail, setVolunteerEmail] = useState(DEFAULTS.volunteerEmail);
  const [volunteerIsMinor, setVolunteerIsMinor] = useState(DEFAULTS.volunteerIsMinor);
  const [guardianName, setGuardianName] = useState(DEFAULTS.guardianName);
  const [roleTitle, setRoleTitle] = useState(DEFAULTS.roleTitle);
  const [roleSummary, setRoleSummary] = useState(DEFAULTS.roleSummary);
  const [location, setLocation] = useState(DEFAULTS.location);
  const [agreementDate, setAgreementDate] = useState(DEFAULTS.agreementDate);
  const [startDate, setStartDate] = useState(DEFAULTS.startDate);
  const [weeks, setWeeks] = useState(DEFAULTS.weeks);
  const [hoursPerWeek, setHoursPerWeek] = useState(DEFAULTS.hoursPerWeek);
  const [daysPerWeek, setDaysPerWeek] = useState(DEFAULTS.daysPerWeek);
  const [kmPerWeek, setKmPerWeek] = useState(DEFAULTS.kmPerWeek);
  const [ratePerKm, setRatePerKm] = useState(DEFAULTS.ratePerKm);
  const [mealRatePerDay, setMealRatePerDay] = useState(DEFAULTS.mealRatePerDay);
  const [monthlyStipend, setMonthlyStipend] = useState(DEFAULTS.monthlyStipend);
  const [noticeDays, setNoticeDays] = useState(DEFAULTS.noticeDays);
  const [insuranceNote, setInsuranceNote] = useState(DEFAULTS.insuranceNote);
  const [governingCity, setGoverningCity] = useState(DEFAULTS.governingCity);
  const [selectedClauses, setSelectedClauses] = useState(
    OPTIONAL_CLAUSES.map((clause) => clause.key),
  );
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const result = useMemo(
    () =>
      buildVolunteerAgreement({
        organisationName,
        organisationAddress,
        coordinatorName,
        coordinatorContact,
        volunteerName,
        volunteerAddress,
        volunteerPhone,
        volunteerEmail,
        volunteerIsMinor,
        guardianName,
        roleTitle,
        roleSummary,
        location,
        agreementDate,
        startDate,
        weeks,
        hoursPerWeek,
        daysPerWeek,
        kmPerWeek,
        ratePerKm,
        mealRatePerDay,
        monthlyStipend,
        noticeDays,
        insuranceNote,
        selectedClauses,
        governingCity,
      }),
    [
      organisationName,
      organisationAddress,
      coordinatorName,
      coordinatorContact,
      volunteerName,
      volunteerAddress,
      volunteerPhone,
      volunteerEmail,
      volunteerIsMinor,
      guardianName,
      roleTitle,
      roleSummary,
      location,
      agreementDate,
      startDate,
      weeks,
      hoursPerWeek,
      daysPerWeek,
      kmPerWeek,
      ratePerKm,
      mealRatePerDay,
      monthlyStipend,
      noticeDays,
      insuranceNote,
      selectedClauses,
      governingCity,
    ],
  );

  const failed = Boolean(result.error);
  const commitment = failed ? null : result.commitment;

  const toggleClause = (key) =>
    setSelectedClauses((list) =>
      list.includes(key) ? list.filter((item) => item !== key) : [...list, key],
    );

  const copyAgreement = async () => {
    if (failed) return;
    try {
      await navigator.clipboard.writeText(result.agreement);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setOrganisationName(DEFAULTS.organisationName);
    setOrganisationAddress(DEFAULTS.organisationAddress);
    setCoordinatorName(DEFAULTS.coordinatorName);
    setCoordinatorContact(DEFAULTS.coordinatorContact);
    setVolunteerName(DEFAULTS.volunteerName);
    setVolunteerAddress(DEFAULTS.volunteerAddress);
    setVolunteerPhone(DEFAULTS.volunteerPhone);
    setVolunteerEmail(DEFAULTS.volunteerEmail);
    setVolunteerIsMinor(DEFAULTS.volunteerIsMinor);
    setGuardianName(DEFAULTS.guardianName);
    setRoleTitle(DEFAULTS.roleTitle);
    setRoleSummary(DEFAULTS.roleSummary);
    setLocation(DEFAULTS.location);
    setAgreementDate(DEFAULTS.agreementDate);
    setStartDate(DEFAULTS.startDate);
    setWeeks(DEFAULTS.weeks);
    setHoursPerWeek(DEFAULTS.hoursPerWeek);
    setDaysPerWeek(DEFAULTS.daysPerWeek);
    setKmPerWeek(DEFAULTS.kmPerWeek);
    setRatePerKm(DEFAULTS.ratePerKm);
    setMealRatePerDay(DEFAULTS.mealRatePerDay);
    setMonthlyStipend(DEFAULTS.monthlyStipend);
    setNoticeDays(DEFAULTS.noticeDays);
    setInsuranceNote(DEFAULTS.insuranceNote);
    setGoverningCity(DEFAULTS.governingCity);
    setSelectedClauses(OPTIONAL_CLAUSES.map((clause) => clause.key));
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Handshake className="h-4 w-4" aria-hidden="true" />
          Nonprofit compliance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Volunteer Agreement Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Set the role, hours and reimbursement, pick the clauses you need, and get an agreement
          that records the arrangement without turning it into employment. The reimbursement budget
          is totalled so you can see when a fixed payment starts to look like wages.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Role and commitment</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="va-role">
              Role title
            </label>
            <input
              id="va-role"
              className={`mt-2 ${INPUT_CLASS}`}
              value={roleTitle}
              onChange={(event) => setRoleTitle(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="va-location">
              Location
            </label>
            <input
              id="va-location"
              className={`mt-2 ${INPUT_CLASS}`}
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="va-summary">
              What the volunteer will do
            </label>
            <textarea
              id="va-summary"
              rows={2}
              className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              value={roleSummary}
              onChange={(event) => setRoleSummary(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="va-agreement-date">
              Agreement date
            </label>
            <input
              id="va-agreement-date"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={agreementDate}
              onChange={(event) => setAgreementDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="va-start">
              Start date
            </label>
            <input
              id="va-start"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="va-weeks">
              Placement length (weeks)
            </label>
            <input
              id="va-weeks"
              type="number"
              inputMode="numeric"
              min="1"
              max="520"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={weeks}
              onChange={(event) => setWeeks(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="va-hours">
              Hours per week
            </label>
            <input
              id="va-hours"
              type="number"
              inputMode="decimal"
              min="1"
              max="168"
              step="0.5"
              className={`mt-2 ${INPUT_CLASS}`}
              value={hoursPerWeek}
              onChange={(event) => setHoursPerWeek(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="va-days">
              Days per week
            </label>
            <input
              id="va-days"
              type="number"
              inputMode="numeric"
              min="1"
              max="7"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={daysPerWeek}
              onChange={(event) => setDaysPerWeek(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="va-notice">
              Notice to end the placement (days)
            </label>
            <input
              id="va-notice"
              type="number"
              inputMode="numeric"
              min="0"
              max="180"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={noticeDays}
              onChange={(event) => setNoticeDays(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Reimbursement</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="va-km">
              Travel per week (km)
            </label>
            <input
              id="va-km"
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={kmPerWeek}
              onChange={(event) => setKmPerWeek(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="va-rate">
              Rate per km (INR)
            </label>
            <input
              id="va-rate"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              className={`mt-2 ${INPUT_CLASS}`}
              value={ratePerKm}
              onChange={(event) => setRatePerKm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="va-meal">
              Meal or refreshment allowance per day (INR)
            </label>
            <input
              id="va-meal"
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mealRatePerDay}
              onChange={(event) => setMealRatePerDay(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="va-stipend">
              Fixed monthly payment, if any (INR)
            </label>
            <input
              id="va-stipend"
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              className={`mt-2 ${INPUT_CLASS}`}
              value={monthlyStipend}
              onChange={(event) => setMonthlyStipend(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="va-insurance">
              Insurance note
            </label>
            <input
              id="va-insurance"
              className={`mt-2 ${INPUT_CLASS}`}
              value={insuranceNote}
              onChange={(event) => setInsuranceNote(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Parties</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="va-org">
              Organisation name
            </label>
            <input
              id="va-org"
              className={`mt-2 ${INPUT_CLASS}`}
              value={organisationName}
              onChange={(event) => setOrganisationName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="va-orgaddr">
              Organisation address
            </label>
            <input
              id="va-orgaddr"
              className={`mt-2 ${INPUT_CLASS}`}
              value={organisationAddress}
              onChange={(event) => setOrganisationAddress(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="va-coord">
              Coordinator name
            </label>
            <input
              id="va-coord"
              className={`mt-2 ${INPUT_CLASS}`}
              value={coordinatorName}
              onChange={(event) => setCoordinatorName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="va-coordcontact">
              Coordinator contact
            </label>
            <input
              id="va-coordcontact"
              className={`mt-2 ${INPUT_CLASS}`}
              value={coordinatorContact}
              onChange={(event) => setCoordinatorContact(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="va-vol">
              Volunteer name
            </label>
            <input
              id="va-vol"
              className={`mt-2 ${INPUT_CLASS}`}
              value={volunteerName}
              onChange={(event) => setVolunteerName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="va-voladdr">
              Volunteer address
            </label>
            <input
              id="va-voladdr"
              className={`mt-2 ${INPUT_CLASS}`}
              value={volunteerAddress}
              onChange={(event) => setVolunteerAddress(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="va-volphone">
              Volunteer phone
            </label>
            <input
              id="va-volphone"
              className={`mt-2 ${INPUT_CLASS}`}
              value={volunteerPhone}
              onChange={(event) => setVolunteerPhone(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="va-volemail">
              Volunteer email
            </label>
            <input
              id="va-volemail"
              type="email"
              className={`mt-2 ${INPUT_CLASS}`}
              value={volunteerEmail}
              onChange={(event) => setVolunteerEmail(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="va-city">
              City for jurisdiction
            </label>
            <input
              id="va-city"
              className={`mt-2 ${INPUT_CLASS}`}
              value={governingCity}
              onChange={(event) => setGoverningCity(event.target.value)}
            />
          </div>
          {volunteerIsMinor && (
            <div>
              <label className={LABEL_CLASS} htmlFor="va-guardian">
                Parent or guardian name
              </label>
              <input
                id="va-guardian"
                className={`mt-2 ${INPUT_CLASS}`}
                value={guardianName}
                onChange={(event) => setGuardianName(event.target.value)}
              />
            </div>
          )}
        </div>

        <div className="mt-4 flex items-start gap-3">
          <input
            id="va-minor"
            type="checkbox"
            className="mt-1 h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
            checked={volunteerIsMinor}
            onChange={(event) => setVolunteerIsMinor(event.target.checked)}
          />
          <label className="text-sm leading-6 text-[var(--muted-foreground)]" htmlFor="va-minor">
            The volunteer is under 18 — add a parental consent clause and counter-signature block
          </label>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Clauses</h2>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          {REQUIRED_CLAUSES.map((clause) => clause.label).join(", ")} are always included.
        </p>
        <div className="mt-4 space-y-3">
          {OPTIONAL_CLAUSES.map((clause) => (
            <div key={clause.key} className="flex items-start gap-3">
              <input
                id={`va-clause-${clause.key}`}
                type="checkbox"
                className="mt-1 h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)]"
                checked={selectedClauses.includes(clause.key)}
                onChange={() => toggleClause(clause.key)}
              />
              <label htmlFor={`va-clause-${clause.key}`} className="text-sm leading-6">
                <span className="font-semibold">{clause.label}</span>
                <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                  {clause.text}
                </span>
              </label>
            </div>
          ))}
        </div>
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
              Total volunteer hours
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {commitment ? commitment.totalHours : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {commitment
                ? `${commitment.weeks} weeks · ${commitment.totalSessions} sessions · ends ${formatLongDate(commitment.endDate)}`
                : "Fix the inputs above"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyAgreement}
              disabled={failed}
              aria-label="Copy the volunteer agreement"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy agreement"}
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
            ["Travel reimbursement budget", commitment ? money(commitment.travelTotal) : "—"],
            ["Meal reimbursement budget", commitment ? money(commitment.mealTotal) : "—"],
            ["Total out-of-pocket budget", commitment ? money(commitment.expenseTotal) : "—"],
            ["Fixed payment over the placement", commitment ? money(commitment.stipendTotal) : "—"],
            ["Notice period", commitment ? `${commitment.noticeDays} days` : "—"],
            ["Clauses in the agreement", failed ? "—" : String(result.clauseCount)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {commitment && commitment.warning && (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
          >
            {commitment.warning}
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Agreement preview</h2>
        <pre className="mt-3 max-h-[32rem] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6">
          {failed ? "—" : result.agreement}
        </pre>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational template only, not legal advice. Whether an arrangement is volunteering or
        employment turns on the facts, not the label on the document — have a lawyer review the
        draft before you roll it out across a programme.
      </p>
    </main>
  );
}
