"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button, Tabs } from "@altftool/ui";
import ClockTab from "../components/ClockTab";
import AlarmTab from "../components/AlarmTab";
import { AlarmBellIcon, ClockIcon } from "../components/Icons";
import {
  loadAlarms,
  saveAlarms,
  createDefaultAlarm,
  shouldFire,
  playAlarmSound,
  nextAlarmLabel,
} from "../utils/alarmUtils";

const TAB_ITEMS = [
  { key: "clock", label: "Clock", icon: <ClockIcon className="w-4 h-4" /> },
  { key: "alarm", label: "Alarms", icon: <AlarmBellIcon className="w-4 h-4" /> },
];

export default function ToolHome() {
  const [alarms, setAlarms] = useState([]);
  const [activeTab, setActiveTab] = useState("clock");
  const [firingAlarm, setFiringAlarm] = useState(null);
  const stopSoundRef = useRef(null);

  useEffect(() => {
    setAlarms(loadAlarms());
  }, []);

  useEffect(() => {
    saveAlarms(alarms);
  }, [alarms]);

  const handleAdd = useCallback((alarm) => {
    setAlarms((prev) => [...prev, alarm]);
  }, []);

  const handleEdit = useCallback((alarm) => {
    setAlarms((prev) => prev.map((a) => (a.id === alarm.id ? alarm : a)));
  }, []);

  const handleDelete = useCallback((id) => {
    setAlarms((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const handleToggle = useCallback((id) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  }, []);

  const dismissAlarm = useCallback(() => {
    if (stopSoundRef.current) {
      stopSoundRef.current();
      stopSoundRef.current = null;
    }
    if (firingAlarm) {
      setAlarms((prev) =>
        prev.map((a) =>
          a.id === firingAlarm.id && a.repeat === "one-time"
            ? { ...a, enabled: false }
            : a
        )
      );
    }
    setFiringAlarm(null);
  }, [firingAlarm]);

  const snoozeAlarm = useCallback(() => {
    if (stopSoundRef.current) {
      stopSoundRef.current();
      stopSoundRef.current = null;
    }
    if (firingAlarm) {
      const snoozeMins = firingAlarm.snoozeMinutes || 5;
      const now = new Date();
      const newMin = now.getMinutes() + snoozeMins;
      const newHour = (now.getHours() + Math.floor(newMin / 60)) % 24;
      const newMinute = newMin % 60;
      setAlarms((prev) =>
        prev.map((a) =>
          a.id === firingAlarm.id
            ? { ...a, hour: newHour, minute: newMinute, enabled: true }
            : a
        )
      );
    }
    setFiringAlarm(null);
  }, [firingAlarm]);

  useEffect(() => {
    if (firingAlarm) return;

    const interval = setInterval(() => {
      const now = new Date();
      for (const alarm of alarms) {
        if (shouldFire(alarm, now)) {
          setFiringAlarm(alarm);
          try {
            stopSoundRef.current = playAlarmSound(alarm.sound, alarm.volume);
          } catch {}
          break;
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [alarms, firingAlarm]);

  const label = nextAlarmLabel(alarms);

  return (
    <div className="px-4 py-6 max-w-3xl mx-auto space-y-6">
      {/* Tabs */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-1.5 flex gap-1 shadow-[var(--anslation-ds-shadow-sm)]">
        {TAB_ITEMS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center justify-center gap-2 flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === tab.key
                ? "bg-[var(--primary)] text-white shadow-sm"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.key === "alarm" && alarms.length > 0 && (
              <span
                className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                  activeTab === tab.key
                    ? "bg-white/20 text-white"
                    : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                }`}
              >
                {alarms.filter((a) => a.enabled).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "clock" && <ClockTab nextAlarmLabel={label} />}
      {activeTab === "alarm" && (
        <AlarmTab
          alarms={alarms}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggle={handleToggle}
          nextAlarmLabel={label}
        />
      )}

      {/* Firing Alarm Overlay */}
      {firingAlarm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex flex-col items-center gap-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-2xl max-w-sm w-full mx-4 text-center animate-pulse">
            <div className="rounded-full bg-[var(--primary)]/10 p-4">
              <AlarmBellIcon className="w-10 h-10 text-[var(--primary)]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[var(--foreground)]">Alarm!</h2>
              <p className="text-lg font-semibold text-[var(--primary)] mt-1">{firingAlarm.label}</p>
            </div>
            <div className="flex gap-3 w-full">
              <Button variant="secondary" onClick={snoozeAlarm} className="flex-1">
                Snooze ({firingAlarm.snoozeMinutes || 5}m)
              </Button>
              <Button variant="primary" onClick={dismissAlarm} className="flex-1">
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
