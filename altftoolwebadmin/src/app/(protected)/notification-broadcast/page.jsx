"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  AlertTriangle,
  Bell,
  Clock,
  Globe,
  Info,
  Megaphone,
  RefreshCw,
  Send,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { Alert, Button, Field, Input, Tabs, Textarea } from "@altftool/ui";
import {
  DataState,
  EmptyState,
  FilterBar,
  PageHeader,
  SectionCard,
  useTableControls,
} from "@/ansets";
import { useAuth } from "@/context/AuthContext";
import { emitAlert } from "@/lib/alertBus";
import { readApiJson, getErrorMessage } from "@/lib/apiClient";

// ─── helpers ─────────────────────────────────────────────────────────────────

function fmtDate(ms) {
  if (!ms) return "—";
  // `undefined` uses the viewing admin's own browser locale, matching
  // newsletter/page.jsx's formatDate() convention — "en-IN" forced every date
  // here into Indian conventions regardless of who was looking at it.
  return new Date(ms).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Formats a ms timestamp as a `datetime-local` input value, in local time. */
function toDateTimeLocalValue(ms) {
  const d = new Date(ms);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * The action URL is handed to `router.push()` on every recipient's device, so a
 * bare host like "altftool.com/tools" would resolve relative to whatever route
 * the admin happens to be on. Accept only an absolute http(s) URL or an in-app
 * path, and reject protocol-relative values.
 * @returns {string|null} an error message, or null when the value is usable.
 */
function validateActionUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("/")) {
    // Resolve against a throwaway origin and require the result to stay on it.
    // Peeking at trimmed[1] is not enough: the WHATWG URL parser strips TAB, LF
    // and CR *before* parsing, so "/\t/evil.com" and "/\t\\evil.com" look like
    // in-app paths character-by-character but normalise to protocol-relative
    // URLs that would navigate every recipient off-site.
    const PROBE_ORIGIN = "https://altft-probe.invalid";
    let resolved;
    try {
      resolved = new URL(trimmed, PROBE_ORIGIN);
    } catch {
      return "Enter a full URL (https://…) or an in-app path starting with “/”.";
    }
    if (resolved.origin !== PROBE_ORIGIN) {
      return "Protocol-relative links aren’t allowed. Use https://… or an in-app path like /support.";
    }
    return null;
  }

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return "Enter a full URL (https://…) or an in-app path starting with “/”.";
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return "Only http:// and https:// links are allowed.";
  }
  return null;
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

const TYPE_KEYS = ["announcement", "warning", "notice"];

// Hoisted so useTableControls' memo isn't invalidated by a fresh array literal
// on every render (mirrors newsletter/page.jsx's SEARCH_FIELDS).
const BROADCAST_SEARCH_FIELDS = ["title", "body"];

const STATUS_META = {
  draft: { label: "Draft", cls: "bg-[var(--surface-soft)] text-[var(--muted)]" },
  scheduled: { label: "Scheduled", cls: "bg-[var(--warning-soft)] text-[var(--warning)]" },
  sent: { label: "Sent", cls: "bg-[var(--success-soft)] text-[var(--success)]" },
  // deliverBroadcast() writes status:"failed"; without this entry StatusBadge
  // fell back to "Draft" and the operator never saw the failure.
  // AA: --danger on --danger-soft is only 3.06:1 in the light theme, so the
  // label uses --foreground (14.4:1 light / 15.5:1 dark) and the red signal is
  // carried by the icon, which as a graphical object only needs 3:1. This is
  // why these two badges stay local instead of using the shared `Badge` tones —
  // `alt-ui-badge--danger` paints its label in --danger and would undo the fix.
  failed: {
    label: "Failed",
    cls: "bg-[var(--danger-soft)] text-[var(--foreground)]",
    icon: AlertTriangle,
    iconCls: "text-[var(--danger)]",
  },
};

// ─── sub-components ───────────────────────────────────────────────────────────

function TypeBadge({ type }) {
  const meta = TYPE_META[type] ?? TYPE_META.notice;
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${meta.cls}`}
    >
      <Icon size={10} aria-hidden="true" />
      {meta.label}
    </span>
  );
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status] ?? STATUS_META.draft;
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${meta.cls}`}
    >
      {Icon && <Icon size={10} className={meta.iconCls} aria-hidden="true" />}
      {meta.label}
    </span>
  );
}

