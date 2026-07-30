/**
 * Smart TV kids safety planner.
 *
 * Pure logic: no React, no DOM, no clock reads.
 */

/** Samsung and LG televisions both ship with 0000 as the parental-control PIN. */
export const DEFAULT_TV_PIN = "0000";

/**
 * US TV Parental Guidelines ratings that carry an explicit age.
 * TV-G and TV-PG exist but are guidance only, with no stated age, so they are
 * not used as a ceiling here.
 */
export const TV_RATINGS = [
  { label: "TV-Y", minAge: 0, note: "Designed for all children." },
  { label: "TV-Y7", minAge: 7, note: "Directed to children aged 7 and older." },
  { label: "TV-14", minAge: 14, note: "Unsuitable for children under 14." },
  { label: "TV-MA", minAge: 17, note: "For adults; may be unsuitable under 17." },
];

/** Motion Picture Association film ratings that carry an explicit age. */
export const FILM_RATINGS = [
  { label: "G", minAge: 0, note: "All ages admitted." },
  { label: "PG-13", minAge: 13, note: "Some material may be inappropriate under 13." },
  { label: "R", minAge: 17, note: "Under 17 requires an accompanying adult." },
  { label: "NC-17", minAge: 18, note: "No one 17 and under admitted." },
];

export const TIER_WEIGHTS = { essential: 3, recommended: 2, optional: 1 };

export const PLATFORMS = [
  { id: "roku", label: "Roku (stick, box or Roku TV)" },
  { id: "firetv", label: "Amazon Fire TV" },
  { id: "googletv", label: "Google TV / Android TV" },
  { id: "samsung", label: "Samsung (Tizen)" },
  { id: "lg", label: "LG (webOS)" },
  { id: "appletv", label: "Apple TV" },
];

export const APPS = [
  { id: "netflix", label: "Netflix" },
  { id: "youtube", label: "YouTube" },
  { id: "disney", label: "Disney+" },
  { id: "prime", label: "Prime Video" },
];

const ALL_PLATFORMS = PLATFORMS.map((platform) => platform.id);

/**
 * platforms: which TV platform the step applies to.
 * app:       set when the step belongs to a streaming app rather than the TV.
 * pin:       the distinct PIN or passcode the step relies on, if any.
 */
