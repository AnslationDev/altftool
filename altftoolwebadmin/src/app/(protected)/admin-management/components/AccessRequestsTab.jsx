"use client";

import { useState, useEffect, useCallback } from "react";
import { getAdminIdToken } from "@/lib/adminIdToken";
import { emitAlert } from "@/lib/alertBus";
import ApproveRequestModal from "./ApproveRequestModal";
import { PROJECTS } from "@/projects";
import { SectionCard, DataState, EmptyState } from "@/ansets";
import {
  RefreshCw, CheckCircle2, XCircle, Clock, User, Boxes,
} from "lucide-react";

const STATUS_STYLES = {
  pending:  { bg: "bg-[var(--warning-soft)]", text: "text-[var(--warning-text)]", icon: <Clock className="w-3 h-3" /> },
  approved: { bg: "bg-[var(--success-soft)]", text: "text-[var(--success)]",      icon: <CheckCircle2 className="w-3 h-3" /> },
  rejected: { bg: "bg-[var(--danger-soft)]",  text: "text-[var(--danger-text)]",  icon: <XCircle className="w-3 h-3" /> },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.pending;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${s.bg} ${s.text}`}>
      {s.icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function TypeBadge({ type, projectId, moduleKey }) {
  if (type === "new") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--primary-soft)] text-[var(--primary)]">
        <User className="w-3 h-3" />New Account
      </span>
    );
  }

  const projectName = PROJECTS[projectId]?.name ?? projectId ?? "—";
  const moduleName  = PROJECTS[projectId]?.modules?.[moduleKey]?.label ?? moduleKey ?? "—";

  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
      <Boxes className="w-3 h-3" />{projectName} · {moduleName}
    </span>
  );
}

/** Operator-facing copy for a failed access-request read. */
function describeRequestsError(status) {
  if (status === 401 || status === 403)
    return "You do not have permission to view access requests.";
  return "Couldn't load access requests. Please try again.";
}

export default function AccessRequestsTab() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [approvingRequest, setApprovingRequest] = useState(null); // for "new" type modal
  const [rejectingId, setRejectingId] = useState(null);
  const [approvingModuleId, setApprovingModuleId] = useState(null);

  const fetchRequests = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const token = await getAdminIdToken();
      if (!token) return;

      const params = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const res = await fetch(`/api/admin/access-requests${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const message = describeRequestsError(res.status);
        if (!silent) setLoadError(message);
        emitAlert({ type: "error", message });
        return;
      }
      const data = await res.json();
      setRequests(data.requests ?? []);
      setLoadError(null);
    } catch {
      const message = "Network error loading requests";
      if (!silent) setLoadError(message);
      emitAlert({ type: "error", message });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleReject = async (requestId) => {
    setRejectingId(requestId);
    try {
      const token = await getAdminIdToken(true);
      const res = await fetch("/api/admin/access-requests/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ requestId }),
      });
      if (!res.ok) { emitAlert({ type: "error", message: "Failed to reject request" }); return; }
      emitAlert({ type: "success", message: "Request rejected" });
      fetchRequests(true);
    } catch {
      emitAlert({ type: "error", message: "Network error" });
    } finally {
      setRejectingId(null);
    }
  };

  const handleApproveModule = async (requestId) => {
    setApprovingModuleId(requestId);
    try {
      const token = await getAdminIdToken(true);
      const res = await fetch("/api/admin/access-requests/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ requestId }),
      });
      if (!res.ok) { emitAlert({ type: "error", message: "Failed to approve request" }); return; }
      emitAlert({ type: "success", message: "Module access granted" });
      fetchRequests(true);
    } catch {
      emitAlert({ type: "error", message: "Network error" });
    } finally {
      setApprovingModuleId(null);
    }
  };

  const pending = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-5">

      {/* Toolbar */}
      <SectionCard flush bodyClassName="px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <select
            aria-label="Filter by request status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-[var(--border)] rounded-lg px-3 py-1.5 bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus-visible:[box-shadow:var(--focus-ring)] cursor-pointer transition min-w-[140px]"
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          {pending > 0 && (
            <span className="text-xs font-bold bg-[var(--warning-soft)] text-[var(--warning-text)] px-2.5 py-1 rounded-full">
              {pending} pending
            </span>
          )}

          <button
            onClick={() => fetchRequests(true)}
            disabled={refreshing}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-sm border border-[var(--border)] rounded-xl text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)] bg-[var(--surface)] transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin motion-reduce:animate-none" : ""}`} />
            Refresh
          </button>
        </div>
      </SectionCard>

      {/* List */}
      <SectionCard flush>
        <DataState
          loading={loading}
          error={loadError}
          isEmpty={!requests.length}
          onRetry={() => fetchRequests()}
          errorTitle="Couldn't load access requests"
          empty={
            <EmptyState
              icon={User}
              title="No access requests found"
              description="New signup and module-access requests will show up here for review."
            />
          }
        >
          <div className="divide-y divide-[var(--border)]">
            {requests.map((req) => {
              const busy = rejectingId === req.id || approvingModuleId === req.id;

              return (
                <div key={req.id} className="px-5 py-4 flex flex-wrap items-center gap-4">

                  {/* Avatar + Email */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[var(--surface-soft)] flex items-center justify-center text-sm font-bold text-[var(--muted)] shrink-0">
                      {req.email?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--foreground)] truncate">{req.email ?? "Unknown"}</p>
                      <p className="text-[10px] text-[var(--muted-soft)] font-mono">{req.uid?.slice(0, 12)}…</p>
                    </div>
                  </div>

                  {/* Type */}
                  <TypeBadge type={req.type} projectId={req.projectId} moduleKey={req.moduleKey} />

                  {/* Status */}
                  <StatusBadge status={req.status} />

                  {/* Date */}
                  <span className="text-xs text-[var(--muted-soft)] whitespace-nowrap hidden sm:block">
                    {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : "—"}
                  </span>

                  {/* Actions */}
                  {req.status === "pending" && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => req.type === "new" ? setApprovingRequest(req) : handleApproveModule(req.id)}
                        disabled={busy}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:bg-[var(--primary-hover)] transition disabled:opacity-50"
                      >
                        {approvingModuleId === req.id ? (
                          <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(req.id)}
                        disabled={busy}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border border-[var(--danger)]/30 text-[var(--danger-text)] rounded-lg hover:bg-[var(--danger-soft)] transition disabled:opacity-50"
                      >
                        {rejectingId === req.id ? (
                          <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </DataState>
      </SectionCard>

      {/* Approve modal for "new" requests */}
      {approvingRequest && (
        <ApproveRequestModal
          request={approvingRequest}
          onClose={() => setApprovingRequest(null)}
          refresh={() => fetchRequests(true)}
        />
      )}
    </div>
  );
}
