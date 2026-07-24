import { Gamepad2, RefreshCw, Wifi } from "lucide-react";

// Example authored guides for PlayStation consoles (PS4/PS5), proving the
// gaming category out end-to-end the same way appleWatch.js does for
// watches. Kept platform-generic (not PS4-only or PS5-only) since the core
// flows are effectively identical across recent PlayStation generations.
export const playstationSettings = [
  {
    id: "playstation-system-update",
    title: "System Software Update",
    icon: RefreshCw,
    platform: "playstation",
    category: "system-updates",
    frequentlyUsed: true,
    recommended: true,
    difficulty: "Beginner-friendly",
    estimatedTime: "3 min read",
    supportedVersions: "PS5 & PS4 system software",
    heading: "Keep your console's system software current",
    description:
      "PlayStation system updates patch security issues, add platform features, and are frequently required before a new game or online multiplayer will run at all.",
    details: [
      "Found under Settings → System → System Software → System Software Update and Settings.",
      "Downloads over Wi-Fi or a wired connection; a wired connection is noticeably faster for large updates.",
      "Some updates require enough free storage before they'll install.",
    ],
    important: "Never power off the console or unplug it during an update — this can corrupt the system software and require a full re-install.",
    redirectUrl: "https://www.playstation.com/support/",
    actionLabel: "Open PlayStation Support",
    whyItMatters:
      "Online multiplayer, the PlayStation Store, and many new game releases outright require the latest system software — falling behind can lock you out of features until you update anyway, at a less convenient time.",
    afterImageContent: {
      heading: "How to update",
      steps: [
        "Go to Settings → System → System Software.",
        "Select System Software Update and Settings, then Update System Software.",
        "Choose Update via Internet and confirm.",
        "Let the console finish downloading and installing before turning it off.",
      ],
    },
    bestPractices: [
      "Turn on automatic downloads for system software in the same settings menu so updates are ready before you need them.",
      "Use a wired Ethernet connection for large updates whenever possible.",
    ],
    commonIssues: [
      { issue: "Update fails partway through", fix: "Rebuild the database from Safe Mode, or re-download the update from Safe Mode's \"Update System Software\" option using a USB drive as a fallback." },
      { issue: "Not enough storage for the update", fix: "Free up space under Settings → Storage by removing unused game data — most updates only need a few gigabytes free." },
    ],
    tipsAndTricks: ["Enable Rest Mode with \"Stay Connected to the Internet\" so the console can download updates automatically overnight."],
    faqs: [{ q: "Do I have to update before playing offline?", a: "No — you can decline and keep playing single-player, but online features and the Store will prompt again until you update." }],
    relatedSettingIds: ["playstation-network-connection", "playstation-controller-pairing"],
  },
  {
    id: "playstation-network-connection",
    title: "Network & Wi-Fi Connection",
    icon: Wifi,
    platform: "playstation",
    category: "connectivity-network",
    frequentlyUsed: true,
    difficulty: "Easy",
    estimatedTime: "4 min read",
    supportedVersions: "PS5 & PS4 system software",
    heading: "Set up or troubleshoot your console's internet connection",
    description:
      "PlayStation consoles support both Wi-Fi and wired Ethernet. A wired connection is generally more stable for online multiplayer and reduces lag caused by Wi-Fi interference.",
    details: [
      "Found under Settings → Network → Settings → Set Up Internet Connection.",
      "The built-in Test Internet Connection tool checks connection type, NAT type, and download/upload speed.",
    ],
    redirectUrl: "https://www.playstation.com/support/",
    actionLabel: "Open Network Troubleshooting",
    whyItMatters:
      "A poor connection or restrictive NAT type is one of the most common causes of multiplayer lag, failed party invites, and voice chat issues — most of which are fixable from this one settings screen.",
    bestPractices: [
      "Prefer a wired connection for competitive online play.",
      "Run Test Internet Connection after any router change to confirm NAT type is still Open or Moderate.",
    ],
    commonIssues: [
      { issue: "NAT Type shows Strict", fix: "Enable UPnP on your router, or set up port forwarding for your console's local IP address." },
      { issue: "Wi-Fi keeps dropping mid-game", fix: "Move the console closer to the router, switch to the 5GHz band if available, or move to a wired connection." },
    ],
    tipsAndTricks: ["Give the console a static local IP (via router DHCP reservation) before setting up port forwarding, so the forwarded ports don't stop working after a router restart."],
    faqs: [{ q: "Does Wi-Fi 6 make a real difference for gaming?", a: "It mainly helps with congestion in busy households — a wired connection is still the more reliable option for online play." }],
    relatedSettingIds: ["playstation-system-update", "playstation-controller-pairing"],
  },
  {
    id: "playstation-controller-pairing",
    title: "Controller Pairing & Bluetooth",
    icon: Gamepad2,
    platform: "playstation",
    category: "devices-peripherals",
    frequentlyUsed: false,
    difficulty: "Easy",
    estimatedTime: "3 min read",
    supportedVersions: "DualSense & DualShock 4 controllers",
    heading: "Pair or re-pair a wireless controller",
    description:
      "PlayStation controllers pair over Bluetooth and can be re-paired if they stop responding, are used with a different console, or need to be connected to a PC.",
    details: [
      "A controller can be paired with more than one console, but is only actively connected to one at a time.",
      "Some controllers can also be re-paired via USB cable for a wired, zero-latency connection.",
    ],
    redirectUrl: "https://www.playstation.com/support/",
    actionLabel: "Open Controller Support",
    afterImageContent: {
      heading: "How to re-pair",
      steps: [
        "Connect the controller to the console with a USB cable.",
        "Press the PS button to turn it on and register it.",
        "Once paired, disconnect the cable to use it wirelessly.",
      ],
    },
    whyItMatters:
      "A controller that won't connect is one of the most common day-one frustrations, and the fix is nearly always this same short re-pair flow.",
    commonIssues: [
      { issue: "Controller connects but inputs lag or drop", fix: "Charge it fully — a low battery is the most common cause of intermittent Bluetooth dropouts on wireless controllers." },
      { issue: "Controller won't turn on at all", fix: "Try a different USB cable — some cables are charge-only and can't be used to re-pair the controller." },
    ],
    tipsAndTricks: ["Holding Create + PS button opens Bluetooth pairing mode directly, useful when pairing a controller to a PC or a different console."],
    faqs: [{ q: "Can I use my controller on more than one console?", a: "Yes — pairing it with a new console doesn't erase the pairing on the old one; it just becomes the active connection." }],
    relatedSettingIds: ["playstation-network-connection", "playstation-system-update"],
  },
];
