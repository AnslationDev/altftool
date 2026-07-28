"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileText, RotateCcw } from "lucide-react";

import {
  CLASSIFICATIONS,
  EXEMPT_PAYEE_CODES,
  LEGACY_1099_THRESHOLD,
  TIN_TYPES,
  buildW9Worksheet,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm font-medium";

const DASH = "—";

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const PCT = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 0 });

const money = (value) => USD.format(Number.isFinite(value) ? value : 0);

const DEFAULTS = {
  classificationId: "individual",
  legalName: "Jane A. Doe",
  businessName: "Bluebird Studio",
  tinType: "ssn",
  tin: "123-45-6789",
  address: "12 Main Street, Austin, TX 78701",
  exemptPayeeCode: "",
  isForeignPerson: false,
  subjectToBackupWithholding: false,
  expectedPayment: "24000",
  reportingThreshold: String(LEGACY_1099_THRESHOLD),
};

export default function ToolHome() {
  const [classificationId, setClassificationId] = useState(DEFAULTS.classificationId);
  const [legalName, setLegalName] = useState(DEFAULTS.legalName);
  const [businessName, setBusinessName] = useState(DEFAULTS.businessName);
  const [tinType, setTinType] = useState(DEFAULTS.tinType);
  const [tin, setTin] = useState(DEFAULTS.tin);
  const [address, setAddress] = useState(DEFAULTS.address);
  const [exemptPayeeCode, setExemptPayeeCode] = useState(DEFAULTS.exemptPayeeCode);
  const [isForeignPerson, setIsForeignPerson] = useState(DEFAULTS.isForeignPerson);
  const [subjectToBackupWithholding, setSubjectToBackupWithholding] = useState(
    DEFAULTS.subjectToBackupWithholding,
  );
  const [expectedPayment, setExpectedPayment] = useState(DEFAULTS.expectedPayment);
  const [reportingThreshold, setReportingThreshold] = useState(DEFAULTS.reportingThreshold);
  const [copied, setCopied] = useState(false);

  const activeClassification =
    CLASSIFICATIONS.find((item) => item.id === classificationId) ?? CLASSIFICATIONS[0];

  const result = useMemo(
    () =>
      buildW9Worksheet({
        classificationId,
        legalName,
        businessName,
        tinType,
        tin,
        address,
        exemptPayeeCode,
        isForeignPerson,
        subjectToBackupWithholding,
        expectedPayment: Number(expectedPayment),
        reportingThreshold: Number(reportingThreshold),
      }),
    [
      classificationId,
      legalName,
      businessName,
      tinType,
      tin,
      address,
      exemptPayeeCode,
      isForeignPerson,
      subjectToBackupWithholding,
      expectedPayment,
      reportingThreshold,
    ],
  );

  const summary = useMemo(() => {
    if (result.error) return "";
    return [
      "W-9 worksheet",
      `Classification: ${result.classification.label}`,
      "",
      ...result.lines.map((line) => `${line.label}\n  ${line.guidance}`),
      "",
      ...(result.checks.length > 0 ? ["Fix before signing:", ...result.checks.map((c) => `- ${c}`)] : ["Nothing outstanding before signing."]),
    ].join("\n");
  }, [result]);

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
    setClassificationId(DEFAULTS.classificationId);
    setLegalName(DEFAULTS.legalName);
    setBusinessName(DEFAULTS.businessName);
    setTinType(DEFAULTS.tinType);
    setTin(DEFAULTS.tin);
    setAddress(DEFAULTS.address);
    setExemptPayeeCode(DEFAULTS.exemptPayeeCode);
    setIsForeignPerson(DEFAULTS.isForeignPerson);
    setSubjectToBackupWithholding(DEFAULTS.subjectToBackupWithholding);
    setExpectedPayment(DEFAULTS.expectedPayment);
    setReportingThreshold(DEFAULTS.reportingThreshold);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileText className="h-4 w-4" aria-hidden="true" />
          US contractor tax form
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">W-9 Information Worksheet</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out what belongs on each line of Form W-9 before you sign it — including the
          single-member LLC trap that causes most TIN mismatch notices.
        </p>
      </header>

      <p className="mb-6 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
        Everything you type stays in this browser tab. Nothing is uploaded, stored or logged — but
        if you would rather not type a real taxpayer number at all, leave the sample in place and use
        the guidance.
      </p>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="w9-class">
              Federal tax classification
            </label>
            <select
              id="w9-class"
              className={`mt-2 ${INPUT_CLASS}`}
              value={classificationId}
              onChange={(event) => {
                const next = event.target.value;
                setClassificationId(next);
                const nextClass = CLASSIFICATIONS.find((item) => item.id === next);
                if (nextClass && !nextClass.tinTypes.includes(tinType)) {
                  setTinType(nextClass.preferredTin);
                }
              }}
            >
              {CLASSIFICATIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              {activeClassification.note}
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="w9-name">
              Line 1 — Name on your tax return
            </label>
            <input
              id="w9-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              value={legalName}
              onChange={(event) => setLegalName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="w9-business">
              Line 2 — Business or disregarded entity name
            </label>
            <input
              id="w9-business"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              value={businessName}
              onChange={(event) => setBusinessName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="w9-tintype">
              Kind of taxpayer number
            </label>
            <select
              id="w9-tintype"
              className={`mt-2 ${INPUT_CLASS}`}
              value={tinType}
              onChange={(event) => setTinType(event.target.value)}
            >
              {TIN_TYPES.filter((item) => activeClassification.tinTypes.includes(item.id)).map(
                (item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ),
              )}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="w9-tin">
              Part I — Taxpayer identification number
            </label>
            <input
              id="w9-tin"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={tin}
              onChange={(event) => setTin(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="w9-address">
              Lines 5 and 6 — Address
            </label>
            <input
              id="w9-address"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="w9-exempt">
              Line 4 — Exempt payee code
            </label>
            <select
              id="w9-exempt"
              className={`mt-2 ${INPUT_CLASS}`}
              value={exemptPayeeCode}
              onChange={(event) => setExemptPayeeCode(event.target.value)}
            >
              {EXEMPT_PAYEE_CODES.map((item) => (
                <option key={item.code || "none"} value={item.code}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="w9-payment">
              Expected payment this year (USD)
            </label>
            <input
              id="w9-payment"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="500"
              value={expectedPayment}
              onChange={(event) => setExpectedPayment(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="w9-threshold">
              1099-NEC reporting threshold (USD)
            </label>
            <input
              id="w9-threshold"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="100"
              value={reportingThreshold}
              onChange={(event) => setReportingThreshold(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Anything else true of you
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {[
              ["w9-foreign", "I am a foreign person for US tax purposes", isForeignPerson, setIsForeignPerson],
              [
                "w9-bw",
                "The IRS has notified me that I am subject to backup withholding",
                subjectToBackupWithholding,
                setSubjectToBackupWithholding,
              ],
            ].map(([id, label, value, setter]) => (
              <label key={id} className={CHECK_ROW} htmlFor={id}>
                <input
                  id={id}
                  type="checkbox"
                  checked={value}
                  onChange={(event) => setter(event.target.checked)}
                  className="mt-0.5 h-5 w-5 accent-[var(--primary)]"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {result.error ? (
        <>
          <p
            role="alert"
            className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
          <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Worksheet complete
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--muted-foreground)]">{DASH}</p>
            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {["TIN format", "Backup withholding exposure", "1099 expected"].map((item) => (
                <div key={item} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{item}</dt>
                  <dd className="text-right font-semibold">{DASH}</dd>
                </div>
              ))}
            </dl>
          </section>
        </>
      ) : (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Worksheet complete
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {result.completeness}%
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {result.completedLines} of {result.requiredLines} required entries filled ·{" "}
                  {result.classification.label}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy the worksheet guidance"
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
                ["Box to tick on line 3a", result.classification.box],
                [
                  "TIN format",
                  result.tinValid ? `Valid shape — ${result.tinFormatted}` : result.tinReason,
                ],
                [
                  "Information return expected",
                  result.corporateExemption
                    ? "Generally not — payments to corporations are mostly exempt, apart from legal and medical fees"
                    : result.reportable
                      ? `Yes — ${money(result.payment)} is at or above the ${money(result.threshold)} threshold`
                      : `No — ${money(result.payment)} is under the ${money(result.threshold)} threshold`,
                ],
                [
                  `Backup withholding at ${PCT.format(result.backupWithholdingRate)}`,
                  result.withholdingRisk > 0
                    ? `${money(result.withholdingRisk)} withheld, leaving ${money(result.netIfWithheld)}`
                    : "None — a valid certified TIN avoids it",
                ],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Line by line</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[340px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Line
                    </th>
                    <th scope="col" className="py-2 font-semibold">
                      What goes there
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.lines.map((line) => (
                    <tr key={line.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2.5 pr-3 align-top">
                        <span className="font-semibold">{line.label}</span>
                        <span className="mt-1 block">
                          <span
                            className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${
                              line.manual
                                ? "bg-[var(--muted)] text-[var(--muted-foreground)]"
                                : line.complete
                                  ? "bg-[var(--muted)] text-[var(--muted-foreground)]"
                                  : "bg-[var(--danger-soft)] text-[var(--danger)]"
                            }`}
                          >
                            {line.manual
                              ? "On paper"
                              : line.complete
                                ? line.optional
                                  ? "Optional"
                                  : "Ready"
                                : "Missing"}
                          </span>
                        </span>
                      </td>
                      <td className="py-2.5 align-top">
                        <span className="block">{line.guidance}</span>
                        {line.value ? (
                          <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
                            You entered: {line.value}
                          </span>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Fix before signing</h2>
            {result.checks.length > 0 ? (
              <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
                {result.checks.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden="true" className="text-[var(--danger)]">
                      !
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                Nothing outstanding. Sign and date Part II, and keep a copy of what you sent.
              </p>
            )}
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only — this is not tax or legal advice, and it does not file anything. Format
        checks confirm the shape of a taxpayer number, not that it was ever issued or that it
        matches your name in IRS records. Reporting thresholds are set by legislation and change, so
        check the current year&apos;s instructions and speak to a US tax professional for anything
        unusual.
      </p>
    </main>
  );
}
