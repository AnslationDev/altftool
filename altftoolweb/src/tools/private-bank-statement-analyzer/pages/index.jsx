"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Columns3,
  Download,
  Eye,
  EyeOff,
  FileSpreadsheet,
  Info,
  Landmark,
  ListChecks,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Table2,
  Upload,
  WalletCards,
} from "lucide-react";
import {
  analyzeTransactions,
  buildAggregateSummaryCsv,
  buildSignalCountsCsv,
  normalizeTransactions,
  parseDelimitedText,
  suggestMapping,
} from "../lib/statementAnalyzer.mjs";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_ROWS = 25_000;

const SAMPLE_STATEMENT = `Date,Description,Debit,Credit
03/01/2026,Monthly salary,,85000
04/01/2026,Apartment rent,24000,
08/01/2026,Supermarket groceries,3850.50,
08/01/2026,Supermarket groceries,3850.50,
12/02/2026,Electricity bill,2140,
18/02/2026,Metro card recharge,900,
02/03/2026,Hospital diagnostic,4200,
15/03/2026,Airline booking,18500,`;

const CURRENCIES = [
  { value: "INR", label: "INR — Indian rupee", locale: "en-IN" },
  { value: "USD", label: "USD — US dollar", locale: "en-US" },
  { value: "EUR", label: "EUR — Euro", locale: "en-IE" },
  { value: "GBP", label: "GBP — Pound sterling", locale: "en-GB" },
  { value: "CAD", label: "CAD — Canadian dollar", locale: "en-CA" },
  { value: "AUD", label: "AUD — Australian dollar", locale: "en-AU" },
];

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

function StatCard({ label, value, helper, icon: Icon, tone = "primary" }) {
  const toneClass =
    tone === "success"
      ? "bg-success-soft text-success"
      : tone === "danger"
        ? "bg-danger-soft text-danger"
        : tone === "info"
          ? "bg-info-soft text-info"
          : "bg-primary-soft text-primary";

  return (
    <article className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-md ${toneClass}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <p className="mt-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 break-words text-2xl font-extrabold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
    </article>
  );
}

function MappingSelect({ label, value, headers, onChange, optional = false }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold text-muted-foreground">
        {label} {optional ? "(optional)" : ""}
      </span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className={CONTROL_CLASS}>
        <option value="">{optional ? "Not used" : "Choose a column"}</option>
        {headers.map((header) => (
          <option key={header} value={header}>
            {header}
          </option>
        ))}
      </select>
    </label>
  );
}

