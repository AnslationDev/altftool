"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LogOut, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getFirstAllowedRoute } from "@/lib/permissionUtils";
import { auth } from "@/lib/firebaseAuth";
import { hasLocalAdminSession } from "@/lib/localAdminSession";

const POLL_INTERVAL_MS = 10000;

export default function AccessRequestedPage() {
  const router = useRouter();
  const { user, adminData, isDenied, isPendingUser, isInactive, loading, syncFailed, refreshAuth, logout } =
    useAuth();
  const intervalRef = useRef(null);
  const [checking, setChecking] = useState(false);
  // Manual "Try again" runs on its own flag: sharing `checking` with the 10s
  // poll let the poll's finally-block re-enable the button and flip its label
  // back mid-click (and vice versa).
  const [retrying, setRetrying] = useState(false);
  const [retryNotice, setRetryNotice] = useState("");
  // Latched view of `syncFailed`. The context clears syncFailed at the START of
  // every attempt, and the poll re-arms the retry budget every 10s, so binding
  // the error copy + retry button straight to syncFailed made them mount and
  // unmount every 1.5-3s while the server was down — the button vanished from
  // under the pointer and role="alert" re-announced on each cycle. Only a
  // definitive answer from /api/admin/me clears this.
  const [statusUnavailable, setStatusUnavailable] = useState(false);
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (syncFailed) {
      setStatusUnavailable(true);
      return;
    }
    // isPendingUser / adminData / isDenied are only ever set by a completed
    // response; the transient-failure path in AuthContext clears all three.
    if (isPendingUser || adminData || isDenied) setStatusUnavailable(false);
  }, [syncFailed, isPendingUser, adminData, isDenied]);

  /* ── Context-driven redirect (single source of truth) ── */
useEffect(() => {
  if (loading) return;
  if (hasRedirectedRef.current) return;

  if (isDenied) {
    hasRedirectedRef.current = true;
    clearInterval(intervalRef.current);
    router.replace("/access-denied");
    return;
  }

  if (isInactive) {
    hasRedirectedRef.current = true;
    clearInterval(intervalRef.current);
    router.replace("/account-inactive");
    return;
  }

  if (adminData) {
    hasRedirectedRef.current = true;
    clearInterval(intervalRef.current);
    const destination = getFirstAllowedRoute(adminData);
    router.replace(destination ?? "/profile");
    return;
  }

  if (!user && !isPendingUser) {
    hasRedirectedRef.current = true;
    clearInterval(intervalRef.current);
    router.replace("/login");
    return;
  }
}, [loading, adminData, isDenied, isInactive, isPendingUser, user, router]);

  /* ── Polling: only calls refreshAuth, never redirects ── */
  useEffect(() => {
    // Keep polling for as long as we hold a session that has not resolved into
    // a usable profile. This used to be gated on `isPendingUser`, which a
    // transient /api/admin/me failure clears — that tore the interval down
    // permanently, so an approval granted afterwards was never picked up while
    // the page still claimed to be "checking automatically".
    if (!user || adminData || isDenied) return;

    const poll = async () => {
      if (hasRedirectedRef.current) return;
      setChecking(true);
      try {
        await refreshAuth();
      } finally {
        setChecking(false);
      }
    };

    // Check immediately on mount, then on interval
    poll();
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => clearInterval(intervalRef.current);
  }, [user, adminData, isDenied, refreshAuth]);

  const handleRetry = async () => {
    if (retrying) return;
    setRetryNotice("");
    setRetrying(true);
    try {
      // refreshAuth() early-returns silently when the Firebase session has gone
      // away, so without this the button would spin and report nothing at all.
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
    // Use the context logout so the server-side security session is revoked and
    // any local-admin session is cleared — a bare signOut(auth) leaves both.
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

          {/* ── Pulsing status indicator ── */}
          <div className="flex justify-center mb-6">
            <div
              className="relative w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: "var(--surface-soft)", border: "1px solid var(--border)" }}
            >
              <span
                className="absolute inset-0 rounded-full animate-ping"
                style={{
                  border: "1.5px solid var(--anslation-ds-warning)",
                  opacity: 0.35,
                  animationDuration: "2s",
                }}
              />
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
              Access pending
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
              Your account is awaiting approval from a super admin before you can sign in.
            </p>
            <p
              className="text-xs mt-2"
              style={{ color: statusUnavailable ? "var(--danger-text)" : "var(--muted-soft)" }}
              role={statusUnavailable ? "alert" : undefined}
            >
              {statusUnavailable
                ? "We couldn’t reach the server to check your status."
                : checking || retrying
                  ? "Checking for approval…"
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

          {/* ── Progress steps ── */}
          <div className="space-y-3 mb-6">

            {/* Step 1 — done */}
            <div className="flex items-start gap-3">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: "var(--anslation-ds-success-soft)", border: "1px solid color-mix(in srgb, var(--anslation-ds-success) 22%, transparent)" }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2.5 2.5L8 3" stroke="var(--anslation-ds-success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-sm leading-snug pt-0.5" style={{ color: "var(--muted)" }}>
                <span className="font-medium" style={{ color: "var(--foreground)" }}>Account created</span>{" "}
                — request submitted successfully
              </p>
            </div>

            <div className="ml-2.5 w-px h-2" style={{ background: "var(--border)" }} />

            {/* Step 2 — pending */}
            <div className="flex items-start gap-3">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: "var(--surface-soft)", border: "1px solid var(--border)" }}
              >
                <span className="text-[10px] font-medium" style={{ color: "var(--muted-soft)" }}>2</span>
              </div>
              <p className="text-sm leading-snug pt-0.5" style={{ color: "var(--muted)" }}>
                <span className="font-medium" style={{ color: "var(--foreground)" }}>Admin review</span>{" "}
                — a super admin will approve and configure your access
              </p>
            </div>

            <div className="ml-2.5 w-px h-2" style={{ background: "var(--border)" }} />

            {/* Step 3 — future */}
            <div className="flex items-start gap-3">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: "var(--surface-soft)", border: "1px solid var(--border)" }}
              >
                <span className="text-[10px] font-medium" style={{ color: "var(--muted-soft)" }}>3</span>
              </div>
              <p className="text-sm leading-snug pt-0.5" style={{ color: "var(--muted)" }}>
                <span className="font-medium" style={{ color: "var(--foreground)" }}>You're in</span>{" "}
                — sign in once your access is confirmed
              </p>
            </div>

          </div>

          {/* ── Info note ── */}
          <div
            className="rounded-xl px-4 py-3 mb-6 text-sm leading-relaxed"
            style={{
              background: "var(--surface-soft)",
              border: "1px solid var(--border)",
              color: "var(--muted)",
            }}
          >
            Need access sooner?{" "}
            <span className="font-medium" style={{ color: "var(--foreground)" }}>
              Notify a super admin directly
            </span>{" "}
            and share your email address above.
          </div>

          <div className="h-px mb-5" style={{ background: "var(--border)" }} />

          {/* ── Retry (only when the status check itself is failing) ── */}
          {statusUnavailable && (
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
