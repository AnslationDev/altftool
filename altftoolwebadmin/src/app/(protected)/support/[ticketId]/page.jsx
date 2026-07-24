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
import { db } from "@/lib/firebaseFirestore";
import { useAuth } from "@/context/AuthContext";
import { emitAlert } from "@/lib/alertBus";
import {
  ArrowLeft,
  Send,
  Loader2,
  Clock,
  RefreshCw,
  AlertTriangle,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";

// ── Design tokens ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  open: {
    badge: "bg-[var(--info-soft)] text-[var(--info)] ring-1 ring-[var(--border)]",
    dot: "bg-[var(--info)]",
    label: "Open",
  },
  in_progress: {
    badge: "bg-[var(--warning-soft)] text-[var(--warning)] ring-1 ring-[var(--border)]",
    dot: "bg-[var(--warning)] animate-pulse",
    label: "In Progress",
  },
  resolved: {
    badge: "bg-[var(--success-soft)] text-[var(--success)] ring-1 ring-[var(--border)]",
    dot: "bg-[var(--success)]",
    label: "Resolved",
  },
  closed: {
    badge: "bg-[var(--surface-soft)] text-[var(--muted)] ring-1 ring-[var(--border)]",
    dot: "bg-[var(--muted)]",
    label: "Closed",
  },
};

const PRIORITY_CONFIG = {
  low: { badge: "bg-[var(--surface-soft)] text-[var(--muted)] ring-1 ring-[var(--border)]", label: "Low" },
  medium: { badge: "bg-[var(--warning-soft)] text-[var(--warning)] ring-1 ring-[var(--border)]", label: "Medium" },
  high: { badge: "bg-[var(--danger-soft)] text-[var(--danger)] ring-1 ring-[var(--border)]", label: "High", pulse: true },
};

const TYPE_LABEL = { bug: "🐛 Bug", feature: "✨ Feature", query: "💬 Query" };

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

