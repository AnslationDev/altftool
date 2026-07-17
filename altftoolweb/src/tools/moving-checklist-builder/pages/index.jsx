"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Box,
  Calendar,
  CheckCircle2,
  Clipboard,
  Download,
  Home,
  PawPrint,
  RefreshCcw,
  Trash2,
  Truck,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import SafeResponsiveContainer from "@/components/charts/SafeResponsiveContainer";

const MOVE_TYPES = [
  { value: "local", label: "Local (same city)" },
  { value: "interstate", label: "Interstate" },
  { value: "international", label: "International" },
];

const HOME_SIZES = [
  { value: "studio", label: "Studio / 1 BHK" },
  { value: "1bhk", label: "1–2 BHK" },
  { value: "2bhk", label: "2–3 BHK" },
  { value: "3bhk", label: "3+ BHK" },
];

const PHASES = [
  {
    id: "8weeks",
    label: "8+ Weeks Before",
    weeksBefore: 8,
    tasks: [
      "Create a moving binder or digital folder for all documents",
      "Set a moving budget — include movers, boxes, deposits, and incidentals",
      "Research and shortlist moving companies; request written quotes",
      "Declutter room by room — sort items into keep, donate, sell, discard",
      "Inventory high-value items (electronics, art, jewellery) for insurance",
      "Notify landlord if renting; review lease exit clause and notice period",
      "Begin collecting free boxes from local shops and online listings",
      "Check if your new home has hookups for washer/dryer or specific appliances",
    ],
  },
  {
    id: "6weeks",
    label: "6 Weeks Before",
    weeksBefore: 6,
    tasks: [
      "Book your preferred moving company; confirm date, time, and insurance cover",
      "Gather all school and medical records for transfer",
      "Arrange pet boarding or transport for moving day",
      "Start using up perishable food — adjust grocery shopping accordingly",
      "Research schools, childcare, and pet services near the new home",
      "Order or purchase packing supplies — boxes, tape, bubble wrap, markers",
      "Measure large furniture and new-home doorways to ensure everything fits",
      "Create a floor plan of the new home to plan furniture placement",
    ],
  },
  {
    id: "4weeks",
    label: "4 Weeks Before",
    weeksBefore: 4,
    tasks: [
      "Start packing off-season clothes, books, and rarely used items",
      "Label every box with contents and destination room on multiple sides",
      "Disassemble furniture that can be broken down for easier transport",
      "Back up important computer files before the move",
      "Transfer or set up utilities at new address — electricity, gas, water, internet",
      "Update your address with banks, credit cards, and insurance providers",
      "Schedule a deep clean of the current home for after you move out",
      "Donate or sell items you no longer need",
    ],
  },
  {
    id: "2weeks",
    label: "2 Weeks Before",
    weeksBefore: 2,
    tasks: [
      "Confirm details with your moving company — arrival time, parking, access codes",
      "Defrost freezer at least 24 hours before moving day",
      "Pack an essentials box (documents, chargers, toiletries, change of clothes)",
      "Confirm new home is ready — keys collected, locks changed if needed",
      "Return library books and borrowed items from neighbours",
      "Prepare valuables and important documents to carry personally",
      "Cancel or redirect newspaper and magazine subscriptions",
      "Arrange care for children or pets on moving day",
    ],
  },
  {
    id: "1week",
    label: "1 Week Before",
    weeksBefore: 1,
    tasks: [
      "Finish packing — leave only daily essentials unpacked",
      "Clean and vacuum each room as you empty it",
      "Drain fuel from lawn mowers and power tools (movers cannot transport fuel)",
      "Collect all spare keys, remotes, and garage openers to hand over",
      "Confirm parking permits or elevator reservations at both locations",
      "Charge all devices and portable batteries",
      "Take photos of meter readings for utility final bills",
      "Prepare cash or snacks for the moving crew as a courtesy",
    ],
  },
  {
    id: "movingday",
    label: "Moving Day",
    weeksBefore: 0,
    tasks: [
      "Do a final walk-through of every room, cupboard, and outdoor space",
      "Check all drawers, cabinets, and behind doors for forgotten items",
      "Supervise movers — point out fragile items and heavy furniture",
      "Sign the inventory sheet and bill of lading before the truck leaves",
      "Lock all doors and windows; hand over keys to landlord or new owner",
      "Drive to the new home; arrive before the movers if possible",
      "Inspect delivered items for damage; note any issues on the delivery sheet",
      "Set up beds and basic bathroom supplies first — you will thank yourself later",
    ],
  },
  {
    id: "after",
    label: "After Moving Day",
    weeksBefore: -1,
    tasks: [
      "Unpack essentials box first — documents, meds, chargers, toiletries",
      "Change locks on all exterior doors immediately",
      "Test all smoke detectors, carbon monoxide alarms, and fire extinguishers",
      "Locate the main water shut-off valve, circuit breaker, and gas meter",
      "Register your new address with the post office for mail forwarding",
      "Update driver licence, vehicle registration, and voter registration",
      "Meet your neighbours and introduce yourself",
      "Schedule any necessary home repairs, pest control, or deep cleaning",
    ],
  },
];

