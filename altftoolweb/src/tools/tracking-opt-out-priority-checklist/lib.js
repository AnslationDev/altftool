/**
 * Tracking opt-out priority checklist.
 *
 * There are dozens of tracking opt-outs and most people give up somewhere in
 * the middle of the list. This module ranks them by benefit per minute spent,
 * fits them into a stated time budget, and separates the ones worth doing from
 * the ones that no longer achieve anything.
 *
 * Three properties decide an opt-out's place:
 *   impact   – how much of the real tracking it removes, 1 to 5.
 *   minutes  – realistic time to complete it once.
 *   durability –
 *     "permanent"    survives cookie clears and reboots
 *     "cookie-bound" stored as a cookie, so a browser clean-up undoes it
 *     "recurring"    has to be redone on a schedule (repeatDays)
 *
 * Anchors for the entries, all publicly documented:
 *  - Global Privacy Control is treated as a valid opt-out of sale/sharing under
 *    the California Consumer Privacy Act; California's Attorney General made
 *    that explicit in the August 2022 Sephora settlement, and Colorado and
 *    Connecticut require honouring universal opt-out signals too.
 *  - Apple's App Tracking Transparency (iOS 14.5, April 2021) requires an app
 *    to ask before accessing the IDFA; switching off "Allow Apps to Request to
 *    Track" denies every future request at once.
 *  - Android 12 and later let you delete the advertising ID outright, after
 *    which apps requesting it receive a string of zeros.
 *  - The NAI and DAA industry opt-out pages store the opt-out in a cookie, so
 *    clearing cookies removes it. They cover participating members only.
 *  - The Do Not Track header was never binding; Firefox removed the setting in
 *    version 135 (2025) because sites ignored it and it added fingerprinting
 *    surface.
 *
 * Informational only. Legal rights over your data vary by jurisdiction; check
 * your own regulator's guidance before relying on any of this.
 */

export const MIN_BUDGET_MINUTES = 5;
export const MAX_BUDGET_MINUTES = 600;

/** Surfaces a person may or may not have. */
export const SURFACES = [
  { id: "browser", label: "A desktop or laptop browser", always: true },
  { id: "ios", label: "iPhone or iPad" },
  { id: "android", label: "Android phone or tablet" },
  { id: "windows", label: "Windows PC" },
  { id: "google", label: "A Google account" },
  { id: "meta", label: "A Facebook or Instagram account" },
  { id: "amazon", label: "An Amazon account" },
  { id: "smarttv", label: "A smart TV or streaming stick" },
  { id: "email", label: "Email I read in an app or webmail" },
];

export const SURFACE_IDS = SURFACES.map((item) => item.id);

export const DURABILITY_LABELS = {
  permanent: "Sticks",
  "cookie-bound": "Lost when you clear cookies",
  recurring: "Needs repeating",
};

/**
 * The catalogue. `requires` lists surfaces; an item appears if the user has
 * any one of them. `skip` marks entries that are not worth the time.
 */
