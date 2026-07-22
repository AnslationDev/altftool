"use client";

import React from "react";
import { TrendingUp } from "lucide-react";

export default function TrendingTicker({ onTrendingClick }) {
  const trendingItems = [
    { text: "90s Indian Nostalgia", query: "90s" },
    { text: "Croissant Pav Bhaji", query: "Croissant" },
    { text: "Alia Bhatt", query: "Alia" },
    { text: "Bollywood Quiz", query: "Bollywood" },
    { text: "ISRO Space Launch", query: "ISRO" },
    { text: "Paneer Tikka Recipe", query: "Paneer" }
  ];

  return (
    <div className="bf-trending-ticker">
      <div className="bf-ticker-label">
        <TrendingUp size={16} className="bf-trending-icon" />
        <span>TRENDING</span>
      </div>
      <div className="bf-ticker-items-container">
        <div className="bf-ticker-items">
          {trendingItems.map((item, index) => (
            <button
              key={index}
              className="bf-ticker-item"
              onClick={() => onTrendingClick(item.query)}
            >
              <span className="bf-ticker-number">#{index + 1}</span>
              <span className="bf-ticker-text">{item.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
