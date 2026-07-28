"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import {
  Activity,
  Database,
  FileKey2,
  GitBranch,
  LockKeyhole,
  ShieldCheck,
  UserCog,
  UsersRound,
} from "lucide-react";
import { Button } from "@altftool/ui";
import { DataState, ErrorState, PageHeader, SectionCard, StatGrid } from "@/ansets";
import { db } from "@/lib/firebaseFirestore";
import { emitAlert } from "@/lib/alertBus";
import { getAdminIdToken } from "@/lib/adminIdToken";
import { PROJECTS } from "@/projects";
import { RBAC_PATHS, getRbacRootLabel } from "@/lib/rbacPaths";

const SOURCE_LABELS = {
  admins: "Admin Users",
  roles: "Roles",
  requests: "Access Requests",
  security: "Security Events",
};

const FIRESTORE_PATHS = [
  "super_admin_dashboard/main/admin_users/{uid}",
  "super_admin_dashboard/main/admin_users/{uid}/project_access/{projectId}",
  "super_admin_dashboard/main/admin_users/{uid}/project_access/{projectId}/modules/{moduleId}",
  "super_admin_dashboard/main/admin_roles/{roleId}",
  "super_admin_dashboard/main/admin_audit_logs/{logId}",
  "super_admin_dashboard/main/admin_sessions/{sessionId}",
  "super_admin_dashboard/main/admin_security_events/{eventId}",
  "super_admin_dashboard/main/admin_access_requests/{requestId}",
  "super_admin_dashboard/main/admin_settings/main",
];

// Raw Firestore collection paths are internal schema detail, not something an
// operator acts on. Gate them the same way AdminLayout.jsx gates its dev
// bypass so this admin screen doesn't read as an engineering status page.
const SHOW_FIRESTORE_PATHS = process.env.NODE_ENV !== "production";

const IMPLEMENTATION_STATUS = [
  ["New RBAC Firestore paths", "Ready"],
  ["Login profile resolver with legacy fallback", "Ready"],
  ["Project/module/action permission checks", "Ready"],
  ["Sidebar project filtering", "Ready"],
  ["Route protection via AdminLayout", "Ready"],
  ["Audit/security event helpers", "Ready"],
  ["Full role editor UI", "Next phase"],
  ["Firestore rules deployment", "Next phase"],
];

