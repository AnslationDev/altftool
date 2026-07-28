"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileSearch, RotateCcw } from "lucide-react";

import { DELIVERY_FORMATS, REGIMES, SCOPE_ITEMS, buildAccessRequest } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  regimeId: "eu-gdpr",
  sentDate: "2026-08-03",
  fullName: "Asha Rao",
  email: "asha.rao@example.com",
  postalAddress: "",
  identifiers: "Customer ID 88421\nAccount email asha.rao@example.com",
  companyName: "Northgate Retail Limited",
  companyContact: "privacy@northgate.example",
  scopeIds: ["copy", "purposes", "categories", "recipients", "retention", "source"],
  deliveryId: "electronic",
  periodFrom: "",
  extraDetail: "",
};

export default function ToolHome() {
  const [regimeId, setRegimeId] = useState(DEFAULTS.regimeId);
  const [sentDate, setSentDate] = useState(DEFAULTS.sentDate);
  const [fullName, setFullName] = useState(DEFAULTS.fullName);
  const [email, setEmail] = useState(DEFAULTS.email);
  const [postalAddress, setPostalAddress] = useState(DEFAULTS.postalAddress);
  const [identifiers, setIdentifiers] = useState(DEFAULTS.identifiers);
  const [companyName, setCompanyName] = useState(DEFAULTS.companyName);
  const [companyContact, setCompanyContact] = useState(DEFAULTS.companyContact);
  const [scopeIds, setScopeIds] = useState(DEFAULTS.scopeIds);
  const [deliveryId, setDeliveryId] = useState(DEFAULTS.deliveryId);
  const [periodFrom, setPeriodFrom] = useState(DEFAULTS.periodFrom);
  const [extraDetail, setExtraDetail] = useState(DEFAULTS.extraDetail);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildAccessRequest({
        regimeId,
        sentDate,
        fullName,
        email,
        postalAddress,
        identifiers,
        companyName,
        companyContact,
        scopeIds,
        deliveryId,
        periodFrom,
        extraDetail,
      }),
    [
      regimeId,
      sentDate,
      fullName,
      email,
      postalAddress,
      identifiers,
      companyName,
      companyContact,
      scopeIds,
      deliveryId,
      periodFrom,
      extraDetail,
    ],
  );

  const hasError = Boolean(result.error);

  const toggleScope = (id) => {
    setScopeIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const copyLetter = async () => {
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
    setRegimeId(DEFAULTS.regimeId);
    setSentDate(DEFAULTS.sentDate);
    setFullName(DEFAULTS.fullName);
    setEmail(DEFAULTS.email);
    setPostalAddress(DEFAULTS.postalAddress);
    setIdentifiers(DEFAULTS.identifiers);
    setCompanyName(DEFAULTS.companyName);
    setCompanyContact(DEFAULTS.companyContact);
    setScopeIds(DEFAULTS.scopeIds);
    setDeliveryId(DEFAULTS.deliveryId);
    setPeriodFrom(DEFAULTS.periodFrom);
    setExtraDetail(DEFAULTS.extraDetail);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <FileSearch className="h-4 w-4" aria-hidden="true" />
          Data Rights
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Data Access Request Letter Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Drafts a subject access request under the EU GDPR, UK GDPR, India&rsquo;s DPDP Act or the
          California CCPA, cites the sub-article behind every item you ask for, and works out the
          date the reply falls due.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="dar-regime">
              Law you are relying on
            </label>
            <select
              id="dar-regime"
              className={`mt-2 ${INPUT_CLASS}`}
              value={regimeId}
              onChange={(event) => setRegimeId(event.target.value)}
            >
              {REGIMES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dar-sent">
              Date you are sending the request
            </label>
            <input
              id="dar-sent"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={sentDate}
              onChange={(event) => setSentDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dar-period">
              Data from (optional)
            </label>
            <input
              id="dar-period"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={periodFrom}
              onChange={(event) => setPeriodFrom(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dar-name">
              Your full name
            </label>
            <input
              id="dar-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dar-email">
              Your reply-to email
            </label>
            <input
              id="dar-email"
              className={`mt-2 ${INPUT_CLASS}`}
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dar-company">
              Organisation you are writing to
            </label>
            <input
              id="dar-company"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dar-contact">
              Privacy team or DPO contact
            </label>
            <input
              id="dar-contact"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={companyContact}
              onChange={(event) => setCompanyContact(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="dar-delivery">
              How you want the copy delivered
            </label>
            <select
              id="dar-delivery"
              className={`mt-2 ${INPUT_CLASS}`}
              value={deliveryId}
              onChange={(event) => setDeliveryId(event.target.value)}
            >
              {DELIVERY_FORMATS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="dar-ids">
              Identifiers they hold for you (one per line)
            </label>
            <textarea
              id="dar-ids"
              className={`mt-2 ${AREA_CLASS}`}
              rows={3}
              value={identifiers}
              onChange={(event) => setIdentifiers(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="dar-post">
              Postal address (needed only for a printed copy)
            </label>
            <textarea
              id="dar-post"
              className={`mt-2 ${AREA_CLASS}`}
              rows={3}
              value={postalAddress}
              onChange={(event) => setPostalAddress(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="dar-extra">
              Specific records you want (optional)
            </label>
            <textarea
              id="dar-extra"
              className={`mt-2 ${AREA_CLASS}`}
              rows={3}
              placeholder="Call recordings from June 2026, chat transcripts with support, delivery photographs"
              value={extraDetail}
              onChange={(event) => setExtraDetail(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            What to request
          </legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {SCOPE_ITEMS.map((item) => (
              <label
                key={item.id}
                htmlFor={`dar-scope-${item.id}`}
                className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm leading-6"
              >
                <input
                  id={`dar-scope-${item.id}`}
                  type="checkbox"
                  className="mt-1.5 h-4 w-4 accent-[var(--primary)]"
                  checked={scopeIds.includes(item.id)}
                  onChange={() => toggleScope(item.id)}
                />
                <span>
                  {item.label}
                  <span className="block text-xs text-[var(--muted-foreground)]">
                    {regimeId === "us-ccpa" ? item.ccpa || "No direct CCPA equivalent" : item.gdpr}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {hasError ? (
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
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Response due by
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.dueLong}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : `${result.dueDays} days from ${result.sentLong} · ${result.statutory ? "statutory deadline" : "requested, not statutory"}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyLetter}
              disabled={hasError}
              aria-label="Copy the data access request letter"
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
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-[var(--muted-foreground)]">Right cited</dt>
            <dd className="mt-1 text-lg font-semibold">{hasError ? DASH : result.rightCited}</dd>
          </div>
          <div>
            <dt className="font-semibold text-[var(--muted-foreground)]">Items requested</dt>
            <dd className="mt-1 text-lg font-semibold">{hasError ? DASH : result.itemCount}</dd>
          </div>
          <div>
            <dt className="font-semibold text-[var(--muted-foreground)]">
              Latest date if extended
            </dt>
            <dd className="mt-1 leading-6">
              {hasError ? DASH : result.hasExtension ? result.extendedLong : "No extension allowed"}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[var(--muted-foreground)]">Receipt to be confirmed</dt>
            <dd className="mt-1 leading-6">
              {hasError ? DASH : (result.ackLong ?? "No separate acknowledgement deadline")}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="font-semibold text-[var(--muted-foreground)]">Escalate to</dt>
            <dd className="mt-1 leading-6">{hasError ? DASH : result.regulator}</dd>
          </div>
        </dl>

        {!hasError && result.notes.length > 0 ? (
          <ul className="mt-5 space-y-2">
            {result.notes.map((note) => (
              <li
                key={note}
                className="rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm leading-6 text-[var(--warning)]"
              >
                {note}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-5">
          <p className="text-sm font-semibold text-[var(--muted-foreground)]">Your letter</p>
          <p className="mt-1 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 whitespace-pre-wrap">
            {hasError ? DASH : result.letter}
          </p>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. Deadlines are counted from the date you send the
        request and assume it was received the same day; send by a method that proves delivery.
        Consult a qualified lawyer where the data matters to a dispute or a claim.
      </p>
    </main>
  );
}
