"use client";

import React from "react";
import * as Icons from "lucide-react";

export default function SoundCard({
  sound,
  isActive,
  volume,
  onToggle,
  onVolumeChange,
}) {
  // Dynamically resolve icon
  const IconComponent = Icons[sound.icon] || Icons.Volume2;

  const handleSliderChange = (e) => {
    onVolumeChange(sound.id, parseInt(e.target.value, 10));
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowUp" || e.key === "ArrowRight") {
      e.preventDefault();
      onVolumeChange(sound.id, Math.min(100, volume + 5));
    } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
      e.preventDefault();
      onVolumeChange(sound.id, Math.max(0, volume - 5));
    }
  };

  return (
    <div
      className={`sound-card ${
        isActive ? "active" : ""
      } flex flex-col justify-between transition-all duration-300 relative border rounded-2xl p-5 select-none`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-4 items-center">
          <button
            onClick={() => onToggle(sound.id)}
            aria-label={`${isActive ? "Mute" : "Play"} ${sound.name}`}
            className={`sound-icon-wrapper w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
              isActive
                ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                : "bg-slate-200/50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <IconComponent size={24} className={isActive ? "animate-pulse" : ""} />
          </button>
          <div>
            <h3 className="sound-card-title font-bold text-slate-800 dark:text-slate-100">
              {sound.name}
            </h3>
            <span className="text-[10px] uppercase font-extrabold tracking-wider px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {sound.category}
            </span>
          </div>
        </div>
      </div>

      <p className="sound-card-desc text-xs text-slate-600 dark:text-slate-350 leading-relaxed mb-4">
        {sound.description}
      </p>

      <div className="sound-card-controls">
        <div className="slider-container flex items-center gap-3">
          <Icons.VolumeX
            size={16}
            className={`${isActive ? "text-sky-500" : "text-slate-400 dark:text-slate-500"}`}
          />
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleSliderChange}
            onKeyDown={handleKeyDown}
            disabled={!isActive}
            aria-label={`${sound.name} volume`}
            className="custom-range flex-grow h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-300 dark:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
          />
          <span
            className={`text-xs font-extrabold w-7 text-right ${
              isActive ? "text-sky-500" : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {isActive ? `${volume}%` : "0%"}
          </span>
        </div>
      </div>
    </div>
  );
}
