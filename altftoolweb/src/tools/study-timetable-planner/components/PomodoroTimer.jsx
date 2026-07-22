"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Timer, Coffee, Zap, Bell, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState("work"); // work, shortBreak, longBreak
  const [soundEnabled, setSoundEnabled] = useState(true);

  const timerRef = useRef(null);

  const modes = {
    work: { label: "Focus", time: 25 * 60, color: "indigo" },
    shortBreak: { label: "Short Break", time: 5 * 60, color: "green" },
    longBreak: { label: "Long Break", time: 15 * 60, color: "blue" }
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft]);

  const handleTimerComplete = () => {
    setIsActive(false);
    if (soundEnabled) {
      // Notification sound logic here
    }
    // Auto-switch mode or notify user
    alert(`${modes[mode].label} session complete!`);
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(modes[mode].time);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(modes[newMode].time);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = (timeLeft / modes[mode].time) * 100;

  return (
    <div className="flex flex-col items-center justify-center space-y-12 py-12">
      {/* Mode Selector */}
      <div className="flex bg-(--card) p-1.5 rounded-2xl border border-(--border) shadow-xl backdrop-blur-md">
        {Object.entries(modes).map(([key, config]) => (
          <button
            key={key}
            onClick={() => switchMode(key)}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === key
              ? `bg-${config.color}-600 text-white shadow-lg`
              : "text-(--muted-foreground) hover:bg-(--card-hover-bg)"
            }`}
          >
            {config.label}
          </button>
        ))}
      </div>

      {/* Timer Circle */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Progress Background */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 320 320">
          <circle
            cx="160" cy="160" r="145"
            className="stroke-(--border) fill-none"
            strokeWidth="10"
          />
          <motion.circle
            cx="160" cy="160" r="145"
            className={`stroke-${modes[mode].color}-600 fill-none`}
            strokeWidth="10"
            strokeDasharray="911.06"
            animate={{ strokeDashoffset: 911.06 - (911.06 * progress) / 100 }}
            strokeLinecap="round"
          />
        </svg>

        {/* Timer Content */}
        <div className="relative text-center z-10">
          <motion.div
            key={timeLeft}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-5xl font-black mb-1 tracking-tighter"
          >
            {formatTime(timeLeft)}
          </motion.div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-(--muted-foreground)">
            {isActive ? "Stay Focused" : "Ready?"}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6">
        <button
          onClick={resetTimer}
          className="p-4 rounded-full bg-(--card) border border-(--border) text-(--muted-foreground) hover:text-(--primary) hover:border-(--primary) transition-all shadow-lg active:scale-90"
        >
          <RotateCcw className="w-6 h-6" />
        </button>

        <button
          onClick={toggleTimer}
          className={`p-8 rounded-full shadow-2xl transition-all active:scale-90 flex items-center justify-center ${
            isActive
            ? "bg-red-500 text-white hover:bg-red-600"
            : `bg-${modes[mode].color}-600 text-white hover:opacity-90`
          }`}
        >
          {isActive ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current translate-x-1" />}
        </button>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-4 rounded-full bg-(--card) border border-(--border) text-(--muted-foreground) hover:text-(--primary) transition-all shadow-lg active:scale-90"
        >
          {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </button>
      </div>

      {/* Motivation Insight */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md text-center p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl"
      >
        <p className="text-sm italic text-indigo-700 font-medium">
          "The secret of getting ahead is getting started."
        </p>
      </motion.div>
    </div>
  );
}
