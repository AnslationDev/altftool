"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export default function useQuizTimer(duration = 0, onTimeUp) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);
  const onTimeUpRef = useRef(onTimeUp);
  const elapsedRef = useRef(0);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  const start = useCallback((initialTime) => {
    const t = initialTime ?? duration;
    setTimeLeft(t);
    setIsRunning(true);
    elapsedRef.current = 0;
  }, [duration]);

  const stop = useCallback(() => {
    setIsRunning(false);
    clearInterval(timerRef.current);
  }, []);

  const reset = useCallback((initialTime) => {
    const t = initialTime ?? duration;
    setTimeLeft(t);
    setIsRunning(false);
    elapsedRef.current = 0;
    clearInterval(timerRef.current);
  }, [duration]);

  const getElapsed = useCallback(() => elapsedRef.current, []);

  useEffect(() => {
    if (!isRunning) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsRunning(false);
          elapsedRef.current = elapsedRef.current + 1;
          onTimeUpRef.current?.();
          return 0;
        }
        elapsedRef.current = elapsedRef.current + 1;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  return { timeLeft, isRunning, start, stop, reset, getElapsed };
}
