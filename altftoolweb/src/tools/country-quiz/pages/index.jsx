"use client";

import { useState, useCallback } from "react";
import { Globe, Zap, BookOpen, BarChart3, Star, Clock } from "lucide-react";
import Header from "../components/Header";
import QuizSetup from "../components/QuizSetup";
import QuizPlay from "../components/QuizPlay";
import QuizResults from "../components/QuizResults";
import { fetchCountries, isOnline } from "../services/countriesApi";
import { generateQuiz } from "../utils/questionGenerator";

export default function CountryQuizPage() {
  const [screen, setScreen] = useState("home");
  const [questions, setQuestions] = useState([]);
  const [config, setConfig] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleStart = useCallback(async (cfg) => {
    setLoading(true);
    setError(null);
    try {
      if (!isOnline()) {
        setError("You appear to be offline. Please check your internet connection and try again.");
        setLoading(false);
        return;
      }
      const countries = await fetchCountries();
      const quiz = generateQuiz(countries, cfg);
      if (quiz.length === 0) {
        setError("Could not generate questions. Please try again.");
        setLoading(false);
        return;
      }
      setConfig(cfg);
      setQuestions(quiz);
      setScreen("quiz");
    } catch (err) {
      setError("Failed to load country data. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFinish = useCallback((data) => {
    setResultData(data);
    setScreen("results");
  }, []);

  const handleRestart = useCallback(() => {
    setResultData(null);
    setScreen("quiz");
  }, []);

  const handleHome = useCallback(() => {
    setScreen("home");
    setQuestions([]);
    setResultData(null);
    setConfig(null);
    setError(null);
  }, []);

  return (
    <div className="bg-[var(--background)] px-4 py-6 text-[var(--foreground)] transition-colors sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Header />

        {error && (
          <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-600">
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          {screen === "home" && <QuizSetup onStart={handleStart} loading={loading} />}
          {screen === "quiz" && questions.length > 0 && (
            <QuizPlay questions={questions} config={config} onFinish={handleFinish} />
          )}
          {screen === "results" && resultData && (
            <QuizResults
              data={resultData}
              config={config}
              onRestart={handleRestart}
              onHome={handleHome}
            />
          )}
        </div>

        {screen === "home" && (
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {[
              { icon: Globe, label: "200+ Countries" },
              { icon: Zap, label: "Real-Time Data" },
              { icon: BookOpen, label: "10 Question Types" },
              { icon: BarChart3, label: "Performance Tracking" },
              { icon: Star, label: "Achievements" },
              { icon: Clock, label: "Timed Challenges" },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-semibold text-[var(--muted-foreground)]"
              >
                <Icon className="h-3.5 w-3.5 text-[var(--primary)]" />
                {label}
              </span>
            ))}
          </div>
        )}

        <p className="mt-6 text-center text-xs text-[var(--muted-foreground)]">
          Country data sourced from mledoze/countries dataset and flagcdn.com. No data is stored on servers.
        </p>
      </div>
    </div>
  );
}
