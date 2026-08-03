"use client";

import { useEffect, useMemo, useState } from "react";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";

const PRESET_OCCASIONS = [
  { title: "Mom Birthday", category: "family", date: "", recurrence: "yearly", remindBeforeDays: "14", notes: "Gift + dinner", priority: "high" },
  { title: "Rent Payment", category: "finance", date: "", recurrence: "monthly", remindBeforeDays: "3", notes: "Transfer before due date", priority: "high" },
  { title: "Team Anniversary", category: "work", date: "", recurrence: "yearly", remindBeforeDays: "7", notes: "Post announcement", priority: "medium" },
];

function blankOccasion(id) {
  return {
    id,
    title: "",
    category: "personal",
    date: "",
    recurrence: "yearly",
    remindBeforeDays: "7",
    notes: "",
    priority: "medium",
    completed: false,
    // Event date (YYYY-MM-DD) this occasion was last marked complete for.
    // Lets recurring occasions auto re-arm once nextOccurrence rolls past it.
    completedFor: "",
  };
}

// Parses a YYYY-MM-DD string as a LOCAL calendar date (not UTC midnight, which
// is how `new Date("YYYY-MM-DD")` parses it). Mixing UTC-parsed dates with a
// local `now` is what caused recurring occasions dated "today" to be reported
// as due next cycle for most timezones.
function parseLocalDate(dateStr) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateStr || ""));
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

// Advances `candidate` by one recurrence cycle in place, clamping to the
// original day-of-month so a Jan 31 monthly occasion lands on Feb 28/29,
// then Mar 31, then Apr 30 - instead of permanently drifting once JS
// overflows a short month (e.g. "Feb 31" normalizing to Mar 2/3).
function advanceOneCycle(candidate, recurrence, originalDay) {
  if (recurrence === "monthly") {
    const totalMonths = candidate.getFullYear() * 12 + candidate.getMonth() + 1;
    const year = Math.floor(totalMonths / 12);
    const monthIndex = totalMonths % 12;
    candidate.setFullYear(year, monthIndex, Math.min(originalDay, daysInMonth(year, monthIndex)));
  } else {
    const year = candidate.getFullYear() + 1;
    candidate.setFullYear(year, candidate.getMonth(), Math.min(originalDay, daysInMonth(year, candidate.getMonth())));
  }
}

function nextOccurrence(dateStr, recurrence) {
  const base = parseLocalDate(dateStr);
  if (!base) return "";
  if (recurrence === "once") return dateStr;

  const originalDay = base.getDate();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const candidate = new Date(base);
  while (candidate < today) {
    advanceOneCycle(candidate, recurrence, originalDay);
  }
  return formatLocalDate(candidate);
}

function diffDays(fromDate, toDate) {
  const a = new Date(fromDate);
  const b = new Date(toDate);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return null;
  return Math.floor((b - a) / (1000 * 60 * 60 * 24));
}