export const OPT_OUTS = [
  {
    id: "ios-att",
    label: "Turn off app tracking requests on iOS",
    how: "Settings → Privacy & Security → Tracking → switch off Allow Apps to Request to Track.",
    why: "Denies every app access to the IDFA advertising identifier in one action, and stops the prompts.",
    impact: 5,
    minutes: 2,
    durability: "permanent",
    requires: ["ios"],
  },
  {
    id: "android-adid",
    label: "Delete the Android advertising ID",
    how: "Settings → Security & privacy → Privacy → Ads → Delete advertising ID.",
    why: "On Android 12 and later this removes the ID rather than resetting it; apps that ask for it get zeros.",
    impact: 5,
    minutes: 2,
    durability: "permanent",
    requires: ["android"],
  },
  {
    id: "email-images",
    label: "Stop remote images loading in email",
    how: "Turn off automatic image loading in your mail client, or switch on the client's tracking-pixel protection.",
    why: "Open-tracking pixels are 1x1 remote images. Blocking remote content stops senders learning when and where you opened a message.",
    impact: 4,
    minutes: 3,
    durability: "permanent",
    requires: ["email"],
  },
  {
    id: "gpc",
    label: "Send Global Privacy Control from your browser",
    how: "Use a browser that sends it by default, or install the official GPC extension, then confirm at globalprivacycontrol.org.",
    why: "A machine-readable opt-out of the sale and sharing of personal data. California treats it as a valid CCPA opt-out request, and Colorado and Connecticut require universal opt-out signals to be honoured.",
    impact: 4,
    minutes: 4,
    durability: "permanent",
    requires: ["browser"],
  },
  {
    id: "google-ads",
    label: "Switch off Google personalised ads and set activity auto-delete",
    how: "myadcenter.google.com → Personalised ads off. Then myactivity.google.com → Web & App Activity → auto-delete after 3 months.",
    why: "Personalised ads off stops profile-based targeting; auto-delete caps how much history exists to profile from.",
    impact: 5,
    minutes: 10,
    durability: "permanent",
    requires: ["google"],
  },
  {
    id: "browser-protection",
    label: "Turn browser tracking protection up to strict",
    how: "Firefox: Settings → Privacy & Security → Enhanced Tracking Protection → Strict. Safari: Prevent cross-site tracking is on by default. Chrome/Edge: block third-party cookies.",
    why: "Blocks third-party cookies and known tracker scripts on every site at once, rather than site by site.",
    impact: 4,
    minutes: 5,
    durability: "permanent",
    requires: ["browser"],
  },
  {
    id: "apple-ads",
    label: "Switch off Apple personalised ads",
    how: "Settings → Privacy & Security → Apple Advertising → Personalised Ads off.",
    why: "Stops Apple's own App Store and News ad targeting, which App Tracking Transparency does not cover.",
    impact: 2,
    minutes: 2,
    durability: "permanent",
    requires: ["ios"],
  },
  {
    id: "meta-off-activity",
    label: "Disconnect off-platform activity from Meta",
    how: "Accounts Centre → Your information and permissions → Your activity off Meta technologies → disconnect past activity, then switch off future activity.",
    why: "Cuts the link between the pixel data other sites and apps send Meta and your account profile.",
    impact: 4,
    minutes: 10,
    durability: "permanent",
    requires: ["meta"],
  },
  {
    id: "windows-adid",
    label: "Turn off the Windows advertising ID and cut diagnostic data",
    how: "Settings → Privacy & security → General → switch off Let apps show me personalised ads. Then Diagnostics & feedback → send Required data only.",
    why: "Removes the per-device ad ID apps use to profile you across the desktop.",
    impact: 3,
    minutes: 5,
    durability: "permanent",
    requires: ["windows"],
  },
  {
    id: "wifi-scanning",
    label: "Turn off Wi-Fi and Bluetooth scanning for location",
    how: "Android: Settings → Location → Location services → switch off Wi-Fi scanning and Bluetooth scanning. iOS: Settings → Privacy & Security → Location Services → System Services.",
    why: "Stops apps deriving your position from nearby networks and beacons even when location permission is denied.",
    impact: 3,
    minutes: 4,
    durability: "permanent",
    requires: ["android", "ios"],
  },
  {
    id: "smarttv-acr",
    label: "Turn off smart TV content recognition",
    how: "Samsung: Viewing Information Services off. LG: Live Plus off. Vizio: Viewing Data off. Roku and Fire TV have equivalents under privacy.",
    why: "Automatic content recognition samples what is on screen — including from a games console or laptop — and sells the viewing profile.",
    impact: 4,
    minutes: 10,
    durability: "permanent",
    requires: ["smarttv"],
  },
  {
    id: "dns-blocking",
    label: "Point the device or router at a filtering DNS resolver",
    how: "Set a blocking resolver such as NextDNS, AdGuard DNS or a self-hosted Pi-hole as the DNS server on the device or on the router.",
    why: "Works on every app, not just the browser, so it also covers smart TVs and apps with no opt-out of their own.",
    impact: 5,
    minutes: 25,
    durability: "permanent",
    requires: ["browser"],
  },
  {
    id: "email-aliases",
    label: "Use a different email alias for each signup",
    how: "Apple Hide My Email, a forwarding-alias service, or plus-addressing on your own domain.",
    why: "Email address is the join key data brokers use to merge profiles across companies. Distinct aliases break the join and identify who leaked you.",
    impact: 4,
    minutes: 15,
    durability: "permanent",
    requires: ["email"],
  },
  {
    id: "amazon-ads",
    label: "Opt out of Amazon interest-based ads",
    how: "Your Account → Advertising preferences → Do not show me interest-based ads.",
    why: "Limits ad targeting built from your purchase and browse history.",
    impact: 2,
    minutes: 5,
    durability: "permanent",
    requires: ["amazon"],
  },
  {
    id: "loyalty",
    label: "Stop handing over a phone number at checkout",
    how: "Decline the loyalty lookup, or use a dedicated number and email for shop programmes.",
    why: "Phone number is the other common join key between offline purchases and online ad profiles.",
    impact: 3,
    minutes: 5,
    durability: "permanent",
    requires: ["browser"],
  },
  {
    id: "extensions",
    label: "Remove browser extensions with broad site access",
    how: "Review each extension's permissions and delete anything that can read data on all sites but does not need to.",
    why: "An extension with read access to every site sees more than any tracker does, and extension ownership changes hands quietly.",
    impact: 3,
    minutes: 12,
    durability: "permanent",
    requires: ["browser"],
  },
  {
    id: "broker-deletion",
    label: "File deletion requests with people-search data brokers",
    how: "Submit removal requests to the major people-search sites individually, keeping a record of each confirmation.",
    why: "Removes the public profiles that expose home address, relatives and phone numbers.",
    impact: 4,
    minutes: 180,
    durability: "recurring",
    repeatDays: 180,
    requires: ["browser"],
  },
  {
    id: "nai-daa",
    label: "Industry opt-out pages (NAI, DAA, Your Online Choices)",
    how: "Visit the industry opt-out pages and set every listed member to opt out.",
    why: "Covers participating members only, and the opt-out itself is stored as a cookie — clearing cookies undoes all of it.",
    impact: 1,
    minutes: 12,
    durability: "cookie-bound",
    requires: ["browser"],
  },
  {
    id: "dnt",
    label: "Enable the Do Not Track header",
    how: "There is nothing useful to do here.",
    why: "The header was advisory and sites ignored it. Firefox removed the setting in version 135 because it added fingerprinting surface without protecting anyone. Global Privacy Control replaced it.",
    impact: 0,
    minutes: 1,
    durability: "permanent",
    requires: ["browser"],
    skip: true,
  },
  {
    id: "adid-reset",
    label: "Reset the advertising ID every few weeks",
    how: "Reset the ad ID in the device's ad settings on a schedule.",
    why: "Only worth doing if your OS cannot delete the ID outright. A reset breaks the old profile but a new one starts building immediately.",
    impact: 2,
    minutes: 3,
    durability: "recurring",
    repeatDays: 30,
    requires: ["android", "ios"],
  },
];

