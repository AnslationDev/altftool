"use client";

import { CalendarDays } from "lucide-react";

export default function BirthDatePicker({ birthDate, setBirthDate, handleAnalyze, todayString }) {
  return (
    <form
      onSubmit={handleAnalyze}
      className="flex flex-col sm:flex-row gap-4 justify-center items-center bg-(--background) text-(--secondary) p-4"
    >
      <div className="relative flex-1 max-w-md w-full">
        <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-(--muted-foreground)" />
        <input
          type="date"
          value={birthDate}
          max={todayString}
          onChange={(e) => setBirthDate(e.target.value)}
          className="w-full border border-(--border) rounded-lg pl-10 pr-4 py-2 focus:ring-2 text-(--secondary) cursor-pointer bg-(--background)"
          aria-label="Date of birth"
        />
      </div>
      <button
        type="submit"
        className="bg-(--primary) text-white px-6 py-2 rounded-lg cursor-pointer font-semibold hover:opacity-90 transition"
      >
        Analyze
      </button>
    </form>
  );
}
