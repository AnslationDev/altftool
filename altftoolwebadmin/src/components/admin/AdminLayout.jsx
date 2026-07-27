"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import { hasModuleAccess, SUPERADMIN_ONLY_GLOBAL_MODULES } from "@/lib/permissionUtils";
import { getProject } from "@/projects";
import { OPEN_GLOBAL_ROUTE_KEYS, resolveProjectModule } from "@/config/adminRoutes";
import { auth } from "@/lib/firebaseAuth";
import { emitAlert } from "@/lib/alertBus";
import { usePushNotifications } from "@/lib/usePushNotifications";
import { LockKeyhole, RefreshCw, ShieldAlert } from "lucide-react";

// Local-development escape hatch only. The NODE_ENV guard matches the other
// bypasses in this app (localAdminSession.js, adminAccess.js) and is evaluated
// at build time, so a production bundle can never ship with the gates disabled
// even if NEXT_PUBLIC_DEV_BYPASS_AUTH is set in the deploy environment.
const DEV_BYPASS_AUTH =
  process.env.NODE_ENV !== "production" &&
  process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === "true";

function AdminGuardState({ title, detail }) {
  return (
    <main
      className="flex h-screen items-center justify-center bg-[var(--background)] px-4"
      aria-busy="true"
    >
      <div
        className="flex w-full max-w-sm flex-col items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 text-center text-[var(--muted)] shadow-sm"
        role="status"
      >
        <RefreshCw className="h-8 w-8 animate-spin text-[var(--primary)] motion-reduce:animate-none" />
        <span className="text-sm font-medium">{title}</span>
        <span className="text-xs leading-5 text-[var(--muted)]">{detail}</span>
      </div>
    </main>
  );
}

/**
 * Terminal state for "signed in, but we could not resolve an admin profile".
 * Deliberately self-contained: the sidebar and header both require `adminData`,
 * so this screen has to carry its own escape hatches.
 */
