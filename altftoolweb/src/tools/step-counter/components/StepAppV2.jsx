"use client";

/**
 * StepAppV2 — redesigned Step Counter experience (cyan accent, premium
 * LIGHT + DARK themes).
 *
 * THEMING: every surface colour comes from a `--scv2-*` token defined on the
 * local `.scv2-scope` wrapper — light values by default, dark overrides under
 * the site's `[data-theme="dark"]` attribute (same mechanism the rest of the
 * site uses, so the header theme toggle restyles this tool instantly).
 * Brand accents (cyan gradient FAB/ring/line, purple 10K badge, the dark
 * "today" pill) intentionally stay constant in both themes.
 *
 * Responsive split:
 *  - PHONES (< md): full app-style screen — in-screen status bar, progress
 *    ring, stat tiles, weekly chart, friends list, floating nav + FAB.
 *  - DESKTOP (≥ md): same design language as a wider dashboard.
 *
 * Tracking state machine (useStepCounter): idle → tracking ⇄ paused →
 * stopped; Reset returns to idle. Voice coach (useVoiceCoach): start/resume/
 * reset confirmations + milestone announcements (50–1000 steps, configurable),
 * queued so nothing is interrupted, each milestone spoken exactly once.
 * A 350ms tap-guard collapses accidental double-taps.
 *
 * Live data comes from useStepCounter(); the Friends leaderboard is
 * illustrative demo content until a real social backend exists. All icons
 * and avatars are hand-drawn inline SVGs.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  MAX_GOAL,
  MIN_GOAL,
  VOICE_INTERVALS,
  caloriesBurned,
  distanceKm,
  estimateFloors,
  formatNumber,
  paceSpm,
  stepsRemaining,
} from "../utils/stepStore";
import useVoiceCoach from "../utils/useVoiceCoach";

/* ----------------------------- theme tokens ----------------------------- */
/* Light is the default; the site's [data-theme="dark"] attribute switches
   the same tokens to the dark palette. Scoped to .scv2-scope so nothing
   leaks into the rest of the page. */

const THEME_CSS = `
.scv2-scope{
  --scv2-screen:#F3F7F8;
  --scv2-panel:#FFFFFF;
  --scv2-card:#FFFFFF;
  --scv2-card-shadow:0 1px 2px rgba(10,32,40,.05),0 10px 28px rgba(10,32,40,.07);
  --scv2-canvas-shadow:0 0 0 1px rgba(10,32,40,.06),0 28px 60px rgba(10,32,40,.14);
  --scv2-panel-shadow:0 0 0 1px rgba(10,32,40,.08),0 24px 60px rgba(10,32,40,.25);
  --scv2-border:rgba(10,32,40,.10);
  --scv2-ink:#0B1518;
  --scv2-ink-soft:#31444B;
  --scv2-label:#5A6C72;
  --scv2-mut:#5F7278;
  --scv2-mut2:#75868C;
  --scv2-chip:rgba(10,32,40,.06);
  --scv2-chip-ink:#31444B;
  --scv2-handle:rgba(10,32,40,.16);
  --scv2-glyph:#0B1518;
  --scv2-track:rgba(10,32,40,.08);
  --scv2-grid:rgba(10,32,40,.06);
  --scv2-goal-line:rgba(10,32,40,.35);
  --scv2-dot:#FFFFFF;
  --scv2-dot-stroke:rgba(10,32,40,.35);
  --scv2-today-ring:#0B1518;
  --scv2-seg-ink:#4A5D63;
  --scv2-seg-on-bg:#FFFFFF;
  --scv2-seg-on-ink:#0B1518;
  --scv2-seg-on-shadow:0 2px 8px rgba(10,32,40,.14),inset 0 0 0 1px rgba(10,32,40,.05);
  --scv2-backdrop:rgba(12,24,28,.38);
  --scv2-toggle-off:rgba(10,32,40,.16);
  --scv2-star-bg:#FFFFFF;
  --scv2-star-border:rgba(10,32,40,.12);
  --scv2-danger-bg:rgba(214,69,69,.12);
  --scv2-danger-ink:#C24444;
  --scv2-orange:#E07F1F;
  --scv2-glow:radial-gradient(circle, rgba(44,158,184,.13) 0%, rgba(44,158,184,0) 62%);
}
[data-theme="dark"] .scv2-scope{
  --scv2-screen:#070B0D;
  --scv2-panel:#0C1316;
  --scv2-card:rgba(255,255,255,.05);
  --scv2-card-shadow:none;
  --scv2-canvas-shadow:0 0 0 1px rgba(255,255,255,.10),0 25px 50px -12px rgba(0,0,0,.6);
  --scv2-panel-shadow:0 0 0 1px rgba(255,255,255,.10),0 24px 60px rgba(0,0,0,.5);
  --scv2-border:rgba(255,255,255,.10);
  --scv2-ink:#FFFFFF;
  --scv2-ink-soft:#D3DBDE;
  --scv2-label:#A9B6BB;
  --scv2-mut:#8B979C;
  --scv2-mut2:#7D8A8F;
  --scv2-chip:rgba(255,255,255,.07);
  --scv2-chip-ink:#DFE7EA;
  --scv2-handle:rgba(255,255,255,.15);
  --scv2-glyph:#FFFFFF;
  --scv2-track:rgba(255,255,255,.07);
  --scv2-grid:rgba(255,255,255,.055);
  --scv2-goal-line:rgba(255,255,255,.30);
  --scv2-dot:#FFFFFF;
  --scv2-dot-stroke:transparent;
  --scv2-today-ring:#FFFFFF;
  --scv2-seg-ink:#CDD6D9;
  --scv2-seg-on-bg:rgba(4,8,10,.55);
  --scv2-seg-on-ink:#FFFFFF;
  --scv2-seg-on-shadow:inset 0 0 0 1px rgba(255,255,255,.10);
  --scv2-backdrop:rgba(0,0,0,.55);
  --scv2-toggle-off:rgba(255,255,255,.14);
  --scv2-star-bg:#10161A;
  --scv2-star-border:rgba(255,255,255,.16);
  --scv2-danger-bg:rgba(255,110,110,.14);
  --scv2-danger-ink:#FF7A7A;
  --scv2-orange:#FF9F43;
  --scv2-glow:radial-gradient(circle, rgba(44,158,184,.20) 0%, rgba(44,158,184,0) 62%);
}
@keyframes scv2Up{from{transform:translateY(26px);opacity:.4}to{transform:translateY(0);opacity:1}}
@keyframes scv2Fade{from{opacity:0}to{opacity:1}}
@keyframes scv2FadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
@keyframes scv2PopIn{from{opacity:0;transform:scale(.3)}to{opacity:1;transform:scale(1)}}
@keyframes scv2Draw{to{stroke-dashoffset:0}}
@keyframes scv2AreaIn{to{opacity:1}}
@keyframes scv2Ping{0%{transform:scale(.7);opacity:.85}70%,100%{transform:scale(2.3);opacity:0}}
@keyframes scv2Flicker{0%,100%{transform:scale(1) rotate(-2deg)}50%{transform:scale(1.14) rotate(3deg)}}
@keyframes scv2Twinkle{0%,100%{transform:scale(1) rotate(0)}50%{transform:scale(1.22) rotate(16deg)}}
@keyframes scv2FabPing{0%{box-shadow:0 0 0 0 rgba(60,201,245,.45)}80%,100%{box-shadow:0 0 0 16px rgba(60,201,245,0)}}
@keyframes scv2Breathe{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:1;transform:scale(1.05)}}
@keyframes scv2SoftPulse{0%,100%{opacity:1}50%{opacity:.45}}
@keyframes scv2GoalPop{0%{transform:scale(1)}35%{transform:scale(1.14)}100%{transform:scale(1)}}
@media (prefers-reduced-motion: no-preference){
  .scv2-in{animation:scv2FadeUp .6s cubic-bezier(.22,1,.36,1) both}
  .scv2-pop{animation:scv2PopIn .5s .45s cubic-bezier(.34,1.56,.64,1) both}
  .scv2-ring-arc{transition:stroke-dasharray .9s cubic-bezier(.22,1,.36,1)}
  .scv2-chart-line{stroke-dasharray:1;stroke-dashoffset:1;animation:scv2Draw 1.3s .3s cubic-bezier(.4,0,.2,1) forwards}
  .scv2-chart-area{opacity:0;animation:scv2AreaIn .8s 1s ease forwards}
  .scv2-chart-dot{opacity:0;animation:scv2PopIn .45s cubic-bezier(.34,1.56,.64,1) both;transform-box:fill-box;transform-origin:center}
  .scv2-ping{transform-box:fill-box;transform-origin:center;animation:scv2Ping 2.2s .8s ease-out infinite}
  .scv2-flame{display:inline-block;animation:scv2Flicker 1.7s ease-in-out infinite}
  .scv2-twinkle{animation:scv2Twinkle 2.6s ease-in-out infinite}
  .scv2-fab-ping{animation:scv2FabPing 2.1s ease-out infinite}
  .scv2-glow-pulse{animation:scv2Breathe 2.6s ease-in-out infinite}
  .scv2-soft-pulse{animation:scv2SoftPulse 1.8s ease-in-out infinite}
  .scv2-goal-pop{animation:scv2GoalPop .9s cubic-bezier(.34,1.56,.64,1)}
  .scv2-tile{transition:transform .25s ease}
  @media (hover:hover){
    .scv2-tile:hover{transform:translateY(-3px)}
    .scv2-frow{transition:background .2s ease}
    .scv2-frow:hover{background:var(--scv2-chip)}
  }
}
`;

