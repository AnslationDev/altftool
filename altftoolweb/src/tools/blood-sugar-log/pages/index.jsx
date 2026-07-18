"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Check,
  Copy,
  Droplet,
  FileDown,
  Info,
  Pencil,
  Printer,
  Target,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const READINGS_KEY = "altf:blood-sugar-log:readings";
const PREFS_KEY = "altf:blood-sugar-log:prefs";

const MMOL_FACTOR = 18.0182;
const HYPO = 70;
const SEVERE_LOW = 54;
const SEVERE_HIGH = 250;

const TAGS = [
  {
    id: "fasting",
    label: "Fasting",
    hint: "No food for 8+ hours, usually first thing in the morning",
    min: 80,
    max: 130,
    idealMax: 100,
    idealNote: "ADA target 80-130 mg/dL. Under 100 mg/dL is the non-diabetes ideal.",
  },
  {
    id: "before-meal",
    label: "Before meal",
    hint: "Preprandial, taken just before you start eating",
    min: 80,
    max: 130,
    idealMax: 110,
    idealNote: "ADA preprandial target 80-130 mg/dL.",
  },
  {
    id: "post-meal",
    label: "2h after meal",
    hint: "Postprandial, measured 2 hours from the first bite",
    min: 80,
    max: 180,
    idealMax: 140,
    idealNote: "ADA target under 180 mg/dL. Under 140 mg/dL is the non-diabetes ideal.",
  },
  {
    id: "bedtime",
    label: "Bedtime",
    hint: "Last check before sleep, guards against overnight lows",
    min: 90,
    max: 150,
    idealMax: 120,
    idealNote: "Common bedtime target 90-150 mg/dL to reduce overnight hypo risk.",
  },
  {
    id: "random",
    label: "Random",
    hint: "Any other time, not tied to a meal",
    min: 80,
    max: 180,
    idealMax: 140,
    idealNote: "Casual check. Broad 80-180 mg/dL band used here for context only.",
  },
];

const TAG_BY_ID = TAGS.reduce((acc, tag) => {
  acc[tag.id] = tag;
  return acc;
}, {});

const RANGE_FILTERS = [
  { id: "7", label: "7 days", days: 7 },
  { id: "30", label: "30 days", days: 30 },
  { id: "90", label: "90 days", days: 90 },
  { id: "all", label: "All", days: 0 },
];

const TIR_BANDS = [
  { id: "very-low", label: "Very low", sub: "Under 54", color: "var(--anslation-ds-danger)", opacity: 1 },
  { id: "low", label: "Low", sub: "54-69", color: "var(--anslation-ds-danger)", opacity: 0.55 },
  { id: "in", label: "In range", sub: "70-180", color: "var(--anslation-ds-success)", opacity: 1 },
  { id: "high", label: "High", sub: "181-250", color: "var(--anslation-ds-warning)", opacity: 0.85 },
  { id: "very-high", label: "Very high", sub: "Over 250", color: "var(--anslation-ds-warning)", opacity: 0.45 },
];

const SAMPLE = [
  { dayAgo: 6, time: "07:10", tag: "fasting", value: 112, note: "Slept 7 hours" },
  { dayAgo: 6, time: "14:20", tag: "post-meal", value: 168, note: "Rice and dal" },
  { dayAgo: 6, time: "22:30", tag: "bedtime", value: 128, note: "" },
  { dayAgo: 5, time: "07:05", tag: "fasting", value: 104, note: "Walked 30 min last evening" },
  { dayAgo: 5, time: "13:55", tag: "before-meal", value: 96, note: "" },
  { dayAgo: 5, time: "16:00", tag: "post-meal", value: 152, note: "Roti, sabzi, salad" },
  { dayAgo: 4, time: "07:20", tag: "fasting", value: 121, note: "" },
  { dayAgo: 4, time: "15:10", tag: "post-meal", value: 194, note: "Restaurant lunch, extra naan" },
  { dayAgo: 4, time: "22:45", tag: "bedtime", value: 142, note: "" },
  { dayAgo: 3, time: "06:55", tag: "fasting", value: 98, note: "" },
  { dayAgo: 3, time: "11:30", tag: "random", value: 134, note: "Mid-morning check" },
  { dayAgo: 3, time: "21:50", tag: "post-meal", value: 158, note: "Light dinner" },
  { dayAgo: 2, time: "07:15", tag: "fasting", value: 108, note: "" },
  { dayAgo: 2, time: "10:40", tag: "random", value: 66, note: "Skipped breakfast, felt shaky" },
  { dayAgo: 2, time: "14:35", tag: "post-meal", value: 145, note: "" },
  { dayAgo: 1, time: "07:00", tag: "fasting", value: 101, note: "" },
  { dayAgo: 1, time: "14:10", tag: "post-meal", value: 176, note: "Pasta" },
  { dayAgo: 1, time: "22:20", tag: "bedtime", value: 118, note: "Evening walk" },
  { dayAgo: 0, time: "07:05", tag: "fasting", value: 95, note: "" },
  { dayAgo: 0, time: "13:40", tag: "before-meal", value: 88, note: "" },
];

const pad2 = (n) => String(n).padStart(2, "0");

const toDateInput = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const toTimeInput = (d) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

