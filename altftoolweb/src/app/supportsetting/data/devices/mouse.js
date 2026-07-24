import { Bluetooth, Gauge } from "lucide-react";

export const mouseSettings = [
  {
    id: "mouse-bluetooth-pairing",
    title: "Pair a Wireless Mouse",
    icon: Bluetooth,
    platform: "mouse",
    category: "connectivity-network",
    frequentlyUsed: true,
    recommended: true,
    difficulty: "Beginner-friendly",
    estimatedTime: "3 min read",
    supportedVersions: "Bluetooth and 2.4GHz USB-receiver wireless mice",
    heading: "Connect a wireless mouse over Bluetooth or a USB receiver",
    description:
      "Most wireless mice use one of two connection types — Bluetooth (pairs directly with your computer's built-in radio) or a proprietary 2.4GHz USB receiver (a small dongle that plugs into a USB port). Some higher-end mice support both, switchable with a button on the underside.",
    details: [
      "For a USB-receiver mouse: plug the receiver into a USB port, turn the mouse on with its power switch, and it should connect within a few seconds with no further steps.",
      "For Bluetooth: put the mouse into pairing mode (usually a dedicated button or switch, sometimes held for a few seconds), then on your computer open Bluetooth settings and select the mouse from the list of discoverable devices.",
      "Windows: Settings → Bluetooth & devices → Add device. macOS: System Settings → Bluetooth.",
    ],
    redirectUrl: "https://support.microsoft.com/en-us/windows/connect-a-bluetooth-device-in-windows-8b3c8e6f-a4c6-4f1e-9e6b-e5f5f9db1c3a",
    actionLabel: "Open Windows Support: Connect a Bluetooth Device",
    whyItMatters:
      "A USB receiver generally gives lower latency and more reliable tracking than Bluetooth, which matters for fast-paced work or gaming — knowing which connection type a given mouse uses (and that many support only one) avoids buying the wrong expectation into a purchase.",
    bestPractices: [
      "Keep the USB receiver plugged into the same port it was originally paired to if the mouse ever stops responding intermittently — some models bind loosely to the port's exact USB controller.",
      "Replace batteries or recharge before they're fully drained — many wireless mice show increasingly erratic tracking as battery level drops, which is easy to mistake for a connection problem.",
      "Use a USB extension cable to bring the receiver closer to the mouse if your computer is inside a metal case or far below desk level.",
    ],
    commonIssues: [
      { issue: "Mouse cursor stutters or lags intermittently", fix: "Try a different USB port (preferably USB 2.0 over a USB 3.0 hub, which can cause 2.4GHz interference), or move the receiver away from other wireless devices and metal obstructions." },
      { issue: "Bluetooth mouse won't show up when pairing", fix: "Remove/forget any previous pairing of that mouse first, then re-enter pairing mode — most Bluetooth mice only broadcast as discoverable to one pairing attempt at a time." },
    ],
    tipsAndTricks: ["If a mouse supports both connection types, keep the USB receiver as your default for gaming or precision work and reserve Bluetooth for laptops where you don't want to use up a USB port."],
    faqs: [{ q: "Can I use the same wireless mouse on two computers?", a: "Some mice support multi-device pairing with a switch button to flip between two or three paired connections; others need to be re-paired manually each time you switch computers." }],
    relatedSettingIds: ["mouse-pointer-speed"],
  },
  {
    id: "mouse-pointer-speed",
    title: "Adjust Pointer Speed & Sensitivity",
    icon: Gauge,
    platform: "mouse",
    category: "personalization",
    frequentlyUsed: true,
    difficulty: "Easy",
    estimatedTime: "2 min read",
    supportedVersions: "Any mouse, on Windows or macOS",
    heading: "Tune how fast the cursor moves relative to your hand movement",
    description:
      "Pointer speed (sometimes called sensitivity) controls how far the on-screen cursor travels for a given physical movement of the mouse. Both Windows and macOS expose a basic slider in system settings, and many gaming mice add a manufacturer app with finer per-profile control.",
    details: [
      "Windows: Settings → Bluetooth & devices → Mouse → adjust \"Cursor speed,\" and optionally turn off \"Enhance pointer precision\" if you want fully linear, acceleration-free movement.",
      "macOS: System Settings → Mouse → adjust the \"Tracking speed\" slider.",
      "For mice with onboard DPI (dots per inch) buttons, pressing them changes hardware-level sensitivity independent of the OS slider — the two settings multiply together.",
    ],
    redirectUrl: "https://support.apple.com/guide/mac-help/change-mouse-settings-mh27979/mac",
    actionLabel: "Open Apple Support: Change Mouse Settings",
    whyItMatters:
      "Mismatched pointer speed is one of the most common sources of everyday mouse frustration — too slow feels sluggish on a large or multi-monitor setup, too fast makes precise clicking (small UI buttons, design work) error-prone, and the fix is a thirty-second slider adjustment most people never revisit after initial setup.",
    bestPractices: [
      "If you use multiple monitors, err toward a faster pointer speed so the cursor can cross the full desktop without a large physical hand movement.",
      "Turn off pointer acceleration (\"Enhance pointer precision\" on Windows) if you do design, video editing, or gaming, where consistent 1:1 movement matters more than raw speed.",
      "Re-check sensitivity after switching to a new mouse with a different native DPI — the OS slider interacts with hardware DPI, so a setting that felt right on one mouse can feel very different on another.",
    ],
    commonIssues: [
      { issue: "Cursor feels inconsistent — sometimes fast, sometimes slow, at the same OS setting", fix: "This is pointer acceleration responding to how fast you physically move the mouse; disable \"Enhance pointer precision\" (Windows) for fully linear movement." },
      { issue: "Cursor speed resets after reconnecting a wireless mouse", fix: "Check the manufacturer's own configuration app if the mouse has onboard DPI settings — some default back to a factory DPI stage on reconnect, independent of the OS-level slider." },
    ],
    tipsAndTricks: ["Most gaming-oriented mice ship with a companion app that lets you save per-profile DPI stages tied to a physical button — worth installing even for productivity use if the mouse has one."],
    faqs: [{ q: "What's the difference between DPI and pointer speed?", a: "DPI is a hardware property of the mouse sensor (how many tracking steps per inch of physical movement); pointer speed is an OS-level multiplier applied on top of whatever DPI the mouse reports." }],
    relatedSettingIds: ["mouse-bluetooth-pairing"],
  },
];