function subscribeCollection(path, setter, setReady, onError) {
  return onSnapshot(
    collection(db, ...path),
    (snapshot) => {
      setter(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
      setReady(true);
    },
    (error) => {
      // Swallowing this reported a permission failure to the operator as a
      // legitimate zero count. Surface it instead, then release the loader.
      console.error(`RBAC subscription failed: ${path.join("/")}`, error);
      onError?.(error);
      setReady(true);
    },
  );
}

export default function RbacFoundationPage() {
  const [admins, setAdmins] = useState([]);
  const [roles, setRoles] = useState([]);
  const [requests, setRequests] = useState([]);
  const [securityEvents, setSecurityEvents] = useState([]);
  const [ready, setReady] = useState({ admins: false, roles: false, requests: false, security: false });
  const [errors, setErrors] = useState({ admins: null, roles: null, requests: null, security: null });
  const [reloadKey, setReloadKey] = useState(0);
  const [bootstrapping, setBootstrapping] = useState(false);

  useEffect(() => {
    setReady({ admins: false, roles: false, requests: false, security: false });
    setErrors({ admins: null, roles: null, requests: null, security: null });

    const markReady = (key) => (value) => setReady((prev) => ({ ...prev, [key]: value }));
    const markError = (key) => (error) =>
      setErrors((prev) => ({ ...prev, [key]: error?.code || error?.message || "unknown-error" }));

    const unsubs = [
      subscribeCollection(RBAC_PATHS.adminUsers, setAdmins, markReady("admins"), markError("admins")),
      subscribeCollection(RBAC_PATHS.adminRoles, setRoles, markReady("roles"), markError("roles")),
      subscribeCollection(RBAC_PATHS.accessRequests, setRequests, markReady("requests"), markError("requests")),
      subscribeCollection(RBAC_PATHS.securityEvents, setSecurityEvents, markReady("security"), markError("security")),
    ];
    return () => unsubs.forEach((unsub) => unsub());
  }, [reloadKey]);

  const loading = !Object.values(ready).every(Boolean);
  const failedSources = useMemo(
    () => Object.entries(errors).filter(([, value]) => value).map(([key]) => SOURCE_LABELS[key]),
    [errors],
  );
  const stats = useMemo(() => ({
    admins: admins.length,
    activeAdmins: admins.filter((item) => (item.status || "active") === "active").length,
    roles: roles.length,
    pendingRequests: requests.filter((item) => item.status === "pending").length,
    securityEvents: securityEvents.length,
    projects: Object.keys(PROJECTS).length,
  }), [admins, requests, roles, securityEvents]);

  // A source that failed must never render as a zero — it renders as "—" with an
  // explicit "Unavailable" hint, and the banner above says which sources fell over.
  const metric = (label, value, icon, failed = false) => ({
    label,
    value: failed ? "—" : value,
    hint: failed ? "Unavailable" : undefined,
    icon,
  });

  const statItems = [
    metric("Admin Users", stats.admins, UsersRound, !!errors.admins),
    metric("Active Admins", stats.activeAdmins, ShieldCheck, !!errors.admins),
    metric("Roles", stats.roles, UserCog, !!errors.roles),
    metric("Pending Access", stats.pendingRequests, FileKey2, !!errors.requests),
    metric("Security Events", stats.securityEvents, LockKeyhole, !!errors.security),
    metric("Projects", stats.projects, GitBranch),
  ];

  async function bootstrapRbac() {
    setBootstrapping(true);
    try {
      const token = await getAdminIdToken(true);
      if (!token) throw new Error("Session expired. Please sign in again.");
      const response = await fetch("/api/rbac/bootstrap", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || "Bootstrap failed.");
      emitAlert({ type: "success", message: "RBAC foundation initialized." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Bootstrap failed." });
    } finally {
      setBootstrapping(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader
        eyebrow="Super Admin Console"
        icon={ShieldCheck}
        title="RBAC Foundation"
        description="Central permission layer for project access, module access, route protection, security events, and audit-ready admin control."
        actions={
          <>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Firebase Root
              </p>
              <p className="mt-0.5 font-mono text-sm text-[var(--foreground)]">
                {getRbacRootLabel()}
              </p>
            </div>
            <Button
              onClick={bootstrapRbac}
              loading={bootstrapping}
              loadingLabel="Initializing RBAC"
            >
              {bootstrapping ? null : <ShieldCheck className="h-4 w-4" aria-hidden="true" />}
              Initialize RBAC
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-5">
        <DataState loading={loading} loadingVariant="stats">
          <div className="flex flex-col gap-5">
            {/* Partial failure: the banner names the broken sources and the tiles
                below still show whatever did load, so this is not a DataState
                error branch — both have to render together. */}
            {failedSources.length ? (
              <ErrorState
                title="Some RBAC data could not be loaded"
                message={`Firestore rejected the live subscription for ${failedSources.join(", ")}. The affected counters show “—” instead of a misleading zero.`}
                onRetry={() => setReloadKey((key) => key + 1)}
              />
            ) : null}

            <StatGrid items={statItems} columns={3} />
          </div>
        </DataState>

        <div className={`grid gap-5 ${SHOW_FIRESTORE_PATHS ? "xl:grid-cols-[0.95fr_1.05fr]" : ""}`}>
          {SHOW_FIRESTORE_PATHS ? (
            <SectionCard
              title={
                <span className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
                  Firestore Structure
                </span>
              }
              description="New paths added without changing project content data."
            >
              <ul className="space-y-2">
                {FIRESTORE_PATHS.map((path) => (
                  <li
                    key={path}
                    className="rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 font-mono text-xs text-[var(--foreground)]"
                  >
                    {path}
                  </li>
                ))}
              </ul>
            </SectionCard>
          ) : null}

          <SectionCard
            title={
              <span className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
                Implementation Status
              </span>
            }
            description="Stable foundation completed first, advanced features can build on top."
          >
            <ul className="grid gap-3">
              {IMPLEMENTATION_STATUS.map(([label, status]) => (
                <li
                  key={label}
                  className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] px-3 py-3"
                >
                  <span className="text-sm font-medium text-[var(--foreground)]">{label}</span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                      status === "Ready"
                        ? "bg-[var(--success-soft)] text-[var(--success)]"
                        : "bg-[var(--warning-soft)] text-[var(--warning)]"
                    }`}
                  >
                    {status}
                  </span>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