const parseAt = (dateStr, timeStr) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr) || !/^\d{1,2}:\d{2}$/.test(timeStr)) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31 || hh > 23 || mm > 59) return null;
  return new Date(y, m - 1, d, hh, mm).getTime();
};

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

const mgToMmol = (mg) => mg / MMOL_FACTOR;
const mmolToMg = (mmol) => mmol * MMOL_FACTOR;

const displayValue = (mg, unit) =>
  unit === "mmol" ? (Math.round(mgToMmol(mg) * 10) / 10).toFixed(1) : String(Math.round(mg));

const unitLabel = (unit) => (unit === "mmol" ? "mmol/L" : "mg/dL");

const toCanonical = (raw, unit) => {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  return unit === "mmol" ? mmolToMg(n) : n;
};

const classify = (mg, tagId) => {
  const tag = TAG_BY_ID[tagId] || TAG_BY_ID.random;
  if (mg < SEVERE_LOW) return { id: "severe-low", label: "Severe low", tone: "danger" };
  if (mg < HYPO) return { id: "low", label: "Low", tone: "danger" };
  if (mg > SEVERE_HIGH) return { id: "severe-high", label: "Very high", tone: "danger" };
  if (mg > tag.max) return { id: "high", label: "Above target", tone: "warning" };
  if (mg < tag.min) return { id: "below", label: "Below target", tone: "warning" };
  if (mg <= tag.idealMax) return { id: "ideal", label: "Ideal", tone: "success" };
  return { id: "in", label: "In target", tone: "success" };
};

const toneColor = (tone) =>
  tone === "danger"
    ? "var(--anslation-ds-danger)"
    : tone === "warning"
      ? "var(--anslation-ds-warning)"
      : "var(--anslation-ds-success)";

const fmtDateTime = (ts) =>
  new Date(ts).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

const fmtAvg = (mg, unit) => (unit === "mmol" ? `${mgToMmol(mg).toFixed(1)}` : `${Math.round(mg)}`);

function StatusBadge({ status }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
      style={{ background: "var(--muted)", color: toneColor(status.tone) }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: toneColor(status.tone) }}
        aria-hidden="true"
      />
      {status.label}
    </span>
  );
}

function TrendChart({ readings, unit }) {
  const W = 720;
  const H = 240;
  const L = 44;
  const R = 12;
  const T = 14;
  const B = 30;

  if (readings.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-md bg-[var(--muted)] text-sm text-[var(--muted-foreground)]">
        Add a reading to see your trend line.
      </div>
    );
  }

  const sorted = [...readings].sort((a, b) => a.at - b.at);
  const first = sorted[0].at;
  const last = sorted[sorted.length - 1].at;
  const span = Math.max(last - first, 60 * 60 * 1000);
  const maxVal = Math.max(200, ...sorted.map((r) => r.value));
  const yTop = Math.ceil((maxVal * 1.08) / 20) * 20;
  const yBottom = 40;

  const x = (ts) => L + ((ts - first) / span) * (W - L - R);
  const y = (v) => H - B - ((Math.min(Math.max(v, yBottom), yTop) - yBottom) / (yTop - yBottom)) * (H - T - B);

  const line = sorted.map((r, i) => `${i === 0 ? "M" : "L"}${x(r.at).toFixed(1)},${y(r.value).toFixed(1)}`).join(" ");

  const bands = [
    { from: yBottom, to: HYPO, color: "var(--anslation-ds-danger)", opacity: 0.14 },
    { from: HYPO, to: 180, color: "var(--anslation-ds-success)", opacity: 0.14 },
    { from: 180, to: SEVERE_HIGH, color: "var(--anslation-ds-warning)", opacity: 0.12 },
    { from: SEVERE_HIGH, to: yTop, color: "var(--anslation-ds-danger)", opacity: 0.12 },
  ].filter((band) => band.to > band.from);

  const gridValues = [];
  for (let v = yBottom; v <= yTop; v += yTop > 300 ? 60 : 40) gridValues.push(v);

  const dayCount = Math.max(1, Math.round(span / 86400000));
  const tickCount = Math.min(6, Math.max(2, dayCount));
  const ticks = [];
  for (let i = 0; i < tickCount; i += 1) ticks.push(first + (span * i) / (tickCount - 1 || 1));

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-60 w-full"
      role="img"
      aria-label="Glucose readings over time, shaded by target zone"
      preserveAspectRatio="xMidYMid meet"
    >
      {bands.map((band) => (
        <rect
          key={`${band.from}-${band.to}`}
          x={L}
          y={y(band.to)}
          width={W - L - R}
          height={Math.max(0, y(band.from) - y(band.to))}
          fill={band.color}
          opacity={band.opacity}
        />
      ))}
      {gridValues.map((v) => (
        <g key={v}>
          <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="var(--border)" strokeWidth="1" opacity="0.5" />
          <text x={L - 6} y={y(v) + 3} textAnchor="end" fontSize="9" fill="var(--muted-foreground)">
            {unit === "mmol" ? mgToMmol(v).toFixed(1) : v}
          </text>
        </g>
      ))}
      {ticks.map((ts, i) => (
        <text
          key={`${ts}-${i}`}
          x={x(ts)}
          y={H - 10}
          textAnchor={i === 0 ? "start" : i === ticks.length - 1 ? "end" : "middle"}
          fontSize="9"
          fill="var(--muted-foreground)"
        >
          {new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </text>
      ))}
      {sorted.length > 1 && (
        <path d={line} fill="none" stroke="var(--primary)" strokeWidth="1.6" opacity="0.65" />
      )}
      {sorted.map((r) => {
        const status = classify(r.value, r.tag);
        return (
          <circle
            key={r.id}
            cx={x(r.at)}
            cy={y(r.value)}
            r="4"
            fill={toneColor(status.tone)}
            stroke="var(--card)"
            strokeWidth="1.5"
          >
            <title>{`${fmtDateTime(r.at)} — ${displayValue(r.value, unit)} ${unitLabel(unit)} (${
              TAG_BY_ID[r.tag]?.label || r.tag
            }, ${status.label})`}</title>
          </circle>
        );
      })}
    </svg>
  );
}

