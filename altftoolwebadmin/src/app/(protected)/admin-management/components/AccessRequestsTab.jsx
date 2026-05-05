"use client";

import { useState, useEffect, useCallback } from "react";
import { getAuth } from "firebase/auth";
import { emitAlert } from "@/lib/alertBus";
import ApproveRequestModal from "./ApproveRequestModal";
import { PROJECTS } from "@/projects";
import {
  RefreshCw, CheckCircle2, XCircle, Clock, User, Boxes,
  ChevronDown,
} from "lucide-react";

const STATUS_STYLES = {
  pending:  { bg: "bg-amber-100",  text: "text-amber-700",  icon: <Clock className="w-3 h-3" /> },
  approved: { bg: "bg-green-100",  text: "text-green-700",  icon: <CheckCircle2 className="w-3 h-3" /> },
  rejected: { bg: "bg-red-100",    text: "text-red-700",    icon: <XCircle className="w-3 h-3" /> },
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
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
        <User className="w-3 h-3" />New Account
      </span>
    );
  }

  const projectName = PROJECTS[projectId]?.name ?? projectId ?? "—";
  const moduleName  = PROJECTS[projectId]?.modules?.[moduleKey]?.label ?? moduleKey ?? "—";

  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">
      <Boxes className="w-3 h-3" />{projectName} · {moduleName}
    </span>
  );
}

export default function AccessRequestsTab() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [approvingRequest, setApprovingRequest] = useState(null); // for "new" type modal
  const [rejectingId, setRejectingId] = useState(null);
  const [approvingModuleId, setApprovingModuleId] = useState(null);

  const fetchRequests = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const token = await getAuth().currentUser?.getIdToken();
      if (!token) return;

      const params = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const res = await fetch(`/api/admin/access-requests${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { emitAlert({ type: "error", message: "Failed to load access requests" }); return; }
      const data = await res.json();
      setRequests(data.requests ?? []);
    } catch {
      emitAlert({ type: "error", message: "Network error loading requests" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleReject = async (requestId) => {
    setRejectingId(requestId);
    try {
      const token = await getAuth().currentUser?.getIdToken(true);
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
      const token = await getAuth().currentUser?.getIdToken(true);
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

  const pending  = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-5">

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 cursor-pointer transition min-w-[140px]"
        >
          <option value="all">All Requests</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        {pending > 0 && (
          <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
            {pending} pending
          </span>
        )}

        <button
          onClick={() => fetchRequests(true)}
          disabled={refreshing}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 bg-white transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
            <span className="text-sm">Loading requests…</span>
          </div>
        ) : requests.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            No access requests found.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {requests.map((req) => {
              const busy = rejectingId === req.id || approvingModuleId === req.id;

              return (
                <div key={req.id} className="px-5 py-4 flex flex-wrap items-center gap-4">

                  {/* Avatar + Email */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 shrink-0">
                      {req.email?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{req.email ?? "Unknown"}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{req.uid?.slice(0, 12)}…</p>
                    </div>
                  </div>

                  {/* Type */}
                  <TypeBadge type={req.type} projectId={req.projectId} moduleKey={req.moduleKey} />

                  {/* Status */}
                  <StatusBadge status={req.status} />

                  {/* Date */}
                  <span className="text-xs text-gray-400 whitespace-nowrap hidden sm:block">
                    {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : "—"}
                  </span>

                  {/* Actions */}
                  {req.status === "pending" && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => req.type === "new" ? setApprovingRequest(req) : handleApproveModule(req.id)}
                        disabled={busy}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
                      >
                        {approvingModuleId === req.id ? (
                          <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(req.id)}
                        disabled={busy}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                      >
                        {rejectingId === req.id ? (
                          <span className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
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
        )}
      </div>

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