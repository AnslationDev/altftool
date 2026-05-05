"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

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
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    setLoading(true);
    await syncUser(currentUser);
  }, [syncUser]);

  useEffect(() => {
    let settled = false;
    const timeout = setTimeout(() => {
      if (!settled) {
        setLoading(false);
      }
    }, AUTH_STATE_TIMEOUT_MS);

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      settled = true;
      clearTimeout(timeout);
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
  }, [syncUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        adminData,
        loading,
        isPendingUser,
        isDenied,
        isSuperAdmin: adminData?.roleType === "superadmin",
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
