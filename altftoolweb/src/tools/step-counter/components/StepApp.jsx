"use client";

/**
 * StepApp — app-style Step Counter experience for ALL screen sizes.
 *
 * ⚠️ CUSTOM APP THEME (product decision for this tool):
 * this screen replicates a specific mobile-app reference design (indigo/violet
 * gradient) and therefore does NOT use the ALTFTool semantic tokens from
 * master.md. It uses its own "--sc-*" tokens (globals.css) which include a
 * light AND a dark variant, switched by the site's [data-theme="dark"]
 * attribute — so content stays fully readable in both site themes. Phones get
 * the compact app layout; desktop gets the same design scaled into a wider
 * dashboard grid.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Flame,
  Footprints,
  History as HistoryIcon,
  Home as HomeIcon,
  Lock,
  MapPin,
  Menu,
  Pause,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Star,
  TrendingUp,
  Trophy,
  User,
  X,
} from "lucide-react";
import {
  ACHIEVEMENTS,
  MAX_GOAL,
  MIN_GOAL,
  caloriesBurned,
  distanceKm,
  estimateFloors,
  formatActiveTime,
  formatNumber,
  timeAgo,
} from "../utils/stepStore";

/* ------------------------------- app palette -------------------------------
   Backed by the "--sc-*" tokens in globals.css, which carry BOTH a light and
   a dark variant (switched by the site's [data-theme="dark"] attribute), so
   every part of this UI stays readable in either theme. Gradients and the
   vivid brand hues are shared across both modes. */

const C = {
  bg: "var(--sc-bg)",
  card: "var(--sc-card)",
  tile: "var(--sc-tile)",
  ink: "var(--sc-ink)",
  muted: "var(--sc-muted)",
  faint: "var(--sc-faint)",
  indigo: "var(--sc-indigo)",
  violet: "var(--sc-violet)",
  // Literal hexes: SVG gradient stops + filled buttons keep the vivid brand
  // colours in both themes (white text stays AA-readable on them).
  stopBlue: "#60A5FA",
  stopViolet: "#8B5CF6",
  indigoFill: "#6366F1",
  grad: "linear-gradient(135deg, #6D7BF7 0%, #8B5CF6 100%)",
  gradBar: "linear-gradient(180deg, #6366F1 0%, #A5B4FC 100%)",
  green: "var(--sc-green)",
  greenSoft: "var(--sc-soft-green)",
  orange: "var(--sc-orange)",
  orangeSoft: "var(--sc-soft-orange)",
  indigoSoft: "var(--sc-soft-indigo)",
  violetSoft: "var(--sc-soft-violet)",
  danger: "var(--sc-danger)",
  dangerSoft: "var(--sc-soft-danger)",
  navy: "var(--sc-navy)",
  navyText: "var(--sc-navy-text)",
  border: "var(--sc-border)",
  ringTrack: "var(--sc-ring-track)",
  shadow: "var(--sc-shadow)",
  navShadow: "var(--sc-nav-shadow)",
};

// Shared with the companion sections (Explore tools / FAQ / About) so the
// whole tool page reads as ONE designed product.
export const THEME = C;

const NAME_KEY = "ALTFT_STEP_COUNTER_NAME";

/* ---------------------------------- helpers ---------------------------------- */

