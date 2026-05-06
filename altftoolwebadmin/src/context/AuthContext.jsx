"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
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
const AUTH_STATE_TIMEOUT_MS = 3000;

async function fetchAdminMe(currentUser) {
  const token = await currentUser.getIdToken(true);
  const res = await fetch("/api/admin/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPendingUser, setIsPendingUser] = useState(false);
  const [isDenied, setIsDenied] = useState(false);
  const [localAdminLoginEnabled, setLocalAdminLoginEnabled] = useState(false);

  const applyLocalAdminSession = useCallback(() => {
    setUser(createLocalAdminUser());
    setAdminData(createLocalAdminData());
    setIsPendingUser(false);
    setIsDenied(false);
    setLoading(false);
  }, []);

  const syncUser = useCallback(async (currentUser) => {
    if (!currentUser) {
      setUser(null);
      setAdminData(null);
      setIsPendingUser(false);
      setIsDenied(false);
      setLoading(false);
      return;
    }

    try {
      const res = await fetchAdminMe(currentUser);

      if (res.status === 404) {
        // Valid token, no admin doc yet → pending
        setUser(currentUser);
        setAdminData(null);
        setIsPendingUser(true);
        setIsDenied(false);
        setLoading(false);
        return;
      }

      if (res.status === 403) {
        const body = await res.json().catch(() => ({}));

        if (body?.error === "Access denied") {
          // Explicitly rejected access request
          setUser(currentUser);
          setAdminData(null);
          setIsPendingUser(false);
          setIsDenied(true);
          setLoading(false);
          return;
        }

        // Inactive admin or other 403 → sign out
        await signOut(auth);
        setUser(null);
        setAdminData(null);
        setIsPendingUser(false);
        setIsDenied(false);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        await signOut(auth);
        setUser(null);
        setAdminData(null);
        setIsPendingUser(false);
        setIsDenied(false);
        setLoading(false);
        return;
      }

      const data = await res.json();
      setUser(currentUser);
      setAdminData(data);
      setIsPendingUser(false);
      setIsDenied(false);
    } catch (err) {
      console.error("Auth error:", err);
      await signOut(auth);
      setUser(null);
      setAdminData(null);
      setIsPendingUser(false);
      setIsDenied(false);
    } finally {
      setLoading(false);
    }
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
    setLoading(true);
    await syncUser(currentUser);
  }, [applyLocalAdminSession, syncUser]);

  const signInLocalAdmin = useCallback(() => {
    if (!startLocalAdminSession()) return false;
    applyLocalAdminSession();
    return true;
  }, [applyLocalAdminSession]);

  const logout = useCallback(async () => {
    clearLocalAdminSession();
    await signOut(auth).catch(() => {});
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
    const timeout = setTimeout(() => {
      if (!settled) {
        setLoading(false);
      }
    }, AUTH_STATE_TIMEOUT_MS);

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      settled = true;
      clearTimeout(timeout);
      if (hasLocalAdminSession()) {
        applyLocalAdminSession();
        return;
      }
      syncUser(currentUser);
    }, (err) => {
      settled = true;
      clearTimeout(timeout);
      console.error("Auth state error:", err);
      setLoading(false);
    });
    return () => {
      clearTimeout(timeout);
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
