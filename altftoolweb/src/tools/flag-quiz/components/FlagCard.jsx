"use client";

import { useMemo } from "react";

export default function FlagCard({ flag, flagSvg, size = "lg", country }) {
  const sizeClasses = {
    sm: "h-12 w-auto",
    md: "h-16 w-auto",
    lg: "h-24 w-auto",
    xl: "h-32 w-auto",
  };

  const src = flagSvg || flag;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-sm">
        <img
          src={src}
          alt={country ? `${country} flag` : "Country flag"}
          className={`${sizeClasses[size]} rounded-lg object-contain`}
          loading="eager"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      </div>
    </div>
  );
}

export function FlagOption({ flag, name, selected, isCorrect, onClick, disabled }) {
  let cls =
    "flex items-center gap-3 rounded-xl border p-3 text-left transition-all duration-150 ";
  if (!selected) {
    cls += "border-[var(--border)] hover:border-[var(--primary)]/40 hover:bg-[var(--primary)]/5 cursor-pointer";
  } else if (isCorrect) {
    cls += "border-emerald-500 bg-emerald-500/10";
  } else if (selected === name) {
    cls += "border-rose-400 bg-rose-500/10";
  } else {
    cls += "border-[var(--border)] opacity-50 cursor-default";
  }

  return (
    <button
      className={cls}
      onClick={onClick}
      disabled={disabled}
      aria-label={`Select ${name}`}
    >
      <img
        src={flag}
        alt={`${name} flag`}
        className="h-8 w-auto rounded border border-[var(--border)] object-contain"
        loading="eager"
        onError={(e) => {
          e.target.style.display = "none";
        }}
      />
      <span
        className={`text-sm font-semibold ${
          selected && isCorrect ? "text-emerald-700" : selected === name ? "text-rose-600" : "text-[var(--foreground)]"
        }`}
      >
        {name}
      </span>
    </button>
  );
}
