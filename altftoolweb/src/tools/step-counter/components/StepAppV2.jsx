"use client";

/**
 * Step Counter — the screen.
 *
 * Mobile is the product (site-wide mobile CTR is 9.09% against 1.4% on
 * desktop, and this is the highest-traffic page on the site), so the phone
 * layout is the design and the desktop is the same design given more room —
 * one component tree, one set of states, no second design to keep in sync.
 *
 * Three rules this file exists to enforce:
 *
 * 1. THE COUNT IS THE PAGE. It is the largest thing on screen and legible at
 *    arm's length mid-walk. Everything else is subordinate.
 * 2. EVERY STATE IS A SCREEN, NOT A TOAST. Needs-a-phone, needs-permission,
 *    blocked, ready, counting, no-signal, paused, screen-may-sleep — each one
 *    says what is true and what to do next, and none of them hides in a closed
 *    settings sheet.
 * 3. NOTHING IS INVENTED. The friends leaderboard ("Liam 5,785", a verified
 *    badge, a "Now" timestamp) was fabricated and is gone. The D/W/M range
 *    switch changed nothing and is gone. The floors metric (steps ÷ 650, with
 *    no barometer anywhere) is gone. Distance and calories survive only as
 *    labelled estimates — see stepEstimates.js. Steps, active time, streak and
 *    the 7-day history are real.
 *
 * Theming is entirely platform tokens (see stepTheme.js) — light and dark both
 * follow the site's theme toggle with no local palette.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, Settings2, Square } from "lucide-react";
import {
  formatActiveTime,
  formatNumber,
  stepsRemaining,
} from "../utils/stepStore";
import useVoiceCoach from "../utils/useVoiceCoach";
import useWakeLock from "../utils/useWakeLock";
import StepNotice, {
  formatGap,
  useHiddenGap,
  useMotionCapability,
  useMotionLiveness,
} from "./StepNotices";
import StepRing from "./StepRing";
import StepSettingsSheet from "./StepSettingsSheet";
import StepWeek from "./StepWeek";
import {
  buzz,
  caloriesEstimate,
  distanceKmEstimate,
  estimateBasis,
  formatDistanceKm,
  isGenericEstimate,
  loadPrefs,
  savePrefs,
} from "./stepEstimates";
import { C, CARD_STYLE, THEME_CSS } from "./stepTheme";

const TAP_GUARD_MS = 350;
/** Screen-reader milestones are deliberately coarse — never one per step. */
const A11Y_MILESTONE = 1000;

/* --------------------------------- pieces --------------------------------- */

function StatTile({ value, label, estimate }) {
  return (
    <div
      className="sc3-in flex min-h-[5rem] flex-col justify-center gap-1 rounded-xl px-4 py-3"
      style={CARD_STYLE}
    >
      <span
        className="text-[22px] font-bold leading-none tabular-nums"
        style={{ color: C.ink }}
      >
        {value}
      </span>
      <span className="flex items-baseline gap-1.5 text-[14px]" style={{ color: C.muted }}>
        {label}
        {estimate ? (
          <>
            <span
              aria-hidden="true"
              className="rounded px-1.5 py-px text-[12px] font-bold uppercase tracking-wide"
              style={{ background: C.chip, color: C.inkSoft }}
            >
              est
            </span>
            <span className="sr-only">(estimated)</span>
          </>
        ) : null}
      </span>
    </div>
  );
}

function ActionButton({ tone = "primary", onClick, icon, children, ...rest }) {
  const style =
    tone === "primary"
      ? { background: C.accent, color: C.accentInk, boxShadow: "var(--sc3-shadow-md)" }
      : { background: C.card, color: C.ink, border: `1px solid ${C.border}` };
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-14 w-full items-center justify-center gap-2.5 rounded-lg text-[17px] font-bold transition-transform active:scale-[.985] motion-reduce:transition-none md:h-12 md:text-[16px]"
      style={style}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}

/* -------------------------------- component -------------------------------- */

