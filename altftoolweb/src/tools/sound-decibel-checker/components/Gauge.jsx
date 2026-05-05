"use client";
import React from "react";

export default function Gauge({ decibels, level }) {
  const radius = 110; // ⬅ bigger circle
  const circumference = 2 * Math.PI * radius;
  const progress = (decibels / 120) * circumference;

  return (
    <div className="bg-(--card) rounded-3xl p-8 border border-(--border) shadow-md transition-colors">
      <h2 className="text-xl font-semibold text-(--foreground) mb-6 flex items-center gap-2">
        Decibel Gauge
      </h2>

      <div className="flex flex-col items-center justify-center">
        <div className="relative w-75 h-75">
          {" "}
          {/* ⬅ bigger wrapper */}
          <svg className="transform -rotate-90 w-75 h-75">
            {/* BG Circle */}
            <circle
              cx="150"
              cy="150"
              r={radius}
              stroke="var(--muted-foreground)"
              strokeWidth="20"
              fill="none"
              className="opacity-20"
            />

            {/* Progress */}
            <circle
              cx="150"
              cy="150"
              r={radius}
              stroke={level.gaugeColor}
              strokeWidth="20"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              strokeLinecap="round"
              className="transition-all duration-300"
              style={{
                filter: `drop-shadow(0 0 10px ${level.gaugeColor})`,
              }}
            />
          </svg>
          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-7xl font-bold text-(--foreground)">
              {" "}
              {/* bigger */}
              {decibels}
            </span>
            <span className="text-3xl font-semibold text-(--primary)">dB</span>
            <span className={`text-xs mt-2 font-semibold ${level.color}`}>
              {level.text}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
