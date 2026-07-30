/**
 * Ad Topic Profile Explainer — platform catalogue and reset-plan maths.
 *
 * Pure module: no React, no DOM, no clock reads, no network.
 *
 * An "ad topic" is a label a platform attaches to your profile so advertisers can buy
 * an audience without buying your identity. The label is inferred, not declared: it comes
 * from pages you visited, apps you opened, things you bought, and lists an advertiser
 * uploaded that matched your email address or phone number.
 *
 * Two facts shape every recommendation here.
 *
 *  1. Turning off personalisation changes how ads are selected. It does not reduce the
 *     number of ads you see and it does not, by itself, stop the underlying collection.
 *     Non-personalised ads are still targeted by coarse signals such as approximate
 *     location, the page's own subject and the time of day.
 *  2. Controls are per account, per browser and per device. Clearing topics in Chrome on a
 *     laptop leaves the phone untouched, and signing out of one account leaves the other's
 *     profile intact.
 *
 * Menu paths change often; each entry records the settings area rather than a URL, and
 * `pathNote` says so.
 */

/** Menu labels move between releases, so paths are described, not promised. */
export const PATH_NOTE =
  "Menu wording moves between app versions — search the settings screen for the word in bold if the path has changed.";

export const MIN_INTERVAL_DAYS = 1;
export const MAX_INTERVAL_DAYS = 365;
export const DAYS_PER_YEAR = 365;

export const CONTROL_LEVELS = {
  full: {
    id: "full",
    label: "Full opt-out available",
    note: "Personalisation can be switched off for the whole account or browser.",
  },
  partial: {
    id: "partial",
    label: "Partial control only",
    note: "You can remove or mute individual topics, but the profile keeps being rebuilt.",
  },
};

