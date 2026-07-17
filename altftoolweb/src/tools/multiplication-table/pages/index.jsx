"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  Calculator,
  CheckCircle2,
  Clipboard,
  Download,
  Grid,
  Hash,
  Layers,
  Minus,
  Plus,
  RefreshCcw,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import SafeResponsiveContainer from "@/components/charts/SafeResponsiveContainer";

const PRESETS = [
  { label: "1–10", start: 1, end: 10 },
  { label: "1–12", start: 1, end: 12 },
  { label: "1–15", start: 1, end: 15 },
  { label: "1–20", start: 1, end: 20 },
  { label: "1–25", start: 1, end: 25 },
  { label: "1–50", start: 1, end: 50 },
  { label: "10–20", start: 10, end: 20 },
  { label: "20–30", start: 20, end: 30 },
];

const QUICK_NUMBERS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 20, 25, 50, 100];

function formatNumber(value, compact = false) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
    notation: compact ? "compact" : "standard",
  }).format(value);
}

function clampRange(value, min = 1, max = 100) {
  const num = Number(value);
  if (!Number.isFinite(num)) return min;
  return Math.min(Math.max(num, min), max);
}

function isSquare(n) {
  if (n <= 0) return false;
  const root = Math.round(Math.sqrt(n));
  return root * root === n;
}

function isPrime(n) {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false;
  }
  return true;
}

function buildSingleTable(number, start, end) {
  const rows = [];
  for (let i = start; i <= end; i++) {
    const product = number * i;
    rows.push({ multiplier: i, product, isSquare: isSquare(product), isPrime: isPrime(i) });
  }
  return rows;
}

function buildGridTable(start, end) {
  const grid = [];
  for (let r = start; r <= end; r++) {
    const row = [];
    for (let c = start; c <= end; c++) {
      row.push(r * c);
    }
    grid.push({ header: r, cells: row });
  }
  return grid;
}

function buildChartData(number, start, end) {
  const data = [];
  for (let i = start; i <= end; i++) {
    data.push({ label: `×${i}`, value: number * i, isSquare: isSquare(number * i) });
  }
  return data;
}

function buildMultiCompareData(numbers, start, end) {
  const data = [];
  for (let i = start; i <= end; i++) {
    const point = { label: `×${i}` };
    numbers.forEach((n) => {
      point[`n${n}`] = n * i;
    });
    data.push(point);
  }
  return data;
}

function buildSummary(number, start, end, rows) {
  const sum = rows.reduce((s, r) => s + r.product, 0);
  const avg = rows.length > 0 ? sum / rows.length : 0;
  const max = rows.length > 0 ? Math.max(...rows.map((r) => r.product)) : 0;
  const min = rows.length > 0 ? Math.min(...rows.map((r) => r.product)) : 0;
  const squares = rows.filter((r) => r.isSquare).length;
  return [
    `Multiplication Table Summary`,
    `Table of: ${number}`,
    `Range: ${start} to ${end}`,
    `Total rows: ${end - start + 1}`,
    `Sum of all products: ${formatNumber(sum)}`,
    `Average product: ${formatNumber(Math.round(avg))}`,
    `Maximum product: ${formatNumber(max)}`,
    `Minimum product: ${formatNumber(min)}`,
    `Perfect squares in results: ${squares}`,
    `Formula: ${number} × n where n ∈ [${start}, ${end}]`,
  ].join("\n");
}

