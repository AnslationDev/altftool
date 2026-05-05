"use client";

import React, { useState } from "react";

export default function SmartAgeInsights() {

  const [birthDate, setBirthDate] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const validateDate = (date) => {
    const d = new Date(date);
    const todayDate = new Date();
    const year = d.getFullYear();

    if (year.toString().length !== 4) return "Year must be exactly 4 digits.";
    if (year < 1900) return "Please enter a valid year after 1900.";
    if (d > todayDate) return "Birth date cannot be in the future.";
    return "";
  };

  const getGeneration = (year) => {
    if (year >= 2013) return "Gen Alpha";
    if (year >= 1997) return "Gen Z";
    if (year >= 1981) return "Millennial";
    if (year >= 1965) return "Gen X";
    if (year >= 1946) return "Baby Boomer";
    return "Silent Generation";
  };

  const calculateSmartData = () => {
    setError("");
    setResult(null);

    if (!birthDate) {
      setError("Please select your birth date.");
      return;
    }

    const err = validateDate(birthDate);
    if (err) {
      setError(err);
      return;
    }

    const birth = new Date(birthDate);
    const todayDate = new Date();

    const birthDay = birth.toLocaleDateString("en-US", { weekday: "long" });
    const year = birth.getFullYear();
    const generation = getGeneration(year);
    const totalDays = Math.floor((todayDate - birth) / (1000 * 60 * 60 * 24));
    const weekends = Math.floor(totalDays / 7) * 2;

    setResult({ birthDay, generation, weekends });
  };

  return (
    <div className=" w-full max-w-md mx-auto bg-[var(--background)] p-4 rounded-lg border border-[var(--border)] text-(--muted-foreground)">

      <h3 className="font-light  md:text-2xl text-center mb-3 tracking-tight">
  Smart Age Insights
</h3>

      <div className="space-y-3">

        <input
          type="date"
          max={today}
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className="w-full border mb-3 border-[var(--border)] rounded p-2 bg-[var(--background)]"
        />

        <button
          onClick={calculateSmartData}
          className="w-full mb-3 bg-[var(--primary)] text-[var(--primary-foreground)] py-2 rounded-md hover:brightness-110 transition"
        >
          Get Smart Insights
        </button>

        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}

        {result && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-center mt-3">

            <div className="bg-[var(--card)] border border-[var(--border)] rounded p-3">
              <div className="text-sm text-[var(--muted-foreground)]">Birth Day</div>
              <div className="text-lg sm:text-xl md:text-lg font-bold">{result.birthDay}</div>
            </div>

            <div className="bg-[var(--card)] border border-[var(--border)] rounded p-3">
              <div className="text-sm text-[var(--muted-foreground)]">Generation</div>
              <div className="text-lg sm:text-xl md:text-lg font-bold">{result.generation}</div>
            </div>

            <div className="bg-[var(--card)] border border-[var(--border)] rounded p-3">
              <div className="text-sm text-[var(--muted-foreground)]">Weekends Lived</div>
              <div className="text-lg sm:text-xl md:text-lg font-bold">{result.weekends.toLocaleString()}</div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}