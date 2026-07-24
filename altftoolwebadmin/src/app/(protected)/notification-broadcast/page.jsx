"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Bell,
  Send,
  Trash2,
  X,
  Users,
  Globe,
  AlertTriangle,
  Info,
  Megaphone,
  Plus,
  RefreshCw,
} from "lucide-react";

// ─── helpers ─────────────────────────────────────────────────────────────────

function fmtDate(ms) {
  if (!ms) return "—";
  return new Date(ms).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const TYPE_META = {
  announcement: {
    label: "Announcement",
    icon: Megaphone,
    cls: "bg-[var(--info-soft)] text-[var(--info)] border-[var(--border)]",
  },
  warning: {
    label: "Warning",
    icon: AlertTriangle,
    cls: "bg-[var(--warning-soft)] text-[var(--warning)] border-[var(--border)]",
  },
  notice: {
    label: "Notice",
    icon: Info,
    cls: "bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--border)]",
  },
};

const STATUS_META = {
  draft: { label: "Draft", cls: "bg-[var(--surface-soft)] text-[var(--muted)]" },
  scheduled: { label: "Scheduled", cls: "bg-[var(--warning-soft)] text-[var(--warning)]" },
  sent: { label: "Sent", cls: "bg-[var(--success-soft)] text-[var(--success)]" },
};

// ─── sub-components ───────────────────────────────────────────────────────────

function TypeBadge({ type }) {
  const meta = TYPE_META[type] ?? TYPE_META.notice;
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${meta.cls}`}
    >
      <Icon size={10} />
      {meta.label}
    </span>
  );
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status] ?? STATUS_META.draft;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${meta.cls}`}>
      {meta.label}
    </span>
  );
}

// ─── Create Form ─────────────────────────────────────────────────────────────

