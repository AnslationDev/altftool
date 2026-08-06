"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

import { formatClockTime } from "../lib";

const TIME_FORMATS = [
  { label: "12-Hour", hour12: true },
  { label: "24-Hour", hour12: false },
];

const HeroSection = ({ hour12 = true, onHour12Change }) => {
  const [currentTime, setCurrentTime] = useState(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setCurrentTime(new Date());
    });
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      window.cancelAnimationFrame(frame);
      clearInterval(timer);
    };
  }, []);

  const formatTime = (date) => formatClockTime(date, hour12);

  const formatDate = (date) => {
    if (!date) return "Loading local date…";
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <section id="home" className="py-16 md:py-24 px-4">
      <div className="max-w-5xl mx-auto text-center space-y-6">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-(--border) bg-(--card)">
          <Clock aria-hidden="true" className="w-4 h-4 text-(--primary)" />
          <span className="text-sm font-semibold text-(--primary)">
            Real-Time Updates
          </span>
        </div>

        {/* Heading */}
        <h1 className="heading">World Time Zone Clock</h1>

        {/* Subheading */}
        <p className="description max-w-2xl mx-auto">
          Compare browser-supported time zones in real time — useful for remote
          teams, travelers, global meetings, and international businesses.
        </p>

        {/* Live Time Box */}
        <div className="inline-block px-8 py-6 rounded-2xl bg-(--card) border border-(--border)">
          <div
            role="timer"
            aria-label="Current local time"
            className="text-3xl md:text-4xl font-bold font-mono text-(--primary) mb-2"
          >
            {formatTime(currentTime)}
          </div>
          <div className="text-sm text-(--muted-foreground)">
            {formatDate(currentTime)}
          </div>
        </div>

        {/* Time Format Toggle — applies to this clock and every card below */}
        <div className="flex justify-center">
          <div
            role="group"
            aria-label="Time format"
            className="inline-flex items-center gap-1 p-1 rounded-full border border-(--border) bg-(--card)"
          >
            {TIME_FORMATS.map((format) => {
              const isActive = hour12 === format.hour12;

              return (
                <button
                  key={format.label}
                  type="button"
                  onClick={() => onHour12Change?.(format.hour12)}
                  aria-pressed={isActive}
                  aria-controls="clocks"
                  className={`
                    min-h-11 px-5 py-2
                    rounded-full
                    text-sm font-semibold
                    transition duration-150
                    focus-visible:outline-none
                    focus-visible:[box-shadow:var(--focus-ring)]
                    motion-reduce:transition-none
                    ${
                      isActive
                        ? "bg-(--primary) text-(--primary-foreground)"
                        : "text-(--muted-foreground) hover:text-(--foreground)"
                    }
                  `}
                >
                  {format.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Feature Chips */}
        <div className="flex flex-wrap justify-center gap-3 pt-4">
          {[
            "🌍 Browser-Supported Time Zones",
            "⏰ Live Updates",
            "🆓 Completely Free",
            "📱 Responsive",
          ].map((label, i) => (
            <div
              key={i}
              className="px-4 py-1.5 rounded-full border border-(--border) text-sm text-(--foreground) bg-(--card)"
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
