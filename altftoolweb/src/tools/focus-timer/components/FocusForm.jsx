"use client"

import { useState } from "react";
import {
  Clock,
  Timer,
  Target,
  Coffee,
} from "lucide-react";

export default function FocusForm({ onResult }) {
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [breakTime, setBreakTime] = useState("");
  const [focusTime, setFocusTime] = useState("");

  const handleCalculate = (e) => {
    e.preventDefault();

    const h = Number(hours) || 0;
    const m = Number(minutes) || 0;
    const b = Number(breakTime) || 0;
    const f = Number(focusTime) || 0;

    const totalMinutes = h * 60 + m;
    const sessionCycle = f + b;
    const sessions =
      sessionCycle > 0 ? Math.floor(totalMinutes / sessionCycle) : 0;

    const usedTime =
      sessions * f + (sessions > 0 ? (sessions - 1) * b : 0);

    const remainingTime = totalMinutes - usedTime;

    onResult({
      totalMinutes,
      focusTime: f,
      breakTime: b,
      focusSessions: sessions,
      remainingTime,
    });
  };

  return (
    <form onSubmit={handleCalculate} className="mt-6">

      {/* TOP ROW */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

        {/* Hours Card */}
        <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-5">
          <p className="flex items-center gap-2 font-bold text-base text-[var(--foreground)] mb-3">
            <Clock size={18} /> Total Hours
          </p>

          <label className="block text-sm text-[var(--muted-foreground)] mb-1.5">
            Working Hours
          </label>
          <input
            type="number"
            placeholder="e.g. 2"
            value={hours}
            min={0}
            onChange={(e) => setHours(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-base text-[var(--foreground)] outline-none"
          />
        </div>

        {/* Minutes Card */}
        <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-5">
          <p className="flex items-center gap-2 font-bold text-base text-[var(--foreground)] mb-3">
            <Timer size={18} /> Extra Minutes
          </p>

          <label className="block text-sm text-[var(--muted-foreground)] mb-1.5">
            Working Minutes
          </label>
          <input
            type="number"
            placeholder="e.g. 30"
            value={minutes}
            min={0}
            onChange={(e) => setMinutes(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-base text-[var(--foreground)] outline-none"
          />
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-4">

        {/* Focus Card */}
        <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-5">
          <p className="flex items-center gap-2 font-bold text-base text-[var(--foreground)] mb-3">
            <Target size={18} /> Focus Session
          </p>

          <label className="block text-sm text-[var(--muted-foreground)] mb-1.5">
            Focus Duration (minutes)
          </label>
          <input
            type="number"
            placeholder="e.g. 25"
            value={focusTime}
            min={1}
            onChange={(e) => setFocusTime(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-base text-[var(--foreground)] outline-none"
          />
        </div>

        {/* Break Card */}
        <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-5">
          <p className="flex items-center gap-2 font-bold text-base text-[var(--foreground)] mb-3">
            <Coffee size={18} /> Break Time
          </p>

          <label className="block text-sm text-[var(--muted-foreground)] mb-1.5">
            Break Duration (minutes)
          </label>
          <input
            type="number"
            placeholder="e.g. 5"
            value={breakTime}
            min={0}
            onChange={(e) => setBreakTime(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-base text-[var(--foreground)] outline-none"
          />
        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <button
        type="submit"
        className="mt-5 w-full py-3.5 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl text-base font-bold cursor-pointer transition-opacity hover:opacity-85"
      >
        Calculate
      </button>
    </form>
  );
}