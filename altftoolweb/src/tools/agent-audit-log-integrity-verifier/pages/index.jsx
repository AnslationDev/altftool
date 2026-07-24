"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  CircleHelp,
  Clock3,
  Download,
  FileJson2,
  Fingerprint,
  Hash,
  Info,
  Link2,
  ListOrdered,
  LockKeyhole,
  RefreshCw,
  ScanLine,
  Settings2,
  ShieldCheck,
  Sparkles,
  Table2,
  Upload,
  XCircle,
} from "lucide-react";
import {
  buildCountsOnlyReport,
  discoverFieldPaths,
  parseAuditLog,
  verifyAuditStructure,
  verifySha256Chain,
} from "../lib/auditIntegrity.mjs";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_ENTRIES = 25_000;

const SAMPLE_LOG = JSON.stringify(
  [
    {
      eventId: "evt-001",
      sequence: 1,
      timestamp: "2026-07-24T08:00:00.000Z",
      previousHash: "GENESIS",
      hash: "a".repeat(64),
      action: { tool: "search", outcome: "allowed" },
    },
    {
      eventId: "evt-002",
      sequence: 2,
      timestamp: "2026-07-24T08:00:02.000Z",
      previousHash: "a".repeat(64),
      hash: "b".repeat(64),
      action: { tool: "read", outcome: "allowed" },
    },
    {
      eventId: "evt-002",
      sequence: 4,
      timestamp: "2026-07-24T07:59:59.000Z",
      previousHash: "broken-link",
      hash: "c".repeat(64),
      action: { tool: "write", outcome: "denied" },
    },
  ],
  null,
  2,
);

const EMPTY_CONFIG = {
  idPath: "",
  sequencePath: "",
  timestampPath: "",
  previousHashPath: "",
  hashPath: "",
  expectedGenesisHash: "",
  hashRecipe: "disabled",
};

const CONTROL_CLASS =
  "min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-[3px] focus:ring-primary/35 disabled:cursor-not-allowed disabled:opacity-60";

