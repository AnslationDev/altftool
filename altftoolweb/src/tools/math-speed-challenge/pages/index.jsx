"use client";

import { useState, useCallback } from "react";
import Header from "../components/Header";
import GameSetup from "../components/GameSetup";
import GamePlay from "../components/GamePlay";
import Results from "../components/Results";

export default function MathSpeedChallenge() {
  const [status, setStatus] = useState("setup");
  const [gameConfig, setGameConfig] = useState(null);
  const [resultData, setResultData] = useState(null);

  const handleStart = useCallback((config) => {
    setGameConfig(config);
    setStatus("playing");
  }, []);

  const handleFinish = useCallback((data) => {
    setResultData(data);
    setStatus("results");
  }, []);

  const handleRestart = useCallback(() => {
    setResultData(null);
    setStatus("playing");
  }, []);

  const handleReset = useCallback(() => {
    setResultData(null);
    setGameConfig(null);
    setStatus("setup");
  }, []);

  return (
    <div className="bg-[var(--background)] px-4 py-6 text-[var(--foreground)] transition-colors sm:px-6">
      <div className="mx-auto max-w-4xl">
        <Header />
        {status === "setup" && <GameSetup onStart={handleStart} />}
        {status === "playing" && gameConfig && <GamePlay config={gameConfig} onFinish={handleFinish} />}
        {status === "results" && resultData && (
          <Results data={resultData} onRestart={handleRestart} onReset={handleReset} />
        )}
        <p className="mt-6 text-center text-xs text-[var(--muted-foreground)]">
          All calculations run in your browser. High scores are stored locally.
        </p>
      </div>
    </div>
  );
}