function useNow() {
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

function greetingFor(now) {
  const h = now ? now.getHours() : 9;
  if (h < 12) return "Good Morning,";
  if (h < 17) return "Good Afternoon,";
  return "Good Evening,";
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* -------------------------------- analog clock -------------------------------- */

function AnalogClock({ now }) {
  const h = now ? now.getHours() : 9;
  const m = now ? now.getMinutes() : 41;
  const s = now ? now.getSeconds() : 0;
  const hourAngle = ((h % 12) + m / 60) * 30;
  const minAngle = (m + s / 60) * 6;
  const h12 = ((h + 11) % 12) + 1;
  const ampm = h < 12 ? "AM" : "PM";
  const timeStr = `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  const dateStr = now ? `${now.getDate()} ${MONTHS[now.getMonth()]}, ${DAYS[now.getDay()]}` : "";

  return (
    <div
      className="relative h-[104px] w-[104px] shrink-0 rounded-full"
      style={{ backgroundColor: C.card, boxShadow: C.shadow }}
      aria-label={now ? `Current time ${timeStr} ${ampm}` : "Clock"}
    >
      <svg viewBox="0 0 104 104" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="altft-msc-clock" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={C.stopBlue} />
            <stop offset="100%" stopColor={C.stopViolet} />
          </linearGradient>
        </defs>
        {/* gradient arc around the face */}
        <circle
          cx="52"
          cy="52"
          r="48"
          fill="none"
          stroke="url(#altft-msc-clock)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * 48}
          strokeDashoffset={2 * Math.PI * 48 * 0.28}
          transform="rotate(-115 52 52)"
        />
        {/* hands — pivot sits above centre so they never cross the digital time.
            Colours go through style (not attrs) so CSS variables resolve. */}
        <g style={{ visibility: now ? "visible" : "hidden" }}>
          <line
            x1="52"
            y1="40"
            x2={52 + 12 * Math.sin((hourAngle * Math.PI) / 180)}
            y2={40 - 12 * Math.cos((hourAngle * Math.PI) / 180)}
            style={{ stroke: C.ink }}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <line
            x1="52"
            y1="40"
            x2={52 + 17 * Math.sin((minAngle * Math.PI) / 180)}
            y2={40 - 17 * Math.cos((minAngle * Math.PI) / 180)}
            style={{ stroke: C.ink }}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="52"
            y1="40"
            x2={52 + 19 * Math.sin((s * 6 * Math.PI) / 180)}
            y2={40 - 19 * Math.cos((s * 6 * Math.PI) / 180)}
            style={{ stroke: C.violet }}
            strokeWidth="1"
            strokeLinecap="round"
          />
          <circle cx="52" cy="40" r="2.5" style={{ fill: C.violet }} />
        </g>
      </svg>
      <div className="absolute inset-x-0 bottom-[11px] flex flex-col items-center leading-none">
        <span className="text-[8px] font-semibold" style={{ color: C.muted }}>
          {ampm}
        </span>
        <span className="mt-0.5 text-[13px] font-extrabold tabular-nums" style={{ color: C.ink }}>
          {now ? timeStr : "--:--"}
        </span>
        <span className="mt-0.5 text-[7px] font-medium" style={{ color: C.faint }}>
          {dateStr}
        </span>
      </div>
    </div>
  );
}

/* -------------------------------- progress ring -------------------------------- */

function Ring({ counter, onEditGoal, size = 176, stroke = 12, idSuffix = "m", big = false }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - counter.progress / 100);
  const gradientId = `altft-msc-ring-${idSuffix}`;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {/* star badge */}
      <span
        className={`absolute left-0 z-10 flex items-center justify-center rounded-full text-white ${big ? "top-5 h-9 w-9" : "top-4 h-8 w-8"}`}
        style={{ background: C.grad, boxShadow: "0 6px 14px rgba(99,102,241,0.35)" }}
        aria-hidden="true"
      >
        <Star size={big ? 17 : 15} fill="currentColor" />
      </span>

      <button
        type="button"
        onClick={() => counter.addSteps(1)}
        disabled={!counter.isActive}
        aria-label={`${formatNumber(counter.todaySteps)} steps today — ${Math.round(counter.progress)}% of your ${formatNumber(counter.goal)} step goal.${counter.isActive ? " Tap to add one step." : ""}`}
        className="relative block h-full w-full rounded-full outline-none transition-transform focus-visible:ring-4 focus-visible:ring-indigo-300 motion-safe:active:scale-[0.985] disabled:cursor-default"
      >
        <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90" aria-hidden="true">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={C.stopBlue} />
              <stop offset="100%" stopColor={C.stopViolet} />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            style={{ stroke: C.ringTrack }}
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="motion-safe:transition-[stroke-dashoffset] motion-safe:duration-500"
          />
        </svg>

        <span className="absolute inset-0 flex -translate-y-1.5 flex-col items-center justify-center">
          <span
            className={`flex items-center justify-center rounded-full ${big ? "h-11 w-11" : "h-8 w-8"}`}
            style={{ backgroundColor: C.card, boxShadow: "0 4px 12px rgba(99,102,241,0.22)", color: C.indigo }}
            aria-hidden="true"
          >
            <Footprints size={big ? 22 : 16} />
          </span>
          <span className={`mt-1 font-bold ${big ? "text-[14px]" : "text-[11px]"}`} style={{ color: C.indigo }}>
            Today
          </span>
          <span
            className={`font-extrabold leading-tight tracking-tight tabular-nums ${big ? "text-[40px]" : "text-[26px]"}`}
            style={{ color: C.ink }}
          >
            {formatNumber(counter.todaySteps)}
          </span>
          <span className={`font-semibold ${big ? "text-[12px]" : "text-[10px]"}`} style={{ color: C.muted }}>
            Steps
          </span>
        </span>
      </button>

      {/* goal + edit (kept outside the ring button so the pencil is tappable) */}
      <span className={`absolute inset-x-0 flex items-center justify-center gap-1 ${big ? "bottom-7" : "bottom-5"}`}>
        <span className={`font-semibold ${big ? "text-[12px]" : "text-[10px]"}`} style={{ color: C.muted }}>
          Goal: {formatNumber(counter.goal)}
        </span>
        <button
          type="button"
          onClick={onEditGoal}
          aria-label="Edit daily goal"
          className="rounded p-0.5 focus-visible:ring-2 focus-visible:ring-indigo-300"
          style={{ color: C.indigo }}
        >
          <Pencil size={big ? 13 : 11} aria-hidden="true" />
        </button>
      </span>
    </div>
  );
}

/* --------------------------------- hero card --------------------------------- */

const quickAddButton =
  "flex h-10 min-w-0 items-center justify-center gap-1 whitespace-nowrap rounded-xl px-1 text-[12px] font-bold transition active:opacity-80";

function HeroCard({ counter }) {
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalDraft, setGoalDraft] = useState(String(counter.goal));
  const pct = Math.round(counter.progress);
  const stepsLeft = Math.max(0, counter.goal - counter.todaySteps);
  const goalMet = counter.todaySteps >= counter.goal;

  function startEditGoal() {
    setGoalDraft(String(counter.goal));
    setEditingGoal(true);
  }

  function saveGoal() {
    const parsed = Number(goalDraft);
    if (Number.isFinite(parsed) && goalDraft !== "") counter.setGoal(parsed);
    setEditingGoal(false);
  }

  let hint = null;
  if (counter.errorMsg) {
    hint = counter.errorMsg;
  } else if (counter.isActive && counter.sensorMode === "simulated") {
    hint = "Walking simulation on — steps count at a natural walking pace. Open on a phone for real motion detection.";
  } else if (counter.isActive && counter.sensorMode === "motion") {
    hint = "Motion tracking on — keep your phone with you while walking.";
  }

  return (
    <section
      aria-label="Step tracker"
      className="rounded-[24px] p-4 md:flex md:flex-col md:justify-center md:p-6"
      style={{ backgroundColor: C.card, boxShadow: C.shadow }}
    >
      {/* flex-wrap lets the action column drop below the ring on very narrow
          phones (<360px) instead of squeezing and overflowing */}
      <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6">
        <div className="md:hidden">
          <Ring counter={counter} onEditGoal={startEditGoal} size={156} stroke={11} idSuffix="sm" />
        </div>
        <div className="hidden md:block">
          <Ring counter={counter} onEditGoal={startEditGoal} size={232} stroke={15} idSuffix="lg" big />
        </div>

        <div className="min-w-[6.5rem] max-w-full flex-1 space-y-3 md:space-y-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className="rounded-full px-2 py-1 text-[12px] font-extrabold tabular-nums md:px-2.5 md:text-[14px]"
              style={{ backgroundColor: C.greenSoft, color: C.green }}
            >
              {pct}%
            </span>
            <span className="text-[11px] font-semibold md:text-[13px]" style={{ color: C.muted }}>
              Goal Progress
            </span>
            {counter.streak > 0 && (
              <span
                className="ml-auto rounded-full px-2 py-1 text-[10px] font-bold md:text-[12px]"
                style={{ backgroundColor: C.orangeSoft, color: C.orange }}
              >
                🔥 {counter.streak} day streak
              </span>
            )}
          </div>

          <div className="border-t" style={{ borderColor: C.border }} />

          {editingGoal ? (
            <div>
              <label
                htmlFor="altft-msc-goal"
                className="mb-1 block text-[10px] font-bold uppercase tracking-wide md:text-[11px]"
                style={{ color: C.muted }}
              >
                Daily Goal
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  id="altft-msc-goal"
                  type="number"
                  inputMode="numeric"
                  min={MIN_GOAL}
                  max={MAX_GOAL}
                  step={500}
                  value={goalDraft}
                  onChange={(e) => setGoalDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveGoal()}
                  className="h-9 w-full min-w-0 rounded-xl border px-2 text-center text-[13px] font-bold tabular-nums outline-none md:h-10 md:text-[14px]"
                  style={{ borderColor: C.indigo, color: C.ink, backgroundColor: C.tile }}
                />
                <button
                  type="button"
                  onClick={saveGoal}
                  aria-label="Save goal"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white md:h-10 md:w-10"
                  style={{ background: C.grad }}
                >
                  <Check size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl md:h-11 md:w-11"
                style={{ backgroundColor: C.indigoSoft, color: C.indigo }}
                aria-hidden="true"
              >
                <TrendingUp size={16} />
              </span>
              <span className="min-w-0 leading-tight">
                <span
                  className="block text-[17px] font-extrabold tabular-nums md:text-[22px]"
                  style={{ color: C.ink }}
                >
                  {goalMet ? "Goal met! 🎉" : formatNumber(stepsLeft)}
                </span>
                {!goalMet && (
                  <span className="block text-[11px] font-medium md:text-[12px]" style={{ color: C.muted }}>
                    steps left
                  </span>
                )}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={counter.isActive ? counter.pause : counter.start}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-full text-[14px] font-bold text-white transition active:opacity-90 md:h-12 md:text-[15px]"
            style={{ background: C.grad, boxShadow: "0 8px 18px rgba(124,92,246,0.35)" }}
          >
            {counter.isActive ? (
              <>
                <Pause size={16} aria-hidden="true" /> Pause
              </>
            ) : (
              <>
                <RefreshCw size={16} aria-hidden="true" /> Sync Now
              </>
            )}
          </button>
        </div>
      </div>

      {/* quick actions — full-width row so the labels never get squeezed,
          on any breakpoint; the "Steps" word hides on ultra-narrow screens */}
      <div className="mt-3 grid grid-cols-3 gap-2 md:mt-4">
        <button
          type="button"
          onClick={() => counter.addSteps(100)}
          aria-label="Add 100 steps"
          className={quickAddButton}
          style={{ backgroundColor: C.indigoSoft, color: C.indigo }}
        >
          <Plus size={13} aria-hidden="true" />
          100<span className="hidden min-[380px]:inline">&nbsp;Steps</span>
        </button>
        <button
          type="button"
          onClick={() => counter.addSteps(500)}
          aria-label="Add 500 steps"
          className={quickAddButton}
          style={{ backgroundColor: C.indigoSoft, color: C.indigo }}
        >
          <Plus size={13} aria-hidden="true" />
          500<span className="hidden min-[380px]:inline">&nbsp;Steps</span>
        </button>
        <button
          type="button"
          onClick={counter.resetToday}
          className={quickAddButton}
          style={{ backgroundColor: C.dangerSoft, color: C.danger }}
        >
          <RotateCcw size={13} aria-hidden="true" />
          Reset
        </button>
      </div>

      {hint ? (
        <p
          role={counter.errorMsg ? "alert" : undefined}
          className="mt-3 text-center text-[10px] font-medium md:text-[11px]"
          style={{ color: counter.errorMsg ? C.danger : C.muted }}
        >
          {hint}
        </p>
      ) : null}
    </section>
  );
}

/* ---------------------------------- stat tiles --------------------------------- */

function StatTilesRow({ counter }) {
  const tiles = [
    {
      icon: MapPin,
      bg: C.indigoSoft,
      fg: C.indigo,
      value: distanceKm(counter.todaySteps),
      unit: "km",
      label: "Distance",
    },
    {
      icon: Flame,
      bg: C.orangeSoft,
      fg: C.orange,
      value: formatNumber(caloriesBurned(counter.todaySteps)),
      unit: "kcal",
      label: "Calories",
    },
    {
      icon: Clock,
      bg: C.greenSoft,
      fg: C.green,
      value: formatActiveTime(counter.activeMs),
      unit: "",
      label: "Active Time",
    },
    {
      icon: TrendingUp,
      bg: C.violetSoft,
      fg: C.violet,
      value: formatNumber(estimateFloors(counter.todaySteps)),
      unit: "Floors",
      label: "Climbed",
    },
  ];

  return (
    <div
      className="grid grid-cols-2 gap-2 min-[360px]:grid-cols-4 md:gap-3 lg:grid-cols-2"
      role="list"
      aria-label="Today's activity stats"
    >
      {tiles.map((tile) => (
        <div
          key={tile.label}
          role="listitem"
          className="flex flex-col items-center rounded-[18px] px-1 py-3 text-center md:py-5"
          style={{ backgroundColor: C.card, boxShadow: C.shadow }}
        >
          <span
            className="flex h-10 w-10 items-center justify-center rounded-full md:h-12 md:w-12"
            style={{ backgroundColor: tile.bg, color: tile.fg }}
            aria-hidden="true"
          >
            <tile.icon size={17} />
          </span>
          <span
            className="mt-2 text-[15px] font-extrabold leading-none tabular-nums md:text-[20px]"
            style={{ color: C.ink }}
          >
            {tile.value}
          </span>
          <span className="mt-1 text-[10px] font-semibold leading-none md:text-[11px]" style={{ color: C.muted }}>
            {tile.unit || " "}
          </span>
          <span className="mt-1 text-[10px] font-medium leading-none md:text-[11px]" style={{ color: C.faint }}>
            {tile.label}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------- bar chart ---------------------------------- */

function WeekBars({ week, height = 130 }) {
  const maxVal = Math.max(15000, ...week.map((d) => d.steps));
  const maxSteps = Math.max(...week.map((d) => d.steps));
  const gridLabels = [1, 2 / 3, 1 / 3, 0];

  return (
    <div className="relative mx-auto w-full lg:max-w-3xl" style={{ height: height + 34 }}>
      {/* gridlines + y labels */}
      {gridLabels.map((f) => (
        <div
          key={f}
          className="absolute inset-x-0 flex items-center gap-1"
          style={{ bottom: 22 + f * height }}
        >
          <span className="w-7 text-right text-[9px] font-medium tabular-nums" style={{ color: C.faint }}>
            {f === 0 ? "0" : `${Math.round((maxVal * f) / 1000)}K`}
          </span>
          <span
            className="h-px flex-1"
            style={{ borderTop: "1px dashed var(--sc-border)" }}
            aria-hidden="true"
          />
        </div>
      ))}

      {/* bars */}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between pl-9 pr-1">
        {week.map((day) => {
          const barHeight = Math.max(
            day.steps > 0 ? 6 : 4,
            Math.round((day.steps / maxVal) * height),
          );
          const showBubble = maxSteps > 0 && day.steps === maxSteps;
          return (
            <div key={day.key} className="flex w-7 flex-col items-center sm:w-8 md:w-12">
              <div className="relative flex w-full justify-center" style={{ height: barHeight }}>
                {showBubble && (
                  <span
                    className="absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg px-2 py-1 text-[10px] font-bold text-white tabular-nums"
                    style={{ backgroundColor: C.indigoFill }}
                  >
                    {formatNumber(day.steps)}
                    <span
                      className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45"
                      style={{ backgroundColor: C.indigoFill }}
                      aria-hidden="true"
                    />
                  </span>
                )}
                <span
                  className="absolute bottom-0 w-[18px] rounded-t-md md:w-[26px]"
                  style={{
                    height: "100%",
                    background: day.steps > 0 ? C.gradBar : C.border,
                    opacity: day.isFuture ? 0.35 : 1,
                  }}
                  aria-hidden="true"
                />
              </div>
              <span
                className="mt-2 text-[10px] font-semibold md:text-[11px]"
                style={{ color: day.isToday ? C.indigo : C.muted }}
              >
                {day.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepsOverviewCard({ week }) {
  return (
    <section
      aria-label="Steps overview for this week"
      className="rounded-[24px] p-4 md:p-6"
      style={{ backgroundColor: C.card, boxShadow: C.shadow }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[15px] font-extrabold md:text-[17px]" style={{ color: C.ink }}>
          Steps Overview
        </h2>
        <span
          className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[11px] font-semibold"
          style={{ borderColor: C.border, color: C.muted }}
        >
          This Week
          <ChevronDown size={13} aria-hidden="true" />
        </span>
      </div>
      <WeekBars week={week} />
    </section>
  );
}

/* ----------------------------------- banner ----------------------------------- */

function FireBanner({ counter, onViewInsights }) {
  const pct = Math.round(counter.progress);
  let title = "Ready to move? 🚀";
  let message = `Start walking to hit your ${formatNumber(counter.goal)} step goal today!`;
  if (counter.todaySteps >= counter.goal) {
    title = "Goal crushed! 🏆";
    message = "You've hit 100% of your step goal. Amazing work!";
  } else if (pct >= 50) {
    title = "You're on fire! 🔥";
    message = `You've hit ${pct}% of your step goal. Keep going to crush it!`;
  } else if (counter.todaySteps > 0) {
    title = "Keep it up! 💪";
    message = `You're at ${pct}% of your step goal. Every step counts!`;
  }

  return (
    <section
      aria-label="Motivation"
      className="relative flex flex-wrap items-center gap-3 overflow-hidden rounded-[20px] p-4 md:p-5"
      style={{ backgroundColor: C.navy }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(139,92,246,0.4), transparent)" }}
      />
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl"
        style={{ background: "linear-gradient(135deg, #4C3D8F, #6D28D9)" }}
        aria-hidden="true"
      >
        👑
      </span>
      <div className="min-w-[9rem] flex-1">
        <p className="text-[13px] font-extrabold text-white md:text-[14px]">{title}</p>
        <p className="mt-0.5 text-[11px] font-medium leading-snug md:text-[12px]" style={{ color: C.navyText }}>
          {message}
        </p>
      </div>
      <button
        type="button"
        onClick={onViewInsights}
        className="ml-auto flex h-9 shrink-0 items-center gap-0.5 rounded-full px-3 text-[11px] font-bold text-white active:opacity-90"
        style={{ backgroundColor: C.indigoFill }}
      >
        View Insights
        <ChevronRight size={13} aria-hidden="true" />
      </button>
    </section>
  );
}

/* --------------------------------- other tabs --------------------------------- */

function CardShell({ title, children }) {
  return (
    <section className="rounded-[24px] p-4 md:p-6" style={{ backgroundColor: C.card, boxShadow: C.shadow }}>
      {title ? (
        <h2 className="mb-3 text-[15px] font-extrabold md:text-[17px]" style={{ color: C.ink }}>
          {title}
        </h2>
      ) : null}
      {children}
    </section>
  );
}

function HistoryView({ counter }) {
  const { lifetime } = counter;
  const stats = [
    { label: "Total Steps", value: formatNumber(lifetime.totalSteps) },
    { label: "Daily Average", value: formatNumber(lifetime.avgSteps) },
    { label: "Best Day", value: formatNumber(lifetime.bestDay.steps) },
    { label: "Days Active", value: formatNumber(lifetime.daysActive) },
  ];

  return (
    <div className="space-y-4">
      <CardShell title="This Week">
        <WeekBars week={counter.week} height={140} />
        <ul className="mt-4 space-y-2">
          {counter.week.map((day) => (
            <li
              key={day.key}
              className="flex items-center gap-3 rounded-xl px-3 py-2"
              style={{ backgroundColor: day.isToday ? C.indigoSoft : C.tile }}
            >
              <span className="w-9 text-[11px] font-bold" style={{ color: day.isToday ? C.indigo : C.muted }}>
                {day.label}
              </span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ backgroundColor: C.border }}>
                <span
                  className="block h-full rounded-full"
                  style={{
                    width: `${Math.min(100, (day.steps / counter.goal) * 100)}%`,
                    background: C.grad,
                  }}
                />
              </span>
              <span className="w-14 text-right text-[11px] font-bold tabular-nums" style={{ color: C.ink }}>
                {formatNumber(day.steps)}
              </span>
              {day.steps >= counter.goal ? (
                <Check size={13} style={{ color: C.green }} aria-label="Goal met" />
              ) : (
                <span className="w-[13px]" aria-hidden="true" />
              )}
            </li>
          ))}
        </ul>
      </CardShell>

      <CardShell title="Lifetime">
        <div className="grid grid-cols-2 gap-2 md:gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl p-3" style={{ backgroundColor: C.tile }}>
              <p className="text-[17px] font-extrabold tabular-nums md:text-[20px]" style={{ color: C.ink }}>
                {stat.value}
              </p>
              <p className="mt-0.5 text-[10px] font-semibold md:text-[11px]" style={{ color: C.muted }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </CardShell>
    </div>
  );
}

