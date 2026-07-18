"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Copy,
  HeartPulse,
  Info,
  Moon,
  Pencil,
  Plus,
  Printer,
  ShieldCheck,
  Stethoscope,
  Sunrise,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const STORAGE_KEY = "altf:blood-pressure-log:readings";
const NAME_KEY = "altf:blood-pressure-log:name";
const DAY_MS = 24 * 60 * 60 * 1000;

const CATEGORIES = {
  normal: {
    id: "normal",
    label: "Normal",
    short: "Normal",
    rule: "Below 120 and below 80",
    tone: "success",
    advice: "Keep doing what you are doing. Recheck at your usual interval.",
  },
  elevated: {
    id: "elevated",
    label: "Elevated",
    short: "Elevated",
    rule: "120-129 and below 80",
    tone: "info",
    advice:
      "Not hypertension yet, but likely to become it without changes to diet, salt, activity, and sleep.",
  },
  stage1: {
    id: "stage1",
    label: "Stage 1 hypertension",
    short: "Stage 1",
    rule: "130-139 or 80-89",
    tone: "warning",
    advice:
      "Lifestyle changes, and medication if your overall cardiovascular risk is high. Worth a doctor visit.",
  },
  stage2: {
    id: "stage2",
    label: "Stage 2 hypertension",
    short: "Stage 2",
    rule: "140 or higher, or 90 or higher",
    tone: "danger",
    advice: "Usually means medication plus lifestyle changes. See a doctor.",
  },
  crisis: {
    id: "crisis",
    label: "Hypertensive crisis",
    short: "Crisis",
    rule: "180 or higher, and/or 120 or higher",
    tone: "crisis",
    advice: "Recheck after 5 minutes. If it stays this high, get medical help immediately.",
  },
};

const CATEGORY_ORDER = ["normal", "elevated", "stage1", "stage2", "crisis"];

const TONE_COLOR = {
  success: "var(--anslation-ds-success)",
  info: "var(--anslation-ds-info)",
  warning: "var(--anslation-ds-warning)",
  danger: "var(--anslation-ds-danger)",
  crisis: "var(--anslation-ds-danger)",
};

const TONE_SOFT = {
  success: "var(--anslation-ds-success-soft)",
  info: "var(--anslation-ds-info-soft)",
  warning: "var(--anslation-ds-warning-soft)",
  danger: "var(--anslation-ds-danger-soft)",
  crisis: "var(--anslation-ds-danger)",
};

const ARMS = [
  { id: "", label: "Not noted" },
  { id: "left", label: "Left arm" },
  { id: "right", label: "Right arm" },
];

const POSITIONS = [
  { id: "", label: "Not noted" },
  { id: "sitting", label: "Sitting" },
  { id: "standing", label: "Standing" },
  { id: "lying", label: "Lying down" },
];

const EMPTY_FORM = {
  systolic: "120",
  diastolic: "80",
  pulse: "",
  at: "",
  arm: "",
  position: "sitting",
  note: "",
};

const pad2 = (value) => String(value).padStart(2, "0");

const toLocalInput = (date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(
    date.getHours()
  )}:${pad2(date.getMinutes())}`;

const parseLocalInput = (value) => {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(match[4]),
    Number(match[5])
  );
  return Number.isNaN(date.getTime()) ? null : date;
};

const toNum = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
};

const formatNumber = (value, digits = 0) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(Number.isFinite(value) ? value : 0);

function classify(systolic, diastolic) {
  if (!Number.isFinite(systolic) || !Number.isFinite(diastolic)) return null;
  if (systolic >= 180 || diastolic >= 120) return CATEGORIES.crisis;
  if (systolic >= 140 || diastolic >= 90) return CATEGORIES.stage2;
  if (systolic >= 130 || diastolic >= 80) return CATEGORIES.stage1;
  if (systolic >= 120) return CATEGORIES.elevated;
  return CATEGORIES.normal;
}

const average = (values) =>
  values.length === 0 ? null : values.reduce((sum, value) => sum + value, 0) / values.length;

function summarise(readings) {
  if (readings.length === 0) return null;
  return {
    count: readings.length,
    systolic: average(readings.map((item) => item.systolic)),
    diastolic: average(readings.map((item) => item.diastolic)),
    pulse: average(readings.filter((item) => item.pulse !== null).map((item) => item.pulse)),
  };
}

const describeAverage = (summary) =>
  summary ? `${Math.round(summary.systolic)}/${Math.round(summary.diastolic)}` : "—";

function CategoryChip({ category, small = false }) {
  if (!category) return null;
  const isCrisis = category.tone === "crisis";
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${
        small ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      }`}
      style={{
        background: TONE_SOFT[category.tone],
        color: isCrisis ? "var(--anslation-ds-danger-soft)" : TONE_COLOR[category.tone],
      }}
    >
      {small ? category.short : category.label}
    </span>
  );
}

