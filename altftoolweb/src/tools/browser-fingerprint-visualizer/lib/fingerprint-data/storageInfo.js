

export async function getStorageInfo() {
  // --- localStorage ---
 
  const localStorageAvailable = (() => {
    try {
      const key = "__fp_test__";
      localStorage.setItem(key, "1");
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  })();

  // --- sessionStorage ---

  const sessionStorageAvailable = (() => {
    try {
      const key = "__fp_test__";
      sessionStorage.setItem(key, "1");
      sessionStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  })();

  // --- IndexedDB ---

  const indexedDBAvailable = (() => {
    try {
      return !!window.indexedDB;
    } catch {
      return false;
    }
  })();

  // --- Cookies ---
  const cookiesAvailable = navigator.cookieEnabled;

  // --- Cache API (Service Worker cache) ---
  const cacheAPIAvailable = "caches" in window;


  let storageQuota = null;
  try {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      storageQuota = {
        // Convert bytes to MB
        quota: Math.round(estimate.quota / 1024 / 1024),
        usage: Math.round(estimate.usage / 1024 / 1024),
      };
    }
  } catch {
    storageQuota = null;
  }

  const rawValue = [
    localStorageAvailable,
    sessionStorageAvailable,
    indexedDBAvailable,
    cookiesAvailable,
    cacheAPIAvailable,
  ].join("|");

  return {
    localStorage: localStorageAvailable,
    sessionStorage: sessionStorageAvailable,
    indexedDB: indexedDBAvailable,
    cookies: cookiesAvailable,
    cacheAPI: cacheAPIAvailable,
    storageQuota,
    rawValue,
  };
}