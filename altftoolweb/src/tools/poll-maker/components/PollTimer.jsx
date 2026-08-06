"use client";

import { useEffect, useRef, useState } from "react";
import { Hourglass, Lock } from "lucide-react";

export default function PollTimer({ duration = 60, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(duration);

  // Keep the latest onExpire in a ref instead of the effect's dependency
  // array. The caller (Main.jsx) passes an inline arrow function that gets
  // a new identity on every render (typing in the question/option fields,
  // autosave, etc.) — depending on it directly tore down and recreated the
  // interval on every unrelated parent re-render, stalling the countdown.
  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onExpireRef.current?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (time) => {
    const minutes = String(Math.floor(time / 60)).padStart(2, "0");
    const seconds = String(time % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <div
      aria-live="polite"
      role="status"
      className="text-center text-sm sm:text-base text-(--muted-foreground)"
    >
      {timeLeft > 0 ? (
        <div className="flex items-center justify-center gap-2">
          <Hourglass size={16} className="text-yellow-500" />
          <p> Poll ends in: {formatTime(timeLeft)}</p>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2">
          <Lock size={16} className="text-red-500" />
          <p className="text-red-500 font-semibold">Poll Ended</p>
        </div>
      )}
    </div>
  );
}
