/**
 * Browser storage cleanup planner.
 *
 * A browser keeps at least a dozen separate stores, and "Clear browsing data"
 * does not empty all of them. This module holds a catalogue of those stores,
 * what each one costs you when it is wiped, and a planner that turns a goal
 * plus a few "keep this" preferences into an explicit clear list and keep list.
 *
 * Facts the catalogue relies on, all publicly documented browser behaviour:
 *  - Third-party cookies are blocked by default in Safari (Intelligent Tracking
 *    Prevention full third-party cookie blocking, since Safari 13.1, March 2020)
 *    and in Firefox (Total Cookie Protection, on by default since June 2022).
 *    Chrome blocks them in Incognito and partitions some of them, but still
 *    allows them by default in a normal window.
 *  - Safari's ITP deletes script-writable storage (localStorage, IndexedDB,
 *    service worker registrations, Cache API) seven days after the last user
 *    interaction with the site, so clearing cookies alone does not stop
 *    storage-based re-identification in other browsers.
 *  - Clearing a site's storage in Chrome and Edge also revokes that site's
 *    notification, location, camera and microphone permissions.
 *  - Session storage is scoped to a tab and is discarded when the tab closes.
 *  - Clearing local data does not clear the copy held in a sync account
 *    (Google Account, Firefox Account, iCloud); that has to be cleared server
 *    side as well.
 *  - HSTS state is a security feature. Clearing it downgrades the first
 *    connection to those sites back to plain HTTP.
 *
 * Informational only. Wiping saved passwords or autofill data is destructive
 * and cannot be undone from the browser.
 */

/** Weights are 0-5 scales used only to rank items relative to each other. */
export const MAX_WEIGHT = 5;

export const GOALS = [
  {
    id: "tracking",
    label: "Stop cross-site tracking",
    blurb: "Break the identifiers advertisers use to follow you between sites.",
  },
  {
    id: "space",
    label: "Reclaim disk space",
    blurb: "Empty the big caches without logging yourself out of everything.",
  },
  {
    id: "fix-site",
    label: "Fix one misbehaving site",
    blurb: "Clear the stale state that makes a site load an old build or loop on login.",
  },
  {
    id: "handover",
    label: "Hand the device to someone else",
    blurb: "Remove everything personal before a sale, repair or shared-desk handover.",
  },
  {
    id: "fingerprint",
    label: "Shrink the re-identification surface",
    blurb: "Clear every store that can hold a persistent ID, not just cookies.",
  },
];

export const GOAL_IDS = GOALS.map((goal) => goal.id);

export const KEEP_KEYS = ["keepLogins", "keepSitePrefs", "keepOfflineApps"];

export const KEEP_LABELS = {
  keepLogins: "Keep me signed in to the sites I use",
  keepSitePrefs: "Keep site preferences and granted permissions",
  keepOfflineApps: "Keep offline data for installed web apps",
};

/**
 * The catalogue.
 *  tracking  – how much of a cross-site identifier this store can hold (0-5)
 *  space     – typical share of profile disk usage (0-5)
 *  friction  – what clearing it costs you in day-to-day convenience (0-5)
 *  goals     – goals for which this store should be cleared
 *  keepIf    – the preference key that overrides the clear decision
 */
