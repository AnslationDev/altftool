"use client";

import { useMemo, useState } from "react";
import { Check, Copy, LayoutDashboard, RotateCcw } from "lucide-react";

import {
  GRID_COLUMNS,
  METHODS,
  PANELS_PER_ROW_OPTIONS,
  REFRESH_OPTIONS,
  USE_RESOURCES,
  planDashboard,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  service: "checkout-api",
  methodId: "red",
  resources: ["cpu", "memory"],
  panelsPerRow: 3,
  includeSlo: true,
  sloTarget: "99.9",
  includeLogs: true,
  refreshSeconds: 60,
  panelHeight: "8",
};

export default function ToolHome() {
  const [service, setService] = useState(DEFAULTS.service);
  const [methodId, setMethodId] = useState(DEFAULTS.methodId);
  const [resources, setResources] = useState(DEFAULTS.resources);
  const [panelsPerRow, setPanelsPerRow] = useState(DEFAULTS.panelsPerRow);
  const [includeSlo, setIncludeSlo] = useState(DEFAULTS.includeSlo);
  const [sloTarget, setSloTarget] = useState(DEFAULTS.sloTarget);
  const [includeLogs, setIncludeLogs] = useState(DEFAULTS.includeLogs);
  const [refreshSeconds, setRefreshSeconds] = useState(DEFAULTS.refreshSeconds);
  const [panelHeight, setPanelHeight] = useState(DEFAULTS.panelHeight);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      planDashboard({
        service,
        methodId,
        resources,
        panelsPerRow,
        includeSlo,
        sloTarget: Number(sloTarget),
        includeLogs,
        refreshSeconds,
        panelHeight: Number(panelHeight),
      }),
    [service, methodId, resources, panelsPerRow, includeSlo, sloTarget, includeLogs, refreshSeconds, panelHeight],
  );

  const hasError = Boolean(plan.error);
  const dash = "—";

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [`Dashboard plan — ${service} (${plan.method.label})`, ""];
    let panelNumber = 0;
    for (const row of plan.rows) {
      if (row.showHeading) lines.push(`## ${row.section}`);
      for (const panel of row.panels) {
        panelNumber += 1;
        lines.push(`${panelNumber}. ${panel.title} [${panel.viz}, ${panel.width}/${GRID_COLUMNS} cols x ${panel.height} rows, ${panel.unit}]`);
        lines.push(`   ${panel.why}`);
        lines.push(`   ${panel.query.replace(/\n/g, " ")}`);
      }
    }
    lines.push("", `${plan.panelCount} panels in ${plan.rowCount} rows, about ${NUM.format(plan.queriesPerMinute)} queries per minute at a ${refreshSeconds}s refresh.`);
    return lines.join("\n");
  }, [hasError, plan, service, refreshSeconds]);

  const toggleResource = (id) => {
    setResources((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

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
    setService(DEFAULTS.service);
    setMethodId(DEFAULTS.methodId);
    setResources(DEFAULTS.resources);
    setPanelsPerRow(DEFAULTS.panelsPerRow);
    setIncludeSlo(DEFAULTS.includeSlo);
    setSloTarget(DEFAULTS.sloTarget);
    setIncludeLogs(DEFAULTS.includeLogs);
    setRefreshSeconds(DEFAULTS.refreshSeconds);
    setPanelHeight(DEFAULTS.panelHeight);
    setCopied(false);
  };

  const activeMethod = METHODS.find((item) => item.id === methodId);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
          Observability
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Dashboard Panel Layout Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Lay out a service dashboard with RED, USE or the Four Golden Signals: which panels to build,
          what order they go in, how wide they sit on the 24-column grid, and a starter query for each.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dp-service">
              Service name
            </label>
            <input
              id="dp-service"
              className={`mt-2 ${INPUT_CLASS}`}
              value={service}
              onChange={(event) => setService(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dp-method">
              Method
            </label>
            <select
              id="dp-method"
              className={`mt-2 ${INPUT_CLASS}`}
              value={methodId}
              onChange={(event) => setMethodId(event.target.value)}
            >
              {METHODS.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.label}
                </option>
              ))}
            </select>
            {activeMethod && (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {activeMethod.best} ({activeMethod.source})
              </p>
            )}
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dp-perrow">
              Panels per row
            </label>
            <select
              id="dp-perrow"
              className={`mt-2 ${INPUT_CLASS}`}
              value={panelsPerRow}
              onChange={(event) => setPanelsPerRow(Number(event.target.value))}
            >
              {PANELS_PER_ROW_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option} ({GRID_COLUMNS / option} of {GRID_COLUMNS} columns each)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dp-height">
              Panel height (grid units)
            </label>
            <input
              id="dp-height"
              type="number"
              inputMode="numeric"
              min="3"
              max="24"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={panelHeight}
              onChange={(event) => setPanelHeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dp-refresh">
              Refresh interval
            </label>
            <select
              id="dp-refresh"
              className={`mt-2 ${INPUT_CLASS}`}
              value={refreshSeconds}
              onChange={(event) => setRefreshSeconds(Number(event.target.value))}
            >
              {REFRESH_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option < 60 ? `${option} seconds` : `${option / 60} minute${option === 60 ? "" : "s"}`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dp-slo">
              SLO target (%)
            </label>
            <input
              id="dp-slo"
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.01"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sloTarget}
              onChange={(event) => setSloTarget(event.target.value)}
              disabled={!includeSlo}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">Resources to cover with USE panels</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {USE_RESOURCES.map((resource) => {
              const active = resources.includes(resource.id);
              return (
                <button
                  key={resource.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleResource(resource.id)}
                  className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                    active
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  {resource.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="flex min-h-11 items-center gap-3 text-sm font-semibold" htmlFor="dp-includeslo">
            <input
              id="dp-includeslo"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={includeSlo}
              onChange={(event) => setIncludeSlo(event.target.checked)}
            />
            Add the SLO / error-budget row
          </label>
          <label className="flex min-h-11 items-center gap-3 text-sm font-semibold" htmlFor="dp-includelogs">
            <input
              id="dp-includelogs"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={includeLogs}
              onChange={(event) => setIncludeLogs(event.target.checked)}
            />
            Add the logs / deploys drill-down row
          </label>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Panels on the dashboard
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : NUM.format(plan.panelCount)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see the layout." : `${plan.rowCount} rows, ${plan.panelWidth} of ${GRID_COLUMNS} columns per panel`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the dashboard panel plan"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Method", hasError ? dash : plan.method.label],
            ["Rows", hasError ? dash : NUM.format(plan.rowCount)],
            ["Panel size", hasError ? dash : `${plan.panelWidth} x ${plan.panelHeight} grid units`],
            ["Dashboard height", hasError ? dash : `${NUM.format(plan.gridHeightUnits)} units (~${NUM.format(plan.pixelHeight)} px)`],
            ["Queries per minute", hasError ? dash : NUM.format(plan.queriesPerMinute)],
            ["Refresh interval", `${refreshSeconds}s`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && plan.warning && (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {plan.warning}
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Panel order, top to bottom</h2>
          <div className="mt-4 space-y-5">
            {plan.rows.map((row, rowIndex) => (
              <div key={`${row.section}-${rowIndex}`}>
                {row.showHeading && (
                  <div className="mb-2">
                    <h3 className="text-sm font-semibold text-[var(--primary)]">{row.section}</h3>
                    {row.note && <p className="mt-1 text-xs text-[var(--muted-foreground)]">{row.note}</p>}
                  </div>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  {row.panels.map((panel) => (
                    <article
                      key={panel.title}
                      className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h4 className="text-sm font-semibold">{panel.title}</h4>
                        <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                          {panel.viz} · {panel.width}x{panel.height}
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{panel.why}</p>
                      <div className="mt-2 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--card)]">
                        <pre className="min-w-[240px] p-2 text-[11px] leading-5">
                          <code>{panel.query}</code>
                        </pre>
                      </div>
                      <p className="mt-1 text-[11px] text-[var(--muted-foreground)]">Unit: {panel.unit}</p>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Queries assume Prometheus with the common exporter metric names. Rename the metrics and labels
        to match your own instrumentation before you save the dashboard.
      </p>
    </main>
  );
}
