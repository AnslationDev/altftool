// Client-side memory for the Housing Needs email offer.
//
// Two facts are remembered in localStorage:
//   - subscribed: the visitor submitted their email once. The hero offer then
//     never reappears on any page, and the mid-page band hides itself.
//   - dismissed pages: the visitor closed (or submitted) the offer on a given
//     page. Until then the offer reappears on every visit; once dismissed or
//     submitted on a page, it stops appearing there.
//
// Every accessor is guarded — localStorage can throw in private mode / SSR —
// and degrades to "nothing remembered", so the offer still behaves sanely.

const SUBSCRIBED_KEY = "hn-lead:subscribed";
const DISMISSED_KEY = "hn-lead:dismissed-pages";
export const SUBSCRIBED_EVENT = "hn-lead:subscribed";

export function isSubscribed() {
  try {
    return window.localStorage.getItem(SUBSCRIBED_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Record the visitor as subscribed. `notify` dispatches a window event so other
 * components in this tab (e.g. the mid-page band) can react live. The band
 * passes notify=false when it is itself the source, so its own success message
 * isn't yanked away by the very event it fired.
 */
export function markSubscribed(notify = true) {
  try {
    window.localStorage.setItem(SUBSCRIBED_KEY, "1");
  } catch {
    /* private mode — this tab is still synced via the event below */
  }
  if (notify) {
    try {
      window.dispatchEvent(new CustomEvent(SUBSCRIBED_EVENT));
    } catch {
      /* no window (SSR) — nothing to notify */
    }
  }
}

function readDismissed() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(DISMISSED_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function hasDismissedPage(pageKey) {
  return readDismissed().includes(pageKey);
}

export function markPageDismissed(pageKey) {
  try {
    const dismissed = readDismissed();
    if (!dismissed.includes(pageKey)) {
      dismissed.push(pageKey);
      window.localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissed));
    }
  } catch {
    /* can't persist — the offer simply may reappear on a later visit */
  }
}

export function onSubscribed(handler) {
  window.addEventListener(SUBSCRIBED_EVENT, handler);
  return () => window.removeEventListener(SUBSCRIBED_EVENT, handler);
}