function TrendChart({ readings }) {
  const width = 720;
  const height = 280;
  const padding = { top: 14, right: 14, bottom: 30, left: 42 };

  const geometry = useMemo(() => {
    if (readings.length === 0) return null;
    const values = readings.flatMap((item) => [item.systolic, item.diastolic]);
    const rawMin = Math.min(...values, 70);
    const rawMax = Math.max(...values, 130);
    const yMin = Math.max(0, Math.floor((rawMin - 10) / 10) * 10);
    const yMax = Math.ceil((rawMax + 10) / 10) * 10;
    const times = readings.map((item) => item.time);
    const tMin = Math.min(...times);
    const tMax = Math.max(...times);
    const span = tMax - tMin;
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    const x = (time) =>
      span === 0 ? padding.left + plotWidth / 2 : padding.left + ((time - tMin) / span) * plotWidth;
    const y = (value) =>
      padding.top + plotHeight - ((value - yMin) / (yMax - yMin)) * plotHeight;

    const ticks = [];
    for (let value = yMin; value <= yMax; value += 20) ticks.push(value);

    const points = readings.map((item) => ({
      ...item,
      cx: x(item.time),
      sy: y(item.systolic),
      dy: y(item.diastolic),
    }));

    return {
      points,
      ticks,
      yMin,
      yMax,
      systolicPath: points.map((point) => `${point.cx},${point.sy}`).join(" "),
      diastolicPath: points.map((point) => `${point.cx},${point.dy}`).join(" "),
      guideSystolic: y(120),
      guideDiastolic: y(80),
      showGuides: yMin <= 80 && yMax >= 120,
      firstLabel: new Date(tMin).toLocaleDateString(undefined, { day: "numeric", month: "short" }),
      lastLabel: new Date(tMax).toLocaleDateString(undefined, { day: "numeric", month: "short" }),
    };
  }, [padding.bottom, padding.left, padding.right, padding.top, readings]);

  if (!geometry) return null;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img">
      <title>Systolic and diastolic blood pressure over time</title>
      {geometry.ticks.map((tick) => {
        const ty =
          padding.top +
          (height - padding.top - padding.bottom) -
          ((tick - geometry.yMin) / (geometry.yMax - geometry.yMin)) *
            (height - padding.top - padding.bottom);
        return (
          <g key={tick}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={ty}
              y2={ty}
              stroke="var(--border)"
              strokeWidth="1"
            />
            <text
              x={padding.left - 8}
              y={ty + 4}
              textAnchor="end"
              fontSize="11"
              fill="var(--muted-foreground)"
            >
              {tick}
            </text>
          </g>
        );
      })}

      {geometry.showGuides && (
        <>
          <line
            x1={padding.left}
            x2={width - padding.right}
            y1={geometry.guideSystolic}
            y2={geometry.guideSystolic}
            stroke="var(--anslation-ds-success)"
            strokeWidth="1.5"
            strokeDasharray="5 5"
          />
          <line
            x1={padding.left}
            x2={width - padding.right}
            y1={geometry.guideDiastolic}
            y2={geometry.guideDiastolic}
            stroke="var(--anslation-ds-success)"
            strokeWidth="1.5"
            strokeDasharray="5 5"
          />
          <text
            x={width - padding.right}
            y={geometry.guideSystolic - 5}
            textAnchor="end"
            fontSize="10"
            fill="var(--anslation-ds-success)"
          >
            120 target
          </text>
          <text
            x={width - padding.right}
            y={geometry.guideDiastolic - 5}
            textAnchor="end"
            fontSize="10"
            fill="var(--anslation-ds-success)"
          >
            80 target
          </text>
        </>
      )}

      {geometry.points.length > 1 && (
        <>
          <polyline
            points={geometry.systolicPath}
            fill="none"
            stroke="var(--anslation-ds-danger)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <polyline
            points={geometry.diastolicPath}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </>
      )}

      {geometry.points.map((point) => (
        <g key={point.id}>
          <circle cx={point.cx} cy={point.sy} r="3.5" fill="var(--anslation-ds-danger)" />
          <circle cx={point.cx} cy={point.dy} r="3.5" fill="var(--primary)" />
        </g>
      ))}

      <text
        x={padding.left}
        y={height - 8}
        fontSize="11"
        fill="var(--muted-foreground)"
      >
        {geometry.firstLabel}
      </text>
      <text
        x={width - padding.right}
        y={height - 8}
        textAnchor="end"
        fontSize="11"
        fill="var(--muted-foreground)"
      >
        {geometry.lastLabel}
      </text>
    </svg>
  );
}

