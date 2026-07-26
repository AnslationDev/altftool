"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Trash2, Calculator } from "lucide-react";

const makeDefaultTasks = () => [
  { id: "task-1", name: "Discovery and planning", hours: "8" },
  { id: "task-2", name: "Design", hours: "20" },
  { id: "task-3", name: "Build", hours: "48" },
  { id: "task-4", name: "Testing and revisions", hours: "12" },
];

const DEFAULTS = {
  rate: "1500",
  buffer: "20",
  weeklyCapacity: "25",
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const decimalFormatter = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const intFormatter = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

function todayIso() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function parseIsoDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || "").trim());
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

/** Adds whole working days (Mon-Fri) to a date, counting the start day as day one. */
function addWorkingDays(startDate, workingDays) {
  const date = new Date(startDate.getTime());
  let remaining = Math.max(1, Math.ceil(workingDays));

  // Move to the first working day on or after the start date.
  while (date.getDay() === 0 || date.getDay() === 6) {
    date.setDate(date.getDate() + 1);
  }
  remaining -= 1;

  while (remaining > 0) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 0 && date.getDay() !== 6) remaining -= 1;
  }
  return date;
}

function toNumber(value) {
  if (typeof value !== "string") return Number.NaN;
  if (value.trim() === "") return 0;
  return Number(value);
}

