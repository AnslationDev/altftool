"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseAuth";
import {
  clearLocalAdminSession,
  createLocalAdminData,
  createLocalAdminUser,
  hasLocalAdminSession,
  isLocalAdminLoginEnabled,
  startLocalAdminSession,
} from "@/lib/localAdminSession";

const AuthContext = createContext(null);
// Safety fallback for ending the initial loading state. This is ONLY used to
// stop the spinner when Firebase is genuinely unauthenticated; it must never
// flip the app to "logged out" while a Firebase session is still being
// restored (that race caused spurious /login redirects on heavy pages).
const AUTH_FALLBACK_TIMEOUT_MS = 10000;
const MAX_SYNC_RETRIES = 4;
// Hard ceiling on a single /api/admin/me call. Without this an unresponsive
// server (no reply, no socket error) leaves the await pending forever, so
// `loading` never clears and the UI spins on "Checking your admin session…"
// with no way out.
const PROFILE_FETCH_TIMEOUT_MS = 8000;
// Stop hiding the problem behind a spinner once this many attempts have failed.
// Retries continue in the background — if one succeeds the UI recovers on its
// own — but the user gets a retry/sign-out escape instead of waiting out the
// full retry budget (which can exceed a minute against a hung server).
const SURFACE_FAILURE_AFTER_RETRIES = 2;

// Always-on, low-noise auth diagnostics. Filter the console by "[auth]".
function authLog(...args) {
  try {
    console.info("[auth]", ...args);
  } catch {
    /* logging must never throw */
  }
}