export const STORES = [
  {
    id: "third-party-cookies",
    label: "Third-party cookies",
    what: "Cookies set by domains other than the one in the address bar — ad networks, analytics, embedded widgets.",
    breaks: "Some embedded checkouts, single sign-on flows and comment widgets stop working until you allow them again.",
    tracking: 5,
    space: 1,
    friction: 1,
    goals: ["tracking", "handover", "fingerprint"],
    keepIf: null,
    note: "Safari and Firefox already block or fully partition these by default. In Chrome and Edge, blocking them is a setting, not a one-off clear.",
  },
  {
    id: "first-party-cookies",
    label: "First-party cookies",
    what: "Session and preference cookies set by the site you are actually on.",
    breaks: "You are signed out of every site, and every cookie banner asks again.",
    tracking: 2,
    space: 1,
    friction: 5,
    goals: ["tracking", "fix-site", "handover", "fingerprint"],
    keepIf: "keepLogins",
  },
  {
    id: "local-storage",
    label: "localStorage",
    what: "Key/value data written by page scripts. Commonly holds a login token and, on tracking scripts, a stable visitor ID.",
    breaks: "Signs you out of single-page apps and resets in-app settings such as theme and dismissed banners.",
    tracking: 4,
    space: 2,
    friction: 4,
    goals: ["tracking", "fix-site", "handover", "fingerprint"],
    keepIf: "keepLogins",
    note: "Clearing cookies alone leaves this behind, which is how a cleared cookie gets silently respawned.",
  },
  {
    id: "session-storage",
    label: "sessionStorage",
    what: "Per-tab scratch data. The browser discards it when the tab closes.",
    breaks: "Almost nothing — at worst you lose a half-filled form in an open tab.",
    tracking: 1,
    space: 1,
    friction: 1,
    goals: ["fix-site", "handover", "fingerprint"],
    keepIf: null,
  },
  {
    id: "indexeddb",
    label: "IndexedDB",
    what: "The browser's structured database. Offline mail, notes, chat history and document caches live here.",
    breaks: "Offline copies have to re-download, and unsent drafts held only in the browser are lost.",
    tracking: 4,
    space: 5,
    friction: 4,
    goals: ["tracking", "space", "fix-site", "handover", "fingerprint"],
    keepIf: "keepOfflineApps",
  },
  {
    id: "cache-storage",
    label: "Service workers and Cache Storage",
    what: "The offline app shell an installed web app registers, plus everything it has pre-cached.",
    breaks: "Offline mode stops working until you next open the site online.",
    tracking: 2,
    space: 5,
    friction: 3,
    goals: ["space", "fix-site", "handover", "fingerprint"],
    keepIf: "keepOfflineApps",
    note: "This is the usual cause of a site that keeps loading an old build after a deploy — a normal cache clear does not unregister the worker.",
  },
  {
    id: "http-cache",
    label: "HTTP cache (images, CSS, JavaScript)",
    what: "Ordinary cached responses. Usually the single largest folder in a browser profile.",
    breaks: "The next visit to every site is slower and uses more data. Nothing is lost.",
    tracking: 1,
    space: 5,
    friction: 1,
    goals: ["space", "fix-site", "handover"],
    keepIf: null,
  },
  {
    id: "site-permissions",
    label: "Site permissions",
    what: "Per-site grants for notifications, location, camera, microphone, clipboard and pop-ups.",
    breaks: "Sites you trust will prompt again; a site you had muted may start prompting.",
    tracking: 3,
    space: 0,
    friction: 3,
    goals: ["tracking", "handover", "fingerprint"],
    keepIf: "keepSitePrefs",
    note: "In Chrome and Edge, clearing a site's storage revokes its permissions as a side effect, so this is often cleared whether you meant to or not.",
  },
  {
    id: "browsing-history",
    label: "Browsing and download history",
    what: "The list of pages visited and files fetched, and the address-bar suggestions built from it.",
    breaks: "Address-bar autocomplete gets noticeably worse for a few weeks.",
    tracking: 1,
    space: 1,
    friction: 3,
    goals: ["handover"],
    keepIf: null,
    note: "History is local. Clearing it does not remove anything from the sites you visited or from a search account.",
  },
  {
    id: "autofill",
    label: "Autofill: addresses and payment cards",
    what: "Saved postal addresses, phone numbers and card details offered on checkout forms.",
    breaks: "You retype them next time.",
    tracking: 0,
    space: 0,
    friction: 2,
    goals: ["handover"],
    keepIf: null,
    destructive: true,
  },
  {
    id: "passwords",
    label: "Saved passwords and passkeys",
    what: "Credentials held in the browser's own password manager.",
    breaks: "You are locked out of anything whose password you do not know or have stored elsewhere.",
    tracking: 0,
    space: 0,
    friction: 5,
    goals: ["handover"],
    keepIf: null,
    destructive: true,
    note: "Export or move these to a password manager first. Deleting a synced passkey can also remove your only second factor for that account.",
  },
  {
    id: "extension-storage",
    label: "Extension storage",
    what: "Data each installed extension keeps for itself.",
    breaks: "Extension settings reset; some extensions sign you out.",
    tracking: 3,
    space: 2,
    friction: 3,
    goals: ["handover", "fingerprint"],
    keepIf: "keepSitePrefs",
    note: "Clear browsing data never touches this. Extensions have to be removed, or cleared from their own options page.",
  },
  {
    id: "sync-copy",
    label: "The copy in your sync account",
    what: "The server-side mirror of history, bookmarks, passwords and open tabs held by your browser account.",
    breaks: "Nothing locally, but this is the step people skip.",
    tracking: 3,
    space: 0,
    friction: 2,
    goals: ["handover", "fingerprint"],
    keepIf: null,
    note: "Clearing on one device can sync the deletion to the others, or can sync the data straight back. Sign out of sync before a local wipe, then clear the account copy from the account's own privacy page.",
  },
  {
    id: "hsts",
    label: "HSTS and certificate decisions",
    what: "The record of which sites promised to be HTTPS-only, plus any certificate exception you accepted.",
    breaks: "Clearing it means the first request to those sites can go out over plain HTTP again.",
    tracking: 2,
    space: 0,
    friction: 1,
    goals: [],
    keepIf: null,
    keepAlways: true,
    note: "Only clear this to undo a certificate exception you no longer want, or to fix a site stuck on a bad HSTS entry.",
  },
];

