"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  Bell,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  CircleDot,
  Copy,
  Download,
  ExternalLink,
  Filter,
  Flag,
  Gauge,
  LineChart,
  ListChecks,
  Plus,
  Printer,
  RotateCcw,
  Search,
  Sparkles,
  Target,
  Trophy,
  Trash2,
  X,
} from "lucide-react";

const STORAGE_KEY = "altftools:smart-goal-planner:v1";
const categories = ["Career", "Business", "Learning", "Health", "Finance", "Personal", "Custom"];
const priorities = ["High", "Medium", "Low"];
const statuses = ["Active", "Completed", "Paused"];
const sortOptions = ["updated", "deadline", "progress", "priority", "title"];
const generatorCategories = ["Technical Skills", "Career Growth", "Leadership", "Productivity", "Business", "Learning", "Health", "Personal"];
const generatorTimeframes = [
  { label: "Quarterly (3 months)", months: 3 },
  { label: "6 months", months: 6 },
  { label: "Annual (12 months)", months: 12 },
  { label: "30 days", months: 1 },
];

const defaultState = {
  goals: [],
  activeGoalId: null,
  filters: { query: "", status: "All", priority: "All", category: "All", sort: "updated" },
  notificationsEnabled: false,
  reminderLeadDays: 3,
};

const emptyGoalForm = {
  title: "",
  specific: "",
  measurable: "",
  achievable: "",
  relevant: "",
  startDate: "",
  deadline: "",
  category: "Career",
  customCategory: "",
  priority: "Medium",
  notes: "",
};

const emptyTask = { title: "", dueDate: "", priority: "Medium", completed: false, notes: "" };
const emptyMilestone = { title: "", date: "", completed: false, notes: "" };

const priorityStyles = {
  High: "border-rose-500/25 bg-rose-500/12 text-rose-500",
  Medium: "border-amber-500/25 bg-amber-500/12 text-amber-500",
  Low: "border-emerald-500/25 bg-emerald-500/12 text-emerald-500",
};

const healthStyles = {
  Excellent: "text-emerald-500",
  Healthy: "text-cyan-500",
  Watch: "text-amber-500",
  Risk: "text-rose-500",
  Done: "text-emerald-500",
};

const showcase = [
  ["SMART Builder", "Validate every goal against specific, measurable, achievable, relevant, and time-bound criteria."],
  ["Live Timeline", "Milestones, deadlines, and task dates reshape the planner as soon as you edit them."],
  ["Progress Engine", "Completion, health, success rate, and overdue work are calculated from your real goals."],
  ["Reports", "Copy, export, or print a structured goal review whenever you need a clean summary."],
];

const faqs = [
  ["Where is my data saved?", "Everything is stored in this browser with localStorage. No backend or account is required."],
  ["How is progress calculated?", "Goal progress combines completed tasks and milestones. If a goal has no child items, it stays at 0% until you add them."],
  ["Do reminders work without browser permission?", "Yes. Browser notifications are optional; in-app alerts still appear for upcoming and overdue dates."],
];

const smartBenefits = [
  ["You know when you are done", "Measurable outcomes and deadlines make completion visible instead of vague."],
  ["Cleaner progress reviews", "Tasks, milestones, and reports make conversations with managers or teams easier."],
  ["Goals stay realistic", "Achievable planning forces the goal into smaller actions you can actually finish."],
  ["Work stays relevant", "Each goal links back to the reason it matters, so effort does not drift."],
];

const smartTips = [
  "Start with what success looks like before filling the SMART fields.",
  "Break longer goals into monthly or quarterly milestones.",
  "Update the plan when context changes instead of abandoning the goal.",
];

const relatedTools = [
  {
    title: "OKR Generator",
    text: "Generate objectives with measurable key results and suggested initiatives for any team.",
    href: "/tools/all/okr-generator",
    icon: CircleDot,
    tone: "from-amber-200 via-sky-100 to-violet-200",
  },
  {
    title: "Sprint Goal Generator",
    text: "Create clear sprint goals with measurable outcomes for agile planning sessions.",
    href: "/tools/all/sprint-goal-generator",
    icon: Flag,
    tone: "from-sky-200 via-indigo-100 to-emerald-100",
  },
  {
    title: "Definition of Done Generator",
    text: "Build a practical completion checklist tailored to project scope, quality, and delivery needs.",
    href: "/tools/all/definition-of-done-generator",
    icon: ListChecks,
    tone: "from-blue-200 via-cyan-100 to-violet-200",
  },
];

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function daysUntil(value) {
  const date = parseDate(value);
  if (!date) return null;
  const today = parseDate(todayKey());
  return Math.ceil((date - today) / 86400000);
}

function categoryLabel(goal) {
  return goal.category === "Custom" && goal.customCategory ? goal.customCategory : goal.category;
}

function sanitizeState(data) {
  const merged = { ...defaultState, ...(data || {}) };
  const goals = Array.isArray(merged.goals) ? merged.goals : [];
  return {
    ...merged,
    goals: goals.map((goal) => ({
      tasks: [],
      milestones: [],
      status: "Active",
      notes: "",
      notifiedKeys: [],
      ...goal,
    })),
    filters: { ...defaultState.filters, ...(merged.filters || {}) },
    reminderLeadDays: Number(merged.reminderLeadDays ?? 3),
  };
}

function calculateGoal(goal) {
  const tasks = goal.tasks || [];
  const milestones = goal.milestones || [];
  const totalItems = tasks.length + milestones.length;
  const completedItems = tasks.filter((task) => task.completed).length + milestones.filter((item) => item.completed).length;
  const progress = totalItems ? Math.round((completedItems / totalItems) * 100) : goal.status === "Completed" ? 100 : 0;
  const deadlineDays = daysUntil(goal.deadline);
  const overdueTasks = tasks.filter((task) => !task.completed && daysUntil(task.dueDate) !== null && daysUntil(task.dueDate) < 0).length;
  const overdueMilestones = milestones.filter((item) => !item.completed && daysUntil(item.date) !== null && daysUntil(item.date) < 0).length;
  const overdue = overdueTasks + overdueMilestones + (goal.status !== "Completed" && deadlineDays !== null && deadlineDays < 0 ? 1 : 0);
  const upcomingMilestones = milestones.filter((item) => !item.completed && daysUntil(item.date) !== null && daysUntil(item.date) >= 0).sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const status = progress >= 100 || goal.status === "Completed" ? "Done" : overdue ? "Risk" : deadlineDays !== null && deadlineDays <= 7 && progress < 70 ? "Watch" : progress >= 70 ? "Excellent" : "Healthy";
  return { totalItems, completedItems, progress, deadlineDays, overdue, overdueTasks, overdueMilestones, upcomingMilestones, health: status };
}

