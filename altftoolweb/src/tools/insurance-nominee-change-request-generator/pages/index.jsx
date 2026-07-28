"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Trash2, UserCheck } from "lucide-react";

import {
  CHANGE_REASONS,
  MAX_NOMINEES,
  POLICY_TYPES,
  RELATIONSHIPS,
  buildNomineeChangeRequest,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
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

const DEFAULT_NOMINEES = [
  { id: 1, name: "Anita Verma", relationshipId: "spouse", dob: "1994-03-11", sharePercent: "60", address: "Same as policyholder" },
  { id: 2, name: "Aarav Verma", relationshipId: "son", dob: "2016-09-02", sharePercent: "25", address: "Same as policyholder" },
  { id: 3, name: "Ira Verma", relationshipId: "daughter", dob: "2020-01-19", sharePercent: "15", address: "Same as policyholder" },
];

const DEFAULTS = {
  policyholderName: "Rakesh Verma",
  policyNumber: "LIC-889-4471209",
  insurerName: "Life Insurance Corporation of India",
  branchAddress: "Jayanagar Branch, Bengaluru 560041",
  policyholderAddress: "No. 21, 4th Cross, Jayanagar, Bengaluru 560041",
  contactPhone: "+91 98450 66120",
  contactEmail: "rakesh.verma@example.com",
  existingNominee: "Sunita Verma (mother)",
  appointeeName: "Anita Verma",
  appointeeRelationship: "wife",
  otherReason: "",
  letterDate: "2026-07-28",
  policyTypeId: "termLife",
  reasonId: "marriage",
  isMwpPolicy: false,
  isAssigned: false,
  sumAssured: "10000000",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [nominees, setNominees] = useState(DEFAULT_NOMINEES);
  const [copied, setCopied] = useState(false);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const setNominee = (id, key, value) =>
    setNominees((prev) => prev.map((row) => (row.id === id ? { ...row, [key]: value } : row)));

  const addNominee = () =>
    setNominees((prev) => {
      if (prev.length >= MAX_NOMINEES) return prev;
      const nextId = prev.reduce((max, row) => Math.max(max, row.id), 0) + 1;
      return [
        ...prev,
        { id: nextId, name: "", relationshipId: "other", dob: "1990-01-01", sharePercent: "", address: "" },
      ];
    });

  const removeNominee = (id) =>
    setNominees((prev) => (prev.length <= 1 ? prev : prev.filter((row) => row.id !== id)));

  const result = useMemo(
    () =>
      buildNomineeChangeRequest({
        ...form,
        sumAssured: form.sumAssured === "" ? NaN : Number(form.sumAssured),
        nominees: nominees.map((row) => ({
          name: row.name,
          relationshipId: row.relationshipId,
          dob: row.dob,
          sharePercent: row.sharePercent === "" ? NaN : Number(row.sharePercent),
          address: row.address,
        })),
      }),
    [form, nominees],
  );

  const hasError = Boolean(result.error);

  const enteredShareTotal = nominees.reduce(
    (sum, row) => sum + (row.sharePercent === "" ? 0 : Number(row.sharePercent) || 0),
    0,
  );

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.letterText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setNominees(DEFAULT_NOMINEES);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Nominees listed", DASH],
        ["Shares allocated", DASH],
        ["Minor nominees", DASH],
        ["Beneficial nominees (s.39(7))", DASH],
        ["Sum assured", DASH],
        ["Largest single share", DASH],
        ["Appointee named", DASH],
      ]
    : [
        ["Nominees listed", `${result.nomineeCount}`],
        ["Shares allocated", `${NUM2.format(result.shareTotal)}%`],
        ["Minor nominees", `${result.minorCount}`],
        ["Beneficial nominees (s.39(7))", `${result.beneficialCount} of ${result.nomineeCount}`],
        ["Sum assured", INR.format(result.sumAssured)],
        [
          "Largest single share",
          INR.format(Math.max(...result.nominees.map((nominee) => nominee.payout))),
        ],
        ["Appointee named", result.appointeeName || "Not required"],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <UserCheck className="h-4 w-4" aria-hidden="true" />
          Insurance letters
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Insurance Nominee Change Request Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Write the letter that asks your insurer to register a fresh nomination: shares checked
          against 100%, each share converted to an amount, minors flagged for an appointee under
          section 39(2) of the Insurance Act, 1938.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Policy</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="inc-holder">
              Policyholder name
            </label>
            <input
              id="inc-holder"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.policyholderName}
              onChange={(event) => set("policyholderName", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="inc-policy">
              Policy number
            </label>
            <input
              id="inc-policy"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.policyNumber}
              onChange={(event) => set("policyNumber", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="inc-insurer">
              Insurer
            </label>
            <input
              id="inc-insurer"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.insurerName}
              onChange={(event) => set("insurerName", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="inc-branch">
              Branch or servicing office
            </label>
            <input
              id="inc-branch"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.branchAddress}
              onChange={(event) => set("branchAddress", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="inc-type">
              Policy type
            </label>
            <select
              id="inc-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.policyTypeId}
              onChange={(event) => set("policyTypeId", event.target.value)}
            >
              {POLICY_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="inc-sum">
              Sum assured (INR)
            </label>
            <input
              id="inc-sum"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="100000"
              value={form.sumAssured}
              onChange={(event) => set("sumAssured", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="inc-existing">
              Nominee currently on record
            </label>
            <input
              id="inc-existing"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.existingNominee}
              onChange={(event) => set("existingNominee", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="inc-reason">
              Reason for the change
            </label>
            <select
              id="inc-reason"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.reasonId}
              onChange={(event) => set("reasonId", event.target.value)}
            >
              {CHANGE_REASONS.map((reason) => (
                <option key={reason.id} value={reason.id}>
                  {reason.label}
                </option>
              ))}
            </select>
          </div>
          {form.reasonId === "other" && (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="inc-other-reason">
                Describe the reason
              </label>
              <input
                id="inc-other-reason"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                value={form.otherReason}
                onChange={(event) => set("otherReason", event.target.value)}
              />
            </div>
          )}
          <div>
            <label className={LABEL_CLASS} htmlFor="inc-date">
              Letter date
            </label>
            <input
              id="inc-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.letterDate}
              onChange={(event) => set("letterDate", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="inc-phone">
              Your phone
            </label>
            <input
              id="inc-phone"
              className={`mt-2 ${INPUT_CLASS}`}
              type="tel"
              value={form.contactPhone}
              onChange={(event) => set("contactPhone", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="inc-email">
              Your email
            </label>
            <input
              id="inc-email"
              className={`mt-2 ${INPUT_CLASS}`}
              type="email"
              value={form.contactEmail}
              onChange={(event) => set("contactEmail", event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="inc-address">
              Your address
            </label>
            <input
              id="inc-address"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.policyholderAddress}
              onChange={(event) => set("policyholderAddress", event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          <label className={CHECK_ROW} htmlFor="inc-assigned">
            <input
              id="inc-assigned"
              className={CHECKBOX}
              type="checkbox"
              checked={form.isAssigned}
              onChange={(event) => set("isAssigned", event.target.checked)}
            />
            <span>The policy is assigned or transferred to someone else</span>
          </label>
          <label className={CHECK_ROW} htmlFor="inc-mwp">
            <input
              id="inc-mwp"
              className={CHECKBOX}
              type="checkbox"
              checked={form.isMwpPolicy}
              onChange={(event) => set("isMwpPolicy", event.target.checked)}
            />
            <span>Taken under the Married Women&apos;s Property Act, 1874</span>
          </label>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">New nominees</h2>
          <span
            className={`text-sm font-semibold ${
              Math.abs(enteredShareTotal - 100) < 0.01
                ? "text-[var(--success)]"
                : "text-[var(--danger)]"
            }`}
          >
            {NUM2.format(enteredShareTotal)}% of 100% allocated
          </span>
        </div>

        <div className="mt-4 grid gap-4">
          {nominees.map((row, index) => (
            <fieldset
              key={row.id}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
            >
              <legend className="px-1 text-sm font-semibold">Nominee {index + 1}</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`inc-name-${row.id}`}>
                    Full name
                  </label>
                  <input
                    id={`inc-name-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={row.name}
                    onChange={(event) => setNominee(row.id, "name", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`inc-rel-${row.id}`}>
                    Relationship
                  </label>
                  <select
                    id={`inc-rel-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={row.relationshipId}
                    onChange={(event) => setNominee(row.id, "relationshipId", event.target.value)}
                  >
                    {RELATIONSHIPS.map((relationship) => (
                      <option key={relationship.id} value={relationship.id}>
                        {relationship.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`inc-dob-${row.id}`}>
                    Date of birth
                  </label>
                  <input
                    id={`inc-dob-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="date"
                    value={row.dob}
                    onChange={(event) => setNominee(row.id, "dob", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`inc-share-${row.id}`}>
                    Share (%)
                  </label>
                  <input
                    id={`inc-share-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="100"
                    step="1"
                    value={row.sharePercent}
                    onChange={(event) => setNominee(row.id, "sharePercent", event.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`inc-addr-${row.id}`}>
                    Address
                  </label>
                  <input
                    id={`inc-addr-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={row.address}
                    onChange={(event) => setNominee(row.id, "address", event.target.value)}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeNominee(row.id)}
                disabled={nominees.length <= 1}
                aria-label={`Remove nominee ${index + 1}`}
                className={`mt-3 ${GHOST_BTN} disabled:opacity-40`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Remove
              </button>
            </fieldset>
          ))}
        </div>

        <button
          type="button"
          onClick={addNominee}
          disabled={nominees.length >= MAX_NOMINEES}
          aria-label="Add another nominee"
          className={`mt-4 ${GHOST_BTN} disabled:opacity-40`}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add nominee
        </button>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="inc-appointee">
              Appointee (required if any nominee is a minor)
            </label>
            <input
              id="inc-appointee"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.appointeeName}
              onChange={(event) => set("appointeeName", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="inc-appointee-rel">
              Appointee&apos;s relationship to you
            </label>
            <input
              id="inc-appointee-rel"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.appointeeRelationship}
              onChange={(event) => set("appointeeRelationship", event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Shares allocated
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM2.format(result.shareTotal)}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the problem below to generate the letter"
                : `Across ${result.nomineeCount} nominee${result.nomineeCount === 1 ? "" : "s"} of ${INR.format(result.sumAssured)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the nomination change letter"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy letter"}
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

        {!hasError && (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Nominee</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Relationship</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Age</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Share</th>
                  <th scope="col" className="py-2 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {result.nominees.map((nominee) => (
                  <tr key={nominee.name} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{nominee.name}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                      {nominee.relationshipLabel}
                      {nominee.beneficial ? " (beneficial)" : ""}
                    </td>
                    <td className="py-2 pr-3 text-right">
                      {nominee.age}
                      {nominee.minor ? ` (18 on ${nominee.majorityLabel})` : ""}
                    </td>
                    <td className="py-2 pr-3 text-right">{NUM2.format(nominee.sharePercent)}%</td>
                    <td className="py-2 text-right font-semibold">{INR.format(nominee.payout)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

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
          <h2 className="text-base font-semibold">Nomination change letter</h2>
          <div className="mt-3 overflow-x-auto">
            <pre className="min-w-full whitespace-pre-wrap break-words font-sans text-sm leading-6">
              {result.letterText}
            </pre>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational template only, not legal or financial advice. Statutory references are to the
        Insurance Act, 1938 as amended in 2015 and apply to policies issued in India. A nomination is
        not a will {DASH} it says who receives the money, not always who is entitled to keep it, so
        take advice from a qualified professional where the estate is contested or complex.
      </p>
    </main>
  );
}
