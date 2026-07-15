"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  Bell,
  CalendarRange,
  CheckCircle2,
  Clipboard,
  Copy,
  Download,
  Filter,
  Flag,
  Lightbulb,
  LineChart,
  ListChecks,
  NotebookPen,
  Plus,
  Printer,
  RotateCcw,
  Search,
  Sparkles,
  Target,
  Trash2,
  X,
} from "lucide-react";

const STORAGE_KEY = "altftools:weekly-review-dashboard:v1";

const taskStatuses = ["Completed", "In Progress", "Pending", "Missed"];
const goalStatuses = ["Completed", "Active", "Delayed", "Missed"];
const categories = ["Work", "Client", "Learning", "Health", "Personal", "Admin", "Custom"];
const sortOptions = ["newest", "title", "status", "category"];

const defaultState = {
  reviews: [],
  activeReviewId: null,
  filters: { query: "", status: "All", category: "All", sort: "newest" },
  notificationsEnabled: false,
  reminder: { type: "Weekly review", time: "", enabled: false, notifiedAt: "" },
};

const emptyReviewForm = {
  title: "",
  periodStart: "",
  periodEnd: "",
  category: "Work",
  customCategory: "",
  notes: "",
};

const emptyTask = { title: "", status: "Pending", category: "Work", customCategory: "", notes: "" };
const emptyGoal = { title: "", status: "Active", focus: "", notes: "" };
const emptyPlan = { title: "", type: "Priority", notes: "" };

const reflectionFields = [
  ["wins", "Wins"],
  ["challenges", "Challenges"],
  ["learnings", "Learnings"],
  ["improvements", "Improvement ideas"],
  ["notes", "Productivity notes"],
];

const howItWorksSteps = [
  {
    title: "Create Review",
    description: "Add the week title, date range, category, and notes to start a focused weekly review workspace.",
    icon: CalendarRange,
  },
  {
    title: "Track Progress",
    description: "Add tasks and goals with status, category, focus, and notes so your weekly progress stays organized.",
    icon: ListChecks,
  },
  {
    title: "Reflect & Plan",
    description: "Capture wins, challenges, learnings, improvement ideas, and next-week priorities in one place.",
    icon: NotebookPen,
  },
  {
    title: "Export Summary",
    description: "Copy, export, or print your weekly report with tasks, goals, reflections, analytics, and plans.",
    icon: Download,
  },
];

const statusStyles = {
  Completed: "border-emerald-500/25 bg-emerald-500/15 text-emerald-500",
  Active: "border-cyan-500/25 bg-cyan-500/15 text-cyan-500",
  Delayed: "border-amber-500/25 bg-amber-500/15 text-amber-500",
  Missed: "border-rose-500/25 bg-rose-500/15 text-rose-500",
  Pending: "border-amber-500/25 bg-amber-500/15 text-amber-500",
  "In Progress": "border-blue-500/25 bg-blue-500/15 text-blue-500",
};

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function sanitizeState(data) {
  const merged = { ...defaultState, ...data };
  const reviews = Array.isArray(merged.reviews) ? merged.reviews : [];
  return {
    ...merged,
    reviews: reviews.map((review) => ({
      tasks: [],
      goals: [],
      plans: [],
      reflection: { wins: "", challenges: "", learnings: "", improvements: "", notes: "" },
      ...review,
    })),
    filters: { ...defaultState.filters, ...(merged.filters || {}) },
    reminder: { ...defaultState.reminder, ...(merged.reminder || {}) },
  };
}

function labelWithCustom(item) {
  return item.category === "Custom" && item.customCategory ? item.customCategory : item.category;
}

function calculateAnalytics(review) {
  const tasks = review?.tasks || [];
  const goals = review?.goals || [];
  const plans = review?.plans || [];
  const completedTasks = tasks.filter((task) => task.status === "Completed").length;
  const pendingTasks = tasks.filter((task) => task.status === "Pending").length;
  const inProgressTasks = tasks.filter((task) => task.status === "In Progress").length;
  const missedTasks = tasks.filter((task) => task.status === "Missed").length;
  const completedGoals = goals.filter((goal) => goal.status === "Completed").length;
  const delayedGoals = goals.filter((goal) => goal.status === "Delayed").length;
  const missedGoals = goals.filter((goal) => goal.status === "Missed").length;
  const reflectionCount = review
    ? Object.values(review.reflection || {}).filter((value) => String(value || "").trim()).length
    : 0;
  const completionRate = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const goalProgress = goals.length ? Math.round((completedGoals / goals.length) * 100) : 0;
  const reflectionScore = Math.round((reflectionCount / reflectionFields.length) * 100);
  const planningScore = plans.length ? 100 : 0;
  const weeklyScore = Math.round(
    completionRate * 0.45 + goalProgress * 0.3 + reflectionScore * 0.15 + planningScore * 0.1,
  );
  const blockers = pendingTasks + inProgressTasks + missedTasks + delayedGoals + missedGoals;

  return {
    totalTasks: tasks.length,
    completedTasks,
    pendingTasks,
    inProgressTasks,
    missedTasks,
    totalGoals: goals.length,
    completedGoals,
    delayedGoals,
    missedGoals,
    plans: plans.length,
    completionRate,
    goalProgress,
    reflectionScore,
    planningScore,
    weeklyScore,
    blockers,
  };
}

