import { useState, useEffect } from "react";

export default function Timer({ duration, onTimeout, keyIndex }) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
  }, [keyIndex, duration]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeout();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeout]);

  const getColor = () => {
    if (timeLeft > duration * 0.5) return "text-green-500";
    if (timeLeft > duration * 0.2) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className={`flex items-center gap-2 font-mono font-bold text-xl ${getColor()}`}>
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {timeLeft}s
    </div>
  );
}
