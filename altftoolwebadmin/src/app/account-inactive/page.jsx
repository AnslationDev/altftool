"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LogOut, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getFirstAllowedRoute } from "@/lib/permissionUtils";
import { auth } from "@/lib/firebaseAuth";
import { hasLocalAdminSession } from "@/lib/localAdminSession";

const POLL_INTERVAL_MS = 10000;

/**
 * Shown to a signed-in admin whose account was deactivated by a super admin —
 * distinct from /access-denied (a brand-new signup request that was
 * rejected). The session stays alive (AuthContext keeps `isInactive` users
 * signed in rather than force-signing-out) so this screen can explain what
 * happened and keep polling for reactivation, instead of a silent kick back
 * to the login form with nothing but a toast to show for it.
 */
export default function AccountInactivePage() {
  const router = useRouter();
  const {
    user,
    adminData,
    isDenied,
    isPendingUser,
    isInactive,
    loading,
    syncFailed,
    refreshAuth,
    logout,
  } = useAuth();
  const intervalRef = useRef(null);
  const [checking, setChecking] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [retryNotice, setRetryNotice] = useState("");
  const hasRedirectedRef = useRef(false);

  /* ── Context-driven redirect (single source of truth) ── */
  useEffect(() => {
    if (loading) return;
    if (hasRedirectedRef.current) return;

    if (adminData) {
      // Reactivated — go straight into the console.
      hasRedirectedRef.current = true;
      clearInterval(intervalRef.current);
      const destination = getFirstAllowedRoute(adminData);
      router.replace(destination ?? "/profile");
      return;
    }

    if (isDenied) {
      hasRedirectedRef.current = true;
      clearInterval(intervalRef.current);
      router.replace("/access-denied");
      return;
    }

    if (isPendingUser) {
      hasRedirectedRef.current = true;
      clearInterval(intervalRef.current);
      router.replace("/access-requested");
      return;
    }

    if (!user && !isInactive) {
      hasRedirectedRef.current = true;
      clearInterval(intervalRef.current);
      router.replace("/login");
      return;
    }
  }, [loading, adminData, isDenied, isPendingUser, isInactive, user, router]);

  /* ── Polling: only calls refreshAuth, never redirects ── */
  useEffect(() => {
    if (!user || adminData) return;

    const poll = async () => {
      if (hasRedirectedRef.current) return;
      setChecking(true);
      try {
        await refreshAuth();
      } finally {
        setChecking(false);
      }
    };

    poll();
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => clearInterval(intervalRef.current);
  }, [user, adminData, refreshAuth]);

  const handleRetry = async () => {
    if (retrying) return;
    setRetryNotice("");
    setRetrying(true);
    try {
      if (!auth.currentUser && !hasLocalAdminSession()) {
        setRetryNotice("Your session has expired. Sign out and sign in again to continue.");
        return;
      }
      await refreshAuth();
    } finally {
      setRetrying(false);
    }
  };

  const handleSignOut = async () => {
    clearInterval(intervalRef.current);
    await logout();
    router.replace("/login");
  };

  return (
    <div
      className="h-screen flex items-center justify-center px-4"
      style={{ background: "var(--background)" }}
    >
      <div className="w-full max-w-sm">
        <div className="card p-8" style={{ boxShadow: "var(--shadow-md)" }}>

          {/* ── Status indicator ── */}
          <div className="flex justify-center mb-6">
            <div
              className="relative w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: "var(--surface-soft)", border: "1px solid var(--border)" }}
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ background: "var(--anslation-ds-warning)" }}
              />
            </div>
          </div>

          {/* ── Heading ── */}
          <div className="text-center mb-6">
            <h1
              className="text-xl font-semibold tracking-tight mb-2"
              style={{ color: "var(--foreground)" }}
            >
              Account deactivated
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
              A super admin has paused your access. You'll be able to sign in again as soon as your account is reactivated.
            </p>
            <p
              className="text-xs mt-2"
              style={{ color: syncFailed ? "var(--danger-text)" : "var(--muted-soft)" }}
              role={syncFailed ? "alert" : undefined}
            >
              {syncFailed
                ? "We couldn't reach the server to check your status."
                : checking || retrying
                  ? "Checking for reactivation…"
                  : "Checking automatically every few seconds"}
            </p>
          </div>

          {/* ── Email pill ── */}
          {user?.email && (
            <div className="flex justify-center mb-6">
              <span
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs"
                style={{
                  background: "var(--surface-soft)",
                  border: "1px solid var(--border)",
                  color: "var(--muted)",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: "var(--muted-soft)" }}
                />
                {user.email}
              </span>
            </div>
          )}

          {/* ── Info note ── */}
          <div
            className="rounded-xl px-4 py-3 mb-6 text-sm leading-relaxed"
            style={{
              background: "var(--surface-soft)",
              border: "1px solid var(--border)",
              color: "var(--muted)",
            }}
          >
            Need this reversed sooner?{" "}
            <span className="font-medium" style={{ color: "var(--foreground)" }}>
              Contact a super admin directly
            </span>{" "}
            and share your email address above.
          </div>

          <div className="h-px mb-5" style={{ background: "var(--border)" }} />

          {/* ── Retry (only when the status check itself is failing) ── */}
          {syncFailed && (
            <>
              <button
                onClick={handleRetry}
                disabled={retrying}
                className="w-full btn btn-primary flex items-center justify-center gap-2 py-2.5 text-sm mb-3 disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 flex-shrink-0 ${retrying ? "animate-spin" : ""}`}
                />
                {retrying ? "Checking…" : "Try again"}
              </button>
              {retryNotice && (
                <p
                  className="text-xs mb-3 text-center"
                  style={{ color: "var(--muted)" }}
                  role="status"
                >
                  {retryNotice}
                </p>
              )}
            </>
          )}

          {/* ── Sign out ── */}
          <button
            onClick={handleSignOut}
            className="w-full btn btn-outline flex items-center justify-center gap-2 py-2.5 text-sm"
            style={{ color: "var(--muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
          >
            <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
            Sign out and return to login
          </button>

        </div>
      </div>
    </div>
  );
}
