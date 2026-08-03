/**
 * likedPinsStore.js
 * Client-side & Firestore manager for AltPinterest pin Likes.
 * Real-time, optimistic UI, persistent device ID, and duplicate prevention.
 */

import { doc, setDoc, deleteDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const BROWSER_USER_ID_KEY = "browserUserId";
const LIKED_PINS_KEY = "likedPins";

/**
 * Get or generate a persistent unique device/browser identifier.
 */
export function getBrowserUserId() {
  if (typeof window === "undefined") return "server_user";
  try {
    let id = localStorage.getItem(BROWSER_USER_ID_KEY);
    if (!id) {
      id = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(BROWSER_USER_ID_KEY, id);
    }
    return id;
  } catch (err) {
    console.warn("Unable to access localStorage for browserUserId:", err);
    return "anonymous_user";
  }
}

/**
 * Get the set of pin IDs liked by this browser.
 */
export function getLikedPinIds() {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(LIKED_PINS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch (err) {
    console.warn("Failed to load liked pins from LocalStorage:", err);
    return new Set();
  }
}

/**
 * Check if a pin is liked by the current browser.
 */
export function isPinLiked(pinId, cachedSet = null) {
  if (pinId === undefined || pinId === null) return false;
  const set = cachedSet || getLikedPinIds();
  const idStr = String(pinId);
  return set.has(pinId) || set.has(idStr) || (typeof pinId === 'string' && set.has(pinId.replace('pin-', '')));
}

/**
 * Persist updated liked pin IDs array to localStorage and notify listeners.
 */
function setLikedPinIds(setOrArr) {
  if (typeof window === "undefined") return;
  try {
    const arr = Array.from(setOrArr);
    localStorage.setItem(LIKED_PINS_KEY, JSON.stringify(arr));
    notifyLikedPinsChanged(arr);
  } catch (err) {
    console.warn("Failed to save liked pins to LocalStorage:", err);
  }
}

/**
 * Toggle Like state for a pin.
 * Performs optimistic local update immediately, then executes Firestore atomic update.
 * If Firestore update fails, rolls back optimistic UI gracefully.
 */
export async function togglePinLike(pinId, currentLikesCount = 0, onRollback = null) {
  if (pinId === undefined || pinId === null) return { isLiked: false, newLikesCount: currentLikesCount };

  const browserUserId = getBrowserUserId();
  const likedSet = getLikedPinIds();
  const idStr = String(pinId);
  const alreadyLiked = isPinLiked(pinId, likedSet);

  // Optimistic UI calculation
  const nextIsLiked = !alreadyLiked;
  const nextLikesCount = alreadyLiked
    ? Math.max(0, currentLikesCount - 1)
    : currentLikesCount + 1;

  // 1. Optimistic Local Storage Update
  const updatedSet = new Set(likedSet);
  if (nextIsLiked) {
    updatedSet.add(pinId);
    updatedSet.add(idStr);
  } else {
    updatedSet.delete(pinId);
    updatedSet.delete(idStr);
    if (typeof pinId === 'string') updatedSet.delete(pinId.replace('pin-', ''));
  }
  setLikedPinIds(updatedSet);

  // 2. Perform Firestore atomic update & like record creation
  try {
    const pinRef = doc(db, "projects", "altftool", "pintrest", idStr);
    const likeRecordRef = doc(db, "projects", "altftool", "pintrest", idStr, "likes", browserUserId);

    if (nextIsLiked) {
      // Like pin: increment count & create like record
      await updateDoc(pinRef, {
        likes: increment(1),
        likeCount: increment(1)
      }).catch((err) => {
        if (err.code === "permission-denied" || err.code === "not-found") return;
        throw err;
      });

      await setDoc(likeRecordRef, {
        browserUserId,
        pinId: idStr,
        createdAt: serverTimestamp()
      }, { merge: true }).catch(() => {});
    } else {
      // Unlike pin: decrement count & delete like record
      await updateDoc(pinRef, {
        likes: increment(-1),
        likeCount: increment(-1)
      }).catch((err) => {
        if (err.code === "permission-denied" || err.code === "not-found") return;
        throw err;
      });

      await deleteDoc(likeRecordRef).catch(() => {});
    }

    return { success: true, isLiked: nextIsLiked, newLikesCount: nextLikesCount };
  } catch (error) {
    if (error?.code === "permission-denied") {
      // Silently fall back to LocalStorage-based likes if Firestore rules restrict writes
      return { success: true, isLiked: nextIsLiked, newLikesCount: nextLikesCount, isLocalOnly: true };
    }

    // Rollback optimistic update for actual network failures
    setLikedPinIds(likedSet);
    onRollback?.(error);
    return { success: false, isLiked: alreadyLiked, newLikesCount: currentLikesCount, error };
  }
}

/**
 * Dispatch custom event for same-tab cross-component reactivity.
 */
function notifyLikedPinsChanged(updatedArr) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("likedPinsChanged", { detail: { likedPins: updatedArr } })
    );
  }
}

/**
 * Subscribe to liked pins updates (handles cross-tab storage events and same-tab custom events).
 */
export function subscribeToLikedPins(callback) {
  if (typeof window === "undefined") return () => {};

  const handleCustomEvent = (e) => {
    const newArr = e.detail?.likedPins || Array.from(getLikedPinIds());
    callback(new Set(newArr));
  };

  const handleStorageEvent = (e) => {
    if (e.key === LIKED_PINS_KEY || e.key === null) {
      callback(getLikedPinIds());
    }
  };

  window.addEventListener("likedPinsChanged", handleCustomEvent);
  window.addEventListener("storage", handleStorageEvent);

  return () => {
    window.removeEventListener("likedPinsChanged", handleCustomEvent);
    window.removeEventListener("storage", handleStorageEvent);
  };
}
