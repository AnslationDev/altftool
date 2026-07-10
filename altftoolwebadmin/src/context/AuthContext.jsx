"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
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

// Always-on, low-noise auth diagnostics. Filter the console by "[auth]".
function authLog(...args) {
  try {
    console.info("[auth]", ...args);
  } catch {
    /* logging must never throw */
  }
}

async function fetchAdminMe(currentUser) {
  const token = await currentUser.getIdToken(true);
  const res = await fetch("/api/admin/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res;
}

export function AuthProvider({ children }) {
  const mountedRef = useRef(false);
  const [user, setUser] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPendingUser, setIsPendingUser] = useState(false);
  const [isDenied, setIsDenied] = useState(false);
  const [localAdminLoginEnabled, setLocalAdminLoginEnabled] = useState(false);
  // Retry bookkeeping so transient /api/admin/me failures never force a logout.
  const syncRetryRef = useRef(0);
  const syncUserRef = useRef(null);
  const retryTimerRef = useRef(null);

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
    setLoading(false);
  }, []);

  const syncUser = useCallback(async (currentUser) => {
    if (!mountedRef.current) return;

    if (!currentUser) {
      authLog("no firebase user → unauthenticated");
      syncRetryRef.current = 0;
      setUser(null);
      setAdminData(null);
      setIsPendingUser(false);
      setIsDenied(false);
      setLoading(false);
      return;
    }

    // Transient-failure path: keep the Firebase session, keep the user
    // authenticated (so route guards never bounce to /login), and retry the
    // admin-profile fetch with backoff. We NEVER sign out on a transient error
    // — that is what turned network blips / 5xx into unexpected logouts.
    const keepSessionAndRetry = (reason) => {
      if (!mountedRef.current) return;
      setIsPendingUser(false);
      setIsDenied(false);
      setUser((prev) => prev || currentUser); // stay authenticated during retries
      const tries = syncRetryRef.current;
      if (tries >= MAX_SYNC_RETRIES) {
        authLog(`profile sync giving up after ${tries} retries (${reason}); session preserved`);
        setLoading(false); // stop spinner; user stays logged in, profile fills on next success
        return;
      }
      syncRetryRef.current = tries + 1;
      const delay = Math.min(15000, 1500 * (tries + 1));
      authLog(`profile sync transient (${reason}); retry ${tries + 1}/${MAX_SYNC_RETRIES} in ${delay}ms`);
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      retryTimerRef.current = setTimeout(() => {
        const u = auth.currentUser;
        if (mountedRef.current && u) syncUserRef.current?.(u);
      }, delay);
    };

    try {
      const res = await fetchAdminMe(currentUser);
      if (!mountedRef.current) return;

      if (res.status === 404) {
        // Valid token, no admin doc yet → pending
        authLog("profile 404 → pending approval");
        syncRetryRef.current = 0;
        setUser(currentUser);
        setAdminData(null);
        setIsPendingUser(true);
        setIsDenied(false);
        setLoading(false);
        return;
      }

      if (res.status === 403) {
        const body = await res.json().catch(() => ({}));
        if (!mountedRef.current) return;
        syncRetryRef.current = 0;

        if (body?.error === "Access denied") {
          // Explicitly rejected access request
          authLog("profile 403 access-denied");
          setUser(currentUser);
          setAdminData(null);
          setIsPendingUser(false);
          setIsDenied(true);
          setLoading(false);
          return;
        }

        // Inactive admin or other 403 → genuine, sign out
        authLog("profile 403 inactive → signOut");
        await signOut(auth);
        if (!mountedRef.current) return;
        setUser(null);
        setAdminData(null);
        setIsPendingUser(false);
        setIsDenied(false);
        setLoading(false);
        return;
      }

      if (res.status === 401) {
        // Token genuinely invalid / could not be refreshed → genuine, sign out.
        authLog("profile 401 invalid token → signOut");
        syncRetryRef.current = 0;
        await signOut(auth);
        if (!mountedRef.current) return;
        setUser(null);
        setAdminData(null);
        setIsPendingUser(false);
        setIsDenied(false);
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
        if (!mountedRef.current) return;
        setUser(null);
        setAdminData(null);
        setIsPendingUser(false);
        setIsDenied(false);
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (!mountedRef.current) return;
      authLog("profile ok → authenticated");
      syncRetryRef.current = 0;
      setUser(currentUser);
      setAdminData(data);
      setIsPendingUser(false);
      setIsDenied(false);
      setLoading(false);
    } catch (err) {
      if (!mountedRef.current) return;
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
    setLoading(true);
    await syncUser(currentUser);
  }, [applyLocalAdminSession, syncUser]);

  const signInLocalAdmin = useCallback(() => {
    if (!startLocalAdminSession()) return false;
    applyLocalAdminSession();
    return true;
  }, [applyLocalAdminSession]);

  const logout = useCallback(async () => {
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
      } else {
        authLog("init fallback: firebase session present, awaiting auth state (keep loading)");
      }
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
        isSuperAdmin: adminData?.roleType === "superadmin",
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
