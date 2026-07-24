"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import {
  Activity,
  Database,
  FileKey2,
  GitBranch,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  UserCog,
  UsersRound,
} from "lucide-react";
import { getAuth } from "firebase/auth";
import { db } from "@/lib/firebaseFirestore";
import { emitAlert } from "@/lib/alertBus";
import { PROJECTS } from "@/projects";
import { RBAC_PATHS, getRbacRootLabel } from "@/lib/rbacPaths";

function subscribeCollection(path, setter, setReady) {
  return onSnapshot(
    collection(db, ...path),
    (snapshot) => {
      setter(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
      setReady(true);
    },
    () => setReady(true),
  );
}

export default function RbacFoundationPage() {
  const [admins, setAdmins] = useState([]);
  const [roles, setRoles] = useState([]);
  const [requests, setRequests] = useState([]);
  const [securityEvents, setSecurityEvents] = useState([]);
  const [ready, setReady] = useState({ admins: false, roles: false, requests: false, security: false });
  const [bootstrapping, setBootstrapping] = useState(false);

  useEffect(() => {
    const unsubs = [
      subscribeCollection(RBAC_PATHS.adminUsers, setAdmins, (value) => setReady((prev) => ({ ...prev, admins: value }))),
      subscribeCollection(RBAC_PATHS.adminRoles, setRoles, (value) => setReady((prev) => ({ ...prev, roles: value }))),
      subscribeCollection(RBAC_PATHS.accessRequests, setRequests, (value) => setReady((prev) => ({ ...prev, requests: value }))),
      subscribeCollection(RBAC_PATHS.securityEvents, setSecurityEvents, (value) => setReady((prev) => ({ ...prev, security: value }))),
    ];
    return () => unsubs.forEach((unsub) => unsub());
  }, []);

  const loading = !Object.values(ready).every(Boolean);
  const stats = useMemo(() => ({
    admins: admins.length,
    activeAdmins: admins.filter((item) => (item.status || "active") === "active").length,
    roles: roles.length,
    pendingRequests: requests.filter((item) => item.status === "pending").length,
    securityEvents: securityEvents.length,
    projects: Object.keys(PROJECTS).length,
  }), [admins, requests, roles, securityEvents]);

  async function bootstrapRbac() {
    setBootstrapping(true);
    try {
      const token = await getAuth().currentUser?.getIdToken(true);
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
    <div className="min-h-screen bg-[var(--background)] p-6 text-[var(--foreground)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <div className="relative bg-[linear-gradient(120deg,#09090b,#172554_48%,#0f766e)] p-6 text-white">
            <div className="pointer-events-none absolute inset-0 opacity-10 [background-image:linear-gradient(rgba(255,255,255,.28)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.28)_1px,transparent_1px)] [background-size:68px_68px]" />
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-emerald-200">Super Admin Console</p>
                <h1 className="mt-2 text-2xl font-black">RBAC Foundation</h1>
                <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-white/75">
                  Central permission layer for project access, module access, route protection, security events, and audit-ready admin control.
                </p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4">
                <p className="text-xs font-bold uppercase tracking-widest text-white/60">Firebase Root</p>
                <p className="mt-1 font-mono text-sm font-black">{getRbacRootLabel()}</p>
              </div>
              <button
                type="button"
                onClick={bootstrapRbac}
                disabled={bootstrapping}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-slate-950 shadow-sm transition hover:bg-emerald-50 disabled:opacity-60"
              >
                {bootstrapping ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                Initialize RBAC
              </button>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="grid min-h-[180px] place-items-center rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
            <Loader2 className="h-7 w-7 animate-spin text-[var(--primary)]" />
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <Metric label="Admin Users" value={stats.admins} icon={UsersRound} />
          <Metric label="Active Admins" value={stats.activeAdmins} icon={ShieldCheck} />
          <Metric label="Roles" value={stats.roles} icon={UserCog} />
          <Metric label="Pending Access" value={stats.pendingRequests} icon={FileKey2} />
          <Metric label="Security Events" value={stats.securityEvents} icon={LockKeyhole} />
          <Metric label="Projects" value={stats.projects} icon={GitBranch} />
        </div>

        <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--surface-soft)] text-[var(--primary)]">
                <Database className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-black">Firestore Structure</h2>
                <p className="text-sm text-[var(--muted)]">New paths added without changing project content data.</p>
              </div>
            </div>
            <div className="mt-5 space-y-2">
              {[
                "super_admin_dashboard/main/admin_users/{uid}",
                "super_admin_dashboard/main/admin_users/{uid}/project_access/{projectId}",
                "super_admin_dashboard/main/admin_users/{uid}/project_access/{projectId}/modules/{moduleId}",
                "super_admin_dashboard/main/admin_roles/{roleId}",
                "super_admin_dashboard/main/admin_audit_logs/{logId}",
                "super_admin_dashboard/main/admin_sessions/{sessionId}",
                "super_admin_dashboard/main/admin_security_events/{eventId}",
                "super_admin_dashboard/main/admin_access_requests/{requestId}",
                "super_admin_dashboard/main/admin_settings/main",
              ].map((path) => (
                <div key={path} className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 font-mono text-xs text-[var(--foreground)]">
                  {path}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--surface-soft)] text-[var(--primary)]">
                <Activity className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-black">Implementation Status</h2>
                <p className="text-sm text-[var(--muted)]">Stable foundation completed first, advanced features can build on top.</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              {[
                ["New RBAC Firestore paths", "Ready"],
                ["Login profile resolver with legacy fallback", "Ready"],
                ["Project/module/action permission checks", "Ready"],
                ["Sidebar project filtering", "Ready"],
                ["Route protection via AdminLayout", "Ready"],
                ["Audit/security event helpers", "Ready"],
                ["Full role editor UI", "Next phase"],
                ["Firestore rules deployment", "Next phase"],
              ].map(([label, status]) => (
                <div key={label} className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] px-3 py-3">
                  <span className="text-sm font-semibold">{label}</span>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${
                    status === "Ready" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                  }`}>
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">{label}</p>
          <p className="mt-2 text-2xl font-black">{value}</p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--surface-soft)] text-[var(--primary)]">
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}
