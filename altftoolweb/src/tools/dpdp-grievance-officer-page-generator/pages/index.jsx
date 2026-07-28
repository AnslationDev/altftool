"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, Copy, RotateCcw, ShieldCheck } from "lucide-react";
import { GRIEVANCE_REGIMES, buildGrievancePage } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  organisation: "Acme Retail Private Limited",
  brand: "AcmeShop",
  website: "https://www.acmeshop.in",
  officerName: "R. Iyer",
  designation: "Grievance Officer",
  email: "grievance@acmeshop.in",
  phone: "+91 80 4000 1234",
  address: "4th Floor, Sunrise Tower, MG Road\nBengaluru, Karnataka 560001\nIndia",
  workingHours: "Monday to Friday, 10:00 to 18:00 IST (except public holidays)",
  effectiveDate: "2026-07-01",
  regimeId: "intermediary",
  significantDataFiduciary: false,
  dpoName: "",
  dpoEmail: "",
};

const FORMATS = [
  ["markdown", "Markdown"],
  ["html", "HTML"],
  ["text", "Plain text"],
];

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [ackHours, setAckHours] = useState("");
  const [resolveDays, setResolveDays] = useState("");
  const [format, setFormat] = useState("markdown");
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  };

  const result = useMemo(() => {
    const overrides = {};
    if (ackHours.trim() !== "") overrides.ackHours = Number(ackHours);
    if (resolveDays.trim() !== "") overrides.resolveDays = Number(resolveDays);
    return buildGrievancePage({ ...form, ...overrides });
  }, [form, ackHours, resolveDays]);

  const output = result.error ? "" : result[format];

  const copyResult = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setAckHours("");
    setResolveDays("");
    setFormat("markdown");
    setCopied(false);
  };

  const dash = "—";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          India compliance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          DPDP Grievance Officer Page Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build the grievance redressal contact block Indian websites must publish, with the
          acknowledgement and disposal windows fixed by the IT Rules, 2021, the E-Commerce Rules,
          2020 and the DPDP Act, 2023.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="g-org">
              Registered entity name
            </label>
            <input id="g-org" className={`mt-2 ${INPUT_CLASS}`} value={form.organisation} onChange={setField("organisation")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="g-brand">
              Brand / trading name
            </label>
            <input id="g-brand" className={`mt-2 ${INPUT_CLASS}`} value={form.brand} onChange={setField("brand")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="g-website">
              Website URL
            </label>
            <input id="g-website" className={`mt-2 ${INPUT_CLASS}`} value={form.website} onChange={setField("website")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="g-regime">
              Which rules apply
            </label>
            <select id="g-regime" className={`mt-2 ${INPUT_CLASS}`} value={form.regimeId} onChange={setField("regimeId")}>
              {GRIEVANCE_REGIMES.map((regime) => (
                <option key={regime.id} value={regime.id}>
                  {regime.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="g-officer">
              Officer name
            </label>
            <input id="g-officer" className={`mt-2 ${INPUT_CLASS}`} value={form.officerName} onChange={setField("officerName")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="g-designation">
              Designation
            </label>
            <input id="g-designation" className={`mt-2 ${INPUT_CLASS}`} value={form.designation} onChange={setField("designation")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="g-email">
              Officer email
            </label>
            <input id="g-email" type="email" className={`mt-2 ${INPUT_CLASS}`} value={form.email} onChange={setField("email")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="g-phone">
              Officer telephone
            </label>
            <input id="g-phone" type="tel" className={`mt-2 ${INPUT_CLASS}`} value={form.phone} onChange={setField("phone")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="g-address">
              Postal address (one line per row)
            </label>
            <textarea id="g-address" rows={3} className={`mt-2 ${TEXTAREA_CLASS}`} value={form.address} onChange={setField("address")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="g-hours">
              Contact hours
            </label>
            <input id="g-hours" className={`mt-2 ${INPUT_CLASS}`} value={form.workingHours} onChange={setField("workingHours")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="g-ack">
              Acknowledge within (hours, blank = statutory)
            </label>
            <input
              id="g-ack"
              type="number"
              min="1"
              max="720"
              className={`mt-2 ${INPUT_CLASS}`}
              value={ackHours}
              onChange={(event) => {
                setAckHours(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="g-resolve">
              Resolve within (days, blank = statutory)
            </label>
            <input
              id="g-resolve"
              type="number"
              min="1"
              max="365"
              className={`mt-2 ${INPUT_CLASS}`}
              value={resolveDays}
              onChange={(event) => {
                setResolveDays(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="g-date">
              Page effective date
            </label>
            <input id="g-date" type="date" className={`mt-2 ${INPUT_CLASS}`} value={form.effectiveDate} onChange={setField("effectiveDate")} />
          </div>
          <div className="flex items-end">
            <label className="inline-flex min-h-11 items-center gap-3 text-sm font-semibold" htmlFor="g-sdf">
              <input
                id="g-sdf"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                checked={form.significantDataFiduciary}
                onChange={setField("significantDataFiduciary")}
              />
              Significant Data Fiduciary
            </label>
          </div>
          {form.significantDataFiduciary && (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="g-dpo">
                  Data Protection Officer name
                </label>
                <input id="g-dpo" className={`mt-2 ${INPUT_CLASS}`} value={form.dpoName} onChange={setField("dpoName")} />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="g-dpo-email">
                  DPO email
                </label>
                <input id="g-dpo-email" type="email" className={`mt-2 ${INPUT_CLASS}`} value={form.dpoEmail} onChange={setField("dpoEmail")} />
              </div>
            </>
          )}
        </div>
      </section>

      {result.error && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Compliance items covered
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {result.error ? dash : `${result.score}/${result.total}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {result.error ? dash : `${result.regimeLabel}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy generated grievance page" className={GHOST_BTN} disabled={!output}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy page"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Acknowledge complaints within", result.error ? dash : result.ackText],
            ["Decide complaints within", result.error ? dash : `${result.resolveDays} days`],
            ["Legal basis", result.error ? dash : result.statute],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!result.error && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.regimeNote}
          </p>
        )}
      </section>

      {!result.error && result.warnings.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <AlertTriangle className="h-4 w-4 text-[var(--warning)]" aria-hidden="true" />
            Check before you publish
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
            {result.warnings.map((warning) => (
              <li key={warning} className="rounded-md bg-[var(--warning-soft)] px-3 py-2 text-[var(--warning)]">
                {warning}
              </li>
            ))}
          </ul>
        </section>
      )}

      {!result.error && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Published page</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {FORMATS.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setFormat(id);
                  setCopied(false);
                }}
                aria-pressed={format === id}
                className={
                  format === id
                    ? "min-h-11 rounded-md bg-[var(--primary)] px-3 text-sm font-semibold text-[var(--primary-foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                    : "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                }
              >
                {label}
              </button>
            ))}
          </div>
          <div className="mt-3 overflow-x-auto">
            <pre className="min-w-full whitespace-pre-wrap break-words rounded-md bg-[var(--muted)] p-4 text-xs leading-6 text-[var(--foreground)]">
              {output}
            </pre>
          </div>

          <h3 className="mt-5 text-sm font-semibold">Checklist</h3>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {result.checklist.map((item) => (
              <li key={item.label} className="flex items-center gap-2 text-sm">
                <span
                  aria-hidden="true"
                  className={
                    item.done
                      ? "inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--success-soft)] text-[var(--success)]"
                      : "inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--danger-soft)] text-[var(--danger)]"
                  }
                >
                  {item.done ? "✓" : "!"}
                </span>
                <span className={item.done ? "text-[var(--muted-foreground)]" : "font-semibold"}>
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational template only, not legal advice. Timelines shown reflect the IT Rules, 2021,
        the Consumer Protection (E-Commerce) Rules, 2020 and the DPDP Act, 2023 as described — have
        your own counsel confirm what applies to your business before publishing.
      </p>
    </main>
  );
}
