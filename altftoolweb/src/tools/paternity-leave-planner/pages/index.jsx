"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Trash2, Users } from "lucide-react";
import { PATERNITY_POLICIES, getPolicy, planPaternityLeave } from "../lib";

const DATE_FMT = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeZone: "UTC",
});

const showDate = (iso) => (iso ? DATE_FMT.format(new Date(`${iso}T00:00:00Z`)) : "—");

const DEFAULT_POLICY_ID = "uk-statutory";
const DEFAULT_BIRTH = "2026-05-10";
const DEFAULT_BLOCKS = [
  { id: 1, start: "2026-05-11", days: "7" },
  { id: 2, start: "2026-08-03", days: "7" },
];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const policyFields = (preset) => ({
  totalDays: String(preset.totalDays),
  windowLength: String(preset.windowLength),
  windowUnit: preset.windowUnit,
  earliestBeforeBirthDays: String(preset.earliestBeforeBirthDays),
  minBlockDays: String(preset.minBlockDays),
  maxBlocks: String(preset.maxBlocks),
});

export default function ToolHome() {
  const [policyId, setPolicyId] = useState(DEFAULT_POLICY_ID);
  const [fields, setFields] = useState(() => policyFields(getPolicy(DEFAULT_POLICY_ID)));
  const [birthDate, setBirthDate] = useState(DEFAULT_BIRTH);
  const [blocks, setBlocks] = useState(DEFAULT_BLOCKS);
  const [copied, setCopied] = useState(false);

  const preset = getPolicy(policyId);

  const plan = useMemo(
    () =>
      planPaternityLeave({
        birthDate,
        policy: {
          totalDays: Number(fields.totalDays),
          windowLength: Number(fields.windowLength),
          windowUnit: fields.windowUnit,
          earliestBeforeBirthDays: Number(fields.earliestBeforeBirthDays),
          minBlockDays: Number(fields.minBlockDays),
          maxBlocks: Number(fields.maxBlocks),
        },
        blocks: blocks.map((block) => ({
          id: block.id,
          start: block.start,
          days: Number(block.days),
        })),
      }),
    [birthDate, fields, blocks],
  );

  const failed = Boolean(plan.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Paternity leave plan",
      `Policy: ${preset ? preset.label : "Custom"}`,
      `Birth / due date: ${showDate(plan.birthDate)}`,
      `Permitted window: ${showDate(plan.windowStart)} to ${showDate(plan.windowEnd)}`,
      `Allowance: ${plan.totalDays} days · planned ${plan.usedDays} · remaining ${plan.remainingDays}`,
      ...plan.orderedBlocks.map(
        (block, index) =>
          `Block ${index + 1}: ${showDate(block.start)} to ${showDate(block.end)} (${block.days} days)`,
      ),
      plan.compliant ? "Status: within policy" : "Status: needs changes",
    ].join("\n");
  }, [plan, preset, failed]);

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

  const applyPreset = (id) => {
    setPolicyId(id);
    const next = getPolicy(id);
    if (next) setFields(policyFields(next));
    setCopied(false);
  };

  const updateField = (key, value) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const updateBlock = (id, key, value) => {
    setBlocks((prev) =>
      prev.map((block) => (block.id === id ? { ...block, [key]: value } : block)),
    );
  };

  const addBlock = () => {
    setBlocks((prev) => {
      const nextId = prev.reduce((max, block) => Math.max(max, block.id), 0) + 1;
      const last = prev[prev.length - 1];
      return [...prev, { id: nextId, start: last ? last.start : birthDate, days: "7" }];
    });
  };

  const removeBlock = (id) => {
    setBlocks((prev) => prev.filter((block) => block.id !== id));
  };

  const reset = () => {
    setPolicyId(DEFAULT_POLICY_ID);
    setFields(policyFields(getPolicy(DEFAULT_POLICY_ID)));
    setBirthDate(DEFAULT_BIRTH);
    setBlocks(DEFAULT_BLOCKS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Users className="h-4 w-4" aria-hidden="true" />
          Employment leave
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Paternity Leave Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Lay out the blocks of paternity leave you want to take and check them against the day
          allowance, the minimum block length and the window that runs from the birth date.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pl-policy">
              Policy
            </label>
            <select
              id="pl-policy"
              className={`mt-2 ${INPUT_CLASS}`}
              value={policyId}
              onChange={(event) => applyPreset(event.target.value)}
            >
              {PATERNITY_POLICIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            {preset ? (
              <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">{preset.note}</p>
            ) : null}
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="pl-birth">
              Birth or expected delivery date
            </label>
            <input
              id="pl-birth"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={birthDate}
              onChange={(event) => setBirthDate(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="pl-total">
              Total allowance (days)
            </label>
            <input
              id="pl-total"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="365"
              step="1"
              value={fields.totalDays}
              onChange={(event) => updateField("totalDays", event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="pl-window">
              Window after birth
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="pl-window"
                className={INPUT_CLASS}
                type="number"
                inputMode="numeric"
                min="1"
                max="104"
                step="1"
                value={fields.windowLength}
                onChange={(event) => updateField("windowLength", event.target.value)}
              />
              <select
                aria-label="Window unit"
                className={INPUT_CLASS}
                value={fields.windowUnit}
                onChange={(event) => updateField("windowUnit", event.target.value)}
              >
                <option value="months">months</option>
                <option value="weeks">weeks</option>
              </select>
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="pl-before">
              Days allowed before the birth
            </label>
            <input
              id="pl-before"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="90"
              step="1"
              value={fields.earliestBeforeBirthDays}
              onChange={(event) => updateField("earliestBeforeBirthDays", event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="pl-min">
              Minimum block length (days)
            </label>
            <input
              id="pl-min"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="365"
              step="1"
              value={fields.minBlockDays}
              onChange={(event) => updateField("minBlockDays", event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="pl-blocks">
              Separate blocks allowed
            </label>
            <input
              id="pl-blocks"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="20"
              step="1"
              value={fields.maxBlocks}
              onChange={(event) => updateField("maxBlocks", event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Leave blocks</h2>
          <button type="button" onClick={addBlock} className={GHOST_BTN}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add block
          </button>
        </div>

        {blocks.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">
            No blocks planned yet — add one to check it against the policy.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {blocks.map((block, index) => {
              const result = failed
                ? null
                : plan.blocks.find((item) => item.id === block.id) ?? null;
              return (
                <li
                  key={block.id}
                  className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={LABEL_CLASS} htmlFor={`pl-start-${block.id}`}>
                        Block {index + 1} start
                      </label>
                      <input
                        id={`pl-start-${block.id}`}
                        className={`mt-2 ${INPUT_CLASS}`}
                        type="date"
                        value={block.start}
                        onChange={(event) => updateBlock(block.id, "start", event.target.value)}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLASS} htmlFor={`pl-days-${block.id}`}>
                        Block {index + 1} length (days)
                      </label>
                      <input
                        id={`pl-days-${block.id}`}
                        className={`mt-2 ${INPUT_CLASS}`}
                        type="number"
                        inputMode="numeric"
                        min="1"
                        max="365"
                        step="1"
                        value={block.days}
                        onChange={(event) => updateBlock(block.id, "days", event.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {result && result.end
                        ? `Ends ${showDate(result.end)}`
                        : "Ends —"}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeBlock(block.id)}
                      aria-label={`Remove block ${index + 1}`}
                      className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      Remove
                    </button>
                  </div>

                  {result && result.issues.length > 0 ? (
                    <ul className="mt-3 space-y-1">
                      {result.issues.map((issue) => (
                        <li
                          key={issue}
                          role="alert"
                          className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
                        >
                          {issue}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {failed ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Days still available
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? "—" : plan.remainingDays}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the policy inputs above."
                : `${plan.usedDays} of ${plan.totalDays} days planned`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy paternity leave plan"
              className={GHOST_BTN}
              disabled={failed}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the planner" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Earliest permitted start", failed ? "—" : showDate(plan.windowStart)],
            ["Window closes", failed ? "—" : showDate(plan.windowEnd)],
            ["Window length", failed ? "—" : `${plan.windowDays} days`],
            ["Total allowance", failed ? "—" : `${plan.totalDays} days`],
            ["Days planned", failed ? "—" : `${plan.usedDays} days`],
            ["Blocks planned", failed ? "—" : `${plan.blocks.length} of ${plan.maxBlocks} allowed`],
            ["Minimum block length", failed ? "—" : `${plan.minBlockDays} days`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && plan.planIssues.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {plan.planIssues.map((issue) => (
              <li
                key={issue}
                role="alert"
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                {issue}
              </li>
            ))}
          </ul>
        ) : null}

        {!failed && plan.compliant ? (
          <p className="mt-4 rounded-md bg-[var(--success-soft)] px-3 py-2 text-sm font-medium text-[var(--success)]">
            Every block sits inside the window and within the allowance.
          </p>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Paternity leave rules differ by country, employer and eligibility — and
        many policies count working days rather than calendar days. Confirm the numbers against your
        own policy document or HR team before booking leave.
      </p>
    </main>
  );
}