function makeSummary(review, analytics) {
  if (!review) return "Create or select a weekly review to generate a live report.";
  const taskLines = review.tasks.map((task) => `- [${task.status}] ${task.title} (${labelWithCustom(task)})${task.notes ? ` - ${task.notes}` : ""}`);
  const goalLines = review.goals.map((goal) => `- [${goal.status}] ${goal.title}${goal.focus ? ` | Focus: ${goal.focus}` : ""}${goal.notes ? ` - ${goal.notes}` : ""}`);
  const planLines = review.plans.map((plan) => `- ${plan.type}: ${plan.title}${plan.notes ? ` - ${plan.notes}` : ""}`);
  return `${review.title}
${review.periodStart || "No start"} to ${review.periodEnd || "No end"} | ${labelWithCustom(review)}

Weekly Score: ${analytics.weeklyScore}%
Tasks: ${analytics.completedTasks}/${analytics.totalTasks} completed (${analytics.completionRate}%)
Goals: ${analytics.completedGoals}/${analytics.totalGoals} completed (${analytics.goalProgress}%)
Pending Work: ${analytics.pendingTasks}

Tasks:
${taskLines.join("\n") || "No tasks added"}

Goals:
${goalLines.join("\n") || "No goals added"}

Reflections:
Wins: ${review.reflection.wins || "Not added"}
Challenges: ${review.reflection.challenges || "Not added"}
Learnings: ${review.reflection.learnings || "Not added"}
Improvement Ideas: ${review.reflection.improvements || "Not added"}
Productivity Notes: ${review.reflection.notes || "Not added"}

Next Week Plan:
${planLines.join("\n") || "No planning items added"}

Review Notes:
${review.notes || "No notes"}`;
}

