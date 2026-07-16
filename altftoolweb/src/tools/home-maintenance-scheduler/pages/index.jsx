"use client";

import { useMemo, useState } from "react";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";

const FREQ_DAYS = {
  weekly: 7,
  biweekly: 14,
  monthly: 30,
  quarterly: 90,
  "half-yearly": 182,
  yearly: 365,
};

const PRESET_TASKS = [
  { name: "AC Filter Cleaning", category: "hvac", frequency: "monthly", estimatedHours: "1", estimatedCost: "400" },
  { name: "Water Tank Inspection", category: "plumbing", frequency: "quarterly", estimatedHours: "2", estimatedCost: "1500" },
  { name: "Smoke Detector Test", category: "safety", frequency: "monthly", estimatedHours: "0.5", estimatedCost: "200" },
  { name: "Roof Drain Cleaning", category: "exterior", frequency: "quarterly", estimatedHours: "2", estimatedCost: "1200" },
  { name: "Electrical Panel Check", category: "electrical", frequency: "half-yearly", estimatedHours: "2", estimatedCost: "1800" },
];

function addDays(dateStr, days) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function diffDays(fromDate, toDate) {
  const a = new Date(fromDate);
  const b = new Date(toDate);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 0;
  return Math.floor((b - a) / (1000 * 60 * 60 * 24));
}

function blankTask(id) {
  return {
    id,
    name: "",
    category: "hvac",
    frequency: "monthly",
    lastCompleted: "",
    estimatedHours: "",
    estimatedCost: "",
    notes: "",
    completed: false,
  };
}

function yearlyMultiplier(freq) {
  if (freq === "weekly") return 52;
  if (freq === "biweekly") return 26;
  if (freq === "monthly") return 12;
  if (freq === "quarterly") return 4;
  if (freq === "half-yearly") return 2;
  return 1;
}

