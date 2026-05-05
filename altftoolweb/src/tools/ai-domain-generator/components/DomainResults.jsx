"use client";

import { useContext, useState } from "react";
import DomainGrid from "./DomainGrid";
import DomainError from "./DomainError";
import { DomainContext } from "../context/DomainContext";
import DomainEmpty from "./DomainEmpty";

const DomainResults = ({ suggestions, onSelect }) => {
  const { filteredSuggestions, filters } = useContext(DomainContext);
  const [copiedAll, setCopiedAll] = useState(false);

  // ✅ Correct logic: only use filtered if filters are active
  const isFilterActive =
    filters.category !== "all" ||
    filters.length !== "all" ||
    (filters.tlds && filters.tlds.length > 0);

  const displaySuggestions = isFilterActive
    ? filteredSuggestions
    : suggestions;

  const formattedSuggestions = displaySuggestions || [];

  const handleCopyAll = async () => {
    try {
      const allDomains = formattedSuggestions
        .map((s) => s.name)
        .join("\n");

      await navigator.clipboard.writeText(allDomains);

      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1500);
    } catch (err) {
      console.error("Copy all failed:", err);
    }
  };

  // ✅ Proper empty handling
  if (!formattedSuggestions || formattedSuggestions.length === 0) {
    return <DomainEmpty />;
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="subheading">
          Results ({formattedSuggestions.length})
        </h2>

        <button
          onClick={handleCopyAll}
          className="px-4 py-2 text-sm font-semibold bg-(--primary) text-white rounded-lg cursor-pointer"
        >
          {copiedAll ? "Copied All!" : "Copy All"}
        </button>
      </div>

      <DomainGrid
        suggestions={formattedSuggestions}
        onSelect={onSelect}
      />
    </>
  );
};

export default DomainResults;