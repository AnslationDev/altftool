"use client";

import { useState, useEffect, useId } from "react";
import Link from "next/link";
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
import { getAdminIdToken } from "@/lib/adminIdToken";
import { Badge, Button, Field, Input, Select, Textarea } from "@altftool/ui";
import {
  DataState,
  DataTable,
  EmptyState,
  PageHeader,
  SectionCard,
} from "@/ansets";
import { Send, TicketIcon, Users, LifeBuoy, AlertCircle } from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_TONE = {
  open: "info",
  in_progress: "warning",
  resolved: "success",
  closed: "neutral",
};

const STATUS_LABEL = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

const PRIORITY_TONE = {
  low: "neutral",
  medium: "warning",
  high: "danger",
};

const PRIORITY_LABEL = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

function fmtDate(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Sections ────────────────────────────────────────────────────────────────

function SuperAdminsSection({ admins, loading, error, onRetry }) {
  return (
    <SectionCard title="Super Admins" description="Your support contacts">
      <DataState
        loading={loading}
        error={error}
        isEmpty={!admins.length}
        onRetry={onRetry}
        errorTitle="Couldn’t load your support contacts"
        loadingVariant="cards"
        rows={2}
        empty={
          <EmptyState
            icon={Users}
            title="No super admins found"
            description="No super admin contacts are listed for this console yet."
          />
        }
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] p-3"
              >
                {a.photoURL ? (
                  <img
                    src={a.photoURL}
                    alt=""
                    className="h-9 w-9 shrink-0 rounded-lg border border-[var(--border)] object-cover"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)] text-xs font-bold text-[var(--primary-foreground)]"
                  >
                    {initials}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                    {a.fullName ||
                      `${a.firstName ?? ""} ${a.lastName ?? ""}`.trim() ||
                      "Super Admin"}
                  </p>
                  <p className="truncate text-xs text-[var(--muted)]">{a.email}</p>
                </div>
              </div>
            );
          })}
        </div>
      </DataState>
    </SectionCard>
  );
}

function RaiseTicketSection({ user, onTicketCreated }) {
  const fieldId = useId();
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
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.error || "Failed to raise ticket. Please try again.");
      }
      emitAlert({ type: "success", message: "Ticket raised successfully!" });
      setForm({ title: "", description: "", type: "query", priority: "medium" });
      setErrors({});
      onTicketCreated?.();
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to raise ticket. Please try again." });
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

  const titleId = `${fieldId}-title`;
  const descriptionId = `${fieldId}-description`;
  const typeId = `${fieldId}-type`;
  const priorityId = `${fieldId}-priority`;

  return (
    <SectionCard
      title="Raise a Ticket"
      description="Describe your issue and we'll get back to you"
    >
      <div className="space-y-4">
        <Field label="Title" htmlFor={titleId} required>
          <Input
            id={titleId}
            type="text"
            placeholder="Brief summary of your issue"
            invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? `${titleId}-error` : undefined}
            {...field("title")}
          />
          {errors.title ? (
            <p
              id={`${titleId}-error`}
              className="flex items-center gap-1 text-xs font-medium text-[var(--danger-text)]"
            >
              <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
              {errors.title}
            </p>
          ) : null}
        </Field>

        <Field label="Description" htmlFor={descriptionId} required>
          <Textarea
            id={descriptionId}
            rows={4}
            placeholder="Describe your issue in detail…"
            invalid={Boolean(errors.description)}
            aria-describedby={errors.description ? `${descriptionId}-error` : undefined}
            {...field("description")}
          />
          {errors.description ? (
            <p
              id={`${descriptionId}-error`}
              className="flex items-center gap-1 text-xs font-medium text-[var(--danger-text)]"
            >
              <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
              {errors.description}
            </p>
          ) : null}
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Type" htmlFor={typeId}>
            <Select id={typeId} {...field("type")}>
              <option value="query">Query</option>
              <option value="bug">Bug</option>
              <option value="feature">Feature Request</option>
            </Select>
          </Field>
          <Field label="Priority" htmlFor={priorityId}>
            <Select id={priorityId} {...field("priority")}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </Field>
        </div>

        <Button
          onClick={submit}
          loading={loading}
          loadingLabel="Submitting ticket"
          className="w-full"
        >
          {loading ? null : <Send className="h-4 w-4" aria-hidden="true" />}
          {loading ? "Submitting…" : "Submit Ticket"}
        </Button>
      </div>
    </SectionCard>
  );
}

