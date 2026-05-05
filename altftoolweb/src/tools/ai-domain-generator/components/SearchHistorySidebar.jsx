"use client";

import React, { useContext } from "react";
import { DomainContext } from "../context/DomainContext";

export default function SearchHistorySidebar() {
  const { searchHistory, setSuggestions } = useContext(DomainContext);

  if (!searchHistory || searchHistory.length === 0) return null;

  return (
    <div className="w-full sm:w-64 p-4 bg-(--card) rounded-xl mb-6 sm:mb-0">
      <h3 className="text-lg font-semibold mb-2">Recent Searches</h3>
      <ul className="space-y-1 text-sm">
        {searchHistory.map((keyword, i) => (
          <li key={i}>
            <button
              onClick={() => setSuggestions([])} // optionally regenerate
              className="text-(--primary) hover:underline"
            >
              {keyword}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}