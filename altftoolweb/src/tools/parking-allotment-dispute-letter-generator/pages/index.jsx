"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, CircleParking, Copy, RotateCcw } from "lucide-react";

import {
  DEFAULT_REPLY_DAYS,
  DISPUTE_TYPES,
  buildParkingDisputeLetter,
  formatLongDate,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

/** Static seed so the server and the first client render agree; replaced with today on mount. */
const SEED_DATE = "2026-01-15";

const todayIso = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const DEFAULTS = {
  disputeType: "encroachment",
  societyName: "",
  societyAddress: "",
  memberName: "",
  flatNumber: "",
  wing: "",
  replyDays: String(DEFAULT_REPLY_DAYS),
  slotNumber: "",
  vehicleNumber: "",
  vehicleType: "car",
  totalSlots: "",
  memberVehicles: "",
  earlierRequestDate: "",
  monthlyCharge: "0",
  incidentSummary: "",
  contactPhone: "",
  contactEmail: "",
};

const VEHICLE_TYPES = ["car", "two-wheeler", "SUV", "electric car"];

export default function ToolHome() {
  const [disputeType, setDisputeType] = useState(DEFAULTS.disputeType);
  const [societyName, setSocietyName] = useState(DEFAULTS.societyName);
  const [societyAddress, setSocietyAddress] = useState(DEFAULTS.societyAddress);
  const [memberName, setMemberName] = useState(DEFAULTS.memberName);
  const [flatNumber, setFlatNumber] = useState(DEFAULTS.flatNumber);
  const [wing, setWing] = useState(DEFAULTS.wing);
  const [letterDate, setLetterDate] = useState(SEED_DATE);
  const [replyDays, setReplyDays] = useState(DEFAULTS.replyDays);
  const [slotNumber, setSlotNumber] = useState(DEFAULTS.slotNumber);
  const [vehicleNumber, setVehicleNumber] = useState(DEFAULTS.vehicleNumber);
  const [vehicleType, setVehicleType] = useState(DEFAULTS.vehicleType);
  const [totalSlots, setTotalSlots] = useState(DEFAULTS.totalSlots);
  const [memberVehicles, setMemberVehicles] = useState(DEFAULTS.memberVehicles);
  const [earlierRequestDate, setEarlierRequestDate] = useState(DEFAULTS.earlierRequestDate);
  const [monthlyCharge, setMonthlyCharge] = useState(DEFAULTS.monthlyCharge);
  const [incidentSummary, setIncidentSummary] = useState(DEFAULTS.incidentSummary);
  const [contactPhone, setContactPhone] = useState(DEFAULTS.contactPhone);
  const [contactEmail, setContactEmail] = useState(DEFAULTS.contactEmail);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLetterDate(todayIso());
  }, []);

  const result = useMemo(
    () =>
      buildParkingDisputeLetter({
        disputeType,
        societyName,
        societyAddress,
        memberName: memberName.trim(),
        flatNumber: flatNumber.trim(),
        wing,
        letterDate,
        replyDays: Number(replyDays),
        slotNumber,
        vehicleNumber,
        vehicleType,
        totalSlots: Number(totalSlots),
        memberVehicles: Number(memberVehicles),
        earlierRequestDate,
        monthlyCharge: Number(monthlyCharge),
        incidentSummary,
        contactPhone,
        contactEmail,
      }),
    [
      disputeType,
      societyName,
      societyAddress,
      memberName,
      flatNumber,
      wing,
      letterDate,
      replyDays,
      slotNumber,
      vehicleNumber,
      vehicleType,
      totalSlots,
      memberVehicles,
      earlierRequestDate,
      monthlyCharge,
      incidentSummary,
      contactPhone,
      contactEmail,
    ],
  );

  const hasError = Boolean(result.error);
  const dash = "—";

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.letter);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setDisputeType(DEFAULTS.disputeType);
    setSocietyName(DEFAULTS.societyName);
    setSocietyAddress(DEFAULTS.societyAddress);
    setMemberName(DEFAULTS.memberName);
    setFlatNumber(DEFAULTS.flatNumber);
    setWing(DEFAULTS.wing);
    setLetterDate(todayIso());
    setReplyDays(DEFAULTS.replyDays);
    setSlotNumber(DEFAULTS.slotNumber);
    setVehicleNumber(DEFAULTS.vehicleNumber);
    setVehicleType(DEFAULTS.vehicleType);
    setTotalSlots(DEFAULTS.totalSlots);
    setMemberVehicles(DEFAULTS.memberVehicles);
    setEarlierRequestDate(DEFAULTS.earlierRequestDate);
    setMonthlyCharge(DEFAULTS.monthlyCharge);
    setIncidentSummary(DEFAULTS.incidentSummary);
    setContactPhone(DEFAULTS.contactPhone);
    setContactEmail(DEFAULTS.contactEmail);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <CircleParking className="h-4 w-4" aria-hidden="true" />
          Society notice
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Parking Allotment Dispute Letter Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Draft a written complaint to your managing committee over a denied slot, an encroached
          slot, an irregular allotment or a parking charge nobody approved — with the bye-law and
          case-law grounds set out and a reply deadline on the record.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="pk-type">
              What is the problem?
            </label>
            <select
              id="pk-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={disputeType}
              onChange={(event) => setDisputeType(event.target.value)}
            >
              {DISPUTE_TYPES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pk-society">
              Society name
            </label>
            <input
              id="pk-society"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="Green Acres Co-operative Housing Society Ltd"
              value={societyName}
              onChange={(event) => setSocietyName(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pk-address">
              Society address
            </label>
            <input
              id="pk-address"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="Plot 14, Sector 8, Kharghar, Navi Mumbai 410210"
              value={societyAddress}
              onChange={(event) => setSocietyAddress(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pk-member">
              Your name
            </label>
            <input
              id="pk-member"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="As in the society register"
              value={memberName}
              onChange={(event) => setMemberName(event.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS} htmlFor="pk-flat">
                Flat number
              </label>
              <input
                id="pk-flat"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                placeholder="704"
                value={flatNumber}
                onChange={(event) => setFlatNumber(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="pk-wing">
                Wing / building
              </label>
              <input
                id="pk-wing"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                placeholder="B Wing"
                value={wing}
                onChange={(event) => setWing(event.target.value)}
              />
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pk-date">
              Date of this letter
            </label>
            <input
              id="pk-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={letterDate}
              onChange={(event) => setLetterDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pk-reply">
              Reply requested within (days)
            </label>
            <input
              id="pk-reply"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="3"
              max="90"
              step="1"
              value={replyDays}
              onChange={(event) => setReplyDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pk-slot">
              Slot number (optional)
            </label>
            <input
              id="pk-slot"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="22"
              value={slotNumber}
              onChange={(event) => setSlotNumber(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pk-vehicle-type">
              Vehicle type
            </label>
            <select
              id="pk-vehicle-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={vehicleType}
              onChange={(event) => setVehicleType(event.target.value)}
            >
              {VEHICLE_TYPES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pk-reg">
              Registration number (optional)
            </label>
            <input
              id="pk-reg"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="MH 01 AB 1234"
              value={vehicleNumber}
              onChange={(event) => setVehicleNumber(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pk-earlier">
              Date you first raised it (optional)
            </label>
            <input
              id="pk-earlier"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={earlierRequestDate}
              onChange={(event) => setEarlierRequestDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pk-slots">
              Total slots in the society (optional)
            </label>
            <input
              id="pk-slots"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              placeholder="40"
              value={totalSlots}
              onChange={(event) => setTotalSlots(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pk-vehicles">
              Member vehicles (optional)
            </label>
            <input
              id="pk-vehicles"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              placeholder="55"
              value={memberVehicles}
              onChange={(event) => setMemberVehicles(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pk-charge">
              Monthly parking charge billed (INR)
            </label>
            <input
              id="pk-charge"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={monthlyCharge}
              onChange={(event) => setMonthlyCharge(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pk-summary">
              Anything else the committee should know (optional)
            </label>
            <textarea
              id="pk-summary"
              className={`mt-2 ${AREA_CLASS}`}
              rows={3}
              placeholder="On 12 July the same vehicle blocked the slot for three days despite a request at the gate."
              value={incidentSummary}
              onChange={(event) => setIncidentSummary(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pk-phone">
              Phone (optional)
            </label>
            <input
              id="pk-phone"
              className={`mt-2 ${INPUT_CLASS}`}
              type="tel"
              value={contactPhone}
              onChange={(event) => setContactPhone(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pk-email">
              Email (optional)
            </label>
            <input
              id="pk-email"
              className={`mt-2 ${INPUT_CLASS}`}
              type="email"
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Written reply due by
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : formatLongDate(result.replyBy)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? dash : `${result.wordCount} words · ${result.subject}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the parking dispute letter"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy letter"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Reply requested by", hasError ? dash : formatLongDate(result.replyBy)],
            [
              "Statutory notice ripens (MCS Act s.164)",
              hasError ? dash : formatLongDate(result.disputeEligibleFrom),
            ],
            [
              "Allotment term to be reviewed by",
              hasError ? dash : formatLongDate(result.allotmentReviewDue),
            ],
            [
              "Slots vs member vehicles",
              hasError || result.shortfall.slotsPerVehicle === null
                ? dash
                : `${result.shortfall.coveragePercent}% covered · ${result.shortfall.shortfall} vehicle(s) short`,
            ],
            ["Grounds cited", hasError ? dash : String(result.grounds.length)],
            ["Reliefs asked for", hasError ? dash : String(result.reliefs.length)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <>
          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Your letter</h2>
            <pre className="mt-3 overflow-x-auto rounded-md bg-[var(--background)] p-4 text-sm leading-6 whitespace-pre-wrap text-[var(--foreground)]">
              {result.letter}
            </pre>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">If there is no reply</h2>
            <ol className="mt-3 space-y-2 text-sm">
              {result.escalation.map((step) => (
                <li key={step.step} className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-[var(--muted-foreground)]">{step.step}</span>
                  <span className="font-semibold">{formatLongDate(step.date)}</span>
                </li>
              ))}
            </ol>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational template only, drafted around the Maharashtra model bye-laws. Bye-law numbers,
        notice periods and the forum for a dispute differ by state, and a deemed-conveyance or
        apartment-ownership building may be governed differently. Have a lawyer review the letter
        before you rely on it in a dispute.
      </p>
    </main>
  );
}