function ActionButton({
  children,
  icon: Icon,
  onClick,
  disabled = false,
  primary = false,
  className = "",
}) {
  const variant = primary
    ? "border-primary bg-primary text-primary-foreground hover:bg-primary-hover"
    : "border-border bg-surface text-foreground hover:border-primary hover:text-primary";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-4 text-sm font-bold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60 ${variant} ${className}`}
    >
      {Icon ? <Icon className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

function StateBadge({ state }) {
  if (state === "verified") {
    return (
      <span className="inline-flex items-center gap-1 rounded-pill border border-success bg-success-soft px-3 py-1 text-xs font-bold text-success">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
        Verified
      </span>
    );
  }
  if (state === "mismatch") {
    return (
      <span className="inline-flex items-center gap-1 rounded-pill border border-danger bg-danger-soft px-3 py-1 text-xs font-bold text-danger">
        <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
        Mismatch
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-pill border border-border bg-surface-soft px-3 py-1 text-xs font-bold text-muted-foreground">
      <CircleHelp className="h-3.5 w-3.5" aria-hidden="true" />
      Not checkable
    </span>
  );
}

function CheckCard({ title, description, icon: Icon, state, metrics }) {
  const borderClass =
    state === "verified"
      ? "border-success"
      : state === "mismatch"
        ? "border-danger"
        : "border-border";

  return (
    <article className={`rounded-lg border bg-surface p-4 shadow-sm ${borderClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
          <h3 className="font-bold text-foreground">{title}</h3>
        </div>
        <StateBadge state={state} />
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      <dl className="mt-4 grid grid-cols-2 gap-2">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-md border border-border bg-surface-soft p-3">
            <dt className="text-xs font-bold text-muted-foreground">{metric.label}</dt>
            <dd className="mt-1 text-lg font-extrabold text-foreground">{metric.value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

function FieldPathInput({ label, value, onChange, helper, listId }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold text-muted-foreground">{label}</span>
      <input
        type="text"
        value={value}
        list={listId}
        placeholder="Leave blank = not checkable"
        onChange={(event) => onChange(event.target.value)}
        className={CONTROL_CLASS}
      />
      <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{helper}</span>
    </label>
  );
}

function downloadText(contents, filename) {
  const blob = new Blob([contents], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function AgentAuditLogIntegrityVerifier() {
  const [source, setSource] = useState("");
  const [sourceName, setSourceName] = useState("Pasted log");
  const [arrayPath, setArrayPath] = useState("");
  const [parseResult, setParseResult] = useState(null);
  const [fieldPaths, setFieldPaths] = useState([]);
  const [config, setConfig] = useState(EMPTY_CONFIG);
  const [verification, setVerification] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);

  const numberFormatter = useMemo(() => new Intl.NumberFormat("en-IN"), []);

  const resetVerification = () => {
    setVerification(null);
    setMessage("");
  };

  const resetAll = () => {
    setSource("");
    setSourceName("Pasted log");
    setArrayPath("");
    setParseResult(null);
    setFieldPaths([]);
    setConfig(EMPTY_CONFIG);
    setVerification(null);
    setIsVerifying(false);
    setError("");
    setMessage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const parseSource = (text = source, name = sourceName) => {
    setError("");
    setMessage("");
    setVerification(null);
    const nextParse = parseAuditLog(text, {
      arrayPath: arrayPath.trim(),
      maxEntries: MAX_ENTRIES,
    });
    if (!nextParse.ok) {
      setParseResult(null);
      setFieldPaths([]);
      setError(nextParse.errors.join(" "));
      return;
    }
    const discovery = discoverFieldPaths(nextParse.entries);
    setParseResult(nextParse);
    setFieldPaths(discovery.paths);
    setConfig({ ...EMPTY_CONFIG, ...discovery.mapping });
    setSourceName(name);
    setMessage(
      `${numberFormatter.format(nextParse.entries.length)} entries parsed locally. Confirm every field path before checking integrity.`,
    );
  };

  const loadFile = async (file) => {
    setError("");
    if (!file) return;
    if (!/\.(json|jsonl|ndjson|txt)$/i.test(file.name)) {
      setError("Choose a JSON, JSONL, NDJSON, or plain-text log file.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("Choose a log file smaller than 10 MB.");
      return;
    }
    try {
      const text = await file.text();
      setSource(text);
      parseSource(text, file.name);
    } catch {
      setError("The browser could not read this text file.");
    }
  };

  const useSample = () => {
    setSource(SAMPLE_LOG);
    setArrayPath("");
    setError("");
    const nextParse = parseAuditLog(SAMPLE_LOG, { maxEntries: MAX_ENTRIES });
    const discovery = discoverFieldPaths(nextParse.entries);
    setParseResult(nextParse);
    setFieldPaths(discovery.paths);
    setConfig({ ...EMPTY_CONFIG, ...discovery.mapping });
    setSourceName("Safe sample log");
    setVerification(null);
    setMessage(
      "Safe sample loaded. It intentionally contains duplicate IDs, a sequence gap, a timestamp regression, and a broken link.",
    );
  };

  const updateConfig = (field, value) => {
    setConfig((current) => ({ ...current, [field]: value }));
    resetVerification();
  };

  const runVerification = async () => {
    if (!parseResult) {
      setError("Parse an audit log before running checks.");
      return;
    }
    setError("");
    setMessage("");
    setIsVerifying(true);
    try {
      const structure = verifyAuditStructure(parseResult.entries, config);
      const hash =
        config.hashRecipe === "disabled"
          ? {
              state: "not-checkable",
              checkedCount: 0,
              verifiedCount: 0,
              mismatchCount: 0,
              notCheckableCount: parseResult.entries.length,
              rowResults: [],
              reason: "SHA-256 recomputation is disabled.",
            }
          : await verifySha256Chain(parseResult.entries, config);
      setVerification({ structure, hash });
      setMessage(
        config.hashRecipe === "disabled"
          ? "Structural checks complete. SHA-256 recomputation was not requested."
          : "Structural and configured SHA-256 checks complete. Read each state and limitation before drawing conclusions.",
      );
    } catch (verificationError) {
      setError(verificationError.message || "The local verification could not be completed.");
    } finally {
      setIsVerifying(false);
    }
  };

  const issueRows = useMemo(() => {
    if (!verification) return [];
    const rows = new Map(
      verification.structure.rowIssues.map((row) => [
        row.index,
        { index: row.index, rowNumber: row.rowNumber, issues: [...row.issues] },
      ]),
    );
    verification.hash.rowResults.forEach((row) => {
      if (row.state === "verified") return;
      const current = rows.get(row.index) || {
        index: row.index,
        rowNumber: row.rowNumber,
        issues: [],
      };
      current.issues.push(
        row.state === "mismatch" ? "Canonical SHA-256 mismatch" : "SHA-256 not checkable",
      );
      rows.set(row.index, current);
    });
    return [...rows.values()].sort((left, right) => left.index - right.index);
  }, [verification]);

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <header className="mx-auto max-w-4xl text-center">
          <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-pill border border-primary/30 bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Schema-driven verification
            </span>
            <span className="inline-flex items-center gap-2 rounded-pill border border-border bg-surface px-3 py-1 text-xs font-bold text-foreground">
              <LockKeyhole className="h-4 w-4 text-primary" aria-hidden="true" />
              Local only
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Agent Audit Log Integrity Verifier
          </h1>
          <p className="mx-auto mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground">
            Inspect JSON or JSONL audit-entry continuity and, only when its exact recipe is
            known, recompute a SHA-256 canonical-entry hash chain in this browser.
          </p>
        </header>

        <section className="rounded-lg border border-warning bg-warning-soft p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
            <div>
              <h2 className="font-bold text-foreground">Integrity is narrower than authenticity</h2>
              <p className="mt-1 text-sm leading-relaxed text-foreground">
                A matching chain can show that the provided entries match one configured
                recipe. It cannot prove who produced the log, whether earlier entries were
                omitted, whether the first hash is trusted, whether actions actually occurred,
                or whether the source system was uncompromised. A mismatch can also come from
                choosing a recipe that differs from the producer’s documented scheme.
              </p>
            </div>
          </div>
        </section>

        {error ? (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-lg border border-danger bg-danger-soft p-4 text-sm text-danger"
          >
            <XCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        ) : null}

        {message ? (
          <div
            role="status"
            className="flex items-start gap-3 rounded-lg border border-info bg-info-soft p-4 text-sm text-foreground"
          >
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-info" aria-hidden="true" />
            <span>{message}</span>
          </div>
        ) : null}

        <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                <FileJson2 className="h-5 w-5 text-primary" aria-hidden="true" />
                1. Add JSON or JSONL audit entries
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Entry order is preserved and used for sequence, time, and link checks.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <ActionButton icon={Sparkles} onClick={useSample}>
                Use safe sample
              </ActionButton>
              <ActionButton icon={RefreshCw} onClick={resetAll}>
                Clear memory
              </ActionButton>
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            <label className="block lg:col-span-2">
              <span className="mb-2 block text-xs font-bold text-muted-foreground">
                Audit log
              </span>
              <textarea
                value={source}
                onChange={(event) => {
                  setSource(event.target.value);
                  setSourceName("Pasted log");
                  setParseResult(null);
                  setVerification(null);
                  setMessage("");
                }}
                rows={16}
                spellCheck={false}
                placeholder={'{"id":"evt-1","sequence":1,"timestamp":"2026-01-01T00:00:00Z"}\n{"id":"evt-2","sequence":2,"timestamp":"2026-01-01T00:00:01Z"}'}
                className="w-full rounded-md border border-border bg-surface-soft p-3 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-[3px] focus:ring-primary/35"
              />
            </label>

            <div className="space-y-4 rounded-lg border border-border bg-surface-soft p-4">
              <label>
                <span className="mb-2 block text-xs font-bold text-muted-foreground">
                  JSON array path (optional)
                </span>
                <input
                  type="text"
                  value={arrayPath}
                  placeholder="Example: data.audit.entries"
                  onChange={(event) => {
                    setArrayPath(event.target.value);
                    setParseResult(null);
                    setVerification(null);
                  }}
                  className={CONTROL_CLASS}
                />
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                  Leave blank for a root array, JSONL, one root entry, or common wrappers
                  such as entries, events, logs, and records.
                </span>
              </label>
              <ActionButton
                icon={ScanLine}
                primary
                disabled={!source.trim()}
                onClick={() => parseSource()}
                className="w-full"
              >
                Parse locally
              </ActionButton>
              <ActionButton
                icon={Upload}
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                Choose text file
              </ActionButton>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.jsonl,.ndjson,.txt,application/json,application/x-ndjson,text/plain"
                className="sr-only"
                onChange={(event) => loadFile(event.target.files?.[0])}
              />
              <p className="text-xs leading-relaxed text-muted-foreground">
                Up to 10 MB and {numberFormatter.format(MAX_ENTRIES)} checked entries. No
                execution, network request, browser storage, or raw-data persistence.
              </p>
            </div>
          </div>
        </section>

        {parseResult ? (
          <>
            <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                    <Settings2 className="h-5 w-5 text-primary" aria-hidden="true" />
                    2. Confirm the audit schema
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {sourceName} · {numberFormatter.format(parseResult.entries.length)} entries ·{" "}
                    {parseResult.format.toUpperCase()} · source: {parseResult.sourcePath}
                  </p>
                </div>
                <span className="rounded-pill border border-border bg-surface-soft px-3 py-1 text-xs font-bold text-muted-foreground">
                  {fieldPaths.length} leaf fields found
                </span>
              </div>

              {parseResult.warnings.length ? (
                <div className="mt-4 rounded-lg border border-warning bg-warning-soft p-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <AlertTriangle className="h-4 w-4 text-warning" aria-hidden="true" />
                    Parser notes
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                    {parseResult.warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <datalist id="audit-field-paths">
                {fieldPaths.map((path) => (
                  <option key={path} value={path} />
                ))}
              </datalist>

              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <FieldPathInput
                  label="Entry ID field"
                  value={config.idPath}
                  listId="audit-field-paths"
                  onChange={(value) => updateConfig("idPath", value)}
                  helper="Checks missing and exactly repeated typed values."
                />
                <FieldPathInput
                  label="Sequence field"
                  value={config.sequencePath}
                  listId="audit-field-paths"
                  onChange={(value) => updateConfig("sequencePath", value)}
                  helper="Checks consecutive safe integers in supplied order."
                />
                <FieldPathInput
                  label="Timestamp field"
                  value={config.timestampPath}
                  listId="audit-field-paths"
                  onChange={(value) => updateConfig("timestampPath", value)}
                  helper="Checks parseability and backward movement."
                />
                <FieldPathInput
                  label="Previous-hash field"
                  value={config.previousHashPath}
                  listId="audit-field-paths"
                  onChange={(value) => updateConfig("previousHashPath", value)}
                  helper="Compared with the prior entry’s stored hash."
                />
                <FieldPathInput
                  label="Stored-hash field"
                  value={config.hashPath}
                  listId="audit-field-paths"
                  onChange={(value) => updateConfig("hashPath", value)}
                  helper="Used for links and optional SHA-256 recomputation."
                />
              </div>

              <div className="mt-5 grid gap-4 rounded-lg border border-border bg-surface-soft p-4 lg:grid-cols-2">
                <label>
                  <span className="mb-2 block text-xs font-bold text-muted-foreground">
                    Expected genesis previous hash (optional)
                  </span>
                  <input
                    type="text"
                    value={config.expectedGenesisHash}
                    placeholder="Only use a value from trusted documentation"
                    onChange={(event) =>
                      updateConfig("expectedGenesisHash", event.target.value)
                    }
                    className={CONTROL_CLASS}
                  />
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                    If blank, the first entry’s previous-hash value is not judged.
                  </span>
                </label>
                <label>
                  <span className="mb-2 block text-xs font-bold text-muted-foreground">
                    Documented SHA-256 recipe
                  </span>
                  <select
                    value={config.hashRecipe}
                    onChange={(event) => updateConfig("hashRecipe", event.target.value)}
                    className={CONTROL_CLASS}
                  >
                    <option value="disabled">Not documented / structural checks only</option>
                    <option value="canonical-entry">
                      SHA-256(canonical entry without stored hash)
                    </option>
                    <option value="previous-plus-entry">
                      SHA-256(previous hash + LF + canonical payload)
                    </option>
                  </select>
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                    Do not choose a recipe by trial and error. Match the producer’s specification.
                  </span>
                </label>
              </div>

              {config.hashRecipe !== "disabled" ? (
                <div className="mt-4 rounded-lg border border-info bg-info-soft p-4">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Hash className="h-4 w-4 text-info" aria-hidden="true" />
                    Exact ALTFTool canonicalization used for this check
                  </h3>
                  <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground">
                    {config.hashRecipe === "canonical-entry" ? (
                      <>
                        <li>Remove the configured stored-hash field from the entry.</li>
                        <li>
                          Recursively sort object keys lexicographically; preserve array order;
                          serialize JSON without added whitespace.
                        </li>
                        <li>UTF-8 encode that exact JSON string, then compute SHA-256.</li>
                      </>
                    ) : (
                      <>
                        <li>Read the previous-hash field as its exact string value.</li>
                        <li>Remove both configured hash fields from the entry.</li>
                        <li>
                          Recursively sort object keys, preserve array order, and serialize
                          JSON without added whitespace.
                        </li>
                        <li>
                          Concatenate previous-hash string, one LF character, and canonical
                          JSON; UTF-8 encode and compute SHA-256.
                        </li>
                      </>
                    )}
                  </ol>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    This is a tool-specific deterministic recipe, not a claim of RFC 8785/JCS
                    compatibility. Number, Unicode, null, omitted-field, and genesis rules must
                    match the log producer exactly.
                  </p>
                </div>
              ) : null}

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <p className="max-w-3xl text-xs leading-relaxed text-muted-foreground">
                  Blank field paths produce “Not checkable”—never an inferred pass. Dot paths
                  address nested objects, for example <code className="font-mono">chain.previousHash</code>.
                </p>
                <ActionButton
                  icon={ShieldCheck}
                  primary
                  disabled={isVerifying}
                  onClick={runVerification}
                >
                  {isVerifying ? "Checking locally…" : "Run configured checks"}
                </ActionButton>
              </div>
            </section>

            {verification ? (
              <>
                <section>
                  <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Integrity check results</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        States apply only to this parsed input and the confirmed field paths.
                      </p>
                    </div>
                    <ActionButton
                      icon={Download}
                      onClick={() =>
                        downloadText(
                          buildCountsOnlyReport(
                            parseResult,
                            verification.structure,
                            verification.hash,
                          ),
                          "agent-audit-integrity-counts.csv",
                        )
                      }
                    >
                      Download counts-only report
                    </ActionButton>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <CheckCard
                      title="Entry IDs"
                      icon={Fingerprint}
                      state={verification.structure.checks.ids.state}
                      description="Exact typed ID values are checked for missing fields and repetition."
                      metrics={[
                        {
                          label: "Missing / invalid",
                          value: numberFormatter.format(
                            verification.structure.checks.ids.missingCount +
                              verification.structure.checks.ids.invalidCount,
                          ),
                        },
                        {
                          label: "Duplicate values",
                          value: numberFormatter.format(
                            verification.structure.checks.ids.duplicateValueCount,
                          ),
                        },
                      ]}
                    />
                    <CheckCard
                      title="Sequence continuity"
                      icon={ListOrdered}
                      state={verification.structure.checks.sequence.state}
                      description="Safe integer sequence values are compared in the supplied entry order."
                      metrics={[
                        {
                          label: "Gaps",
                          value: numberFormatter.format(
                            verification.structure.checks.sequence.gapCount,
                          ),
                        },
                        {
                          label: "Reordered / repeated",
                          value: numberFormatter.format(
                            verification.structure.checks.sequence.reorderedCount,
                          ),
                        },
                      ]}
                    />
                    <CheckCard
                      title="Timestamp order"
                      icon={Clock3}
                      state={verification.structure.checks.timestamps.state}
                      description="Parseable timestamps are checked for movement backward in the supplied order."
                      metrics={[
                        {
                          label: "Invalid / missing",
                          value: numberFormatter.format(
                            verification.structure.checks.timestamps.invalidCount,
                          ),
                        },
                        {
                          label: "Regressions",
                          value: numberFormatter.format(
                            verification.structure.checks.timestamps.regressionCount,
                          ),
                        },
                      ]}
                    />
                    <CheckCard
                      title="Previous-hash links"
                      icon={Link2}
                      state={verification.structure.checks.previousLinks.state}
                      description="Each configured previous-hash value is compared with the prior stored hash."
                      metrics={[
                        {
                          label: "Missing values",
                          value: numberFormatter.format(
                            verification.structure.checks.previousLinks.missingCount,
                          ),
                        },
                        {
                          label: "Mismatches",
                          value: numberFormatter.format(
                            verification.structure.checks.previousLinks.mismatchCount,
                          ),
                        },
                      ]}
                    />
                  </div>
                </section>

                <section
                  className={`rounded-lg border p-5 shadow-sm ${
                    verification.hash.state === "verified"
                      ? "border-success bg-success-soft"
                      : verification.hash.state === "mismatch"
                        ? "border-danger bg-danger-soft"
                        : "border-border bg-surface"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                        <Hash className="h-5 w-5 text-primary" aria-hidden="true" />
                        Canonical SHA-256 recomputation
                      </h2>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {verification.hash.reason}
                      </p>
                    </div>
                    <StateBadge state={verification.hash.state} />
                  </div>
                  <dl className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-md border border-border bg-surface p-3">
                      <dt className="text-xs font-bold text-muted-foreground">Matched</dt>
                      <dd className="mt-1 text-xl font-extrabold text-success">
                        {numberFormatter.format(verification.hash.verifiedCount)}
                      </dd>
                    </div>
                    <div className="rounded-md border border-border bg-surface p-3">
                      <dt className="text-xs font-bold text-muted-foreground">Mismatched</dt>
                      <dd className="mt-1 text-xl font-extrabold text-danger">
                        {numberFormatter.format(verification.hash.mismatchCount)}
                      </dd>
                    </div>
                    <div className="rounded-md border border-border bg-surface p-3">
                      <dt className="text-xs font-bold text-muted-foreground">Not checkable</dt>
                      <dd className="mt-1 text-xl font-extrabold text-foreground">
                        {numberFormatter.format(verification.hash.notCheckableCount)}
                      </dd>
                    </div>
                  </dl>
                </section>

                <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                        <Table2 className="h-5 w-5 text-primary" aria-hidden="true" />
                        Entries needing review
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Position-only output helps locate issues without displaying IDs,
                        timestamps, actions, or hash values.
                      </p>
                    </div>
                    <span className="rounded-pill border border-border bg-surface-soft px-3 py-1 text-xs font-bold text-muted-foreground">
                      {numberFormatter.format(issueRows.length)} entries
                    </span>
                  </div>

                  {issueRows.length ? (
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full min-w-full border-collapse text-left text-sm">
                        <thead>
                          <tr className="border-b border-border bg-surface-soft text-xs uppercase text-muted-foreground">
                            <th className="px-3 py-3 font-bold">Entry position</th>
                            <th className="px-3 py-3 font-bold">Counts-only findings</th>
                          </tr>
                        </thead>
                        <tbody>
                          {issueRows.slice(0, 200).map((row) => (
                            <tr key={row.index} className="border-b border-border last:border-0">
                              <td className="px-3 py-3 font-mono text-foreground">
                                {row.rowNumber}
                              </td>
                              <td className="px-3 py-3">
                                <div className="flex flex-wrap gap-2">
                                  {row.issues.map((issue) => (
                                    <span
                                      key={issue}
                                      className="rounded-pill border border-warning bg-warning-soft px-2 py-1 text-xs font-bold text-foreground"
                                    >
                                      {issue}
                                    </span>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {issueRows.length > 200 ? (
                        <p className="mt-3 text-xs text-muted-foreground">
                          Showing the first 200 affected entry positions.
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <div className="mt-4 flex items-start gap-3 rounded-lg border border-success bg-success-soft p-4">
                      <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
                      <p className="text-sm text-foreground">
                        No configured check produced an entry-level finding. Unconfigured
                        and unsupported properties remain unexamined.
                      </p>
                    </div>
                  )}
                </section>

                <section className="grid gap-4 md:grid-cols-3">
                  <article className="rounded-lg border border-border bg-surface p-4 shadow-sm">
                    <LockKeyhole className="h-5 w-5 text-primary" aria-hidden="true" />
                    <h2 className="mt-3 font-bold text-foreground">No raw report export</h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      The CSV report contains states and counts only. It excludes entry IDs,
                      event data, timestamps, hashes, field paths, and source filename.
                    </p>
                  </article>
                  <article className="rounded-lg border border-border bg-surface p-4 shadow-sm">
                    <ScanLine className="h-5 w-5 text-primary" aria-hidden="true" />
                    <h2 className="mt-3 font-bold text-foreground">No semantic execution check</h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      The verifier never runs an action, tool call, command, or embedded
                      payload. It checks selected structural fields and bytes-to-hash only.
                    </p>
                  </article>
                  <article className="rounded-lg border border-border bg-surface p-4 shadow-sm">
                    <AlertTriangle className="h-5 w-5 text-warning" aria-hidden="true" />
                    <h2 className="mt-3 font-bold text-foreground">Anchor trust separately</h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      Compare a trusted first/last hash or signed checkpoint through an
                      independent channel. This tool does not establish that trust anchor.
                    </p>
                  </article>
                </section>
              </>
            ) : null}
          </>
        ) : null}
      </div>
    </main>
  );
}
