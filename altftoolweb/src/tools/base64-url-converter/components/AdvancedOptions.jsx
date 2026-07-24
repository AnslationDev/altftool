"use client";

import { forwardRef, useState } from "react";
import { ChevronDown, Settings2 } from "lucide-react";

function OptionCheckbox({ label, checked, onChange }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-blue-600 focus:ring-2 focus:ring-blue-500/20 accent-blue-600 cursor-pointer"
      />
      <span>{label}</span>
    </label>
  );
}

const AdvancedOptions = forwardRef(function AdvancedOptions({ options, onOptionChange, direction, onSetDirection }, ref) {
  const [open, setOpen] = useState(true);

  return (
    <section ref={ref} aria-label="Advanced options" className="scroll-mt-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
      >
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
          <Settings2 aria-hidden="true" size={17} className="text-slate-500" />
          <span>Advanced Options</span>
        </h2>
        <ChevronDown
          aria-hidden="true"
          size={17}
          className={`text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3.5 border-t border-slate-100 dark:border-slate-800/80 px-5 py-4">
          <OptionCheckbox
            label="Auto convert while typing"
            checked={options.autoConvert}
            onChange={(value) => onOptionChange("autoConvert", value)}
          />
          <OptionCheckbox
            label="Remove padding (=)"
            checked={options.removePadding}
            onChange={(value) => onOptionChange("removePadding", value)}
          />
          <OptionCheckbox
            label="Line wrap output (76 chars)"
            checked={options.lineWrap}
            onChange={(value) => onOptionChange("lineWrap", value)}
          />
          <OptionCheckbox
            label="Decode URL-safe to Base64"
            checked={direction === "decode"}
            onChange={(value) => onSetDirection(value ? "decode" : "encode")}
          />
          <OptionCheckbox
            label="Validate Base64 before convert"
            checked={options.validate}
            onChange={(value) => onOptionChange("validate", value)}
          />
        </div>
      )}
    </section>
  );
});

export default AdvancedOptions;
