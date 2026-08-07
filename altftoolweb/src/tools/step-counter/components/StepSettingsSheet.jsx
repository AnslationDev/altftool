"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Lock, Minus, Plus, X } from "lucide-react";
import { ACHIEVEMENTS, MAX_GOAL, MIN_GOAL, VOICE_INTERVALS, formatNumber } from "../utils/stepStore";
import {
  MAX_HEIGHT_CM,
  MAX_WEIGHT_KG,
  MIN_HEIGHT_CM,
  MIN_WEIGHT_KG,
  supportsVibration,
} from "./stepEstimates";
import { C } from "./stepTheme";

/**
 * Settings — a bottom sheet on a phone, a centred dialog on a wide screen.
 * Same content, same code; the only difference is where it sits.
 *
 * The sensor error used to live in here, behind a closed sheet. It does not any
 * more — errors are states on the screen itself. What is left is preference,
 * which is what a settings panel is for.
 */

const GOAL_PRESETS = [5000, 7500, 10000, 12500];

function Section({ title, hint, children }) {
  return (
    <section className="pt-1">
      <h3 className="text-[14px] font-bold uppercase tracking-[.06em]" style={{ color: C.muted }}>
        {title}
      </h3>
      {hint ? (
        <p className="pt-1 text-[14px] leading-relaxed" style={{ color: C.muted }}>
          {hint}
        </p>
      ) : null}
      <div className="pt-3">{children}</div>
    </section>
  );
}

function Toggle({ checked, disabled, label, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className="relative h-8 w-[52px] flex-none rounded-full transition-colors disabled:opacity-40 motion-reduce:transition-none before:absolute before:-inset-y-1.5 before:inset-x-0 before:content-['']"
      style={{ background: checked && !disabled ? C.accent : "var(--sc3-toggle-off)" }}
    >
      <span
        className="absolute left-0 top-1 h-6 w-6 rounded-full transition-transform motion-reduce:transition-none"
        style={{
          background: "var(--sc3-card)",
          boxShadow: "var(--sc3-shadow)",
          transform: checked && !disabled ? "translateX(24px)" : "translateX(4px)",
        }}
      />
    </button>
  );
}

function NumberField({ id, label, suffix, value, placeholder, min, max, onChange }) {
  return (
    <label htmlFor={id} className="flex flex-1 flex-col gap-1.5">
      <span className="text-[14px] font-semibold" style={{ color: C.inkSoft }}>
        {label}
      </span>
      <span className="relative flex items-center">
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={value ?? ""}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full rounded-lg pl-3 pr-11 text-[15px] font-semibold tabular-nums"
          style={{
            background: "var(--sc3-card)",
            border: `1px solid ${C.border}`,
            color: C.ink,
          }}
        />
        <span
          className="pointer-events-none absolute right-3 text-[14px] font-semibold"
          style={{ color: C.muted }}
        >
          {suffix}
        </span>
      </span>
    </label>
  );
}

