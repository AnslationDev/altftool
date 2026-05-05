"use client";

import { useEffect, useState } from "react";
import { Hourglass, Lock } from "lucide-react";

export default function PollTimer({ duration = 60, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) {
      onExpire();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onExpire]);

  const formatTime = (time) => {
    const minutes = String(Math.floor(time / 60)).padStart(2, "0");
    const seconds = String(time % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <div className="text-center text-sm sm:text-base text-(--muted-foreground)">
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
