"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MailX, RotateCcw, TriangleAlert } from "lucide-react";

import { CHANNELS, HANDLING_OPTIONS, REGIMES, buildOptOutRequest } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm";
const DASH = "—";

const DEFAULTS = {
  fullName: "A. Sharma",
  email: "a.sharma@example.com",
  phone: "+91 90000 00000",
  postalAddress: "12 New Mill Lane, Pune 411001",
  organisation: "Kettle & Co",
  channels: ["email", "sms"],
  regime: "gdpr",
  requestDate: "2026-07-28",
  handling: "suppress",
  notifyPartners: true,
  keepServiceMessages: true,
};

export default function ToolHome() {
  const [fullName, setFullName] = useState(DEFAULTS.fullName);
  const [email, setEmail] = useState(DEFAULTS.email);
  const [phone, setPhone] = useState(DEFAULTS.phone);
  const [postalAddress, setPostalAddress] = useState(DEFAULTS.postalAddress);
  const [organisation, setOrganisation] = useState(DEFAULTS.organisation);
  const [channels, setChannels] = useState(DEFAULTS.channels);
  const [regime, setRegime] = useState(DEFAULTS.regime);
  const [requestDate, setRequestDate] = useState(DEFAULTS.requestDate);
  const [handling, setHandling] = useState(DEFAULTS.handling);
  const [notifyPartners, setNotifyPartners] = useState(DEFAULTS.notifyPartners);
  const [keepServiceMessages, setKeepServiceMessages] = useState(DEFAULTS.keepServiceMessages);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildOptOutRequest({
        fullName,
        email,
        phone,
        postalAddress,
        organisation,
        channels,
        regime,
        requestDate,
        handling,
        notifyPartners,
        keepServiceMessages,
      }),
    [
      fullName,
      email,
      phone,
      postalAddress,
      organisation,
      channels,
      regime,
      requestDate,
      handling,
      notifyPartners,
      keepServiceMessages,
    ],
  );

  const hasError = Boolean(result.error);

  const toggleChannel = (id) => {
    setChannels((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(`${result.subject}\n\n${result.letter}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setFullName(DEFAULTS.fullName);
    setEmail(DEFAULTS.email);
    setPhone(DEFAULTS.phone);
    setPostalAddress(DEFAULTS.postalAddress);
    setOrganisation(DEFAULTS.organisation);
    setChannels(DEFAULTS.channels);
    setRegime(DEFAULTS.regime);
    setRequestDate(DEFAULTS.requestDate);
    setHandling(DEFAULTS.handling);
    setNotifyPartners(DEFAULTS.notifyPartners);
    setKeepServiceMessages(DEFAULTS.keepServiceMessages);
    setCopied(false);
  };

  const textFields = [
    ["out-name", "Your full name", fullName, setFullName, "text"],
    ["out-org", "Organisation sending the marketing", organisation, setOrganisation, "text"],
    ["out-email", "Email they message", email, setEmail, "email"],
    ["out-phone", "Phone number they use", phone, setPhone, "tel"],
    ["out-address", "Postal address they mail", postalAddress, setPostalAddress, "text"],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <MailX className="h-4 w-4" aria-hidden="true" />
          Data rights
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Marketing Opt-Out Request Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Object to direct marketing across email, SMS and calls in one letter, with the deadline
          each law actually gives the sender on each channel.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {textFields.map(([id, label, value, setter, type]) => (
            <div key={id}>
              <label className={LABEL_CLASS} htmlFor={id}>
                {label}
              </label>
              <input
                id={id}
                className={`mt-2 ${INPUT_CLASS}`}
                type={type}
                value={value}
                onChange={(event) => setter(event.target.value)}
              />
            </div>
          ))}
          <div>
            <label className={LABEL_CLASS} htmlFor="out-regime">
              Applicable law
            </label>
            <select
              id="out-regime"
              className={`mt-2 ${INPUT_CLASS}`}
              value={regime}
              onChange={(event) => setRegime(event.target.value)}
            >
              {REGIMES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="out-date">
              Date you send the objection
            </label>
            <input
              id="out-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={requestDate}
              onChange={(event) => setRequestDate(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="out-handling">
              What they should do with your record
            </label>
            <select
              id="out-handling"
              className={`mt-2 ${INPUT_CLASS}`}
              value={handling}
              onChange={(event) => setHandling(event.target.value)}
            >
              {HANDLING_OPTIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
              {HANDLING_OPTIONS.find((item) => item.id === handling)?.note}
            </p>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">Channels to stop</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {CHANNELS.map((item) => (
              <label key={item.id} className={CHECK_ROW} htmlFor={`out-chan-${item.id}`}>
                <input
                  id={`out-chan-${item.id}`}
                  type="checkbox"
                  className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={channels.includes(item.id)}
                  onChange={() => toggleChannel(item.id)}
                />
                <span className="font-semibold">{item.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <label className={CHECK_ROW} htmlFor="out-partners">
            <input
              id="out-partners"
              type="checkbox"
              className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
              checked={notifyPartners}
              onChange={(event) => setNotifyPartners(event.target.checked)}
            />
            <span>Ask who my details were shared with, and pass the objection on</span>
          </label>
          <label className={CHECK_ROW} htmlFor="out-service">
            <input
              id="out-service"
              type="checkbox"
              className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
              checked={keepServiceMessages}
              onChange={(event) => setKeepServiceMessages(event.target.checked)}
            />
            <span>Keep sending service messages (orders, delivery, security)</span>
          </label>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Marketing must stop by
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.latestStop}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Complete the form to generate the objection."
                : `across ${result.stats.channelCount} channel${result.stats.channelCount === 1 ? "" : "s"}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the marketing opt-out request"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy request"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Right relied on", hasError ? DASH : result.right],
            ["Channels covered", hasError ? DASH : String(result.stats.channelCount)],
            ["Channels missing an identifier", hasError ? DASH : String(result.stats.channelsMissingIdentifier)],
            ["Written confirmation due by", hasError ? DASH : result.confirmBy || "No fixed statutory date"],
            ["Handling requested", hasError ? DASH : result.handlingLabel],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Deadline per channel</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Channel</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Details given</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Stop by</th>
                  <th scope="col" className="py-2 font-semibold">Rule</th>
                </tr>
              </thead>
              <tbody>
                {result.channelRows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] align-top last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.label}</td>
                    <td className="py-2 pr-3 break-words text-[var(--muted-foreground)]">
                      {row.identifier || "Not supplied"}
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap font-semibold">{row.stopBy}</td>
                    <td className="py-2 leading-6 text-[var(--muted-foreground)]">{row.rule}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Objection letter</h2>
          <p className="mt-2 text-sm font-medium">Subject: {result.subject}</p>
          <div className="mt-3 overflow-x-auto">
            <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-[var(--foreground)]">
              {result.letter}
            </pre>
          </div>
        </section>
      ) : null}

      {!hasError && result.warnings.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <TriangleAlert className="h-4 w-4 text-[var(--danger)]" aria-hidden="true" />
            Before you send it
          </h2>
          <ul className="mt-3 space-y-2 text-sm leading-6">
            {result.warnings.map((warning) => (
              <li
                key={warning}
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-[var(--danger)]"
              >
                {warning}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational template, not legal advice. Business-day deadlines skip weekends only and do
        not account for public holidays. Nothing you type here leaves your browser.
      </p>
    </main>
  );
}