export default function ToolHome() {
  const [tasks, setTasks] = useState([blankTask(1)]);
  const [statusFilter, setStatusFilter] = useState("all");

  const updateTask = (id, key, value) => setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, [key]: value } : t)));
  const addTask = () => setTasks((prev) => [...prev, blankTask(prev.length + 1)]);
  const removeTask = (id) => setTasks((prev) => (prev.length === 1 ? prev : prev.filter((t) => t.id !== id)));
  const toggleCompleted = (id) => setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));

  const loadPresetTasks = () => {
    setTasks(PRESET_TASKS.map((t, i) => ({ ...blankTask(i + 1), ...t })));
  };

  const exportPlan = () => {
    const payload = { exportedAt: new Date().toISOString(), tasks };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "home-maintenance-plan.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const summary = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);

    const enriched = tasks.map((task) => {
      const nextDue = addDays(task.lastCompleted, FREQ_DAYS[task.frequency]);
      const daysToDue = nextDue ? diffDays(today, nextDue) : null;
      const overdue = daysToDue !== null && daysToDue < 0;
      const dueSoon = daysToDue !== null && daysToDue >= 0 && daysToDue <= 7;
      const priorityScore = (overdue ? 50 : 0) + (dueSoon ? 20 : 0) + (task.category === "safety" ? 30 : 0) + (task.completed ? -40 : 0);
      const status = task.completed ? "Completed" : overdue ? "Overdue" : dueSoon ? "Due Soon" : nextDue ? "Scheduled" : "Need Date";
      const yearlyCost = Number(task.estimatedCost || 0) * yearlyMultiplier(task.frequency);
      return { ...task, nextDue, daysToDue, status, priorityScore, yearlyCost };
    });

    const filtered = statusFilter === "all" ? enriched : enriched.filter((t) => t.status === statusFilter);
    const overdueCount = enriched.filter((t) => t.status === "Overdue").length;
    const dueSoonCount = enriched.filter((t) => t.status === "Due Soon").length;
    const scheduledCount = enriched.filter((t) => t.status === "Scheduled").length;
    const completedCount = enriched.filter((t) => t.status === "Completed").length;
    const totalHours = enriched.reduce((a, t) => a + Number(t.estimatedHours || 0), 0);
    const totalCost = enriched.reduce((a, t) => a + Number(t.estimatedCost || 0), 0);
    const annualBudget = enriched.reduce((a, t) => a + t.yearlyCost, 0);

    const monthlyBuckets = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, count: 0 }));
    enriched.forEach((t) => {
      if (!t.nextDue) return;
      monthlyBuckets[new Date(t.nextDue).getMonth()].count += 1;
    });

    const nextActions = [...enriched]
      .filter((t) => t.name && t.status !== "Completed")
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, 5)
      .map((t) => `${t.name} (${t.category}) - ${t.status}${t.nextDue ? `, due ${t.nextDue}` : ""}`);

    return { enriched, filtered, overdueCount, dueSoonCount, scheduledCount, completedCount, totalHours, totalCost, annualBudget, monthlyBuckets, nextActions };
  }, [tasks, statusFilter]);

  return (
    <div className="px-4 py-6 hms-shell">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="heading animate-fade-up">Home Maintenance Scheduler</h1>
          <p className="description mt-1 text-(--secondary) text-2xl animate-fade-up">
            Plan recurring home maintenance tasks with clear due dates, priorities, effort, and budget.
          </p>
        </div>

        <div className="rounded-2xl hms-main-card overflow-hidden">
          <div className="p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-bold">Maintenance Tasks</h2>
              <div className="flex gap-2">
                <button onClick={loadPresetTasks} className="px-4 py-2 rounded-lg hms-field font-semibold">Load Preset Pack</button>
                <button onClick={exportPlan} className="px-4 py-2 rounded-lg hms-field font-semibold">Export JSON</button>
                <button onClick={addTask} className="px-4 py-2 rounded-lg font-semibold hms-btn-primary">+ Add Task</button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Filter:</p>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 hms-field">
                <option value="all">All</option>
                <option value="Overdue">Overdue</option>
                <option value="Due Soon">Due Soon</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Need Date">Need Date</option>
              </select>
            </div>

            <div className="space-y-4">
              {tasks.map((task, idx) => (
                <div key={task.id} className="rounded-xl hms-panel p-4">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <input value={task.name} onChange={(e) => updateTask(task.id, "name", e.target.value)} placeholder={`Task ${idx + 1} name`} className="w-full max-w-sm px-3 py-2 hms-field" />
                    <label className="text-xs flex items-center gap-1"><input type="checkbox" checked={task.completed} onChange={() => toggleCompleted(task.id)} /> Completed</label>
                    <button onClick={() => removeTask(task.id)} className="px-3 py-2 rounded-lg hms-field">Remove</button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <select value={task.category} onChange={(e) => updateTask(task.id, "category", e.target.value)} className="px-3 py-2 hms-field">
                      <option value="hvac">HVAC</option><option value="plumbing">Plumbing</option><option value="electrical">Electrical</option><option value="exterior">Exterior</option><option value="safety">Safety</option><option value="cleaning">Cleaning</option>
                    </select>
                    <select value={task.frequency} onChange={(e) => updateTask(task.id, "frequency", e.target.value)} className="px-3 py-2 hms-field">
                      <option value="weekly">Weekly</option><option value="biweekly">Biweekly</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="half-yearly">Half-Yearly</option><option value="yearly">Yearly</option>
                    </select>
                    <input type="date" value={task.lastCompleted} onChange={(e) => updateTask(task.id, "lastCompleted", e.target.value)} className="px-3 py-2 hms-field" />
                    <input value={task.estimatedHours} onChange={(e) => updateTask(task.id, "estimatedHours", e.target.value)} placeholder="Hours" className="px-3 py-2 hms-field" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <input value={task.estimatedCost} onChange={(e) => updateTask(task.id, "estimatedCost", e.target.value)} placeholder="Estimated Cost" className="px-3 py-2 hms-field" />
                    <input value={task.notes} onChange={(e) => updateTask(task.id, "notes", e.target.value)} placeholder="Notes" className="px-3 py-2 hms-field" />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2">
              <div className="rounded-xl hms-panel p-4"><p className="text-xs uppercase text-(--muted-foreground)">Overdue</p><p className="text-2xl font-bold text-red-500">{summary.overdueCount}</p></div>
              <div className="rounded-xl hms-panel p-4"><p className="text-xs uppercase text-(--muted-foreground)">Due Soon</p><p className="text-2xl font-bold text-amber-500">{summary.dueSoonCount}</p></div>
              <div className="rounded-xl hms-panel p-4"><p className="text-xs uppercase text-(--muted-foreground)">Scheduled</p><p className="text-2xl font-bold text-emerald-600">{summary.scheduledCount}</p></div>
              <div className="rounded-xl hms-panel p-4"><p className="text-xs uppercase text-(--muted-foreground)">Completed</p><p className="text-2xl font-bold text-blue-600">{summary.completedCount}</p></div>
              <div className="rounded-xl hms-panel p-4"><p className="text-xs uppercase text-(--muted-foreground)">Annual Budget</p><p className="text-2xl font-bold">Rs {summary.annualBudget.toFixed(0)}</p></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-xl hms-panel p-4">
                <h3 className="font-semibold mb-2">Monthly Schedule Load</h3>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {summary.monthlyBuckets.map((m) => (
                    <div key={m.month} className="rounded border border-(--border) p-2 bg-(--card)">
                      <p>Month {m.month}</p><p className="font-bold text-(--primary)">{m.count} tasks</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl hms-panel p-4">
                <h3 className="font-semibold mb-2">Next Actions</h3>
                <div className="space-y-2 text-sm">
                  {summary.nextActions.length ? summary.nextActions.map((a) => <p key={a}>- {a}</p>) : <p className="text-(--muted-foreground)">Add task names to generate action list.</p>}
                </div>
              </div>
            </div>

            <div className="rounded-xl hms-panel p-4">
              <h3 className="font-semibold mb-3">Task Timeline</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left border-b border-(--border)"><th className="py-2">Task</th><th className="py-2">Category</th><th className="py-2">Frequency</th><th className="py-2">Next Due</th><th className="py-2">Status</th></tr></thead>
                  <tbody>
                    {summary.filtered.map((t, i) => (
                      <tr key={t.id} className="border-b border-(--border)">
                        <td className="py-2">{t.name || `Task ${i + 1}`}</td>
                        <td className="py-2 capitalize">{t.category}</td>
                        <td className="py-2 capitalize">{t.frequency}</td>
                        <td className="py-2">{t.nextDue || "-"}</td>
                        <td className="py-2 font-medium">{t.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl hms-panel p-4">
              <p className="text-xs uppercase text-(--muted-foreground)">Effort and Current Budget</p>
              <p className="text-2xl font-bold text-(--primary)">{summary.totalHours.toFixed(1)} Hours</p>
              <p className="text-sm mt-1">Current-cycle budget: Rs {summary.totalCost.toFixed(0)}</p>
            </div>
          </div>
        </div>

        <HowItWorks />
        <Features />
      </div>
    </div>
  );
}
