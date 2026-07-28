"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GitMerge, Plus, RotateCcw, Trash2, TriangleAlert } from "lucide-react";

import {
  AGG_FUNCTIONS,
  CARDINALITIES,
  DEMO_DEFAULTS,
  DEMO_SQL,
  JOIN_TRAPS,
  MAX_AGGREGATES,
  MAX_TABLES,
  analyzeJoinPlan,
  runFanOutDemo,
} from "../lib";

const DASH = "—";

const INPUT =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-xs font-semibold text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";
const TH = "whitespace-nowrap px-3 py-2 text-left font-semibold text-[var(--muted-foreground)]";
const TD = "whitespace-nowrap px-3 py-2 align-top";

const intFmt = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const twoFmt = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const factorFmt = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });

const showInt = (value) => (typeof value === "number" && Number.isFinite(value) ? intFmt.format(Math.round(value)) : DASH);
const showNum = (value) => (typeof value === "number" && Number.isFinite(value) ? twoFmt.format(value) : DASH);
const showFactor = (value) =>
  typeof value === "number" && Number.isFinite(value) ? `${factorFmt.format(value)}x` : DASH;

const STATUS_STYLE = {
  ok: "bg-[var(--success-soft)] text-[var(--success)]",
  inflated: "bg-[var(--danger-soft)] text-[var(--danger)]",
  distorted: "bg-[var(--warning-soft)] text-[var(--warning)]",
  unsafe: "bg-[var(--danger-soft)] text-[var(--danger)]",
};
const STATUS_LABEL = {
  ok: "Survives",
  inflated: "Inflated",
  distorted: "Distorted",
  unsafe: "Not a fix",
};

const DEFAULT_TABLES = [
  {
    id: 1,
    name: "orders",
    alias: "o",
    joinKey: "order_id",
    primaryKey: "order_id",
    grain: "one row per order",
    parent: null,
    cardinality: "one_to_one",
    multiplicity: "1",
    joinType: "base",
    unmatchedPct: "0",
    nullKeyPct: "0",
    whereOnRightTable: false,
  },
  {
    id: 2,
    name: "order_items",
    alias: "oi",
    joinKey: "order_id",
    primaryKey: "item_id",
    grain: "one row per line item",
    parent: 0,
    cardinality: "one_to_many",
    multiplicity: "3",
    joinType: "inner",
    unmatchedPct: "0",
    nullKeyPct: "0",
    whereOnRightTable: false,
  },
  {
    id: 3,
    name: "payments",
    alias: "p",
    joinKey: "order_id",
    primaryKey: "payment_id",
    grain: "one row per payment",
    parent: 0,
    cardinality: "one_to_many",
    multiplicity: "2",
    joinType: "inner",
    unmatchedPct: "0",
    nullKeyPct: "0",
    whereOnRightTable: false,
  },
];

const DEFAULT_AGGREGATES = [
  { id: 1, fn: "sum", tableIndex: 0, column: "order_total" },
  { id: 2, fn: "sum", tableIndex: 1, column: "amount" },
  { id: 3, fn: "count_star", tableIndex: 0, column: "" },
  { id: 4, fn: "count_distinct", tableIndex: 0, column: "order_id" },
  { id: 5, fn: "avg", tableIndex: 0, column: "order_total" },
];