export default function ToolHome() {
  const [tasks, setTasks] = useState(makeDefaultTasks);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [buffer, setBuffer] = useState(DEFAULTS.buffer);
  const [weeklyCapacity, setWeeklyCapacity] = useState(DEFAULTS.weeklyCapacity);
  const [startDate, setStartDate] = useState(todayIso);
  const [copied, setCopied] = useState(false);

  const updateTask = (id, field, value) => {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, [field]: value } : task)),
    );
    setCopied(false);
  };

  const addTask = () => {
    setTasks((current) => [
      ...current,
      { id: `task-${Date.now()}-${current.length}`, name: `Task ${current.length + 1}`, hours: "4" },
    ]);
    setCopied(false);
  };

  const removeTask = (id) => {
    setTasks((current) => (current.length > 1 ? current.filter((task) => task.id !== id) : current));
    setCopied(false);
  };

  const result = useMemo(() => {
    const rateValue = toNumber(rate);
    const bufferValue = toNumber(buffer);
    const capacityValue = toNumber(weeklyCapacity);

    if (![rateValue, bufferValue, capacityValue].every(Number.isFinite)) {
      return { error: "Rate, buffer and weekly capacity must all be valid numbers." };
    }
    if (rateValue < 0 || bufferValue < 0 || capacityValue <= 0) {
      return {
        error: "Rate and buffer cannot be negative, and weekly capacity must be above zero hours.",
      };
    }

    const parsedTasks = tasks.map((task) => {
      const hours = toNumber(task.hours);
      return {
        ...task,
        hoursValue: Number.isFinite(hours) && hours >= 0 ? hours : null,
      };
    });

    if (parsedTasks.some((task) => task.hoursValue === null)) {
      return { error: "Every task needs a valid number of hours (zero or more)." };
    }

    const baseHours = parsedTasks.reduce((sum, task) => sum + task.hoursValue, 0);
    if (baseHours <= 0) {
      return { error: "Add at least one task with more than zero hours to see an estimate." };
    }

    const bufferHours = baseHours * (bufferValue / 100);
    const totalHours = baseHours + bufferHours;
    const baseCost = baseHours * rateValue;
    const bufferCost = bufferHours * rateValue;
    const totalCost = baseCost + bufferCost;

    const weeks = totalHours / capacityValue;
    const workingDays = weeks * 5;
    const start = parseIsoDate(startDate);
    const deliveryDate = start ? addWorkingDays(start, workingDays) : null;

    const rows = parsedTasks.map((task) => ({
      id: task.id,
      name: task.name.trim() === "" ? "Untitled task" : task.name,
      hours: task.hoursValue,
      cost: task.hoursValue * rateValue,
      share: (task.hoursValue / baseHours) * 100,
    }));

    return {
      error: null,
      rows,
      baseHours,
      bufferHours,
      totalHours,
      baseCost,
      bufferCost,
      totalCost,
      weeks,
      workingDays,
      deliveryDate,
      capacityValue,
      rateValue,
      bufferValue,
    };
  }, [tasks, rate, buffer, weeklyCapacity, startDate]);

  const report = useMemo(() => {
    if (result.error) return "";
    return [
      "Project Estimate",
      ...result.rows.map(
        (row) =>
          `${row.name}: ${decimalFormatter.format(row.hours)} h = ${currencyFormatter.format(row.cost)}`,
      ),
      "",
      `Base hours: ${decimalFormatter.format(result.baseHours)}`,
      `Buffer (${decimalFormatter.format(result.bufferValue)}%): ${decimalFormatter.format(result.bufferHours)} h`,
      `Total hours: ${decimalFormatter.format(result.totalHours)}`,
      `Hourly rate: ${currencyFormatter.format(result.rateValue)}`,
      `Total cost: ${currencyFormatter.format(result.totalCost)}`,
      `Timeline: ${decimalFormatter.format(result.weeks)} weeks at ${decimalFormatter.format(result.capacityValue)} h/week`,
      result.deliveryDate
        ? `Estimated delivery: ${result.deliveryDate.toLocaleDateString()}`
        : null,
    ]
      .filter(Boolean)
      .join("\n");
  }, [result]);

  const handleCopy = async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const handleReset = () => {
    setTasks(makeDefaultTasks());
    setRate(DEFAULTS.rate);
    setBuffer(DEFAULTS.buffer);
    setWeeklyCapacity(DEFAULTS.weeklyCapacity);
    setStartDate(todayIso());
    setCopied(false);
  };

  const inputClass =
    "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
  const labelClass = "block text-sm font-semibold text-[var(--foreground)]";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header>
        <p className="inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Calculator className="h-4 w-4" aria-hidden="true" />
          Project pricing
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
          Project Estimate Calculator
        </h1>
        <p className="mt-2 text-base leading-7 text-[var(--muted-foreground)]">
          Break the work into tasks, set an hourly rate and a contingency buffer, and get the total
          cost plus a delivery date based on the hours you can put in each week.
        </p>
      </header>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <p className="text-sm font-semibold">Tasks</p>
        <div className="mt-3 space-y-3">
          {tasks.map((task, index) => (
            <div key={task.id} className="grid gap-3 sm:grid-cols-[1fr_120px_auto] sm:items-end">
              <div>
                <label className={labelClass} htmlFor={`pe-name-${task.id}`}>
                  Task {index + 1}
                </label>
                <input
                  id={`pe-name-${task.id}`}
                  type="text"
                  value={task.name}
                  onChange={(event) => updateTask(task.id, "name", event.target.value)}
                  className={`mt-2 ${inputClass}`}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor={`pe-hours-${task.id}`}>
                  Hours
                </label>
                <input
                  id={`pe-hours-${task.id}`}
                  type="number"
                  min="0"
                  step="1"
                  inputMode="decimal"
                  value={task.hours}
                  onChange={(event) => updateTask(task.id, "hours", event.target.value)}
                  className={`mt-2 ${inputClass}`}
                />
              </div>
              <button
                type="button"
                onClick={() => removeTask(task.id)}
                disabled={tasks.length <= 1}
                aria-label={`Remove task ${index + 1}`}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:text-[var(--danger)] disabled:opacity-50 active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                <span className="sm:hidden">Remove task</span>
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addTask}
          className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add task
        </button>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <p className="text-sm font-semibold">Rate, buffer and capacity</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="pe-rate">
              Hourly rate (INR)
            </label>
            <input
              id="pe-rate"
              type="number"
              min="0"
              step="100"
              inputMode="decimal"
              value={rate}
              onChange={(event) => {
                setRate(event.target.value);
                setCopied(false);
              }}
              className={`mt-2 ${inputClass}`}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="pe-buffer">
              Contingency buffer (%)
            </label>
            <input
              id="pe-buffer"
              type="number"
              min="0"
              step="5"
              inputMode="decimal"
              value={buffer}
              onChange={(event) => {
                setBuffer(event.target.value);
                setCopied(false);
              }}
              className={`mt-2 ${inputClass}`}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="pe-capacity">
              Hours available per week
            </label>
            <input
              id="pe-capacity"
              type="number"
              min="1"
              step="1"
              inputMode="decimal"
              value={weeklyCapacity}
              onChange={(event) => {
                setWeeklyCapacity(event.target.value);
                setCopied(false);
              }}
              className={`mt-2 ${inputClass}`}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="pe-start">
              Start date
            </label>
            <input
              id="pe-start"
              type="date"
              value={startDate}
              onChange={(event) => {
                setStartDate(event.target.value);
                setCopied(false);
              }}
              className={`mt-2 ${inputClass}`}
            />
          </div>
        </div>
      </section>

      {result.error ? (
        <div
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </div>
      ) : (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Quote this project at
              </p>
              <p className="mt-1 text-4xl font-semibold text-[var(--primary)] sm:text-5xl">
                {currencyFormatter.format(result.totalCost)}
              </p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {decimalFormatter.format(result.totalHours)} hours including buffer,{" "}
                {decimalFormatter.format(result.weeks)} weeks of work
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Copy project estimate"
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {copied ? "Copied!" : "Copy result"}
              </button>
              <button
                type="button"
                onClick={handleReset}
                aria-label="Reset the estimate"
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--muted-foreground)] transition hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
            </div>
          </div>

          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              ["Estimated hours", `${decimalFormatter.format(result.baseHours)} h`],
              [
                `Buffer (${decimalFormatter.format(result.bufferValue)}%)`,
                `${decimalFormatter.format(result.bufferHours)} h`,
              ],
              ["Cost before buffer", currencyFormatter.format(result.baseCost)],
              ["Buffer value", currencyFormatter.format(result.bufferCost)],
              ["Working days needed", `${intFormatter.format(Math.ceil(result.workingDays))} days`],
              [
                "Estimated delivery",
                result.deliveryDate ? result.deliveryDate.toLocaleDateString() : "Set a start date",
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
              >
                <dt className="text-sm text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-sm font-semibold">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <caption className="sr-only">Cost breakdown by task</caption>
              <thead>
                <tr className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2">Task</th>
                  <th scope="col" className="py-2 text-right">Hours</th>
                  <th scope="col" className="py-2 text-right">Share</th>
                  <th scope="col" className="py-2 text-right">Cost</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.id} className="border-t border-[var(--border)]">
                    <td className="py-2 pr-3">{row.name}</td>
                    <td className="py-2 text-right">{decimalFormatter.format(row.hours)}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {decimalFormatter.format(row.share)}%
                    </td>
                    <td className="py-2 text-right font-semibold">
                      {currencyFormatter.format(row.cost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs text-[var(--muted-foreground)]">
            The delivery date counts weekdays only and assumes you work{" "}
            {decimalFormatter.format(result.capacityValue)} hours a week on this project. Public holidays
            and client review time are not included.
          </p>
        </section>
      )}
    </main>
  );
}
