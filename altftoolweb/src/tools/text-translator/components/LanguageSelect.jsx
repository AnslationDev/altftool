"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function LanguageSelect({ label, value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selected = options.find((o) => o.code === value);

  return (
    <div ref={ref} className="flex-1 p-2 w-full relative">
      {/* Label */}
      <label className="block text-xs font-semibold uppercase text-(--muted-foreground) mb-1">
        {label}
      </label>

      {/* Select Button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full px-4 py-3 bg-(--background) border border-(--border) rounded-xl shadow-inner
                   flex justify-between items-center text-(--foreground)
                   focus:ring-2 focus:ring-(--primary) transition-all cursor-pointer`}
      >
        <span>{selected?.name}</span>

        <ChevronDown
          className={`w-5 h-5 text-(--muted-foreground) transition-transform cursor-pointer ${
            open ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute z-20 w-full mt-2 bg-(--background) border border-(--border)
                        rounded-xl shadow-xl overflow-hidden origin-top animate-scaleFade"
        >
          {options.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                onChange({ target: { value: lang.code } });
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-(--foreground)
                         hover:bg-(--muted) cursor-pointer transition-colors"
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}

      {/* Animations */}
      <style>
        {`
          @keyframes scaleFade {
            0% { opacity: 0; transform: scaleY(0.8); }
            100% { opacity: 1; transform: scaleY(1); }
          }
          .animate-scaleFade {
            animation: scaleFade .32s ease-out;
          }
        `}
      </style>
    </div>
  );
}
