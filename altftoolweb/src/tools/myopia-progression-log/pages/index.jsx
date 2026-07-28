"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Trash2, TrendingDown } from "lucide-react";

import { analyseProgression } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const NUM2 = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: "always",
});
const PLAIN2 = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const DEFAULT_ROWS = [
  { id: "r1", date: "2022-06-01", sphere: "-0.75", cylinder: "0" },
  { id: "r2", date: "2023-06-01", sphere: "-1.50", cylinder: "0" },
  { id: "r3", date: "2024-06-01", sphere: "-2.00", cylinder: "0" },
];

const toNumber = (raw) => {
  const trimmed = String(raw ?? "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [projectYears, setProjectYears] = useState("3");
  const [nextId, setNextId] = useState(4);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      analyseProgression({
        entries: rows.map((row) => ({
          date: row.date,
          sphere: toNumber(row.sphere),
          cylinder: toNumber(row.cylinder) || 0,
        })),
        projectYears: toNumber(projectYears),
      }),
    [rows, projectYears],
  );

  const hasError = Boolean(result.error);

  const updateRow = (id, key, value) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
    setCopied(false);
  };

  const addRow = () => {
    const id = `r${nextId}`;
    setNextId((current) => current + 1);
    setRows((current) => [...current, { id, date: "", sphere: "", cylinder: "0" }]);
    setCopied(false);
  };

  const removeRow = (id) => {
    setRows((current) => (current.length <= 1 ? current : current.filter((row) => row.id !== id)));
    setCopied(false);
  };

  const reset = () => {
    setRows(DEFAULT_ROWS);
    setProjectYears("3");
    setNextId(4);
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Myopia Progression Log",
      `Readings: ${result.readings.length} from ${result.firstDate} to ${result.lastDate}`,
      `Spherical equivalent: ${PLAIN2.format(result.firstSe)} D to ${PLAIN2.format(result.lastSe)} D`,
      `Total change: ${NUM2.format(result.totalChange)} D over ${result.totalYears} years`,
      `Progression rate: ${NUM2.format(result.overallRate)} D/year — ${result.band.label}`,
      `Current severity: ${result.currentSeverity.label}`,
      `Trend line slope: ${NUM2.format(result.slope)} D/year`,
      `Projection in ${result.projectYears} years (${result.projectedDateIso}): ${PLAIN2.format(result.projectedSe)} D`,
      `Axial-length equivalent: ${PLAIN2.format(result.axialEquivalentMm)} mm at ${result.dioptresPerMm} D/mm`,
    ].join("\n");
  }, [result, hasError]);

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

  const detail = hasError
    ? [
        ["Readings logged", DASH],
        ["Period covered", DASH],
        ["Spherical equivalent now", DASH],
        ["Total change", DASH],
        ["Severity band", DASH],
        ["Trend line slope", DASH],
        ["Projection", DASH],
        ["Axial-length equivalent", DASH],
      ]
    : [
        ["Readings logged", String(result.readings.length)],
        ["Period covered", `${result.firstDate} to ${result.lastDate} (${result.totalYears} yr)`],
        ["Spherical equivalent now", `${PLAIN2.format(result.lastSe)} D`],
        ["Total change", `${NUM2.format(result.totalChange)} D`],
        ["Severity band", result.currentSeverity.label],
        ["Trend line slope", `${NUM2.format(result.slope)} D/year`],
        [
          "Projection",
          `${PLAIN2.format(result.projectedSe)} D by ${result.projectedDateIso} (${result.projectedSeverity.label})`,
        ],
        [
          "Axial-length equivalent",
          `${PLAIN2.format(result.axialEquivalentMm)} mm total, ${PLAIN2.format(result.axialRateMmPerYear)} mm/yr`,
        ],
      ];

  // Chart geometry (presentation only — all figures come from the lib).
  const chart = useMemo(() => {
    if (hasError) return null;
    const width = 640;
    const height = 220;
    const pad = { top: 16, right: 16, bottom: 28, left: 44 };
    const values = result.readings.map((reading) => reading.se);
    const minSe = Math.min(...values, result.projectedSe);
    const maxSe = Math.max(...values, 0);
    const span = maxSe - minSe || 1;
    const startMs = Date.parse(`${result.firstDate}T00:00:00Z`);
    const endMs = Date.parse(`${result.lastDate}T00:00:00Z`);
    const timeSpan = endMs - startMs || 1;
    const points = result.readings.map((reading) => {
      const ms = Date.parse(`${reading.date}T00:00:00Z`);
      const x = pad.left + ((ms - startMs) / timeSpan) * (width - pad.left - pad.right);
      const y = pad.top + ((maxSe - reading.se) / span) * (height - pad.top - pad.bottom);
      return { x, y, reading };
    });
    return { width, height, pad, points, minSe, maxSe };
  }, [result, hasError]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <TrendingDown className="h-4 w-4" aria-hidden="true" />
          Eye care
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Myopia Progression Log</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter spectacle powers with the date they were prescribed. The log works out dioptres per
          year, fits a least-squares trend line, places the current power on the IMI severity bands
          and converts the change into an approximate axial-length equivalent.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-sm font-semibold">Prescription readings (one eye)</h2>
        <div className="mt-3 space-y-4">
          {rows.map((row, index) => (
            <div key={row.id} className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
              <div>
                <label className={LABEL_CLASS} htmlFor={`mpl-date-${row.id}`}>
                  Date {index + 1}
                </label>
                <input
                  id={`mpl-date-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="date"
                  value={row.date}
                  onChange={(event) => updateRow(row.id, "date", event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`mpl-sphere-${row.id}`}>
                  Sphere (D)
                </label>
                <input
                  id={`mpl-sphere-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  step="0.25"
                  value={row.sphere}
                  onChange={(event) => updateRow(row.id, "sphere", event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`mpl-cyl-${row.id}`}>
                  Cylinder (D)
                </label>
                <input
                  id={`mpl-cyl-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  step="0.25"
                  value={row.cylinder}
                  onChange={(event) => updateRow(row.id, "cylinder", event.target.value)}
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  aria-label={`Remove reading ${index + 1}`}
                  className="inline-flex h-11 min-w-11 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--muted-foreground)] transition hover:border-[var(--danger)] hover:text-[var(--danger)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <button type="button" onClick={addRow} className={GHOST_BTN}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add a reading
          </button>
          <div>
            <label className={LABEL_CLASS} htmlFor="mpl-project">
              Project ahead (years)
            </label>
            <input
              id="mpl-project"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="20"
              step="1"
              value={projectYears}
              onChange={(event) => setProjectYears(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Progression rate
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM2.format(result.overallRate)} D/yr`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Add two dated readings to see a rate." : result.band.label}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the myopia progression summary"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the log" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {detail.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.notes.length > 0 && (
          <ul className="mt-5 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.notes.map((note) => (
              <li key={note} className="flex gap-2">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {chart && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Power over time</h2>
          <div className="mt-3 overflow-x-auto">
            <svg
              viewBox={`0 0 ${chart.width} ${chart.height}`}
              className="h-auto w-full min-w-[320px]"
              role="img"
              aria-label={`Spherical equivalent moving from ${result.firstSe} to ${result.lastSe} dioptres between ${result.firstDate} and ${result.lastDate}`}
            >
              <line
                x1={chart.pad.left}
                y1={chart.height - chart.pad.bottom}
                x2={chart.width - chart.pad.right}
                y2={chart.height - chart.pad.bottom}
                stroke="var(--border)"
                strokeWidth="1"
              />
              <line
                x1={chart.pad.left}
                y1={chart.pad.top}
                x2={chart.pad.left}
                y2={chart.height - chart.pad.bottom}
                stroke="var(--border)"
                strokeWidth="1"
              />
              <polyline
                fill="none"
                stroke="var(--primary)"
                strokeWidth="2.5"
                strokeLinejoin="round"
                points={chart.points.map((point) => `${point.x},${point.y}`).join(" ")}
              />
              {chart.points.map((point) => (
                <circle key={point.reading.date} cx={point.x} cy={point.y} r="4" fill="var(--primary)" />
              ))}
              <text x={chart.pad.left - 6} y={chart.pad.top + 4} textAnchor="end" fontSize="11" fill="var(--muted-foreground)">
                {PLAIN2.format(chart.maxSe)}
              </text>
              <text
                x={chart.pad.left - 6}
                y={chart.height - chart.pad.bottom}
                textAnchor="end"
                fontSize="11"
                fill="var(--muted-foreground)"
              >
                {PLAIN2.format(chart.minSe)}
              </text>
              <text x={chart.pad.left} y={chart.height - 8} fontSize="11" fill="var(--muted-foreground)">
                {result.firstDate}
              </text>
              <text
                x={chart.width - chart.pad.right}
                y={chart.height - 8}
                textAnchor="end"
                fontSize="11"
                fill="var(--muted-foreground)"
              >
                {result.lastDate}
              </text>
            </svg>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[340px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Interval
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Change
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.intervals.map((interval) => (
                  <tr key={`${interval.from}-${interval.to}`} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">
                      <span className="block font-semibold">
                        {interval.from} → {interval.to}
                      </span>
                      <span className="text-[var(--muted-foreground)]">{interval.band.label}</span>
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums">{NUM2.format(interval.change)} D</td>
                    <td className="py-2 text-right tabular-nums">{NUM2.format(interval.ratePerYear)} D/yr</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational record-keeping only, not a diagnosis or a treatment decision. Spectacle power
        is not the same measurement as axial length, and the conversion here is an approximation.
        Bring the log to your optometrist or ophthalmologist — myopia management options exist and
        they depend on age, rate and biometry, not on this chart.
      </p>
    </main>
  );
}