function buildReport(goals, analytics) {
  const lines = goals.map((goal) => {
    const calc = calculateGoal(goal);
    const tasks = goal.tasks.map((task) => `  - [${task.completed ? "x" : " "}] ${task.title}${task.dueDate ? ` (${task.dueDate})` : ""}`).join("\n") || "  No tasks";
    const milestones = goal.milestones.map((item) => `  - [${item.completed ? "x" : " "}] ${item.title}${item.date ? ` (${item.date})` : ""}`).join("\n") || "  No milestones";
    return `${goal.title}
Category: ${categoryLabel(goal)} | Priority: ${goal.priority} | Status: ${goal.status}
Progress: ${calc.progress}% | Health: ${calc.health} | Deadline: ${goal.deadline || "Not set"}
SMART:
Specific: ${goal.specific}
Measurable: ${goal.measurable}
Achievable: ${goal.achievable}
Relevant: ${goal.relevant}
Tasks:
${tasks}
Milestones:
${milestones}
Notes: ${goal.notes || "No notes"}`;
  });
  return `SMART Goal Planner Report
Generated: ${new Date().toLocaleString()}

Goals: ${analytics.total}
Active: ${analytics.active}
Completed: ${analytics.completed}
Average Progress: ${analytics.averageProgress}%
Goal Health: ${analytics.healthScore}%
Overdue Items: ${analytics.overdueItems}

${lines.join("\n\n---\n\n") || "No goals created yet."}`;
}

function addMonths(date, months) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next.toISOString().slice(0, 10);
}

function cleanContext(value) {
  return value.trim().replace(/\s+/g, " ");
}

function makeGeneratedGoal({ context, category, timeframe }) {
  const clean = cleanContext(context);
  const timeframeMeta = generatorTimeframes.find((item) => item.label === timeframe) || generatorTimeframes[0];
  const startDate = todayKey();
  const deadline = addMonths(new Date(), timeframeMeta.months);
  const topic = clean.length > 88 ? `${clean.slice(0, 88).trim()}...` : clean;
  const categoryMap = {
    "Technical Skills": "Learning",
    "Career Growth": "Career",
    Leadership: "Career",
    Productivity: "Personal",
    Business: "Business",
    Learning: "Learning",
    Health: "Health",
    Personal: "Personal",
  };

  return {
    title: `${category}: ${topic}`,
    specific: `Focus on ${clean} with one clearly defined outcome and a weekly execution rhythm.`,
    measurable: `Track progress with weekly checkpoints, completed action steps, and a final success review by ${deadline}.`,
    achievable: `Break the goal into manageable milestones, protect time each week, and adjust scope if blockers appear.`,
    relevant: `This goal supports the ${category.toLowerCase()} priority described in your context and keeps effort connected to a useful outcome.`,
    startDate,
    deadline,
    category: categoryMap[category] || "Personal",
    customCategory: "",
    priority: timeframeMeta.months <= 3 ? "High" : "Medium",
    notes: `Generated from context: ${clean}`,
    timeframeMonths: timeframeMeta.months,
    actionSteps: [
      "Define the exact success metric and baseline.",
      "Create the first milestone and complete the first visible action.",
      "Review progress weekly and update tasks based on evidence.",
      "Prepare a final summary with results, blockers, and next steps.",
    ],
  };
}

