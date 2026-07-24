"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { getAuth } from "firebase/auth";
import EditAdminModal from "@/app/(protected)/admin-management/components/EditAdminModal";
import CreateAdminModal from "@/app/(protected)/admin-management/components/CreateAdminModal";
import AccessRequestsTab from "@/app/(protected)/admin-management/components/AccessRequestsTab";
import { emitAlert } from "@/lib/alertBus";
import { readApiJson } from "@/lib/apiClient";
import {
  refreshAdminUsers,
  subscribeToAdminUsers,
} from "@/services/adminUsersService";
import { PROJECTS } from "@/projects";
import AdminCard from "./components/AdminCard";
import {
  Search,
  X,
  RefreshCw,
  Plus,
  Shield,
  ShieldCheck,
  UserCheck,
  UserX,
  Pencil,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import AdminAuditLogPage from "./audit/page";

/* ── Portal Tooltip ── */
function Tooltip({ label, children, direction = "top" }) {
  const [pos, setPos] = useState(null);
  const ref = useRef(null);
  const show = useCallback(() => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos(
      direction === "bottom"
        ? { top: r.bottom + 8, left: r.left + r.width / 2 }
        : { top: r.top - 8, left: r.left + r.width / 2 },
    );
  }, [direction]);
  const hide = useCallback(() => setPos(null), []);
  const tip =
    pos && typeof document !== "undefined"
      ? createPortal(
          <div
            className="pointer-events-none fixed z-[9999] px-2 py-1 rounded-md text-[11px] font-medium whitespace-nowrap bg-[var(--foreground)] text-[var(--background)] shadow-lg"
            style={
              direction === "bottom"
                ? {
                    top: pos.top,
                    left: pos.left,
                    transform: "translateX(-50%)",
                  }
                : {
                    top: pos.top,
                    left: pos.left,
                    transform: "translateX(-50%) translateY(-100%)",
                  }
            }
          >
            {label}
            {direction === "bottom" ? (
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-[var(--foreground)]" />
            ) : (
              <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[var(--foreground)]" />
            )}
          </div>,
          document.body,
        )
      : null;
  return (
    <>
      <div
        ref={ref}
        className="inline-flex"
        onMouseEnter={show}
        onMouseLeave={hide}
      >
        {children}
      </div>
      {tip}
    </>
  );
}

function SortIcon({ sorted }) {
  if (sorted === "asc")
    return <ChevronUp className="w-3.5 h-3.5 text-[var(--primary)]" />;
  if (sorted === "desc")
    return <ChevronDown className="w-3.5 h-3.5 text-[var(--primary)]" />;
  return <ChevronsUpDown className="w-3.5 h-3.5 text-[var(--border-strong)]" />;
}

/* ── Avatar — photo if available, else initials ── */
function AdminAvatar({ admin }) {
  const initials = admin.fullName
    ? admin.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : admin.firstName
      ? `${admin.firstName[0]}${admin.lastName?.[0] ?? ""}`.toUpperCase()
      : (admin.email?.[0]?.toUpperCase() ?? "A");

  if (admin.photoURL) {
    return (
      <img
        src={admin.photoURL}
        alt={initials}
        className="w-8 h-8 rounded-xl object-cover border border-[var(--border)] shrink-0"
      />
    );
  }
  return (
    <div className="w-8 h-8 rounded-xl bg-[var(--surface-soft)] flex items-center justify-center text-xs font-bold text-[var(--muted)] shrink-0">
      {initials}
    </div>
  );
}

