"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DIFFICULTIES, INITIAL_SNAKE } from "../constants/gameSettings";
import { createFood, isOppositeDirection, nextSnakeState } from "../utils/gameLogic";
import { playSound } from "../utils/sound";

const initialStats = { gamesPlayed: 0, highestScore: 0, totalScore: 0, longestSurvival: 0 };

export function useSnakeGame() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState(() => createFood(INITIAL_SNAKE));
  const directionRef = useRef("right");
  // Direction requested since the last tick, applied (and validated against
  // the snake's true current heading) only when the next tick runs — see
  // the tick effect below for why this matters.
  const pendingDirectionRef = useRef(null);
  const [status, setStatus] = useState("idle");
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState("medium");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [startedAt, setStartedAt] = useState(null);
  const [survivalTime, setSurvivalTime] = useState(0);
  const [stats, setStats] = useState(initialStats);

  const settings = DIFFICULTIES[difficulty];

  // Refs mirroring the latest snake/food/score so the tick interval can read
  // current values without depending on them — depending on them forced the
  // interval to be torn down and recreated on every food-eat and every
  // score change, which resets the tick's phase and produces an irregular
  // cadence instead of the fixed per-difficulty speed.
  const snakeRef = useRef(snake);
  const foodRef = useRef(food);
  const scoreRef = useRef(score);
  const soundEnabledRef = useRef(soundEnabled);
  useEffect(() => { snakeRef.current = snake; }, [snake]);
  useEffect(() => { foodRef.current = food; }, [food]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { soundEnabledRef.current = soundEnabled; }, [soundEnabled]);

  // Tracks when the current run was paused so resume() can shift startedAt
  // forward by exactly the paused duration, instead of leaving startedAt
  // untouched (which made survivalTime jump forward by the whole paused
  // wall-clock duration the instant the run resumed).
  const pausedAtRef = useRef(null);

  const resetBoard = useCallback(() => {
    const startSnake = INITIAL_SNAKE;
    const startFood = createFood(startSnake);
    setSnake(startSnake);
    setFood(startFood);
    snakeRef.current = startSnake;
    foodRef.current = startFood;
    directionRef.current = "right";
    pendingDirectionRef.current = null;
    setScore(0);
    scoreRef.current = 0;
    setSurvivalTime(0);
    setStartedAt(null);
    pausedAtRef.current = null;
  }, []);

  const start = useCallback(() => {
    resetBoard();
    setStatus("running");
    setStartedAt(Date.now());
  }, [resetBoard]);

  const pause = useCallback(() => {
    pausedAtRef.current = Date.now();
    setStatus("paused");
  }, []);

  const resume = useCallback(() => {
    setStatus("running");
    setStartedAt((value) => {
      if (!value) return Date.now();
      if (pausedAtRef.current) {
        const pausedMs = Date.now() - pausedAtRef.current;
        pausedAtRef.current = null;
        return value + pausedMs;
      }
      return value;
    });
  }, []);

  // Survival time is tracked purely via refs above, so finishGame's own
  // identity can stay fully stable (see the empty dependency array) instead
  // of changing every second — that stability is what lets the tick effect
  // below avoid restarting the interval once a second.
  const survivalTimeRef = useRef(0);
  useEffect(() => { survivalTimeRef.current = survivalTime; }, [survivalTime]);

  const finishGame = useCallback((finalScore) => {
    setStatus("game-over");
    if (soundEnabledRef.current) playSound("gameover");
    setStats((current) => ({
      gamesPlayed: current.gamesPlayed + 1,
      highestScore: Math.max(current.highestScore, finalScore),
      totalScore: current.totalScore + finalScore,
      longestSurvival: Math.max(current.longestSurvival, survivalTimeRef.current),
    }));
  }, []);

  // Restart discarded an in-progress run with no trace in the stats panel —
  // games played, high score and average score all stayed unchanged even if
  // the abandoned run had a would-be personal-best score. Crediting it via
  // finishGame before resetting makes "Restart" behave like "end this run,
  // then start fresh" rather than silently erasing it. The confirmation
  // prompt for this lives in the page component, next to the button.
  const restart = useCallback(() => {
    if (status === "running" || status === "paused") {
      finishGame(scoreRef.current);
    }
    resetBoard();
    setStatus("idle");
  }, [status, finishGame, resetBoard]);

  const changeDirection = useCallback((nextDirection) => {
    // Validate against the direction the snake is actually moving in right
    // now (directionRef, only updated once per tick below) — not the last
    // *requested* direction. Otherwise two individually-legal single turns
    // queued within one tick period (e.g. up, then left, while still
    // heading right) can compose into an effective 180 degree reversal
    // relative to the snake's real heading, which the game is supposed to
    // ignore rather than let kill the snake.
    if (isOppositeDirection(directionRef.current, nextDirection)) return;
    pendingDirectionRef.current = nextDirection;
  }, []);

  useEffect(() => {
    if (status !== "running") return undefined;

    const tick = window.setInterval(() => {
      if (pendingDirectionRef.current) {
        directionRef.current = pendingDirectionRef.current;
        pendingDirectionRef.current = null;
      }

      const next = nextSnakeState(snakeRef.current, directionRef.current, foodRef.current);
      if (next.collision) {
        finishGame(scoreRef.current);
        return;
      }

      snakeRef.current = next.snake;
      setSnake(next.snake);

      if (next.ateFood) {
        if (soundEnabledRef.current) playSound("eat");
        scoreRef.current += settings.points;
        setScore((value) => value + settings.points);

        const newFood = createFood(next.snake);
        if (newFood === null) {
          // Board is completely full — nothing left to place food on.
          // Treat filling the whole grid as a clean finish rather than
          // silently overlapping the new food on the snake itself.
          finishGame(scoreRef.current);
          return;
        }
        foodRef.current = newFood;
        setFood(newFood);
      }
    }, settings.speed);

    return () => window.clearInterval(tick);
  }, [status, settings.speed, settings.points, finishGame]);

  useEffect(() => {
    if (status !== "running" || !startedAt) return undefined;
    const timer = window.setInterval(() => setSurvivalTime(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, [startedAt, status]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const keyMap = { ArrowUp: "up", w: "up", ArrowDown: "down", s: "down", ArrowLeft: "left", a: "left", ArrowRight: "right", d: "right" };
      const next = keyMap[event.key];
      if (!next) return;
      event.preventDefault();
      changeDirection(next);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [changeDirection]);

  const averageScore = useMemo(
    () => (stats.gamesPlayed ? Math.round(stats.totalScore / stats.gamesPlayed) : 0),
    [stats.gamesPlayed, stats.totalScore],
  );

  return {
    snake,
    food,
    status,
    score,
    difficulty,
    soundEnabled,
    survivalTime,
    stats: { ...stats, averageScore },
    settings,
    setDifficulty,
    setSoundEnabled,
    start,
    pause,
    resume,
    restart,
    changeDirection,
  };
}