function ChallengesView({ counter }) {
  return (
    <CardShell title="Unlock badges as you walk">
      <ul className="space-y-2">
        {ACHIEVEMENTS.map((def) => {
          const unlockedAt = counter.achievements[def.id];
          return (
            <li
              key={def.id}
              className="flex items-center gap-3 rounded-2xl p-3"
              style={{ backgroundColor: C.tile, opacity: unlockedAt ? 1 : 0.8 }}
            >
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                style={
                  unlockedAt
                    ? { background: "linear-gradient(135deg,#FBBF24,#F59E0B)", color: "#FFFFFF" }
                    : { backgroundColor: C.ringTrack, color: C.faint }
                }
                aria-hidden="true"
              >
                {unlockedAt ? <Trophy size={18} /> : <Lock size={16} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-bold" style={{ color: C.ink }}>
                  {def.name}
                </span>
                <span className="block text-[11px] font-medium" style={{ color: C.muted }}>
                  {def.description}
                </span>
              </span>
              <span
                className="shrink-0 rounded-full px-2 py-1 text-[9px] font-bold"
                style={
                  unlockedAt
                    ? { backgroundColor: C.greenSoft, color: C.green }
                    : { backgroundColor: C.ringTrack, color: C.muted }
                }
              >
                {unlockedAt ? timeAgo(unlockedAt) : "Locked"}
              </span>
            </li>
          );
        })}
      </ul>
    </CardShell>
  );
}

function ProfileView({ counter, name, onNameChange }) {
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(name);
  const [goalDraft, setGoalDraft] = useState(String(counter.goal));

  useEffect(() => setGoalDraft(String(counter.goal)), [counter.goal]);

  function saveName() {
    const trimmed = nameDraft.trim().slice(0, 24);
    if (trimmed) onNameChange(trimmed);
    setEditingName(false);
  }

  return (
    <div className="space-y-4">
      <CardShell>
        <div className="flex items-center gap-3">
          <span
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-extrabold text-white"
            style={{ background: C.grad }}
            aria-hidden="true"
          >
            {name.charAt(0).toUpperCase()}
          </span>
          {editingName ? (
            <div className="flex min-w-0 flex-1 items-center gap-1.5">
              <input
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveName()}
                maxLength={24}
                aria-label="Your name"
                className="h-10 w-full min-w-0 rounded-xl border px-3 text-[14px] font-bold outline-none"
                style={{ borderColor: C.indigo, color: C.ink, backgroundColor: C.tile }}
              />
              <button
                type="button"
                onClick={saveName}
                aria-label="Save name"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
                style={{ background: C.grad }}
              >
                <Check size={16} aria-hidden="true" />
              </button>
            </div>
          ) : (
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-[17px] font-extrabold" style={{ color: C.ink }}>
                <span className="truncate">{name}</span>
                <button
                  type="button"
                  onClick={() => {
                    setNameDraft(name);
                    setEditingName(true);
                  }}
                  aria-label="Edit name"
                  className="shrink-0 rounded p-0.5"
                  style={{ color: C.indigo }}
                >
                  <Pencil size={13} aria-hidden="true" />
                </button>
              </p>
              <p className="text-[11px] font-medium" style={{ color: C.muted }}>
                Walking since day one 🚶
              </p>
            </div>
          )}
        </div>
      </CardShell>

      <CardShell title="Daily Goal">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => counter.setGoal(counter.goal - 500)}
            aria-label="Decrease goal by 500 steps"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[18px] font-bold"
            style={{ backgroundColor: C.indigoSoft, color: C.indigo }}
          >
            −
          </button>
          <input
            type="number"
            inputMode="numeric"
            min={MIN_GOAL}
            max={MAX_GOAL}
            step={500}
            value={goalDraft}
            onChange={(e) => {
              setGoalDraft(e.target.value);
              const parsed = Number(e.target.value);
              if (Number.isFinite(parsed) && parsed >= MIN_GOAL && parsed <= MAX_GOAL) {
                counter.setGoal(parsed);
              }
            }}
            onBlur={() => setGoalDraft(String(counter.goal))}
            aria-label="Daily step goal"
            className="h-11 w-full min-w-0 rounded-xl border px-3 text-center text-[15px] font-extrabold tabular-nums outline-none"
            style={{ borderColor: C.border, color: C.ink, backgroundColor: C.tile }}
          />
          <button
            type="button"
            onClick={() => counter.setGoal(counter.goal + 500)}
            aria-label="Increase goal by 500 steps"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[18px] font-bold"
            style={{ backgroundColor: C.indigoSoft, color: C.indigo }}
          >
            +
          </button>
        </div>
      </CardShell>

      <CardShell title="Your Data">
        <p className="text-[11px] font-medium leading-relaxed" style={{ color: C.muted }}>
          All step data is stored privately in your browser — nothing is uploaded or shared.
        </p>
        <button
          type="button"
          onClick={counter.resetToday}
          className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full text-[13px] font-bold"
          style={{ backgroundColor: C.dangerSoft, color: C.danger }}
        >
          <RotateCcw size={15} aria-hidden="true" />
          Reset Today's Steps
        </button>
      </CardShell>
    </div>
  );
}

