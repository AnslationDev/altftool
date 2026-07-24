import { Tv, RefreshCw, Bluetooth } from "lucide-react";

// Example authored guides for Android TV, proving out the Smart TVs
// category. Deliberately platform-generic phrasing (menu layout varies a
// little by TV manufacturer even on the same Android TV OS version).
export const androidTvSettings = [
  {
    id: "android-tv-system-update",
    title: "System Software Update",
    icon: RefreshCw,
    platform: "android-tv",
    category: "system-updates",
    frequentlyUsed: true,
    recommended: true,
    difficulty: "Beginner-friendly",
    estimatedTime: "3 min read",
    supportedVersions: "Android TV OS 11 and later",
    heading: "Update your Android TV's system software",
    description:
      "Android TV updates deliver security patches, app compatibility fixes, and interface improvements — usually found under Settings → System → About → System update.",
    details: [
      "Exact menu wording varies slightly by TV brand, but is always under System or Device Preferences.",
      "Requires a stable internet connection and enough free storage to download.",
    ],
    redirectUrl: "https://support.google.com/androidtv",
    actionLabel: "Open Android TV Support",
    whyItMatters:
      "Streaming apps regularly require a current Android TV OS version to keep working — an outdated TV can start losing access to apps like a phone would with an old OS version.",
    afterImageContent: {
      heading: "How to check for updates",
      steps: [
        "Open Settings on your Android TV.",
        "Go to System (or Device Preferences) → About.",
        "Select System update and check for a new version.",
        "Confirm and let the TV download, install, and restart.",
      ],
    },
    bestPractices: [
      "Leave the TV connected to power and Wi-Fi overnight occasionally so scheduled updates can complete.",
      "Restart the TV periodically even without a pending update — it clears background app memory.",
    ],
    commonIssues: [
      { issue: "Update won't download", fix: "Check Wi-Fi signal strength in Settings → Network — a weak connection is the most common cause on TVs mounted far from the router." },
      { issue: "TV restarts but the update doesn't apply", fix: "Free up storage under Settings → Storage by uninstalling unused apps, then retry." },
    ],
    tipsAndTricks: ["A wired Ethernet adapter (where supported) is far more reliable than Wi-Fi for large system updates on a TV."],
    faqs: [{ q: "Will updating erase my installed apps?", a: "No — system updates keep your installed apps and sign-ins intact." }],
    relatedSettingIds: ["android-tv-network", "android-tv-bluetooth-remote"],
  },
  {
    id: "android-tv-network",
    title: "Wi-Fi & Network Setup",
    icon: RefreshCw,
    platform: "android-tv",
    category: "connectivity-network",
    frequentlyUsed: true,
    difficulty: "Easy",
    estimatedTime: "3 min read",
    supportedVersions: "Android TV OS 11 and later",
    heading: "Connect your TV to Wi-Fi or fix a dropped connection",
    description:
      "Streaming quality depends entirely on a stable connection — most buffering and app-crash complaints on a smart TV trace back to Wi-Fi signal strength, not the app itself.",
    details: [
      "Found under Settings → Network & Internet.",
      "Signal strength is shown as a bar indicator next to the connected network name.",
    ],
    redirectUrl: "https://support.google.com/androidtv",
    actionLabel: "Open Network Guidance",
    whyItMatters:
      "4K streaming needs a meaningfully faster, more stable connection than SD or HD content — a connection that felt fine for browsing can still buffer constantly at higher resolutions.",
    bestPractices: [
      "Place the router with a clear line of sight to the TV where possible, or use a mesh Wi-Fi point nearby.",
      "Use the 5GHz band for the TV if your router supports it — it's faster at close range with less interference.",
    ],
    commonIssues: [
      { issue: "Wi-Fi connects but streaming still buffers", fix: "Run a speed test from the TV's browser or a connected phone on the same network to rule out an ISP-side issue." },
      { issue: "TV keeps forgetting the Wi-Fi password", fix: "Forget the network and rejoin, double-checking there are no special characters your remote's on-screen keyboard is mistyping." },
    ],
    tipsAndTricks: ["An Ethernet adapter, where the TV supports one, eliminates Wi-Fi-related buffering entirely."],
    faqs: [{ q: "Does a VPN on the TV slow down streaming?", a: "It can, depending on the VPN server's distance and load — try a server closer to your actual location if streaming feels slower with it on." }],
    relatedSettingIds: ["android-tv-system-update", "android-tv-bluetooth-remote"],
  },
  {
    id: "android-tv-bluetooth-remote",
    title: "Bluetooth Remote & Accessory Pairing",
    icon: Bluetooth,
    platform: "android-tv",
    category: "devices-peripherals",
    frequentlyUsed: false,
    difficulty: "Easy",
    estimatedTime: "2 min read",
    supportedVersions: "Android TV OS 11 and later",
    heading: "Pair a remote, controller, or Bluetooth headphones",
    description:
      "Most Android TV remotes pair automatically on first power-on, but a lost pairing (or pairing a second accessory like headphones or a game controller) is done from Settings → Remotes & Accessories.",
    details: [
      "The TV can typically stay paired with several Bluetooth accessories at once.",
      "Bluetooth audio output can be routed exclusively to headphones for private listening.",
    ],
    redirectUrl: "https://support.google.com/androidtv",
    actionLabel: "Open Accessory Support",
    commonIssues: [
      { issue: "Remote stopped responding", fix: "Replace or recharge the batteries, then hold the Home and Back buttons together for about 10 seconds to force a re-pair." },
      { issue: "Bluetooth headphones connect but there's audio lag", fix: "Some Bluetooth headphone models have inherent latency with video — this is a limitation of the headphones, not the TV, and is usually smaller on headphones marketed for \"low-latency\" or gaming use." },
    ],
    tipsAndTricks: ["Under Settings → Remotes & Accessories → Add accessory, you can pair a Bluetooth game controller for supported Android TV games."],
    faqs: [{ q: "Can I use regular Bluetooth headphones with my Android TV?", a: "Yes, most Android TVs support standard Bluetooth audio headphones and speakers directly from the Remotes & Accessories menu." }],
    relatedSettingIds: ["android-tv-network", "android-tv-system-update"],
  },
];
