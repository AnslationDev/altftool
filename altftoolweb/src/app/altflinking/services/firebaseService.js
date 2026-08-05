/**
 * ALTFTool Marketplace Firebase Service — Auth + Firestore
 * Location: src/app/altflinking/services/firebaseService.js
 *
 * Real Firebase Google Auth + Email/Password Auth
 * Users are saved to Firestore `users/{uid}` on every login/signup
 */

// ---------------------------------------------------------------------------
// Firebase imports — lazy so SSR doesn't break when env vars are missing
// ---------------------------------------------------------------------------
let _auth = null;
let _db   = null;
let _googleProvider = null;

async function getFirebaseModules() {
  if (_auth) return { auth: _auth, db: _db, googleProvider: _googleProvider };
  try {
    const { auth, db, googleProvider } = await import("./firebase");
    _auth = auth;
    _db   = db;
    _googleProvider = googleProvider;
    return { auth, db, googleProvider };
  } catch (e) {
    console.error("Firebase init error:", e);
    return null;
  }
}

// ---------------------------------------------------------------------------
// LocalStorage key used only to restore the authenticated UI session.
// ---------------------------------------------------------------------------
const STORAGE_KEYS = {
  USER_SESSION: "altf_linking_user_session_v1",
};

// ---------------------------------------------------------------------------
// Firestore helper — save/update user document on every login
// ---------------------------------------------------------------------------
async function saveUserToFirestore(db, firebaseUser, role = "BUYER") {
  try {
    const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
    const userRef = doc(db, "users", firebaseUser.uid);
    await setDoc(
      userRef,
      {
        uid:         firebaseUser.uid,
        displayName: firebaseUser.displayName || "",
        email:       firebaseUser.email || "",
        photoURL:    firebaseUser.photoURL || "",
        role,
        platform:    "altflinking",
        updatedAt:   serverTimestamp(),
      },
      { merge: true } // keeps existing fields (like role) if user already exists
    );
  } catch (e) {
    console.warn("Firestore save error (non-fatal):", e.message);
    // Non-fatal — auth still succeeds even if Firestore write fails
  }
}

// ---------------------------------------------------------------------------
// Firestore helper — fetch user document (for role & profile on restore)
// ---------------------------------------------------------------------------
async function fetchUserFromFirestore(db, uid) {
  try {
    const { doc, getDoc } = await import("firebase/firestore");
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    console.warn("Firestore read error (non-fatal):", e.message);
    return null;
  }
}

// ===========================================================================
// AUTH: Google Sign-In Popup
// ===========================================================================
export async function loginWithGoogle(role = "BUYER") {
  const modules = await getFirebaseModules();
  if (!modules) throw new Error("Firebase not configured. Add keys to .env.local");

  const { auth, db, googleProvider } = modules;
  const { signInWithPopup } = await import("firebase/auth");

  const result = await signInWithPopup(auth, googleProvider);
  const firebaseUser = result.user;

  // Persist user to Firestore
  await saveUserToFirestore(db, firebaseUser, role);

  // Fetch existing profile (may have different role from previous login)
  const profile = await fetchUserFromFirestore(db, firebaseUser.uid);

  const session = {
    uid:         firebaseUser.uid,
    name:        firebaseUser.displayName || firebaseUser.email,
    email:       firebaseUser.email,
    photoURL:    firebaseUser.photoURL || null,
    role:        profile?.role || role,
    verified:    firebaseUser.emailVerified,
    createdAt:   firebaseUser.metadata?.creationTime,
    provider:    "google",
  };

  // Persist session to localStorage for offline/reload
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(session));
  }

  return session;
}

// ===========================================================================
// AUTH: Email Sign-Up (new user registration)
// ===========================================================================
export async function signUpWithEmail(email, password, role = "BUYER") {
  const modules = await getFirebaseModules();
  if (!modules) throw new Error("Firebase not configured. Add keys to .env.local");

  const { auth, db } = modules;
  const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth");

  const result = await createUserWithEmailAndPassword(auth, email, password);
  const firebaseUser = result.user;

  await saveUserToFirestore(db, firebaseUser, role);

  const session = {
    uid:      firebaseUser.uid,
    name:     firebaseUser.displayName || email.split("@")[0],
    email:    firebaseUser.email,
    photoURL: null,
    role,
    verified: false,
    provider: "email",
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(session));
  }

  return session;
}

// ===========================================================================
// AUTH: Email Sign-In (existing user)
// ===========================================================================
export async function signInWithEmail(email, password) {
  const modules = await getFirebaseModules();
  if (!modules) throw new Error("Firebase not configured. Add keys to .env.local");

  const { auth, db } = modules;
  const { signInWithEmailAndPassword } = await import("firebase/auth");

  const result = await signInWithEmailAndPassword(auth, email, password);
  const firebaseUser = result.user;

  // Fetch their stored profile (role etc)
  const profile = await fetchUserFromFirestore(db, firebaseUser.uid);

  // Update last-seen timestamp
  await saveUserToFirestore(db, firebaseUser, profile?.role || "BUYER");

  const session = {
    uid:      firebaseUser.uid,
    name:     firebaseUser.displayName || email.split("@")[0],
    email:    firebaseUser.email,
    photoURL: firebaseUser.photoURL || null,
    role:     profile?.role || "BUYER",
    verified: firebaseUser.emailVerified,
    provider: "email",
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(session));
  }

  return session;
}

// ===========================================================================
// AUTH: Sign Out
// ===========================================================================
export async function logoutUser() {
  const modules = await getFirebaseModules();
  if (modules) {
    const { signOut } = await import("firebase/auth");
    await signOut(modules.auth);
  }
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEYS.USER_SESSION);
  }
  return true;
}

// ===========================================================================
// AUTH: Auth State Observer — call in useEffect to auto-restore session
// ===========================================================================
export function subscribeToAuthState(callback) {
  let unsubscribe = () => {};
  getFirebaseModules().then(async (modules) => {
    if (!modules) {
      // Fallback: restore from localStorage if Firebase not configured
      const stored = typeof window !== "undefined"
        ? localStorage.getItem(STORAGE_KEYS.USER_SESSION)
        : null;
      callback(stored ? JSON.parse(stored) : null);
      return;
    }
    const { onAuthStateChanged } = await import("firebase/auth");
    const { auth, db } = modules;
    unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await fetchUserFromFirestore(db, firebaseUser.uid);
        const session = {
          uid:      firebaseUser.uid,
          name:     firebaseUser.displayName || firebaseUser.email,
          email:    firebaseUser.email,
          photoURL: firebaseUser.photoURL || null,
          role:     profile?.role || "BUYER",
          verified: firebaseUser.emailVerified,
          provider: firebaseUser.providerData?.[0]?.providerId || "unknown",
        };
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(session));
        }
        callback(session);
      } else {
        if (typeof window !== "undefined") {
          localStorage.removeItem(STORAGE_KEYS.USER_SESSION);
        }
        callback(null);
      }
    });
  });
  // Return cleanup function
  return () => unsubscribe();
}
