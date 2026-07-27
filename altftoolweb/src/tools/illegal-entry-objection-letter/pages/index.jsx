"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, ShieldAlert, Trash2 } from "lucide-react";

import {
  ENTRY_PURPOSES,
  ENTRY_WINDOW_END_HOUR,
  ENTRY_WINDOW_START_HOUR,
  MIN_NOTICE_HOURS,
  auditEntries,
  buildObjectionLetter,
  formatClock,
  formatLongDate,
  parseISODate,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const SMALL_LABEL = "block text-xs font-semibold text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const todayISO = () => new Date().toISOString().slice(0, 10);

const shiftISO = (iso, days) => {
  const date = parseISODate(iso);
  if (!date) return iso;
  return new Date(date.getTime() + days * 86400000).toISOString().slice(0, 10);
};

const buildDefaultEntries = () => {
  const today = todayISO();
  return [
    {
      id: 1,
      entryDate: shiftISO(today, -7),
      entryTime: "11:00",
      noticeGiven: false,
      noticeDate: shiftISO(today, -7),
      noticeTime: "09:00",
      tenantPresent: false,
      consentGiven: false,
      purpose: "inspection",
      note: "Entered with a spare key while I was at work",
    },
    {
      id: 2,
      entryDate: shiftISO(today, -2),
      entryTime: "21:00",
      noticeGiven: true,
      noticeDate: shiftISO(today, -2),
      noticeTime: "18:30",
      tenantPresent: true,
      consentGiven: false,
      purpose: "showing",
      note: "Brought a prospective tenant at night",
    },
  ];
};

const buildDefaults = () => ({
  letterDate: todayISO(),
  tenantName: "",
  landlordName: "",
  propertyAddress: "",
  agreementDate: "",
  contact: "",
  preferredWindow: "",
});

export default function ToolHome() {
  const [form, setForm] = useState(buildDefaults);
  const [entries, setEntries] = useState(buildDefaultEntries);
  const [copied, setCopied] = useState("");

  const set = (key) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied("");
  };

  const updateEntry = (id, key, value) => {
    setEntries((prev) => prev.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
    setCopied("");
  };

  const addEntry = () => {
    setEntries((prev) => {
      const nextId = prev.reduce((max, row) => Math.max(max, row.id), 0) + 1;
      return [
        ...prev,
        {
          id: nextId,
          entryDate: form.letterDate,
          entryTime: "10:00",
          noticeGiven: false,
          noticeDate: form.letterDate,
          noticeTime: "09:00",
          tenantPresent: false,
          consentGiven: false,
          purpose: "none",
          note: "",
        },
      ];
    });
    setCopied("");
  };

  const removeEntry = (id) => {
    setEntries((prev) => prev.filter((row) => row.id !== id));
    setCopied("");
  };

  const audit = useMemo(
    () => auditEntries({ entries, letterDate: form.letterDate }),
    [entries, form.letterDate],
  );

  const letter = useMemo(
    () =>
      buildObjectionLetter(audit, {
        tenantName: form.tenantName.trim() || "[Tenant name]",
        landlordName: form.landlordName.trim() || "[Landlord name]",
        propertyAddress: form.propertyAddress.trim() || "[Property address]",
        agreementDate: form.agreementDate,
        contact: form.contact,
        preferredWindow: form.preferredWindow,
      }),
    [audit, form],
  );

  const invalid = Boolean(audit.error);

  const copy = async (text, key) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const summary = invalid
    ? ""
    : [
        "Entry audit",
        `Entries logged: ${audit.total}`,
        `Entries in breach: ${audit.breachCount}`,
        `No written notice: ${audit.noNoticeCount}`,
        `Less than ${MIN_NOTICE_HOURS} hours' notice: ${audit.shortNoticeCount}`,
        `Outside ${ENTRY_WINDOW_START_HOUR} am to ${ENTRY_WINDOW_END_HOUR - 12} pm: ${audit.outOfHoursCount}`,
        `Entered in my absence: ${audit.absentCount}`,
        `Escalation level: ${audit.band.label}`,
      ].join("\n");

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ShieldAlert className="h-4 w-4" aria-hidden="true" />
          Tenancy notice
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Illegal Entry Objection Letter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Log each visit with its date, time and what notice you were given. Every entry is tested
          against the {MIN_NOTICE_HOURS}-hour written notice rule, the {ENTRY_WINDOW_START_HOUR} a.m.
          to {ENTRY_WINDOW_END_HOUR - 12} p.m. window and your consent.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Entry log</h2>
          <button type="button" onClick={addEntry} className={GHOST_BTN}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add entry
          </button>
        </div>

        <ul className="mt-4 space-y-4">
          {entries.map((row, index) => (
            <li key={row.id} className="rounded-lg border border-[var(--border)] p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                  Entry {index + 1}
                </p>
                <button
                  type="button"
                  onClick={() => removeEntry(row.id)}
                  aria-label={`Remove entry ${index + 1}`}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-md text-[var(--danger)] transition hover:bg-[var(--danger-soft)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={SMALL_LABEL} htmlFor={`ie-date-${row.id}`}>
                    Date of entry
                  </label>
                  <input
                    id={`ie-date-${row.id}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    type="date"
                    value={row.entryDate}
                    onChange={(event) => updateEntry(row.id, "entryDate", event.target.value)}
                  />
                </div>
                <div>
                  <label className={SMALL_LABEL} htmlFor={`ie-time-${row.id}`}>
                    Time of entry
                  </label>
                  <input
                    id={`ie-time-${row.id}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    type="time"
                    value={row.entryTime}
                    onChange={(event) => updateEntry(row.id, "entryTime", event.target.value)}
                  />
                </div>
                <div>
                  <label className={SMALL_LABEL} htmlFor={`ie-purpose-${row.id}`}>
                    Stated purpose
                  </label>
                  <select
                    id={`ie-purpose-${row.id}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    value={row.purpose}
                    onChange={(event) => updateEntry(row.id, "purpose", event.target.value)}
                  >
                    {ENTRY_PURPOSES.map((purpose) => (
                      <option key={purpose.id} value={purpose.id}>
                        {purpose.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={SMALL_LABEL} htmlFor={`ie-note-${row.id}`}>
                    What happened (optional)
                  </label>
                  <input
                    id={`ie-note-${row.id}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    type="text"
                    value={row.note}
                    onChange={(event) => updateEntry(row.id, "note", event.target.value)}
                    placeholder="Used a spare key while I was at work"
                  />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
                <label
                  className="flex min-h-11 items-center gap-2 text-sm"
                  htmlFor={`ie-notice-${row.id}`}
                >
                  <input
                    id={`ie-notice-${row.id}`}
                    type="checkbox"
                    className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                    checked={row.noticeGiven}
                    onChange={(event) => updateEntry(row.id, "noticeGiven", event.target.checked)}
                  />
                  Written notice was given
                </label>
                <label
                  className="flex min-h-11 items-center gap-2 text-sm"
                  htmlFor={`ie-present-${row.id}`}
                >
                  <input
                    id={`ie-present-${row.id}`}
                    type="checkbox"
                    className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                    checked={row.tenantPresent}
                    onChange={(event) => updateEntry(row.id, "tenantPresent", event.target.checked)}
                  />
                  I was present
                </label>
                <label
                  className="flex min-h-11 items-center gap-2 text-sm"
                  htmlFor={`ie-consent-${row.id}`}
                >
                  <input
                    id={`ie-consent-${row.id}`}
                    type="checkbox"
                    className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                    checked={row.consentGiven}
                    onChange={(event) => updateEntry(row.id, "consentGiven", event.target.checked)}
                  />
                  I had agreed to this visit
                </label>
              </div>

              {row.noticeGiven && (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={SMALL_LABEL} htmlFor={`ie-ndate-${row.id}`}>
                      Notice served on
                    </label>
                    <input
                      id={`ie-ndate-${row.id}`}
                      className={`mt-1 ${INPUT_CLASS}`}
                      type="date"
                      value={row.noticeDate}
                      onChange={(event) => updateEntry(row.id, "noticeDate", event.target.value)}
                    />
                  </div>
                  <div>
                    <label className={SMALL_LABEL} htmlFor={`ie-ntime-${row.id}`}>
                      Notice served at
                    </label>
                    <input
                      id={`ie-ntime-${row.id}`}
                      className={`mt-1 ${INPUT_CLASS}`}
                      type="time"
                      value={row.noticeTime}
                      onChange={(event) => updateEntry(row.id, "noticeTime", event.target.value)}
                    />
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      {invalid ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {audit.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Entries in breach
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {invalid ? DASH : `${audit.breachCount} of ${audit.total}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {invalid ? "Fix the highlighted input to see the audit." : audit.band.label}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy(summary, "summary")}
              aria-label="Copy the entry audit summary"
              className={GHOST_BTN}
              disabled={invalid}
            >
              {copied === "summary" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied === "summary" ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={() => {
                setForm(buildDefaults());
                setEntries(buildDefaultEntries());
                setCopied("");
              }}
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
            ["Entries with no written notice", invalid ? DASH : audit.noNoticeCount],
            [
              `Entries with less than ${MIN_NOTICE_HOURS} hours' notice`,
              invalid ? DASH : audit.shortNoticeCount,
            ],
            [
              `Entries outside ${ENTRY_WINDOW_START_HOUR} a.m. – ${ENTRY_WINDOW_END_HOUR - 12} p.m.`,
              invalid ? DASH : audit.outOfHoursCount,
            ],
            ["Entries in your absence without consent", invalid ? DASH : audit.absentCount],
            ["Entries that were in order", invalid ? DASH : audit.compliantCount],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!invalid && (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">When</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Notice</th>
                  <th scope="col" className="py-2 font-semibold">Finding</th>
                </tr>
              </thead>
              <tbody>
                {audit.rows.map((row, index) => (
                  <tr key={`${row.entryDate}-${row.entryTime}-${index}`} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 whitespace-nowrap">
                      {formatLongDate(row.at)}, {formatClock(row.at)}
                    </td>
                    <td className="py-2 pr-3 text-right whitespace-nowrap">
                      {row.noticeGiven ? `${row.noticeHours} h` : "none"}
                    </td>
                    <td className="py-2">
                      {row.compliant ? (
                        <span className="text-[var(--success)]">In order</span>
                      ) : (
                        <span className="text-[var(--danger)]">{row.breaches.join(" ")}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Parties and premises</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ie-tenant">
              Your name (tenant)
            </label>
            <input
              id="ie-tenant"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.tenantName}
              onChange={set("tenantName")}
              placeholder="A. Verma"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ie-landlord">
              Landlord name
            </label>
            <input
              id="ie-landlord"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.landlordName}
              onChange={set("landlordName")}
              placeholder="R. Sharma"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ie-address">
              Premises address
            </label>
            <input
              id="ie-address"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.propertyAddress}
              onChange={set("propertyAddress")}
              placeholder="Flat 4B, Green Acres, Pune 411045"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ie-agreement">
              Tenancy agreement dated
            </label>
            <input
              id="ie-agreement"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.agreementDate}
              onChange={set("agreementDate")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ie-letter-date">
              Date of this letter
            </label>
            <input
              id="ie-letter-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.letterDate}
              onChange={set("letterDate")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ie-window">
              Times you can give access (optional)
            </label>
            <input
              id="ie-window"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.preferredWindow}
              onChange={set("preferredWindow")}
              placeholder="weekday evenings after 6 pm, Sunday mornings"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ie-contact">
              Your contact
            </label>
            <input
              id="ie-contact"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.contact}
              onChange={set("contact")}
              placeholder="98xxxxxx01 / name@example.com"
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Objection letter</h2>
          <button
            type="button"
            onClick={() => copy(letter, "letter")}
            aria-label="Copy the objection letter"
            className={GHOST_BTN}
            disabled={invalid}
          >
            {copied === "letter" ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied === "letter" ? "Copied!" : "Copy letter"}
          </button>
        </div>
        <label className="sr-only" htmlFor="ie-letter">
          Generated objection letter
        </label>
        <textarea
          id="ie-letter"
          className={`mt-3 ${AREA_CLASS} min-h-[26rem] font-mono text-xs leading-5`}
          value={invalid ? "" : letter}
          readOnly
        />
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. The Model Tenancy Act, 2021 applies as each State has
        adopted it, and older State rent laws may govern your tenancy instead — take legal advice
        before escalating.
      </p>
    </main>
  );
}