function formatDelimiter(delimiter) {
  if (delimiter === "\t") return "Tab";
  if (delimiter === ";") return "Semicolon";
  if (delimiter === "|") return "Pipe";
  return "Comma";
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

export default function PrivateBankStatementAnalyzer() {
  const [sourceText, setSourceText] = useState("");
  const [sourceName, setSourceName] = useState("Pasted data");
  const [delimiter, setDelimiter] = useState("auto");
  const [parsed, setParsed] = useState(null);
  const [mapping, setMapping] = useState({
    date: "",
    description: "",
    debit: "",
    credit: "",
    amount: "",
  });
  const [dateOrder, setDateOrder] = useState("DMY");
  const [amountDirection, setAmountDirection] = useState("negative-outflow");
  const [currency, setCurrency] = useState("INR");
  const [result, setResult] = useState(null);
  const [showDescriptions, setShowDescriptions] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);

  const currencyDetails =
    CURRENCIES.find((option) => option.value === currency) || CURRENCIES[0];
  const moneyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(currencyDetails.locale, {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }),
    [currency, currencyDetails.locale],
  );
  const numberFormatter = useMemo(() => new Intl.NumberFormat("en-IN"), []);

  const formatMoney = (value) => moneyFormatter.format(Number(value) || 0);

  const resetResults = () => {
    setResult(null);
    setMessage("");
  };

  const resetAll = () => {
    setSourceText("");
    setSourceName("Pasted data");
    setDelimiter("auto");
    setParsed(null);
    setMapping({
      date: "",
      description: "",
      debit: "",
      credit: "",
      amount: "",
    });
    setDateOrder("DMY");
    setAmountDirection("negative-outflow");
    setCurrency("INR");
    setResult(null);
    setShowDescriptions(false);
    setError("");
    setMessage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const parseSource = (text, selectedDelimiter = delimiter, name = sourceName) => {
    setError("");
    setMessage("");
    setResult(null);
    try {
      const nextParsed = parseDelimitedText(text, selectedDelimiter);
      if (nextParsed.headers.length < 2 || !nextParsed.rows.length) {
        setError("Add a header row and at least one transaction row.");
        setParsed(null);
        return;
      }
      if (nextParsed.rows.length > MAX_ROWS) {
        setError(`This file has more than ${numberFormatter.format(MAX_ROWS)} rows. Split it into smaller date ranges.`);
        setParsed(null);
        return;
      }
      setParsed(nextParsed);
      setMapping(suggestMapping(nextParsed.headers));
      setSourceName(name);
      setMessage(
        `${numberFormatter.format(nextParsed.rows.length)} rows parsed locally. Confirm the column mapping before analysis.`,
      );
    } catch (parseError) {
      setParsed(null);
      setError(parseError.message || "The statement data could not be parsed.");
    }
  };

  const loadFile = async (file) => {
    setError("");
    if (!file) return;
    if (!/\.(csv|tsv|txt)$/i.test(file.name)) {
      setError("Choose a CSV, TSV, or plain-text table. PDF layouts are not imported.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("Choose a statement file smaller than 10 MB.");
      return;
    }
    try {
      const text = await file.text();
      setSourceText(text);
      parseSource(text, delimiter, file.name);
    } catch {
      setError("The browser could not read this text file.");
    }
  };

  const useSample = () => {
    setSourceText(SAMPLE_STATEMENT);
    setDelimiter("auto");
    parseSource(SAMPLE_STATEMENT, "auto", "Sample statement");
  };

  const updateMapping = (field, value) => {
    setMapping((current) => ({ ...current, [field]: value }));
    resetResults();
  };

  const runAnalysis = () => {
    setError("");
    setMessage("");
    if (!parsed) {
      setError("Parse the statement data before running analysis.");
      return;
    }
    if (!mapping.date || !mapping.description) {
      setError("Map both the date and description columns.");
      return;
    }
    const hasAmount = Boolean(mapping.amount);
    const hasDebitCredit = Boolean(mapping.debit && mapping.credit);
    if (!hasAmount && !hasDebitCredit) {
      setError("Map one signed amount column, or map both debit and credit columns.");
      return;
    }
    const activeAmountColumns = hasAmount
      ? [mapping.amount]
      : [mapping.debit, mapping.credit];
    if (new Set([mapping.date, mapping.description, ...activeAmountColumns]).size !== 2 + activeAmountColumns.length) {
      setError("Each mapped field must use a different source column.");
      return;
    }

    const normalized = normalizeTransactions(parsed.rows, mapping, {
      dateOrder,
      amountDirection,
    });
    if (!normalized.transactions.length) {
      setError("No usable non-zero transactions remained after applying this mapping.");
      return;
    }
    const analysis = analyzeTransactions(normalized.transactions);
    setResult({ normalized, analysis });
    setMessage(
      `${numberFormatter.format(analysis.transactionCount)} transactions analysed in memory. Review signals are prompts, not fraud findings.`,
    );
  };

  const quality = result
    ? {
        skippedCount: result.normalized.skipped.length,
        invalidDateCount: result.normalized.invalidDateCount,
      }
    : null;

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <header className="mx-auto max-w-4xl text-center">
          <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-pill border border-primary/30 bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Private local analysis
            </span>
            <span className="inline-flex items-center gap-2 rounded-pill border border-border bg-surface px-3 py-1 text-xs font-bold text-foreground">
              <LockKeyhole className="h-4 w-4 text-primary" aria-hidden="true" />
              No account connection
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Private Bank Statement Analyzer
          </h1>
          <p className="mx-auto mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground">
            Paste or import a CSV statement, map its columns, and calculate spending
            summaries entirely in this browser. No bank login, upload, or raw-data storage.
          </p>
        </header>

        <section className="rounded-lg border border-info bg-info-soft p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-info" aria-hidden="true" />
            <div>
              <h2 className="font-bold text-foreground">What the tool does—and does not do</h2>
              <p className="mt-1 text-sm leading-relaxed text-foreground">
                Categories come from visible keyword rules. Duplicate and size signals only
                compare rows in this import. They can be caused by legitimate entries,
                pending/posted pairs, transfers, refunds, or unusual one-off costs. Nothing
                here proves fraud, gives financial advice, or replaces the original statement.
              </p>
            </div>
          </div>
        </section>

        {error ? (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-lg border border-danger bg-danger-soft p-4 text-sm text-danger"
          >
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        ) : null}

        {message ? (
          <div
            role="status"
            className="flex items-start gap-3 rounded-lg border border-success bg-success-soft p-4 text-sm text-foreground"
          >
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
            <span>{message}</span>
          </div>
        ) : null}

        <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                <FileSpreadsheet className="h-5 w-5 text-primary" aria-hidden="true" />
                1. Add statement data
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                The first row must contain column headings. Quoted fields are supported.
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
            <div className="space-y-4 lg:col-span-2">
              <label className="block">
                <span className="mb-2 block text-xs font-bold text-muted-foreground">
                  CSV, TSV, or delimited text
                </span>
                <textarea
                  value={sourceText}
                  onChange={(event) => {
                    setSourceText(event.target.value);
                    setSourceName("Pasted data");
                    setParsed(null);
                    setResult(null);
                    setMessage("");
                  }}
                  rows={12}
                  spellCheck={false}
                  placeholder={"Date,Description,Debit,Credit\n01/01/2026,Example purchase,250,"}
                  className="w-full rounded-md border border-border bg-surface-soft p-3 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-[3px] focus:ring-primary/35"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <ActionButton
                  icon={Upload}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose text file
                </ActionButton>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values,text/plain"
                  className="sr-only"
                  onChange={(event) => loadFile(event.target.files?.[0])}
                />
                <span className="self-center text-xs text-muted-foreground">
                  Up to 10 MB and {numberFormatter.format(MAX_ROWS)} rows
                </span>
              </div>
            </div>

            <div className="space-y-4 rounded-lg border border-border bg-surface-soft p-4">
              <label>
                <span className="mb-2 block text-xs font-bold text-muted-foreground">
                  Delimiter
                </span>
                <select
                  value={delimiter}
                  onChange={(event) => {
                    setDelimiter(event.target.value);
                    setParsed(null);
                    setResult(null);
                  }}
                  className={CONTROL_CLASS}
                >
                  <option value="auto">Detect automatically</option>
                  <option value=",">Comma</option>
                  <option value={"\t"}>Tab</option>
                  <option value=";">Semicolon</option>
                  <option value="|">Pipe</option>
                </select>
              </label>
              <ActionButton
                icon={Columns3}
                primary
                disabled={!sourceText.trim()}
                onClick={() => parseSource(sourceText)}
                className="w-full"
              >
                Parse locally
              </ActionButton>
              <div className="rounded-md border border-border bg-surface p-3">
                <p className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <LockKeyhole className="h-4 w-4 text-primary" aria-hidden="true" />
                  Privacy boundary
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Data stays in page memory and is discarded when you clear it, refresh,
                  close the tab, or navigate away. This tool uses no network or browser storage.
                </p>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                PDF import is intentionally omitted because bank PDF layouts do not preserve
                reliable table columns. Export a CSV from your bank or paste a text table.
              </p>
            </div>
          </div>
        </section>

        {parsed ? (
          <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                  <Columns3 className="h-5 w-5 text-primary" aria-hidden="true" />
                  2. Confirm column mapping
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {sourceName} · {numberFormatter.format(parsed.rows.length)} rows ·{" "}
                  {formatDelimiter(parsed.delimiter)} separated
                </p>
              </div>
              <span className="rounded-pill border border-border bg-surface-soft px-3 py-1 text-xs font-bold text-muted-foreground">
                {parsed.headers.length} columns
              </span>
            </div>

            {parsed.warnings.length ? (
              <div className="mt-4 rounded-lg border border-warning bg-warning-soft p-4">
                <p className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <AlertTriangle className="h-4 w-4 text-warning" aria-hidden="true" />
                  Parser notes
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                  {parsed.warnings.slice(0, 5).map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                  {parsed.warnings.length > 5 ? (
                    <li>{parsed.warnings.length - 5} more row-shape notes</li>
                  ) : null}
                </ul>
              </div>
            ) : null}

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <MappingSelect
                label="Date"
                value={mapping.date}
                headers={parsed.headers}
                onChange={(value) => updateMapping("date", value)}
              />
              <MappingSelect
                label="Description"
                value={mapping.description}
                headers={parsed.headers}
                onChange={(value) => updateMapping("description", value)}
              />
              <MappingSelect
                label="Debit / money out"
                optional
                value={mapping.debit}
                headers={parsed.headers}
                onChange={(value) => updateMapping("debit", value)}
              />
              <MappingSelect
                label="Credit / money in"
                optional
                value={mapping.credit}
                headers={parsed.headers}
                onChange={(value) => updateMapping("credit", value)}
              />
              <MappingSelect
                label="Single signed amount"
                optional
                value={mapping.amount}
                headers={parsed.headers}
                onChange={(value) => updateMapping("amount", value)}
              />
            </div>

            <div className="mt-5 grid gap-4 rounded-lg border border-border bg-surface-soft p-4 md:grid-cols-3">
              <label>
                <span className="mb-2 block text-xs font-bold text-muted-foreground">
                  Ambiguous dates
                </span>
                <select
                  value={dateOrder}
                  onChange={(event) => {
                    setDateOrder(event.target.value);
                    resetResults();
                  }}
                  className={CONTROL_CLASS}
                >
                  <option value="DMY">DD/MM/YYYY</option>
                  <option value="MDY">MM/DD/YYYY</option>
                </select>
              </label>
              <label>
                <span className="mb-2 block text-xs font-bold text-muted-foreground">
                  Signed amount meaning
                </span>
                <select
                  value={amountDirection}
                  disabled={!mapping.amount}
                  onChange={(event) => {
                    setAmountDirection(event.target.value);
                    resetResults();
                  }}
                  className={CONTROL_CLASS}
                >
                  <option value="negative-outflow">Negative = money out</option>
                  <option value="positive-outflow">Positive = money out</option>
                </select>
              </label>
              <label>
                <span className="mb-2 block text-xs font-bold text-muted-foreground">
                  Display currency
                </span>
                <select
                  value={currency}
                  onChange={(event) => {
                    setCurrency(event.target.value);
                  }}
                  className={CONTROL_CLASS}
                >
                  {CURRENCIES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="max-w-3xl text-xs leading-relaxed text-muted-foreground">
                Use either one signed amount column, or both debit and credit columns. If a
                signed amount is selected, debit and credit mappings are ignored.
              </p>
              <ActionButton icon={BarChart3} primary onClick={runAnalysis}>
                Analyze in memory
              </ActionButton>
            </div>
          </section>
        ) : null}

        {result ? (
          <>
            <section aria-labelledby="overview-heading">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 id="overview-heading" className="text-xl font-bold text-foreground">
                    Statement overview
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Aggregates from the currently imported rows only.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <ActionButton
                    icon={Download}
                    onClick={() =>
                      downloadText(
                        buildAggregateSummaryCsv(result.analysis, quality),
                        "private-statement-aggregate-summary.csv",
                      )
                    }
                  >
                    Download summary
                  </ActionButton>
                  <ActionButton
                    icon={Download}
                    onClick={() =>
                      downloadText(
                        buildSignalCountsCsv(result.analysis),
                        "private-statement-signal-counts.csv",
                      )
                    }
                  >
                    Download signal counts
                  </ActionButton>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="Transactions"
                  value={numberFormatter.format(result.analysis.transactionCount)}
                  helper={`${numberFormatter.format(result.normalized.skipped.length)} rows skipped`}
                  icon={ListChecks}
                  tone="info"
                />
                <StatCard
                  label="Money in"
                  value={formatMoney(result.analysis.totals.inflow)}
                  helper="Sum of mapped credits"
                  icon={ArrowDownRight}
                  tone="success"
                />
                <StatCard
                  label="Money out"
                  value={formatMoney(result.analysis.totals.outflow)}
                  helper="Sum of mapped debits"
                  icon={ArrowUpRight}
                  tone="danger"
                />
                <StatCard
                  label="Net movement"
                  value={formatMoney(result.analysis.totals.net)}
                  helper="Money in minus money out"
                  icon={WalletCards}
                />
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <article className="rounded-lg border border-border bg-surface p-5 shadow-sm">
                <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                  <BarChart3 className="h-5 w-5 text-primary" aria-hidden="true" />
                  Outflow by deterministic category
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Keyword categories are estimates; transfers and merchant labels can be ambiguous.
                </p>
                {result.analysis.categories.length ? (
                  <div className="mt-4 space-y-4">
                    {result.analysis.categories.map((category) => (
                      <div key={category.category}>
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="font-bold text-foreground">{category.category}</span>
                          <span className="text-right text-muted-foreground">
                            {formatMoney(category.outflow)} · {category.count}
                          </span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-pill bg-surface-soft">
                          <div
                            className="h-full rounded-pill bg-primary"
                            style={{ width: `${Math.max(2, category.share * 100)}%` }}
                            aria-hidden="true"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">No outflows were mapped.</p>
                )}
              </article>

              <article className="rounded-lg border border-border bg-surface p-5 shadow-sm">
                <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                  <Table2 className="h-5 w-5 text-primary" aria-hidden="true" />
                  Monthly summary
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Rows with unreadable dates are excluded from this table only.
                </p>
                {result.analysis.months.length ? (
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-full border-collapse text-left text-sm">
                      <thead>
                        <tr className="border-b border-border bg-surface-soft text-xs uppercase text-muted-foreground">
                          <th className="px-3 py-3 font-bold">Month</th>
                          <th className="px-3 py-3 text-right font-bold">Rows</th>
                          <th className="px-3 py-3 text-right font-bold">In</th>
                          <th className="px-3 py-3 text-right font-bold">Out</th>
                          <th className="px-3 py-3 text-right font-bold">Net</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.analysis.months.map((month) => (
                          <tr key={month.month} className="border-b border-border last:border-0">
                            <td className="px-3 py-3 font-bold text-foreground">{month.month}</td>
                            <td className="px-3 py-3 text-right text-muted-foreground">{month.count}</td>
                            <td className="px-3 py-3 text-right text-success">{formatMoney(month.inflow)}</td>
                            <td className="px-3 py-3 text-right text-danger">{formatMoney(month.outflow)}</td>
                            <td className="px-3 py-3 text-right font-bold text-foreground">{formatMoney(month.net)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">No readable dates were found.</p>
                )}
              </article>
            </section>

            <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                    <AlertTriangle className="h-5 w-5 text-warning" aria-hidden="true" />
                    Review signals
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Signals are deterministic comparisons within this file. They are not
                    fraud detection, risk scores, predictions, or accusations.
                  </p>
                </div>
                <span className="rounded-pill border border-border bg-surface-soft px-3 py-1 text-xs font-bold text-muted-foreground">
                  {result.analysis.signals.length} signals
                </span>
              </div>

              {result.analysis.signals.length ? (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {result.analysis.signals.map((signal) => (
                    <article
                      key={signal.id}
                      className="rounded-lg border border-warning bg-warning-soft p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-foreground">{signal.title}</h3>
                          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                            {signal.detail}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-pill border border-warning bg-surface px-2 py-1 text-xs font-bold text-warning">
                          Review
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
                        <span>
                          {signal.transactionIds.length
                            ? `Rows: ${signal.transactionIds
                                .map((id) => Number(id.replace("row-", "")))
                                .join(", ")}`
                            : "Monthly aggregate"}
                        </span>
                        <span>{formatMoney(signal.amount)}</span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-4 flex items-start gap-3 rounded-lg border border-success bg-success-soft p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
                  <p className="text-sm text-foreground">
                    No rows crossed the limited duplicate or size rules. This does not mean
                    the statement is verified, complete, or free of mistakes.
                  </p>
                </div>
              )}
            </section>

            <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                    <Table2 className="h-5 w-5 text-primary" aria-hidden="true" />
                    Local transaction preview
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    First {Math.min(100, result.normalized.transactions.length)} analysed rows.
                    Descriptions are hidden by default.
                  </p>
                </div>
                <ActionButton
                  icon={showDescriptions ? EyeOff : Eye}
                  onClick={() => setShowDescriptions((current) => !current)}
                >
                  {showDescriptions ? "Hide descriptions" : "Reveal descriptions"}
                </ActionButton>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface-soft text-xs uppercase text-muted-foreground">
                      <th className="px-3 py-3 font-bold">Source row</th>
                      <th className="px-3 py-3 font-bold">Date</th>
                      <th className="px-3 py-3 font-bold">Description</th>
                      <th className="px-3 py-3 font-bold">Category</th>
                      <th className="px-3 py-3 text-right font-bold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.normalized.transactions.slice(0, 100).map((transaction) => (
                      <tr key={transaction.id} className="border-b border-border last:border-0">
                        <td className="px-3 py-3 font-mono text-xs text-muted-foreground">
                          {transaction.sourceRow}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-foreground">
                          {transaction.date || transaction.dateRaw}
                        </td>
                        <td className="max-w-md px-3 py-3 text-foreground">
                          {showDescriptions ? (
                            transaction.description
                          ) : (
                            <span className="inline-flex items-center gap-2 text-muted-foreground">
                              <EyeOff className="h-4 w-4" aria-hidden="true" />
                              Hidden locally
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-muted-foreground">{transaction.category}</td>
                        <td
                          className={`whitespace-nowrap px-3 py-3 text-right font-bold ${
                            transaction.direction === "inflow" ? "text-success" : "text-danger"
                          }`}
                        >
                          {transaction.direction === "inflow" ? "+" : "−"}
                          {formatMoney(transaction.inflow || transaction.outflow)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              <article className="rounded-lg border border-border bg-surface p-4 shadow-sm">
                <Landmark className="h-5 w-5 text-primary" aria-hidden="true" />
                <h2 className="mt-3 font-bold text-foreground">Data quality</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {numberFormatter.format(result.normalized.skipped.length)} skipped rows ·{" "}
                  {numberFormatter.format(result.normalized.invalidDateCount)} analysed rows
                  with unreadable dates.
                </p>
              </article>
              <article className="rounded-lg border border-border bg-surface p-4 shadow-sm">
                <LockKeyhole className="h-5 w-5 text-primary" aria-hidden="true" />
                <h2 className="mt-3 font-bold text-foreground">Aggregate-only downloads</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Downloaded summaries contain totals, category/month aggregates, and signal
                  counts—not transaction descriptions or raw imported rows.
                </p>
              </article>
              <article className="rounded-lg border border-border bg-surface p-4 shadow-sm">
                <AlertTriangle className="h-5 w-5 text-warning" aria-hidden="true" />
                <h2 className="mt-3 font-bold text-foreground">Verify at the source</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Check anything important in your bank’s official app or statement. Parsing,
                  column mapping, dates, and merchant categories can be wrong.
                </p>
              </article>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
