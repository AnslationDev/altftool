// src/tools/attention-span-test/components.jsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Brain, Zap, Target, BarChart2, Clock, CheckCircle2, AlertTriangle,
  RotateCcw, Play, Volume2, Eye, Shield, Award, Sparkles, Check,
  Download, Share2, HelpCircle, Activity, ChevronRight, Sliders, ArrowUpRight,
  Maximize2, Minimize2, PanelLeft, PanelRight, X
} from 'lucide-react';
import { TARGET_MODES, DIFFICULTY_PRESETS } from './utils';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

import Lottie from 'lottie-react';
import sensorAnimation from './components/Sensor.json';

/**
 * 1. HERO HEADER & PROGRESS SECTION
 */
export const HeroHeader = ({ currentPhase }) => {
  const getStageState = (stageName) => {
    if (currentPhase === "setup") {
      if (stageName === "prepare") return "current";
      return "upcoming";
    }
    if (currentPhase === "running") {
      if (stageName === "prepare") return "completed";
      if (stageName === "testing") return "current";
      return "upcoming";
    }
    if (currentPhase === "feedback") {
      return "completed";
    }
    return "upcoming";
  };

  return (
    <header className="w-full mb-8 min-w-0">
      {/* Hero Container Card */}
      <div className="cpt-glass-card p-6 sm:p-8 relative overflow-hidden mb-6 min-w-0 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-md">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10 min-w-0">
          {/* Left Hero */}
          <div className="space-y-4 max-w-2xl min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <div className="h-14 w-14 rounded-xl bg-[var(--primary-soft)] border border-[var(--primary)]/30 flex items-center justify-center text-[var(--primary)] shrink-0 shadow-sm">
                <Brain className="h-8 w-8 text-[var(--primary)] animate-brain-pulse" />
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/20 bg-[var(--primary-soft)] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[var(--primary)] whitespace-nowrap">
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                <span>Continuous Performance Task</span>
              </div>
            </div>

            {/* Gradient Main Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight cpt-gradient-heading break-words">
              Attention Span Test
            </h1>

            <p className="text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
              Measure sustained attention, focus, and impulsivity using a scientific Continuous Performance Task (CPT).
            </p>

            {/* 4 Badges */}
            <div className="flex flex-wrap gap-2 pt-1 min-w-0">
              {[
                { icon: Brain, label: "Scientific" },
                { icon: Zap, label: "Real Time" },
                { icon: Target, label: "CPT Test" },
                { icon: BarChart2, label: "Analytics" },
              ].map((badge, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] text-xs font-semibold text-[var(--foreground)] hover:-translate-y-0.5 transition-all shadow-2xs whitespace-nowrap shrink-0 max-w-full"
                >
                  <badge.icon className="h-3.5 w-3.5 text-[var(--primary)] shrink-0" />
                  <span className="truncate">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Lottie Sensor Animation Illustration */}
          <div className="shrink-0 relative hidden lg:block">
            <div className="h-44 w-44 rounded-full bg-[var(--primary-soft)] border border-[var(--primary)]/20 flex items-center justify-center p-2 overflow-hidden shadow-sm">
              <Lottie animationData={sensorAnimation} loop={true} className="w-36 h-36" />
            </div>
          </div>
        </div>
      </div>

      {/* Progress Stage Tracker Header Card */}
      <div className="cpt-glass-card p-4 sm:p-5 min-w-0 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-md">
        <div className="flex items-center justify-between max-w-3xl mx-auto relative min-w-0">
          {/* Stage 1: Prepare */}
          <div className="flex items-center gap-2 z-10 shrink-0">
            <div className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
              getStageState("prepare") === "completed"
                ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm"
                : "bg-[var(--primary-soft)] text-[var(--primary)] ring-2 ring-[var(--primary)] shadow-sm"
            }`}>
              {getStageState("prepare") === "completed" ? <Check className="h-4 w-4" /> : "1"}
            </div>
            <span className={`text-xs font-bold tracking-wide ${
              getStageState("prepare") === "upcoming" ? "text-[var(--muted-foreground)]" : "text-[var(--foreground)]"
            }`}>
              Prepare
            </span>
          </div>

          {/* Connecting Line 1 */}
          <div className="flex-1 h-0.5 mx-2 sm:mx-3 bg-[var(--border)] relative overflow-hidden">
            <div className={`h-full bg-[var(--primary)] transition-all duration-500 ${
              getStageState("prepare") === "completed" ? "w-full" : "w-0"
            }`} />
          </div>

          {/* Stage 2: Testing */}
          <div className="flex items-center gap-2 z-10 shrink-0">
            <div className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
              getStageState("testing") === "completed"
                ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm"
                : getStageState("testing") === "current"
                ? "bg-[var(--primary-soft)] text-[var(--primary)] ring-2 ring-[var(--primary)] shadow-sm"
                : "bg-[var(--surface-soft)] border border-[var(--border)] text-[var(--muted-foreground)]"
            }`}>
              {getStageState("testing") === "completed" ? <Check className="h-4 w-4" /> : "2"}
            </div>
            <span className={`text-xs font-bold tracking-wide ${
              getStageState("testing") === "upcoming" ? "text-[var(--muted-foreground)]" : "text-[var(--foreground)]"
            }`}>
              Testing
            </span>
          </div>

          {/* Connecting Line 2 */}
          <div className="flex-1 h-0.5 mx-2 sm:mx-3 bg-[var(--border)] relative overflow-hidden">
            <div className={`h-full bg-[var(--primary)] transition-all duration-500 ${
              getStageState("testing") === "completed" ? "w-full" : "w-0"
            }`} />
          </div>

          {/* Stage 3: Results */}
          <div className="flex items-center gap-2 z-10 shrink-0">
            <div className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
              getStageState("results") === "completed"
                ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm"
                : "bg-[var(--surface-soft)] border border-[var(--border)] text-[var(--muted-foreground)]"
            }`}>
              3
            </div>
            <span className={`text-xs font-bold tracking-wide ${
              getStageState("results") === "upcoming" ? "text-[var(--muted-foreground)]" : "text-[var(--foreground)]"
            }`}>
              Results
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

/**
 * 2. FULL WIDTH TEST CONFIGURATION CARD
 */
export const TestConfigurationFullWidth = ({
  durationSec,
  onDurationChange,
  difficultyKey,
  onDifficultyChange,
  targetModeKey,
  onTargetModeChange,
  speedIntervalMs,
  onSpeedIntervalChange,
  distractionMode,
  onDistractionModeChange,
  onStartAssessment,
  onResetSettings,
  isTesting,
}) => {
  return (
    <div className="cpt-glass-card p-5 sm:p-6 w-full mb-6 space-y-6 min-w-0 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-md">
      <div className="pb-4 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[var(--foreground)] tracking-tight flex items-center gap-2">
            <Sliders className="h-5 w-5 text-[var(--primary)] shrink-0" />
            Test Configuration
          </h2>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Configure assessment parameters prior to initiating the test.
          </p>
        </div>

        {/* Start Assessment & Reset Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onResetSettings}
            disabled={isTesting}
            className="px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shadow-xs"
            type="button"
          >
            <RotateCcw className="h-3.5 w-3.5 shrink-0" />
            <span>Reset</span>
          </button>

          <button
            onClick={onStartAssessment}
            disabled={isTesting}
            className="px-5 py-2 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] font-bold text-xs uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
            type="button"
          >
            <Play className="h-4 w-4 fill-current shrink-0" />
            <span>{isTesting ? "Test Running..." : "Start Assessment"}</span>
          </button>
        </div>
      </div>

      {/* Grid of Inner Configuration Sub-Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 min-w-0">
        {/* 1. Duration */}
        <div className="p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-2 min-w-0 shadow-2xs">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] block">
            Duration
          </label>
          <div className="grid grid-cols-4 gap-1 p-1 bg-[var(--card)] rounded-xl border border-[var(--border)]">
            {[30, 60, 90, 120].map((d) => (
              <button
                key={d}
                onClick={() => onDurationChange(d)}
                disabled={isTesting}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all truncate ${
                  durationSec === d
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
                type="button"
              >
                {d}s
              </button>
            ))}
          </div>
        </div>

        {/* 2. Difficulty */}
        <div className="p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-2 min-w-0 shadow-2xs">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] block">
            Difficulty
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {Object.keys(DIFFICULTY_PRESETS).map((key) => (
              <button
                key={key}
                onClick={() => onDifficultyChange(key)}
                disabled={isTesting}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold uppercase transition-all text-center whitespace-nowrap ${
                  difficultyKey === key
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs"
                    : "bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
                title={key}
                type="button"
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Target Mode */}
        <div className="p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-2 lg:col-span-2 min-w-0 shadow-2xs">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] block">
            Target Mode
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.values(TARGET_MODES).map((mode) => {
              const isSelected = targetModeKey === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => onTargetModeChange(mode.id)}
                  disabled={isTesting}
                  className={`p-2.5 rounded-xl border text-left transition-all min-w-0 ${
                    isSelected
                      ? "bg-[var(--primary-soft)] border-[var(--primary)] text-[var(--foreground)] font-bold shadow-xs"
                      : "bg-[var(--card)] border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  }`}
                  type="button"
                >
                  <span className="text-xs font-bold block text-[var(--foreground)] truncate">{mode.label}</span>
                  <span className="text-[10px] text-[var(--muted-foreground)] truncate block mt-0.5">{mode.targetStimulus}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Speed Slider */}
        <div className="p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-2 lg:col-span-2 min-w-0 shadow-2xs">
          <div className="flex justify-between items-center text-xs">
            <label className="font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              Stimulus Speed
            </label>
            <span className="font-mono text-[var(--primary)] font-bold">{speedIntervalMs}ms</span>
          </div>
          <input
            type="range"
            min={500}
            max={1600}
            step={50}
            value={speedIntervalMs}
            onChange={(e) => onSpeedIntervalChange(Number(e.target.value))}
            disabled={isTesting}
            className="w-full accent-[var(--primary)] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[var(--muted-foreground)] font-bold uppercase">
            <span>Fast (500ms)</span>
            <span>Slow (1600ms)</span>
          </div>
        </div>

        {/* 5. Distraction Mode */}
        <div className="p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-2 lg:col-span-2 min-w-0 shadow-2xs">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] block">
            Distraction Mode
          </label>
          <div className="grid grid-cols-4 gap-2">
            {["none", "visual", "audio", "mixed"].map((mode) => (
              <button
                key={mode}
                onClick={() => onDistractionModeChange(mode)}
                disabled={isTesting}
                className={`py-2 px-1 rounded-xl border text-[11px] font-bold uppercase transition-all truncate ${
                  distractionMode === mode
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs"
                    : "bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
                title={mode}
                type="button"
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 3. VERTICAL SIDEBAR CONTROLS (For Fullscreen Overlay Mode)
 */
export const TestSidebarControls = ({
  durationSec,
  onDurationChange,
  difficultyKey,
  onDifficultyChange,
  targetModeKey,
  onTargetModeChange,
  speedIntervalMs,
  onSpeedIntervalChange,
  distractionMode,
  onDistractionModeChange,
  onStartAssessment,
  onResetSettings,
  isTesting,
  onClose = null,
}) => {
  return (
    <div className="cpt-glass-card p-4 space-y-4 bg-[var(--card)] border border-[var(--border)] shadow-xl text-[var(--foreground)] rounded-xl">
      <div className="pb-2 border-b border-[var(--border)] flex items-center justify-between">
        <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
          <Sliders className="h-4 w-4 text-[var(--primary)]" />
          Test Configuration
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-soft)]"
            title="Close Config Sidebar"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Duration */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-semibold uppercase text-[var(--muted-foreground)] tracking-wider">Duration</label>
        <div className="grid grid-cols-4 gap-1 p-1 bg-[var(--surface-soft)] rounded-lg border border-[var(--border)]">
          {[30, 60, 90, 120].map((d) => (
            <button
              key={d}
              onClick={() => onDurationChange(d)}
              disabled={isTesting}
              className={`py-1 rounded text-xs font-bold ${
                durationSec === d ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "text-[var(--muted-foreground)]"
              }`}
              type="button"
            >
              {d}s
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-semibold uppercase text-[var(--muted-foreground)] tracking-wider">Difficulty</label>
        <div className="grid grid-cols-2 gap-1">
          {Object.keys(DIFFICULTY_PRESETS).map((key) => (
            <button
              key={key}
              onClick={() => onDifficultyChange(key)}
              disabled={isTesting}
              className={`py-1.5 rounded-lg text-[10px] font-bold uppercase ${
                difficultyKey === key ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "bg-[var(--surface-soft)] text-[var(--muted-foreground)] border border-[var(--border)]"
              }`}
              type="button"
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* Target Mode */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-semibold uppercase text-[var(--muted-foreground)] tracking-wider">Target Mode</label>
        <div className="grid grid-cols-2 gap-1.5">
          {Object.values(TARGET_MODES).map((mode) => (
            <button
              key={mode.id}
              onClick={() => onTargetModeChange(mode.id)}
              disabled={isTesting}
              className={`p-2 rounded-lg text-left text-xs font-bold truncate ${
                targetModeKey === mode.id ? "bg-[var(--primary-soft)] border border-[var(--primary)] text-[var(--foreground)]" : "bg-[var(--surface-soft)] border border-[var(--border)] text-[var(--muted-foreground)]"
              }`}
              type="button"
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Speed Slider */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-bold">
          <span className="text-[var(--muted-foreground)] uppercase tracking-wider">Speed</span>
          <span className="text-[var(--primary)] font-mono">{speedIntervalMs}ms</span>
        </div>
        <input
          type="range"
          min={500}
          max={1600}
          step={50}
          value={speedIntervalMs}
          onChange={(e) => onSpeedIntervalChange(Number(e.target.value))}
          disabled={isTesting}
          className="w-full accent-[var(--primary)] cursor-pointer"
        />
      </div>

      {/* Start Button */}
      <button
        onClick={onStartAssessment}
        disabled={isTesting}
        className="w-full py-2.5 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] font-bold text-xs uppercase tracking-wider shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5"
        type="button"
      >
        <Play className="h-3.5 w-3.5 fill-current" />
        <span>{isTesting ? "Running" : "Start"}</span>
      </button>
    </div>
  );
};

/**
 * 4. LIVE TEST AREA WITH FULLSCREEN & OVERLAY SIDEBARS
 */
export const LiveTestAreaWithFullscreen = ({
  testContainerRef,
  isTesting,
  timeLeftSec,
  currentTrialIdx,
  totalTrialsCount,
  activeStimulus,
  isStimulusVisible,
  targetModeInfo,
  onSpacebarClick,
  onStartAssessment,
  liveAccuracyPct,
  liveAvgRtMs,
  liveTargetHits,
  liveErrorsCount,
  // Fullscreen Sidebar Props
  durationSec,
  onDurationChange,
  difficultyKey,
  onDifficultyChange,
  targetModeKey,
  onTargetModeChange,
  speedIntervalMs,
  onSpeedIntervalChange,
  distractionMode,
  onDistractionModeChange,
  onResetSettings,
  liveFocusScore,
  liveImpulsivityScore,
  liveTimelineData,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);

  useEffect(() => {
    const handleFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFSChange);
    return () => document.removeEventListener("fullscreenchange", handleFSChange);
  }, []);

  const toggleFullscreen = () => {
    if (!testContainerRef.current) return;
    if (!document.fullscreenElement) {
      testContainerRef.current.requestFullscreen().catch((err) => console.error(err));
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div
      ref={testContainerRef}
      className={`cpt-glass-card p-6 flex flex-col justify-between items-center overflow-hidden relative select-none shadow-md transition-all rounded-xl bg-[var(--card)] border border-[var(--border)] ${
        isFullscreen ? "h-screen w-screen rounded-none border-none bg-[var(--background)]" : "min-h-[520px] flex-1"
      }`}
    >
      {/* Top Control Bar */}
      <div className="w-full flex items-center justify-between pb-4 border-b border-[var(--border)] z-30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[var(--primary)] shrink-0" />
            <span className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Time:</span>
            <span className="font-mono text-base font-bold text-[var(--foreground)]">
              00:{timeLeftSec < 10 ? `0${timeLeftSec}` : timeLeftSec}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-[var(--primary)] shrink-0" />
            <span className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Trial:</span>
            <span className="font-mono text-base font-bold text-[var(--foreground)]">
              {currentTrialIdx < 0 ? 0 : currentTrialIdx + 1} / {totalTrialsCount || 60}
            </span>
          </div>
        </div>

        {/* Fullscreen & Sidebar Toggles */}
        <div className="flex items-center gap-2">
          {isFullscreen && (
            <>
              <button
                onClick={() => setShowLeftSidebar((prev) => !prev)}
                className={`p-2 rounded-xl border transition-all ${
                  showLeftSidebar ? "bg-[var(--primary-soft)] text-[var(--primary)] border-[var(--primary)]" : "bg-[var(--surface-soft)] text-[var(--muted-foreground)] border-[var(--border)]"
                }`}
                title="Toggle Left Config Sidebar"
                type="button"
              >
                <PanelLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowRightSidebar((prev) => !prev)}
                className={`p-2 rounded-xl border transition-all ${
                  showRightSidebar ? "bg-[var(--primary-soft)] text-[var(--primary)] border-[var(--primary)]" : "bg-[var(--surface-soft)] text-[var(--muted-foreground)] border-[var(--border)]"
                }`}
                title="Toggle Right Analytics Panel"
                type="button"
              >
                <PanelRight className="h-4 w-4" />
              </button>
            </>
          )}

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all"
            title="Fullscreen Mode"
            type="button"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4 text-[var(--primary)]" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Center 300px Circular Ring & Stimulus Display */}
      <div className="relative my-6 flex items-center justify-center z-10">
        <svg className="w-72 h-72 transform -rotate-90">
          <circle
            cx="144"
            cy="144"
            r="130"
            className="stroke-[var(--surface-soft)]"
            strokeWidth="10"
            fill="transparent"
          />
          <circle
            cx="144"
            cy="144"
            r="130"
            className="stroke-[var(--primary)] transition-all duration-300"
            strokeWidth="10"
            strokeDasharray="816"
            strokeDashoffset={816 - (816 * (currentTrialIdx < 0 ? 0 : (currentTrialIdx + 1) / (totalTrialsCount || 1)))}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center Stimulus Letter */}
        <div className="absolute inset-0 flex items-center justify-center">
          {isTesting ? (
            isStimulusVisible && activeStimulus ? (
              <span className="text-8xl sm:text-9xl font-black text-[var(--foreground)] animate-scale-up select-none">
                {activeStimulus.stimulus}
              </span>
            ) : (
              <span className="text-8xl opacity-0 select-none">A</span>
            )
          ) : (
            <div className="text-center space-y-2 p-4">
              <Brain className="h-16 w-16 text-[var(--primary)] mx-auto opacity-40 animate-pulse" />
              <span className="text-sm font-bold text-[var(--muted-foreground)] block">
                Click Start Assessment Below
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Middle Controls */}
      <div className="w-full space-y-3 text-center z-30 max-w-md mx-auto">
        <div className="p-2.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)]">
          <p className="text-xs font-semibold text-[var(--foreground)]">
            Instruction: {targetModeInfo ? targetModeInfo.desc : "Press SPACE for targets!"}
          </p>
        </div>

        {!isTesting ? (
          <button
            onClick={onStartAssessment}
            className="w-full py-3.5 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] font-bold text-sm uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            type="button"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>Start Assessment</span>
          </button>
        ) : (
          <button
            onClick={onSpacebarClick}
            className="w-full py-3.5 rounded-xl bg-[var(--card)] border-2 border-[var(--primary)] text-[var(--foreground)] font-black text-lg tracking-widest shadow-sm hover:bg-[var(--primary-soft)] active:scale-95 transition-all select-none"
            type="button"
          >
            [ PRESS SPACEBAR ]
          </button>
        )}
      </div>

      {/* Live Counter Footer Row */}
      <div className="w-full pt-4 mt-4 border-t border-[var(--border)] grid grid-cols-4 gap-2 text-center z-10">
        <div>
          <span className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider block">Accuracy</span>
          <span className="font-mono font-bold text-sm text-[var(--primary)]">{liveAccuracyPct}%</span>
        </div>
        <div>
          <span className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider block">Reaction</span>
          <span className="font-mono font-bold text-sm text-[var(--foreground)]">{liveAvgRtMs}ms</span>
        </div>
        <div>
          <span className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider block">Targets</span>
          <span className="font-mono font-bold text-sm text-[var(--primary)]">{liveTargetHits}</span>
        </div>
        <div>
          <span className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider block">Errors</span>
          <span className="font-mono font-bold text-sm text-[var(--muted-foreground)]">{liveErrorsCount}</span>
        </div>
      </div>

      {/* FULLSCREEN SIDEBAR OVERLAYS */}
      {isFullscreen && (
        <>
          {/* Left Overlay Sidebar */}
          {showLeftSidebar && (
            <div className="absolute left-6 top-20 bottom-6 z-20 w-[270px] overflow-y-auto cpt-scrollbar">
              <TestSidebarControls
                durationSec={durationSec}
                onDurationChange={onDurationChange}
                difficultyKey={difficultyKey}
                onDifficultyChange={onDifficultyChange}
                targetModeKey={targetModeKey}
                onTargetModeChange={onTargetModeChange}
                speedIntervalMs={speedIntervalMs}
                onSpeedIntervalChange={onSpeedIntervalChange}
                distractionMode={distractionMode}
                onDistractionModeChange={onDistractionModeChange}
                onStartAssessment={onStartAssessment}
                onResetSettings={onResetSettings}
                isTesting={isTesting}
                onClose={() => setShowLeftSidebar(false)}
              />
            </div>
          )}

          {/* Right Overlay Sidebar */}
          {showRightSidebar && (
            <div className="absolute right-6 top-20 bottom-6 z-20 w-[280px] overflow-y-auto cpt-scrollbar">
              <LiveAnalyticsPanel
                liveFocusScore={liveFocusScore}
                liveAvgRtMs={liveAvgRtMs}
                liveAccuracyPct={liveAccuracyPct}
                liveImpulsivityScore={liveImpulsivityScore}
                liveTimelineData={liveTimelineData}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

/**
 * 5. RIGHT LIVE ANALYTICS DASHBOARD (~320px)
 */
export const LiveAnalyticsPanel = ({
  liveFocusScore,
  liveAvgRtMs,
  liveAccuracyPct,
  liveImpulsivityScore,
  liveTimelineData,
}) => {
  return (
    <aside className="w-full xl:w-[320px] shrink-0">
      <div className="cpt-glass-card p-5 space-y-4 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-md">
        <div className="pb-3 border-b border-[var(--border)]">
          <h2 className="text-lg font-bold text-[var(--foreground)] tracking-tight flex items-center gap-2">
            <Activity className="h-5 w-5 text-[var(--primary)] shrink-0" />
            Live Analytics
          </h2>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Real-time neural response metrics
          </p>
        </div>

        {/* 1. Focus Score Gauge Card */}
        <div className="p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] block">Focus Score</span>
            <span className="text-3xl font-black text-[var(--primary)] mt-1 block">{liveFocusScore}</span>
          </div>
          <div className="h-16 w-16 rounded-full border-4 border-[var(--primary)] flex items-center justify-center text-xs font-bold text-[var(--primary)] bg-[var(--card)] shadow-xs">
            {liveFocusScore}/100
          </div>
        </div>

        {/* 2. Reaction Time Real-Time Line Graph Card */}
        <div className="p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-2 shadow-2xs">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Reaction Time Trend</span>
            <span className="font-mono text-[var(--primary)] font-bold">{liveAvgRtMs}ms</span>
          </div>
          <div className="h-28 w-full bg-[var(--card)] rounded-xl border border-[var(--border)] p-2">
            {liveTimelineData && liveTimelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={liveTimelineData.slice(-15)}>
                  <Line type="monotone" dataKey="rt" stroke="var(--primary)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[11px] text-[var(--muted-foreground)] font-semibold">
                Waiting for trials...
              </div>
            )}
          </div>
        </div>

        {/* 3. Accuracy Circular Progress Card */}
        <div className="p-3.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] flex items-center justify-between shadow-2xs">
          <span className="text-xs font-bold text-[var(--foreground)]">Vigilance Accuracy</span>
          <span className="font-mono text-sm font-black text-[var(--primary)]">{liveAccuracyPct}%</span>
        </div>

        {/* 4. Impulsivity Bar Card */}
        <div className="p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-2 shadow-2xs">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Impulsivity Index</span>
            <span className="text-[var(--primary)] font-mono">{liveImpulsivityScore}%</span>
          </div>
          <div className="h-3 w-full bg-[var(--card)] rounded-full border border-[var(--border)] overflow-hidden">
            <div
              className="h-full bg-[var(--primary)] rounded-full transition-all duration-300"
              style={{ width: `${liveImpulsivityScore}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-[var(--muted-foreground)] font-bold uppercase">
            <span>Low Inhibitory Risk</span>
            <span>High Risk</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
