"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Milestone,
  Plus,
  Trash2,
  Copy,
  Check,
  Download,
  RefreshCw,
  Calendar,
  Flag,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  CheckCircle2,
  Edit3,
} from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

const PRESET_COLORS = [
  { label: "Teal", value: "#14B8A6" },
  { label: "Blue", value: "#3B82F6" },
  { label: "Violet", value: "#8B5CF6" },
  { label: "Rose", value: "#F43F5E" },
  { label: "Amber", value: "#F59E0B" },
  { label: "Green", value: "#22C55E" },
  { label: "Cyan", value: "#22D3EE" },
  { label: "Slate", value: "#64748B" },
];

const SAMPLE_EVENTS = [
  {
    id: "evt-1",
    date: "2025-01-15",
    title: "Project Kickoff",
    description: "Initial team meeting and stakeholder alignment session to define scope and key deliverables.",
    color: "#14B8A6",
  },
  {
    id: "evt-2",
    date: "2025-03-01",
    title: "Prototype Complete",
    description: "First functional prototype delivered for internal review and usability testing.",
    color: "#3B82F6",
  },
  {
    id: "evt-3",
    date: "2025-06-10",
    title: "Beta Launch",
    description: "Public beta release to gather real-world feedback and identify edge cases.",
    color: "#8B5CF6",
  },
  {
    id: "evt-4",
    date: "2025-09-05",
    title: "Feature Freeze",
    description: "All feature development halted; focus shifts to bug fixes, performance, and polish.",
    color: "#F59E0B",
  },
  {
    id: "evt-5",
    date: "2025-12-01",
    title: "General Availability",
    description: "Full production release with official launch campaign and support channels live.",
    color: "#22C55E",
  },
];

