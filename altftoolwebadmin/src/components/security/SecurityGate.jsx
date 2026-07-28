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
import { auth } from "@/lib/firebaseAuth";

// Heartbeat reasons that mean the admin should actually be signed out.
const LOGOUT_REASONS = new Set(["idle_timeout", "absolute_timeout", "forced_logout", "force_logout"]);

const HEARTBEAT_MS = 30_000;
// How long to wait after session/start has exhausted its retries before asking
// for a fresh round. Without a re-trigger the gate stays permanently disarmed.
const SESSION_START_COOLDOWN_MS = 60_000;

export default function SecurityGate() {
  const { user, logout } = useAuth();
  const [consent, setConsent] = useState(null); // { required, currentVersion, policySummary }
  const [accepting, setAccepting] = useState(false);
  // Bumping this re-runs the session-start effect. It must be state, not a ref:
  // resetting `startedForUidRef` alone is invisible to the effect's dependency
  // list, so a persistent start failure previously disarmed the security gate
  // (no heartbeat, no idle timeout, no force-logout) for the tab's whole life.
  const [startAttempt, setStartAttempt] = useState(0);
  const sessionRef = useRef(null);
  const idleMinutesRef = useRef(30);
  const lastActivityRef = useRef(Date.now());
  const activeSinceBeatRef = useRef(false);
  const startedForUidRef = useRef(null);
  // Wall-clock instant before which the heartbeat must NOT ask for another
  // session-start round. Survives the effect teardown that a re-arm causes, so
  // the cooldown is actually honoured (a timer alone was cancelled by it).
  const startCooldownUntilRef = useRef(0);
  const dialogRef = useRef(null);
  const acceptButtonRef = useRef(null);

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
    if (!res.ok) {
      const err = new Error(data?.error || `(${res.status})`);
      err.status = res.status; // lets callers (e.g. heartbeat) distinguish a real 403 from a network blip
      throw err;
    }
    return data;
  }, []);

  // 1. Start session + load consent ONCE per logged-in admin, with retry/backoff
  useEffect(() => {
    if (!user?.uid) return;
    // The local-dev admin has no Firebase credential, so authFetch below throws
    // "no-user" immediately and every round is guaranteed to fail. Skipping is
    // not a weakening: the calls could never have succeeded, and retrying them
    // forever churned a full effect teardown + 5 timers every cooldown window.
    if (user.isLocalAdmin) return;
    if (startedForUidRef.current === user.uid) return; // dedupe
    startedForUidRef.current = user.uid;
    let alive = true;
    let retryTimer = null;
    const attempt = async (tries = 0) => {
      try {
        const res = await authFetch("/api/security/session/start", { method: "POST" });
        if (!alive) return;
        sessionRef.current = res.sessionId;
        startCooldownUntilRef.current = 0; // a good round clears any back-off
        idleMinutesRef.current = res.idleTimeoutMinutes || 30;
        lastActivityRef.current = Date.now(); // RESET client-side activity timer on session start!
        if (res.consent?.required) setConsent({ ...res.consent });
      } catch {
        if (!alive) return;
        if (tries < 4) {
          retryTimer = setTimeout(() => attempt(tries + 1), 2000 * Math.pow(2, tries));
        } else {
          // Give up gracefully — do NOT force sign-out. A persistent
          // session/start failure is usually transient (server cold-start, 5xx,
          // network blip, or a shields/ad-blocker interfering); signing an
          // authenticated admin out here just turns a backend hiccup into an
          // unexpected logout. Reset the dedupe AND schedule a real re-run —
          // the ref reset on its own never re-triggered this effect, which left
          // the session id null and the heartbeat/idle enforcement dead.
          console.warn("[auth] SecurityGate: session start failed persistently; will retry later (no logout)");
          startedForUidRef.current = null;
          startCooldownUntilRef.current = Date.now() + SESSION_START_COOLDOWN_MS;
          retryTimer = setTimeout(() => {
            if (!alive) return;
            setStartAttempt((n) => n + 1);
          }, SESSION_START_COOLDOWN_MS);
        }
      }
    };
    attempt();
    return () => {
      alive = false;
      startedForUidRef.current = null; // reset dedupe on unmount/re-render to handle Strict Mode
      if (retryTimer) clearTimeout(retryTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, authFetch, startAttempt]);

  // 2. Track activity to reset idle timeout.
  useEffect(() => {
    if (!user?.uid) return undefined;

    lastActivityRef.current = Date.now(); // Initialize activity timer to client-side mount time!
    const onActivity = () => {
      lastActivityRef.current = Date.now();
      activeSinceBeatRef.current = true;
    };
    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "input",
      "click",
      "scroll",
      "wheel",
      "touchstart",
      "pointerdown",
    ];
    const opts = { passive: true, capture: true };
    events.forEach((e) => window.addEventListener(e, onActivity, opts));
    document.addEventListener("focusin", onActivity, true);
    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity, opts));
      document.removeEventListener("focusin", onActivity, true);
    };
  }, [user?.uid]);

  // 3. Heartbeat + idle / forced-logout enforcement.
  useEffect(() => {
    if (!user) return;
    if (user.isLocalAdmin) return; // no security session exists to beat against
    const timer = setInterval(async () => {
      const sessionId = sessionRef.current;
      if (!sessionId) {
        // No live session — either session/start gave up or the server told us
        // our id was stale. Both paths clear the dedupe ref; nudge the start
        // effect so it actually runs again instead of waiting forever. Respect
        // the cooldown the give-up branch set: without that check this nudge
        // fires every 30s, and the effect cleanup it triggers cancels the very
        // cooldown timer that was meant to space the retries out.
        if (startedForUidRef.current === null && Date.now() >= startCooldownUntilRef.current) {
          setStartAttempt((n) => n + 1);
        }
        return;
      }

      // Idle enforcement stays BEHIND the session-id guard on purpose.
      // `idleMinutesRef` only holds the org's real policy after a successful
      // session/start; before that it is the hardcoded 30-minute default, so
      // evaluating it here would force-sign-out admins of an org with a longer
      // idle policy whenever session/start is failing.
      const idleMs = idleMinutesRef.current * 60_000;
      const idleFor = Date.now() - lastActivityRef.current;
      if (idleFor >= idleMs) {
        console.info("[auth] SecurityGate: client idle timeout reached → sign out", { idleFor, idleMs });
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
            console.info("[auth] SecurityGate: server ended session → sign out", { reason: res.reason });
            await forceSignOut(); // genuine: idle / absolute / admin force-logout
          } else {
            console.info("[auth] SecurityGate: stale/replaced session id, re-starting (no logout)", { reason: res.reason });
            // stale/replaced session id — let session-start run again, don't log out
            sessionRef.current = null;
            startedForUidRef.current = null;
          }
        }
      } catch (err) {
        // withAdminApi maps both "no admin doc" and "Inactive admin" to a plain
        // 403 {error:"Forbidden"} (see classifyAuthError in withAdminApi.js) —
        // never the {active:false, reason:...} shape checked above. A 403 here
        // means the server has already rejected this admin's authorization, so
        // it must be treated as a genuine forced logout, not a transient error.
        if (err?.status === 403) {
          console.info("[auth] SecurityGate: heartbeat forbidden (403) → admin deactivated/removed, sign out");
          await forceSignOut();
        }
        /* other errors (network blips, 5xx, etc.) are transient — ignore */
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

  // A11y for the consent modal: move focus into the dialog on open, trap Tab
  // focus inside it, and treat Escape as decline (sign out) — mirrors the
  // role="dialog" + Escape pattern used by the editor dialogs.
  useEffect(() => {
    if (!consent?.required) return undefined;
    const focusTimer = window.setTimeout(() => acceptButtonRef.current?.focus(), 30);
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        forceSignOut();
        return;
      }
      if (event.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusables = Array.from(
        dialog.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.disabled);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!dialog.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, [consent?.required, forceSignOut]);

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
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="security-consent-title"
        className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-lg"
      >
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <h2 id="security-consent-title" className="text-base font-bold text-foreground">Privacy &amp; Security notice</h2>
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
            ref={acceptButtonRef}
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