export const BROWSERS = [
  {
    id: "chrome",
    label: "Chrome",
    path: "Settings → Privacy and security → Delete browsing data (Ctrl/Cmd+Shift+Delete)",
    perSite: "Per-site storage and permissions: Settings → Privacy and security → Site settings → View permissions and data stored across sites",
    gap: "Extension storage and the copy in your Google Account are not covered by Delete browsing data.",
  },
  {
    id: "edge",
    label: "Edge",
    path: "Settings → Privacy, search, and services → Clear browsing data (Ctrl+Shift+Delete)",
    perSite: "Per-site storage and permissions: Settings → Cookies and site permissions → Manage and delete cookies and site data → See all cookies and site data",
    gap: "Extension storage and the Microsoft account copy are separate. Edge also offers a scheduled clear on close.",
  },
  {
    id: "firefox",
    label: "Firefox",
    path: "Settings → Privacy & Security → Cookies and Site Data → Clear Data (Ctrl/Cmd+Shift+Delete for history)",
    perSite: "Per-site storage: Settings → Privacy & Security → Cookies and Site Data → Manage Data. Permissions have their own Settings buttons.",
    gap: "Total Cookie Protection already isolates third-party cookies per site, so clearing them is maintenance rather than a fix.",
  },
  {
    id: "safari",
    label: "Safari",
    path: "macOS: Safari → Settings → Privacy → Manage Website Data. iOS/iPadOS: Settings → Apps → Safari → Clear History and Website Data",
    perSite: "macOS: Develop → Empty Caches empties the HTTP cache only. Manage Website Data covers cookies, localStorage and IndexedDB per site.",
    gap: "Clear History and Website Data on iOS is all-or-nothing and signs you out everywhere. ITP already expires script-writable storage after seven days without interaction.",
  },
];

export const BROWSER_IDS = BROWSERS.map((browser) => browser.id);

/** Cadence advice, in days, keyed by goal. */
export const CADENCE_DAYS = {
  tracking: 30,
  space: 90,
  "fix-site": 0,
  handover: 0,
  fingerprint: 7,
};

const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

const scorePercent = (chosen, all, field) => {
  const total = all.reduce((sum, item) => sum + item[field], 0);
  if (!(total > 0)) return 0;
  const got = chosen.reduce((sum, item) => sum + item[field], 0);
  return Math.round(clamp((got / total) * 100, 0, 100));
};

/**
 * Build a cleanup plan.
 *
 * @param {object} input
 * @param {string} input.goal     One of GOAL_IDS.
 * @param {string} input.browser  One of BROWSER_IDS.
 * @param {boolean} input.keepLogins
 * @param {boolean} input.keepSitePrefs
 * @param {boolean} input.keepOfflineApps
 * @returns {object} plan, or { error } for invalid input.
 */