function generateId() {
  return `evt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

// WCAG relative-luminance helper for picking legible text over an arbitrary
// swatch background. The badge background is a fixed brand color (one of
// PRESET_COLORS) independent of light/dark theme, so this is a local
// luminance check rather than a theme token.
function getContrastTextColor(hexColor) {
  if (!hexColor) return "#000000";
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const linearize = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const luminance = 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
  return luminance > 0.179 ? "#000000" : "#FFFFFF";
}

export default function TimelineBuilder() {
  const [events, setEvents] = useState(SAMPLE_EVENTS);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ date: "", title: "", description: "", color: "#14B8A6" });
  const [error, setError] = useState("");
  const { copy, isCopied, announcement } = useCopyToClipboard();

  const resetForm = useCallback(() => {
    setForm({ date: "", title: "", description: "", color: "#14B8A6" });
    setEditingId(null);
    setError("");
  }, []);

  const handleAddOrUpdate = useCallback(() => {
    const trimmed = {
      date: form.date.trim(),
      title: form.title.trim(),
      description: form.description.trim(),
      color: form.color,
    };
    if (!trimmed.date || !trimmed.title) {
      setError("Date and title are required.");
      return;
    }
    setError("");

    if (editingId) {
      setEvents((prev) =>
        prev.map((e) => (e.id === editingId ? { ...e, ...trimmed } : e))
      );
      resetForm();
    } else {
      setEvents((prev) => [...prev, { id: generateId(), ...trimmed }]);
      resetForm();
    }
  }, [form, editingId, resetForm]);

  const startEdit = useCallback((evt) => {
    setForm({ date: evt.date, title: evt.title, description: evt.description, color: evt.color });
    setEditingId(evt.id);
    setError("");
  }, []);

  const removeEvent = useCallback((id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    if (editingId === id) resetForm();
  }, [editingId, resetForm]);

  const moveEvent = useCallback((index, direction) => {
    setEvents((prev) => {
      const arr = [...prev];
      const target = index + direction;
      if (target < 0 || target >= arr.length) return arr;
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return arr;
    });
  }, []);

  const clearAll = useCallback(() => {
    if (
      events.length > 0 &&
      !window.confirm("Clear all events? This will permanently delete every event on the timeline and cannot be undone.")
    ) {
      return;
    }
    setEvents([]);
    resetForm();
  }, [events.length, resetForm]);

  const copyAsText = useCallback(async () => {
    if (!events.length) return;
    const lines = events.map((e, i) =>
      e.description
        ? `${i + 1}. [${formatDate(e.date)}] ${e.title}\n   ${e.description}`
        : `${i + 1}. [${formatDate(e.date)}] ${e.title}`
    );
    const text = `Timeline\n${"=".repeat(40)}\n\n${lines.join("\n\n")}`;
    await copy("timeline-text", text, { label: "Timeline" });
  }, [events, copy]);

  const downloadJson = useCallback(() => {
    if (!events.length) return;
    const blob = new Blob([JSON.stringify({ timeline: events }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "timeline.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [events]);

  const summary = useMemo(() => {
    const total = events.length;
    if (!total) return { total: 0, range: "—", milestones: 0 };
    const dates = events.map((e) => e.date).filter(Boolean).sort();
    const range = dates.length >= 2 ? `${dates[0]} → ${dates[dates.length - 1]}` : dates[0] || "—";
    const milestones = events.filter((e) => /milestone|launch|release|go-live|complete|done/i.test(e.title)).length;
    return { total, range, milestones };
  }, [events]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Milestone className="h-6 w-6 text-[var(--primary)]" />
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Timeline Builder</h1>
        </div>
        <p className="text-[var(--muted-foreground)]">
          Create visual timelines with milestones, dates, and descriptions for projects and events.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
          <p className="text-sm text-[var(--muted-foreground)]">Total Events</p>
          <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">{summary.total}</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
          <p className="text-sm text-[var(--muted-foreground)]">Date Range</p>
          <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">{summary.range}</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
          <p className="text-sm text-[var(--muted-foreground)]">Milestones</p>
          <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">{summary.milestones}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* Left Column — Form + Event List */}
        <div className="space-y-6 lg:col-span-2">
          {/* Add / Edit Form */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[var(--foreground)]">
              {editingId ? <Edit3 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editingId ? "Edit Event" : "Add Event"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Date *</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className="h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                  aria-label="Event date"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Event title"
                  className="h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                  aria-label="Event title"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description of this event"
                  rows={3}
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                  aria-label="Event description"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Color</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, color: c.value }))}
                      className={`h-7 w-7 rounded-full border-2 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--primary)] ${
                        form.color === c.value ? "border-[var(--foreground)] scale-110" : "border-transparent"
                      }`}
                      style={{ backgroundColor: c.value }}
                      aria-label={c.label}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-500" role="alert">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleAddOrUpdate}
                  className="btn-primary flex items-center gap-2 rounded-md px-5 py-2 text-sm font-semibold"
                >
                  {editingId ? <CheckCircle2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {editingId ? "Update" : "Add"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-secondary flex items-center gap-2 rounded-md px-5 py-2 text-sm font-semibold"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Event List */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Events ({events.length})</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={copyAsText}
                  disabled={!events.length}
                  className="btn-secondary flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
                  aria-label={isCopied("timeline-text") ? "Copied" : "Copy timeline as text"}
                >
                  {isCopied("timeline-text") ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}{" "}
                  {isCopied("timeline-text") ? "Copied!" : "Copy"}
                </button>
                <span className="sr-only" role="status" aria-live="polite">
                  {announcement}
                </span>
                <button
                  type="button"
                  onClick={downloadJson}
                  disabled={!events.length}
                  className="btn-secondary flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
                  aria-label="Download timeline as JSON"
                >
                  <Download className="h-3.5 w-3.5" /> JSON
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  disabled={!events.length}
                  className="btn-secondary flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold text-red-500 disabled:opacity-50"
                  aria-label="Clear all events"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Clear
                </button>
              </div>
            </div>

            {events.length === 0 ? (
              <p className="py-6 text-center text-sm text-[var(--muted-foreground)]">
                No events yet. Add your first event above.
              </p>
            ) : (
              <ul className="space-y-3" role="list">
                {events.map((evt, idx) => (
                  <li
                    key={evt.id}
                    className="flex items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                  >
                    <div className="flex flex-col gap-1 pt-1">
                      <button
                        type="button"
                        onClick={() => moveEvent(idx, -1)}
                        disabled={idx === 0}
                        className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] disabled:opacity-30"
                        aria-label="Move event up"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveEvent(idx, 1)}
                        disabled={idx === events.length - 1}
                        className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] disabled:opacity-30"
                        aria-label="Move event down"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div
                      className="mt-1.5 h-3.5 w-3.5 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: evt.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                        <span className="text-xs text-[var(--muted-foreground)]">{evt.date || "No date"}</span>
                      </div>
                      <p className="truncate text-sm font-semibold text-[var(--foreground)]">{evt.title}</p>
                      {evt.description && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-[var(--muted-foreground)]">{evt.description}</p>
                      )}
                    </div>
                    <div className="flex flex-shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(evt)}
                        className="rounded p-1 text-[var(--muted-foreground)] hover:text-[var(--primary)]"
                        aria-label={`Edit ${evt.title}`}
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeEvent(evt.id)}
                        className="rounded p-1 text-[var(--muted-foreground)] hover:text-red-500"
                        aria-label={`Delete ${evt.title}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right Column — Visual Timeline */}
        <div className="lg:col-span-3">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-[var(--foreground)]">
              <Flag className="h-4 w-4 text-[var(--primary)]" />
              Timeline View
            </h2>

            {events.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Milestone className="mb-3 h-10 w-10 text-[var(--muted-foreground)]" />
                <p className="text-sm text-[var(--muted-foreground)]">Add events to see your timeline.</p>
              </div>
            ) : (
              <div className="relative">
                {/* Vertical center line */}
                <div className="absolute left-5 top-0 bottom-0 hidden border-l-2 border-[var(--primary)] md:block" />
                <div className="absolute left-5 top-0 bottom-0 block border-l-2 border-[var(--primary)] md:hidden" />

                <div className="space-y-10">
                  {events.map((evt, idx) => {
                    const isLeft = idx % 2 === 0;
                    return (
                      <div key={evt.id} className="relative flex items-start md:flex-row">
                        {/* Dot — centered on line */}
                        <div className="absolute left-5 z-10 -translate-x-1/2 md:left-1/2 md:-translate-x-1/2">
                          <div className="flex items-center justify-center">
                            <div
                              className="h-4 w-4 rounded-full border-2 border-[var(--card)] shadow-[var(--anslation-ds-shadow-sm)]"
                              style={{ backgroundColor: evt.color }}
                            />
                          </div>
                        </div>

                        {/* Spacer on desktop to maintain layout */}
                        <div className="hidden w-1/2 md:block" />

                        {/* Event card */}
                        <div
                          className={`ml-12 w-full md:w-[calc(50%-2rem)] ${
                            isLeft ? "md:ml-0 md:mr-auto md:pr-8" : "md:ml-auto md:pl-8"
                          }`}
                        >
                          <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 shadow-[var(--anslation-ds-shadow-sm)] transition-shadow hover:shadow-md">
                            <div
                              className="mb-2 inline-block rounded-md px-2.5 py-1 text-xs font-semibold"
                              style={{ backgroundColor: evt.color, color: getContrastTextColor(evt.color) }}
                            >
                              <Calendar className="mr-1 inline h-3 w-3" aria-hidden="true" />
                              {formatDate(evt.date)}
                            </div>
                            <h3 className="text-base font-bold text-[var(--foreground)]">{evt.title}</h3>
                            {evt.description && (
                              <p className="mt-1 text-sm leading-relaxed text-[var(--muted-foreground)]">
                                {evt.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
