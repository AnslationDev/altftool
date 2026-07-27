"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";
import { DOCUMENT_TYPES, addMonths, evaluateDocuments } from "../lib";

const STORAGE_KEY = "altft-vehicle-document-expiry";

/** Fixed seed so the server render and the first client render match exactly. */
const SEED_TODAY = "2026-01-01";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const STATUS_STYLE = {
  expired: "bg-[var(--danger-soft)] text-[var(--danger)]",
  critical: "bg-[var(--danger-soft)] text-[var(--danger)]",
  due: "bg-[var(--muted)] text-[var(--foreground)]",
  soon: "bg-[var(--muted)] text-[var(--muted-foreground)]",
  ok: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

function localIsoDate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function seedDocuments(reference) {
  return [
    {
      id: "seed-insurance",
      typeId: "insurance",
      label: "Car insurance",
      vehicle: "MH 12 AB 1234",
      expiry: addMonths(reference, 2),
    },
    {
      id: "seed-puc",
      typeId: "puc",
      label: "PUC certificate",
      vehicle: "MH 12 AB 1234",
      expiry: addMonths(reference, 1),
    },
    {
      id: "seed-dl",
      typeId: "dl",
      label: "Driving licence",
      vehicle: "",
      expiry: addMonths(reference, 14),
    },
  ];
}

const prettyDate = (iso) => {
  if (!iso) return "—";
  const [year, month, day] = iso.split("-");
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))));
};

const dayCount = (days) =>
  days < 0
    ? `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue`
    : days === 0
      ? "expires today"
      : `${days} day${days === 1 ? "" : "s"} left`;