/* --------------------------------- palette --------------------------------- */

const C = {
  screen: "var(--scv2-screen)",
  panel: "var(--scv2-panel)",
  card: "var(--scv2-card)",
  ink: "var(--scv2-ink)",
  mut: "var(--scv2-mut)",
  mut2: "var(--scv2-mut2)",
  cyan: "#3CC9F5", // brand accent — constant in both themes
  cyanDeep: "#22A7DC",
  orange: "var(--scv2-orange)",
  danger: "var(--scv2-danger-ink)",
};

const GLOW = "var(--scv2-glow)";
const FAB_BG = `radial-gradient(circle at 32% 28%, #6FDBFF 0%, ${C.cyan} 42%, ${C.cyanDeep} 100%)`;
const FAB_SHADOW = "0 10px 28px rgba(60,201,245,.45), inset 0 1.5px 0 rgba(255,255,255,.5)";
const CARD_STYLE = { background: C.card, boxShadow: "var(--scv2-card-shadow)" };
const TAP_GUARD_MS = 350;

/* ---------------------------------- helpers --------------------------------- */

// Catmull-Rom → cubic bezier spline through the weekly points (smooth line
// that always passes through every data point, like the reference chart).
function splinePath(pts) {
  if (pts.length < 2) return "";
  const d = [`M${pts[0].x},${pts[0].y}`];
  for (let i = 0; i < pts.length - 1; i += 1) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d.push(
      `C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`,
    );
  }
  return d.join(" ");
}