function exportCsv(number, start, end, rows) {
  const lines = [["Multiplier", "Product", "Is Perfect Square"]];
  rows.forEach((r) => lines.push([r.multiplier, r.product, r.isSquare ? "Yes" : "No"]));
  const csv = lines.map((row) => row.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `multiplication-table-${number}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function Field({ label, icon: Icon, children }) {
  return (
    <label className="block min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
      <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
        {Icon && <Icon className="h-4 w-4 shrink-0 text-[var(--primary)]" />}
        <span className="min-w-0 break-words">{label}</span>
      </span>
      {children}
    </label>
  );
}

function MetricCard({ icon: Icon, label, value, detail, tone = "default" }) {
  const toneClass =
    tone === "good"
      ? "bg-emerald-500/10 text-emerald-600"
      : tone === "warn"
        ? "bg-rose-500/10 text-rose-600"
        : tone === "watch"
          ? "bg-amber-500/10 text-amber-600"
          : "bg-[var(--section-highlight)] text-[var(--primary)]";

  return (
    <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
      <div className="flex min-w-0 items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="break-words text-xs font-semibold uppercase text-[var(--muted-foreground)]">{label}</p>
          <p className="mt-1 text-xl font-extrabold text-[var(--foreground)]">{value}</p>
          {detail && <p className="mt-1 break-words text-sm leading-5 text-[var(--muted-foreground)]">{detail}</p>}
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children, action }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
        <h3 className="flex items-center gap-2 text-base font-bold text-[var(--foreground)]">
          {Icon && <Icon className="h-5 w-5 shrink-0 text-[var(--primary)]" />}
          {title}
        </h3>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function TableTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-sm shadow-lg">
      <p className="font-semibold text-[var(--foreground)]">{item.label}</p>
      <p className="text-[var(--primary)]">{formatNumber(item.value)}</p>
    </div>
  );
}

function CompareTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-sm shadow-lg">
      <p className="mb-1 font-bold text-[var(--foreground)]">{item.label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-[var(--foreground)]">
          <span className="font-semibold" style={{ color: p.color }}>{p.name}: </span>
          {formatNumber(p.value)}
        </p>
      ))}
    </div>
  );
}

const COMPARE_COLORS = ["#2563eb", "#059669", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function MultiplicationTable() {
  const [number, setNumber] = useState(7);
  const [start, setStart] = useState(1);
  const [end, setEnd] = useState(10);
  const [view, setView] = useState("single");
  const [compareNumbers, setCompareNumbers] = useState([5, 7, 12]);
  const [gridSize, setGridSize] = useState(10);
  const [highlightMultiples, setHighlightMultiples] = useState(0);
  const [copied, setCopied] = useState(false);

  const rows = useMemo(() => buildSingleTable(number, start, end), [number, start, end]);
  const chartData = useMemo(() => buildChartData(number, start, end), [number, start, end]);
  const gridData = useMemo(() => buildGridTable(1, gridSize), [gridSize]);
  const compareData = useMemo(() => buildMultiCompareData(compareNumbers, start, end), [compareNumbers, start, end]);

  const sum = useMemo(() => rows.reduce((s, r) => s + r.product, 0), [rows]);
  const avg = useMemo(() => (rows.length > 0 ? Math.round(sum / rows.length) : 0), [sum, rows]);
  const squares = useMemo(() => rows.filter((r) => r.isSquare).length, [rows]);
  const maxProduct = useMemo(() => (rows.length > 0 ? Math.max(...rows.map((r) => r.product)) : 0), [rows]);

  const handleCopyTable = () => {
    const text = rows.map((r) => `${number} × ${r.multiplier} = ${r.product}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddCompare = () => {
    if (compareNumbers.length >= 6) return;
    const next = compareNumbers.length > 0 ? Math.max(...compareNumbers) + 1 : 2;
    setCompareNumbers((prev) => [...prev, next]);
  };

  const handleRemoveCompare = (idx) => {
    setCompareNumbers((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateCompare = (idx, value) => {
    setCompareNumbers((prev) => prev.map((n, i) => (i === idx ? clampRange(value, 1, 100) : n)));
  };

  const handleReset = () => {
    setNumber(7);
    setStart(1);
    setEnd(10);
    setView("single");
    setCompareNumbers([5, 7, 12]);
    setGridSize(10);
    setHighlightMultiples(0);
  };

  return (
    <div className="bg-[var(--background)] text-[var(--foreground)] transition-colors py-6 px-4">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
            <Grid className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Multiplication Table
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-[var(--muted-foreground)]">
            Generate, customise, and visualise multiplication tables. See patterns, compare tables side-by-side, and export your results.
          </p>
        </header>

        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard
            icon={Hash}
            label="Table Of"
            value={formatNumber(number)}
            detail={`${start} × ${number} to ${end} × ${number}`}
          />
          <MetricCard
            icon={TrendingUp}
            label="Sum of Products"
            value={formatNumber(sum)}
            detail={`Avg: ${formatNumber(avg)} per row`}
          />
          <MetricCard
            icon={Sparkles}
            label="Perfect Squares"
            value={squares.toString()}
            detail={`Out of ${end - start + 1} results`}
            tone={squares > 0 ? "good" : "default"}
          />
          <MetricCard
            icon={BarChart3}
            label="Max Product"
            value={formatNumber(maxProduct)}
            detail={`${number} × ${end}`}
          />
        </div>

        {/* Controls */}
        <SectionCard title="Setup" icon={Calculator} action={
          <button onClick={handleReset} className="flex items-center gap-1.5 rounded-lg bg-[var(--primary)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors">
            <RefreshCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        }>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Number" icon={Hash}>
              <input
                type="number"
                min="1"
                max="1000"
                value={number}
                onChange={(e) => setNumber(clampRange(e.target.value, 1, 1000))}
                className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none transition focus:border-[var(--primary)]"
              />
            </Field>
            <Field label="Start" icon={Minus}>
              <input
                type="number"
                min="1"
                max="100"
                value={start}
                onChange={(e) => setStart(clampRange(e.target.value, 1, 100))}
                className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none transition focus:border-[var(--primary)]"
              />
            </Field>
            <Field label="End" icon={Plus}>
              <input
                type="number"
                min="1"
                max="100"
                value={end}
                onChange={(e) => setEnd(clampRange(e.target.value, 1, 100))}
                className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none transition focus:border-[var(--primary)]"
              />
            </Field>
            <Field label="Highlight Multiples Of" icon={Sparkles}>
              <input
                type="number"
                min="0"
                max="100"
                value={highlightMultiples}
                onChange={(e) => setHighlightMultiples(clampRange(e.target.value, 0, 100))}
                className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none transition focus:border-[var(--primary)]"
              />
            </Field>
          </div>

          {/* Range Presets */}
          <div className="mt-4 flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => { setStart(p.start); setEnd(p.end); }}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  start === p.start && end === p.end
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--section-highlight)] text-[var(--foreground)] hover:bg-[var(--primary)]/10"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Quick Numbers */}
          <div className="mt-3">
            <p className="mb-2 text-xs font-semibold uppercase text-[var(--muted-foreground)]">Quick Select Number</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_NUMBERS.map((n) => (
                <button
                  key={n}
                  onClick={() => setNumber(n)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                    number === n
                      ? "bg-[var(--primary)] text-white shadow-md"
                      : "bg-[var(--section-highlight)] text-[var(--foreground)] hover:bg-[var(--primary)]/10"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* View Tabs */}
        <div className="mt-6 flex gap-2">
          {[
            { id: "single", label: "Single Table", icon: Hash },
            { id: "grid", label: "Grid View", icon: Layers },
            { id: "compare", label: "Compare", icon: BarChart3 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                view === tab.id
                  ? "bg-[var(--primary)] text-white shadow-md"
                  : "bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--section-highlight)] border border-[var(--border)]"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Single Table View */}
        {view === "single" && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.6fr)]">
            <SectionCard
              title={`${number} × Table (${start}–${end})`}
              icon={Hash}
              action={
                <button onClick={handleCopyTable} className="flex items-center gap-1.5 rounded-lg bg-[var(--primary)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors">
                  <Clipboard className="h-3.5 w-3.5" />
                  {copied ? "Copied!" : "Copy"}
                </button>
              }
            >
              <div className="space-y-2">
                {rows.map((row) => {
                  const isHighlighted = highlightMultiples > 0 && row.product % highlightMultiples === 0 && highlightMultiples > 0;
                  return (
                    <div
                      key={row.multiplier}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
                        row.isSquare
                          ? "border-emerald-500/30 bg-emerald-500/5"
                          : isHighlighted
                            ? "border-amber-500/30 bg-amber-500/5"
                            : "border-[var(--border)] bg-[var(--background)]"
                      }`}
                    >
                      <span className="w-12 text-right text-sm font-bold text-[var(--muted-foreground)]">
                        {row.multiplier}
                      </span>
                      <span className="text-sm text-[var(--muted-foreground)]">×</span>
                      <span className="w-12 text-sm font-bold text-[var(--foreground)]">{number}</span>
                      <span className="text-sm text-[var(--muted-foreground)]">=</span>
                      <span className={`text-base font-extrabold ${row.isSquare ? "text-emerald-600" : "text-[var(--foreground)]"}`}>
                        {formatNumber(row.product)}
                      </span>
                      {row.isSquare && (
                        <span className="ml-auto rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                          SQ
                        </span>
                      )}
                      {isHighlighted && !row.isSquare && (
                        <span className="ml-auto rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                          ×{highlightMultiples}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </SectionCard>

            <div className="space-y-6">
              <SectionCard title="Chart" icon={BarChart3} action={
                <button onClick={() => exportCsv(number, start, end, rows)} className="flex items-center gap-1.5 rounded-lg bg-[var(--primary)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors">
                  <Download className="h-3.5 w-3.5" />
                  CSV
                </button>
              }>
                <div className="h-72">
                  <SafeResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ left: 5, right: 5, top: 5, bottom: 5 }}>
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} interval={Math.max(0, Math.floor(chartData.length / 15) - 1)} />
                      <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickFormatter={(v) => formatNumber(v, true)} />
                      <Tooltip content={<TableTooltip />} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {chartData.map((d, i) => (
                          <Cell key={i} fill={d.isSquare ? "#059669" : "#2563eb"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </SafeResponsiveContainer>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-[var(--muted-foreground)]">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-600" /> Regular</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-600" /> Perfect Square</span>
                </div>
              </SectionCard>

              <SectionCard title="Pattern Insights" icon={Sparkles}>
                <div className="space-y-2">
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-3">
                    <p className="text-sm font-bold text-[var(--foreground)]">Digit Pattern</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      The table of {number} ends in: {Array.from({ length: Math.min(10, end - start + 1) }, (_, i) => ((number * (start + i)) % 10)).join(", ")}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-3">
                    <p className="text-sm font-bold text-[var(--foreground)]">Sum Check</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Sum of digits 1 to {end}: {((end * (end + 1)) / 2)}. Multiplied by {number}: {((end * (end + 1)) / 2) * number}. Our sum: {formatNumber(sum)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-3">
                    <p className="text-sm font-bold text-[var(--foreground]}">Range</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Products span from {formatNumber(number * start)} to {formatNumber(number * end)} — a range of {formatNumber(number * (end - start))}
                    </p>
                  </div>
                </div>
              </SectionCard>
            </div>
          </div>
        )}

        {/* Grid View */}
        {view === "grid" && (
          <div className="mt-6">
            <SectionCard title={`Grid View (1–${gridSize})`} icon={Layers} action={
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[var(--muted-foreground)]">Size:</span>
                {[5, 10, 12, 15, 20].map((s) => (
                  <button
                    key={s}
                    onClick={() => setGridSize(s)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                      gridSize === s ? "bg-[var(--primary)] text-white" : "bg-[var(--section-highlight)] text-[var(--foreground)]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            }>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      <th className="sticky left-0 z-10 border border-[var(--border)] bg-[var(--card)] p-2 text-xs font-bold text-[var(--muted-foreground)]">×</th>
                      {Array.from({ length: gridSize }, (_, i) => i + 1).map((c) => (
                        <th key={c} className="border border-[var(--border)] bg-[var(--card)] p-2 text-xs font-bold text-[var(--foreground)]">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {gridData.map((row) => (
                      <tr key={row.header}>
                        <td className="sticky left-0 z-10 border border-[var(--border)] bg-[var(--card)] p-2 text-xs font-bold text-[var(--foreground)]">
                          {row.header}
                        </td>
                        {row.cells.map((val, ci) => {
                          const isDiag = row.header === ci + 1;
                          const isSq = isSquare(val);
                          return (
                            <td
                              key={ci}
                              className={`border border-[var(--border)] p-2 text-center text-xs font-semibold transition-colors ${
                                isDiag
                                  ? "bg-emerald-500/10 font-bold text-emerald-600"
                                  : isSq
                                    ? "bg-blue-500/5 text-blue-600"
                                    : "bg-[var(--background)] text-[var(--foreground)]"
                              }`}
                            >
                              {formatNumber(val)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex items-center gap-4 text-xs text-[var(--muted-foreground)]">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Diagonal (n²)</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-400" /> Perfect Square</span>
              </div>
            </SectionCard>
          </div>
        )}

        {/* Compare View */}
        {view === "compare" && (
          <div className="mt-6 space-y-6">
            <SectionCard title="Compare Tables" icon={BarChart3} action={
              <div className="flex items-center gap-2">
                <button onClick={handleAddCompare} disabled={compareNumbers.length >= 6} className="flex items-center gap-1 rounded-lg bg-[var(--primary)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors disabled:opacity-40">
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </button>
                <button onClick={() => exportCsv(compareNumbers[0] || 1, start, end, buildSingleTable(compareNumbers[0] || 1, start, end))} className="flex items-center gap-1.5 rounded-lg bg-[var(--primary)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors">
                  <Download className="h-3.5 w-3.5" />
                  CSV
                </button>
              </div>
            }>
              {/* Compare Number Inputs */}
              <div className="mb-4 flex flex-wrap gap-3">
                {compareNumbers.map((n, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={n}
                      onChange={(e) => handleUpdateCompare(i, e.target.value)}
                      className="h-10 w-20 rounded-lg border border-[var(--border)] bg-[var(--card)] px-2 text-center text-sm font-bold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                    />
                    {compareNumbers.length > 1 && (
                      <button onClick={() => handleRemoveCompare(i)} className="rounded p-1 text-[var(--muted-foreground)] hover:text-rose-500">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Chart */}
              <div className="h-80">
                <SafeResponsiveContainer width="100%" height="100%">
                  <LineChart data={compareData} margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} interval={Math.max(0, Math.floor(compareData.length / 15) - 1)} />
                    <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickFormatter={(v) => formatNumber(v, true)} />
                    <Tooltip content={<CompareTooltip />} />
                    {compareNumbers.map((n, i) => (
                      <Line
                        key={n}
                        type="monotone"
                        dataKey={`n${n}`}
                        name={`Table of ${n}`}
                        stroke={COMPARE_COLORS[i % COMPARE_COLORS.length]}
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: COMPARE_COLORS[i % COMPARE_COLORS.length] }}
                        activeDot={{ r: 5 }}
                      />
                    ))}
                  </LineChart>
                </SafeResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
                {compareNumbers.map((n, i) => (
                  <span key={n} className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COMPARE_COLORS[i % COMPARE_COLORS.length] }} />
                    <span className="font-semibold text-[var(--foreground)]">Table of {n}</span>
                  </span>
                ))}
              </div>

              {/* Side-by-side tables */}
              <div className="mt-6 grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(compareNumbers.length, 3)}, 1fr)` }}>
                {compareNumbers.map((n, i) => {
                  const tRows = buildSingleTable(n, start, end);
                  return (
                    <div key={n} className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
                      <p className="mb-3 text-sm font-bold" style={{ color: COMPARE_COLORS[i % COMPARE_COLORS.length] }}>
                        Table of {n}
                      </p>
                      <div className="space-y-1">
                        {tRows.map((r) => (
                          <div key={r.multiplier} className="flex items-center justify-between text-xs">
                            <span className="text-[var(--muted-foreground)]">{n} × {r.multiplier}</span>
                            <span className={`font-bold ${r.isSquare ? "text-emerald-600" : "text-[var(--foreground)]"}`}>
                              {formatNumber(r.product)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-[var(--muted-foreground)]">
          All calculations run in your browser. No data is stored or uploaded.
        </p>
      </div>
    </div>
  );
}
