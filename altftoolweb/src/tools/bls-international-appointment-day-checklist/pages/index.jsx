"use client";

import { useMemo, useState } from "react";
import { Ban, Check, Clock, Copy, FileText, ListChecks, Printer, RotateCcw, Shirt } from "lucide-react";

import {
  ARRIVE_BEFORE_MINUTES,
  DEFAULT_CONTINGENCY_MINUTES,
  DEFAULT_COPIES_PER_DOCUMENT,
  DEFAULT_PASSPORT_PAGES,
  SCHEMES,
  SCHEME_KEYS,
  buildChecklist,
  computeCopySet,
  computeReadiness,
  computeTiming,
} from "../lib";

const WHOLE = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 });
const EM_DASH = "—";
const whole = (value) => (Number.isFinite(value) ? WHOLE.format(value) : EM_DASH);

const DEFAULTS = {
  scheme: "spain",
  age: "32",
  biometricsBooked: true,
  courierReturn: true,
  premiumService: false,
  appointmentTime: "09:45",
  travelMinutes: "60",
  contingencyMinutes: String(DEFAULT_CONTINGENCY_MINUTES),
  supportingDocuments: "12",
  copiesPerDocument: String(DEFAULT_COPIES_PER_DOCUMENT),
  passportsToCopy: "1",
  passportPages: String(DEFAULT_PASSPORT_PAGES),
};

