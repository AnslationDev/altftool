"use client";

import React, { useState, useEffect } from "react";
import { X, Globe } from "lucide-react";

import {
  formatClockTime,
  formatTimeZoneCity,
  formatUtcOffset,
  isDstActive,
} from "../lib";

const ClockCard = ({ timezone, onRemove, hour12 = true }) => {
  const [currentTime, setCurrentTime] = useState(null);
  const [zoneDetails, setZoneDetails] = useState(() => ({
    utcOffset: formatUtcOffset(timezone),
    dstActive: isDstActive(timezone),
  }));

  // Local ticking
  useEffect(() => {
    const initialFrame = window.requestAnimationFrame(() => {
      setCurrentTime(new Date());
    });
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      window.cancelAnimationFrame(initialFrame);
      clearInterval(timer);
    };
  }, []);

  // Re-resolve from the real current instant so long-open tabs stay correct
  // when a zone enters or leaves daylight saving time.
  useEffect(() => {
    const updateOffset = () => {
      const instant = new Date();
      setZoneDetails({
        utcOffset: formatUtcOffset(timezone, instant),
        dstActive: isDstActive(timezone, instant),
      });
    };

    updateOffset();
    const timer = setInterval(updateOffset, 60_000);

    return () => clearInterval(timer);
  }, [timezone]);

  const formatTime = (date) => formatClockTime(date, hour12, timezone);

  const formatDate = (date) =>
    date?.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: timezone,
    }) || "--";

  const getRegion = (tz) => tz.split("/")[0];

  // ---------------- SUCCESS CARD ----------------
  return (
    <article
      aria-label={`${formatTimeZoneCity(timezone)} clock`}
      className="
        p-6
        rounded-2xl
        bg-(--card)
        border border-(--border)
        transition
        motion-safe:hover:-translate-y-2
        motion-reduce:transition-none
        hover:border-(--primary)
      "
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <Globe aria-hidden="true" className="w-4 h-4 text-(--primary)" />

          <span className="px-2 py-0.5 text-xs rounded-full border border-(--border) text-(--muted-foreground)">
            {getRegion(timezone)}
          </span>
        </div>

        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${formatTimeZoneCity(timezone)} clock`}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg transition focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
        >
          <X aria-hidden="true" className="w-4 h-4 text-(--foreground)" />
        </button>
      </div>

      {/* City */}
      <h3 className="font-bold text-lg text-(--foreground) mb-4">
        {formatTimeZoneCity(timezone)}
      </h3>

      {/* Time Box */}
      <div className="p-4 mb-4 rounded-xl bg-(--background) border border-(--border)">
        <div
          role="timer"
          aria-label={`Current time in ${formatTimeZoneCity(timezone)}`}
          className="text-2xl md:text-3xl font-bold text-(--primary) text-center font-mono"
        >
          {formatTime(currentTime)}
        </div>
      </div>

      {/* Date */}
      <p className="text-sm text-(--muted-foreground) mb-1">
        📅 {formatDate(currentTime)}
      </p>

      {/* UTC Offset + daylight saving state */}
      {(zoneDetails.utcOffset || zoneDetails.dstActive) && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-(--muted-foreground)">
          {zoneDetails.utcOffset && <span>🌍 {zoneDetails.utcOffset}</span>}

          {zoneDetails.dstActive && (
            <span className="px-2 py-0.5 rounded-full border border-(--border) text-(--muted-foreground)">
              DST active
            </span>
          )}
        </div>
      )}
    </article>
  );
};

export default ClockCard;
