"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Filter, Plus, RotateCcw, Trash2 } from "lucide-react";

import { OPERATORS, PARAM_STYLES, VALUE_TYPES, buildWhereClause } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-xs font-semibold text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const makeCondition = (id, seed = {}) => ({
  id,
  field: "",
  operator: "eq",
  value: "",
  value2: "",
  valueType: "text",
  ...seed,
});

const DEFAULT_GROUPS = [
  {
    id: 1,
    combinator: "AND",
    conditions: [
      makeCondition(1, { field: "status", operator: "eq", value: "active" }),
      makeCondition(2, { field: "age", operator: "gte", value: "18", valueType: "number" }),
    ],
  },
  {
    id: 2,
    combinator: "OR",
    conditions: [
      makeCondition(3, { field: "city", operator: "eq", value: "Delhi" }),
      makeCondition(4, { field: "city", operator: "eq", value: "Mumbai" }),
    ],
  },
];

const DASH = "—";

export default function ToolHome() {
  const [groups, setGroups] = useState(DEFAULT_GROUPS);
  const [groupCombinator, setGroupCombinator] = useState("AND");
  const [paramStyle, setParamStyle] = useState("literal");
  const [nextId, setNextId] = useState(100);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => buildWhereClause({ groups, groupCombinator, paramStyle }),
    [groups, groupCombinator, paramStyle],
  );
  const hasError = Boolean(result.error);

  const updateCondition = (groupId, conditionId, patch) => {
    setGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? {
              ...group,
              conditions: group.conditions.map((condition) =>
                condition.id === conditionId ? { ...condition, ...patch } : condition,
              ),
            }
          : group,
      ),
    );
  };

  const addCondition = (groupId) => {
    setGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? { ...group, conditions: [...group.conditions, makeCondition(nextId)] }
          : group,
      ),
    );
    setNextId((id) => id + 1);
  };

  const removeCondition = (groupId, conditionId) => {
    setGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? { ...group, conditions: group.conditions.filter((condition) => condition.id !== conditionId) }
          : group,
      ),
    );
  };

  const addGroup = () => {
    setGroups((prev) => [
      ...prev,
      { id: nextId, combinator: "AND", conditions: [makeCondition(nextId + 1)] },
    ]);
    setNextId((id) => id + 2);
  };

  const removeGroup = (groupId) => {
    setGroups((prev) => (prev.length > 1 ? prev.filter((group) => group.id !== groupId) : prev));
  };

  const setCombinator = (groupId, combinator) => {
    setGroups((prev) => prev.map((group) => (group.id === groupId ? { ...group, combinator } : group)));
  };

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.clause);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setGroups(DEFAULT_GROUPS);
    setGroupCombinator("AND");
    setParamStyle("literal");
    setNextId(100);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Filter className="h-4 w-4" aria-hidden="true" />
          Database design
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">SQL WHERE Clause Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Compose AND/OR condition groups visually — with IN, BETWEEN and NULL checks — and get a
          correctly parenthesised WHERE clause with inline literals or bind parameters.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="swb-style">
              Parameter style
            </label>
            <select
              id="swb-style"
              className={`mt-2 ${INPUT_CLASS}`}
              value={paramStyle}
              onChange={(event) => setParamStyle(event.target.value)}
            >
              {PARAM_STYLES.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="swb-join">
              Join groups with
            </label>
            <select
              id="swb-join"
              className={`mt-2 ${INPUT_CLASS}`}
              value={groupCombinator}
              onChange={(event) => setGroupCombinator(event.target.value)}
            >
              <option value="AND">AND</option>
              <option value="OR">OR</option>
            </select>
          </div>
        </div>

        {groups.map((group, groupIndex) => (
          <fieldset
            key={group.id}
            className="mt-5 rounded-lg border border-[var(--border)] p-4"
          >
            <legend className="px-1 text-sm font-semibold">
              Group {groupIndex + 1}
            </legend>
            <div className="flex flex-wrap items-center gap-3">
              <label className={LABEL_CLASS} htmlFor={`swb-comb-${group.id}`}>
                Conditions joined with
              </label>
              <select
                id={`swb-comb-${group.id}`}
                className="h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                value={group.combinator}
                onChange={(event) => setCombinator(group.id, event.target.value)}
              >
                <option value="AND">AND</option>
                <option value="OR">OR</option>
              </select>
              {groups.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeGroup(group.id)}
                  aria-label={`Remove group ${groupIndex + 1}`}
                  className={`${GHOST_BTN} ml-auto`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove group
                </button>
              ) : null}
            </div>

            {group.conditions.map((condition) => {
              const operator = OPERATORS.find((op) => op.id === condition.operator);
              const arity = operator?.arity ?? "one";
              return (
                <div key={condition.id} className="mt-4 grid gap-3 border-t border-[var(--border)] pt-4 sm:grid-cols-2">
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`swb-f-${condition.id}`}>
                      Column
                    </label>
                    <input
                      id={`swb-f-${condition.id}`}
                      className={`mt-1 font-mono ${INPUT_CLASS}`}
                      type="text"
                      value={condition.field}
                      onChange={(event) => updateCondition(group.id, condition.id, { field: event.target.value })}
                      placeholder="u.status"
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`swb-o-${condition.id}`}>
                      Operator
                    </label>
                    <select
                      id={`swb-o-${condition.id}`}
                      className={`mt-1 ${INPUT_CLASS}`}
                      value={condition.operator}
                      onChange={(event) => updateCondition(group.id, condition.id, { operator: event.target.value })}
                    >
                      {OPERATORS.map((op) => (
                        <option key={op.id} value={op.id}>
                          {op.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {arity !== "none" ? (
                    <div>
                      <label className={LABEL_CLASS} htmlFor={`swb-v-${condition.id}`}>
                        {arity === "list"
                          ? "Values (comma separated)"
                          : arity === "two"
                            ? "Low value"
                            : "Value"}
                      </label>
                      <input
                        id={`swb-v-${condition.id}`}
                        className={`mt-1 font-mono ${INPUT_CLASS}`}
                        type="text"
                        value={condition.value}
                        onChange={(event) => updateCondition(group.id, condition.id, { value: event.target.value })}
                      />
                    </div>
                  ) : null}
                  {arity === "two" ? (
                    <div>
                      <label className={LABEL_CLASS} htmlFor={`swb-v2-${condition.id}`}>
                        High value
                      </label>
                      <input
                        id={`swb-v2-${condition.id}`}
                        className={`mt-1 font-mono ${INPUT_CLASS}`}
                        type="text"
                        value={condition.value2}
                        onChange={(event) => updateCondition(group.id, condition.id, { value2: event.target.value })}
                      />
                    </div>
                  ) : null}
                  {arity !== "none" ? (
                    <div>
                      <label className={LABEL_CLASS} htmlFor={`swb-t-${condition.id}`}>
                        Value type
                      </label>
                      <select
                        id={`swb-t-${condition.id}`}
                        className={`mt-1 ${INPUT_CLASS}`}
                        value={condition.valueType}
                        onChange={(event) => updateCondition(group.id, condition.id, { valueType: event.target.value })}
                      >
                        {VALUE_TYPES.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeCondition(group.id, condition.id)}
                      aria-label="Remove this condition"
                      className={GHOST_BTN}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}

            <button
              type="button"
              onClick={() => addCondition(group.id)}
              className={`${GHOST_BTN} mt-4`}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add condition
            </button>
          </fieldset>
        ))}

        <button type="button" onClick={addGroup} className={`${GHOST_BTN} mt-5`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add group
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Generated WHERE clause
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the WHERE clause"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy clause"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the builder" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
          <pre className="whitespace-pre font-mono text-sm leading-6 text-[var(--primary)]">
            {hasError ? DASH : result.clause}
          </pre>
        </div>

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Conditions</dt>
            <dd className="font-semibold">{hasError ? DASH : result.conditionCount}</dd>
          </div>
          <div className="flex items-start justify-between gap-4 py-2.5">
            <dt className="shrink-0 text-[var(--muted-foreground)]">Bind parameters</dt>
            <dd className="text-right font-mono text-xs font-semibold break-all">
              {hasError || result.params.length === 0
                ? DASH
                : result.params.map((param) => `${param.name} = ${param.value}`).join(", ")}
            </dd>
          </div>
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        AND binds tighter than OR in SQL, so multi-condition groups are parenthesised automatically
        when combined. Prefer bind parameters over inline literals in application code to avoid SQL
        injection.
      </p>
    </main>
  );
}