function AdminProfileUnavailable({ onRetry, onSignOut, stalled }) {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await onRetry?.();
    } finally {
      setRetrying(false);
    }
  };

  return (
    <main className="flex h-screen items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-sm">
        <ShieldAlert className="mx-auto mb-4 h-9 w-9 text-[var(--warning)]" />
        <h1 className="text-lg font-semibold text-[var(--foreground)]">
          We couldn’t load your permissions
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          {stalled
            ? "You’re still signed in, but your admin profile couldn’t be fetched. Until it loads, this console stays locked."
            : "Your admin profile isn’t available yet. Retry, or sign out and sign back in."}
        </p>
        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleRetry}
            disabled={retrying}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition hover:bg-[var(--primary-hover)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${retrying ? "animate-spin motion-reduce:animate-none" : ""}`} />
            {retrying ? "Retrying…" : "Try again"}
          </button>
          <button
            type="button"
            onClick={onSignOut}
            disabled={retrying}
            className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-soft)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] disabled:opacity-60"
          >
            Sign out
          </button>
        </div>
      </div>
    </main>
  );
}

export default function AdminLayout({ children }) {
  const {
    user,
    adminData,
    loading,
    isSuperAdmin,
    isPendingUser,
    isDenied,
    isInactive,
    syncFailed,
    refreshAuth,
    logout,
  } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [requestingAccess, setRequestingAccess] = useState(false);
  const [accessRequested, setAccessRequested] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  usePushNotifications(user);

  useEffect(() => {
    setHydrated(true);
  }, []);

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
      // Only redirect to /login when there is genuinely no session. If Firebase
      // still has a current user, the admin profile is mid-sync (or recovering
      // from a transient error) — wait instead of bouncing an active/authenticated
      // admin to the login page.
      if (auth.currentUser) return;
      router.replace("/login");
      return;
    }

    if (isPendingUser) {
      router.replace("/access-requested");
      return;
    }

    if (isInactive) {
      router.replace("/account-inactive");
      return;
    }
  }, [user, adminData, loading, isPendingUser, isInactive, isDenied, router]);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileSidebarOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setMobileSidebarOpen(false);
      }
    };

    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileSidebarOpen]);

  /* ── Loading ── */
  if (!DEV_BYPASS_AUTH && loading) {
    return (
      <AdminGuardState
        title="Loading dashboard"
        detail="Checking your admin session and module permissions."
      />
    );
  }

  if (!DEV_BYPASS_AUTH && !user) {
    return (
      <AdminGuardState
        title="Opening sign in"
        detail="No active admin session was found. Redirecting securely."
      />
    );
  }
  if (!DEV_BYPASS_AUTH && isPendingUser) {
    return (
      <AdminGuardState
        title="Opening access status"
        detail="Your admin access request is still pending."
      />
    );
  }
  if (!DEV_BYPASS_AUTH && isDenied) {
    return (
      <AdminGuardState
        title="Opening access notice"
        detail="This account does not currently have admin access."
      />
    );
  }
  if (!DEV_BYPASS_AUTH && isInactive) {
    return (
      <AdminGuardState
        title="Opening account status"
        detail="Your account access has been paused."
      />
    );
  }

  // A signed-in session with no resolved profile must NOT fall through to the
  // permission guard below: `hasAccess` starts as `true` and is only narrowed
  // inside `if (adminData && ...)`, so a failed profile fetch previously
  // rendered every protected route with no RBAC check at all — and, because the
  // sidebar and header are both gated on `adminData`, with no navigation and no
  // way to sign out. Default-deny and give the operator a way forward instead.
  if (!DEV_BYPASS_AUTH && !adminData) {
    return (
      <AdminProfileUnavailable
        onRetry={refreshAuth}
        onSignOut={logout}
        stalled={syncFailed}
      />
    );
  }

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
      const token = await auth.currentUser?.getIdToken();
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
      <div
        className="flex h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]"
        data-admin-hydrated={hydrated ? "true" : "false"}
      >
        {adminData ? (
          <>
            <div
              className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity lg:hidden ${
                mobileSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
              onClick={() => setMobileSidebarOpen(false)}
            />
            <AdminSidebar
              adminData={adminData}
              mobileOpen={mobileSidebarOpen}
              onCloseMobile={() => setMobileSidebarOpen(false)}
            />
          </>
        ) : null}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {adminData ? (
            <AdminHeader
              user={effectiveUser}
              adminData={adminData}
              onOpenSidebar={() => setMobileSidebarOpen(true)}
            />
          ) : null}
          <main className="flex flex-1 items-center justify-center overflow-y-auto px-4">
            <div className="max-w-md space-y-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-[var(--danger-soft)] text-[var(--danger)]">
                <LockKeyhole className="h-6 w-6" />
              </div>

              <p className="text-base font-bold text-[var(--foreground)]">Access denied</p>

              <p className="text-sm leading-6 text-[var(--muted)]">
                You do not have permission to view this section. Send a module access request and keep working elsewhere.
              </p>

              <div className="flex flex-col items-center justify-center gap-2 pt-1 sm:flex-row">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
                >
                  Go Back
                </button>

                {!accessRequested ? (
                  <button
                    type="button"
                    onClick={handleRequestAccess}
                    disabled={requestingAccess}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] shadow-[var(--shadow-sm)] transition hover:bg-[var(--anslation-ds-primary-hover,var(--primary))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary)_35%,transparent)] disabled:opacity-60"
                  >
                    <ShieldAlert className="h-4 w-4" />
                    {requestingAccess ? "Requesting…" : "Request Access"}
                  </button>
                ) : (
                  <span className="inline-flex h-10 items-center rounded-lg border border-[color-mix(in_srgb,var(--success)_35%,var(--border))] bg-[var(--success-soft)] px-4 text-sm font-medium text-[var(--success)]">
                    Request submitted
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
    <div
      className="flex h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]"
      data-admin-hydrated={hydrated ? "true" : "false"}
    >
      {adminData ? (
        <>
          <div
            className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity lg:hidden ${
              mobileSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            onClick={() => setMobileSidebarOpen(false)}
          />
          <AdminSidebar
            adminData={adminData}
            mobileOpen={mobileSidebarOpen}
            onCloseMobile={() => setMobileSidebarOpen(false)}
          />
        </>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {adminData ? (
          <AdminHeader
            user={effectiveUser}
            adminData={adminData}
            onOpenSidebar={() => setMobileSidebarOpen(true)}
          />
        ) : null}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
