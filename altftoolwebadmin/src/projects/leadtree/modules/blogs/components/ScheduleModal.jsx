"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Clock, Calendar, ChevronUp, ChevronDown } from "lucide-react";

/* ─────────────────────────────────────────────
   ScrollDrum — single scrollable column
   items: array of strings
   value: currently selected string
   onChange: (string) => void
───────────────────────────────────────────── */
const ITEM_H = 44; // px height of each row

function ScrollDrum({ items, value, onChange }) {
  const containerRef = useRef(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startScroll = useRef(0);

  /* sync scroll position when value changes externally */
  useEffect(() => {
    const idx = items.indexOf(value);
    if (idx === -1 || !containerRef.current) return;
    containerRef.current.scrollTop = idx * ITEM_H;
  }, [value, items]);

  /* snap to nearest item after scroll ends */
  const handleScrollEnd = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollTop / ITEM_H);
    const clamped = Math.max(0, Math.min(idx, items.length - 1));
    el.scrollTop = clamped * ITEM_H;
    onChange(items[clamped]);
  }, [items, onChange]);

  /* debounce scroll end */
  const scrollTimer = useRef(null);
  const handleScroll = () => {
    clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(handleScrollEnd, 120);
  };

  /* drag support */
  const onMouseDown = (e) => {
    isDragging.current = true;
    startY.current = e.clientY;
    startScroll.current = containerRef.current.scrollTop;
    e.preventDefault();
  };
  const onMouseMove = useCallback((e) => {
    if (!isDragging.current) return;
    const diff = startY.current - e.clientY;
    containerRef.current.scrollTop = startScroll.current + diff;
  }, []);
  const onMouseUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    handleScrollEnd();
  }, [handleScrollEnd]);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  const step = (dir) => {
    const idx = items.indexOf(value);
    const next = Math.max(0, Math.min(idx + dir, items.length - 1));
    onChange(items[next]);
  };

  return (
    <div className="flex flex-col items-center gap-1">
      {/* up arrow */}
      <button
        type="button"
        onClick={() => step(-1)}
        className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition"
      >
        <ChevronUp className="w-4 h-4" />
      </button>

      {/* drum window — shows 3 rows, middle = selected */}
      <div
        className="relative w-16 overflow-hidden"
        style={{ height: ITEM_H * 3 }}
      >
        {/* highlight band */}
        <div
          className="absolute inset-x-0 pointer-events-none z-10 rounded-xl border border-gray-500 bg-gray-700/60"
          style={{ top: ITEM_H, height: ITEM_H }}
        />

        {/* fade top */}
        <div
          className="absolute inset-x-0 top-0 h-10 pointer-events-none z-20"
          style={{
            background: "linear-gradient(to bottom, #111 0%, transparent 100%)",
          }}
        />
        {/* fade bottom */}
        <div
          className="absolute inset-x-0 bottom-0 h-10 pointer-events-none z-20"
          style={{
            background: "linear-gradient(to top, #111 0%, transparent 100%)",
          }}
        />

        {/* scroll container */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          onMouseDown={onMouseDown}
          className="h-full overflow-y-scroll scrollbar-hide cursor-grab active:cursor-grabbing select-none"
          style={{ scrollSnapType: "y mandatory" }}
        >
          {/* top padding so first item can be centered */}
          <div style={{ height: ITEM_H }} />
          {items.map((item) => (
            <div
              key={item}
              onClick={() => onChange(item)}
              style={{ height: ITEM_H, scrollSnapAlign: "center" }}
              className={`flex items-center justify-center text-lg font-bold transition-colors cursor-pointer
                ${item === value ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
            >
              {item}
            </div>
          ))}
          {/* bottom padding */}
          <div style={{ height: ITEM_H }} />
        </div>
      </div>

      {/* down arrow */}
      <button
        type="button"
        onClick={() => step(1)}
        className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition"
      >
        <ChevronDown className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Build time options
───────────────────────────────────────────── */
const HOURS = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, "0"),
); // 01–12
const MINUTES = ["00", "15", "30", "45"];
const PERIODS = ["AM", "PM"];

/* ─────────────────────────────────────────────
   Format preview label
───────────────────────────────────────────── */
function formatPreview(date, hour, minute, period) {
  if (!date) return null;
  const d = new Date(date + "T00:00:00");
  const label = d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  return `${label} at ${hour}:${minute} ${period}`;
}

/* ─────────────────────────────────────────────
   ScheduleModal
   Props:
     onConfirm(Date)  — called with final JS Date
     onClose()        — close modal
───────────────────────────────────────────── */
export default function ScheduleModal({ onConfirm, onClose }) {
  const today = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(today);
  const [hour, setHour] = useState("09");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState("AM");
  const [error, setError] = useState("");

  /* close on Escape */
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  /* lock body scroll */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleConfirm = () => {
    setError("");
    if (!date) {
      setError("Please select a date.");
      return;
    }

    /* build Date from parts */
    let h = parseInt(hour, 10);
    const m = parseInt(minute, 10);
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;

    const scheduled = new Date(date + "T00:00:00");
    scheduled.setHours(h, m, 0, 0);

    if (scheduled <= new Date()) {
      setError("Scheduled time must be in the future.");
      return;
    }

    onConfirm(scheduled);
  };

  const preview = formatPreview(date, hour, minute, period);

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in"
        style={{ background: "#111111", border: "1px solid #2a2a2a" }}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: "1px solid #1f1f1f" }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gray-800 flex items-center justify-center">
              <Clock className="w-4 h-4 text-gray-300" />
            </div>
            <div>
              <p className="text-sm font-bold text-white tracking-tight">
                Schedule Post
              </p>
              <p className="text-xs text-gray-500">
                Pick date & time to auto-publish
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-gray-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="px-6 py-5 space-y-6">
          {/* Date picker */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <Calendar className="w-3.5 h-3.5" />
              Date
            </label>
            <input
              type="date"
              value={date}
              min={today}
              onChange={(e) => {
                setDate(e.target.value);
                setError("");
              }}
              className={`w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white
bg-gray-900 border border-gray-700
focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500
transition [color-scheme:dark]`}
            />
          </div>

          {/* Time drums */}
          <div className="space-y-3">
            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <Clock className="w-3.5 h-3.5" />
              Time
            </label>

            <div
              className="rounded-2xl px-4 py-4 flex items-center justify-center gap-2"
              style={{ background: "#111", border: "1px solid #222" }}
            >
              {/* Hour */}
              <ScrollDrum items={HOURS} value={hour} onChange={setHour} />

              {/* Separator */}
              <span className="text-2xl font-black text-gray-500 mb-1 select-none">
                :
              </span>

              {/* Minute */}
              <ScrollDrum items={MINUTES} value={minute} onChange={setMinute} />

              {/* Divider */}
              <div className="w-px h-16 bg-gray-800 mx-1" />

              {/* AM / PM */}
              <div className="flex flex-col gap-2">
                {PERIODS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className={`w-14 h-9 rounded-xl text-sm font-bold tracking-wide transition-all
                      ${
                        period === p
                          ? "bg-white text-gray-900 shadow-lg"
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                      }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          {preview && (
            <div
              className="flex items-start gap-2.5 rounded-xl px-3.5 py-3"
              style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
            >
              <Clock className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-0.5">
                  Scheduled for
                </p>
                <p className="text-sm text-gray-200 font-medium">{preview}</p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-xs text-red-400 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
              {error}
            </p>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex gap-2.5 px-6 pb-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold
              text-gray-400 bg-gray-900 border border-gray-700
              hover:bg-gray-800 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold
              text-gray-900 bg-white hover:bg-gray-100
              transition shadow-lg"
          >
            Confirm Schedule
          </button>
        </div>
      </div>

      <style >{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes animate-in {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-in {
          animation: animate-in 0.18s ease-out forwards;
        }
      `}</style>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modal, document.body)
    : null;
}