export function SettingsBody({ app, onClose }) {
  const {
    voice,
    voiceEnabled,
    voiceInterval,
    onToggleVoice,
    onPickInterval,
    goal,
    onGoalDelta,
    onGoalPreset,
    prefs,
    onPrefChange,
    onToggleHaptics,
    status,
    canReset,
    canSave,
    justSaved,
    onSave,
    onReset,
    achievements,
  } = app;

  const unlockedCount = Object.keys(achievements || {}).length;

  const closeRef = useRef(null);
  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  // "Reset today" permanently discards today's recorded steps and active
  // time with no undo, so a single accidental tap (easy mid-walk, inside a
  // settings sheet) must not be enough — the first tap arms a short-lived
  // confirm state, and only a second tap within the window actually resets.
  const RESET_CONFIRM_MS = 3000;
  const [confirmingReset, setConfirmingReset] = useState(false);
  const resetTimerRef = useRef(0);

  useEffect(() => () => window.clearTimeout(resetTimerRef.current), []);

  const handleResetClick = () => {
    if (!confirmingReset) {
      setConfirmingReset(true);
      resetTimerRef.current = window.setTimeout(() => setConfirmingReset(false), RESET_CONFIRM_MS);
      return;
    }
    window.clearTimeout(resetTimerRef.current);
    setConfirmingReset(false);
    onReset();
  };

  const haptics = supportsVibration();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[17px] font-bold" style={{ color: C.ink }}>
          Settings
        </h2>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close settings"
          className="flex h-11 w-11 items-center justify-center rounded-full transition-transform active:scale-95 motion-reduce:transition-none"
          style={{ background: C.chip, color: C.chipInk }}
        >
          <X size={18} strokeWidth={2.4} aria-hidden="true" />
        </button>
      </div>

      <Section title="Daily goal">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Lower goal by 500 steps"
            disabled={goal <= MIN_GOAL}
            onClick={() => onGoalDelta(-500)}
            className="flex h-11 w-11 flex-none items-center justify-center rounded-full transition-transform active:scale-95 disabled:opacity-40 motion-reduce:transition-none"
            style={{ background: C.chip, color: C.chipInk }}
          >
            <Minus size={18} strokeWidth={2.6} aria-hidden="true" />
          </button>
          <span
            className="min-w-[6rem] text-center text-[19px] font-bold tabular-nums"
            style={{ color: C.ink }}
            aria-live="off"
          >
            {formatNumber(goal)}
          </span>
          <button
            type="button"
            aria-label="Raise goal by 500 steps"
            disabled={goal >= MAX_GOAL}
            onClick={() => onGoalDelta(500)}
            className="flex h-11 w-11 flex-none items-center justify-center rounded-full transition-transform active:scale-95 disabled:opacity-40 motion-reduce:transition-none"
            style={{ background: C.chip, color: C.chipInk }}
          >
            <Plus size={18} strokeWidth={2.6} aria-hidden="true" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2 pt-3">
          {GOAL_PRESETS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onGoalPreset(n)}
              aria-pressed={goal === n}
              className="h-11 rounded-full px-4 text-[14px] font-bold tabular-nums transition-transform active:scale-[.97] motion-reduce:transition-none"
              style={
                goal === n
                  ? { background: C.accent, color: C.accentInk }
                  : { background: C.chip, color: C.chipInk }
              }
            >
              {formatNumber(n)}
            </button>
          ))}
        </div>
      </Section>

      <Section
        title="Your body (optional)"
        hint="Distance and calories are estimates from your step count. Add these and they are estimated for you instead of for an average adult. Stored on this device only."
      >
        <div className="flex gap-3">
          <NumberField
            id="sc3-height"
            label="Height"
            suffix="cm"
            min={MIN_HEIGHT_CM}
            max={MAX_HEIGHT_CM}
            placeholder="—"
            value={prefs.heightCm}
            onChange={(v) => onPrefChange("heightCm", v)}
          />
          <NumberField
            id="sc3-weight"
            label="Weight"
            suffix="kg"
            min={MIN_WEIGHT_KG}
            max={MAX_WEIGHT_KG}
            placeholder="—"
            value={prefs.weightKg}
            onChange={(v) => onPrefChange("weightKg", v)}
          />
        </div>
      </Section>

      <Section title="Voice and haptics">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[15px] font-semibold" style={{ color: C.ink }}>
              Spoken milestones
            </div>
            <div className="text-[14px]" style={{ color: C.muted }}>
              {voice.supported
                ? "Says your total out loud while you walk"
                : "Not supported in this browser"}
            </div>
          </div>
          <Toggle
            checked={voiceEnabled}
            disabled={!voice.supported}
            label="Spoken milestones"
            onChange={onToggleVoice}
          />
        </div>

        <div className="pt-4">
          <div className="pb-2 text-[14px] font-semibold" style={{ color: C.inkSoft }}>
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
                  className="h-11 min-w-[4rem] rounded-full px-3 text-[14px] font-bold tabular-nums transition-transform active:scale-[.97] disabled:opacity-40 motion-reduce:transition-none"
                  style={
                    selected
                      ? { background: C.accent, color: C.accentInk }
                      : { background: C.chip, color: C.chipInk }
                  }
                >
                  {formatNumber(n)}
                </button>
              );
            })}
            <span className="self-center text-[14px]" style={{ color: C.muted }}>
              steps
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-4">
          <div className="min-w-0">
            <div className="text-[15px] font-semibold" style={{ color: C.ink }}>
              Buzz on milestones
            </div>
            <div className="text-[14px]" style={{ color: C.muted }}>
              {haptics
                ? "A short vibration every 1,000 steps — never on every step"
                : "This device has no vibration API"}
            </div>
          </div>
          <Toggle
            checked={prefs.haptics}
            disabled={!haptics}
            label="Buzz on milestones"
            onChange={onToggleHaptics}
          />
        </div>
      </Section>

      <Section
        title="Your progress"
        hint={
          status === "paused"
            ? "Paused. Save keeps your steps; Reset starts today over."
            : "Steps are saved automatically on this device and are still here next time."
        }
      >
        <div className="flex gap-3">
          <button
            type="button"
            disabled={!canSave || justSaved}
            onClick={onSave}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg text-[15px] font-bold transition-transform active:scale-[.98] disabled:opacity-50 motion-reduce:transition-none"
            style={{ background: C.accent, color: C.accentInk }}
          >
            {justSaved ? (
              <>
                <Check size={17} strokeWidth={3} aria-hidden="true" />
                Saved
              </>
            ) : (
              "Save"
            )}
          </button>
          <button
            type="button"
            disabled={!canReset}
            onClick={handleResetClick}
            aria-label={confirmingReset ? "Tap again to confirm resetting today's steps" : "Reset today"}
            className="h-12 flex-1 rounded-lg text-[15px] font-bold transition-transform active:scale-[.98] disabled:opacity-40 motion-reduce:transition-none"
            style={
              confirmingReset
                ? { background: C.dangerText, color: C.accentInk }
                : { background: C.dangerSoft, color: C.dangerText }
            }
          >
            {confirmingReset ? "Tap again to confirm" : "Reset today"}
          </button>
        </div>
      </Section>

      <Section
        title="Achievements"
        hint={`${unlockedCount} of ${ACHIEVEMENTS.length} unlocked — based on the steps, streaks and active days saved on this device.`}
      >
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {ACHIEVEMENTS.map((def) => {
            const isUnlocked = Boolean(achievements?.[def.id]);
            return (
              <li
                key={def.id}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5"
                style={{
                  background: isUnlocked ? C.chip : "transparent",
                  border: `1px solid ${C.border}`,
                  opacity: isUnlocked ? 1 : 0.55,
                }}
              >
                {isUnlocked ? (
                  <Check
                    size={16}
                    strokeWidth={2.6}
                    aria-hidden="true"
                    className="flex-none"
                    style={{ color: C.accentText }}
                  />
                ) : (
                  <Lock size={16} strokeWidth={2.2} aria-hidden="true" className="flex-none" style={{ color: C.muted }} />
                )}
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-semibold" style={{ color: C.ink }}>
                    {def.name}
                  </div>
                  <div className="truncate text-[12px]" style={{ color: C.muted }}>
                    {def.description}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Section>
    </div>
  );
}

/**
 * One dialog for both breakpoints: docked to the bottom edge on a phone (with
 * the home-indicator inset respected), centred on a wide screen.
 */
export default function StepSettingsSheet({ app, open, onClose }) {
  const panelRef = useRef(null);

  // Escape closes; Tab stays inside; the page behind does not scroll.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = panel.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), [href], select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      <button
        type="button"
        aria-label="Close settings"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default motion-safe:[animation:sc3Fade_.18s_ease]"
        style={{ background: "var(--sc3-backdrop)" }}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Step counter settings"
        className="relative max-h-[88svh] w-full max-w-[34rem] overflow-y-auto overscroll-contain rounded-t-xl p-5 motion-safe:[animation:sc3Up_.24s_ease] md:max-h-[84svh] md:rounded-xl"
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          boxShadow: "var(--sc3-shadow-lg)",
          paddingBottom: "max(1.75rem, env(safe-area-inset-bottom))",
        }}
      >
        <div
          aria-hidden="true"
          className="mx-auto mb-4 h-1.5 w-11 rounded-full md:hidden"
          style={{ background: "var(--sc3-handle)" }}
        />
        <SettingsBody app={app} onClose={onClose} />
      </div>
    </div>
  );
}