export default function ToolHome() {
  const [occasions, setOccasions] = useState([blankOccasion(1)]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const updateOccasion = (id, key, value) => setOccasions((prev) => prev.map((o) => (o.id === id ? { ...o, [key]: value } : o)));
  // Use max-existing-id + 1 (not prev.length + 1) so a new row's id can never
  // collide with a surviving id after a middle row was removed.
  const addOccasion = () =>
    setOccasions((prev) => [
      ...prev,
      blankOccasion(prev.reduce((maxId, o) => Math.max(maxId, o.id), 0) + 1),
    ]);
  const removeOccasion = (id) => setOccasions((prev) => (prev.length === 1 ? prev : prev.filter((o) => o.id !== id)));
  const toggleCompleted = (id) =>
    setOccasions((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const completed = !o.completed;
        return {
          ...o,
          completed,
          completedFor: completed ? nextOccurrence(o.date, o.recurrence) : "",
        };
      }),
    );
  const loadPresetPack = () => {
    const hasData = occasions.some((o) => o.title.trim() || o.date || o.notes.trim());
    if (
      hasData &&
      !window.confirm(
        "Load the preset pack? This replaces all current occasions with the three example entries and cannot be undone.",
      )
    ) {
      return;
    }
    setOccasions(PRESET_OCCASIONS.map((o, i) => ({ ...blankOccasion(i + 1), ...o })));
  };

  // Recurring occasions marked "Completed" should only stay Completed for the
  // cycle they were checked off for. Once nextOccurrence rolls past that
  // date (a new cycle has begun), automatically re-arm the reminder instead
  // of leaving it permanently frozen at Completed.
  useEffect(() => {
    setOccasions((prev) => {
      let changed = false;
      const next = prev.map((o) => {
        if (!o.completed || o.recurrence === "once" || !o.completedFor) return o;
        const current = nextOccurrence(o.date, o.recurrence);
        if (o.completedFor === current) return o;
        changed = true;
        return { ...o, completed: false, completedFor: "" };
      });
      return changed ? next : prev;
    });
  }, [occasions]);

  const summary = useMemo(() => {
    const today = formatLocalDate(new Date());

    const enriched = occasions.map((o) => {
      const eventDate = nextOccurrence(o.date, o.recurrence);
      const daysToEvent = eventDate ? diffDays(today, eventDate) : null;
      const reminderLeadRaw = Number(o.remindBeforeDays);
      const reminderLead = Number.isFinite(reminderLeadRaw) ? reminderLeadRaw : 0;
      const reminderDate = eventDate ? new Date(new Date(eventDate).getTime() - reminderLead * 86400000).toISOString().slice(0, 10) : "";
      const daysToReminder = reminderDate ? diffDays(today, reminderDate) : null;

      // A recurring occasion only counts as Completed for the specific cycle
      // it was checked off for; once nextOccurrence has rolled past that
      // date, treat it as active again (the useEffect above also clears the
      // stored flag so the checkbox itself re-arms within a render).
      const isCompletedForCurrentCycle =
        o.completed && (o.recurrence === "once" || o.completedFor === eventDate);

      const status = isCompletedForCurrentCycle
        ? "Completed"
        : !eventDate
        ? "Need Date"
        : daysToEvent < 0
        ? "Missed"
        : daysToEvent === 0
        ? "Today"
        : daysToEvent <= 7
        ? "This Week"
        : "Upcoming";

      const priorityScore = (o.priority === "high" ? 30 : o.priority === "medium" ? 15 : 5) + (status === "Today" ? 30 : 0) + (status === "This Week" ? 20 : 0);

      return { ...o, eventDate, reminderDate, daysToEvent, daysToReminder, status, priorityScore };
    });

    const filtered = enriched.filter((e) => {
      const byStatus = statusFilter === "all" || e.status === statusFilter;
      const byCategory = categoryFilter === "all" || e.category === categoryFilter;
      return byStatus && byCategory;
    });

    // Each occasion has exactly one status, so every tile below counts its
    // own exact status only - this keeps the tiles reconciling with each
    // other (they now sum to the total occasion count) and with the status
    // filter dropdown, which also matches on the exact status string.
    const upcoming = enriched.filter((e) => e.status === "Upcoming").length;
    const todayCount = enriched.filter((e) => e.status === "Today").length;
    const missed = enriched.filter((e) => e.status === "Missed").length;
    const completed = enriched.filter((e) => e.status === "Completed").length;
    const dueThisWeek = enriched.filter((e) => e.status === "This Week").length;

    const nextActions = [...enriched]
      .filter((e) => e.title)
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, 6)
      .map((e) => {
        if (!e.eventDate) return `Add date for ${e.title}.`;
        if (e.status === "Completed") return `${e.title} completed. Update next cycle details if needed.`;
        if (e.status === "Today") return `${e.title} is today. Execute checklist now.`;
        if (e.status === "Missed") return `${e.title} was missed. Reschedule/follow up immediately.`;
        if ((e.daysToReminder ?? 9999) <= 0) return `Reminder window open for ${e.title}. Start preparations now.`;
        return `${e.title}: prep starts in ${e.daysToReminder} day(s), event in ${e.daysToEvent} day(s).`;
      });

    return { enriched, filtered, upcoming, todayCount, missed, completed, dueThisWeek, nextActions };
  }, [occasions, statusFilter, categoryFilter]);

  const exportJSON = () => {
    const payload = { generatedAt: new Date().toISOString(), occasions: summary.enriched };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "occasion-reminders.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const header = "title,category,event_date,reminder_date,status,priority,notes";
    const rows = summary.enriched.map((e) => `"${e.title}","${e.category}","${e.eventDate || ""}","${e.reminderDate || ""}","${e.status}","${e.priority}","${(e.notes || "").replace(/"/g, '""')}"`);
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "occasion-reminders.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="px-4 py-6 bg-(--background) text-(--foreground)">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="heading animate-fade-up">Occasion Reminder</h1>
          <p className="description mt-1 text-(--secondary) text-2xl animate-fade-up">
            Track occasions, recurring dates, and reminder windows so important moments are never missed.
          </p>
        </div>

        <div className="rounded-2xl border border-(--border) bg-(--card) shadow-lg overflow-hidden">
          <div className="p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-bold">Occasion Planner</h2>
              <div className="flex gap-2">
                <button onClick={loadPresetPack} className="px-4 py-2 rounded-lg border border-(--border) bg-(--background) font-semibold">Load Preset Pack</button>
                <button onClick={exportJSON} className="px-4 py-2 rounded-lg border border-(--border) bg-(--background) font-semibold">Export JSON</button>
                <button onClick={exportCSV} className="px-4 py-2 rounded-lg border border-(--border) bg-(--background) font-semibold">Export CSV</button>
                <button onClick={addOccasion} className="px-4 py-2 rounded-lg bg-(--primary) text-white font-semibold">+ Add Occasion</button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-(--border) bg-(--background)">
                <option value="all">All Status</option>
                <option value="Upcoming">Upcoming</option>
                <option value="This Week">This Week</option>
                <option value="Today">Today</option>
                <option value="Missed">Missed</option>
                <option value="Completed">Completed</option>
                <option value="Need Date">Need Date</option>
              </select>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-(--border) bg-(--background)">
                <option value="all">All Categories</option>
                <option value="personal">Personal</option>
                <option value="family">Family</option>
                <option value="work">Work</option>
                <option value="finance">Finance</option>
              </select>
            </div>

            <div className="space-y-4">
              {occasions.map((o, idx) => (
                <div key={o.id} className="rounded-xl border border-(--border) bg-(--background) p-4">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <input value={o.title} onChange={(e) => updateOccasion(o.id, "title", e.target.value)} placeholder={`Occasion ${idx + 1} title`} className="w-full max-w-sm px-3 py-2 rounded-lg border border-(--border) bg-(--card)" />
                    <label className="text-xs flex items-center gap-1"><input type="checkbox" checked={o.completed} onChange={() => toggleCompleted(o.id)} /> Completed</label>
                    <button onClick={() => removeOccasion(o.id)} className="px-3 py-2 rounded-lg border border-(--border)">Remove</button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                    <select
                      aria-label={`Category for ${o.title || `occasion ${idx + 1}`}`}
                      value={o.category}
                      onChange={(e) => updateOccasion(o.id, "category", e.target.value)}
                      className="px-3 py-2 rounded-lg border border-(--border) bg-(--card)"
                    >
                      <option value="personal">Personal</option>
                      <option value="family">Family</option>
                      <option value="work">Work</option>
                      <option value="finance">Finance</option>
                    </select>
                    <input
                      type="date"
                      aria-label={`Event date for ${o.title || `occasion ${idx + 1}`}`}
                      value={o.date}
                      onChange={(e) => updateOccasion(o.id, "date", e.target.value)}
                      className="px-3 py-2 rounded-lg border border-(--border) bg-(--card)"
                    />
                    <select
                      aria-label={`Recurrence for ${o.title || `occasion ${idx + 1}`}`}
                      value={o.recurrence}
                      onChange={(e) => updateOccasion(o.id, "recurrence", e.target.value)}
                      className="px-3 py-2 rounded-lg border border-(--border) bg-(--card)"
                    >
                      <option value="once">One Time</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      inputMode="numeric"
                      value={o.remindBeforeDays}
                      onChange={(e) => updateOccasion(o.id, "remindBeforeDays", e.target.value)}
                      placeholder="Remind days before"
                      className="px-3 py-2 rounded-lg border border-(--border) bg-(--card)"
                    />
                    <select
                      aria-label={`Priority for ${o.title || `occasion ${idx + 1}`}`}
                      value={o.priority}
                      onChange={(e) => updateOccasion(o.id, "priority", e.target.value)}
                      className="px-3 py-2 rounded-lg border border-(--border) bg-(--card)"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    <input value={o.notes} onChange={(e) => updateOccasion(o.id, "notes", e.target.value)} placeholder="Notes" className="px-3 py-2 rounded-lg border border-(--border) bg-(--card)" />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4" role="status" aria-live="polite">
              <div className="rounded-xl border border-(--border) bg-(--background) p-4"><p className="text-xs uppercase text-(--muted-foreground)">Upcoming</p><p className="text-2xl font-bold text-emerald-600">{summary.upcoming}</p></div>
              <div className="rounded-xl border border-(--border) bg-(--background) p-4"><p className="text-xs uppercase text-(--muted-foreground)">Today</p><p className="text-2xl font-bold text-blue-600">{summary.todayCount}</p></div>
              <div className="rounded-xl border border-(--border) bg-(--background) p-4"><p className="text-xs uppercase text-(--muted-foreground)">This Week</p><p className="text-2xl font-bold text-indigo-600">{summary.dueThisWeek}</p></div>
              <div className="rounded-xl border border-(--border) bg-(--background) p-4"><p className="text-xs uppercase text-(--muted-foreground)">Missed</p><p className="text-2xl font-bold text-red-500">{summary.missed}</p></div>
              <div className="rounded-xl border border-(--border) bg-(--background) p-4"><p className="text-xs uppercase text-(--muted-foreground)">Completed</p><p className="text-2xl font-bold text-green-700">{summary.completed}</p></div>
            </div>

            <div className="rounded-xl border border-(--border) bg-(--background) p-4">
              <h3 className="font-semibold mb-3">Reminder Timeline</h3>
              <div className="overflow-x-auto" role="status" aria-live="polite">
                <table className="w-full text-sm">
                  <thead><tr className="text-left border-b border-(--border)"><th className="py-2">Occasion</th><th className="py-2">Category</th><th className="py-2">Next Date</th><th className="py-2">Reminder Date</th><th className="py-2">Priority</th><th className="py-2">Status</th></tr></thead>
                  <tbody>
                    {summary.filtered.map((e, i) => (
                      <tr key={e.id} className="border-b border-(--border)">
                        <td className="py-2">{e.title || `Occasion ${i + 1}`}</td>
                        <td className="py-2 capitalize">{e.category}</td>
                        <td className="py-2">{e.eventDate || "-"}</td>
                        <td className="py-2">{e.reminderDate || "-"}</td>
                        <td className="py-2 capitalize">{e.priority}</td>
                        <td className="py-2 font-medium">{e.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl border border-(--border) bg-(--background) p-4">
              <h3 className="font-semibold mb-2">Clear Next Steps</h3>
              <div className="space-y-1 text-sm" role="status" aria-live="polite">
                {summary.nextActions.length ? summary.nextActions.map((a) => <p key={a}>- {a}</p>) : <p className="text-(--muted-foreground)">Add occasions to generate action steps.</p>}
              </div>
            </div>
          </div>
        </div>

        <HowItWorks />
        <Features />
      </div>
    </div>
  );
}
