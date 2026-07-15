"use client";

import { useEffect, useState } from "react";
import { Minus, Pause, Play, Plus, RotateCcw, Smartphone, Zap } from "lucide-react";
import { MAX_GOAL, MIN_GOAL, formatNumber } from "../utils/stepStore";
import { CARD, FOCUS_RING } from "./ui.jsx";

const RING_SIZE = 248;
const RING_STROKE = 15;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function ProgressRing({ steps, goal, progress, isActive, onTap }) {
  const dashOffset = RING_CIRCUMFERENCE * (1 - progress / 100);
  const goalMet = progress >= 100;

  return (
    <div className="relative mx-auto w-fit">
      {/* soft brand halo behind the ring */}
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-0 scale-[1.12] rounded-full blur-2xl"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in srgb, var(--primary) 16%, transparent), transparent 70%)",
        }}
      />
      <button
        type="button"
        onClick={onTap}
        disabled={!isActive}
        title={isActive ? "Tap to add one step" : "Press Start Walking to begin"}
        aria-label={`${formatNumber(steps)} steps — ${Math.round(progress)}% of your ${formatNumber(goal)} step goal.${isActive ? " Tap to add one step." : ""}`}
        className={`relative block rounded-full outline-none transition-transform motion-safe:active:scale-[0.985] disabled:cursor-default ${FOCUS_RING}`}
        style={{ width: RING_SIZE, height: RING_SIZE }}
      >
        {isActive && (
          <span
            aria-hidden="true"
            className="absolute inset-4 rounded-full motion-safe:animate-pulse"
            style={{ backgroundColor: "color-mix(in srgb, var(--primary) 9%, transparent)" }}
          />
        )}

        <svg
          viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
          className="h-full w-full -rotate-90"
          aria-hidden="true"
          style={{
            filter: "drop-shadow(0 6px 16px color-mix(in srgb, var(--primary) 25%, transparent))",
          }}
        >
          <defs>
            <linearGradient id="altft-step-ring" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: "var(--anslation-ds-primary)" }} />
              <stop offset="100%" style={{ stopColor: "var(--anslation-ds-secondary)" }} />
            </linearGradient>
          </defs>
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            stroke="color-mix(in srgb, var(--primary) 10%, var(--muted))"
            strokeWidth={RING_STROKE}
          />
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            stroke="url(#altft-step-ring)"
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            className="motion-safe:transition-[stroke-dashoffset] motion-safe:duration-500"
          />
        </svg>

        <span className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[42px] font-extrabold leading-none tracking-tight tabular-nums text-(--foreground) sm:text-5xl">
            {formatNumber(steps)}
          </span>
          <span className="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-(--muted-foreground)">
            Steps
          </span>
          <span
            className="mt-2 rounded-full px-2.5 py-0.5 text-[11px] font-bold tabular-nums"
            style={
              goalMet
                ? {
                    backgroundColor: "var(--anslation-ds-success-soft)",
                    color: "color-mix(in srgb, var(--anslation-ds-success) 72%, var(--foreground))",
                  }
                : {
                    backgroundColor: "var(--anslation-ds-primary-soft)",
                    color:
                      "color-mix(in srgb, var(--anslation-ds-primary) 60%, var(--foreground))",
                  }
            }
          >
            {goalMet ? "Goal achieved! 🎉" : `${Math.round(progress)}% of ${formatNumber(goal)} goal`}
          </span>
        </span>
      </button>
    </div>
  );
}

