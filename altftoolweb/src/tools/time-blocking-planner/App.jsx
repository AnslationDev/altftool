"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import {
  AlarmClock,
  Archive,
  Bell,
  CalendarClock,
  CheckCircle2,
  Clipboard,
  Copy,
  Download,
  Filter,
  GripVertical,
  ListChecks,
  NotebookPen,
  Plus,
  Printer,
  RotateCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";

const STORAGE_KEY = "altftools:time-blocking-planner:v1";
const START_HOUR = 5;
const END_HOUR = 24;
const HOUR_HEIGHT = 88;
const MINUTES_PER_PIXEL = 60 / HOUR_HEIGHT;
const SNAP_MINUTES = 15;
const MIN_DURATION = 15;

const priorities = {
  High: "bg-rose-500/15 text-rose-500 border-rose-500/20",
  Medium: "bg-amber-500/15 text-amber-500 border-amber-500/20",
  Low: "bg-emerald-500/15 text-emerald-500 border-emerald-500/20",
};

const statuses = ["Planned", "Active", "Completed", "Missed", "Archived"];

const howItWorksSteps = [
  {
    title: "Create Blocks",
    description: "Add focused work, study, meeting, health, or personal blocks with start time, end time, and priority.",
    icon: CalendarClock,
  },
  {
    title: "Plan Timeline",
    description: "Drag and resize time blocks on the live schedule to build a realistic day around your available hours.",
    icon: ListChecks,
  },
  {
    title: "Track Progress",
    description: "Update each block status, review focus hours, monitor completion, and keep notes for the day.",
    icon: CheckCircle2,
  },
  {
    title: "Export Plan",
    description: "Copy, export, or print the planner summary with blocks, reminders, notes, and productivity details.",
    icon: Download,
  },
];

const defaultPlanner = {
  blocks: [],
  notes: "",
  filters: {
    query: "",
    category: "All",
    priority: "All",
    status: "All",
    sort: "time",
  },
  notificationsEnabled: false,
};

const emptyForm = {
  id: null,
  title: "",
  description: "",
  category: "Work",
  customCategory: "",
  priority: "Medium",
  status: "Planned",
  tags: "",
  notes: "",
  startTime: "09:00",
  endTime: "10:00",
  reminder: 10,
};

