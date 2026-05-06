"use client";

import React, { useContext } from "react";
import { DomainContext } from "../context/DomainContext";

export default function FiltersSidebar() {
  const { filters, setFilters } = useContext(DomainContext);
  const tldsInput = filters.tlds.join(",");

  const handleTldsChange = (value) => {
    setFilters((prev) => ({
      ...prev,
      tlds: value
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean), // remove empty
    }));
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-end gap-4">

      {/* CATEGORY */}
      <div className="flex-1 min-w-[150px]">
        <label className="block text-xs font-medium mb-1 text-gray-500">
          Category
        </label>
        <select
          value={filters.category}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, category: e.target.value }))
          }
          className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg bg-transparent"
        >
          <option value="all">All</option>
          <option value="brandable">Brandable</option>
          <option value="startup">Startup</option>
          <option value="tech">Tech</option>
          <option value="ai">AI</option>
          <option value="seo">SEO</option>
        </select>
      </div>

      {/* LENGTH */}
      <div className="flex-1 min-w-[150px]">
        <label className="block text-xs font-medium mb-1 text-gray-500">
          Length
        </label>
        <select
          value={filters.length}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, length: e.target.value }))
          }
          className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg bg-transparent"
        >
          <option value="all">All</option>
          <option value="short">3–6</option>
          <option value="medium">6–10</option>
          <option value="long">10+</option>
        </select>
      </div>

      {/* TLDS */}
      <div className="flex-[2] min-w-[200px]">
        <label className="block text-xs font-medium mb-1 text-gray-500">
          TLDs
        </label>
        <input
          type="text"
          placeholder="Enter full domain(com, io, ai)"
          value={tldsInput}
          onChange={(e) => handleTldsChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg bg-transparent"
        />
      </div>
    </div>
  );
}