function fmtTime(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function timeUntilDelete(autoDeleteAt) {
  const diff = autoDeleteAt - Date.now();
  if (diff <= 0) return "soon";
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

// ── Status timeline ───────────────────────────────────────────────────────────

function StatusTimeline({ status }) {
  const steps = ["open", "in_progress", "resolved", "closed"];
  const current = steps.indexOf(status);
  return (
    <div className="flex items-center gap-1.5">
      {steps.map((s, i) => {
        const done = i <= current;
        const active = i === current;
        return (
          <div key={s} className="flex items-center gap-1.5">
            <div className="flex flex-col items-center gap-0.5">
              <div
                className={`w-2 h-2 rounded-full transition-all ${
                  active
                    ? "w-3 h-3 " + STATUS_CONFIG[s].dot
                    : done
                    ? "bg-[var(--muted)]"
                    : "bg-[var(--border)]"
                }`}
              />
              <span className={`text-[9px] font-bold whitespace-nowrap ${done ? "text-[var(--muted)]" : "text-[var(--muted)]/50"}`}>
                {STATUS_CONFIG[s].label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-px w-6 mb-3 ${i < current ? "bg-[var(--muted)]" : "bg-[var(--border)]"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────

function MessageBubble({ message, isMe, showTimestamp }) {
  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} group`}>
      <div className={`max-w-[78%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div
          className={`px-4 py-3 text-sm leading-relaxed shadow-sm ${
            isMe
              ? "bg-[var(--primary)] text-[var(--primary-foreground)] rounded-2xl rounded-br-md"
              : "bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] rounded-2xl rounded-bl-md"
          }`}
        >
          {message.message}
        </div>
        {showTimestamp && (
          <span className="text-[10px] text-[var(--muted)] px-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {fmtTime(message.createdAt)}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function TicketDetailPage() {
  const { ticketId } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [reopening, setReopening] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

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
      textareaRef.current?.focus();
    } catch {
      emitAlert({ type: "error", message: "Failed to send reply." });
    } finally {
      setSending(false);
    }
  };

  const reopen = async () => {
    setReopening(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/support/reopen", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ticketId }),
      });
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
      <div className="flex items-center justify-center h-screen bg-[var(--background)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--muted)]" />
          <p className="text-sm text-[var(--muted)]">Loading ticket…</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--surface-soft)] flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-6 h-6 text-[var(--muted)]" />
          </div>
          <p className="text-[var(--foreground)] font-semibold">Ticket not found</p>
          <p className="text-[var(--muted)] text-sm mt-1">This ticket may have been deleted.</p>
          <button
            onClick={() => router.push("/support")}
            className="mt-5 px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-medium rounded-xl hover:bg-[var(--primary-hover)] transition"
          >
            Back to Support
          </button>
        </div>
      </div>
    );
  }

  const isClosed = ticket.status === "closed";
  const isOwner = ticket.createdBy === user?.uid;
  const statusCfg = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.open;
  const priorityCfg = PRIORITY_CONFIG[ticket.priority] ?? PRIORITY_CONFIG.low;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Top nav bar */}
      <div className="sticky top-0 z-20 bg-[var(--surface)]/80 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => router.push("/support")}
            className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Support</span>
          </button>
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${statusCfg.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
            {statusCfg.label}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">

        {/* Ticket card */}
        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[var(--border)]">
            <h1 className="text-[15px] font-bold text-[var(--foreground)] leading-snug mb-3">{ticket.title}</h1>

            {/* Badges row */}
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full ${priorityCfg.badge}`}>
                {priorityCfg.label} Priority
              </span>
              <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] ring-1 ring-[var(--border)]">
                {TYPE_LABEL[ticket.type] ?? ticket.type}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-full bg-[var(--surface-soft)] text-[var(--muted)] ring-1 ring-[var(--border)]">
                <Clock className="w-2.5 h-2.5" />
                {fmtDateTime(ticket.createdAt)}
              </span>
            </div>
          </div>

          {/* Status timeline */}
          <div className="px-5 py-3.5 bg-[var(--surface-soft)]">
            <StatusTimeline status={ticket.status} />
          </div>
        </div>

        {/* Auto-delete warning */}
        {isClosed && ticket.autoDeleteAt && (
          <div className="flex items-start gap-3 bg-[var(--warning-soft)] border border-[var(--border)] rounded-2xl p-4">
            <div className="w-8 h-8 rounded-full bg-[var(--surface)] flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-[var(--warning)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--warning)]">
                Ticket deletes in {timeUntilDelete(ticket.autoDeleteAt)}
              </p>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Reopen this ticket to keep the conversation and all messages.
              </p>
              {isOwner && (
                <button
                  onClick={reopen}
                  disabled={reopening}
                  className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-[var(--warning)] bg-[var(--surface)] hover:bg-[var(--surface-soft)] px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                >
                  {reopening ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  Reopen Ticket
                </button>
              )}
            </div>
          </div>
        )}

        {/* Conversation */}
        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-sm flex flex-col overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--border)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-[var(--muted)]" />
              <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Conversation</span>
            </div>
            <span className="text-[11px] text-[var(--muted)] bg-[var(--surface-soft)] px-2 py-0.5 rounded-full">
              {messages.length} {messages.length === 1 ? "message" : "messages"}
            </span>
          </div>

          <div className="overflow-y-auto p-5 space-y-2 min-h-[220px] max-h-[420px] bg-[var(--surface-soft)]">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[var(--surface)] flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-[var(--muted)]" />
                </div>
                <p className="text-sm text-[var(--muted)] font-medium">No messages yet</p>
                <p className="text-xs text-[var(--muted)]">Start the conversation below</p>
              </div>
            ) : (
              <>
                {messages.map((m, i) => {
                  const isMe = m.senderId === user?.uid;
                  const isLast = i === messages.length - 1;
                  const nextDiff = !messages[i + 1] || messages[i + 1].senderId !== m.senderId;
                  return (
                    <MessageBubble
                      key={m.id}
                      message={m}
                      isMe={isMe}
                      showTimestamp={nextDiff || isLast}
                    />
                  );
                })}
                <div ref={bottomRef} />
              </>
            )}
          </div>

          {/* Reply input */}
          {!isClosed ? (
            <div className="border-t border-[var(--border)] p-3 bg-[var(--surface)]">
              <div className="flex items-end gap-2">
                <textarea
                  ref={textareaRef}
                  rows={2}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Write a reply… (Enter to send, Shift+Enter for newline)"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); }
                  }}
                  className="flex-1 resize-none text-sm px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] focus:outline-none focus:[box-shadow:var(--focus-ring)] focus:border-[var(--border-strong)] placeholder:text-[var(--muted)] transition leading-relaxed"
                />
                <button
                  onClick={sendReply}
                  disabled={!reply.trim() || sending}
                  aria-label="Send reply"
                  className="p-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] active:scale-95 disabled:opacity-30 text-[var(--primary-foreground)] rounded-xl transition-all duration-150 shrink-0"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ) : (
            <div className="border-t border-[var(--border)] px-5 py-3 bg-[var(--surface-soft)] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[var(--muted)]" />
              <p className="text-xs text-[var(--muted)]">This ticket is closed. Reopen to reply.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