function MyTicketsSection({ tickets, loading, error, onRetry }) {
  const router = useRouter();

  const columns = [
    {
      key: "title",
      header: "Ticket",
      render: (t) => (
        <div className="min-w-0">
          <Link
            href={`/support/${t.id}`}
            onClick={(event) => event.stopPropagation()}
            className="block truncate rounded-sm text-sm font-semibold text-[var(--foreground)] transition-colors hover:text-[var(--primary)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
          >
            {t.title}
          </Link>
          <p className="mt-0.5 text-xs text-[var(--muted)]">{fmtDate(t.createdAt)}</p>
        </div>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      hideBelow: "sm",
      render: (t) => (
        <Badge tone={PRIORITY_TONE[t.priority] ?? "neutral"}>
          {PRIORITY_LABEL[t.priority] ?? t.priority}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "right",
      render: (t) => (
        <Badge tone={STATUS_TONE[t.status] ?? "info"}>
          {STATUS_LABEL[t.status] ?? t.status}
        </Badge>
      ),
    },
  ];

  const description = error
    ? "Unavailable"
    : loading
    ? "Loading your tickets…"
    : `${tickets.length} ticket${tickets.length !== 1 ? "s" : ""}`;

  return (
    <SectionCard title="My Tickets" description={description}>
      <DataTable
        columns={columns}
        rows={tickets}
        getRowKey={(t) => t.id}
        loading={loading}
        error={error || null}
        onRetry={onRetry}
        errorTitle="Couldn’t load your tickets"
        onRowClick={(t) => router.push(`/support/${t.id}`)}
        caption="Support tickets you have raised"
        empty={
          <EmptyState
            icon={TicketIcon}
            title="No tickets yet"
            description="Raise one with the form and it will show up here."
          />
        }
      />
    </SectionCard>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SupportPage() {
  const { user } = useAuth();
  const [superAdmins, setSuperAdmins] = useState([]);
  const [superAdminsLoading, setSuperAdminsLoading] = useState(true);
  const [superAdminsError, setSuperAdminsError] = useState("");
  const [contactsKey, setContactsKey] = useState(0);
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [ticketsError, setTicketsError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Load super admins (static, one-time via API)
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setSuperAdminsLoading(true);
    setSuperAdminsError("");
    // /api/admin/list is gated on verifySuperAdminRequest, so every ordinary
    // admin got a 401 here and saw "not authorised" on a screen whose whole
    // purpose is telling them who to contact. /api/admin/superadmins returns
    // the same people and only requires an active admin.
    getAdminIdToken()
      .then((token) =>
        fetch("/api/admin/superadmins", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
      )
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(
            res.status === 401 || res.status === 403
              ? "You are not authorised to view the support contacts."
              : "The contacts service is unavailable right now."
          );
        }
        const data = await res.json();
        if (cancelled) return;
        setSuperAdmins(data?.superadmins ?? []);
        setSuperAdminsLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setSuperAdmins([]);
        setSuperAdminsError(err?.message || "The contacts service is unavailable right now.");
        setSuperAdminsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, contactsKey]);

  // Real-time my tickets
  useEffect(() => {
    if (!user) return;
    setTicketsLoading(true);
    setTicketsError("");
    const q = query(
      collection(db, "support_tickets"),
      where("createdBy", "==", user.uid),
      where("isDeleted", "!=", true),
      orderBy("isDeleted"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setTickets(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setTicketsError("");
        setTicketsLoading(false);
      },
      (err) => {
        setTickets([]);
        setTicketsError(
          err?.code === "permission-denied"
            ? "You do not have permission to read your tickets."
            : "The ticket list is temporarily unavailable."
        );
        setTicketsLoading(false);
      }
    );
    return () => unsub();
  }, [user, refreshKey]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader
        icon={LifeBuoy}
        title="Support"
        description="Get help or raise a support ticket."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SuperAdminsSection
          admins={superAdmins}
          loading={superAdminsLoading}
          error={superAdminsError}
          onRetry={() => setContactsKey((k) => k + 1)}
        />
        <RaiseTicketSection user={user} onTicketCreated={() => setRefreshKey((k) => k + 1)} />
        <MyTicketsSection
          tickets={tickets}
          loading={ticketsLoading}
          error={ticketsError}
          onRetry={() => setRefreshKey((k) => k + 1)}
        />
      </div>
    </div>
  );
}
