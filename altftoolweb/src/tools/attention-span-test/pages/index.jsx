// src/tools/attention-span-test/pages/index.jsx
"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  HeroHeader,
  TestConfigurationFullWidth,
  LiveTestAreaWithFullscreen,
  LiveAnalyticsPanel,
} from '../components';
import { ResultsDashboard } from '../components/ResultsDashboard';
import {
  generateCPTTrials,
  calculateCPTResults,
  TARGET_MODES,
  DIFFICULTY_PRESETS
} from '../utils';
import '../styles.css';
import { Check } from 'lucide-react';

export default function AttentionSpanTestHome() {
  // Config state
  const [durationSec, setDurationSec] = useState(60);
  const [difficultyKey, setDifficultyKey] = useState("medium");
  const [targetModeKey, setTargetModeKey] = useState("letters");
  const [speedIntervalMs, setSpeedIntervalMs] = useState(1100);
  const [distractionMode, setDistractionMode] = useState("none");

  // Test state
  const [phase, setPhase] = useState("setup");
  const [trials, setTrials] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isStimulusVisible, setIsStimulusVisible] = useState(false);
  const [responses, setResponses] = useState([]);
  const [timeLeftSec, setTimeLeftSec] = useState(60);
  const [results, setResults] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const testContainerRef = useRef(null);
  const timerRef = useRef(null);
  const hideTimerRef = useRef(null);
  const countdownRef = useRef(null);
  const stimulusAppearTime = useRef(0);
  const hasRespondedThisTrial = useRef(false);

  useEffect(() => {
    if (DIFFICULTY_PRESETS[difficultyKey]) {
      setSpeedIntervalMs(DIFFICULTY_PRESETS[difficultyKey].intervalMs);
    }
  }, [difficultyKey]);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const targetModeInfo = useMemo(() => {
    return TARGET_MODES[targetModeKey.toUpperCase()] || TARGET_MODES.LETTERS;
  }, [targetModeKey]);

  const liveStats = useMemo(() => {
    if (responses.length === 0 || trials.length === 0) {
      return { accuracyPct: 100, avgRtMs: 0, targetHits: 0, errorsCount: 0, impulsivityScore: 0, focusScore: 100 };
    }

    let hits = 0;
    let falseAlarms = 0;
    let rts = [];

    responses.forEach((resp, idx) => {
      const trial = trials[idx];
      if (!trial) return;

      if (resp && resp.pressed) {
        rts.push(resp.rt);
        if (trial.isTarget) hits++;
        else falseAlarms++;
      }
    });

    const avgRtMs = rts.length > 0 ? Math.round(rts.reduce((a, b) => a + b, 0) / rts.length) : 0;
    const totalTargets = trials.slice(0, responses.length).filter((t) => t.isTarget).length;
    const accuracyPct = totalTargets > 0 ? Math.min(100, Math.round((hits / totalTargets) * 100)) : 100;
    const errorsCount = falseAlarms + Math.max(0, totalTargets - hits);
    const impulsivityScore = Math.min(100, falseAlarms * 15);
    const focusScore = Math.max(10, Math.min(100, Math.round(accuracyPct - falseAlarms * 5 - (avgRtMs > 500 ? 10 : 0))));

    return { accuracyPct, avgRtMs, targetHits: hits, errorsCount, impulsivityScore, focusScore };
  }, [responses, trials]);

  const handleSpacebarResponse = useCallback(() => {
    if (phase !== "running" || currentIndex < 0 || hasRespondedThisTrial.current) return;

    const rt = Math.round(performance.now() - stimulusAppearTime.current);
    hasRespondedThisTrial.current = true;

    setResponses((prev) => {
      const arr = [...prev];
      arr[currentIndex] = { pressed: true, rt };
      return arr;
    });
  }, [phase, currentIndex]);

  useEffect(() => {
    if (phase !== "running") return;

    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        handleSpacebarResponse();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, handleSpacebarResponse]);

  // Start Assessment with Auto-Scroll to Test Canvas
  const startAssessment = useCallback(() => {
    cleanup();

    const generatedTrials = generateCPTTrials({
      durationSec,
      difficultyKey,
      targetModeKey,
    });

    setTrials(generatedTrials);
    setResponses([]);
    setCurrentIndex(-1);
    setTimeLeftSec(durationSec);
    setPhase("running");

    // Auto-scroll to Test Canvas
    setTimeout(() => {
      if (testContainerRef.current) {
        testContainerRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);

    countdownRef.current = setInterval(() => {
      setTimeLeftSec((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    let idx = 0;
    const runNext = () => {
      if (idx >= generatedTrials.length) {
        endAssessment(generatedTrials);
        return;
      }

      setCurrentIndex(idx);
      setIsStimulusVisible(true);
      stimulusAppearTime.current = performance.now();
      hasRespondedThisTrial.current = false;

      hideTimerRef.current = setTimeout(() => {
        setIsStimulusVisible(false);
      }, generatedTrials[idx].displayTime);

      idx++;
    };

    setTimeout(() => {
      runNext();
      timerRef.current = setInterval(runNext, speedIntervalMs);
    }, 800);
  }, [durationSec, difficultyKey, targetModeKey, speedIntervalMs, cleanup]);

  const endAssessment = useCallback((finalTrials = trials) => {
    cleanup();
    setPhase("feedback");

    setResponses((currentResponses) => {
      const finalResps = [...currentResponses];
      while (finalResps.length < finalTrials.length) {
        finalResps.push(null);
      }

      const calculated = calculateCPTResults({
        trials: finalTrials,
        responses: finalResps,
        totalTimeSec: durationSec,
      });

      setResults(calculated);
      return finalResps;
    });
  }, [trials, durationSec, cleanup]);

  const resetSettings = useCallback(() => {
    setDurationSec(60);
    setDifficultyKey("medium");
    setTargetModeKey("letters");
    setSpeedIntervalMs(1100);
    setDistractionMode("none");
    setPhase("setup");
  }, []);

  const exportResults = useCallback(() => {
    if (!results) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(results, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `CPT_Attention_Report_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setToastMessage("Report downloaded successfully!");
    setTimeout(() => setToastMessage(null), 3000);
  }, [results]);

  const shareReport = useCallback(() => {
    if (!results) return;
    const summaryText = `Attention Span Test Report:\nFocus Score: ${results.focusScore}/100\nAccuracy: ${results.accuracyPct}%\nAvg Reaction: ${results.avgRt}ms`;
    navigator.clipboard.writeText(summaryText).then(() => {
      setToastMessage("Summary copied to clipboard!");
      setTimeout(() => setToastMessage(null), 3000);
    });
  }, [results]);

  return (
    <div className="cpt-app-root cpt-bg-grid min-h-screen p-4 sm:p-6 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-7xl flex flex-col min-w-0 relative z-10">
        {/* 1. HERO HEADER WITH GRADIENT TITLE */}
        <HeroHeader currentPhase={phase} />

        {phase !== "feedback" && (
          <>
            {/* 2. FULL WIDTH TEST CONFIGURATION CARD */}
            <TestConfigurationFullWidth
              durationSec={durationSec}
              onDurationChange={setDurationSec}
              difficultyKey={difficultyKey}
              onDifficultyChange={setDifficultyKey}
              targetModeKey={targetModeKey}
              onTargetModeChange={setTargetModeKey}
              speedIntervalMs={speedIntervalMs}
              onSpeedIntervalChange={setSpeedIntervalMs}
              distractionMode={distractionMode}
              onDistractionModeChange={setDistractionMode}
              onStartAssessment={startAssessment}
              onResetSettings={resetSettings}
              isTesting={phase === "running"}
            />

            {/* 3. LIVE TEST AREA & LIVE ANALYTICS PANEL */}
            <div className="flex flex-col xl:flex-row items-stretch gap-6 w-full min-w-0">
              {/* Center Live Test Area with Fullscreen & Bottom Middle CTA */}
              <LiveTestAreaWithFullscreen
                testContainerRef={testContainerRef}
                isTesting={phase === "running"}
                timeLeftSec={timeLeftSec}
                currentTrialIdx={currentIndex}
                totalTrialsCount={trials.length || Math.floor((durationSec * 1000) / speedIntervalMs)}
                activeStimulus={currentIndex >= 0 && currentIndex < trials.length ? trials[currentIndex] : null}
                isStimulusVisible={isStimulusVisible}
                targetModeInfo={targetModeInfo}
                onSpacebarClick={handleSpacebarResponse}
                onStartAssessment={startAssessment}
                liveAccuracyPct={liveStats.accuracyPct}
                liveAvgRtMs={liveStats.avgRtMs}
                liveTargetHits={liveStats.targetHits}
                liveErrorsCount={liveStats.errorsCount}
                // Fullscreen Sidebars Props
                durationSec={durationSec}
                onDurationChange={setDurationSec}
                difficultyKey={difficultyKey}
                onDifficultyChange={setDifficultyKey}
                targetModeKey={targetModeKey}
                onTargetModeChange={setTargetModeKey}
                speedIntervalMs={speedIntervalMs}
                onSpeedIntervalChange={setSpeedIntervalMs}
                distractionMode={distractionMode}
                onDistractionModeChange={setDistractionMode}
                onResetSettings={resetSettings}
                liveFocusScore={liveStats.focusScore}
                liveImpulsivityScore={liveStats.impulsivityScore}
                liveTimelineData={responses.map((r, i) => ({ trial: i + 1, rt: r ? r.rt : 0 }))}
              />

              {/* Right Live Analytics Dashboard */}
              <LiveAnalyticsPanel
                liveFocusScore={liveStats.focusScore}
                liveAvgRtMs={liveStats.avgRtMs}
                liveAccuracyPct={liveStats.accuracyPct}
                liveImpulsivityScore={liveStats.impulsivityScore}
                liveTimelineData={responses.map((r, i) => ({ trial: i + 1, rt: r ? r.rt : 0 }))}
              />
            </div>
          </>
        )}

        {/* 4. POST-TEST RESULTS DASHBOARD */}
        {phase === "feedback" && results && (
          <ResultsDashboard
            results={results}
            onRetakeTest={() => setPhase("setup")}
            onShareReport={shareReport}
            onExportResults={exportResults}
          />
        )}
      </div>

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-[var(--primary)] text-[var(--primary-foreground)] font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="h-4 w-4 text-[var(--primary-foreground)]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
