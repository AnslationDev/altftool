import React, { useState, useEffect, useRef } from "react";

const icons = {
  numeric: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 17l2 2 3-3m0 0l3 3 2-2m-5-5V4m0 0L7 8m4-4l4 4" /></svg>
  ),
  categorical: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="4" rx="1"/><rect x="3" y="10" width="18" height="4" rx="1"/><rect x="3" y="17" width="18" height="4" rx="1"/></svg>
  ),
  date: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
  ),
};

const ROWS_PER_PAGE = 100;

const DataPreview = ({ data, columnTypes, autoTypes, onTypeChange, onTypeReset }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [visibleRows, setVisibleRows] = useState(ROWS_PER_PAGE);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setVisibleRows(ROWS_PER_PAGE);
  }, [data]);

  if (!data || data.length === 0) return null;

  const columns = Object.keys(data[0]);
  const displayedData = data.slice(0, visibleRows);
  const hasMore = visibleRows < data.length;

  const loadMore = () => {
    setVisibleRows((prev) => Math.min(prev + ROWS_PER_PAGE, data.length));
  };

  return (

      <div className="mt-6 w-full max-w-5xl glass-card overflow-hidden">

      <div className="p-4 pb-2">
        <h2 className="font-semibold text-[var(--foreground)] flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="3" y1="15" x2="21" y2="15" />
            <line x1="9" y1="3" x2="9" y2="21" />
          </svg>
          Data Preview
        </h2>
      </div>

      <div className="overflow-auto" style={{ maxHeight: "500px" }}>
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 z-10 bg-[var(--muted)]">
            <tr>
              {columns.map((col) => {
                const currentType = columnTypes[col] || autoTypes[col] || "categorical";
                const isOverridden = columnTypes[col] !== undefined && columnTypes[col] !== autoTypes[col];
                return (
                  <th key={col} className="relative px-4 py-2.5 text-left font-medium text-[var(--foreground)] border-b border-[var(--border)] whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate">{col}</span>
                      <button
                        onClick={() => setOpenDropdown(openDropdown === col ? null : col)}
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                          isOverridden
                            ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                            : "bg-[var(--muted-gray)] text-[var(--muted-foreground)] hover:bg-[var(--secondary-border)]"
                        }`}
                      >
                        {icons[currentType]}<span className="capitalize">{currentType}</span>
                      </button>
                      {openDropdown === col && (
                        <div ref={dropdownRef} className="absolute left-0 top-full mt-1 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-xl z-50 w-36">
                          {["numeric", "categorical", "date"].map((opt) => (
                            <button
                              key={opt}
                              className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs hover:bg-[var(--muted)] text-[var(--foreground)]"
                              onClick={() => { onTypeChange(col, opt); setOpenDropdown(null); }}
                            >
                              {icons[opt]}
                              <span className="capitalize">{opt}</span>
                            </button>
                          ))}
                          {isOverridden && (
                            <button
                              className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs hover:bg-[var(--muted)] text-red-500"
                              onClick={() => { onTypeReset(col); setOpenDropdown(null); }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                              Reset to auto
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {displayedData.map((row, idx) => (
              <tr key={idx} className={`transition-colors hover:bg-[var(--muted)] ${idx % 2 === 0 ? "bg-[var(--card)]" : "bg-[var(--section-highlight)]"}`}>
                {columns.map((col) => (
                  <td key={col} className="px-4 py-2 border-b border-[var(--border)] text-[var(--foreground)] whitespace-nowrap">
                    {row[col] != null ? String(row[col]) : ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-2 border-t border-[var(--border)] flex items-center justify-between">
        <p className="text-xs text-[var(--muted-foreground)]">
          Showing {displayedData.length} of {data.length} rows
        </p>
        {hasMore && (
          <button onClick={loadMore} className="text-xs text-[var(--primary)] hover:underline font-medium">
            Load {Math.min(ROWS_PER_PAGE, data.length - visibleRows)} more
          </button>
        )}
      </div>
    </div>
  );
};

export default DataPreview;