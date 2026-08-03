/**
 * savedPinsStore.js
 * Client-side Local Storage manager for AltPinterest saved pins.
 * Fast, robust, synchronous, and reactive via CustomEvent & storage listener.
 */

const STORAGE_KEY = "savedPins";

/**
 * Safely parse JSON from localStorage with error handling.
 */
export function getSavedPins() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Failed to load saved pins from LocalStorage:", error);
    return [];
  }
}

/**
 * Returns a Set of all saved pin IDs (includes string and numeric variations).
 */
export function getSavedPinIdsSet() {
  const pins = getSavedPins();
  const set = new Set();
  pins.forEach((pin) => {
    if (pin && pin.id !== undefined && pin.id !== null) {
      set.add(pin.id);
      set.add(String(pin.id));
      if (typeof pin.id === 'string' && pin.id.startsWith('pin-')) {
        set.add(pin.id.replace('pin-', ''));
      } else if (typeof pin.id === 'number' || !isNaN(Number(pin.id))) {
        set.add(`pin-${pin.id}`);
      }
    }
  });
  return set;
}

/**
 * Checks if a pin is saved by its ID.
 */
export function isPinSaved(pinId, cachedSet = null) {
  if (pinId === undefined || pinId === null) return false;
  const set = cachedSet || getSavedPinIdsSet();
  if (set.has(pinId)) return true;
  if (set.has(String(pinId))) return true;
  if (typeof pinId === 'string' && set.has(pinId.replace('pin-', ''))) return true;
  if (typeof pinId === 'number' && set.has(`pin-${pinId}`)) return true;
  return false;
}

/**
 * Helper to normalize pin metadata before persisting to localStorage.
 */
function normalizePinForStorage(pin) {
  if (!pin) return null;
  const id = pin.id !== undefined && pin.id !== null ? pin.id : `pin-${Date.now()}`;
  const image =
    typeof pin.image === "string" && pin.image ? pin.image :
    typeof pin.src === "string" && pin.src ? pin.src :
    typeof pin.url === "string" && pin.url ? pin.url :
    typeof pin.img === "string" && pin.img ? pin.img : "";

  return {
    id: id,
    title: pin.title || pin.name || "Saved Inspiration",
    image: image || "/altpintrest-images/Listitem → Group - Pin card.png",
    category: pin.category || pin.Category || pin.tag || "Inspiration",
    description: pin.description || pin.desc || "",
    author: pin.author || pin.user || "",
    height: pin.height || "h-[320px]",
    savedAt: pin.savedAt || Date.now(),
    gallery: Array.isArray(pin.gallery) ? pin.gallery : [],
    originalData: pin.originalData || null,
  };
}

/**
 * Save a pin to LocalStorage. Prevents duplicate entries.
 * Triggers custom 'savedPinsChanged' event.
 */
export function savePin(pin) {
  if (typeof window === "undefined" || !pin) return false;
  try {
    const current = getSavedPins();
    const pinId = String(pin.id !== undefined && pin.id !== null ? pin.id : "");

    // Duplicate prevention
    const exists = current.some((p) => {
      const pId = String(p.id);
      return pId === pinId || pId.replace('pin-', '') === pinId.replace('pin-', '');
    });
    if (exists) return false;

    const normalized = normalizePinForStorage(pin);
    if (!normalized) return false;

    const updated = [normalized, ...current];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    notifySavedPinsChanged(updated);
    return true;
  } catch (error) {
    console.error("Failed to save pin to LocalStorage:", error);
    return false;
  }
}

/**
 * Remove a pin from LocalStorage by ID.
 * Triggers custom 'savedPinsChanged' event.
 */
export function unsavePin(pinId) {
  if (typeof window === "undefined" || pinId === undefined || pinId === null) return false;
  try {
    const current = getSavedPins();
    const targetId = String(pinId);
    const updated = current.filter((p) => {
      const pId = String(p.id);
      if (pId === targetId) return false;
      if (pId.replace('pin-', '') === targetId.replace('pin-', '')) return false;
      return true;
    });

    if (updated.length === current.length) return false;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    notifySavedPinsChanged(updated);
    return true;
  } catch (error) {
    console.error("Failed to unsave pin from LocalStorage:", error);
    return false;
  }
}

/**
 * Toggle save state for a pin.
 * Returns true if now saved, false if unsaved.
 */
export function toggleSavePin(pinOrId, fullPin = null) {
  const pinObj = typeof pinOrId === "object" && pinOrId !== null ? pinOrId : fullPin;
  const pinId = pinObj ? pinObj.id : pinOrId;

  if (isPinSaved(pinId)) {
    unsavePin(pinId);
    return false;
  } else {
    if (pinObj) {
      savePin(pinObj);
    } else {
      savePin({ id: pinId, title: "Saved Inspiration", category: "Inspiration" });
    }
    return true;
  }
}

/**
 * Dispatch custom event for same-tab cross-component reactivity.
 */
function notifySavedPinsChanged(updatedList) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("savedPinsChanged", { detail: { savedPins: updatedList } })
    );
  }
}

/**
 * Subscribe to saved pins updates (handles cross-tab storage events and same-tab custom events).
 */
export function subscribeToSavedPins(callback) {
  if (typeof window === "undefined") return () => {};

  const handleCustomEvent = (e) => {
    const newList = e.detail?.savedPins || getSavedPins();
    callback(newList);
  };

  const handleStorageEvent = (e) => {
    if (e.key === STORAGE_KEY || e.key === null) {
      callback(getSavedPins());
    }
  };

  window.addEventListener("savedPinsChanged", handleCustomEvent);
  window.addEventListener("storage", handleStorageEvent);

  return () => {
    window.removeEventListener("savedPinsChanged", handleCustomEvent);
    window.removeEventListener("storage", handleStorageEvent);
  };
}