export const PLATFORMS = [
  {
    id: "chrome-topics",
    name: "Chrome ad topics",
    kind: "Browser",
    minutes: 2,
    control: "full",
    inference:
      "Chrome works out your top interests on the device from the sites you visit, then offers a small number of weekly topics to sites that ask.",
    retention:
      "Topics are recalculated on a weekly cycle and only the most recent few weeks are kept, so the list turns over on its own.",
    path: "Chrome settings, then Privacy and security, then Ad privacy, then Ad topics",
    steps: [
      "Open the ad topics list and read what Chrome has inferred.",
      "Block any topic you do not want offered to sites.",
      "Switch the whole ad topics setting off if you want none of it.",
      "Repeat on every profile and every device — the list is per browser profile.",
    ],
    catch: "This only covers topics Chrome itself derives. It does not touch the profile any site or ad network keeps about you separately.",
  },
  {
    id: "google-account",
    name: "Google account ads",
    kind: "Account",
    minutes: 6,
    control: "full",
    inference:
      "Built from Search, YouTube, Maps and other Google activity you have left switched on, plus information advertisers provide.",
    retention:
      "Interests persist while the matching activity controls stay on; deleting the activity is what removes the source.",
    path: "My Ad Center, or Google Account, then Data and privacy, then Personalised ads",
    steps: [
      "Open My Ad Center and browse the topics and brands listed.",
      "Turn off individual topics, or switch personalised ads off entirely.",
      "Go back to Data and privacy and turn off Web and App Activity and YouTube History, which are what feed the list.",
      "Set auto-delete on any activity you keep, so old history stops contributing.",
    ],
    catch: "Switching off personalisation does not delete the past activity — do that separately under Data and privacy.",
  },
  {
    id: "meta",
    name: "Facebook and Instagram",
    kind: "Account",
    minutes: 8,
    control: "partial",
    inference:
      "Combines what you do inside the apps with activity businesses send back from their own sites and apps, and with customer lists they upload.",
    retention:
      "Topics keep regenerating from ongoing activity; disconnecting past off-platform activity is a separate action.",
    path: "Accounts Center, then Ad preferences, then Ad topics and Activity information from partners",
    steps: [
      "Open Ad topics and mark the ones you want to see less of.",
      "Open the section covering activity from partners and disconnect the history businesses have sent.",
      "Turn off future off-platform activity being linked to your account where the setting allows.",
      "Review the advertisers who say they have your contact details, and remove yourself from their lists.",
    ],
    catch: "There is no single switch that turns personalisation off worldwide; in the EU and UK a paid or less-personalised option may appear instead.",
  },
  {
    id: "amazon",
    name: "Amazon",
    kind: "Account",
    minutes: 3,
    control: "full",
    inference:
      "Built almost entirely from what you have viewed, searched for and bought, which makes it unusually accurate about household purchases.",
    retention: "Interests follow your order and browsing history, which stays until you remove it.",
    path: "Your Account, then Advertising preferences",
    steps: [
      "Set advertising preferences to do not personalise.",
      "Clear your browsing history in Your Account so past views stop feeding recommendations.",
      "Check the same setting on any other Amazon marketplace you use — they are separate accounts.",
    ],
    catch: "Order history cannot be deleted, so purchase-based inference continues even with personalisation off.",
  },
  {
    id: "microsoft",
    name: "Microsoft account",
    kind: "Account",
    minutes: 3,
    control: "full",
    inference: "Draws on Bing, Edge and Microsoft account activity you have not turned off.",
    retention: "Interests persist while the associated activity data is retained in the privacy dashboard.",
    path: "Microsoft account privacy dashboard, then Ad settings",
    steps: [
      "Turn off personalised ads in the ad settings page.",
      "Use the privacy dashboard to clear browsing and search history.",
      "Repeat while signed in on each device, since the setting follows the account and the browser.",
    ],
    catch: "The opt-out applies to Microsoft's own advertising, not to every ad network on a page.",
  },
  {
    id: "tiktok",
    name: "TikTok",
    kind: "Account",
    minutes: 4,
    control: "full",
    inference:
      "Watch time and completion rate on individual videos are unusually strong signals, alongside advertiser-supplied lists.",
    retention: "The interest profile updates continuously from in-app behaviour.",
    path: "Profile, then Settings and privacy, then Ads, then Ads personalisation",
    steps: [
      "Turn off ads personalisation.",
      "Open the section describing data used to show ads and remove advertisers who uploaded your details.",
      "Check the download-your-data option if you want to see what has been inferred.",
    ],
    catch: "Recommendations in the feed are a separate system from ad topics and are not covered by the ad setting.",
  },
  {
    id: "x-twitter",
    name: "X",
    kind: "Account",
    minutes: 3,
    control: "partial",
    inference:
      "Inferred from accounts you follow, posts you engage with, and interest lists supplied by advertising partners.",
    retention: "The interests list is regenerated from ongoing activity.",
    path: "Settings and privacy, then Privacy and safety, then Ads preferences and Data sharing",
    steps: [
      "Open the interests list and untick anything that is wrong or that you do not want used.",
      "Open the advertiser list to see which businesses have uploaded your details.",
      "Turn off inferred identity across devices where the setting is available.",
    ],
    catch: "Unticking an interest removes it from the list but does not stop new ones being inferred.",
  },
  {
    id: "apple",
    name: "Apple advertising",
    kind: "Device",
    minutes: 2,
    control: "full",
    inference:
      "Uses App Store, Apple News and Stocks activity on the device, in segments that Apple states must contain a minimum number of people.",
    retention: "Segment membership is recalculated on the device as your activity changes.",
    path: "Settings, then Privacy and Security, then Apple Advertising",
    steps: [
      "Turn Personalised Ads off.",
      "In the same Privacy screen, review App Tracking Transparency and turn off Allow Apps to Request to Track.",
      "Repeat on each Apple device — the setting is per device, not per Apple Account.",
    ],
    catch: "App Tracking Transparency governs other companies tracking you across apps; Apple's own personalisation is the separate switch above it.",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    kind: "Account",
    minutes: 4,
    control: "partial",
    inference:
      "Job title, employer, seniority and skills on your own profile are the targeting data, so the profile is largely self-declared.",
    retention: "Targeting follows your live profile, so it changes when you edit it.",
    path: "Settings and Privacy, then Advertising data",
    steps: [
      "Work down the advertising data list and turn off each category you do not want used.",
      "Turn off interest categories and third-party data enrichment.",
      "Remember that anything left public on your profile stays available as targeting data.",
    ],
    catch: "Because much of it is self-declared, the only way to remove some signals is to edit or hide the profile field.",
  },
  {
    id: "spotify",
    name: "Spotify",
    kind: "Account",
    minutes: 2,
    control: "full",
    inference: "Listening history, playlists and time-of-day patterns feed mood and activity segments.",
    retention: "Segments update continuously from listening activity.",
    path: "Account, then Privacy settings",
    steps: [
      "Turn off tailored ads.",
      "Turn off processing of Facebook data if the accounts are linked.",
      "Unlink any social account you no longer want feeding the profile.",
    ],
    catch: "Free-tier ads continue; only the targeting changes.",
  },
];

