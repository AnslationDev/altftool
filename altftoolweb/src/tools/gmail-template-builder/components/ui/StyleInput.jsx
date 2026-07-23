"use client";

import React from "react";

/**
 * A generic reusable input for style properties (color, number, select)
 */

const StyleInput = ({ label, type, value, onChange, options }) => {
  const inputClassName =
    "w-full p-2 sm:p-3 border border-(--border) dark:border-(--border) rounded-lg shadow-sm bg-input-bg text-(--foreground) focus:ring-2 focus:ring-accent focus:border-transparent transition-all text-sm";

  if (type === "select") {
    return (
      <div className="mb-2">
        <label className="block text-xs font-medium text-(--muted-foreground) mb-1">
          {label}
        </label>
        <select
          className={inputClassName}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="mb-2">
      <label className="block text-xs font-medium text-(--muted-foreground) mb-1">
        {label}
      </label>
      <input
        type={type}
        className={`${inputClassName} ${
          type === "color" ? "h-10 cursor-pointer" : ""
        }`}
        // FIX: Ensure value is a string before calling startsWith, preventing TypeError.
        value={
          typeof value === "string" &&
          value.startsWith("var") &&
          type === "color"
            ? "#000000"
            : value || (type === "number" ? 0 : "")
        }
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default StyleInput;
