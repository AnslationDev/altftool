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
import { Badge, Button, IconButton, Textarea } from "@altftool/ui";
import { DataState, EmptyState, PageHeader, SectionCard } from "@/ansets";
import {
  Send,
  Clock,
  RefreshCw,
  AlertTriangle,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";

// ── Status + priority vocabulary ──────────────────────────────────────────────

const STATUS_CONFIG = {
  open: { tone: "info", dot: "bg-[var(--info)]", label: "Open" },
  in_progress: {
    tone: "warning",
    dot: "bg-[var(--warning)] animate-pulse motion-reduce:animate-none",
    label: "In Progress",
  },
  resolved: { tone: "success", dot: "bg-[var(--success)]", label: "Resolved" },
  closed: { tone: "neutral", dot: "bg-[var(--muted)]", label: "Closed" },
};

const PRIORITY_CONFIG = {
  low: { tone: "neutral", label: "Low" },
  medium: { tone: "warning", label: "Medium" },
  high: { tone: "danger", label: "High" },
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
                className={`h-2 w-2 rounded-full transition-all ${
                  active
                    ? "h-3 w-3 " + STATUS_CONFIG[s].dot
                    : done
                    ? "bg-[var(--muted)]"
                    : "bg-[var(--border)]"
                }`}
              />
              <span
                className={`text-[9px] font-bold whitespace-nowrap ${
                  done ? "text-[var(--muted)]" : "text-[var(--muted)]/50"
                }`}
              >
                {STATUS_CONFIG[s].label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`mb-3 h-px w-6 ${i < current ? "bg-[var(--muted)]" : "bg-[var(--border)]"}`} />
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
          <span className="px-1 text-[10px] text-[var(--muted)] opacity-0 transition-opacity group-hover:opacity-100">
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
  const [loadError, setLoadError] = useState("");
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [messagesError, setMessagesError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  const retryLoad = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    if (!ticketId) return;
    setLoading(true);
    setLoadError("");
    const unsub = onSnapshot(
      doc(db, "support_tickets", ticketId),
      (snap) => {
        if (snap.exists()) setTicket({ id: snap.id, ...snap.data() });
        setLoadError("");
        setLoading(false);
      },
      (err) => {
        setLoadError(
          err?.code === "permission-denied"
            ? "You do not have permission to view this ticket."
            : "This ticket is temporarily unavailable. Please try again."
        );
        setLoading(false);
      }
    );
    return () => unsub();
  }, [ticketId, reloadKey]);

  useEffect(() => {
    if (!ticketId) return;
    setMessagesLoading(true);
    setMessagesError("");
    const q = query(
      collection(db, "support_tickets", ticketId, "messages"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setMessagesError("");
        setMessagesLoading(false);
      },
      (err) => {
        setMessages([]);
        setMessagesError(
          err?.code === "permission-denied"
            ? "You do not have permission to read this conversation."
            : "The conversation could not be loaded."
        );
        setMessagesLoading(false);
      }
    );
    return () => unsub();
  }, [ticketId, reloadKey]);

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

  const isClosed = ticket?.status === "closed";
  const isOwner = ticket?.createdBy === user?.uid;
  const statusCfg = ticket ? STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.open : null;
  const priorityCfg = ticket
    ? PRIORITY_CONFIG[ticket.priority] ?? PRIORITY_CONFIG.low
    : null;

  const messageCount = messagesError
    ? "Unavailable"
    : messagesLoading
    ? "Loading…"
    : `${messages.length} ${messages.length === 1 ? "message" : "messages"}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader
        breadcrumbs={[
          { label: "Support", href: "/support" },
          { label: ticket?.title || "Ticket" },
        ]}
        title={ticket?.title || "Ticket"}
        actions={
          statusCfg ? (
            <Badge tone={statusCfg.tone} className="gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} aria-hidden="true" />
              {statusCfg.label}
            </Badge>
          ) : null
        }
      />

      <DataState
        loading={loading}
        error={loadError}
        isEmpty={!ticket}
        onRetry={retryLoad}
        errorAction={
          <Button variant="secondary" onClick={() => router.push("/support")}>
            Back to Support
          </Button>
        }
        loadingVariant="detail"
        empty={
          <EmptyState
            icon={MessageCircle}
            title="Ticket not found"
            description="This ticket may have been deleted."
            action={
              <Button onClick={() => router.push("/support")}>Back to Support</Button>
            }
          />
        }
      >
        <div className="space-y-4">
          {/* Ticket meta */}
          <SectionCard footer={<StatusTimeline status={ticket?.status} />}>
            <div className="flex flex-wrap gap-2">
              <Badge tone={priorityCfg?.tone ?? "neutral"}>
                {priorityCfg?.label} Priority
              </Badge>
              <Badge tone="primary">{TYPE_LABEL[ticket?.type] ?? ticket?.type}</Badge>
              <Badge tone="neutral" className="gap-1">
                <Clock className="h-3 w-3" aria-hidden="true" />
                {fmtDateTime(ticket?.createdAt)}
              </Badge>
            </div>
          </SectionCard>

          {/* Auto-delete warning — no anset for inline callouts, kept local */}
          {isClosed && ticket?.autoDeleteAt && (
            <div className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--warning-soft)] p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--surface)]">
                <AlertTriangle className="h-4 w-4 text-[var(--warning)]" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[var(--warning)]">
                  Ticket deletes in {timeUntilDelete(ticket.autoDeleteAt)}
                </p>
                <p className="mt-0.5 text-xs text-[var(--muted)]">
                  Reopen this ticket to keep the conversation and all messages.
                </p>
                {isOwner && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={reopen}
                    loading={reopening}
                    loadingLabel="Reopening ticket"
                    className="mt-2.5"
                  >
                    {reopening ? null : (
                      <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    Reopen Ticket
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Conversation */}
          <SectionCard
            title="Conversation"
            actions={<Badge tone="neutral">{messageCount}</Badge>}
            flush
            footer={
              !isClosed ? (
                <div className="flex items-end gap-2">
                  <Textarea
                    ref={textareaRef}
                    rows={2}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    aria-label="Write a reply"
                    placeholder="Write a reply… (Enter to send, Shift+Enter for newline)"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); }
                    }}
                    className="flex-1"
                  />
                  <IconButton
                    variant="primary"
                    onClick={sendReply}
                    disabled={!reply.trim()}
                    loading={sending}
                    loadingLabel="Sending reply"
                    aria-label="Send reply"
                  >
                    {sending ? null : <Send className="h-4 w-4" aria-hidden="true" />}
                  </IconButton>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[var(--muted)]" aria-hidden="true" />
                  <p className="text-xs text-[var(--muted)]">
                    This ticket is closed. Reopen to reply.
                  </p>
                </div>
              )
            }
          >
            <div
              role="region"
              aria-label="Ticket conversation"
              tabIndex={0}
              className="max-h-[420px] min-h-[220px] space-y-2 overflow-y-auto bg-[var(--surface-soft)] p-5 focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
            >
              <DataState
                loading={messagesLoading}
                error={messagesError}
                isEmpty={!messages.length}
                onRetry={retryLoad}
                loadingVariant="detail"
                empty={
                  <EmptyState
                    icon={MessageCircle}
                    title="No messages yet"
                    description="Start the conversation below."
                  />
                }
              >
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
              </DataState>
            </div>
          </SectionCard>
        </div>
      </DataState>
    </div>
  );
}
