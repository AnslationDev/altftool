"use client";

import { useMemo, useState } from "react";
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
  };
}

function nextOccurrence(dateStr, recurrence) {
  if (!dateStr) return "";
  const now = new Date();
  const base = new Date(dateStr);
  if (Number.isNaN(base.getTime())) return "";
  if (recurrence === "once") return dateStr;

  const candidate = new Date(base);
  while (candidate < now) {
    if (recurrence === "monthly") candidate.setMonth(candidate.getMonth() + 1);
    else candidate.setFullYear(candidate.getFullYear() + 1);
  }
  return candidate.toISOString().slice(0, 10);
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
  const addOccasion = () => setOccasions((prev) => [...prev, blankOccasion(prev.length + 1)]);
  const removeOccasion = (id) => setOccasions((prev) => (prev.length === 1 ? prev : prev.filter((o) => o.id !== id)));
  const toggleCompleted = (id) => setOccasions((prev) => prev.map((o) => (o.id === id ? { ...o, completed: !o.completed } : o)));
  const loadPresetPack = () => setOccasions(PRESET_OCCASIONS.map((o, i) => ({ ...blankOccasion(i + 1), ...o })));

  const summary = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);

    const enriched = occasions.map((o) => {
      const eventDate = nextOccurrence(o.date, o.recurrence);
      const daysToEvent = eventDate ? diffDays(today, eventDate) : null;
      const reminderLead = Number(o.remindBeforeDays || 0);
      const reminderDate = eventDate ? new Date(new Date(eventDate).getTime() - reminderLead * 86400000).toISOString().slice(0, 10) : "";
      const daysToReminder = reminderDate ? diffDays(today, reminderDate) : null;

      const status = o.completed
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

    const upcoming = enriched.filter((e) => e.status === "Upcoming" || e.status === "This Week").length;
    const todayCount = enriched.filter((e) => e.status === "Today").length;
    const missed = enriched.filter((e) => e.status === "Missed").length;
    const completed = enriched.filter((e) => e.status === "Completed").length;
    const dueThisWeek = enriched.filter((e) => e.daysToEvent !== null && e.daysToEvent >= 0 && e.daysToEvent <= 7 && e.status !== "Completed").length;

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
                    <select value={o.category} onChange={(e) => updateOccasion(o.id, "category", e.target.value)} className="px-3 py-2 rounded-lg border border-(--border) bg-(--card)">
                      <option value="personal">Personal</option>
                      <option value="family">Family</option>
                      <option value="work">Work</option>
                      <option value="finance">Finance</option>
                    </select>
                    <input type="date" value={o.date} onChange={(e) => updateOccasion(o.id, "date", e.target.value)} className="px-3 py-2 rounded-lg border border-(--border) bg-(--card)" />
                    <select value={o.recurrence} onChange={(e) => updateOccasion(o.id, "recurrence", e.target.value)} className="px-3 py-2 rounded-lg border border-(--border) bg-(--card)">
                      <option value="once">One Time</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                    <input value={o.remindBeforeDays} onChange={(e) => updateOccasion(o.id, "remindBeforeDays", e.target.value)} placeholder="Remind days before" className="px-3 py-2 rounded-lg border border-(--border) bg-(--card)" />
                    <select value={o.priority} onChange={(e) => updateOccasion(o.id, "priority", e.target.value)} className="px-3 py-2 rounded-lg border border-(--border) bg-(--card)">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    <input value={o.notes} onChange={(e) => updateOccasion(o.id, "notes", e.target.value)} placeholder="Notes" className="px-3 py-2 rounded-lg border border-(--border) bg-(--card)" />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="rounded-xl border border-(--border) bg-(--background) p-4"><p className="text-xs uppercase text-(--muted-foreground)">Upcoming</p><p className="text-2xl font-bold text-emerald-600">{summary.upcoming}</p></div>
              <div className="rounded-xl border border-(--border) bg-(--background) p-4"><p className="text-xs uppercase text-(--muted-foreground)">Today</p><p className="text-2xl font-bold text-blue-600">{summary.todayCount}</p></div>
              <div className="rounded-xl border border-(--border) bg-(--background) p-4"><p className="text-xs uppercase text-(--muted-foreground)">This Week</p><p className="text-2xl font-bold text-indigo-600">{summary.dueThisWeek}</p></div>
              <div className="rounded-xl border border-(--border) bg-(--background) p-4"><p className="text-xs uppercase text-(--muted-foreground)">Missed</p><p className="text-2xl font-bold text-red-500">{summary.missed}</p></div>
              <div className="rounded-xl border border-(--border) bg-(--background) p-4"><p className="text-xs uppercase text-(--muted-foreground)">Completed</p><p className="text-2xl font-bold text-green-700">{summary.completed}</p></div>
            </div>

            <div className="rounded-xl border border-(--border) bg-(--background) p-4">
              <h3 className="font-semibold mb-3">Reminder Timeline</h3>
              <div className="overflow-x-auto">
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
              <div className="space-y-1 text-sm">
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