export const STEPS = [
  {
    id: "kids-profile",
    title: "Give the child their own profile instead of sharing the main one",
    where: "The platform's profile or user switcher on the home screen",
    why: "Recommendations, continue-watching rows and maturity settings are all per-profile, so a shared profile leaks adult content into a child's home screen.",
    tier: "essential",
    platforms: ALL_PLATFORMS,
  },
  {
    id: "purchase-pin",
    title: "Require a PIN for every purchase and rental",
    where: "The platform's store or account settings",
    why: "One-click rentals from the remote are the most common source of accidental charges on a family TV.",
    tier: "essential",
    platforms: ALL_PLATFORMS,
    pin: "Store purchase PIN",
  },
  {
    id: "block-app-installs",
    title: "Require the PIN for adding channels or installing apps",
    where: "The same purchase or parental-control screen",
    why: "Without it a child simply installs an unrestricted app and every content setting you made becomes irrelevant.",
    tier: "essential",
    platforms: ALL_PLATFORMS,
    pin: "Store purchase PIN",
  },
  {
    id: "remove-saved-card",
    title: "Remove the saved card from the TV account, or keep a low gift-card balance",
    where: "The platform's account page on a browser, not on the TV",
    why: "A PIN can be watched over a shoulder; a missing payment method cannot be worked around from the sofa.",
    tier: "recommended",
    platforms: ALL_PLATFORMS,
  },
  {
    id: "roku-pin-preference",
    title: "Set the Roku PIN preference to require a PIN for purchases and adding channels",
    where: "my.roku.com > Update PIN preference (this is a website setting, not a TV setting)",
    why: "Roku's PIN preference lives in the online account, so it is the one control people miss entirely.",
    tier: "essential",
    platforms: ["roku"],
    pin: "Roku account PIN",
  },
  {
    id: "roku-kids-profile",
    title: "Set up a Roku kids profile and lock exiting it",
    where: "Roku home > profile switcher > add a Kids profile",
    why: "The kids profile limits what appears on the home screen and needs the PIN to leave.",
    tier: "recommended",
    platforms: ["roku"],
    pin: "Roku account PIN",
  },
  {
    id: "firetv-parental-controls",
    title: "Turn on Fire TV parental controls",
    where: "Settings > Preferences > Parental Controls",
    why: "One switch covers purchase confirmation, content-rating limits and the ability to require the PIN before an app launches.",
    tier: "essential",
    platforms: ["firetv"],
    pin: "Fire TV PIN",
  },
  {
    id: "firetv-kids-profile",
    title: "Add an Amazon Kids profile for younger children",
    where: "Settings > Profiles > Add a child profile",
    why: "It replaces the whole interface with an age-filtered one rather than filtering an adult interface.",
    tier: "recommended",
    platforms: ["firetv"],
    pin: "Fire TV PIN",
  },
  {
    id: "googletv-kids-profile",
    title: "Create a Google TV kids profile with an app allowlist",
    where: "Google TV > profile switcher > Add a kid",
    why: "The kids profile adds per-app allowlisting, daily watch-time limits and a bedtime, which the adult profile does not have.",
    tier: "essential",
    platforms: ["googletv"],
    pin: "Google TV parent PIN",
  },
  {
    id: "playstore-controls",
    title: "Turn on Play Store parental controls and purchase authentication",
    where: "Play Store > Settings > Parental controls, then Purchase authentication > For all purchases",
    why: "Rating limits and purchase authentication are two separate settings and both are off by default.",
    tier: "essential",
    platforms: ["googletv"],
    pin: "Google TV parent PIN",
  },
  {
    id: "samsung-pin",
    title: `Change the Samsung TV PIN away from ${DEFAULT_TV_PIN}`,
    where: "Settings > General > System Manager > Change PIN",
    why: "The default PIN is in the manual, so leaving it means the rating locks below can be lifted by anyone.",
    tier: "essential",
    platforms: ["samsung"],
    pin: "Samsung TV PIN",
  },
  {
    id: "samsung-rating-lock",
    title: "Turn on Program Rating Lock and lock individual apps",
    where: "Settings > Broadcasting > Program Rating Lock Settings; Apps > Settings > Lock",
    why: "Broadcast and app content are locked separately on Tizen — doing only one leaves the other open.",
    tier: "recommended",
    platforms: ["samsung"],
    pin: "Samsung TV PIN",
  },
  {
    id: "lg-safety-mode",
    title: `Turn on LG Safety Mode and change the PIN from ${DEFAULT_TV_PIN}`,
    where: "Settings > General > System > Safety > Safety Mode on, then Application Locks and Ratings Lock",
    why: "Safety Mode is the parent switch on webOS; the application and ratings locks only appear once it is on.",
    tier: "essential",
    platforms: ["lg"],
    pin: "LG TV PIN",
  },
  {
    id: "appletv-restrictions",
    title: "Turn on Apple TV Restrictions with a 4-digit passcode",
    where: "Settings > General > Restrictions",
    why: "Restrictions cover purchases and rentals, in-app purchases, allowed film and TV ratings, multiplayer games and AirPlay in one place.",
    tier: "essential",
    platforms: ["appletv"],
    pin: "Apple TV restrictions passcode",
  },
  {
    id: "appletv-screentime",
    title: "Add Screen Time downtime for the child's Apple TV user",
    where: "Settings > Users and Accounts > the child's user > Screen Time",
    why: "Restrictions control what can be watched; Screen Time controls when, and syncs with the same limits on their other Apple devices.",
    tier: "recommended",
    platforms: ["appletv"],
    pin: "Apple TV restrictions passcode",
  },
  {
    id: "casting-lock",
    title: "Require a code before a phone can cast or AirPlay to the TV",
    where: "The platform's AirPlay, Chromecast built-in or screen-mirroring settings",
    why: "Open casting lets any phone on the home Wi-Fi, including a visitor's, push content onto the family screen.",
    tier: "recommended",
    platforms: ALL_PLATFORMS,
  },
  {
    id: "voice-and-history",
    title: "Turn off voice purchasing and clear the search history",
    where: "The platform's voice or privacy settings",
    why: "Voice ordering skips the on-screen purchase step, and a shared search history is a small but real privacy leak.",
    tier: "optional",
    platforms: ALL_PLATFORMS,
  },
  {
    id: "home-row-audit",
    title: "Remove adult apps from the child profile's home row",
    where: "Home screen > move or remove app tiles on the child's profile",
    why: "Most accidental exposure on a TV is a tile that is simply visible, not a control that failed.",
    tier: "recommended",
    platforms: ALL_PLATFORMS,
  },
  {
    id: "netflix-profile-lock",
    title: "Set the Netflix profile maturity rating and add a profile lock PIN",
    where: "netflix.com > Account > the profile > Viewing restrictions",
    why: "The maturity rating filters the profile; the profile lock PIN stops a child hopping into an adult profile instead.",
    tier: "essential",
    platforms: ALL_PLATFORMS,
    app: "netflix",
    pin: "Netflix profile PIN",
  },
  {
    id: "youtube-kids",
    title: "Use the YouTube Kids app, or turn on Restricted Mode in the TV YouTube app",
    where: "YouTube Kids app > parent settings; or YouTube app > Settings > Restricted Mode",
    why: "The main YouTube app on a TV has almost no content controls, and autoplay carries a child a long way from where they started.",
    tier: "essential",
    platforms: ALL_PLATFORMS,
    app: "youtube",
    pin: "YouTube Kids parent passcode",
  },
  {
    id: "disney-profile-pin",
    title: "Set the Disney+ profile rating and turn on the profile PIN",
    where: "Disney+ > Profile > Edit Profiles > Parental Controls",
    why: "Disney+ carries adult-rated content in the same app, and only the per-profile rating and PIN separate them.",
    tier: "recommended",
    platforms: ALL_PLATFORMS,
    app: "disney",
    pin: "Disney+ profile PIN",
  },
  {
    id: "prime-viewing-restrictions",
    title: "Set Prime Video viewing restrictions and a separate PIN",
    where: "Prime Video > Settings > Parental Controls > Viewing Restrictions",
    why: "Prime Video's restrictions and PIN are separate from the Fire TV device PIN, even on a Fire TV.",
    tier: "recommended",
    platforms: ALL_PLATFORMS,
    app: "prime",
    pin: "Prime Video PIN",
  },
  {
    id: "watch-together-rule",
    title: "Agree the rule for what happens when something upsetting appears",
    where: "A conversation, not a setting",
    why: "Every rating system misses things. A child who knows to pause and fetch an adult is better protected than one relying on filters.",
    tier: "essential",
    platforms: ALL_PLATFORMS,
  },
];

