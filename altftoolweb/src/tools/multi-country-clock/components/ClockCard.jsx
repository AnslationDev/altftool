"use client";

import React, { useState, useEffect } from "react";
import { X, Globe } from "lucide-react";

const ClockCard = ({ timezone, onRemove }) => {
  const [timeData, setTimeData] = useState(null);
  const [currentTime, setCurrentTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fetch timezone data
  useEffect(() => {
    const fetchTimeData = async () => {
      try {
        setLoading(true);
        setError(false);

        const response = await fetch(
          `https://timeapi.io/api/Time/current/zone?timeZone=${timezone}`,
        );

        if (!response.ok) throw new Error("Failed to fetch");

        const data = await response.json();

        let iso = data.dateTime;
        if (!iso.includes("T")) {
          iso = iso.replace(" ", "T");
        }

        const parsedDate = new Date(iso);
        if (isNaN(parsedDate)) throw new Error("Invalid date format");

        setTimeData(data);
        setCurrentTime(parsedDate);
        setLoading(false);
      } catch (err) {
        console.log("TIME ERROR:", err);
        setError(true);
        setLoading(false);
      }
    };

    fetchTimeData();
  }, [timezone]);

  // Local ticking
  useEffect(() => {
    if (!currentTime) return;

    const timer = setInterval(() => {
      setCurrentTime((prev) => new Date(prev.getTime() + 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [currentTime]);

  const formatTime = (date) =>
    date?.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }) || "--:--:--";

  const formatDate = (date) =>
    date?.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }) || "--";

  const getCityName = (tz) => tz.split("/").pop().replace(/_/g, " ");

  const getRegion = (tz) => tz.split("/")[0];

  // ---------------- LOADING ----------------
  if (loading) {
    return (
      <div className="p-6 min-h-50 flex items-center justify-center rounded-2xl bg-(--card) border border-(--border)">
        <div className="w-8 h-8 border-4 border-(--primary) border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // ---------------- ERROR ----------------
  if (error) {
    return (
      <div className="p-6 min-h-50 rounded-2xl bg-(--card) border border-(--border)">
        <div className="flex justify-between items-center mb-3">
          <span className="px-2 py-1 text-xs rounded-full bg-(--primary) text-(--primary-foreground)">
            Error
          </span>

          <button onClick={onRemove}>
            <X className="w-4 h-4 text-(--foreground)" />
          </button>
        </div>

        <p className="text-(--muted-foreground)">
          Failed to load timezone data
        </p>
      </div>
    );
  }

  // ---------------- SUCCESS CARD ----------------
  return (
    <div
      className="
        p-6
        rounded-2xl
        bg-(--card)
        border border-(--border)
        transition
        hover:-translate-y-2
        hover:border-(--primary)
      "
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-(--primary)" />

          <span className="px-2 py-0.5 text-xs rounded-full border border-(--border) text-(--muted-foreground)">
            {getRegion(timezone)}
          </span>
        </div>

        <button onClick={onRemove}>
          <X className="w-4 h-4 text-(--foreground)" />
        </button>
      </div>

      {/* City */}
      <h3 className="font-bold text-lg text-(--foreground) mb-4">
        {getCityName(timezone)}
      </h3>

      {/* Time Box */}
      <div className="p-4 mb-4 rounded-xl bg-(--background) border border-(--border)">
        <div className="text-2xl md:text-3xl font-bold text-(--primary) text-center font-mono">
          {formatTime(currentTime)}
        </div>
      </div>

      {/* Date */}
      <p className="text-sm text-(--muted-foreground) mb-1">
        📅 {formatDate(currentTime)}
      </p>

      {/* UTC Offset */}
      {timeData && (
        <p className="text-xs text-(--muted-foreground)">
          🌍 UTC {timeData.utcOffset}
        </p>
      )}
    </div>
  );
};

export default ClockCard;
