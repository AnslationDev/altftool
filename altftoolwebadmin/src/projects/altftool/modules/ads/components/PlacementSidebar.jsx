"use client";

import { useState, useEffect } from "react";
import { ChevronDown, LayoutDashboard } from "lucide-react";

export default function PlacementSidebar({ nav, placements, activeView, onSelect, counts = {} }) {
  const [collapsed, setCollapsed] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem("placement-sidebar-sections");
    if (saved) { try { setCollapsed(JSON.parse(saved)); } catch (_) {} }
  }, []);

  useEffect(() => {
    localStorage.setItem("placement-sidebar-sections", JSON.stringify(collapsed));
  }, [collapsed]);

  const toggleSection = (key) => setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <aside className="w-72 bg-[var(--surface)] border-r border-[var(--border)] h-full flex flex-col shrink-0">

      {/* Header */}
      <div className="px-5 py-5 border-b border-[var(--border)]">
        <h2 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-widest">Placement Control</h2>
        <p className="text-xs text-[var(--muted)] mt-1">Manage ad placements across the platform</p>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {nav.map((item) => {

          /* Section with children */
          if (item.children) {
            const isCollapsed = collapsed[item.key];
            return (
              <div key={item.key} className="space-y-0.5">
                {/* Section toggle */}
                <button onClick={() => toggleSection(item.key)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold text-[var(--muted)] uppercase tracking-widest hover:bg-[var(--surface-soft)] transition">
                  <span>{item.label}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isCollapsed ? "-rotate-90" : ""}`} />
                </button>

                {!isCollapsed && (
                  <div className="space-y-0.5 pl-1">
                    {item.children.map((childKey) => {
                      const placement = placements[childKey];
                      const isActive = activeView.type === "placement" && activeView.key === childKey;
                      const count = counts[childKey];

                      return (
                        <button key={childKey} onClick={() => onSelect({ type: "placement", key: childKey })}
                          className={`group relative w-full text-left px-3 py-2.5 rounded-xl transition-all ${isActive ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm" : "hover:bg-[var(--surface-soft)] text-[var(--muted)]"}`}>
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className={`text-sm font-medium truncate ${isActive ? "text-[var(--primary-foreground)]" : "text-[var(--foreground)]"}`}>
                                {placement?.label || childKey.replaceAll("_", " ")}
                              </p>
                              {placement?.description && (
                                <p className={`text-[11px] mt-0.5 truncate ${isActive ? "text-[var(--primary-foreground)]/70" : "text-[var(--muted)]"}`}>
                                  {placement.description}
                                </p>
                              )}
                            </div>
                            {typeof count === "number" && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${isActive ? "bg-[var(--primary-foreground)]/20 text-[var(--primary-foreground)]" : "bg-[var(--surface-soft)] text-[var(--muted)]"}`}>
                                {count}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          /* Single item */
          const isOverview = item.key === "overview";
          const isActive = isOverview
            ? activeView.type === "overview"
            : activeView.type === "placement" && activeView.key === item.key;

          return (
            <button key={item.key}
              onClick={() => onSelect(isOverview ? { type: "overview" } : { type: "placement", key: item.key })}
              className={`group w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center gap-3 ${isActive ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm" : "hover:bg-[var(--surface-soft)]"}`}>
              {isOverview && (
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isActive ? "bg-[var(--primary-foreground)]/20" : "bg-[var(--surface-soft)]"}`}>
                  <LayoutDashboard className={`w-3.5 h-3.5 ${isActive ? "text-[var(--primary-foreground)]" : "text-[var(--muted)]"}`} />
                </div>
              )}
              <div className="min-w-0">
                <p className={`text-sm font-semibold ${isActive ? "text-[var(--primary-foreground)]" : "text-[var(--foreground)]"}`}>{item.label}</p>
                {isOverview && <p className={`text-[11px] ${isActive ? "text-[var(--primary-foreground)]/70" : "text-[var(--muted)]"}`}>View overall performance</p>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer count summary */}
      {Object.keys(counts).length > 0 && (
        <div className="px-5 py-4 border-t border-[var(--border)]">
          <p className="text-xs text-[var(--muted)]">
            <span className="font-semibold text-[var(--foreground)]">{Object.values(counts).reduce((a, b) => a + b, 0)}</span> total ads across{" "}
            <span className="font-semibold text-[var(--foreground)]">{Object.keys(counts).length}</span> placements
          </p>
        </div>
      )}
    </aside>
  );
}