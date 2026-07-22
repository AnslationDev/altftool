"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getImgPromptAuth, isAuthConfigured } from "../lib/firebase-auth";

const AuthContext = createContext(null);

function toAppUser(firebaseUser) {
  if (!firebaseUser) return null;
  return {
    uid: firebaseUser.uid,
    name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Creator",
    email: firebaseUser.email || "",
    avatarSeed: firebaseUser.uid,
  };
}

function friendlyAuthError(error) {
  const code = error?.code || "";
  if (code.includes("email-already-in-use")) return "An account with this email already exists — try signing in instead.";
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) return "Incorrect email or password.";
  if (code.includes("weak-password")) return "Password must be at least 6 characters.";
  if (code.includes("invalid-email")) return "Enter a valid email address.";
  if (code.includes("popup-closed-by-user")) return "Sign-in was cancelled.";
  return error?.message || "Something went wrong. Please try again.";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const pendingActionRef = useRef(null);

  useEffect(() => {
    let unsubscribe = () => {};
    let cancelled = false;

    (async () => {
      if (!isAuthConfigured) {
        setLoading(false);
        return;
      }
      const auth = await getImgPromptAuth();
      if (cancelled || !auth) {
        setLoading(false);
        return;
      }
      const { onAuthStateChanged } = await import("firebase/auth");
      unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(toAppUser(firebaseUser));
        setLoading(false);
      });
    })();

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const signUp = useCallback(async (name, email, password) => {
    if (!isAuthConfigured) throw new Error("Sign-up isn't configured yet — add NEXT_PUBLIC_FIREBASE_* keys to enable it.");
    try {
      const auth = await getImgPromptAuth();
      const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth");
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      if (name) await updateProfile(credential.user, { displayName: name });
      setUser(toAppUser({ ...credential.user, displayName: name || credential.user.displayName }));
    } catch (error) {
      throw new Error(friendlyAuthError(error));
    }
  }, []);

  const signIn = useCallback(async (email, password) => {
    if (!isAuthConfigured) throw new Error("Sign-in isn't configured yet — add NEXT_PUBLIC_FIREBASE_* keys to enable it.");
    try {
      const auth = await getImgPromptAuth();
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw new Error(friendlyAuthError(error));
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!isAuthConfigured) throw new Error("Sign-in isn't configured yet — add NEXT_PUBLIC_FIREBASE_* keys to enable it.");
    try {
      const auth = await getImgPromptAuth();
      const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error) {
      throw new Error(friendlyAuthError(error));
    }
  }, []);

  /** Run `action` now if signed in; otherwise stash it and prompt for auth.
   *  The global AuthDialog (mounted once in Providers) calls
   *  resolveAuthPrompt() after a successful sign-in/up, which runs the
   *  stashed action and closes the prompt. */
  const requireAuth = useCallback(
    (action) => {
      if (user) {
        action();
        return;
      }
      pendingActionRef.current = action;
      setAuthPromptOpen(true);
    },
    [user]
  );

  const closeAuthPrompt = useCallback(() => {
    pendingActionRef.current = null;
    setAuthPromptOpen(false);
  }, []);

  const resolveAuthPrompt = useCallback(() => {
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    setAuthPromptOpen(false);
    if (action) action();
  }, []);

  const signOut = useCallback(async () => {
    if (!isAuthConfigured) return;
    const auth = await getImgPromptAuth();
    const { signOut: firebaseSignOut } = await import("firebase/auth");
    await firebaseSignOut(auth);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      authConfigured: isAuthConfigured,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      requireAuth,
      authPromptOpen,
      closeAuthPrompt,
      resolveAuthPrompt,
    }),
    [
      user,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      requireAuth,
      authPromptOpen,
      closeAuthPrompt,
      resolveAuthPrompt,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
