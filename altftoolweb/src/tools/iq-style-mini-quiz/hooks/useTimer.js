"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export function useTimer(initialTime, onTimeUp) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);
  const onTimeUpRef = useRef(onTimeUp);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const start = useCallback(() => {
    cleanup();
    setTimeLeft(initialTime);
    setIsRunning(true);

    let remaining = initialTime;
    intervalRef.current = setInterval(() => {
      remaining--;
      setTimeLeft(remaining);
      if (remaining <= 0) {
        cleanup();
        setIsRunning(false);
        onTimeUpRef.current?.();
      }
    }, 1000);
  }, [initialTime, cleanup]);

  const stop = useCallback(() => {
    cleanup();
    setIsRunning(false);
  }, [cleanup]);

  const reset = useCallback(() => {
    cleanup();
    setTimeLeft(initialTime);
    setIsRunning(false);
  }, [initialTime, cleanup]);

  const percent = initialTime > 0 ? (timeLeft / initialTime) * 100 : 0;

  return { timeLeft, isRunning, percent, start, stop, reset };
}
