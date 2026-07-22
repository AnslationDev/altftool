"use client";

import { CalendarDays, ChevronLeft, X } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import FloatingCallIcon from "./FloatingCallIcon";
import { announceBookingPopupOpen, useBookingPopupCoordinator } from "@/app/business-ops/tripfindbox/lib/bookingPopupBus";
import { getFloatingLayerStyle, prepareBookingPopup } from "@/app/business-ops/tripfindbox/lib/bookingInteraction";
import { useTripFindBoxContactInfo } from "@/app/business-ops/tripfindbox/hooks/useTripFindBoxContactInfo";

const today = stripTime(new Date());
const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function formatDate(date) {
  if (!date) return "Select date";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatDay(date) {
  if (!date) return "Choose a day";
  return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date);
}

function stripTime(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function shouldUseFloatingPopup() {
  return typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches;
}

function getCompactFloatingStyle(field) {
  const safe = 12;
  const gap = 8;
  const rect = field.getBoundingClientRect();
  const width = Math.min(520, window.innerWidth - safe * 2);
  const maxHeight = Math.min(300, window.innerHeight - safe * 2);
  const left = Math.min(Math.max(rect.left + rect.width / 2 - width / 2, safe), window.innerWidth - width - safe);
  const top = Math.min(Math.max(rect.bottom + gap, safe), window.innerHeight - maxHeight - safe);

  return {
    position: "fixed",
    left,
    top,
    width,
    maxHeight,
    zIndex: 999999,
  };
}

function sameDay(a, b) {
  return Boolean(a && b && stripTime(a).getTime() === stripTime(b).getTime());
}

function isBetween(date, start, end) {
  if (!start || !end) return false;
  const time = stripTime(date).getTime();
  return time > stripTime(start).getTime() && time < stripTime(end).getTime();
}

function monthDays(month) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: first.getDay() }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(month.getFullYear(), month.getMonth(), day));
  }
  return cells;
}

