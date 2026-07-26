"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Download, Hash, RotateCcw } from "lucide-react";

const inputClass =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const labelClass = "text-sm font-semibold text-[var(--foreground)]";

const primaryButtonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const secondaryButtonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const SCHEMES = [
  { id: "sequential", label: "Sequential (never resets)" },
  { id: "monthly", label: "Monthly reset" },
  { id: "yearly", label: "Calendar year reset" },
  { id: "fiscal", label: "Indian financial year (Apr-Mar)" },
];

const DATE_FORMATS = [
  { id: "none", label: "No date segment" },
  { id: "YYYY", label: "YYYY  (2026)" },
  { id: "YY", label: "YY  (26)" },
  { id: "YYYYMM", label: "YYYYMM  (202604)" },
  { id: "YYYY-MM", label: "YYYY-MM  (2026-04)" },
  { id: "MMYY", label: "MMYY  (0426)" },
  { id: "DDMMYYYY", label: "DDMMYYYY  (01042026)" },
  { id: "FY", label: "FY label  (2026-27)" },
  { id: "FYSHORT", label: "Short FY  (FY26-27)" },
];

const SEPARATORS = [
  { id: "-", label: "Hyphen  INV-0001" },
  { id: "/", label: "Slash  INV/0001" },
  { id: "_", label: "Underscore  INV_0001" },
  { id: "", label: "None  INV0001" },
];

const DEFAULTS = {
  prefix: "INV",
  suffix: "",
  separator: "-",
  scheme: "monthly",
  dateFormat: "YYYY-MM",
  startDate: "2026-04-01",
  start: 1,
  step: 1,
  padding: 4,
  count: 12,
  perPeriod: 3,
};

const pad = (value, width) => String(Math.trunc(Math.abs(value))).padStart(width, "0");

const two = (value) => String(value).padStart(2, "0");

/** Indian financial year start (April 1). Returns the starting calendar year. */
function fiscalStartYear(year, month) {
  return month >= 4 ? year : year - 1;
}

function addMonths(year, month, delta) {
  const zero = (year * 12 + (month - 1)) + delta;
  return { year: Math.floor(zero / 12), month: (zero % 12) + 1 };
}

function formatDateSegment(format, parts) {
  const { year, month, day } = parts;
  const fy = fiscalStartYear(year, month);
  switch (format) {
    case "YYYY":
      return String(year);
    case "YY":
      return String(year).slice(-2);
    case "YYYYMM":
      return `${year}${two(month)}`;
    case "YYYY-MM":
      return `${year}-${two(month)}`;
    case "MMYY":
      return `${two(month)}${String(year).slice(-2)}`;
    case "DDMMYYYY":
      return `${two(day)}${two(month)}${year}`;
    case "FY":
      return `${fy}-${String(fy + 1).slice(-2)}`;
    case "FYSHORT":
      return `FY${String(fy).slice(-2)}-${String(fy + 1).slice(-2)}`;
    default:
      return "";
  }
}

