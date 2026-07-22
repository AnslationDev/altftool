"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import GameShell from "@/tools/_shared/game/GameShell";
import useBestScore from "@/tools/_shared/game/useBestScore";
import ResultsCard from "../components/ResultsCard";
import WordStream from "../components/WordStream";
import { createSoundEngine } from "../lib/audio";
import { accuracy, charStats, netWpm, rawWpm } from "../lib/stats";
import { pickWords } from "../lib/words";

const DURATIONS = [30, 60, 120];
const INITIAL_WORDS = 90;
const EXTEND_BATCH = 60;
const MIN_WORDS_AHEAD = 40;

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export default function TypingSpeedTest() {
  // State machine: ready -> playing -> (paused <->) -> finished -> ready.
  const [status, setStatus] = useState("ready");
  const [duration, setDuration] = useState(60);
  const [words, setWords] = useState([]);
  const [typedWords, setTypedWords] = useState([]);
  const [wordIdx, setWordIdx] = useState(0);
  const [value, setValue] = useState("");
  const [timeLeftMs, setTimeLeftMs] = useState(60 * 1000);
  const [soundOn, setSoundOn] = useState(false);
  const [focused, setFocused] = useState(false);
  const [isNewBest, setIsNewBest] = useState(false);

  const inputRef = useRef(null);
  const endAtRef = useRef(0);
  const pauseRemainingRef = useRef(0);
  const engineRef = useRef(null);
  const finishRef = useRef(() => {});
  const statusRef = useRef(status);

  // Single fixed slug: net WPM is already time-normalised, so one best score
  // works across durations. (A per-duration slug would also leave the shared
  // hook showing a stale best after switching to a duration with no record.)
  const [best, submitBest] = useBestScore("typing-speed-test");

  useEffect(() => {
    statusRef.current = status;
  });

  // Generate the first word batch after mount so server and client markup match.
  useEffect(() => {
    setWords(pickWords(INITIAL_WORDS));
  }, []);

  // Keep the stream ahead of the typist.
  useEffect(() => {
    if (words.length > 0 && words.length - wordIdx < MIN_WORDS_AHEAD) {
      setWords((prev) => [...prev, ...pickWords(EXTEND_BATCH)]);
    }
  }, [wordIdx, words.length]);

  const getEngine = useCallback(() => {
    if (!engineRef.current) engineRef.current = createSoundEngine();
    return engineRef.current;
  }, []);

  // Dispose the audio context on unmount.
  useEffect(() => {
    return () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  const stats = useMemo(
    () => charStats(words, typedWords, wordIdx, value),
    [words, typedWords, wordIdx, value],
  );

  const finished = status === "finished";
  const elapsedSeconds = finished ? duration : duration - timeLeftMs / 1000;
  const liveNet = status === "ready" ? 0 : netWpm(stats.correct, Math.max(elapsedSeconds, 2));
  const acc = accuracy(stats.correct, stats.incorrect);
  const resultsNet = netWpm(stats.correct, duration);
  const resultsRaw = rawWpm(stats.typedTotal, duration);

  // Latest-state finish handler, callable from the timer interval.
  useEffect(() => {
    finishRef.current = () => {
      // Guard against a second interval tick landing before the cleanup runs.
      if (statusRef.current === "finished") return;
      statusRef.current = "finished";
      setStatus("finished");
      setTimeLeftMs(0);
      const finalStats = charStats(words, typedWords, wordIdx, value);
      const net = netWpm(finalStats.correct, duration);
      setIsNewBest(net > 0 && (best === null || net > best));
      if (net > 0) submitBest(net);
      if (soundOn) getEngine().finish();
      inputRef.current?.blur();
    };
  });

  // Countdown timer while playing.
  useEffect(() => {
    if (status !== "playing") return undefined;
    const id = setInterval(() => {
      const remaining = endAtRef.current - Date.now();
      if (remaining <= 0) finishRef.current();
      else setTimeLeftMs(remaining);
    }, 200);
    return () => clearInterval(id);
  }, [status]);

  // Physical-keyboard convenience: start typing anywhere to focus the input.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const current = statusRef.current;
      if (current !== "ready" && current !== "playing") return;
      const target = event.target;
      if (target === inputRef.current) return;
      if (target instanceof HTMLElement) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || tag === "BUTTON") return;
        if (target.isContentEditable) return;
      }
      if (event.key.length === 1 || event.key === "Backspace") {
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const restart = useCallback(
    (freshWords) => {
      if (freshWords) setWords(pickWords(INITIAL_WORDS));
      setTypedWords([]);
      setWordIdx(0);
      setValue("");
      setIsNewBest(false);
      setTimeLeftMs(duration * 1000);
      setStatus("ready");
      inputRef.current?.focus();
    },
    [duration],
  );

  const changeDuration = useCallback(
    (nextDuration) => {
      if (status === "playing" || status === "paused") return;
      setDuration(nextDuration);
      setTimeLeftMs(nextDuration * 1000);
      setTypedWords([]);
      setWordIdx(0);
      setValue("");
      setIsNewBest(false);
      if (status === "finished") setWords(pickWords(INITIAL_WORDS));
      setStatus("ready");
    },
    [status],
  );

  const togglePause = useCallback(() => {
    if (statusRef.current === "playing") {
      pauseRemainingRef.current = Math.max(0, endAtRef.current - Date.now());
      setStatus("paused");
      inputRef.current?.blur();
    } else if (statusRef.current === "paused") {
      endAtRef.current = Date.now() + pauseRemainingRef.current;
      setStatus("playing");
      inputRef.current?.focus();
    }
  }, []);

  const handleChange = (event) => {
    if (status === "finished" || status === "paused") return;
    const next = event.target.value;

    if (status === "ready" && next.trim().length > 0) {
      endAtRef.current = Date.now() + duration * 1000;
      setStatus("playing");
    }

    if (soundOn && next.length > value.length) {
      const engine = getEngine();
      const lastChar = next[next.length - 1];
      if (lastChar === " ") {
        engine.tick();
      } else if (!next.includes(" ")) {
        const target = words[wordIdx] ?? "";
        const position = next.length - 1;
        if (target[position] === lastChar) engine.tick();
        else engine.error();
      }
    }

    if (next.includes(" ")) {
      // Space commits the word(s); the tail keeps building the next word.
      const parts = next.split(" ");
      const rest = parts.pop() ?? "";
      const commits = parts.filter(Boolean);
      if (commits.length > 0) {
        setTypedWords((prev) => [...prev, ...commits]);
        setWordIdx((index) => index + commits.length);
      }
      setValue(rest);
    } else {
      const target = words[wordIdx] ?? "";
      if (next.length > target.length + 12) return; // cap runaway extra chars
      setValue(next);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      if (statusRef.current === "playing") togglePause();
    } else if (event.key === "Enter") {
      event.preventDefault();
    }
  };

  const shellStats = [
    { label: "Time", value: formatTime(Math.ceil(timeLeftMs / 1000)) },
    { label: "WPM", value: liveNet },
    { label: "Acc", value: `${acc}%` },
    { label: "Best", value: best === null ? "—" : best },
  ];

  const typingActive = status === "ready" || status === "playing";

  return (
    <GameShell
      title="Typing Speed Test"
      stats={shellStats}
      onRestart={() => restart(false)}
      paused={status === "paused"}
      onTogglePause={status === "playing" || status === "paused" ? togglePause : undefined}
      soundOn={soundOn}
      onToggleSound={() => setSoundOn((on) => !on)}
      help="Pick a duration, then start typing — the timer begins on your first keystroke. Press Space to submit each word, Esc to pause. Net WPM counts only correctly typed characters."
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Test duration">
          {DURATIONS.map((seconds) => {
            const isActive = duration === seconds;
            return (
              <button
                key={seconds}
                type="button"
                onClick={() => changeDuration(seconds)}
                disabled={status === "playing" || status === "paused"}
                aria-pressed={isActive}
                aria-label={`${seconds} second test`}
                className={`inline-flex h-11 min-w-16 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {seconds}s
              </button>
            );
          })}
        </div>

        {finished ? (
          <ResultsCard
            net={resultsNet}
            raw={resultsRaw}
            acc={acc}
            correct={stats.correct}
            incorrect={stats.incorrect}
            best={best}
            isNewBest={isNewBest}
            duration={duration}
            onRestart={() => restart(false)}
            onNewWords={() => restart(true)}
          />
        ) : (
          <div
            className={`relative overflow-hidden rounded-lg border bg-muted/40 p-4 transition-colors ${
              focused && typingActive ? "border-primary/60" : "border-border"
            }`}
          >
            <WordStream
              words={words}
              typedWords={typedWords}
              wordIdx={wordIdx}
              value={value}
              showCaret={focused && typingActive}
            />

            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onPaste={(event) => event.preventDefault()}
              className="absolute inset-0 z-10 h-full w-full cursor-text text-base opacity-0"
              aria-label="Typing area. Type the words shown to start the test."
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              inputMode="text"
              enterKeyHint="done"
            />

            {status === "paused" ? (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-card/85">
                <p className="text-sm font-medium text-foreground">Paused</p>
                <button
                  type="button"
                  onClick={togglePause}
                  className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Resume
                </button>
              </div>
            ) : null}

            {!focused && status !== "paused" ? (
              <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-card/70">
                <p className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm">
                  {status === "ready" ? "Tap or click here, then start typing" : "Tap to keep typing"}
                </p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </GameShell>
  );
}