function StatusPill({ status }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[status] || ""}`}>
      {STATUS_LABEL[status] || status}
    </span>
  );
}

function CopyButton({ label, text, copiedKey, activeKey, onCopy }) {
  const isCopied = activeKey === copiedKey;
  return (
    <button
      type="button"
      className={GHOST_BTN}
      aria-label={`Copy ${label} to the clipboard`}
      onClick={() => onCopy(copiedKey, text)}
    >
      {isCopied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
      {isCopied ? "Copied!" : "Copy"}
    </button>
  );
}

function SqlBlock({ sql }) {
  return (
    <div className="overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)]">
      <pre className="min-w-full p-4 font-mono text-xs leading-6 text-[var(--foreground)]">{sql}</pre>
    </div>
  );
}

export default function ToolHome() {
  const [baseRows, setBaseRows] = useState("12400");
  const [tables, setTables] = useState(DEFAULT_TABLES);
  const [aggregates, setAggregates] = useState(DEFAULT_AGGREGATES);
  const [nextId, setNextId] = useState(100);
  const [sqlTab, setSqlTab] = useState("naive");
  const [demo, setDemo] = useState(DEMO_DEFAULTS);
  const [copiedKey, setCopiedKey] = useState("");

  const analysis = useMemo(
    () =>
      analyzeJoinPlan({
        baseRows,
        tables: tables.map((table, index) => ({ ...table, parent: index === 0 ? null : table.parent })),
        aggregates: aggregates.map((agg) => ({ fn: agg.fn, tableIndex: agg.tableIndex, column: agg.column })),
      }),
    [baseRows, tables, aggregates],
  );
  const demoResult = useMemo(() => runFanOutDemo(demo), [demo]);

  const planError = analysis.error || "";
  const ok = !planError;
  const demoError = demoResult.error || "";
  const demoOk = !demoError;

  const summaryText = ok
    ? [
        `SQL JOIN fan-out: ${factorFmt.format(analysis.fanOutFactor)}x`,
        `${intFmt.format(analysis.baseRows)} base rows -> ${intFmt.format(Math.round(analysis.expectedJoinedRows))} joined rows`,
        analysis.baseRowsDropped > 0
          ? `${intFmt.format(Math.round(analysis.baseRowsDropped))} base rows dropped by inner-join semantics`
          : "No base rows dropped",
        "",
        ...analysis.perTable.map(
          (table) => `${table.name}: ${factorFmt.format(table.rowsPerBase)} rows per base row, each repeated ${factorFmt.format(table.dupFactor)}x`,
        ),
        "",
        ...analysis.aggregates.map((agg) => `${agg.expression}: ${STATUS_LABEL[agg.status]} — ${agg.verdict}`),
      ].join("\n")
    : "";

  const copy = async (key, text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 1500);
    } catch {
      setCopiedKey("");
    }
  };

  const patchTable = (id, patch) =>
    setTables((prev) => prev.map((table) => (table.id === id ? { ...table, ...patch } : table)));

  const setCardinality = (id, cardinality) => {
    const spec = CARDINALITIES.find((c) => c.id === cardinality);
    patchTable(id, {
      cardinality,
      multiplicity: spec ? String(spec.defaultMultiplicity) : "1",
    });
  };

  const addTable = () => {
    if (tables.length >= MAX_TABLES) return;
    setTables((prev) => [
      ...prev,
      {
        id: nextId,
        name: `table_${prev.length + 1}`,
        alias: `t${prev.length + 1}`,
        joinKey: "order_id",
        primaryKey: "id",
        grain: "",
        parent: 0,
        cardinality: "one_to_many",
        multiplicity: "2",
        joinType: "inner",
        unmatchedPct: "0",
        nullKeyPct: "0",
        whereOnRightTable: false,
      },
    ]);
    setNextId((id) => id + 1);
  };

  const removeTable = (index) => {
    setTables((prev) => {
      if (index === 0 || prev.length <= 1) return prev;
      const next = prev
        .filter((_, i) => i !== index)
        .map((table, i) => (i === 0 ? table : { ...table, parent: table.parent >= index ? Math.max(0, table.parent - 1) : table.parent }));
      return next;
    });
    setAggregates((prev) =>
      prev
        .filter((agg) => agg.tableIndex !== index)
        .map((agg) => (agg.tableIndex > index ? { ...agg, tableIndex: agg.tableIndex - 1 } : agg)),
    );
  };

  const patchAgg = (id, patch) =>
    setAggregates((prev) => prev.map((agg) => (agg.id === id ? { ...agg, ...patch } : agg)));

  const addAggregate = () => {
    if (aggregates.length >= MAX_AGGREGATES) return;
    setAggregates((prev) => [...prev, { id: nextId, fn: "sum", tableIndex: 0, column: "amount" }]);
    setNextId((id) => id + 1);
  };

  const reset = () => {
    setBaseRows("12400");
    setTables(DEFAULT_TABLES);
    setAggregates(DEFAULT_AGGREGATES);
    setDemo(DEMO_DEFAULTS);
    setSqlTab("naive");
    setCopiedKey("");
  };

  const sqlTabs = ok
    ? [
        { id: "naive", label: "As written", sql: analysis.sql.naive },
        { id: "preAggregate", label: "Fix 1 — pre-aggregate", sql: analysis.sql.preAggregate },
        { id: "window", label: "Fix 2 — window de-dup", sql: analysis.sql.window },
        ...(analysis.sql.onClause ? [{ id: "onClause", label: "Fix 3 — move WHERE to ON", sql: analysis.sql.onClause }] : []),
      ]
    : [];
  const activeSql = sqlTabs.find((tab) => tab.id === sqlTab) || sqlTabs[0];

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <GitMerge className="h-4 w-4" aria-hidden="true" />
          Join debugging
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">SQL JOIN Fan-Out Debugger</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Your SUM went up after adding a join. Describe each table&rsquo;s grain and join key cardinality
          and this computes the row-multiplication factor, marks which aggregates it corrupts and by how
          much, and emits the corrected SQL. A join is a filtered cross product (ISO/IEC 9075-2 §7.10), so
          one order matching 3 line items is added 3 times.
        </p>
      </header>

      {/* ---------------- 1. Describe the join ---------------- */}
      <section className={CARD} aria-labelledby="jf-plan-heading">
        <h2 id="jf-plan-heading" className="text-lg font-semibold">
          1. Describe your join
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="jf-base-rows">
              Rows in the base table
            </label>
            <input
              id="jf-base-rows"
              className={`mt-1 ${INPUT}`}
              type="number"
              min="1"
              inputMode="numeric"
              value={baseRows}
              onChange={(event) => setBaseRows(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="jf-base-grain">
              Base grain (one row per what?)
            </label>
            <input
              id="jf-base-grain"
              className={`mt-1 ${INPUT}`}
              type="text"
              value={tables[0].grain}
              onChange={(event) => patchTable(tables[0].id, { grain: event.target.value })}
              placeholder="one row per order"
            />
          </div>
        </div>

        {tables.map((table, index) => (
          <fieldset key={table.id} className="mt-5 rounded-lg border border-[var(--border)] p-4">
            <legend className="px-1 text-sm font-semibold">
              {index === 0 ? "Base table" : `Joined table ${index}`}
            </legend>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL} htmlFor={`jf-name-${table.id}`}>
                  Table name
                </label>
                <input
                  id={`jf-name-${table.id}`}
                  className={`mt-1 font-mono ${INPUT}`}
                  type="text"
                  value={table.name}
                  onChange={(event) => patchTable(table.id, { name: event.target.value })}
                />
              </div>
              <div>
                <label className={LABEL} htmlFor={`jf-alias-${table.id}`}>
                  Alias
                </label>
                <input
                  id={`jf-alias-${table.id}`}
                  className={`mt-1 font-mono ${INPUT}`}
                  type="text"
                  value={table.alias}
                  onChange={(event) => patchTable(table.id, { alias: event.target.value })}
                />
              </div>
              <div>
                <label className={LABEL} htmlFor={`jf-key-${table.id}`}>
                  Join key column
                </label>
                <input
                  id={`jf-key-${table.id}`}
                  className={`mt-1 font-mono ${INPUT}`}
                  type="text"
                  value={table.joinKey}
                  onChange={(event) => patchTable(table.id, { joinKey: event.target.value })}
                />
              </div>
              <div>
                <label className={LABEL} htmlFor={`jf-pk-${table.id}`}>
                  Primary key (used by the window fix)
                </label>
                <input
                  id={`jf-pk-${table.id}`}
                  className={`mt-1 font-mono ${INPUT}`}
                  type="text"
                  value={table.primaryKey}
                  onChange={(event) => patchTable(table.id, { primaryKey: event.target.value })}
                />
              </div>

              {index > 0 ? (
                <>
                  <div>
                    <label className={LABEL} htmlFor={`jf-parent-${table.id}`}>
                      Joins to
                    </label>
                    <select
                      id={`jf-parent-${table.id}`}
                      className={`mt-1 ${INPUT}`}
                      value={table.parent}
                      onChange={(event) => patchTable(table.id, { parent: Number(event.target.value) })}
                    >
                      {tables.slice(0, index).map((parent, parentIndex) => (
                        <option key={parent.id} value={parentIndex}>
                          {parent.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={LABEL} htmlFor={`jf-card-${table.id}`}>
                      Join key cardinality
                    </label>
                    <select
                      id={`jf-card-${table.id}`}
                      className={`mt-1 ${INPUT}`}
                      value={table.cardinality}
                      onChange={(event) => setCardinality(table.id, event.target.value)}
                    >
                      {CARDINALITIES.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={LABEL} htmlFor={`jf-mult-${table.id}`}>
                      Average matching rows per parent row
                    </label>
                    <input
                      id={`jf-mult-${table.id}`}
                      className={`mt-1 ${INPUT}`}
                      type="number"
                      min="0"
                      step="0.1"
                      inputMode="decimal"
                      disabled={table.cardinality === "one_to_one"}
                      value={table.cardinality === "one_to_one" ? "1" : table.multiplicity}
                      onChange={(event) => patchTable(table.id, { multiplicity: event.target.value })}
                    />
                  </div>
                  <div>
                    <label className={LABEL} htmlFor={`jf-type-${table.id}`}>
                      Join type
                    </label>
                    <select
                      id={`jf-type-${table.id}`}
                      className={`mt-1 ${INPUT}`}
                      value={table.joinType}
                      onChange={(event) => patchTable(table.id, { joinType: event.target.value })}
                    >
                      <option value="inner">INNER JOIN</option>
                      <option value="left">LEFT JOIN</option>
                    </select>
                  </div>
                  <div>
                    <label className={LABEL} htmlFor={`jf-unmatched-${table.id}`}>
                      Parent rows with no match (%)
                    </label>
                    <input
                      id={`jf-unmatched-${table.id}`}
                      className={`mt-1 ${INPUT}`}
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      inputMode="decimal"
                      value={table.unmatchedPct}
                      onChange={(event) => patchTable(table.id, { unmatchedPct: event.target.value })}
                    />
                  </div>
                  <div>
                    <label className={LABEL} htmlFor={`jf-null-${table.id}`}>
                      Of those, NULL join keys (%)
                    </label>
                    <input
                      id={`jf-null-${table.id}`}
                      className={`mt-1 ${INPUT}`}
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      inputMode="decimal"
                      value={table.nullKeyPct}
                      onChange={(event) => patchTable(table.id, { nullKeyPct: event.target.value })}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label
                      className="flex min-h-11 items-center gap-3 text-sm text-[var(--foreground)]"
                      htmlFor={`jf-where-${table.id}`}
                    >
                      <input
                        id={`jf-where-${table.id}`}
                        type="checkbox"
                        className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                        checked={table.whereOnRightTable}
                        onChange={(event) => patchTable(table.id, { whereOnRightTable: event.target.checked })}
                      />
                      My WHERE clause filters a column of {table.name || "this table"}
                    </label>
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      className={GHOST_BTN}
                      aria-label={`Remove ${table.name} from the join`}
                      onClick={() => removeTable(index)}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      Remove table
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </fieldset>
        ))}

        {tables.length < MAX_TABLES ? (
          <button type="button" className={`mt-4 ${GHOST_BTN}`} onClick={addTable}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add a joined table
          </button>
        ) : null}
      </section>

      {/* ---------------- 2. Aggregates ---------------- */}
      <section className={`mt-6 ${CARD}`} aria-labelledby="jf-agg-heading">
        <h2 id="jf-agg-heading" className="text-lg font-semibold">
          2. Which columns do you aggregate?
        </h2>
        {aggregates.map((agg, index) => {
          const fn = AGG_FUNCTIONS.find((f) => f.id === agg.fn);
          return (
            <div key={agg.id} className="mt-4 grid gap-3 border-t border-[var(--border)] pt-4 sm:grid-cols-2">
              <div>
                <label className={LABEL} htmlFor={`jf-fn-${agg.id}`}>
                  Function
                </label>
                <select
                  id={`jf-fn-${agg.id}`}
                  className={`mt-1 ${INPUT}`}
                  value={agg.fn}
                  onChange={(event) => patchAgg(agg.id, { fn: event.target.value })}
                >
                  {AGG_FUNCTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL} htmlFor={`jf-tbl-${agg.id}`}>
                  From table
                </label>
                <select
                  id={`jf-tbl-${agg.id}`}
                  className={`mt-1 ${INPUT}`}
                  value={agg.tableIndex}
                  onChange={(event) => patchAgg(agg.id, { tableIndex: Number(event.target.value) })}
                >
                  {tables.map((table, tableIndex) => (
                    <option key={table.id} value={tableIndex}>
                      {table.name}
                    </option>
                  ))}
                </select>
              </div>
              {fn?.needsColumn ? (
                <div>
                  <label className={LABEL} htmlFor={`jf-col-${agg.id}`}>
                    Column
                  </label>
                  <input
                    id={`jf-col-${agg.id}`}
                    className={`mt-1 font-mono ${INPUT}`}
                    type="text"
                    value={agg.column}
                    onChange={(event) => patchAgg(agg.id, { column: event.target.value })}
                  />
                </div>
              ) : null}
              <div className="flex items-end">
                <button
                  type="button"
                  className={GHOST_BTN}
                  aria-label={`Remove aggregate ${index + 1}`}
                  onClick={() => setAggregates((prev) => prev.filter((item) => item.id !== agg.id))}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>
            </div>
          );
        })}
        {aggregates.length < MAX_AGGREGATES ? (
          <button type="button" className={`mt-4 ${GHOST_BTN}`} onClick={addAggregate}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add an aggregate
          </button>
        ) : null}
      </section>

      {/* ---------------- Result ---------------- */}
      <section className={`mt-6 ${CARD}`} aria-labelledby="jf-result-heading">
        <h2 id="jf-result-heading" className="text-lg font-semibold">
          Fan-out result
        </h2>

        {planError ? (
          <p className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]" role="alert">
            {planError}
          </p>
        ) : null}

        <p className="mt-4 text-5xl font-semibold tracking-tight text-[var(--primary)]">
          {ok ? showFactor(analysis.fanOutFactor) : DASH}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          rows out of the join for every row of {tables[0].name || "the base table"}
        </p>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-[var(--border)] p-3">
            <dt className="text-xs font-semibold text-[var(--muted-foreground)]">Base rows in</dt>
            <dd className="mt-1 text-lg font-semibold">{ok ? showInt(analysis.baseRows) : DASH}</dd>
          </div>
          <div className="rounded-lg border border-[var(--border)] p-3">
            <dt className="text-xs font-semibold text-[var(--muted-foreground)]">Rows out of the join</dt>
            <dd className="mt-1 text-lg font-semibold">{ok ? showInt(analysis.expectedJoinedRows) : DASH}</dd>
          </div>
          <div className="rounded-lg border border-[var(--border)] p-3">
            <dt className="text-xs font-semibold text-[var(--muted-foreground)]">Extra rows created</dt>
            <dd className="mt-1 text-lg font-semibold">{ok ? showInt(analysis.extraRows) : DASH}</dd>
          </div>
          <div className="rounded-lg border border-[var(--border)] p-3">
            <dt className="text-xs font-semibold text-[var(--muted-foreground)]">Base rows dropped by inner joins</dt>
            <dd className="mt-1 text-lg font-semibold">{ok ? showInt(analysis.baseRowsDropped) : DASH}</dd>
          </div>
        </dl>

        <div className="mt-4 flex flex-wrap gap-3">
          <CopyButton
            label="the fan-out summary"
            text={summaryText}
            copiedKey="summary"
            activeKey={copiedKey}
            onCopy={copy}
          />
          <button type="button" className={PRIMARY_BTN} onClick={reset}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>

        {ok && analysis.warnings.length > 0 ? (
          <ul className="mt-5 space-y-3">
            {analysis.warnings.map((warning) => (
              <li
                key={warning.id}
                className="rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--foreground)]"
              >
                <span className="flex items-start gap-2">
                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[var(--warning)]" aria-hidden="true" />
                  <span>
                    <strong className="font-semibold">{warning.title}</strong>
                    <span className="mt-1 block text-[var(--muted-foreground)]">{warning.detail}</span>
                  </span>
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        <h3 className="mt-6 text-sm font-semibold">Row duplication, table by table</h3>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className={TH}>Table</th>
                <th className={TH}>Rows per base row</th>
                <th className={TH}>Each row repeated</th>
                <th className={TH}>Rows in result</th>
              </tr>
            </thead>
            <tbody>
              {(ok ? analysis.perTable : []).map((table) => (
                <tr key={table.index} className="border-b border-[var(--border)]">
                  <td className={`${TD} font-mono`}>{table.name}</td>
                  <td className={TD}>{showFactor(table.rowsPerBase)}</td>
                  <td className={`${TD} ${table.duplicated ? "text-[var(--danger)]" : "text-[var(--success)]"}`}>
                    {showFactor(table.dupFactor)}
                  </td>
                  <td className={TD}>{showInt(table.rowsInResult)}</td>
                </tr>
              ))}
              {ok ? null : (
                <tr>
                  <td className={TD} colSpan={4}>
                    {DASH}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <h3 className="mt-6 text-sm font-semibold">What each aggregate reports</h3>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className={TH}>Aggregate</th>
                <th className={TH}>Verdict</th>
                <th className={TH}>Reported / true</th>
                <th className={TH}>Why</th>
              </tr>
            </thead>
            <tbody>
              {(ok ? analysis.aggregates : []).map((agg, index) => (
                <tr key={`${agg.expression}-${index}`} className="border-b border-[var(--border)]">
                  <td className={`${TD} font-mono`}>{agg.expression}</td>
                  <td className={TD}>
                    <StatusPill status={agg.status} />
                  </td>
                  <td className={TD}>{agg.resultFactor === null ? "depends on the data" : showFactor(agg.resultFactor)}</td>
                  <td className="px-3 py-2 align-top text-[var(--muted-foreground)]">{agg.verdict}</td>
                </tr>
              ))}
              {ok ? null : (
                <tr>
                  <td className={TD} colSpan={4}>
                    {DASH}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {ok ? (
          <ul className="mt-4 list-disc space-y-1 pl-5 text-xs text-[var(--muted-foreground)]">
            {analysis.assumptions.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : null}
      </section>

      {/* ---------------- SQL ---------------- */}
      <section className={`mt-6 ${CARD}`} aria-labelledby="jf-sql-heading">
        <h2 id="jf-sql-heading" className="text-lg font-semibold">
          Your query, as written and corrected
        </h2>
        {ok ? (
          <>
            <div className="mt-4 flex flex-wrap gap-2">
              {sqlTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSqlTab(tab.id)}
                  aria-pressed={activeSql?.id === tab.id}
                  className={activeSql?.id === tab.id ? PRIMARY_BTN : GHOST_BTN}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="mt-4">
              <SqlBlock sql={activeSql?.sql || ""} />
            </div>
            <div className="mt-3">
              <CopyButton
                label="the generated SQL"
                text={activeSql?.sql || ""}
                copiedKey={`sql-${activeSql?.id}`}
                activeKey={copiedKey}
                onCopy={copy}
              />
            </div>
          </>
        ) : (
          <p className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]" role="alert">
            No SQL generated — fix the description above first.
          </p>
        )}
      </section>

      {/* ---------------- Worked demo ---------------- */}
      <section className={`mt-6 ${CARD}`} aria-labelledby="jf-demo-heading">
        <h2 id="jf-demo-heading" className="text-lg font-semibold">
          Worked demo: three tiny tables you can edit
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Three orders totalling 1,300 joined to their line items and their payments. Edit any cell and every
          figure below is recomputed from these rows — nothing is hard-coded. One value per column, one row
          per line; leave an order_id blank to make it NULL.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="jf-demo-orders">
              orders (order_id, order_total)
            </label>
            <textarea
              id="jf-demo-orders"
              rows={5}
              className={`mt-1 ${AREA}`}
              value={demo.ordersText}
              onChange={(event) => setDemo((prev) => ({ ...prev, ordersText: event.target.value }))}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="jf-demo-items">
              order_items (item_id, order_id, amount)
            </label>
            <textarea
              id="jf-demo-items"
              rows={5}
              className={`mt-1 ${AREA}`}
              value={demo.itemsText}
              onChange={(event) => setDemo((prev) => ({ ...prev, itemsText: event.target.value }))}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="jf-demo-payments">
              payments (payment_id, order_id, amount)
            </label>
            <textarea
              id="jf-demo-payments"
              rows={5}
              className={`mt-1 ${AREA}`}
              value={demo.paymentsText}
              onChange={(event) => setDemo((prev) => ({ ...prev, paymentsText: event.target.value }))}
            />
          </div>
        </div>

        {demoError ? (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]" role="alert">
            {demoError}
          </p>
        ) : null}

        <p className="mt-5 text-4xl font-semibold tracking-tight text-[var(--danger)]">
          {demoOk ? showFactor(demoResult.factors.orderTotal) : DASH}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          what SUM(o.order_total) reports through the naive three-way join, against the true total
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[44rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className={TH}>Measure</th>
                <th className={TH}>True</th>
                <th className={TH}>Naive join</th>
                <th className={TH}>Off by</th>
                <th className={TH}>Fix 1 pre-aggregate</th>
                <th className={TH}>Fix 2 window</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[var(--border)]">
                <td className={`${TD} font-mono`}>SUM(o.order_total)</td>
                <td className={TD}>{demoOk ? showInt(demoResult.truth.orderTotal) : DASH}</td>
                <td className={`${TD} text-[var(--danger)]`}>{demoOk ? showInt(demoResult.naive.orderTotal) : DASH}</td>
                <td className={TD}>{demoOk ? showFactor(demoResult.factors.orderTotal) : DASH}</td>
                <td className={`${TD} text-[var(--success)]`}>{demoOk ? showInt(demoResult.fixPreAggregate.orderTotal) : DASH}</td>
                <td className={`${TD} text-[var(--success)]`}>{demoOk ? showInt(demoResult.fixWindow.orderTotal) : DASH}</td>
              </tr>
              <tr className="border-b border-[var(--border)]">
                <td className={`${TD} font-mono`}>SUM(oi.amount)</td>
                <td className={TD}>{demoOk ? showInt(demoResult.truth.itemsAmount) : DASH}</td>
                <td className={`${TD} text-[var(--danger)]`}>{demoOk ? showInt(demoResult.naive.itemsAmount) : DASH}</td>
                <td className={TD}>{demoOk ? showFactor(demoResult.factors.itemsAmount) : DASH}</td>
                <td className={`${TD} text-[var(--success)]`}>{demoOk ? showInt(demoResult.fixPreAggregate.itemsAmount) : DASH}</td>
                <td className={`${TD} text-[var(--success)]`}>{demoOk ? showInt(demoResult.fixWindow.itemsAmount) : DASH}</td>
              </tr>
              <tr className="border-b border-[var(--border)]">
                <td className={`${TD} font-mono`}>SUM(p.amount)</td>
                <td className={TD}>{demoOk ? showInt(demoResult.truth.paymentsAmount) : DASH}</td>
                <td className={`${TD} text-[var(--danger)]`}>{demoOk ? showInt(demoResult.naive.paymentsAmount) : DASH}</td>
                <td className={TD}>{demoOk ? showFactor(demoResult.factors.paymentsAmount) : DASH}</td>
                <td className={`${TD} text-[var(--success)]`}>{demoOk ? showInt(demoResult.fixPreAggregate.paymentsAmount) : DASH}</td>
                <td className={`${TD} text-[var(--success)]`}>{demoOk ? showInt(demoResult.fixWindow.paymentsAmount) : DASH}</td>
              </tr>
              <tr className="border-b border-[var(--border)]">
                <td className={`${TD} font-mono`}>COUNT(*)</td>
                <td className={TD}>{demoOk ? showInt(demoResult.truth.orderCount) : DASH}</td>
                <td className={`${TD} text-[var(--danger)]`}>{demoOk ? showInt(demoResult.naive.countStar) : DASH}</td>
                <td className={TD}>{demoOk ? showFactor(demoResult.factors.rows) : DASH}</td>
                <td className={TD} colSpan={2}>
                  {demoOk ? `${showInt(demoResult.naive.countDistinctOrders)} from COUNT(DISTINCT o.order_id)` : DASH}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="mt-6 text-sm font-semibold">The aggregates that survive, and the one that pretends to</h3>
        <dl className="mt-2 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-[var(--border)] p-3">
            <dt className="font-mono text-xs text-[var(--muted-foreground)]">COUNT(DISTINCT o.order_id)</dt>
            <dd className="mt-1 text-sm">
              {demoOk ? `${showInt(demoResult.naive.countDistinctOrders)} — true order count is ${showInt(demoResult.truth.orderCount)}` : DASH}
            </dd>
          </div>
          <div className="rounded-lg border border-[var(--border)] p-3">
            <dt className="font-mono text-xs text-[var(--muted-foreground)]">AVG(o.order_total)</dt>
            <dd className="mt-1 text-sm">
              {demoOk
                ? `${showNum(demoResult.naive.avgOrderTotal)} through the join, true average ${showNum(demoResult.truth.avgOrderTotal)}`
                : DASH}
            </dd>
          </div>
          <div className="rounded-lg border border-[var(--border)] p-3">
            <dt className="font-mono text-xs text-[var(--muted-foreground)]">MIN / MAX(o.order_total)</dt>
            <dd className="mt-1 text-sm">
              {demoOk
                ? `${showInt(demoResult.naive.minOrderTotal)} / ${showInt(demoResult.naive.maxOrderTotal)} through the join, true ${showInt(demoResult.truth.minOrderTotal)} / ${showInt(demoResult.truth.maxOrderTotal)}`
                : DASH}
            </dd>
          </div>
          <div className="rounded-lg border border-[var(--border)] p-3">
            <dt className="font-mono text-xs text-[var(--muted-foreground)]">SUM(DISTINCT o.order_total)</dt>
            <dd className="mt-1 text-sm text-[var(--danger)]">
              {demoOk
                ? `${showInt(demoResult.naive.sumDistinctOrderTotal)} against a true total of ${showInt(demoResult.truth.orderTotal)} — two orders with the same total collapse into one value`
                : DASH}
            </dd>
          </div>
        </dl>

        <h3 className="mt-6 text-sm font-semibold">Where the extra rows come from</h3>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[38rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className={TH}>order_id</th>
                <th className={TH}>order_total</th>
                <th className={TH}>items</th>
                <th className={TH}>payments</th>
                <th className={TH}>joined rows</th>
                <th className={TH}>order_total counted as</th>
              </tr>
            </thead>
            <tbody>
              {(demoOk ? demoResult.perOrder : []).map((row) => (
                <tr key={row.orderId} className="border-b border-[var(--border)]">
                  <td className={`${TD} font-mono`}>{row.orderId}</td>
                  <td className={TD}>{showInt(row.orderTotal)}</td>
                  <td className={TD}>{showInt(row.itemCount)}</td>
                  <td className={TD}>{showInt(row.paymentCount)}</td>
                  <td className={TD}>{showInt(row.joinedRows)}</td>
                  <td className={`${TD} ${row.joinedRows > 1 ? "text-[var(--danger)]" : ""}`}>{showInt(row.contribution)}</td>
                </tr>
              ))}
              {demoOk ? null : (
                <tr>
                  <td className={TD} colSpan={6}>
                    {DASH}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {demoOk && (demoResult.counts.droppedOrders > 0 || demoResult.counts.orphanItems > 0 || demoResult.counts.orphanPayments > 0) ? (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--foreground)]">
            The inner join also dropped {showInt(demoResult.counts.droppedOrders)} order(s) with no item or no
            payment, and {showInt(demoResult.counts.orphanItems)} item(s) and {showInt(demoResult.counts.orphanPayments)} payment(s)
            matched no order ({showInt(demoResult.counts.nullKeyItems)} of those items had a NULL order_id). Fix 1
            keeps the dropped orders because it LEFT JOINs the pre-aggregates; Fix 2 works on the already-joined
            rows, so it cannot bring them back.
          </p>
        ) : null}

        <h3 className="mt-6 text-sm font-semibold">The three demo queries</h3>
        <div className="mt-3 space-y-4">
          {[
            { id: "demo-naive", title: "As written — reports the inflated totals", sql: DEMO_SQL.naive },
            { id: "demo-pre", title: "Fix 1 — pre-aggregate each child to one row per order", sql: DEMO_SQL.preAggregate },
            { id: "demo-window", title: "Fix 2 — ROW_NUMBER de-duplication over the same rows", sql: DEMO_SQL.window },
          ].map((block) => (
            <div key={block.id}>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold">{block.title}</p>
                <CopyButton
                  label={block.title}
                  text={block.sql}
                  copiedKey={block.id}
                  activeKey={copiedKey}
                  onCopy={copy}
                />
              </div>
              <SqlBlock sql={block.sql} />
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- Traps ---------------- */}
      <section className={`mt-6 ${CARD}`} aria-labelledby="jf-traps-heading">
        <h2 id="jf-traps-heading" className="text-lg font-semibold">
          The four ways a join changes your total
        </h2>
        <div className="mt-4 space-y-4">
          {JOIN_TRAPS.map((trap) => (
            <article key={trap.id} className="rounded-lg border border-[var(--border)] p-4">
              <h3 className="text-sm font-semibold">{trap.title}</h3>
              <dl className="mt-2 space-y-2 text-sm">
                <div>
                  <dt className="text-xs font-semibold text-[var(--muted-foreground)]">Symptom</dt>
                  <dd className="mt-0.5">{trap.symptom}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-[var(--muted-foreground)]">Rule that causes it</dt>
                  <dd className="mt-0.5 text-[var(--muted-foreground)]">{trap.cause}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-[var(--muted-foreground)]">What removes it</dt>
                  <dd className="mt-0.5 text-[var(--muted-foreground)]">{trap.fix}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
        <p className="mt-4 text-xs text-[var(--muted-foreground)]">
          Clause references are to ISO/IEC 9075-2 (SQL/Foundation), read on 29 July 2026. MIN and MAX survive
          row duplication, but not rows that an inner join dropped — that is a separate error in the opposite
          direction.
        </p>
      </section>
    </main>
  );
}
