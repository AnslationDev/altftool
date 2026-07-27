"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Download, RotateCcw, ShieldCheck, Trash2 } from "lucide-react";

import {
  DEFAULT_LEAD_DAYS,
  STATUSES,
  buildIcsCalendar,
  evaluateAll,
  evaluateCertificate,
  summarize,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const STORAGE_KEY = "altft-certificate-expiry-tracker";
const DASH = "—";

const STATUS_LABEL = new Map(STATUSES.map((status) => [status.id, status.label]));

const STATUS_BADGE = {
  expired: "bg-[var(--danger-soft)] text-[var(--danger)]",
  critical: "bg-[var(--danger-soft)] text-[var(--danger)]",
  due: "bg-[var(--muted)] text-[var(--primary)]",
  ok: "bg-[var(--muted)] text-[var(--success)]",
};

function todayIso() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

const SEED = [
  { id: "seed-1", name: "www.example.com", expiryDate: "", owner: "Platform team", leadDays: DEFAULT_LEAD_DAYS },
];

export default function ToolHome() {
  const [today, setToday] = useState("2026-01-01");
  const [certs, setCerts] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [name, setName] = useState("www.example.com");
  const [expiryDate, setExpiryDate] = useState("");
  const [owner, setOwner] = useState("");
  const [leadDays, setLeadDays] = useState(String(DEFAULT_LEAD_DAYS));
  const [formError, setFormError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const iso = todayIso();
    setToday(iso);
    const seedExpiry = new Date();
    seedExpiry.setDate(seedExpiry.getDate() + 60);
    const seedIso = `${seedExpiry.getFullYear()}-${String(seedExpiry.getMonth() + 1).padStart(2, "0")}-${String(seedExpiry.getDate()).padStart(2, "0")}`;
    setExpiryDate(seedIso);
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setCerts(parsed);
      } else {
        setCerts(SEED.map((entry) => ({ ...entry, expiryDate: seedIso })));
      }
    } catch {
      setCerts([]);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(certs));
    } catch {
      // Storage full or blocked — the list still works for this session.
    }
  }, [certs, hydrated]);

  const { rows } = useMemo(() => evaluateAll(certs, today), [certs, today]);
  const summary = useMemo(() => summarize(rows), [rows]);

  const addCertificate = (event) => {
    event.preventDefault();
    const candidate = evaluateCertificate({
      name,
      expiryDate,
      referenceDate: today,
      leadDays: leadDays.trim() === "" ? DEFAULT_LEAD_DAYS : Number(leadDays),
      owner,
    });
    if (candidate.error) {
      setFormError(candidate.error);
      return;
    }
    setFormError("");
    setCerts((current) => [
      ...current,
      {
        id: `cert-${Date.now()}-${current.length}`,
        name: candidate.name,
        expiryDate: candidate.expiryDate,
        owner: candidate.owner,
        leadDays: candidate.leadDays,
      },
    ]);
    setName("");
    setOwner("");
  };

  const removeCertificate = (id) => {
    setCerts((current) => current.filter((entry) => entry.id !== id));
  };

  const copySummary = async () => {
    if (rows.length === 0) return;
    const text = [
      `Certificate expiry report — ${today}`,
      ...rows.map(
        (row) =>
          `${row.name}: expires ${row.expiryDate} (${row.daysRemaining} days), renew from ${row.renewalDate}${row.owner ? `, owner ${row.owner}` : ""} — ${STATUS_LABEL.get(row.status)}`,
      ),
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const downloadIcs = () => {
    const calendar = buildIcsCalendar(rows, today);
    if (calendar.error) return;
    const blob = new Blob([calendar.ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "certificate-renewals.ics";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setCerts([]);
    setFormError("");
    setCopied(false);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const tiles = [
    ["Expired", summary.expired, "text-[var(--danger)]"],
    ["Within 7 days", summary.critical, "text-[var(--danger)]"],
    ["Renewal window", summary.due, "text-[var(--primary)]"],
    ["Healthy", summary.ok, "text-[var(--success)]"],
  ];

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          TLS renewals
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Certificate Expiry Tracker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Keep every TLS certificate, its owner and its renewal deadline in one list. Everything is
          stored in this browser only — nothing leaves your machine.
        </p>
      </header>

      <form
        onSubmit={addCertificate}
        className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cet-name">
              Hostname or certificate name
            </label>
            <input
              id="cet-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              spellCheck="false"
              placeholder="www.example.com"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cet-expiry">
              Expiry date (notAfter)
            </label>
            <input
              id="cet-expiry"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={expiryDate}
              onChange={(event) => setExpiryDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cet-owner">
              Owner (person or team)
            </label>
            <input
              id="cet-owner"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              placeholder="Platform team"
              value={owner}
              onChange={(event) => setOwner(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cet-lead">
              Renewal lead time (days before expiry)
            </label>
            <input
              id="cet-lead"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="398"
              step="1"
              value={leadDays}
              onChange={(event) => setLeadDays(event.target.value)}
            />
          </div>
        </div>

        {formError ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {formError}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="submit" className={PRIMARY_BTN}>
            Add certificate
          </button>
          <button
            type="button"
            onClick={reset}
            aria-label="Clear the whole certificate list"
            className={GHOST_BTN}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Clear list
          </button>
        </div>
      </form>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Certificates needing action
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {summary.total === 0 ? DASH : summary.actionNeeded}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {summary.total === 0
                ? "Add a certificate above to start tracking."
                : `Out of ${summary.total} tracked, as of ${today}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copySummary}
              disabled={rows.length === 0}
              aria-label="Copy the expiry report as text"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy report"}
            </button>
            <button
              type="button"
              onClick={downloadIcs}
              disabled={rows.length === 0}
              aria-label="Download renewal reminders as an iCalendar file"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Reminders (.ics)
            </button>
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {tiles.map(([label, value, tone]) => (
            <div
              key={label}
              className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
            >
              <dt className="text-xs text-[var(--muted-foreground)]">{label}</dt>
              <dd className={`mt-1 text-2xl font-semibold ${tone}`}>
                {summary.total === 0 ? DASH : value}
              </dd>
            </div>
          ))}
        </dl>

        {rows.length > 0 && (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Certificate
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Expires
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Days left
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Renew from
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Owner
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Status
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    <span className="sr-only">Remove</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id ?? row.name} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-mono">{row.name}</td>
                    <td className="py-2 pr-3">{row.expiryDate}</td>
                    <td className="py-2 pr-3 font-semibold">{row.daysRemaining}</td>
                    <td className="py-2 pr-3">{row.renewalDate}</td>
                    <td className="py-2 pr-3">{row.owner || DASH}</td>
                    <td className="py-2 pr-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[row.status]}`}
                      >
                        {STATUS_LABEL.get(row.status)}
                      </span>
                    </td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        onClick={() => removeCertificate(row.id)}
                        aria-label={`Remove ${row.name} from the list`}
                        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-[var(--muted-foreground)] transition hover:text-[var(--danger)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Publicly trusted TLS certificates are capped at 398 days of validity by the CA/Browser Forum
        Baseline Requirements, with shorter caps scheduled from 2026 onwards. The default 30-day lead
        time follows Let&apos;s Encrypt renewal guidance. Data stays in this browser&apos;s local
        storage only.
      </p>
    </main>
  );
}