function sanitizePlanner(data) {
  const merged = { ...defaultPlanner, ...data };
  const blocks = Array.isArray(merged.blocks)
    ? merged.blocks.filter((block) => !String(block.id || "").startsWith("sample-"))
    : [];
  const sampleNote =
    "Daily intent: protect focus blocks, batch shallow tasks, and leave one recovery gap.";
  const normalizedNote = String(merged.notes || "").trim();

  return {
    ...merged,
    blocks,
    notes: normalizedNote === sampleNote ? "" : merged.notes || "",
    filters: { ...defaultPlanner.filters, ...(merged.filters || {}) },
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function snap(minutes) {
  return Math.round(minutes / SNAP_MINUTES) * SNAP_MINUTES;
}

function timeToMinutes(value) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(total) {
  const minutes = clamp(Math.round(total), 0, 24 * 60 - 1);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function formatTime(total) {
  const minutes = clamp(Math.round(total), 0, 24 * 60 - 1);
  const date = new Date();
  date.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function categoryLabel(block) {
  return block.category === "Custom" && block.customCategory
    ? block.customCategory
    : block.category;
}

function blockToForm(block) {
  return {
    ...block,
    startTime: minutesToTime(block.start),
    endTime: minutesToTime(block.end),
  };
}

function createSummary(blocks, notes) {
  const lines = blocks
    .filter((block) => block.status !== "Archived")
    .sort((a, b) => a.start - b.start)
    .map(
      (block) =>
        `${formatTime(block.start)} - ${formatTime(block.end)} | ${block.title} | ${categoryLabel(block)} | ${block.priority} | ${block.status}`,
    );
  return `Time Blocking Planner\n${new Date().toLocaleDateString()}\n\n${lines.join(
    "\n",
  )}\n\nNotes:\n${notes || "No notes"}`;
}

export default function TimeBlockingPlannerApp() {
  const [planner, setPlanner] = useState(() => {
    if (typeof window === "undefined") return defaultPlanner;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? sanitizePlanner(JSON.parse(saved)) : defaultPlanner;
    } catch {
      return defaultPlanner;
    }
  });
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState("");
  const [now, setNow] = useState(() => new Date());
  const timelineRef = useRef(null);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(planner));
  }, [planner]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => {
      clearInterval(timer);
      clearTimeout(toastTimerRef.current);
    };
  }, []);

  const notify = useCallback(
    (title, body) => {
      if (
        planner.notificationsEnabled &&
        typeof Notification !== "undefined" &&
        Notification.permission === "granted"
      ) {
        new Notification(title, { body });
      }
      setToast(`${title} - ${body}`);
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setToast(""), 5000);
    },
    [planner.notificationsEnabled],
  );

  useEffect(() => {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    planner.blocks.forEach((block) => {
      if (block.status === "Archived" || block.notified) return;
      const reminderAt = block.start - Number(block.reminder || 0);
      if (currentMinutes >= reminderAt && currentMinutes <= block.start + 1) {
        notify(`Upcoming: ${block.title}`, `${formatTime(block.start)} - ${formatTime(block.end)}`);
        setPlanner((current) => ({
          ...current,
          blocks: current.blocks.map((item) =>
            item.id === block.id ? { ...item, notified: true } : item,
          ),
        }));
      }
    });
  }, [now, planner.blocks, notify]);

  const filteredBlocks = useMemo(() => {
    const q = planner.filters.query.trim().toLowerCase();
    const list = planner.blocks.filter((block) => {
      const text = `${block.title} ${block.description} ${block.tags} ${block.notes}`.toLowerCase();
      return (
        (block.status !== "Archived" || planner.filters.status === "Archived") &&
        (!q || text.includes(q)) &&
        (planner.filters.category === "All" || block.category === planner.filters.category) &&
        (planner.filters.priority === "All" || block.priority === planner.filters.priority) &&
        (planner.filters.status === "All" || block.status === planner.filters.status)
      );
    });
    return [...list].sort((a, b) => {
      if (planner.filters.sort === "priority") {
        const order = { High: 0, Medium: 1, Low: 2 };
        return order[a.priority] - order[b.priority] || a.start - b.start;
      }
      if (planner.filters.sort === "status") {
        return a.status.localeCompare(b.status) || a.start - b.start;
      }
      return a.start - b.start;
    });
  }, [planner.blocks, planner.filters]);

  const dashboard = useMemo(() => {
    const activeBlocks = planner.blocks.filter((block) => block.status !== "Archived");
    const completed = activeBlocks.filter((block) => block.status === "Completed").length;
    const pending = activeBlocks.filter((block) => ["Planned", "Active"].includes(block.status)).length;
    const totalMinutes = activeBlocks.reduce((sum, block) => sum + (block.end - block.start), 0);
    const doneMinutes = activeBlocks
      .filter((block) => block.status === "Completed")
      .reduce((sum, block) => sum + (block.end - block.start), 0);
    return {
      total: activeBlocks.length,
      completed,
      pending,
      focusHours: (totalMinutes / 60).toFixed(1),
      progress: activeBlocks.length ? Math.round((completed / activeBlocks.length) * 100) : 0,
      doneHours: (doneMinutes / 60).toFixed(1),
    };
  }, [planner.blocks]);

  const summary = useMemo(
    () => createSummary(planner.blocks, planner.notes),
    [planner.blocks, planner.notes],
  );

  async function enableNotifications() {
    if (typeof Notification === "undefined") {
      setMessage("Browser notifications are not supported here, so in-app reminders will be used.");
      return;
    }
    const permission = await Notification.requestPermission();
    setPlanner((current) => ({
      ...current,
      notificationsEnabled: permission === "granted",
    }));
    setMessage(
      permission === "granted"
        ? "Browser reminders enabled. In-app reminders remain active too."
        : "Notification permission was not granted. In-app reminders will still work.",
    );
  }

  function updateFilter(field, value) {
    setPlanner((current) => ({
      ...current,
      filters: { ...current.filters, [field]: value },
    }));
  }

  function validate(nextForm) {
    const title = nextForm.title.trim();
    const start = timeToMinutes(nextForm.startTime);
    const end = timeToMinutes(nextForm.endTime);
    if (!title) return "Task title is required.";
    if (end <= start) return "End time must be after start time.";
    if (start < START_HOUR * 60 || end > END_HOUR * 60) {
      return "Choose a time between 5:00 AM and midnight.";
    }
    return "";
  }

  function saveBlock(event) {
    event.preventDefault();
    const error = validate(form);
    if (error) {
      setMessage(error);
      return;
    }
    const start = timeToMinutes(form.startTime);
    const end = timeToMinutes(form.endTime);
    const block = {
      id: form.id || makeId(),
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      customCategory: form.customCategory.trim().slice(0, 24),
      priority: form.priority,
      status: form.status,
      tags: form.tags.trim(),
      notes: form.notes.trim(),
      start,
      end,
      reminder: Number(form.reminder || 0),
      notified: false,
    };
    setPlanner((current) => ({
      ...current,
      blocks: form.id
        ? current.blocks.map((item) => (item.id === form.id ? block : item))
        : [block, ...current.blocks],
    }));
    setForm(emptyForm);
    setMessage(form.id ? "Block updated instantly." : "Time block created.");
  }

  function updateBlock(id, patch) {
    setPlanner((current) => ({
      ...current,
      blocks: current.blocks.map((block) =>
        block.id === id ? { ...block, ...patch, notified: false } : block,
      ),
    }));
  }

  function deleteBlock(id) {
    setPlanner((current) => ({
      ...current,
      blocks: current.blocks.filter((block) => block.id !== id),
    }));
  }

  function moveBlock(id, y, height) {
    const start = clamp(
      snap(START_HOUR * 60 + y * MINUTES_PER_PIXEL),
      START_HOUR * 60,
      END_HOUR * 60 - MIN_DURATION,
    );
    const duration = Math.max(MIN_DURATION, snap(height * MINUTES_PER_PIXEL));
    const end = clamp(start + duration, start + MIN_DURATION, END_HOUR * 60);
    updateBlock(id, { start, end });
  }

  async function copySummary() {
    await navigator.clipboard.writeText(summary);
    setMessage("Planner summary copied.");
  }

  function exportSummary() {
    const blob = new Blob([summary], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "time-blocking-planner.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  function resetPlanner() {
    setPlanner(defaultPlanner);
    setForm(emptyForm);
    setMessage("Planner cleared.");
  }

  return (
    <div className="time-blocking-planner min-h-screen overflow-x-hidden bg-(--background) px-4 py-6 font-secondary text-(--foreground)">
      <div className="mx-auto space-y-6">
        <header className="mb-5 overflow-hidden bg-(--background) text-center text-(--primary)">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-5">
            <div className="min-w-0">
              <h1 className="heading mx-auto flex max-w-4xl justify-center gap-2 break-words">
                Time Blocking Planner
              </h1>
              <p className="description mt-1 mb-1 text-(--secondary)">
                Plan focused blocks, reminders, and daily progress in one workspace
              </p>
            </div>
            <div className="grid w-full max-w-2xl min-w-0 grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat label="Blocks" value={dashboard.total} />
              <Stat label="Done" value={dashboard.completed} />
              <Stat label="Focus hrs" value={dashboard.focusHours} />
              <Stat label="Progress" value={`${dashboard.progress}%`} />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl overflow-hidden rounded-xl bg-(--card) py-5 shadow-lg">
          <div className="space-y-5 p-4 sm:p-6">
            {(message || toast) && (
              <div className="flex items-start justify-between gap-3 rounded-xl border border-(--border) bg-(--background) px-3 py-2 text-sm font-semibold text-(--primary)">
                <span className="min-w-0 break-words">{toast || message}</span>
                <button onClick={() => { setMessage(""); setToast(""); }} className="shrink-0 rounded-full p-1 hover:bg-(--secondary-hover)">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)_minmax(0,340px)]">
              <div className="space-y-5">
                <Panel title={form.id ? "Edit Time Block" : "Create Time Block"} icon={Plus}>
                  <form onSubmit={saveBlock} className="space-y-3">
                <Field label="Task title" value={form.title} onChange={(value) => setForm({ ...form, title: value })} placeholder="Deep Work" />
                <Field label="Description" value={form.description} onChange={(value) => setForm({ ...form, description: value })} textarea placeholder="What should happen in this block?" />
                <div className="grid grid-cols-2 gap-3">
                  <Select label="Category" value={form.category} onChange={(value) => setForm({ ...form, category: value })} options={["Work", "Study", "Meeting", "Health", "Personal", "Custom"]} />
                  <Select label="Priority" value={form.priority} onChange={(value) => setForm({ ...form, priority: value })} options={Object.keys(priorities)} />
                </div>
                {form.category === "Custom" && (
                  <Field label="Custom category" value={form.customCategory} onChange={(value) => setForm({ ...form, customCategory: value })} placeholder="Admin" />
                )}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Start" type="time" value={form.startTime} onChange={(value) => setForm({ ...form, startTime: value })} />
                  <Field label="End" type="time" value={form.endTime} onChange={(value) => setForm({ ...form, endTime: value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Select label="Status" value={form.status} onChange={(value) => setForm({ ...form, status: value })} options={statuses} />
                  <Field label="Reminder min" type="number" value={form.reminder} onChange={(value) => setForm({ ...form, reminder: value })} />
                </div>
                <Field label="Tags" value={form.tags} onChange={(value) => setForm({ ...form, tags: value })} placeholder="focus, client" />
                <Field label="Notes" value={form.notes} onChange={(value) => setForm({ ...form, notes: value })} textarea placeholder="Session comments and reminders" />
                <div className="grid grid-cols-2 gap-2">
                  <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-(--primary) px-3 py-2 text-sm font-bold text-(--primary-foreground) transition hover:bg-(--primary-hover)">
                    <Plus className="h-4 w-4" /> {form.id ? "Update" : "Create"}
                  </button>
                  <button type="button" onClick={() => setForm(emptyForm)} className="rounded-xl border border-(--border) bg-(--background) px-3 py-2 text-sm font-bold text-(--foreground) transition hover:border-(--primary) hover:text-(--primary)">
                    Clear
                  </button>
                </div>
                  </form>
                </Panel>

                <Panel title="Search & Filters" icon={Filter}>
              <div className="relative">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <input
                  value={planner.filters.query}
                  onChange={(event) => updateFilter("query", event.target.value)}
                  placeholder="Search title, notes, tags"
                  className="w-full rounded-lg border border-(--border) bg-(--background) py-2 pl-10 pr-3 text-sm outline-none transition focus:border-(--primary)"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Select label="Category" value={planner.filters.category} onChange={(value) => updateFilter("category", value)} options={["All", "Work", "Study", "Meeting", "Health", "Personal", "Custom"]} />
                <Select label="Priority" value={planner.filters.priority} onChange={(value) => updateFilter("priority", value)} options={["All", ...Object.keys(priorities)]} />
                <Select label="Status" value={planner.filters.status} onChange={(value) => updateFilter("status", value)} options={["All", ...statuses]} />
                <Select label="Sort" value={planner.filters.sort} onChange={(value) => updateFilter("sort", value)} options={["time", "priority", "status"]} />
              </div>
                </Panel>
              </div>

              <Panel title="" icon={CalendarClock} className="min-h-[760px] border-0 bg-transparent p-0 shadow-none" hideHeader>
            <div ref={timelineRef} className="custom-scrollbar relative h-[760px] min-w-0 overflow-y-auto rounded-xl bg-transparent p-3">
              <div className="relative min-w-0" style={{ height: (END_HOUR - START_HOUR) * HOUR_HEIGHT }}>
                {filteredBlocks.map((block) => {
                  const top = (block.start - START_HOUR * 60) / MINUTES_PER_PIXEL;
                  const height = Math.max(34, (block.end - block.start) / MINUTES_PER_PIXEL);
                  return (
                    <Rnd
                      key={block.id}
                      bounds="parent"
                      size={{ width: "calc(100% - 8px)", height }}
                      position={{ x: 4, y: top }}
                      dragGrid={[1, HOUR_HEIGHT / 4]}
                      resizeGrid={[1, HOUR_HEIGHT / 4]}
                      minHeight={MIN_DURATION / MINUTES_PER_PIXEL}
                      enableResizing={{ bottom: true, top: true }}
                      onDragStop={(event, data) => moveBlock(block.id, data.y, height)}
                      onResizeStop={(event, direction, ref, delta, position) => moveBlock(block.id, position.y, ref.offsetHeight)}
                      className="z-20"
                    >
                      <div className="group flex h-full min-h-0 overflow-hidden rounded-xl border border-(--border) bg-(--card) p-3 text-(--foreground) shadow-md transition duration-200 hover:border-(--primary) hover:shadow-lg">
                        <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
                          <div className="flex min-w-0 items-start justify-between gap-2">
                            <div className="min-w-0">
                            <div className="flex min-w-0 items-center gap-2">
                                <GripVertical className="h-4 w-4 shrink-0 text-(--muted-foreground)" />
                                <h3 className="truncate text-base font-black leading-tight" title={block.title}>{block.title}</h3>
                              </div>
                              <div className="mt-1 truncate text-[10px] font-black uppercase tracking-widest text-(--muted-foreground)" title={categoryLabel(block)}>
                                {categoryLabel(block)}
                              </div>
                              <p className="mt-1 line-clamp-2 break-words text-xs font-medium text-(--muted-foreground)">{block.description || block.notes || "No description added."}</p>
                            </div>
                            <div className="flex shrink-0 gap-1">
                              <button onClick={() => setForm(blockToForm(block))} className="rounded-lg border border-(--border) bg-(--background) px-2 py-1 text-[10px] font-black text-(--foreground) hover:border-(--primary) hover:text-(--primary)">Edit</button>
                              <button onClick={() => deleteBlock(block.id)} className="rounded-lg border border-(--border) bg-(--background) p-1.5 text-(--foreground) hover:border-(--primary) hover:text-(--primary)" aria-label="Delete block"><Trash2 className="h-3.5 w-3.5" /></button>
                            </div>
                          </div>
                          <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2 text-[10px] font-bold">
                            <span className="rounded-full border border-(--border) bg-(--background) px-2 py-1 text-(--foreground)">{formatTime(block.start)} - {formatTime(block.end)}</span>
                            <span className={`rounded-full border px-2 py-1 ${priorities[block.priority]}`}>{block.priority}</span>
                            <StatusSelect value={block.status} onChange={(value) => updateBlock(block.id, { status: value })} />
                          </div>
                        </div>
                      </div>
                    </Rnd>
                  );
                })}
              </div>
            </div>
              </Panel>

              <div className="min-w-0 space-y-4">
                <Panel title="Reminder System" icon={Bell}>
                  <button onClick={enableNotifications} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-(--primary) px-3 py-2 text-sm font-bold text-(--primary-foreground) transition hover:bg-(--primary-hover)">
                <Bell className="h-4 w-4" /> Enable notifications
              </button>
              <div className="space-y-2">
                {planner.blocks
                  .filter((block) => block.status !== "Archived")
                  .sort((a, b) => a.start - b.start)
                  .slice(0, 6)
                  .map((block) => (
                    <div key={`reminder-${block.id}`} className="min-w-0 rounded-lg border border-(--border) bg-(--background) p-2.5">
                      <div className="truncate text-sm font-black" title={block.title}>{block.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Reminder {block.reminder} min before {formatTime(block.start)}
                      </div>
                    </div>
                  ))}
              </div>
                </Panel>

                <Panel title="Notes Workspace" icon={NotebookPen}>
              <textarea
                value={planner.notes}
                onChange={(event) => setPlanner((current) => ({ ...current, notes: event.target.value }))}
                className="block min-h-44 w-full max-w-full resize-y rounded-lg border border-(--border) bg-(--background) p-3 text-sm leading-relaxed text-(--foreground) outline-none transition placeholder:text-(--muted-foreground) focus:border-(--primary)"
                placeholder="Planning notes, focus rules, session comments..."
              />
                </Panel>

                <Panel title="Export / Print" icon={Download}>
              <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2">
                <button onClick={copySummary} className="inline-flex min-w-0 items-center justify-center gap-2 rounded-xl bg-(--primary) px-3 py-2 text-sm font-bold text-(--primary-foreground) transition hover:bg-(--primary-hover)">
                  <Copy className="h-4 w-4 shrink-0" /> <span className="min-w-0 truncate">Copy</span>
                </button>
                <button onClick={exportSummary} className="inline-flex min-w-0 items-center justify-center gap-2 rounded-xl border border-(--border) bg-(--background) px-3 py-2 text-sm font-bold text-(--foreground) transition hover:border-(--primary) hover:text-(--primary)">
                  <Clipboard className="h-4 w-4 shrink-0" /> <span className="min-w-0 truncate">Export</span>
                </button>
                <button onClick={() => window.print()} className="inline-flex min-w-0 items-center justify-center gap-2 rounded-xl border border-(--border) bg-(--background) px-3 py-2 text-sm font-bold text-(--foreground) transition hover:border-(--primary) hover:text-(--primary)">
                  <Printer className="h-4 w-4 shrink-0" /> <span className="min-w-0 truncate">Print</span>
                </button>
                <button onClick={resetPlanner} className="inline-flex min-w-0 items-center justify-center gap-2 rounded-xl border border-(--border) bg-(--background) px-3 py-2 text-sm font-bold text-(--foreground) transition hover:border-(--primary) hover:text-(--primary)">
                  <RotateCcw className="h-4 w-4 shrink-0" /> <span className="min-w-0 truncate">Reset</span>
                </button>
              </div>
                </Panel>
              </div>
            </section>
          </div>
        </main>

        <HowItWorks />
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
        .custom-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(148, 163, 184, 0.08);
          border-radius: 999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(34, 211, 238, 0.35);
          border-radius: 999px;
        }
        @media print {
          header,
          form,
          button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function Panel({ title, icon: Icon, children, className = "", hideHeader = false }) {
  return (
    <section className={`min-w-0 overflow-hidden rounded-2xl border border-(--border) bg-(--card) p-3 shadow-md sm:p-4 ${className}`}>
      {!hideHeader && (
        <div className="mb-2.5 flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-(--muted) text-(--primary)">
            <Icon className="h-4.5 w-4.5" />
          </div>
          <h2 className="min-w-0 break-words text-xs font-black uppercase leading-relaxed tracking-[.16em]">{title}</h2>
        </div>
      )}
      <div className="min-w-0 space-y-3">{children}</div>
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div className="min-w-0 rounded-xl border border-(--border) bg-(--card) px-2.5 py-2 shadow-sm transition hover:bg-(--card-hover-bg)">
      <div className="break-words text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 break-words text-xl font-black leading-tight">{value}</div>
    </div>
  );
}

function HowItWorks() {
  return (
    <section>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {howItWorksSteps.map((step, index) => (
          <div
            key={step.title}
            className="min-w-0 rounded-2xl border border-(--border) bg-(--card) p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-(--muted) text-(--primary)">
                <step.icon className="h-5 w-5" />
              </div>
              <span className="shrink-0 rounded-full border border-(--border) bg-(--background) px-3 py-1 text-[10px] font-black uppercase tracking-widest text-(--foreground)">
                Step {index + 1}
              </span>
            </div>
            <h3 className="text-lg font-bold text-(--foreground)">{step.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-(--muted-foreground)">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Field({ label, value, onChange, placeholder = "", textarea = false, type = "text" }) {
  const base = "w-full rounded-lg border border-(--border) bg-(--background) px-3 py-1.5 text-sm outline-none transition placeholder:text-muted-foreground focus:border-(--primary)";
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[.16em] text-muted-foreground">{label}</span>
      {textarea ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={`${base} min-h-16 resize-y`} />
      ) : (
        <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={base} />
      )}
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[.16em] text-muted-foreground">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-1.5 text-sm outline-none transition focus:border-(--primary)">
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function StatusSelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="max-w-[118px] rounded-full border border-(--border) bg-(--background) px-2 py-1 text-[10px] font-bold text-(--foreground) outline-none"
    >
      {statuses.map((status) => (
        <option key={status} value={status}>{status}</option>
      ))}
    </select>
  );
}

