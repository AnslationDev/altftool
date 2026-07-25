"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Hash, Calendar, Mail, Link } from "lucide-react";

const OPTIONS = [
  { key: "numbers", label: "Numbers", icon: Hash },
  { key: "dates", label: "Dates", icon: Calendar },
  { key: "emails", label: "Emails", icon: Mail },
  { key: "urls", label: "URLs", icon: Link },
];

const IgnorePatternsDropdown = ({ ignorePatterns, setIgnorePatterns }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (key) => {
    setIgnorePatterns((prev) =>
      prev.includes(key)
        ? prev.filter((k) => k !== key)
        : [...prev, key]
    );
  };

  return (
    <div ref={ref} className="relative">
      
      {/* Trigger */}
      <button
        onClick={() => setOpen((p) => !p)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex min-h-11 items-center gap-2 px-3 py-2 text-sm rounded-lg border border-(--border) bg-(--card) transition hover:bg-(--muted) active:scale-[0.98] motion-reduce:transition-none motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
      >
        Ignore Patterns
        <ChevronDown className="w-4 h-4" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute mt-2 w-48 bg-(--card) border border-(--border) rounded-lg shadow-md z-50">
          {OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = ignorePatterns.includes(opt.key);

            return (
              <button
                key={opt.key}
                onClick={() => toggleOption(opt.key)}
                aria-pressed={active}
                className={`flex min-h-11 items-center justify-between w-full px-3 py-2 text-sm hover:bg-(--muted) focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                  active ? "bg-(--muted) font-medium" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {opt.label}
                </div>

                {active && <span className="text-xs">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default IgnorePatternsDropdown;