function CreateBroadcastPanel({ adminsList, onCreated }) {
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState("announcement");
  const [targetType, setTargetType] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [actionUrl, setActionUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filteredAdmins = adminsList.filter((a) => {
    const q = userSearch.toLowerCase();
    return (
      a.email?.toLowerCase().includes(q) ||
      a.fullName?.toLowerCase().includes(q) ||
      a.firstName?.toLowerCase().includes(q)
    );
  });

  const toggleUser = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    setError("");
    if (!title.trim() || !body.trim()) {
      setError("Title and body are required.");
      return;
    }
    if (targetType === "users" && selectedUsers.length === 0) {
      setError("Select at least one user.");
      return;
    }

    try {
      setLoading(true);
      const token = await user.getIdToken();
      const res = await fetch("/api/notifications/broadcast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          type,
          target: {
            type: targetType,
            userIds: targetType === "users" ? selectedUsers : [],
          },
          actionUrl: actionUrl.trim(),
          sendNow: true,
          scheduledAt: null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      // Reset
      setTitle("");
      setBody("");
      setType("announcement");
      setTargetType("all");
      setSelectedUsers([]);
      setActionUrl("");

      onCreated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-sm p-6 space-y-5">
      <h2 className="text-base font-semibold text-[var(--foreground)] flex items-center gap-2">
        <Plus size={16} className="text-[var(--muted)]" />
        New Broadcast
      </h2>

      {error && (
        <div className="bg-[var(--danger-soft)] border border-[var(--border)] text-[var(--danger)] text-sm rounded-xl px-4 py-2.5">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. System maintenance tonight"
          className="w-full border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-sm outline-none focus:[box-shadow:var(--focus-ring)] focus:border-[var(--border-strong)] transition"
        />
      </div>

      {/* Body */}
      <div>
        <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">Body</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="Notification message…"
          className="w-full border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-sm outline-none focus:[box-shadow:var(--focus-ring)] focus:border-[var(--border-strong)] transition resize-none"
        />
      </div>

      {/* Type */}
      <div>
        <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">Type</label>
        <div className="flex gap-2 flex-wrap">
          {["announcement", "warning", "notice"].map((t) => {
            const meta = TYPE_META[t];
            const Icon = meta.icon;
            return (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                  type === t
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]"
                    : "bg-[var(--surface)] text-[var(--muted)] border-[var(--border)] hover:border-[var(--border-strong)]"
                }`}
              >
                <Icon size={12} />
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Target */}
      <div>
        <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">Target</label>
        <div className="flex gap-3 mb-3">
          {[
            { val: "all", label: "All users", Icon: Globe },
            { val: "users", label: "Specific users", Icon: Users },
          ].map(({ val, label, Icon }) => (
            <label
              key={val}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm cursor-pointer transition has-[:focus-visible]:[box-shadow:var(--focus-ring)] ${
                targetType === val
                  ? "border-[var(--primary)] bg-[var(--surface-soft)] font-semibold text-[var(--foreground)]"
                  : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--border-strong)]"
              }`}
            >
              <input
                type="radio"
                name="broadcast-target"
                className="peer sr-only"
                checked={targetType === val}
                onChange={() => setTargetType(val)}
              />
              <Icon size={14} />
              {label}
            </label>
          ))}
        </div>

        {targetType === "users" && (
          <div className="border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="px-3 py-2 border-b border-[var(--border)] bg-[var(--surface-soft)]">
              <input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search admins…"
                className="w-full text-sm outline-none bg-transparent placeholder:text-[var(--muted)]"
              />
            </div>
            <div className="max-h-44 overflow-y-auto divide-y divide-[var(--border)]">
              {filteredAdmins.length === 0 && (
                <p className="text-xs text-[var(--muted)] px-4 py-3">No admins found</p>
              )}
              {filteredAdmins.map((a) => {
                const checked = selectedUsers.includes(a.id);
                const name = a.fullName || a.firstName || a.email;
                return (
                  <label
                    key={a.id}
                    className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-[var(--surface-soft)] transition"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleUser(a.id)}
                      className="rounded"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--foreground)] truncate">{name}</p>
                      <p className="text-xs text-[var(--muted)] truncate">{a.email}</p>
                    </div>
                  </label>
                );
              })}
            </div>
            {selectedUsers.length > 0 && (
              <div className="px-4 py-2 bg-[var(--surface-soft)] border-t border-[var(--border)] text-xs text-[var(--muted)] font-medium">
                {selectedUsers.length} selected
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action URL */}
      <div>
        <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">
          Action URL <span className="font-normal text-[var(--muted)]">(optional)</span>
        </label>
        <input
          value={actionUrl}
          onChange={(e) => setActionUrl(e.target.value)}
          placeholder="https://…"
          className="w-full border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-sm outline-none focus:[box-shadow:var(--focus-ring)] focus:border-[var(--border-strong)] transition"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-semibold rounded-xl hover:bg-[var(--primary-hover)] transition disabled:opacity-60"
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-[var(--primary-foreground)] border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <Send size={14} /> Send Broadcast
          </>
        )}
      </button>
    </div>
  );
}

// ─── Broadcast List ───────────────────────────────────────────────────────────

function BroadcastList({ broadcasts, onRefresh, onDelete, onCancel }) {
  if (!broadcasts.length) {
    return (
      <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-sm p-10 text-center">
        <Bell size={28} className="text-[var(--muted)] mx-auto mb-2" />
        <p className="text-sm text-[var(--muted)]">No broadcasts yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {broadcasts.map((b) => (
        <div key={b.id} className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-sm px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <TypeBadge type={b.type} />
                <StatusBadge status={b.status} />
              </div>
              <p className="text-sm font-semibold text-[var(--foreground)] truncate">{b.title}</p>
              <p className="text-xs text-[var(--muted)] mt-0.5 line-clamp-2">{b.body}</p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {b.status === "scheduled" && (
                <button
                  onClick={() => onCancel(b.id)}
                  title="Cancel schedule"
                  aria-label="Cancel schedule"
                  className="p-1.5 rounded-lg text-[var(--warning)] hover:bg-[var(--warning-soft)] transition"
                >
                  <X size={14} />
                </button>
              )}
              <button
                onClick={() => onDelete(b.id)}
                title="Delete broadcast"
                aria-label="Delete broadcast"
                className="p-1.5 rounded-lg text-[var(--danger)] hover:bg-[var(--danger-soft)] transition"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[var(--muted)]">
            <span>
              <span className="font-medium text-[var(--muted)]">Target:</span>{" "}
              {b.target?.type === "all"
                ? "All users"
                : `${b.target?.userIds?.length ?? 0} user(s)`}
            </span>
            <span>
              <span className="font-medium text-[var(--muted)]">Created:</span> {fmtDate(b.createdAt)}
            </span>
            {b.sentAt && (
              <span>
                <span className="font-medium text-[var(--muted)]">Sent:</span> {fmtDate(b.sentAt)}
              </span>
            )}
            {b.status === "scheduled" && b.scheduledAt && (
              <span>
                <span className="font-medium text-[var(--muted)]">Scheduled:</span>{" "}
                {fmtDate(b.scheduledAt)}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotificationBroadcastPage() {
  const { user } = useAuth();

  const [broadcasts, setBroadcasts] = useState([]);
  const [adminsList, setAdminsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("create"); // "create" | "history"
  const fetchAbortRef = useRef(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    fetchAbortRef.current?.abort();
    const controller = new AbortController();
    fetchAbortRef.current = controller;

    try {
      const token = await user.getIdToken();
      if (controller.signal.aborted) return;
      const headers = { Authorization: `Bearer ${token}` };

      const [bRes, aRes] = await Promise.all([
        fetch("/api/notifications/broadcast", { headers, signal: controller.signal }),
        fetch("/api/admin/list", { headers, signal: controller.signal }),
      ]);

      if (controller.signal.aborted) return;
      if (bRes.ok) {
        const { broadcasts: list } = await bRes.json();
        setBroadcasts(list ?? []);
      }

      if (aRes.ok) {
        const { admins } = await aRes.json();
        setAdminsList(admins ?? []);
      }
    } catch (err) {
      if (err?.name !== "AbortError" && !controller.signal.aborted) {
        console.error("Failed to load notification broadcasts", err);
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
      if (fetchAbortRef.current === controller) fetchAbortRef.current = null;
    }
  }, [user]);

  useEffect(() => {
    fetchData();
    return () => fetchAbortRef.current?.abort();
  }, [fetchData]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this broadcast?")) return;
    try {
      const token = await user.getIdToken();
      await fetch(`/api/notifications/broadcast?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setBroadcasts((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = async (id) => {
    try {
      const token = await user.getIdToken();
      await fetch(`/api/notifications/broadcast?id=${id}&action=cancel`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
            <Bell size={20} />
            Notification Broadcasts
          </h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">
            Create and manage system-wide notifications for all admins.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="p-2 rounded-xl text-[var(--muted)] hover:bg-[var(--surface-soft)] transition"
          title="Refresh"
          aria-label="Refresh"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[var(--surface-soft)] rounded-xl p-1 w-fit">
        {[
          { key: "create", label: "Create" },
          { key: "history", label: `History (${broadcasts.length})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${
              tab === key ? "bg-[var(--surface)] text-[var(--foreground)] shadow-sm" : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-[var(--muted)]">
          <div className="w-6 h-6 border-2 border-[var(--border)] border-t-[var(--muted)] rounded-full animate-spin" />
        </div>
      ) : tab === "create" ? (
        <CreateBroadcastPanel
          adminsList={adminsList}
          onCreated={() => {
            fetchData();
            setTab("history");
          }}
        />
      ) : (
        <BroadcastList
          broadcasts={broadcasts}
          onRefresh={fetchData}
          onDelete={handleDelete}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
