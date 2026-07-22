"use client";

import { useState, useMemo } from "react";
import Header from "../components/Header";
import OverviewCard from "../components/OverviewCard";
import TithiCard from "../components/TithiCard";
import NakshatraCard from "../components/NakshatraCard";
import YogaKaranaCard from "../components/YogaKaranaCard";
import MuhurtaCard from "../components/MuhurtaCard";
import { calculatePanchang, getDatePresets } from "../utils/panchangCalc";
import { RASHI_LIST } from "../constants";

export default function DailyPanchangCalculator() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [day, setDay] = useState(now.getDate());
  const [lat, setLat] = useState(28.6139);
  const [lon, setLon] = useState(77.209);

  const presets = useMemo(() => getDatePresets(), []);

  const panchang = useMemo(
    () => calculatePanchang({ year, month, day }, lat, lon),
    [year, month, day, lat, lon]
  );

  const handlePreset = (p) => {
    setYear(p.year);
    setMonth(p.month);
    setDay(p.day);
  };

  return (
    <div className="bg-[var(--background)] px-4 py-6 text-[var(--foreground)] transition-colors sm:px-6">
      <div className="mx-auto max-w-5xl">
        <Header />

        <div className="space-y-6">
          {/* Date Selector */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
            <div className="border-b border-[var(--border)] px-6 py-4">
              <h3 className="text-base font-bold text-[var(--foreground)]">Select Date & Location</h3>
            </div>
            <div className="p-6">
              <div className="mb-4 flex flex-wrap gap-1.5">
                {presets.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => handlePreset(p)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                      day === p.day && month === p.month && year === p.year
                        ? "bg-[var(--primary)] text-white"
                        : "bg-[var(--section-highlight)] text-[var(--foreground)] hover:bg-[var(--primary)]/10"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-5">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[var(--muted-foreground)]">Day</label>
                  <input
                    type="number" min={1} max={31}
                    value={day} onChange={(e) => setDay(Math.max(1, Math.min(31, parseInt(e.target.value) || 1)))}
                    className="h-11 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-center text-lg font-bold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[var(--muted-foreground)]">Month</label>
                  <input
                    type="number" min={1} max={12}
                    value={month} onChange={(e) => setMonth(Math.max(1, Math.min(12, parseInt(e.target.value) || 1)))}
                    className="h-11 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-center text-lg font-bold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[var(--muted-foreground)]">Year</label>
                  <input
                    type="number" min={1900} max={2100}
                    value={year} onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                    className="h-11 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-center text-lg font-bold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[var(--muted-foreground)]">Latitude</label>
                  <input
                    type="number" step={0.1} min={-90} max={90}
                    value={lat} onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                    className="h-11 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-center text-lg font-bold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[var(--muted-foreground)]">Longitude</label>
                  <input
                    type="number" step={0.1} min={-180} max={180}
                    value={lon} onChange={(e) => setLon(parseFloat(e.target.value) || 0)}
                    className="h-11 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-center text-lg font-bold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Overview */}
          <OverviewCard panchang={panchang} />

          {/* Five Limbs of Panchang */}
          <div className="grid gap-4 lg:grid-cols-2">
            <TithiCard tithi={panchang.tithi} />
            <NakshatraCard nakshatra={panchang.nakshatra} />
          </div>
          <YogaKaranaCard yoga={panchang.yoga} karana={panchang.karana} />

          {/* Rashi Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--card)] to-[var(--background)] p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Moon Sign (Rashi)</p>
              <p className="mt-1 text-2xl font-extrabold text-[var(--foreground)]">
                {panchang.moonRashi.name} ({panchang.moonRashi.english})
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">Lord: {panchang.moonRashi.lord} — Element: {panchang.moonRashi.element}</p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--card)] to-[var(--background)] p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Sun Sign (Rashi)</p>
              <p className="mt-1 text-2xl font-extrabold text-[var(--foreground)]">
                {panchang.sunRashi.name} ({panchang.sunRashi.english})
              </p>
            </div>
          </div>

          {/* Muhurtas */}
          <MuhurtaCard muhurtas={panchang.muhurtaTimings} />
        </div>

        <p className="mt-6 text-center text-xs text-[var(--muted-foreground)]">
          All calculations run in your browser using astronomical algorithms. Timings are approximate (±2 min).
        </p>
      </div>
    </div>
  );
}
