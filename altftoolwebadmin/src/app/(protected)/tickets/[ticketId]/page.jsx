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
  Loader2,
  Clock,
  UserCheck,
  ChevronDown,
  RefreshCw,
  AlertTriangle,
  MessageCircle,
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
        alt=""
        className="h-7 w-7 shrink-0 rounded-full border border-[var(--border)] object-cover"
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--surface-soft)] text-[10px] font-bold text-[var(--muted)]"
    >
      {getInitials(name)}
    </div>
  );
}

// ── Status + priority vocabulary ──────────────────────────────────────────────
//
// `tone` drives the Badge primitive. `button` is the tinted transition control in
// the actions panel — it stays local because the target status IS the colour, and
// the Button primitive has no per-status variant.

const STATUS_CONFIG = {
  open: {
    tone: "info",
    label: "Open",
    button: "border-[var(--border)] bg-[var(--info-soft)] text-[var(--info)]",
  },
  in_progress: {
    tone: "warning",
    label: "In Progress",
    button: "border-[var(--border)] bg-[var(--warning-soft)] text-[var(--warning)]",
  },
  resolved: {
    tone: "success",
    label: "Resolved",
    button: "border-[var(--border)] bg-[var(--success-soft)] text-[var(--success)]",
  },
  closed: {
    tone: "neutral",
    label: "Closed",
    button: "border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted)]",
  },
};

const STATUS_FLOW = ["open", "in_progress", "resolved", "closed"];

