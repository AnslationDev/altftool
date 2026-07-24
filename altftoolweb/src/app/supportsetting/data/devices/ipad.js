import { RefreshCw, Cloud } from "lucide-react";

export const ipadSettings = [
  {
    id: "ipad-software-update",
    title: "Update iPadOS",
    icon: RefreshCw,
    platform: "ipad",
    category: "system-updates",
    frequentlyUsed: true,
    recommended: true,
    difficulty: "Beginner-friendly",
    estimatedTime: "3 min read",
    supportedVersions: "iPadOS 16 and later",
    heading: "Keep iPadOS current",
    description:
      "iPadOS updates bundle security fixes, bug fixes, and new features. Updating is one tap once you know where to look, and your iPad can be set to install updates automatically overnight.",
    details: [
      "Open Settings → General → Software Update.",
      "If an update is available, tap \"Download and Install.\"",
      "Your iPad should be connected to Wi-Fi and, ideally, charging or plugged in during the download and install.",
      "To turn on automatic updates, tap \"Automatic Updates\" and enable both \"Download iPadOS Updates\" and \"Install iPadOS Updates.\"",
    ],
    important: "Back up your iPad (iCloud or a computer) before installing a major iPadOS version upgrade, not just a minor point update.",
    redirectUrl: "https://support.apple.com/en-us/HT204204",
    actionLabel: "Open Apple Support: Update iPadOS",
    whyItMatters:
      "Security patches ship through these updates — an iPad left several versions behind is missing fixes for known vulnerabilities, and some apps eventually require a minimum iPadOS version to install or update at all.",
    bestPractices: [
      "Install security-focused point updates (e.g. 17.4.1) promptly; they're usually small and low-risk.",
      "For major version upgrades (e.g. 16 → 17), read Apple's release notes first if you rely on a specific app's compatibility.",
      "Keep at least a few GB of free storage — iPadOS needs headroom to stage an update before installing.",
    ],
    commonIssues: [
      { issue: "\"Not enough storage\" error during update", fix: "Offload unused apps (Settings → General → iPad Storage) or delete large photos/videos temporarily — iPadOS can often install using a smaller temporary download if space is freed." },
      { issue: "Update stuck on the Apple logo or a progress bar for a long time", fix: "Wait at least 15–20 minutes before assuming it's stuck; a genuine stall is fixed by holding the top button and a volume button until it restarts, then retrying the update over Wi-Fi." },
    ],
    tipsAndTricks: ["Updates are often smaller and faster over stable Wi-Fi at night than during peak daytime usage — automatic overnight installs take advantage of exactly this."],
    faqs: [{ q: "Will updating erase my apps or data?", a: "No, a standard software update preserves your apps, settings, and data. Only a manual \"Erase All Content and Settings\" wipes the device." }],
    relatedSettingIds: ["ipad-apple-id-icloud"],
  },
  {
    id: "ipad-apple-id-icloud",
    title: "Apple ID & iCloud Sync",
    icon: Cloud,
    platform: "ipad",
    category: "accounts-sync-family",
    frequentlyUsed: true,
    difficulty: "Easy",
    estimatedTime: "4 min read",
    supportedVersions: "iPadOS 16 and later",
    heading: "Manage your Apple ID and what syncs to iCloud",
    description:
      "Your Apple ID is the account behind everything on your iPad — App Store purchases, iCloud storage, Find My, and Handoff with your other Apple devices. The iCloud toggles control exactly what syncs.",
    details: [
      "Open Settings and tap your name at the top to view your Apple ID.",
      "Tap \"iCloud\" to see and toggle individual sync categories — Photos, iCloud Drive, Contacts, Notes, and more each sync independently.",
      "\"iCloud Backup\" (under iCloud) backs up the whole device, separate from the per-app sync toggles above it.",
      "\"Find My\" and \"Sign in with Apple\" also live under your Apple ID settings, not under iCloud.",
    ],
    redirectUrl: "https://support.apple.com/en-us/HT204053",
    actionLabel: "Open Apple Support: iCloud",
    whyItMatters:
      "Turning off a sync toggle doesn't just stop new syncing — depending on the category, it can prompt to delete that data from the iPad locally (with an option to keep it), so it's worth understanding each toggle rather than switching them off reflexively to save storage.",
    bestPractices: [
      "Keep \"Find My iPad\" turned on — it's the only way to locate or remotely lock a lost or stolen device.",
      "Check iCloud storage usage (Settings → your name → iCloud → Manage Account Storage) before assuming a sync failure is the cause of a \"storage full\" message.",
      "Use a strong, unique password and two-factor authentication on your Apple ID, since it also protects purchase history and payment methods.",
    ],
    commonIssues: [
      { issue: "Photos not syncing to iCloud Photos", fix: "Confirm Wi-Fi is connected (initial large syncs often pause on cellular) and check Settings → your name → iCloud → Photos is enabled, then check available iCloud storage isn't full." },
      { issue: "\"Apple ID verification failed\" message", fix: "Sign out and back in under Settings → your name → Sign Out, then sign back in — this is usually a stale session token rather than a real password problem." },
    ],
    tipsAndTricks: ["\"Manage Account Storage\" breaks down usage by app/category (Photos, Backups, Mail, etc.) so you can see exactly what's consuming your iCloud plan before upgrading it."],
    faqs: [{ q: "Do I need iCloud Backup if I already back up to a computer?", a: "No — either is sufficient on its own. Many people keep both for redundancy, but iCloud Backup alone is enough to restore a lost or replaced iPad." }],
    relatedSettingIds: ["ipad-software-update"],
  },
];