export default function ToolHome() {
  const [today, setToday] = useState(SEED_TODAY);
  const [docs, setDocs] = useState(() => seedDocuments(SEED_TODAY));
  const [leadDays, setLeadDays] = useState("");
  const [ready, setReady] = useState(false);
  const [seq, setSeq] = useState(1);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const real = localIsoDate();
    let stored = null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) stored = parsed;
      }
    } catch {
      stored = null;
    }
    setToday(real);
    setDocs(stored || seedDocuments(real));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
    } catch {
      /* storage full or blocked — the list still works for this session */
    }
  }, [docs, ready]);

  const lead = leadDays.trim() === "" ? undefined : Number(leadDays);

  const result = useMemo(
    () => evaluateDocuments(docs, today, lead),
    [docs, today, lead],
  );

  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      `Vehicle document status as on ${prettyDate(today)}`,
      ...result.items.map(
        (item) =>
          `${item.label}${item.vehicle ? ` (${item.vehicle})` : ""} — expires ${prettyDate(item.expiry)}, ${dayCount(item.daysLeft)}, remind on ${prettyDate(item.remindOn)}`,
      ),
      `${result.counts.expired} expired, ${result.actionable} need action now, ${result.total} tracked`,
    ].join("\n");
  }, [failed, result, today]);

  const updateDoc = (id, field, value) => {
    setDocs((current) =>
      current.map((doc) => (doc.id === id ? { ...doc, [field]: value } : doc)),
    );
  };

  const addDoc = () => {
    const id = `doc-${seq}`;
    setSeq((value) => value + 1);
    setDocs((current) => [
      ...current,
      {
        id,
        typeId: "insurance",
        label: "",
        vehicle: "",
        expiry: addMonths(today, 6),
      },
    ]);
  };

  const removeDoc = (id) => setDocs((current) => current.filter((doc) => doc.id !== id));

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
    setDocs(seedDocuments(today));
    setLeadDays("");
    setSeq(1);
    setCopied(false);
  };

  const headline = failed
    ? "—"
    : result.counts.expired > 0
      ? `${result.counts.expired} expired`
      : result.actionable > 0
        ? `${result.actionable} due now`
        : "All in date";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarClock className="h-4 w-4" aria-hidden="true" />
          Vehicle compliance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Vehicle Document Expiry Reminder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Keep insurance, PUC, RC, fitness, permit and licence dates in one list, with days left and
          the date you should start the renewal. Everything stays in this browser — nothing is
          uploaded.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="today">
              Check against date
            </label>
            <input
              id="today"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={today}
              onChange={(event) => setToday(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lead">
              Warn me this many days ahead
            </label>
            <input
              id="lead"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="365"
              step="1"
              placeholder="Per document type"
              value={leadDays}
              onChange={(event) => setLeadDays(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Leave blank to use the default lead time for each document.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Documents</h2>
        <div className="mt-4 grid gap-5">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="grid gap-3 rounded-lg border border-[var(--border)] p-4"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`type-${doc.id}`}>
                    Document type
                  </label>
                  <select
                    id={`type-${doc.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    value={doc.typeId}
                    onChange={(event) => updateDoc(doc.id, "typeId", event.target.value)}
                  >
                    {DOCUMENT_TYPES.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`expiry-${doc.id}`}>
                    Expires on
                  </label>
                  <input
                    id={`expiry-${doc.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="date"
                    value={doc.expiry}
                    onChange={(event) => updateDoc(doc.id, "expiry", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`label-${doc.id}`}>
                    Your label (optional)
                  </label>
                  <input
                    id={`label-${doc.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    placeholder="e.g. Comprehensive policy"
                    value={doc.label}
                    onChange={(event) => updateDoc(doc.id, "label", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`vehicle-${doc.id}`}>
                    Vehicle (optional)
                  </label>
                  <input
                    id={`vehicle-${doc.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    placeholder="MH 12 AB 1234"
                    value={doc.vehicle}
                    onChange={(event) => updateDoc(doc.id, "vehicle", event.target.value)}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeDoc(doc.id)}
                aria-label={`Remove ${doc.label || doc.typeId}`}
                className="inline-flex min-h-11 items-center justify-center gap-2 justify-self-start rounded-md border border-[var(--border)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--danger)] hover:text-[var(--danger)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Remove
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addDoc} className={`mt-4 ${GHOST_BTN}`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add document
        </button>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Status on {prettyDate(today)}
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                !failed && result.counts.expired > 0
                  ? "text-[var(--danger)]"
                  : "text-[var(--primary)]"
              }`}
            >
              {headline}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the highlighted input to see the list."
                : `${result.total} document${result.total === 1 ? "" : "s"} tracked · next expiry ${
                    result.nextExpiry ? prettyDate(result.nextExpiry.expiry) : "none upcoming"
                  }`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the document expiry summary"
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
              aria-label="Reset the tracked document list"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Expired", failed ? "—" : String(result.counts.expired)],
            ["Expiring within 7 days", failed ? "—" : String(result.counts.critical)],
            ["Due within 30 days", failed ? "—" : String(result.counts.due)],
            ["Coming up within 60 days", failed ? "—" : String(result.counts.soon)],
            ["Comfortably in date", failed ? "—" : String(result.counts.ok)],
            ["Need action today", failed ? "—" : String(result.actionable)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Renewal queue</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Document</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Expires</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Days</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Start renewal</th>
                  <th scope="col" className="py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((item) => (
                  <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2.5 pr-3">
                      <span className="font-semibold">{item.label}</span>
                      {item.vehicle ? (
                        <span className="block text-xs text-[var(--muted-foreground)]">
                          {item.vehicle}
                        </span>
                      ) : null}
                    </td>
                    <td className="py-2.5 pr-3">{prettyDate(item.expiry)}</td>
                    <td className="py-2.5 pr-3">{dayCount(item.daysLeft)}</td>
                    <td className="py-2.5 pr-3">{prettyDate(item.remindOn)}</td>
                    <td className="py-2.5">
                      <span
                        className={`inline-block rounded-md px-2 py-1 text-xs font-semibold ${STATUS_STYLE[item.status]}`}
                      >
                        {item.statusLabel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 grid gap-3">
            {result.items
              .filter((item) => item.daysLeft <= item.leadDays)
              .map((item) => (
                <div
                  key={`note-${item.id}`}
                  className="rounded-lg border border-[var(--border)] p-3 text-xs leading-5 text-[var(--muted-foreground)]"
                >
                  <span className="font-semibold text-[var(--foreground)]">{item.typeLabel}:</span>{" "}
                  {item.validity} {item.rule} Penalty for driving without it: {item.penalty}
                </div>
              ))}
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Validity periods and penalties come from the Motor Vehicles Act, 1988 and
        the Central Motor Vehicles Rules, 1989 as amended in 2019; several states notify their own
        amounts. Always confirm the dates printed on your own documents.
      </p>
    </main>
  );
}
