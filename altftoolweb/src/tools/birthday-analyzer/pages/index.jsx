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
} from "../utils/birthdayUtils";

export default function BirthdayAnalyzer() {
  const [birthDate, setBirthDate] = useState("");
  const [age, setAge] = useState(null);
  const [totalTime, setTotalTime] = useState(null);
  const [lifeStats, setLifeStats] = useState(null);
  const [nextBirthday, setNextBirthday] = useState(null);
  const [previousBirthday, setPreviousBirthday] = useState(null);
  const [weekday, setWeekday] = useState("");
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState("");
  const [today] = useState(new Date());

  const todayString = today.toISOString().split("T")[0];

  const updateData = useCallback((dateStr) => {
    const birth = new Date(dateStr);

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
    updateData(birthDate);
  };

  useEffect(() => {
    if (!birthDate || error) return;

    const interval = setInterval(() => {
      updateData(birthDate);
    }, 1000);

    return () => clearInterval(interval);
  }, [birthDate, error, updateData]);

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
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-center">
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
