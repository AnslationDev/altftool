"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileText, Plus, RotateCcw, Trash2 } from "lucide-react";

import { ADR_FORMATS, ADR_STATUSES, generateAdr } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_OPTIONS = [
  {
    id: "o1",
    name: "PostgreSQL 16 on RDS",
    pros: "cross-table transactions, the team already runs it",
    cons: "one more managed service to patch",
  },
  {
    id: "o2",
    name: "DynamoDB",
    pros: "no servers to operate, predictable latency",
    cons: "our billing writes span three entities in one transaction",
  },
];

const DEFAULTS = {
  number: "12",
  title: "Use PostgreSQL for the billing store",
  status: "accepted",
  date: "2026-07-20",
  format: "nygard",
  deciders: "Platform guild, Billing team",
  context:
    "Billing has to write an invoice, a ledger entry and a payment attempt in one atomic unit. Our current key-value store cannot do that, so reconciliation jobs are patching state every night.",
  drivers: "Atomic multi-entity writes\nTeam already operates Postgres\nNo new on-call surface",
  decision: "We will store billing records in PostgreSQL 16 on RDS with a single writer instance.",
  rationale:
    "Transactions remove the nightly reconciliation job entirely, which is the largest source of billing incidents this year.",
  positive: "Cross-table transactions come for free\nExisting backup and PITR tooling applies",
  negative: "A managed database to patch and size\nSchema migrations now need review",
  supersedes: "",
  links: "Supersedes 0004-use-a-key-value-store-everywhere.md",
};

const toLines = (value) => value.split("\n").map((line) => line.trim()).filter(Boolean);