function joinParts(parts, separator) {
  return parts.filter((part) => part !== "" && part !== null && part !== undefined).join(separator);
}

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) => {
    const raw = event.target.value;
    const numeric = ["start", "step", "padding", "count", "perPeriod"].includes(key);
    setForm((prev) => ({ ...prev, [key]: numeric ? raw.replace(/[^0-9-]/g, "") : raw }));
    setCopied(false);
  };

  const numbers = useMemo(() => {
    const count = Number(form.count);
    const start = Number(form.start);
    const step = Number(form.step);
    const padding = Number(form.padding);
    const perPeriod = Number(form.perPeriod);

    const errors = [];
    if (!Number.isFinite(count) || count < 1 || count > 500) {
      errors.push("How many numbers must be between 1 and 500.");
    }
    if (!Number.isFinite(start) || start < 0) errors.push("Start number must be 0 or higher.");
    if (!Number.isFinite(step) || step < 1) errors.push("Increment must be at least 1.");
    if (!Number.isFinite(padding) || padding < 0 || padding > 12) {
      errors.push("Padding must be between 0 and 12 digits.");
    }
    if (form.scheme !== "sequential" && (!Number.isFinite(perPeriod) || perPeriod < 1 || perPeriod > 500)) {
      errors.push("Invoices per period must be between 1 and 500.");
    }

    const dateParts = /^\d{4}-\d{2}-\d{2}$/.test(form.startDate)
      ? {
          year: Number(form.startDate.slice(0, 4)),
          month: Number(form.startDate.slice(5, 7)),
          day: Number(form.startDate.slice(8, 10)),
        }
      : null;
    if (!dateParts || dateParts.month < 1 || dateParts.month > 12 || dateParts.day < 1 || dateParts.day > 31) {
      errors.push("Enter a valid start date.");
    }

    if (errors.length > 0) return { errors, rows: [] };

    const rows = [];
    for (let index = 0; index < count; index += 1) {
      let periodIndex = 0;
      let seqIndex = index;

      if (form.scheme === "monthly") {
        periodIndex = Math.floor(index / perPeriod);
        seqIndex = index % perPeriod;
      } else if (form.scheme === "yearly" || form.scheme === "fiscal") {
        periodIndex = Math.floor(index / perPeriod) * 12;
        seqIndex = index % perPeriod;
      }

      const shifted = addMonths(dateParts.year, dateParts.month, periodIndex);
      const segment = formatDateSegment(form.dateFormat, {
        year: shifted.year,
        month: shifted.month,
        day: dateParts.day,
      });

      const seq = start + seqIndex * step;
      const number = joinParts(
        [form.prefix.trim(), segment, pad(seq, padding), form.suffix.trim()],
        form.separator
      );

      rows.push({
        number,
        seq,
        date: `${shifted.year}-${two(shifted.month)}-${two(dateParts.day)}`,
      });
    }

    const unique = new Set(rows.map((row) => row.number));
    const warnings = [];
    if (unique.size !== rows.length) {
      warnings.push(
        "This scheme repeats numbers. Add a date segment, raise padding, or increase invoices per period."
      );
    }
    if (padding > 0 && rows.some((row) => String(row.seq).length > padding)) {
      warnings.push("Some numbers exceed the padding width, so the counter grows wider mid-series.");
    }

    return { errors: [], rows, warnings };
  }, [form]);

  const rows = numbers.rows;
  const hasError = numbers.errors.length > 0;

  const plainList = useMemo(() => rows.map((row) => row.number).join("\n"), [rows]);

  const copyList = async () => {
    if (!plainList) return;
    try {
      await navigator.clipboard.writeText(plainList);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const downloadCsv = () => {
    const csv = ["invoice_number,sequence,period_date"]
      .concat(rows.map((row) => `"${row.number}",${row.seq},${row.date}`))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "invoice-numbers.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header>
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Hash className="h-4 w-4" aria-hidden="true" />
            Invoice numbering
          </div>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Invoice Number Generator</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)] sm:text-base">
            Build a consistent invoice numbering series — sequential, monthly, calendar-year or Indian
            financial-year — and export the whole batch.
          </p>
        </header>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Scheme</h2>

            <div className="mt-4 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="inv-prefix">
                    Prefix
                  </label>
                  <input
                    id="inv-prefix"
                    type="text"
                    value={form.prefix}
                    onChange={setField("prefix")}
                    className={`${inputClass} mt-2`}
                    placeholder="INV"
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="inv-suffix">
                    Suffix (optional)
                  </label>
                  <input
                    id="inv-suffix"
                    type="text"
                    value={form.suffix}
                    onChange={setField("suffix")}
                    className={`${inputClass} mt-2`}
                    placeholder="e.g. GST"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="inv-scheme">
                    Reset rule
                  </label>
                  <select
                    id="inv-scheme"
                    value={form.scheme}
                    onChange={setField("scheme")}
                    className={`${inputClass} mt-2`}
                  >
                    {SCHEMES.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass} htmlFor="inv-date-format">
                    Date segment
                  </label>
                  <select
                    id="inv-date-format"
                    value={form.dateFormat}
                    onChange={setField("dateFormat")}
                    className={`${inputClass} mt-2`}
                  >
                    {DATE_FORMATS.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="inv-start-date">
                    First invoice date
                  </label>
                  <input
                    id="inv-start-date"
                    type="date"
                    value={form.startDate}
                    onChange={setField("startDate")}
                    className={`${inputClass} mt-2`}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="inv-separator">
                    Separator
                  </label>
                  <select
                    id="inv-separator"
                    value={form.separator}
                    onChange={setField("separator")}
                    className={`${inputClass} mt-2`}
                  >
                    {SEPARATORS.map((item) => (
                      <option key={item.label} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="inv-start">
                    Start number
                  </label>
                  <input
                    id="inv-start"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    value={form.start}
                    onChange={setField("start")}
                    className={`${inputClass} mt-2`}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="inv-step">
                    Increment by
                  </label>
                  <input
                    id="inv-step"
                    type="number"
                    inputMode="numeric"
                    min="1"
                    value={form.step}
                    onChange={setField("step")}
                    className={`${inputClass} mt-2`}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="inv-padding">
                    Digits (zero padding)
                  </label>
                  <input
                    id="inv-padding"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="12"
                    value={form.padding}
                    onChange={setField("padding")}
                    className={`${inputClass} mt-2`}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="inv-count">
                    How many numbers
                  </label>
                  <input
                    id="inv-count"
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max="500"
                    value={form.count}
                    onChange={setField("count")}
                    className={`${inputClass} mt-2`}
                  />
                </div>
              </div>

              {form.scheme !== "sequential" && (
                <div>
                  <label className={labelClass} htmlFor="inv-per-period">
                    Invoices per period (before the counter resets)
                  </label>
                  <input
                    id="inv-per-period"
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max="500"
                    value={form.perPeriod}
                    onChange={setField("perPeriod")}
                    className={`${inputClass} mt-2`}
                  />
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={reset} className={secondaryButtonClass} aria-label="Reset all fields to defaults">
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            {hasError ? (
              <div
                role="alert"
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
              >
                {numbers.errors[0]}
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  First invoice number
                </p>
                <p className="mt-2 break-all text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
                  {rows[0]?.number || "-"}
                </p>

                <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
                  <div className="flex items-center justify-between gap-3 py-2">
                    <dt className="text-[var(--muted-foreground)]">Last in series</dt>
                    <dd className="break-all text-right font-semibold">{rows[rows.length - 1]?.number || "-"}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2">
                    <dt className="text-[var(--muted-foreground)]">Numbers generated</dt>
                    <dd className="font-semibold">{new Intl.NumberFormat("en-IN").format(rows.length)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2">
                    <dt className="text-[var(--muted-foreground)]">Unique numbers</dt>
                    <dd className="font-semibold">
                      {new Intl.NumberFormat("en-IN").format(new Set(rows.map((row) => row.number)).size)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2">
                    <dt className="text-[var(--muted-foreground)]">Reset rule</dt>
                    <dd className="text-right font-semibold">
                      {SCHEMES.find((item) => item.id === form.scheme)?.label}
                    </dd>
                  </div>
                </dl>

                {numbers.warnings?.length > 0 && (
                  <div
                    role="alert"
                    className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
                  >
                    {numbers.warnings[0]}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={copyList}
                    className={primaryButtonClass}
                    aria-label="Copy all generated invoice numbers"
                  >
                    {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                    {copied ? "Copied!" : "Copy all"}
                  </button>
                  <button
                    type="button"
                    onClick={downloadCsv}
                    className={secondaryButtonClass}
                    aria-label="Download invoice numbers as CSV"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    CSV
                  </button>
                </div>

                <div className="mt-4 max-h-80 overflow-y-auto rounded-md border border-[var(--border)] bg-[var(--background)]">
                  <ol className="divide-y divide-[var(--border)] text-sm">
                    {rows.map((row, index) => (
                      <li key={`${row.number}-${index}`} className="flex items-center justify-between gap-3 px-3 py-2">
                        <span className="break-all font-medium">{row.number}</span>
                        <span className="shrink-0 text-xs text-[var(--muted-foreground)]">{row.date}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
