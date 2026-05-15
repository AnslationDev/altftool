import React, { useState, useMemo } from "react";
import { buildFilterMeta } from "../utils/filterUtils";

const FilterPanel = ({ data, columns, columnTypes, filters, onChange }) => {
  const [open, setOpen] = useState(false);
  const meta = useMemo(() => buildFilterMeta(data, columns, columnTypes), [data, columns, columnTypes]);

  const activeCount = useMemo(() => {
    return Object.keys(filters).filter((k) => {
      const f = filters[k];
      if (!f) return false;
      if (f.type === "categorical") return f.selected?.length > 0;
      if (f.type === "numeric") return f.min !== undefined || f.max !== undefined;
      if (f.type === "date") return f.start || f.end;
      return false;
    }).length;
  }, [filters]);

  const handleFilterChange = (col, newValue) => onChange((prev) => ({ ...prev, [col]: { ...prev[col], ...newValue } }));
  const clearAll = () => onChange({});

  return (
    <div className="glass-card overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[var(--muted)] transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm text-[var(--foreground)]">Filters</h3>
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] text-[10px] font-bold">
              {activeCount}
            </span>
          )}
        </div>
        <svg className={`w-4 h-4 text-[var(--muted-foreground)] transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {open && (
        <div className="px-4 pb-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {columns.map((col) => {
              const fmeta = meta[col];
              if (!fmeta) return null;
              const current = filters[col] || {};
              return (
                <div key={col} className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--foreground)] block">{col}</label>

                  {fmeta.type === "numeric" && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder={fmeta.min.toFixed(0)}
                        value={current.min ?? ""}
                        onChange={(e) => handleFilterChange(col, { type: "numeric", min: e.target.value ? Number(e.target.value) : undefined, max: current.max })}
                        className="w-20 bg-[var(--background)] border border-[var(--border)] rounded-lg px-2 py-1.5 text-xs text-[var(--foreground)] placeholder:text-[var(--input-placeholder)] focus:outline-none focus:border-[var(--primary)]"
                      />
                      <span className="text-xs text-[var(--muted-foreground)]">to</span>
                      <input
                        type="number"
                        placeholder={fmeta.max.toFixed(0)}
                        value={current.max ?? ""}
                        onChange={(e) => handleFilterChange(col, { type: "numeric", min: current.min, max: e.target.value ? Number(e.target.value) : undefined })}
                        className="w-20 bg-[var(--background)] border border-[var(--border)] rounded-lg px-2 py-1.5 text-xs text-[var(--foreground)] placeholder:text-[var(--input-placeholder)] focus:outline-none focus:border-[var(--primary)]"
                      />
                    </div>
                  )}

                  {fmeta.type === "date" && (
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={current.start || ""}
                        onChange={(e) => handleFilterChange(col, { type: "date", start: e.target.value, end: current.end })}
                        className="bg-[var(--background)] border border-[var(--border)] rounded-lg px-2 py-1.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                      />
                      <span className="text-xs text-[var(--muted-foreground)]">to</span>
                      <input
                        type="date"
                        value={current.end || ""}
                        onChange={(e) => handleFilterChange(col, { type: "date", start: current.start, end: e.target.value })}
                        className="bg-[var(--background)] border border-[var(--border)] rounded-lg px-2 py-1.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                      />
                    </div>
                  )}

                  {fmeta.type === "categorical" && (
                    <div className="max-h-28 overflow-y-auto space-y-1.5 pl-0.5">
                      {fmeta.options.map((opt) => {
                        const selected = current.selected || [];
                        const checked = selected.includes(opt);
                        return (
                          <label key={opt} className="flex items-center gap-2 text-xs text-[var(--foreground)] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                const next = checked ? selected.filter((v) => v !== opt) : [...selected, opt];
                                handleFilterChange(col, { type: "categorical", selected: next.length ? next : undefined });
                              }}
                              className="accent-[var(--primary)]"
                            />
                            <span className="truncate">{opt}</span>
                          </label>
                        );
                      })}
                      {fmeta.totalUnique > fmeta.options.length && (
                        <p className="text-[10px] text-[var(--muted-foreground)] mt-1">
                          Showing top {fmeta.options.length} of {fmeta.totalUnique} values
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {activeCount > 0 && (
            <button onClick={clearAll} className="text-xs text-[var(--primary)] hover:underline font-medium">
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterPanel;