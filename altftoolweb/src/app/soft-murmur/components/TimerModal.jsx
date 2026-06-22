"use client";

import React, { useState } from "react";
import * as Icons from "lucide-react";

export default function TimerModal({
  isOpen,
  onClose,
  timerTime,
  isTimerActive,
  onStartTimer,
  onCancelTimer,
}) {
  const [customMin, setCustomMin] = useState("20");
  const [fadeOut, setFadeOut] = useState(true);

  if (!isOpen) return null;

  const handleStart = (min) => {
    const minutes = parseInt(min, 10);
    if (!isNaN(minutes) && minutes > 0) {
      onStartTimer(minutes, fadeOut);
      onClose();
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content relative bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Close modal"
        >
          <Icons.X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
            <Icons.Clock size={20} />
          </div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-50">
            Sleep Timer
          </h2>
        </div>

        {isTimerActive ? (
          <div className="text-center py-6">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
              Active Timer
            </p>
            <div className="text-4xl font-extrabold text-sky-500 font-mono mb-4 animate-pulse">
              {formatTime(timerTime)}
            </div>
            <button
              onClick={() => {
                onCancelTimer();
                onClose();
              }}
              className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-bold transition-colors flex items-center gap-2 mx-auto"
            >
              <Icons.Clock size={16} />
              Cancel Timer
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
              Set a timer to automatically pause the ambient player when the countdown ends.
            </p>

            {/* Quick Selects */}
            <div className="grid grid-cols-4 gap-2">
              {[15, 30, 45, 60].map((min) => (
                <button
                  key={min}
                  onClick={() => handleStart(min)}
                  className="py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-sky-500 hover:text-white border border-slate-300 dark:border-slate-700 hover:border-sky-500 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors"
                >
                  {min} min
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Custom Duration (Minutes)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={customMin}
                  onChange={(e) => setCustomMin(e.target.value)}
                  className="flex-grow px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-sm outline-none focus:border-sky-500 text-slate-900 dark:text-slate-100 font-semibold"
                  placeholder="Minutes"
                />
                <button
                  onClick={() => handleStart(customMin)}
                  className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-sm transition-colors"
                >
                  Set
                </button>
              </div>
            </div>

            {/* Fade Out Toggle */}
            <label className="flex items-center gap-3 cursor-pointer mt-2">
              <input
                type="checkbox"
                checked={fadeOut}
                onChange={(e) => setFadeOut(e.target.checked)}
                className="w-4 h-4 rounded text-sky-600 border-slate-400 focus:ring-sky-500 bg-slate-100 dark:bg-slate-800"
              />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Smooth Fade Out
                </span>
                <span className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold mt-0.5">
                  Gradually lowers volume in the final 15 seconds.
                </span>
              </div>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
