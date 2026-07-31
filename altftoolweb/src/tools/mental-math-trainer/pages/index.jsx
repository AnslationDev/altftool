"use client";

import { useState, useCallback } from "react";
import Header from "../components/Header";
import GameSetup from "../components/GameSetup";
import GamePlay from "../components/GamePlay";
import Results from "../components/Results";

export default function MentalMathTrainer() {
  const [status, setStatus] = useState("setup");
  const [gameConfig, setGameConfig] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [bestStreak, setBestStreak] = useState(0);

  const handleStart = useCallback((config) => {
    setGameConfig(config);
    setStatus("playing");
  }, []);

  const handleDailyChallenge = useCallback(() => {
    setGameConfig({
      questionType: "mixed",
      difficulty: "medium",
      gameMode: "daily",
      questionCount: 20,
      timerDuration: 120,
    });
    setStatus("playing");
  }, []);

  const handleFinish = useCallback((finalAnswers, finalBestStreak = 0) => {
    setAnswers(finalAnswers);
    setBestStreak(finalBestStreak);
    setStatus("results");
  }, []);

  const handleRestart = useCallback(() => {
    setAnswers([]);
    setStatus("playing");
  }, []);

  const handleReset = useCallback(() => {
    setAnswers([]);
    setGameConfig(null);
    setStatus("setup");
  }, []);

  return (
    <div className="bg-[var(--background)] px-4 py-6 text-[var(--foreground)] transition-colors sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Header />

        {status === "setup" && (
          <GameSetup onStart={handleStart} onDailyChallenge={handleDailyChallenge} />
        )}

        {status === "playing" && gameConfig && (
          <GamePlay config={gameConfig} onFinish={handleFinish} />
        )}

        {status === "results" && (
          <Results
            answers={answers}
            difficulty={gameConfig?.difficulty}
            bestStreak={bestStreak}
            onRestart={handleRestart}
            onReset={handleReset}
          />
        )}

        <p className="mt-6 text-center text-xs text-[var(--muted-foreground)]">
          All calculations run in your browser. No data is stored or uploaded.
        </p>
      </div>
    </div>
  );
}
