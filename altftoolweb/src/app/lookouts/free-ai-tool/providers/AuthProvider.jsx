"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { db, getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";
import { toolId } from "../lib/toolId";

const AuthContext = createContext(null);

const LEADS_COLLECTION = "freeAiToolUsers";

function toAppUser(firebaseUser) {
  if (!firebaseUser) return null;
  return { uid: firebaseUser.uid, email: firebaseUser.email || "" };
}

function friendlyAuthError(error) {
  const code = error?.code || "";
  if (code.includes("email-already-in-use")) return "An account with this email already exists — try signing in instead.";
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) {
    return "Incorrect email or password.";
  }
  if (code.includes("weak-password")) return "Password must be at least 6 characters.";
  if (code.includes("invalid-email")) return "Enter a valid email address.";
  if (code.includes("popup-closed-by-user")) return "Sign-in was cancelled.";
  return error?.message || "Something went wrong. Please try again.";
}

// Records the signed-in user's email against their own uid — a doc a user
// can only write to their own uid keeps this safe under the standard
// Firestore rule `allow write: if request.auth.uid == userId`.
async function recordLead(firebaseUser) {
  try {
    const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
    await setDoc(
      doc(db, LEADS_COLLECTION, firebaseUser.uid),
      { email: firebaseUser.email || "", lastSeenAt: serverTimestamp() },
      { merge: true },
    );
  } catch (error) {
    // Never block the tool-open flow on analytics-style bookkeeping.
    console.error("Failed to record free-ai-tool lead:", error);
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [savedToolIds, setSavedToolIds] = useState(new Set());
  const pendingActionRef = useRef(null);
  // Deferred actions (run after a sign-in prompt resolves) must read the
  // freshest user, not whatever `user` was closed over when the action was
  // created while still signed out — a plain ref sidesteps that staleness.
  const userRef = useRef(null);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    let unsubscribe = () => {};
    let cancelled = false;

    (async () => {
      const auth = await getFirebaseAuth();
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

  // Keep the saved-tools list live for the signed-in user (syncs across
  // tabs/devices); clears immediately on sign-out.
  useEffect(() => {
    if (!user) {
      setSavedToolIds(new Set());
      return undefined;
    }
    let unsubscribe = () => {};
    let cancelled = false;

    (async () => {
      try {
        const { doc, onSnapshot } = await import("firebase/firestore");
        unsubscribe = onSnapshot(doc(db, LEADS_COLLECTION, user.uid), (snap) => {
          if (cancelled) return;
          const saved = snap.data()?.savedTools;
          setSavedToolIds(new Set(Array.isArray(saved) ? saved : []));
        });
      } catch (error) {
        console.error("Failed to subscribe to saved tools:", error);
      }
    })();

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [user]);

  const signUp = useCallback(async (email, password) => {
    if (!isFirebaseConfigured) throw new Error("Sign-up isn't configured yet — add NEXT_PUBLIC_FIREBASE_* keys to enable it.");
    try {
      const auth = await getFirebaseAuth();
      const { createUserWithEmailAndPassword } = await import("firebase/auth");
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      setUser(toAppUser(credential.user));
      await recordLead(credential.user);
    } catch (error) {
      throw new Error(friendlyAuthError(error));
    }
  }, []);

  const signIn = useCallback(async (email, password) => {
    if (!isFirebaseConfigured) throw new Error("Sign-in isn't configured yet — add NEXT_PUBLIC_FIREBASE_* keys to enable it.");
    try {
      const auth = await getFirebaseAuth();
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      const credential = await signInWithEmailAndPassword(auth, email, password);
      await recordLead(credential.user);
    } catch (error) {
      throw new Error(friendlyAuthError(error));
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!isFirebaseConfigured) throw new Error("Sign-in isn't configured yet — add NEXT_PUBLIC_FIREBASE_* keys to enable it.");
    try {
      const auth = await getFirebaseAuth();
      const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
      const credential = await signInWithPopup(auth, new GoogleAuthProvider());
      await recordLead(credential.user);
    } catch (error) {
      throw new Error(friendlyAuthError(error));
    }
  }, []);

  /** Run `action` now if signed in; otherwise stash it and prompt for auth.
   *  AuthDialog calls resolveAuthPrompt() after a successful sign-in/up,
   *  which runs the stashed action (opening the tool link) and closes. */
  const requireAuth = useCallback(
    (action) => {
      if (user) {
        action();
        return;
      }
      pendingActionRef.current = action;
      setAuthPromptOpen(true);
    },
    [user],
  );

  /** Toggle a tool's saved/bookmarked state — gated behind sign-in like
   *  requireAuth's other actions, so an anonymous click prompts auth first
   *  and then applies the save once the user is signed in. */
  const toggleSaveTool = useCallback(
    (tool) => {
      const id = toolId(tool);
      requireAuth(async () => {
        const currentUser = userRef.current;
        if (!currentUser) return;
        try {
          const { doc, setDoc, arrayUnion, arrayRemove } = await import("firebase/firestore");
          const ref = doc(db, LEADS_COLLECTION, currentUser.uid);
          const alreadySaved = savedToolIds.has(id);
          await setDoc(ref, { savedTools: alreadySaved ? arrayRemove(id) : arrayUnion(id) }, { merge: true });
        } catch (error) {
          console.error("Failed to toggle saved tool:", error);
        }
      });
    },
    [requireAuth, savedToolIds],
  );

  const isToolSaved = useCallback((tool) => savedToolIds.has(toolId(tool)), [savedToolIds]);

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

  const value = useMemo(
    () => ({
      user,
      loading,
      authConfigured: isFirebaseConfigured,
      signUp,
      signIn,
      signInWithGoogle,
      requireAuth,
      authPromptOpen,
      closeAuthPrompt,
      resolveAuthPrompt,
      savedToolIds,
      toggleSaveTool,
      isToolSaved,
    }),
    [
      user,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      requireAuth,
      authPromptOpen,
      closeAuthPrompt,
      resolveAuthPrompt,
      savedToolIds,
      toggleSaveTool,
      isToolSaved,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
