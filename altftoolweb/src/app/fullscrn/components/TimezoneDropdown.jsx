import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

const TimezoneDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("Local");
  const dropdownRef = useRef(null);

  const zones = [
    { label: "Common", isHeader: true },
    { label: "Local", value: "Local" },
    { label: "UTC", value: "UTC" },
    { label: "All Timezones", isHeader: true },
    { label: "Abidjan (GMT)", value: "GMT" },
    { label: "Addis Ababa (GMT+03:00)", value: "GMT+03:00" },
    { label: "Algiers (GMT+01:00)", value: "GMT+01:00" },
    { label: "Cairo (GMT+03:00)", value: "GMT+03:00" },
  ];

  useEffect(() => {
    const close = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/*  Selector Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-[10px] bg-slate-50 px-2 py-1 rounded border border-slate-200 hover:bg-slate-100 transition-all font-medium"
      >
        {selected} <ChevronDown size={10} className="text-slate-400" />
      </button>

      {/*  OS-Style Dark Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-[220px] max-h-[280px] overflow-y-auto z-[999] bg-[#4B4B4B]/95 backdrop-blur-md rounded-lg border border-white/10 shadow-2xl overflow-x-hidden">
          <div className="py-1">
            {zones.map((tz, i) => (
              tz.isHeader ? (
                <div key={i} className="px-3 py-1.5 text-[9px] font-bold text-white/30 uppercase tracking-widest border-b border-white/5 mb-1 bg-white/5">
                  {tz.label}
                </div>
              ) : (
                <button
                  key={i}
                  onClick={() => { setSelected(tz.label.split(' (')[0]); setIsOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-[11px] text-left transition-colors ${
                    selected === tz.label.split(' (')[0] ? "bg-blue-500 text-white" : "text-white/90 hover:bg-white/10"
                  }`}
                >
                  <span className="truncate">{tz.label}</span>
                  {selected === tz.label.split(' (')[0] && <Check size={10} />}
                </button>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimezoneDropdown;