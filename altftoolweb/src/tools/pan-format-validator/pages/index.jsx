"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Clipboard,
  Copy,
  Download,
  FileCheck2,
  IdCard,
  ListChecks,
  RefreshCw,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Trash2,
  XCircle,
} from "lucide-react";

const SAMPLE_PANS = `ABCDE1234F
BNZAA2318J
AAAAA0000A
ABCPK1234Q
abcde-1234-f
AB12E1234F
ABCDE12345
PQRST9876Z`;

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const HOLDER_TYPES = {
  A: "Association of Persons",
  B: "Body of Individuals",
  C: "Company",
  F: "Firm / LLP",
  G: "Government",
  H: "HUF",
  J: "Artificial Juridical Person",
  L: "Local Authority",
  P: "Individual",
  T: "Trust",
};

function normalizePan(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10);
}

function formatPan(value) {
  const normalized = normalizePan(value);
  if (normalized.length <= 5) return normalized;
  if (normalized.length <= 9) return `${normalized.slice(0, 5)} ${normalized.slice(5)}`;
  return `${normalized.slice(0, 5)} ${normalized.slice(5, 9)} ${normalized.slice(9)}`;
}

function maskPan(value) {
  const normalized = normalizePan(value);
  if (normalized.length !== 10) return normalized || "NA";
  return `${normalized.slice(0, 2)}***${normalized.slice(5, 9)}${normalized.slice(9)}`;
}

function getIssues(normalized) {
  const issues = [];

  if (!normalized) {
    issues.push("PAN is empty.");
    return issues;
  }
  if (normalized.length !== 10) issues.push("PAN must contain exactly 10 characters.");
  if (!/^[A-Z]{0,5}/.test(normalized.slice(0, 5)) || /[^A-Z]/.test(normalized.slice(0, 5))) {
    issues.push("First 5 characters must be letters.");
  }
  if (normalized.length >= 6 && /[^0-9]/.test(normalized.slice(5, 9))) {
    issues.push("Characters 6 to 9 must be digits.");
  }
  if (normalized.length >= 10 && !/^[A-Z]$/.test(normalized[9])) {
    issues.push("Last character must be a letter.");
  }
  if (normalized.length >= 4 && !HOLDER_TYPES[normalized[3]]) {
    issues.push("Fourth character is not a known PAN holder type.");
  }
  if (normalized.length === 10 && !PAN_REGEX.test(normalized)) {
    issues.push("PAN does not match the required ABCDE1234F pattern.");
  }

  return [...new Set(issues)];
}

