"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Clipboard,
  Copy,
  Download,
  EyeOff,
  Fingerprint,
  KeyRound,
  ListChecks,
  Lock,
  RefreshCw,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Trash2,
  XCircle,
} from "lucide-react";

const SAMPLE_AADHAARS = `2345 6789 0124
9876 5432 1096
3456-7890-1238
456789012341
abcd 1234 5678
1111 1111 1111`;

const D_TABLE = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

const P_TABLE = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

const MASK_MODES = {
  last4: { label: "Show last 4", visibleStart: 0, visibleEnd: 4 },
  last2: { label: "Show last 2", visibleStart: 0, visibleEnd: 2 },
  first4Last4: { label: "Show first & last 4", visibleStart: 4, visibleEnd: 4 },
  fullMask: { label: "Full mask", visibleStart: 0, visibleEnd: 0 },
};

function normalizeAadhaar(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 12);
}

function formatAadhaar(value) {
  const normalized = normalizeAadhaar(value);
  return normalized.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

function verhoeffValid(value) {
  const digits = normalizeAadhaar(value);
  if (digits.length !== 12) return false;
  let checksum = 0;
  const reversed = digits.split("").reverse().map(Number);

  for (let index = 0; index < reversed.length; index += 1) {
    checksum = D_TABLE[checksum][P_TABLE[index % 8][reversed[index]]];
  }

  return checksum === 0;
}

function maskAadhaar(value, modeKey, maskChar) {
  const normalized = normalizeAadhaar(value);
  const mode = MASK_MODES[modeKey] || MASK_MODES.last4;
  const safeMask = String(maskChar || "X").slice(0, 1) || "X";

  if (!normalized) return "NA";

  const visibleStart = normalized.slice(0, mode.visibleStart);
  const visibleEnd = mode.visibleEnd ? normalized.slice(-mode.visibleEnd) : "";
  const hiddenLength = Math.max(0, normalized.length - visibleStart.length - visibleEnd.length);
  const masked = `${visibleStart}${safeMask.repeat(hiddenLength)}${visibleEnd}`;
  return masked.replace(/(.{4})(?=.)/g, "$1 ").trim();
}

function getIssues(raw) {
  const original = String(raw || "").trim();
  const normalized = normalizeAadhaar(raw);
  const issues = [];

  if (!original) {
    issues.push("Aadhaar input is empty.");
    return issues;
  }
  if (/[A-Za-z]/.test(original)) issues.push("Input contains letters. Aadhaar should contain digits only.");
  if (normalized.length !== 12) issues.push("Aadhaar should contain exactly 12 digits.");
  if (normalized.length === 12 && /^[01]/.test(normalized)) issues.push("Aadhaar should not start with 0 or 1.");
  if (/^(\d)\1{11}$/.test(normalized)) issues.push("All digits are repeated, which is not a realistic Aadhaar pattern.");
  if (normalized.length === 12 && !verhoeffValid(normalized)) issues.push("Checksum does not pass the Verhoeff validation check.");

  return [...new Set(issues)];
}

function analyzeAadhaar(raw, modeKey, maskChar, index = 0) {
  const normalized = normalizeAadhaar(raw);
  const issues = getIssues(raw);
  const isFormatValid = normalized.length === 12 && !issues.some((issue) => issue.includes("exactly") || issue.includes("letters"));
  const checksumValid = normalized.length === 12 && verhoeffValid(normalized);
  const isValid = issues.length === 0 && checksumValid;
  const warnings = [];

  if (normalized.length === 12 && normalized.startsWith("0")) {
    warnings.push("Starts with 0. Format can still be checked, but confirm source carefully.");
  }
  if (isFormatValid && !checksumValid) {
    warnings.push("Use masked output only after confirming source quality.");
  }

  const privacyScore = modeKey === "fullMask" ? 100 : modeKey === "last2" ? 92 : modeKey === "last4" ? 84 : 68;

  return {
    id: `${index}-${normalized || "empty"}`,
    raw: String(raw || "").trim(),
    normalized,
    formatted: formatAadhaar(normalized),
    masked: maskAadhaar(normalized, modeKey, maskChar),
    isValid,
    isFormatValid,
    checksumValid,
    privacyScore,
    issues,
    warnings,
  };
}

function parseBulk(text) {
  return String(text || "")
    .split(/[\n,;|\t]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildSummary(results) {
  const valid = results.filter((item) => item.isValid).length;
  const checksumFailed = results.filter((item) => item.normalized.length === 12 && !item.checksumValid).length;

  return [
    "Aadhaar Masking Tool Summary",
    `Total entries checked: ${results.length}`,
    `Checksum-valid Aadhaar format: ${valid}`,
    `Checksum failed: ${checksumFailed}`,
    "Masked output:",
    ...results.map((item) => `- ${item.masked}`),
    "Note: This tool runs locally and masks Aadhaar numbers. It does not verify identity or official UIDAI records.",
  ].join("\n");
}

function exportCsv(results) {
  const rows = [
    ["Input", "Normalized", "Masked", "Format Status", "Checksum", "Issues", "Warnings"],
    ...results.map((item) => [
      item.raw,
      item.normalized,
      item.masked,
      item.isFormatValid ? "12-digit format" : "Invalid format",
      item.checksumValid ? "Pass" : "Fail",
      item.issues.join(" | "),
      item.warnings.join(" | "),
    ]),
  ];
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "aadhaar-masked-list.csv";
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
          : item.isFormatValid
            ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
            : "bg-rose-500/10 text-rose-700 dark:text-rose-300"
      }`}
    >
      {item.isValid ? <CheckCircle className="h-3.5 w-3.5 shrink-0" /> : item.isFormatValid ? <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> : <XCircle className="h-3.5 w-3.5 shrink-0" />}
      <span className="min-w-0 truncate">{item.isValid ? "Checksum pass" : item.isFormatValid ? "Format only" : "Invalid"}</span>
    </span>
  );
}

export default function AadhaarMaskingTool() {
  const [input, setInput] = useState("2345 6789 0124");
  const [bulkText, setBulkText] = useState(SAMPLE_AADHAARS);
  const [mode, setMode] = useState("single");
  const [maskMode, setMaskMode] = useState("last4");
  const [maskChar, setMaskChar] = useState("X");

  const single = useMemo(() => analyzeAadhaar(input, maskMode, maskChar), [input, maskChar, maskMode]);
  const results = useMemo(() => {
    const source = mode === "single" ? [input] : parseBulk(bulkText);
    return source.map((item, index) => analyzeAadhaar(item, maskMode, maskChar, index));
  }, [bulkText, input, maskChar, maskMode, mode]);

  const stats = useMemo(() => {
    const total = results.length;
    const valid = results.filter((item) => item.isValid).length;
    const formatOnly = results.filter((item) => item.isFormatValid && !item.isValid).length;
    const invalid = total - valid - formatOnly;
    const avgPrivacy = total ? Math.round(results.reduce((sum, item) => sum + item.privacyScore, 0) / total) : 0;
    return {
      total,
      valid,
      formatOnly,
      invalid,
      avgPrivacy,
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
                <span className="min-w-0 truncate">Privacy-first document tool</span>
              </span>
              <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-xs font-bold uppercase tracking-wide text-emerald-600">
                <Lock className="h-4 w-4 shrink-0" />
                Browser-side only
              </span>
            </div>
            <h1 className="heading tool-heading-accent mx-auto max-w-5xl text-center text-4xl sm:text-5xl">Aadhaar Masking Tool</h1>
            <p className="description mx-auto mt-3 max-w-4xl text-center text-sm sm:text-base">
              Mask Aadhaar numbers before sharing documents, normalize pasted values, check 12-digit format, run checksum checks, and export privacy-safe masked lists locally.
            </p>
          </div>

          <section className="mx-auto mt-5 grid w-full max-w-6xl grid-cols-2 gap-3 sm:mt-8 lg:grid-cols-4 xl:gap-5">
            <MetricCard icon={ListChecks} label="Entries Checked" value={stats.total} detail="Single or bulk entries processed locally." />
            <MetricCard icon={ShieldCheck} label="Checksum Pass" value={stats.valid} detail="Verhoeff checksum passed." tone="good" />
            <MetricCard icon={AlertTriangle} label="Format Only" value={stats.formatOnly} detail="12 digits present, checksum failed." tone={stats.formatOnly ? "warn" : "good"} />
            <MetricCard icon={Lock} label="Privacy Score" value={`${stats.avgPrivacy}%`} detail={`${MASK_MODES[maskMode].label} masking mode.`} />
          </section>
        </header>

        <div className="mt-5 grid min-w-0 gap-4 sm:mt-8 xl:grid-cols-[minmax(360px,0.85fr)_minmax(0,1.15fr)]">
          <section className="tool-card min-w-0 overflow-hidden">
            <div className="mb-5 flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                <ScanLine className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Mask Aadhaar</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">
                  Enter one Aadhaar or paste a list. Raw values never leave your browser.
                </p>
              </div>
            </div>

            <div className="tool-tab-grid mb-5">
              <button type="button" className={mode === "single" ? "btn-primary" : "btn-secondary"} onClick={() => setMode("single")}>
                Single
              </button>
              <button type="button" className={mode === "bulk" ? "btn-primary" : "btn-secondary"} onClick={() => setMode("bulk")}>
                Bulk
              </button>
            </div>

            {mode === "single" ? (
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Aadhaar number</span>
                <input
                  value={formatAadhaar(input)}
                  onChange={(event) => setInput(normalizeAadhaar(event.target.value))}
                  placeholder="1234 5678 9012"
                  maxLength={14}
                  inputMode="numeric"
                  className="h-14 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 font-mono text-base font-black tracking-[0.04em] sm:text-xl sm:tracking-[0.08em] text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
            ) : (
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Aadhaar list</span>
                <textarea
                  value={bulkText}
                  onChange={(event) => setBulkText(event.target.value)}
                  rows={10}
                  placeholder="Paste Aadhaar numbers, one per line"
                  className="w-full min-w-0 resize-y rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-3 font-mono text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
            )}

            <div className="mt-5 grid min-w-0 gap-4 md:grid-cols-[minmax(0,1fr)_110px]">
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Masking mode</span>
                <select
                  value={maskMode}
                  onChange={(event) => setMaskMode(event.target.value)}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                >
                  {Object.entries(MASK_MODES).map(([key, item]) => (
                    <option key={key} value={key}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Mask char</span>
                <input
                  value={maskChar}
                  onChange={(event) => setMaskChar(event.target.value.slice(0, 1) || "X")}
                  maxLength={1}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-center text-lg font-black text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
            </div>

            <div className="mt-5 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-amber-600">
                  <EyeOff className="h-5 w-5" />
                </span>
                <p className="min-w-0 break-words text-sm font-semibold text-[var(--muted-foreground)]">
                  This tool masks Aadhaar numbers and checks format/checksum only. It does not verify identity, demographic details, or UIDAI records.
                </p>
              </div>
            </div>

            <div className="tool-action-grid mt-6">
              <button type="button" className="btn-secondary" onClick={() => (mode === "single" ? setInput("234567890124") : setBulkText(SAMPLE_AADHAARS))}>
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
                  <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Privacy Result</h2>
                  <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">
                    Clean number, masked output, checksum status, and privacy-safe copy.
                  </p>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                  <Fingerprint className="h-5 w-5" />
                </span>
              </div>

              <div className="grid min-w-0 gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Formatted</p>
                  <p className="mt-2 break-all font-mono text-xl font-black text-[var(--foreground)] sm:text-2xl">{single.formatted || "NA"}</p>
                </div>
                <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Masked</p>
                  <p className="mt-2 break-all font-mono text-xl font-black text-[var(--primary)] sm:text-2xl">{single.masked}</p>
                </div>
                <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Checksum</p>
                  <p className="mt-2 break-words text-xl font-black text-[var(--foreground)]">{single.checksumValid ? "Pass" : "Fail / Not checked"}</p>
                </div>
                <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Privacy score</p>
                  <p className="mt-2 break-words text-xl font-black text-[var(--foreground)]">{single.privacyScore}%</p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {(single.issues.length ? single.issues : ["Aadhaar is masked and ready for privacy-safe sharing."]).map((issue) => (
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
                  <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Safe Sharing Rules</h2>
                  <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">Small checklist for privacy-safe use.</p>
                </div>
              </div>
              <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                {[
                  "Prefer showing only last 4 digits unless a process requires more.",
                  "Never upload raw Aadhaar numbers to unknown services.",
                  "Use masked exports for reports, tickets, and screenshots.",
                  "Checksum pass is not identity verification.",
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
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Masked List</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">Bulk outputs are masked by default and export-ready.</p>
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
                          Input: {item.raw || "Empty"} · Clean digits: {item.normalized || "NA"}
                        </p>
                      </div>
                      <div className="min-w-0 rounded-md bg-[var(--section-highlight)] px-3 py-2 text-sm font-bold text-[var(--primary)]">
                        Privacy {item.privacyScore}%
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
                  <p className="break-words text-sm font-semibold text-[var(--muted-foreground)]">Add Aadhaar numbers to see masked outputs.</p>
                </div>
              )}
            </div>
          </article>
        </section>
    </main>
  );
}
