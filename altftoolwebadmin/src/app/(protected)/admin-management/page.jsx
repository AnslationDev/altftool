"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button, Tabs } from "@altftool/ui";
import {
  Download,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Shield,
  ShieldCheck,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";

import EditAdminModal from "@/app/(protected)/admin-management/components/EditAdminModal";
import CreateAdminModal from "@/app/(protected)/admin-management/components/CreateAdminModal";
import AccessRequestsTab from "@/app/(protected)/admin-management/components/AccessRequestsTab";
import { useAuth } from "@/context/AuthContext";
import { emitAlert } from "@/lib/alertBus";
import { readApiJson } from "@/lib/apiClient";
import { getAdminIdToken } from "@/lib/adminIdToken";
import {
  refreshAdminUsers,
  subscribeToAdminUsers,
} from "@/services/adminUsersService";
import {
  BulkActionsBar,
  DataState,
  DataTable,
  EmptyState,
  FilterBar,
  LoadingState,
  PageHeader,
  SectionCard,
  StatGrid,
  useTableControls,
} from "@/ansets";
import AdminCard from "./components/AdminCard";
import AdminAvatar from "./components/AdminAvatar";
import PermissionSummary from "./components/PermissionSummary";
import Tooltip from "./components/Tooltip";

const TABS = [
  { key: "Admins", label: "Admins" },
  { key: "All Admins", label: "All Admins" },
  { key: "Access Requests", label: "Access Requests" },
];

/** Fields the admin search box matches against. Module-level so the memo inside
 *  useTableControls keeps a stable identity across renders. */
const SEARCH_FIELDS = ["email", "fullName", "firstName", "lastName"];

/** Filter predicates. "all"/unset is treated as "filter off" by useTableControls. */
const ADMIN_FILTERS = {
  role: (admin, value) => admin.roleType === value,
  status: (admin, value) =>
    value === "active" ? Boolean(admin.isActive) : !admin.isActive,
};

const ROLE_OPTIONS = [
  { value: "all", label: "All Roles" },
  { value: "admin", label: "Admin" },
  { value: "superadmin", label: "Super Admin" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

/** Operator-facing copy for a failed admin-directory read (never echo raw SDK strings). */
function describeAdminsError(error) {
  const code = String(error?.code || "").toLowerCase();
  if (code.includes("permission-denied"))
    return "You do not have permission to read the admin directory. Ask a super admin to grant access.";
  if (code.includes("unauthenticated"))
    return "Your session has expired. Sign in again to load the admin directory.";
  if (code.includes("unavailable") || code.includes("deadline-exceeded"))
    return "Couldn't reach the admin directory. Check your connection and try again.";
  return "Couldn't load the admin directory. Please try again.";
}

export default function AdminManagement() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Admins");
  const [pendingCount, setPendingCount] = useState(0);

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  // Persistent subscription failure + a key used to re-subscribe on retry
  // (onSnapshot tears the listener down after an error).
  const [loadError, setLoadError] = useState(null);
  const [subscriptionKey, setSubscriptionKey] = useState(0);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  // From context, not getAuth().currentUser directly: the local-admin dev
  // session has no Firebase user at all, so reading Firebase raw left both the
  // token calls below AND this self-identity check permanently broken in that
  // mode (a raw Firebase read is always null there).
  const currentUid = user?.uid;

  const fetchPendingCount = useCallback(async () => {
    try {
      const token = await getAdminIdToken();
      if (!token) return;
      const res = await fetch("/api/admin/access-requests?status=pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPendingCount(data.requests?.length ?? 0);
      }
    } catch {
      /* non-critical */
    }
  }, []);

  const fetchAdmins = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      setAdmins(await refreshAdminUsers());
      // A successful refetch must clear the error state, otherwise the page
      // stays stuck on the error panel even though the data behind it is fine —
      // `loadError` was only ever cleared by the snapshot callback and retry.
      setLoadError(null);
    } catch (error) {
      const message = describeAdminsError(error);
      // `loadError` drives the DataTable's error state and hides the KPI strip,
      // so setting it on a SILENT background refresh would blank a perfectly
      // good list the operator is reading — a toast is the right channel for a
      // refresh that failed while stale-but-valid rows are still on screen.
      // Only a foreground load (nothing rendered yet) escalates to the panel.
      if (!silent) setLoadError(message);
      emitAlert({ type: "error", message });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const retryAdmins = useCallback(() => {
    setLoadError(null);
    setLoading(true);
    setSubscriptionKey((key) => key + 1);
  }, []);

  useEffect(() => {
    fetchPendingCount();
    const unsubscribe = subscribeToAdminUsers(
      (adminUsers) => {
        setAdmins(adminUsers);
        setLoadError(null);
        setLoading(false);
        setRefreshing(false);
      },
      (error) => {
        setLoading(false);
        setRefreshing(false);
        const message = describeAdminsError(error);
        setLoadError(message);
        emitAlert({ type: "error", message });
      },
    );

    return unsubscribe;
  }, [fetchPendingCount, subscriptionKey]);

  const toggleStatus = async (admin) => {
    if (admin.id === currentUid) {
      emitAlert({
        type: "warning",
        message: "You cannot deactivate your own account",
      });
      return;
    }
    setTogglingId(admin.id);
    try {
      const token = await getAdminIdToken(true);
      if (!token) {
        emitAlert({
          type: "error",
          message: "Session expired. Please log in again.",
        });
        return;
      }
      const res = await fetch("/api/admin/toggle-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ adminId: admin.id, isActive: !admin.isActive }),
      });
      await readApiJson(res, "Failed to update status");
      emitAlert({
        type: "success",
        message: `Admin ${!admin.isActive ? "activated" : "deactivated"}`,
      });
      fetchAdmins(true);
    } catch (error) {
      emitAlert({
        type: "error",
        message: error?.message || "Network error updating status",
      });
    } finally {
      setTogglingId(null);
    }
  };

  const csvCell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

  const exportCsv = useCallback((rowsToExport) => {
    const header = ["Name", "Email", "Role", "Team", "Status"];
    const lines = [header.map(csvCell).join(",")];
    for (const a of rowsToExport) {
      lines.push(
        [
          a.fullName || [a.firstName, a.lastName].filter(Boolean).join(" "),
          a.email,
          a.roleType === "superadmin" ? "Super Admin" : "Admin",
          a.team || "",
          a.isActive ? "Active" : "Inactive",
        ]
          .map(csvCell)
          .join(","),
      );
    }
    const blob = new Blob([lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `admins-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  const bulkSetActive = useCallback(
    async (nextActive) => {
      // The server independently rejects a self-toggle, but filtering it out
      // up front means a bulk action a super admin ran on themselves plus
      // others reports as a clean success for everyone it actually applied
      // to, instead of a confusing "1 failed" for an operation the UI itself
      // should never have attempted.
      const ids = [...selectedIds].filter((id) => id !== currentUid);
      const skippedSelf = selectedIds.has(currentUid);
      if (!ids.length) {
        if (skippedSelf) {
          emitAlert({ type: "warning", message: "You cannot change your own active status." });
        }
        return;
      }
      const verb = nextActive ? "Activate" : "Deactivate";
      if (!window.confirm(`${verb} ${ids.length} admin${ids.length === 1 ? "" : "s"}?`)) return;

      setBulkBusy(true);
      try {
        const token = await getAdminIdToken(true);
        if (!token) {
          emitAlert({ type: "error", message: "Session expired. Please log in again." });
          return;
        }
        const results = await Promise.allSettled(
          ids.map((adminId) =>
            fetch("/api/admin/toggle-status", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({ adminId, isActive: nextActive }),
            }).then((res) => {
              if (!res.ok) throw new Error(`Failed for ${adminId}`);
            }),
          ),
        );
        const failed = results.filter((r) => r.status === "rejected").length;
        if (failed) {
          emitAlert({
            type: "warning",
            message: `${verb}d ${ids.length - failed} of ${ids.length}. ${failed} failed — try again for those.`,
          });
        } else {
          emitAlert({ type: "success", message: `${verb}d ${ids.length} admin${ids.length === 1 ? "" : "s"}.` });
        }
        setSelectedIds(new Set());
        fetchAdmins(true);
      } finally {
        setBulkBusy(false);
      }
    },
    [selectedIds, currentUid, fetchAdmins],
  );

  // Search (name + email), role/status filters and sorting for both tabs.
  const controls = useTableControls(admins, {
    searchFields: SEARCH_FIELDS,
    filters: ADMIN_FILTERS,
  });
  const visibleAdmins = controls.rows;

  // Three passes over `admins` were previously re-run on every render — including
  // every keystroke in the search box, since that only changes `controls`, not
  // `admins`. Memoized on the one input that actually changes these counts.
  const { totalActive, totalInactive, totalSuper } = useMemo(() => {
    let active = 0;
    let superCount = 0;
    for (const admin of admins) {
      if (admin.isActive) active += 1;
      if (admin.roleType === "superadmin") superCount += 1;
    }
    return { totalActive: active, totalInactive: admins.length - active, totalSuper: superCount };
  }, [admins]);

  const columns = useMemo(
    () => [
      {
        key: "email",
        header: "Admin",
        sortable: true,
        width: 260,
        render: (admin) => {
          const isSelf = admin.id === currentUid;
          const displayName =
            admin.fullName ||
            (admin.firstName
              ? `${admin.firstName} ${admin.lastName ?? ""}`.trim()
              : null);
          return (
            <div className="flex items-center gap-2.5">
              <AdminAvatar admin={admin} />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-[var(--foreground)] truncate">
                    {displayName || admin.email}
                  </span>
                  {isSelf && (
                    <span className="text-[10px] font-bold bg-[var(--primary-soft)] text-[var(--primary)] px-1.5 py-0.5 rounded-full shrink-0">
                      You
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-[var(--muted)] truncate block">
                  {displayName ? admin.email : admin.id?.slice(0, 12) + "…"}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        key: "roleType",
        header: "Role",
        sortable: true,
        width: 140,
        render: (admin) => {
          const role = admin.roleType;
          return (
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${role === "superadmin" ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "bg-[var(--surface-soft)] text-[var(--foreground)]"}`}
            >
              {role === "superadmin" ? (
                <ShieldCheck className="w-3 h-3" />
              ) : (
                <Shield className="w-3 h-3" />
              )}
              {role === "superadmin" ? "Super Admin" : "Admin"}
            </span>
          );
        },
      },
      {
        key: "permissions",
        header: "Permissions",
        width: 280,
        render: (admin) => <PermissionSummary admin={admin} />,
      },
      {
        key: "isActive",
        header: "Status",
        sortable: true,
        width: 110,
        render: (admin) => (
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${admin.isActive ? "bg-[var(--success-soft)] text-[var(--success)]" : "bg-[var(--danger-soft)] text-[var(--danger-text)]"}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${admin.isActive ? "bg-[var(--success)]" : "bg-[var(--danger)]"}`}
            />
            {admin.isActive ? "Active" : "Inactive"}
          </span>
        ),
      },
    ],
    [currentUid],
  );

  // The row itself opens the edit modal, so every control inside the actions
  // cell has to stop the click from bubbling up to it.
  const renderRowActions = (admin) => {
    const isSelf = admin.id === currentUid;
    const busy = togglingId === admin.id;
    return (
      <>
        <Tooltip label="Edit admin">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setSelectedAdmin(admin);
            }}
            aria-label="Edit admin"
            className="p-1.5 rounded-md text-[var(--primary)] transition hover:bg-[var(--primary-soft)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </Tooltip>
        <Tooltip label={admin.isActive ? "Deactivate" : "Activate"}>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              toggleStatus(admin);
            }}
            disabled={isSelf || busy}
            aria-label={admin.isActive ? "Deactivate admin" : "Activate admin"}
            className={`p-1.5 rounded-md transition disabled:opacity-30 focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] ${admin.isActive ? "text-[var(--danger-text)] hover:bg-[var(--danger-soft)]" : "text-[var(--success)] hover:bg-[var(--success-soft)]"}`}
          >
            {admin.isActive ? (
              <UserX className="w-3.5 h-3.5" />
            ) : (
              <UserCheck className="w-3.5 h-3.5" />
            )}
          </button>
        </Tooltip>
      </>
    );
  };

  const tabItems = TABS.map((tab) =>
    tab.key === "Access Requests" && pendingCount > 0
      ? { ...tab, count: pendingCount }
      : tab,
  );

  const emptyAdmins = (
    <SectionCard>
      <EmptyState
        icon={Users}
        title={controls.total ? "No admins match your filters" : "No admins yet"}
        description={
          controls.total
            ? "Clear the search box or reset the role and status filters."
            : "Create the first administrator to give someone access to this console."
        }
      />
    </SectionCard>
  );

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto w-full max-w-7xl px-6 py-7">
        <PageHeader
          icon={Shield}
          title="Admin Management"
          description="Manage administrator access and permissions."
          actions={
            <>
              <Link
                href="/admin-management/audit"
                className="alt-ui-button alt-ui-button--secondary alt-ui-button--md"
              >
                Full Audit Log
              </Link>
              {activeTab === "Admins" && (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => fetchAdmins(true)}
                    disabled={refreshing}
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${refreshing ? "animate-spin motion-reduce:animate-none" : ""}`}
                      aria-hidden="true"
                    />
                    Refresh
                  </Button>
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Create Admin
                  </Button>
                </>
              )}
            </>
          }
        >
          <Tabs
            items={tabItems}
            value={activeTab}
            onChange={setActiveTab}
            ariaLabel="Admin management views"
          />
        </PageHeader>

        <div role="tabpanel" aria-label={activeTab} className="space-y-5">
          {/* ── Admins Tab ── */}
          {activeTab === "Admins" && (
            <>
              {/* KPIs — suppressed while the directory failed to load, so a broken
                  read is never presented as a healthy "0 admins" platform. */}
              {loading ? (
                <LoadingState variant="stats" />
              ) : loadError ? null : (
                <StatGrid
                  columns={4}
                  items={[
                    { label: "Total Admins", value: admins.length },
                    { label: "Active", value: totalActive, tone: "success" },
                    {
                      label: "Inactive",
                      value: totalInactive,
                      tone: totalInactive > 0 ? "danger" : "default",
                    },
                    { label: "Super Admins", value: totalSuper },
                  ]}
                />
              )}

              <FilterBar
                search={controls.search}
                onSearchChange={controls.onSearchChange}
                searchPlaceholder="Search by name or email…"
                filters={[
                  {
                    key: "role",
                    label: "Filter by role",
                    value: controls.filterValues.role ?? "all",
                    onChange: (value) => controls.setFilter("role", value),
                    options: ROLE_OPTIONS,
                  },
                  {
                    key: "status",
                    label: "Filter by status",
                    value: controls.filterValues.status ?? "all",
                    onChange: (value) => controls.setFilter("status", value),
                    options: STATUS_OPTIONS,
                  },
                ]}
                count={`${controls.matched} of ${controls.total} admins`}
                actions={
                  visibleAdmins.length ? (
                    <Button variant="ghost" size="sm" onClick={() => exportCsv(visibleAdmins)}>
                      <Download className="h-3.5 w-3.5" aria-hidden="true" />
                      Export CSV
                    </Button>
                  ) : null
                }
              />

              <BulkActionsBar count={selectedIds.size} onClear={() => setSelectedIds(new Set())} noun="admin">
                <Button variant="secondary" size="sm" onClick={() => bulkSetActive(true)} disabled={bulkBusy}>
                  {bulkBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : null}
                  Activate
                </Button>
                <Button variant="secondary" size="sm" onClick={() => bulkSetActive(false)} disabled={bulkBusy}>
                  {bulkBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : null}
                  Deactivate
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => exportCsv(admins.filter((a) => selectedIds.has(a.id)))}
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  Export selected
                </Button>
              </BulkActionsBar>

              <DataTable
                caption="Administrators"
                columns={columns}
                rows={visibleAdmins}
                getRowKey={(admin) => admin.id}
                selectable
                selectedKeys={selectedIds}
                onSelectionChange={setSelectedIds}
                sort={controls.sort}
                onSortChange={controls.setSort}
                loading={loading}
                error={loadError}
                onRetry={retryAdmins}
                onRowClick={(admin) => setSelectedAdmin(admin)}
                rowActions={renderRowActions}
                empty={emptyAdmins}
              />
            </>
          )}

          {/* ── All Admins Tab ── */}
          {activeTab === "All Admins" && (
            <DataState
              loading={loading}
              error={loadError}
              isEmpty={!admins.length}
              onRetry={retryAdmins}
              loadingVariant="cards"
              rows={8}
              empty={emptyAdmins}
            >
              {/* Unfiltered on purpose — this tab is literally "All Admins" and has
                  no filter controls of its own, so it must not silently inherit the
                  Admins tab's search/role/status filters via `visibleAdmins`. */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {admins.map((admin) => (
                  <AdminCard
                    key={admin.id}
                    admin={admin}
                    currentUid={currentUid}
                    togglingId={togglingId}
                    onEdit={setSelectedAdmin}
                    onToggleStatus={toggleStatus}
                  />
                ))}
              </div>
            </DataState>
          )}

          {/* ── Access Requests Tab ── */}
          {activeTab === "Access Requests" && <AccessRequestsTab />}
        </div>
      </div>

      {selectedAdmin && (
        <EditAdminModal
          admin={selectedAdmin}
          onClose={() => setSelectedAdmin(null)}
          refresh={() => fetchAdmins(true)}
        />
      )}
      {showCreateModal && (
        <CreateAdminModal
          onClose={() => setShowCreateModal(false)}
          refresh={() => fetchAdmins(true)}
        />
      )}
    </div>
  );
}
