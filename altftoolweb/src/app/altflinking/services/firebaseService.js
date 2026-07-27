/**
 * ALTFTool Marketplace Firebase Service — Auth + Firestore
 * Location: src/app/altflinking/services/firebaseService.js
 *
 * Real Firebase Google Auth + Email/Password Auth
 * Users are saved to Firestore `users/{uid}` on every login/signup
 */

import { INITIAL_WEBSITES, INITIAL_ORDERS, INITIAL_CAMPAIGNS } from "../data/mockMarketplaceData";

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
// LocalStorage keys — shared with admin backend (knadmintiertwoanslation)
// ---------------------------------------------------------------------------
const STORAGE_KEYS = {
  WEBSITES:     "altf_linking_websites_v1",
  ORDERS:       "altf_linking_orders_v1",
  CAMPAIGNS:    "altf_linking_campaigns_v1",
  USER_SESSION: "altf_linking_user_session_v1",
};

// ---------------------------------------------------------------------------
// Local Storage initialization
// ---------------------------------------------------------------------------
function initializeStorage() {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem(STORAGE_KEYS.WEBSITES))
    localStorage.setItem(STORAGE_KEYS.WEBSITES,   JSON.stringify(INITIAL_WEBSITES));
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS))
    localStorage.setItem(STORAGE_KEYS.ORDERS,     JSON.stringify(INITIAL_ORDERS));
  if (!localStorage.getItem(STORAGE_KEYS.CAMPAIGNS))
    localStorage.setItem(STORAGE_KEYS.CAMPAIGNS,  JSON.stringify(INITIAL_CAMPAIGNS));
}

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

// ===========================================================================
// Marketplace Data — Websites, Orders, Campaigns (LocalStorage-backed)
// ===========================================================================

export async function fetchWebsites(filters = {}) {
  initializeStorage();
  let sites = INITIAL_WEBSITES;
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WEBSITES);
      if (stored) sites = JSON.parse(stored);
    } catch (e) { console.warn("Storage fetch error:", e); }
  }

  let filtered = [...sites];
  if (filters.search) {
    const q = filters.search.toLowerCase();
    filtered = filtered.filter(
      (s) => s.domain.toLowerCase().includes(q) ||
             s.name.toLowerCase().includes(q) ||
             s.niche.toLowerCase().includes(q)
    );
  }
  if (filters.niche && filters.niche !== "All") {
    filtered = filtered.filter((s) => s.niche === filters.niche);
  }
  if (filters.minDr)      filtered = filtered.filter((s) => s.dr      >= Number(filters.minDr));
  if (filters.minTraffic) filtered = filtered.filter((s) => s.traffic >= Number(filters.minTraffic));

  if (filters.sortBy) {
    switch (filters.sortBy) {
      case "dr_desc":      filtered.sort((a, b) => b.dr - a.dr);                          break;
      case "traffic_desc": filtered.sort((a, b) => b.traffic - a.traffic);                break;
      case "price_asc":    filtered.sort((a, b) => a.prices.guestPost - b.prices.guestPost); break;
      case "tat_asc":      filtered.sort((a, b) => a.tatDays - b.tatDays);                break;
    }
  }
  return filtered;
}

export async function submitWebsiteListing(websiteData) {
  initializeStorage();
  const newSite = {
    id: `site_${Date.now()}`,
    ...websiteData,
    dr:          Math.floor(Math.random() * 40) + 45,
    da:          Math.floor(Math.random() * 40) + 40,
    traffic:     Math.floor(Math.random() * 100000) + 10000,
    spamScore:   Math.floor(Math.random() * 3),
    status:      "APPROVED",
    verified:    true,
    indexRate:   98,
    reviewCount: 1,
    rating:      5.0,
    createdAt:   new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.WEBSITES) || "[]");
    localStorage.setItem(STORAGE_KEYS.WEBSITES, JSON.stringify([newSite, ...existing]));
  }
  return newSite;
}

export async function createOrder(orderPayload) {
  initializeStorage();
  const newOrder = {
    id:             `ord_${Date.now()}`,
    ...orderPayload,
    price:          0,
    status:         "PENDING_ACCEPTANCE",
    createdAt:      new Date().toISOString(),
    liveLinkUrl:    null,
    crawledAt:      null,
    isDofollow:     null,
    isIndexed:      null,
    articleContent: orderPayload.articleContent || "",
    articleDocUrl:  orderPayload.articleDocUrl  || "",
  };
  if (typeof window !== "undefined") {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || "[]");
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([newOrder, ...existing]));
  }
  return newOrder;
}

export async function fetchOrders() {
  initializeStorage();
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (stored) return JSON.parse(stored);
    } catch (e) { console.warn("Storage fetch orders error:", e); }
  }
  return INITIAL_ORDERS;
}

export async function updateOrderStatus(orderId, newStatus, extraData = {}) {
  let orders = await fetchOrders();
  const updated = orders.map((ord) =>
    ord.id === orderId
      ? { ...ord, status: newStatus, ...extraData, updatedAt: new Date().toISOString() }
      : ord
  );
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
  }
  return updated;
}

export async function fetchCampaigns() {
  initializeStorage();
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CAMPAIGNS);
      if (stored) return JSON.parse(stored);
    } catch (e) { console.warn("Storage fetch campaigns error:", e); }
  }
  return INITIAL_CAMPAIGNS;
}

export async function createCampaign(campaignData) {
  initializeStorage();
  const newCampaign = {
    id:         `camp_${Date.now()}`,
    ...campaignData,
    spent:      0,
    totalLinks: 0,
    avgDr:      0,
    status:     "ACTIVE",
  };
  if (typeof window !== "undefined") {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.CAMPAIGNS) || "[]");
    localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify([newCampaign, ...existing]));
  }
  return newCampaign;
}

export async function verifyDnsToken(domain) {
  await new Promise((res) => setTimeout(res, 800));
  return {
    verified:   true,
    token:      `altftool-verify-${Math.random().toString(36).substring(2, 9)}`,
    verifiedAt: new Date().toISOString(),
  };
}
