"use client";


import { useState } from "react";

export  function Card({
  children,
  className = "",
  collapsible = false,
  defaultOpen = true,
  title = "",
  icon = "",
  accent = "blue",
  loading = false,
  noPadding = false,
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Left border accent color per section type
  const accentBorder = {
    blue:   "border-l-[var(--primary)]",
    green:  "border-l-emerald-500",
    yellow: "border-l-amber-400",
    red:    "border-l-rose-500",
    cyan:   "border-l-cyan-500",
    purple: "border-l-violet-500",
    orange: "border-l-orange-400",
  };

  const borderClass = accentBorder[accent] || accentBorder.blue;

  return (
    <div
      className={`
        group relative overflow-hidden
        bg-[(--card)] border border-[(--border)] border-l-4
        ${borderClass}
        rounded-2xl cursor-pointer
        shadow-sm hover:shadow-xl
        transition-all duration-300 ease-out
        hover:-translate-y-[2px]
        ${className}
      `}
    >
    
      <div
        className="
          pointer-events-none absolute inset-0 z-10
          -translate-x-full group-hover:translate-x-full
          bg-gradient-to-r from-transparent via-white/[0.04] to-transparent
          transition-transform duration-700 ease-in-out
        "
      />

      {/* Collapsible section header */}
      {collapsible && title && (
        <button
          onClick={() => setIsOpen((p) => !p)}
          className="
            w-full flex items-center justify-between
            px-5 py-4 text-left
            hover:bg-[(--muted)]/60
            transition-colors duration-200 rounded-t-2xl
          "
        >
          <span className="flex items-center gap-2.5 font-semibold text-[(--card-foreground)] font-primary text-sm">
            {icon && <span className="text-sm">{icon}</span>}
            {title}
          </span>
          {/* Animated chevron */}
          <svg
className={`w-6 h-6 text-[(--muted-foreground)] transition-transform duration-300 ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}

      
      {collapsible ? (
        <div
          className={` overflow-hidden transition-all duration-300 ease-in-out
            ${isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}
          `}
        >
          <div className={noPadding ? "" : "px-5 pb-5"}>
            {loading ? <CardSkeleton /> : children}
          </div>
        </div>
      ) : (
        <div className={noPadding ? "" : "p-5"}>
          {loading ? <CardSkeleton /> : children}
        </div>
      )}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="space-y-3 animate-pulse pt-1">
      <div className="h-3 bg-[(--muted)] rounded-full w-3/4" />
      <div className="h-3 bg-[(--muted)] rounded-full w-1/2" />
      <div className="h-3 bg-[(--muted)] rounded-full w-2/3" />
      <div className="h-3 bg-[(--muted)] rounded-full w-1/3" />
    </div>
  );
}