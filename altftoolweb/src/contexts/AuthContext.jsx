"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * Site-wide Firebase Auth state.
 *
 * firebase/auth is imported lazily on the client after hydration so the
 * auth SDK never lands in the shared/base chunks — pages that never touch
 * auth pay nothing at parse time and only a deferred fetch afterwards.
 */
const AuthContext = createContext({
  user: null,
  loading: true,
  signOutUser: async () => {},
});

let authModulePromise = null;

/** Lazy singleton: { auth, api } — Firebase Auth instance + the SDK. */
export function loadFirebaseAuth() {
  if (!authModulePromise) {
    authModulePromise = Promise.all([
      import("@/lib/firebase"),
      import("firebase/auth"),
    ])
      .then(([{ firebaseApp }, api]) => ({
        auth: api.getAuth(firebaseApp),
        api,
      }))
      .catch((err) => {
        // Reset the cache so the next call retries the import instead of
        // replaying this same rejection for the rest of the page session.
        authModulePromise = null;
        throw err;
      });
  }
  return authModulePromise;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = () => {};
    let cancelled = false;

    // Defer SDK download until the browser is idle — keeps hydration clean.
    const start = () => {
      loadFirebaseAuth()
        .then(({ auth, api }) => {
          if (cancelled) return;
          unsubscribe = api.onAuthStateChanged(auth, (nextUser) => {
            setUser(nextUser);
            setLoading(false);
          });
        })
        .catch(() => {
          if (!cancelled) setLoading(false);
        });
    };

    const idleId =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback(start, { timeout: 4000 })
        : window.setTimeout(start, 1200);

    return () => {
      cancelled = true;
      if (typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      } else {
        window.clearTimeout(idleId);
      }
      unsubscribe();
    };
  }, []);

  const signOutUser = useCallback(async () => {
    const { auth, api } = await loadFirebaseAuth();
    await api.signOut(auth);
  }, []);

  const value = useMemo(
    () => ({ user, loading, signOutUser }),
    [user, loading, signOutUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
