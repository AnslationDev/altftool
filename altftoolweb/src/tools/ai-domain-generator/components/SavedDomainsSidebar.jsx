"use client";

import React, { useContext } from "react";
import { DomainContext } from "../context/DomainContext";

export default function SavedDomainsSidebar() {
  const { savedDomains } = useContext(DomainContext);

  if (!savedDomains || savedDomains.length === 0) return null;

  return (
    <div className="w-full sm:w-64 p-4 bg-(--card) rounded-xl mb-6 sm:mb-0">
      <h3 className="text-lg font-semibold mb-2">⭐ Saved Domains</h3>
      <ul className="space-y-1 text-sm">
        {savedDomains.map((d, i) => (
          <li key={i} className="truncate">{d}</li>
        ))}
      </ul>
    </div>
  );
}