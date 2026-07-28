"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Database, Plus, RotateCcw, Trash2 } from "lucide-react";

import { CONNECTORS, DIALECTS, OPERATORS, VALUE_TYPES, buildWhereClause } from "../lib";

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

// Deterministic ids keep server and client markup identical (element ids are
// rendered into the DOM, so a random id would break hydration).
let conditionSeq = 0;
const makeCondition = (overrides = {}) => ({
  id: `c${(conditionSeq += 1)}`,
  column: "",
  operatorId: "eq",
  valueType: "string",
  value: "",
  value2: "",
  connector: "AND",
  negate: false,
  ...overrides,
});

const DEFAULT_CONDITIONS = [
  makeCondition({ column: "status", operatorId: "eq", valueType: "string", value: "active" }),
  makeCondition({
    column: "signup_date",
    operatorId: "between",
    valueType: "date",
    value: "2026-01-01",
    value2: "2026-06-30",
  }),
  makeCondition({ column: "city", operatorId: "in", valueType: "string", value: "Pune, Delhi, Mumbai" }),
  makeCondition({ column: "deleted_at", operatorId: "isnull" }),
];

const DEFAULT_TABLE = "customers";
const DEFAULT_DIALECT = "mysql";

export default function ToolHome() {
  const [dialectId, setDialectId] = useState(DEFAULT_DIALECT);
  const [table, setTable] = useState(DEFAULT_TABLE);
  const [conditions, setConditions] = useState(DEFAULT_CONDITIONS);
  const [copied, setCopied] = useState("");

  const result = useMemo(
    () => buildWhereClause({ conditions, dialectId, table }),
    [conditions, dialectId, table],
  );

  const hasError = Boolean(result.error);

  const updateCondition = (id, patch) => {
    setConditions((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const addCondition = () => setConditions((prev) => [...prev, makeCondition()]);

  const removeCondition = (id) =>
    setConditions((prev) => (prev.length <= 1 ? prev : prev.filter((c) => c.id !== id)));

  const copyText = async (key, text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const reset = () => {
    setDialectId(DEFAULT_DIALECT);
    setTable(DEFAULT_TABLE);
    setConditions(DEFAULT_CONDITIONS.map((c) => ({ ...c })));
    setCopied("");
  };

  const rows = hasError
    ? [
        ["Conditions", DASH],
        ["Dialect", DASH],
        ["Bound parameters", DASH],
      ]
    : [
        ["Conditions", String(result.conditionCount)],
        ["Dialect", result.dialect.label],
        ["Bound parameters", String(result.params.length)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Database className="h-4 w-4" aria-hidden="true" />
          SQL toolkit
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">SQL WHERE Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build a WHERE clause from plain conditions. Identifiers and string literals are quoted the
          way your engine expects, and you also get a parameterised version with the right
          placeholder style.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sql-dialect">
              SQL dialect
            </label>
            <select
              id="sql-dialect"
              value={dialectId}
              onChange={(event) => setDialectId(event.target.value)}
              className={`mt-2 ${INPUT_CLASS}`}
            >
              {DIALECTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sql-table">
              Table name
            </label>
            <input
              id="sql-table"
              type="text"
              value={table}
              onChange={(event) => setTable(event.target.value)}
              className={`mt-2 ${INPUT_CLASS}`}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 space-y-4">
        {conditions.map((cond, index) => {
          const op = OPERATORS.find((o) => o.id === cond.operatorId) ?? OPERATORS[0];
          const needsValue = op.arity !== 0;
          const needsSecond = op.arity === 2;
          const isList = op.arity === "list";
          return (
            <div
              key={cond.id}
              className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                  Condition {index + 1}
                </p>
                {index > 0 ? (
                  <div className="flex items-center gap-2">
                    <label className="sr-only" htmlFor={`sql-connector-${cond.id}`}>
                      Join condition {index + 1} with
                    </label>
                    <select
                      id={`sql-connector-${cond.id}`}
                      value={cond.connector}
                      onChange={(event) => updateCondition(cond.id, { connector: event.target.value })}
                      className="h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                    >
                      {CONNECTORS.map((c) => (
                        <option key={c} value={c}>
                          {c} previous
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`sql-column-${cond.id}`}>
                    Column
                  </label>
                  <input
                    id={`sql-column-${cond.id}`}
                    type="text"
                    value={cond.column}
                    onChange={(event) => updateCondition(cond.id, { column: event.target.value })}
                    placeholder="status"
                    className={`mt-2 ${INPUT_CLASS}`}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`sql-operator-${cond.id}`}>
                    Operator
                  </label>
                  <select
                    id={`sql-operator-${cond.id}`}
                    value={cond.operatorId}
                    onChange={(event) => updateCondition(cond.id, { operatorId: event.target.value })}
                    className={`mt-2 ${INPUT_CLASS}`}
                  >
                    {OPERATORS.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                {needsValue ? (
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`sql-type-${cond.id}`}>
                      Value type
                    </label>
                    <select
                      id={`sql-type-${cond.id}`}
                      value={cond.valueType}
                      onChange={(event) => updateCondition(cond.id, { valueType: event.target.value })}
                      className={`mt-2 ${INPUT_CLASS}`}
                    >
                      {VALUE_TYPES.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}

                {needsValue ? (
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`sql-value-${cond.id}`}>
                      {isList ? "Values (comma separated)" : needsSecond ? "From" : "Value"}
                    </label>
                    <input
                      id={`sql-value-${cond.id}`}
                      type="text"
                      value={cond.value}
                      onChange={(event) => updateCondition(cond.id, { value: event.target.value })}
                      className={`mt-2 ${INPUT_CLASS}`}
                    />
                  </div>
                ) : null}

                {needsSecond ? (
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`sql-value2-${cond.id}`}>
                      To
                    </label>
                    <input
                      id={`sql-value2-${cond.id}`}
                      type="text"
                      value={cond.value2}
                      onChange={(event) => updateCondition(cond.id, { value2: event.target.value })}
                      className={`mt-2 ${INPUT_CLASS}`}
                    />
                  </div>
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <label
                  className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold"
                  htmlFor={`sql-negate-${cond.id}`}
                >
                  <input
                    id={`sql-negate-${cond.id}`}
                    type="checkbox"
                    checked={cond.negate}
                    onChange={(event) => updateCondition(cond.id, { negate: event.target.checked })}
                    className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                  />
                  Wrap in NOT ( … )
                </label>
                <button
                  type="button"
                  onClick={() => removeCondition(cond.id)}
                  disabled={conditions.length <= 1}
                  aria-label={`Remove condition ${index + 1}`}
                  className={`${GHOST_BTN} disabled:opacity-50`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>
            </div>
          );
        })}

        <button type="button" onClick={addCondition} className={GHOST_BTN} aria-label="Add another condition">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add condition
        </button>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              WHERE clause
            </p>
            <p className="mt-2 overflow-x-auto font-mono text-lg leading-7 font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.whereClause}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copyText("where", hasError ? "" : result.whereClause)}
              disabled={hasError}
              aria-label="Copy the WHERE clause"
              className={`${PRIMARY_BTN} disabled:opacity-50`}
            >
              {copied === "where" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied === "where" ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset to the example conditions" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.note ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
            {result.note}
          </p>
        ) : null}
      </section>

      {!hasError ? (
        <section className="mt-6 grid gap-4">
          <div className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Full query</h2>
              <button
                type="button"
                onClick={() => copyText("sql", result.sql)}
                aria-label="Copy the full SELECT query"
                className={GHOST_BTN}
              >
                {copied === "sql" ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
                {copied === "sql" ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre className="mt-3 overflow-x-auto rounded-md bg-[var(--muted)] p-3 font-mono text-xs leading-5">
              {result.sql}
            </pre>
          </div>

          <div className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Parameterised (safe from injection)</h2>
              <button
                type="button"
                onClick={() => copyText("param", result.parameterisedClause)}
                aria-label="Copy the parameterised WHERE clause"
                className={GHOST_BTN}
              >
                {copied === "param" ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
                {copied === "param" ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre className="mt-3 overflow-x-auto rounded-md bg-[var(--muted)] p-3 font-mono text-xs leading-5">
              {result.parameterisedClause}
            </pre>
            <p className="mt-3 text-xs font-semibold text-[var(--muted-foreground)]">Parameters</p>
            <pre className="mt-1 overflow-x-auto rounded-md bg-[var(--muted)] p-3 font-mono text-xs leading-5">
              {JSON.stringify(result.params)}
            </pre>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Quoting here protects against broken syntax, not against untrusted input. For values that
        come from users, run the parameterised clause with bound parameters rather than pasting
        literals into a query.
      </p>
    </main>
  );
}
