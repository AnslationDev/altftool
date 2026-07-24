import { Watch, RefreshCw } from "lucide-react";

export const galaxyWatchSettings = [
  {
    id: "galaxy-watch-pairing",
    title: "Pair Galaxy Watch with Your Phone",
    icon: Watch,
    platform: "galaxy-watch",
    category: "accounts-sync-family",
    frequentlyUsed: true,
    recommended: true,
    difficulty: "Beginner-friendly",
    estimatedTime: "3 min read",
    supportedVersions: "Galaxy Watch4 and later, paired via the Galaxy Wearable app",
    requiresPlatform: ["android"],
    heading: "Pair your Galaxy Watch using the Galaxy Wearable app",
    description:
      "Galaxy Watch pairs to an Android phone through the Galaxy Wearable app, which handles both the initial Bluetooth pairing and ongoing sync of notifications, health data, and watch faces.",
    details: [
      "Install \"Galaxy Wearable\" from the Play Store on your Android phone if it isn't already present.",
      "Turn on the watch and place it near your phone, then open Galaxy Wearable and follow the on-screen pairing steps.",
      "Grant the requested permissions (notifications, contacts, location) when prompted — these are what let the watch mirror your phone's notifications and use GPS-assisted features.",
      "Once paired, the Galaxy Wearable app remains the control center for installing watch apps, changing watch faces, and adjusting sync settings.",
    ],
    important: "Galaxy Watch requires a Samsung account signed in during setup — without one, health and backup data won't sync even though basic pairing still works.",
    redirectUrl: "https://www.samsung.com/us/support/mobile-devices/how-to-pair-and-connect-galaxy-watch-with-galaxy-phone/",
    actionLabel: "Open Samsung Support: Pair Galaxy Watch",
    whyItMatters:
      "Because the watch depends entirely on the phone connection for notifications and full functionality, understanding that Galaxy Wearable — not the phone's general Bluetooth settings — is the actual control surface saves a lot of confused troubleshooting when something isn't syncing.",
    bestPractices: [
      "Keep Bluetooth and location both enabled on the phone — several watch features silently degrade if either is off, without a clear on-watch warning.",
      "Sign in with the same Samsung account on both the watch and the Galaxy Wearable app to ensure health and backup data sync correctly.",
      "Keep the Galaxy Wearable app itself updated — Samsung ships watch-facing bug fixes through app updates as often as through watch firmware.",
    ],
    commonIssues: [
      { issue: "Watch shows \"disconnected\" even though Bluetooth is on", fix: "Toggle Bluetooth off and on on the phone, and confirm the watch isn't simultaneously connected to a different phone or tablet — a Galaxy Watch can only be actively paired to one device at a time." },
      { issue: "Notifications appear on the phone but not the watch", fix: "Check Galaxy Wearable → Notifications and confirm the specific app is allowed there — notification access is granted per-app, separate from the initial pairing permissions." },
    ],
    tipsAndTricks: ["The watch can be set up in \"Watch only\" mode with its own eSIM data plan on cellular models — useful context if pairing seems to behave differently than expected on a cellular unit."],
    faqs: [{ q: "Can a Galaxy Watch pair with an iPhone?", a: "No — Galaxy Watch (Wear OS-based, Samsung's version) requires the Galaxy Wearable app, which is Android-only; it isn't compatible with iPhone." }],
    relatedSettingIds: ["galaxy-watch-software-update"],
  },
  {
    id: "galaxy-watch-software-update",
    title: "Update Galaxy Watch Software",
    icon: RefreshCw,
    platform: "galaxy-watch",
    category: "system-updates",
    frequentlyUsed: true,
    difficulty: "Easy",
    estimatedTime: "3 min read",
    supportedVersions: "Galaxy Watch4 and later",
    requiresPlatform: ["android"],
    heading: "Keep your Galaxy Watch's software current",
    description:
      "Galaxy Watch software updates can be checked and installed either directly on the watch or through the Galaxy Wearable app on your phone — both routes end at the same install process.",
    details: [
      "On the watch: open Settings → General → Software update → Download and install.",
      "From the phone: open Galaxy Wearable → Watch settings → Watch software update.",
      "Keep the watch above roughly 30% battery and near the phone during the update — installs can pause or fail if either connection or power drops mid-update.",
    ],
    redirectUrl: "https://www.samsung.com/us/support/mobile-devices/how-to-update-galaxy-watch-software/",
    actionLabel: "Open Samsung Support: Update Galaxy Watch",
    whyItMatters:
      "Watch software updates fix battery-drain regressions and sensor-accuracy issues far more often than phone updates do — a watch running old software is a common, overlooked cause of unexpectedly short battery life that gets blamed on the hardware instead.",
    bestPractices: [
      "Check for updates right after unboxing a new watch — retail units often ship with an older build than what's currently available.",
      "Update overnight while the watch is charging, so a mid-update battery drop isn't a risk.",
      "Restart the watch (long-press the home button → Power off → back on) after a major update if any watch face or app looks visually glitchy — this is a rendering cache issue, not a failed install.",
    ],
    commonIssues: [
      { issue: "Update fails or gets stuck partway through", fix: "Ensure the watch is above 30% battery and within Bluetooth range of the phone, then retry from Galaxy Wearable rather than directly on the watch — the phone-initiated path is generally more reliable." },
      { issue: "Battery life drops noticeably after an update", fix: "This can be a temporary re-indexing/re-calibration period lasting a day or two after a major update; if it persists beyond that, check Settings → Battery → Background usage limits for any apps newly excluded from restrictions." },
    ],
    tipsAndTricks: ["Software update history and current build number are both visible under Settings → About watch on the device itself, useful when a support article references a specific fixed build."],
    faqs: [{ q: "Do I need my phone nearby to update the watch?", a: "Not strictly for Wi-Fi-connected watches with cellular or standalone Wi-Fi, but it's recommended — updating via Galaxy Wearable with the phone nearby is the most reliable path." }],
    relatedSettingIds: ["galaxy-watch-pairing"],
  },
];