export default function ToolHome() {
  const [number, setNumber] = useState(DEFAULTS.number);
  const [title, setTitle] = useState(DEFAULTS.title);
  const [status, setStatus] = useState(DEFAULTS.status);
  const [date, setDate] = useState(DEFAULTS.date);
  const [format, setFormat] = useState(DEFAULTS.format);
  const [deciders, setDeciders] = useState(DEFAULTS.deciders);
  const [context, setContext] = useState(DEFAULTS.context);
  const [drivers, setDrivers] = useState(DEFAULTS.drivers);
  const [decision, setDecision] = useState(DEFAULTS.decision);
  const [rationale, setRationale] = useState(DEFAULTS.rationale);
  const [positive, setPositive] = useState(DEFAULTS.positive);
  const [negative, setNegative] = useState(DEFAULTS.negative);
  const [supersedes, setSupersedes] = useState(DEFAULTS.supersedes);
  const [links, setLinks] = useState(DEFAULTS.links);
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [chosen, setChosen] = useState(0);
  const [nextId, setNextId] = useState(3);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      generateAdr({
        number: Number(number),
        title,
        status,
        date,
        format,
        deciders: deciders.split(",").map((item) => item.trim()),
        context,
        drivers: toLines(drivers),
        options,
        chosenOptionIndex: chosen,
        decision,
        rationale,
        positive: toLines(positive),
        negative: toLines(negative),
        supersedes,
        links: toLines(links),
      }),
    [
      number,
      title,
      status,
      date,
      format,
      deciders,
      context,
      drivers,
      options,
      chosen,
      decision,
      rationale,
      positive,
      negative,
      supersedes,
      links,
    ],
  );

  const updateOption = (id, patch) =>
    setOptions((list) => list.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  const addOption = () => {
    const id = `o${nextId}`;
    setNextId((value) => value + 1);
    setOptions((list) => [...list, { id, name: "", pros: "", cons: "" }]);
  };

  const removeOption = (id) => {
    const next = options.filter((item) => item.id !== id);
    setOptions(next);
    setChosen((current) => Math.min(current, Math.max(0, next.length - 1)));
  };

  const copyResult = async () => {
    if (!result.markdown) return;
    try {
      await navigator.clipboard.writeText(result.markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setNumber(DEFAULTS.number);
    setTitle(DEFAULTS.title);
    setStatus(DEFAULTS.status);
    setDate(DEFAULTS.date);
    setFormat(DEFAULTS.format);
    setDeciders(DEFAULTS.deciders);
    setContext(DEFAULTS.context);
    setDrivers(DEFAULTS.drivers);
    setDecision(DEFAULTS.decision);
    setRationale(DEFAULTS.rationale);
    setPositive(DEFAULTS.positive);
    setNegative(DEFAULTS.negative);
    setSupersedes(DEFAULTS.supersedes);
    setLinks(DEFAULTS.links);
    setOptions(DEFAULT_OPTIONS);
    setChosen(0);
    setNextId(3);
    setCopied(false);
  };

  const dash = "—";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileText className="h-4 w-4" aria-hidden="true" />
          Architecture decisions
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">ADR Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Capture one architectural decision — its context, the options you weighed, what you chose
          and what it costs you — as a numbered markdown record in the Nygard or MADR 4.0 format.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="adr-number">
              ADR number
            </label>
            <input
              id="adr-number"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="9999"
              step="1"
              value={number}
              onChange={(event) => setNumber(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="adr-date">
              Decision date
            </label>
            <input
              id="adr-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="adr-title">
              Title (a noun phrase, not a question)
            </label>
            <input
              id="adr-title"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="adr-status">
              Status
            </label>
            <select
              id="adr-status"
              className={`mt-2 ${INPUT_CLASS}`}
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              {ADR_STATUSES.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="adr-format">
              Record format
            </label>
            <select
              id="adr-format"
              className={`mt-2 ${INPUT_CLASS}`}
              value={format}
              onChange={(event) => setFormat(event.target.value)}
            >
              {ADR_FORMATS.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          {status === "superseded" && (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="adr-supersedes">
                Superseded by (file name or number)
              </label>
              <input
                id="adr-supersedes"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                value={supersedes}
                onChange={(event) => setSupersedes(event.target.value)}
              />
            </div>
          )}
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="adr-deciders">
              Deciders (comma separated)
            </label>
            <input
              id="adr-deciders"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={deciders}
              onChange={(event) => setDeciders(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="adr-context">
              Context — the forces that make this a decision
            </label>
            <textarea
              id="adr-context"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              rows={4}
              value={context}
              onChange={(event) => setContext(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="adr-drivers">
              Decision drivers (one per line)
            </label>
            <textarea
              id="adr-drivers"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              rows={3}
              value={drivers}
              onChange={(event) => setDrivers(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="adr-decision">
              Decision — one sentence, active voice
            </label>
            <textarea
              id="adr-decision"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              rows={2}
              value={decision}
              onChange={(event) => setDecision(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="adr-rationale">
              Rationale (optional)
            </label>
            <textarea
              id="adr-rationale"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              rows={2}
              value={rationale}
              onChange={(event) => setRationale(event.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="adr-positive">
                Positive consequences (one per line)
              </label>
              <textarea
                id="adr-positive"
                className={`mt-2 ${TEXTAREA_CLASS}`}
                rows={3}
                value={positive}
                onChange={(event) => setPositive(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="adr-negative">
                Negative consequences (one per line)
              </label>
              <textarea
                id="adr-negative"
                className={`mt-2 ${TEXTAREA_CLASS}`}
                rows={3}
                value={negative}
                onChange={(event) => setNegative(event.target.value)}
              />
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="adr-links">
              Links (one per line)
            </label>
            <textarea
              id="adr-links"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              rows={2}
              value={links}
              onChange={(event) => setLinks(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Options considered</h2>
          <button type="button" onClick={addOption} className={GHOST_BTN} aria-label="Add an option">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add option
          </button>
        </div>

        <div className="mt-4 grid gap-4">
          {options.map((option, index) => (
            <div
              key={option.id}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
            >
              <div className="grid gap-3">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`adr-opt-${option.id}`}>
                    Option {index + 1}
                  </label>
                  <input
                    id={`adr-opt-${option.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="text"
                    value={option.name}
                    onChange={(event) => updateOption(option.id, { name: event.target.value })}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`adr-pro-${option.id}`}>
                      Good, because…
                    </label>
                    <input
                      id={`adr-pro-${option.id}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      type="text"
                      value={option.pros}
                      onChange={(event) => updateOption(option.id, { pros: event.target.value })}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`adr-con-${option.id}`}>
                      Bad, because…
                    </label>
                    <input
                      id={`adr-con-${option.id}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      type="text"
                      value={option.cons}
                      onChange={(event) => updateOption(option.id, { cons: event.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <label
                  className="flex min-h-11 items-center gap-3 text-sm"
                  htmlFor={`adr-chosen-${option.id}`}
                >
                  <input
                    id={`adr-chosen-${option.id}`}
                    type="radio"
                    name="adr-chosen"
                    className="h-5 w-5 accent-[var(--primary)]"
                    checked={chosen === index}
                    onChange={() => setChosen(index)}
                  />
                  This is the option we chose
                </label>
                <button
                  type="button"
                  onClick={() => removeOption(option.id)}
                  aria-label={`Remove option ${index + 1}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              File name
            </p>
            <p className="mt-1 break-all font-mono text-2xl font-semibold text-[var(--primary)] sm:text-3xl">
              {result.error ? dash : result.fileName}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {result.error ? dash : `${result.status} · ${result.wordCount} words`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the generated ADR markdown"
              className={GHOST_BTN}
              disabled={Boolean(result.error)}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy ADR"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the ADR form" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Record id", result.error ? dash : result.id],
            ["Format", result.error ? dash : result.format === "madr" ? "MADR 4.0" : "Nygard"],
            ["Options documented", result.error ? dash : String(result.optionCount)],
            ["Word count", result.error ? dash : String(result.wordCount)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!result.error && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Generated record</h2>
          <div className="mt-3 overflow-x-auto rounded-md bg-[var(--muted)] p-3">
            <pre className="min-w-0 font-mono text-xs leading-5 text-[var(--foreground)]">
              {result.markdown}
            </pre>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Keep ADRs immutable. When a decision changes, write a new record and mark the old one
        superseded — the value of the log is that it shows what you believed at the time, not a
        tidied-up final answer.
      </p>
    </main>
  );
}
