"use client";

/**
 * Mounted inside the authenticated admin shell. Responsibilities:
 *  - Start a security session on login (device/IP/geo capture + risk scoring).
 *  - Block the UI with a one-time Privacy & Security consent modal on first
 *    login and after any policy-version update.
 *  - Send activity heartbeats; enforce idle timeout and admin force-logout by
 *    signing the admin out when the server reports the session inactive.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";

// Heartbeat reasons that mean the admin should actually be signed out.
const LOGOUT_REASONS = new Set(["idle_timeout", "absolute_timeout", "forced_logout", "force_logout"]);

const HEARTBEAT_MS = 30_000;

export default function SecurityGate() {
  const { user, logout } = useAuth();
  const [consent, setConsent] = useState(null); // { required, currentVersion, policySummary }
  const [accepting, setAccepting] = useState(false);
  const sessionRef = useRef(null);
  const idleMinutesRef = useRef(30);
  const lastActivityRef = useRef(Date.now());
  const activeSinceBeatRef = useRef(false);
  const startedForUidRef = useRef(null);

  // Stable token fetch from the auth singleton (does not change identity on
  // token refresh, so it never re-triggers session-start in a loop).
  const authFetch = useCallback(async (url, options = {}) => {
    const u = auth.currentUser;
    if (!u) throw new Error("no-user");
    const token = await u.getIdToken();
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || `(${res.status})`);
    return data;
  }, []);

  // 1. Start session + load consent ONCE per logged-in admin, with retry/backoff
  //    so a transient network failure doesn't leave the session unstarted
  //    (which would silently disable idle-timeout enforcement).
  useEffect(() => {
    if (!user?.uid) return;
    if (startedForUidRef.current === user.uid) return; // dedupe
    startedForUidRef.current = user.uid;
    let alive = true;
    let retryTimer = null;
    const attempt = async (tries = 0) => {
      try {
        const res = await authFetch("/api/security/session/start", { method: "POST" });
        if (!alive) return;
        sessionRef.current = res.sessionId;
        idleMinutesRef.current = res.idleTimeoutMinutes || 30;
        if (res.consent?.required) setConsent({ ...res.consent });
      } catch {
        if (!alive) return;
        if (tries < 4) {
          retryTimer = setTimeout(() => attempt(tries + 1), Math.min(30_000, 3_000 * (tries + 1)));
        } else {
          startedForUidRef.current = null; // give up; allow a future re-trigger
        }
      }
    };
    attempt();
    return () => {
      alive = false;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [user?.uid, authFetch]);

  // 2. Track real user activity.
  useEffect(() => {
    const onActivity = () => {
      lastActivityRef.current = Date.now();
      activeSinceBeatRef.current = true;
    };
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, onActivity));
  }, []);

  // 3. Heartbeat + idle / forced-logout enforcement.
  useEffect(() => {
    if (!user) return;
    const timer = setInterval(async () => {
      const sessionId = sessionRef.current;
      if (!sessionId) return;
      const idleMs = idleMinutesRef.current * 60_000;
      const idleFor = Date.now() - lastActivityRef.current;

      if (idleFor >= idleMs) {
        await forceSignOut();
        return;
      }
      try {
        const active = activeSinceBeatRef.current;
        activeSinceBeatRef.current = false;
        const res = await authFetch("/api/security/session/heartbeat", {
          method: "POST",
          body: JSON.stringify({ sessionId, active }),
        });
        if (res && res.active === false) {
          if (LOGOUT_REASONS.has(res.reason)) {
            await forceSignOut(); // genuine: idle / absolute / admin force-logout
          } else {
            // stale/replaced session id — let session-start run again, don't log out
            sessionRef.current = null;
            startedForUidRef.current = null;
          }
        }
      } catch {
        /* ignore transient errors */
      }
    }, HEARTBEAT_MS);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, authFetch]);

  const forceSignOut = useCallback(async () => {
    try {
      await logout?.();
    } catch {
      if (typeof window !== "undefined") window.location.href = "/login";
    }
  }, [logout]);

  const acceptConsent = async () => {
    setAccepting(true);
    try {
      await authFetch("/api/security/consent", { method: "POST", body: JSON.stringify({}) });
      setConsent(null);
    } catch {
      setConsent(null); // don't trap the admin if the write fails
    } finally {
      setAccepting(false);
    }
  };

  if (!consent?.required) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-base font-bold text-foreground">Privacy &amp; Security notice</h2>
            <p className="text-xs text-muted">Policy version {consent.currentVersion}</p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-6 text-muted">
          {consent.policySummary ||
            "To protect your account and the platform, we record security-relevant activity for each admin session — device, browser, masked IP (an encrypted copy is retained for security investigations), approximate location, sign-in times, and the actions you perform. This data is used only for security and auditing, is visible only to Super Admins, and is never used for advertising."}
        </p>

        <ul className="mt-3 space-y-1 text-xs text-muted">
          <li>• Visible only to Super Admins, for security &amp; audit purposes.</li>
          <li>• Full IP addresses are encrypted at rest; only a masked IP is shown.</li>
          <li>• You can be signed out automatically after inactivity for your safety.</li>
        </ul>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={forceSignOut}
            className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-surface-soft"
          >
            Decline &amp; sign out
          </button>
          <button
            type="button"
            onClick={acceptConsent}
            disabled={accepting}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {accepting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            I understand &amp; agree
          </button>
        </div>
      </div>
    </div>
  );
}
