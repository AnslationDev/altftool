"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { emitAlert } from "@/lib/alertBus";
import {
  ArrowLeft,
  Send,
  Loader2,
  Clock,
  UserCheck,
  ChevronDown,
  RefreshCw,
  AlertTriangle,
  User,
} from "lucide-react";

// ── Shared chat helpers ───────────────────────────────────────────────────────

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function Avatar({ name, photoURL }) {
  if (photoURL) {
    return (
      <img
        src={photoURL}
        alt={name}
        className="w-7 h-7 rounded-full object-cover border border-gray-200 shrink-0"
      />
    );
  }
  return (
    <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-600 font-bold text-[10px] flex items-center justify-center shrink-0">
      {getInitials(name)}
    </div>
  );
}

const STATUS_BADGE = {
  open: "bg-blue-50 text-blue-700 border-blue-100",
  in_progress: "bg-yellow-50 text-yellow-700 border-yellow-100",
  resolved: "bg-green-50 text-green-700 border-green-100",
  closed: "bg-gray-100 text-gray-500 border-gray-200",
};

const STATUS_LABEL = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

const STATUS_FLOW = ["open", "in_progress", "resolved", "closed"];

const PRIORITY_BADGE = {
  low: "bg-gray-50 text-gray-500 border-gray-200",
  medium: "bg-orange-50 text-orange-600 border-orange-100",
  high: "bg-red-50 text-red-600 border-red-100",
};

const TYPE_LABEL = { bug: "Bug", feature: "Feature Request", query: "Query" };

