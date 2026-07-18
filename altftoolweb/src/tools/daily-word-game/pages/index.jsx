"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  CornerDownLeft,
  Delete,
  Dices,
  Share2,
  Sparkles,
  Trophy,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";
import { ALLOWED, ANSWERS } from "../words";

const ROWS = 6;
const COLS = 5;
const STATS_KEY = "altf:daily-word-game:stats";
const DAILY_KEY = "altf:daily-word-game:daily";
const HARD_KEY = "altf:daily-word-game:hard";
const EPOCH_Y = 2024;
const EPOCH_M = 0;
const EPOCH_D = 1;

const KEY_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACK"],
];

const PRAISE = ["Genius!", "Magnificent!", "Impressive!", "Splendid!", "Great!", "Phew!"];

const ORDINALS = ["1st", "2nd", "3rd", "4th", "5th"];

const TONE_RANK = { absent: 1, present: 2, correct: 3 };

const TONE_STYLE = {
  correct: {
    background: "var(--anslation-ds-success)",
    borderColor: "var(--anslation-ds-success)",
    color: "var(--anslation-ds-success-soft)",
  },
  present: {
    background: "var(--anslation-ds-warning)",
    borderColor: "var(--anslation-ds-warning)",
    color: "var(--anslation-ds-warning-soft)",
  },
  absent: {
    background: "var(--muted-foreground)",
    borderColor: "var(--muted-foreground)",
    color: "var(--card)",
  },
};

const TONE_LABEL = {
  correct: "correct spot",
  present: "wrong spot",
  absent: "not in the word",
};

const EMPTY_STATS = {
  played: 0,
  wins: 0,
  currentStreak: 0,
  maxStreak: 0,
  distribution: [0, 0, 0, 0, 0, 0],
  lastDay: null,
};

function dayIndexFor(date) {
  const local = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((local - Date.UTC(EPOCH_Y, EPOCH_M, EPOCH_D)) / 86400000);
}

function answerForDay(dayIndex) {
  const size = ANSWERS.length;
  return ANSWERS[((dayIndex % size) + size) % size];
}

function evaluateGuess(guess, answer) {
  const result = new Array(COLS).fill("absent");
  const pool = {};

  for (let i = 0; i < COLS; i += 1) {
    if (guess[i] === answer[i]) result[i] = "correct";
    else pool[answer[i]] = (pool[answer[i]] || 0) + 1;
  }

  for (let i = 0; i < COLS; i += 1) {
    if (result[i] === "correct") continue;
    const letter = guess[i];
    if (pool[letter] > 0) {
      result[i] = "present";
      pool[letter] -= 1;
    }
  }

  return result;
}