function createDefaultTasks() {
  const result = {};
  PHASES.forEach((phase) => {
    result[phase.id] = phase.tasks.map((task, i) => ({
      id: `${phase.id}-${i}`,
      text: task,
      done: false,
      notes: "",
    }));
  });
  return result;
}

function createSampleTasks() {
  const tasks = createDefaultTasks();
  const sampleDone = {
    "8weeks": [0, 1, 2, 3],
    "6weeks": [0, 1, 2, 5, 6, 7],
    "4weeks": [0, 1, 2, 3, 4],
    "2weeks": [0, 1, 4, 5],
    "1week": [0, 2, 3, 6, 7],
    "movingday": [0, 1, 2, 3, 6, 7],
    "after": [0, 1, 2, 3],
  };
  Object.entries(sampleDone).forEach(([phaseId, indices]) => {
    if (tasks[phaseId]) {
      indices.forEach((idx) => {
        if (tasks[phaseId][idx]) tasks[phaseId][idx].done = true;
      });
    }
  });
  return tasks;
}

const CHART_COLORS = [
  "#2563eb",
  "#059669",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
];

function formatDate(dateString) {
  if (!dateString) return "—";
  try {
    return new Date(dateString + "T00:00:00").toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

function getMoveTypeLabel(type) {
  return MOVE_TYPES.find((m) => m.value === type)?.label || type;
}

function getHomeSizeLabel(size) {
  return HOME_SIZES.find((s) => s.value === size)?.label || size;
}

function buildSummary(moveDate, moveType, homeSize, hasPets, hasChildren, tasks) {
  const phaseStats = PHASES.map((phase) => {
    const phaseTasks = tasks[phase.id] || [];
    const done = phaseTasks.filter((t) => t.done).length;
    return { label: phase.label, done, total: phaseTasks.length };
  });
  const totalTasks = phaseStats.reduce((sum, p) => sum + p.total, 0);
  const totalDone = phaseStats.reduce((sum, p) => sum + p.done, 0);
  return [
    "Moving Checklist Builder Summary",
    `Move date: ${formatDate(moveDate)}`,
    `Move type: ${getMoveTypeLabel(moveType)}`,
    `Home size: ${getHomeSizeLabel(homeSize)}`,
    `Has pets: ${hasPets ? "Yes" : "No"}`,
    `Has children: ${hasChildren ? "Yes" : "No"}`,
    `Total tasks: ${totalTasks}`,
    `Completed: ${totalDone} (${totalTasks > 0 ? Math.round((totalDone / totalTasks) * 100) : 0}%)`,
    `Remaining: ${totalTasks - totalDone}`,
    ...phaseStats.map(
      (p) => `${p.label}: ${p.done}/${p.total} done`
    ),
  ].join("\n");
}

function exportCsv(moveDate, moveType, homeSize, hasPets, hasChildren, tasks) {
  const rows = [["Phase", "Task", "Status", "Notes"]];
  PHASES.forEach((phase) => {
    (tasks[phase.id] || []).forEach((task) => {
      rows.push([
        phase.label,
        task.text,
        task.done ? "Done" : "Pending",
        task.notes || "",
      ]);
    });
  });
  const csv = rows.map((row) => row.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "moving-checklist.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function Field({ label, icon: Icon, children }) {
  return (
    <label className="block min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
      <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
        {Icon && <Icon className="h-4 w-4 shrink-0 text-[var(--primary)]" />}
        <span className="min-w-0 break-words">{label}</span>
      </span>
      {children}
    </label>
  );
}

function MetricCard({ icon: Icon, label, value, detail, tone = "default" }) {
  const toneClass =
    tone === "good"
      ? "bg-emerald-500/10 text-emerald-600"
      : tone === "warn"
        ? "bg-rose-500/10 text-rose-600"
        : tone === "watch"
          ? "bg-amber-500/10 text-amber-600"
          : "bg-[var(--section-highlight)] text-[var(--primary)]";

  return (
    <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)]">
      <div className="flex min-w-0 items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="break-words text-xs font-semibold uppercase text-[var(--muted-foreground)]">{label}</p>
          <p className="tool-money-value mt-1 text-[var(--foreground)]">{value}</p>
          {detail && <p className="mt-1 break-words text-sm leading-5 text-[var(--muted-foreground)]">{detail}</p>}
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children, action }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--anslation-ds-shadow-sm)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
        <h3 className="flex items-center gap-2 text-base font-bold text-[var(--foreground)]">
          {Icon && <Icon className="h-5 w-5 shrink-0 text-[var(--primary)]" />}
          {title}
        </h3>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function TooltipContent({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-sm shadow-lg">
      <p className="font-semibold text-[var(--foreground)]">{item.label}</p>
      {Number.isFinite(item.done) && <p className="text-emerald-600">{item.done} done</p>}
      {Number.isFinite(item.total) && <p className="text-[var(--muted-foreground)]">{item.total - item.done} remaining</p>}
      {Number.isFinite(item.value) && <p className="text-[var(--foreground)]">{item.value} tasks</p>}
    </div>
  );
}

export default function MovingChecklistBuilder() {
  const [moveDate, setMoveDate] = useState("");
  const [moveType, setMoveType] = useState("local");
  const [homeSize, setHomeSize] = useState("2bhk");
  const [hasPets, setHasPets] = useState(false);
  const [hasChildren, setHasChildren] = useState(false);
  const [tasks, setTasks] = useState(() => createDefaultTasks());
  const [activePhase, setActivePhase] = useState("8weeks");
  const [newTaskText, setNewTaskText] = useState("");

  const totalTasks = useMemo(
    () => Object.values(tasks).reduce((sum, phase) => sum + phase.length, 0),
    [tasks]
  );

  const totalDone = useMemo(
    () => Object.values(tasks).reduce((sum, phase) => sum + phase.filter((t) => t.done).length, 0),
    [tasks]
  );

  const completionPct = totalTasks > 0 ? Math.round((totalDone / totalTasks) * 100) : 0;

  const daysUntilMove = useMemo(() => {
    if (!moveDate) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const target = new Date(moveDate + "T00:00:00");
    if (Number.isNaN(target.getTime())) return null;
    return Math.ceil((target - now) / 86400000);
  }, [moveDate]);

  const activePhaseData = useMemo(() => {
    const phase = PHASES.find((p) => p.id === activePhase);
    if (!phase) return { label: "", tasks: [] };
    return {
      label: phase.label,
      tasks: tasks[phase.id] || [],
    };
  }, [activePhase, tasks]);

  const phaseChart = useMemo(() => {
    return PHASES.map((phase) => {
      const phaseTasks = tasks[phase.id] || [];
      const done = phaseTasks.filter((t) => t.done).length;
      return {
        label: phase.label.length > 15 ? phase.label.slice(0, 14) + "…" : phase.label,
        fullLabel: phase.label,
        done,
        remaining: phaseTasks.length - done,
        total: phaseTasks.length,
      };
    });
  }, [tasks]);

  const completionPie = useMemo(() => {
    if (totalTasks === 0) return [];
    return [
      { label: "Completed", value: totalDone, color: "#059669" },
      { label: "Remaining", value: totalTasks - totalDone, color: "#e5e7eb" },
    ];
  }, [totalTasks, totalDone]);

  const handleToggleTask = (phaseId, taskId) => {
    setTasks((prev) => ({
      ...prev,
      [phaseId]: (prev[phaseId] || []).map((t) =>
        t.id === taskId ? { ...t, done: !t.done } : t
      ),
    }));
  };

  const handleDeleteTask = (phaseId, taskId) => {
    setTasks((prev) => ({
      ...prev,
      [phaseId]: (prev[phaseId] || []).filter((t) => t.id !== taskId),
    }));
  };

  const handleAddTask = () => {
    const text = newTaskText.trim();
    if (!text) return;
    const id = `${activePhase}-${Date.now()}`;
    setTasks((prev) => ({
      ...prev,
      [activePhase]: [...(prev[activePhase] || []), { id, text, done: false, notes: "" }],
    }));
    setNewTaskText("");
  };

  const handleReset = () => {
    setTasks(createDefaultTasks());
    setMoveDate("");
    setMoveType("local");
    setHomeSize("2bhk");
    setHasPets(false);
    setHasChildren(false);
    setActivePhase("8weeks");
    setNewTaskText("");
  };

  const handleLoadSample = () => {
    setTasks(createSampleTasks());
    setMoveDate("2026-09-15");
    setMoveType("interstate");
    setHomeSize("2bhk");
    setHasPets(true);
    setHasChildren(false);
  };

  return (
    <div className="bg-[var(--background)] text-[var(--foreground)] transition-colors py-6 px-4">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
            <Truck className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Moving Checklist Builder
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-[var(--muted-foreground)]">
            Plan every detail of your move. Get a personalised checklist organised by phase, track your progress, and move with confidence.
          </p>
        </header>

        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard
            icon={Calendar}
            label="Days Until Move"
            value={daysUntilMove !== null ? daysUntilMove.toString() : "—"}
            detail={moveDate ? formatDate(moveDate) : "Set a date above"}
            tone={daysUntilMove !== null && daysUntilMove <= 14 ? "watch" : "default"}
          />
          <MetricCard
            icon={CheckCircle2}
            label="Progress"
            value={`${completionPct}%`}
            detail={`${totalDone} of ${totalTasks} tasks`}
            tone={completionPct === 100 ? "good" : completionPct >= 50 ? "default" : "watch"}
          />
          <MetricCard
            icon={Box}
            label="Remaining"
            value={(totalTasks - totalDone).toString()}
            detail="Tasks to complete"
            tone={totalTasks - totalDone === 0 ? "good" : "default"}
          />
          <MetricCard
            icon={Truck}
            label="Move Type"
            value={getMoveTypeLabel(moveType)}
            detail={`${getHomeSizeLabel(homeSize)} • ${hasPets ? "Pets" : "No pets"}`}
          />
        </div>

        {/* Setup Section */}
        <SectionCard title="Move Setup" icon={Clipboard} action={
          <button onClick={handleLoadSample} className="rounded-lg bg-[var(--primary)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors">
            Load Sample
          </button>
        }>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Move Date" icon={Calendar}>
              <input
                type="date"
                value={moveDate}
                onChange={(e) => setMoveDate(e.target.value)}
                className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
              />
            </Field>
            <Field label="Move Type" icon={Truck}>
              <select
                value={moveType}
                onChange={(e) => setMoveType(e.target.value)}
                className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
              >
                {MOVE_TYPES.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Home Size" icon={Home}>
              <select
                value={homeSize}
                onChange={(e) => setHomeSize(e.target.value)}
                className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
              >
                {HOME_SIZES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </Field>
            <label className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <input
                type="checkbox"
                checked={hasPets}
                onChange={(e) => setHasPets(e.target.checked)}
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
              />
              <span className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                <PawPrint className="h-4 w-4 text-[var(--primary)]" />
                Has Pets
              </span>
            </label>
            <label className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <input
                type="checkbox"
                checked={hasChildren}
                onChange={(e) => setHasChildren(e.target.checked)}
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
              />
              <span className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                <Users className="h-4 w-4 text-[var(--primary)]" />
                Has Children
              </span>
            </label>
          </div>
        </SectionCard>

        {/* Charts + Export */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <SectionCard title="Tasks by Phase" icon={BarChart3} action={
            <button onClick={() => exportCsv(moveDate, moveType, homeSize, hasPets, hasChildren, tasks)} className="flex items-center gap-1.5 rounded-lg bg-[var(--primary)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors">
              <Download className="h-3.5 w-3.5" />
              CSV
            </button>
          }>
            <div className="h-64">
              <SafeResponsiveContainer width="100%" height="100%">
                <BarChart data={phaseChart} layout="vertical" margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={110}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  />
                  <Tooltip content={<TooltipContent />} />
                  <Bar dataKey="done" stackId="a" fill="#059669" radius={[0, 0, 0, 0]} name="Done" />
                  <Bar dataKey="remaining" stackId="a" fill="#e5e7eb" radius={[0, 4, 4, 0]} name="Remaining" />
                </BarChart>
              </SafeResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard title="Overall Completion" icon={CheckCircle2}>
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="h-52 w-52">
                <SafeResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={completionPie}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {completionPie.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<TooltipContent />} />
                  </PieChart>
                </SafeResponsiveContainer>
              </div>
              <div className="text-center">
                <p className="text-4xl font-extrabold text-[var(--foreground)]">{completionPct}%</p>
                <p className="text-sm text-[var(--muted-foreground)]">{totalDone} of {totalTasks} tasks complete</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Phase Progress" icon={BarChart3}>
            <div className="space-y-3">
              {PHASES.map((phase) => {
                const phaseTasks = tasks[phase.id] || [];
                const done = phaseTasks.filter((t) => t.done).length;
                const total = phaseTasks.length;
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                return (
                  <div key={phase.id} className="min-w-0">
                    <div className="mb-1 flex items-center justify-between text-xs font-semibold">
                      <span className="truncate text-[var(--foreground)]">{phase.label}</span>
                      <span className="shrink-0 text-[var(--muted-foreground)]">{done}/{total}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--section-highlight)]">
                      <div
                        className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </div>

        {/* Phase Tabs + Checklist */}
        <div className="mt-6">
          <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
            {PHASES.map((phase) => {
              const phaseTasks = tasks[phase.id] || [];
              const done = phaseTasks.filter((t) => t.done).length;
              const total = phaseTasks.length;
              const isActive = activePhase === phase.id;
              return (
                <button
                  key={phase.id}
                  onClick={() => setActivePhase(phase.id)}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-[var(--primary)] text-white shadow-md"
                      : "bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--section-highlight)] border border-[var(--border)]"
                  }`}
                >
                  <span>{phase.label}</span>
                  <span className={`ml-1 rounded-full px-2 py-0.5 text-xs ${
                    isActive ? "bg-white/20" : "bg-[var(--section-highlight)]"
                  }`}>
                    {done}/{total}
                  </span>
                </button>
              );
            })}
          </div>

          <SectionCard title={activePhaseData.label} icon={Box}>
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                placeholder="Add a custom task..."
                className="h-11 flex-1 min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none transition focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
              />
              <button
                onClick={handleAddTask}
                className="btn-primary h-11 shrink-0 rounded-lg px-5 text-sm font-semibold"
              >
                Add
              </button>
            </div>

            {activePhaseData.tasks.length === 0 ? (
              <div className="py-8 text-center text-sm text-[var(--muted-foreground)]">
                No tasks in this phase. Add one above.
              </div>
            ) : (
              <ul className="space-y-2">
                {activePhaseData.tasks.map((task) => (
                  <li
                    key={task.id}
                    className={`group flex items-start gap-3 rounded-xl border px-4 py-3 transition-all ${
                      task.done
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]/30"
                    }`}
                  >
                    <button
                      onClick={() => handleToggleTask(activePhase, task.id)}
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all ${
                        task.done
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-[var(--border)] hover:border-[var(--primary)]"
                      }`}
                    >
                      {task.done && (
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium leading-5 ${task.done ? "text-[var(--muted-foreground)] line-through" : "text-[var(--foreground)]"}`}>
                        {task.text}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteTask(activePhase, task.id)}
                      className="shrink-0 rounded p-1 text-[var(--muted-foreground)] opacity-0 transition-opacity hover:text-rose-500 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>

        {/* Tips */}
        <SectionCard title="Moving Tips" icon={AlertTriangle} action={
          <button onClick={handleReset} className="flex items-center gap-1.5 rounded-lg bg-[var(--primary)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors">
            <RefreshCcw className="h-3.5 w-3.5" />
            Reset All
          </button>
        }>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
              <p className="mb-1 text-sm font-bold text-[var(--foreground)]">Pack a "First Night" Box</p>
              <p className="text-sm text-[var(--muted-foreground)]">
                Sheets, towels, phone chargers, snacks, and basic toiletries. Keep it with you, not on the truck.
              </p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
              <p className="mb-1 text-sm font-bold text-[var(--foreground)]">Photograph Electronics Setup</p>
              <p className="text-sm text-[var(--muted-foreground)]">
                Take a picture of the back of your TV, router, and entertainment centre before unplugging. Saves hours of guesswork.
              </p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
              <p className="mb-1 text-sm font-bold text-[var(--foreground)]">Use Colour-Coded Labels</p>
              <p className="text-sm text-[var(--muted-foreground)]">
                Assign a colour to each room. Matches boxes to their destination — movers can work faster without asking questions.
              </p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
              <p className="mb-1 text-sm font-bold text-[var(--foreground)]">Keep Valuables With You</p>
              <p className="text-sm text-[var(--muted-foreground)]">
                Important documents, jewellery, medications, and irreplaceable items should travel in your personal vehicle.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* Footer Note */}
        <p className="mt-6 text-center text-xs text-[var(--muted-foreground)]">
          All data is processed in your browser and never uploaded. Your moving details stay private.
        </p>
      </div>
    </div>
  );
}
