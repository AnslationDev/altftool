"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  AlarmClock,
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
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";

const STORAGE_KEY = "altftools:meeting-agenda-builder:v1";

const meetingTypes = ["Sync", "Client", "Planning", "Review", "Workshop", "Custom"];
const categories = ["General", "Product", "Design", "Engineering", "Marketing", "Sales", "Custom"];
const statuses = ["Planned", "Ongoing", "Completed", "Follow-up Pending", "Archived"];
const priorities = {
  High: "border-rose-500/25 bg-rose-500/15 text-rose-500",
  Medium: "border-amber-500/25 bg-amber-500/15 text-amber-500",
  Low: "border-emerald-500/25 bg-emerald-500/15 text-emerald-500",
};

const howItWorksSteps = [
  {
    title: "Create Meeting",
    description: "Add the meeting title, type, date, time, duration, and status to start a structured agenda.",
    icon: CalendarClock,
  },
  {
    title: "Add People",
    description: "Select the meeting, add attendees with roles, and mark optional participants when needed.",
    icon: Users,
  },
  {
    title: "Build Agenda",
    description: "Create topics with speakers, duration, notes, and priority, then reorder the flow with drag and drop.",
    icon: ListChecks,
  },
  {
    title: "Export Summary",
    description: "Copy, export, or print the final agenda with notes, actions, attendees, and timeline details.",
    icon: Download,
  },
];

const defaultState = {
  meetings: [],
  activeMeetingId: null,
  filters: { query: "", category: "All", status: "All", sort: "date" },
  notificationsEnabled: false,
};

const emptyMeeting = {
  title: "",
  type: "Sync",
  customType: "",
  description: "",
  date: "",
  time: "10:00",
  duration: 30,
  category: "General",
  customCategory: "",
  status: "Planned",
  reminder: 10,
};

const emptyAttendee = { name: "", role: "", optional: false, notes: "" };
const emptyTopic = { title: "", notes: "", speaker: "", duration: 10, priority: "Medium" };
const emptyAction = { task: "", owner: "", due: "", completed: false };

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function sanitizeState(data) {
  const merged = { ...defaultState, ...data };
  const meetings = Array.isArray(merged.meetings) ? merged.meetings : [];
  return {
    ...merged,
    meetings: meetings.map((meeting) => ({
      attendees: [],
      topics: [],
      actions: [],
      notes: "",
      decisions: "",
      notified: false,
      ...meeting,
    })),
    filters: { ...defaultState.filters, ...(merged.filters || {}) },
  };
}