/* ── Permission summary — reads all projects from registry ── */
function PermissionSummary({ admin }) {
  if (admin.roleType === "superadmin") {
    return (
      <span className="text-xs font-bold text-[var(--success)] bg-[var(--success-soft)] px-2 py-0.5 rounded-full">
        Full Access
      </span>
    );
  }

  const pills = [];
  for (const [projectId, project] of Object.entries(PROJECTS)) {
    const perms = admin.projectAccess?.[projectId]?.permissions ?? {};
    for (const [mod, p] of Object.entries(perms)) {
      if (p?.read || p?.write || p?.delete) {
        const acts = [p.read && "R", p.write && "W", p.delete && "D"].filter(
          Boolean,
        );
        const moduleLabel = project.modules[mod]?.label ?? mod;
        pills.push({
          key: `${projectId}/${mod}`,
          label: moduleLabel,
          projectName: project.name,
          acts,
        });
      }
    }
  }

  // Legacy fallback
  if (!pills.length) {
    for (const [mod, p] of Object.entries(admin.permissions ?? {})) {
      if (p?.read || p?.write || p?.delete) {
        const acts = [p.read && "R", p.write && "W", p.delete && "D"].filter(
          Boolean,
        );
        pills.push({ key: mod, label: mod, projectName: null, acts });
      }
    }
  }

  if (!pills.length)
    return <span className="text-xs text-[var(--muted)]">No access</span>;

  return (
    <div className="flex flex-wrap gap-1 max-w-[260px]">
      {pills.slice(0, 3).map(({ key, label, projectName, acts }) => (
        <span
          key={key}
          className="text-[10px] font-bold bg-[var(--primary-soft)] text-[var(--primary)] px-1.5 py-0.5 rounded capitalize"
        >
          {projectName ? `${projectName} · ${label}` : label}{" "}
          <span className="text-[var(--primary)]/70">{acts.join("/")}</span>
        </span>
      ))}
      {pills.length > 3 && (
        <span className="text-[10px] text-[var(--muted)]">
          +{pills.length - 3} more
        </span>
      )}
    </div>
  );
}

// const TABS = ["Admins", "All Admins", "Access Requests"];
const TABS = ["Admins", "All Admins"];