function MonthView({ month, minDate, departureDate, returnDate, onSelect }) {
  const cells = monthDays(month);
  const monthLabel = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(month);

  return (
    <div className="min-w-0 flex-1">
      <p className="mb-4 text-center text-sm font-bold text-[#111111]">{monthLabel}</p>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-[#111111]/45">
        {weekDays.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1">
        {cells.map((date, index) => {
          if (!date) return <span key={`empty-${index}`} className="h-10" />;
          const disabled = stripTime(date).getTime() < minDate.getTime();
          const isDeparture = sameDay(date, departureDate);
          const isReturn = sameDay(date, returnDate);
          const inRange = isBetween(date, departureDate, returnDate);

          return (
            <button
              key={date.toISOString()}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(date)}
              className={`h-10 rounded-full text-sm font-semibold transition ${
                disabled
                  ? "text-[#111111]/20"
                  : inRange
                    ? "bg-[#2E3192]/12 text-[#2E3192]"
                    : "text-[#111111] hover:bg-[#F1F1F1]"
              } ${isDeparture ? "!bg-[#2E3192] text-white shadow-lg shadow-[#2E3192]/25" : ""} ${
                isReturn ? "!bg-[#2E3192] text-white shadow-lg shadow-[#2E3192]/25" : ""
              }`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function DatePickerPopup({
  label,
  value,
  departureDate,
  returnDate,
  selecting,
  minDate,
  onSelect,
  error,
  compact = false,
}) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState("below");
  const [floatingStyle, setFloatingStyle] = useState({});
  const fieldRef = useRef(null);
  const buttonRef = useRef(null);
  const updateFrameRef = useRef(null);
  const popupId = useId();
  const closePanel = useCallback(() => setOpen(false), []);
  const contact = useTripFindBoxContactInfo();
  const initialMonth = value ?? (selecting === "return" ? departureDate : null) ?? today;
  const [month, setMonth] = useState(new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1));
  const effectiveMinDate = stripTime(minDate ?? today);

  useBookingPopupCoordinator(popupId, open, closePanel);

  const months = useMemo(() => Array.from({ length: 8 }, (_, index) => addMonths(month, index)), [month]);
  const updatePosition = useCallback((nextPlacement = placement) => {
    if (!buttonRef.current) return;
    if (compact) {
      setPlacement("below");
      setFloatingStyle(getCompactFloatingStyle(buttonRef.current));
      return;
    }
    if (!shouldUseFloatingPopup()) {
      setPlacement("below");
      setFloatingStyle({});
      return;
    }
    setFloatingStyle(getFloatingLayerStyle(buttonRef.current, nextPlacement, { width: compact ? 520 : 720, height: compact ? 300 : 430 }));
  }, [compact, placement]);

  const openPanel = async () => {
    if (!buttonRef.current) return;
    announceBookingPopupOpen(popupId);
    if (compact) {
      setPlacement("below");
      setFloatingStyle(getCompactFloatingStyle(buttonRef.current));
      setOpen(true);
      return;
    }
    if (!shouldUseFloatingPopup()) {
      setPlacement("below");
      setFloatingStyle({});
      setOpen(true);
      return;
    }
    const nextPlacement = await prepareBookingPopup(buttonRef.current, compact ? 300 : 430);
    setPlacement(nextPlacement);
    setFloatingStyle(getFloatingLayerStyle(buttonRef.current, nextPlacement, { width: compact ? 520 : 720, height: compact ? 300 : 430 }));
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const handleUpdate = () => {
      if (updateFrameRef.current !== null) return;
      updateFrameRef.current = window.requestAnimationFrame(() => {
        updateFrameRef.current = null;
        updatePosition();
      });
    };
    const handlePointerDown = (event) => {
      if (!shouldUseFloatingPopup()) return;
      const target = event.target;
      if (!target) return;
      if (fieldRef.current?.contains(target)) return;
      if (target.closest?.(".booking-popup")) return;
      setOpen(false);
    };
    window.addEventListener("resize", handleUpdate);
    window.addEventListener("scroll", handleUpdate, { passive: true });
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("scroll", handleUpdate);
      if (updateFrameRef.current !== null) {
        window.cancelAnimationFrame(updateFrameRef.current);
        updateFrameRef.current = null;
      }
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open, updatePosition]);

  return (
    <div ref={fieldRef} className="relative min-w-0 flex-1">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          void openPanel();
        }}
        className={`search-field flex w-full items-center gap-3 rounded-full border bg-[#F1F1F1] text-left transition focus:outline-none ${
          error ? "border-red-400" : "border-transparent focus:border-[#2E3192] hover:border-[#2E3192]/35"
        }`}
      >
        <span className="search-icon grid shrink-0 place-items-center text-[#2E3192]">
          <CalendarDays size={19} />
        </span>
        <span className="min-w-0">
          <span className="search-label block font-bold text-[#111111]">{label}</span>
          <span className={`block truncate text-base font-bold ${value ? "text-[#111111]" : "search-value-empty text-[#8C8C8C]"}`}>
            {formatDate(value)}
          </span>
          {value ? <span className="block truncate text-xs text-[#111111]/55">{formatDay(value)}</span> : null}
        </span>
      </button>
      {error ? <p className="mt-2 px-4 text-xs font-semibold text-red-500">{error}</p> : null}
      {open ? createPortal(
        <div
          className={`booking-popup date-popup booking-popup-${placement}${compact ? " date-popup-compact" : ""} fixed inset-0 z-[9999] flex items-end bg-black/25 p-3 backdrop-blur-sm md:inset-auto md:block ${compact ? "md:w-[520px]" : "md:w-[720px]"} md:bg-transparent md:p-0 md:backdrop-blur-0`}
          style={floatingStyle}
        >
          <div className="w-full rounded-[28px] bg-white p-4 shadow-2xl md:p-6">
            <div className="mobile-picker-head">
              <button type="button" aria-label="Go back" onClick={() => setOpen(false)}>
                <ChevronLeft size={26} />
              </button>
              <strong>Select Date</strong>
              <button type="button" aria-label="Close" onClick={() => setOpen(false)}>
                <X size={26} />
              </button>
            </div>
            <div className="mb-5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setMonth(addMonths(month, -1))}
                className="rounded-full bg-[#F1F1F1] px-4 py-2 text-sm font-bold text-[#2E3192]"
              >
                Prev
              </button>
              <p className="text-sm font-bold text-[#111111]/65">{selecting === "departure" ? "Select departure" : "Select return"}</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMonth(addMonths(month, 1))}
                  className="rounded-full bg-[#F1F1F1] px-4 py-2 text-sm font-bold text-[#2E3192]"
                >
                  Next
                </button>
                <button type="button" onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-full bg-[#111111] text-white">
                  <X size={17} />
                </button>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {months.map((visibleMonth, index) => (
                <div key={visibleMonth.toISOString()} className={index > 1 ? "md:hidden" : ""}>
                  <MonthView
                    month={visibleMonth}
                    minDate={effectiveMinDate}
                    departureDate={departureDate}
                    returnDate={returnDate}
                    onSelect={(date) => {
                      onSelect(date);
                      setOpen(false);
                    }}
                  />
                </div>
              ))}
            </div>
            <a className="mobile-picker-callbar" href={contact.href}>
              <span><FloatingCallIcon /></span>
              <b>{contact.mobileCallText}</b>
              <strong>{contact.phone}</strong>
            </a>
          </div>
        </div>,
        document.body,
      ) : null}
    </div>
  );
}
