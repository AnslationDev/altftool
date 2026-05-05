"use client";

import React, { useState } from "react";

export default function AgeTools() {

  const [activeTool, setActiveTool] = useState("compare");

  const [date1, setDate1] = useState("");
  const [date2, setDate2] = useState("");
  const [compareResult, setCompareResult] = useState("");

  const [birthDate, setBirthDate] = useState("");
  const [planetAges, setPlanetAges] = useState(null);

  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const planets = {
    Mercury: 0.24,
    Venus: 0.62,
    Earth: 1,
    Mars: 1.88,
    Jupiter: 11.86,
    Saturn: 29.46,
    Uranus: 84.01,
    Neptune: 164.79,
  };

  const validateDate = (date) => {
    const d = new Date(date);
    const todayDate = new Date();
    const year = d.getFullYear();

    if (year.toString().length !== 4) return "Year must be exactly 4 digits.";
    if (year < 1900) return "Please enter a valid year after 1900.";
    if (d > todayDate) return "Birth date cannot be in the future.";

    return "";
  };

  const calculateAgeDifference = () => {
    setError("");
    setCompareResult("");

    if (!date1 || !date2) {
      setError("Please select both birth dates.");
      return;
    }

    const err1 = validateDate(date1);
    const err2 = validateDate(date2);

    if (err1 || err2) {
      setError(err1 || err2);
      return;
    }

    const d1 = new Date(date1);
    const d2 = new Date(date2);

    let older = "";
    let start = d1;
    let end = d2;

    if (d1 < d2) {
      older = "Person A";
      start = d1;
      end = d2;
    } else {
      older = "Person B";
      start = d2;
      end = d1;
    }

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    const totalDays = Math.floor((end - start) / (1000 * 60 * 60 * 24));

    setCompareResult(
      `${older} is ${years} years ${months} months ${days} days older. Difference: ${totalDays} days`
    );
  };

  const calculatePlanetAge = () => {
    setError("");
    setPlanetAges(null);

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

    const ageInEarthYears =
      (todayDate - birth) / (1000 * 60 * 60 * 24 * 365.25);

    const results = {};

    Object.keys(planets).forEach((planet) => {
      results[planet] = (ageInEarthYears / planets[planet]).toFixed(2);
    });

    setPlanetAges(results);
  };

  return (
    <div className=" bg-[var(--background)] p-5 rounded-xl border border-[var(--border)] text-(--muted-foreground) shadow-sm">

      {/* UPDATED HEADING */}
      <h2 className="font-light tracking-wide mb-5 text-xl sm:text-2xl md:text-3xl text-center">
        Age Tools
      </h2>

      {/* Toggle */}
      <div className="flex justify-center gap-3 mb-5">
        <button
          onClick={() => {
            setActiveTool("compare");
            setError("");
            setCompareResult("");
          }}
          className={`px-4 py-2 rounded-md border transition ${
            activeTool === "compare"
              ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
              : "bg-[var(--background)] border-[var(--border)] hover:bg-[var(--muted)]"
          }`}
        >
          Compare Age
        </button>

        <button
          onClick={() => {
            setActiveTool("planets");
            setError("");
            setPlanetAges(null);
          }}
          className={`px-4 py-2 rounded-md border transition ${
            activeTool === "planets"
              ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
              : "bg-[var(--background)] border-[var(--border)] hover:bg-[var(--muted)]"
          }`}
        >
          Age On Planets
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="text-red-500 text-sm mb-3 text-center">
          {error}
        </div>
      )}

      {/* Compare */}
      {activeTool === "compare" && (
        <div className="space-y-4">

          <input
            type="date"
            max={today}
            value={date1}
            onChange={(e) => setDate1(e.target.value)}
            className="w-full border border-[var(--border)] rounded-md p-2 bg-[var(--background)]"
          />

          <input
            type="date"
            max={today}
            value={date2}
            onChange={(e) => setDate2(e.target.value)}
            className="w-full border border-[var(--border)] rounded-md p-2 bg-[var(--background)]"
          />

          <button
            onClick={calculateAgeDifference}
            className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] py-2 rounded-md hover:brightness-110 transition"
          >
            Compare Age
          </button>

          {compareResult && (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-3 text-center">
              {compareResult}
            </div>
          )}
        </div>
      )}

      {/* Planets */}
      {activeTool === "planets" && (
        <div className="space-y-4">

          <input
            type="date"
            max={today}
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full border border-[var(--border)] rounded-md p-2 bg-[var(--background)]"
          />

          <button
            onClick={calculatePlanetAge}
            className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] py-2 rounded-md hover:brightness-110 transition"
          >
            Calculate Space Age
          </button>

          {planetAges && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center mt-3">
              {Object.entries(planetAges).map(([planet, age]) => (
                <div
                  key={planet}
                  className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-3"
                >
                  <div className="text-lg font-medium text-[var(--card-foreground)]">
                    {age}
                  </div>
                  <div className="text-xs text-[var(--muted-foreground)]">
                    {planet}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}
    </div>
  );
}