/** What actually feeds an interest profile, in rough order of how much of it people expect. */
export const SIGNAL_SOURCES = [
  {
    id: "onsite",
    label: "What you do on the platform itself",
    detail: "Searches, watch time, clicks, follows and time spent on a post.",
    surprising: false,
  },
  {
    id: "offsite",
    label: "What you do on other companies' sites and apps",
    detail: "Buttons, pixels and app SDKs report a visit or a purchase back to the platform.",
    surprising: true,
  },
  {
    id: "uploads",
    label: "Customer lists uploaded by advertisers",
    detail: "A shop uploads hashed emails or phone numbers and the platform matches them to accounts.",
    surprising: true,
  },
  {
    id: "purchase",
    label: "Purchase and loyalty data",
    detail: "Order history and, in some markets, data bought from measurement partners.",
    surprising: true,
  },
  {
    id: "location",
    label: "Approximate location",
    detail: "Derived from IP address even when precise location permission is refused.",
    surprising: false,
  },
  {
    id: "lookalike",
    label: "People who look like you",
    detail: "Topics can be assigned because your behaviour resembles an existing audience, not because you did the thing.",
    surprising: true,
  },
];

/** Things platforms have publicly committed not to target on. */
export const SENSITIVE_CATEGORY_NOTE =
  "Major platforms restrict targeting on sensitive categories such as health conditions, religion, sexual orientation, race and political affiliation. Restrictions apply to what advertisers can buy, not to what the platform may infer internally, and enforcement is imperfect — treat any sensitive-looking topic in your list as a reason to switch personalisation off rather than to trust the restriction.";

/**
 * Build a reset plan.
 *
 * @param {object} input
 * @param {string[]} input.platformIds     platforms you use
 * @param {number}   input.intervalDays    how often you intend to redo the reset
 * @returns {object} plan, or { error }
 */
export function buildResetPlan({ platformIds, intervalDays } = {}) {
  if (!Array.isArray(platformIds)) {
    return { error: "Pick the platforms you use." };
  }
  if (platformIds.length === 0) {
    return { error: "Pick at least one platform to build a reset plan." };
  }
  const days = Number(intervalDays);
  if (!Number.isFinite(days)) {
    return { error: "The reset interval must be a number of days." };
  }
  if (days < MIN_INTERVAL_DAYS || days > MAX_INTERVAL_DAYS) {
    return { error: `Choose a reset interval between ${MIN_INTERVAL_DAYS} and ${MAX_INTERVAL_DAYS} days.` };
  }

  const wanted = new Set(platformIds);
  const chosen = PLATFORMS.filter((platform) => wanted.has(platform.id));
  if (chosen.length === 0) {
    return { error: "None of those platforms are in the list." };
  }

  const minutesPerRound = chosen.reduce((sum, platform) => sum + platform.minutes, 0);
  const roundsPerYear = Math.ceil(DAYS_PER_YEAR / Math.round(days));
  const minutesPerYear = minutesPerRound * roundsPerYear;

  const fullOptOut = chosen.filter((platform) => platform.control === "full");
  const partialOnly = chosen.filter((platform) => platform.control === "partial");

  const totalSteps = chosen.reduce((sum, platform) => sum + platform.steps.length, 0);

  const order = [...chosen].sort((a, b) => {
    if (a.control !== b.control) return a.control === "full" ? -1 : 1;
    return a.minutes - b.minutes;
  });

  return {
    platforms: order,
    platformCount: chosen.length,
    minutesPerRound,
    roundsPerYear,
    minutesPerYear,
    hoursPerYear: Math.round((minutesPerYear / 60) * 10) / 10,
    fullOptOutCount: fullOptOut.length,
    partialOnlyCount: partialOnly.length,
    coveragePercent: Math.round((fullOptOut.length / chosen.length) * 100),
    totalSteps,
    intervalDays: Math.round(days),
  };
}
