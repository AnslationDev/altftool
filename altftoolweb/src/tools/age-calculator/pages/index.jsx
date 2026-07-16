"use client";

import { useCallback, useEffect, useState } from "react";
import Hero from "../components/Hero";
import AgeForm from "../components/AgeForm";
import ResultBanner from "../components/ResultBanner";
import AgeInNumbers from "../components/AgeInNumbers";
import LifeTimeline from "../components/LifeTimeline";
import NextBirthday from "../components/NextBirthday";
import { calculateAgeData } from "../utils/dateUtils.js";

function toDate(dateStr, timeStr) {
  if (!dateStr) return null;
  const d = new Date(`${dateStr}T${timeStr || "00:00"}`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export default function ToolHome() {
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const todayString = new Date().toISOString().split("T")[0];

  const compute = useCallback((dateStr, timeStr) => {
    const birth = toDate(dateStr, timeStr);
    if (!birth) return { error: "Please enter a valid date of birth." };
    if (birth > new Date()) return { error: "Date of birth must be in the past." };
    return { data: calculateAgeData(birth) };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!birthDate) { setError("Please enter your date of birth."); setData(null); return; }
    const res = compute(birthDate, birthTime);
    if (res.error) { setError(res.error); setData(null); return; }
    setError("");
    setData(res.data);
  };

  const quickSet = (which) => {
    const now = new Date();
    let d = now;
    if (which === "yesterday") d = new Date(now.getTime() - 86400000);
    if (which === "y2k") d = new Date(2000, 0, 1);
    const iso = d.toISOString().split("T")[0];
    setBirthDate(iso);
    const res = compute(iso, birthTime);
    if (res.error) { setError(res.error); setData(null); } else { setError(""); setData(res.data); }
  };

  const clearAll = () => { setBirthDate(""); setBirthTime(""); setData(null); setError(""); };

  // Live tick — keep seconds/minutes and the birthday countdown fresh.
  useEffect(() => {
    if (!birthDate || error) return undefined;
    const id = setInterval(() => {
      const res = compute(birthDate, birthTime);
      if (res.data) setData(res.data);
    }, 1000);
    return () => clearInterval(id);
  }, [birthDate, birthTime, error, compute]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="space-y-6">
        <Hero />

        <AgeForm
          birthDate={birthDate}
          birthTime={birthTime}
          todayString={todayString}
          onChangeDate={setBirthDate}
          onChangeTime={setBirthTime}
          onQuickSet={quickSet}
          onClear={clearAll}
          onSubmit={handleSubmit}
          error={error}
        />

        {data && (
          <>
            <ResultBanner age={data.age} totals={data.totals} />
            <AgeInNumbers body={data.body} />
            <LifeTimeline timeline={data.timeline} />
            <NextBirthday data={data.nextBirthday} />
          </>
        )}

        {!data && !error && (
          <p className="rounded-2xl border border-dashed border-(--border) bg-(--card) px-5 py-10 text-center text-sm text-(--muted-foreground)">
            Enter your date of birth above to see your exact age and life stats.
          </p>
        )}

        {/* Phase 2 — Fun Facts, Compare, Milestones, Share, More Tools, How it works, FAQ */}
      </div>
    </div>
  );
}
