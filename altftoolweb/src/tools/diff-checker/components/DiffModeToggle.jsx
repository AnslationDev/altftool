"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, AlignLeft, Type, Pilcrow, Brain } from "lucide-react";

const MODES = [
  { key: "line", label: "Line", icon: AlignLeft },
  { key: "word", label: "Word", icon: Type },
  { key: "char", label: "Character", icon: Pilcrow },
  { key: "semantic", label: "Semantic", icon: Brain },
];

const DiffModeToggle = ({ mode, setMode }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selectedMode = MODES.find((m) => m.key === mode);

  // close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      
      {/* Trigger */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-(--border) bg-(--card)"
      >
        {selectedMode?.icon && <selectedMode.icon className="w-4 h-4" />}
        {selectedMode?.label}
        <ChevronDown className="w-4 h-4 ml-1" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute mt-2 w-44 bg-white border border-(--border) rounded-lg shadow-md z-50">
          {MODES.map((m) => {
            const Icon = m.icon;

            return (
              <button
                key={m.key}
                onClick={() => {
                  setMode(m.key);
                  setOpen(false);
                }}
                className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-gray-100 ${
                  mode === m.key ? "bg-gray-50 font-medium" : ""
                }`}
              >
                <Icon className="w-4 h-4" />
                {m.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DiffModeToggle;