function fmtDateTime(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeUntilDelete(autoDeleteAt) {
  const diff = autoDeleteAt - Date.now();
  if (diff <= 0) return "soon";
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export default function AdminTicketDetailPage() {
  const { ticketId } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [senderProfiles, setSenderProfiles] = useState({}); // uid → { name, photoURL, isAdmin }
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [reopening, setReopening] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAssign, setShowAssign] = useState(false);

  const bottomRef = useRef(null);

  useEffect(() => {
    if (!ticketId) return;
    const unsub = onSnapshot(doc(db, "support_tickets", ticketId), (snap) => {
      if (snap.exists()) setTicket({ id: snap.id, ...snap.data() });
      setLoading(false);
    });
    return () => unsub();
  }, [ticketId]);

  useEffect(() => {
    if (!ticketId) return;
    const q = query(
      collection(db, "support_tickets", ticketId, "messages"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [ticketId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load admins for assignment + build sender profiles
  useEffect(() => {
  if (!user) return;

  user.getIdToken().then((token) =>
    fetch("/api/admin/list", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(({ admins: list }) => {
        const superAdmins = (list ?? []).filter(
          (a) => a.isActive !== false && a.roleType === "superadmin"
        );

        setAdmins(superAdmins);

        // Build profile map for chat
        const map = {};
        superAdmins.forEach((a) => {
          map[a.id] = {
            name:
              a.fullName ||
              `${a.firstName ?? ""} ${a.lastName ?? ""}`.trim() ||
              a.email ||
              "Admin",
            photoURL: a.photoURL || null,
            isAdmin: true,
          };
        });

        setSenderProfiles(map);
      })
      .catch(() => {})
  );
}, [user]);

  const authPatch = async (url, body) => {
    const token = await user.getIdToken();
    return fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
  };

  const sendReply = async () => {
    if (!reply.trim() || sending) return;
    setSending(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/support/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ticketId, message: reply.trim() }),
      });
      if (!res.ok) throw new Error("Failed");
      setReply("");
    } catch {
      emitAlert({ type: "error", message: "Failed to send reply." });
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async (status) => {
    setUpdatingStatus(true);
    try {
      const res = await authPatch("/api/support/update-status", { ticketId, status });
      if (!res.ok) throw new Error("Failed");
      emitAlert({ type: "success", message: `Status updated to ${STATUS_LABEL[status]}.` });
    } catch {
      emitAlert({ type: "error", message: "Failed to update status." });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const assignTicket = async (adminId) => {
    setAssigning(true);
    try {
      const res = await authPatch("/api/support/update-status", {
        ticketId,
        assignedTo: adminId || null,
      });
      if (!res.ok) throw new Error("Failed");
      emitAlert({ type: "success", message: "Ticket assigned." });
      setShowAssign(false);
    } catch {
      emitAlert({ type: "error", message: "Failed to assign ticket." });
    } finally {
      setAssigning(false);
    }
  };

  const reopen = async () => {
    setReopening(true);
    try {
      const res = await authPatch("/api/support/reopen", { ticketId });
      if (!res.ok) throw new Error("Failed");
      emitAlert({ type: "success", message: "Ticket reopened." });
    } catch {
      emitAlert({ type: "error", message: "Failed to reopen ticket." });
    } finally {
      setReopening(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">Ticket not found.</p>
        <button onClick={() => router.push("/tickets")} className="mt-4 text-sm text-blue-600 hover:underline">
          Back to Support Management
        </button>
      </div>
    );
  }

  const isClosed = ticket.status === "closed";
  const assignedAdmin = admins.find((a) => a.id === ticket.assignedTo);
  const currentStatusIdx = STATUS_FLOW.indexOf(ticket.status);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Back */}
      <button
        onClick={() => router.push("/tickets")}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Support Management
      </button>
{/* Ticket info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <h1 className="text-base font-bold text-gray-900 leading-snug">{ticket.title}</h1>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${STATUS_BADGE[ticket.status]}`}>
                {STATUS_LABEL[ticket.status]}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 text-[10px] font-bold">
              <span className={`px-2 py-0.5 rounded-full border ${PRIORITY_BADGE[ticket.priority]}`}>
                {ticket.priority} priority
              </span>
              <span className="px-2 py-0.5 rounded-full border bg-indigo-50 text-indigo-600 border-indigo-100">
                {TYPE_LABEL[ticket.type] ?? ticket.type}
              </span>
              <span className="px-2 py-0.5 rounded-full border bg-gray-50 text-gray-500 border-gray-200 flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                {fmtDateTime(ticket.createdAt)}
              </span>
            </div>

            {isClosed && ticket.autoDeleteAt && (
              <div className="mt-4 flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl p-3">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-amber-700">
                  Auto-deletes in {timeUntilDelete(ticket.autoDeleteAt)}
                </p>
              </div>
            )}
          </div>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_500px] gap-4">
        {/* Left: conversation */}
        <div className="space-y-4">
          

          {/* Messages */}
          <div className="bg-white rounded-2xl border border-gray-100 flex flex-col overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Conversation</p>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[420px]">
              {messages.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No messages yet.</p>
              ) : (
                messages.map((m, i) => {
                  const isMe = m.senderId === user?.uid;
                  const profile = senderProfiles[m.senderId];
                  // For non-admin senders (ticket creator), fall back to a generic label
                  const name = profile?.name ?? (isMe ? "You" : "User");
                  const photoURL = profile?.photoURL ?? null;
                  const isAdminSender = profile?.isAdmin ?? false;

                  const nextMsg = messages[i + 1];
                  const isLastInGroup = !nextMsg || nextMsg.senderId !== m.senderId;
                  const isFirstInGroup = i === 0 || messages[i - 1].senderId !== m.senderId;

                  return (
                    <div key={m.id} className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                      {/* Avatar placeholder to keep alignment consistent */}
                      <div className="w-7 shrink-0">
                        {isLastInGroup ? <Avatar name={name} photoURL={photoURL} /> : null}
                      </div>

                      <div className={`flex flex-col gap-0.5 max-w-[72%] ${isMe ? "items-end" : "items-start"}`}>
                        {/* Name + role badge on first bubble in group */}
                        {isFirstInGroup && (
                          <div className={`flex items-center gap-1.5 px-1 ${isMe ? "flex-row-reverse" : ""}`}>
                            <span className="text-[11px] font-semibold text-gray-600">
                              {isMe ? "You" : name}
                            </span>
                            {!isMe && !isAdminSender && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-full">
                                <User className="w-2.5 h-2.5" />
                                Reporter
                              </span>
                            )}
                            {!isMe && isAdminSender && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                Admin
                              </span>
                            )}
                          </div>
                        )}

                        {/* Bubble */}
                        <div
                          className={`px-4 py-2.5 text-sm leading-relaxed ${
                            isMe
                              ? "bg-gray-900 text-white rounded-2xl rounded-br-sm"
                              : "bg-gray-100 text-gray-800 rounded-2xl rounded-bl-sm"
                          }`}
                        >
                          <p>{m.message}</p>
                        </div>

                        {/* Timestamp on last bubble in group */}
                        {isLastInGroup && (
                          <p className="text-[10px] text-gray-400 px-1">{fmtDateTime(m.createdAt)}</p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {!isClosed && (
              <div className="border-t border-gray-100 p-3 flex items-end gap-2">
                <textarea
                  rows={2}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type your reply…"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); }
                  }}
                  className="flex-1 resize-none text-sm px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 placeholder:text-gray-400 transition"
                />
                <button
                  onClick={sendReply}
                  disabled={!reply.trim() || sending}
                  className="p-2.5 bg-gray-900 hover:bg-gray-700 disabled:opacity-40 text-white rounded-xl transition shrink-0"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: actions panel */}
        <div className="space-y-3">
          {/* Status */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Update Status</p>
            {isClosed ? (
              <button
                onClick={reopen}
                disabled={reopening}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-100 rounded-xl hover:bg-amber-100 transition disabled:opacity-50"
              >
                {reopening ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                Reopen Ticket
              </button>
            ) : (
              <div className="space-y-2">
                {STATUS_FLOW.filter((s) => s !== ticket.status).map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(s)}
                    disabled={updatingStatus}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm font-semibold rounded-xl border transition disabled:opacity-50 ${STATUS_BADGE[s]} hover:opacity-80`}
                  >
                    {STATUS_LABEL[s]}
                    {updatingStatus && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Assign */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Assign To</p>
            {assignedAdmin ? (
              <div className="flex items-center gap-2 mb-3 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-7 h-7 rounded-lg bg-gray-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                  {(assignedAdmin.fullName || assignedAdmin.email || "A")[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">
                    {assignedAdmin.fullName || assignedAdmin.email}
                  </p>
                  <p className="text-[10px] text-gray-400">Assigned</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 mb-2">Unassigned</p>
            )}
            <div className="relative">
              <button
                onClick={() => setShowAssign((v) => !v)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition text-gray-700"
              >
                <span className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-gray-400" />
                  {showAssign ? "Close" : "Change Assignment"}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showAssign ? "rotate-180" : ""}`} />
              </button>
              {showAssign && (
                <div className="absolute top-10 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden max-h-48 overflow-y-auto">
                  <button
                    onClick={() => assignTicket("")}
                    disabled={assigning}
                    className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 transition"
                  >
                    Unassign
                  </button>
                  {admins.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => assignTicket(a.id)}
                      disabled={assigning}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition ${a.id === ticket.assignedTo ? "font-semibold text-gray-900" : "text-gray-700"}`}
                    >
                      {a.fullName || a.email}
                      {a.id === ticket.assignedTo && " ✓"}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Details</p>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Created</span>
              <span className="text-gray-700 font-medium">{fmtDateTime(ticket.createdAt)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Updated</span>
              <span className="text-gray-700 font-medium">{fmtDateTime(ticket.updatedAt)}</span>
            </div>
            {ticket.closedAt && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Closed</span>
                <span className="text-gray-700 font-medium">{fmtDateTime(ticket.closedAt)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}