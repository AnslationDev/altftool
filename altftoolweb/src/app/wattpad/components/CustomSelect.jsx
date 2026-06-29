"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export default function CustomSelect({
  options = [],
  value,
  onChange,
  placeholder = "Select",
  desktopClass = "md:w-[220px]",
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className={`relative w-full ${desktopClass}`}>
      <button
        onClick={() => setOpen(!open)}
        className="wp-select-btn"
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown
          size={18}
          className={`transition-all duration-300 shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`wp-select-dropdown ${open ? "wp-select-open" : "wp-select-closed"}`}
      >
        <div className="max-h-[250px] overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`wp-select-option ${value === option.value ? "wp-select-option-active" : ""}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
