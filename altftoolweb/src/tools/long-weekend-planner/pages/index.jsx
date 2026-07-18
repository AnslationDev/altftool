"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarRange,
  Check,
  Copy,
  FileDown,
  Info,
  ListChecks,
  Plus,
  Sparkles,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";
import { HOLIDAYS, MONTH_NAMES, WEEKDAY_SHORT, YEARS } from "../data";

const CUSTOM_KEY = "altf:long-weekend-planner:custom";
const MAX_LEAVES = 4;
const MIN_LEVERAGE = 2;

const pad = (value) => String(value).padStart(2, "0");
const toKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const parseKey = (key) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const shortDate = (date) => `${WEEKDAY_SHORT[date.getDay()]} ${date.getDate()} ${MONTH_NAMES[date.getMonth()].slice(0, 3)}`;
const longDate = (date) =>
  `${WEEKDAY_SHORT[date.getDay()]}, ${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;

function buildYear(year, holidays, weekendMode) {
  const map = new Map();
  holidays.forEach((item) => {
    if (!map.has(item.date)) map.set(item.date, []);
    map.get(item.date).push(item);
  });
  const days = [];
  const cursor = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  while (cursor <= end) {
    const key = toKey(cursor);
    const dow = cursor.getDay();
    const isWeekend = weekendMode === "sat-sun" ? dow === 0 || dow === 6 : dow === 0;
    const dayHolidays = map.get(key) || [];
    days.push({
      key,
      date: new Date(cursor),
      dow,
      isWeekend,
      holidays: dayHolidays,
      isHoliday: dayHolidays.length > 0,
      off: isWeekend || dayHolidays.length > 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

function findCandidates(days) {
  const n = days.length;
  const out = [];
  const workPrefix = [0];
  const holidayPrefix = [0];
  for (let i = 0; i < n; i += 1) {
    workPrefix.push(workPrefix[i] + (days[i].off ? 0 : 1));
    holidayPrefix.push(holidayPrefix[i] + (days[i].isHoliday ? 1 : 0));
  }
  const workCount = (s, e) => workPrefix[e + 1] - workPrefix[s];
  const holidayCount = (s, e) => holidayPrefix[e + 1] - holidayPrefix[s];

  for (let s = 0; s < n; s += 1) {
    if (s > 0 && days[s - 1].off) continue;
    for (let e = s; e < n; e += 1) {
      const leaves = workCount(s, e);
      if (leaves > MAX_LEAVES) break;
      if (e < n - 1 && days[e + 1].off) continue;
      const total = e - s + 1;
      if (total < 3) continue;
      if (holidayCount(s, e) === 0) continue;
      if (leaves === 0) {
        out.push({ s, e, leaves, total });
        continue;
      }
      if (total < 4) continue;
      if (total / leaves < MIN_LEVERAGE) continue;
      out.push({ s, e, leaves, total });
    }
  }
  return out;
}

function longestNaturalRun(days, s, e) {
  let best = 0;
  let current = 0;
  for (let i = s; i <= e; i += 1) {
    if (days[i].off) {
      current += 1;
      if (current > best) best = current;
    } else {
      current = 0;
    }
  }
  return best;
}

function clusterBridges(bridges) {
  const sorted = [...bridges].sort((a, b) => a.s - b.s || a.e - b.e);
  const clusters = [];
  let current = null;
  sorted.forEach((bridge) => {
    if (current && bridge.s <= current.e) {
      current.variants.push(bridge);
      current.e = Math.max(current.e, bridge.e);
      current.s = Math.min(current.s, bridge.s);
    } else {
      current = { s: bridge.s, e: bridge.e, variants: [bridge] };
      clusters.push(current);
    }
  });
  clusters.forEach((cluster) => {
    const byLeaves = new Map();
    cluster.variants.forEach((variant) => {
      const previous = byLeaves.get(variant.leaves);
      if (!previous || variant.total > previous.total) byLeaves.set(variant.leaves, variant);
    });
    cluster.variants = [...byLeaves.values()].sort((a, b) => a.leaves - b.leaves);
    cluster.primary = [...cluster.variants].sort(
      (a, b) => b.total / b.leaves - a.total / a.leaves || b.total - a.total
    )[0];
  });
  return clusters;
}

function optimize(clusters, budget) {
  const n = clusters.length;
  const cap = Math.max(0, Math.min(60, budget));
  const dp = Array.from({ length: n + 1 }, () => new Array(cap + 1).fill(0));
  const choice = Array.from({ length: n + 1 }, () => new Array(cap + 1).fill(null));
  for (let i = n - 1; i >= 0; i -= 1) {
    for (let b = 0; b <= cap; b += 1) {
      let best = dp[i + 1][b];
      let bestChoice = null;
      cluster: for (const variant of clusters[i].variants) {
        if (variant.leaves > b) continue cluster;
        const value = variant.total + dp[i + 1][b - variant.leaves];
        if (value > best) {
          best = value;
          bestChoice = variant;
        }
      }
      dp[i][b] = best;
      choice[i][b] = bestChoice;
    }
  }
  const picked = [];
  let remaining = cap;
  for (let i = 0; i < n; i += 1) {
    const chosen = choice[i][remaining];
    if (chosen) {
      picked.push(chosen);
      remaining -= chosen.leaves;
    }
  }
  return { picked, totalDays: dp[0][cap], leavesUsed: cap - remaining };
}

function describe(days, block) {
  const slice = days.slice(block.s, block.e + 1);
  const leaveDays = slice.filter((day) => !day.off);
  const holidayNames = [...new Set(slice.flatMap((day) => day.holidays.map((item) => item.name)))];
  const hasApproxHoliday = slice.some((day) => day.holidays.some((item) => item.lunar && !item.custom));
  return {
    slice,
    leaveDays,
    holidayNames,
    hasApproxHoliday,
    start: slice[0].date,
    end: slice[slice.length - 1].date,
    gain: block.total - longestNaturalRun(days, block.s, block.e),
    leverage: block.leaves > 0 ? block.total / block.leaves : Infinity,
  };
}

function DayStrip({ days, block }) {
  const slice = days.slice(block.s, block.e + 1);
  return (
    <div className="flex flex-wrap gap-1.5">
      {slice.map((day) => {
        const isLeave = !day.off;
        const style = isLeave
          ? {
              borderColor: "var(--anslation-ds-success)",
              color: "var(--anslation-ds-success)",
              borderStyle: "dashed",
            }
          : undefined;
        const className = day.isHoliday
          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
          : isLeave
            ? "bg-[var(--background)]"
            : "border-[var(--border)] bg-[var(--muted)] text-[var(--muted-foreground)]";
        return (
          <div
            key={day.key}
            style={style}
            className={`flex h-14 w-11 shrink-0 flex-col items-center justify-center rounded-md border-2 ${className}`}
            title={
              day.isHoliday
                ? day.holidays.map((item) => item.name).join(", ")
                : isLeave
                  ? "Apply for leave"
                  : "Weekend"
            }
          >
            <span className="text-[10px] font-semibold uppercase opacity-80">{WEEKDAY_SHORT[day.dow]}</span>
            <span className="text-sm font-semibold leading-tight">{day.date.getDate()}</span>
            <span className="text-[9px] uppercase opacity-70">
              {MONTH_NAMES[day.date.getMonth()].slice(0, 3)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--muted-foreground)]">
      <span className="inline-flex items-center gap-1.5">
        <span className="h-3.5 w-3.5 rounded border-2 border-[var(--primary)] bg-[var(--primary)]" />
        Holiday
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span
          className="h-3.5 w-3.5 rounded border-2 border-dashed bg-[var(--background)]"
          style={{ borderColor: "var(--anslation-ds-success)" }}
        />
        Leave you apply for
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-3.5 w-3.5 rounded border-2 border-[var(--border)] bg-[var(--muted)]" />
        Weekend
      </span>
    </div>
  );
}

function OpportunityCard({ days, block, variants, picked, rank }) {
  const info = describe(days, block);
  return (
    <div
      className={`rounded-lg border p-5 ${
        picked ? "border-[var(--primary)] bg-[var(--muted)]" : "border-[var(--border)] bg-[var(--background)]"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {rank && (
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary)] text-[10px] font-semibold text-[var(--primary-foreground)]">
                {rank}
              </span>
            )}
            <p className="text-sm font-semibold">
              {shortDate(info.start)} &rarr; {shortDate(info.end)}
            </p>
            {picked && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--primary)] px-2 py-0.5 text-[10px] font-semibold text-[var(--primary-foreground)]">
                <Check className="h-3 w-3" />
                In your plan
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            {info.holidayNames.join(" · ")}
            {info.hasApproxHoliday && " ≈"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold text-[var(--primary)]">{block.total} days off</p>
          <p className="text-xs text-[var(--muted-foreground)]">
            {block.leaves === 0 ? "0 leaves — free" : `${block.leaves} leave${block.leaves > 1 ? "s" : ""} · ${info.leverage.toFixed(1)}×`}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <DayStrip days={days} block={block} />
      </div>

      {block.leaves > 0 ? (
        <div className="mt-4 rounded-md border border-[var(--border)] bg-[var(--card)] p-3">
          <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Apply leave for</p>
          <p className="mt-1 text-sm font-semibold" style={{ color: "var(--anslation-ds-success)" }}>
            {info.leaveDays.map((day) => longDate(day.date)).join(" · ")}
          </p>
          <p className="mt-1.5 text-xs leading-5 text-[var(--muted-foreground)]">
            Buys you {info.gain} extra consecutive day{info.gain === 1 ? "" : "s"} on top of the{" "}
            {block.total - info.gain}-day break you already had here.
          </p>
        </div>
      ) : (
        <p className="mt-4 rounded-md bg-[var(--card)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
          Free — the holiday already lands next to the weekend. Apply for nothing, just book the trip.
        </p>
      )}

      {variants && variants.length > 1 && (
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          Stretch it:{" "}
          {variants.map((variant, index) => (
            <span key={variant.leaves}>
              {index > 0 && " · "}
              <span className="font-semibold text-[var(--foreground)]">
                {variant.leaves} leave{variant.leaves > 1 ? "s" : ""} &rarr; {variant.total} days
              </span>
            </span>
          ))}
        </p>
      )}
    </div>
  );
}