const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

/** Benefit per minute — the ranking key. */
export function valuePerMinute(item) {
  const minutes = Math.max(1, item.minutes);
  return item.impact / minutes;
}

/**
 * Rank the opt-outs that apply to this person and fit them into a time budget.
 *
 * @param {object} input
 * @param {string[]} input.surfaces  Surface ids the person has.
 * @param {number} input.budgetMinutes  Minutes available in this sitting.
 * @param {string[]} input.done  Ids already completed.
 * @returns {object} plan, or { error }.
 */
export function planOptOuts({ surfaces = [], budgetMinutes = 30, done = [] } = {}) {
  const chosen = Array.isArray(surfaces)
    ? surfaces.filter((id) => SURFACE_IDS.includes(id))
    : [];
  if (chosen.length === 0) {
    return { error: "Tick at least one device or account so the list can be filtered to you." };
  }

  const budget = Number(budgetMinutes);
  if (!Number.isFinite(budget)) {
    return { error: "Enter the time you have as a number of minutes." };
  }
  if (budget < MIN_BUDGET_MINUTES) {
    return { error: `Give yourself at least ${MIN_BUDGET_MINUTES} minutes — nothing useful fits below that.` };
  }
  if (budget > MAX_BUDGET_MINUTES) {
    return { error: `Budget more than ${MAX_BUDGET_MINUTES} minutes and this stops being one sitting. Split it across days.` };
  }

  const doneSet = new Set(Array.isArray(done) ? done.filter((id) => typeof id === "string") : []);
  const surfaceSet = new Set(chosen);

  const applicable = OPT_OUTS.filter((item) =>
    item.requires.some((surface) => surfaceSet.has(surface)),
  ).map((item) => ({
    ...item,
    done: doneSet.has(item.id),
    ratio: valuePerMinute(item),
    durabilityLabel: DURABILITY_LABELS[item.durability],
  }));

  const notWorthIt = applicable.filter((item) => item.skip || item.impact === 0);
  const candidates = applicable
    .filter((item) => !item.skip && item.impact > 0)
    .sort((a, b) => {
      if (b.ratio !== a.ratio) return b.ratio - a.ratio;
      if (b.impact !== a.impact) return b.impact - a.impact;
      return a.minutes - b.minutes;
    });

  // Greedy fill: highest benefit per minute first, skipping anything that no
  // longer fits in the remaining time.
  const today = [];
  const later = [];
  let spent = 0;
  for (const item of candidates) {
    if (item.done) {
      later.push({ ...item, reason: "Already done." });
      continue;
    }
    if (spent + item.minutes <= budget) {
      spent += item.minutes;
      today.push({ ...item, order: today.length + 1, runningMinutes: spent });
    } else {
      later.push({ ...item, reason: "Does not fit in today's budget." });
    }
  }

  const totalImpact = candidates.reduce((sum, item) => sum + item.impact, 0);
  const doneImpact = candidates
    .filter((item) => item.done)
    .reduce((sum, item) => sum + item.impact, 0);
  const todayImpact = today.reduce((sum, item) => sum + item.impact, 0);

  const coverageNow = totalImpact > 0 ? Math.round((doneImpact / totalImpact) * 100) : 0;
  const coverageAfter =
    totalImpact > 0 ? Math.round(((doneImpact + todayImpact) / totalImpact) * 100) : 0;

  const fullMinutes = candidates
    .filter((item) => !item.done)
    .reduce((sum, item) => sum + item.minutes, 0);

  const recurring = applicable
    .filter((item) => item.durability === "recurring" && !item.skip)
    .map((item) => ({ id: item.id, label: item.label, repeatDays: item.repeatDays }));

  return {
    today,
    later,
    notWorthIt,
    applicableCount: applicable.length,
    minutesPlanned: spent,
    minutesSpare: Math.max(0, Math.round(budget - spent)),
    minutesForEverything: fullMinutes,
    coverageNow: clamp(coverageNow, 0, 100),
    coverageAfter: clamp(coverageAfter, 0, 100),
    coverageGain: clamp(coverageAfter - coverageNow, 0, 100),
    recurring,
    budget: Math.round(budget),
  };
}

/** Plain-text export for the copy button. */
export function formatOptOutPlan(plan) {
  if (!plan || plan.error) return "";
  const lines = [
    "Tracking opt-out plan",
    `${plan.today.length} action(s) in ${plan.minutesPlanned} of ${plan.budget} minutes — coverage ${plan.coverageNow}% → ${plan.coverageAfter}%`,
    "",
    "DO NOW, IN THIS ORDER:",
    ...plan.today.map(
      (item) => `  ${item.order}. ${item.label} (${item.minutes} min) — ${item.how}`,
    ),
  ];
  if (plan.later.length > 0) {
    lines.push("", "NEXT SITTING:", ...plan.later.map((item) => `  - ${item.label} (${item.minutes} min) — ${item.reason}`));
  }
  if (plan.notWorthIt.length > 0) {
    lines.push("", "SKIP:", ...plan.notWorthIt.map((item) => `  - ${item.label} — ${item.why}`));
  }
  return lines.join("\n");
}