async function fetchAdminMe(currentUser, controllerRef) {
  const token = await currentUser.getIdToken(true);
  const controller = new AbortController();
  // Expose the controller so logout() can abort a request that is still in
  // flight; otherwise its late response can re-authenticate a signed-out admin.
  if (controllerRef) controllerRef.current = controller;
  const timer = setTimeout(() => controller.abort(), PROFILE_FETCH_TIMEOUT_MS);
  try {
    return await fetch("/api/admin/me", {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
    if (controllerRef && controllerRef.current === controller) controllerRef.current = null;
  }
}

export function AuthProvider({ children }) {
  const mountedRef = useRef(false);
  const [user, setUser] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPendingUser, setIsPendingUser] = useState(false);
  const [isDenied, setIsDenied] = useState(false);
  // True for a signed-in admin whose account was deactivated by a super admin
  // (as opposed to isDenied, which is a brand-new signup request that was
  // rejected). The session stays alive so the account-inactive screen can
  // explain what happened instead of a silent, unexplained sign-out.
  const [isInactive, setIsInactive] = useState(false);
  // True once the admin-profile fetch has exhausted its retries. The session is
  // still valid, so we stay signed in — but the UI must stop pretending it is
  // still loading and offer a retry / sign-out instead of an endless spinner.
  const [syncFailed, setSyncFailed] = useState(false);
  const [localAdminLoginEnabled, setLocalAdminLoginEnabled] = useState(false);
  // Retry bookkeeping so transient /api/admin/me failures never force a logout.
  const syncRetryRef = useRef(0);
  const syncUserRef = useRef(null);
  const retryTimerRef = useRef(null);
  // Monotonic generation counter. Every syncUser call claims a generation, and
  // logout()/a no-user auth event bumps it. A response that resolves after its
  // generation was superseded must never be applied — without this, an
  // /api/admin/me reply landing after sign-out re-populated user+adminData and
  // bounced the signed-out admin straight back into the console.
  const authGenRef = useRef(0);
  // AbortController for the in-flight /api/admin/me request, so logout can
  // cancel it instead of racing it.
  const profileFetchRef = useRef(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const applyLocalAdminSession = useCallback(() => {
    if (!mountedRef.current) return;
    setUser(createLocalAdminUser());
    setAdminData(createLocalAdminData());
    setIsPendingUser(false);
    setIsDenied(false);
    setIsInactive(false);
    setSyncFailed(false);
    setLoading(false);
  }, []);

  const syncUser = useCallback(async (currentUser) => {
    if (!mountedRef.current) return;
    // Claim a generation for this sync. Anything that resolves after the
    // generation moves on (a newer sync, or logout) is discarded below.
    const gen = ++authGenRef.current;
    const isStale = () => !mountedRef.current || gen !== authGenRef.current;
    // A *different* admin has signed in since this request started. (A null
    // auth.currentUser is deliberately NOT treated as stale here: it also
    // happens during the transient no-user blip handled below, and the
    // generation guard already covers real sign-outs.)
    const isForeignUser = () =>
      !!currentUser && !!auth.currentUser && auth.currentUser.uid !== currentUser.uid;

    if (!currentUser) {
      authLog("no firebase user → unauthenticated");
      syncRetryRef.current = 0;
      setUser(null);
      setAdminData(null);
      setIsPendingUser(false);
      setIsDenied(false);
      setIsInactive(false);
      setSyncFailed(false);
      setLoading(false);
      return;
    }

    // A fresh attempt is under way — clear any previous give-up state so the
    // UI shows the spinner again rather than a stale error.
    setSyncFailed(false);

    // Transient-failure path: keep the Firebase session, keep the user
    // authenticated (so route guards never bounce to /login), and retry the
    // admin-profile fetch with backoff. We NEVER sign out on a transient error
    // — that is what turned network blips / 5xx into unexpected logouts.
    const keepSessionAndRetry = (reason) => {
      if (isStale()) return;
      setIsPendingUser(false);
      setIsDenied(false);
      setIsInactive(false);
      setUser((prev) => prev || currentUser); // stay authenticated during retries
      const tries = syncRetryRef.current;
      if (tries >= MAX_SYNC_RETRIES) {
        authLog(`profile sync giving up after ${tries} retries (${reason}); session preserved`);
        // Stop the spinner AND flag the failure. The session stays valid, but
        // callers must render a retry/sign-out escape instead of spinning on a
        // profile that is never going to arrive on its own.
        setSyncFailed(true);
        setLoading(false);
        return;
      }
      syncRetryRef.current = tries + 1;
      // Surface the failure early while still retrying underneath, so the user
      // is never left staring at a spinner for the whole retry budget.
      if (tries + 1 >= SURFACE_FAILURE_AFTER_RETRIES) {
        setSyncFailed(true);
        setLoading(false);
      }
      const delay = Math.min(15000, 1500 * (tries + 1));
      authLog(`profile sync transient (${reason}); retry ${tries + 1}/${MAX_SYNC_RETRIES} in ${delay}ms`);
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      retryTimerRef.current = setTimeout(() => {
        const u = auth.currentUser;
        if (mountedRef.current && u) syncUserRef.current?.(u);
      }, delay);
    };

    try {
      const res = await fetchAdminMe(currentUser, profileFetchRef);
      if (isStale() || isForeignUser()) return;

      if (res.status === 404) {
        // Valid token, no admin doc yet → pending
        authLog("profile 404 → pending approval");
        syncRetryRef.current = 0;
        setUser(currentUser);
        setAdminData(null);
        setIsPendingUser(true);
        setIsDenied(false);
        setIsInactive(false);
        setLoading(false);
        return;
      }

      if (res.status === 403) {
        const body = await res.json().catch(() => ({}));
        if (isStale() || isForeignUser()) return;
        syncRetryRef.current = 0;

        if (body?.error === "Access denied") {
          // Explicitly rejected access request
          authLog("profile 403 access-denied");
          setUser(currentUser);
          setAdminData(null);
          setIsPendingUser(false);
          setIsDenied(true);
          setIsInactive(false);
          setLoading(false);
          return;
        }

        if (body?.error === "Inactive admin") {
          // A previously-active admin was deactivated by a super admin. Keep
          // the session alive (unlike the generic 403 fallback below) so the
          // account-inactive screen can explain what happened and offer a
          // "contact a super admin" path instead of a silent, unexplained
          // sign-out.
          authLog("profile 403 inactive-admin → account-inactive");
          setUser(currentUser);
          setAdminData(null);
          setIsPendingUser(false);
          setIsDenied(false);
          setIsInactive(true);
          setLoading(false);
          return;
        }

        // Any other 403 → genuine, sign out
        authLog("profile 403 other → signOut");
        await signOut(auth);
        // The sign-out has ALREADY happened, so it is authoritative and a newer
        // generation must not cancel it — guard on mount only. (The
        // /access-requested poll claims a new generation every 10s; an
        // isStale() bail here would skip the state reset and leave the UI
        // reporting an authenticated session.) Then claim the newest generation
        // so that concurrent sync cannot resurrect the session through
        // keepSessionAndRetry once its own token refresh fails.
        if (!mountedRef.current) return;
        authGenRef.current += 1;
        setUser(null);
        setAdminData(null);
        setIsPendingUser(false);
        setIsDenied(false);
        setIsInactive(false);
        setLoading(false);
        return;
      }

      if (res.status === 401) {
        // Token genuinely invalid / could not be refreshed → genuine, sign out.
        authLog("profile 401 invalid token → signOut");
        syncRetryRef.current = 0;
        await signOut(auth);
        // Sign-out already happened — mount-only guard, then claim the newest
        // generation. See the 403-inactive branch above for the full rationale.
        if (!mountedRef.current) return;
        authGenRef.current += 1;
        setUser(null);
        setAdminData(null);
        setIsPendingUser(false);
        setIsDenied(false);
        setIsInactive(false);
        setLoading(false);
        return;
      }

      if (res.status >= 500) {
        // Recoverable server hiccup (e.g. Admin SDK not initialised). Keep the
        // session and retry — do NOT log the user out or redirect.
        keepSessionAndRetry(`http ${res.status}`);
        return;
      }

      if (!res.ok) {
        authLog(`profile ${res.status} → signOut`);
        syncRetryRef.current = 0;
        await signOut(auth);
        // Sign-out already happened — mount-only guard, then claim the newest
        // generation. See the 403-inactive branch above for the full rationale.
        if (!mountedRef.current) return;
        authGenRef.current += 1;
        setUser(null);
        setAdminData(null);
        setIsPendingUser(false);
        setIsDenied(false);
        setIsInactive(false);
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (isStale() || isForeignUser()) return;
      authLog("profile ok → authenticated");
      syncRetryRef.current = 0;
      setUser(currentUser);
      setAdminData(data);
      setIsPendingUser(false);
      setIsDenied(false);
      setIsInactive(false);
      setLoading(false);
    } catch (err) {
      if (isStale()) return;
      // Network/parse error fetching the admin profile — transient. Keep the
      // session and retry; never sign out on this.
      keepSessionAndRetry(err?.message || "network");
    }
  }, []);

  // Keep a live ref to syncUser so retry timers can call the latest instance.
  useEffect(() => {
    syncUserRef.current = syncUser;
  }, [syncUser]);

  // Clear any pending retry timer on unmount.
  useEffect(() => {
    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, []);

  /**
   * Call this anywhere you need to force a re-sync without waiting for
   * a Firebase auth-state change (e.g. after approval polling resolves,
   * or after google-login returns { status: "admin" }).
   */
  const refreshAuth = useCallback(async () => {
    if (hasLocalAdminSession()) {
      applyLocalAdminSession();
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) return;
    if (!mountedRef.current) return;
    // Reset the retry budget and cancel any scheduled retry, otherwise a manual
    // "Try again" after the budget is spent gives up immediately without ever
    // re-hitting /api/admin/me.
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    syncRetryRef.current = 0;
    setLoading(true);
    await syncUser(currentUser);
  }, [applyLocalAdminSession, syncUser]);

  const signInLocalAdmin = useCallback(() => {
    if (!startLocalAdminSession()) return false;
    applyLocalAdminSession();
    return true;
  }, [applyLocalAdminSession]);

  const logout = useCallback(async () => {
    // Invalidate any in-flight profile sync FIRST: bump the generation so a
    // late /api/admin/me response cannot re-authenticate this session, abort
    // the request itself, and cancel any scheduled retry.
    authGenRef.current += 1;
    try {
      profileFetchRef.current?.abort();
    } catch {
      /* aborting must never block sign-out */
    }
    profileFetchRef.current = null;
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    syncRetryRef.current = 0;

    // Best-effort: revoke this device's server-side security session so it does
    // not linger as "active" until idle timeout. Token is still valid here.
    try {
      const current = auth.currentUser;
      if (current) {
        const token = await current.getIdToken();
        await fetch("/api/security/session/end", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          keepalive: true,
        });
      }
    } catch {
      /* ignore — never block sign-out on this */
    }
    clearLocalAdminSession();
    await signOut(auth).catch(() => {});
    if (!mountedRef.current) return;
    setUser(null);
    setAdminData(null);
    setIsPendingUser(false);
    setIsDenied(false);
    setIsInactive(false);
    setSyncFailed(false);
    setLoading(false);
  }, []);

  useEffect(() => {
    setLocalAdminLoginEnabled(isLocalAdminLoginEnabled());

    if (hasLocalAdminSession()) {
      applyLocalAdminSession();
      return undefined;
    }

    let settled = false;
    // Safety fallback ONLY. We must not end the loading state as "logged out"
    // while Firebase is still restoring a session — doing so let the route
    // guard redirect an authenticated user to /login on slow/heavy pages
    // (the blog editor). So the fallback ends loading only when Firebase has
    // genuinely no current user; otherwise it waits for onAuthStateChanged.
    const fallback = setTimeout(() => {
      if (settled || !mountedRef.current) return;
      if (!auth.currentUser) {
        authLog("init fallback: no firebase session → unauthenticated");
        setLoading(false);
        return;
      }
      // A session exists but onAuthStateChanged still has not fired. Keep the
      // user signed in (never bounce them to /login here), but surface the
      // stall so the UI can offer a retry — previously this branch just kept
      // `loading` true forever and the spinner never resolved.
      authLog("init fallback: firebase session present but auth state never fired → surfacing retry");
      setUser((prev) => prev || auth.currentUser);
      setSyncFailed(true);
      setLoading(false);
    }, AUTH_FALLBACK_TIMEOUT_MS);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      settled = true;
      clearTimeout(fallback);

      // Absorb a TRANSIENT null. A cross-tab storage-poll blip, or a briefly
      // blocked/partitioned Auth persistence (observed in production alongside
      // `net::ERR_BLOCKED_BY_CLIENT`), can fire `no-user` even though the
      // session is still valid — bouncing an active admin to /login. Give it a
      // short grace window; if the auth state recovers, re-sync instead of
      // logging out. A genuinely cleared session stays null and logs out as
      // before. Explicit logout() sets state directly, so it is unaffected.
      if (!currentUser) {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        if (!mountedRef.current) return;
        if (auth.currentUser) {
          authLog("onAuthStateChanged transient no-user recovered → re-sync");
          if (hasLocalAdminSession()) {
            applyLocalAdminSession();
            return;
          }
          syncUser(auth.currentUser);
          return;
        }
      }

      authLog("onAuthStateChanged", currentUser ? `uid=${currentUser.uid}` : "no-user");
      if (hasLocalAdminSession()) {
        applyLocalAdminSession();
        return;
      }
      syncUser(currentUser);
    }, (err) => {
      settled = true;
      clearTimeout(fallback);
      authLog("onAuthStateChanged error", err?.message);
      // Don't assume logged-out on a listener error if a session still exists.
      if (mountedRef.current && !auth.currentUser) {
        setLoading(false);
      }
    });
    return () => {
      clearTimeout(fallback);
      unsubscribe();
    };
  }, [applyLocalAdminSession, syncUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        adminData,
        loading,
        isPendingUser,
        isDenied,
        isInactive,
        syncFailed,
        isSuperAdmin: adminData?.roleType === "superadmin" || adminData?.isSuperAdmin === true,
        localAdminLoginEnabled,
        signInLocalAdmin,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