function StatusChip({ isActive }) {
  return (
    <span
      className="absolute right-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur"
      style={
        isActive
          ? {
              backgroundColor:
                "color-mix(in srgb, var(--anslation-ds-success-soft) 85%, transparent)",
              borderColor: "color-mix(in srgb, var(--anslation-ds-success) 35%, transparent)",
              color: "color-mix(in srgb, var(--anslation-ds-success) 72%, var(--foreground))",
            }
          : {
              backgroundColor: "color-mix(in srgb, var(--muted) 85%, transparent)",
              borderColor: "var(--border)",
              color: "var(--muted-foreground)",
            }
      }
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${isActive ? "motion-safe:animate-pulse" : ""}`}
        style={{ backgroundColor: "currentColor" }}
      />
      {isActive ? "Active" : "Paused"}
    </span>
  );
}

const quickButton = `inline-flex h-10 items-center justify-center gap-1.5 rounded-[8px] border border-(--border) bg-(--card) px-3 text-sm font-semibold text-(--foreground) transition hover:border-[color-mix(in_srgb,var(--primary)_55%,var(--border))] hover:text-(--primary-hover) dark:hover:text-(--primary) disabled:pointer-events-none disabled:opacity-60 ${FOCUS_RING}`;

export default function TrackerCard({
  steps,
  goal,
  progress,
  isActive,
  sensorMode,
  errorMsg,
  onStart,
  onPause,
  onAddSteps,
  onSetGoal,
  onReset,
}) {
  const [goalDraft, setGoalDraft] = useState(String(goal));

  useEffect(() => {
    setGoalDraft(String(goal));
  }, [goal]);

  function handleGoalChange(event) {
    const raw = event.target.value;
    setGoalDraft(raw);
    const parsed = Number(raw);
    if (Number.isFinite(parsed) && parsed >= MIN_GOAL && parsed <= MAX_GOAL) {
      onSetGoal(parsed);
    }
  }

  function handleGoalBlur() {
    const parsed = Number(goalDraft);
    if (Number.isFinite(parsed) && goalDraft !== "") {
      onSetGoal(parsed); // the store clamps to MIN/MAX
    }
    setGoalDraft(String(goal));
  }

  function nudgeGoal(delta) {
    onSetGoal(goal + delta);
  }

  let hint = null;
  if (errorMsg) {
    hint = (
      <p
        role="alert"
        className="rounded-[8px] border px-3 py-2 text-center text-xs font-medium"
        style={{
          backgroundColor: "var(--anslation-ds-danger-soft)",
          borderColor: "color-mix(in srgb, var(--anslation-ds-danger) 35%, transparent)",
          color: "color-mix(in srgb, var(--anslation-ds-danger) 75%, var(--foreground))",
        }}
      >
        {errorMsg}
      </p>
    );
  } else if (isActive && sensorMode === "motion") {
    hint = (
      <p className="flex items-center justify-center gap-1.5 text-xs font-medium text-(--muted-foreground)">
        <Smartphone size={14} aria-hidden="true" />
        Motion tracking on — keep your phone with you while walking.
      </p>
    );
  } else if (isActive && sensorMode === "simulated") {
    hint = (
      <p className="flex items-center justify-center gap-1.5 text-xs font-medium text-(--muted-foreground)">
        <Zap size={14} aria-hidden="true" />
        Demo pace active (~2 steps/sec). Open on mobile for real step detection.
      </p>
    );
  } else {
    hint = (
      <p className="flex items-center justify-center gap-1.5 text-xs font-medium text-(--muted-foreground)">
        <Smartphone size={14} aria-hidden="true" />
        Works best on mobile — steps auto-detect from motion sensors while you walk.
      </p>
    );
  }

  return (
    <section aria-label="Step tracker" className={`relative overflow-hidden ${CARD} p-4 sm:p-6`}>
      {/* brand hairline along the top edge */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ background: "var(--anslation-ds-cta-gradient)" }}
      />
      {/* faint corner wash */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full blur-3xl"
        style={{ backgroundColor: "color-mix(in srgb, var(--primary) 7%, transparent)" }}
      />

      <StatusChip isActive={isActive} />

      <div className="relative grid items-center gap-6 pt-8 sm:pt-3 md:grid-cols-[auto_1fr] md:gap-9">
        <ProgressRing
          steps={steps}
          goal={goal}
          progress={progress}
          isActive={isActive}
          onTap={() => onAddSteps(1)}
        />

        <div className="space-y-4">
          <div>
            <label
              htmlFor="altft-step-goal"
              className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-(--muted-foreground)"
            >
              Daily Goal
            </label>
            <div
              className={`flex h-11 items-stretch overflow-hidden rounded-[8px] border border-(--border) bg-(--background) transition focus-within:border-(--primary) focus-within:[box-shadow:var(--anslation-ds-focus-ring)]`}
            >
              <button
                type="button"
                onClick={() => nudgeGoal(-500)}
                aria-label="Decrease goal by 500 steps"
                className={`flex w-10 shrink-0 items-center justify-center border-r border-(--border) text-(--muted-foreground) transition hover:bg-(--muted) hover:text-(--foreground) ${FOCUS_RING}`}
              >
                <Minus size={15} aria-hidden="true" />
              </button>
              <input
                id="altft-step-goal"
                type="number"
                inputMode="numeric"
                min={MIN_GOAL}
                max={MAX_GOAL}
                step={500}
                value={goalDraft}
                onChange={handleGoalChange}
                onBlur={handleGoalBlur}
                className="h-full w-full min-w-0 appearance-none border-0 bg-transparent px-3 text-center text-sm font-bold tabular-nums text-(--foreground) shadow-none outline-none!"
              />
              <span className="flex items-center pr-2 text-xs font-semibold text-(--muted-foreground)">
                steps
              </span>
              <button
                type="button"
                onClick={() => nudgeGoal(500)}
                aria-label="Increase goal by 500 steps"
                className={`flex w-10 shrink-0 items-center justify-center border-l border-(--border) text-(--muted-foreground) transition hover:bg-(--muted) hover:text-(--foreground) ${FOCUS_RING}`}
              >
                <Plus size={15} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onStart}
              disabled={isActive}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-[8px] px-4 text-sm font-bold text-white shadow-[0_6px_16px_color-mix(in_srgb,var(--primary)_30%,transparent)] transition hover:opacity-95 active:opacity-90 disabled:pointer-events-none disabled:opacity-60 ${FOCUS_RING}`}
              style={{ background: "var(--anslation-ds-cta-gradient)" }}
            >
              <Play size={17} aria-hidden="true" fill="currentColor" />
              Start Walking
            </button>
            <button
              type="button"
              onClick={onPause}
              disabled={!isActive}
              className={`${quickButton} h-11`}
            >
              <Pause size={17} aria-hidden="true" />
              Pause
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => onAddSteps(100)}
              className={quickButton}
              aria-label="Add 100 steps"
            >
              <Plus size={15} aria-hidden="true" />
              100<span className="hidden sm:inline">&nbsp;Steps</span>
            </button>
            <button
              type="button"
              onClick={() => onAddSteps(500)}
              className={quickButton}
              aria-label="Add 500 steps"
            >
              <Plus size={15} aria-hidden="true" />
              500<span className="hidden sm:inline">&nbsp;Steps</span>
            </button>
            <button type="button" onClick={onReset} className={quickButton}>
              <RotateCcw size={15} aria-hidden="true" />
              Reset
            </button>
          </div>

          {hint}
        </div>
      </div>
    </section>
  );
}
