"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { emitAlert } from "@/lib/alertBus";
import { getFirstAllowedRoute } from "@/lib/permissionUtils";
import { LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function AccessDeniedPage() {
  const router = useRouter();
  const {
    user,
    adminData,
    isPendingUser,
    isInactive,
    loading: authLoading,
    logout,
    refreshAuth,
  } = useAuth();
  const [loading, setLoading] = useState(false);
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    document.title = "Access denied · AltFTools Admin";
  }, []);

  /* ── Recovery: this page must not be a dead end ── */
  useEffect(() => {
    if (authLoading) return;
    if (hasRedirectedRef.current) return;

    // Access was granted after all → go straight into the console.
    if (adminData) {
      hasRedirectedRef.current = true;
      router.replace(getFirstAllowedRoute(adminData) ?? "/profile");
      return;
    }

    // A fresh request is now pending → the waiting screen owns that state.
    if (isPendingUser) {
      hasRedirectedRef.current = true;
      router.replace("/access-requested");
      return;
    }

    // Deactivated (not rejected) → the account-inactive screen owns that state.
    if (isInactive) {
      hasRedirectedRef.current = true;
      router.replace("/account-inactive");
      return;
    }

    // This route sits outside (protected), so it also renders for a signed-out
    // visitor or a tab whose session dropped. Send them to /login instead of
    // leaving a screen whose only button throws on a null user.
    if (!user) {
      hasRedirectedRef.current = true;
      router.replace("/login");
    }
  }, [authLoading, adminData, isPendingUser, isInactive, user, router]);

  const handleReRequest = async () => {
    if (!user) {
      emitAlert({
        type: "error",
        message: "Your session has expired. Please sign in again.",
      });
      return;
    }

    try {
      setLoading(true);

      const token = await user.getIdToken(true);

      const res = await fetch("/api/admin/request-access", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: "new" }),
      });

      if (!res.ok) {
        // Operator-facing copy only — never surface the raw server message.
        if (res.status === 409) {
          emitAlert({
            type: "info",
            message: "You already have a request awaiting review.",
          });
          // Re-sync instead of navigating blind: the context still says
          // `isDenied`, and /access-requested redirects straight back here on
          // that flag. Once the refresh resolves the real state, the recovery
          // effect above sends us to the right screen.
          await refreshAuth().catch(() => {});
          return;
        }
        emitAlert({
          type: "error",
          message:
            res.status === 401 || res.status === 403
              ? "Your session has expired. Please sign in again."
              : res.status === 429
                ? "Too many requests. Please wait a moment and try again."
                : "We couldn’t submit your access request. Please try again.",
        });
        return;
      }

      emitAlert({
        type: "success",
        message: "Access request submitted. A super admin will review it shortly.",
      });
      // Same reason as the 409 branch: replacing to /access-requested while the
      // context still holds `isDenied` bounces the admin straight back to this
      // screen with no confirmation. Refresh first — /api/admin/me now reports
      // the new pending request, which flips `isPendingUser` and lets the
      // recovery effect do the navigating. Swallow refresh errors — the request
      // did succeed, so they must not fall through to the "couldn't submit"
      // toast below.
      await refreshAuth().catch(() => {});
    } catch {
      emitAlert({
        type: "error",
        message: "We couldn’t submit your access request. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
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

          {/* ── Status Indicator ── */}
          <div className="flex justify-center mb-6">
            <div
              className="relative w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: "var(--anslation-ds-danger-soft)", border: "1px solid color-mix(in srgb, var(--anslation-ds-danger) 22%, transparent)" }}
            >
              <span
                className="absolute inset-0 rounded-full animate-ping"
                style={{
                  border: "1.5px solid var(--anslation-ds-danger)",
                  opacity: 0.35,
                  animationDuration: "2s",
                }}
              />
              <span
                className="w-3 h-3 rounded-full"
                style={{ background: "var(--anslation-ds-danger)" }}
              />
            </div>
          </div>

          {/* ── Heading ── */}
          <div className="text-center mb-6">
            <h1
              className="text-xl font-semibold tracking-tight mb-2"
              style={{ color: "var(--foreground)" }}
            >
              Access denied
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
              Your access request was declined by a super admin.
            </p>
            <p className="text-xs mt-2" style={{ color: "var(--muted-soft)" }}>
              You can submit a new request if needed.
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

          {/* ── Info Box ── */}
          <div
            className="rounded-xl px-4 py-3 mb-6 text-sm leading-relaxed"
            style={{
              background: "var(--surface-soft)",
              border: "1px solid var(--border)",
              color: "var(--muted)",
            }}
          >
            If you believe this was a mistake, you can request access again or contact a super admin.
          </div>

          {/* ── Actions ── */}
          <div className="space-y-3">
            <button
              onClick={handleReRequest}
              disabled={loading || !user}
              className="w-full btn btn-primary py-2.5 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Request Access Again"}
            </button>

            <button
              onClick={handleSignOut}
              className="w-full btn btn-outline flex items-center justify-center gap-2 py-2.5 text-sm"
              style={{ color: "var(--muted)" }}
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out and return to login
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
