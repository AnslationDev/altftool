"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Gamepad2, Pause, Play, RotateCcw } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

import {
  BREAK_DISTANCE_METRES,
  FORMAT_PRESETS,
  MIN_BREAK_SECONDS,
  PHASE_KINDS,
  RULE_INTERVAL_SECONDS,
  STAND_UP_INTERVAL_MINUTES,
  buildGamerPlan,
  formatClock,
  phaseAt,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const WHOLE = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const text = String(raw).trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [sessionMinutes, setSessionMinutes] = useState("120");
  const [matchMinutes, setMatchMinutes] = useState("12");
  const [lobbySeconds, setLobbySeconds] = useState("60");
  const [presetId, setPresetId] = useState("shooter");
  const [elapsed, setElapsed] = useState(0);
  const [anchor, setAnchor] = useState(null);
  const { copy, isCopied, announcement } = useCopyToClipboard();

  const plan = useMemo(() => {
    const values = {
      sessionMinutes: toNumber(sessionMinutes),
      matchMinutes: toNumber(matchMinutes),
      lobbySeconds: toNumber(lobbySeconds),
    };
    if (Object.values(values).some((value) => Number.isNaN(value))) {
      return { error: "Enter a number in every field." };
    }
    return buildGamerPlan(values);
  }, [sessionMinutes, matchMinutes, lobbySeconds]);

  const hasError = Boolean(plan.error);
  const totalSeconds = hasError ? 0 : plan.totalSeconds;
  const running = Boolean(anchor);

  useEffect(() => {
    if (!anchor) return undefined;
    const id = setInterval(() => {
      const next = anchor.base + (Date.now() - anchor.at) / 1000;
      setElapsed(next > totalSeconds ? totalSeconds : next);
    }, 200);
    return () => clearInterval(id);
  }, [anchor, totalSeconds]);

  useEffect(() => {
    if (anchor && elapsed >= totalSeconds) setAnchor(null);
  }, [anchor, elapsed, totalSeconds]);

  useEffect(() => {
    setAnchor(null);
    setElapsed(0);
  }, [sessionMinutes, matchMinutes, lobbySeconds]);

  const current = useMemo(
    () => (hasError ? null : phaseAt(plan.phases, elapsed)),
    [hasError, plan.phases, elapsed],
  );

  const resting = current && current.phase && current.phase.kind === PHASE_KINDS.BREAK;

  const applyPreset = (preset) => {
    setPresetId(preset.id);
    setMatchMinutes(String(preset.matchMinutes));
    setLobbySeconds(String(preset.lobbySeconds));
  };

  const toggleRun = () => {
    if (hasError) return;
    if (running) {
      setAnchor(null);
      return;
    }
    const base = elapsed >= totalSeconds ? 0 : elapsed;
    setElapsed(base);
    setAnchor({ at: Date.now(), base });
  };

  const restart = () => {
    setAnchor(null);
    setElapsed(0);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Gamer eye break plan",
      `Session: ${formatClock(plan.totalSeconds)}`,
      `Match: ${NUM.format(plan.matchSeconds / 60)} minutes, lobby ${plan.lobbySeconds} seconds`,
      `Break after every ${plan.matchesPerBreak} match${plan.matchesPerBreak === 1 ? "" : "es"}`,
      `Matches in the session: ${plan.matches} (${plan.matchesPerHour} per hour)`,
      `Eye breaks: ${plan.breaks}, totalling ${formatClock(plan.breakSecondsTotal)}`,
      `Longest unbroken screen run: ${plan.longestRunMinutes} minutes`,
      plan.withinRule
        ? "This schedule keeps every screen run inside the 20 minute rule."
        : `Match format overshoots the 20 minute rule by ${plan.overshootMinutes} minutes.`,
      `Stand-up breaks suggested: ${plan.standUpBreaks}`,
    ].join("\n");
  }, [hasError, plan]);

  const copyResult = () => {
    if (!summary) return;
    copy("plan", summary, { label: "gamer eye break plan" });
  };

  const reset = () => {
    if (!window.confirm("Reset every setting and stop the current timer? This cannot be undone.")) {
      return;
    }
    setSessionMinutes("120");
    setMatchMinutes("12");
    setLobbySeconds("60");
    setPresetId("shooter");
    setAnchor(null);
    setElapsed(0);
  };

  const progressPercent = hasError ? 0 : Math.round(current.overallProgress * 100);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Gamepad2 className="h-4 w-4" aria-hidden="true" />
          Eye care for gaming
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Gamer Eye Break Timer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A break prompt in the middle of a ranked round is useless, so this puts every break in the
          lobby. It works out how many matches fit inside a {RULE_INTERVAL_SECONDS / 60} minute
          window, and says plainly when a long match format cannot meet the rule at all.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Match format</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {FORMAT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset)}
              aria-pressed={presetId === preset.id}
              className={`min-h-11 rounded-md border px-3 py-2 text-left text-sm transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                presetId === preset.id
                  ? "border-[var(--primary)] bg-[var(--primary)]/10"
                  : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
              }`}
            >
              <span className="block font-semibold text-[var(--foreground)]">{preset.name}</span>
              <span className="block text-xs text-[var(--muted-foreground)]">
                about {preset.matchMinutes} min · {preset.lobbySeconds}s lobby
              </span>
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="geb-session">
              Session length (minutes)
            </label>
            <input
              id="geb-session"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="15"
              max="600"
              step="15"
              value={sessionMinutes}
              onChange={(event) => setSessionMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="geb-match">
              Match length (minutes)
            </label>
            <input
              id="geb-match"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="90"
              step="1"
              value={matchMinutes}
              onChange={(event) => {
                setMatchMinutes(event.target.value);
                setPresetId("custom");
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="geb-lobby">
              Lobby and queue time (seconds)
            </label>
            <input
              id="geb-lobby"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="600"
              step="5"
              value={lobbySeconds}
              onChange={(event) => {
                setLobbySeconds(event.target.value);
                setPresetId("custom");
              }}
            />
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      ) : null}

      <section
        className={`mt-6 rounded-xl p-5 ring-1 ${
          resting ? "bg-[var(--primary)]/10 ring-[var(--primary)]" : "bg-[var(--card)] ring-[var(--border)]"
        }`}
      >
        <p
          aria-live="polite"
          role="status"
          className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]"
        >
          {hasError ? "Timer unavailable" : current.phase.label}
        </p>
        <p
          className={`mt-1 text-5xl font-semibold tabular-nums ${
            resting ? "text-[var(--primary)]" : "text-[var(--foreground)]"
          }`}
        >
          {hasError ? DASH : formatClock(Math.ceil(current.remaining))}
        </p>
        <p aria-live="polite" role="status" className="mt-1 text-sm text-[var(--muted-foreground)]">
          {hasError ? "Fix the inputs above to start the timer." : current.phase.hint}
        </p>

        <div
          className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressPercent}
          aria-label="Session progress"
        >
          <span
            className="block h-full bg-[var(--primary)] transition-[width] duration-200 motion-reduce:transition-none"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          {hasError
            ? DASH
            : `${current.breaksTaken} of ${plan.breaks} breaks taken · ${formatClock(Math.floor(elapsed))} of ${formatClock(plan.totalSeconds)}`}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={toggleRun}
            disabled={hasError}
            aria-label={running ? "Pause the gaming eye break timer" : "Start the gaming eye break timer"}
            className={`${PRIMARY_BTN} disabled:opacity-50`}
          >
            {running ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
            {running ? "Pause" : elapsed > 0 ? "Resume" : "Start"}
          </button>
          <button type="button" onClick={restart} aria-label="Restart the session" className={GHOST_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Restart
          </button>
          <button
            type="button"
            onClick={copyResult}
            aria-label={isCopied("plan") ? "Copied the break plan to clipboard" : "Copy the break plan"}
            className={GHOST_BTN}
          >
            {isCopied("plan") ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {isCopied("plan") ? "Copied!" : "Copy plan"}
          </button>
          <button type="button" onClick={reset} aria-label="Reset every setting" className={GHOST_BTN}>
            Reset all
          </button>
          <span className="sr-only" role="status" aria-live="polite">
            {announcement}
          </span>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">How this session sits against the rule</h2>
        <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Break after every",
              hasError ? DASH : `${plan.matchesPerBreak} match${plan.matchesPerBreak === 1 ? "" : "es"}`,
            ],
            ["Matches in the session", hasError ? DASH : WHOLE.format(plan.matches)],
            ["Matches per hour", hasError ? DASH : NUM.format(plan.matchesPerHour)],
            ["Eye breaks scheduled", hasError ? DASH : WHOLE.format(plan.breaks)],
            ["Total eye rest", hasError ? DASH : formatClock(plan.breakSecondsTotal)],
            [
              "Lobby long enough on its own?",
              hasError
                ? DASH
                : plan.lobbyCoversBreak
                  ? `Yes, ${plan.lobbySeconds}s`
                  : `No — ${MIN_BREAK_SECONDS - plan.lobbySeconds}s added at each break`,
            ],
            [
              "Longest unbroken screen run",
              hasError ? DASH : `${NUM.format(plan.longestRunMinutes)} minutes`,
            ],
            [
              "Suggested stand-up breaks",
              hasError ? DASH : `${WHOLE.format(plan.standUpBreaks)} (one an hour)`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && plan.matchLongerThanWindow && (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            A {NUM.format(plan.matchSeconds / 60)} minute match is longer than the{" "}
            {RULE_INTERVAL_SECONDS / 60} minute window, so no schedule keeps the rule without leaving
            a live round. The nearest you can get is looking away during death timers, respawns or the
            drafting phase, then taking the full break the moment the match ends.
          </p>
        )}

        {!hasError && !plan.matchLongerThanWindow && !plan.withinRule && (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            The longest screen run here is {NUM.format(plan.longestRunMinutes)} minutes, over the{" "}
            {RULE_INTERVAL_SECONDS / 60} minute target. Shorten the queue time or break one match
            sooner.
          </p>
        )}

        {!hasError && plan.truncated && (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning-text)]">
            This match and lobby length only build a {formatClock(plan.totalSeconds)} schedule before
            hitting the tool&apos;s phase limit, short of the {WHOLE.format(Number(sessionMinutes))} minute
            session you asked for. Increase the match or lobby length, or shorten the session, to fill
            the full time.
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Breaks that do not cost you games</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {[
            `Take the break before you requeue, not after. Once the lobby fills, those ${MIN_BREAK_SECONDS} seconds have to come out of the next round.`,
            `Look at least ${BREAK_DISTANCE_METRES} m away — a window or the far side of the room. Glancing at a phone is the same near focus on a smaller screen.`,
            "Death timers, respawn waits, drafting and map screens are the mid-match slots where you can look away without hurting your team.",
            `Stand up once an hour on top of the eye breaks — ${STAND_UP_INTERVAL_MINUTES} minutes is the usual ergonomic ceiling for one seated position.`,
            "Keep a lamp on behind the monitor. A bright screen in a fully dark room makes the pupil work against a harsh surround contrast.",
          ].map((tip) => (
            <li key={tip} className="flex gap-2">
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
              {tip}
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Breaks ease the dryness and ache of long sessions, but ongoing headaches,
        blurred vision or eye pain need an eye examination rather than a better schedule.
      </p>
    </main>
  );
}