/* --------------------------------- bottom nav --------------------------------- */

function BottomNav({ tab, onTab, counter }) {
  const [quickOpen, setQuickOpen] = useState(false);

  const items = [
    { id: "home", label: "Home", icon: HomeIcon },
    { id: "history", label: "History", icon: HistoryIcon },
    { id: "fab" },
    { id: "challenges", label: "Challenges", icon: Trophy },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <div className="sticky bottom-3 z-20 mx-auto mt-4 w-full max-w-[420px]">
      {quickOpen && (
        <div
          className="absolute bottom-full left-1/2 mb-3 flex -translate-x-1/2 items-center gap-2 rounded-2xl p-2"
          style={{ backgroundColor: C.card, boxShadow: C.navShadow }}
          role="group"
          aria-label="Quick add steps"
        >
          {[1, 100, 500].map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => counter.addSteps(amount)}
              className="h-9 whitespace-nowrap rounded-xl px-3 text-[12px] font-bold"
              style={{ backgroundColor: C.indigoSoft, color: C.indigo }}
            >
              +{amount}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setQuickOpen(false)}
            aria-label="Close quick add"
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ backgroundColor: C.tile, color: C.muted }}
          >
            <X size={15} aria-hidden="true" />
          </button>
        </div>
      )}

      <nav
        aria-label="Step counter sections"
        className="flex items-center justify-between rounded-[26px] px-4 py-2"
        style={{ backgroundColor: C.card, boxShadow: C.navShadow }}
      >
        {items.map((item) => {
          if (item.id === "fab") {
            return (
              <button
                key="fab"
                type="button"
                onClick={() => setQuickOpen((v) => !v)}
                aria-label="Add steps manually"
                aria-expanded={quickOpen}
                className="-mt-8 flex h-14 w-14 items-center justify-center rounded-full text-white transition active:scale-95"
                style={{ background: C.grad, boxShadow: "0 10px 22px rgba(124,92,246,0.45)" }}
              >
                <Plus size={26} aria-hidden="true" />
              </button>
            );
          }
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onTab(item.id);
                setQuickOpen(false);
              }}
              aria-current={active ? "page" : undefined}
              className="flex flex-col items-center gap-0.5 px-1 py-1 text-[10px] font-semibold"
              style={{ color: active ? C.indigo : C.muted }}
            >
              <item.icon size={19} aria-hidden="true" />
              {item.label}
              <span
                className="h-1 w-1 rounded-full"
                style={{ backgroundColor: active ? C.indigo : "transparent" }}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </nav>
    </div>
  );
}