export function planStorageCleanup({
  goal,
  browser,
  keepLogins = false,
  keepSitePrefs = false,
  keepOfflineApps = false,
} = {}) {
  if (!GOAL_IDS.includes(goal)) {
    return { error: "Choose what you are trying to achieve before building a plan." };
  }
  if (!BROWSER_IDS.includes(browser)) {
    return { error: "Choose which browser you are cleaning." };
  }

  const prefs = { keepLogins, keepSitePrefs, keepOfflineApps };
  const clear = [];
  const keep = [];

  for (const store of STORES) {
    if (store.keepAlways) {
      keep.push({ ...store, reason: "Security state — leave it alone unless it is the thing that is broken." });
      continue;
    }
    if (!store.goals.includes(goal)) {
      keep.push({ ...store, reason: "Clearing it does nothing for this goal." });
      continue;
    }
    if (store.keepIf && prefs[store.keepIf]) {
      keep.push({ ...store, reason: `Held back by "${KEEP_LABELS[store.keepIf]}".` });
      continue;
    }
    clear.push({ ...store });
  }

  clear.sort((a, b) => {
    const aScore = goal === "space" ? a.space : a.tracking;
    const bScore = goal === "space" ? b.space : b.tracking;
    if (bScore !== aScore) return bScore - aScore;
    return a.friction - b.friction;
  });

  const privacyGain = scorePercent(clear, STORES, "tracking");
  const spaceGain = scorePercent(clear, STORES, "space");
  const breakageRisk = scorePercent(clear, STORES, "friction");

  const warnings = [];
  const destructive = clear.filter((item) => item.destructive);
  if (destructive.length > 0) {
    warnings.push(
      `Irreversible: ${destructive.map((item) => item.label).join("; ")}. Deleted browser credentials cannot be recovered — export them first.`,
    );
  }
  if (clear.some((item) => item.id === "first-party-cookies") && !keepLogins) {
    warnings.push(
      "You will be signed out of every site. Make sure you can complete two-factor sign-in again before you start.",
    );
  }
  if (clear.some((item) => item.id === "sync-copy")) {
    warnings.push(
      "Sign out of browser sync before the local wipe, or the cleared data can sync straight back from your account.",
    );
  }
  if (goal === "tracking" && keepLogins) {
    warnings.push(
      "Keeping first-party cookies and localStorage means the sites you stay signed in to can still recognise you — this plan only breaks the third-party links between sites.",
    );
  }
  if (goal === "handover") {
    warnings.push(
      "Clearing browser data is not a device wipe. For a sale or a return, sign out of the browser account, then factory reset the device.",
    );
  }

  const cadenceDays = CADENCE_DAYS[goal];
  const browserInfo = BROWSERS.find((item) => item.id === browser);

  return {
    goal,
    goalLabel: GOALS.find((item) => item.id === goal).label,
    browser: browserInfo,
    clear,
    keep,
    clearCount: clear.length,
    keepCount: keep.length,
    privacyGain,
    spaceGain,
    breakageRisk,
    warnings,
    cadenceDays,
    cadenceText:
      cadenceDays > 0
        ? `Repeat roughly every ${cadenceDays} days to keep the benefit.`
        : "This is a one-off job, not a routine.",
  };
}

/** Plain-text export of a plan, for the copy button. */
export function formatPlan(plan) {
  if (!plan || plan.error) return "";
  const lines = [
    `Browser storage cleanup plan — ${plan.goalLabel} (${plan.browser.label})`,
    `Privacy gain ${plan.privacyGain}% · space reclaimed ${plan.spaceGain}% · breakage risk ${plan.breakageRisk}%`,
    "",
    "CLEAR:",
    ...plan.clear.map((item) => `  - ${item.label} — ${item.breaks}`),
    "",
    "KEEP:",
    ...plan.keep.map((item) => `  - ${item.label} — ${item.reason}`),
  ];
  if (plan.warnings.length > 0) {
    lines.push("", "WATCH OUT:", ...plan.warnings.map((text) => `  ! ${text}`));
  }
  lines.push("", `Where: ${plan.browser.path}`, plan.cadenceText);
  return lines.join("\n");
}
