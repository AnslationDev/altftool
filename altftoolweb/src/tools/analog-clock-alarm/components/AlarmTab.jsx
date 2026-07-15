"use client";

import { useState } from "react";
import { Button, Modal, Input, Field, Select, Alert } from "@altftool/ui";
import { createDefaultAlarm, repeatLabel, pad2 } from "../utils/alarmUtils";
import AlarmModal from "./AlarmModal";
import { AlarmBellIcon, ClockIcon } from "./Icons";

export default function AlarmTab({
  alarms,
  onAdd,
  onEdit,
  onDelete,
  onToggle,
  nextAlarmLabel,
}) {
  const [editTarget, setEditTarget] = useState(null); // null | alarm object
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const openAdd = () => {
    setEditTarget(createDefaultAlarm());
    setIsModalOpen(true);
  };

  const openEdit = (alarm) => {
    setEditTarget({ ...alarm });
    setIsModalOpen(true);
  };

  const handleSave = (alarm) => {
    if (alarms.find((a) => a.id === alarm.id)) {
      onEdit(alarm);
    } else {
      onAdd(alarm);
    }
    setIsModalOpen(false);
    setEditTarget(null);
  };

  const handleDelete = (id) => {
    onDelete(id);
    setDeleteTarget(null);
  };

  const formatAlarmTime = (alarm) => {
    const h = alarm.hour;
    const m = alarm.minute;
    const h12 = ((h % 12) || 12);
    const period = h >= 12 ? "PM" : "AM";
    return `${pad2(h12)}:${pad2(m)} ${period}`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Alarms</h2>
          {nextAlarmLabel && (
            <p className="text-xs text-[var(--primary)] font-medium mt-0.5">{nextAlarmLabel}</p>
          )}
        </div>
        <Button variant="primary" onClick={openAdd} className="gap-2 text-sm">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Alarm
        </Button>
      </div>

      {/* Alarm list */}
      {alarms.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] py-14 text-center">
          <span className="text-4xl" aria-hidden="true">⏰</span>
          <p className="text-base font-semibold text-[var(--foreground)]">No alarms set</p>
          <p className="text-sm text-[var(--muted-foreground)] max-w-xs">
            Add your first alarm to get started. You can set repeating alarms, snooze durations, and custom sounds.
          </p>
          <Button variant="secondary" onClick={openAdd} className="mt-2 text-sm gap-1.5">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Alarm
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {alarms.map((alarm) => (
            <li
              key={alarm.id}
              className={`flex items-center gap-4 rounded-xl border px-4 py-3.5 transition-all hover:shadow-[var(--anslation-ds-shadow-sm)] ${
                alarm.enabled
                  ? "border-[var(--border)] bg-[var(--card)]"
                  : "border-[var(--border)] bg-[var(--muted)] opacity-60"
              }`}
            >
              {/* Time */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-2xl font-bold tabular-nums text-[var(--foreground)]"
                  style={{ fontFamily: "var(--font-mono, monospace)" }}
                >
                  {formatAlarmTime(alarm)}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-[var(--muted-foreground)] font-medium truncate">
                    {alarm.label}
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)]">·</span>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {repeatLabel(alarm)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {/* Edit */}
                <button
                  onClick={() => openEdit(alarm)}
                  className="rounded-lg border border-[var(--border)] p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--primary)] transition-all"
                  aria-label="Edit alarm"
                  title="Edit"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>

                {/* Delete */}
                <button
                  onClick={() => setDeleteTarget(alarm.id)}
                  className="rounded-lg border border-[var(--border)] p-2 text-[var(--muted-foreground)] hover:text-[var(--anslation-ds-danger)] hover:border-[var(--anslation-ds-danger)] transition-all"
                  aria-label="Delete alarm"
                  title="Delete"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4h6v2" />
                  </svg>
                </button>

                {/* Toggle */}
                <button
                  role="switch"
                  aria-checked={alarm.enabled}
                  onClick={() => onToggle(alarm.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full border-2 transition-colors ${
                    alarm.enabled
                      ? "bg-[var(--primary)] border-[var(--primary)]"
                      : "bg-[var(--muted)] border-[var(--border)]"
                  }`}
                  aria-label={alarm.enabled ? "Disable alarm" : "Enable alarm"}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      alarm.enabled ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && editTarget && (
        <AlarmModal
          alarm={editTarget}
          onSave={handleSave}
          onClose={() => { setIsModalOpen(false); setEditTarget(null); }}
        />
      )}

      {/* Delete Confirm */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Alarm"
        description="This action cannot be undone."
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => handleDelete(deleteTarget)}>Delete</Button>
          </>
        }
      >
        <p style={{ margin: 0 }} className="text-sm text-[var(--foreground)]">
          Are you sure you want to delete this alarm?
        </p>
      </Modal>
    </div>
  );
}
