"use client";

import { useMemo, useState } from "react";
import {
  Ban,
  CalendarClock,
  Check,
  Clock,
  Copy,
  FileText,
  Landmark,
  RotateCcw,
  Shirt,
} from "lucide-react";

import {
  APPOINTMENT_TYPES,
  APPOINTMENT_TYPE_KEYS,
  CONSULAR_POSTS,
  DEFAULT_CONTINGENCY_MINUTES,
  MAX_EARLY_ARRIVAL_MINUTES,
  VISA_CLASSES,
  VISA_CLASS_KEYS,
  buildChecklist,
  computeArrivalWindow,
  computeReadiness,
  computeStudentWindows,
} from "../lib";

const WHOLE = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const EM_DASH = "—";
const whole = (value) => (Number.isFinite(value) ? WHOLE.format(value) : EM_DASH);

const DEFAULTS = {
  appointmentType: "interview",
  visaClass: "student",
  post: CONSULAR_POSTS[0],
  age: "22",
  appointmentTime: "08:30",
  travelMinutes: "50",
  contingencyMinutes: String(DEFAULT_CONTINGENCY_MINUTES),
  appointmentDate: "2027-05-10",
  programStartDate: "2027-08-23",
};

const GROUP_META = {
  carry: {
    title: "Carry with you",
    Icon: FileText,
    blurb: "Originals, printed, in a clear plastic folder.",
  },
  wear: {
    title: "Wear and prepare",
    Icon: Shirt,
    blurb: "Decided before you leave, not in the queue.",
  },
  leave: {
    title: "Leave behind",
    Icon: Ban,
    blurb: "There is no storage at a US post — it has to stay outside with someone.",
  },
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECKBOX_CLASS =
  "h-5 w-5 shrink-0 accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const ALERT_CLASS =
  "rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]";
const NOTE_CLASS =
  "rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--muted-foreground)]";

export default function ToolHome() {
  const [appointmentType, setAppointmentType] = useState(DEFAULTS.appointmentType);
  const [visaClass, setVisaClass] = useState(DEFAULTS.visaClass);
  const [post, setPost] = useState(DEFAULTS.post);
  const [age, setAge] = useState(DEFAULTS.age);
  const [appointmentTime, setAppointmentTime] = useState(DEFAULTS.appointmentTime);
  const [travelMinutes, setTravelMinutes] = useState(DEFAULTS.travelMinutes);
  const [contingencyMinutes, setContingencyMinutes] = useState(DEFAULTS.contingencyMinutes);
  const [appointmentDate, setAppointmentDate] = useState(DEFAULTS.appointmentDate);
  const [programStartDate, setProgramStartDate] = useState(DEFAULTS.programStartDate);
  const [checked, setChecked] = useState([]);
  const [copied, setCopied] = useState(false);

  const checklist = useMemo(
    () => buildChecklist({ appointmentType, visaClass, age: Number(age) }),
    [appointmentType, visaClass, age],
  );

  const arrival = useMemo(
    () =>
      computeArrivalWindow({
        appointmentTime,
        travelMinutes: Number(travelMinutes),
        contingencyMinutes: Number(contingencyMinutes),
      }),
    [appointmentTime, travelMinutes, contingencyMinutes],
  );

  const windows = useMemo(
    () => computeStudentWindows({ visaClass, programStartDate, appointmentDate }),
    [visaClass, programStartDate, appointmentDate],
  );

  const listFailed = Boolean(checklist.error);
  const arrivalFailed = Boolean(arrival.error);
  const windowsFailed = Boolean(windows.error);
  const showWindows = windows.applicable === true || windowsFailed;

  const readiness = useMemo(
    () => computeReadiness(listFailed ? [] : checklist.all, checked),
    [checklist, checked, listFailed],
  );

  const summary = useMemo(() => {
    if (listFailed) return "";
    const lines = [
      "US visa appointment day checklist (India)",
      `${checklist.appointmentLabel} · ${checklist.visaClassLabel}`,
      appointmentType === "interview" ? post : checklist.location,
    ];
    if (!arrivalFailed) {
      lines.push(
        `Arrive between ${arrival.windowOpens} and ${arrival.windowCloses} · leave home by ${arrival.leaveHomeBy}`,
      );
    }
    if (windows.applicable && !windowsFailed) {
      lines.push(`Earliest US entry: ${windows.earliestEntry}`);
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
    lines.push("Confirm against your appointment confirmation and the official instructions.");
    return lines.join("\n");
  }, [
    appointmentType,
    arrival,
    arrivalFailed,
    checked,
    checklist,
    listFailed,
    post,
    windows,
    windowsFailed,
  ]);

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
    setAppointmentType(DEFAULTS.appointmentType);
    setVisaClass(DEFAULTS.visaClass);
    setPost(DEFAULTS.post);
    setAge(DEFAULTS.age);
    setAppointmentTime(DEFAULTS.appointmentTime);
    setTravelMinutes(DEFAULTS.travelMinutes);
    setContingencyMinutes(DEFAULTS.contingencyMinutes);
    setAppointmentDate(DEFAULTS.appointmentDate);
    setProgramStartDate(DEFAULTS.programStartDate);
    setChecked([]);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Landmark className="h-4 w-4" aria-hidden="true" />
          Visa appointments
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          US Consulate India Appointment Day Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The OFC biometrics visit, the consular interview and an Interview Waiver drop-off each need
          a different set of papers. Pick yours and get the carry, wear and leave-behind list, the
          15-minute arrival window and a leave-home time.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="us-type">
              Which appointment is this?
            </label>
            <select
              id="us-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={appointmentType}
              onChange={(event) => setAppointmentType(event.target.value)}
            >
              {APPOINTMENT_TYPE_KEYS.map((key) => (
                <option key={key} value={key}>
                  {APPOINTMENT_TYPES[key].label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="us-class">
              Visa category
            </label>
            <select
              id="us-class"
              className={`mt-2 ${INPUT_CLASS}`}
              value={visaClass}
              onChange={(event) => setVisaClass(event.target.value)}
            >
              {VISA_CLASS_KEYS.map((key) => (
                <option key={key} value={key}>
                  {VISA_CLASSES[key].label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="us-post">
              Post you are attending
            </label>
            <select
              id="us-post"
              className={`mt-2 ${INPUT_CLASS}`}
              value={post}
              onChange={(event) => setPost(event.target.value)}
            >
              {CONSULAR_POSTS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="us-age">
              Applicant&apos;s age (years)
            </label>
            <input
              id="us-age"
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
            <label className={LABEL_CLASS} htmlFor="us-time">
              Appointment time (24h)
            </label>
            <input
              id="us-time"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={appointmentTime}
              onChange={(event) => setAppointmentTime(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="us-travel">
              Travel time to the post (minutes)
            </label>
            <input
              id="us-travel"
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
            <label className={LABEL_CLASS} htmlFor="us-buffer">
              Contingency buffer for traffic, parking and reaching the gate (minutes)
            </label>
            <input
              id="us-buffer"
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
      </section>

      {listFailed && (
        <p role="alert" className={`mt-6 ${ALERT_CLASS}`}>
          {checklist.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Arrive between
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {arrivalFailed ? EM_DASH : `${arrival.windowOpens} – ${arrival.windowCloses}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {arrivalFailed
                ? "Fix the appointment time or travel time above."
                : `Leave home by ${arrival.leaveHomeBy}${arrival.previousDay ? " (previous day)" : ""}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={listFailed}
              aria-label="Copy the US visa appointment day checklist"
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
            <dt className="text-[var(--muted-foreground)]">Essentials ticked</dt>
            <dd className="text-right font-semibold">
              {listFailed
                ? EM_DASH
                : `${whole(readiness.criticalDone)} of ${whole(readiness.criticalTotal)}`}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">All items ticked</dt>
            <dd className="text-right font-semibold">
              {listFailed ? EM_DASH : `${whole(readiness.done)} of ${whole(readiness.total)}`}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Where you are going</dt>
            <dd className="text-right font-semibold">
              {listFailed ? EM_DASH : appointmentType === "interview" ? post : checklist.location}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Fingerprints at this visit</dt>
            <dd className="text-right font-semibold">
              {listFailed ? EM_DASH : checklist.fingerprints.fingerprints ? "Yes" : "No"}
            </dd>
          </div>
        </dl>

        {arrivalFailed && (
          <p role="alert" className={`mt-4 ${ALERT_CLASS}`}>
            {arrival.error}
          </p>
        )}

        {!listFailed && checklist.fingerprints.reason && (
          <p className={`mt-4 ${NOTE_CLASS}`}>{checklist.fingerprints.reason}</p>
        )}

        {!listFailed && checklist.waiverHint.ageEligible && (
          <p className={`mt-3 ${NOTE_CLASS}`}>{checklist.waiverHint.note}</p>
        )}

        <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-[var(--muted-foreground)]">
          <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          The {MAX_EARLY_ARRIVAL_MINUTES}-minute rule is a ceiling, not a target: do not arrive more
          than {MAX_EARLY_ARRIVAL_MINUTES} minutes before your appointment time. Earlier than that
          and you wait outside the perimeter.
        </p>
      </section>

      {showWindows && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <CalendarClock className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
            Student and exchange date windows
          </h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Two separate limits apply to F, M and J categories: how early the visa can be issued, and
            how early you may actually be admitted to the United States.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="us-appt-date">
                Appointment date
              </label>
              <input
                id="us-appt-date"
                className={`mt-2 ${INPUT_CLASS}`}
                type="date"
                value={appointmentDate}
                onChange={(event) => setAppointmentDate(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="us-start-date">
                Programme start date on the I-20 or DS-2019
              </label>
              <input
                id="us-start-date"
                className={`mt-2 ${INPUT_CLASS}`}
                type="date"
                value={programStartDate}
                onChange={(event) => setProgramStartDate(event.target.value)}
              />
            </div>
          </div>

          {windowsFailed && (
            <p role="alert" className={`mt-4 ${ALERT_CLASS}`}>
              {windows.error}
            </p>
          )}

          <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">
                Earliest you may be admitted to the US
              </dt>
              <dd className="text-right text-lg font-semibold text-[var(--primary)]">
                {windowsFailed ? EM_DASH : windows.earliestEntry}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Earliest the visa can be issued</dt>
              <dd className="text-right font-semibold">
                {windowsFailed || !windows.earliestIssuance
                  ? windowsFailed
                    ? EM_DASH
                    : "No fixed limit for this category"
                  : windows.earliestIssuance}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">
                Days from your appointment to the programme start
              </dt>
              <dd className="text-right font-semibold">
                {windowsFailed ? EM_DASH : whole(windows.daysToStart)}
              </dd>
            </div>
          </dl>

          {!windowsFailed && windows.tooEarlyForIssuance && (
            <p role="alert" className={`mt-4 ${ALERT_CLASS}`}>
              This appointment falls more than {windows.issuanceLeadDays} days before the programme
              start date, which is earlier than a student visa can be issued.
            </p>
          )}
          {!windowsFailed && windows.afterStart && (
            <p className={`mt-4 ${NOTE_CLASS}`}>
              Your appointment is on or after the programme start date. Speak to your designated
              school official or programme sponsor about a deferred start before you travel.
            </p>
          )}
          {!windowsFailed && !windows.tooEarlyForIssuance && !windows.afterStart && (
            <p className={`mt-4 ${NOTE_CLASS}`}>
              A visa in hand does not let you fly early: admission is capped at{" "}
              {windows.entryLeadDays} days before the programme start date.
            </p>
          )}
        </section>
      )}

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
                      htmlFor={`us-item-${item.id}`}
                      className="flex cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 transition hover:border-[var(--primary)]"
                    >
                      <input
                        id={`us-item-${item.id}`}
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
        Informational only, and not immigration or legal advice. Security rules, document
        requirements and appointment procedures at US posts in India change without notice, and each
        post publishes its own instructions — always read your appointment confirmation and the
        official guidance before you travel. If your case is complicated, consult a licensed
        immigration attorney.
      </p>
    </main>
  );
}