function analyzePan(raw, index = 0) {
  const normalized = normalizePan(raw);
  const issues = getIssues(normalized);
  const isValid = issues.length === 0 && PAN_REGEX.test(normalized);
  const holderCode = normalized[3] || "";
  const holderType = HOLDER_TYPES[holderCode] || "Unknown";
  const nameInitial = normalized[4] || "";
  const series = normalized.slice(0, 3);
  const numericBlock = normalized.slice(5, 9);
  const score = isValid ? 100 : Math.max(0, 100 - issues.length * 25 - Math.max(0, 10 - normalized.length) * 5);

  const warnings = [];
  if (isValid && /^(.)\1{4}/.test(normalized.slice(0, 5))) {
    warnings.push("First five letters are repetitive. Format is valid, but double-check the source.");
  }
  if (isValid && numericBlock === "0000") {
    warnings.push("Numeric block is 0000. Format is valid, but this is unusual.");
  }

  return {
    id: `${index}-${normalized || "empty"}`,
    raw: String(raw || "").trim(),
    normalized,
    formatted: formatPan(normalized),
    masked: maskPan(normalized),
    isValid,
    holderCode,
    holderType,
    nameInitial,
    series,
    numericBlock,
    score: Math.min(100, score),
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
  const invalid = results.length - valid;
  const holderCounts = results.reduce((acc, item) => {
    if (!item.isValid) return acc;
    acc[item.holderType] = (acc[item.holderType] || 0) + 1;
    return acc;
  }, {});

  return [
    "PAN Format Validator Summary",
    `Total PANs checked: ${results.length}`,
    `Valid format: ${valid}`,
    `Invalid format: ${invalid}`,
    "Holder type split:",
    ...Object.entries(holderCounts).map(([type, count]) => `- ${type}: ${count}`),
    "Note: This validates PAN format only. It does not verify identity or government records.",
  ].join("\n");
}

function exportCsv(results) {
  const rows = [
    ["Input", "Normalized PAN", "Masked PAN", "Status", "Holder Type", "Holder Code", "Name Initial", "Issues", "Warnings"],
    ...results.map((item) => [
      item.raw,
      item.normalized,
      item.masked,
      item.isValid ? "Valid" : "Invalid",
      item.holderType,
      item.holderCode,
      item.nameInitial,
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
  anchor.download = "pan-format-validation.csv";
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

function HolderPill({ item }) {
  return (
    <span
      className={`inline-flex max-w-full items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${
        item.isValid
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "bg-rose-500/10 text-rose-700 dark:text-rose-300"
      }`}
    >
      {item.isValid ? <CheckCircle className="h-3.5 w-3.5 shrink-0" /> : <XCircle className="h-3.5 w-3.5 shrink-0" />}
      <span className="min-w-0 truncate">{item.isValid ? item.holderType : "Invalid"}</span>
    </span>
  );
}

export default function PanFormatValidator() {
  const [input, setInput] = useState("ABCDE1234F");
  const [bulkText, setBulkText] = useState(SAMPLE_PANS);
  const [mode, setMode] = useState("single");

  const single = useMemo(() => analyzePan(input), [input]);
  const results = useMemo(() => {
    const source = mode === "single" ? [input] : parseBulk(bulkText);
    return source.map((item, index) => analyzePan(item, index));
  }, [bulkText, input, mode]);

  const stats = useMemo(() => {
    const total = results.length;
    const valid = results.filter((item) => item.isValid).length;
    const invalid = total - valid;
    const unique = new Set(results.map((item) => item.normalized).filter(Boolean)).size;
    const holderCounts = results.reduce((acc, item) => {
      if (!item.isValid) return acc;
      acc[item.holderType] = (acc[item.holderType] || 0) + 1;
      return acc;
    }, {});
    const topHolder = Object.entries(holderCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "NA";

    return {
      total,
      valid,
      invalid,
      unique,
      validRate: total ? Math.round((valid / total) * 100) : 0,
      topHolder,
      holderCounts,
    };
  }, [results]);

  const copySummary = async () => {
    const text = buildSummary(results);
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    }
  };

  const copyNormalized = async () => {
    const text = results.map((item) => item.normalized).filter(Boolean).join("\n");
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <main className="mx-auto w-full max-w-[1360px] px-4 pb-12 pt-8 text-[var(--foreground)] sm:px-6 sm:pt-10 lg:px-8">
        <header className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[linear-gradient(135deg,var(--section-highlight),var(--background)_52%,rgba(59,130,246,0.08))] p-5 text-center shadow-sm sm:p-7 xl:p-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-3 flex flex-wrap items-center justify-center gap-2 sm:mb-4">
              <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-[var(--section-highlight)] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[var(--primary)]">
                <Sparkles className="h-4 w-4 shrink-0" />
                <span className="min-w-0 truncate">India document utility</span>
              </span>
              <span className={`inline-flex max-w-full items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide ${single.isValid ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"}`}>
                {single.isValid ? <ShieldCheck className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
                {single.isValid ? "Valid Format" : "Needs Fix"}
              </span>
            </div>
            <h1 className="heading tool-heading-accent mx-auto max-w-5xl text-center text-4xl sm:text-5xl">PAN Format Validator</h1>
            <p className="description mx-auto mt-3 max-w-4xl text-center text-sm sm:text-base">
              Validate Indian PAN format, clean pasted values, detect holder type from the fourth character, mask PAN safely, and check bulk lists locally in your browser.
            </p>
          </div>

          <section className="mx-auto mt-5 grid w-full max-w-6xl grid-cols-2 gap-3 sm:mt-8 lg:grid-cols-4 xl:gap-5">
            <MetricCard icon={ListChecks} label="PANs Checked" value={stats.total} detail={`${stats.unique} unique normalized values.`} />
            <MetricCard icon={CheckCircle} label="Valid Format" value={stats.valid} detail={`${stats.validRate}% passed local format checks.`} tone="good" />
            <MetricCard icon={XCircle} label="Invalid Format" value={stats.invalid} detail="Review length, letter, and digit positions." tone={stats.invalid ? "bad" : "good"} />
            <MetricCard icon={IdCard} label="Top Holder Type" value={stats.topHolder} detail="Based on the fourth PAN character." tone="default" />
          </section>
        </header>

        <div className="mt-5 grid min-w-0 gap-4 sm:mt-8 xl:grid-cols-[minmax(320px,430px)_minmax(0,1fr)]">
          <section className="tool-card min-w-0 overflow-hidden">
            <div className="mb-5 flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                <ScanLine className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Validate PAN</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">
                  Use single mode for quick checks or bulk mode for pasted lists.
                </p>
              </div>
            </div>

            <div className="tool-tab-grid mb-5">
              <button type="button" className={mode === "single" ? "btn-primary" : "btn-secondary"} onClick={() => setMode("single")}>
                Single PAN
              </button>
              <button type="button" className={mode === "bulk" ? "btn-primary" : "btn-secondary"} onClick={() => setMode("bulk")}>
                Bulk List
              </button>
            </div>

            {mode === "single" ? (
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">PAN number</span>
                <input
                  value={formatPan(input)}
                  onChange={(event) => setInput(normalizePan(event.target.value))}
                  placeholder="ABCDE 1234 F"
                  maxLength={12}
                  className="h-14 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-base font-black uppercase tracking-[0.08em] sm:text-xl sm:tracking-[0.16em] text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
            ) : (
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">PAN list</span>
                <textarea
                  value={bulkText}
                  onChange={(event) => setBulkText(event.target.value)}
                  rows={10}
                  placeholder="Paste PAN numbers, one per line"
                  className="w-full min-w-0 resize-y rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-3 font-mono text-sm uppercase text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
            )}

            <div className="mt-5 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-words text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Expected pattern</p>
                  <p className="mt-1 break-words font-mono text-lg font-black text-[var(--foreground)]">AAAAA9999A</p>
                </div>
                <HolderPill item={single} />
              </div>
              <p className="mt-3 break-words text-sm text-[var(--muted-foreground)]">
                PAN format check only. This does not verify ownership, identity, or official government records.
              </p>
            </div>

            <div className="tool-action-grid mt-6">
              <button type="button" className="btn-secondary" onClick={() => (mode === "single" ? setInput("ABCDE1234F") : setBulkText(SAMPLE_PANS))}>
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

          <section className="tool-card min-w-0 overflow-hidden">
            <div className="mb-5 flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Result Details</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">
                  Normalized PAN, masked output, holder type, and correction hints.
                </p>
              </div>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                <FileCheck2 className="h-5 w-5" />
              </span>
            </div>

            <div className="grid min-w-0 gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Normalized</p>
                <p className="mt-2 break-all font-mono text-2xl font-black text-[var(--foreground)]">{single.normalized || "NA"}</p>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Masked</p>
                <p className="mt-2 break-all font-mono text-2xl font-black text-[var(--foreground)]">{single.masked}</p>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Holder type</p>
                <p className="mt-2 break-words text-xl font-black text-[var(--foreground)]">{single.holderType}</p>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Name initial</p>
                <p className="mt-2 break-words text-xl font-black text-[var(--foreground)]">{single.nameInitial || "NA"}</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {(single.issues.length ? single.issues : ["PAN matches the required 5 letters + 4 digits + 1 letter format."]).map((issue) => (
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
        </div>

        <section className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
          <article className="tool-card min-w-0 overflow-hidden">
            <div className="mb-5 flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Bulk Results</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">Every row stays local and exportable.</p>
              </div>
              <div className="tool-action-grid w-full min-w-0 sm:w-auto">
                <button type="button" className="btn-secondary" onClick={copyNormalized}>
                  <Copy className="h-4 w-4" />
                  Copy PANs
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
                          <p className="break-all font-mono text-lg font-black text-[var(--foreground)]">{item.normalized || "EMPTY"}</p>
                          <HolderPill item={item} />
                        </div>
                        <p className="mt-2 break-words text-sm text-[var(--muted-foreground)]">
                          Input: {item.raw || "Empty"} · Masked: {item.masked}
                        </p>
                      </div>
                      <div className="min-w-0 rounded-md bg-[var(--section-highlight)] px-3 py-2 text-sm font-bold text-[var(--primary)]">
                        Score {item.score}
                      </div>
                    </div>
                    <div className="mt-3 grid min-w-0 gap-3 md:grid-cols-3">
                      <p className="break-words text-sm text-[var(--muted-foreground)]">
                        <span className="font-bold text-[var(--foreground)]">Type:</span> {item.holderType}
                      </p>
                      <p className="break-words text-sm text-[var(--muted-foreground)]">
                        <span className="font-bold text-[var(--foreground)]">Series:</span> {item.series || "NA"}
                      </p>
                      <p className="break-words text-sm text-[var(--muted-foreground)]">
                        <span className="font-bold text-[var(--foreground)]">Initial:</span> {item.nameInitial || "NA"}
                      </p>
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
                  <p className="break-words text-sm font-semibold text-[var(--muted-foreground)]">Add PAN numbers to see validation results.</p>
                </div>
              )}
            </div>
          </article>

          <aside className="tool-card min-w-0 overflow-hidden">
            <div className="mb-5 flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Holder Codes</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">Fourth PAN character meaning.</p>
              </div>
            </div>
            <div className="space-y-2">
              {Object.entries(HOLDER_TYPES).map(([code, label]) => (
                <div key={code} className="flex min-w-0 items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] font-black text-[var(--primary)]">{code}</span>
                  <span className="min-w-0 flex-1 break-words text-sm font-semibold text-[var(--foreground)]">{label}</span>
                  <span className="shrink-0 text-sm font-bold text-[var(--muted-foreground)]">{stats.holderCounts[label] || 0}</span>
                </div>
              ))}
            </div>
          </aside>
        </section>
    </main>
  );
}
