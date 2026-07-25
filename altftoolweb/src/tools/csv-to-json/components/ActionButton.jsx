"use client";

import React from "react";

const BUTTON_BASE =
  "flex-1 sm:flex-none min-h-11 px-4 py-2 rounded-md font-medium text-ml transition-colors active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35";

const ActionButtons = ({ onConvert, onDownload, onClear, hasData }) => {
  return (
    <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
      <button
        onClick={onConvert}
        disabled={!hasData}
        className={`${BUTTON_BASE} ${
          hasData
            ? "bg-(--primary) text-(--primary-foreground) hover:bg-(--primary-hover) cursor-pointer"
            : "bg-(--muted) text-(--muted-foreground) cursor-not-allowed opacity-60"
        }`}
      >
        Convert to JSON
      </button>

      <button
        onClick={onDownload}
        disabled={!hasData}
        className={`${BUTTON_BASE} ${
          hasData
            ? "bg-(--primary) text-(--primary-foreground) hover:bg-(--primary-hover) cursor-pointer"
            : "bg-(--muted) text-(--muted-foreground) cursor-not-allowed opacity-60"
        }`}
      >
        Download JSON
      </button>

      <button
        onClick={onClear}
        className={`${BUTTON_BASE} border border-(--border) bg-(--card) text-(--foreground) hover:border-(--primary) cursor-pointer`}
      >
        Clear All
      </button>
    </div>
  );
};

export default ActionButtons;
