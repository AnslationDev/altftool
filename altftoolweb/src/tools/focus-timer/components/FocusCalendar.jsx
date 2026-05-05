"use client"

import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

function formatMinutes(min) {
  if (!min || min === 0) return "0m";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

const WEEK_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

export default function FocusCalendar({ allStats }) {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const prevMonth = () =>
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));

  const nextMonth = () =>
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  // Build days grid
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const getTileStyle = (dateStr) => {
    if (dateStr > todayStr)
      return { bg: "bg-(--muted) opacity-30", text: "text-(--muted-foreground)" };
    const minutes = allStats[dateStr]?.focusMinutes || 0;
    if (minutes >= 120) return { bg: "bg-green-500", text: "text-white" };
    if (minutes >= 60)  return { bg: "bg-green-400", text: "text-white" };
    if (minutes >= 25)  return { bg: "bg-green-300", text: "text-green-900" };
    if (minutes > 0)    return { bg: "bg-green-200", text: "text-green-800" };
    return { bg: "bg-red-100", text: "text-red-400" };
  };

  return (
    <div className="bg-(--background) border border-(--border) rounded-xl p-4 flex flex-col gap-3">

      {/* HEADER */}
      <div className="flex items-center gap-2">
        <CalendarDays size={16} className="text-(--primary)" />
        <p className="text-sm font-bold font-primary text-(--foreground)">
          Focus Calendar
        </p>
      </div>

      {/* MONTH NAVIGATION */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-lg bg-(--muted) text-(--foreground) cursor-pointer border-none hover:bg-(--border) transition-all"
        >
          <ChevronLeft size={15} />
        </button>

        <p className="text-sm font-bold font-primary text-(--foreground)">
          {MONTHS[month]} {year}
        </p>

        <button
          onClick={nextMonth}
          disabled={viewDate >= new Date(today.getFullYear(), today.getMonth(), 1)}
          className={`p-1.5 rounded-lg border-none transition-all
            ${viewDate >= new Date(today.getFullYear(), today.getMonth(), 1)
              ? "opacity-30 cursor-not-allowed bg-(--muted)"
              : "bg-(--muted) text-(--foreground) cursor-pointer hover:bg-(--border)"
            }`}
        >
          <ChevronRight size={15} />
        </button>
      </div>

      {/* WEEK LABELS */}
      <div className="grid grid-cols-7 gap-1">
        {WEEK_LABELS.map((d) => (
          <div key={d} className="text-center text-xs font-bold font-primary text-(--muted-foreground)">
            {d}
          </div>
        ))}
      </div>

      {/* DAY GRID */}
      <div className="grid grid-cols-7 gap-2">

        {/* Empty cells */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isToday = dateStr === todayStr;
          const minutes = allStats[dateStr]?.focusMinutes || 0;
          const { bg, text } = getTileStyle(dateStr);

          return (
            <div
              key={dateStr}
              title={dateStr <= todayStr ? formatMinutes(minutes) : ""}
              className={`
                flex flex-col items-center justify-center
                 w-full md:h-15 md:rounded-md rounded-sm
                text-xs font-bold font-primary
                cursor-default transition-all duration-200
                ${bg} ${text}
                ${isToday ? "ring-2 ring-(--primary) ring-offset-1" : ""}
              `}
            >
              <span>{day}</span>
              {minutes > 0 && dateStr <= todayStr && (
                <span className="text-[9px] font-normal opacity-80 leading-none hidden sm:inline-flex">
                  {formatMinutes(minutes)}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* LEGEND */}
      <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-(--border)">
        {[
          { color: "bg-red-100",   label: "No focus" },
          { color: "bg-green-200", label: "< 25m"    },
          { color: "bg-green-300", label: "25m+"     },
          { color: "bg-green-400", label: "1h+"      },
          { color: "bg-green-500", label: "2h+"      },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1">
            <div className={`w-2.5 h-2.5 rounded-sm ${color}`} />
            <span className="text-xs text-(--muted-foreground) font-secondary">{label}</span>
          </div>
        ))}
      </div>

    </div>
  );
}