// Animated count-up for the big step number: eases from the currently shown
// value to the new one (from 0 on mount), so the counter feels alive instead
// of snapping. Honours prefers-reduced-motion by jumping straight to the
// target value.
function useCountUp(value) {
  const [shown, setShown] = useState(0);
  const shownRef = useRef(0);
  const rafRef = useRef(0);
  const reducedRef = useRef(false);

  useEffect(() => {
    reducedRef.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    const from = shownRef.current;
    const to = value;
    if (from === to) return undefined;
    if (reducedRef.current) {
      shownRef.current = to;
      setShown(to);
      return undefined;
    }
    // Short hops animate quickly; big jumps (session restore) take ~0.7s.
    const dur = Math.min(700, 220 + Math.abs(to - from) * 4);
    let startTs;
    const tick = (ts) => {
      if (startTs === undefined) startTs = ts;
      const p = Math.min(1, (ts - startTs) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.round(from + (to - from) * eased);
      shownRef.current = val;
      setShown(val);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  return shown;
}

/* ------------------------------- tiny SVG bits ------------------------------- */
/* All drawn by hand for this tool — flat-illustration avatars and nav icons.
   Kept inline so the screen ships zero image requests. Glyphs use theme
   tokens so both themes recolour them.
   `idp` suffixes keep SVG defs ids unique across the phone/desktop variants. */

function AvatarUser({ idp }) {
  const id = `scv2-av1-${idp}`;
  return (
    <svg viewBox="0 0 48 48" className="block h-full w-full">
      <defs>
        <clipPath id={id}><circle cx="24" cy="24" r="24" /></clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect width="48" height="48" fill="#DFD8C8" />
        <path d="M24 29c-8.2 0-13.4 4.8-14.8 12V48h29.6v-7C37.4 33.8 32.2 29 24 29z" fill="#F3A83B" />
        <path d="M20 26h8v3.4c-1.2 1-2.6 1.5-4 1.5s-2.8-.5-4-1.5V26z" fill="#B97A52" />
        <circle cx="24" cy="18.6" r="8.2" fill="#C8875C" />
        <path d="M15.2 18c0-6 4-9.6 8.8-9.6s8.8 3.6 8.8 9.6c-1.2-3.6-3.3-5-8.8-5s-7.6 1.4-8.8 5z" fill="#262124" />
      </g>
    </svg>
  );
}

function AvatarLiam({ idp }) {
  const id = `scv2-av2-${idp}`;
  return (
    <svg viewBox="0 0 48 48" className="block h-full w-full">
      <defs>
        <clipPath id={id}><circle cx="24" cy="24" r="24" /></clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect width="48" height="48" fill="#CCD6DA" />
        <path d="M24 29.5c-8.2 0-13.4 4.8-14.8 11.5V48h29.6v-7C37.4 34.3 32.2 29.5 24 29.5z" fill="#46545E" />
        <path d="M20 26.5h8v3.2c-1.2 1-2.6 1.5-4 1.5s-2.8-.5-4-1.5v-3.2z" fill="#B98963" />
        <circle cx="24" cy="19" r="8" fill="#D9A37E" />
        <path d="M15.6 19.2c-.5-6.4 3.6-10 8.4-10s8.9 3.6 8.4 10c-.9-4-3.2-5.6-8.4-5.6s-7.5 1.6-8.4 5.6z" fill="#6B4F35" />
      </g>
    </svg>
  );
}

function AvatarTanja({ idp }) {
  const id = `scv2-av3-${idp}`;
  return (
    <svg viewBox="0 0 48 48" className="block h-full w-full">
      <defs>
        <clipPath id={id}><circle cx="24" cy="24" r="24" /></clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect width="48" height="48" fill="#E9D3C4" />
        <path d="M24 7.5c-7 0-11.4 4.8-11.4 11.6 0 8.4 1.6 14.9 3 18.9h16.8c1.4-4 3-10.5 3-18.9C35.4 12.3 31 7.5 24 7.5z" fill="#2C2426" />
        <path d="M24 30c-8 0-13.2 4.6-14.6 11V48h29.2v-7C37.2 34.6 32 30 24 30z" fill="#2E8F96" />
        <path d="M20.2 27h7.6v3.2c-1.1.9-2.4 1.4-3.8 1.4s-2.7-.5-3.8-1.4V27z" fill="#B08668" />
        <circle cx="24" cy="19.6" r="7.6" fill="#C69A80" />
        <path d="M16.6 20c-.4-5.6 3-9.2 7.4-9.2s7.8 3.6 7.4 9.2c-.8-3.6-2.8-5-7.4-5s-6.6 1.4-7.4 5z" fill="#2C2426" />
      </g>
    </svg>
  );
}

function DotsIcon({ color = "var(--scv2-ink-soft)" }) {
  return (
    <svg width="18" height="4" viewBox="0 0 18 4" style={{ fill: color }} aria-hidden="true">
      <circle cx="2" cy="2" r="1.9" /><circle cx="9" cy="2" r="1.9" /><circle cx="16" cy="2" r="1.9" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
      <rect x="6" y="4.5" width="4.4" height="15" rx="1.6" />
      <rect x="13.6" y="4.5" width="4.4" height="15" rx="1.6" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
      <path d="M8 5.4c0-1.1 1.2-1.8 2.2-1.2l10 5.8c1 .6 1 2 0 2.6l-10 5.8c-1 .6-2.2-.1-2.2-1.2V5.4z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

/* ------------------------------ shared sections ------------------------------ */

const RING = { size: 264, r: 112, stroke: 24 };
const RING_C = 2 * Math.PI * RING.r; // ≈ 703.7

// Chart drawing box (SVG user units).
const CH = { w: 312, h: 96, padX: 10, top: 8, bottom: 88 };

// Illustrative leaderboard until friends/social data exists server-side.
const DEMO_FRIENDS = [
  { rank: 1, name: "Liam", Avatar: AvatarLiam, steps: 5785, when: "Now", verified: false },
  { rank: 2, name: "Tanja", Avatar: AvatarTanja, steps: 5276, when: "", verified: true },
];

const RING_LABEL = {
  tracking: "Tracking…",
  paused: "Paused",
  stopped: "Today",
  idle: "Today",
};

function RangeToggle({ range, setRange }) {
  return (
    <div
      className="flex items-center gap-[2px] rounded-full p-1"
      style={{ background: "var(--scv2-chip)" }}
      role="tablist"
      aria-label="Range"
    >
      {["D", "W", "M"].map((r) => (
        <button
          key={r}
          type="button"
          role="tab"
          aria-selected={range === r}
          onClick={() => setRange(r)}
          className="h-9 w-11 rounded-full text-[15px] font-semibold transition-colors motion-reduce:transition-none"
          style={
            range === r
              ? {
                  background: "var(--scv2-seg-on-bg)",
                  color: "var(--scv2-seg-on-ink)",
                  boxShadow: "var(--scv2-seg-on-shadow)",
                }
              : { color: "var(--scv2-seg-ink)" }
          }
        >
          {r}
        </button>
      ))}
    </div>
  );
}

function ProgressRing({ idp, todaySteps, goal, progress, status, tenKUnlocked }) {
  const gid = `scv2-ring-${idp}`;
  const tracking = status === "tracking";
  const shownSteps = useCountUp(todaySteps);

  // Arc sweeps in from zero on mount (CSS transition carries it to the
  // real value one frame later).
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // One-shot celebratory pop the moment the daily goal is crossed.
  const goalMet = progress >= 100;
  const [celebrate, setCelebrate] = useState(false);
  const prevGoalMet = useRef(false);
  useEffect(() => {
    if (goalMet && !prevGoalMet.current) {
      setCelebrate(true);
      const t = window.setTimeout(() => setCelebrate(false), 1000);
      prevGoalMet.current = true;
      return () => window.clearTimeout(t);
    }
    prevGoalMet.current = goalMet;
    return undefined;
  }, [goalMet]);

  const target = (Math.min(progress, 100) / 100) * RING_C;
  const ringDash = drawn ? target : 0.001;

  return (
    <div className="relative" style={{ width: RING.size, height: RING.size }}>
      {/* breathing halo while a session is live */}
      {tracking ? (
        <div
          aria-hidden="true"
          className="scv2-glow-pulse pointer-events-none absolute -inset-3 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(60,201,245,.16) 30%, rgba(60,201,245,0) 70%)" }}
        />
      ) : null}
      <svg
        className="absolute inset-0"
        viewBox={`0 0 ${RING.size} ${RING.size}`}
        style={{ filter: "drop-shadow(0 0 16px rgba(60,201,245,.28))" }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5AD4FA" />
            <stop offset="100%" stopColor="#28B8E8" />
          </linearGradient>
        </defs>
        <circle
          cx={RING.size / 2} cy={RING.size / 2} r={RING.r}
          fill="none" strokeWidth={RING.stroke}
          style={{ stroke: "var(--scv2-track)" }}
        />
        {/* skip the progress arc at 0% — a rounded linecap would paint a lone dot */}
        {target > 0 ? (
          <circle
            className="scv2-ring-arc"
            cx={RING.size / 2} cy={RING.size / 2} r={RING.r}
            fill="none" stroke={`url(#${gid})`} strokeWidth={RING.stroke} strokeLinecap="round"
            strokeDasharray={`${ringDash.toFixed(1)} ${RING_C.toFixed(1)}`}
            transform={`rotate(-90 ${RING.size / 2} ${RING.size / 2})`}
          />
        ) : null}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-[2px] text-center">
        <span
          className={`text-[16px] font-medium${tracking ? " scv2-soft-pulse" : ""}`}
          style={{ color: "var(--scv2-label)" }}
          aria-live="off"
        >
          {RING_LABEL[status] || "Today"}
        </span>
        <span
          className={`my-[2px] text-[54px] font-bold leading-[1.04] tracking-[-1.5px] tabular-nums${celebrate ? " scv2-goal-pop" : ""}`}
        >
          {formatNumber(shownSteps)}
        </span>
        <span className="text-[14px]" style={{ color: C.mut }}>
          of {formatNumber(goal)} steps
        </span>
        {/* 10K achievement badge — full colour once actually unlocked */}
        <span
          aria-hidden="true"
          className="scv2-pop mt-[10px] flex h-[31px] w-[31px] flex-col items-center justify-center gap-[1px] rounded-[10px]"
          style={{
            background: "linear-gradient(150deg,#9C6BFF 0%, #7C3AED 100%)",
            boxShadow: "0 5px 16px rgba(139,92,246,.42), inset 0 1px 0 rgba(255,255,255,.28)",
            opacity: tenKUnlocked ? 1 : 0.45,
          }}
        >
          <svg width="14" height="9" viewBox="0 0 20 12" fill="#fff">
            <path d="M1.2 8.2c3-.4 4.7-2.4 5.8-4l2.3 1.7c.9.7 2 1.1 3.1 1.1h4.7c1 0 1.8.8 1.7 1.8-.1.9-.9 1.5-1.8 1.5H2.4c-.7 0-1.2-.5-1.2-1.2v-.9z" />
            <path d="M1.2 10.9h17.5" stroke="#fff" strokeWidth="1" opacity=".7" />
          </svg>
          <span className="text-[6.5px] font-extrabold tracking-[.4px] text-white">10K</span>
        </span>
      </div>
    </div>
  );
}

function StatTile({ tile, delay = 0 }) {
  return (
    <div
      className="scv2-in scv2-tile relative flex h-[76px] min-w-20 flex-none flex-col items-center justify-center gap-[3px] rounded-[18px] px-2"
      style={{ ...CARD_STYLE, animationDelay: `${delay}s` }}
    >
      {tile.star ? (
        <span
          aria-hidden="true"
          className="scv2-twinkle absolute -top-[7px] right-[-3px] flex h-[22px] w-[22px] items-center justify-center rounded-full border-[1.5px]"
          style={{ background: "var(--scv2-star-bg)", borderColor: "var(--scv2-star-border)" }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#4FD0F7" strokeWidth="2" strokeLinejoin="round">
            <path d="M12 3.6l2.5 5.1 5.6.8-4 4 .9 5.6-5-2.7-5 2.7.9-5.6-4-4 5.6-.8z" />
          </svg>
        </span>
      ) : null}
      <span className="flex items-center gap-[5px] text-[20px] font-bold tracking-[-.3px] tabular-nums">
        {tile.fire ? <span className="scv2-flame text-[16px] leading-none">🔥</span> : null}
        {tile.value}
      </span>
      <span className="text-[13px] font-medium" style={{ color: tile.fire ? C.orange : C.mut }}>
        {tile.unit}
      </span>
    </div>
  );
}

function WeeklyChart({ idp, last7, goal }) {
  const gid = `scv2-area-${idp}`;

  /* Weekly chart geometry — scaled so the dotted goal line stays in-frame. */
  const chart = useMemo(() => {
    const series = last7 || [];
    const maxSteps = Math.max(0, ...series.map((d) => d.steps));
    const yMax = Math.max(goal, maxSteps) * 1.15 || 1;
    const stepX = (CH.w - CH.padX * 2) / Math.max(series.length - 1, 1);
    const yFor = (v) => CH.top + (1 - v / yMax) * (CH.bottom - CH.top);
    const pts = series.map((d, i) => ({ x: CH.padX + i * stepX, y: yFor(d.steps), day: d }));
    return { pts, goalY: yFor(goal), line: splinePath(pts) };
  }, [last7, goal]);

  const areaPath = chart.line
    ? `${chart.line} L${(CH.w - CH.padX).toFixed(1)},${CH.h} L${CH.padX},${CH.h} Z`
    : "";

  return (
    <>
      <div className="flex items-center justify-between px-[2px] pb-[6px]">
        {(last7 || []).map((d) =>
          d.isToday ? (
            <span
              key={d.key}
              className="flex-none rounded-full px-[11px] py-[5px] text-[11px] font-semibold tracking-[.6px] text-white"
              style={{ background: "#04080A", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.09)" }}
            >
              {d.label.toUpperCase()}
            </span>
          ) : (
            <span key={d.key} className="flex-1 text-center text-[11px] font-semibold tracking-[.6px]" style={{ color: C.mut2 }}>
              {d.label.toUpperCase()}
            </span>
          ),
        )}
      </div>
      <svg viewBox={`0 0 ${CH.w} ${CH.h}`} className="block h-auto w-full" aria-hidden="true">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(60,201,245,.28)" />
            <stop offset="100%" stopColor="rgba(60,201,245,0)" />
          </linearGradient>
        </defs>
        <g strokeWidth="1" style={{ stroke: "var(--scv2-grid)" }}>
          {chart.pts.map((p) => (
            <line key={p.day.key} x1={p.x} y1="2" x2={p.x} y2="91" />
          ))}
        </g>
        {/* dotted goal line */}
        <line
          x1="6" y1={chart.goalY.toFixed(1)} x2={CH.w - 6} y2={chart.goalY.toFixed(1)}
          strokeWidth="1.5" strokeDasharray="1.6 5.5" strokeLinecap="round"
          style={{ stroke: "var(--scv2-goal-line)" }}
        />
        {areaPath ? <path className="scv2-chart-area" d={areaPath} fill={`url(#${gid})`} /> : null}
        {chart.line ? (
          <path
            className="scv2-chart-line"
            d={chart.line} pathLength="1"
            fill="none" stroke={C.cyan} strokeWidth="3.4" strokeLinecap="round"
          />
        ) : null}
        {chart.pts.map((p, i) =>
          p.day.isToday ? (
            <g key={p.day.key}>
              {/* soft radar ping drawing the eye to today */}
              <circle
                className="scv2-ping"
                cx={p.x} cy={p.y} r="9.5" fill="none" strokeWidth="2" stroke={C.cyan}
              />
              <circle
                className="scv2-chart-dot"
                cx={p.x} cy={p.y} r="9.5" fill="none" strokeWidth="2"
                style={{ stroke: "var(--scv2-today-ring)", animationDelay: `${0.4 + i * 0.07}s` }}
              />
              <circle
                className="scv2-chart-dot"
                cx={p.x} cy={p.y} r="4.5" strokeWidth="1"
                style={{ fill: "var(--scv2-dot)", stroke: "var(--scv2-dot-stroke)", animationDelay: `${0.4 + i * 0.07}s` }}
              />
            </g>
          ) : (
            <circle
              key={p.day.key}
              className="scv2-chart-dot"
              cx={p.x} cy={p.y} r="4" strokeWidth="1"
              style={{ fill: "var(--scv2-dot)", stroke: "var(--scv2-dot-stroke)", animationDelay: `${0.4 + i * 0.07}s` }}
            />
          ),
        )}
      </svg>
    </>
  );
}

function FriendsHead() {
  return (
    <div className="flex items-center justify-between px-[2px]">
      <span
        className="flex items-center gap-2 rounded-full py-2 pl-[11px] pr-[14px] text-[14.5px] font-semibold"
        style={{ background: "var(--scv2-chip)" }}
      >
        <svg width="17" height="15" viewBox="0 0 24 20" style={{ fill: "var(--scv2-ink-soft)" }} aria-hidden="true">
          <circle cx="9" cy="5.6" r="4" />
          <path d="M1.6 17.6c.5-4.2 3.5-7 7.4-7s6.9 2.8 7.4 7c.06.5-.36 1-.9 1H2.5c-.54 0-.96-.5-.9-1z" />
          <circle cx="18.2" cy="6.4" r="3.1" opacity=".85" />
          <path d="M17.4 11.5c2.9.4 5 2.6 5.4 5.9.06.5-.36 1-.9 1h-3.2c-.1-2.8-1-5.1-2.6-6.7.4-.1.8-.2 1.3-.2z" opacity=".85" />
        </svg>
        Friends
      </span>
      <DotsIcon color="var(--scv2-mut2)" />
    </div>
  );
}

function FriendRows({ idp }) {
  return DEMO_FRIENDS.map(({ rank, name, Avatar, steps, when, verified }) => (
    <div key={rank} className="scv2-frow flex items-center gap-[11px] rounded-2xl px-1 pt-[11px]">
      <span className="w-[14px] flex-none text-center text-[14.5px] font-semibold" style={{ color: "var(--scv2-ink-soft)" }}>
        {rank}
      </span>
      <span className="h-[42px] w-[42px] flex-none overflow-hidden rounded-full">
        <Avatar idp={idp} />
      </span>
      <span className="flex flex-1 items-center gap-[6px] text-[16.5px] font-semibold">
        {name}
        {verified ? (
          <span className="flex h-[14px] w-[14px] flex-none items-center justify-center rounded-full" style={{ background: C.cyan }}>
            <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="#04222E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 5.2 4.1 7.3 8 2.9" />
            </svg>
          </span>
        ) : null}
      </span>
      <span className="text-right">
        <span className="block text-[16.5px] font-bold tabular-nums">{formatNumber(steps)}</span>
        {when ? (
          <span className="mt-[1px] block text-[12.5px]" style={{ color: C.mut2 }}>{when}</span>
        ) : null}
      </span>
    </div>
  ));
}

function useDerived(counter) {
  const { todaySteps, activeMs, achievements, streak, goal } = counter;
  const activeMinutes = Math.floor((activeMs || 0) / 60000);
  return {
    tenKUnlocked: Boolean(achievements?.["10k-day"]),
    statTiles: [
      { key: "streak", value: streak, unit: "Streak", fire: true },
      { key: "kcal", value: formatNumber(caloriesBurned(todaySteps)), unit: "kcal" },
      { key: "km", value: distanceKm(todaySteps), unit: "km", star: true },
      { key: "min", value: activeMinutes, unit: "min" },
      { key: "pace", value: paceSpm(todaySteps, activeMs), unit: "spm" },
      { key: "left", value: formatNumber(stepsRemaining(goal, todaySteps)), unit: "to go" },
      { key: "floors", value: estimateFloors(todaySteps), unit: "floors" },
    ],
  };
}

/* ------------------------------ settings panel ------------------------------ */

function SettingsBody({ app }) {
  const {
    voice,
    voiceEnabled,
    voiceInterval,
    onToggleVoice,
    onPickInterval,
    goal,
    onGoalDelta,
    status,
    canReset,
    canSave,
    justSaved,
    onSave,
    onReset,
    onClose,
    errorMsg,
  } = app;

  const closeRef = useRef(null);
  // Focus lands on the close control when the visible instance opens.
  useEffect(() => {
    const el = closeRef.current;
    if (el && el.offsetParent !== null) el.focus();
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <span className="text-[17px] font-bold">Settings</span>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close settings"
          className="flex h-11 w-11 items-center justify-center rounded-full transition-transform active:scale-95 motion-reduce:transition-none"
          style={{ background: "var(--scv2-chip)", color: "var(--scv2-ink-soft)" }}
        >
          <CloseIcon />
        </button>
      </div>

      {/* voice announcements */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[15px] font-semibold">Voice announcements</div>
          <div className="text-[12.5px]" style={{ color: C.mut }}>
            {voice.supported
              ? "Spoken progress updates while you walk"
              : "Not supported in this browser"}
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={voiceEnabled}
          aria-label="Voice announcements"
          disabled={!voice.supported}
          onClick={onToggleVoice}
          className="relative h-8 w-[52px] flex-none rounded-full transition-colors disabled:opacity-40 motion-reduce:transition-none"
          style={{ background: voiceEnabled && voice.supported ? C.cyan : "var(--scv2-toggle-off)" }}
        >
          <span
            className="absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform motion-reduce:transition-none"
            style={{ transform: voiceEnabled && voice.supported ? "translateX(24px)" : "translateX(4px)", left: 0 }}
          />
        </button>
      </div>

      {/* milestone interval */}
      <div>
        <div className="pb-2 text-[13px] font-semibold uppercase tracking-[.6px]" style={{ color: C.mut2 }}>
          Announce every
        </div>
        <div role="radiogroup" aria-label="Announcement interval in steps" className="flex flex-wrap gap-2">
          {VOICE_INTERVALS.map((n) => {
            const selected = voiceInterval === n;
            const usable = voiceEnabled && voice.supported;
            return (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={!usable}
                onClick={() => onPickInterval(n)}
                className="h-11 min-w-[62px] rounded-full px-3 text-[14px] font-bold tabular-nums transition-transform active:scale-[.97] disabled:opacity-40 motion-reduce:transition-none"
                style={
                  selected
                    ? { background: C.cyan, color: "#04222E" }
                    : { background: "var(--scv2-chip)", color: "var(--scv2-chip-ink)" }
                }
              >
                {formatNumber(n)}
              </button>
            );
          })}
          <span className="self-center text-[13px]" style={{ color: C.mut }}>steps</span>
        </div>
      </div>

      {/* daily goal */}
      <div>
        <div className="pb-2 text-[13px] font-semibold uppercase tracking-[.6px]" style={{ color: C.mut2 }}>
          Daily goal
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Lower goal by 500 steps"
            disabled={goal <= MIN_GOAL}
            onClick={() => onGoalDelta(-500)}
            className="flex h-11 w-11 items-center justify-center rounded-full text-[20px] font-bold transition-transform active:scale-95 disabled:opacity-40 motion-reduce:transition-none"
            style={{ background: "var(--scv2-chip)" }}
          >
            −
          </button>
          <span className="min-w-[92px] text-center text-[18px] font-bold tabular-nums">
            {formatNumber(goal)}
          </span>
          <button
            type="button"
            aria-label="Raise goal by 500 steps"
            disabled={goal >= MAX_GOAL}
            onClick={() => onGoalDelta(500)}
            className="flex h-11 w-11 items-center justify-center rounded-full text-[20px] font-bold transition-transform active:scale-95 disabled:opacity-40 motion-reduce:transition-none"
            style={{ background: "var(--scv2-chip)" }}
          >
            +
          </button>
        </div>
      </div>

      {/* progress controls */}
      <div>
        <div className="pb-2 text-[13px] font-semibold uppercase tracking-[.6px]" style={{ color: C.mut2 }}>
          Your progress
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            disabled={!canSave || justSaved}
            onClick={onSave}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full text-[15px] font-bold transition-all active:scale-[.98] disabled:opacity-60 motion-reduce:transition-none"
            style={
              justSaved
                ? { background: "#16A46B", color: "#fff" }
                : { background: C.cyan, color: "#04222E" }
            }
          >
            {justSaved ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 12.5 9.5 18 20 6.5" />
                </svg>
                Saved
              </>
            ) : (
              "Save"
            )}
          </button>
          <button
            type="button"
            disabled={!canReset}
            onClick={onReset}
            className="h-12 flex-1 rounded-full text-[15px] font-bold transition-transform active:scale-[.98] disabled:opacity-40 motion-reduce:transition-none"
            style={{ background: "var(--scv2-danger-bg)", color: C.danger }}
          >
            Reset
          </button>
        </div>
        <div className="pt-2 text-[12.5px]" style={{ color: C.mut }}>
          {status === "paused"
            ? "Paused — Save keeps your steps, Reset starts a fresh day."
            : "Your steps are saved automatically and stay here next time."}
        </div>
        {errorMsg ? (
          <div className="pt-2 text-[12.5px]" style={{ color: C.orange }}>
            {errorMsg}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function PhoneSettingsSheet({ app }) {
  if (!app.settingsOpen) return null;
  return (
    <div className="absolute inset-0 z-[9]" role="dialog" aria-modal="true" aria-label="Step Counter settings">
      <button
        type="button"
        aria-label="Close settings"
        onClick={app.onClose}
        className="absolute inset-0 w-full backdrop-blur-[2px] motion-safe:[animation:scv2Fade_.2s_ease]"
        style={{ background: "var(--scv2-backdrop)" }}
      />
      <div
        className="absolute inset-x-0 bottom-0 max-h-[calc(100%-16px)] overflow-y-auto overscroll-contain rounded-t-[28px] p-5 pb-7 motion-safe:[animation:scv2Up_.28s_ease]"
        style={{ background: C.panel, boxShadow: "var(--scv2-panel-shadow)" }}
      >
        <div className="mx-auto mb-4 h-1.5 w-11 rounded-full" style={{ background: "var(--scv2-handle)" }} aria-hidden="true" />
        <SettingsBody app={app} />
      </div>
    </div>
  );
}

function DesktopSettingsPopover({ app }) {
  if (!app.settingsOpen) return null;
  return (
    <div className="absolute inset-0 z-[9]" role="dialog" aria-modal="true" aria-label="Step Counter settings">
      <button
        type="button"
        aria-label="Close settings"
        onClick={app.onClose}
        className="absolute inset-0 w-full cursor-default motion-safe:[animation:scv2Fade_.15s_ease]"
        style={{ background: "var(--scv2-backdrop)" }}
      />
      <div
        className="absolute right-6 top-[86px] max-h-[calc(100%-110px)] w-[380px] max-w-[calc(100%-3rem)] overflow-y-auto overscroll-contain rounded-3xl p-5 motion-safe:[animation:scv2Up_.22s_ease]"
        style={{ background: C.panel, boxShadow: "var(--scv2-panel-shadow)" }}
      >
        <SettingsBody app={app} />
      </div>
    </div>
  );
}

/* ------------------------------- phone variant ------------------------------- */

function PhoneScreen({ counter, app }) {
  const { todaySteps, goal, progress, status, last7 } = counter;
  const { tenKUnlocked, statTiles } = useDerived(counter);

  return (
    <div
      className="relative mx-auto flex h-[812px] w-full max-w-[430px] flex-col overflow-hidden rounded-[32px]"
      style={{ background: C.screen, color: C.ink, boxShadow: "var(--scv2-canvas-shadow)" }}
    >
      {/* ambient teal glow behind the ring */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-[70px] left-1/2 h-[460px] w-[460px] -translate-x-1/2 rounded-full"
        style={{ background: GLOW }}
      />

      {/* header: avatar / D W M / menu */}
      <div className="scv2-in relative z-[2] flex flex-none items-center justify-between px-[18px] pt-5" style={{ animationDelay: ".04s" }}>
        <span
          className="h-[42px] w-[42px] flex-none overflow-hidden rounded-full"
          style={{ boxShadow: "0 0 0 1.5px var(--scv2-border)" }}
        >
          <AvatarUser idp="m" />
        </span>
        <RangeToggle range={app.range} setRange={app.setRange} />
        <button
          type="button"
          aria-label="Settings"
          aria-haspopup="dialog"
          aria-expanded={app.settingsOpen}
          onClick={app.onOpenSettings}
          className="flex h-[42px] w-[42px] items-center justify-center rounded-full transition-transform active:scale-95 motion-reduce:transition-none"
          style={{ background: "var(--scv2-chip)" }}
        >
          <DotsIcon />
        </button>
      </div>

      {/* progress ring */}
      <div className="scv2-in relative z-[1] flex flex-none justify-center pb-[2px] pt-[6px]" style={{ animationDelay: ".1s" }}>
        <ProgressRing
          idp="m"
          todaySteps={todaySteps}
          goal={goal}
          progress={progress}
          status={status}
          tenKUnlocked={tenKUnlocked}
        />
      </div>

      {/* stats row */}
      <div className="relative z-[1] flex flex-none gap-[9px] overflow-x-auto pb-[6px] pl-4 pt-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {statTiles.map((t, i) => (
          <StatTile key={t.key} tile={t} delay={0.16 + i * 0.05} />
        ))}
      </div>

      {/* weekly chart */}
      <div className="scv2-in relative z-[1] mx-4 mt-2 flex-none rounded-3xl px-[14px] pb-[10px] pt-[13px]" style={{ ...CARD_STYLE, animationDelay: ".3s" }}>
        <WeeklyChart idp="m" last7={last7} goal={goal} />
      </div>

      {/* friends leaderboard (demo content) */}
      <div className="scv2-in relative z-[1] mx-4 mt-3 min-h-0 flex-1 rounded-t-3xl px-[14px] pb-5 pt-3" style={{ ...CARD_STYLE, animationDelay: ".38s" }}>
        <FriendsHead />
        <FriendRows idp="m" />
      </div>

      {/* floating (sticky) primary action — Start / Pause / Resume */}
      <div className="scv2-in absolute inset-x-0 bottom-[18px] z-[8] flex justify-center" style={{ animationDelay: ".46s" }}>
        <button
          type="button"
          onClick={app.onPrimary}
          aria-label={app.primary.aria}
          aria-pressed={status === "tracking"}
          className="relative flex h-16 w-16 flex-none items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95 motion-reduce:transition-none"
          style={{ background: FAB_BG, boxShadow: FAB_SHADOW }}
        >
          {/* gentle ripple that invites the first tap */}
          {status === "idle" || status === "stopped" ? (
            <span aria-hidden="true" className="scv2-fab-ping pointer-events-none absolute inset-0 rounded-full" />
          ) : null}
          {app.primary.icon}
        </button>
      </div>

      <PhoneSettingsSheet app={app} />
    </div>
  );
}

/* ------------------------------ desktop variant ------------------------------ */

const DESK_SUBTITLE = {
  tracking: "Tracking your steps…",
  paused: "Paused — resume when ready",
  stopped: "Session stopped",
  idle: "Ready when you are",
};

function DesktopDashboard({ counter, app }) {
  const { todaySteps, goal, progress, status, last7 } = counter;
  const { tenKUnlocked, statTiles } = useDerived(counter);

  return (
    <div
      className="relative mx-auto w-full max-w-[1060px] overflow-hidden rounded-[32px] p-6 lg:p-8"
      style={{ background: C.screen, color: C.ink, boxShadow: "var(--scv2-canvas-shadow)" }}
    >
      {/* ambient teal glow behind the ring column */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-[90px] left-[16%] h-[520px] w-[520px] rounded-full"
        style={{ background: GLOW }}
      />

      {/* header row */}
      <div className="scv2-in relative z-[1] flex flex-wrap items-center justify-between gap-4" style={{ animationDelay: ".04s" }}>
        <div className="flex items-center gap-3">
          <span
            className="h-[46px] w-[46px] flex-none overflow-hidden rounded-full"
            style={{ boxShadow: "0 0 0 1.5px var(--scv2-border)" }}
          >
            <AvatarUser idp="d" />
          </span>
          <div>
            <div className="text-[17px] font-semibold leading-tight">Step Counter</div>
            <div className="text-[13px]" style={{ color: C.mut }}>
              {DESK_SUBTITLE[status] || DESK_SUBTITLE.idle}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <RangeToggle range={app.range} setRange={app.setRange} />
          {/* primary action — Start / Pause / Resume */}
          <button
            type="button"
            onClick={app.onPrimary}
            aria-pressed={status === "tracking"}
            className="relative flex h-11 items-center gap-2 rounded-full px-5 text-[14.5px] font-bold text-white transition-transform hover:scale-[1.03] active:scale-[.97] motion-reduce:transition-none"
            style={{ background: FAB_BG, boxShadow: FAB_SHADOW }}
          >
            {/* gentle ripple that invites the first click */}
            {status === "idle" || status === "stopped" ? (
              <span aria-hidden="true" className="scv2-fab-ping pointer-events-none absolute inset-0 rounded-full" />
            ) : null}
            {app.primary.icon}
            {app.primary.label}
          </button>
          {app.canReset ? (
            <button
              type="button"
              onClick={app.onReset}
              className="h-11 rounded-full px-4 text-[14px] font-bold transition-transform active:scale-[.97] motion-reduce:transition-none"
              style={{ background: "var(--scv2-danger-bg)", color: C.danger }}
            >
              Reset
            </button>
          ) : null}
          <button
            type="button"
            aria-label="Settings"
            aria-haspopup="dialog"
            aria-expanded={app.settingsOpen}
            onClick={app.onOpenSettings}
            className="flex h-11 w-11 items-center justify-center rounded-full transition-transform active:scale-95 motion-reduce:transition-none"
            style={{ background: "var(--scv2-chip)" }}
          >
            <DotsIcon />
          </button>
        </div>
      </div>

      {/* dashboard grid */}
      <div className="relative z-[1] mt-6 grid gap-6 md:grid-cols-[minmax(320px,400px)_1fr]">
        {/* left — ring + stat tiles */}
        <div className="scv2-in flex flex-col items-center rounded-3xl px-6 pb-6 pt-7" style={{ ...CARD_STYLE, animationDelay: ".12s" }}>
          <ProgressRing
            idp="d"
            todaySteps={todaySteps}
            goal={goal}
            progress={progress}
            status={status}
            tenKUnlocked={tenKUnlocked}
          />
          <div className="mt-6 flex flex-wrap justify-center gap-[10px]">
            {statTiles.map((t, i) => (
              <StatTile key={t.key} tile={t} delay={0.2 + i * 0.05} />
            ))}
          </div>
        </div>

        {/* right — weekly chart + friends */}
        <div className="flex min-w-0 flex-col gap-6">
          <div className="scv2-in rounded-3xl px-5 pb-4 pt-4" style={{ ...CARD_STYLE, animationDelay: ".22s" }}>
            <WeeklyChart idp="d" last7={last7} goal={goal} />
          </div>
          <div className="scv2-in flex-1 rounded-3xl px-5 pb-5 pt-4" style={{ ...CARD_STYLE, animationDelay: ".3s" }}>
            <FriendsHead />
            <FriendRows idp="d" />
          </div>
        </div>
      </div>

      <DesktopSettingsPopover app={app} />
    </div>
  );
}

/* --------------------------------- component -------------------------------- */

export default function StepAppV2({ counter }) {
  const [range, setRange] = useState("D"); // visual segmented control (D/W/M)
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const lastTapRef = useRef(0);
  const savedTimerRef = useRef(0);
  const returnFocusRef = useRef(null);

  const {
    todaySteps,
    activeMs,
    goal,
    status,
    errorMsg,
    voiceEnabled,
    voiceInterval,
    setVoiceEnabled,
    setVoiceInterval,
    setGoal,
    start,
    pause,
    resume,
    save,
    resetToday,
  } = counter;

  const voice = useVoiceCoach({
    steps: todaySteps,
    tracking: status === "tracking",
    enabled: voiceEnabled,
    interval: voiceInterval,
  });

  // Accidental double-taps (and double-clicks) collapse into one action.
  const tapOk = () => {
    const now = Date.now();
    if (now - lastTapRef.current < TAP_GUARD_MS) return false;
    lastTapRef.current = now;
    return true;
  };

  const onPrimary = () => {
    if (!tapOk()) return;
    if (status === "tracking") {
      pause();
      return;
    }
    if (status === "paused") {
      resume();
      voice.announce("Step tracking resumed.");
      return;
    }
    // idle / stopped → fresh start. announce() runs inside the tap handler so
    // iOS's user-gesture requirement for speech is satisfied.
    start();
    voice.announce("Step tracking started.");
  };

  const onSave = () => {
    save();
    setJustSaved(true);
    voice.announce("Progress saved.");
    window.clearTimeout(savedTimerRef.current);
    savedTimerRef.current = window.setTimeout(() => setJustSaved(false), 1800);
  };

  // Clear the "Saved ✓" timer if the component unmounts mid-confirmation.
  useEffect(() => () => window.clearTimeout(savedTimerRef.current), []);

  const onReset = () => {
    if (!tapOk()) return;
    resetToday();
    voice.announce("Tracking has been reset.");
    closeSettings();
  };

  const onToggleVoice = () => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    if (next) {
      // force: the enabled flag hasn't round-tripped through state yet.
      voice.announce("Voice announcements on.", { force: true });
    } else {
      voice.hush();
    }
  };

  const openSettings = () => {
    returnFocusRef.current =
      typeof document !== "undefined" ? document.activeElement : null;
    setSettingsOpen(true);
  };

  const closeSettings = () => {
    setSettingsOpen(false);
    const el = returnFocusRef.current;
    if (el && typeof el.focus === "function") el.focus();
  };

  // Escape closes the settings dialog.
  useEffect(() => {
    if (!settingsOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") closeSettings();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [settingsOpen]);

  const primary =
    status === "tracking"
      ? { label: "Pause", aria: "Pause step tracking", icon: <PauseIcon /> }
      : status === "paused"
        ? { label: "Resume", aria: "Resume step tracking", icon: <PlayIcon /> }
        : { label: "Start", aria: "Start step tracking", icon: <PlusIcon /> };

  const canSave = todaySteps > 0 || (activeMs || 0) > 0;
  const canReset = todaySteps > 0 || (activeMs || 0) > 0 || status !== "idle";

  // Everything the variants + settings panel need, in one bag.
  const app = {
    range,
    setRange,
    settingsOpen,
    onOpenSettings: openSettings,
    onClose: closeSettings,
    onPrimary,
    onSave,
    onReset,
    onToggleVoice,
    onPickInterval: setVoiceInterval,
    onGoalDelta: (delta) => setGoal(goal + delta),
    primary,
    canSave,
    justSaved,
    canReset,
    voice,
    voiceEnabled,
    voiceInterval,
    goal,
    status,
    errorMsg,
  };

  return (
    <div className="scv2-scope">
      <style>{THEME_CSS}</style>
      {/* phones / small tablets — app-style screen */}
      <div className="md:hidden">
        <PhoneScreen counter={counter} app={app} />
      </div>
      {/* desktop — same design as a wider dashboard */}
      <div className="hidden md:block">
        <DesktopDashboard counter={counter} app={app} />
      </div>
    </div>
  );
}