/* ----------------------------------- app root ---------------------------------- */

const TAB_TITLES = {
  history: "Your History",
  challenges: "Challenges",
  profile: "Profile",
};

export default function StepApp({ counter }) {
  const now = useNow();
  const [tab, setTab] = useState("home");
  const [name, setName] = useState("Walker");
  const rootRef = useRef(null);

  // Switching tabs from the floating bottom nav must land the user at the TOP
  // of the new view — not leave them stranded at the old scroll position.
  const goTab = useCallback((next) => {
    setTab(next);
    window.requestAnimationFrame(() => {
      const el = rootRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - 88; // clear the sticky site header
      const reduceMotion =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? "auto" : "smooth" });
    });
  }, []);

  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(NAME_KEY);
      if (saved) setName(saved);
    } catch {
      /* ignore */
    }
  }, []);

  function handleNameChange(next) {
    setName(next);
    try {
      window.sessionStorage.setItem(NAME_KEY, next);
    } catch {
      /* ignore */
    }
  }

  const hasUnlocked = useMemo(() => counter.unlocked.length > 0, [counter.unlocked]);

  return (
    <>
      {/* Full-screen theme backdrop: paints the ENTIRE viewport in the app's
          lavender canvas (behind the page content, above the body background)
          while this tool is open, so the app reads as one integrated screen
          rather than a themed box dropped onto the page. Unmounts with the
          tool, leaving the rest of the site untouched. */}
      <div aria-hidden="true" className="fixed inset-0 -z-10" style={{ backgroundColor: C.bg }} />

    <div
      ref={rootRef}
      className="mx-auto flex min-h-[640px] w-full max-w-[420px] flex-col p-3 min-[400px]:p-4 md:min-h-0 md:max-w-6xl md:p-6 lg:p-7"
      style={{ color: C.ink }}
    >
      {/* top bar */}
      <div className="flex items-start justify-between md:items-center">
        {tab === "home" ? (
          <>
            <div className="min-w-0 flex-1 pr-3 md:flex md:items-center md:gap-5">
              <Link
                href="/tools/all"
                aria-label="Browse all tools"
                className="mb-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl md:mb-0"
                style={{ backgroundColor: C.card, boxShadow: C.shadow, color: C.ink }}
              >
                <Menu size={18} aria-hidden="true" />
              </Link>
              <div className="min-w-0">
                <p className="text-[15px] font-medium md:text-[16px]" style={{ color: C.muted }}>
                  {greetingFor(now)}
                </p>
                <p
                  className="truncate text-[26px] font-extrabold leading-tight md:text-[30px]"
                  style={{ color: C.ink }}
                >
                  {name} 👋
                </p>
                <p className="mt-0.5 text-[12px] font-medium md:text-[13px]" style={{ color: C.muted }}>
                  Let&apos;s crush your goals today!
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3 md:flex-row-reverse md:items-center md:gap-4">
              <button
                type="button"
                onClick={() => goTab("challenges")}
                aria-label="View challenges"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: C.card, boxShadow: C.shadow, color: C.ink }}
              >
                <Bell size={17} aria-hidden="true" />
                {hasUnlocked && (
                  <span
                    className="absolute right-2 top-2 h-2 w-2 rounded-full"
                    style={{ backgroundColor: C.violet }}
                    aria-hidden="true"
                  />
                )}
              </button>
              <AnalogClock now={now} />
            </div>
          </>
        ) : (
          <div className="flex w-full items-center gap-3 md:mx-auto md:max-w-2xl">
            <button
              type="button"
              onClick={() => goTab("home")}
              aria-label="Back to home"
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: C.card, boxShadow: C.shadow, color: C.ink }}
            >
              <ChevronRight size={18} className="rotate-180" aria-hidden="true" />
            </button>
            <h2 className="text-[19px] font-extrabold" style={{ color: C.ink }}>
              {TAB_TITLES[tab]}
            </h2>
          </div>
        )}
      </div>

      {/* content */}
      {tab === "home" ? (
        /* Single column on phones AND tablets (the big ring needs the full
           width there); the two-column dashboard starts at lg (≥1024px). */
        <div className="mt-4 grid flex-1 content-start grid-cols-1 gap-4 md:mt-6 md:gap-5 lg:grid-cols-[1.2fr_1fr]">
          <HeroCard counter={counter} />
          <div className="grid content-start gap-4 md:gap-5">
            <StatTilesRow counter={counter} />
            <FireBanner counter={counter} onViewInsights={() => goTab("history")} />
          </div>
          <div className="lg:col-span-full">
            <StepsOverviewCard week={counter.week} />
          </div>
        </div>
      ) : (
        <div className="mt-4 w-full flex-1 space-y-4 md:mx-auto md:mt-6 md:max-w-2xl">
          {tab === "history" && <HistoryView counter={counter} />}
          {tab === "challenges" && <ChallengesView counter={counter} />}
          {tab === "profile" && (
            <ProfileView counter={counter} name={name} onNameChange={handleNameChange} />
          )}
        </div>
      )}

      <BottomNav tab={tab} onTab={goTab} counter={counter} />
    </div>
    </>
  );
}
