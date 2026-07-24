import { Headphones, RefreshCw, Bluetooth } from "lucide-react";

// Example authored guides for AirPods, proving out the Accessories
// category. Covers the core Bluetooth-accessory flows that generalize
// reasonably well to most other headphone/earbud accessories too.
export const airpodsSettings = [
  {
    id: "airpods-pairing",
    title: "Pair AirPods with a Device",
    icon: Headphones,
    platform: "airpods",
    category: "connectivity-network",
    frequentlyUsed: true,
    recommended: true,
    difficulty: "Beginner-friendly",
    estimatedTime: "2 min read",
    supportedVersions: "All AirPods generations",
    heading: "Connect AirPods to an iPhone, iPad, or Mac",
    description:
      "AirPods pair almost instantly with Apple devices signed into the same Apple ID via a one-tap animation, and can also be paired manually with any Bluetooth device, including Windows and Android.",
    details: [
      "Once paired with one device on an Apple ID, AirPods are automatically available on your other Apple devices signed into iCloud.",
      "Manual pairing (for Windows, Android, or a second Apple ID) uses the case's setup button.",
    ],
    redirectUrl: "https://support.apple.com/airpods",
    actionLabel: "Open AirPods Support",
    whyItMatters:
      "A clean initial pairing is what enables automatic switching between your devices later — a rushed or interrupted pairing is the most common cause of AirPods that connect but won't switch devices reliably.",
    afterImageContent: {
      heading: "How to pair manually",
      steps: [
        "Open the AirPods case near the device, with the lid open.",
        "Press and hold the setup button on the back of the case until the status light flashes white.",
        "On the device, open Bluetooth settings and select your AirPods from the list.",
      ],
    },
    bestPractices: [
      "Keep AirPods charged above 20% before a first-time pairing to avoid an interrupted setup.",
      "Update your iPhone's iOS version before pairing new AirPods for the smoothest one-tap setup experience.",
    ],
    commonIssues: [
      { issue: "AirPods won't show up in the pairing animation", fix: "Close the case, wait 10 seconds, reopen it near the device, and make sure Bluetooth is turned on." },
      { issue: "AirPods pair but audio stays on the phone speaker", fix: "Manually select the AirPods as the output device from the device's audio/output menu." },
    ],
    tipsAndTricks: ["Holding the case's setup button for a full 15 seconds (until the light flashes amber, then white) fully resets the pairing if AirPods are behaving inconsistently."],
    faqs: [{ q: "Can I use AirPods with a Windows PC?", a: "Yes — they pair over standard Bluetooth from Windows' Bluetooth settings, though automatic-switching features are Apple-ecosystem only." }],
    relatedSettingIds: ["airpods-firmware-update", "airpods-connectivity-troubleshooting"],
  },
  {
    id: "airpods-firmware-update",
    title: "Firmware Updates",
    icon: RefreshCw,
    platform: "airpods",
    category: "system-updates",
    frequentlyUsed: false,
    difficulty: "Beginner-friendly",
    estimatedTime: "2 min read",
    supportedVersions: "All AirPods generations",
    heading: "Keep AirPods firmware up to date",
    description:
      "AirPods firmware updates install automatically in the background while they're charging, in the case, and near a paired iPhone with internet access — there's no manual \"check for update\" button.",
    details: [
      "Check the current version under Settings → General → About → AirPods on a paired iPhone.",
      "Updates cannot be manually forced or scheduled — they happen opportunistically.",
    ],
    redirectUrl: "https://support.apple.com/airpods",
    actionLabel: "Check Update Guidance",
    whyItMatters:
      "Firmware updates have historically fixed real connectivity bugs and added features (like new spatial audio or noise-cancellation improvements on supported models) — an AirPods pair that seems to \"just have issues\" is sometimes simply behind on firmware.",
    bestPractices: [
      "Leave AirPods in the case, charging, near your iPhone with Wi-Fi overnight occasionally to give updates a chance to install.",
      "Keep your iPhone's iOS itself updated — very old iOS versions can't push the newest AirPods firmware.",
    ],
    commonIssues: [{ issue: "Firmware version hasn't changed in a long time", fix: "Place both AirPods in the case, close the lid for at least 30 seconds, then reopen near your iPhone on Wi-Fi and leave it idle for a while." }],
    tipsAndTricks: ["There's no way to roll back an AirPods firmware update once installed."],
    faqs: [{ q: "Do I need to do anything to install a firmware update?", a: "No manual action is needed — just keep them charging near a paired, updated iPhone with internet access." }],
    relatedSettingIds: ["airpods-pairing", "airpods-connectivity-troubleshooting"],
  },
  {
    id: "airpods-connectivity-troubleshooting",
    title: "Connectivity Troubleshooting",
    icon: Bluetooth,
    platform: "airpods",
    category: "troubleshooting-diagnostics",
    frequentlyUsed: true,
    difficulty: "Easy",
    estimatedTime: "3 min read",
    supportedVersions: "All AirPods generations",
    heading: "Fix dropped audio, one-sided sound, or switching problems",
    description:
      "Most AirPods connectivity complaints — audio cutting out, only one earbud playing, or AirPods not switching to the device you're actively using — are resolved by a short reset rather than a hardware fault.",
    redirectUrl: "https://support.apple.com/airpods",
    actionLabel: "Open Troubleshooting Guide",
    commonIssues: [
      { issue: "Audio cuts in and out", fix: "Move away from other Bluetooth devices and Wi-Fi routers, which can cause interference, and confirm both AirPods have similar battery levels." },
      { issue: "Only one AirPod plays audio", fix: "Put both AirPods back in the case, close it for 15 seconds, then take them both out and reconnect." },
      { issue: "AirPods won't switch to the device I'm using", fix: "Manually select them from the new device's Bluetooth/audio menu once — automatic switching resumes after that." },
    ],
    whyItMatters:
      "Understanding that a full case-reset resolves the majority of everyday connectivity glitches saves a trip to an Apple Store for something that's almost always fixable in under a minute.",
    tipsAndTricks: ["If a full reset doesn't help, forgetting the AirPods from Bluetooth settings on every paired device and re-pairing from scratch resolves most persistent issues."],
    faqs: [{ q: "Is dropped audio a sign my AirPods are failing?", a: "Usually not — it's most often interference or a stale connection, both fixed by the case-reset steps above." }],
    relatedSettingIds: ["airpods-pairing", "airpods-firmware-update"],
  },
];
