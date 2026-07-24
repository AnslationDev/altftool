import { RefreshCw, Wifi } from "lucide-react";

// Example, fully-authored guides for Linux desktops — deliberately written
// at the distribution-agnostic level (the core update/network model is the
// same across the major desktop distros) rather than tied to one specific
// distribution's exact menu wording, since "Linux" here covers any of them.
export const linuxSettings = [
  {
    id: "linux-system-update",
    title: "Update System Packages",
    icon: RefreshCw,
    platform: "linux",
    category: "system-updates",
    frequentlyUsed: true,
    recommended: true,
    difficulty: "Beginner-friendly",
    estimatedTime: "4 min read",
    supportedVersions: "Most desktop distributions (Ubuntu, Fedora, Debian, Arch, and derivatives)",
    heading: "Keep your distribution's packages current",
    description:
      "Unlike Windows or macOS, Linux updates are handled by your distribution's package manager rather than one built-in updater — the exact tool differs by distro, but the underlying idea (refresh the package index, then upgrade installed packages) is the same everywhere.",
    details: [
      "Debian/Ubuntu-based systems: `sudo apt update && sudo apt upgrade` from a terminal, or the graphical \"Software Updater\"/\"Update Manager\" app.",
      "Fedora/RHEL-based systems: `sudo dnf upgrade`, or the graphical \"Software\" app's Updates tab.",
      "Arch-based systems: `sudo pacman -Syu`.",
      "Most desktop environments also show a notification icon when updates are available.",
    ],
    important: "A kernel update usually requires a reboot to actually take effect, even though the update itself completes without one.",
    redirectUrl: "https://www.kernel.org/doc/html/latest/",
    actionLabel: "Open Kernel & Distro Documentation",
    whyItMatters:
      "Distros ship security patches through the same package manager as everything else — deferring updates leaves known vulnerabilities unpatched, and skipping too many releases in a row can turn a routine upgrade into one with much larger version jumps to reconcile at once.",
    bestPractices: [
      "Update at least weekly, and right away for anything flagged as a security update.",
      "Reboot after a kernel or graphics-driver update rather than leaving the old one running until your next restart.",
      "Read the changelog before a major distro version upgrade (e.g. Ubuntu 22.04 → 24.04) — these are bigger jumps than a routine package update.",
    ],
    commonIssues: [
      { issue: "\"Held broken packages\" or dependency conflict during upgrade", fix: "Run your package manager's built-in fix command first (e.g. `sudo apt --fix-broken install` on Debian/Ubuntu) before retrying the upgrade." },
      { issue: "Update seems to hang with no output", fix: "It's often waiting on a package-manager lock held by another process (e.g. a background update check) — wait a minute, or check for a stuck `apt`/`dpkg` process before force-killing anything." },
    ],
    tipsAndTricks: ["Most distros can be configured to install security updates automatically in the background — worth turning on even if you keep feature updates manual."],
    faqs: [{ q: "Do I need to update every app individually?", a: "No — apps installed through your distro's package manager update together with the system. Apps installed via Flatpak or Snap update separately through their own tools (`flatpak update` / `snap refresh`)." }],
    relatedSettingIds: ["linux-wifi-network"],
  },
  {
    id: "linux-wifi-network",
    title: "Wi-Fi & Network Connection",
    icon: Wifi,
    platform: "linux",
    category: "connectivity-network",
    frequentlyUsed: true,
    difficulty: "Easy",
    estimatedTime: "3 min read",
    supportedVersions: "Most desktop distributions using NetworkManager",
    heading: "Connect to Wi-Fi and manage network connections",
    description:
      "Most modern desktop distros use NetworkManager under the hood, accessed through the network icon in the top or bottom system tray, or each desktop environment's own Settings app (GNOME Settings, KDE System Settings, etc.).",
    details: [
      "Click the network icon in the system tray to see and join available Wi-Fi networks.",
      "Saved networks, VPN connections, and proxy settings live under the same panel's \"Network\" or \"Wi-Fi\" section.",
      "`nmcli` and `nmtui` provide the same functionality from a terminal, useful on systems without a graphical desktop.",
    ],
    redirectUrl: "https://networkmanager.dev/docs/",
    actionLabel: "Open NetworkManager Documentation",
    whyItMatters:
      "Wi-Fi driver support is the single most common source of first-boot friction on Linux laptops — knowing whether your system uses NetworkManager (and how to check connection status from a terminal) makes troubleshooting far faster than guessing through a GUI that might not even be loading correctly yet.",
    bestPractices: [
      "Prefer a wired connection for the initial install/update on a new machine, since Wi-Fi drivers occasionally need a kernel update to work fully.",
      "Keep VPN client packages updated through your package manager rather than a separate manual install where possible.",
    ],
    commonIssues: [
      { issue: "Wi-Fi adapter isn't detected at all", fix: "Check if it needs a proprietary driver (common on Broadcom and some Realtek chipsets) — most distros have an \"Additional Drivers\" tool or a documented package name for this." },
      { issue: "Connects but internet doesn't work (captive portal networks)", fix: "Open a browser and try to load any http (not https) page — many distros' captive-portal detection is less reliable than Windows/macOS and needs a manual nudge." },
    ],
    tipsAndTricks: ["`nmcli device wifi list` and `nmcli device status` are the fastest way to check what NetworkManager sees when the GUI applet isn't showing what you expect."],
    faqs: [{ q: "Why does my Wi-Fi disconnect when I close the lid?", a: "This is a power-management setting, not a network issue — check your desktop environment's power settings for a \"Wi-Fi power saving\" toggle." }],
    relatedSettingIds: ["linux-system-update"],
  },
];