export default function ToolHome() {
  const currentYear = new Date().getFullYear();
  const defaultYear = YEARS.includes(currentYear) ? currentYear : YEARS[Math.floor(YEARS.length / 2)];

  const [year, setYear] = useState(defaultYear);
  const [weekendMode, setWeekendMode] = useState("sat-sun");
  const [budget, setBudget] = useState(6);
  const [customHolidays, setCustomHolidays] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDate, setNewDate] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(CUSTOM_KEY) || "[]");
      if (Array.isArray(stored)) {
        setCustomHolidays(
          stored.filter((item) => item && typeof item.name === "string" && /^\d{4}-\d{2}-\d{2}$/.test(item.date))
        );
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(CUSTOM_KEY, JSON.stringify(customHolidays));
    } catch {
      /* ignore */
    }
  }, [customHolidays, hydrated]);

  const allHolidays = useMemo(() => {
    const base = HOLIDAYS[year] || [];
    const custom = customHolidays
      .filter((item) => item.date.startsWith(`${year}-`))
      .map((item) => ({ ...item, custom: true, lunar: false }));
    return [...base, ...custom].sort((a, b) => a.date.localeCompare(b.date));
  }, [year, customHolidays]);

  const days = useMemo(() => buildYear(year, allHolidays, weekendMode), [year, allHolidays, weekendMode]);

  const { free, clusters } = useMemo(() => {
    const candidates = findCandidates(days);
    return {
      free: candidates.filter((item) => item.leaves === 0),
      clusters: clusterBridges(candidates.filter((item) => item.leaves >= 1)),
    };
  }, [days]);

  const ranked = useMemo(
    () =>
      [...clusters]
        .map((cluster) => cluster.primary)
        .sort((a, b) => b.total / b.leaves - a.total / a.leaves || b.total - a.total),
    [clusters]
  );

  const plan = useMemo(() => optimize(clusters, Number(budget) || 0), [clusters, budget]);

  const pickedKeys = useMemo(() => new Set(plan.picked.map((item) => `${item.s}-${item.e}`)), [plan]);

  const stats = useMemo(() => {
    const byDate = new Map();
    allHolidays.forEach((item) => {
      if (!byDate.has(item.date)) byDate.set(item.date, []);
      byDate.get(item.date).push(item);
    });
    const isOffWeekday = (key) => {
      const date = parseKey(key);
      const dow = date.getDay();
      return weekendMode === "sat-sun" ? dow !== 0 && dow !== 6 : dow !== 0;
    };
    const onWeekend = allHolidays.filter((item) => !isOffWeekday(item.date));
    const clashes = [...byDate.entries()].filter(([, list]) => list.length > 1);
    const effective = [...byDate.keys()].filter(isOffWeekday).length;

    const monthCounts = new Array(12).fill(0);
    [...free, ...clusters.map((cluster) => cluster.primary)].forEach((block) => {
      monthCounts[days[block.s].date.getMonth()] += 1;
    });
    const bestMonths = monthCounts
      .map((count, index) => ({ month: MONTH_NAMES[index], count }))
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    return {
      total: allHolidays.length,
      onWeekend,
      clashes,
      effective,
      wasted: allHolidays.length - effective,
      bestMonths,
    };
  }, [allHolidays, weekendMode, free, clusters, days]);

  const addCustom = () => {
    const name = newName.trim();
    if (!name || !/^\d{4}-\d{2}-\d{2}$/.test(newDate)) return;
    setCustomHolidays((previous) => {
      if (previous.some((item) => item.date === newDate && item.name === name)) return previous;
      return [...previous, { id: `${newDate}-${name}`, name, date: newDate }].sort((a, b) =>
        a.date.localeCompare(b.date)
      );
    });
    setNewName("");
    setNewDate("");
  };

  const report = useMemo(() => {
    const lines = [
      `Long Weekend Plan — ${year}`,
      `Week pattern: ${weekendMode === "sat-sun" ? "5-day week (Sat + Sun off)" : "6-day week (Sun off only)"}`,
      "",
      `HEADLINE: take ${plan.leavesUsed} leave${plan.leavesUsed === 1 ? "" : "s"} → get ${plan.totalDays} days off across ${plan.picked.length} break${plan.picked.length === 1 ? "" : "s"}.`,
      "",
      "YOUR OPTIMISED PLAN",
    ];
    if (plan.picked.length === 0) {
      lines.push("  Nothing selected — raise your leave budget above 0.");
    } else {
      plan.picked.forEach((block, index) => {
        const info = describe(days, block);
        lines.push(
          `  ${index + 1}. ${longDate(info.start)} → ${longDate(info.end)}  (${block.total} days off for ${block.leaves} leave${block.leaves === 1 ? "" : "s"})`
        );
        lines.push(`     Holiday: ${info.holidayNames.join(", ")}`);
        lines.push(`     Apply leave for: ${info.leaveDays.map((day) => longDate(day.date)).join(", ")}`);
      });
    }

    lines.push("", "FREE LONG WEEKENDS (no leave needed)");
    if (free.length === 0) {
      lines.push("  None this year — every holiday needs a bridge day.");
    } else {
      free.forEach((block) => {
        const info = describe(days, block);
        lines.push(
          `  ${longDate(info.start)} → ${longDate(info.end)}  (${block.total} days) — ${info.holidayNames.join(", ")}`
        );
      });
    }

    lines.push("", `YEAR OVERVIEW`);
    lines.push(`  Holidays listed: ${stats.total}`);
    lines.push(
      `  Lost to weekends: ${stats.onWeekend.length}${stats.onWeekend.length ? ` (${stats.onWeekend.map((item) => item.name).join(", ")})` : ""}`
    );
    if (stats.clashes.length > 0) {
      lines.push(
        `  Two holidays on one date: ${stats.clashes.map(([date, list]) => `${date} — ${list.map((item) => item.name).join(" + ")}`).join("; ")}`
      );
    }
    lines.push(`  Actually usable weekday holidays: ${stats.effective}`);
    lines.push(`  Free long weekends: ${free.length} · Bridge opportunities: ${clusters.length}`);
    if (stats.bestMonths.length > 0) {
      lines.push(`  Best months: ${stats.bestMonths.map((item) => `${item.month} (${item.count})`).join(", ")}`);
    }

    lines.push(
      "",
      "Note: dates marked ≈ follow the lunar calendar (Eid, Diwali, Holi, Dussehra and similar) and are",
      "declared by moon sighting or panchang, so they can shift by a day. Confirm against your company",
      "holiday list before you apply for leave.",
      "",
      `Generated: ${new Date().toLocaleString()}`
    );
    return lines.join("\n");
  }, [year, weekendMode, plan, days, free, clusters.length, stats]);

  const copyPlan = async () => {
    const success = await safeCopyText(report);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const downloadPlan = () => {
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `long-weekend-plan-${year}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const yearCustom = customHolidays.filter((item) => item.date.startsWith(`${year}-`));

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <CalendarRange className="h-4 w-4" />
            Leave planning
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Long Weekend Planner</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Your leave balance is finite. The calendar is not fair. This finds every holiday that already touches a
            weekend, every bridge day worth burning a leave on, and the exact combination that turns a handful of
            leaves into weeks off.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="grid gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="mb-3 text-sm font-semibold">Year</h2>
              <div className="flex flex-wrap gap-2">
                {YEARS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setYear(item)}
                    aria-pressed={year === item}
                    className={`h-11 flex-1 rounded-md border text-sm font-semibold transition ${
                      year === item
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <h3 className="mb-2 mt-5 text-sm font-semibold">Your work week</h3>
              <div className="grid gap-2">
                {[
                  { id: "sat-sun", label: "5-day week", hint: "Saturday and Sunday off" },
                  { id: "sun-only", label: "6-day week", hint: "Only Sunday off — Saturdays are working" },
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setWeekendMode(option.id)}
                    aria-pressed={weekendMode === option.id}
                    className={`rounded-md border px-3 py-2.5 text-left transition ${
                      weekendMode === option.id
                        ? "border-[var(--primary)] bg-[var(--muted)]"
                        : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
                    }`}
                  >
                    <span className="text-sm font-semibold">{option.label}</span>
                    <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">{option.hint}</span>
                  </button>
                ))}
              </div>

              <label className="mt-5 block">
                <span className="text-sm font-semibold">Leaves you can spend</span>
                <input
                  type="number"
                  value={budget}
                  min={0}
                  max={60}
                  onChange={(event) => setBudget(Math.max(0, Math.min(60, Number(event.target.value))))}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
                <span className="mt-1.5 block text-xs text-[var(--muted-foreground)]">
                  How many annual leaves you are willing to put into long weekends.
                </span>
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {[3, 6, 10, 15].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setBudget(preset)}
                    className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                  >
                    {preset} leaves
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="text-sm font-semibold">Your own holidays</h2>
              <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                The list here is the central gazetted set. Add your state holidays, company shutdowns, or that
                regional festival your office actually closes for. Saved in this browser.
              </p>
              <div className="mt-3 grid gap-2">
                <label className="block">
                  <span className="text-xs font-semibold">Holiday name</span>
                  <input
                    type="text"
                    value={newName}
                    onChange={(event) => setNewName(event.target.value)}
                    placeholder="Pongal, company day, founders day..."
                    className="mt-1.5 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold">Date</span>
                  <input
                    type="date"
                    value={newDate}
                    min={`${YEARS[0]}-01-01`}
                    max={`${YEARS[YEARS.length - 1]}-12-31`}
                    onChange={(event) => setNewDate(event.target.value)}
                    className="mt-1.5 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                </label>
                <button
                  type="button"
                  onClick={addCustom}
                  disabled={!newName.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(newDate)}
                  className="inline-flex h-11 items-center justify-center gap-1.5 rounded-md bg-[var(--primary)] text-sm font-semibold text-[var(--primary-foreground)] transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  Add holiday
                </button>
              </div>

              {yearCustom.length > 0 && (
                <div className="mt-4 grid gap-2">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    Added for {year}
                  </p>
                  {yearCustom.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{item.name}</span>
                        <span className="block text-xs text-[var(--muted-foreground)]">
                          {longDate(parseKey(item.date))}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setCustomHolidays((previous) => previous.filter((h) => h.id !== item.id))}
                        aria-label={`Remove ${item.name}`}
                        className="shrink-0 rounded-md border border-[var(--border)] p-2 text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="mb-3 text-sm font-semibold">{year} holiday list</h2>
              <div className="grid gap-1.5">
                {allHolidays.map((item, index) => {
                  const date = parseKey(item.date);
                  const dow = date.getDay();
                  const lost = weekendMode === "sat-sun" ? dow === 0 || dow === 6 : dow === 0;
                  return (
                    <div
                      key={`${item.date}-${item.name}-${index}`}
                      className="flex items-center justify-between gap-2 text-xs"
                    >
                      <span className="min-w-0 truncate">
                        {item.name}
                        {item.lunar && year >= currentYear && (
                          <span className="text-[var(--muted-foreground)]" title="Lunar calendar — date may shift">
                            {" "}
                            ≈
                          </span>
                        )}
                        {item.custom && <span className="text-[var(--primary)]"> · yours</span>}
                      </span>
                      <span
                        className={`shrink-0 font-semibold ${
                          lost ? "text-[var(--muted-foreground)] line-through" : ""
                        }`}
                      >
                        {shortDate(date)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                Struck-through dates land on a weekend &mdash; they cost you a holiday and give you nothing.
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    The whole point
                  </p>
                  <p className="mt-2 text-4xl font-semibold leading-tight" aria-live="polite">
                    Take{" "}
                    <span className="text-[var(--primary)]">
                      {plan.leavesUsed} leave{plan.leavesUsed === 1 ? "" : "s"}
                    </span>{" "}
                    &rarr; get{" "}
                    <span className="text-[var(--primary)]">{plan.totalDays} days off</span>
                  </p>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                    Across {plan.picked.length} break{plan.picked.length === 1 ? "" : "s"} in {year}
                    {plan.leavesUsed > 0 && ` · ${(plan.totalDays / plan.leavesUsed).toFixed(1)}× return on every leave`}
                    {free.length > 0 && ` · plus ${free.length} free long weekend${free.length === 1 ? "" : "s"} that cost nothing`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={copyPlan} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                    <Copy className="h-4 w-4" />
                    {copied ? "Copied" : "Copy plan"}
                  </button>
                  <button type="button" onClick={downloadPlan} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                    <FileDown className="h-4 w-4" />
                    Download
                  </button>
                </div>
              </div>
              <div className="mt-5">
                <Legend />
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-[var(--primary)]" />
                <h2 className="text-sm font-semibold">
                  Your optimised plan &mdash; {budget} leave{Number(budget) === 1 ? "" : "s"} budget
                </h2>
              </div>
              <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                Not a greedy guess &mdash; this checks every combination of non-overlapping breaks and returns the one
                that maximises total days off within your budget.
              </p>
              {plan.picked.length === 0 ? (
                <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-4 text-sm text-[var(--muted-foreground)]">
                  {clusters.length === 0
                    ? "No bridge opportunities this year with this work pattern."
                    : "Set a leave budget above zero to see the best combination."}
                </p>
              ) : (
                <div className="mt-4 grid gap-4">
                  {plan.picked.map((block, index) => (
                    <OpportunityCard
                      key={`${block.s}-${block.e}`}
                      days={days}
                      block={block}
                      picked
                      rank={index + 1}
                    />
                  ))}
                </div>
              )}
            </div>

            {free.length > 0 && (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[var(--primary)]" />
                  <h2 className="text-sm font-semibold">Free long weekends &mdash; {free.length} this year</h2>
                </div>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  The holiday already falls next to the weekend. Zero leaves, zero effort, zero excuses.
                </p>
                <div className="mt-4 grid gap-4">
                  {free.map((block) => (
                    <OpportunityCard key={`free-${block.s}-${block.e}`} days={days} block={block} />
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center gap-2">
                <CalendarRange className="h-4 w-4 text-[var(--primary)]" />
                <h2 className="text-sm font-semibold">
                  Every bridge opportunity in {year} &mdash; best leverage first
                </h2>
              </div>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Ranked by days off per leave burned. A 4× means one leave buys you a four-day break.
              </p>
              {ranked.length === 0 ? (
                <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-4 text-sm text-[var(--muted-foreground)]">
                  No bridge opportunities found for this work pattern.
                </p>
              ) : (
                <div className="mt-4 grid gap-4">
                  {ranked.map((block) => {
                    const cluster = clusters.find((item) => item.primary === block);
                    return (
                      <OpportunityCard
                        key={`bridge-${block.s}-${block.e}`}
                        days={days}
                        block={block}
                        variants={cluster?.variants}
                        picked={pickedKeys.has(`${block.s}-${block.e}`)}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="text-sm font-semibold">{year} at a glance</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Holidays listed", stats.total, "central gazetted + yours"],
                  ["Actually usable", stats.effective, "land on a working day"],
                  ["Free long weekends", free.length, "no leave needed"],
                  ["Bridge opportunities", clusters.length, "worth 1-4 leaves"],
                ].map(([label, value, hint]) => (
                  <div key={label} className="rounded-md bg-[var(--muted)] p-4">
                    <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
                    <p className="mt-1 text-3xl font-semibold text-[var(--primary)]">{value}</p>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">{hint}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-start gap-2 rounded-md border p-4" style={{ borderColor: "var(--anslation-ds-danger)" }}>
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--anslation-ds-danger)" }} />
                <div>
                  <p className="text-sm font-semibold">
                    The annual tragedy: {stats.wasted} holiday{stats.wasted === 1 ? "" : "s"} wasted in {year}
                  </p>
                  {stats.onWeekend.length > 0 && (
                    <p className="mt-1.5 text-xs leading-5 text-[var(--muted-foreground)]">
                      <span className="font-semibold text-[var(--foreground)]">
                        Lost to the weekend ({stats.onWeekend.length}):
                      </span>{" "}
                      {stats.onWeekend
                        .map((item) => `${item.name} — ${shortDate(parseKey(item.date))}`)
                        .join(" · ")}
                      . You were already off. The calendar gave you nothing.
                    </p>
                  )}
                  {stats.clashes.length > 0 && (
                    <p className="mt-1.5 text-xs leading-5 text-[var(--muted-foreground)]">
                      <span className="font-semibold text-[var(--foreground)]">Two holidays, one date:</span>{" "}
                      {stats.clashes
                        .map(([date, list]) => `${list.map((item) => item.name).join(" + ")} both on ${shortDate(parseKey(date))}`)
                        .join(" · ")}
                      . Two holidays, one day off.
                    </p>
                  )}
                  {stats.wasted === 0 && (
                    <p className="mt-1.5 text-xs leading-5 text-[var(--muted-foreground)]">
                      Nothing wasted this year. Every single holiday lands on a working day. Enjoy it, this is rare.
                    </p>
                  )}
                </div>
              </div>

              {stats.bestMonths.length > 0 && (
                <div className="mt-4 rounded-md bg-[var(--muted)] p-4">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Best months</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {stats.bestMonths.map((item) => (
                      <span
                        key={item.month}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-[var(--primary)]"
                      >
                        {item.month}
                        <span className="text-[var(--muted-foreground)]">
                          {item.count} {item.count === 1 ? "chance" : "chances"}
                        </span>
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                    Where the opportunities cluster. Get your leave request in before your team does.
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)] p-5">
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
                <p className="text-xs leading-5 text-[var(--muted-foreground)]">
                  <span className="font-semibold text-[var(--foreground)]">About these dates.</span> The bundled list
                  is the central government gazetted set &mdash; your state, company, or sector will differ, which is
                  what the custom holiday box is for. Dates marked{" "}
                  <span className="font-semibold text-[var(--foreground)]">≈</span> follow the lunar calendar (Eid,
                  Diwali, Holi, Dussehra, Muharram and similar): they are declared by moon sighting or panchang and
                  can move by a day, so treat future years as close approximations rather than gospel. Fixed-date
                  holidays (Republic Day, Independence Day, Gandhi Jayanti, Christmas) and Good Friday are exact.
                  Always check the official calendar before you book anything non-refundable.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
