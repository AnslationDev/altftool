"use client";

import { useRef } from "react";

// Accessible pill-tab navigation. Arrow keys / Home / End move focus between
// tabs per the WAI-ARIA tabs pattern. `idPrefix` lets the parent wire up
// matching aria-controls/aria-labelledby ids on its own tabpanel elements.
export default function Tabs({ tabs, activeId, onChange, idPrefix = "tabs", className = "" }) {
  const listRef = useRef(null);

  function handleKeyDown(event, index) {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault();

    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabs.length - 1;

    onChange(tabs[nextIndex].id);
    const nextButton = listRef.current?.querySelectorAll('[role="tab"]')[nextIndex];
    nextButton?.focus();
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label="Analysis sections"
      className={`flex flex-wrap gap-2 ${className}`}
    >
      {tabs.map((tab, index) => {
        const selected = tab.id === activeId;
        return (
          <button
            key={tab.id}
            id={`${idPrefix}-tab-${tab.id}`}
            role="tab"
            type="button"
            aria-selected={selected}
            aria-controls={`${idPrefix}-panel-${tab.id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all whitespace-nowrap ${
              selected
                ? "bg-(--primary) text-(--primary-foreground) shadow-md shadow-(--primary)/20"
                : "bg-(--muted) text-(--muted-foreground) hover:bg-(--secondary-hover)"
            }`}
          >
            {tab.icon}
            {tab.label}
            {typeof tab.badge === "number" && tab.badge > 0 && (
              <span
                className={`ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-semibold ${
                  selected ? "bg-(--primary-foreground)/20 text-(--primary-foreground)" : "bg-(--primary)/15 text-(--primary)"
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({ id, tabId, activeId, idPrefix = "tabs", className = "", children }) {
  const key = id ?? tabId;
  const hidden = key !== activeId;
  return (
    <div
      id={`${idPrefix}-panel-${key}`}
      role="tabpanel"
      aria-labelledby={`${idPrefix}-tab-${key}`}
      hidden={hidden}
      className={hidden ? "" : className}
      tabIndex={0}
    >
      {!hidden && children}
    </div>
  );
}