function TimeInRangeBar({ counts, total }) {
  if (total === 0) {
    return (
      <div className="rounded-md bg-[var(--muted)] p-4 text-sm text-[var(--muted-foreground)]">
        Log a few readings to see your time in range.
      </div>
    );
  }
  return (
    <div>
      <div className="flex h-8 w-full overflow-hidden rounded-md border border-[var(--border)]">
        {TIR_BANDS.map((band) => {
          const pct = (counts[band.id] / total) * 100;
          if (pct === 0) return null;
          return (
            <div
              key={band.id}
              style={{ width: `${pct}%`, background: band.color, opacity: band.opacity }}
              title={`${band.label}: ${pct.toFixed(0)}%`}
            />
          );
        })}
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {TIR_BANDS.map((band) => {
          const pct = (counts[band.id] / total) * 100;
          return (
            <div key={band.id} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-2.5">
              <div className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{ background: band.color, opacity: band.opacity }}
                  aria-hidden="true"
                />
                <span className="text-xs font-semibold">{band.label}</span>
              </div>
              <p className="mt-1 text-lg font-semibold">{pct.toFixed(0)}%</p>
              <p className="text-xs text-[var(--muted-foreground)]">
                {band.sub} · {counts[band.id]} reading{counts[band.id] === 1 ? "" : "s"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ToolHome() {
  const [readings, setReadings] = useState([]);
  const [unit, setUnit] = useState("mg");
  const [hydrated, setHydrated] = useState(false);
  const [nowTs, setNowTs] = useState(0);

  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("");
  const [valueStr, setValueStr] = useState("100");
  const [tag, setTag] = useState("fasting");
  const [note, setNote] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState("");

  const [rangeId, setRangeId] = useState("30");
  const [copied, setCopied] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(READINGS_KEY) || "[]");
      if (Array.isArray(stored)) {
        const clean = stored
          .filter(
            (r) =>
              r &&
              typeof r.at === "number" &&
              Number.isFinite(r.value) &&
              r.value > 0 &&
              TAG_BY_ID[r.tag]
          )
          .map((r) => ({
            id: typeof r.id === "string" ? r.id : uid(),
            at: r.at,
            value: r.value,
            tag: r.tag,
            note: typeof r.note === "string" ? r.note : "",
          }));
        setReadings(clean);
      }
    } catch {
      /* ignore */
    }
    try {
      const prefs = JSON.parse(window.localStorage.getItem(PREFS_KEY) || "null");
      if (prefs?.unit === "mmol" || prefs?.unit === "mg") setUnit(prefs.unit);
      if (RANGE_FILTERS.some((f) => f.id === prefs?.rangeId)) setRangeId(prefs.rangeId);
    } catch {
      /* ignore */
    }
    const now = new Date();
    setDateStr(toDateInput(now));
    setTimeStr(toTimeInput(now));
    setNowTs(now.getTime());
    setHydrated(true);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNowTs(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(READINGS_KEY, JSON.stringify(readings));
    } catch {
      /* ignore */
    }
  }, [readings, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(PREFS_KEY, JSON.stringify({ unit, rangeId }));
    } catch {
      /* ignore */
    }
  }, [unit, rangeId, hydrated]);

  const activeTag = TAG_BY_ID[tag] || TAGS[0];

  const previewMg = useMemo(() => toCanonical(valueStr, unit), [valueStr, unit]);
  const previewStatus = previewMg ? classify(previewMg, tag) : null;

  const filtered = useMemo(() => {
    const filter = RANGE_FILTERS.find((f) => f.id === rangeId) || RANGE_FILTERS[1];
    if (!filter.days || !nowTs) return [...readings].sort((a, b) => b.at - a.at);
    const cutoff = nowTs - filter.days * 86400000;
    return readings.filter((r) => r.at >= cutoff).sort((a, b) => b.at - a.at);
  }, [readings, rangeId, nowTs]);

  const stats = useMemo(() => {
    const counts = TIR_BANDS.reduce((acc, band) => {
      acc[band.id] = 0;
      return acc;
    }, {});
    filtered.forEach((r) => {
      if (r.value < SEVERE_LOW) counts["very-low"] += 1;
      else if (r.value < HYPO) counts.low += 1;
      else if (r.value <= 180) counts.in += 1;
      else if (r.value <= SEVERE_HIGH) counts.high += 1;
      else counts["very-high"] += 1;
    });

    const byTag = TAGS.map((t) => {
      const rows = filtered.filter((r) => r.tag === t.id);
      const avg = rows.length ? rows.reduce((sum, r) => sum + r.value, 0) / rows.length : null;
      return { tag: t, count: rows.length, avg };
    });

    const overallAvg = filtered.length
      ? filtered.reduce((sum, r) => sum + r.value, 0) / filtered.length
      : null;

    const ninetyCutoff = nowTs - 90 * 86400000;
    const ninety = readings.filter((r) => r.at >= ninetyCutoff);
    const ninetyAvg = ninety.length ? ninety.reduce((sum, r) => sum + r.value, 0) / ninety.length : null;
    const a1c = ninetyAvg === null ? null : (ninetyAvg + 46.7) / 28.7;

    return {
      counts,
      total: filtered.length,
      byTag,
      overallAvg,
      ninetyAvg,
      ninetyCount: ninety.length,
      a1c,
      lows: filtered.filter((r) => r.value < HYPO),
      severeHighs: filtered.filter((r) => r.value > SEVERE_HIGH),
    };
  }, [filtered, readings, nowTs]);

  const resetForm = () => {
    const now = new Date();
    setDateStr(toDateInput(now));
    setTimeStr(toTimeInput(now));
    setValueStr(unit === "mmol" ? "5.6" : "100");
    setNote("");
    setEditingId(null);
    setFormError("");
  };

  const submit = () => {
    const at = parseAt(dateStr, timeStr);
    if (at === null) {
      setFormError("Enter a valid date and time.");
      return;
    }
    const mg = toCanonical(valueStr, unit);
    if (mg === null) {
      setFormError(`Enter a glucose value in ${unitLabel(unit)}.`);
      return;
    }
    if (mg < 20 || mg > 900) {
      setFormError(
        unit === "mmol"
          ? "Enter a value between 1.1 and 50 mmol/L."
          : "Enter a value between 20 and 900 mg/dL."
      );
      return;
    }
    const entry = { id: editingId || uid(), at, value: Math.round(mg * 10) / 10, tag, note: note.trim() };
    setReadings((prev) => {
      const next = editingId ? prev.map((r) => (r.id === editingId ? entry : r)) : [...prev, entry];
      return next.sort((a, b) => b.at - a.at);
    });
    resetForm();
  };

  const startEdit = (reading) => {
    const d = new Date(reading.at);
    setEditingId(reading.id);
    setDateStr(toDateInput(d));
    setTimeStr(toTimeInput(d));
    setValueStr(displayValue(reading.value, unit));
    setTag(reading.tag);
    setNote(reading.note || "");
    setFormError("");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = (id) => {
    setReadings((prev) => prev.filter((r) => r.id !== id));
    if (editingId === id) resetForm();
  };

  const loadSample = () => {
    const base = new Date();
    const rows = SAMPLE.map((s) => {
      const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() - s.dayAgo);
      const [hh, mm] = s.time.split(":").map(Number);
      return {
        id: uid(),
        at: new Date(d.getFullYear(), d.getMonth(), d.getDate(), hh, mm).getTime(),
        value: s.value,
        tag: s.tag,
        note: s.note,
      };
    });
    setReadings(rows.sort((a, b) => b.at - a.at));
    setConfirmClear(false);
  };

  const clearAll = () => {
    setReadings([]);
    setConfirmClear(false);
    resetForm();
  };

  const report = useMemo(() => {
    const filter = RANGE_FILTERS.find((f) => f.id === rangeId) || RANGE_FILTERS[1];
    const lines = [
      "Blood Sugar Log",
      `Window: ${filter.label}`,
      `Unit: ${unitLabel(unit)}`,
      `Readings: ${stats.total}`,
      stats.overallAvg !== null ? `Average: ${fmtAvg(stats.overallAvg, unit)} ${unitLabel(unit)}` : "Average: --",
      stats.total
        ? `Time in range (70-180 mg/dL): ${((stats.counts.in / stats.total) * 100).toFixed(0)}%`
        : "Time in range: --",
      stats.a1c !== null
        ? `Estimated HbA1c (90-day avg of ${stats.ninetyCount} readings): ${stats.a1c.toFixed(1)}% — estimate only, not a lab test`
        : "Estimated HbA1c: needs readings in the last 90 days",
      "",
      "Averages by context",
      ...stats.byTag.map(
        (row) =>
          `  ${row.tag.label}: ${
            row.avg === null ? "--" : `${fmtAvg(row.avg, unit)} ${unitLabel(unit)}`
          } (${row.count} reading${row.count === 1 ? "" : "s"}, target ${row.tag.min}-${row.tag.max} mg/dL)`
      ),
      "",
      "Readings",
      ...filtered.map((r) => {
        const status = classify(r.value, r.tag);
        return `  ${fmtDateTime(r.at)} | ${displayValue(r.value, unit)} ${unitLabel(unit)} | ${
          TAG_BY_ID[r.tag]?.label || r.tag
        } | ${status.label}${r.note ? ` | ${r.note}` : ""}`;
      }),
      "",
      nowTs ? `Generated: ${new Date(nowTs).toLocaleString()}` : "",
      "Estimates for awareness, not medical advice.",
    ];
    return lines.join("\n");
  }, [filtered, rangeId, stats, unit, nowTs]);

  const copyReport = async () => {
    const ok = await safeCopyText(report);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const downloadCsv = () => {
    const rows = [
      ["Date", "Time", "Value", "Unit", "Context", "Target (mg/dL)", "Status", "Note"],
      ...filtered.map((r) => {
        const d = new Date(r.at);
        const t = TAG_BY_ID[r.tag];
        return [
          toDateInput(d),
          toTimeInput(d),
          displayValue(r.value, unit),
          unitLabel(unit),
          t?.label || r.tag,
          t ? `${t.min}-${t.max}` : "",
          classify(r.value, r.tag).label,
          (r.note || "").replace(/"/g, '""'),
        ];
      }),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "blood-sugar-log.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const tirPct = stats.total ? (stats.counts.in / stats.total) * 100 : 0;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Droplet className="h-4 w-4" />
            Health tracker
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Blood Sugar Log &amp; Tracker</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Log every glucose reading with the context it was taken in. The context sets the target range, so a
            140 after lunch reads very differently from a 140 while fasting. Track time in range, averages by
            meal context, and an estimated HbA1c you can take to your next appointment.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[420px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">{editingId ? "Edit reading" : "Add a reading"}</h2>
              <div className="inline-flex rounded-md border border-[var(--border)] p-0.5">
                {[
                  { id: "mg", label: "mg/dL" },
                  { id: "mmol", label: "mmol/L" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      if (opt.id === unit) return;
                      const mg = toCanonical(valueStr, unit);
                      setUnit(opt.id);
                      if (mg !== null) setValueStr(displayValue(mg, opt.id));
                    }}
                    className={`rounded px-2.5 py-1 text-xs font-semibold transition ${
                      unit === opt.id
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-4">
              <label className="block">
                <span className="text-sm font-semibold">Reading ({unitLabel(unit)})</span>
                <input
                  type="number"
                  inputMode="decimal"
                  step={unit === "mmol" ? "0.1" : "1"}
                  value={valueStr}
                  onChange={(event) => setValueStr(event.target.value)}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>

              <div>
                <span className="text-sm font-semibold">Context</span>
                <div className="mt-2 grid gap-2 sm:grid-cols-2 2xl:grid-cols-1">
                  {TAGS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTag(t.id)}
                      className={`rounded-md border px-3 py-2.5 text-left transition ${
                        tag === t.id
                          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
                      }`}
                    >
                      <span className="block text-sm font-semibold">{t.label}</span>
                      <span
                        className={`block text-xs ${
                          tag === t.id ? "opacity-80" : "text-[var(--muted-foreground)]"
                        }`}
                      >
                        Target {t.min}-{t.max} mg/dL
                      </span>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">{activeTag.hint}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold">Date</span>
                  <input
                    type="date"
                    value={dateStr}
                    onChange={(event) => setDateStr(event.target.value)}
                    className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold">Time</span>
                  <input
                    type="time"
                    value={timeStr}
                    onChange={(event) => setTimeStr(event.target.value)}
                    className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-semibold">Note (optional)</span>
                <input
                  type="text"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="What you ate, insulin dose, exercise, illness"
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
            </div>

            {previewStatus && (
              <div className="mt-4 flex items-center justify-between gap-3 rounded-md bg-[var(--muted)] px-3 py-2.5">
                <span className="text-xs text-[var(--muted-foreground)]">
                  {displayValue(previewMg, unit)} {unitLabel(unit)} as {activeTag.label.toLowerCase()}
                </span>
                <StatusBadge status={previewStatus} />
              </div>
            )}

            {formError && (
              <p className="mt-3 text-sm font-semibold" style={{ color: "var(--anslation-ds-danger)" }}>
                {formError}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={submit}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)]"
              >
                <Check className="h-4 w-4" />
                {editingId ? "Save changes" : "Add reading"}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="btn-secondary min-h-11 px-3 text-sm">
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              )}
            </div>

            <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-[var(--muted-foreground)]">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Every reading stays on your device in this browser. Nothing is uploaded, and clearing your browser
              data removes it.
            </p>
          </div>

          <div className="grid gap-6">
            {stats.lows.length > 0 && (
              <div
                className="rounded-lg border bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]"
                style={{ borderColor: "var(--anslation-ds-danger)" }}
                aria-live="polite"
              >
                <div className="flex items-center gap-2">
                  <TriangleAlert className="h-5 w-5" style={{ color: "var(--anslation-ds-danger)" }} />
                  <h2 className="text-lg font-semibold" style={{ color: "var(--anslation-ds-danger)" }}>
                    {stats.lows.length} low reading{stats.lows.length === 1 ? "" : "s"} under 70 mg/dL
                    (3.9 mmol/L)
                  </h2>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                  A reading under 70 mg/dL is hypoglycemia. The standard response is the 15-15 rule.
                </p>
                <ol className="mt-3 grid gap-2 text-sm leading-6">
                  <li className="rounded-md bg-[var(--muted)] p-3">
                    <span className="font-semibold">1. Take 15 g of fast-acting carbs.</span> About 4 glucose
                    tablets, 120 ml of juice or regular soft drink, 1 tablespoon of sugar or honey. Skip
                    chocolate and nuts, the fat slows absorption.
                  </li>
                  <li className="rounded-md bg-[var(--muted)] p-3">
                    <span className="font-semibold">2. Wait 15 minutes, then recheck.</span> If still under 70
                    mg/dL, repeat the 15 g.
                  </li>
                  <li className="rounded-md bg-[var(--muted)] p-3">
                    <span className="font-semibold">3. Once back above 70, eat a meal or snack</span> with
                    protein and carbs if your next meal is more than an hour away.
                  </li>
                </ol>
                <p className="mt-3 text-sm leading-6" style={{ color: "var(--anslation-ds-danger)" }}>
                  If someone is confused, having a seizure, or cannot swallow, do not give food by mouth. That
                  is severe hypoglycemia — it needs glucagon and emergency help immediately.
                </p>
              </div>
            )}

            {stats.severeHighs.length > 0 && (
              <div
                className="rounded-lg border bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]"
                style={{ borderColor: "var(--anslation-ds-warning)" }}
                aria-live="polite"
              >
                <div className="flex items-center gap-2">
                  <TriangleAlert className="h-5 w-5" style={{ color: "var(--anslation-ds-warning)" }} />
                  <h2 className="text-lg font-semibold">
                    {stats.severeHighs.length} reading{stats.severeHighs.length === 1 ? "" : "s"} over 250 mg/dL
                    (13.9 mmol/L)
                  </h2>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                  Readings this high are worth a ketone check, especially with type 1 diabetes or if you are
                  unwell. Ketones plus high glucose can point to diabetic ketoacidosis, which is a medical
                  emergency. Drink water, avoid exercise while ketones are present, and contact your care team
                  if ketones are moderate or large, or if you have nausea, vomiting, stomach pain, deep
                  breathing, or fruity-smelling breath.
                </p>
              </div>
            )}

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex flex-wrap rounded-md border border-[var(--border)] p-0.5">
                  {RANGE_FILTERS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setRangeId(f.id)}
                      className={`rounded px-3 py-1.5 text-xs font-semibold transition ${
                        rangeId === f.id
                          ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={copyReport}
                    className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                    disabled={stats.total === 0}
                  >
                    <Copy className="h-4 w-4" />
                    {copied ? "Copied" : "Copy log"}
                  </button>
                  <button
                    type="button"
                    onClick={downloadCsv}
                    className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                    disabled={stats.total === 0}
                  >
                    <FileDown className="h-4 w-4" />
                    CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                    disabled={stats.total === 0}
                  >
                    <Printer className="h-4 w-4" />
                    Print
                  </button>
                </div>
              </div>

              <div className="tool-compact-grid mt-5" aria-live="polite">
                {[
                  [
                    "Readings",
                    String(stats.total),
                    RANGE_FILTERS.find((f) => f.id === rangeId)?.label.toLowerCase() || "",
                  ],
                  [
                    "Average",
                    stats.overallAvg === null ? "--" : fmtAvg(stats.overallAvg, unit),
                    unitLabel(unit),
                  ],
                  ["Time in range", stats.total ? `${tirPct.toFixed(0)}%` : "--", "70-180 mg/dL"],
                  [
                    "Est. HbA1c",
                    stats.a1c === null ? "--" : `${stats.a1c.toFixed(1)}%`,
                    stats.ninetyCount ? `from ${stats.ninetyCount} readings` : "needs 90-day data",
                  ],
                ].map(([label, value, sub]) => (
                  <div key={label} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                    <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
                    <p className="mt-1 text-2xl font-semibold text-[var(--primary)]">{value}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{sub}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <div className="mb-2 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[var(--primary)]" />
                  <h3 className="text-sm font-semibold">Trend, shaded by zone</h3>
                </div>
                <TrendChart readings={filtered} unit={unit} />
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                  Green band is 70-180 mg/dL (3.9-10.0 mmol/L), the consensus in-range zone. Each dot is
                  coloured against the target for its own context tag, so a post-meal 150 shows in range while a
                  fasting 150 does not.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-[var(--primary)]" />
                <h3 className="text-sm font-semibold">Time in range</h3>
              </div>
              <p className="mb-3 mt-1 text-xs text-[var(--muted-foreground)]">
                The metric CGM reports lead with. A common goal for many adults is over 70% in range, under 4%
                below 70 mg/dL, and under 1% below 54 mg/dL — but your own targets come from your care team.
              </p>
              <TimeInRangeBar counts={stats.counts} total={stats.total} />
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <h3 className="text-sm font-semibold">Average by context</h3>
              <p className="mb-3 mt-1 text-xs text-[var(--muted-foreground)]">
                The split that actually matters. A high fasting average points at overnight liver glucose or
                basal dose. A high post-meal average points at meal size, carb type, or timing.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {stats.byTag.map((row) => {
                  const status = row.avg === null ? null : classify(row.avg, row.tag.id);
                  return (
                    <div
                      key={row.tag.id}
                      className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold">{row.tag.label}</p>
                        {status && <StatusBadge status={status} />}
                      </div>
                      <p className="mt-1 text-2xl font-semibold">
                        {row.avg === null ? "--" : fmtAvg(row.avg, unit)}
                        <span className="ml-1 text-xs font-normal text-[var(--muted-foreground)]">
                          {unitLabel(unit)}
                        </span>
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {row.count} reading{row.count === 1 ? "" : "s"} · target {row.tag.min}-{row.tag.max}{" "}
                        mg/dL
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Your readings</h2>
              <p className="text-xs text-[var(--muted-foreground)]">
                {stats.total} in the selected window · {readings.length} logged in total
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {readings.length === 0 && (
                <button type="button" onClick={loadSample} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                  Load a sample week
                </button>
              )}
              {readings.length > 0 &&
                (confirmClear ? (
                  <>
                    <button
                      type="button"
                      onClick={clearAll}
                      className="inline-flex min-h-9 items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold text-[var(--primary-foreground)]"
                      style={{ background: "var(--anslation-ds-danger)" }}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete everything
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClear(false)}
                      className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmClear(true)}
                    className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear all
                  </button>
                ))}
            </div>
          </div>

          {confirmClear && (
            <p className="mt-3 rounded-md bg-[var(--muted)] p-3 text-sm text-[var(--muted-foreground)]">
              This permanently deletes all {readings.length} readings from this browser. There is no undo and no
              backup — export a CSV first if you want a copy.
            </p>
          )}

          {filtered.length === 0 ? (
            <p className="mt-6 rounded-md bg-[var(--muted)] p-6 text-center text-sm text-[var(--muted-foreground)]">
              {readings.length === 0
                ? "No readings yet. Add your first one on the left, or load a sample week to see how the trends look."
                : "No readings in this window. Try a wider range filter."}
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left text-xs uppercase text-[var(--muted-foreground)]">
                    <th className="px-2 py-2 font-semibold">When</th>
                    <th className="px-2 py-2 font-semibold">Reading</th>
                    <th className="px-2 py-2 font-semibold">Context</th>
                    <th className="px-2 py-2 font-semibold">Status</th>
                    <th className="px-2 py-2 font-semibold">Note</th>
                    <th className="px-2 py-2 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                    const status = classify(r.value, r.tag);
                    const t = TAG_BY_ID[r.tag];
                    return (
                      <tr key={r.id} className="border-b border-[var(--border)] last:border-0">
                        <td className="whitespace-nowrap px-2 py-2.5 text-[var(--muted-foreground)]">
                          {fmtDateTime(r.at)}
                        </td>
                        <td className="whitespace-nowrap px-2 py-2.5">
                          <span className="text-base font-semibold" style={{ color: toneColor(status.tone) }}>
                            {displayValue(r.value, unit)}
                          </span>
                          <span className="ml-1 text-xs text-[var(--muted-foreground)]">{unitLabel(unit)}</span>
                        </td>
                        <td className="whitespace-nowrap px-2 py-2.5">
                          <span className="text-xs font-semibold">{t?.label || r.tag}</span>
                          <span className="block text-xs text-[var(--muted-foreground)]">
                            {t ? `${t.min}-${t.max}` : ""}
                          </span>
                        </td>
                        <td className="px-2 py-2.5">
                          <StatusBadge status={status} />
                        </td>
                        <td className="max-w-[220px] px-2 py-2.5 text-xs text-[var(--muted-foreground)]">
                          {r.note || "--"}
                        </td>
                        <td className="whitespace-nowrap px-2 py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => startEdit(r)}
                            aria-label={`Edit reading from ${fmtDateTime(r.at)}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] transition hover:border-[var(--primary)]"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(r.id)}
                            aria-label={`Delete reading from ${fmtDateTime(r.at)}`}
                            className="ml-1.5 inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] transition hover:border-[var(--primary)]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <h2 className="text-lg font-semibold">Estimated HbA1c</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              HbA1c reflects your average glucose over roughly 90 days, because that is how long red blood cells
              live. This estimate uses the ADAG study regression that links average glucose to A1c.
            </p>
            <div className="mt-4 rounded-md bg-[var(--muted)] p-4">
              <p className="text-xs uppercase text-[var(--muted-foreground)]">Formula</p>
              <p className="mt-1 font-mono text-sm">A1c % = (average mg/dL + 46.7) / 28.7</p>
              {stats.ninetyAvg !== null ? (
                <p className="mt-3 text-sm leading-6">
                  Your 90-day average of {Math.round(stats.ninetyAvg)} mg/dL across {stats.ninetyCount} readings
                  gives{" "}
                  <span className="text-xl font-semibold text-[var(--primary)]">{stats.a1c.toFixed(1)}%</span>{" "}
                  ({(10.929 * (stats.a1c - 2.15)).toFixed(0)} mmol/mol).
                </p>
              ) : (
                <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                  Log readings across the last 90 days to see an estimate.
                </p>
              )}
            </div>
            <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
              Treat this as a rough signal, not a lab result. Fingerstick readings are a small, biased sample —
              you tend to test at similar times and skip the overnight hours entirely, so the estimate can drift
              well off a real lab A1c. Conditions like anaemia, pregnancy, kidney disease, and haemoglobin
              variants shift lab A1c too. Only a blood test from your doctor gives the real number.
            </p>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <h2 className="text-lg font-semibold">Target ranges used here</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              Based on American Diabetes Association guidance for most non-pregnant adults with diabetes. Your
              personal targets may be tighter or looser depending on age, pregnancy, hypo awareness, and other
              conditions.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[380px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left text-xs uppercase text-[var(--muted-foreground)]">
                    <th className="px-2 py-2 font-semibold">Context</th>
                    <th className="px-2 py-2 font-semibold">Target mg/dL</th>
                    <th className="px-2 py-2 font-semibold">Target mmol/L</th>
                  </tr>
                </thead>
                <tbody>
                  {TAGS.map((t) => (
                    <tr key={t.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="px-2 py-2.5 font-semibold">{t.label}</td>
                      <td className="px-2 py-2.5 text-[var(--muted-foreground)]">
                        {t.min}-{t.max}
                      </td>
                      <td className="px-2 py-2.5 text-[var(--muted-foreground)]">
                        {mgToMmol(t.min).toFixed(1)}-{mgToMmol(t.max).toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 rounded-md bg-[var(--muted)] p-4">
              <p className="text-xs uppercase text-[var(--muted-foreground)]">Unit conversion</p>
              <p className="mt-1 font-mono text-sm">mmol/L = mg/dL / 18.0182</p>
              <p className="font-mono text-sm">mg/dL = mmol/L x 18.0182</p>
              <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                Readings are stored in mg/dL and converted for display, so switching units never rounds your
                history away. India, the US, and much of Asia use mg/dL; the UK, Canada, and most of Europe use
                mmol/L.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-5">
          <p className="text-sm leading-6 text-[var(--muted-foreground)]">
            This log is for awareness and for sharing with your care team, not medical advice, diagnosis, or
            treatment. Target ranges here are general adult guidance and may not be yours — pregnancy,
            childhood, older age, and hypoglycemia unawareness all change them. Never start, stop, or adjust
            insulin or any medication based on this tool. Readings under 70 mg/dL, readings over 250 mg/dL with
            ketones or illness, or any symptoms that worry you need a doctor, not an app.
          </p>
        </section>
      </div>

      <div id="altf-bsl-print" aria-hidden="true">
        <div className="altf-bsl-print-inner">
          <h2 className="altf-bsl-print-title">Blood Sugar Log</h2>
          <p className="altf-bsl-print-meta">
            Window: {RANGE_FILTERS.find((f) => f.id === rangeId)?.label} · Unit: {unitLabel(unit)} · Readings:{" "}
            {stats.total} · Printed {nowTs ? new Date(nowTs).toLocaleDateString("en-IN") : ""}
          </p>
          <p className="altf-bsl-print-meta">
            Average: {stats.overallAvg === null ? "--" : `${fmtAvg(stats.overallAvg, unit)} ${unitLabel(unit)}`}{" "}
            · Time in range (70-180 mg/dL): {stats.total ? `${tirPct.toFixed(0)}%` : "--"} · Estimated HbA1c:{" "}
            {stats.a1c === null ? "--" : `${stats.a1c.toFixed(1)}%`} (estimate from{" "}
            {stats.ninetyCount} readings, not a lab test)
          </p>
          <table className="altf-bsl-print-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Reading</th>
                <th>Context</th>
                <th>Target (mg/dL)</th>
                <th>Status</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const t = TAG_BY_ID[r.tag];
                return (
                  <tr key={r.id}>
                    <td>{fmtDateTime(r.at)}</td>
                    <td>
                      {displayValue(r.value, unit)} {unitLabel(unit)}
                    </td>
                    <td>{t?.label || r.tag}</td>
                    <td>{t ? `${t.min}-${t.max}` : ""}</td>
                    <td>{classify(r.value, r.tag).label}</td>
                    <td>{r.note || ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="altf-bsl-print-foot">
            Averages by context:{" "}
            {stats.byTag
              .filter((row) => row.count > 0)
              .map((row) => `${row.tag.label} ${fmtAvg(row.avg, unit)}`)
              .join(" · ") || "--"}
          </p>
          <p className="altf-bsl-print-foot">
            Self-recorded readings for discussion with a clinician. Not medical advice.
          </p>
        </div>
      </div>

      <style>{`
        #altf-bsl-print { display: none; }
        @media print {
          body * { visibility: hidden !important; }
          #altf-bsl-print, #altf-bsl-print * { visibility: visible !important; }
          #altf-bsl-print {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: #ffffff;
            color: #111111;
          }
          #altf-bsl-print .altf-bsl-print-inner { padding: 16px; }
          #altf-bsl-print .altf-bsl-print-title { font-size: 20px; font-weight: 700; margin: 0 0 6px; }
          #altf-bsl-print .altf-bsl-print-meta { font-size: 11px; margin: 0 0 6px; }
          #altf-bsl-print .altf-bsl-print-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 11px;
          }
          #altf-bsl-print .altf-bsl-print-table th,
          #altf-bsl-print .altf-bsl-print-table td {
            border: 1px solid #999999;
            padding: 4px 6px;
            text-align: left;
          }
          #altf-bsl-print .altf-bsl-print-table th { background: #f0f0f0; font-weight: 700; }
          #altf-bsl-print .altf-bsl-print-foot { font-size: 10px; margin-top: 8px; }
          @page { margin: 12mm; }
        }
      `}</style>
    </main>
  );
}
