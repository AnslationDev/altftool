"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebaseFirestore";
import { useAuth } from "@/context/AuthContext";
import { emitAlert } from "@/lib/alertBus";
import {
  Send,
  Loader2,
  TicketIcon,
  Users,
  PlusCircle,
  AlertCircle,
} from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_BADGE = {
  open: "bg-[var(--info-soft)] text-[var(--info)] border-[var(--border)]",
  in_progress: "bg-[var(--warning-soft)] text-[var(--warning)] border-[var(--border)]",
  resolved: "bg-[var(--success-soft)] text-[var(--success)] border-[var(--border)]",
  closed: "bg-[var(--surface-soft)] text-[var(--muted)] border-[var(--border)]",
};

const STATUS_LABEL = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

const PRIORITY_BADGE = {
  low: "bg-[var(--surface-soft)] text-[var(--muted)] border-[var(--border)]",
  medium: "bg-[var(--warning-soft)] text-[var(--warning)] border-[var(--border)]",
  high: "bg-[var(--danger-soft)] text-[var(--danger)] border-[var(--border)]",
};

function fmtDate(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-9 h-9 rounded-xl bg-[var(--primary)] flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-[var(--primary-foreground)]" />
      </div>
      <div>
        <h2 className="text-base font-bold text-[var(--foreground)]">{title}</h2>
        {subtitle && <p className="text-xs text-[var(--muted)] mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function SuperAdminsSection({ admins }) {
  return (
    <section className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6">
      <SectionHeader
        icon={Users}
        title="Super Admins"
        subtitle="Your support contacts"
      />

      {admins.length === 0 ? (
        <p className="text-sm text-[var(--muted)] text-center py-4">No super admins found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {admins.map((a) => {
            const initials = (a.fullName || a.firstName || a.email || "SA")
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);
            return (
              <div
                key={a.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)]"
              >
                {a.photoURL ? (
                  <img
                    src={a.photoURL}
                    alt={a.fullName}
                    className="w-9 h-9 rounded-xl object-cover border border-[var(--border)] shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center text-xs font-bold shrink-0">
                    {initials}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--foreground)] truncate">
                    {a.fullName || `${a.firstName ?? ""} ${a.lastName ?? ""}`.trim() || "Super Admin"}
                  </p>
                  <p className="text-xs text-[var(--muted)] truncate">{a.email}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function RaiseTicketSection({ user, onTicketCreated }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "query",
    priority: "medium",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.description.trim()) e.description = "Description is required";
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/support/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      emitAlert({ type: "success", message: "Ticket raised successfully!" });
      setForm({ title: "", description: "", type: "query", priority: "medium" });
      setErrors({});
      onTicketCreated?.();
    } catch {
      emitAlert({ type: "error", message: "Failed to raise ticket. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const field = (key) => ({
    value: form[key],
    onChange: (e) => {
      setForm((p) => ({ ...p, [key]: e.target.value }));
      if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
    },
  });

  return (
    <section className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6">
      <SectionHeader
        icon={PlusCircle}
        title="Raise a Ticket"
        subtitle="Describe your issue and we'll get back to you"
      />

      <div className="space-y-4">
        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Title</label>
          <input
            type="text"
            placeholder="Brief summary of your issue"
            {...field("title")}
            className={`w-full text-sm px-3 py-2.5 rounded-xl border bg-[var(--surface)] placeholder:text-[var(--muted)] focus:outline-none focus:[box-shadow:var(--focus-ring)] transition ${
              errors.title
                ? "border-[var(--danger)]"
                : "border-[var(--border)] focus:border-[var(--border-strong)]"
            }`}
          />
          {errors.title && (
            <p className="flex items-center gap-1 text-xs text-[var(--danger)] font-medium">
              <AlertCircle className="w-3 h-3" /> {errors.title}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Description</label>
          <textarea
            rows={4}
            placeholder="Describe your issue in detail…"
            {...field("description")}
            className={`w-full text-sm px-3 py-2.5 rounded-xl border bg-[var(--surface)] placeholder:text-[var(--muted)] focus:outline-none focus:[box-shadow:var(--focus-ring)] transition resize-none ${
              errors.description
                ? "border-[var(--danger)]"
                : "border-[var(--border)] focus:border-[var(--border-strong)]"
            }`}
          />
          {errors.description && (
            <p className="flex items-center gap-1 text-xs text-[var(--danger)] font-medium">
              <AlertCircle className="w-3 h-3" /> {errors.description}
            </p>
          )}
        </div>

        {/* Type + Priority */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Type</label>
            <select
              {...field("type")}
              className="w-full text-sm px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] focus:outline-none focus:[box-shadow:var(--focus-ring)] focus:border-[var(--border-strong)] transition"
            >
              <option value="query">Query</option>
              <option value="bug">Bug</option>
              <option value="feature">Feature Request</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Priority</label>
            <select
              {...field("priority")}
              className="w-full text-sm px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] focus:outline-none focus:[box-shadow:var(--focus-ring)] focus:border-[var(--border-strong)] transition"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <button
          onClick={submit}
          disabled={loading}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-60 text-[var(--primary-foreground)] text-sm font-semibold rounded-xl transition"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {loading ? "Submitting…" : "Submit Ticket"}
        </button>
      </div>
    </section>
  );
}

function MyTicketsSection({ tickets, loading }) {
  const router = useRouter();

  return (
    <section className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6">
      <SectionHeader
        icon={TicketIcon}
        title="My Tickets"
        subtitle={`${tickets.length} ticket${tickets.length !== 1 ? "s" : ""}`}
      />

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-5 h-5 animate-spin text-[var(--muted)]" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-8">
          <TicketIcon className="w-8 h-8 text-[var(--muted)] mx-auto mb-2" />
          <p className="text-sm text-[var(--muted)]">No tickets yet. Raise one above!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tickets.map((t) => (
            <button
              key={t.id}
              onClick={() => router.push(`/support/${t.id}`)}
              className="w-full text-left flex items-center justify-between gap-3 p-3.5 rounded-xl border border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-soft)] transition group"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--foreground)] truncate">
                  {t.title}
                </p>
                <p className="text-xs text-[var(--muted)] mt-0.5">{fmtDate(t.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${PRIORITY_BADGE[t.priority] ?? PRIORITY_BADGE.low}`}
                >
                  {t.priority}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_BADGE[t.status] ?? STATUS_BADGE.open}`}
                >
                  {STATUS_LABEL[t.status] ?? t.status}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SupportPage() {
  const { user } = useAuth();
  const [superAdmins, setSuperAdmins] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load super admins (static, one-time via API)
  useEffect(() => {
    if (!user) return;
    user.getIdToken().then((token) =>
      fetch("/api/admin/list", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then(({ admins }) => {
          setSuperAdmins((admins ?? []).filter((a) => a.roleType === "superadmin" && a.isActive !== false));
        })
        .catch(() => {})
    );
  }, [user]);

  // Real-time my tickets
  useEffect(() => {
    if (!user) return;
    setTicketsLoading(true);
    const q = query(
      collection(db, "support_tickets"),
      where("createdBy", "==", user.uid),
      where("isDeleted", "!=", true),
      orderBy("isDeleted"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setTickets(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setTicketsLoading(false);
    });
    return () => unsub();
  }, [user, refreshKey]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--foreground)]">Support</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Get help, browse FAQs, or raise a support ticket.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <SuperAdminsSection admins={superAdmins} />
      <RaiseTicketSection user={user} onTicketCreated={() => setRefreshKey((k) => k + 1)} />
      <MyTicketsSection tickets={tickets} loading={ticketsLoading} />
      </div>
    </div>
  );
}
