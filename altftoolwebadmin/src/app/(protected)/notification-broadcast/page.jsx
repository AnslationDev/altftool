"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Bell,
  Send,
  Clock,
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
    cls: "bg-blue-50 text-blue-700 border-blue-200",
  },
  warning: {
    label: "Warning",
    icon: AlertTriangle,
    cls: "bg-amber-50 text-amber-700 border-amber-200",
  },
  notice: {
    label: "Notice",
    icon: Info,
    cls: "bg-purple-50 text-purple-700 border-purple-200",
  },
};

const STATUS_META = {
  draft: { label: "Draft", cls: "bg-gray-100 text-gray-600" },
  scheduled: { label: "Scheduled", cls: "bg-amber-100 text-amber-700" },
  sent: { label: "Sent", cls: "bg-green-100 text-green-700" },
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
  const [sendMode, setSendMode] = useState("now"); // "now" | "schedule"
  const [scheduledAt, setScheduledAt] = useState("");
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
    if (sendMode === "schedule" && !scheduledAt) {
      setError("Pick a schedule date/time.");
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
          sendNow: sendMode === "now",
          scheduledAt: sendMode === "schedule" ? new Date(scheduledAt).getTime() : null,
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
      setSendMode("now");
      setScheduledAt("");

      onCreated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
      <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
        <Plus size={16} className="text-gray-400" />
        New Broadcast
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-2.5">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. System maintenance tonight"
          className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition"
        />
      </div>

      {/* Body */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Body</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="Notification message…"
          className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition resize-none"
        />
      </div>

      {/* Type */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Type</label>
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
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
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
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Target</label>
        <div className="flex gap-3 mb-3">
          {[
            { val: "all", label: "All users", Icon: Globe },
            { val: "users", label: "Specific users", Icon: Users },
          ].map(({ val, label, Icon }) => (
            <label
              key={val}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm cursor-pointer transition ${
                targetType === val
                  ? "border-gray-900 bg-gray-50 font-semibold text-gray-900"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                className="hidden"
                checked={targetType === val}
                onChange={() => setTargetType(val)}
              />
              <Icon size={14} />
              {label}
            </label>
          ))}
        </div>

        {targetType === "users" && (
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
              <input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search admins…"
                className="w-full text-sm outline-none bg-transparent placeholder-gray-400"
              />
            </div>
            <div className="max-h-44 overflow-y-auto divide-y divide-gray-50">
              {filteredAdmins.length === 0 && (
                <p className="text-xs text-gray-400 px-4 py-3">No admins found</p>
              )}
              {filteredAdmins.map((a) => {
                const checked = selectedUsers.includes(a.id);
                const name = a.fullName || a.firstName || a.email;
                return (
                  <label
                    key={a.id}
                    className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleUser(a.id)}
                      className="rounded"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{name}</p>
                      <p className="text-xs text-gray-400 truncate">{a.email}</p>
                    </div>
                  </label>
                );
              })}
            </div>
            {selectedUsers.length > 0 && (
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 font-medium">
                {selectedUsers.length} selected
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action URL */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">
          Action URL <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <input
          value={actionUrl}
          onChange={(e) => setActionUrl(e.target.value)}
          placeholder="https://…"
          className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition"
        />
      </div>

      {/* Schedule */}
      {/* <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Send</label>
        <div className="flex gap-3 mb-3">
          {[
            { val: "now", label: "Send Now", Icon: Send },
            { val: "schedule", label: "Schedule", Icon: Clock },
          ].map(({ val, label, Icon }) => (
            <label
              key={val}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm cursor-pointer transition ${
                sendMode === val
                  ? "border-gray-900 bg-gray-50 font-semibold text-gray-900"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                className="hidden"
                checked={sendMode === val}
                onChange={() => setSendMode(val)}
              />
              <Icon size={14} />
              {label}
            </label>
          ))}
        </div>

        {sendMode === "schedule" && (
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition"
          />
        )}
      </div> */}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition disabled:opacity-60"
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : sendMode === "now" ? (
          <>
            <Send size={14} /> Send Broadcast
          </>
        ) : (
          <>
            <Clock size={14} /> Schedule Broadcast
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
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
        <Bell size={28} className="text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-400">No broadcasts yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {broadcasts.map((b) => (
        <div key={b.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <TypeBadge type={b.type} />
                <StatusBadge status={b.status} />
              </div>
              <p className="text-sm font-semibold text-gray-900 truncate">{b.title}</p>
              <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{b.body}</p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {b.status === "scheduled" && (
                <button
                  onClick={() => onCancel(b.id)}
                  title="Cancel schedule"
                  className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 transition"
                >
                  <X size={14} />
                </button>
              )}
              <button
                onClick={() => onDelete(b.id)}
                title="Delete broadcast"
                className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-400">
            <span>
              <span className="font-medium text-gray-500">Target:</span>{" "}
              {b.target?.type === "all"
                ? "All users"
                : `${b.target?.userIds?.length ?? 0} user(s)`}
            </span>
            <span>
              <span className="font-medium text-gray-500">Created:</span> {fmtDate(b.createdAt)}
            </span>
            {b.sentAt && (
              <span>
                <span className="font-medium text-gray-500">Sent:</span> {fmtDate(b.sentAt)}
              </span>
            )}
            {b.status === "scheduled" && b.scheduledAt && (
              <span>
                <span className="font-medium text-gray-500">Scheduled:</span>{" "}
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
  const router = useRouter();

  const [broadcasts, setBroadcasts] = useState([]);
  const [adminsList, setAdminsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("create"); // "create" | "history"

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const headers = { Authorization: `Bearer ${token}` };

      const [bRes, aRes] = await Promise.all([
        fetch("/api/notifications/broadcast", { headers }),
        fetch("/api/admin/list", { headers }),
      ]);

      if (bRes.ok) {
        const { broadcasts: list } = await bRes.json();
        setBroadcasts(list ?? []);
      }

      if (aRes.ok) {
        const { admins } = await aRes.json();
        setAdminsList(admins ?? []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
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
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Bell size={20} />
            Notification Broadcasts
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Create and manage system-wide notifications for all admins.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition"
          title="Refresh"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {[
          { key: "create", label: "Create" },
          { key: "history", label: `History (${broadcasts.length})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${
              tab === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
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