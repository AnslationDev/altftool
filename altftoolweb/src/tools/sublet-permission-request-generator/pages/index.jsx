"use client";

import { useMemo, useState } from "react";
import { Check, Copy, KeyRound, RotateCcw } from "lucide-react";

import {
  DEFAULT_REPLY_DAYS,
  ID_PROOFS,
  SUBLET_TYPES,
  USE_PURPOSES,
  buildSubletRequest,
} from "../lib";

const DASH = "—";

const DATE_FMT = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const COUNT = new Intl.NumberFormat("en-IN");

const prettyDate = (value) => {
  if (!value) return DASH;
  const parsed = Date.parse(`${value}T00:00:00Z`);
  return Number.isNaN(parsed) ? DASH : DATE_FMT.format(new Date(parsed));
};

const todayIso = () => new Date().toISOString().slice(0, 10);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "min-h-24 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none";

const DEFAULTS = {
  tenantName: "Rhea Menon",
  tenantAddress: "Flat 402, Sunrise CHS, Powai, Mumbai 400076",
  tenantPhone: "+91 98200 11111",
  tenantEmail: "rhea@example.com",
  landlordName: "Mr. Anil Shah",
  landlordAddress: "12 Hill Road, Bandra West, Mumbai 400050",
  propertyAddress: "Flat 402, Sunrise CHS, Powai, Mumbai 400076",
  agreementDate: "2025-04-01",
  agreementEndDate: "2027-03-31",
  monthlyRent: "INR 42,000 per month",
  subletType: "part",
  portionDescription: "The second bedroom with attached bathroom",
  subTenantName: "Ms. Kavya Rao",
  subTenantOccupation: "Software engineer",
  subTenantIdProof: "Passport",
  usePurpose: "residential",
  startDate: "2026-09-01",
  endDate: "2027-02-28",
  subletRent: "INR 18,000 per month",
  reason: "I am on a six month overseas assignment and want the flat occupied and maintained.",
  replyDays: String(DEFAULT_REPLY_DAYS),
  place: "Mumbai",
};

const DEFAULT_FLAGS = {
  remainLiable: true,
  rentUnchanged: true,
  supplementaryAgreement: true,
  policeVerification: true,
  intimateSociety: true,
};

