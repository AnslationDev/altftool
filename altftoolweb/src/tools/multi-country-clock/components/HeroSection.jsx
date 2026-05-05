"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

const HeroSection = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date) => {
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
          <Clock className="w-4 h-4 text-(--primary)" />
          <span className="text-sm font-semibold text-(--primary)">
            Real-Time Updates
          </span>
        </div>

        {/* Heading */}
        <h1 className="heading">World Multi-Country Clock</h1>

        {/* Subheading */}
        <p className="description max-w-2xl mx-auto">
          Track time across multiple countries in real time — perfect for remote
          teams, travelers, global meetings, and international businesses.
        </p>

        {/* Live Time Box */}
        <div className="inline-block px-8 py-6 rounded-2xl bg-(--card) border border-(--border)">
          <div className="text-3xl md:text-4xl font-bold text-(--primary) mb-2">
            {formatTime(currentTime)}
          </div>
          <div className="text-sm text-(--muted-foreground)">
            {formatDate(currentTime)}
          </div>
        </div>

        {/* Feature Chips */}
        <div className="flex flex-wrap justify-center gap-3 pt-4">
          {[
            "🌍 200+ Countries",
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
