// Shared display helpers for the Workspace Explorer (client-side).
import {
  Activity, CheckCircle2, Download, LogIn, Pencil, Play, Plus, Send, Trash2, Upload,
} from "lucide-react";

export const ACTION_KIND_META = {
  create: { label: "Created", icon: Plus, tone: "var(--success)" },
  update: { label: "Updated", icon: Pencil, tone: "var(--info)" },
  delete: { label: "Deleted", icon: Trash2, tone: "var(--danger)" },
  publish: { label: "Published", icon: Send, tone: "var(--primary)" },
  status: { label: "Status", icon: Activity, tone: "var(--warning)" },
  export: { label: "Exported", icon: Download, tone: "var(--muted)" },
  import: { label: "Imported", icon: Upload, tone: "var(--muted)" },
  auth: { label: "Auth", icon: LogIn, tone: "var(--info)" },
  review: { label: "Review", icon: CheckCircle2, tone: "var(--success)" },
  run: { label: "Ran", icon: Play, tone: "var(--info)" },
  activity: { label: "Activity", icon: Activity, tone: "var(--muted)" },
};

export function kindMeta(kind) {
  return ACTION_KIND_META[kind] || ACTION_KIND_META.activity;
}

export function timeAgo(ms) {
  if (!ms) return "";
  const s = Math.floor((Date.now() - ms) / 1000);
  if (s < 60) return `${Math.max(s, 1)}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(ms).toLocaleDateString();
}

export function formatDateTime(ms) {
  if (!ms) return "";
  return new Date(ms).toLocaleString(undefined, {
    month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
  });
}

export function formatClock(ms) {
  if (!ms) return "";
  return new Date(ms).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

// "AltFTool → Admin Panel → Blogs" — from denormalized event labels.
export function breadcrumb(ev) {
  return [ev.projectName, ev.applicationName, ev.moduleName, ev.sectionName, ev.featureName].filter(Boolean);
}

export function dayLabel(ms) {
  if (!ms) return "";
  const d = new Date(ms);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a, b) => a.toDateString() === b.toDateString();
  if (sameDay(d, today)) return "Today";
  if (sameDay(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}
