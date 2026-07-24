import { RefreshCw, Wifi } from "lucide-react";

export const googleTvSettings = [
  {
    id: "google-tv-software-update",
    title: "Update Google TV Software",
    icon: RefreshCw,
    platform: "google-tv",
    category: "system-updates",
    frequentlyUsed: true,
    recommended: true,
    difficulty: "Beginner-friendly",
    estimatedTime: "3 min read",
    supportedVersions: "Google TV / Android TV OS devices (Chromecast with Google TV, and Google TV-branded smart TVs)",
    heading: "Keep your Google TV software and apps current",
    description:
      "Google TV updates the system software and individual apps separately — system updates arrive automatically in the background, while apps update through the Play Store, same as on a phone.",
    details: [
      "Go to Settings → System → About, then select \"System update\" to check the current status or trigger a check manually.",
      "For app updates specifically, open the Google Play Store app on the device, go to your profile icon → Manage apps & device, and review or install pending updates.",
      "Leave the device plugged in and connected to Wi-Fi overnight for automatic background updates to complete.",
    ],
    redirectUrl: "https://support.google.com/googletv/answer/10557486",
    actionLabel: "Open Google TV Help: Software Updates",
    whyItMatters:
      "Streaming apps frequently update their required minimum OS or app version — falling behind on either system or app updates is a common cause of an app that suddenly won't open or crashes on launch.",
    bestPractices: [
      "Restart the device periodically (Settings → System → Restart) — this both applies pending updates and clears memory that can accumulate over long uptimes.",
      "Keep automatic app updates enabled in the Play Store unless you have a specific reason to manage them manually.",
      "If using a Chromecast with Google TV, keep it in a well-ventilated spot — Wi-Fi and update reliability both suffer if the device is running hot.",
    ],
    commonIssues: [
      { issue: "A streaming app crashes immediately on launch", fix: "Check for a pending app update in the Play Store first; if already current, clear the app's cache under Settings → Apps → See all apps → [app] → Clear cache." },
      { issue: "System update check says \"no updates\" but the device feels outdated", fix: "System updates roll out gradually by device and region rather than to everyone at once — there's no manual override, though a factory-provided update queue rarely lags by more than a few weeks." },
    ],
    tipsAndTricks: ["Settings → System → About → \"Android TV OS build\" shows the exact build number, useful when comparing against a specific fix mentioned in a support article."],
    faqs: [{ q: "Is Google TV the same as Android TV?", a: "Google TV is a newer interface layer running on the same Android TV OS platform — settings and update mechanics are effectively identical, just with a different home-screen design." }],
    relatedSettingIds: ["google-tv-wifi-network"],
  },
  {
    id: "google-tv-wifi-network",
    title: "Wi-Fi & Network Setup",
    icon: Wifi,
    platform: "google-tv",
    category: "connectivity-network",
    frequentlyUsed: true,
    difficulty: "Easy",
    estimatedTime: "3 min read",
    supportedVersions: "Google TV / Android TV OS devices",
    heading: "Connect to Wi-Fi and troubleshoot streaming network issues",
    description:
      "Network settings on Google TV live under Settings → Network & Internet, where you can join a Wi-Fi network, check connection speed, or switch to a wired Ethernet connection on supported devices.",
    details: [
      "Open Settings → Network & Internet → Wi-Fi to see and join available networks.",
      "Select \"Check connection speed\" from the same menu to run a quick speed test if streams are buffering.",
      "Devices with an Ethernet port will show a wired connection automatically when a cable is plugged in — no separate setup step is needed.",
    ],
    redirectUrl: "https://support.google.com/googletv/answer/10557519",
    actionLabel: "Open Google TV Help: Network Settings",
    whyItMatters:
      "Streaming quality is entirely dependent on a stable connection to the device — buffering or resolution drops are a network-layer symptom far more often than an app or account problem, and the built-in speed test is the fastest way to confirm which one it is.",
    bestPractices: [
      "Use a wired Ethernet connection where possible for 4K streaming — it's more consistent than Wi-Fi even on a strong network.",
      "Place a Chromecast with Google TV's dongle away from the TV chassis itself if using its included extension cable — direct contact with the TV can cause Wi-Fi interference.",
      "Restart your router occasionally, not just the streaming device, when troubleshooting persistent buffering.",
    ],
    commonIssues: [
      { issue: "Wi-Fi connects but streams constantly buffer", fix: "Run the built-in speed test first to rule out a genuine bandwidth issue, then try moving the device closer to the router or switching to a 5GHz network if available." },
      { issue: "Device won't find any Wi-Fi networks", fix: "Confirm the router's Wi-Fi band is 2.4GHz or 5GHz (not exclusively 6GHz/Wi-Fi 6E, which some older Google TV devices don't support), then restart both the router and the device." },
    ],
    tipsAndTricks: ["A wired Ethernet adapter (for devices without a built-in port) is a cheap, reliable fix for a Chromecast with Google TV placed far from the router."],
    faqs: [{ q: "Does Google TV support 5GHz Wi-Fi?", a: "Yes — all current Google TV devices support both 2.4GHz and 5GHz bands, and 5GHz is generally preferable for 4K streaming when signal strength allows." }],
    relatedSettingIds: ["google-tv-software-update"],
  },
];
