"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { CURRENCY_NAMES } from "../constants/currencies";
import { FLAG_MAP } from "../constants/flagMap";
import { ChevronDown, Search, X } from "lucide-react";
import ManagedImage from "@/components/ui/ManagedImage";

export default function CurrencySelect({
  label,
  value,
  onChange,
  loading,
  rates,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  const currencyOptions = useMemo(() => Object.keys(rates).sort(), [rates]);

  // Filter currencies based on search
  const filteredOptions = useMemo(() => {
    return currencyOptions.filter((code) =>
      `${code} ${CURRENCY_NAMES[code]}`.toLowerCase().includes(search.toLowerCase())
    );
  }, [currencyOptions, search]);

  const selected = value;

  // Outside click handler
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const getFlag = (code) =>
    `https://flagcdn.com/w40/${FLAG_MAP[code]?.toLowerCase() || "un"}.png`;

  const toggleOpen = () => {
    setOpen((current) => {
      if (current) setSearch("");
      return !current;
    });
  };

  return (
    <div ref={ref} className="relative flex w-full min-w-0 flex-1 flex-col space-y-2">
      
      {/* Label */}
      <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-(--muted-foreground) ml-1">
        {label}
      </label>

      {/* Select Button */}
      <button
        onClick={toggleOpen}
        disabled={loading}
        type="button"
        className={`w-full  min-w-0 rounded-2xl border border-(--border) bg-(--card) p-3 sm:p-4 shadow-sm flex items-center justify-between text-(--foreground) transition-all hover:border-(--primary) focus:ring-4 focus:ring-(--primary)/10 ${
          open ? "border-(--primary) shadow-md" : ""
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative h-6 w-8 sm:h-7 sm:w-10 flex-shrink-0 overflow-hidden rounded-md border border-(--border)/50 shadow-sm">
             <ManagedImage
                src={getFlag(selected)}
                alt=""
                className="h-full w-full object-cover"
              />
          </div>

          <div className="flex flex-col items-start min-w-0">
            <span className="text-sm sm:text-base font-bold leading-none mb-1">
              {selected}
            </span>
            <span className="truncate text-[10px] sm:text-xs text-(--muted-foreground) font-medium">
              {CURRENCY_NAMES[selected]}
            </span>
          </div>
        </div>

        <ChevronDown
          className={`h-4 w-4 sm:h-5 sm:w-5 text-(--primary) transition-transform duration-300 ease-in-out ${
            open ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="animate-dropdown absolute top-[calc(100%+8px)] left-0 w-full min-w-[280px] overflow-hidden rounded-2xl border border-(--border) bg-(--card) shadow-2xl z-50 origin-top">
          
          {/* Search Box */}
          <div className="sticky top-0 z-10 border-b border-(--border) bg-(--card)/80 backdrop-blur-md p-2">
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-(--muted-foreground)" />
              <input
                type="text"
                autoFocus
                placeholder="Search currency..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-(--muted)/30 py-2.5 pl-9 pr-4 text-sm rounded-xl outline-none focus:bg-(--muted)/50 transition-all border border-transparent focus:border-(--primary)/30"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 p-1 hover:bg-(--muted) rounded-full">
                  <X className="h-3 w-3 text-(--muted-foreground)" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-[300px] sm:max-h-[400px] overflow-y-auto custom-scrollbar p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((code) => (
                <button
                  key={code}
                  onClick={() => {
                    onChange({ target: { value: code } });
                    setOpen(false);
                  }}
                  className={`group w-full px-3 py-3 flex items-center gap-3 text-left rounded-xl transition-all mb-1 last:mb-0 ${
                    code === value 
                    ? "bg-(--primary) text-white" 
                    : "hover:bg-(--primary)/10 text-(--foreground)"
                  }`}
                >
                  <div className={`h-5 w-7 sm:h-6 sm:w-8 flex-shrink-0 overflow-hidden rounded-sm border border-black/10 ${code === value ? "border-white/20" : ""}`}>
                    <ManagedImage src={getFlag(code)} alt="" className="h-full w-full object-cover" />
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold leading-none mb-1">{code}</span>
                    <span className={`text-[11px] truncate font-medium ${code === value ? "text-white/80" : "text-(--muted-foreground)"}`}>
                      {CURRENCY_NAMES[code]}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-10 text-center text-sm text-(--muted-foreground) font-medium">
                No currency found...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Refined Styles */}
      <style jsx>{`
        @keyframes dropdown {
          0% {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-dropdown {
          animation: dropdown 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--primary);
          border-radius: 20px;
          border: 2px solid var(--card);
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
}