export default function SmartGoalPlannerApp() {
  const [state, setState] = useState(() => {
    if (typeof window === "undefined") return defaultState;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? sanitizeState(JSON.parse(saved)) : defaultState;
    } catch {
      return defaultState;
    }
  });
  const [goalForm, setGoalForm] = useState(emptyGoalForm);
  const [taskForm, setTaskForm] = useState(emptyTask);
  const [milestoneForm, setMilestoneForm] = useState(emptyMilestone);
  const [generator, setGenerator] = useState({ context: "", category: "Technical Skills", timeframe: "Quarterly (3 months)" });
  const [generatedGoal, setGeneratedGoal] = useState(null);
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState("");
  const [openFaq, setOpenFaq] = useState(0);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const activeGoal = useMemo(() => state.goals.find((goal) => goal.id === state.activeGoalId) || null, [state.activeGoalId, state.goals]);

  const goalCalculations = useMemo(() => new Map(state.goals.map((goal) => [goal.id, calculateGoal(goal)])), [state.goals]);

  const analytics = useMemo(() => {
    const total = state.goals.length;
    const completed = state.goals.filter((goal) => calculateGoal(goal).progress >= 100 || goal.status === "Completed").length;
    const active = state.goals.filter((goal) => goal.status === "Active" && calculateGoal(goal).progress < 100).length;
    const progressSum = state.goals.reduce((sum, goal) => sum + calculateGoal(goal).progress, 0);
    const overdueItems = state.goals.reduce((sum, goal) => sum + calculateGoal(goal).overdue, 0);
    const healthScore = total ? Math.max(0, Math.round(100 - (overdueItems / Math.max(total, 1)) * 18 + (completed / total) * 12)) : 0;
    const averageProgress = total ? Math.round(progressSum / total) : 0;
    const successRate = total ? Math.round((completed / total) * 100) : 0;
    const taskTotal = state.goals.reduce((sum, goal) => sum + goal.tasks.length, 0);
    const taskDone = state.goals.reduce((sum, goal) => sum + goal.tasks.filter((task) => task.completed).length, 0);
    const milestoneTotal = state.goals.reduce((sum, goal) => sum + goal.milestones.length, 0);
    const milestoneDone = state.goals.reduce((sum, goal) => sum + goal.milestones.filter((item) => item.completed).length, 0);
    return { total, completed, active, averageProgress, successRate, overdueItems, healthScore: Math.min(100, healthScore), taskTotal, taskDone, milestoneTotal, milestoneDone };
  }, [state.goals]);

  const filteredGoals = useMemo(() => {
    const query = state.filters.query.trim().toLowerCase();
    const priorityRank = { High: 0, Medium: 1, Low: 2 };
    return state.goals
      .filter((goal) => {
        const calc = goalCalculations.get(goal.id) || calculateGoal(goal);
        const text = `${goal.title} ${goal.specific} ${goal.measurable} ${goal.achievable} ${goal.relevant} ${goal.notes} ${goal.tasks.map((task) => task.title).join(" ")} ${goal.milestones.map((item) => item.title).join(" ")}`.toLowerCase();
        return (
          (!query || text.includes(query)) &&
          (state.filters.status === "All" || goal.status === state.filters.status || calc.health === state.filters.status) &&
          (state.filters.priority === "All" || goal.priority === state.filters.priority) &&
          (state.filters.category === "All" || goal.category === state.filters.category)
        );
      })
      .sort((a, b) => {
        if (state.filters.sort === "deadline") return String(a.deadline || "9999").localeCompare(String(b.deadline || "9999"));
        if (state.filters.sort === "progress") return (goalCalculations.get(b.id)?.progress || 0) - (goalCalculations.get(a.id)?.progress || 0);
        if (state.filters.sort === "priority") return priorityRank[a.priority] - priorityRank[b.priority];
        if (state.filters.sort === "title") return a.title.localeCompare(b.title);
        return String(b.updatedAt).localeCompare(String(a.updatedAt));
      });
  }, [goalCalculations, state.filters, state.goals]);

  const activeCalc = activeGoal ? goalCalculations.get(activeGoal.id) || calculateGoal(activeGoal) : null;
  const report = useMemo(() => buildReport(state.goals, analytics), [analytics, state.goals]);

  const notify = useCallback(
    (title, body) => {
      if (state.notificationsEnabled && typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification(title, { body });
      }
      setToast(`${title} - ${body}`);
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setToast(""), 5000);
    },
    [state.notificationsEnabled],
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const lead = Number(state.reminderLeadDays || 0);
      state.goals.forEach((goal) => {
        const calc = calculateGoal(goal);
        const key = `${todayKey()}:goal:${goal.id}:${goal.deadline}`;
        if (goal.status !== "Completed" && calc.deadlineDays !== null && calc.deadlineDays <= lead && !goal.notifiedKeys?.includes(key)) {
          notify(calc.deadlineDays < 0 ? `Overdue goal: ${goal.title}` : `Goal due soon: ${goal.title}`, goal.deadline || "No deadline");
          setState((current) => ({
            ...current,
            goals: current.goals.map((item) => item.id === goal.id ? { ...item, notifiedKeys: [...(item.notifiedKeys || []), key] } : item),
          }));
        }
      });
    }, 30000);
    return () => {
      clearInterval(timer);
      clearTimeout(toastTimerRef.current);
    };
  }, [notify, state.goals, state.reminderLeadDays]);

  function validateGoal(form) {
    if (!form.title.trim()) return "Goal title is required.";
    if (!form.specific.trim()) return "Specific goal detail is required.";
    if (!form.measurable.trim()) return "Measurable outcome is required.";
    if (!form.achievable.trim()) return "Achievable plan is required.";
    if (!form.relevant.trim()) return "Relevant objective is required.";
    if (!form.startDate) return "Start date is required.";
    if (!form.deadline) return "Deadline is required.";
    if (parseDate(form.deadline) < parseDate(form.startDate)) return "Deadline must be after the start date.";
    return "";
  }

  function saveGoal(event) {
    event.preventDefault();
    const error = validateGoal(goalForm);
    if (error) return setMessage(error);
    const goal = {
      id: makeId(),
      ...goalForm,
      title: goalForm.title.trim(),
      specific: goalForm.specific.trim(),
      measurable: goalForm.measurable.trim(),
      achievable: goalForm.achievable.trim(),
      relevant: goalForm.relevant.trim(),
      customCategory: goalForm.customCategory.trim().slice(0, 32),
      notes: goalForm.notes.trim(),
      status: "Active",
      tasks: [],
      milestones: [],
      notifiedKeys: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setState((current) => ({ ...current, goals: [goal, ...current.goals], activeGoalId: goal.id }));
    setGoalForm(emptyGoalForm);
    setMessage("SMART goal created.");
  }

  function generateSmartGoal(event) {
    event.preventDefault();
    if (!generator.context.trim()) {
      setMessage("Add your context before generating a SMART goal.");
      return;
    }
    const draft = makeGeneratedGoal(generator);
    setGeneratedGoal(draft);
    setGoalForm({
      title: draft.title,
      specific: draft.specific,
      measurable: draft.measurable,
      achievable: draft.achievable,
      relevant: draft.relevant,
      startDate: draft.startDate,
      deadline: draft.deadline,
      category: draft.category,
      customCategory: draft.customCategory,
      priority: draft.priority,
      notes: draft.notes,
    });
    setMessage("SMART goal draft generated. Review it or add it to your planner.");
  }

  function addGeneratedGoal() {
    if (!generatedGoal) return;
    const tasks = generatedGoal.actionSteps.map((title, index) => ({
      id: makeId(),
      title,
      dueDate: addMonths(new Date(), Math.max(1, Math.ceil(((index + 1) / generatedGoal.actionSteps.length) * generatedGoal.timeframeMonths))),
      priority: index === 0 ? "High" : "Medium",
      completed: false,
      notes: "",
    }));
    const milestoneCount = generatedGoal.actionSteps.length;
    const milestones = generatedGoal.actionSteps.map((title, index) => ({
      id: makeId(),
      title: `Milestone ${index + 1}: ${title}`,
      date: addMonths(new Date(), Math.max(1, Math.ceil(((index + 1) / milestoneCount) * generatedGoal.timeframeMonths))),
      completed: false,
      notes: "",
    }));
    const goal = {
      id: makeId(),
      title: generatedGoal.title,
      specific: generatedGoal.specific,
      measurable: generatedGoal.measurable,
      achievable: generatedGoal.achievable,
      relevant: generatedGoal.relevant,
      startDate: generatedGoal.startDate,
      deadline: generatedGoal.deadline,
      category: generatedGoal.category,
      customCategory: generatedGoal.customCategory,
      priority: generatedGoal.priority,
      notes: generatedGoal.notes,
      status: "Active",
      tasks,
      milestones,
      notifiedKeys: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setState((current) => ({ ...current, goals: [goal, ...current.goals], activeGoalId: goal.id }));
    setMessage("Generated SMART goal added with action steps and milestones.");
  }

  function patchGoal(id, patch) {
    setState((current) => ({
      ...current,
      goals: current.goals.map((goal) => goal.id === id ? { ...goal, ...patch, updatedAt: new Date().toISOString() } : goal),
    }));
  }

  function deleteGoal(id) {
    setState((current) => ({
      ...current,
      goals: current.goals.filter((goal) => goal.id !== id),
      activeGoalId: current.activeGoalId === id ? null : current.activeGoalId,
    }));
  }

  function addTask(event) {
    event.preventDefault();
    if (!activeGoal) return setMessage("Create or select a goal first.");
    if (!taskForm.title.trim()) return setMessage("Task title is required.");
    patchGoal(activeGoal.id, { tasks: [{ ...taskForm, id: makeId(), title: taskForm.title.trim(), notes: taskForm.notes.trim() }, ...activeGoal.tasks] });
    setTaskForm(emptyTask);
  }

  function addMilestone(event) {
    event.preventDefault();
    if (!activeGoal) return setMessage("Create or select a goal first.");
    if (!milestoneForm.title.trim()) return setMessage("Milestone title is required.");
    if (!milestoneForm.date) return setMessage("Milestone date is required.");
    patchGoal(activeGoal.id, { milestones: [{ ...milestoneForm, id: makeId(), title: milestoneForm.title.trim(), notes: milestoneForm.notes.trim() }, ...activeGoal.milestones] });
    setMilestoneForm(emptyMilestone);
  }

  async function enableNotifications() {
    if (typeof Notification === "undefined") {
      setMessage("Browser notifications are not supported here. In-app alerts will still work.");
      return;
    }
    const permission = await Notification.requestPermission();
    setState((current) => ({ ...current, notificationsEnabled: permission === "granted" }));
    setMessage(permission === "granted" ? "Browser reminders enabled." : "In-app alerts will still work.");
  }

  async function copyReport() {
    await navigator.clipboard.writeText(report);
    setMessage("Goal report copied.");
  }

  function exportReport() {
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "smart-goal-planner-report.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  const progressData = state.goals.map((goal) => ({ name: goal.title.slice(0, 18) || "Goal", progress: goalCalculations.get(goal.id)?.progress || 0 }));
  const completionData = [
    { name: "Done tasks", value: analytics.taskDone, color: "#10b981" },
    { name: "Pending tasks", value: Math.max(analytics.taskTotal - analytics.taskDone, 0), color: "#38bdf8" },
    { name: "Done milestones", value: analytics.milestoneDone, color: "#8b5cf6" },
    { name: "Pending milestones", value: Math.max(analytics.milestoneTotal - analytics.milestoneDone, 0), color: "#f59e0b" },
  ].filter((item) => item.value > 0);
  const timelineData = state.goals
    .filter((goal) => goal.deadline)
    .sort((a, b) => String(a.deadline).localeCompare(String(b.deadline)))
    .map((goal) => ({ name: goal.deadline.slice(5), progress: goalCalculations.get(goal.id)?.progress || 0 }));

  return (
    <div className="smart-goal-planner min-h-screen overflow-x-hidden bg-(--background) px-4 py-6 font-secondary text-(--foreground)">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="mb-5 overflow-hidden bg-(--background) text-center text-(--primary)">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-5">
            <div className="min-w-0">
              <h1 className="heading mx-auto flex max-w-4xl items-center justify-center gap-2 break-words">
                <Target className="hidden h-10 w-10 shrink-0 sm:block" />
                SMART Goal Planner
              </h1>
              <p className="description mt-1 mb-1 text-(--secondary)">
                Create SMART goals, manage milestones, track progress, and export goal reports
              </p>
            </div>
            <div className="grid w-full max-w-2xl min-w-0 grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat label="Goals" value={analytics.total} />
              <Stat label="Active" value={analytics.active} />
              <Stat label="Progress" value={`${analytics.averageProgress}%`} />
              <Stat label="Health" value={`${analytics.healthScore}%`} />
            </div>
          </div>
        </header>

        {(message || toast) && (
          <div className="flex items-start justify-between gap-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-700 dark:text-cyan-100">
            <span className="min-w-0 break-words">{toast || message}</span>
            <button onClick={() => { setMessage(""); setToast(""); }} className="shrink-0 rounded-full p-1 hover:bg-cyan-500/10"><X className="h-4 w-4" /></button>
          </div>
        )}

        <main id="smart-goal-workspace" className="mx-auto max-w-7xl overflow-hidden rounded-xl bg-(--card) py-5 shadow-lg">
          <div className="space-y-5 p-4 sm:p-6">
            <section className="grid min-w-0 gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="min-w-0 space-y-5">
            <Panel title="Generate SMART Goal" icon={Trophy}>
              <form onSubmit={generateSmartGoal} className="space-y-3">
                <Field
                  label="Your context"
                  value={generator.context}
                  onChange={(value) => setGenerator({ ...generator, context: value })}
                  textarea
                  placeholder="I'm a senior software engineer working on a payments team. I want to improve my technical leadership skills and start mentoring junior developers..."
                />
                <p className="break-words text-sm leading-relaxed text-muted-foreground">
                  Describe your current role, what you want to achieve, and any relevant context about your situation.
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <Select
                    label="Goal category"
                    value={generator.category}
                    onChange={(value) => setGenerator({ ...generator, category: value })}
                    options={generatorCategories}
                  />
                  <Select
                    label="Timeframe"
                    value={generator.timeframe}
                    onChange={(value) => setGenerator({ ...generator, timeframe: value })}
                    options={generatorTimeframes.map((item) => item.label)}
                  />
                </div>
                <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-(--primary) px-4 py-3 text-sm font-black text-(--primary-foreground) transition hover:bg-(--primary-hover)">
                  <Sparkles className="h-4 w-4" /> Generate SMART Goal
                </button>
              </form>
              {!generatedGoal && (
                <div className="overflow-hidden rounded-2xl border border-(--border) bg-(--background)">
                  <SmartGoalVisual />
                  <div className="border-t border-(--border) p-4 text-center">
                    <h3 className="break-words text-lg font-black">Ready to Generate SMART Goals?</h3>
                    <p className="mt-2 break-words text-sm leading-relaxed text-muted-foreground">
                      Add your context and this tool will create a complete SMART goal with a breakdown and action steps.
                    </p>
                  </div>
                </div>
              )}
              {generatedGoal && (
                <div className="space-y-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/8 p-3">
                  <div className="min-w-0">
                    <div className="text-[10px] font-black uppercase tracking-[.16em] text-cyan-500">Generated draft</div>
                    <h3 className="mt-1 break-words text-base font-black text-(--foreground)">{generatedGoal.title}</h3>
                    <p className="mt-1 break-words text-xs leading-relaxed text-muted-foreground">{generatedGoal.measurable}</p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {[
                      ["Specific", generatedGoal.specific],
                      ["Measurable", generatedGoal.measurable],
                      ["Achievable", generatedGoal.achievable],
                      ["Relevant", generatedGoal.relevant],
                      ["Time-bound", `Start ${generatedGoal.startDate} and finish by ${generatedGoal.deadline}.`],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl border border-(--border) bg-(--background) p-3">
                        <div className="text-[10px] font-black uppercase tracking-[.16em] text-cyan-500">{label}</div>
                        <p className="mt-1 break-words text-xs leading-relaxed text-muted-foreground">{value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="text-[10px] font-black uppercase tracking-[.16em] text-muted-foreground sm:col-span-2">Action steps</div>
                    {generatedGoal.actionSteps.map((step, index) => (
                      <div key={step} className="flex min-w-0 gap-2 rounded-xl border border-(--border) bg-(--background) p-2 text-xs">
                        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-cyan-500/10 font-black text-cyan-500">{index + 1}</span>
                        <span className="min-w-0 break-words text-muted-foreground">{step}</span>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={addGeneratedGoal} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-sm font-black text-cyan-600 transition hover:bg-cyan-500/20 dark:text-cyan-300">
                    <Plus className="h-4 w-4" /> Use in planner
                  </button>
                </div>
              )}
            </Panel>

            <Panel title="Create SMART Goal" icon={Target}>
              <form onSubmit={saveGoal} className="space-y-3">
                <Field label="Goal title" value={goalForm.title} onChange={(value) => setGoalForm({ ...goalForm, title: value })} placeholder="Launch a portfolio site" />
                <Field label="Specific" value={goalForm.specific} onChange={(value) => setGoalForm({ ...goalForm, specific: value })} textarea />
                <Field label="Measurable" value={goalForm.measurable} onChange={(value) => setGoalForm({ ...goalForm, measurable: value })} textarea />
                <Field label="Achievable" value={goalForm.achievable} onChange={(value) => setGoalForm({ ...goalForm, achievable: value })} textarea />
                <Field label="Relevant" value={goalForm.relevant} onChange={(value) => setGoalForm({ ...goalForm, relevant: value })} textarea />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Start" type="date" value={goalForm.startDate} onChange={(value) => setGoalForm({ ...goalForm, startDate: value })} />
                  <Field label="Deadline" type="date" value={goalForm.deadline} onChange={(value) => setGoalForm({ ...goalForm, deadline: value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Select label="Category" value={goalForm.category} onChange={(value) => setGoalForm({ ...goalForm, category: value })} options={categories} />
                  <Select label="Priority" value={goalForm.priority} onChange={(value) => setGoalForm({ ...goalForm, priority: value })} options={priorities} />
                </div>
                {goalForm.category === "Custom" && <Field label="Custom category" value={goalForm.customCategory} onChange={(value) => setGoalForm({ ...goalForm, customCategory: value })} />}
                <Field label="Notes" value={goalForm.notes} onChange={(value) => setGoalForm({ ...goalForm, notes: value })} textarea />
                <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-(--primary) px-4 py-3 text-sm font-black text-(--primary-foreground) transition hover:bg-(--primary-hover)">
                  <Plus className="h-4 w-4" /> Create goal
                </button>
              </form>
            </Panel>

            {activeGoal && (
              <Panel title="Reports" icon={Download}>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={copyReport} className="inline-flex min-w-0 items-center justify-center gap-2 rounded-xl bg-(--primary) px-3 py-2 text-sm font-bold text-(--primary-foreground)"><Copy className="h-4 w-4" /><span className="truncate">Copy</span></button>
                  <button onClick={exportReport} className="inline-flex min-w-0 items-center justify-center gap-2 rounded-xl border border-(--border) bg-(--background) px-3 py-2 text-sm font-bold hover:border-(--primary)"><Download className="h-4 w-4" /><span className="truncate">Export</span></button>
                  <button onClick={() => window.print()} className="inline-flex min-w-0 items-center justify-center gap-2 rounded-xl border border-(--border) bg-(--background) px-3 py-2 text-sm font-bold hover:border-(--primary)"><Printer className="h-4 w-4" /><span className="truncate">Print</span></button>
                  <button onClick={() => deleteGoal(activeGoal.id)} className="inline-flex min-w-0 items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm font-bold text-rose-500"><Trash2 className="h-4 w-4" /><span className="truncate">Delete</span></button>
                </div>
                <pre className="custom-scrollbar max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-(--border) bg-(--background) p-3 text-xs leading-relaxed text-muted-foreground">{report}</pre>
              </Panel>
            )}

          </aside>

          <section className="min-w-0 space-y-5">
            <Panel title="Goal Dashboard" icon={LineChart}>
              <div className="grid min-w-0 gap-3 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
                <MiniMetric icon={Target} label="Active goals" value={analytics.active} />
                <MiniMetric icon={CheckCircle2} label="Completed" value={analytics.completed} />
                <MiniMetric icon={Gauge} label="Avg progress" value={`${analytics.averageProgress}%`} />
                <MiniMetric icon={AlertTriangle} label="Overdue" value={analytics.overdueItems} />
              </div>
              <div className="grid w-full min-w-0 grid-cols-1 gap-4 2xl:grid-cols-[minmax(0,1.2fr)_minmax(0,.8fr)]">
                <ChartCard title="Goal progress">
                  {progressData.length ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={progressData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.18} />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="progress" fill="#38bdf8" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <EmptyState text="Goal progress chart appears after you create goals." />}
                </ChartCard>
                <ChartCard title="Completion mix">
                  {completionData.length ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={completionData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={82} paddingAngle={4}>
                          {completionData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <EmptyState text="Add tasks or milestones to build the completion chart." />}
                </ChartCard>
              </div>
            </Panel>

            {activeGoal ? (
              <div className="grid min-w-0 gap-5 2xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="min-w-0 space-y-5">
                  <Panel title="Selected Goal" icon={Sparkles}>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <input value={activeGoal.title} onChange={(event) => patchGoal(activeGoal.id, { title: event.target.value })} className="w-full rounded-xl border border-transparent bg-transparent px-1 py-1 text-2xl font-black outline-none focus:border-(--primary) focus:bg-(--background)" />
                        <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold">
                          <span className={`rounded-full border px-3 py-1 ${priorityStyles[activeGoal.priority]}`}>{activeGoal.priority}</span>
                          <span className={`rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 ${healthStyles[activeCalc.health]}`}>{activeCalc.health}</span>
                          <span className="rounded-full border border-(--border) bg-(--background) px-3 py-1 text-muted-foreground">{categoryLabel(activeGoal)}</span>
                          <span className="rounded-full border border-(--border) bg-(--background) px-3 py-1 text-muted-foreground">{activeGoal.deadline}</span>
                        </div>
                      </div>
                      <Ring value={activeCalc.progress} />
                    </div>
                    <ProgressBar value={activeCalc.progress} />
                    <div className="grid gap-3 md:grid-cols-2">
                      <SmartText label="Specific" value={activeGoal.specific} onChange={(value) => patchGoal(activeGoal.id, { specific: value })} />
                      <SmartText label="Measurable" value={activeGoal.measurable} onChange={(value) => patchGoal(activeGoal.id, { measurable: value })} />
                      <SmartText label="Achievable" value={activeGoal.achievable} onChange={(value) => patchGoal(activeGoal.id, { achievable: value })} />
                      <SmartText label="Relevant" value={activeGoal.relevant} onChange={(value) => patchGoal(activeGoal.id, { relevant: value })} />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Select label="Status" value={activeGoal.status} onChange={(value) => patchGoal(activeGoal.id, { status: value })} options={statuses} />
                      <Select label="Priority" value={activeGoal.priority} onChange={(value) => patchGoal(activeGoal.id, { priority: value })} options={priorities} />
                      <Field label="Deadline" type="date" value={activeGoal.deadline} onChange={(value) => patchGoal(activeGoal.id, { deadline: value, notifiedKeys: [] })} />
                    </div>
                  </Panel>

                  <Panel title="Task Breakdown" icon={ListChecks}>
                    <form onSubmit={addTask} className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_140px_120px_auto]">
                      <Field label="Task" value={taskForm.title} onChange={(value) => setTaskForm({ ...taskForm, title: value })} />
                      <Field label="Due" type="date" value={taskForm.dueDate} onChange={(value) => setTaskForm({ ...taskForm, dueDate: value })} />
                      <Select label="Priority" value={taskForm.priority} onChange={(value) => setTaskForm({ ...taskForm, priority: value })} options={priorities} />
                      <button className="self-end rounded-xl bg-(--primary) px-4 py-2.5 text-sm font-black text-(--primary-foreground) hover:bg-(--primary-hover)">Add</button>
                    </form>
                    <ItemList items={activeGoal.tasks} empty="No tasks yet." onPatch={(items) => patchGoal(activeGoal.id, { tasks: items })} type="task" />
                  </Panel>

                  <Panel title="Timeline Planner" icon={CalendarClock}>
                    <form onSubmit={addMilestone} className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_160px_auto]">
                      <Field label="Milestone" value={milestoneForm.title} onChange={(value) => setMilestoneForm({ ...milestoneForm, title: value })} />
                      <Field label="Date" type="date" value={milestoneForm.date} onChange={(value) => setMilestoneForm({ ...milestoneForm, date: value })} />
                      <button className="self-end rounded-xl bg-(--primary) px-4 py-2.5 text-sm font-black text-(--primary-foreground) hover:bg-(--primary-hover)">Add</button>
                    </form>
                    <ItemList items={activeGoal.milestones} empty="No milestones yet." onPatch={(items) => patchGoal(activeGoal.id, { milestones: items })} type="milestone" />
                    <div className="rounded-2xl border border-(--border) bg-(--background) p-3">
                      <div className="mb-3 text-xs font-black uppercase tracking-[.16em] text-muted-foreground">Timeline analytics</div>
                      {timelineData.length ? (
                        <ResponsiveContainer width="100%" height={180}>
                          <AreaChart data={timelineData}>
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                            <YAxis hide domain={[0, 100]} />
                            <Tooltip />
                            <Area type="monotone" dataKey="progress" stroke="#8b5cf6" fill="#8b5cf633" strokeWidth={3} />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : <EmptyState text="Add dated goals to see timeline analytics." />}
                    </div>
                  </Panel>
                </div>

                <div className="min-w-0 space-y-5">
                  <Panel title="Reminders" icon={Bell}>
                    <button onClick={enableNotifications} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-(--primary) px-3 py-2.5 text-sm font-black text-(--primary-foreground) hover:bg-(--primary-hover)">
                      <Bell className="h-4 w-4" /> Enable reminders
                    </button>
                    <Field label="Alert lead days" type="number" value={state.reminderLeadDays} onChange={(value) => setState((current) => ({ ...current, reminderLeadDays: Math.max(0, Number(value) || 0) }))} />
                    <div className="space-y-2">
                      {activeCalc.upcomingMilestones.slice(0, 5).map((item) => (
                        <div key={item.id} className="rounded-xl border border-(--border) bg-(--background) p-3">
                          <div className="break-words text-sm font-black">{item.title}</div>
                          <div className="mt-1 text-xs text-muted-foreground">{item.date} | {daysUntil(item.date)} days</div>
                        </div>
                      ))}
                      {!activeCalc.upcomingMilestones.length && <EmptyState text="Upcoming milestone alerts appear here." />}
                    </div>
                  </Panel>

                </div>
              </div>
            ) : (
              <Panel title="Workspace" icon={Sparkles}>
                <EmptyState text="Create a SMART goal or select a saved goal to open tasks, milestones, reminders, analytics, and reports." />
              </Panel>
            )}

            <Panel title="Search & Filters" icon={Filter}>
              <div className="relative">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <input value={state.filters.query} onChange={(event) => setState((current) => ({ ...current, filters: { ...current.filters, query: event.target.value } }))} placeholder="Search goals, tasks, milestones" className="w-full rounded-xl border border-(--border) bg-(--background) py-2.5 pl-10 pr-3 text-sm outline-none focus:border-(--primary)" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Select label="Status" value={state.filters.status} onChange={(value) => setState((current) => ({ ...current, filters: { ...current.filters, status: value } }))} options={["All", ...statuses, "Excellent", "Healthy", "Watch", "Risk", "Done"]} />
                <Select label="Priority" value={state.filters.priority} onChange={(value) => setState((current) => ({ ...current, filters: { ...current.filters, priority: value } }))} options={["All", ...priorities]} />
                <Select label="Category" value={state.filters.category} onChange={(value) => setState((current) => ({ ...current, filters: { ...current.filters, category: value } }))} options={["All", ...categories]} />
                <Select label="Sort" value={state.filters.sort} onChange={(value) => setState((current) => ({ ...current, filters: { ...current.filters, sort: value } }))} options={sortOptions} />
              </div>
            </Panel>

            <Panel title="Saved Goals" icon={ClipboardList}>
              <div className="custom-scrollbar max-h-[520px] space-y-2 overflow-y-auto pr-1">
                {filteredGoals.map((goal) => {
                  const calc = goalCalculations.get(goal.id) || calculateGoal(goal);
                  return (
                    <button key={goal.id} onClick={() => setState((current) => ({ ...current, activeGoalId: goal.id }))} className={`w-full min-w-0 rounded-2xl border p-3 text-left transition hover:border-(--primary) ${activeGoal?.id === goal.id ? "border-cyan-500/35 bg-cyan-500/10" : "border-(--border) bg-(--background)"}`}>
                      <div className="flex min-w-0 items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="break-words text-sm font-black" title={goal.title}>{goal.title}</div>
                          <div className="mt-1 truncate text-xs text-muted-foreground">{categoryLabel(goal)} | {goal.deadline || "No deadline"}</div>
                        </div>
                        <span className={`shrink-0 text-xs font-black ${healthStyles[calc.health]}`}>{calc.progress}%</span>
                      </div>
                      <ProgressBar value={calc.progress} />
                    </button>
                  );
                })}
                {!filteredGoals.length && <EmptyState text="No goals match the current filters." />}
              </div>
            </Panel>

          </section>
            </section>
          </div>
        </main>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 rounded-2xl border border-(--border) bg-(--card) p-5 shadow-md">
            <h2 className="break-words text-2xl font-black text-(--foreground)">Write better professional goals with SMART</h2>
            <p className="mt-3 break-words text-sm leading-relaxed text-muted-foreground">
              Vague goals are hard to finish because they do not define the outcome, metric, scope, or deadline. Use the generator to turn your context into a structured goal, then track the real work in the planner.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {smartBenefits.map(([title, text]) => (
                <div key={title} className="min-w-0 rounded-2xl border border-(--border) bg-(--background) p-4">
                  <h3 className="break-words text-sm font-black text-(--foreground)">{title}</h3>
                  <p className="mt-2 break-words text-sm leading-relaxed text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="min-w-0 rounded-2xl border border-(--border) bg-(--card) p-5 shadow-md">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500">
              <ListChecks className="h-5 w-5" />
            </div>
            <h2 className="break-words text-xl font-black text-(--foreground)">Tips for effective goal setting</h2>
            <div className="mt-4 space-y-3">
              {smartTips.map((tip, index) => (
                <div key={tip} className="flex min-w-0 gap-3 rounded-xl border border-(--border) bg-(--background) p-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-(--muted) text-xs font-black text-(--primary)">{index + 1}</span>
                  <p className="min-w-0 break-words text-sm leading-relaxed text-muted-foreground">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <RelatedGrid title="Related Tools" items={relatedTools} type="tool" />

        <section className="overflow-hidden rounded-3xl border border-(--border) bg-gradient-to-br from-cyan-500/12 via-blue-500/8 to-violet-500/12 p-5 shadow-xl sm:p-8">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] lg:items-center">
            <div className="min-w-0">
              <h2 className="break-words text-3xl font-black tracking-tight sm:text-4xl">Your next review starts with real data.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">Every number here comes from goals, tasks, milestones, dates, and statuses you created in this browser.</p>
            </div>
            <button onClick={() => setState(defaultState)} className="inline-flex min-w-0 items-center justify-center gap-2 rounded-xl border border-(--border) bg-(--background) px-4 py-3 text-sm font-black transition hover:border-(--primary) hover:text-(--primary)">
              <RotateCcw className="h-4 w-4" /><span className="truncate">Reset planner</span>
            </button>
          </div>
        </section>

        <section className="grid gap-3">
          {faqs.map(([question, answer], index) => (
            <button key={question} onClick={() => setOpenFaq(openFaq === index ? -1 : index)} className="min-w-0 rounded-2xl border border-(--border) bg-(--card) p-4 text-left transition hover:border-(--primary)">
              <div className="flex items-center justify-between gap-3">
                <span className="min-w-0 break-words text-sm font-black">{question}</span>
                <span className="shrink-0 text-xl font-black text-(--primary)">{openFaq === index ? "-" : "+"}</span>
              </div>
              {openFaq === index && <p className="mt-3 break-words text-sm leading-relaxed text-muted-foreground">{answer}</p>}
            </button>
          ))}
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {showcase.map(([title, text]) => (
            <div key={title} className="min-w-0 rounded-2xl border border-(--border) bg-(--card) p-5 shadow-md transition hover:-translate-y-1 hover:shadow-xl">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500"><Sparkles className="h-5 w-5" /></div>
              <h3 className="break-words text-lg font-black">{title}</h3>
              <p className="mt-2 break-words text-sm leading-relaxed text-muted-foreground">{text}</p>
            </div>
          ))}
        </section>
      </div>

      <style jsx global>{`
        .smart-goal-planner * { min-width: 0; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(34, 211, 238, 0.32); border-radius: 999px; }
        @media print {
          nav, form, button, .recharts-wrapper { display: none !important; }
          pre { max-height: none !important; color: #111827 !important; }
        }
      `}</style>
    </div>
  );
}

function Panel({ title, icon: Icon, children }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-(--border) bg-(--card)/88 p-3 shadow-md shadow-cyan-950/10 backdrop-blur-xl sm:p-4">
      <div className="mb-3 flex min-w-0 items-center gap-2 border-b border-(--border) pb-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500"><Icon className="h-4.5 w-4.5" /></div>
        <h2 className="min-w-0 break-words text-xs font-black uppercase leading-relaxed tracking-[.16em]">{title}</h2>
      </div>
      <div className="min-w-0 space-y-3">{children}</div>
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div className="min-w-0 rounded-2xl border border-(--border) bg-(--background) p-3 shadow-sm">
      <div className="truncate text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 break-words text-2xl font-black leading-tight">{value}</div>
    </div>
  );
}

function SmartGoalVisual() {
  const letters = ["S", "M", "A", "R", "T"];
  return (
    <div className="relative min-h-64 overflow-hidden bg-gradient-to-br from-white via-sky-50 to-indigo-50 p-6 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <div className="absolute inset-x-8 top-20 h-1 rotate-[-16deg] rounded-full bg-indigo-300/70" />
      <div className="absolute inset-x-10 bottom-20 h-1 rotate-[-38deg] rounded-full bg-sky-300/70" />
      <div className="absolute right-10 top-8 h-28 w-28 rotate-45 border-r-8 border-t-8 border-indigo-700/80" />
      <div className="absolute left-8 bottom-8 h-28 w-28 rotate-45 border-l-8 border-t-8 border-violet-400/80" />
      <div className="relative mx-auto grid h-56 w-56 place-items-center">
        <div className="absolute inset-8 rounded-full border-[18px] border-indigo-950 shadow-xl dark:border-indigo-200" />
        <div className="absolute h-20 w-20 rounded-full border-[18px] border-white bg-rose-500 shadow-lg" />
        {letters.map((letter, index) => {
          const positions = [
            "left-7 top-4 bg-indigo-950",
            "right-10 top-0 bg-violet-500",
            "right-0 top-16 bg-sky-500",
            "right-12 bottom-0 bg-indigo-700",
            "left-0 bottom-16 bg-blue-500",
          ];
          return (
            <div key={letter} className={`absolute grid h-16 w-16 place-items-center rounded-full text-3xl font-black text-white shadow-xl ${positions[index]}`}>
              {letter}
            </div>
          );
        })}
        <div className="absolute left-7 bottom-2 grid h-16 w-16 place-items-center rounded-full bg-purple-600 text-white shadow-xl">
          <CheckCircle2 className="h-9 w-9" />
        </div>
      </div>
    </div>
  );
}

function RelatedGrid({ title, items, type }) {
  return (
    <section className="space-y-5">
      <h2 className="text-center text-2xl font-black text-(--foreground)">{title}</h2>
      <div className="grid gap-5 lg:grid-cols-3">
        {items.map((item) => <RelatedCard key={item.title} item={item} type={type} />)}
      </div>
    </section>
  );
}

function RelatedCard({ item, type }) {
  const Icon = item.icon || ClipboardList;
  return (
    <a href={item.href} className="group min-w-0 overflow-hidden rounded-2xl border border-(--border) bg-(--card) shadow-md transition hover:-translate-y-1 hover:shadow-xl">
      <div className={`relative min-h-52 overflow-hidden bg-gradient-to-br ${item.tone} p-6`}>
        <div className="absolute inset-x-6 top-8 h-28 rounded-xl border-4 border-white/70 bg-white/45 shadow-inner" />
        <div className="absolute left-10 top-14 grid h-16 w-16 place-items-center rounded-full bg-white/80 text-indigo-700 shadow-lg">
          <Icon className="h-9 w-9" />
        </div>
        <div className="absolute right-8 top-12 space-y-3">
          {[0, 1, 2].map((line) => (
            <div key={line} className="h-3 rounded-full bg-white/75" style={{ width: `${110 - line * 18}px` }} />
          ))}
        </div>
        <div className="absolute bottom-7 left-8 right-8 flex items-end justify-between">
          <div className="h-20 w-28 rounded-t-full bg-white/55" />
          <div className="h-24 w-24 rounded-full border-8 border-white/60" />
        </div>
      </div>
      <div className="p-5">
        <div className="flex min-w-0 items-start gap-3">
          {type === "tool" && <Icon className="mt-1 h-6 w-6 shrink-0 text-(--foreground)" />}
          <h3 className="min-w-0 break-words text-2xl font-black leading-tight">{item.title}</h3>
          <ExternalLink className="ml-auto mt-1 h-4 w-4 shrink-0 opacity-0 transition group-hover:opacity-100" />
        </div>
        <p className="mt-4 break-words text-base leading-relaxed text-muted-foreground">{item.text}</p>
      </div>
    </a>
  );
}

function MiniMetric({ icon: Icon, label, value }) {
  return (
    <div className="min-w-0 rounded-2xl border border-(--border) bg-(--background) p-3">
      <Icon className="mb-2 h-4 w-4 text-cyan-500" />
      <div className="truncate text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 break-words text-lg font-black">{value}</div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-(--border) bg-(--background) p-3">
      <div className="mb-3 truncate text-xs font-black uppercase tracking-[.16em] text-muted-foreground">{title}</div>
      <div className="min-w-0 overflow-hidden">{children}</div>
    </div>
  );
}

function Ring({ value }) {
  const safe = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(#38bdf8 ${safe * 3.6}deg, rgba(148,163,184,.18) 0deg)` }}>
      <div className="grid h-14 w-14 place-items-center rounded-full bg-(--background) text-sm font-black">{safe}%</div>
    </div>
  );
}

function ProgressBar({ value }) {
  const safe = Math.max(0, Math.min(100, Number(value) || 0));
  return <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-500/12"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 transition-all duration-500" style={{ width: `${safe}%` }} /></div>;
}

function EmptyState({ text }) {
  return <div className="flex min-h-24 w-full min-w-0 items-center justify-center rounded-2xl border border-dashed border-cyan-500/25 bg-cyan-500/8 p-4 text-center text-sm leading-relaxed text-muted-foreground"><span className="min-w-0 max-w-full break-words">{text}</span></div>;
}

function Field({ label, value, onChange, placeholder = "", textarea = false, type = "text" }) {
  const base = "w-full rounded-xl border border-(--border) bg-(--background) px-3 py-2 text-sm text-(--foreground) outline-none transition placeholder:text-muted-foreground focus:border-(--primary)";
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[.16em] text-muted-foreground">{label}</span>
      {textarea ? <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={`${base} min-h-20 resize-y break-words`} /> : <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={base} />}
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[.16em] text-muted-foreground">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-(--border) bg-(--background) px-3 py-2 text-sm outline-none transition focus:border-(--primary)">
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function SmartText({ label, value, onChange }) {
  return (
    <label className="block min-w-0 rounded-2xl border border-(--border) bg-(--background) p-3">
      <span className="mb-2 block text-[10px] font-black uppercase tracking-[.16em] text-cyan-500">{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} className="min-h-20 w-full resize-y bg-transparent text-sm leading-relaxed outline-none" />
    </label>
  );
}

function ItemList({ items, onPatch, empty, type }) {
  if (!items.length) return <EmptyState text={empty} />;
  const update = (id, patch) => onPatch(items.map((item) => item.id === id ? { ...item, ...patch } : item));
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="min-w-0 rounded-2xl border border-(--border) bg-(--background) p-3">
          <div className="flex min-w-0 items-start gap-3">
            <input type="checkbox" checked={item.completed} onChange={(event) => update(item.id, { completed: event.target.checked })} className="mt-2 h-4 w-4 shrink-0 accent-cyan-500" />
            <div className="min-w-0 flex-1 space-y-2">
              <input value={item.title} onChange={(event) => update(item.id, { title: event.target.value })} className="w-full rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm font-black outline-none focus:border-(--primary) focus:bg-(--card)" />
              <div className="grid gap-2 sm:grid-cols-2">
                <Field label={type === "task" ? "Due date" : "Date"} type="date" value={item.dueDate || item.date || ""} onChange={(value) => update(item.id, type === "task" ? { dueDate: value } : { date: value })} />
                {type === "task" && <Select label="Priority" value={item.priority} onChange={(value) => update(item.id, { priority: value })} options={priorities} />}
              </div>
              <Field label="Notes" value={item.notes || ""} onChange={(value) => update(item.id, { notes: value })} textarea />
            </div>
            <button onClick={() => onPatch(items.filter((next) => next.id !== item.id))} className="shrink-0 rounded-xl p-2 text-rose-500 hover:bg-rose-500/10" aria-label="Delete item"><Trash2 className="h-4 w-4" /></button>
          </div>
        </div>
      ))}
    </div>
  );
}
