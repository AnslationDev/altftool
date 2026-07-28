"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Video } from "lucide-react";

import {
  COMPENSATION_TYPES,
  DEFAULT_WITHDRAWAL_NOTICE_DAYS,
  MEDIA_CHANNELS,
  TERRITORIES,
  buildVideoTestimonialConsent,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");

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

const DEFAULTS = {
  participantName: "Ananya Rao",
  participantEmail: "ananya@example.com",
  jobTitle: "Head of Operations, Northwind Foods",
  companyName: "Brightloop Software Pvt Ltd",
  companyAddress: "4th Floor, MG Road, Bengaluru 560001",
  recordingDescription: "90-second customer story filmed at the Bengaluru office",
  recordingDate: "2026-07-10",
  effectiveDate: "2026-07-28",
  channels: ["website", "social", "sales"],
  territoryId: "worldwide",
  termYears: "3",
  perpetual: false,
  compensationType: "none",
  compensationDetail: "",
  privacyContact: "privacy@brightloop.example",
  isMinor: false,
  guardianName: "",
  allowEditing: true,
  allowNameUse: true,
  allowEmployerUse: true,
  allowSublicensing: false,
  withdrawalNoticeDays: String(DEFAULT_WITHDRAWAL_NOTICE_DAYS),
};

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleChannel = (id) =>
    setForm((prev) => ({
      ...prev,
      channels: prev.channels.includes(id)
        ? prev.channels.filter((item) => item !== id)
        : [...prev.channels, id],
    }));

  const result = useMemo(
    () =>
      buildVideoTestimonialConsent({
        ...form,
        termYears: form.termYears === "" ? NaN : Number(form.termYears),
        withdrawalNoticeDays:
          form.withdrawalNoticeDays === "" ? NaN : Number(form.withdrawalNoticeDays),
      }),
    [form],
  );

  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.documentText);
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
        ["Channels permitted", DASH],
        ["Territory", DASH],
        ["Licence term", DASH],
        ["Consent expires", DASH],
        ["Withdrawal notice", DASH],
        ["Signed by", DASH],
        ["Form length", DASH],
      ]
    : [
        ["Channels permitted", `${result.channelCount} of ${MEDIA_CHANNELS.length}`],
        ["Territory", result.territoryLabel],
        [
          "Licence term",
          result.perpetual
            ? "Perpetual"
            : `${result.termYears} year${result.termYears === 1 ? "" : "s"} (${NUM.format(result.termDays)} days)`,
        ],
        ["Consent expires", result.expiryLabel],
        ["Withdrawal notice", result.noticeDays === 0 ? "Immediate" : `${result.noticeDays} days`],
        ["Signed by", result.signerLine],
        ["Form length", `${NUM.format(result.wordCount)} words`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Video className="h-4 w-4" aria-hidden="true" />
          Consent forms
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Video Testimonial Consent Form Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Write a release that names the exact channels, territory and licence term the customer is
          agreeing to, plus a working withdrawal route {DASH} the four things a permission needs to
          survive a later dispute.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">People and recording</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="vtc-participant">
              Participant name
            </label>
            <input
              id="vtc-participant"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.participantName}
              onChange={(event) => set("participantName", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vtc-email">
              Participant email
            </label>
            <input
              id="vtc-email"
              className={`mt-2 ${INPUT_CLASS}`}
              type="email"
              value={form.participantEmail}
              onChange={(event) => set("participantEmail", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vtc-role">
              Role and employer shown on screen
            </label>
            <input
              id="vtc-role"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.jobTitle}
              onChange={(event) => set("jobTitle", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vtc-company">
              Your company name
            </label>
            <input
              id="vtc-company"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.companyName}
              onChange={(event) => set("companyName", event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="vtc-address">
              Company registered address
            </label>
            <input
              id="vtc-address"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.companyAddress}
              onChange={(event) => set("companyAddress", event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="vtc-description">
              What the recording is
            </label>
            <input
              id="vtc-description"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.recordingDescription}
              onChange={(event) => set("recordingDescription", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vtc-recorded">
              Recording date
            </label>
            <input
              id="vtc-recorded"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.recordingDate}
              onChange={(event) => set("recordingDate", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vtc-effective">
              Signature date
            </label>
            <input
              id="vtc-effective"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.effectiveDate}
              onChange={(event) => set("effectiveDate", event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          <label className={CHECK_ROW} htmlFor="vtc-minor">
            <input
              id="vtc-minor"
              className={CHECKBOX}
              type="checkbox"
              checked={form.isMinor}
              onChange={(event) => set("isMinor", event.target.checked)}
            />
            <span>Participant is under 18 {DASH} a parent or guardian signs</span>
          </label>
          {form.isMinor && (
            <div>
              <label className={LABEL_CLASS} htmlFor="vtc-guardian">
                Parent or legal guardian name
              </label>
              <input
                id="vtc-guardian"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                value={form.guardianName}
                onChange={(event) => set("guardianName", event.target.value)}
              />
            </div>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Where it may appear</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Tick only the channels you will actually use. Anything not ticked is excluded by the form.
        </p>
        <fieldset className="mt-4 grid gap-3 sm:grid-cols-2">
          <legend className="sr-only">Permitted media channels</legend>
          {MEDIA_CHANNELS.map((channel) => (
            <label key={channel.id} className={CHECK_ROW} htmlFor={`vtc-ch-${channel.id}`}>
              <input
                id={`vtc-ch-${channel.id}`}
                className={CHECKBOX}
                type="checkbox"
                checked={form.channels.includes(channel.id)}
                onChange={() => toggleChannel(channel.id)}
              />
              <span>{channel.label}</span>
            </label>
          ))}
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="vtc-territory">
              Territory
            </label>
            <select
              id="vtc-territory"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.territoryId}
              onChange={(event) => set("territoryId", event.target.value)}
            >
              {TERRITORIES.map((territory) => (
                <option key={territory.id} value={territory.id}>
                  {territory.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vtc-term">
              Licence term (years)
            </label>
            <input
              id="vtc-term"
              className={`mt-2 ${INPUT_CLASS} disabled:opacity-50`}
              type="number"
              inputMode="numeric"
              min="1"
              max="25"
              step="1"
              disabled={form.perpetual}
              value={form.termYears}
              onChange={(event) => set("termYears", event.target.value)}
            />
          </div>
        </div>

        <label className={`mt-3 ${CHECK_ROW}`} htmlFor="vtc-perpetual">
          <input
            id="vtc-perpetual"
            className={CHECKBOX}
            type="checkbox"
            checked={form.perpetual}
            onChange={(event) => set("perpetual", event.target.checked)}
          />
          <span>Perpetual licence (no expiry date)</span>
        </label>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Terms</h2>
        <div className="mt-4 grid gap-3">
          <label className={CHECK_ROW} htmlFor="vtc-name-use">
            <input
              id="vtc-name-use"
              className={CHECKBOX}
              type="checkbox"
              checked={form.allowNameUse}
              onChange={(event) => set("allowNameUse", event.target.checked)}
            />
            <span>Show the participant&apos;s full name</span>
          </label>
          <label className={CHECK_ROW} htmlFor="vtc-employer-use">
            <input
              id="vtc-employer-use"
              className={CHECKBOX}
              type="checkbox"
              checked={form.allowEmployerUse}
              onChange={(event) => set("allowEmployerUse", event.target.checked)}
            />
            <span>Show their job title and employer</span>
          </label>
          <label className={CHECK_ROW} htmlFor="vtc-editing">
            <input
              id="vtc-editing"
              className={CHECKBOX}
              type="checkbox"
              checked={form.allowEditing}
              onChange={(event) => set("allowEditing", event.target.checked)}
            />
            <span>Allow editing beyond trimming and captions</span>
          </label>
          <label className={CHECK_ROW} htmlFor="vtc-sublicense">
            <input
              id="vtc-sublicense"
              className={CHECKBOX}
              type="checkbox"
              checked={form.allowSublicensing}
              onChange={(event) => set("allowSublicensing", event.target.checked)}
            />
            <span>Allow agencies, resellers and media partners to reuse it</span>
          </label>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="vtc-compensation">
              Consideration
            </label>
            <select
              id="vtc-compensation"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.compensationType}
              onChange={(event) => set("compensationType", event.target.value)}
            >
              {COMPENSATION_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vtc-notice">
              Withdrawal notice (days)
            </label>
            <input
              id="vtc-notice"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="180"
              step="1"
              value={form.withdrawalNoticeDays}
              onChange={(event) => set("withdrawalNoticeDays", event.target.value)}
            />
          </div>
          {form.compensationType !== "none" && (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="vtc-comp-detail">
                What exactly is given
              </label>
              <input
                id="vtc-comp-detail"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                placeholder="e.g. one-time fee of INR 15,000"
                value={form.compensationDetail}
                onChange={(event) => set("compensationDetail", event.target.value)}
              />
            </div>
          )}
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="vtc-privacy">
              Contact for withdrawal and data requests
            </label>
            <input
              id="vtc-privacy"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.privacyContact}
              onChange={(event) => set("privacyContact", event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Form completeness
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.completenessPercent}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the problem below to generate the form"
                : `${result.completenessFilled} of ${result.completenessTotal} optional detail fields filled`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated consent form"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy form"}
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
          <h2 className="text-base font-semibold">{result.title}</h2>
          <div className="mt-3 overflow-x-auto">
            <pre className="min-w-full whitespace-pre-wrap break-words font-sans text-sm leading-6 text-[var(--foreground)]">
              {result.documentText}
            </pre>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational template only, not legal advice. Publicity, personality and data-protection
        rules differ by country and by state {DASH} have a qualified lawyer review the wording before
        you use it with customers.
      </p>
    </main>
  );
}