export default function ToolHome() {
  const [readings, setReadings] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [nowTs, setNowTs] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const now = new Date();
    setNowTs(now.getTime());
    setForm((previous) => ({ ...previous, at: toLocalInput(now) }));
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setReadings(
            parsed.filter(
              (item) =>
                item &&
                Number.isFinite(item.systolic) &&
                Number.isFinite(item.diastolic) &&
                parseLocalInput(item.at)
            )
          );
        }
      }
      const savedName = window.localStorage.getItem(NAME_KEY);
      if (savedName) setPatientName(savedName);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const persist = (next) => {
    setReadings(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  };

  const persistName = (value) => {
    setPatientName(value);
    try {
      window.localStorage.setItem(NAME_KEY, value);
    } catch {
      /* storage unavailable */
    }
  };

  const setField = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));

  const draft = useMemo(() => {
    const systolic = toNum(form.systolic);
    const diastolic = toNum(form.diastolic);
    const pulse = form.pulse.trim() === "" ? null : toNum(form.pulse);
    const date = parseLocalInput(form.at);
    const errors = [];
    if (systolic === null || systolic < 60 || systolic > 300)
      errors.push("Systolic must be between 60 and 300.");
    if (diastolic === null || diastolic < 30 || diastolic > 200)
      errors.push("Diastolic must be between 30 and 200.");
    if (systolic !== null && diastolic !== null && diastolic >= systolic)
      errors.push("Systolic (the top number) must be higher than diastolic.");
    if (form.pulse.trim() !== "" && (pulse === null || pulse < 20 || pulse > 250))
      errors.push("Pulse must be between 20 and 250, or left blank.");
    if (form.at !== "" && !date) errors.push("Pick a valid date and time.");
    return {
      systolic,
      diastolic,
      pulse,
      date,
      errors,
      canSubmit: errors.length === 0 && Boolean(date),
      category: classify(systolic, diastolic),
    };
  }, [form.at, form.diastolic, form.pulse, form.systolic]);

  const sortedDesc = useMemo(() => {
    return readings
      .map((item) => ({ ...item, time: parseLocalInput(item.at)?.getTime() ?? 0 }))
      .sort((a, b) => b.time - a.time);
  }, [readings]);

  const sortedAsc = useMemo(() => [...sortedDesc].reverse(), [sortedDesc]);

  const latest = sortedDesc[0] || null;
  const latestCategory = latest ? classify(latest.systolic, latest.diastolic) : null;
  const crisisActive =
    draft.category?.id === "crisis" || latestCategory?.id === "crisis";

  const stats = useMemo(() => {
    if (nowTs === null) return null;
    const within = (days) => sortedAsc.filter((item) => nowTs - item.time <= days * DAY_MS);
    const morning = sortedAsc.filter((item) => new Date(item.time).getHours() < 12);
    const evening = sortedAsc.filter((item) => new Date(item.time).getHours() >= 12);
    const counts = CATEGORY_ORDER.reduce((acc, id) => ({ ...acc, [id]: 0 }), {});
    sortedAsc.forEach((item) => {
      const category = classify(item.systolic, item.diastolic);
      if (category) counts[category.id] += 1;
    });
    return {
      week: summarise(within(7)),
      month: summarise(within(30)),
      morning: summarise(morning),
      evening: summarise(evening),
      all: summarise(sortedAsc),
      counts,
      total: sortedAsc.length,
    };
  }, [nowTs, sortedAsc]);

  const submit = () => {
    if (!draft.canSubmit) return;
    const entry = {
      id: editingId || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      systolic: draft.systolic,
      diastolic: draft.diastolic,
      pulse: draft.pulse,
      at: form.at,
      arm: form.arm,
      position: form.position,
      note: form.note.trim().slice(0, 160),
    };
    const next = editingId
      ? readings.map((item) => (item.id === editingId ? entry : item))
      : [...readings, entry];
    persist(next);
    setEditingId(null);
    setForm({ ...EMPTY_FORM, at: toLocalInput(new Date()) });
  };

  const startEdit = (reading) => {
    setEditingId(reading.id);
    setForm({
      systolic: String(reading.systolic),
      diastolic: String(reading.diastolic),
      pulse: reading.pulse === null ? "" : String(reading.pulse),
      at: reading.at,
      arm: reading.arm || "",
      position: reading.position || "",
      note: reading.note || "",
    });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, at: toLocalInput(new Date()) });
  };

  const remove = (id) => {
    persist(readings.filter((item) => item.id !== id));
    if (editingId === id) cancelEdit();
  };

  const clearAll = () => {
    persist([]);
    setConfirmClear(false);
    cancelEdit();
  };

  const exportText = useMemo(() => {
    const lines = ["Blood Pressure Log"];
    if (patientName.trim()) lines.push(`Name: ${patientName.trim()}`);
    lines.push(
      `Generated: ${nowTs === null ? "" : new Date(nowTs).toLocaleString()}`,
      `Readings: ${sortedDesc.length}`,
      ""
    );
    if (stats && stats.total > 0) {
      lines.push(
        "Averages (systolic/diastolic)",
        `  Last 7 days:  ${describeAverage(stats.week)}${stats.week ? ` over ${stats.week.count} readings` : ""}`,
        `  Last 30 days: ${describeAverage(stats.month)}${stats.month ? ` over ${stats.month.count} readings` : ""}`,
        `  Morning (before noon): ${describeAverage(stats.morning)}${
          stats.morning ? ` over ${stats.morning.count} readings` : ""
        }`,
        `  Evening (noon onward): ${describeAverage(stats.evening)}${
          stats.evening ? ` over ${stats.evening.count} readings` : ""
        }`,
        "",
        "Category spread",
        ...CATEGORY_ORDER.filter((id) => stats.counts[id] > 0).map(
          (id) =>
            `  ${CATEGORIES[id].label}: ${stats.counts[id]} (${Math.round(
              (stats.counts[id] / stats.total) * 100
            )}%)`
        ),
        ""
      );
    }
    lines.push("Readings (newest first)");
    sortedDesc.forEach((item) => {
      const date = parseLocalInput(item.at);
      const category = classify(item.systolic, item.diastolic);
      const tags = [item.arm, item.position].filter(Boolean).join(", ");
      lines.push(
        `  ${date ? date.toLocaleString() : item.at} | ${item.systolic}/${item.diastolic} mmHg${
          item.pulse !== null ? ` | pulse ${item.pulse}` : ""
        } | ${category ? category.label : "-"}${tags ? ` | ${tags}` : ""}${
          item.note ? ` | ${item.note}` : ""
        }`
      );
    });
    lines.push(
      "",
      "Categories follow the AHA/ACC 2017 guideline. Home readings support a diagnosis, they do not make one."
    );
    return lines.join("\n");
  }, [nowTs, patientName, sortedDesc, stats]);

  const copyLog = async () => {
    const success = await safeCopyText(exportText);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const printLog = () => {
    setNowTs(Date.now());
    setTimeout(() => window.print(), 0);
  };

  const inputClass =
    "mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]";

  const distribution = stats && stats.total > 0
    ? CATEGORY_ORDER.map((id) => ({
        id,
        category: CATEGORIES[id],
        count: stats.counts[id],
        percent: (stats.counts[id] / stats.total) * 100,
      })).filter((item) => item.count > 0)
    : [];

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #bp-print-area, #bp-print-area * { visibility: visible; }
          #bp-print-area {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            color: black !important;
            font-size: 11pt;
          }
          #bp-print-area * {
            color: black !important;
            border-color: black !important;
            background: transparent !important;
          }
          #bp-print-area table { width: 100%; border-collapse: collapse; }
          #bp-print-area th, #bp-print-area td {
            border: 1px solid black;
            padding: 4px 6px;
            text-align: left;
          }
          #bp-print-area tr { break-inside: avoid; page-break-inside: avoid; }
          @page { margin: 14mm; }
        }
      `}</style>

      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <HeartPulse className="h-4 w-4" />
            AHA/ACC categories
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Blood Pressure Log &amp; Tracker</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Log every reading, see instantly which category it falls into, and watch the trend that
            actually matters. One measurement means little — a month of them, averaged and printed
            for your doctor, means a lot.
          </p>
        </section>

        {crisisActive && (
          <section
            className="mt-6 rounded-lg border-2 p-6"
            style={{
              background: "var(--anslation-ds-danger-soft)",
              borderColor: "var(--anslation-ds-danger)",
            }}
            role="alert"
          >
            <p
              className="flex items-center gap-2 text-xl font-semibold"
              style={{ color: "var(--anslation-ds-danger)" }}
            >
              <TriangleAlert className="h-6 w-6 shrink-0" />
              Hypertensive crisis range — act now
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--foreground)]">
              A reading at or above <strong>180 systolic</strong> and/or{" "}
              <strong>120 diastolic</strong> is a hypertensive crisis. Sit quietly for five minutes
              and take it again. <strong>If it is still that high, get medical help immediately</strong> —
              contact your doctor or go to emergency care without waiting for it to settle.
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--foreground)]">
              Do not wait to re-measure if you also have <strong>chest pain, breathlessness, back
              pain, numbness or weakness, trouble speaking, or a change in vision</strong>. That is a
              medical emergency — call your local emergency number (112 in India, 911 in the US) right
              away.
            </p>
          </section>
        )}

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">
                {editingId ? "Edit reading" : "Add a reading"}
              </h2>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </button>
              )}
            </div>

            <div className="mt-4 grid gap-4">
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm font-semibold">Systolic (top)</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={form.systolic}
                    onChange={(event) => setField("systolic", event.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold">Diastolic (bottom)</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={form.diastolic}
                    onChange={(event) => setField("diastolic", event.target.value)}
                    className={inputClass}
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-semibold">Pulse (optional, bpm)</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={form.pulse}
                  onChange={(event) => setField("pulse", event.target.value)}
                  placeholder="e.g. 72"
                  className={inputClass}
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold">Date and time</span>
                <input
                  type="datetime-local"
                  value={form.at}
                  onChange={(event) => setField("at", event.target.value)}
                  className={inputClass}
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm font-semibold">Arm</span>
                  <select
                    value={form.arm}
                    onChange={(event) => setField("arm", event.target.value)}
                    className={inputClass}
                  >
                    {ARMS.map((item) => (
                      <option key={item.id || "none"} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-semibold">Position</span>
                  <select
                    value={form.position}
                    onChange={(event) => setField("position", event.target.value)}
                    className={inputClass}
                  >
                    {POSITIONS.map((item) => (
                      <option key={item.id || "none"} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-semibold">Note (optional)</span>
                <input
                  type="text"
                  value={form.note}
                  onChange={(event) => setField("note", event.target.value)}
                  placeholder="After coffee, stressful day, new tablet..."
                  maxLength={160}
                  className={inputClass}
                />
              </label>

              <div
                className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4"
                aria-live="polite"
              >
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  This reading is
                </p>
                {draft.category && draft.errors.length === 0 ? (
                  <>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <span className="text-2xl font-semibold">
                        {draft.systolic}/{draft.diastolic}
                      </span>
                      <CategoryChip category={draft.category} />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                      {draft.category.advice}
                    </p>
                  </>
                ) : (
                  <ul className="mt-2 grid gap-1 text-sm text-[var(--muted-foreground)]">
                    {draft.errors.map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                )}
              </div>

              <button
                type="button"
                onClick={submit}
                disabled={!draft.canSubmit}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 font-semibold text-[var(--primary-foreground)] transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                {editingId ? "Update reading" : "Add reading"}
              </button>
            </div>

            <div className="mt-5 rounded-md bg-[var(--muted)] p-4">
              <p className="flex items-start gap-2 text-xs leading-5 text-[var(--muted-foreground)]">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" />
                Your data stays on this device. Readings are saved in your browser only — nothing is
                uploaded, and no one else can see them. Clearing your browser data, or using a
                different device or browser, means starting over, so export the log if it matters.
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <Activity className="h-5 w-5 text-[var(--primary)]" />
                  Trends
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: "var(--anslation-ds-danger)" }}
                    />
                    Systolic
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: "var(--primary)" }}
                    />
                    Diastolic
                  </span>
                </div>
              </div>

              {sortedAsc.length === 0 ? (
                <div className="mt-4 rounded-md border border-dashed border-[var(--border)] bg-[var(--muted)] p-8 text-center">
                  <p className="text-sm font-semibold">No readings yet</p>
                  <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-[var(--muted-foreground)]">
                    Add your first reading on the left — the category badge already updates as you
                    type. Averages and the trend line appear once you have a few, and they are what
                    your doctor will actually want to see.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mt-4 overflow-x-auto">
                    <div className="min-w-[520px]">
                      <TrendChart readings={sortedAsc} />
                    </div>
                  </div>

                  {stats && (
                    <>
                      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                          <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                            Last 7 days
                          </p>
                          <p className="mt-1 text-2xl font-semibold text-[var(--primary)]">
                            {describeAverage(stats.week)}
                          </p>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            {stats.week ? `${stats.week.count} readings` : "No readings"}
                          </p>
                        </div>
                        <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                          <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                            Last 30 days
                          </p>
                          <p className="mt-1 text-2xl font-semibold text-[var(--primary)]">
                            {describeAverage(stats.month)}
                          </p>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            {stats.month ? `${stats.month.count} readings` : "No readings"}
                          </p>
                        </div>
                        <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                            <Sunrise className="h-3.5 w-3.5" />
                            Morning
                          </p>
                          <p className="mt-1 text-2xl font-semibold">
                            {describeAverage(stats.morning)}
                          </p>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            {stats.morning ? `${stats.morning.count} readings` : "No readings"}
                          </p>
                        </div>
                        <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                            <Moon className="h-3.5 w-3.5" />
                            Evening
                          </p>
                          <p className="mt-1 text-2xl font-semibold">
                            {describeAverage(stats.evening)}
                          </p>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            {stats.evening ? `${stats.evening.count} readings` : "No readings"}
                          </p>
                        </div>
                      </div>

                      {stats.morning && stats.evening && (
                        <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
                          Your morning average runs{" "}
                          <span className="font-semibold text-[var(--foreground)]">
                            {formatNumber(Math.abs(stats.morning.systolic - stats.evening.systolic))}{" "}
                            mmHg {stats.morning.systolic >= stats.evening.systolic ? "higher" : "lower"}
                          </span>{" "}
                          than your evening average on the top number. Blood pressure naturally peaks
                          in the hours after waking, so a morning-heavy pattern is common — but a
                          large gap is worth showing your doctor, since morning readings predict
                          cardiovascular risk particularly well.
                        </p>
                      )}

                      {distribution.length > 0 && (
                        <div className="mt-6">
                          <p className="text-sm font-semibold">
                            Where your {stats.total} readings landed
                          </p>
                          <div className="mt-2 flex h-8 overflow-hidden rounded-md border border-[var(--border)]">
                            {distribution.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-center text-xs font-semibold"
                                style={{
                                  width: `${item.percent}%`,
                                  background: TONE_COLOR[item.category.tone],
                                  color:
                                    item.category.tone === "warning"
                                      ? "var(--anslation-ds-warning-soft)"
                                      : item.category.tone === "info"
                                        ? "var(--anslation-ds-info-soft)"
                                        : item.category.tone === "success"
                                          ? "var(--anslation-ds-success-soft)"
                                          : "var(--anslation-ds-danger-soft)",
                                }}
                                title={`${item.category.label}: ${item.count} readings`}
                              >
                                {item.percent >= 12 ? `${Math.round(item.percent)}%` : ""}
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                            {distribution.map((item) => (
                              <span
                                key={item.id}
                                className="inline-flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]"
                              >
                                <span
                                  className="h-2.5 w-2.5 rounded-full"
                                  style={{ background: TONE_COLOR[item.category.tone] }}
                                />
                                {item.category.label} · {item.count} ({Math.round(item.percent)}%)
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">
                  Your readings{sortedDesc.length > 0 ? ` (${sortedDesc.length})` : ""}
                </h2>
                {sortedDesc.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={copyLog}
                      className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                    >
                      <Copy className="h-4 w-4" />
                      {copied ? "Copied" : "Copy for doctor"}
                    </button>
                    <button
                      type="button"
                      onClick={printLog}
                      className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                    >
                      <Printer className="h-4 w-4" />
                      Print
                    </button>
                    {confirmClear ? (
                      <>
                        <button
                          type="button"
                          onClick={clearAll}
                          className="inline-flex min-h-9 items-center gap-1 rounded-md px-3 py-1.5 text-sm font-semibold"
                          style={{
                            background: "var(--anslation-ds-danger)",
                            color: "var(--anslation-ds-danger-soft)",
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete all {sortedDesc.length}?
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmClear(false)}
                          className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                        >
                          Keep
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
                    )}
                  </div>
                )}
              </div>

              {sortedDesc.length > 0 && (
                <label className="mt-4 block max-w-xs">
                  <span className="text-sm font-semibold">Name for the printout (optional)</span>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(event) => persistName(event.target.value)}
                    placeholder="Appears on the printed sheet"
                    maxLength={60}
                    className={inputClass}
                  />
                </label>
              )}

              {sortedDesc.length === 0 ? (
                <p className="mt-4 rounded-md border border-dashed border-[var(--border)] bg-[var(--muted)] p-6 text-center text-sm text-[var(--muted-foreground)]">
                  Nothing logged yet. Your readings will appear here, newest first.
                </p>
              ) : (
                <div className="mt-4 grid gap-3">
                  {sortedDesc.map((item) => {
                    const category = classify(item.systolic, item.diastolic);
                    const date = parseLocalInput(item.at);
                    const tags = [
                      item.arm ? ARMS.find((arm) => arm.id === item.arm)?.label : null,
                      item.position
                        ? POSITIONS.find((position) => position.id === item.position)?.label
                        : null,
                    ].filter(Boolean);
                    return (
                      <div
                        key={item.id}
                        className={`rounded-md border p-4 ${
                          editingId === item.id
                            ? "border-[var(--primary)]"
                            : "border-[var(--border)]"
                        } bg-[var(--background)]`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="text-2xl font-semibold">
                                {item.systolic}/{item.diastolic}
                                <span className="ml-1 text-sm font-medium text-[var(--muted-foreground)]">
                                  mmHg
                                </span>
                              </span>
                              <CategoryChip category={category} small />
                              {item.pulse !== null && (
                                <span className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)]">
                                  <HeartPulse className="h-3.5 w-3.5" />
                                  {item.pulse} bpm
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                              {date
                                ? date.toLocaleString(undefined, {
                                    weekday: "short",
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                    hour: "numeric",
                                    minute: "2-digit",
                                  })
                                : item.at}
                              {tags.length > 0 ? ` · ${tags.join(" · ")}` : ""}
                            </p>
                            {item.note && (
                              <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">
                                {item.note}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(item)}
                              aria-label="Edit reading"
                              className="btn-secondary min-h-9 px-2.5 py-1.5 text-sm"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => remove(item.id)}
                              aria-label="Delete reading"
                              className="btn-secondary min-h-9 px-2.5 py-1.5 text-sm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Info className="h-5 w-5 text-[var(--primary)]" />
                The categories, in full
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                From the 2017 AHA/ACC guideline. Note the word <strong>or</strong>: a reading of
                135/75 is Stage 1 on the top number alone, and 118/92 is Stage 2 on the bottom number
                alone. Whichever number scores worse decides the category.
              </p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[560px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left text-xs uppercase text-[var(--muted-foreground)]">
                      <th className="py-2 pr-3 font-semibold">Category</th>
                      <th className="py-2 pr-3 font-semibold">Systolic / diastolic</th>
                      <th className="py-2 font-semibold">What it usually means</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CATEGORY_ORDER.map((id) => {
                      const category = CATEGORIES[id];
                      const isCurrent = latestCategory?.id === id;
                      return (
                        <tr
                          key={id}
                          className="border-b border-[var(--border)] last:border-b-0"
                          style={isCurrent ? { background: "var(--muted)" } : undefined}
                        >
                          <td className="py-3 pr-3">
                            <CategoryChip category={category} small />
                          </td>
                          <td className="py-3 pr-3 font-semibold">{category.rule}</td>
                          <td className="py-3 text-[var(--muted-foreground)]">{category.advice}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Stethoscope className="h-5 w-5 text-[var(--primary)]" />
                Measure it properly, or the log is noise
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                Bad technique swings a reading by 10-20 mmHg — more than most medication does. These
                are the standard home-monitoring rules.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "Sit still for 5 minutes first",
                    "No talking, no phone, no TV. Walking in and measuring straight away reads high.",
                  ],
                  [
                    "Feet flat, back supported",
                    "Legs uncrossed, back against a chair. Crossed legs alone can add up to 8 mmHg.",
                  ],
                  [
                    "Arm at heart level",
                    "Rest it on a table, cuff on bare skin directly above the elbow crease. An arm hanging down reads high; one held up reads low.",
                  ],
                  [
                    "No caffeine, smoking, or exercise for 30 minutes",
                    "And empty your bladder first — a full one adds around 10 mmHg.",
                  ],
                  [
                    "Take two readings, one minute apart",
                    "Average them, and log the average. The first reading of a session is almost always the highest.",
                  ],
                  [
                    "Same time every day",
                    "Ideally morning before medication and food, and again in the evening. Comparing a random morning to a random evening tells you nothing.",
                  ],
                ].map(([title, body]) => (
                  <div
                    key={title}
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4"
                  >
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div id="bp-print-area" className="hidden">
          <h1 style={{ fontSize: "18pt", fontWeight: 700, marginBottom: "4px" }}>
            Blood Pressure Log
          </h1>
          {patientName.trim() && (
            <p style={{ marginBottom: "2px" }}>Name: {patientName.trim()}</p>
          )}
          <p style={{ marginBottom: "2px" }}>
            Printed: {nowTs === null ? "" : new Date(nowTs).toLocaleString()}
          </p>
          <p style={{ marginBottom: "12px" }}>Total readings: {sortedDesc.length}</p>

          {stats && stats.total > 0 && (
            <>
              <h2 style={{ fontSize: "13pt", fontWeight: 700, margin: "12px 0 6px" }}>
                Averages (systolic/diastolic)
              </h2>
              <table style={{ marginBottom: "12px" }}>
                <thead>
                  <tr>
                    <th>Window</th>
                    <th>Average</th>
                    <th>Readings</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Last 7 days</td>
                    <td>{describeAverage(stats.week)}</td>
                    <td>{stats.week ? stats.week.count : 0}</td>
                  </tr>
                  <tr>
                    <td>Last 30 days</td>
                    <td>{describeAverage(stats.month)}</td>
                    <td>{stats.month ? stats.month.count : 0}</td>
                  </tr>
                  <tr>
                    <td>Morning (before noon)</td>
                    <td>{describeAverage(stats.morning)}</td>
                    <td>{stats.morning ? stats.morning.count : 0}</td>
                  </tr>
                  <tr>
                    <td>Evening (noon onward)</td>
                    <td>{describeAverage(stats.evening)}</td>
                    <td>{stats.evening ? stats.evening.count : 0}</td>
                  </tr>
                  <tr>
                    <td>All readings</td>
                    <td>{describeAverage(stats.all)}</td>
                    <td>{stats.total}</td>
                  </tr>
                </tbody>
              </table>

              <h2 style={{ fontSize: "13pt", fontWeight: 700, margin: "12px 0 6px" }}>
                Category spread
              </h2>
              <table style={{ marginBottom: "12px" }}>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Readings</th>
                    <th>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {distribution.map((item) => (
                    <tr key={item.id}>
                      <td>{item.category.label}</td>
                      <td>{item.count}</td>
                      <td>{Math.round(item.percent)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          <h2 style={{ fontSize: "13pt", fontWeight: 700, margin: "12px 0 6px" }}>
            All readings (newest first)
          </h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Sys</th>
                <th>Dia</th>
                <th>Pulse</th>
                <th>Category</th>
                <th>Arm / position</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {sortedDesc.map((item) => {
                const date = parseLocalInput(item.at);
                const category = classify(item.systolic, item.diastolic);
                return (
                  <tr key={item.id}>
                    <td>{date ? date.toLocaleDateString() : item.at}</td>
                    <td>
                      {date
                        ? date.toLocaleTimeString(undefined, {
                            hour: "numeric",
                            minute: "2-digit",
                          })
                        : ""}
                    </td>
                    <td>{item.systolic}</td>
                    <td>{item.diastolic}</td>
                    <td>{item.pulse === null ? "" : item.pulse}</td>
                    <td>{category ? category.label : ""}</td>
                    <td>{[item.arm, item.position].filter(Boolean).join(" / ")}</td>
                    <td>{item.note}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p style={{ marginTop: "12px", fontSize: "9pt" }}>
            Self-recorded home readings, categorised by the 2017 AHA/ACC guideline. Generated by
            ALTFTool Blood Pressure Log. Not a diagnosis.
          </p>
        </div>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-5">
          <p className="flex items-start gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
            <Stethoscope className="mt-1 h-4 w-4 shrink-0" />
            This log is for awareness and record-keeping, not medical advice. It cannot diagnose
            hypertension, and it will never tell you to start, stop, or change a medication — only a
            doctor can, using these readings alongside your history and examination. If a reading
            alarms you, or you feel unwell, seek medical care rather than logging it and waiting.
          </p>
        </section>
      </div>
    </main>
  );
}