/** Small icon-only row action. Colour carries meaning, so each keeps a label. */
function RowAction({ label, tone, onClick, disabled, children }) {
  const toneCls = {
    primary: "text-[var(--primary)] hover:bg-[var(--surface-soft)]",
    warning: "text-[var(--warning)] hover:bg-[var(--warning-soft)]",
    danger: "text-[var(--danger-text)] hover:bg-[var(--danger-soft)]",
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      // 44px tap target (design system minimum) — mirrors AdminHeader's icon
      // buttons (e.g. the notification bell trigger), which use the same
      // fixed h/w-[--anslation-ds-target-min] + grid/place-items-center
      // pattern instead of relying on padding to reach the minimum size.
      className={`grid h-[var(--anslation-ds-target-min)] w-[var(--anslation-ds-target-min)] place-items-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] ${toneCls}`}
    >
      {children}
    </button>
  );
}

/**
 * Mirrors AdminHeader's NotificationIcon + this file's TypeBadge so the admin
 * sees roughly what recipients will see before triggering a send that a plain
 * window.confirm() summary cannot show.
 */
function BroadcastPreview({ title, body, type, actionUrl }) {
  const meta = TYPE_META[type] ?? TYPE_META.notice;
  const Icon = meta.icon;
  const trimmedTitle = title.trim();
  const trimmedBody = body.trim();
  const trimmedUrl = actionUrl.trim();

  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold text-[var(--muted)]">Preview</p>
      <div className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] p-3">
        <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--surface)] text-[var(--primary)]">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-[var(--foreground)]">
              {trimmedTitle || "Notification title"}
            </p>
            <TypeBadge type={type} />
          </div>
          <p className="text-xs text-[var(--muted)]">
            {trimmedBody || "Notification body will appear here."}
          </p>
          {trimmedUrl ? (
            <p className="mt-1 truncate text-[11px] text-[var(--primary)]">{trimmedUrl}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ─── Create Form ─────────────────────────────────────────────────────────────

function CreateBroadcastPanel({ adminsList, adminsError, onCreated }) {
  const { user } = useAuth();
  const uid = useId();
  const titleFieldId = `${uid}-title`;
  const bodyFieldId = `${uid}-body`;
  const urlFieldId = `${uid}-url`;
  const urlErrorId = `${uid}-url-error`;
  const userSearchId = `${uid}-user-search`;
  const scheduledAtFieldId = `${uid}-scheduled-at`;
  const scheduledAtErrorId = `${uid}-scheduled-at-error`;

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState("announcement");
  const [targetType, setTargetType] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [actionUrl, setActionUrl] = useState("");
  const [sendMode, setSendMode] = useState("now"); // "now" | "schedule"
  const [scheduledAt, setScheduledAt] = useState("");
  const [scheduledAtError, setScheduledAtError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [urlError, setUrlError] = useState("");

  // Unlike the target="all" path below, resolveTargetUsers() applies no
  // active-status filter to an explicit userIds list — a suspended admin
  // picked here would actually receive the notification and push. Match
  // "All users" by never offering them as selectable.
  const filteredAdmins = adminsList.filter((a) => {
    if (a.isActive !== true) return false;
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

  // /api/admin/list returns EVERY admin, suspended ones included, but the
  // server's resolveTargetUsers() for target="all" delivers only to admins that
  // are explicitly active. Counting the raw list overstated the audience on a
  // non-recallable action where the count is the whole point.
  const activeAdminCount = adminsList.filter((a) => a.isActive === true).length;
  const recipientCount = targetType === "all" ? activeAdminCount : selectedUsers.length;
  const audienceLabel =
    adminsError
      ? "an unknown number of admins"
      : targetType === "all"
      ? recipientCount
        ? `all ${recipientCount} admin${recipientCount === 1 ? "" : "s"}`
        : "all admins"
      : `${recipientCount} selected admin${recipientCount === 1 ? "" : "s"}`;

  const minScheduledAt = toDateTimeLocalValue(Date.now() + 60000);

  const handleSubmit = async () => {
    setError("");
    setUrlError("");
    setScheduledAtError("");
    if (!title.trim() || !body.trim()) {
      setError("Title and body are required.");
      return;
    }
    if (targetType === "users" && selectedUsers.length === 0) {
      setError("Select at least one user.");
      return;
    }

    const actionUrlError = validateActionUrl(actionUrl);
    if (actionUrlError) {
      setUrlError(actionUrlError);
      return;
    }

    let scheduledAtMs = null;
    if (sendMode === "schedule") {
      if (!scheduledAt) {
        setScheduledAtError("Pick a date and time to schedule this broadcast.");
        return;
      }
      scheduledAtMs = new Date(scheduledAt).getTime();
      if (Number.isNaN(scheduledAtMs)) {
        setScheduledAtError("Enter a valid date and time.");
        return;
      }
      if (scheduledAtMs <= Date.now()) {
        setScheduledAtError("Choose a time in the future.");
        return;
      }
    }

    // Sending is irreversible: it writes an in-app notification per recipient
    // AND fires device push. Deleting the broadcast afterwards removes neither.
    // A schedule, unlike a send, can still be cancelled from the History tab
    // right up until it fires, so the confirmation reflects that difference.
    const confirmed = window.confirm(
      sendMode === "schedule"
        ? `Schedule “${title.trim()}” for ${audienceLabel} at ${fmtDate(scheduledAtMs)}?\n\nYou can cancel the schedule from the History tab any time before it goes out.`
        : `Send “${title.trim()}” to ${audienceLabel}?\n\nThis delivers an in-app notification and a push alert immediately and cannot be undone.`,
    );
    if (!confirmed) return;

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
          scheduledAt: sendMode === "schedule" ? scheduledAtMs : null,
        }),
      });

      const data = await readApiJson(res, "Failed to send broadcast.");

      // Reset
      setTitle("");
      setBody("");
      setType("announcement");
      setTargetType("all");
      setSelectedUsers([]);
      setActionUrl("");
      setSendMode("now");
      setScheduledAt("");

      if (data?.status === "scheduled") {
        emitAlert({
          type: "success",
          message: `Broadcast scheduled for ${fmtDate(scheduledAtMs)}.${data?.broadcastId ? ` ID: ${data.broadcastId}` : ""}`,
        });
      } else {
        const delivered =
          typeof data?.recipientCount === "number" ? ` to ${data.recipientCount} recipient(s)` : "";
        emitAlert({
          type: "success",
          message: `Broadcast sent${delivered}.${data?.broadcastId ? ` ID: ${data.broadcastId}` : ""}`,
        });
      }

      onCreated?.();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to send broadcast."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SectionCard
      title="New Broadcast"
      description="Compose a system notification and deliver it to admins."
      bodyClassName="space-y-5"
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-[var(--muted)]">
            {sendMode === "schedule" ? (
              <>
                This will notify{" "}
                <span className="font-semibold text-[var(--foreground)]">{audienceLabel}</span>{" "}
                {scheduledAt ? `on ${fmtDate(new Date(scheduledAt).getTime())}` : "at the scheduled time"}.
                You can cancel the schedule from the History tab any time before it goes out.
              </>
            ) : (
              <>
                This will notify{" "}
                <span className="font-semibold text-[var(--foreground)]">{audienceLabel}</span>{" "}
                immediately. Delivered notifications and push alerts cannot be recalled.
              </>
            )}
          </p>
          <Button
            onClick={handleSubmit}
            loading={loading}
            loadingLabel={sendMode === "schedule" ? "Scheduling broadcast" : "Sending broadcast"}
            // Block the send while the recipient list is unknown. This action
            // cannot be recalled, so "we could not resolve who receives this"
            // must stop it rather than quietly deliver to nobody.
            disabled={Boolean(adminsError) && targetType === "all"}
            title={
              adminsError && targetType === "all"
                ? "Recipients can't be resolved right now"
                : undefined
            }
            className="w-full sm:w-auto sm:shrink-0"
          >
            {loading ? null : sendMode === "schedule" ? (
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Send className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {sendMode === "schedule" ? "Schedule Broadcast" : "Send Broadcast"}
          </Button>
        </div>
      }
    >
      {error ? <Alert tone="danger">{error}</Alert> : null}

      <Field label="Title" htmlFor={titleFieldId}>
        <Input
          id={titleFieldId}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. System maintenance tonight"
        />
      </Field>

      <Field label="Body" htmlFor={bodyFieldId}>
        <Textarea
          id={bodyFieldId}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="Notification message…"
        />
      </Field>

      {/* Type — a real radio group: the old version was three unlabelled
          <button>s, so assistive tech never announced which one was chosen. */}
      <fieldset className="min-w-0">
        <legend className="mb-1.5 text-xs font-semibold text-[var(--muted)]">Type</legend>
        <div className="flex flex-wrap gap-2">
          {TYPE_KEYS.map((t) => {
            const meta = TYPE_META[t];
            const Icon = meta.icon;
            const active = type === t;
            return (
              <label
                key={t}
                className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition has-[:focus-visible]:[box-shadow:var(--focus-ring)] ${
                  active
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--border-strong)]"
                }`}
              >
                <input
                  type="radio"
                  name="broadcast-type"
                  className="sr-only"
                  checked={active}
                  onChange={() => setType(t)}
                />
                <Icon size={12} aria-hidden="true" />
                {meta.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Target */}
      <fieldset className="min-w-0">
        <legend className="mb-1.5 text-xs font-semibold text-[var(--muted)]">Target</legend>
        <div className="mb-3 flex gap-3">
          {[
            { val: "all", label: "All users", Icon: Globe },
            { val: "users", label: "Specific users", Icon: Users },
          ].map(({ val, label, Icon }) => (
            <label
              key={val}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3.5 py-2 text-sm transition has-[:focus-visible]:[box-shadow:var(--focus-ring)] ${
                targetType === val
                  ? "border-[var(--primary)] bg-[var(--surface-soft)] font-semibold text-[var(--foreground)]"
                  : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--border-strong)]"
              }`}
            >
              <input
                type="radio"
                name="broadcast-target"
                className="sr-only"
                checked={targetType === val}
                onChange={() => setTargetType(val)}
              />
              <Icon size={14} aria-hidden="true" />
              {label}
            </label>
          ))}
        </div>

        {targetType === "users" && (
          <div className="overflow-hidden rounded-lg border border-[var(--border)]">
            <div className="border-b border-[var(--border)] bg-[var(--surface-soft)] p-2">
              <label htmlFor={userSearchId} className="sr-only">
                Search admins
              </label>
              <Input
                id={userSearchId}
                type="search"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search admins…"
              />
            </div>
            <div className="max-h-44 divide-y divide-[var(--border)] overflow-y-auto">
              {filteredAdmins.length === 0 &&
                (adminsError ? (
                  <p
                    role="alert"
                    className="px-4 py-3 text-xs text-[var(--danger-text)]"
                  >
                    {adminsError}
                  </p>
                ) : (
                  <p className="px-4 py-3 text-xs text-[var(--muted)]">No admins found</p>
                ))}
              {filteredAdmins.map((a) => {
                const checked = selectedUsers.includes(a.id);
                const name = a.fullName || a.firstName || a.email;
                return (
                  <label
                    key={a.id}
                    className="flex cursor-pointer items-center gap-3 px-4 py-2.5 transition hover:bg-[var(--surface-soft)]"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleUser(a.id)}
                      className="rounded"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--foreground)]">{name}</p>
                      <p className="truncate text-xs text-[var(--muted)]">{a.email}</p>
                    </div>
                  </label>
                );
              })}
            </div>
            {selectedUsers.length > 0 && (
              <div className="border-t border-[var(--border)] bg-[var(--surface-soft)] px-4 py-2 text-xs font-medium text-[var(--muted)]">
                {selectedUsers.length} selected
              </div>
            )}
          </div>
        )}
      </fieldset>

      {/* Delivery — scheduling is fully built server-side (POST requires
          scheduledAt when sendNow is false, and the History tab already has
          Scheduled badges + a Cancel action) but nothing in this form could
          ever set sendNow:false, so a schedule could never be created. */}
      <fieldset className="min-w-0">
        <legend className="mb-1.5 text-xs font-semibold text-[var(--muted)]">Delivery</legend>
        <div className="flex flex-wrap gap-3">
          {[
            { val: "now", label: "Send now", Icon: Send },
            { val: "schedule", label: "Schedule for later", Icon: Clock },
          ].map(({ val, label, Icon }) => (
            <label
              key={val}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3.5 py-2 text-sm transition has-[:focus-visible]:[box-shadow:var(--focus-ring)] ${
                sendMode === val
                  ? "border-[var(--primary)] bg-[var(--surface-soft)] font-semibold text-[var(--foreground)]"
                  : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--border-strong)]"
              }`}
            >
              <input
                type="radio"
                name="broadcast-send-mode"
                className="sr-only"
                checked={sendMode === val}
                onChange={() => {
                  setSendMode(val);
                  if (val === "now") setScheduledAtError("");
                }}
              />
              <Icon size={14} aria-hidden="true" />
              {label}
            </label>
          ))}
        </div>

        {sendMode === "schedule" && (
          <div className="mt-3">
            <Field label="Scheduled for" htmlFor={scheduledAtFieldId}>
              <Input
                id={scheduledAtFieldId}
                type="datetime-local"
                value={scheduledAt}
                min={minScheduledAt}
                onChange={(e) => {
                  setScheduledAt(e.target.value);
                  if (scheduledAtError) setScheduledAtError("");
                }}
                invalid={Boolean(scheduledAtError)}
                aria-describedby={scheduledAtError ? scheduledAtErrorId : undefined}
              />
            </Field>
            {scheduledAtError ? (
              <p id={scheduledAtErrorId} className="text-xs font-medium text-[var(--danger-text)]">
                {scheduledAtError}
              </p>
            ) : null}
          </div>
        )}
      </fieldset>

      <Field label="Action URL (optional)" htmlFor={urlFieldId}>
        <Input
          id={urlFieldId}
          value={actionUrl}
          onChange={(e) => {
            setActionUrl(e.target.value);
            if (urlError) setUrlError("");
          }}
          onBlur={(e) => setUrlError(validateActionUrl(e.target.value) || "")}
          placeholder="https://… or /support"
          invalid={Boolean(urlError)}
          aria-describedby={urlError ? urlErrorId : undefined}
        />
        {/* Rendered here rather than through Field's `error` slot so the message
            keeps its id for aria-describedby, and so it can use --danger-text
            (--danger alone fails AA for body copy on the light surface). */}
        {urlError ? (
          <p id={urlErrorId} className="text-xs font-medium text-[var(--danger-text)]">
            {urlError}
          </p>
        ) : null}
      </Field>

      <BroadcastPreview title={title} body={body} type={type} actionUrl={actionUrl} />
    </SectionCard>
  );
}

// ─── Broadcast List ───────────────────────────────────────────────────────────

function BroadcastList({ broadcasts, onDelete, onCancel, onResend, busyId = null }) {
  return (
    <div className="space-y-3">
      {broadcasts.map((b) => (
        <SectionCard
          key={b.id}
          footer={
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[var(--muted)]">
              <span>
                <span className="font-semibold">Target:</span>{" "}
                {b.target?.type === "all"
                  ? "All users"
                  : `${b.target?.userIds?.length ?? 0} user(s)`}
              </span>
              <span>
                <span className="font-semibold">Created:</span> {fmtDate(b.createdAt)}
              </span>
              {b.sentAt && (
                <span>
                  <span className="font-semibold">Sent:</span> {fmtDate(b.sentAt)}
                </span>
              )}
              {b.status === "sent" && typeof b.recipientCount === "number" && (
                <span>
                  <span className="font-semibold">Delivered to:</span> {b.recipientCount} recipient
                  {b.recipientCount === 1 ? "" : "s"}
                </span>
              )}
              {b.status === "scheduled" && b.scheduledAt && (
                <span>
                  <span className="font-semibold">Scheduled:</span> {fmtDate(b.scheduledAt)}
                </span>
              )}
            </div>
          }
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <TypeBadge type={b.type} />
                <StatusBadge status={b.status} />
              </div>
              <p className="truncate text-sm font-semibold text-[var(--foreground)]">{b.title}</p>
              <p className="mt-0.5 line-clamp-2 text-xs text-[var(--muted)]">{b.body}</p>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              {(b.status === "failed" || b.status === "draft") && (
                <RowAction
                  label={b.status === "failed" ? "Retry send" : "Send now"}
                  tone="primary"
                  onClick={() => onResend?.(b)}
                  disabled={busyId === b.id}
                >
                  <Send size={14} aria-hidden="true" />
                </RowAction>
              )}
              {b.status === "scheduled" && (
                <RowAction
                  label="Cancel schedule"
                  tone="warning"
                  onClick={() => onCancel(b.id)}
                  disabled={busyId === b.id}
                >
                  <X size={14} aria-hidden="true" />
                </RowAction>
              )}
              <RowAction
                label="Delete broadcast"
                tone="danger"
                onClick={() => onDelete(b.id)}
                disabled={busyId === b.id}
              >
                <Trash2 size={14} aria-hidden="true" />
              </RowAction>
            </div>
          </div>

          {b.status === "failed" && (
            <p className="mt-3 rounded-lg border border-[color-mix(in_srgb,var(--danger)_35%,var(--border))] bg-[color-mix(in_srgb,var(--danger-soft)_60%,var(--surface))] px-3 py-2 text-xs text-[var(--foreground)]">
              {b.error || "Delivery failed. Use “Retry send” to try again."}
            </p>
          )}
        </SectionCard>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotificationBroadcastPage() {
  const { user } = useAuth();

  const [broadcasts, setBroadcasts] = useState([]);
  const [adminsList, setAdminsList] = useState([]);
  // Set when /api/admin/list fails, so the target picker can say "we could not
  // ask" instead of silently rendering "no admins".
  const [adminsError, setAdminsError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [busyId, setBusyId] = useState(null);
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

      // A non-OK broadcast response used to fall through to "No broadcasts yet",
      // which reads as an empty history rather than a failed/unauthorized load.
      if (bRes.ok) {
        const { broadcasts: list } = await bRes.json();
        setBroadcasts(list ?? []);
        setLoadError(null);
      } else {
        const payload = await bRes.json().catch(() => ({}));
        setBroadcasts([]);
        setLoadError(
          bRes.status === 401 || bRes.status === 403
            ? "You aren’t authorized to manage broadcasts. Ask a super admin to check your access."
            : bRes.status >= 500
              ? `The broadcast service is having trouble (${bRes.status}). Try again in a moment.`
              : payload?.error || `Couldn’t load broadcasts (${bRes.status}).`,
        );
      }

      if (aRes.ok) {
        const { admins } = await aRes.json();
        setAdminsList(admins ?? []);
        setAdminsError("");
      } else {
        // Without this branch a failed /api/admin/list left adminsList empty,
        // so the target picker showed "No admins found" and the audience count
        // read "all 0 admins" — a confident wrong answer on a send that cannot
        // be recalled. Surface it instead, and let Send guard on it.
        setAdminsList([]);
        setAdminsError(
          "Couldn’t load the admin directory, so recipients can’t be resolved right now.",
        );
      }
    } catch (err) {
      if (err?.name !== "AbortError" && !controller.signal.aborted) {
        console.error("Failed to load notification broadcasts", err);
        setLoadError("Couldn’t reach the broadcast service. Check your connection and try again.");
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

  const retry = useCallback(() => {
    setLoading(true);
    setLoadError(null);
    return fetchData();
  }, [fetchData]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this broadcast?")) return;
    setBusyId(id);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/notifications/broadcast?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      // Only drop the row once the server has actually accepted the delete —
      // the optimistic removal made a rejected request look successful.
      await readApiJson(res, "Failed to delete broadcast.");
      setBroadcasts((prev) => prev.filter((b) => b.id !== id));
      emitAlert({ type: "success", message: "Broadcast deleted." });
    } catch (err) {
      console.error(err);
      emitAlert({ type: "error", message: getErrorMessage(err, "Failed to delete broadcast.") });
    } finally {
      setBusyId(null);
    }
  };

  const handleResend = async (broadcast) => {
    const isRetry = broadcast.status === "failed";
    const confirmed = window.confirm(
      `${isRetry ? "Retry sending" : "Send"} “${broadcast.title}” now?\n\n` +
        (isRetry
          ? "Some recipients may already have been notified by the failed attempt — they would receive it twice. "
          : "") +
        "This delivers an in-app notification and a push alert immediately and cannot be undone.",
    );
    if (!confirmed) return;

    setBusyId(broadcast.id);
    try {
      const token = await user.getIdToken();
      const res = await fetch(
        `/api/notifications/broadcast?id=${encodeURIComponent(broadcast.id)}&action=resend`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await readApiJson(res, "Failed to send the broadcast.");
      const delivered =
        typeof data?.recipientCount === "number" ? ` to ${data.recipientCount} recipient(s)` : "";
      emitAlert({ type: "success", message: `Broadcast sent${delivered}.` });
      fetchData();
    } catch (err) {
      console.error(err);
      emitAlert({ type: "error", message: getErrorMessage(err, "Failed to send the broadcast.") });
    } finally {
      setBusyId(null);
    }
  };

  const handleCancel = async (id) => {
    setBusyId(id);
    try {
      const token = await user.getIdToken();
      const res = await fetch(
        `/api/notifications/broadcast?id=${encodeURIComponent(id)}&action=cancel`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      await readApiJson(res, "Failed to cancel the scheduled broadcast.");
      emitAlert({ type: "success", message: "Scheduled broadcast cancelled." });
      fetchData();
    } catch (err) {
      console.error(err);
      emitAlert({
        type: "error",
        message: getErrorMessage(err, "Failed to cancel the scheduled broadcast."),
      });
    } finally {
      setBusyId(null);
    }
  };

  const {
    search: historySearch,
    onSearchChange: onHistorySearchChange,
    filterValues: historyFilterValues,
    setFilter: setHistoryFilter,
    rows: visibleBroadcasts,
    matched: matchedBroadcasts,
    total: totalBroadcasts,
  } = useTableControls(broadcasts, {
    searchFields: BROADCAST_SEARCH_FIELDS,
    filters: { status: (row, value) => row.status === value },
  });

  const tabItems = [
    { key: "create", label: "Create" },
    { key: "history", label: "History", count: broadcasts.length },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl p-6">
      <PageHeader
        eyebrow="Super Admin Console"
        icon={Bell}
        title="Notification Broadcasts"
        description="Create and manage system-wide notifications for all admins."
        actions={
          <Button variant="secondary" onClick={fetchData}>
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Refresh
          </Button>
        }
      >
        <Tabs
          items={tabItems}
          value={tab}
          onChange={setTab}
          ariaLabel="Notification broadcast views"
        />
      </PageHeader>

      <div role="tabpanel" aria-label={tab === "create" ? "Create" : "History"}>
        {tab === "create" ? (
          // A failed history GET must NOT take the Create panel away: POST is a
          // separate endpoint that still works, and the GET handler reports every
          // fault the same way, so a transient blip used to lock a legitimate
          // super admin out of sending and told them they were unauthorized.
          // `error` is deliberately not passed here for that reason.
          <DataState loading={loading} loadingVariant="detail">
            <CreateBroadcastPanel
              adminsList={adminsList}
              adminsError={adminsError}
              onCreated={() => {
                fetchData();
                setTab("history");
              }}
            />
          </DataState>
        ) : (
          <DataState
            loading={loading}
            error={loadError}
            isEmpty={!broadcasts.length}
            onRetry={retry}
            errorTitle="Couldn’t load broadcasts"
            loadingVariant="cards"
            rows={3}
            empty={
              <EmptyState
                icon={Bell}
                title="No broadcasts yet"
                description="Broadcasts you send appear here with their delivery status."
              />
            }
          >
            <div className="space-y-3">
              <FilterBar
                search={historySearch}
                onSearchChange={onHistorySearchChange}
                searchPlaceholder="Search title or body…"
                filters={[
                  {
                    key: "status",
                    value: historyFilterValues.status || "all",
                    onChange: (value) => setHistoryFilter("status", value),
                    label: "Filter by status",
                    options: [
                      { value: "all", label: "All statuses" },
                      { value: "draft", label: "Draft" },
                      { value: "scheduled", label: "Scheduled" },
                      { value: "sent", label: "Sent" },
                      { value: "failed", label: "Failed" },
                    ],
                  },
                ]}
                count={`${matchedBroadcasts} of ${totalBroadcasts} broadcast${totalBroadcasts === 1 ? "" : "s"}`}
              />
              {matchedBroadcasts === 0 ? (
                <EmptyState
                  icon={Bell}
                  title="No matches"
                  description="Try a different search term or status filter."
                />
              ) : (
                <BroadcastList
                  broadcasts={visibleBroadcasts}
                  onDelete={handleDelete}
                  onCancel={handleCancel}
                  onResend={handleResend}
                  busyId={busyId}
                />
              )}
            </div>
          </DataState>
        )}
      </div>
    </div>
  );
}