export default function StepAppV2({ counter }) {
  const {
    hydrated,
    todaySteps,
    activeMs,
    goal,
    progress,
    status,
    sensorMode,
    errorMsg,
    last7,
    streak,
    voiceEnabled,
    voiceInterval,
    setVoiceEnabled,
    setVoiceInterval,
    setGoal,
    start,
    pause,
    resume,
    stop,
    save,
    resetToday,
  } = counter;

  /* ------------------------------ local state ----------------------------- */

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  // Read straight through on the first render — the runtime is mounted with
  // `ssr: false`, so there is no server markup to mismatch.
  const [prefs, setPrefs] = useState(loadPrefs);
  const [liveMessage, setLiveMessage] = useState("");

  const lastTapRef = useRef(0);
  const savedTimerRef = useRef(0);
  const returnFocusRef = useRef(null);
  const prefsLoadedRef = useRef(false);

  useEffect(() => {
    // Skip the write that would only echo what we just read.
    if (!prefsLoadedRef.current) {
      prefsLoadedRef.current = true;
      return;
    }
    savePrefs(prefs);
  }, [prefs]);

  // last7 is rebuilt when useStepCounter's day key rolls over, so the caption
  // corrects itself at midnight instead of showing yesterday all night.
  const dayKey = last7?.[last7.length - 1]?.key;
  const today = useMemo(
    () =>
      typeof window === "undefined"
        ? ""
        : new Date().toLocaleDateString(undefined, {
            weekday: "long",
            day: "numeric",
            month: "long",
          }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dayKey],
  );

  /* ---------------------------- honest sensor state ------------------------ */

  const capability = useMotionCapability();
  const blocked = Boolean(errorMsg);
  const noSensor = capability === "none";
  const running = status === "tracking";
  const counting = running && sensorMode === "motion" && !blocked;
  const { silent } = useMotionLiveness(counting);
  const noSignal = counting && silent;
  const { gapMs, clear: clearGap } = useHiddenGap(running);

  // The wake lock finally does something: it is held exactly while a session
  // can actually count. It is deliberately NOT held on a device with no sensor.
  const wake = useWakeLock(counting);

  const voice = useVoiceCoach({
    steps: todaySteps,
    tracking: counting,
    enabled: voiceEnabled,
    interval: voiceInterval,
  });

  /* ---------------------------- milestone feedback ------------------------- */

  const milestoneRef = useRef(null);
  const goalAnnouncedRef = useRef(false);

  useEffect(() => {
    if (!hydrated) return;
    const size = Math.max(A11Y_MILESTONE, voiceInterval || A11Y_MILESTONE);
    const current = Math.floor(todaySteps / size) * size;

    // First run after hydration seeds the bookkeeping so a restored day never
    // announces itself on page load.
    if (milestoneRef.current === null) {
      milestoneRef.current = current;
      goalAnnouncedRef.current = progress >= 100;
      return;
    }
    if (current < milestoneRef.current) {
      milestoneRef.current = current;
      goalAnnouncedRef.current = progress >= 100;
      return;
    }
    if (current > milestoneRef.current) {
      milestoneRef.current = current;
      setLiveMessage(`${formatNumber(current)} steps`);
      if (prefs.haptics) buzz(30);
    }
    if (progress >= 100 && !goalAnnouncedRef.current) {
      goalAnnouncedRef.current = true;
      setLiveMessage(`Daily goal reached — ${formatNumber(goal)} steps`);
      if (prefs.haptics) buzz([30, 60, 30]);
    }
  }, [hydrated, todaySteps, voiceInterval, progress, goal, prefs.haptics]);

  /* -------------------------------- actions -------------------------------- */

  const tapOk = () => {
    const now = Date.now();
    if (now - lastTapRef.current < TAP_GUARD_MS) return false;
    lastTapRef.current = now;
    return true;
  };

  const onPrimary = () => {
    if (!tapOk()) return;
    if (blocked && status === "tracking") {
      // Nothing is being counted, so the only honest thing this button can do
      // is end the session rather than "pause" a session that never ran.
      stop();
      setLiveMessage("Session stopped");
      return;
    }
    if (status === "tracking") {
      pause();
      setLiveMessage("Paused");
      return;
    }
    if (status === "paused") {
      resume();
      // announce() runs inside the tap handler so iOS's user-gesture
      // requirement for speech is satisfied.
      voice.announce("Step tracking resumed.");
      setLiveMessage("Counting");
      return;
    }
    start();
    // Speech must be triggered inside the tap for iOS, but the permission
    // outcome is not known yet — so say what we are doing, not that it worked.
    // The live region below follows the real state once it settles.
    if (capability !== "none") voice.announce("Starting step tracking.");
  };

  const onFinish = () => {
    if (!tapOk()) return;
    stop();
    setLiveMessage("Session finished");
  };

  const onRetry = () => {
    if (!tapOk()) return;
    // A denied permission leaves status === "tracking", and start() opens with
    // an early return on exactly that, so calling it alone did nothing at all.
    stop();
    start();
  };

  const onSave = () => {
    save();
    setJustSaved(true);
    voice.announce("Progress saved.");
    window.clearTimeout(savedTimerRef.current);
    savedTimerRef.current = window.setTimeout(() => setJustSaved(false), 1800);
  };

  useEffect(() => () => window.clearTimeout(savedTimerRef.current), []);

  const closeSettings = useCallback(() => {
    setSettingsOpen(false);
    const el = returnFocusRef.current;
    if (el && typeof el.focus === "function") el.focus();
  }, []);

  const openSettings = () => {
    returnFocusRef.current = typeof document !== "undefined" ? document.activeElement : null;
    setSettingsOpen(true);
  };

  const onReset = () => {
    if (!tapOk()) return;
    resetToday();
    voice.announce("Tracking has been reset.");
    setLiveMessage("Today reset to zero");
    closeSettings();
  };

  const onToggleVoice = () => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    if (next) {
      // force: the enabled flag has not round-tripped through state yet.
      voice.announce("Voice announcements on.", { force: true });
    } else {
      voice.hush();
    }
  };

  const onPrefChange = (field, raw) => {
    const trimmed = String(raw).trim();
    const value = trimmed === "" ? null : Number(trimmed);
    setPrefs((prev) => ({
      ...prev,
      [field]: Number.isFinite(value) ? value : null,
    }));
  };

  const onToggleHaptics = () => {
    setPrefs((prev) => {
      const next = { ...prev, haptics: !prev.haptics };
      if (next.haptics) buzz(25);
      return next;
    });
  };

  /* -------------------------------- derived -------------------------------- */

  const distance = useMemo(
    () => formatDistanceKm(distanceKmEstimate(todaySteps, prefs.heightCm)),
    [todaySteps, prefs.heightCm],
  );
  const calories = useMemo(
    () => caloriesEstimate(todaySteps, prefs.weightKg),
    [todaySteps, prefs.weightKg],
  );

  // The label describes what is actually happening. A session that cannot count
  // never says "Tracking…" — that was the old screen's worst lie, and on iOS it
  // was the most common path.
  const ringLabel = running
    ? blocked
      ? "Not counting"
      : sensorMode !== "motion"
        ? "No sensor"
        : noSignal
          ? "Waiting for motion"
          : "Counting"
    : status === "paused"
      ? "Paused"
      : "Today";

  const playIcon = <Play size={20} fill="currentColor" strokeWidth={0} aria-hidden="true" />;

  const primary =
    blocked && running
      ? {
          // "Pause" would be theatre when nothing is being counted.
          label: "Stop",
          icon: <Square size={17} fill="currentColor" strokeWidth={0} aria-hidden="true" />,
        }
      : status === "tracking"
        ? {
            label: "Pause",
            icon: <Pause size={20} fill="currentColor" strokeWidth={0} aria-hidden="true" />,
          }
        : status === "paused"
          ? { label: "Resume", icon: playIcon }
          : {
              label: status === "stopped" ? "Start again" : "Start counting",
              icon: playIcon,
            };

  const idle = status === "idle" || status === "stopped";
  const deviceCannotCount = noSensor && idle;

  const needsPermission = capability === "permission" && idle && !blocked;

  const hint = noSensor
    ? "Nothing can be counted on this device — your goal and history are still saved in this browser."
    : status === "paused"
      ? "Paused — nothing is being counted right now."
      : blocked
        ? "Nothing is being counted until motion access is allowed."
        : counting
          ? wake.active
            ? "Screen kept on. Counting only works while this page is in front — switching apps stops it."
            : "Keep this page on screen. Counting stops if the screen sleeps or you switch apps."
          : needsPermission
          ? // iOS gates the sensor behind a prompt that only appears inside a tap.
            // Saying so first is the difference between a considered Allow and a
            // reflexive Don't Allow, which is the one choice we cannot undo.
              "Your phone will ask for motion access — tap Allow, or nothing can be counted. Then keep this page on screen; pocket or hand is fine."
            : "Counting needs this page open with the screen on. Pocket or hand is fine — just don't switch away.";

  const canSave = todaySteps > 0 || (activeMs || 0) > 0;
  const canReset = todaySteps > 0 || (activeMs || 0) > 0 || status !== "idle";

  const app = {
    voice,
    voiceEnabled,
    voiceInterval,
    onToggleVoice,
    onPickInterval: setVoiceInterval,
    goal,
    onGoalDelta: (delta) => setGoal(goal + delta),
    onGoalPreset: (value) => setGoal(value),
    prefs,
    onPrefChange,
    onToggleHaptics,
    status,
    canSave,
    canReset,
    justSaved,
    onSave,
    onReset,
  };

  /* --------------------------------- notice -------------------------------- */

  let notice = null;
  if (blocked) {
    notice = (
      <StepNotice
        tone="danger"
        title="Motion access is blocked"
        actions={
          <>
            <button
              type="button"
              onClick={onRetry}
              className="h-11 rounded-lg px-4 text-[14px] font-bold"
              style={{ background: C.accent, color: C.accentInk }}
            >
              Ask again
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="h-11 rounded-lg px-4 text-[14px] font-bold"
              style={{ background: C.card, color: C.ink, border: `1px solid ${C.border}` }}
            >
              Reload page
            </button>
          </>
        }
      >
        <p>
          {errorMsg} Nothing is being counted, and your total will stay where it is.
        </p>
        <p className="pt-2">
          On iPhone, switch on <strong>Motion &amp; Orientation Access</strong> in
          Settings → Safari (under Advanced on newer versions) and reload. In Chrome,
          open the site settings from the address bar and allow <strong>Motion sensors</strong>.
        </p>
      </StepNotice>
    );
  } else if (noSensor) {
    notice = (
      <StepNotice tone="device" title="Step counting needs a phone">
        <p>
          This device has no motion sensor we can read, so the counter would sit at zero.
          Open this page on your phone and it will count. You can still set your goal and
          read your history here.
        </p>
      </StepNotice>
    );
  } else if (noSignal) {
    notice = (
      <StepNotice
        tone="warning"
        title="No motion data is arriving"
        actions={
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="h-11 rounded-lg px-4 text-[14px] font-bold"
            style={{ background: C.accent, color: C.accentInk }}
          >
            Reload page
          </button>
        }
      >
        <p>
          Permission looks fine, but this browser has not sent a single motion reading
          since you started, so nothing can be counted. Reloading usually fixes it. If it
          does not, open this page in your phone&apos;s normal browser — in-app browsers
          inside social apps often block the sensor.
        </p>
      </StepNotice>
    );
  } else if (gapMs > 0) {
    notice = (
      <StepNotice
        tone="info"
        title="Steps were missed while you were away"
        onDismiss={clearGap}
      >
        <p>
          This page was in the background for about {formatGap(gapMs)}. Browsers stop
          sending motion data then, so those steps could not be counted. Everything else
          is unchanged.
        </p>
      </StepNotice>
    );
  }

  /* --------------------------------- render -------------------------------- */

  return (
    <div className="sc3-scope">
      <style>{THEME_CSS}</style>

      <div
        className="sc3-app mx-auto flex w-full max-w-[30rem] flex-col md:max-w-[64rem]"
        style={{ color: C.ink }}
      >
        {/* header */}
        <header className="flex flex-none items-center justify-between gap-3 pb-3">
          <div className="min-w-0">
            <h2 className="text-[17px] font-bold leading-tight" style={{ color: C.ink }}>
              Step counter
            </h2>
            <p className="truncate text-[14px]" style={{ color: C.muted }}>
              {today || "Today"}
            </p>
          </div>
          <button
            type="button"
            aria-label="Settings"
            aria-haspopup="dialog"
            aria-expanded={settingsOpen}
            onClick={openSettings}
            className="flex h-11 w-11 flex-none items-center justify-center rounded-full transition-transform active:scale-95 motion-reduce:transition-none"
            style={{ background: C.chip, color: C.chipInk }}
          >
            <Settings2 size={19} aria-hidden="true" />
          </button>
        </header>

        <div className="sc3-layout">
          {notice ? <div className="sc3-a-notice">{notice}</div> : null}

          {/* the count is the page */}
          <div className="sc3-a-ring py-1">
            <StepRing
              steps={todaySteps}
              goal={goal}
              progress={progress}
              label={ringLabel}
              live={counting && !noSignal}
            />
          </div>

          {/* One primary action, directly under the count so it lands in the
              thumb arc on the first screenful — and in normal flow, so it can
              never sit on top of anything. */}
          <div className="sc3-a-bar">
            {deviceCannotCount ? (
              <ActionButton tone="secondary" onClick={onPrimary}>
                Start anyway
              </ActionButton>
            ) : (
              <ActionButton onClick={onPrimary} icon={primary.icon}>
                {primary.label}
              </ActionButton>
            )}

            {status === "paused" ? (
              <button
                type="button"
                onClick={onFinish}
                className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-lg text-[15px] font-semibold"
                style={{ color: C.inkSoft }}
              >
                <Square size={15} fill="currentColor" strokeWidth={0} aria-hidden="true" />
                Finish session
              </button>
            ) : null}

            <p className="pt-2 text-[14px] leading-relaxed" style={{ color: C.muted }}>
              {hint}
            </p>
          </div>

          {/* everything else */}
          <div className="sc3-a-side sc3-side">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatTile value={formatActiveTime(activeMs)} label="active" />
              <StatTile
                value={formatNumber(stepsRemaining(goal, todaySteps))}
                label="to go"
              />
              <StatTile value={distance} label="km" estimate />
              <StatTile value={formatNumber(calories)} label="kcal" estimate />
            </div>

            <p className="text-[14px] leading-relaxed" style={{ color: C.muted }}>
              Distance and calories are estimates worked out from your step count — not
              measurements.{" "}
              {isGenericEstimate(prefs) ? (
                <button
                  type="button"
                  onClick={openSettings}
                  className="font-semibold underline underline-offset-2"
                  style={{ color: C.accentText }}
                >
                  Add your height and weight
                </button>
              ) : (
                <>
                  {
                    {
                      both: "Based on the height and weight you entered.",
                      height:
                        "Distance uses the height you entered; calories still assume 70 kg.",
                      weight:
                        "Calories use the weight you entered; distance still assumes an average step.",
                    }[estimateBasis(prefs)]
                  }
                </>
              )}
            </p>

            <div className="rounded-xl p-4" style={CARD_STYLE}>
              <StepWeek last7={last7} goal={goal} hydrated={hydrated} />
            </div>

            <div className="rounded-xl p-4" style={CARD_STYLE}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[15px] font-bold" style={{ color: C.ink }}>
                  Current streak
                </span>
                <span className="text-[22px] font-bold tabular-nums" style={{ color: C.ink }}>
                  {formatNumber(streak)}
                </span>
              </div>
              <p className="pt-1 text-[14px]" style={{ color: C.muted }}>
                {streak > 0
                  ? "Days in a row with at least one step recorded in this browser."
                  : "No streak yet — record a step today to start one."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Milestones only. The live count is never announced step by step. */}
      <p role="status" aria-live="polite" className="sr-only">
        {liveMessage}
      </p>

      <StepSettingsSheet app={app} open={settingsOpen} onClose={closeSettings} />
    </div>
  );
}