export default function AdminManagement() {
  const [activeTab, setActiveTab] = useState("Admins");
  const [pendingCount, setPendingCount] = useState(0);

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sorting, setSorting] = useState([]);
  const currentUid = getAuth().currentUser?.uid;

  const fetchPendingCount = useCallback(async () => {
    try {
      const token = await getAuth().currentUser?.getIdToken();
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
    } catch (error) {
      emitAlert({
        type: "error",
        message: error?.message || "Network error while loading admins",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingCount();
    const unsubscribe = subscribeToAdminUsers(
      (adminUsers) => {
        setAdmins(adminUsers);
        setLoading(false);
        setRefreshing(false);
      },
      (error) => {
        setLoading(false);
        setRefreshing(false);
        emitAlert({
          type: "error",
          message: error?.message || "Failed to load admins",
        });
      },
    );

    return unsubscribe;
  }, [fetchPendingCount]);

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
      const user = getAuth().currentUser;
      if (!user) {
        emitAlert({
          type: "error",
          message: "Session expired. Please log in again.",
        });
        return;
      }
      const token = await user.getIdToken(true);
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

  // Search also matches full name
  const filtered = useMemo(
    () =>
      admins.filter((a) => {
        const q = search.toLowerCase();
        const matchSearch =
          !q ||
          a.email.toLowerCase().includes(q) ||
          (a.fullName ?? "").toLowerCase().includes(q) ||
          (a.firstName ?? "").toLowerCase().includes(q) ||
          (a.lastName ?? "").toLowerCase().includes(q);
        const matchRole = roleFilter === "all" || a.roleType === roleFilter;
        const matchStatus =
          statusFilter === "all" ||
          (statusFilter === "active" ? a.isActive : !a.isActive);
        return matchSearch && matchRole && matchStatus;
      }),
    [admins, search, roleFilter, statusFilter],
  );

  const totalActive = admins.filter((a) => a.isActive).length;
  const totalSuper = admins.filter((a) => a.roleType === "superadmin").length;

  const columns = useMemo(
    () => [
      {
        accessorKey: "email",
        header: "Admin",
        size: 260,
        minSize: 180,
        cell: ({ row }) => {
          const admin = row.original;
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
                  {displayName ? (
                    <span className="text-sm font-semibold text-[var(--foreground)] truncate">
                      {displayName}
                    </span>
                  ) : (
                    <span className="text-sm font-semibold text-[var(--foreground)] truncate">
                      {admin.email}
                    </span>
                  )}
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
        accessorKey: "roleType",
        header: "Role",
        size: 140,
        minSize: 100,
        cell: ({ getValue }) => {
          const role = getValue();
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
        id: "permissions",
        header: "Permissions",
        size: 280,
        minSize: 160,
        enableSorting: false,
        cell: ({ row }) => <PermissionSummary admin={row.original} />,
      },
      {
        accessorKey: "isActive",
        header: "Status",
        size: 110,
        minSize: 90,
        cell: ({ getValue }) => {
          const active = getValue();
          return (
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${active ? "bg-[var(--success-soft)] text-[var(--success)]" : "bg-[var(--danger-soft)] text-[var(--danger)]"}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${active ? "bg-[var(--success)]" : "bg-[var(--danger)]"}`}
              />
              {active ? "Active" : "Inactive"}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        size: 110,
        minSize: 110,
        maxSize: 110,
        enableSorting: false,
        cell: ({ row }) => {
          const admin = row.original;
          const isSelf = admin.id === currentUid;
          const busy = togglingId === admin.id;
          return (
            <div
              className="flex items-center gap-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              <Tooltip label="Edit admin">
                <button
                  onClick={() => setSelectedAdmin(admin)}
                  aria-label="Edit admin"
                  className="p-1.5 rounded-md text-[var(--primary)] hover:bg-[var(--primary-soft)] transition"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
              <Tooltip label={admin.isActive ? "Deactivate" : "Activate"}>
                <button
                  onClick={() => toggleStatus(admin)}
                  disabled={isSelf || busy}
                  aria-label={admin.isActive ? "Deactivate admin" : "Activate admin"}
                  className={`p-1.5 rounded-md transition disabled:opacity-30 ${admin.isActive ? "text-[var(--danger)] hover:bg-[var(--danger-soft)]" : "text-[var(--success)] hover:bg-[var(--success-soft)]"}`}
                >
                  {admin.isActive ? (
                    <UserX className="w-3.5 h-3.5" />
                  ) : (
                    <UserCheck className="w-3.5 h-3.5" />
                  )}
                </button>
              </Tooltip>
            </div>
          );
        },
      },
    ],
    [togglingId, currentUid],
  ); // eslint-disable-line

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.id,
  });

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="w-full max-w-7xl mx-auto px-6 py-7 space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[var(--foreground)]">
              Admin Management
            </h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">
              Manage administrator access and permissions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin-management/audit"
              className="flex items-center gap-1.5 px-3 py-2 text-sm border border-[var(--border)] rounded-xl text-[var(--foreground)] bg-[var(--surface)] hover:bg-[var(--surface-soft)] transition"
            >
              Audit Log
            </Link>
            {activeTab === "Admins" && (
              <>
                <button
                  onClick={() => fetchAdmins(true)}
                  disabled={refreshing}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm border border-[var(--border)] rounded-xl text-[var(--muted)] bg-[var(--surface)] hover:bg-[var(--surface-soft)] transition disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] font-semibold rounded-xl transition shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Create Admin
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-[var(--border)]">
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition ${
                  isActive
                    ? "border-[var(--primary)] text-[var(--foreground)]"
                    : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {tab}
                {tab === "Access Requests" && pendingCount > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--warning)] text-white text-[10px] font-bold flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Admins Tab ── */}
        {activeTab === "Admins" && (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: "Total Admins",
                  value: admins.length,
                  color: "text-[var(--foreground)]",
                },
                {
                  label: "Active",
                  value: totalActive,
                  color: "text-[var(--success)]",
                },
                {
                  label: "Inactive",
                  value: admins.length - totalActive,
                  color:
                    admins.length - totalActive > 0
                      ? "text-[var(--danger)]"
                      : "text-[var(--foreground)]",
                },
                {
                  label: "Super Admins",
                  value: totalSuper,
                  color: "text-[var(--foreground)]",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-sm px-4 py-3.5"
                >
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <p
                    className={`text-2xl font-bold tabular-nums mt-1 ${stat.color}`}
                  >
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-sm px-4 py-3 flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted)] pointer-events-none" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or email…"
                  autoComplete="off"
                  className="w-full pl-8 pr-8 py-1.5 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] placeholder:text-[var(--muted)] transition"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {[
                {
                  value: roleFilter,
                  setter: setRoleFilter,
                  options: [
                    ["all", "All Roles"],
                    ["admin", "Admin"],
                    ["superadmin", "Super Admin"],
                  ],
                },
                {
                  value: statusFilter,
                  setter: setStatusFilter,
                  options: [
                    ["all", "All Status"],
                    ["active", "Active"],
                    ["inactive", "Inactive"],
                  ],
                },
              ].map((sel, i) => (
                <select
                  key={i}
                  value={sel.value}
                  onChange={(e) => sel.setter(e.target.value)}
                  className="text-sm border border-[var(--border)] rounded-lg px-3 py-1.5 bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] cursor-pointer transition min-w-[140px]"
                >
                  {sel.options.map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              ))}
              <span className="ml-auto text-xs text-[var(--muted)] whitespace-nowrap">
                {filtered.length} of {admins.length} admins
              </span>
            </div>

            {/* Table */}
            <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-16 gap-3 text-[var(--muted)]">
                  <div className="w-6 h-6 border-2 border-[var(--border)] border-t-[var(--primary)] rounded-full animate-spin" />
                  <span className="text-sm">Loading admins…</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="text-sm w-full">
                    <thead>
                      {table.getHeaderGroups().map((hg) => (
                        <tr
                          key={hg.id}
                          className="bg-[var(--surface-soft)] border-b border-[var(--border)]"
                        >
                          {hg.headers.map((header) => (
                            <th
                              key={header.id}
                              style={{ width: header.getSize() }}
                              className="px-4 py-3 text-left text-xs font-bold text-[var(--muted)] uppercase tracking-wider select-none"
                            >
                              <div
                                className={`flex items-center gap-1 ${header.column.getCanSort() ? "cursor-pointer hover:text-[var(--foreground)]" : ""}`}
                                onClick={header.column.getToggleSortingHandler()}
                              >
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                                {header.column.getCanSort() && (
                                  <SortIcon
                                    sorted={header.column.getIsSorted()}
                                  />
                                )}
                              </div>
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {table.getRowModel().rows.length === 0 ? (
                        <tr>
                          <td
                            colSpan={columns.length}
                            className="py-16 text-center text-[var(--muted)] text-sm"
                          >
                            No admins match your filters.
                          </td>
                        </tr>
                      ) : (
                        table.getRowModel().rows.map((row) => (
                          <tr
                            key={row.id}
                            onClick={() => setSelectedAdmin(row.original)}
                            className="hover:bg-[var(--surface-soft)] cursor-pointer transition-colors"
                          >
                            {row.getVisibleCells().map((cell) => (
                              <td
                                key={cell.id}
                                className="px-4 py-3 align-middle"
                              >
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext(),
                                )}
                              </td>
                            ))}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
        {/* ── All Admins Tab ── */}
        {activeTab === "All Admins" && (
          <>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-sm h-52 animate-pulse"
                  />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-sm py-16 text-center text-[var(--muted)] text-sm">
                No admins match your filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((admin) => (
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
            )}
          </>
        )}
        {/* ── Access Requests Tab ── */}
        {activeTab === "Access Requests" && <AccessRequestsTab />}
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