export default function ToolHome() {
  const [form, setForm] = useState(() => ({ ...DEFAULTS, letterDate: todayIso() }));
  const [flags, setFlags] = useState(DEFAULT_FLAGS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const toggle = (key) => (event) =>
    setFlags((current) => ({ ...current, [key]: event.target.checked }));

  const result = useMemo(
    () => buildSubletRequest({ ...form, ...flags, replyDays: Number(form.replyDays) }),
    [form, flags],
  );

  const ok = !result.error;

  const copyLetter = async () => {
    if (!ok) return;
    try {
      await navigator.clipboard.writeText(result.letter);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm({ ...DEFAULTS, letterDate: todayIso() });
    setFlags(DEFAULT_FLAGS);
    setCopied(false);
  };

  const needsPortion = form.subletType === "part" || form.subletType === "payingGuest";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--primary)] uppercase">
          <KeyRound className="h-4 w-4" aria-hidden="true" />
          Tenancy documents
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Sublet Permission Request Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Most written leases contract out of section 108(j) of the Transfer of Property Act and bar
          sub-letting without the landlord&apos;s written consent. This builds that request — the
          proposal, your undertakings and a dated reply deadline — in one page you can send.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Parties and premises</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="spr-tenant">
              Your full name
            </label>
            <input
              id="spr-tenant"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.tenantName}
              onChange={set("tenantName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="spr-landlord">
              Landlord&apos;s name
            </label>
            <input
              id="spr-landlord"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.landlordName}
              onChange={set("landlordName")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="spr-property">
              Address of the premises
            </label>
            <input
              id="spr-property"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.propertyAddress}
              onChange={set("propertyAddress")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="spr-landlord-addr">
              Landlord&apos;s address
            </label>
            <input
              id="spr-landlord-addr"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.landlordAddress}
              onChange={set("landlordAddress")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="spr-phone">
              Your phone
            </label>
            <input
              id="spr-phone"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.tenantPhone}
              onChange={set("tenantPhone")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="spr-email">
              Your email
            </label>
            <input
              id="spr-email"
              className={`mt-2 ${INPUT_CLASS}`}
              type="email"
              value={form.tenantEmail}
              onChange={set("tenantEmail")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="spr-agr-date">
              Tenancy agreement dated
            </label>
            <input
              id="spr-agr-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.agreementDate}
              onChange={set("agreementDate")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="spr-agr-end">
              Your tenancy expires on
            </label>
            <input
              id="spr-agr-end"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.agreementEndDate}
              onChange={set("agreementEndDate")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="spr-rent">
              Your current rent (as you want it written)
            </label>
            <input
              id="spr-rent"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.monthlyRent}
              onChange={set("monthlyRent")}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">What you are asking for</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="spr-type">
              Type of arrangement
            </label>
            <select
              id="spr-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.subletType}
              onChange={set("subletType")}
            >
              {SUBLET_TYPES.map((type) => (
                <option key={type.key} value={type.key}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="spr-purpose">
              Intended use
            </label>
            <select
              id="spr-purpose"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.usePurpose}
              onChange={set("usePurpose")}
            >
              {USE_PURPOSES.map((purpose) => (
                <option key={purpose.key} value={purpose.key}>
                  {purpose.label}
                </option>
              ))}
            </select>
          </div>
          {needsPortion ? (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="spr-portion">
                Which portion
              </label>
              <input
                id="spr-portion"
                className={`mt-2 ${INPUT_CLASS}`}
                value={form.portionDescription}
                onChange={set("portionDescription")}
              />
            </div>
          ) : null}
          <div>
            <label className={LABEL_CLASS} htmlFor="spr-sub">
              Proposed occupant&apos;s name
            </label>
            <input
              id="spr-sub"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.subTenantName}
              onChange={set("subTenantName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="spr-occupation">
              Their occupation
            </label>
            <input
              id="spr-occupation"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.subTenantOccupation}
              onChange={set("subTenantOccupation")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="spr-id">
              Identity proof they will furnish
            </label>
            <select
              id="spr-id"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.subTenantIdProof}
              onChange={set("subTenantIdProof")}
            >
              {ID_PROOFS.map((proof) => (
                <option key={proof} value={proof}>
                  {proof}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="spr-subrent">
              Amount the occupant will pay
            </label>
            <input
              id="spr-subrent"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.subletRent}
              onChange={set("subletRent")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="spr-start">
              Proposed start date
            </label>
            <input
              id="spr-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.startDate}
              onChange={set("startDate")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="spr-end">
              Proposed end date
            </label>
            <input
              id="spr-end"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.endDate}
              onChange={set("endDate")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="spr-reason">
              Why you are asking
            </label>
            <textarea
              id="spr-reason"
              className={`mt-2 ${AREA_CLASS}`}
              value={form.reason}
              onChange={set("reason")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="spr-letterdate">
              Date of the letter
            </label>
            <input
              id="spr-letterdate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.letterDate}
              onChange={set("letterDate")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="spr-place">
              Place
            </label>
            <input
              id="spr-place"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.place}
              onChange={set("place")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="spr-replydays">
              Reply requested within (days)
            </label>
            <input
              id="spr-replydays"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="90"
              step="1"
              value={form.replyDays}
              onChange={set("replyDays")}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">Undertakings to include</legend>
          <div className="mt-2 space-y-1">
            {[
              ["remainLiable", "I stay liable for rent and every other lease obligation"],
              ["rentUnchanged", "No change to rent, deposit or any other term"],
              [
                "supplementaryAgreement",
                "Willing to sign a supplementary agreement (Model Tenancy Act s.8)",
              ],
              ["policeVerification", "Will arrange police verification of the occupant"],
              ["intimateSociety", "Will give the society the occupant's details"],
            ].map(([key, label]) => (
              <label key={key} className="flex min-h-11 items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                  checked={flags[key]}
                  onChange={toggle(key)}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[var(--muted-foreground)] uppercase">
              Reply requested by
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {ok ? prettyDate(result.replyBy) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${COUNT.format(result.wordCount)} words · ${
                    result.complete
                      ? "all required fields filled"
                      : `${result.missing.length} field(s) still missing`
                  }`
                : "Fix the input above to build the letter"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyLetter}
              aria-label="Copy the sublet permission request letter"
              className={GHOST_BTN}
              disabled={!ok}
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
              aria-label="Reset the form"
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
              "Sub-letting period",
              ok && result.duration ? `${COUNT.format(result.duration.days)} days` : DASH,
            ],
            [
              "Approximate months",
              ok && result.duration ? `${result.duration.approxMonths} months` : DASH,
            ],
            ["Reply window", ok ? `${result.replyDays} days` : DASH],
            ["Letter length", ok ? `${COUNT.format(result.characterCount)} characters` : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && result.missing.length > 0 ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            Still to fill in: {result.missing.join(", ")}.
          </p>
        ) : null}
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Your letter</h2>
          <div className="mt-3 overflow-x-auto">
            <pre className="w-full font-sans text-sm leading-6 whitespace-pre-wrap text-[var(--foreground)]">
              {result.letter}
            </pre>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. Sub-letting without consent is a ground for eviction
        under most state Rent Acts, and the Model Tenancy Act, 2021 applies only where a state has
        enacted it. Read your own agreement and have a lawyer review the wording before you send it.
      </p>
    </main>
  );
}