function hardModeError(guess, guesses, evaluations) {
  for (let row = 0; row < guesses.length; row += 1) {
    const previous = guesses[row];
    const evaluation = evaluations[row];
    if (!evaluation) continue;

    for (let i = 0; i < COLS; i += 1) {
      if (evaluation[i] === "correct" && guess[i] !== previous[i]) {
        return `Hard mode: ${ORDINALS[i]} letter must be ${previous[i]}`;
      }
    }
    for (let i = 0; i < COLS; i += 1) {
      if (evaluation[i] === "present" && !guess.includes(previous[i])) {
        return `Hard mode: guess must use ${previous[i]}`;
      }
    }
  }
  return null;
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function readStats() {
  try {
    const raw = window.localStorage.getItem(STATS_KEY);
    if (!raw) return EMPTY_STATS;
    const parsed = JSON.parse(raw);
    const distribution = Array.isArray(parsed?.distribution) ? parsed.distribution : [];
    return {
      played: Number(parsed?.played) || 0,
      wins: Number(parsed?.wins) || 0,
      currentStreak: Number(parsed?.currentStreak) || 0,
      maxStreak: Number(parsed?.maxStreak) || 0,
      distribution: EMPTY_STATS.distribution.map((_, i) => Number(distribution[i]) || 0),
      lastDay: Number.isFinite(parsed?.lastDay) ? parsed.lastDay : null,
    };
  } catch {
    return EMPTY_STATS;
  }
}

function readDaily(dayIndex) {
  try {
    const raw = window.localStorage.getItem(DAILY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.day !== dayIndex || !Array.isArray(parsed.guesses)) return null;
    const guesses = parsed.guesses
      .filter((word) => typeof word === "string" && /^[A-Z]{5}$/.test(word))
      .slice(0, ROWS);
    const status = parsed.status === "won" || parsed.status === "lost" ? parsed.status : "playing";
    return { guesses, status };
  } catch {
    return null;
  }
}

function Tile({ letter, tone, revealed, animate, index }) {
  const style = revealed && tone ? TONE_STYLE[tone] : undefined;
  const classes = ["dwg-tile"];
  if (animate) classes.push("dwg-flip");
  else if (letter && !tone) classes.push("dwg-pop");

  return (
    <div
      className={classes.join(" ")}
      style={
        style || {
          borderColor: letter ? "var(--anslation-ds-border-strong)" : "var(--border)",
          background: "var(--background)",
          color: "var(--foreground)",
        }
      }
      aria-label={
        tone && revealed
          ? `Letter ${index + 1} ${letter}, ${TONE_LABEL[tone]}`
          : `Letter ${index + 1} ${letter || "empty"}`
      }
    >
      {letter}
    </div>
  );
}

function Board({ guesses, evaluations, current, status, revealRow, revealCount, shake }) {
  const activeRow = guesses.length;

  return (
    <div className="grid gap-1.5" role="group" aria-label="Guess board">
      {Array.from({ length: ROWS }, (_, row) => {
        const submitted = row < guesses.length;
        const word = submitted ? guesses[row] : row === activeRow && status === "playing" ? current : "";
        const evaluation = submitted ? evaluations[row] : null;
        const rowClasses = ["grid grid-cols-5 gap-1.5"];
        if (shake && row === activeRow) rowClasses.push("dwg-shake");

        return (
          <div key={row} className={rowClasses.join(" ")}>
            {Array.from({ length: COLS }, (_, col) => {
              const revealed = submitted && (row !== revealRow || col < revealCount);
              return (
                <Tile
                  key={col}
                  index={col}
                  letter={word[col] || ""}
                  tone={evaluation ? evaluation[col] : null}
                  revealed={revealed}
                  animate={revealRow === row && revealed}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function Keyboard({ keyStates, onKey, disabled }) {
  return (
    <div className="mt-5 grid gap-1.5">
      {KEY_ROWS.map((row, index) => (
        <div key={index} className="flex justify-center gap-1.5">
          {index === 1 && <span className="w-2 shrink-0" aria-hidden="true" />}
          {row.map((key) => {
            const wide = key === "ENTER" || key === "BACK";
            const tone = keyStates[key];
            return (
              <button
                key={key}
                type="button"
                disabled={disabled}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onKey(key)}
                style={
                  tone
                    ? TONE_STYLE[tone]
                    : { background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }
                }
                className={`flex h-12 items-center justify-center rounded-md border text-sm font-semibold uppercase transition hover:opacity-90 disabled:opacity-50 sm:h-14 ${
                  wide ? "flex-[1.6] px-1 text-xs" : "flex-1 px-0"
                }`}
                aria-label={key === "BACK" ? "Backspace" : key === "ENTER" ? "Enter" : `Letter ${key}`}
              >
                {key === "BACK" ? (
                  <Delete className="h-4 w-4" />
                ) : key === "ENTER" ? (
                  <CornerDownLeft className="h-4 w-4" />
                ) : (
                  key
                )}
              </button>
            );
          })}
          {index === 1 && <span className="w-2 shrink-0" aria-hidden="true" />}
        </div>
      ))}
    </div>
  );
}

function StatsPanel({ stats }) {
  const winRate = stats.played ? Math.round((stats.wins / stats.played) * 100) : 0;
  const peak = Math.max(1, ...stats.distribution);

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-[var(--primary)]" />
        <h2 className="text-sm font-semibold uppercase tracking-wide">Daily stats</h2>
      </div>
      <p className="mt-1 text-xs text-[var(--muted-foreground)]">
        Only the daily puzzle counts. Practice rounds never touch your streak.
      </p>

      <div className="tool-compact-grid mt-4">
        {[
          ["Played", stats.played],
          ["Win %", `${winRate}%`],
          ["Streak", stats.currentStreak],
          ["Max streak", stats.maxStreak],
        ].map(([label, value]) => (
          <div key={label} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
            <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
            <p className="mt-1 text-lg font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <p className="mt-5 text-xs font-semibold uppercase text-[var(--muted-foreground)]">Guess distribution</p>
      <div className="mt-2 grid gap-1.5">
        {stats.distribution.map((count, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="w-3 text-xs font-semibold text-[var(--muted-foreground)]">{index + 1}</span>
            <div className="h-5 flex-1 overflow-hidden rounded-sm bg-[var(--muted)]">
              <div
                className="flex h-full min-w-[1.75rem] items-center justify-end rounded-sm px-1.5 text-xs font-semibold transition-[width]"
                style={{
                  width: `${Math.max(8, (count / peak) * 100)}%`,
                  background: count ? "var(--primary)" : "var(--muted-foreground)",
                  color: "var(--primary-foreground)",
                }}
              >
                {count}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ToolHome() {
  const [mode, setMode] = useState("daily");
  const [today, setToday] = useState(null);
  const [answer, setAnswer] = useState(ANSWERS[0]);
  const [guesses, setGuesses] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [current, setCurrent] = useState("");
  const [status, setStatus] = useState("playing");
  const [message, setMessage] = useState("");
  const [shake, setShake] = useState(false);
  const [hardMode, setHardMode] = useState(false);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [revealRow, setRevealRow] = useState(-1);
  const [revealCount, setRevealCount] = useState(COLS);
  const [copied, setCopied] = useState(false);

  const statsRef = useRef(EMPTY_STATS);
  const shakeTimer = useRef(null);
  const messageTimer = useRef(null);

  const loadDaily = useCallback((dayIndex) => {
    const dailyAnswer = answerForDay(dayIndex);
    const saved = readDaily(dayIndex);
    const restored = saved ? saved.guesses : [];

    setAnswer(dailyAnswer);
    setGuesses(restored);
    setEvaluations(restored.map((word) => evaluateGuess(word, dailyAnswer)));
    setStatus(saved ? saved.status : "playing");
    setCurrent("");
    setMessage("");
    setRevealRow(-1);
    setRevealCount(COLS);
  }, []);

  const startPractice = useCallback(() => {
    setAnswer(ANSWERS[Math.floor(Math.random() * ANSWERS.length)]);
    setGuesses([]);
    setEvaluations([]);
    setCurrent("");
    setStatus("playing");
    setMessage("");
    setRevealRow(-1);
    setRevealCount(COLS);
  }, []);

  useEffect(() => {
    const dayIndex = dayIndexFor(new Date());
    setToday(dayIndex);
    loadDaily(dayIndex);

    const saved = readStats();
    statsRef.current = saved;
    setStats(saved);

    try {
      setHardMode(window.localStorage.getItem(HARD_KEY) === "true");
    } catch {
      setHardMode(false);
    }
  }, [loadDaily]);

  useEffect(
    () => () => {
      window.clearTimeout(shakeTimer.current);
      window.clearTimeout(messageTimer.current);
    },
    []
  );

  useEffect(() => {
    if (revealRow < 0) return undefined;
    if (revealCount >= COLS) {
      const done = window.setTimeout(() => setRevealRow(-1), 240);
      return () => window.clearTimeout(done);
    }
    const step = window.setTimeout(() => setRevealCount((value) => value + 1), 260);
    return () => window.clearTimeout(step);
  }, [revealCount, revealRow]);

  const flash = useCallback((text) => {
    setMessage(text);
    setShake(true);
    window.clearTimeout(shakeTimer.current);
    shakeTimer.current = window.setTimeout(() => setShake(false), 460);
    window.clearTimeout(messageTimer.current);
    messageTimer.current = window.setTimeout(() => setMessage(""), 2200);
  }, []);

  const applyStats = useCallback((next) => {
    statsRef.current = next;
    setStats(next);
    try {
      window.localStorage.setItem(STATS_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  }, []);

  const recordDaily = useCallback(
    (won, rowsUsed, dayIndex) => {
      const previous = statsRef.current;
      const streak = won ? (previous.lastDay === dayIndex - 1 ? previous.currentStreak + 1 : 1) : 0;
      const distribution = previous.distribution.slice();
      if (won) distribution[rowsUsed - 1] += 1;

      applyStats({
        played: previous.played + 1,
        wins: previous.wins + (won ? 1 : 0),
        currentStreak: streak,
        maxStreak: Math.max(previous.maxStreak, streak),
        distribution,
        lastDay: dayIndex,
      });
    },
    [applyStats]
  );

  const submitGuess = useCallback(() => {
    if (status !== "playing" || revealRow >= 0) return;

    if (current.length < COLS) {
      flash("Not enough letters");
      return;
    }
    if (!ALLOWED.has(current)) {
      flash("Not in word list");
      return;
    }
    if (hardMode) {
      const problem = hardModeError(current, guesses, evaluations);
      if (problem) {
        flash(problem);
        return;
      }
    }

    const evaluation = evaluateGuess(current, answer);
    const nextGuesses = [...guesses, current];
    const nextStatus = current === answer ? "won" : nextGuesses.length >= ROWS ? "lost" : "playing";

    setGuesses(nextGuesses);
    setEvaluations([...evaluations, evaluation]);
    setCurrent("");
    setStatus(nextStatus);
    setMessage("");

    if (mode === "daily" && today !== null) {
      try {
        window.localStorage.setItem(
          DAILY_KEY,
          JSON.stringify({ day: today, guesses: nextGuesses, status: nextStatus })
        );
      } catch {
        /* storage unavailable */
      }
      if (nextStatus !== "playing") recordDaily(nextStatus === "won", nextGuesses.length, today);
    }

    if (prefersReducedMotion()) {
      setRevealRow(-1);
      setRevealCount(COLS);
    } else {
      setRevealRow(nextGuesses.length - 1);
      setRevealCount(0);
    }
  }, [answer, current, evaluations, flash, guesses, hardMode, mode, recordDaily, revealRow, status, today]);

  const handleKey = useCallback(
    (key) => {
      if (status !== "playing") return;
      if (key === "ENTER") {
        submitGuess();
        return;
      }
      if (key === "BACK") {
        setCurrent((value) => value.slice(0, -1));
        return;
      }
      setCurrent((value) => (value.length < COLS ? value + key : value));
    },
    [status, submitGuess]
  );

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) return;

      if (event.key === "Enter") {
        if (tag === "BUTTON") return;
        event.preventDefault();
        handleKey("ENTER");
        return;
      }
      if (event.key === "Backspace") {
        event.preventDefault();
        handleKey("BACK");
        return;
      }
      const letter = event.key.toUpperCase();
      if (letter.length === 1 && letter >= "A" && letter <= "Z") handleKey(letter);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleKey]);

  const keyStates = useMemo(() => {
    const map = {};
    guesses.forEach((guess, row) => {
      const evaluation = evaluations[row];
      if (!evaluation) return;
      for (let i = 0; i < COLS; i += 1) {
        const letter = guess[i];
        const tone = evaluation[i];
        if (!map[letter] || TONE_RANK[tone] > TONE_RANK[map[letter]]) map[letter] = tone;
      }
    });
    return map;
  }, [evaluations, guesses]);

  const puzzleNumber = today === null ? null : today + 1;

  const shareText = useMemo(() => {
    const score = status === "won" ? guesses.length : "X";
    const title =
      mode === "daily" && puzzleNumber !== null
        ? `AltFTool Daily Word #${puzzleNumber} ${score}/6${hardMode ? "*" : ""}`
        : `AltFTool Word Practice ${score}/6${hardMode ? "*" : ""}`;
    const grid = evaluations
      .map((row) => row.map((tone) => (tone === "correct" ? "🟩" : tone === "present" ? "🟨" : "⬛")).join(""))
      .join("\n");
    return `${title}\n\n${grid}`;
  }, [evaluations, guesses.length, hardMode, mode, puzzleNumber, status]);

  const shareResult = async () => {
    const success = await safeCopyText(shareText);
    if (!success) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const switchMode = (next) => {
    if (next === mode) return;
    setMode(next);
    if (next === "daily") {
      if (today !== null) loadDaily(today);
    } else {
      startPractice();
    }
  };

  const toggleHardMode = () => {
    const next = !hardMode;
    setHardMode(next);
    try {
      window.localStorage.setItem(HARD_KEY, String(next));
    } catch {
      /* storage unavailable */
    }
  };

  const finished = status !== "playing";
  const showEndCard = finished && revealRow < 0;
  const hardLocked = status === "playing" && guesses.length > 0;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Sparkles className="h-4 w-4" />
            One puzzle a day
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Daily Word Game</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Guess the hidden five-letter word in six tries. Every player gets the same word each day — or jump
            into practice mode and play as many rounds as you like.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[1fr_380px]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                {[
                  { id: "daily", label: "Daily", icon: CalendarDays },
                  { id: "practice", label: "Practice", icon: Dices },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => switchMode(item.id)}
                      className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition ${
                        mode === item.id
                          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3">
                {mode === "daily" && puzzleNumber !== null && (
                  <span className="text-xs font-semibold text-[var(--muted-foreground)]">Puzzle #{puzzleNumber}</span>
                )}
                <label className="inline-flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={hardMode}
                    disabled={hardLocked}
                    onChange={toggleHardMode}
                    className="h-4 w-4 accent-[var(--primary)] disabled:cursor-not-allowed"
                  />
                  <span
                    className={`text-sm font-semibold ${
                      hardLocked ? "text-[var(--muted-foreground)]" : "text-[var(--foreground)]"
                    }`}
                  >
                    Hard mode
                  </span>
                </label>
              </div>
            </div>

            {hardLocked && (
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                Hard mode can only be switched between rounds.
              </p>
            )}

            <div className="mx-auto mt-5 max-w-[22rem]">
              <div className="flex h-8 items-center justify-center" aria-live="polite" role="status">
                {message && (
                  <span
                    className="rounded-md px-3 py-1 text-sm font-semibold"
                    style={{
                      background: "var(--anslation-ds-danger-soft)",
                      color: "var(--anslation-ds-danger)",
                    }}
                  >
                    {message}
                  </span>
                )}
              </div>

              <Board
                guesses={guesses}
                evaluations={evaluations}
                current={current}
                status={status}
                revealRow={revealRow}
                revealCount={revealCount}
                shake={shake}
              />

              <Keyboard keyStates={keyStates} onKey={handleKey} disabled={finished} />
            </div>

            {showEndCard && (
              <div className="mx-auto mt-6 max-w-[26rem] rounded-lg border border-[var(--border)] bg-[var(--muted)] p-5 text-center">
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)]">
                  <Trophy className="h-4 w-4" />
                  {status === "won" ? PRAISE[guesses.length - 1] : "Better luck tomorrow"}
                </div>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">The word was</p>
                <p className="mt-1 text-3xl font-semibold tracking-[0.3em] text-[var(--foreground)]">{answer}</p>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  {status === "won"
                    ? `Solved in ${guesses.length} ${guesses.length === 1 ? "guess" : "guesses"}.`
                    : "All six guesses used."}
                </p>

                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={shareResult}
                    className="inline-flex min-h-9 items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold"
                    style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                  >
                    <Share2 className="h-4 w-4" />
                    {copied ? "Copied!" : "Share result"}
                  </button>
                  {mode === "practice" && (
                    <button type="button" onClick={startPractice} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                      <Dices className="h-4 w-4" />
                      Play again
                    </button>
                  )}
                </div>

                {mode === "daily" && (
                  <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                    A new puzzle unlocks at midnight. Try practice mode in the meantime.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="grid gap-6 content-start">
            <StatsPanel stats={stats} />

            <details className="group rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <summary className="cursor-pointer list-none text-sm font-semibold uppercase tracking-wide">
                How to play
              </summary>
              <div className="mt-3 grid gap-3 text-sm leading-6 text-[var(--muted-foreground)]">
                <p>Guess the word in six tries. Each guess must be a real five-letter word.</p>
                <div className="grid gap-2">
                  {[
                    { tone: "correct", letter: "S", text: "S is in the word and in the right spot." },
                    { tone: "present", letter: "T", text: "T is in the word but in the wrong spot." },
                    { tone: "absent", letter: "M", text: "M is not in the word anywhere." },
                  ].map((row) => (
                    <div key={row.tone} className="flex items-center gap-3">
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border text-base font-semibold"
                        style={TONE_STYLE[row.tone]}
                      >
                        {row.letter}
                      </span>
                      <span>{row.text}</span>
                    </div>
                  ))}
                </div>
                <p>
                  Repeated letters are counted exactly: if the answer has one E and your guess has two, only one of
                  them lights up.
                </p>
                <p>
                  <strong className="text-[var(--foreground)]">Hard mode</strong> forces every revealed hint into your
                  next guess — greens stay put and yellows must reappear somewhere.
                </p>
              </div>
            </details>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="text-sm font-semibold uppercase tracking-wide">Today&rsquo;s word</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                Formula: answer = ANSWERS[days since 1 Jan 2024 mod {ANSWERS.length}], measured in your local time.
                Everyone playing on the same calendar day sees the same word. Guesses are checked against a list of{" "}
                {ALLOWED.size.toLocaleString("en-IN")} valid words.
              </p>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        .dwg-tile {
          display: flex;
          align-items: center;
          justify-content: center;
          aspect-ratio: 1 / 1;
          border-width: 2px;
          border-style: solid;
          border-radius: var(--anslation-ds-radius-xs);
          font-size: 1.75rem;
          font-weight: 700;
          line-height: 1;
          text-transform: uppercase;
          user-select: none;
        }
        .dwg-flip { animation: dwg-flip 0.42s ease both; }
        .dwg-pop { animation: dwg-pop 0.12s ease-out; }
        .dwg-shake { animation: dwg-shake 0.44s ease-in-out; }
        @keyframes dwg-flip {
          0% { transform: rotateX(-90deg); }
          100% { transform: rotateX(0deg); }
        }
        @keyframes dwg-pop {
          0% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        @keyframes dwg-shake {
          10%, 90% { transform: translateX(-2px); }
          20%, 80% { transform: translateX(4px); }
          30%, 50%, 70% { transform: translateX(-6px); }
          40%, 60% { transform: translateX(6px); }
        }
      `}</style>
    </main>
  );
}
