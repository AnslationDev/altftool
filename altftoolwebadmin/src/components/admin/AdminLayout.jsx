"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import { hasModuleAccess, SUPERADMIN_ONLY_GLOBAL_MODULES } from "@/lib/permissionUtils";
import { getProject } from "@/projects";
import { OPEN_GLOBAL_ROUTE_KEYS, resolveProjectModule } from "@/config/adminRoutes";
import { getAuth } from "firebase/auth";
import { emitAlert } from "@/lib/alertBus";
import { usePushNotifications } from "@/lib/usePushNotifications";

const DEV_BYPASS_AUTH = process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === "true";

export default function AdminLayout({ children }) {
  const { user, adminData, loading, isSuperAdmin, isPendingUser, isDenied } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [requestingAccess, setRequestingAccess] = useState(false);
  const [accessRequested, setAccessRequested] = useState(false);
  usePushNotifications(user);

  // 🔹 Extract project + module from URL
  const parts = pathname.split("/").filter(Boolean);

  let projectId = null;
  let moduleKey = null;
  let project = null;

  const maybeProject = getProject(parts[0]);

  if (maybeProject) {
    const resolvedModule = resolveProjectModule(parts[0], parts[1]);
    projectId = parts[0];
    moduleKey = resolvedModule?.moduleKey || parts[1];
    project = maybeProject;
  } else {
    moduleKey = parts[0];
  }

  /* ── Auth guard ── */
  useEffect(() => {
    if (DEV_BYPASS_AUTH) return;
    if (loading) return;

    if (isDenied) {
      router.replace("/access-denied");
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    if (isPendingUser) {
      router.replace("/access-requested");
      return;
    }
  }, [user, adminData, loading, isPendingUser, isDenied, router]);

  /* ── Loading ── */
  if (!DEV_BYPASS_AUTH && loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="flex flex-col items-center gap-3 text-[var(--muted)]">
          <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[var(--foreground)] rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading dashboard…</span>
        </div>
      </div>
    );
  }

  if (!DEV_BYPASS_AUTH && !user) return null;
  if (!DEV_BYPASS_AUTH && isPendingUser) return null;
  if (!DEV_BYPASS_AUTH && isDenied) return null;

  const effectiveUser = DEV_BYPASS_AUTH ? { email: "dev@local" } : user;

  /* ── Permission guard ── */
  let hasAccess = true;

  const isProjectRoute = projectId && moduleKey && project;
  const isGlobalRoute = !projectId && moduleKey;
  // Profile and other open routes skip permission check
  const isOpenGlobalRoute = isGlobalRoute && OPEN_GLOBAL_ROUTE_KEYS.has(moduleKey);

  if (!DEV_BYPASS_AUTH && adminData && !isSuperAdmin && !isOpenGlobalRoute) {
    if (isProjectRoute) {
      hasAccess = hasModuleAccess({ adminData, projectId, moduleKey, action: "read" });
    } else if (isGlobalRoute) {
      hasAccess = SUPERADMIN_ONLY_GLOBAL_MODULES.has(moduleKey)
        ? false
        : adminData.permissions?.[moduleKey]?.read === true;
    }
  }

  /* ── Request Access handler ── */
  const handleRequestAccess = async () => {
    if (requestingAccess || accessRequested) return;
    setRequestingAccess(true);
    try {
      const token = await getAuth().currentUser?.getIdToken();
      if (!token) return;

      const body = { type: "module" };
      if (projectId) {
        body.projectId = projectId;
        body.moduleKey = moduleKey;
      } else {
        body.projectId = "__global__";
        body.moduleKey = moduleKey;
      }

      const res = await fetch("/api/admin/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      if (res.status === 409) {
        emitAlert({ type: "info", message: "You already have a pending request for this module." });
        setAccessRequested(true);
        return;
      }

      if (!res.ok) {
        emitAlert({ type: "error", message: "Failed to submit access request." });
        return;
      }

      emitAlert({ type: "success", message: "Access request submitted! A super admin will review it shortly." });
      setAccessRequested(true);
    } catch {
      emitAlert({ type: "error", message: "Network error. Please try again." });
    } finally {
      setRequestingAccess(false);
    }
  };

  if (!hasAccess) {
    return (
      <div className="flex h-screen bg-[var(--background)] overflow-hidden">
        {adminData && <AdminSidebar adminData={adminData} />}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {adminData && <AdminHeader user={effectiveUser} adminData={adminData} />}
          <main className="flex-1 overflow-y-auto flex items-center justify-center">
            <div className="text-center space-y-4 max-w-sm px-4">
              <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto">
                <span className="text-2xl">🔒</span>
              </div>

              <p className="text-base font-bold text-gray-800">Access Denied</p>

              <p className="text-sm text-gray-500">
                You don't have permission to view this section.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
                <button
                  onClick={() => router.back()}
                  className="px-4 py-2 text-sm font-medium border border-gray-200 text-gray-600 rounded-lg hover:bg-white transition"
                >
                  Go Back
                </button>

                {!accessRequested ? (
                  <button
                    onClick={handleRequestAccess}
                    disabled={requestingAccess}
                    className="px-4 py-2 text-sm font-semibold bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-60"
                  >
                    {requestingAccess ? "Requesting…" : "Request Access"}
                  </button>
                ) : (
                  <span className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg">
                    ✓ Request Submitted
                  </span>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden">
      {adminData && <AdminSidebar adminData={adminData} />}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {adminData && <AdminHeader user={effectiveUser} adminData={adminData} />}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