const PRIORITY_CONFIG = {
  low: { tone: "neutral", label: "Low" },
  medium: { tone: "warning", label: "Medium" },
  high: { tone: "danger", label: "High" },
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
  const [updatingStatus, setUpdatingStatus] = useState(null); // status value in flight, or null
  const [assigning, setAssigning] = useState(false);
  const [reopening, setReopening] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [messagesError, setMessagesError] = useState("");
  const [adminsLoading, setAdminsLoading] = useState(true);
  const [adminsError, setAdminsError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [messagesKey, setMessagesKey] = useState(0);
  const [adminsKey, setAdminsKey] = useState(0);
  const [showAssign, setShowAssign] = useState(false);

  const bottomRef = useRef(null);

  // Retrying the conversation must not tear down the already-rendered ticket,
  // so the messages listener has its own reload key.
  const retryMessages = () => setMessagesKey((k) => k + 1);
  const retryLoad = () => {
    setReloadKey((k) => k + 1);
    setMessagesKey((k) => k + 1);
  };

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
            ? "Your admin account does not have permission to view this ticket."
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
  }, [ticketId, messagesKey]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load admins for assignment + build sender profiles.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setAdminsLoading(true);
    setAdminsError("");

    const fail = () => {
      if (cancelled) return;
      setAdmins([]);
      setSenderProfiles({});
      setAdminsError("The admin directory could not be loaded.");
      setAdminsLoading(false);
    };

    user
      .getIdToken()
      .then((token) =>
        fetch("/api/admin/list", { headers: { Authorization: `Bearer ${token}` } })
          .then((r) => {
            // A 401/403 used to fall through as `{}` → zero admins, which made an
            // assigned ticket read as "Unassigned". Treat it as the error it is.
            if (!r.ok) throw new Error("admin list unavailable");
            return r.json();
          })
          .then(({ admins: list }) => {
            if (cancelled) return;
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
            setAdminsLoading(false);
          })
          .catch(fail)
      )
      .catch(fail);

    return () => {
      cancelled = true;
    };
  }, [user, adminsKey]);

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
    setUpdatingStatus(status);
    try {
      const res = await authPatch("/api/support/update-status", { ticketId, status });
      if (!res.ok) throw new Error("Failed");
      emitAlert({
        type: "success",
        message: `Status updated to ${STATUS_CONFIG[status]?.label ?? status}.`,
      });
    } catch {
      emitAlert({ type: "error", message: "Failed to update status." });
    } finally {
      setUpdatingStatus(null);
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

  const isClosed = ticket?.status === "closed";
  const assignedAdmin = admins.find((a) => a.id === ticket?.assignedTo);
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
          { label: "Tickets", href: "/tickets" },
          { label: ticket?.title || "Ticket" },
        ]}
        title={ticket?.title || "Ticket"}
        actions={statusCfg ? <Badge tone={statusCfg.tone}>{statusCfg.label}</Badge> : null}
      />

      <DataState
        loading={loading}
        error={loadError}
        isEmpty={!ticket}
        onRetry={retryLoad}
        errorAction={
          <Button variant="secondary" onClick={() => router.push("/tickets")}>
            Back to Support Management
          </Button>
        }
        loadingVariant="detail"
        empty={
          <EmptyState
            icon={MessageCircle}
            title="Ticket not found"
            description="This ticket may have been deleted."
            action={
              <Button onClick={() => router.push("/tickets")}>
                Back to Support Management
              </Button>
            }
          />
        }
      >
        <div className="space-y-4">
          {/* Ticket meta */}
          <SectionCard>
            <div className="flex flex-wrap gap-2">
              <Badge tone={priorityCfg?.tone ?? "neutral"}>
                {priorityCfg?.label} priority
              </Badge>
              <Badge tone="primary">{TYPE_LABEL[ticket?.type] ?? ticket?.type}</Badge>
              <Badge tone="neutral" className="gap-1">
                <Clock className="h-3 w-3" aria-hidden="true" />
                {fmtDateTime(ticket?.createdAt)}
              </Badge>
            </div>

            {/* Inline callout — no anset covers these, so it stays local. */}
            {isClosed && ticket?.autoDeleteAt ? (
              <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-[var(--border)] bg-[var(--warning-soft)] p-3">
                <AlertTriangle
                  className="mt-0.5 h-4 w-4 shrink-0 text-[var(--warning)]"
                  aria-hidden="true"
                />
                <p className="text-xs font-semibold text-[var(--warning)]">
                  Auto-deletes in {timeUntilDelete(ticket.autoDeleteAt)}
                </p>
              </div>
            ) : null}
          </SectionCard>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_500px]">
            {/* Left: conversation */}
            <SectionCard
              title="Conversation"
              actions={<Badge tone="neutral">{messageCount}</Badge>}
              flush
              footer={
                !isClosed ? (
                  <div className="flex items-end gap-2">
                    <Textarea
                      rows={2}
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      aria-label="Write a reply"
                      placeholder="Type your reply… (Enter to send, Shift+Enter for newline)"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendReply();
                        }
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
                ) : undefined
              }
            >
              <div
                role="region"
                aria-label="Ticket conversation"
                tabIndex={0}
                className="max-h-[420px] min-h-[220px] space-y-4 overflow-y-auto p-5 focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
              >
                <DataState
                  loading={messagesLoading}
                  error={messagesError}
                  isEmpty={!messages.length}
                  onRetry={retryMessages}
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
                      const profile = senderProfiles[m.senderId];
                      // For non-admin senders (ticket creator), fall back to a generic label
                      const name = profile?.name ?? (isMe ? "You" : "User");
                      const photoURL = profile?.photoURL ?? null;
                      const isAdminSender = profile?.isAdmin ?? false;

                      const nextMsg = messages[i + 1];
                      const isLastInGroup = !nextMsg || nextMsg.senderId !== m.senderId;
                      const isFirstInGroup =
                        i === 0 || messages[i - 1].senderId !== m.senderId;

                      return (
                        <div
                          key={m.id}
                          className={`flex items-end gap-2 ${
                            isMe ? "flex-row-reverse" : "flex-row"
                          }`}
                        >
                          {/* Avatar placeholder to keep alignment consistent */}
                          <div className="w-7 shrink-0">
                            {isLastInGroup ? (
                              <Avatar name={name} photoURL={photoURL} />
                            ) : null}
                          </div>

                          <div
                            className={`flex max-w-[72%] flex-col gap-0.5 ${
                              isMe ? "items-end" : "items-start"
                            }`}
                          >
                            {/* Name + role badge on first bubble in group */}
                            {isFirstInGroup && (
                              <div
                                className={`flex items-center gap-1.5 px-1 ${
                                  isMe ? "flex-row-reverse" : ""
                                }`}
                              >
                                <span className="text-[11px] font-semibold text-[var(--muted)]">
                                  {isMe ? "You" : name}
                                </span>
                                {!isMe && !isAdminSender && (
                                  <Badge tone="info" className="gap-0.5">
                                    <User className="h-2.5 w-2.5" aria-hidden="true" />
                                    Reporter
                                  </Badge>
                                )}
                                {!isMe && isAdminSender && (
                                  <Badge tone="neutral">Admin</Badge>
                                )}
                              </div>
                            )}

                            {/* Bubble */}
                            <div
                              className={`px-4 py-2.5 text-sm leading-relaxed ${
                                isMe
                                  ? "rounded-2xl rounded-br-sm bg-[var(--primary)] text-[var(--primary-foreground)]"
                                  : "rounded-2xl rounded-bl-sm bg-[var(--surface-soft)] text-[var(--foreground)]"
                              }`}
                            >
                              <p>{m.message}</p>
                            </div>

                            {/* Timestamp on last bubble in group */}
                            {isLastInGroup && (
                              <p className="px-1 text-[10px] text-[var(--muted)]">
                                {fmtDateTime(m.createdAt)}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={bottomRef} />
                  </>
                </DataState>
              </div>
            </SectionCard>

            {/* Right: actions panel */}
            <div className="space-y-4">
              <SectionCard title="Update Status">
                {isClosed ? (
                  <button
                    type="button"
                    onClick={reopen}
                    disabled={reopening}
                    aria-busy={reopening || undefined}
                    className={`flex w-full items-center justify-center gap-2 rounded-lg border py-2 text-sm font-semibold transition hover:opacity-80 disabled:opacity-50 focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] ${STATUS_CONFIG.in_progress.button}`}
                  >
                    {reopening ? (
                      <Loader2
                        className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none"
                        aria-hidden="true"
                      />
                    ) : (
                      <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    Reopen Ticket
                  </button>
                ) : (
                  <div className="space-y-2">
                    {STATUS_FLOW.filter((s) => s !== ticket?.status).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => updateStatus(s)}
                        disabled={Boolean(updatingStatus)}
                        aria-busy={updatingStatus === s || undefined}
                        className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm font-semibold transition hover:opacity-80 disabled:opacity-50 focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] ${STATUS_CONFIG[s].button}`}
                      >
                        {STATUS_CONFIG[s].label}
                        {updatingStatus === s && (
                          <Loader2
                            className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </SectionCard>

              <SectionCard title="Assign To">
                {assignedAdmin ? (
                  <div className="mb-3 flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] p-2.5">
                    <div
                      aria-hidden="true"
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)] text-[10px] font-bold text-[var(--primary-foreground)]"
                    >
                      {(assignedAdmin.fullName || assignedAdmin.email || "A")[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-[var(--foreground)]">
                        {assignedAdmin.fullName || assignedAdmin.email}
                      </p>
                      <p className="text-[10px] text-[var(--muted)]">Assigned</p>
                    </div>
                  </div>
                ) : ticket?.assignedTo ? (
                  // The ticket IS assigned — never render that as "Unassigned"
                  // just because the directory lookup did not resolve.
                  <div className="mb-3 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] p-2.5">
                    <p className="text-xs font-semibold text-[var(--foreground)]">Assigned</p>
                    <p className="mt-0.5 text-[10px] text-[var(--muted)]">
                      {adminsError
                        ? "The admin directory is unavailable, so the assignee's name can't be shown."
                        : adminsLoading
                        ? "Loading assignee…"
                        : "This admin is no longer an active super admin."}
                    </p>
                    {adminsError ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                        onClick={() => setAdminsKey((k) => k + 1)}
                      >
                        <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                        Try again
                      </Button>
                    ) : null}
                  </div>
                ) : (
                  <p className="mb-2 text-xs text-[var(--muted)]">Unassigned</p>
                )}

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowAssign((v) => !v)}
                    aria-expanded={showAssign}
                    aria-haspopup="menu"
                    className="flex w-full items-center justify-between rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--foreground)] transition hover:bg-[var(--surface-soft)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
                  >
                    <span className="flex items-center gap-1.5">
                      <UserCheck className="h-3.5 w-3.5 text-[var(--muted)]" aria-hidden="true" />
                      {showAssign ? "Close" : "Change Assignment"}
                    </span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-[var(--muted)] transition-transform ${
                        showAssign ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>

                  {/* Deliberately NOT role="menu": that role commits to the full
                      menu keyboard model (arrow keys, Escape, roving tabindex,
                      focus return). Without it a screen reader announces a menu
                      whose keys do not behave like one — strictly worse than the
                      plain, Tab-navigable buttons this replaced. */}
                  {showAssign && (
                    <div
                      className="absolute left-0 right-0 top-10 z-20 max-h-48 overflow-hidden overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-lg"
                    >
                      <button
                        type="button"
                        onClick={() => assignTicket("")}
                        disabled={assigning}
                        className="w-full px-3 py-2 text-left text-sm text-[var(--muted)] transition hover:bg-[var(--surface-soft)] disabled:opacity-50 focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
                      >
                        Unassign
                      </button>

                      {adminsError ? (
                        <div className="px-3 py-2">
                          <p className="text-xs text-[var(--danger-text)]">{adminsError}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-1.5"
                            onClick={() => setAdminsKey((k) => k + 1)}
                          >
                            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                            Try again
                          </Button>
                        </div>
                      ) : adminsLoading ? (
                        <p className="px-3 py-2 text-xs text-[var(--muted)]">
                          Loading admins…
                        </p>
                      ) : (
                        admins.map((a) => (
                          <button
                            key={a.id}
                            type="button"
                                onClick={() => assignTicket(a.id)}
                            disabled={assigning}
                            className={`w-full px-3 py-2 text-left text-sm text-[var(--foreground)] transition hover:bg-[var(--surface-soft)] disabled:opacity-50 focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] ${
                              a.id === ticket?.assignedTo ? "font-semibold" : ""
                            }`}
                          >
                            {a.fullName || a.email}
                            {a.id === ticket?.assignedTo && " ✓"}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </SectionCard>

              <SectionCard title="Details">
                <dl className="space-y-2">
                  <div className="flex justify-between gap-3 text-xs">
                    <dt className="text-[var(--muted)]">Created</dt>
                    <dd className="font-medium text-[var(--foreground)]">
                      {fmtDateTime(ticket?.createdAt)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3 text-xs">
                    <dt className="text-[var(--muted)]">Updated</dt>
                    <dd className="font-medium text-[var(--foreground)]">
                      {fmtDateTime(ticket?.updatedAt)}
                    </dd>
                  </div>
                  {ticket?.closedAt ? (
                    <div className="flex justify-between gap-3 text-xs">
                      <dt className="text-[var(--muted)]">Closed</dt>
                      <dd className="font-medium text-[var(--foreground)]">
                        {fmtDateTime(ticket.closedAt)}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </SectionCard>
            </div>
          </div>
        </div>
      </DataState>
    </div>
  );
}
