"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DIFFICULTIES, INITIAL_SNAKE } from "../constants/gameSettings";
import { createFood, isOppositeDirection, nextSnakeState } from "../utils/gameLogic";

const initialStats = { gamesPlayed: 0, highestScore: 0, totalScore: 0, longestSurvival: 0 };

export function useSnakeGame() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState(() => createFood(INITIAL_SNAKE));
  const [direction, setDirection] = useState("right");
  const directionRef = useRef("right");
  const [status, setStatus] = useState("idle");
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState("medium");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [startedAt, setStartedAt] = useState(null);
  const [survivalTime, setSurvivalTime] = useState(0);
  const [stats, setStats] = useState(initialStats);

  const settings = DIFFICULTIES[difficulty];

  const resetBoard = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    setFood(createFood(INITIAL_SNAKE));
    setDirection("right");
    directionRef.current = "right";
    setScore(0);
    setSurvivalTime(0);
    setStartedAt(null);
  }, []);

  const start = useCallback(() => {
    resetBoard();
    setStatus("running");
    setStartedAt(Date.now());
  }, [resetBoard]);

  const pause = useCallback(() => setStatus("paused"), []);
  const resume = useCallback(() => {
    setStatus("running");
    setStartedAt((value) => value || Date.now());
  }, []);

  const restart = useCallback(() => {
    resetBoard();
    setStatus("idle");
  }, [resetBoard]);

  const finishGame = useCallback((finalScore) => {
    setStatus("game-over");
    setStats((current) => ({
      gamesPlayed: current.gamesPlayed + 1,
      highestScore: Math.max(current.highestScore, finalScore),
      totalScore: current.totalScore + finalScore,
      longestSurvival: Math.max(current.longestSurvival, survivalTime),
    }));
  }, [survivalTime]);

  const changeDirection = useCallback((nextDirection) => {
    if (isOppositeDirection(directionRef.current, nextDirection)) return;
    directionRef.current = nextDirection;
    setDirection(nextDirection);
  }, []);

  useEffect(() => {
    if (status !== "running") return undefined;

    const tick = window.setInterval(() => {
      setSnake((currentSnake) => {
        const next = nextSnakeState(currentSnake, directionRef.current, food);
        if (next.collision) {
          finishGame(score);
          return currentSnake;
        }

        if (next.ateFood) {
          setScore((value) => value + settings.points);
          setFood(createFood(next.snake));
        }

        return next.snake;
      });
    }, settings.speed);

    return () => window.clearInterval(tick);
  }, [finishGame, food, score, settings.points, settings.speed, status]);

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
    direction,
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
