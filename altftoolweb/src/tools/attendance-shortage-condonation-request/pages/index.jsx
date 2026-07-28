"use client";

import { useMemo, useState } from "react";
import { CalendarCheck, Check, Copy, RotateCcw } from "lucide-react";
import {
  CATCH_UP_ACTIONS,
  COMMON_CONDONATION_FLOOR_PERCENT,
  GROUNDS,
  STANDARD_REQUIRED_PERCENT,
  buildCondonationRequest,
  computeAttendance,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const STATUS_STYLE = {
  clear: "bg-[var(--success)]/10 text-[var(--success)]",
  short: "bg-[var(--muted)] text-[var(--foreground)]",
  critical: "bg-[var(--danger-soft)] text-[var(--danger)]",
};

const DEFAULTS = {
  studentName: "Ishaan Verma",
  rollNumber: "21CS1042",
  programme: "B.Tech Computer Science",
  semesterOrClass: "Semester 5",
  department: "Computer Science and Engineering",
  institutionName: "Manipal Institute of Technology",
  addresseeTitle: "The Head of Department",
  address: "7 Lakeview Apartments, Udupi 576104",
  phone: "98xxxxxx23",
  email: "ishaan.verma@example.com",
  letterDate: "2026-11-04",
  absenceFrom: "2026-09-01",
  absenceTo: "2026-10-10",
  groundKey: "surgery",
  groundDetail: "",
  conducted: "120",
  attended: "78",
  requiredPercent: String(STANDARD_REQUIRED_PERCENT),
  remainingClasses: "40",
  floorPercent: String(COMMON_CONDONATION_FLOOR_PERCENT),
  parentEndorsement: true,
};

export default function ToolHome() {
  const [studentName, setStudentName] = useState(DEFAULTS.studentName);
  const [rollNumber, setRollNumber] = useState(DEFAULTS.rollNumber);
  const [programme, setProgramme] = useState(DEFAULTS.programme);
  const [semesterOrClass, setSemesterOrClass] = useState(DEFAULTS.semesterOrClass);
  const [department, setDepartment] = useState(DEFAULTS.department);
  const [institutionName, setInstitutionName] = useState(DEFAULTS.institutionName);
  const [addresseeTitle, setAddresseeTitle] = useState(DEFAULTS.addresseeTitle);
  const [address, setAddress] = useState(DEFAULTS.address);
  const [phone, setPhone] = useState(DEFAULTS.phone);
  const [email, setEmail] = useState(DEFAULTS.email);
  const [letterDate, setLetterDate] = useState(DEFAULTS.letterDate);
  const [absenceFrom, setAbsenceFrom] = useState(DEFAULTS.absenceFrom);
  const [absenceTo, setAbsenceTo] = useState(DEFAULTS.absenceTo);
  const [groundKey, setGroundKey] = useState(DEFAULTS.groundKey);
  const [groundDetail, setGroundDetail] = useState(DEFAULTS.groundDetail);
  const [conducted, setConducted] = useState(DEFAULTS.conducted);
  const [attended, setAttended] = useState(DEFAULTS.attended);
  const [requiredPercent, setRequiredPercent] = useState(DEFAULTS.requiredPercent);
  const [remainingClasses, setRemainingClasses] = useState(DEFAULTS.remainingClasses);
  const [floorPercent, setFloorPercent] = useState(DEFAULTS.floorPercent);
  const [catchUp, setCatchUp] = useState(CATCH_UP_ACTIONS.slice(0, 3));
  const [parentEndorsement, setParentEndorsement] = useState(DEFAULTS.parentEndorsement);
  const [copied, setCopied] = useState(false);

  const attendance = useMemo(
    () =>
      computeAttendance({
        conducted,
        attended,
        requiredPercent,
        remainingClasses,
        condonationFloorPercent: floorPercent,
      }),
    [conducted, attended, requiredPercent, remainingClasses, floorPercent],
  );

  const result = useMemo(
    () =>
      buildCondonationRequest({
        studentName,
        rollNumber,
        programme,
        semesterOrClass,
        department,
        institutionName,
        addresseeTitle,
        address,
        phone,
        email,
        letterDate,
        absenceFrom,
        absenceTo,
        groundKey,
        groundDetail,
        conducted,
        attended,
        requiredPercent,
        remainingClasses,
        condonationFloorPercent: floorPercent,
        catchUpActions: catchUp,
        parentEndorsement,
      }),
    [
      studentName,
      rollNumber,
      programme,
      semesterOrClass,
      department,
      institutionName,
      addresseeTitle,
      address,
      phone,
      email,
      letterDate,
      absenceFrom,
      absenceTo,
      groundKey,
      groundDetail,
      conducted,
      attended,
      requiredPercent,
      remainingClasses,
      floorPercent,
      catchUp,
      parentEndorsement,
    ],
  );

  const statsFailed = Boolean(attendance.error);
  const letterFailed = Boolean(result.error);
  const ground = GROUNDS.find((item) => item.key === groundKey) || GROUNDS[0];

  const toggleAction = (option) =>
    setCatchUp((list) =>
      list.includes(option) ? list.filter((item) => item !== option) : [...list, option],
    );

  const copyLetter = async () => {
    if (letterFailed) return;
    try {
      await navigator.clipboard.writeText(result.letter);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setStudentName(DEFAULTS.studentName);
    setRollNumber(DEFAULTS.rollNumber);
    setProgramme(DEFAULTS.programme);
    setSemesterOrClass(DEFAULTS.semesterOrClass);
    setDepartment(DEFAULTS.department);
    setInstitutionName(DEFAULTS.institutionName);
    setAddresseeTitle(DEFAULTS.addresseeTitle);
    setAddress(DEFAULTS.address);
    setPhone(DEFAULTS.phone);
    setEmail(DEFAULTS.email);
    setLetterDate(DEFAULTS.letterDate);
    setAbsenceFrom(DEFAULTS.absenceFrom);
    setAbsenceTo(DEFAULTS.absenceTo);
    setGroundKey(DEFAULTS.groundKey);
    setGroundDetail(DEFAULTS.groundDetail);
    setConducted(DEFAULTS.conducted);
    setAttended(DEFAULTS.attended);
    setRequiredPercent(DEFAULTS.requiredPercent);
    setRemainingClasses(DEFAULTS.remainingClasses);
    setFloorPercent(DEFAULTS.floorPercent);
    setCatchUp(CATCH_UP_ACTIONS.slice(0, 3));
    setParentEndorsement(DEFAULTS.parentEndorsement);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarCheck className="h-4 w-4" aria-hidden="true" />
          Exam eligibility
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Attendance Shortage Condonation Request
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter classes conducted and attended to see your exact percentage, how many classes you
          are short of the {STANDARD_REQUIRED_PERCENT}% bar and whether the remaining classes can
          still close the gap — then draft the condonation application with the right evidence list.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Attendance figures</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="asc-conducted">
              Classes or working days conducted
            </label>
            <input
              id="asc-conducted"
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={conducted}
              onChange={(event) => setConducted(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="asc-attended">
              Classes attended
            </label>
            <input
              id="asc-attended"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={attended}
              onChange={(event) => setAttended(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="asc-required">
              Attendance required (%)
            </label>
            <input
              id="asc-required"
              type="number"
              inputMode="decimal"
              min="1"
              max="100"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={requiredPercent}
              onChange={(event) => setRequiredPercent(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="asc-remaining">
              Classes still to be held
            </label>
            <input
              id="asc-remaining"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={remainingClasses}
              onChange={(event) => setRemainingClasses(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="asc-floor">
              Institution&apos;s condonation floor (%)
            </label>
            <input
              id="asc-floor"
              type="number"
              inputMode="decimal"
              min="1"
              max="100"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={floorPercent}
              onChange={(event) => setFloorPercent(event.target.value)}
            />
          </div>
        </div>
      </section>

      {statsFailed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {attendance.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Your attendance
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {statsFailed ? "—" : `${attendance.percentage}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {statsFailed
                ? "Fix the figures above"
                : `${attendance.attended} of ${attendance.conducted} classes`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyLetter}
              disabled={letterFailed}
              aria-label="Copy the condonation request letter"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy letter"}
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
            [
              "Minimum classes needed so far",
              statsFailed ? "—" : String(attendance.minimumRequiredNow),
            ],
            ["Classes short right now", statsFailed ? "—" : String(attendance.shortfallClasses)],
            [
              "Classes to attend to clear the bar",
              statsFailed
                ? "—"
                : attendance.classesNeeded === null
                  ? "not recoverable"
                  : String(attendance.classesNeeded),
            ],
            [
              "Best possible if you attend everything left",
              statsFailed ? "—" : `${attendance.achievablePercent}%`,
            ],
            ["Classes you can still afford to miss", statsFailed ? "—" : String(attendance.canMiss)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!statsFailed && (
          <>
            <div
              className="mt-5 flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Attendance ${attendance.percentage} percent against a requirement of ${attendance.requiredPercent} percent`}
            >
              <span
                className={
                  attendance.status === "clear"
                    ? "block h-full bg-[var(--success)]"
                    : "block h-full bg-[var(--danger)]"
                }
                style={{ width: `${Math.max(0, Math.min(100, attendance.percentage))}%` }}
              />
            </div>
            <p className={`mt-4 rounded-md px-3 py-2 text-sm ${STATUS_STYLE[attendance.status]}`}>
              {attendance.message}
            </p>
          </>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Ground and evidence</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="asc-ground">
              Why the classes were missed
            </label>
            <select
              id="asc-ground"
              className={`mt-2 ${INPUT_CLASS}`}
              value={groundKey}
              onChange={(event) => setGroundKey(event.target.value)}
            >
              {GROUNDS.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="asc-from">
              Absent from
            </label>
            <input
              id="asc-from"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={absenceFrom}
              onChange={(event) => setAbsenceFrom(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="asc-to">
              Absent until
            </label>
            <input
              id="asc-to"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={absenceTo}
              onChange={(event) => setAbsenceTo(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="asc-detail">
              Add the specifics (optional)
            </label>
            <textarea
              id="asc-detail"
              rows={2}
              className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              value={groundDetail}
              onChange={(event) => setGroundDetail(event.target.value)}
              placeholder="I underwent an appendectomy on 2 September 2026 and was advised six weeks of rest."
            />
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
          <p className="text-sm font-semibold">Documents to attach for this ground</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
            {ground.evidence.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="mt-5">
          <p className={LABEL_CLASS}>What you are undertaking to do</p>
          <div className="mt-2 space-y-2">
            {CATCH_UP_ACTIONS.map((option, index) => (
              <div key={option} className="flex items-start gap-3">
                <input
                  id={`asc-action-${index}`}
                  type="checkbox"
                  className="mt-1 h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                  checked={catchUp.includes(option)}
                  onChange={() => toggleAction(option)}
                />
                <label
                  className="text-sm leading-6 text-[var(--muted-foreground)]"
                  htmlFor={`asc-action-${index}`}
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Student and institution</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="asc-name">
              Student name
            </label>
            <input
              id="asc-name"
              className={`mt-2 ${INPUT_CLASS}`}
              value={studentName}
              onChange={(event) => setStudentName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="asc-roll">
              Roll or register number
            </label>
            <input
              id="asc-roll"
              className={`mt-2 ${INPUT_CLASS}`}
              value={rollNumber}
              onChange={(event) => setRollNumber(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="asc-programme">
              Programme
            </label>
            <input
              id="asc-programme"
              className={`mt-2 ${INPUT_CLASS}`}
              value={programme}
              onChange={(event) => setProgramme(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="asc-sem">
              Semester or class
            </label>
            <input
              id="asc-sem"
              className={`mt-2 ${INPUT_CLASS}`}
              value={semesterOrClass}
              onChange={(event) => setSemesterOrClass(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="asc-dept">
              Department
            </label>
            <input
              id="asc-dept"
              className={`mt-2 ${INPUT_CLASS}`}
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="asc-institution">
              Institution
            </label>
            <input
              id="asc-institution"
              className={`mt-2 ${INPUT_CLASS}`}
              value={institutionName}
              onChange={(event) => setInstitutionName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="asc-addressee">
              Addressed to
            </label>
            <input
              id="asc-addressee"
              className={`mt-2 ${INPUT_CLASS}`}
              value={addresseeTitle}
              onChange={(event) => setAddresseeTitle(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="asc-date">
              Application date
            </label>
            <input
              id="asc-date"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={letterDate}
              onChange={(event) => setLetterDate(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="asc-address">
              Address
            </label>
            <input
              id="asc-address"
              className={`mt-2 ${INPUT_CLASS}`}
              value={address}
              onChange={(event) => setAddress(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="asc-phone">
              Phone
            </label>
            <input
              id="asc-phone"
              className={`mt-2 ${INPUT_CLASS}`}
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="asc-email">
              Email
            </label>
            <input
              id="asc-email"
              type="email"
              className={`mt-2 ${INPUT_CLASS}`}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex items-start gap-3">
          <input
            id="asc-parent"
            type="checkbox"
            className="mt-1 h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
            checked={parentEndorsement}
            onChange={(event) => setParentEndorsement(event.target.checked)}
          />
          <label className="text-sm leading-6 text-[var(--muted-foreground)]" htmlFor="asc-parent">
            Include a parent or guardian counter-signature block
          </label>
        </div>
      </section>

      {letterFailed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Application preview</h2>
        <pre className="mt-3 max-h-[28rem] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6">
          {letterFailed ? "—" : result.letter}
        </pre>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational template only, not legal advice. Condonation is discretionary and each
        institution sets its own floor, fee and deadline — read your ordinance or examination
        bye-laws and submit well before the eligibility list is finalised.
      </p>
    </main>
  );
}