function toMinutes(time) {
  const [h, m] = String(time || "00:00").split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function formatMinutes(total) {
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function meetingLabel(meeting, key) {
  if (key === "type") return meeting.type === "Custom" && meeting.customType ? meeting.customType : meeting.type;
  if (key === "category") return meeting.category === "Custom" && meeting.customCategory ? meeting.customCategory : meeting.category;
  return "";
}

function getMeetingDateTime(meeting) {
  if (!meeting?.date || !meeting?.time) return null;
  const date = new Date(`${meeting.date}T${meeting.time}`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function makeSummary(meeting) {
  if (!meeting) return "Create or select a meeting to generate a live summary.";
  const start = toMinutes(meeting.time);
  let cursor = start;
  const topicLines = meeting.topics.map((topic, index) => {
    const line = `${index + 1}. ${formatMinutes(cursor)} (${topic.duration} min) - ${topic.title}${topic.speaker ? ` - ${topic.speaker}` : ""}`;
    cursor += Number(topic.duration || 0);
    return line;
  });
  const attendeeLines = meeting.attendees.map(
    (attendee) => `- ${attendee.name}${attendee.role ? ` (${attendee.role})` : ""}${attendee.optional ? " - optional" : ""}`,
  );
  const actionLines = meeting.actions.map(
    (action) => `- [${action.completed ? "x" : " "}] ${action.task}${action.owner ? ` - ${action.owner}` : ""}${action.due ? ` by ${action.due}` : ""}`,
  );
  return `${meeting.title}
${meeting.date || "No date"} ${meeting.time || ""}
${meetingLabel(meeting, "type")} | ${meetingLabel(meeting, "category")} | ${meeting.status}

Attendees:
${attendeeLines.join("\n") || "No attendees added"}

Agenda:
${topicLines.join("\n") || "No agenda topics added"}

Notes:
${meeting.notes || "No notes"}

Decisions:
${meeting.decisions || "No decisions"}

Action Items:
${actionLines.join("\n") || "No action items added"}`;
}

export default function MeetingAgendaBuilderApp() {
  const [state, setState] = useState(() => {
    if (typeof window === "undefined") return defaultState;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? sanitizeState(JSON.parse(saved)) : defaultState;
    } catch {
      return defaultState;
    }
  });
  const [meetingForm, setMeetingForm] = useState(emptyMeeting);
  const [attendeeForm, setAttendeeForm] = useState(emptyAttendee);
  const [topicForm, setTopicForm] = useState(emptyTopic);
  const [actionForm, setActionForm] = useState(emptyAction);
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState("");
  const toastTimerRef = useRef(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  const notify = useCallback(
    (title, body) => {
      if (
        state.notificationsEnabled &&
        typeof Notification !== "undefined" &&
        Notification.permission === "granted"
      ) {
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
      const now = Date.now();
      state.meetings.forEach((meeting) => {
        if (meeting.notified || meeting.status === "Archived") return;
        const meetingDate = getMeetingDateTime(meeting);
        if (!meetingDate) return;
        const reminderAt = meetingDate.getTime() - Number(meeting.reminder || 0) * 60000;
        if (now >= reminderAt && now <= meetingDate.getTime() + 60000) {
          notify(`Meeting reminder: ${meeting.title}`, `${meeting.date} ${meeting.time}`);
          setState((current) => ({
            ...current,
            meetings: current.meetings.map((item) =>
              item.id === meeting.id ? { ...item, notified: true } : item,
            ),
          }));
        }
      });
    }, 30000);
    return () => clearInterval(timer);
  }, [notify, state.meetings]);

  const activeMeeting = useMemo(
    () => state.meetings.find((meeting) => meeting.id === state.activeMeetingId) || null,
    [state.activeMeetingId, state.meetings],
  );

  const filteredMeetings = useMemo(() => {
    const query = state.filters.query.trim().toLowerCase();
    return state.meetings
      .filter((meeting) => {
        const attendeeText = meeting.attendees.map((item) => `${item.name} ${item.role}`).join(" ");
        const text = `${meeting.title} ${meeting.description} ${meeting.notes} ${meeting.decisions} ${attendeeText}`.toLowerCase();
        return (
          (meeting.status !== "Archived" || state.filters.status === "Archived") &&
          (!query || text.includes(query)) &&
          (state.filters.category === "All" || meeting.category === state.filters.category) &&
          (state.filters.status === "All" || meeting.status === state.filters.status)
        );
      })
      .sort((a, b) => {
        if (state.filters.sort === "title") return a.title.localeCompare(b.title);
        if (state.filters.sort === "status") return a.status.localeCompare(b.status);
        return String(`${a.date} ${a.time}`).localeCompare(String(`${b.date} ${b.time}`));
      });
  }, [state.filters, state.meetings]);

  const dashboard = useMemo(() => {
    const visible = state.meetings.filter((meeting) => meeting.status !== "Archived");
    const now = new Date();
    return {
      total: visible.length,
      upcoming: visible.filter((meeting) => {
        const date = getMeetingDateTime(meeting);
        return date && date >= now && meeting.status !== "Completed";
      }).length,
      completed: visible.filter((meeting) => meeting.status === "Completed").length,
      pendingActions: visible.reduce(
        (sum, meeting) => sum + meeting.actions.filter((action) => !action.completed).length,
        0,
      ),
      attendees: visible.reduce((sum, meeting) => sum + meeting.attendees.length, 0),
      agendaMinutes: visible.reduce(
        (sum, meeting) => sum + meeting.topics.reduce((total, topic) => total + Number(topic.duration || 0), 0),
        0,
      ),
    };
  }, [state.meetings]);

  const summary = useMemo(() => makeSummary(activeMeeting), [activeMeeting]);

  const timelineItems = useMemo(() => {
    if (!activeMeeting) return [];
    let cursor = toMinutes(activeMeeting.time);
    return activeMeeting.topics.map((topic) => {
      const start = cursor;
      cursor += Number(topic.duration || 0);
      return { ...topic, start };
    });
  }, [activeMeeting]);

  function updateActiveMeeting(patch) {
    if (!activeMeeting) return;
    setState((current) => ({
      ...current,
      meetings: current.meetings.map((meeting) =>
        meeting.id === activeMeeting.id ? { ...meeting, ...patch, notified: false } : meeting,
      ),
    }));
  }

  function saveMeeting(event) {
    event.preventDefault();
    const title = meetingForm.title.trim();
    if (!title) {
      setMessage("Meeting title is required.");
      return;
    }
    if (Number(meetingForm.duration) < 1) {
      setMessage("Duration must be at least 1 minute.");
      return;
    }
    const meeting = {
      id: makeId(),
      ...meetingForm,
      title,
      description: meetingForm.description.trim(),
      duration: Number(meetingForm.duration),
      reminder: Number(meetingForm.reminder || 0),
      attendees: [],
      topics: [],
      actions: [],
      notes: "",
      decisions: "",
      notified: false,
      createdAt: new Date().toISOString(),
    };
    setState((current) => ({
      ...current,
      meetings: [meeting, ...current.meetings],
      activeMeetingId: meeting.id,
    }));
    setMeetingForm(emptyMeeting);
    setMessage("Meeting created.");
  }

  function deleteMeeting(id) {
    setState((current) => ({
      ...current,
      meetings: current.meetings.filter((meeting) => meeting.id !== id),
      activeMeetingId: current.activeMeetingId === id ? null : current.activeMeetingId,
    }));
  }

  function addAttendee(event) {
    event.preventDefault();
    if (!activeMeeting) return setMessage("Create or select a meeting first.");
    if (!attendeeForm.name.trim()) return setMessage("Attendee name is required.");
    updateActiveMeeting({
      attendees: [{ id: makeId(), ...attendeeForm, name: attendeeForm.name.trim() }, ...activeMeeting.attendees],
    });
    setAttendeeForm(emptyAttendee);
  }

  function addTopic(event) {
    event.preventDefault();
    if (!activeMeeting) return setMessage("Create or select a meeting first.");
    if (!topicForm.title.trim()) return setMessage("Topic title is required.");
    const duration = Math.max(1, Number(topicForm.duration || 1));
    updateActiveMeeting({
      topics: [...activeMeeting.topics, { id: makeId(), ...topicForm, title: topicForm.title.trim(), duration }],
    });
    setTopicForm(emptyTopic);
  }

  function addAction(event) {
    event.preventDefault();
    if (!activeMeeting) return setMessage("Create or select a meeting first.");
    if (!actionForm.task.trim()) return setMessage("Action item is required.");
    updateActiveMeeting({
      actions: [{ id: makeId(), ...actionForm, task: actionForm.task.trim() }, ...activeMeeting.actions],
    });
    setActionForm(emptyAction);
  }

  function reorderTopics(event) {
    if (!activeMeeting || !event.over || event.active.id === event.over.id) return;
    const oldIndex = activeMeeting.topics.findIndex((topic) => topic.id === event.active.id);
    const newIndex = activeMeeting.topics.findIndex((topic) => topic.id === event.over.id);
    updateActiveMeeting({ topics: arrayMove(activeMeeting.topics, oldIndex, newIndex) });
  }

  async function enableNotifications() {
    if (typeof Notification === "undefined") {
      setMessage("Browser notifications are not supported here. In-app reminders will still work.");
      return;
    }
    const permission = await Notification.requestPermission();
    setState((current) => ({ ...current, notificationsEnabled: permission === "granted" }));
    setMessage(permission === "granted" ? "Meeting reminders enabled." : "In-app reminders will still work.");
  }

  async function copySummary() {
    await navigator.clipboard.writeText(summary);
    setMessage("Agenda summary copied.");
  }

  function exportSummary() {
    const blob = new Blob([summary], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "meeting-agenda-summary.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="meeting-agenda-shell min-h-screen overflow-x-hidden bg-(--background) px-3 py-8 text-(--foreground) sm:px-5">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="rounded-2xl border border-(--border) bg-(--card)/80 p-3.5 text-center shadow-xl shadow-blue-950/10 backdrop-blur-xl sm:p-5">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-5">
            <div className="min-w-0">
              <div className="mb-3 inline-flex max-w-full items-center justify-center gap-2 rounded-full border border-(--border) px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-(--primary)">
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Real-time meeting command center</span>
              </div>
              <h1 className="mx-auto max-w-4xl break-words bg-gradient-to-r from-cyan-300 via-blue-500 to-indigo-500 bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-6xl">
                Meeting Agenda Builder
              </h1>
              <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Build meetings from real input, organize attendees, drag topics into flow, track actions, and export a clean agenda summary.
              </p>
            </div>
            <div className="grid w-full max-w-4xl min-w-0 grid-cols-2 gap-2 md:grid-cols-6">
              <Stat label="Meetings" value={dashboard.total} />
              <Stat label="Upcoming" value={dashboard.upcoming} />
              <Stat label="Actions" value={dashboard.pendingActions} />
              <Stat label="Done" value={dashboard.completed} />
              <Stat label="People" value={dashboard.attendees} />
              <Stat label="Minutes" value={dashboard.agendaMinutes} />
            </div>
          </div>
        </header>

        {(message || toast) && (
          <div className="flex items-start justify-between gap-3 rounded-xl border border-(--border) bg-(--background) px-3 py-2 text-sm font-semibold text-(--primary)">
            <span className="min-w-0 break-words">{toast || message}</span>
            <button onClick={() => { setMessage(""); setToast(""); }} className="shrink-0 rounded-full p-1 hover:bg-(--secondary-hover)">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <section className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-[minmax(300px,360px)_minmax(0,1fr)_minmax(300px,360px)]">
          <div className="min-w-0 space-y-5">
            <Panel title="Create Meeting" icon={CalendarClock}>
              <form onSubmit={saveMeeting} className="space-y-3">
                <Field label="Meeting title" value={meetingForm.title} onChange={(value) => setMeetingForm({ ...meetingForm, title: value })} />
                <Field label="Description" value={meetingForm.description} onChange={(value) => setMeetingForm({ ...meetingForm, description: value })} textarea />
                <div className="grid grid-cols-2 gap-3">
                  <Select label="Type" value={meetingForm.type} onChange={(value) => setMeetingForm({ ...meetingForm, type: value })} options={meetingTypes} />
                  <Select label="Category" value={meetingForm.category} onChange={(value) => setMeetingForm({ ...meetingForm, category: value })} options={categories} />
                </div>
                {meetingForm.type === "Custom" && <Field label="Custom type" value={meetingForm.customType} onChange={(value) => setMeetingForm({ ...meetingForm, customType: value })} />}
                {meetingForm.category === "Custom" && <Field label="Custom category" value={meetingForm.customCategory} onChange={(value) => setMeetingForm({ ...meetingForm, customCategory: value })} />}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Date" type="date" value={meetingForm.date} onChange={(value) => setMeetingForm({ ...meetingForm, date: value })} />
                  <Field label="Time" type="time" value={meetingForm.time} onChange={(value) => setMeetingForm({ ...meetingForm, time: value })} />
                  <Field label="Duration" type="number" value={meetingForm.duration} onChange={(value) => setMeetingForm({ ...meetingForm, duration: value })} />
                  <Field label="Reminder min" type="number" value={meetingForm.reminder} onChange={(value) => setMeetingForm({ ...meetingForm, reminder: value })} />
                </div>
                <Select label="Status" value={meetingForm.status} onChange={(value) => setMeetingForm({ ...meetingForm, status: value })} options={statuses} />
                <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-(--primary) px-3 py-2 text-sm font-bold text-(--primary-foreground) transition hover:bg-(--primary-hover)">
                  <Plus className="h-4 w-4" /> Create meeting
                </button>
              </form>
            </Panel>

          </div>

          <div className="min-w-0 space-y-5">
            <Panel title="Saved Meetings" icon={Clipboard}>
              <div className="custom-scrollbar -m-1 max-h-80 space-y-2 overflow-y-auto p-1">
                {filteredMeetings.map((meeting) => (
                  <button
                    key={meeting.id}
                    onClick={() => setState((current) => ({ ...current, activeMeetingId: meeting.id }))}
                    className={`w-full min-w-0 rounded-xl border p-2.5 text-left transition hover:border-(--primary) ${activeMeeting?.id === meeting.id ? "border-(--primary) bg-(--primary)/10" : "border-(--border) bg-(--background)"}`}
                  >
                    <div className="flex min-w-0 items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate font-black" title={meeting.title}>{meeting.title}</div>
                        <div className="mt-1 truncate text-xs text-muted-foreground">{meeting.date || "No date"} {meeting.time || ""} | {meetingLabel(meeting, "type")}</div>
                      </div>
                      <span className="shrink-0 rounded-full border border-(--border) px-2 py-1 text-[10px] font-bold text-(--primary)">{meeting.status}</span>
                    </div>
                  </button>
                ))}
                {!filteredMeetings.length && <EmptyState text="No meetings yet. Create one to start building an agenda." />}
              </div>
            </Panel>

            <Panel title="Search & Filters" icon={Filter}>
              <div className="relative">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <input value={state.filters.query} onChange={(event) => setState((current) => ({ ...current, filters: { ...current.filters, query: event.target.value } }))} className="w-full rounded-lg border border-(--border) bg-(--background) py-2 pl-10 pr-3 text-sm outline-none focus:border-(--primary)" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Select label="Category" value={state.filters.category} onChange={(value) => setState((current) => ({ ...current, filters: { ...current.filters, category: value } }))} options={["All", ...categories]} />
                <Select label="Status" value={state.filters.status} onChange={(value) => setState((current) => ({ ...current, filters: { ...current.filters, status: value } }))} options={["All", ...statuses]} />
                <Select label="Sort" value={state.filters.sort} onChange={(value) => setState((current) => ({ ...current, filters: { ...current.filters, sort: value } }))} options={["date", "title", "status"]} />
              </div>
            </Panel>

            <div className="max-w-sm">
              <Panel title="Reminders & Export" icon={Bell} compact>
                <button onClick={enableNotifications} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-(--primary) px-2.5 py-1.5 text-xs font-bold text-(--primary-foreground) hover:bg-(--primary-hover)">
                  <Bell className="h-3.5 w-3.5" /> Enable reminders
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={copySummary} className="inline-flex items-center justify-center gap-2 rounded-lg bg-(--primary) px-2.5 py-1.5 text-xs font-bold text-(--primary-foreground) hover:bg-(--primary-hover)">
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </button>
                  <button onClick={exportSummary} className="inline-flex items-center justify-center gap-2 rounded-lg border border-(--border) bg-(--background) px-2.5 py-1.5 text-xs font-bold text-(--foreground) transition hover:border-(--primary) hover:text-(--primary)">
                    <Download className="h-3.5 w-3.5" /> Export
                  </button>
                  <button onClick={() => window.print()} className="inline-flex items-center justify-center gap-2 rounded-lg border border-(--border) bg-(--background) px-2.5 py-1.5 text-xs font-bold text-(--foreground) transition hover:border-(--primary) hover:text-(--primary)">
                    <Printer className="h-3.5 w-3.5" /> Print
                  </button>
                  <button onClick={() => setState(defaultState)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-(--border) bg-(--background) px-2.5 py-1.5 text-xs font-bold text-(--foreground) transition hover:border-(--primary) hover:text-(--primary)">
                    <RotateCcw className="h-3.5 w-3.5" /> Reset
                  </button>
                </div>
                <pre className="custom-scrollbar max-h-24 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-(--border) bg-(--background) px-2.5 py-2 text-[11px] text-muted-foreground outline-offset-2">{summary}</pre>
              </Panel>
            </div>

            {activeMeeting && (
              <Panel title="Agenda Builder" icon={ListChecks}>
                <>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Select label="Meeting status" value={activeMeeting.status} onChange={(value) => updateActiveMeeting({ status: value })} options={statuses} />
                    <button onClick={() => deleteMeeting(activeMeeting.id)} className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl border border-(--border) bg-(--background) px-3 py-2 text-sm font-bold text-(--foreground) transition hover:border-(--primary) hover:text-(--primary)">
                      <Trash2 className="h-4 w-4" /> Delete meeting
                    </button>
                  </div>
                  <form onSubmit={addTopic} className="grid gap-2.5 rounded-xl border border-(--border) bg-(--background) p-2.5 md:grid-cols-2">
                    <Field label="Topic title" value={topicForm.title} onChange={(value) => setTopicForm({ ...topicForm, title: value })} />
                    <Field label="Speaker" value={topicForm.speaker} onChange={(value) => setTopicForm({ ...topicForm, speaker: value })} />
                    <Field label="Duration" type="number" value={topicForm.duration} onChange={(value) => setTopicForm({ ...topicForm, duration: value })} />
                    <Select label="Priority" value={topicForm.priority} onChange={(value) => setTopicForm({ ...topicForm, priority: value })} options={Object.keys(priorities)} />
                    <div className="md:col-span-2">
                      <Field label="Topic notes" value={topicForm.notes} onChange={(value) => setTopicForm({ ...topicForm, notes: value })} textarea />
                    </div>
                    <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-(--primary) px-3 py-2 text-sm font-bold text-(--primary-foreground) hover:bg-(--primary-hover) md:col-span-2">
                      <Plus className="h-4 w-4" /> Add topic
                    </button>
                  </form>
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={reorderTopics}>
                    <SortableContext items={activeMeeting.topics.map((topic) => topic.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-2">
                        {activeMeeting.topics.map((topic, index) => (
                          <TopicCard
                            key={topic.id}
                            topic={topic}
                            index={index}
                            onDelete={() => updateActiveMeeting({ topics: activeMeeting.topics.filter((item) => item.id !== topic.id) })}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                  {!activeMeeting.topics.length && <EmptyState text="Agenda is empty. Add a topic to generate the meeting flow." />}
                </>
              </Panel>
            )}

            {activeMeeting && activeMeeting.topics.length > 0 && (
              <Panel title="Live Timeline" icon={AlarmClock}>
                <div className="space-y-3">
                  {timelineItems.map((topic) => (
                    <div key={`flow-${topic.id}`} className="grid grid-cols-[90px_minmax(0,1fr)] gap-3 rounded-xl border border-(--border) bg-(--background) p-2.5">
                      <div className="text-xs font-black text-(--primary)">{formatMinutes(topic.start)}</div>
                      <div className="min-w-0">
                        <div className="truncate font-black" title={topic.title}>{topic.title}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{topic.duration} min{topic.speaker ? ` | ${topic.speaker}` : ""}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            )}
          </div>

          <div className="min-w-0 space-y-5 lg:col-span-2 2xl:col-span-1">
            {activeMeeting && (
              <Panel title="Attendees" icon={Users}>
                <form onSubmit={addAttendee} className="space-y-3">
                  <Field label="Name" value={attendeeForm.name} onChange={(value) => setAttendeeForm({ ...attendeeForm, name: value })} />
                  <Field label="Role" value={attendeeForm.role} onChange={(value) => setAttendeeForm({ ...attendeeForm, role: value })} />
                  <Field label="Notes" value={attendeeForm.notes} onChange={(value) => setAttendeeForm({ ...attendeeForm, notes: value })} textarea />
                  <label className="flex items-center justify-between gap-3 rounded-xl border border-(--border) bg-(--background) px-3 py-2 text-sm font-bold">
                    Optional participant
                    <input type="checkbox" checked={attendeeForm.optional} onChange={(event) => setAttendeeForm({ ...attendeeForm, optional: event.target.checked })} className="h-5 w-5 accent-blue-600" />
                  </label>
                  <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-(--primary) px-3 py-2 text-sm font-bold text-(--primary-foreground) hover:bg-(--primary-hover)">
                    <Plus className="h-4 w-4" /> Add attendee
                  </button>
                </form>
                <div className="custom-scrollbar -m-1 max-h-48 space-y-2 overflow-y-auto p-1">
                  {activeMeeting.attendees.map((attendee) => (
                    <div key={attendee.id} className="flex min-w-0 items-start justify-between gap-2 rounded-xl border border-(--border) bg-(--background) p-2.5">
                      <div className="min-w-0">
                        <div className="truncate font-black" title={attendee.name}>{attendee.name}</div>
                        <div className="mt-1 truncate text-xs text-muted-foreground">{attendee.role || "No role"}{attendee.optional ? " | optional" : ""}</div>
                      </div>
                      <button onClick={() => updateActiveMeeting({ attendees: activeMeeting.attendees.filter((item) => item.id !== attendee.id) })} className="shrink-0 rounded-xl p-2 text-(--primary) hover:bg-(--secondary-hover)">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {activeMeeting && (
              <Panel title="Notes & Actions" icon={NotebookPen}>
                <>
                  <Field label="Meeting notes" value={activeMeeting.notes} onChange={(value) => updateActiveMeeting({ notes: value })} textarea />
                  <Field label="Decisions" value={activeMeeting.decisions} onChange={(value) => updateActiveMeeting({ decisions: value })} textarea />
                  <form onSubmit={addAction} className="space-y-2.5 rounded-xl border border-(--border) bg-(--background) p-2.5">
                    <Field label="Action item" value={actionForm.task} onChange={(value) => setActionForm({ ...actionForm, task: value })} />
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Owner" value={actionForm.owner} onChange={(value) => setActionForm({ ...actionForm, owner: value })} />
                      <Field label="Due" type="date" value={actionForm.due} onChange={(value) => setActionForm({ ...actionForm, due: value })} />
                    </div>
                    <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-(--primary) px-3 py-2 text-sm font-bold text-(--primary-foreground) hover:bg-(--primary-hover)">
                      <Plus className="h-4 w-4" /> Add action
                    </button>
                  </form>
                  <div className="space-y-2">
                    {activeMeeting.actions.map((action) => (
                      <label key={action.id} className="flex min-w-0 items-start gap-3 rounded-xl border border-(--border) bg-(--background) p-2.5">
                        <input type="checkbox" checked={action.completed} onChange={(event) => updateActiveMeeting({ actions: activeMeeting.actions.map((item) => item.id === action.id ? { ...item, completed: event.target.checked } : item) })} className="mt-1 h-5 w-5 shrink-0 accent-blue-600" />
                        <span className="min-w-0 flex-1">
                          <span className="block break-words font-bold">{action.task}</span>
                          <span className="block truncate text-xs text-muted-foreground">{action.owner || "No owner"}{action.due ? ` | ${action.due}` : ""}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </>
              </Panel>
            )}

          </div>
        </section>

        <HowItWorks />
      </div>

      <style jsx global>{`
        .meeting-agenda-shell,
        .meeting-agenda-shell * {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .meeting-agenda-shell::-webkit-scrollbar,
        .meeting-agenda-shell *::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 0;
          height: 0;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(148, 163, 184, 0.08);
          border-radius: 999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.35);
          border-radius: 999px;
        }
      `}</style>
    </div>
  );
}

function TopicCard({ topic, index, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: topic.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} className={`min-w-0 rounded-xl border border-(--border) bg-(--background) p-2.5 shadow-sm transition hover:border-(--primary) ${isDragging ? "opacity-70" : ""}`}>
      <div className="flex min-w-0 items-start gap-3">
        <button {...attributes} {...listeners} className="mt-1 shrink-0 rounded-lg p-1.5 text-muted-foreground transition hover:bg-(--muted) hover:text-(--primary)">
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="rounded-full border border-(--border) px-2 py-1 text-[10px] font-black text-(--primary)">{index + 1}</span>
            <h3 className="min-w-0 truncate text-base font-black" title={topic.title}>{topic.title}</h3>
            <span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${priorities[topic.priority]}`}>{topic.priority}</span>
          </div>
          <p className="mt-2 line-clamp-2 break-words text-sm text-muted-foreground">{topic.notes || "No notes"}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-(--primary)">
            <span>{topic.duration} min</span>
            {topic.speaker && <span className="max-w-full truncate">Speaker: {topic.speaker}</span>}
          </div>
        </div>
        <button onClick={onDelete} className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition hover:bg-(--muted) hover:text-(--primary)">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function Panel({ title, icon: Icon, children, compact = false }) {
  return (
    <section className={`min-w-0 rounded-xl border border-(--border) bg-(--card)/82 shadow-md shadow-blue-950/10 backdrop-blur-xl transition duration-300 hover:shadow-blue-500/10 ${compact ? "p-2" : "p-2.5"}`}>
      <div className={`${compact ? "mb-2" : "mb-2.5"} flex min-w-0 items-center gap-2`}>
        <div className={`${compact ? "h-6 w-6" : "h-7 w-7"} flex shrink-0 items-center justify-center rounded-lg bg-(--background) text-(--primary)`}>
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
    <div className="min-w-0 rounded-xl border border-(--border) bg-(--background) px-2.5 py-2 transition hover:bg-(--muted)">
      <div className="break-words text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 break-words text-xl font-black leading-tight">{value}</div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="p-5 text-center text-sm text-muted-foreground">
      {text}
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

function Field({ label, value, onChange, textarea = false, type = "text" }) {
  const base = "w-full rounded-lg border border-(--border) bg-(--background) px-3 py-1.5 text-sm outline-none transition placeholder:text-muted-foreground focus:border-(--primary)";
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[.16em] text-muted-foreground">{label}</span>
      {textarea ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} className={`${base} min-h-16 resize-y`} />
      ) : (
        <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className={base} />
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

