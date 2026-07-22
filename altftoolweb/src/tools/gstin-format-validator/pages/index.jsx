"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle,
  Clipboard,
  Copy,
  Download,
  EyeOff,
  FileCheck2,
  IdCard,
  KeyRound,
  ListChecks,
  MapPin,
  ReceiptText,
  RefreshCw,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Trash2,
  XCircle,
} from "lucide-react";

const SAMPLE_GSTINS = [
  "29ABCDE1234F1ZW",
  "07AAACB2230M1ZY",
  "27AABCU9603R1ZN",
  "33AACCS1401P1ZJ",
].join("\n");

const GSTIN_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const STATE_CODES = {
  "01": "Jammu & Kashmir",
  "02": "Himachal Pradesh",
  "03": "Punjab",
  "04": "Chandigarh",
  "05": "Uttarakhand",
  "06": "Haryana",
  "07": "Delhi",
  "08": "Rajasthan",
  "09": "Uttar Pradesh",
  10: "Bihar",
  11: "Sikkim",
  12: "Arunachal Pradesh",
  13: "Nagaland",
  14: "Manipur",
  15: "Mizoram",
  16: "Tripura",
  17: "Meghalaya",
  18: "Assam",
  19: "West Bengal",
  20: "Jharkhand",
  21: "Odisha",
  22: "Chhattisgarh",
  23: "Madhya Pradesh",
  24: "Gujarat",
  25: "Daman & Diu",
  26: "Dadra & Nagar Haveli",
  27: "Maharashtra",
  28: "Andhra Pradesh",
  29: "Karnataka",
  30: "Goa",
  31: "Lakshadweep",
  32: "Kerala",
  33: "Tamil Nadu",
  34: "Puducherry",
  35: "Andaman & Nicobar Islands",
  36: "Telangana",
  37: "Andhra Pradesh",
  38: "Ladakh",
  97: "Other Territory",
};

function normalizeGstin(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/[^0-9A-Z]/g, "")
    .slice(0, 15);
}

function formatGstin(value) {
  const clean = normalizeGstin(value);
  if (clean.length <= 2) return clean;
  if (clean.length <= 12) return `${clean.slice(0, 2)} ${clean.slice(2)}`;
  if (clean.length <= 14) return `${clean.slice(0, 2)} ${clean.slice(2, 12)} ${clean.slice(12)}`;
  return `${clean.slice(0, 2)} ${clean.slice(2, 12)} ${clean.slice(12, 14)} ${clean.slice(14)}`;
}