export const BANDS = [
  { min: 90, label: "Locked down", tone: "success" },
  { min: 65, label: "Solid", tone: "success" },
  { min: 35, label: "Partial", tone: "warning" },
  { min: 0, label: "Wide open", tone: "danger" },
];

function bandFor(score) {
  return BANDS.find((band) => score >= band.min) || BANDS[BANDS.length - 1];
}

/** Highest rating in each system whose stated minimum age the child already meets. */
export function ratingCeiling(age) {
  const years = Number(age);
  if (!Number.isFinite(years) || years < 0) return { error: "Enter a valid age." };
  const tvMatches = TV_RATINGS.filter((rating) => rating.minAge <= years);
  const filmMatches = FILM_RATINGS.filter((rating) => rating.minAge <= years);
  const tv = tvMatches[tvMatches.length - 1] || TV_RATINGS[0];
  const film = filmMatches[filmMatches.length - 1] || FILM_RATINGS[0];
  return { tv: tv.label, tvNote: tv.note, film: film.label, filmNote: film.note };
}

/**
 * @param {object} input
 * @param {number} input.childAge
 * @param {string} input.platform  one of PLATFORMS ids
 * @param {string[]} [input.apps]  ids from APPS that the household uses
 * @param {string[]} [input.completed]
 */
export function buildPlan({ childAge, platform, apps = [], completed = [] } = {}) {
  const age = Number(childAge);
  if (!Number.isFinite(age)) return { error: "Enter the child's age in years." };
  if (age < 2 || age > 17) {
    return { error: "Enter an age between 2 and 17 — above that, maturity ratings no longer restrict anything." };
  }
  if (!PLATFORMS.some((item) => item.id === platform)) {
    return { error: "Choose the TV or streaming device you are setting up." };
  }
  const appList = Array.isArray(apps) ? apps.filter((id) => APPS.some((app) => app.id === id)) : [];

  const doneSet = new Set(Array.isArray(completed) ? completed : []);
  const steps = STEPS.filter(
    (step) => step.platforms.includes(platform) && (!step.app || appList.includes(step.app)),
  ).map((step) => ({ ...step, weight: TIER_WEIGHTS[step.tier], done: doneSet.has(step.id) }));

  const totalWeight = steps.reduce((sum, step) => sum + step.weight, 0);
  const doneWeight = steps.reduce((sum, step) => (step.done ? sum + step.weight : sum), 0);
  const score = totalWeight > 0 ? Math.round((doneWeight / totalWeight) * 100) : 0;

  const essentials = steps.filter((step) => step.tier === "essential");
  const essentialsMissing = essentials.filter((step) => !step.done).length;

  let band = bandFor(score);
  if (essentialsMissing > 0 && band.label === BANDS[0].label) band = BANDS[1];

  const pins = [...new Set(steps.filter((step) => step.pin).map((step) => step.pin))];

  return {
    steps,
    totalSteps: steps.length,
    doneSteps: steps.filter((step) => step.done).length,
    remaining: steps.filter((step) => !step.done),
    totalWeight,
    doneWeight,
    score,
    band: band.label,
    tone: band.tone,
    essentialsTotal: essentials.length,
    essentialsMissing,
    pins,
    pinCount: pins.length,
    rating: ratingCeiling(age),
    selectedApps: appList,
  };
}
