"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  Edit3,
  Home,
  LayoutGrid,
  ListChecks,
  Plus,
  Sparkles,
  Trash2,
  User,
  X,
  FileText,
  Printer,
  BarChart2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const FREQUENCIES = ["Daily", "Weekly", "Bi-Weekly", "Monthly", "Quarterly"];
const ROOMS = ["Kitchen", "Bathroom", "Living Room", "Bedroom", "Office", "Garage", "Outdoor", "Other"];
const PRIORITIES = ["High", "Medium", "Low"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const PRIORITY_COLORS = {
  High: { dot: "#ef4444", subtle: "rgba(239, 68, 68, 0.12)", text: "#dc2626" },
  Medium: { dot: "#f59e0b", subtle: "rgba(245, 158, 11, 0.14)", text: "#b45309" },
  Low: { dot: "#14b8a6", subtle: "rgba(20, 184, 166, 0.14)", text: "#0f766e" },
};

const ROOM_LABELS = {
  Kitchen: "Kitchen", Bathroom: "Bathroom", "Living Room": "Living",
  Bedroom: "Bedroom", Office: "Office", Garage: "Garage", Outdoor: "Outdoor", Other: "Other",
};

const defaultTask = {
  id: null, name: "", room: "Kitchen", frequency: "Weekly", priority: "Medium",
  assignedTo: "", days: [], duration: 15, notes: "", completed: false, lastDone: null,
};

const initialTasks = [
  { id: 1, name: "Wipe countertops", room: "Kitchen", frequency: "Daily", priority: "High", assignedTo: "Alex", days: ["Mon", "Wed", "Fri"], duration: 10, notes: "Use disinfectant spray", completed: false, lastDone: null },
  { id: 2, name: "Vacuum floors", room: "Living Room", frequency: "Weekly", priority: "Medium", assignedTo: "Jamie", days: ["Sat"], duration: 20, notes: "", completed: false, lastDone: null },
  { id: 3, name: "Clean toilet and sink", room: "Bathroom", frequency: "Weekly", priority: "High", assignedTo: "Alex", days: ["Sun"], duration: 25, notes: "Use gloves", completed: false, lastDone: null },
  { id: 4, name: "Dust shelves", room: "Bedroom", frequency: "Bi-Weekly", priority: "Low", assignedTo: "Jamie", days: ["Sat"], duration: 15, notes: "", completed: true, lastDone: "2026-05-10" },
];

/* ─── PRINT STYLES (injected once) ─── */
const PRINT_STYLE = `
@media print {
  body * { visibility: hidden !important; }
  #print-report, #print-report * { visibility: visible !important; }
  #print-report {
    position: fixed !important;
    inset: 0 !important;
    z-index: 99999 !important;
    background: #fff !important;
    padding: 0 !important;
    margin: 0 !important;
  }
}
`;

function injectPrintStyle() {
  if (document.getElementById("cleaning-print-style")) return;
  const style = document.createElement("style");
  style.id = "cleaning-print-style";
  style.textContent = PRINT_STYLE;
  document.head.appendChild(style);
}

/* ─── REPORT MODAL ─── */
function ReportModal({ tasks, onClose }) {
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter(t => t.completed).length;
    const pending = total - done;
    const urgent = tasks.filter(t => t.priority === "High" && !t.completed).length;
    const totalMin = tasks.reduce((s, t) => s + t.duration, 0);
    const doneMin = tasks.filter(t => t.completed).reduce((s, t) => s + t.duration, 0);
    const percent = total ? Math.round((done / total) * 100) : 0;
    const byRoom = ROOMS.reduce((acc, r) => {
      const rt = tasks.filter(t => t.room === r);
      if (rt.length) acc[r] = rt;
      return acc;
    }, {});
    const byAssignee = tasks.reduce((acc, t) => {
      const key = t.assignedTo || "Unassigned";
      if (!acc[key]) acc[key] = { total: 0, done: 0, min: 0 };
      acc[key].total++;
      if (t.completed) acc[key].done++;
      acc[key].min += t.duration;
      return acc;
    }, {});
    const byFreq = FREQUENCIES.reduce((acc, f) => {
      const ft = tasks.filter(t => t.frequency === f);
      if (ft.length) acc[f] = ft.length;
      return acc;
    }, {});
    return { total, done, pending, urgent, totalMin, doneMin, percent, byRoom, byAssignee, byFreq };
  }, [tasks]);

  const handlePrint = () => {
    injectPrintStyle();
    window.print();
  };

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm">
      {/* Screen version */}
      <div className="relative max-h-[92vh] w-full max-w-4xl overflow-auto rounded-2xl border border-[var(--border)] bg-[var(--background)] shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--background)] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)]">
              <FileText size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--foreground)]">Cleaning Schedule Report</h2>
              <p className="text-xs text-[var(--muted-foreground)]">Generated on {today}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] transition hover:opacity-90"
            >
              <Printer size={15} />
              Print / Save PDF
            </button>
            <button onClick={onClose} className="rounded-lg border border-[var(--border)] p-2 text-[var(--muted-foreground)] hover:bg-[var(--muted)]">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Report Body (Screen) */}
        <div className="p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Total Tasks", value: stats.total, color: "#6366f1" },
              { label: "Completed", value: stats.done, color: "#14b8a6" },
              { label: "Pending", value: stats.pending, color: "#f59e0b" },
              { label: "Urgent", value: stats.urgent, color: "#ef4444" },
            ].map(s => (
              <div key={s.label} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-center">
                <span className="block text-3xl font-black" style={{ color: s.color }}>{s.value}</span>
                <span className="mt-1 block text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
            <div className="mb-2 flex items-center justify-between text-sm font-semibold">
              <span className="text-[var(--foreground)]">Overall Completion</span>
              <span className="text-[var(--primary)]">{stats.percent}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--muted)]">
              <div className="h-full rounded-full bg-[var(--primary)] transition-all" style={{ width: `${stats.percent}%` }} />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              {stats.doneMin} of {stats.totalMin} total minutes completed
            </p>
          </div>

          {/* Assignee Breakdown */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--foreground)]"><User size={15} className="text-[var(--primary)]" /> By Assignee</h3>
            <div className="divide-y divide-[var(--border)]">
              {Object.entries(stats.byAssignee).map(([name, data]) => (
                <div key={name} className="flex items-center gap-3 py-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-[var(--primary-foreground)]">
                    {name[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-[var(--foreground)]">{name}</span>
                      <span className="text-xs text-[var(--muted-foreground)]">{data.done}/{data.total} done · {data.min} min</span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                      <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${data.total ? Math.round((data.done / data.total) * 100) : 0}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Room Breakdown */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--foreground)]"><Home size={15} className="text-[var(--primary)]" /> By Room</h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {Object.entries(stats.byRoom).map(([room, rt]) => {
                const doneCount = rt.filter(t => t.completed).length;
                return (
                  <div key={room} className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-center">
                    <span className="block text-xl font-bold text-[var(--foreground)]">{rt.length}</span>
                    <span className="block text-xs font-medium text-[var(--muted-foreground)]">{room}</span>
                    <span className="mt-1 block text-[10px] text-teal-600">{doneCount} done</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Frequency Breakdown */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--foreground)]"><BarChart2 size={15} className="text-[var(--primary)]" /> By Frequency</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.byFreq).map(([freq, count]) => (
                <span key={freq} className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-xs font-semibold text-[var(--foreground)]">
                  {freq}: <span className="text-[var(--primary)]">{count}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Pending Tasks */}
          {pendingTasks.length > 0 && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--foreground)]"><AlertCircle size={15} className="text-amber-500" /> Pending Tasks ({pendingTasks.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[580px] text-left text-xs">
                  <thead className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)]">
                    <tr className="border-b border-[var(--border)]">
                      <th className="py-2 pr-3">Task</th>
                      <th className="py-2 pr-3">Room</th>
                      <th className="py-2 pr-3">Priority</th>
                      <th className="py-2 pr-3">Assignee</th>
                      <th className="py-2 pr-3">Frequency</th>
                      <th className="py-2">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {pendingTasks.map(t => (
                      <tr key={t.id}>
                        <td className="py-2 pr-3 font-semibold text-[var(--foreground)]">{t.name}</td>
                        <td className="py-2 pr-3 text-[var(--muted-foreground)]">{t.room}</td>
                        <td className="py-2 pr-3"><span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: PRIORITY_COLORS[t.priority].subtle, color: PRIORITY_COLORS[t.priority].text }}>{t.priority}</span></td>
                        <td className="py-2 pr-3 text-[var(--muted-foreground)]">{t.assignedTo || "-"}</td>
                        <td className="py-2 pr-3 text-[var(--muted-foreground)]">{t.frequency}</td>
                        <td className="py-2 text-[var(--muted-foreground)]">{t.duration}m</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--foreground)]"><CheckCircle2 size={15} className="text-teal-500" /> Completed Tasks ({completedTasks.length})</h3>
              <div className="flex flex-col gap-1.5">
                {completedTasks.map(t => (
                  <div key={t.id} className="flex items-center gap-2 rounded-lg bg-[var(--background)] px-3 py-2 opacity-75">
                    <Check size={13} className="shrink-0 text-teal-500" />
                    <span className="flex-1 text-xs font-semibold line-through text-[var(--muted-foreground)]">{t.name}</span>
                    <span className="text-[10px] text-[var(--muted-foreground)]">{t.room}</span>
                    {t.lastDone && <span className="text-[10px] text-teal-600">✓ {t.lastDone}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── PRINT-ONLY HIDDEN DIV ─── */}
      <div id="print-report" style={{ display: "none", position: "fixed", inset: 0, background: "#fff", padding: "32px", fontFamily: "Georgia, serif", color: "#111" }}>
        <PrintReport tasks={tasks} stats={stats} today={today} pendingTasks={pendingTasks} completedTasks={completedTasks} />
      </div>
    </div>
  );
}

/* ─── PRINT LAYOUT ─── */
function PrintReport({ tasks, stats, today, pendingTasks, completedTasks }) {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", fontFamily: "Georgia, 'Times New Roman', serif", color: "#111" }}>
      {/* Title */}
      <div style={{ borderBottom: "3px solid #111", paddingBottom: 16, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#666", margin: 0 }}>Household Management</p>
            <h1 style={{ fontSize: 28, fontWeight: 900, margin: "4px 0 0" }}>Cleaning Schedule Report</h1>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 11, color: "#666", margin: 0 }}>Generated</p>
            <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>{today}</p>
          </div>
        </div>
      </div>

      {/* Summary Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total Tasks", value: stats.total },
          { label: "Completed", value: stats.done },
          { label: "Pending", value: stats.pending },
          { label: "Urgent", value: stats.urgent },
        ].map(s => (
          <div key={s.label} style={{ border: "1.5px solid #ddd", borderRadius: 8, padding: "12px 8px", textAlign: "center" }}>
            <div style={{ fontSize: 32, fontWeight: 900, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "#666", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
          <span style={{ fontWeight: 700 }}>Overall Completion</span>
          <span style={{ fontWeight: 900 }}>{stats.percent}%</span>
        </div>
        <div style={{ height: 10, background: "#e5e7eb", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${stats.percent}%`, background: "#111", borderRadius: 99 }} />
        </div>
        <p style={{ fontSize: 11, color: "#666", marginTop: 4 }}>{stats.doneMin} of {stats.totalMin} total minutes completed</p>
      </div>

      {/* Assignee Table */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 13, fontWeight: 900, letterSpacing: 2, textTransform: "uppercase", borderBottom: "1.5px solid #ddd", paddingBottom: 6, marginBottom: 10 }}>By Assignee</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: "#f3f4f6" }}>
              <th style={{ padding: "6px 10px", textAlign: "left", fontWeight: 700 }}>Name</th>
              <th style={{ padding: "6px 10px", textAlign: "center" }}>Total</th>
              <th style={{ padding: "6px 10px", textAlign: "center" }}>Done</th>
              <th style={{ padding: "6px 10px", textAlign: "center" }}>Pending</th>
              <th style={{ padding: "6px 10px", textAlign: "center" }}>Minutes</th>
              <th style={{ padding: "6px 10px", textAlign: "center" }}>Progress</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(stats.byAssignee).map(([name, d], i) => (
              <tr key={name} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa", borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: "6px 10px", fontWeight: 700 }}>{name}</td>
                <td style={{ padding: "6px 10px", textAlign: "center" }}>{d.total}</td>
                <td style={{ padding: "6px 10px", textAlign: "center", color: "#059669" }}>{d.done}</td>
                <td style={{ padding: "6px 10px", textAlign: "center", color: "#d97706" }}>{d.total - d.done}</td>
                <td style={{ padding: "6px 10px", textAlign: "center" }}>{d.min}m</td>
                <td style={{ padding: "6px 10px", textAlign: "center" }}>{d.total ? Math.round((d.done / d.total) * 100) : 0}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pending Tasks Table */}
      {pendingTasks.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 13, fontWeight: 900, letterSpacing: 2, textTransform: "uppercase", borderBottom: "1.5px solid #ddd", paddingBottom: 6, marginBottom: 10 }}>
            Pending Tasks ({pendingTasks.length})
          </h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr style={{ background: "#f3f4f6" }}>
                {["Task Name", "Room", "Priority", "Assignee", "Frequency", "Days", "Duration", "Notes"].map(h => (
                  <th key={h} style={{ padding: "5px 8px", textAlign: "left", fontWeight: 700, fontSize: 10, letterSpacing: 1 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pendingTasks.map((t, i) => (
                <tr key={t.id} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa", borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "5px 8px", fontWeight: 700 }}>{t.name}</td>
                  <td style={{ padding: "5px 8px" }}>{t.room}</td>
                  <td style={{ padding: "5px 8px", fontWeight: 700, color: t.priority === "High" ? "#dc2626" : t.priority === "Medium" ? "#b45309" : "#0f766e" }}>{t.priority}</td>
                  <td style={{ padding: "5px 8px" }}>{t.assignedTo || "-"}</td>
                  <td style={{ padding: "5px 8px" }}>{t.frequency}</td>
                  <td style={{ padding: "5px 8px" }}>{t.days.join(", ") || "-"}</td>
                  <td style={{ padding: "5px 8px" }}>{t.duration}m</td>
                  <td style={{ padding: "5px 8px", color: "#666", fontSize: 10 }}>{t.notes || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 13, fontWeight: 900, letterSpacing: 2, textTransform: "uppercase", borderBottom: "1.5px solid #ddd", paddingBottom: 6, marginBottom: 10 }}>
            Completed Tasks ({completedTasks.length})
          </h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr style={{ background: "#f3f4f6" }}>
                {["Task Name", "Room", "Assignee", "Frequency", "Last Done"].map(h => (
                  <th key={h} style={{ padding: "5px 8px", textAlign: "left", fontWeight: 700, fontSize: 10, letterSpacing: 1 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {completedTasks.map((t, i) => (
                <tr key={t.id} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa", borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "5px 8px", fontWeight: 700, textDecoration: "line-through", color: "#888" }}>{t.name}</td>
                  <td style={{ padding: "5px 8px", color: "#888" }}>{t.room}</td>
                  <td style={{ padding: "5px 8px", color: "#888" }}>{t.assignedTo || "-"}</td>
                  <td style={{ padding: "5px 8px", color: "#888" }}>{t.frequency}</td>
                  <td style={{ padding: "5px 8px", color: "#059669", fontWeight: 700 }}>{t.lastDone || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <div style={{ borderTop: "1.5px solid #ddd", paddingTop: 12, marginTop: 12, display: "flex", justifyContent: "space-between", fontSize: 10, color: "#888" }}>
        <span>Cleaning Schedule Planner · Household Management System</span>
        <span>{today}</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════ */
export default function CleaningSchedulePlanner() {
  const [tasks, setTasks] = useState(initialTasks);
  const [view, setView] = useState("board");
  const [showModal, setShowModal] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState(defaultTask);
  const [filterRoom, setFilterRoom] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterFreq, setFilterFreq] = useState("All");
  const [nextId, setNextId] = useState(5);
  const [activeDay, setActiveDay] = useState("Mon");
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    window.setTimeout(() => setToast(null), 2200);
  };

  const filtered = useMemo(() => tasks.filter((task) => {
    if (filterRoom !== "All" && task.room !== filterRoom) return false;
    if (filterPriority !== "All" && task.priority !== filterPriority) return false;
    if (filterFreq !== "All" && task.frequency !== filterFreq) return false;
    return true;
  }), [filterFreq, filterPriority, filterRoom, tasks]);

  const byRoom = useMemo(() => ROOMS.reduce((acc, room) => {
    const roomTasks = filtered.filter((task) => task.room === room);
    if (roomTasks.length) acc[room] = roomTasks;
    return acc;
  }, {}), [filtered]);

  const byDay = useMemo(() => DAYS.reduce((acc, day) => {
    acc[day] = filtered.filter((task) => task.days.includes(day));
    return acc;
  }, {}), [filtered]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((task) => task.completed).length;
    const urgent = tasks.filter((task) => task.priority === "High" && !task.completed).length;
    const minutes = tasks.filter((task) => !task.completed).reduce((sum, task) => sum + task.duration, 0);
    return { total, done, urgent, minutes, percent: total ? Math.round((done / total) * 100) : 0 };
  }, [tasks]);

  const openAdd = () => { setForm({ ...defaultTask, id: nextId }); setEditingTask(null); setShowModal(true); };
  const openEdit = (task) => { setForm({ ...task }); setEditingTask(task.id); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditingTask(null); setForm(defaultTask); };

  const saveTask = () => {
    if (!form.name.trim()) return;
    if (editingTask) {
      setTasks((current) => current.map((task) => (task.id === editingTask ? { ...form } : task)));
      showToast("Task updated");
    } else {
      setTasks((current) => [...current, { ...form }]);
      setNextId((value) => value + 1);
      showToast("Task added");
    }
    closeModal();
  };

  const deleteTask = (id) => { setTasks((current) => current.filter((task) => task.id !== id)); showToast("Task removed", "error"); };
  const toggleComplete = (id) => {
    setTasks((current) => current.map((task) => (
      task.id === id ? { ...task, completed: !task.completed, lastDone: !task.completed ? new Date().toISOString().split("T")[0] : null } : task
    )));
  };
  const toggleDay = (day) => {
    setForm((current) => ({
      ...current,
      days: current.days.includes(day) ? current.days.filter((item) => item !== day) : [...current.days, day],
    }));
  };

  return (
    <div className="min-h-screen rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] shadow-sm">
      {toast ? (
        <div className={`fixed right-5 top-5 z-50 flex items-center gap-2 rounded-md px-4 py-3 text-sm font-semibold text-white shadow-lg ${toast.type === "error" ? "bg-red-500" : "bg-teal-500"}`}>
          {toast.type === "error" ? <Trash2 size={16} /> : <Check size={16} />}
          {toast.msg}
        </div>
      ) : null}

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6">
        <header className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)]">
                <Sparkles size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--primary)]">Household Planner</p>
                <h1 className="mt-1 text-2xl font-bold text-[var(--foreground)] sm:text-3xl">Cleaning Schedule Planner</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
                  Organize recurring chores by room, day, priority, owner, and time.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[420px]">
              <Stat label="Tasks" value={stats.total} />
              <Stat label="Done" value={stats.done} tone="text-teal-600" />
              <Stat label="Urgent" value={stats.urgent} tone="text-red-500" />
              <Stat label="Minutes" value={stats.minutes} />
            </div>
          </div>
        </header>

        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
            <div className="flex w-full flex-wrap gap-2 xl:w-auto">
              <ViewButton active={view === "board"} icon={LayoutGrid} label="Board" onClick={() => setView("board")} />
              <ViewButton active={view === "calendar"} icon={CalendarDays} label="Weekly" onClick={() => setView("calendar")} />
              <ViewButton active={view === "list"} icon={ListChecks} label="List" onClick={() => setView("list")} />
            </div>
            <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3">
              <Select value={filterRoom} onChange={setFilterRoom} options={["All", ...ROOMS]} allLabel="All Rooms" />
              <Select value={filterPriority} onChange={setFilterPriority} options={["All", ...PRIORITIES]} allLabel="All Priorities" />
              <Select value={filterFreq} onChange={setFilterFreq} options={["All", ...FREQUENCIES]} allLabel="All Frequencies" />
            </div>
            <div className="flex gap-2">
              {/* ── REPORT BUTTON ── */}
              <button
                type="button"
                onClick={() => setShowReport(true)}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
              >
                <FileText size={15} />
                Report
              </button>
              <button
                type="button"
                onClick={openAdd}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] transition hover:opacity-90"
              >
                <Plus size={16} />
                New Task
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--muted)]">
              <div className="h-full rounded-full bg-[var(--primary)] transition-all" style={{ width: `${stats.percent}%` }} />
            </div>
            <span className="w-20 text-right text-xs font-semibold text-[var(--muted-foreground)]">{stats.percent}% complete</span>
          </div>
        </section>

        {view === "board" ? (
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Object.keys(byRoom).length === 0 ? <EmptyState text="No tasks match your filters." /> : null}
            {Object.entries(byRoom).map(([room, roomTasks]) => (
              <div key={room} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
                <div className="mb-3 flex items-center gap-2 border-b border-[var(--border)] pb-3">
                  <Home size={18} className="text-[var(--primary)]" />
                  <h2 className="flex-1 text-sm font-bold text-[var(--foreground)]">{room}</h2>
                  <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-semibold text-[var(--muted-foreground)]">{roomTasks.length}</span>
                </div>
                <div className="flex flex-col gap-3">
                  {roomTasks.map((task) => (
                    <TaskCard key={task.id} task={task} onEdit={openEdit} onDelete={deleteTask} onToggle={toggleComplete} />
                  ))}
                </div>
              </div>
            ))}
          </section>
        ) : null}

        {view === "calendar" ? (
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
            <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
              {DAYS.map((day) => (
                <button key={day} type="button" onClick={() => setActiveDay(day)}
                  className={`relative rounded-md border px-3 py-2 text-sm font-bold transition ${activeDay === day ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]" : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"}`}>
                  {day}
                  {byDay[day].length > 0 ? <span className="ml-2 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] leading-none text-white">{byDay[day].length}</span> : null}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {byDay[activeDay].length === 0 ? <EmptyState text={`No tasks scheduled for ${activeDay}.`} /> : null}
              {byDay[activeDay].map((task) => (
                <TaskCard key={task.id} task={task} onEdit={openEdit} onDelete={deleteTask} onToggle={toggleComplete} />
              ))}
            </div>
          </section>
        ) : null}

        {view === "list" ? (
          <section className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead className="bg-[var(--section-highlight)] text-xs uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
                <tr>
                  <th className="px-4 py-3">Done</th><th className="px-4 py-3">Task</th>
                  <th className="px-4 py-3">Room</th><th className="px-4 py-3">Frequency</th>
                  <th className="px-4 py-3">Priority</th><th className="px-4 py-3">Assigned</th>
                  <th className="px-4 py-3">Duration</th><th className="px-4 py-3">Days</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-[var(--muted-foreground)]">No tasks found.</td></tr>
                ) : null}
                {filtered.map((task) => (
                  <tr key={task.id} className={task.completed ? "opacity-60" : ""}>
                    <td className="px-4 py-3"><CheckButton checked={task.completed} onClick={() => toggleComplete(task.id)} /></td>
                    <td className={`px-4 py-3 text-sm font-semibold ${task.completed ? "line-through text-[var(--muted-foreground)]" : "text-[var(--foreground)]"}`}>{task.name}</td>
                    <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{ROOM_LABELS[task.room]}</td>
                    <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{task.frequency}</td>
                    <td className="px-4 py-3"><PriorityBadge priority={task.priority} /></td>
                    <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{task.assignedTo || "-"}</td>
                    <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{task.duration} min</td>
                    <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{task.days.join(", ") || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <IconButton label="Edit task" icon={Edit3} onClick={() => openEdit(task)} />
                        <IconButton label="Delete task" icon={Trash2} onClick={() => deleteTask(task.id)} danger />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : null}
      </div>

      {showModal ? (
        <TaskModal editing={Boolean(editingTask)} form={form} setForm={setForm} onClose={closeModal} onSave={saveTask} onToggleDay={toggleDay} />
      ) : null}

      {showReport ? (
        <ReportModal tasks={tasks} onClose={() => setShowReport(false)} />
      ) : null}
    </div>
  );
}

/* ─── SUB COMPONENTS (unchanged) ─── */
function Stat({ label, value, tone = "text-[var(--foreground)]" }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-center">
      <span className={`block text-xl font-bold ${tone}`}>{value}</span>
      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted-foreground)]">{label}</span>
    </div>
  );
}
function ViewButton({ active, icon: Icon, label, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition ${active ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]" : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"}`}>
      <Icon size={16} />{label}
    </button>
  );
}
function Select({ value, onChange, options, allLabel }) {
  return (
    <label className="relative block">
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 pr-9 text-sm font-medium text-[var(--foreground)] outline-none transition focus:border-[var(--primary)]">
        {options.map((o) => <option key={o} value={o}>{o === "All" ? allLabel : o}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={16} />
    </label>
  );
}
function TaskCard({ task, onEdit, onDelete, onToggle }) {
  const color = PRIORITY_COLORS[task.priority];
  return (
    <article className={`rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 shadow-sm ${task.completed ? "opacity-60" : ""}`} style={{ borderLeftColor: color.dot, borderLeftWidth: 4 }}>
      <div className="flex items-start gap-3">
        <CheckButton checked={task.completed} onClick={() => onToggle(task.id)} color={color.dot} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <h3 className={`min-w-0 flex-1 text-sm font-bold ${task.completed ? "line-through text-[var(--muted-foreground)]" : "text-[var(--foreground)]"}`}>{task.name}</h3>
            <PriorityBadge priority={task.priority} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-[var(--muted-foreground)]">
            <Chip><CalendarDays size={13} />{task.frequency}</Chip>
            <Chip><Clock size={13} />{task.duration}m</Chip>
            {task.assignedTo ? <Chip><User size={13} />{task.assignedTo}</Chip> : null}
          </div>
          {task.days.length > 0 ? (
            <div className="mt-3 flex gap-1">
              {DAYS.map((day) => (
                <span key={day} className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${task.days.includes(day) ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "bg-[var(--muted)] text-[var(--muted-foreground)]"}`}>{day[0]}</span>
              ))}
            </div>
          ) : null}
          {task.notes ? <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">{task.notes}</p> : null}
          {task.lastDone ? <p className="mt-2 text-xs text-[var(--muted-foreground)]">Last done: {task.lastDone}</p> : null}
        </div>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <IconButton label="Edit task" icon={Edit3} onClick={() => onEdit(task)} />
        <IconButton label="Delete task" icon={Trash2} onClick={() => onDelete(task.id)} danger />
      </div>
    </article>
  );
}
function Chip({ children }) {
  return <span className="inline-flex items-center gap-1 rounded-md bg-[var(--muted)] px-2 py-1">{children}</span>;
}
function PriorityBadge({ priority }) {
  const color = PRIORITY_COLORS[priority];
  return <span className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: color.subtle, color: color.text }}>{priority}</span>;
}
function CheckButton({ checked, onClick, color = "var(--primary)" }) {
  return (
    <button type="button" onClick={onClick} aria-label={checked ? "Mark incomplete" : "Mark complete"}
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition"
      style={{ borderColor: color, background: checked ? color : "transparent", color: checked ? "#ffffff" : color }}>
      {checked ? <Check size={14} strokeWidth={3} /> : null}
    </button>
  );
}
function IconButton({ label, icon: Icon, onClick, danger = false }) {
  return (
    <button type="button" onClick={onClick} title={label} aria-label={label}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md border transition ${danger ? "border-red-200 text-red-500 hover:bg-red-50" : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]"}`}>
      <Icon size={15} />
    </button>
  );
}
function EmptyState({ text }) {
  return (
    <div className="col-span-full rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)] px-4 py-10 text-center text-sm text-[var(--muted-foreground)]">{text}</div>
  );
}
function TaskModal({ editing, form, setForm, onClose, onSave, onToggleDay }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-xl border border-[var(--border)] bg-[var(--background)] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[var(--border)] p-5">
          <h2 className="text-lg font-bold text-[var(--foreground)]">{editing ? "Edit Task" : "Add New Task"}</h2>
          <button type="button" onClick={onClose} className="rounded-md p-2 text-[var(--muted-foreground)] transition hover:bg-[var(--muted)]"><X size={18} /></button>
        </div>
        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
          <Field label="Task Name"><input className="tool-input" placeholder="Mop kitchen floor" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Assigned To"><input className="tool-input" placeholder="Alex" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} /></Field>
          <Field label="Room"><NativeSelect value={form.room} onChange={(room) => setForm({ ...form, room })} options={ROOMS} /></Field>
          <Field label="Frequency"><NativeSelect value={form.frequency} onChange={(frequency) => setForm({ ...form, frequency })} options={FREQUENCIES} /></Field>
          <Field label="Priority">
            <div className="grid grid-cols-3 gap-2">
              {PRIORITIES.map((priority) => {
                const color = PRIORITY_COLORS[priority];
                const active = form.priority === priority;
                return (
                  <button key={priority} type="button" onClick={() => setForm({ ...form, priority })} className="rounded-md border px-3 py-2 text-sm font-bold transition"
                    style={{ borderColor: color.dot, background: active ? color.dot : color.subtle, color: active ? "#ffffff" : color.text }}>{priority}</button>
                );
              })}
            </div>
          </Field>
          <Field label="Duration"><input className="tool-input" type="number" min={5} max={180} step={5} value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} /></Field>
          <Field label="Schedule Days" wide>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => (
                <button key={day} type="button" onClick={() => onToggleDay(day)}
                  className={`rounded-md border px-3 py-2 text-sm font-bold transition ${form.days.includes(day) ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]" : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"}`}>{day}</button>
              ))}
            </div>
          </Field>
          <Field label="Notes" wide><textarea className="tool-input min-h-20 resize-y" placeholder="Optional notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
        </div>
        <div className="flex justify-end gap-3 border-t border-[var(--border)] p-5">
          <button type="button" onClick={onClose} className="rounded-md border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--muted)]">Cancel</button>
          <button type="button" onClick={onSave} disabled={!form.name.trim()} className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">{editing ? "Save Changes" : "Add Task"}</button>
        </div>
      </div>
    </div>
  );
}
function Field({ label, children, wide = false }) {
  return (
    <label className={`flex flex-col gap-2 ${wide ? "sm:col-span-2" : ""}`}>
      <span className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--muted-foreground)]">{label}</span>
      {children}
    </label>
  );
}
function NativeSelect({ value, onChange, options }) {
  return (
    <select className="tool-input" value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
}
