"use client";

import { useState } from "react";
import { Button, Modal, Input, Field, Select } from "@altftool/ui";
import { pad2 } from "../utils/alarmUtils";

const REPEAT_OPTIONS = [
  { value: "one-time", label: "One-time" },
  { value: "daily", label: "Daily" },
  { value: "weekdays", label: "Weekdays (Mon-Fri)" },
  { value: "weekends", label: "Weekends (Sat-Sun)" },
  { value: "custom", label: "Custom Days" },
];

const SOUND_OPTIONS = [
  { value: "beep", label: "Beep" },
  { value: "chime", label: "Chime" },
  { value: "bell", label: "Bell" },
  { value: "buzzer", label: "Buzzer" },
];

const DAY_OPTIONS = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

const SNOOZE_OPTIONS = [
  { value: 1, label: "1 min" },
  { value: 3, label: "3 min" },
  { value: 5, label: "5 min" },
  { value: 10, label: "10 min" },
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
];

export default function AlarmModal({ alarm, onSave, onClose }) {
  const [label, setLabel] = useState(alarm.label || "Alarm");
  const [hour, setHour] = useState(alarm.hour ?? 7);
  const [minute, setMinute] = useState(alarm.minute ?? 0);
  const [repeat, setRepeat] = useState(alarm.repeat || "one-time");
  const [customDays, setCustomDays] = useState(alarm.customDays || []);
  const [snoozeMinutes, setSnoozeMinutes] = useState(alarm.snoozeMinutes ?? 5);
  const [sound, setSound] = useState(alarm.sound || "beep");
  const [volume, setVolume] = useState(alarm.volume ?? 80);

  const hour12 = ((hour % 12) || 12);
  const period = hour >= 12 ? "PM" : "AM";

  const handleHourChange = (val) => {
    const h = parseInt(val, 10);
    if (!isNaN(h) && h >= 1 && h <= 12) {
      let h24 = h % 12;
      if (period === "PM") h24 += 12;
      setHour(h24);
    }
  };

  const handleMinuteChange = (val) => {
    const m = parseInt(val, 10);
    if (!isNaN(m) && m >= 0 && m <= 59) {
      setMinute(m);
    }
  };

  const togglePeriod = () => {
    setHour((h) => (h >= 12 ? h - 12 : h + 12));
  };

  const toggleCustomDay = (dayVal) => {
    setCustomDays((prev) =>
      prev.includes(dayVal)
        ? prev.filter((d) => d !== dayVal)
        : [...prev, dayVal]
    );
  };

  const handleSave = () => {
    onSave({
      ...alarm,
      label: label.trim() || "Alarm",
      hour,
      minute,
      repeat,
      customDays: repeat === "custom" ? customDays : [],
      snoozeMinutes,
      sound,
      volume,
    });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={alarm.id ? "Edit Alarm" : "New Alarm"}
      description="Set your alarm preferences below."
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>Save Alarm</Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Label */}
        <Field label="Label">
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Wake up, Meeting..."
            maxLength={40}
          />
        </Field>

        {/* Time Picker */}
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Time</label>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2">
              <Input
                type="number"
                min={1}
                max={12}
                value={pad2(hour12)}
                onChange={(e) => handleHourChange(e.target.value)}
                className="w-12 text-center text-lg font-bold tabular-nums border-0 bg-transparent p-0"
                style={{ fontFamily: "var(--font-mono, monospace)" }}
              />
              <span className="text-[var(--muted-foreground)] font-semibold">:</span>
              <Input
                type="number"
                min={0}
                max={59}
                value={pad2(minute)}
                onChange={(e) => handleMinuteChange(e.target.value)}
                className="w-12 text-center text-lg font-bold tabular-nums border-0 bg-transparent p-0"
                style={{ fontFamily: "var(--font-mono, monospace)" }}
              />
            </div>
            <button
              type="button"
              onClick={togglePeriod}
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-bold text-[var(--primary)] hover:border-[var(--primary)] transition-all"
            >
              {period}
            </button>
          </div>
        </div>

        {/* Repeat */}
        <Field label="Repeat">
          <Select value={repeat} onChange={(e) => setRepeat(e.target.value)}>
            {REPEAT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
        </Field>

        {/* Custom Days */}
        {repeat === "custom" && (
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Select Days</label>
            <div className="flex flex-wrap gap-2">
              {DAY_OPTIONS.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleCustomDay(day.value)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                    customDays.includes(day.value)
                      ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                      : "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sound */}
        <Field label="Sound">
          <Select value={sound} onChange={(e) => setSound(e.target.value)}>
            {SOUND_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
        </Field>

        {/* Volume */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-[var(--foreground)]">Volume</label>
            <span className="text-xs font-semibold text-[var(--primary)] tabular-nums">{volume}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => setVolume(parseInt(e.target.value, 10))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--primary) ${volume}%, var(--border) ${volume}%)`,
            }}
          />
        </div>

        {/* Snooze */}
        <Field label="Snooze Duration">
          <Select value={snoozeMinutes} onChange={(e) => setSnoozeMinutes(parseInt(e.target.value, 10))}>
            {SNOOZE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
        </Field>
      </div>
    </Modal>
  );
}
