"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, TableProperties } from "lucide-react";

import { CASE_STYLES, DBMS_OPTIONS, PREFIX_STYLES, generateNamingConvention } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  caseStyle: "snake",
  pluralTables: true,
  pkColumnStyle: "id",
  prefixStyle: "prefix",
  dbms: "postgres",
  sampleEntity: "customer order",
  sampleRefEntity: "customer",
  sampleColumn: "status",
};

const DASH = "—";

export default function ToolHome() {
  const [caseStyle, setCaseStyle] = useState(DEFAULTS.caseStyle);
  const [pluralTables, setPluralTables] = useState(DEFAULTS.pluralTables);
  const [pkColumnStyle, setPkColumnStyle] = useState(DEFAULTS.pkColumnStyle);
  const [prefixStyle, setPrefixStyle] = useState(DEFAULTS.prefixStyle);
  const [dbms, setDbms] = useState(DEFAULTS.dbms);
  const [sampleEntity, setSampleEntity] = useState(DEFAULTS.sampleEntity);
  const [sampleRefEntity, setSampleRefEntity] = useState(DEFAULTS.sampleRefEntity);
  const [sampleColumn, setSampleColumn] = useState(DEFAULTS.sampleColumn);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      generateNamingConvention({
        caseStyle,
        pluralTables,
        pkColumnStyle,
        prefixStyle,
        dbms,
        sampleEntity,
        sampleRefEntity,
        sampleColumn,
      }),
    [caseStyle, pluralTables, pkColumnStyle, prefixStyle, dbms, sampleEntity, sampleRefEntity, sampleColumn],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = result.rules.map((rule) => `${rule.object}: ${rule.pattern}  ->  ${rule.example}`);
    return [`Database naming convention (${result.dbmsLabel})`, ...lines].join("\n");
  }, [hasError, result]);

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
    setCaseStyle(DEFAULTS.caseStyle);
    setPluralTables(DEFAULTS.pluralTables);
    setPkColumnStyle(DEFAULTS.pkColumnStyle);
    setPrefixStyle(DEFAULTS.prefixStyle);
    setDbms(DEFAULTS.dbms);
    setSampleEntity(DEFAULTS.sampleEntity);
    setSampleRefEntity(DEFAULTS.sampleRefEntity);
    setSampleColumn(DEFAULTS.sampleColumn);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <TableProperties className="h-4 w-4" aria-hidden="true" />
          Database design
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Database Naming Convention Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick a case style, table form and constraint scheme, and get a complete rule sheet with a
          worked example for every object type — checked against your DBMS identifier length limit.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dnc-case">
              Case style
            </label>
            <select
              id="dnc-case"
              className={`mt-2 ${INPUT_CLASS}`}
              value={caseStyle}
              onChange={(event) => setCaseStyle(event.target.value)}
            >
              {CASE_STYLES.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dnc-dbms">
              Database system
            </label>
            <select
              id="dnc-dbms"
              className={`mt-2 ${INPUT_CLASS}`}
              value={dbms}
              onChange={(event) => setDbms(event.target.value)}
            >
              {DBMS_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dnc-plural">
              Table names
            </label>
            <select
              id="dnc-plural"
              className={`mt-2 ${INPUT_CLASS}`}
              value={pluralTables ? "plural" : "singular"}
              onChange={(event) => setPluralTables(event.target.value === "plural")}
            >
              <option value="plural">Plural (customers)</option>
              <option value="singular">Singular (customer)</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dnc-pk">
              Surrogate key column
            </label>
            <select
              id="dnc-pk"
              className={`mt-2 ${INPUT_CLASS}`}
              value={pkColumnStyle}
              onChange={(event) => setPkColumnStyle(event.target.value)}
            >
              <option value="id">Bare id</option>
              <option value="table_id">Entity-prefixed (customer_id)</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="dnc-prefix">
              Constraint and index naming
            </label>
            <select
              id="dnc-prefix"
              className={`mt-2 ${INPUT_CLASS}`}
              value={prefixStyle}
              onChange={(event) => setPrefixStyle(event.target.value)}
            >
              {PREFIX_STYLES.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dnc-entity">
              Sample entity
            </label>
            <input
              id="dnc-entity"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={sampleEntity}
              onChange={(event) => setSampleEntity(event.target.value)}
              placeholder="customer order"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dnc-ref">
              Sample referenced entity
            </label>
            <input
              id="dnc-ref"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={sampleRefEntity}
              onChange={(event) => setSampleRefEntity(event.target.value)}
              placeholder="customer"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="dnc-column">
              Sample column
            </label>
            <input
              id="dnc-column"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={sampleColumn}
              onChange={(event) => setSampleColumn(event.target.value)}
              placeholder="status"
            />
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Your table name
            </p>
            <p className="mt-1 font-mono text-3xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.rules[0].example}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the rule sheet."
                : result.maxLength
                  ? `${result.dbmsLabel} allows identifiers up to ${result.maxLength} characters.`
                  : `${result.dbmsLabel} has no enforced identifier length limit.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the naming convention rule sheet"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy rules"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Object
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Rule
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Worked example
                </th>
              </tr>
            </thead>
            <tbody>
              {(hasError ? [] : result.rules).map((rule) => (
                <tr key={rule.object} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{rule.object}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{rule.pattern}</td>
                  <td
                    className={`py-2 text-right font-mono font-semibold ${rule.overLimit ? "text-[var(--danger)]" : ""}`}
                  >
                    {rule.example}
                  </td>
                </tr>
              ))}
              {hasError ? (
                <tr>
                  <td className="py-2 pr-3">{DASH}</td>
                  <td className="py-2 pr-3">{DASH}</td>
                  <td className="py-2 text-right">{DASH}</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {!hasError && result.warnings.length > 0 ? (
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-[var(--danger)]">
            {result.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Length limits per vendor documentation: PostgreSQL 63 bytes, MySQL 8 64 characters, SQL
        Server 128 characters, Oracle 128 bytes from 12.2 (30 before), SQLite unlimited. Multi-byte
        characters can hit byte limits sooner than the character count suggests.
      </p>
    </main>
  );
}
