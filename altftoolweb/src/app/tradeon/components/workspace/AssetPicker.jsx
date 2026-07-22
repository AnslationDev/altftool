// src/app/tradeon/components/workspace/AssetPicker.jsx
"use client";

import { useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { useClickOutside } from "../../hooks/useClickOutside";
import { ASSET_CLASSES, INSTRUMENTS } from "../../lib/instruments";
import { cn } from "../../utils/cn";

/**
 * Per-panel asset search. Each chart panel owns one of these, so every panel can
 * load a different instrument independently. Solid popover, keyboard-friendly.
 */
export default function AssetPicker({ value, onSelect, size = "sm" }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [coords, setCoords] = useState(null);
  const inputRef = useRef(null);
  const btnRef = useRef(null);
  const ref = useClickOutside(() => setOpen(false), open);

  const toggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const W = 256;
      setCoords({ top: r.bottom + 4, left: Math.max(8, Math.min(r.left, window.innerWidth - W - 8)) });
    }
    setOpen((o) => !o);
    setQ("");
    setTimeout(() => inputRef.current?.focus(), 30);
  };

  const groups = useMemo(() => {
    const query = q.trim().toLowerCase();
    return ASSET_CLASSES.map((c) => ({
      ...c,
      rows: INSTRUMENTS.filter(
        (i) =>
          i.assetClass === c.id &&
          (!query || i.symbol.toLowerCase().includes(query) || i.name.toLowerCase().includes(query))
      ),
    })).filter((g) => g.rows.length);
  }, [q]);

  return (
    <div className="relative" ref={ref}>
      <button
        ref={btnRef}
        onClick={toggle}
        className={cn(
          "inline-flex items-center gap-1 rounded-md font-bold",
          size === "sm" ? "text-xs px-1.5 py-1" : "text-sm px-2 py-1.5"
        )}
        style={{ color: "var(--tdn-fg-strong)" }}
      >
        {value} <ChevronDown size={12} style={{ color: "var(--tdn-faint)" }} />
      </button>

      {open && coords && (
        <div
          className="fixed z-[200] w-64 rounded-xl overflow-hidden shadow-[var(--tdn-shadow-lg)]"
          style={{ top: coords.top, left: coords.left, background: "var(--tdn-surface-solid)", border: "1px solid var(--tdn-border-strong)" }}
        >
          <div className="flex items-center gap-2 px-2.5 py-2 border-b" style={{ borderColor: "var(--tdn-border)" }}>
            <Search size={14} style={{ color: "var(--tdn-muted)" }} />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search symbol…"
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: "var(--tdn-fg)" }}
            />
          </div>
          <div className="max-h-72 overflow-y-auto tdn-scroll-thin p-1">
            {groups.map((g) => (
              <div key={g.id}>
                <div className="tdn-eyebrow text-[0.56rem] px-2 pt-1.5 pb-0.5">{g.label}</div>
                {g.rows.map((i) => (
                  <button
                    key={i.symbol}
                    onClick={() => {
                      onSelect(i.symbol);
                      setOpen(false);
                    }}
                    className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-left hover:bg-[color-mix(in_srgb,var(--tdn-iris)_10%,transparent)]"
                    style={{ background: i.symbol === value ? "color-mix(in srgb, var(--tdn-iris) 12%, transparent)" : "transparent" }}
                  >
                    <span className="text-xs font-semibold" style={{ color: "var(--tdn-fg-strong)" }}>{i.symbol}</span>
                    <span className="text-[0.66rem] truncate ml-2" style={{ color: "var(--tdn-faint)" }}>{i.name}</span>
                  </button>
                ))}
              </div>
            ))}
            {!groups.length && (
              <div className="px-3 py-6 text-center text-xs" style={{ color: "var(--tdn-faint)" }}>No matches</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
