"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "../components/Header";
import BirthDatePicker from "../components/BirthDatePicker";
import AgeDisplay from "../components/AgeDisplay";
import TimeLived from "../components/TimeLived";
import BirthdayInsights from "../components/BirthdayInsights";
import AgeAnalytics from "../components/AgeAnalytics";
import Milestones from "../components/Milestones";
import CountdownTimer from "../components/CountdownTimer";
import Features from "../components/Features";
import {
  calculateAge,
  calculateTotalTime,
  calculateLifeStats,
  calculateNextBirthday,
  calculatePreviousBirthday,
  getWeekday,
  calculateAllInsights,
  validateBirthDate,
  parseBirthDateLocal,
} from "../utils/birthdayUtils";

export default function BirthdayAnalyzer() {
  const [birthDate, setBirthDate] = useState("");
  // The date that has actually passed validateBirthDate. The ticking effect
  // below re-renders from this, not the raw `birthDate` input, so editing
  // the field (or typing an out-of-range value directly) can never render
  // results without going through validation via handleAnalyze first.
  const [analyzedDate, setAnalyzedDate] = useState("");
  const [age, setAge] = useState(null);
  const [totalTime, setTotalTime] = useState(null);
  const [lifeStats, setLifeStats] = useState(null);
  const [nextBirthday, setNextBirthday] = useState(null);
  const [previousBirthday, setPreviousBirthday] = useState(null);
  const [weekday, setWeekday] = useState("");
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState("");
  const [today] = useState(new Date());

  // Build "today" from local date parts, not toISOString() (which reports
  // the UTC calendar date) - otherwise the date input's max is one day
  // behind local "today" for anyone in a positive UTC-offset timezone.
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const updateData = useCallback((dateStr) => {
    const birth = parseBirthDateLocal(dateStr);
    if (!birth) return;

    setAge(calculateAge(birth));
    setTotalTime(calculateTotalTime(birth));
    setLifeStats(calculateLifeStats(birth));
    setNextBirthday(calculateNextBirthday(birth));
    setPreviousBirthday(calculatePreviousBirthday(birth));
    setWeekday(getWeekday(birth));
    setInsights(calculateAllInsights(birth));
  }, []);

  const handleAnalyze = (e) => {
    e.preventDefault();

    const validationError = validateBirthDate(birthDate);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setAnalyzedDate(birthDate);
    updateData(birthDate);
  };

  useEffect(() => {
    if (!analyzedDate) return;

    const interval = setInterval(() => {
      updateData(analyzedDate);
    }, 1000);

    return () => clearInterval(interval);
  }, [analyzedDate, updateData]);

  return (
    <div className="px-4 py-6">
      <Header />

      <div className="max-w-5xl mx-auto bg-(--card) rounded-xl shadow-lg overflow-hidden py-5">
        <div className="p-6 space-y-6">
          <BirthDatePicker
            birthDate={birthDate}
            setBirthDate={setBirthDate}
            handleAnalyze={handleAnalyze}
            todayString={todayString}
          />

          {error && (
            <div
              role="alert"
              className="rounded-lg bg-[var(--danger-soft)] p-3 text-center text-[var(--danger)]"
            >
              {error}
            </div>
          )}

          {age && (
            <>
              <AgeDisplay age={age} totalTime={totalTime} />
              <TimeLived totalTime={totalTime} />
              <CountdownTimer
                nextBirthday={nextBirthday}
                previousBirthday={previousBirthday}
                weekday={weekday}
              />
              <BirthdayInsights insights={insights} />
              <AgeAnalytics lifeStats={lifeStats} />
              <Milestones currentAge={age.years} />
            </>
          )}
        </div>
      </div>

      <Features />
    </div>
  );
}