const GROUP_META = {
  carry: {
    title: "Carry with you",
    Icon: FileText,
    blurb: "Loose in a slim folder — nothing stapled, nothing sealed.",
  },
  wear: {
    title: "Wear and prepare",
    Icon: Shirt,
    blurb: "Sorted the night before, not in the queue.",
  },
  leave: {
    title: "Leave behind",
    Icon: Ban,
    blurb: "Refused at security, with nowhere to store it.",
  },
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const TOGGLE_CLASS =
  "flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--primary)]";
const CHECKBOX_CLASS =
  "h-5 w-5 shrink-0 accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const ALERT_CLASS =
  "rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]";

export default function ToolHome() {
  const [scheme, setScheme] = useState(DEFAULTS.scheme);
  const [age, setAge] = useState(DEFAULTS.age);
  const [biometricsBooked, setBiometricsBooked] = useState(DEFAULTS.biometricsBooked);
  const [courierReturn, setCourierReturn] = useState(DEFAULTS.courierReturn);
  const [premiumService, setPremiumService] = useState(DEFAULTS.premiumService);
  const [appointmentTime, setAppointmentTime] = useState(DEFAULTS.appointmentTime);
  const [travelMinutes, setTravelMinutes] = useState(DEFAULTS.travelMinutes);
  const [contingencyMinutes, setContingencyMinutes] = useState(DEFAULTS.contingencyMinutes);
  const [supportingDocuments, setSupportingDocuments] = useState(DEFAULTS.supportingDocuments);
  const [copiesPerDocument, setCopiesPerDocument] = useState(DEFAULTS.copiesPerDocument);
  const [passportsToCopy, setPassportsToCopy] = useState(DEFAULTS.passportsToCopy);
  const [passportPages, setPassportPages] = useState(DEFAULTS.passportPages);
  const [checked, setChecked] = useState([]);
  const [copied, setCopied] = useState(false);

  const checklist = useMemo(
    () =>
      buildChecklist({
        scheme,
        age: Number(age),
        biometricsBooked,
        courierReturn,
        premiumService,
      }),
    [scheme, age, biometricsBooked, courierReturn, premiumService],
  );

  const timing = useMemo(
    () =>
      computeTiming({
        appointmentTime,
        travelMinutes: Number(travelMinutes),
        contingencyMinutes: Number(contingencyMinutes),
      }),
    [appointmentTime, travelMinutes, contingencyMinutes],
  );

  const copySet = useMemo(
    () =>
      computeCopySet({
        supportingDocuments: Number(supportingDocuments),
        copiesPerDocument: Number(copiesPerDocument),
        passportsToCopy: Number(passportsToCopy),
        passportPages: Number(passportPages),
      }),
    [supportingDocuments, copiesPerDocument, passportsToCopy, passportPages],
  );

  const listFailed = Boolean(checklist.error);
  const timingFailed = Boolean(timing.error);
  const copyFailed = Boolean(copySet.error);

  const readiness = useMemo(
    () => computeReadiness(listFailed ? [] : checklist.all, checked),
    [checklist, checked, listFailed],
  );

  const summary = useMemo(() => {
    if (listFailed) return "";
    const lines = [
      "BLS International appointment day checklist",
      checklist.schemeLabel,
    ];
    if (!timingFailed) {
      lines.push(
        `Appointment ${timing.appointment} · at the centre by ${timing.arriveBy} · leave home by ${timing.leaveHomeBy}`,
      );
    }
    if (!copyFailed) {
      lines.push(`Photocopies to print beforehand: ${copySet.totalCopies} pages`);
    }
    lines.push("");
    for (const key of ["carry", "wear", "leave"]) {
      lines.push(GROUP_META[key].title.toUpperCase());
      for (const item of checklist.groups[key]) {
        lines.push(
          `${checked.includes(item.id) ? "[x]" : "[ ]"} ${item.label}${item.critical ? " (essential)" : ""}`,
        );
      }
      lines.push("");
    }
    lines.push("Confirm against your own centre's published checklist before you travel.");
    return lines.join("\n");
  }, [checklist, checked, listFailed, timing, timingFailed, copySet, copyFailed]);

  const toggle = (id) => {
    setChecked((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
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
    if (
      !window.confirm(
        "Reset the checklist? This clears every ticked item and all form inputs and cannot be undone.",
      )
    ) {
      return;
    }
    setScheme(DEFAULTS.scheme);
    setAge(DEFAULTS.age);
    setBiometricsBooked(DEFAULTS.biometricsBooked);
    setCourierReturn(DEFAULTS.courierReturn);
    setPremiumService(DEFAULTS.premiumService);
    setAppointmentTime(DEFAULTS.appointmentTime);
    setTravelMinutes(DEFAULTS.travelMinutes);
    setContingencyMinutes(DEFAULTS.contingencyMinutes);
    setSupportingDocuments(DEFAULTS.supportingDocuments);
    setCopiesPerDocument(DEFAULTS.copiesPerDocument);
    setPassportsToCopy(DEFAULTS.passportsToCopy);
    setPassportPages(DEFAULTS.passportPages);
    setChecked([]);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ListChecks className="h-4 w-4" aria-hidden="true" />
          Visa appointments
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          BLS International Appointment Day Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          What to carry, how to turn up and what security will refuse at a BLS International
          application centre — tuned to your service and the applicant&apos;s age, with a photocopy
          count to print beforehand and a leave-home time.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bls-scheme">
              Which service are you attending for?
            </label>
            <select
              id="bls-scheme"
              className={`mt-2 ${INPUT_CLASS}`}
              value={scheme}
              onChange={(event) => setScheme(event.target.value)}
            >
              {SCHEME_KEYS.map((key) => (
                <option key={key} value={key}>
                  {SCHEMES[key].label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bls-age">
              Applicant&apos;s age (years)
            </label>
            <input
              id="bls-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="120"
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bls-time">
              Appointment time (24h)
            </label>
            <input
              id="bls-time"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={appointmentTime}
              onChange={(event) => setAppointmentTime(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bls-travel">
              Travel time to the centre (minutes)
            </label>
            <input
              id="bls-travel"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="5"
              value={travelMinutes}
              onChange={(event) => setTravelMinutes(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="bls-buffer">
              Contingency buffer for traffic, parking and security (minutes)
            </label>
            <input
              id="bls-buffer"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="5"
              value={contingencyMinutes}
              onChange={(event) => setContingencyMinutes(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className={TOGGLE_CLASS} htmlFor="bls-biometrics">
            <input
              id="bls-biometrics"
              type="checkbox"
              className={CHECKBOX_CLASS}
              checked={biometricsBooked}
              onChange={(event) => setBiometricsBooked(event.target.checked)}
            />
            Biometrics booked
          </label>
          <label className={TOGGLE_CLASS} htmlFor="bls-courier">
            <input
              id="bls-courier"
              type="checkbox"
              className={CHECKBOX_CLASS}
              checked={courierReturn}
              onChange={(event) => setCourierReturn(event.target.checked)}
            />
            Return by courier
          </label>
          <label className={TOGGLE_CLASS} htmlFor="bls-premium">
            <input
              id="bls-premium"
              type="checkbox"
              className={CHECKBOX_CLASS}
              checked={premiumService}
              onChange={(event) => setPremiumService(event.target.checked)}
            />
            Premium / add-on service
          </label>
        </div>
      </section>

      {listFailed && (
        <p role="alert" className={`mt-6 ${ALERT_CLASS}`}>
          {checklist.error}
        </p>
      )}

      <section
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        aria-live="polite"
        role="status"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Essentials ticked off
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {listFailed
                ? EM_DASH
                : `${whole(readiness.criticalDone)} / ${whole(readiness.criticalTotal)}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {listFailed
                ? "Fix the input above to build your list."
                : readiness.ready
                  ? "Every make-or-break item is ticked. Now clear the rest."
                  : `${whole(readiness.criticalMissing)} essential item(s) still outstanding.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={listFailed}
              aria-label={copied ? "Checklist copied" : "Copy the BLS appointment day checklist"}
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy checklist"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the checklist" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!listFailed && (
          <div
            className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={`${whole(readiness.done)} of ${whole(readiness.total)} checklist items ticked`}
          >
            <span
              className="block h-full bg-[var(--primary)] transition-[width]"
              style={{ width: `${readiness.percent}%` }}
            />
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Items on your list</dt>
            <dd className="text-right font-semibold">
              {listFailed ? EM_DASH : `${whole(readiness.done)} of ${whole(readiness.total)} ticked`}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Fingerprints at this visit</dt>
            <dd className="text-right font-semibold">
              {listFailed ? EM_DASH : checklist.fingerprints.fingerprints ? "Yes" : "No"}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">At the centre by</dt>
            <dd className="text-right font-semibold">
              {timingFailed
                ? EM_DASH
                : `${timing.arriveBy}${timing.arriveByPreviousDay ? " (previous day)" : ""}`}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Leave home by</dt>
            <dd className="text-right font-semibold">
              {timingFailed
                ? EM_DASH
                : `${timing.leaveHomeBy}${timing.previousDay ? " (previous day)" : ""}`}
            </dd>
          </div>
        </dl>

        {timingFailed && (
          <p role="alert" className={`mt-4 ${ALERT_CLASS}`}>
            {timing.error}
          </p>
        )}

        {!listFailed && checklist.fingerprints.reason && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {checklist.fingerprints.reason}
          </p>
        )}

        {!timingFailed && (
          <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-[var(--muted-foreground)]">
            <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            Centres ask you to arrive roughly {ARRIVE_BEFORE_MINUTES} minutes before the slot. Much
            earlier and you will be waiting outside the door.
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Printer className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
          Photocopy planner
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          BLS checklists normally want the original plus a self-attested copy of every sheet. Print
          them at home — the on-site copy desk is chargeable and slow.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bls-docs">
              Document pages on your checklist
            </label>
            <input
              id="bls-docs"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={supportingDocuments}
              onChange={(event) => setSupportingDocuments(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bls-copies">
              Copies required per page
            </label>
            <input
              id="bls-copies"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={copiesPerDocument}
              onChange={(event) => setCopiesPerDocument(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bls-passports">
              Passports to copy (current plus old)
            </label>
            <input
              id="bls-passports"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={passportsToCopy}
              onChange={(event) => setPassportsToCopy(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bls-passport-pages">
              Pages copied per passport
            </label>
            <input
              id="bls-passport-pages"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={passportPages}
              onChange={(event) => setPassportPages(event.target.value)}
            />
          </div>
        </div>

        {copyFailed ? (
          <p role="alert" className={`mt-4 ${ALERT_CLASS}`}>
            {copySet.error}
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Photocopies to print</dt>
            <dd className="text-right text-lg font-semibold text-[var(--primary)]">
              {copyFailed ? EM_DASH : `${whole(copySet.totalCopies)} pages`}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Of which passport pages</dt>
            <dd className="text-right font-semibold">
              {copyFailed ? EM_DASH : whole(copySet.passportCopies)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Sheets if printed double-sided</dt>
            <dd className="text-right font-semibold">
              {copyFailed ? EM_DASH : whole(copySet.duplexSheets)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Total pages you will hand over</dt>
            <dd className="text-right font-semibold">
              {copyFailed ? EM_DASH : whole(copySet.pagesToHandOver)}
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          Print copies single-sided unless your checklist says otherwise — scanning desks separate
          every sheet, and a double-sided copy hides one side.
        </p>
      </section>

      {!listFailed &&
        ["carry", "wear", "leave"].map((key) => {
          const meta = GROUP_META[key];
          const { Icon } = meta;
          return (
            <section
              key={key}
              className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
            >
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <Icon className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
                {meta.title}
              </h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">{meta.blurb}</p>
              <ul className="mt-3 space-y-2">
                {checklist.groups[key].map((item) => (
                  <li key={item.id}>
                    <label
                      htmlFor={`bls-item-${item.id}`}
                      className="flex cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 transition hover:border-[var(--primary)]"
                    >
                      <input
                        id={`bls-item-${item.id}`}
                        type="checkbox"
                        className={`mt-0.5 ${CHECKBOX_CLASS}`}
                        checked={checked.includes(item.id)}
                        onChange={() => toggle(item.id)}
                      />
                      <span>
                        <span className="block text-sm font-semibold">
                          {item.label}
                          {item.critical && (
                            <span className="ml-2 rounded-full bg-[var(--danger-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--danger)]">
                              Essential
                            </span>
                          )}
                        </span>
                        <span className="mt-1 block text-sm leading-6 text-[var(--muted-foreground)]">
                          {item.detail}
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, and not immigration advice. BLS International centres set security,
        cloakroom and payment rules city by city, and client governments change document
        requirements without notice — always read your own centre&apos;s published checklist and your
        appointment email before you travel.
      </p>
    </main>
  );
}
