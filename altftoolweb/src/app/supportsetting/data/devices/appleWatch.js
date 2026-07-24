import { Watch, RefreshCw, Bluetooth } from "lucide-react";

// Example, fully-authored guides for Apple Watch — proves out the device
// architecture end-to-end. Uses the identical setting object shape as the
// Windows/macOS/Android/iOS catalog, so it renders through the same
// SettingDetailPage with zero special-casing. Action buttons link to
// Apple's own official support hub rather than a fabricated deep link.
export const appleWatchSettings = [
  {
    id: "apple-watch-pairing",
    title: "Pair & Set Up Apple Watch",
    icon: Watch,
    platform: "apple-watch",
    category: "accounts-sync-family",
    frequentlyUsed: true,
    recommended: true,
    difficulty: "Beginner-friendly",
    estimatedTime: "5 min read",
    supportedVersions: "watchOS 10 and later",
    requiresPlatform: ["ios", "macos"],
    heading: "Connect your Apple Watch to your iPhone",
    description:
      "Apple Watch is set up and paired through the Watch app on a nearby iPhone. Pairing links the two devices over Bluetooth and Wi-Fi so notifications, health data, and settings stay in sync.",
    details: [
      "Requires an iPhone running a compatible iOS version, with Bluetooth and Wi-Fi turned on.",
      "Pairing is done once per Apple ID unless you unpair and reset the watch.",
      "A Family Setup pairing lets a watch work without a paired iPhone nearby, on supported cellular models.",
    ],
    redirectUrl: "https://support.apple.com/apple-watch",
    actionLabel: "Open Apple Watch Support",
    whyItMatters:
      "A correctly paired watch is what makes every other setting — notifications, Health, Wallet, Bluetooth accessories — actually work. Most Apple Watch issues people run into trace back to an incomplete or interrupted initial pairing.",
    afterImageContent: {
      heading: "How pairing works",
      steps: [
        "Bring your Apple Watch close to your unlocked iPhone and open the Watch app.",
        "Tap \"Pair New Watch\" and follow the on-screen animation to auto-pair, or pair manually if prompted.",
        "Choose your Apple ID, enable the features you want (Location Services, Siri, etc.), and set or create a passcode.",
        "Wait for the initial sync to finish — this can take several minutes on first setup.",
      ],
    },
    bestPractices: [
      "Keep both devices on the same Wi-Fi network and within Bluetooth range until the first sync finishes.",
      "Keep both devices charged above 50% during initial pairing.",
      "Update iOS on your iPhone before pairing a new watch, since older iOS versions may not support the newest watchOS.",
    ],
    commonIssues: [
      {
        issue: "Pairing gets stuck or times out",
        fix: "Turn Bluetooth off and back on on the iPhone, restart both devices, and try pairing again from the Watch app.",
      },
      {
        issue: "Watch won't finish the initial software update during setup",
        fix: "Keep the watch on its charger and close to the iPhone with a strong Wi-Fi connection — first-time updates can take well over 30 minutes.",
      },
    ],
    tipsAndTricks: [
      "You can pair a new watch without unpairing an old one first — pairing a second watch just switches which one is active.",
      "Family Setup lets you pair a watch for a family member without their own iPhone, straight from your phone.",
    ],
    faqs: [
      { q: "Do I need an iPhone to use an Apple Watch?", a: "Yes for full setup — even cellular models need to be paired with an iPhone at least once, via Family Setup or a personal pairing." },
      { q: "Can I pair the same watch with a different iPhone later?", a: "Yes — unpair it from the current iPhone (which backs up its data), then pair with the new iPhone and restore." },
    ],
    relatedSettingIds: ["apple-watch-software-update", "apple-watch-bluetooth"],
  },
  {
    id: "apple-watch-software-update",
    title: "Update watchOS",
    icon: RefreshCw,
    platform: "apple-watch",
    category: "system-updates",
    frequentlyUsed: true,
    difficulty: "Beginner-friendly",
    estimatedTime: "3 min read",
    supportedVersions: "watchOS 10 and later",
    requiresPlatform: ["ios", "macos"],
    heading: "Keep your Apple Watch on the latest watchOS",
    description:
      "watchOS updates deliver security fixes, new features, and battery/performance improvements, and can be installed directly from the Watch app or, on newer models, from the watch itself.",
    details: [
      "The watch should be on its charger, above 50% battery, and within range of the paired iPhone.",
      "Updates can also be installed directly on the watch under Settings → General → Software Update, on supported models.",
    ],
    important: "Don't remove the watch from its charger or walk out of Bluetooth/Wi-Fi range mid-update — this can interrupt installation.",
    redirectUrl: "https://support.apple.com/apple-watch",
    actionLabel: "View Update Guidance",
    whyItMatters:
      "Apple ships security patches for watchOS on a similar cadence to iOS — an out-of-date watch can be running with known, already-patched vulnerabilities, and can also fall behind on Health and Fitness feature updates.",
    bestPractices: [
      "Update the paired iPhone to the latest iOS first — a compatible iOS version is required.",
      "Charge overnight the first time you update after a while, since a large backlog of updates takes longer.",
    ],
    commonIssues: [
      { issue: "Update won't download", fix: "Confirm there's enough free storage on the watch, and that Wi-Fi (not just Bluetooth) is connected on the iPhone." },
      { issue: "Update seems stuck at the same percentage for a long time", fix: "Leave it on the charger — some stages genuinely take 15-20+ minutes with no visible progress change." },
    ],
    tipsAndTricks: ["Enable automatic updates in the Watch app so future watchOS releases install overnight without any manual steps."],
    faqs: [{ q: "Can I update watchOS without my iPhone nearby?", a: "Only on newer cellular models with Wi-Fi configured directly on the watch — most updates still need the paired iPhone." }],
    relatedSettingIds: ["apple-watch-pairing", "apple-watch-bluetooth"],
  },
  {
    id: "apple-watch-bluetooth",
    title: "Bluetooth & Connectivity",
    icon: Bluetooth,
    platform: "apple-watch",
    category: "connectivity-network",
    frequentlyUsed: false,
    difficulty: "Easy",
    estimatedTime: "3 min read",
    supportedVersions: "watchOS 10 and later",
    requiresPlatform: ["ios", "macos"],
    heading: "Fix a dropped connection between your watch and iPhone",
    description:
      "Apple Watch relies on a combination of Bluetooth and Wi-Fi to stay in sync with the paired iPhone. A red iPhone icon on the watch face means it's currently out of range or disconnected.",
    details: [
      "Bluetooth range is roughly 30 feet (10 meters) with a clear line of sight — walls and interference shrink this.",
      "When Bluetooth range is exceeded, the watch automatically tries to fall back to a shared Wi-Fi network if one is available.",
    ],
    redirectUrl: "https://support.apple.com/apple-watch",
    actionLabel: "Open Connectivity Guidance",
    whyItMatters:
      "Without a stable connection, notifications, calls, and Health data stop syncing — the watch keeps working for basics like time and stored music, but loses most of what makes it useful day-to-day.",
    commonIssues: [
      { issue: "Persistent red disconnected icon even when nearby", fix: "Turn Airplane Mode on and back off on both devices, or restart the watch by holding the side button until the power-off slider appears." },
      { issue: "Watch won't reconnect after a software update", fix: "Restart both the iPhone and watch — a fresh Bluetooth handshake after an update resolves most stuck connections." },
    ],
    tipsAndTricks: ["If the watch and iPhone are in the same room but still show disconnected, toggling Wi-Fi off on the iPhone briefly can force a clean Bluetooth reconnect."],
    faqs: [{ q: "Does my watch lose data while disconnected?", a: "No — it queues locally and syncs automatically once the connection is restored." }],
    relatedSettingIds: ["apple-watch-pairing", "apple-watch-software-update"],
  },
];
