"use client";

import { useMemo, useState } from "react";
import { Ban, Check, ClipboardCheck, Clock, Copy, FileText, RotateCcw, Shirt } from "lucide-react";

import {
  ARRIVE_BEFORE_MINUTES,
  DEFAULT_CONTINGENCY_MINUTES,
  SCHEMES,
  SCHEME_KEYS,
  buildChecklist,
  computeReadiness,
  computeTiming,
} from "../lib";

const WHOLE = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 });
const EM_DASH = "—";

const whole = (value) => (Number.isFinite(value) ? WHOLE.format(value) : EM_DASH);

// An emptied number input's state is "" — Number("") is 0, which would silently
// pass lib.js's numeric validation as a real value. Map "" (and other blanks) to
// NaN so lib.js's isNum()/empty checks correctly flag the field as unset.
const toNumericInput = (value) => (typeof value === "string" && value.trim() === "" ? NaN : Number(value));

const DEFAULTS = {
  scheme: "schengen",
  age: "30",
  biometricsRequired: true,
  payingByCash: false,
  courierReturn: true,
  appointmentTime: "10:30",
  travelMinutes: "45",
  contingencyMinutes: String(DEFAULT_CONTINGENCY_MINUTES),
};

const GROUP_META = {
  carry: { title: "Carry with you", Icon: FileText, blurb: "In a slim file folder, not a bag." },
  wear: { title: "Wear and prepare", Icon: Shirt, blurb: "Decided the night before, not at the door." },
  leave: { title: "Leave behind", Icon: Ban, blurb: "Refused at security or with nowhere to store it." },
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

export default function ToolHome() {
  const [scheme, setScheme] = useState(DEFAULTS.scheme);
  const [age, setAge] = useState(DEFAULTS.age);
  const [biometricsRequired, setBiometricsRequired] = useState(DEFAULTS.biometricsRequired);
  const [payingByCash, setPayingByCash] = useState(DEFAULTS.payingByCash);
  const [courierReturn, setCourierReturn] = useState(DEFAULTS.courierReturn);
  const [appointmentTime, setAppointmentTime] = useState(DEFAULTS.appointmentTime);
  const [travelMinutes, setTravelMinutes] = useState(DEFAULTS.travelMinutes);
  const [contingencyMinutes, setContingencyMinutes] = useState(DEFAULTS.contingencyMinutes);
  const [checked, setChecked] = useState([]);
  const [copied, setCopied] = useState(false);

  const checklist = useMemo(
    () =>
      buildChecklist({
        scheme,
        age: toNumericInput(age),
        biometricsRequired,
        payingByCash,
        courierReturn,
      }),
    [scheme, age, biometricsRequired, payingByCash, courierReturn],
  );

  const timing = useMemo(
    () =>
      computeTiming({
        appointmentTime,
        travelMinutes: toNumericInput(travelMinutes),
        contingencyMinutes: toNumericInput(contingencyMinutes),
      }),
    [appointmentTime, travelMinutes, contingencyMinutes],
  );

  const listFailed = Boolean(checklist.error);
  const timingFailed = Boolean(timing.error);

  const readiness = useMemo(
    () => computeReadiness(listFailed ? [] : checklist.all, checked),
    [checklist, checked, listFailed],
  );

  const summary = useMemo(() => {
    if (listFailed) return "";
    const lines = [
      "VFS Global appointment day checklist",
      checklist.schemeLabel,
      timingFailed
        ? ""
        : `Appointment ${timing.appointment} · reach the centre by ${timing.arriveBy}${timing.arriveByPreviousDay ? " (previous day)" : ""} · leave home by ${timing.leaveHomeBy}${timing.previousDay ? " (previous day)" : ""}`,
      "",
    ];
    for (const key of ["carry", "wear", "leave"]) {
      lines.push(`${GROUP_META[key].title.toUpperCase()}`);
      for (const item of checklist.groups[key]) {
        lines.push(`${checked.includes(item.id) ? "[x]" : "[ ]"} ${item.label}${item.critical ? " (essential)" : ""}`);
      }
      lines.push("");
    }
    lines.push("Confirm against your own centre's page — rules vary by city.");
    return lines.filter((line) => line !== undefined).join("\n");
  }, [checklist, checked, listFailed, timing, timingFailed]);

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
    setScheme(DEFAULTS.scheme);
    setAge(DEFAULTS.age);
    setBiometricsRequired(DEFAULTS.biometricsRequired);
    setPayingByCash(DEFAULTS.payingByCash);
    setCourierReturn(DEFAULTS.courierReturn);
    setAppointmentTime(DEFAULTS.appointmentTime);
    setTravelMinutes(DEFAULTS.travelMinutes);
    setContingencyMinutes(DEFAULTS.contingencyMinutes);
    setChecked([]);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
          Visa appointments
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          VFS Global Appointment Day Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A carry, wear and leave-behind list for the day itself, adjusted for the scheme you are
          applying under and the applicant&apos;s age — plus a leave-home time worked back from your
          slot.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="vfs-scheme">
              Which centre are you visiting?
            </label>
            <select
              id="vfs-scheme"
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
            <label className={LABEL_CLASS} htmlFor="vfs-age">
              Applicant&apos;s age (years)
            </label>
            <input
              id="vfs-age"
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
            <label className={LABEL_CLASS} htmlFor="vfs-time">
              Appointment time (24h)
            </label>
            <input
              id="vfs-time"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={appointmentTime}
              onChange={(event) => setAppointmentTime(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vfs-travel">
              Travel time to the centre (minutes)
            </label>
            <input
              id="vfs-travel"
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
            <label className={LABEL_CLASS} htmlFor="vfs-buffer">
              Contingency buffer for traffic, parking and the security queue (minutes)
            </label>
            <input
              id="vfs-buffer"
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
          <label className={TOGGLE_CLASS} htmlFor="vfs-biometrics">
            <input
              id="vfs-biometrics"
              type="checkbox"
              className={CHECKBOX_CLASS}
              checked={biometricsRequired}
              onChange={(event) => setBiometricsRequired(event.target.checked)}
            />
            Biometrics booked
          </label>
          <label className={TOGGLE_CLASS} htmlFor="vfs-cash">
            <input
              id="vfs-cash"
              type="checkbox"
              className={CHECKBOX_CLASS}
              checked={payingByCash}
              onChange={(event) => setPayingByCash(event.target.checked)}
            />
            Paying fees in cash
          </label>
          <label className={TOGGLE_CLASS} htmlFor="vfs-courier">
            <input
              id="vfs-courier"
              type="checkbox"
              className={CHECKBOX_CLASS}
              checked={courierReturn}
              onChange={(event) => setCourierReturn(event.target.checked)}
            />
            Passport back by courier
          </label>
        </div>
      </section>

      {listFailed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {checklist.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Essentials ticked off
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {listFailed ? EM_DASH : `${whole(readiness.criticalDone)} / ${whole(readiness.criticalTotal)}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {listFailed
                ? "Fix the input above to build your list."
                : readiness.ready
                  ? "Every make-or-break item is ticked. Work through the rest before you leave."
                  : `${whole(readiness.criticalMissing)} essential item(s) still missing.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={listFailed}
              aria-label="Copy the appointment day checklist"
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
            <dt className="text-[var(--muted-foreground)]">Fingerprints at this appointment</dt>
            <dd className="text-right font-semibold">
              {listFailed ? EM_DASH : checklist.fingerprints.fingerprints ? "Yes" : "No"}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Reach the centre by</dt>
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
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
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
            Centres ask you to arrive about {ARRIVE_BEFORE_MINUTES} minutes before the slot. Turning
            up much earlier than that usually means waiting outside.
          </p>
        )}
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
                      htmlFor={`vfs-item-${item.id}`}
                      className="flex cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 transition hover:border-[var(--primary)]"
                    >
                      <input
                        id={`vfs-item-${item.id}`}
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
        Informational only, and not immigration advice. VFS Global centres set their own security and
        cloakroom rules city by city, and client governments change document requirements without
        notice — always read your own centre&apos;s page and your appointment email before you travel.
      </p>
    </main>
  );
}