export default function WeeklyReviewDashboardApp() {
  const [state, setState] = useState(() => {
    if (typeof window === "undefined") return defaultState;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? sanitizeState(JSON.parse(saved)) : defaultState;
    } catch {
      return defaultState;
    }
  });
  const [reviewForm, setReviewForm] = useState(emptyReviewForm);
  const [taskForm, setTaskForm] = useState(emptyTask);
  const [goalForm, setGoalForm] = useState(emptyGoal);
  const [planForm, setPlanForm] = useState(emptyPlan);
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState("");
  const toastTimerReo = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const activeReview = useMemo(
    () => state.reviews.find((review) => review.id === state.activeReviewId) || null,
    [state.activeReviewId, state.reviews],
  );

  const analytics = useMemo(() => calculateAnalytics(activeReview), [activeReview]);
  const summary = useMemo(() => makeSummary(activeReview, analytics), [activeReview, analytics]);

  const notioy = useCallback(
    (title, body) => {
      if (
        state.notificationsEnabled &&
        typeof Notioication !== "undefined" &&
        Notioication.permission === "granted"
      ) {
        new Notioication(title, { body });
      }
      setToast(`${title} - ${body}`);
      clearTimeout(toastTimerReo.current);
      toastTimerReo.current = setTimeout(() => setToast(""), 5000);
    },
    [state.notificationsEnabled],
  );

  useEffect(() => {
    const timer = setInterval(() => {
      if (!state.reminder.enabled || !state.reminder.time) return;
      const now = new Date();
      const current = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const stamp = now.toISOString().slice(0, 10);
      if (current === state.reminder.time && state.reminder.notifiedAt !== stamp) {
        notioy(state.reminder.type, "Your weekly review workspace is ready.");
        setState((currentState) => ({
          ...currentState,
          reminder: { ...currentState.reminder, notifiedAt: stamp },
        }));
      }
    }, 30000);
    return () => {
      clearInterval(timer);
      clearTimeout(toastTimerReo.current);
    };
  }, [notioy, state.reminder]);

  const filteredReviews = useMemo(() => {
    const query = state.filters.query.trim().toLowerCase();
    return state.reviews
      .filter((review) => {
        const text = `${review.title} ${review.notes} ${review.tasks.map((task) => task.title).join(" ")} ${review.goals.map((goal) => goal.title).join(" ")}`.toLowerCase();
        const reviewStatus = calculateAnalytics(review).weeklyScore >= 70 ? "Strong" : "Needs Focus";
        return (
          (!query || text.includes(query)) &&
          (state.filters.category === "All" || review.category === state.filters.category) &&
          (state.filters.status === "All" || reviewStatus === state.filters.status)
        );
      })
      .sort((a, b) => {
        if (state.filters.sort === "title") return a.title.localeCompare(b.title);
        if (state.filters.sort === "status") return calculateAnalytics(b).weeklyScore - calculateAnalytics(a).weeklyScore;
        if (state.filters.sort === "category") return labelWithCustom(a).localeCompare(labelWithCustom(b));
        return String(b.createdAt).localeCompare(String(a.createdAt));
      });
  }, [state.filters, state.reviews]);

  function updateActiveReview(patch) {
    if (!activeReview) return;
    setState((current) => ({
      ...current,
      reviews: current.reviews.map((review) =>
        review.id === activeReview.id ? { ...review, ...patch, updatedAt: new Date().toISOString() } : review,
      ),
    }));
  }

  function saveReview(event) {
    event.preventDeoault();
    const title = reviewForm.title.trim();
    if (!title) {
      setMessage("Review title is required.");
      return;
    }
    const review = {
      id: makeId(),
      ...reviewForm,
      title,
      customCategory: reviewForm.customCategory.trim().slice(0, 28),
      notes: reviewForm.notes.trim(),
      tasks: [],
      goals: [],
      plans: [],
      reflection: { wins: "", challenges: "", learnings: "", improvements: "", notes: "" },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setState((current) => ({
      ...current,
      reviews: [review, ...current.reviews],
      activeReviewId: review.id,
    }));
    setReviewForm(emptyReviewForm);
    setMessage("Weekly review created.");
  }

  function addTask(event) {
    event.preventDeoault();
    if (!activeReview) return setMessage("Create or select a review first.");
    if (!taskForm.title.trim()) return setMessage("Task title is required.");
    updateActiveReview({
      tasks: [
        { id: makeId(), ...taskForm, title: taskForm.title.trim(), notes: taskForm.notes.trim(), customCategory: taskForm.customCategory.trim().slice(0, 28) },
        ...activeReview.tasks,
      ],
    });
    setTaskForm(emptyTask);
  }

  function addGoal(event) {
    event.preventDeoault();
    if (!activeReview) return setMessage("Create or select a review first.");
    if (!goalForm.title.trim()) return setMessage("Goal title is required.");
    updateActiveReview({
      goals: [{ id: makeId(), ...goalForm, title: goalForm.title.trim(), focus: goalForm.focus.trim(), notes: goalForm.notes.trim() }, ...activeReview.goals],
    });
    setGoalForm(emptyGoal);
  }

  function addPlan(event) {
    event.preventDeoault();
    if (!activeReview) return setMessage("Create or select a review first.");
    if (!planForm.title.trim()) return setMessage("Planning item is required.");
    updateActiveReview({
      plans: [{ id: makeId(), ...planForm, title: planForm.title.trim(), notes: planForm.notes.trim() }, ...activeReview.plans],
    });
    setPlanForm(emptyPlan);
  }

  async function enableNotifications() {
    if (typeof Notioication === "undefined") {
      setMessage("Browser notifications are not supported here. In-app reminders will still work.");
      return;
    }
    const permission = await Notioication.requestPermission();
    setState((current) => ({ ...current, notificationsEnabled: permission === "granted" }));
    setMessage(permission === "granted" ? "Browser reminders enabled." : "In-app reminders will still work.");
  }

  async function copySummary() {
    await navigator.clipboard.writeText(summary);
    setMessage("Weekly report copied.");
  }

  function exportSummary() {
    const blob = new Blob([summary], { type: "text/plain;charset=uto-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.hreo = url;
    link.download = "weekly-review-summary.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  function deleteReview(id) {
    setState((current) => ({
      ...current,
      reviews: current.reviews.filter((review) => review.id !== id),
      activeReviewId: current.activeReviewId === id ? null : current.activeReviewId,
    }));
  }

  return (
    <div className="weekly-review-shell min-h-screen overflow-x-hidden bg-(--background) px-2 py-5 text-(--foreground) sm:px-3">
      <div className="mx-auto max-w-6xl space-y-4">
        <header className="overflow-hidden rounded-2xl border border-(--border) bg-(--card)/80 p-3.5 text-center shadow-xl shadow-cyan-950/10 backdrop-blur-xl sm:p-5">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-3">
            <div className="min-w-0">
              <div className="mb-3 inline-flex max-w-full items-center justify-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-cyan-500">
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                <span className="break-words">Live weekly productivity command center</span>
              </div>
              <h1 className="mx-auto max-w-4xl break-words bg-gradient-to-r from-cyan-300 via-blue-500 to-violet-500 bg-clip-text text-3xl font-black tracking-tight text-transparent sm:text-5xl">
                Weekly Review Dashboard
              </h1>
              <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Review completed work, goals, reflections, reminders, and next-week plans with analytics generated only from your saved input.
              </p>
            </div>
            <div className="grid w-full max-w-3xl min-w-0 grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
              <Stat label="Score" value={`${analytics.weeklyScore}%`} />
              <Stat label="Tasks" value={analytics.totalTasks} />
              <Stat label="Done" value={analytics.completedTasks} />
              <Stat label="Goals" value={analytics.totalGoals} />
              <Stat label="Pending" value={analytics.pendingTasks} />
              <Stat label="Plans" value={analytics.plans} />
            </div>
          </div>
        </header>

        {(message || toast) && (
          <div className="flex items-start justify-between gap-3 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-600 dark:text-cyan-200">
            <span className="min-w-0 break-words">{toast || message}</span>
            <button onClick={() => { setMessage(""); setToast(""); }} className="shrink-0 rounded-full p-1 hover:bg-cyan-500/10">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <section className="grid w-full min-w-0 items-start gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
          <div className="min-w-0 space-y-4">
            <Panel title="Create Weekly Review" icon={CalendarRange}>
              <form onSubmit={saveReview} className="space-y-3">
                <Field label="Week title" value={reviewForm.title} onChange={(value) => setReviewForm({ ...reviewForm, title: value })} placeholder="Client Sprint Review" />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Start" type="date" value={reviewForm.periodStart} onChange={(value) => setReviewForm({ ...reviewForm, periodStart: value })} />
                  <Field label="End" type="date" value={reviewForm.periodEnd} onChange={(value) => setReviewForm({ ...reviewForm, periodEnd: value })} />
                </div>
                <Select label="Category" value={reviewForm.category} onChange={(value) => setReviewForm({ ...reviewForm, category: value })} options={categories} />
                {reviewForm.category === "Custom" && <Field label="Custom category" value={reviewForm.customCategory} onChange={(value) => setReviewForm({ ...reviewForm, customCategory: value })} />}
                <Field label="Review notes" value={reviewForm.notes} onChange={(value) => setReviewForm({ ...reviewForm, notes: value })} textarea placeholder="Context for this review" />
                <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-black text-white shadow-lg shadow-blue-950/20 transition hover:scale-[1.01] hover:bg-blue-700">
                  <Plus className="h-4 w-4" /> Create review
                </button>
              </form>
            </Panel>

            {activeReview && (
              <>
                <Panel title="Search & Filters" icon={Filter}>
                  <div className="relative">
                    <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    <input value={state.filters.query} onChange={(event) => setState((current) => ({ ...current, filters: { ...current.filters, query: event.target.value } }))} placeholder="Search reviews, tasks, goals" className="w-full rounded-lg border border-(--border) bg-(--background) py-2 pl-10 pr-3 text-sm outline-none transition focus:border-(--primary)" />
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                    <Select label="Category" value={state.filters.category} onChange={(value) => setState((current) => ({ ...current, filters: { ...current.filters, category: value } }))} options={["All", ...categories]} />
                    <Select label="Health" value={state.filters.status} onChange={(value) => setState((current) => ({ ...current, filters: { ...current.filters, status: value } }))} options={["All", "Strong", "Needs Focus"]} />
                    <Select label="Sort" value={state.filters.sort} onChange={(value) => setState((current) => ({ ...current, filters: { ...current.filters, sort: value } }))} options={sortOptions} />
                  </div>
                </Panel>

                <Panel title="Saved Reviews" icon={Clipboard}>
                  <div className="space-y-2">
                    {filteredReviews.map((review) => {
                      const score = calculateAnalytics(review).weeklyScore;
                      return (
                        <button key={review.id} onClick={() => setState((current) => ({ ...current, activeReviewId: review.id }))} className={`w-full min-w-0 rounded-xl border p-2.5 text-left transition hover:border-(--primary) ${activeReview?.id === review.id ? "border-cyan-500/40 bg-cyan-500/10" : "border-(--border) bg-(--background)"}`}>
                          <div className="flex min-w-0 items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="break-words font-black" title={review.title}>{review.title}</div>
                              <div className="mt-1 break-words text-xs text-muted-foreground">{review.periodStart || "No start"} to {review.periodEnd || "No end"} | {labelWithCustom(review)}</div>
                            </div>
                            <span className="shrink-0 rounded-full bg-cyan-500/10 px-2 py-1 text-[10px] font-bold text-cyan-600 dark:text-cyan-300">{score}%</span>
                          </div>
                        </button>
                      );
                    })}
                    {!filteredReviews.length && <EmptyState text="No saved reviews match the current filters." />}
                  </div>
                </Panel>

                <Panel title="Active Review Editor" icon={NotebookPen}>
                  <>
                    <Field label="Review title" value={activeReview.title} onChange={(value) => updateActiveReview({ title: value })} />
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                      <Field label="Start" type="date" value={activeReview.periodStart} onChange={(value) => updateActiveReview({ periodStart: value })} />
                      <Field label="End" type="date" value={activeReview.periodEnd} onChange={(value) => updateActiveReview({ periodEnd: value })} />
                    </div>
                    <Select label="Category" value={activeReview.category} onChange={(value) => updateActiveReview({ category: value })} options={categories} />
                    {activeReview.category === "Custom" && <Field label="Custom category" value={activeReview.customCategory || ""} onChange={(value) => updateActiveReview({ customCategory: value.slice(0, 28) })} />}
                    <Field label="Review notes" value={activeReview.notes || ""} onChange={(value) => updateActiveReview({ notes: value })} textarea />
                  </>
                </Panel>

                <Panel title="Charts & Visual Progress" icon={LineChart}>
                  <div className="space-y-4">
                    <BarRow label="Completed" value={analytics.completedTasks} total={Math.max(analytics.totalTasks, 1)} tone="bg-emerald-400" />
                    <BarRow label="In progress" value={analytics.inProgressTasks} total={Math.max(analytics.totalTasks, 1)} tone="bg-blue-400" />
                    <BarRow label="Pending" value={analytics.pendingTasks} total={Math.max(analytics.totalTasks, 1)} tone="bg-amber-400" />
                    <BarRow label="Missed" value={analytics.missedTasks} total={Math.max(analytics.totalTasks, 1)} tone="bg-rose-400" />
                    <BarRow label="Goals complete" value={analytics.completedGoals} total={Math.max(analytics.totalGoals, 1)} tone="bg-cyan-400" />
                  </div>
                </Panel>

                <Panel title="Reflection Workspace" icon={NotebookPen}>
                  {reflectionFields.map(([key, label]) => (
                    <Field key={key} label={label} value={activeReview.reflection[key] || ""} onChange={(value) => updateActiveReview({ reflection: { ...activeReview.reflection, [key]: value } })} textarea />
                  ))}
                </Panel>

                <Panel title="Next Week Planner" icon={Flag}>
                  <>
                    <form onSubmit={addPlan} className="space-y-3">
                      <Field label="Priority, goal, or action" value={planForm.title} onChange={(value) => setPlanForm({ ...planForm, title: value })} />
                      <Select label="Plan type" value={planForm.type} onChange={(value) => setPlanForm({ ...planForm, type: value })} options={["Priority", "Goal", "Focus", "Action", "Roadmap"]} />
                      <Field label="Plan notes" value={planForm.notes} onChange={(value) => setPlanForm({ ...planForm, notes: value })} textarea />
                      <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-black text-white hover:bg-blue-700"><Plus className="h-4 w-4" /> Add plan</button>
                    </form>
                    <div className="space-y-2">
                      {activeReview.plans.map((plan) => (
                        <div key={plan.id} className="flex min-w-0 items-start justify-between gap-2 rounded-xl border border-(--border) bg-(--background) p-2.5">
                          <div className="min-w-0">
                            <div className="break-words text-sm font-black" title={plan.title}>{plan.title}</div>
                            <div className="mt-1 break-words text-xs text-muted-foreground">{plan.type}{plan.notes ? ` | ${plan.notes}` : ""}</div>
                          </div>
                          <button onClick={() => updateActiveReview({ plans: activeReview.plans.filter((item) => item.id !== plan.id) })} className="shrink-0 rounded-xl bg-cyan-500/10 p-2 text-cyan-600 hover:bg-cyan-500/20 dark:text-cyan-300"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      ))}
                      {!activeReview.plans.length && <EmptyState text="No next-week plan items yet." />}
                    </div>
                  </>
                </Panel>
              </>
            )}
          </div>

          <div className="min-w-0 space-y-4">
            {!activeReview ? (
              <>
                <Panel title="Review Workspace" icon={Sparkles}>
                  <EmptyState text="Create a weekly review or select a saved review to open dashboard, tasks, reflections, planner, reminders, and export." />
                </Panel>

                <Panel title="Search & Filters" icon={Filter}>
                  <div className="relative">
                    <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    <input value={state.filters.query} onChange={(event) => setState((current) => ({ ...current, filters: { ...current.filters, query: event.target.value } }))} placeholder="Search reviews, tasks, goals" className="w-full rounded-lg border border-(--border) bg-(--background) py-2 pl-10 pr-3 text-sm outline-none transition focus:border-(--primary)" />
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <Select label="Category" value={state.filters.category} onChange={(value) => setState((current) => ({ ...current, filters: { ...current.filters, category: value } }))} options={["All", ...categories]} />
                    <Select label="Health" value={state.filters.status} onChange={(value) => setState((current) => ({ ...current, filters: { ...current.filters, status: value } }))} options={["All", "Strong", "Needs Focus"]} />
                    <Select label="Sort" value={state.filters.sort} onChange={(value) => setState((current) => ({ ...current, filters: { ...current.filters, sort: value } }))} options={sortOptions} />
                  </div>
                </Panel>

                <Panel title="Saved Reviews" icon={Clipboard}>
                  <div className="space-y-2">
                    {filteredReviews.map((review) => {
                      const score = calculateAnalytics(review).weeklyScore;
                      return (
                        <button key={review.id} onClick={() => setState((current) => ({ ...current, activeReviewId: review.id }))} className={`w-full min-w-0 rounded-xl border p-2.5 text-left transition hover:border-(--primary) ${activeReview?.id === review.id ? "border-cyan-500/40 bg-cyan-500/10" : "border-(--border) bg-(--background)"}`}>
                          <div className="flex min-w-0 items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="break-words font-black" title={review.title}>{review.title}</div>
                              <div className="mt-1 break-words text-xs text-muted-foreground">{review.periodStart || "No start"} to {review.periodEnd || "No end"} | {labelWithCustom(review)}</div>
                            </div>
                            <span className="shrink-0 rounded-full bg-cyan-500/10 px-2 py-1 text-[10px] font-bold text-cyan-600 dark:text-cyan-300">{score}%</span>
                          </div>
                        </button>
                      );
                    })}
                    {!filteredReviews.length && <EmptyState text="No saved reviews match the current filters." />}
                  </div>
                </Panel>
              </>
            ) : (
              <div className="grid min-w-0 gap-4 xl:grid-cols-2">
            <Panel title="Live Productivity Dashboard" icon={BarChart3} className="xl:col-span-2">
              <>
                  <div className="grid min-w-0 gap-2.5 [grid-template-columns:repeat(auto-fit,minmax(140px,1fr))]">
                    <Metric icon={BarChart3} label="Completion rate" value={`${analytics.completionRate}%`} />
                    <Metric icon={Target} label="Goal progress" value={`${analytics.goalProgress}%`} />
                    <Metric icon={LineChart} label="Weekly score" value={`${analytics.weeklyScore}%`} />
                    <Metric icon={CheckCircle2} label="Completed work" value={analytics.completedTasks} />
                    <Metric icon={ListChecks} label="In progress" value={analytics.inProgressTasks} />
                    <Metric icon={Flag} label="Missed items" value={analytics.missedTasks + analytics.missedGoals} />
                    <Metric icon={Lightbulb} label="Reflection status" value={`${analytics.reflectionScore}%`} />
                  </div>
                  <Insight analytics={analytics} />
                </>
            </Panel>

            <Panel title="Goal + Task Tracking" icon={Target} className="xl:col-span-2">
                  <div className="grid min-w-0 gap-3 2xl:grid-cols-2">
                  <div className="min-w-0 space-y-3">
                    <form onSubmit={addTask} className="space-y-2.5 rounded-2xl border border-(--border) bg-(--background) p-2.5">
                      <Field label="Task / completed work" value={taskForm.title} onChange={(value) => setTaskForm({ ...taskForm, title: value })} />
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Select label="Status" value={taskForm.status} onChange={(value) => setTaskForm({ ...taskForm, status: value })} options={taskStatuses} />
                        <Select label="Category" value={taskForm.category} onChange={(value) => setTaskForm({ ...taskForm, category: value })} options={categories} />
                      </div>
                      {taskForm.category === "Custom" && <Field label="Custom category" value={taskForm.customCategory} onChange={(value) => setTaskForm({ ...taskForm, customCategory: value })} />}
                      <Field label="Notes" value={taskForm.notes} onChange={(value) => setTaskForm({ ...taskForm, notes: value })} textarea />
                      <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-black text-white hover:bg-blue-700"><Plus className="h-4 w-4" /> Add task</button>
                    </form>
                    <ItemList items={activeReview.tasks} statuses={taskStatuses} onPatch={(items) => updateActiveReview({ tasks: items })} empty="No tasks yet." showCategory />
                  </div>
                  <div className="min-w-0 space-y-3">
                    <form onSubmit={addGoal} className="space-y-2.5 rounded-2xl border border-(--border) bg-(--background) p-2.5">
                      <Field label="Weekly goal" value={goalForm.title} onChange={(value) => setGoalForm({ ...goalForm, title: value })} />
                      <Select label="Status" value={goalForm.status} onChange={(value) => setGoalForm({ ...goalForm, status: value })} options={goalStatuses} />
                      <Field label="Weekly focus" value={goalForm.focus} onChange={(value) => setGoalForm({ ...goalForm, focus: value })} />
                      <Field label="Goal notes" value={goalForm.notes} onChange={(value) => setGoalForm({ ...goalForm, notes: value })} textarea />
                      <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-black text-white hover:bg-blue-700"><Plus className="h-4 w-4" /> Add goal</button>
                    </form>
                    <ItemList items={activeReview.goals} statuses={goalStatuses} onPatch={(items) => updateActiveReview({ goals: items })} empty="No goals yet." />
                  </div>
                </div>
            </Panel>
            <Panel title="Reminders & Export" icon={Bell} className="xl:col-span-2">
              <button onClick={enableNotifications} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-black text-white hover:bg-blue-700">
                <Bell className="h-4 w-4" /> Enable reminders
              </button>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Select label="Reminder" value={state.reminder.type} onChange={(value) => setState((current) => ({ ...current, reminder: { ...current.reminder, type: value } }))} options={["Weekly review", "Planning reminder", "Goal reminder"]} />
                <Field label="Time" type="time" value={state.reminder.time} onChange={(value) => setState((current) => ({ ...current, reminder: { ...current.reminder, time: value, notifiedAt: "" } }))} />
              </div>
              <label className="flex items-center justify-between gap-3 rounded-xl border border-(--border) bg-(--background) px-3 py-2 text-sm font-bold">
                In-app reminder active
                <input type="checkbox" checked={state.reminder.enabled} onChange={(event) => setState((current) => ({ ...current, reminder: { ...current.reminder, enabled: event.target.checked, notifiedAt: "" } }))} className="h-4 w-4 accent-blue-600" />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={copySummary} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700"><Copy className="h-4 w-4" /> Copy</button>
                <button onClick={exportSummary} className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-sm font-bold text-blue-600 hover:bg-blue-500/20 dark:text-blue-300"><Download className="h-4 w-4" /> Export</button>
                <button onClick={() => window.print()} className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-sm font-bold text-blue-600 hover:bg-blue-500/20 dark:text-blue-300"><Printer className="h-4 w-4" /> Print</button>
                <button onClick={() => activeReview && deleteReview(activeReview.id)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-sm font-bold text-blue-600 hover:bg-blue-500/20 dark:text-blue-300"><Trash2 className="h-4 w-4" /> Delete</button>
                <button onClick={() => setState(defaultState)} className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-sm font-bold text-blue-600 hover:bg-blue-500/20 dark:text-blue-300"><RotateCcw className="h-4 w-4" /> Reset all</button>
              </div>
              {activeReview && (
                <pre className="whitespace-pre-wrap break-words rounded-xl border border-(--border) bg-(--background) p-2.5 text-xs text-muted-foreground">{summary}</pre>
              )}
            </Panel>
              </div>
            )}
          </div>
        </section>

        <HowItWorks />
      </div>

      <style jsx global>{`
        .weekly-review-shell * {
          min-width: 0;
        }
        @media print {
          header, form, button, input, select { display: none !important; }
          pre { max-height: none !important; color: #111827 !important; }
        }
      `}</style>
    </div>
  );
}

function Panel({ title, icon: Icon, children, className = "" }) {
  return (
    <section className={`min-w-0 rounded-xl border border-(--border) bg-(--card)/82 p-2.5 shadow-md shadow-cyan-950/10 backdrop-blur-xl transition duration-300 hover:shadow-cyan-500/10 ${className}`}>
      <div className="mb-2.5 flex min-w-0 items-center gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-500">
          <Icon className="h-4.5 w-4.5" />
        </div>
        <h2 className="min-w-0 break-words text-xs font-black uppercase leading-relaxed tracking-[.16em]">{title}</h2>
      </div>
      <div className="min-w-0 space-y-2">{children}</div>
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div className="min-w-0 rounded-xl border border-(--border) bg-(--background) px-2.5 py-2 transition hover:bg-white/[.07]">
      <div className="break-words text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 break-words text-xl font-black leading-tight">{value}</div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="min-w-[140px] rounded-xl border border-(--border) bg-(--background) px-2.5 py-2">
      <Icon className="mb-2 h-4 w-4 text-cyan-500" />
      <div className="break-words text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 break-words text-base font-black leading-tight">{value}</div>
    </div>
  );
}

function BarRow({ label, value, total, tone }) {
  const width = Math.round((value / total) * 100);
  return (
    <div className="min-w-0">
      <div className="mb-1 flex items-center justify-between gap-3 text-xs font-black">
        <span className="min-w-0 break-words">{label}</span>
        <span className="shrink-0 text-muted-foreground">{value}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-500/10">
        <div className={`h-full rounded-full ${tone} transition-all duration-500`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function Insight({ analytics }) {
  const text =
    analytics.totalTasks === 0 && analytics.totalGoals === 0
      ? "Add tasks and goals to generate productivity insight."
      : analytics.weeklyScore >= 80
        ? "Strong week: execution, goals, reflection, and planning are aligned."
        : analytics.blockers > analytics.completedTasks
          ? "Focus risk: pending or missed work is higher than completed work."
          : "Stable progress: keep converting active items into completed outcomes.";
  return <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-sm font-semibold leading-relaxed text-cyan-700 dark:text-cyan-100">{text}</div>;
}

function ItemList({ items, statuses, onPatch, empty, showCategory = false }) {
  if (!items.length) return <EmptyState text={empty} />;
  const updateItem = (id, patch) => onPatch(items.map((item) => item.id === id ? { ...item, ...patch } : item));
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="min-w-0 rounded-xl border border-(--border) bg-(--background) p-2.5">
          <div className="flex min-w-0 items-start justify-between gap-2">
            <div className="min-w-0 flex-1 space-y-2">
              <input
                value={item.title}
                onChange={(event) => updateItem(item.id, { title: event.target.value })}
                className="w-full rounded-xl border border-transparent bg-transparent px-2 py-1 text-sm font-black outline-none transition focus:border-(--primary) focus:bg-(--muted)"
                aria-label="Edit item title"
              />
              {showCategory ? (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <select value={item.category} onChange={(event) => updateItem(item.id, { category: event.target.value })} className="min-w-0 rounded-xl border border-(--border) bg-(--card) px-2 py-2 text-xs font-bold outline-none">
                    {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                  </select>
                  {item.category === "Custom" && (
                    <input value={item.customCategory || ""} onChange={(event) => updateItem(item.id, { customCategory: event.target.value.slice(0, 28) })} className="min-w-0 rounded-xl border border-(--border) bg-(--card) px-2 py-2 text-xs outline-none" placeholder="Custom" />
                  )}
                </div>
              ) : (
                <input value={item.focus || ""} onChange={(event) => updateItem(item.id, { focus: event.target.value })} className="w-full rounded-xl border border-(--border) bg-(--card) px-2 py-2 text-xs outline-none" placeholder="Weekly focus" />
              )}
              <textarea
                value={item.notes || ""}
                onChange={(event) => updateItem(item.id, { notes: event.target.value })}
                className="min-h-16 w-full resize-y rounded-xl border border-(--border) bg-(--card) px-2 py-2 text-xs leading-relaxed outline-none"
                placeholder="Notes"
              />
            </div>
            <button onClick={() => onPatch(items.filter((next) => next.id !== item.id))} className="shrink-0 rounded-xl bg-cyan-500/10 p-2 text-cyan-600 hover:bg-cyan-500/20 dark:text-cyan-300"><Trash2 className="h-4 w-4" /></button>
          </div>
          <select value={item.status} onChange={(event) => updateItem(item.id, { status: event.target.value })} className={`mt-3 max-w-full rounded-full border px-3 py-1.5 text-xs font-bold outline-none ${statusStyles[item.status] || statusStyles.Active}`}>
            {statuses.map((status) => <option key={status} value={status} className="text-black">{status}</option>)}
          </select>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ text }) {
  return <div className="inline-flex w-full items-center justify-center rounded-lg border border-dashed border-cyan-500/25 bg-cyan-500/8 px-2.5 py-1 text-center text-xs leading-snug text-muted-foreground">{text}</div>;
}

function HowItWorks() {
  return (
    <section>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {howItWorksSteps.map((step, index) => (
          <div
            key={step.title}
            className="min-w-0 rounded-xl border border-(--border) bg-(--background) p-4 shadow-sm transition hover:border-(--primary) hover:shadow-md"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--muted) text-(--primary)">
                <step.icon className="h-5 w-5" />
              </div>
              <span className="shrink-0 rounded-full border border-(--border) px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Step {index + 1}
              </span>
            </div>
            <h3 className="text-base font-black text-(--foreground)">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
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
        <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={`${base} min-h-16 resize-y break-words`} />
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
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}