function parseBulk(value) {
  return String(value || "")
    .split(/\n|,|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function calculateChecksum(first14) {
  let factor = 2;
  let sum = 0;

  for (let index = first14.length - 1; index >= 0; index -= 1) {
    const codePoint = GSTIN_CHARS.indexOf(first14[index]);
    if (codePoint < 0) return "";
    const product = codePoint * factor;
    sum += Math.floor(product / 36) + (product % 36);
    factor = factor === 2 ? 1 : 2;
  }

  const checkCodePoint = (36 - (sum % 36)) % 36;
  return GSTIN_CHARS[checkCodePoint];
}

function maskGstin(value) {
  const clean = normalizeGstin(value);
  if (!clean) return "NA";
  if (clean.length < 15) return `${clean.slice(0, 2)}${"X".repeat(Math.max(clean.length - 2, 0))}`;
  return `${clean.slice(0, 2)} XXXXX1234X ${clean.slice(12, 14)} ${clean.slice(14)}`;
}

function analyzeGstin(raw, index = 0) {
  const normalized = normalizeGstin(raw);
  const issues = [];
  const warnings = [];
  const stateCode = normalized.slice(0, 2);
  const pan = normalized.slice(2, 12);
  const entityCode = normalized[12] || "";
  const defaultZ = normalized[13] || "";
  const checksum = normalized[14] || "";
  const expectedChecksum = normalized.length >= 14 ? calculateChecksum(normalized.slice(0, 14)) : "";
  const stateName = STATE_CODES[stateCode] || "Unknown state";
  const formatValid = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(normalized);
  const panValid = /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan);
  const stateValid = Boolean(STATE_CODES[stateCode]);
  const checksumValid = Boolean(checksum && expectedChecksum && checksum === expectedChecksum);

  if (!normalized) issues.push("GSTIN is empty.");
  if (normalized && normalized.length !== 15) issues.push("GSTIN must contain exactly 15 characters.");
  if (normalized.length >= 2 && !stateValid) issues.push("Invalid GST state code.");
  if (normalized.length >= 12 && !panValid) issues.push("Embedded PAN pattern is invalid.");
  if (normalized.length >= 13 && !/^[1-9A-Z]$/.test(entityCode)) issues.push("Entity code must be 1-9 or A-Z.");
  if (normalized.length >= 14 && defaultZ !== "Z") issues.push("14th GSTIN character should be Z.");
  if (formatValid && !checksumValid) issues.push(`Checksum mismatch. Expected ${expectedChecksum || "NA"}.`);
  if (formatValid && checksumValid && stateCode === "97") warnings.push("Other Territory GSTIN detected. Verify business context.");

  const isValid = formatValid && stateValid && checksumValid;

  return {
    id: `${index}-${normalized || raw}`,
    raw: raw || "",
    normalized,
    formatted: formatGstin(normalized),
    masked: maskGstin(normalized),
    stateCode,
    stateName,
    pan,
    entityCode,
    expectedChecksum,
    checksum,
    formatValid,
    stateValid,
    checksumValid,
    isValid,
    issues,
    warnings,
  };
}

function buildSummary(results) {
  const total = results.length;
  const valid = results.filter((item) => item.isValid).length;
  const invalid = total - valid;
  return [
    "GSTIN Format Validator Summary",
    `Entries checked: ${total}`,
    `Valid GSTINs: ${valid}`,
    `Invalid / needs review: ${invalid}`,
    "",
    ...results.map((item) => `${item.normalized || item.raw || "EMPTY"} - ${item.isValid ? "Valid" : item.issues.join("; ")}`),
  ].join("\n");
}

function exportCsv(results) {
  const rows = [
    ["Input", "Normalized", "State Code", "State", "PAN", "Entity Code", "Expected Checksum", "Checksum Status", "Masked", "Issues"],
    ...results.map((item) => [
      item.raw,
      item.normalized,
      item.stateCode,
      item.stateName,
      item.pan,
      item.entityCode,
      item.expectedChecksum,
      item.checksumValid ? "Pass" : "Fail",
      item.masked,
      [...item.issues, ...item.warnings].join("; "),
    ]),
  ];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "gstin-format-validation.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function MetricCard({ icon: Icon, label, value, detail, tone = "default" }) {
  const toneClass =
    tone === "good"
      ? "bg-emerald-500/10 text-emerald-600"
      : tone === "warn"
        ? "bg-amber-500/10 text-amber-600"
        : tone === "bad"
          ? "bg-rose-500/10 text-rose-600"
          : "bg-[var(--section-highlight)] text-[var(--primary)]";

  return (
    <article className="tool-card min-w-0 overflow-hidden !p-4 sm:!p-5 xl:!p-6">
      <div className="flex min-w-0 items-start gap-3 sm:gap-4">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg sm:h-11 sm:w-11 ${toneClass}`}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </span>
        <div className="min-w-0">
          <p className="break-words text-[0.68rem] font-bold uppercase tracking-wide text-[var(--muted-foreground)] sm:text-xs">{label}</p>
          <p className="mt-1 break-words text-xl font-black leading-tight text-[var(--foreground)] sm:text-2xl xl:text-3xl">{value}</p>
          {detail ? <p className="mt-2 hidden break-words text-sm text-[var(--muted-foreground)] sm:block">{detail}</p> : null}
        </div>
      </div>
    </article>
  );
}

function StatusPill({ item }) {
  return (
    <span
      className={`inline-flex max-w-full items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${
        item.isValid
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : item.formatValid && item.stateValid
            ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
            : "bg-rose-500/10 text-rose-700 dark:text-rose-300"
      }`}
    >
      {item.isValid ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
      <span className="min-w-0 truncate">{item.isValid ? "GSTIN valid" : item.formatValid ? "Review checksum" : "Needs fix"}</span>
    </span>
  );
}

export default function GstinFormatValidator() {
  const [input, setInput] = useState("29ABCDE1234F1ZW");
  const [bulkText, setBulkText] = useState(SAMPLE_GSTINS);
  const [mode, setMode] = useState("single");

  const single = useMemo(() => analyzeGstin(input), [input]);
  const results = useMemo(() => {
    const source = mode === "single" ? [input] : parseBulk(bulkText);
    return source.map((item, index) => analyzeGstin(item, index));
  }, [bulkText, input, mode]);

  const stats = useMemo(() => {
    const total = results.length;
    const valid = results.filter((item) => item.isValid).length;
    const statePass = results.filter((item) => item.stateValid).length;
    const checksumFail = results.filter((item) => item.formatValid && item.stateValid && !item.checksumValid).length;
    const uniqueStates = new Set(results.map((item) => item.stateName).filter((item) => item && item !== "Unknown state")).size;
    return {
      total,
      valid,
      statePass,
      checksumFail,
      uniqueStates,
      validRate: total ? Math.round((valid / total) * 100) : 0,
    };
  }, [results]);

  const copySummary = async () => {
    const text = buildSummary(results);
    if (navigator?.clipboard?.writeText) await navigator.clipboard.writeText(text);
  };

  const copyMasked = async () => {
    const text = results.map((item) => item.masked).join("\n");
    if (navigator?.clipboard?.writeText) await navigator.clipboard.writeText(text);
  };

  return (
    <main className="mx-auto w-full max-w-[1360px] px-4 pb-12 pt-8 text-[var(--foreground)] sm:px-6 sm:pt-10 lg:px-8">
      <header className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[linear-gradient(135deg,var(--section-highlight),var(--background)_52%,rgba(59,130,246,0.08))] p-5 text-center shadow-sm sm:p-7 xl:p-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-3 flex flex-wrap items-center justify-center gap-2 sm:mb-4">
            <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-[var(--section-highlight)] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[var(--primary)]">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span className="min-w-0 truncate">India tax utility</span>
            </span>
            <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-xs font-bold uppercase tracking-wide text-emerald-600">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              Local validation
            </span>
          </div>
          <h1 className="heading tool-heading-accent mx-auto max-w-5xl text-center text-4xl sm:text-5xl">GSTIN Format Validator</h1>
          <p className="description mx-auto mt-3 max-w-4xl text-center text-sm sm:text-base">
            Validate GSTIN format, decode state code, extract embedded PAN, verify checksum, mask output, and check bulk GSTIN lists locally in your browser.
          </p>
        </div>

        <section className="mx-auto mt-5 grid w-full max-w-6xl grid-cols-2 gap-3 sm:mt-8 lg:grid-cols-4 xl:gap-5">
          <MetricCard icon={ListChecks} label="GSTINs Checked" value={stats.total} detail={`${stats.validRate}% passed complete validation.`} />
          <MetricCard icon={CheckCircle} label="Valid GSTINs" value={stats.valid} detail="Format, state code, and checksum passed." tone="good" />
          <MetricCard icon={MapPin} label="State Codes" value={stats.uniqueStates} detail={`${stats.statePass} entries have recognized GST states.`} tone="default" />
          <MetricCard icon={AlertTriangle} label="Checksum Fails" value={stats.checksumFail} detail="Format passes but checksum needs review." tone={stats.checksumFail ? "warn" : "good"} />
        </section>
      </header>

      <div className="mt-5 grid min-w-0 gap-4 sm:mt-8 xl:grid-cols-[minmax(360px,0.85fr)_minmax(0,1.15fr)]">
        <section className="tool-card min-w-0 overflow-hidden">
          <div className="mb-5 flex min-w-0 items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
              <ScanLine className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Validate GSTIN</h2>
              <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">Use single mode for quick checks or bulk mode for vendor/customer lists.</p>
            </div>
          </div>

          <div className="tool-tab-grid mb-5">
            <button type="button" className={mode === "single" ? "btn-primary" : "btn-secondary"} onClick={() => setMode("single")}>
              Single GSTIN
            </button>
            <button type="button" className={mode === "bulk" ? "btn-primary" : "btn-secondary"} onClick={() => setMode("bulk")}>
              Bulk List
            </button>
          </div>

          {mode === "single" ? (
            <label className="block min-w-0">
              <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">GSTIN number</span>
              <input
                value={formatGstin(input)}
                onChange={(event) => setInput(normalizeGstin(event.target.value))}
                placeholder="29 ABCDE1234F 1Z 5"
                maxLength={19}
                className="h-14 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 font-mono text-base font-black tracking-[0.03em] text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)] sm:text-lg"
              />
            </label>
          ) : (
            <label className="block min-w-0">
              <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">GSTIN list</span>
              <textarea
                value={bulkText}
                onChange={(event) => setBulkText(event.target.value)}
                rows={10}
                placeholder="Paste GSTINs, one per line"
                className="w-full min-w-0 resize-y rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-3 font-mono text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
              />
            </label>
          )}

          <div className="mt-5 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-amber-600">
                <EyeOff className="h-5 w-5" />
              </span>
              <p className="min-w-0 break-words text-sm font-semibold text-[var(--muted-foreground)]">
                This tool validates GSTIN structure and checksum only. It does not verify GST registration status from government records.
              </p>
            </div>
          </div>

          <div className="tool-action-grid mt-6">
            <button type="button" className="btn-secondary" onClick={() => (mode === "single" ? setInput("29ABCDE1234F1ZW") : setBulkText(SAMPLE_GSTINS))}>
              <RefreshCw className="h-4 w-4" />
              Sample
            </button>
            <button type="button" className="btn-secondary" onClick={() => (mode === "single" ? setInput("") : setBulkText(""))}>
              <Trash2 className="h-4 w-4" />
              Clear
            </button>
            <button type="button" className="btn-primary" onClick={copySummary}>
              <Clipboard className="h-4 w-4" />
              Summary
            </button>
          </div>
        </section>

        <div className="grid min-w-0 content-start gap-4">
          <section className="tool-card min-w-0 overflow-hidden">
            <div className="mb-5 flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Validation Result</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">State, PAN, entity code, checksum, and masked copy.</p>
              </div>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                <ReceiptText className="h-5 w-5" />
              </span>
            </div>

            <div className="grid min-w-0 gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Formatted</p>
                <p className="mt-2 break-all font-mono text-lg font-black text-[var(--foreground)] sm:text-xl">{single.formatted || "NA"}</p>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Masked</p>
                <p className="mt-2 break-all font-mono text-lg font-black text-[var(--primary)] sm:text-xl">{single.masked}</p>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">State</p>
                <p className="mt-2 break-words text-lg font-black text-[var(--foreground)]">{single.stateName}</p>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Embedded PAN</p>
                <p className="mt-2 break-all font-mono text-lg font-black text-[var(--foreground)]">{single.pan || "NA"}</p>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Entity Code</p>
                <p className="mt-2 break-words text-lg font-black text-[var(--foreground)]">{single.entityCode || "NA"}</p>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Checksum</p>
                <p className="mt-2 break-words text-lg font-black text-[var(--foreground)]">{single.checksumValid ? "Pass" : `Expected ${single.expectedChecksum || "NA"}`}</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {(single.issues.length ? single.issues : ["GSTIN looks structurally valid and checksum passed."]).map((issue) => (
                <div
                  key={issue}
                  className={`flex min-w-0 items-start gap-3 rounded-lg border p-4 ${
                    single.issues.length
                      ? "border-rose-500/30 bg-rose-500/5 text-rose-700 dark:text-rose-300"
                      : "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300"
                  }`}
                >
                  {single.issues.length ? <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /> : <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" />}
                  <p className="min-w-0 break-words text-sm font-semibold">{issue}</p>
                </div>
              ))}
              {single.warnings.map((warning) => (
                <div key={warning} className="flex min-w-0 items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                  <p className="min-w-0 break-words text-sm font-semibold">{warning}</p>
                </div>
              ))}
            </div>
          </section>

          <aside className="tool-card min-w-0 overflow-hidden">
            <div className="mb-5 flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                <KeyRound className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">GSTIN Rules</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">Quick structure checklist.</p>
              </div>
            </div>
            <div className="grid min-w-0 gap-3 sm:grid-cols-2">
              {[
                "First 2 digits are GST state code.",
                "Next 10 characters should match PAN format.",
                "13th character is entity number for same PAN/state.",
                "14th character is usually Z and 15th is checksum.",
              ].map((tip) => (
                <div key={tip} className="flex min-w-0 items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" />
                  <p className="min-w-0 break-words text-sm font-semibold text-[var(--foreground)]">{tip}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>

      <section className="mt-4 min-w-0">
        <article className="tool-card min-w-0 overflow-hidden">
          <div className="mb-5 flex min-w-0 flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="break-words text-2xl font-black text-[var(--foreground)]">GSTIN List</h2>
              <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">Bulk outputs include state, PAN, checksum, issues, and masked copy.</p>
            </div>
            <div className="tool-action-grid w-full min-w-0 sm:w-auto">
              <button type="button" className="btn-secondary" onClick={copyMasked}>
                <Copy className="h-4 w-4" />
                Copy Masked
              </button>
              <button type="button" className="btn-primary" onClick={() => exportCsv(results)}>
                <Download className="h-4 w-4" />
                CSV
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {results.length ? (
              results.map((item) => (
                <div key={item.id} className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                  <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                    <div className="min-w-0">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <p className="break-all font-mono text-lg font-black text-[var(--foreground)]">{item.masked}</p>
                        <StatusPill item={item} />
                      </div>
                      <p className="mt-2 break-words text-sm text-[var(--muted-foreground)]">
                        {item.stateCode || "NA"} · {item.stateName} · PAN: {item.pan || "NA"}
                      </p>
                    </div>
                    <div className="min-w-0 rounded-md bg-[var(--section-highlight)] px-3 py-2 text-sm font-bold text-[var(--primary)]">
                      {item.checksumValid ? "Checksum pass" : "Review"}
                    </div>
                  </div>
                  {item.issues.length || item.warnings.length ? (
                    <div className="mt-3 space-y-1">
                      {[...item.issues, ...item.warnings].map((note) => (
                        <p key={note} className="break-words text-sm font-medium text-[var(--muted-foreground)]">
                          - {note}
                        </p>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--background)] p-8 text-center">
                <p className="break-words text-sm font-semibold text-[var(--muted-foreground)]">Add GSTINs to see validation outputs.</p>
              </div>
            )}
          </div>
        </article>
      </section>
    </main>
  );
}
