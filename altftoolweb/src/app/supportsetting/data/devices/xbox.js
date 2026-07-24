import { RefreshCw, Gamepad2 } from "lucide-react";

export const xboxSettings = [
  {
    id: "xbox-system-update",
    title: "Update Xbox System Software",
    icon: RefreshCw,
    platform: "xbox",
    category: "system-updates",
    frequentlyUsed: true,
    recommended: true,
    difficulty: "Beginner-friendly",
    estimatedTime: "3 min read",
    supportedVersions: "Xbox Series X|S, Xbox One",
    heading: "Keep your console's system software current",
    description:
      "Xbox installs most system updates automatically while in standby, but it's worth knowing how to check for and trigger one manually — especially before playing a newly released game that needs the latest system version.",
    details: [
      "Press the Xbox button to open the guide, then go to Profile & system → Settings → System → Updates.",
      "Select \"Update console\" if an update is available.",
      "To let updates install automatically overnight, leave the console in standby (not fully powered off) and confirm \"Instant-on\" is your chosen power mode under Settings → General → Power mode & startup.",
    ],
    redirectUrl: "https://support.xbox.com/en-US/help/hardware-network/system-updates",
    actionLabel: "Open Xbox Support: System Updates",
    whyItMatters:
      "Some games and features (cross-platform play, certain accessories, new controller firmware) require a minimum console system version — an out-of-date console can fail to launch a game entirely until it updates.",
    bestPractices: [
      "Leave the console in standby rather than fully off overnight so background updates can install automatically.",
      "Update before a major game launch rather than at launch time, when servers and update delivery are under the heaviest load.",
      "Keep at least a few GB free on your storage device — updates need temporary space to install.",
    ],
    commonIssues: [
      { issue: "Update stuck or very slow", fix: "Check your network connection (Settings → General → Network settings → Test network connection) — a weak or congested connection is the most common cause, not a problem with the console itself." },
      { issue: "\"Not enough storage\" during update", fix: "Uninstall an unused game temporarily (Settings → System → Storage), install the update, then reinstall the game from your library." },
    ],
    tipsAndTricks: ["\"Instant-on\" power mode enables automatic overnight updates and near-instant wake — \"Energy-saving\" mode saves more power but updates only when you manually launch a check."],
    faqs: [{ q: "Do I need to update if I only play offline?", a: "Eventually, yes — most single-player games still receive patches, and staying too far behind can eventually block online features if you reconnect later." }],
    relatedSettingIds: ["xbox-controller-pairing"],
  },
  {
    id: "xbox-controller-pairing",
    title: "Pair & Update a Controller",
    icon: Gamepad2,
    platform: "xbox",
    category: "devices-peripherals",
    frequentlyUsed: true,
    difficulty: "Easy",
    estimatedTime: "3 min read",
    supportedVersions: "Xbox Wireless Controller (all generations)",
    heading: "Connect a new controller and keep its firmware updated",
    description:
      "Xbox Wireless Controllers pair directly to the console over Xbox Wireless (not Bluetooth, unless you're connecting to a PC or mobile device) and can also receive their own firmware updates independent of the console's system software.",
    details: [
      "Press and hold the Xbox button on the controller for a few seconds to turn it on.",
      "Press and release the small pairing button on top of the console (or on the wireless adapter for older consoles).",
      "On the controller, press and release its own pairing button — the Xbox button will flash, then stay solid once paired.",
      "To update controller firmware, go to Profile & system → Settings → Devices & connections → Accessories, select the controller, and choose \"Firmware update\" if one is available.",
    ],
    redirectUrl: "https://support.xbox.com/en-US/help/hardware-network/controller/xbox-wireless-controller-connect",
    actionLabel: "Open Xbox Support: Controller Pairing",
    whyItMatters:
      "Controller firmware updates fix input latency, connection drops, and stick-drift-adjacent calibration issues — a controller stuck on old firmware is a common, easily overlooked cause of intermittent disconnects that get blamed on the console instead.",
    bestPractices: [
      "Update controller firmware right after pairing a new or long-unused controller, before assuming any input issue is hardware-related.",
      "Keep controllers charged above roughly 20% before starting a firmware update — an update interrupted by power loss can require a factory reset to recover.",
      "Use a USB-C cable to pair and update a controller if wireless pairing keeps failing — it's more reliable for the very first connection.",
    ],
    commonIssues: [
      { issue: "Controller won't pair — Xbox button just blinks and gives up", fix: "Move within a few feet of the console with no other wireless controllers actively pairing at the same time, and try a fresh pairing-button press within about 20 seconds of powering on the controller." },
      { issue: "Controller connects but inputs are delayed or drop intermittently", fix: "Check for firmware updates first; if already current, move away from other 2.4GHz wireless devices (routers, other consoles) which can interfere with Xbox Wireless." },
    ],
    tipsAndTricks: ["A controller can be paired to more than one console/PC, but it only stays actively connected to whichever it was most recently paired or manually switched to."],
    faqs: [{ q: "Can I use a PlayStation or third-party controller on Xbox?", a: "Only officially licensed Xbox-compatible controllers work with Xbox consoles — most third-party or other-platform controllers are not supported without specific licensing for Xbox." }],
    relatedSettingIds: ["xbox-system-update"],
  },
];
