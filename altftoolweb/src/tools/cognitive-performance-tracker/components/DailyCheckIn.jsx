"use client";

import { useState, useCallback } from "react";
import {
  Moon,
  Droplets,
  Smile,
  Battery,
  BookOpen,
  Briefcase,
  Dumbbell,
  Flower2,
  StickyNote,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { DAILY_METRICS } from "../constants/trackerConfig";
import { calculateDailyScore } from "../utils/analytics";

const ICON_MAP = {
  Moon,
  Droplets,
  Smile,
  Battery,
  BookOpen,
  Briefcase,
  Dumbbell,
  Flower2,
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function DailyCheckIn({ onSubmit, existingCheckIn }) {
  const [date, setDate] = useState(existingCheckIn?.date || todayStr());
  const [values, setValues] = useState(() => {
    const defaults = {};
    DAILY_METRICS.forEach((m) => {
      defaults[m.id] = existingCheckIn?.[m.id] ?? (m.id === "sleepHours" ? 7 : m.id === "waterIntake" ? 6 : m.id === "mood" ? 3 : m.id === "energyLevel" ? 3 : 0);
    });
    return defaults;
  });
  const [notes, setNotes] = useState(existingCheckIn?.notes || "");
  const [submitted, setSubmitted] = useState(false);

  const handleChange = useCallback((metricId, value) => {
    setValues((prev) => ({ ...prev, [metricId]: Number(value) }));
  }, []);

  const handleSubmit = useCallback(() => {
    const entry = {
      date,
      ...values,
      notes,
    };
    onSubmit(entry);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  }, [date, values, notes, onSubmit]);

  const previewScore = calculateDailyScore({ date, ...values });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm sm:p-8">
        <h2 className="mb-2 flex items-center gap-2 text-xl font-bold text-[var(--foreground)]">
          <Calendar className="h-5 w-5 text-[var(--primary)]" />
          Daily Check-In
        </h2>
        <p className="mb-6 text-sm text-[var(--muted-foreground)]">
          Log your daily habits and wellbeing to track cognitive performance over time.
        </p>

        <div className="mb-6">
          <label className="mb-2 block text-sm font-bold text-[var(--foreground)]">Date</label>
          <input
            type="date"
            value={date}
            max={todayStr()}
            onChange={(e) => setDate(e.target.value)}
            className="input w-full rounded-lg px-4 py-2.5 text-sm"
          />
        </div>

        <div className="space-y-5">
          {DAILY_METRICS.map((metric) => {
            const IconComp = ICON_MAP[metric.icon] || Moon;
            const value = values[metric.id] ?? 0;

            return (
              <div key={metric.id} className="rounded-xl border border-[var(--border)] bg-[var(--section-highlight)] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-bold text-[var(--foreground)]">
                    <IconComp className="h-4 w-4 text-[var(--primary)]" />
                    {metric.label}
                  </label>
                  <span className="rounded-full bg-[var(--card)] px-3 py-1 text-sm font-extrabold text-[var(--primary)]">
                    {value}{metric.unit ? ` ${metric.unit}` : ""}
                  </span>
                </div>

                {metric.labels ? (
                  <div className="flex gap-2">
                    {metric.labels.map((label, i) => (
                      <button
                        key={i}
                        onClick={() => handleChange(metric.id, i + 1)}
                        className={`flex-1 rounded-lg border p-2 text-xs font-bold transition-all ${
                          value === i + 1
                            ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                            : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input
                    type="range"
                    min={metric.min}
                    max={metric.max}
                    step={metric.step}
                    value={value}
                    onChange={(e) => handleChange(metric.id, e.target.value)}
                    className="w-full accent-[var(--primary)]"
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-5">
          <label className="mb-2 flex items-center gap-2 text-sm font-bold text-[var(--foreground)]">
            <StickyNote className="h-4 w-4 text-[var(--primary)]" />
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="How was your day?"
            className="input w-full rounded-lg px-4 py-2.5 text-sm"
          />
        </div>

        <div className="mt-6 flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--section-highlight)] p-4">
          <span className="text-sm font-bold text-[var(--foreground)]">Estimated Daily Score</span>
          <span className="text-2xl font-extrabold text-[var(--primary)]">{previewScore}%</span>
        </div>

        <button onClick={handleSubmit} className="btn-primary mt-6 w-full rounded-xl py-3 text-base">
          {submitted ? (
            <span className="flex items-center justify-center gap-2">
              <CheckCircle2 className="h-5 w-5" /> Saved!
            </span>
          ) : existingCheckIn ? (
            "Update Check-In"
          ) : (
            "Save Check-In"
          )}
        </button>
      </div>
    </div>
  );
}
