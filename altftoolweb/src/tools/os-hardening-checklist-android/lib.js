/**
 * Android hardening checklist.
 *
 * Android's security settings arrived across many releases, so a checklist
 * that ignores the version either tells you to open menus that do not exist or
 * omits the protections you already have. Every item here carries the Android
 * version it first became available in, a weight for how much risk it removes,
 * and the threat profiles it is relevant to.
 *
 * Version anchors, from Android's own release documentation:
 *  - Android 9: lockdown mode on the power menu, which disables biometrics and
 *    Smart Lock until the PIN is entered; end-to-end encrypted backups tied to
 *    the device screen lock.
 *  - Android 10: file-based encryption is mandatory; per-use location
 *    permission; MAC randomisation on by default.
 *  - Android 11: one-time permissions, and automatic permission reset for apps
 *    you have not opened in a few months.
 *  - Android 12: privacy dashboard, camera and microphone indicators and
 *    toggles, approximate-location option, the "allow 2G" switch, and deletion
 *    of the advertising ID rather than a reset.
 *  - Android 13: per-app notification permission, the system photo picker, and
 *    automatic clipboard clearing.
 *  - Android 14: partial photo and video access, restricted settings for
 *    sideloaded apps, blocking installation of apps targeting API level 23 or
 *    lower, and hiding the PIN entry animation.
 *  - Android 15: Private Space, Theft Detection Lock and Offline Device Lock,
 *    stronger factory reset protection, and hiding one-time codes from lock
 *    screen notifications.
 *  - Android 16: Advanced Protection, a single device-level mode that turns on
 *    the strongest available settings together.
 *
 * Two facts that shape the ordering:
 *  - Full-disk protection on Android is only complete before the first unlock
 *    after a reboot. Once you have unlocked once, credential-encrypted storage
 *    stays available to the running system. Rebooting a phone you are about to
 *    hand over returns it to that stronger state.
 *  - Android security patches ship on a monthly bulletin cycle, so a patch
 *    level more than about 90 days old means several bulletins have been
 *    missed.
 *
 * Informational only. Menu names differ between manufacturers.
 */

export const MIN_VERSION = 8;
export const MAX_VERSION = 16;

/** Android ships security bulletins monthly. */
export const PATCH_CYCLE_DAYS = 30;
export const PATCH_STALE_DAYS = 90;
export const PATCH_CRITICAL_DAYS = 180;

export const MS_PER_DAY = 86400000;

export const PROFILES = [
  {
    id: "everyday",
    label: "Everyday use — theft, loss and scam apps",
    blurb: "The phone is more likely to be stolen or lost than targeted.",
  },
  {
    id: "targeted",
    label: "Someone who might get their hands on my phone",
    blurb:
      "An ex-partner, housemate or colleague with occasional physical access. Stalkerware and lock-screen leaks matter most.",
  },
  {
    id: "highrisk",
    label: "High risk — journalism, activism, border crossings",
    blurb:
      "Assume a well-resourced adversary with physical access and an interest in the contents.",
  },
  {
    id: "work",
    label: "Work phone or BYOD",
    blurb: "Company data on a device that is also personal.",
  },
];

export const PROFILE_IDS = PROFILES.map((item) => item.id);

/**
 * Checklist items.
 *  minVersion – Android version the setting first appeared in
 *  weight     – relative risk reduction, 1 to 10
 *  profiles   – null for everyone, or the profiles it matters to
 */
export const GROUPS = [
  {
    id: "lock",
    title: "Lock screen and unlock",
    items: [
      {
        id: "pin6",
        title: "Use a PIN of at least six digits, not a pattern",
        how: "Settings → Security & privacy → Device unlock → Screen lock → PIN.",
        why: "A four-digit PIN has 10,000 combinations; six digits has a million. Patterns are worse than either — they are readable from smudges and over a shoulder, and most people pick from a small set of shapes.",
        weight: 9,
      },
      {
        id: "timeout",
        title: "Set the screen to lock within a minute of going dark",
        how: "Settings → Display → Screen timeout, then Security & privacy → Device unlock → Lock after screen timeout.",
        why: "A phone that stays unlocked for fifteen minutes after you put it down is unlocked for anyone who picks it up in that window.",
        weight: 7,
      },
      {
        id: "notif-hide",
        title: "Hide sensitive notification content on the lock screen",
        how: "Settings → Notifications → Notifications on lock screen → Show sensitive content only when unlocked.",
        why: "One-time codes, message previews and delivery notifications are readable without unlocking anything.",
        weight: 7,
      },
      {
        id: "otp-hide",
        title: "Turn on hiding of one-time codes in lock screen notifications",
        how: "Settings → Notifications → Sensitive notifications.",
        why: "Android 15 added a specific control for one-time passcodes, so codes are hidden even when other previews are shown.",
        weight: 6,
        minVersion: 15,
      },
      {
        id: "lockdown",
        title: "Enable lockdown mode on the power menu",
        how: "Settings → Security & privacy → Device unlock → Show lockdown option, then hold the power button when you need it.",
        why: "Lockdown disables fingerprint, face unlock and Smart Lock until the PIN is entered. It is the one-second answer to being asked to unlock under pressure.",
        weight: 8,
        minVersion: 9,
        profiles: ["targeted", "highrisk"],
      },
      {
        id: "pin-privacy",
        title: "Turn off the enhanced PIN entry animation",
        how: "Settings → Security & privacy → Device unlock → Screen lock → Enhanced PIN privacy.",
        why: "Android 14 added this so the keypad no longer highlights the digits you press, which defeats shoulder-surfing and overhead cameras.",
        weight: 5,
        minVersion: 14,
        profiles: ["targeted", "highrisk"],
      },
      {
        id: "smartlock-off",
        title: "Turn off Smart Lock trusted places and trusted devices",
        how: "Settings → Security & privacy → More security settings → Extend Unlock.",
        why: "Trusted places keep the phone unlocked over a whole neighbourhood-sized geofence, and a trusted Bluetooth device keeps it unlocked whenever that device is in range — including in someone else's hands.",
        weight: 6,
        profiles: ["targeted", "highrisk", "work"],
      },
    ],
  },
  {
    id: "updates",
    title: "Updates and platform integrity",
    items: [
      {
        id: "patch",
        title: "Install the pending security patch and check the patch level",
        how: "Settings → Security & privacy → System & updates → Security update. The date shown is your actual patch level.",
        why: "Android publishes a security bulletin every month. The patch level date, not the Android version, tells you which of those fixes you have.",
        weight: 10,
      },
      {
        id: "auto-update-apps",
        title: "Turn on automatic app updates over Wi-Fi",
        how: "Play Store → profile → Settings → Network preferences → Auto-update apps.",
        why: "Most exploited bugs on a phone are in apps and libraries, not the OS.",
        weight: 6,
      },
      {
        id: "play-protect",
        title: "Confirm Play Protect scanning is on",
        how: "Play Store → profile → Play Protect → Settings → Scan apps with Play Protect.",
        why: "It scans sideloaded apps as well as Play installs, and its real-time checks catch the repackaged apps that spread through messaging links.",
        weight: 7,
      },
      {
        id: "eol",
        title: "Check whether the device still receives security updates at all",
        how: "Look up the manufacturer's stated support window for your exact model.",
        why: "A phone past its support window will never receive another bulletin, and no setting on this list compensates for that. It is the point at which the answer is a new device.",
        weight: 9,
      },
      {
        id: "advanced-protection",
        title: "Turn on Advanced Protection",
        how: "Settings → Security & privacy → Advanced Protection.",
        why: "Android 16 bundles the strongest available settings into one switch, including blocking sideloading, forcing HTTPS and disabling 2G, and it cannot be weakened one setting at a time afterwards.",
        weight: 9,
        minVersion: 16,
      },
    ],
  },
  {
    id: "apps",
    title: "Apps and permissions",
    items: [
      {
        id: "sideload",
        title: "Revoke install-unknown-apps permission from every app",
        how: "Settings → Apps → Special app access → Install unknown apps — set every entry to not allowed.",
        why: "This permission is granted per app, so a browser or messenger you allowed once stays allowed. It is the route most Android malware takes.",
        weight: 9,
      },
      {
        id: "restricted-settings",
        title: "Leave restricted settings enforced for sideloaded apps",
        how: "Do not tap Allow restricted settings when a sideloaded app asks for accessibility or notification listener access.",
        why: "Android 13 and 14 added this gate specifically because accessibility service access lets an app read the screen and tap for you — the capability every banking trojan needs.",
        weight: 9,
        minVersion: 13,
      },
      {
        id: "accessibility-audit",
        title: "Audit which apps hold accessibility and device admin access",
        how: "Settings → Accessibility → Downloaded apps, and Settings → Security & privacy → More security settings → Device admin apps.",
        why: "Stalkerware hides here. An app with accessibility access can read everything on screen, and a device admin app can resist uninstallation.",
        weight: 10,
        profiles: ["targeted", "highrisk", "work"],
      },
      {
        id: "auto-reset",
        title: "Leave permission auto-reset on for unused apps",
        how: "Settings → Apps → Unused apps, or per app under App info → Pause app activity if unused.",
        why: "Android 11 and later automatically revoke permissions from apps you have not opened in a few months, which quietly cleans up years of accumulated grants.",
        weight: 6,
        minVersion: 11,
      },
      {
        id: "photo-picker",
        title: "Give apps selected photos rather than the whole library",
        how: "When an app asks for photos, choose Select photos instead of Allow all.",
        why: "Android 13 introduced the system photo picker and Android 14 added partial access, so no app needs your entire camera roll to let you attach one image.",
        weight: 7,
        minVersion: 13,
      },
      {
        id: "location-precision",
        title: "Give approximate location where precise is not needed",
        how: "Settings → Location → App location permissions → choose Approximate for weather, news and shopping apps.",
        why: "Android 12 added the coarse-location option. Most apps that ask for precise location want it for advertising, not for the feature you use.",
        weight: 6,
        minVersion: 12,
      },
      {
        id: "privacy-dashboard",
        title: "Review the privacy dashboard for surprise access",
        how: "Settings → Security & privacy → Privacy → Privacy dashboard.",
        why: "It shows a 24-hour timeline of which apps used the camera, microphone and location. Anything you do not recognise is worth investigating.",
        weight: 6,
        minVersion: 12,
      },
      {
        id: "notif-permission",
        title: "Deny notification permission to apps that do not need it",
        how: "Settings → Notifications → App settings.",
        why: "Android 13 made notifications a runtime permission. Fewer notification-capable apps means fewer routes for a phishing prompt that looks like a system message.",
        weight: 4,
        minVersion: 13,
      },
    ],
  },
  {
    id: "network",
    title: "Network and radios",
    items: [
      {
        id: "no-2g",
        title: "Turn off 2G",
        how: "Settings → Network & internet → SIMs → Allow 2G — switch it off.",
        why: "2G has no mutual authentication and weak or absent encryption, which is what cell-site simulators exploit by forcing a downgrade. Android 12 added the switch to refuse it.",
        weight: 7,
        minVersion: 12,
        profiles: ["targeted", "highrisk"],
      },
      {
        id: "wifi-auto",
        title: "Stop auto-connecting to open Wi-Fi networks",
        how: "Settings → Network & internet → Internet → Network preferences → turn off Connect to public networks.",
        why: "An open network with a familiar name is trivial to impersonate, and the phone will join it silently while in your pocket.",
        weight: 6,
      },
      {
        id: "wifi-forget",
        title: "Forget saved networks you no longer use",
        how: "Settings → Network & internet → Internet → Saved networks.",
        why: "Saved networks are re-joined automatically anywhere the same name appears, and the list of names itself says where you have been.",
        weight: 5,
      },
      {
        id: "quick-share",
        title: "Set Quick Share visibility to contacts only",
        how: "Settings → Google → Devices & sharing → Quick Share → Who can share with you.",
        why: "Everyone-visible sharing invites unsolicited file transfers in public places.",
        weight: 4,
      },
      {
        id: "private-dns",
        title: "Set Private DNS to a resolver you trust",
        how: "Settings → Network & internet → Private DNS → Private DNS provider hostname.",
        why: "Android supports DNS over TLS system-wide, so your lookups stop being readable and modifiable by whoever runs the network.",
        weight: 5,
        minVersion: 9,
      },
    ],
  },
  {
    id: "account",
    title: "Account, backup and recovery",
    items: [
      {
        id: "google-2fa",
        title: "Put a passkey or a security key on the Google account",
        how: "myaccount.google.com → Security → 2-Step Verification.",
        why: "The Google account is the recovery path for the phone. If it falls, the device lock is a delay rather than a defence.",
        weight: 10,
      },
      {
        id: "find-device",
        title: "Turn on Find Hub, including finding the device offline",
        how: "Settings → Security & privacy → Device finders → Find My Device → Find your offline devices.",
        why: "Remote lock and erase only work if this was set up before the phone went missing.",
        weight: 8,
      },
      {
        id: "sim-pin",
        title: "Set a SIM PIN",
        how: "Settings → Security & privacy → More security settings → SIM lock.",
        why: "Without it, a thief moves your SIM to another phone and starts receiving your SMS codes within minutes. This is separate from the screen lock and most people never set it.",
        weight: 8,
      },
      {
        id: "theft-lock",
        title: "Turn on Theft Detection Lock and Offline Device Lock",
        how: "Settings → Security & privacy → Device unlock → Theft protection.",
        why: "Android 15 locks the screen automatically when it detects the motion of a phone being snatched, and again if the device is taken offline for a long period.",
        weight: 7,
        minVersion: 15,
      },
      {
        id: "backup-encrypt",
        title: "Confirm Google backup is on and tied to your screen lock",
        how: "Settings → System → Backup.",
        why: "Android backups are end-to-end encrypted using the device screen lock, so a strong PIN protects the cloud copy as well as the phone.",
        weight: 6,
        minVersion: 9,
      },
      {
        id: "private-space",
        title: "Move sensitive apps into Private Space",
        how: "Settings → Security & privacy → Private Space.",
        why: "Android 15 added a separate, separately locked profile that can be hidden from the app list entirely, which is a better answer than hoping nobody scrolls.",
        weight: 7,
        minVersion: 15,
        profiles: ["targeted", "highrisk"],
      },
    ],
  },
  {
    id: "physical",
    title: "Physical access",
    items: [
      {
        id: "adb-off",
        title: "Turn developer options and USB debugging off",
        how: "Settings → System → Developer options — switch the whole section off.",
        why: "USB debugging plus a previously authorised computer is a direct route into the device. If you have ever used it, revoke the stored authorisations too.",
        weight: 8,
      },
      {
        id: "usb-data-off",
        title: "Leave USB set to charging only by default",
        how: "Developer options → Default USB configuration → No data transfer, or simply refuse the file-transfer prompt.",
        why: "Public charging points can present themselves as a host. Charge from your own adapter, or use a charge-only cable.",
        weight: 5,
        profiles: ["targeted", "highrisk"],
      },
      {
        id: "reboot-bfu",
        title: "Reboot the phone before handing it over or crossing a border",
        how: "Power off and back on, then do not unlock it.",
        why: "Before the first unlock after a reboot, credential-encrypted data is not available to the running system at all. After one unlock it stays available. Rebooting puts the device back into that stronger state.",
        weight: 9,
        profiles: ["highrisk"],
      },
      {
        id: "guest-pin",
        title: "Use guest mode or screen pinning when lending the phone",
        how: "Settings → Security & privacy → More security settings → App pinning.",
        why: "Handing over an unlocked phone hands over everything on it. Pinning confines the borrower to the one app you opened.",
        weight: 5,
      },
      {
        id: "frp",
        title: "Leave factory reset protection intact",
        how: "Keep a Google account signed in and a screen lock set; do not remove the account before a reset unless you are selling the device.",
        why: "Factory reset protection stops a stolen phone being wiped and resold under someone else's account, and Android 15 tightened it further.",
        weight: 6,
      },
    ],
  },
];

const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

/** Parse YYYY-MM-DD to a UTC midnight timestamp, or NaN. */
export function parseIsoDate(value) {
  if (typeof value !== "string") return NaN;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return NaN;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const ms = Date.UTC(year, month - 1, day);
  const check = new Date(ms);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return NaN;
  }
  return ms;
}

/**
 * Build the checklist for one device.
 *
 * @param {object} input
 * @param {number} input.androidVersion  Major Android version, 8 to 16.
 * @param {string} input.profile         One of PROFILE_IDS.
 * @param {string} [input.patchDate]     Security patch level date, YYYY-MM-DD.
 * @param {string} [input.today]         Reference date, YYYY-MM-DD.
 * @param {string[]} [input.done]        Completed item keys, "<groupId>:<itemId>".
 * @returns {object} checklist, or { error }.
 */
export function buildAndroidChecklist({
  androidVersion,
  profile,
  patchDate = "",
  today = "",
  done = [],
} = {}) {
  const version = Number(androidVersion);
  if (!Number.isFinite(version)) {
    return { error: "Enter the Android version as a number." };
  }
  if (version < MIN_VERSION || version > MAX_VERSION) {
    return {
      error: `Enter an Android version between ${MIN_VERSION} and ${MAX_VERSION}.`,
    };
  }

  const profileInfo = PROFILES.find((item) => item.id === profile);
  if (!profileInfo) return { error: "Choose the situation this phone is used in." };

  const doneSet = new Set(Array.isArray(done) ? done.filter((id) => typeof id === "string") : []);

  const groups = GROUPS.map((group) => {
    const items = group.items
      .filter((item) => {
        if (item.minVersion && version < item.minVersion) return false;
        if (item.profiles && !item.profiles.includes(profile)) return false;
        return true;
      })
      .map((item) => {
        const key = `${group.id}:${item.id}`;
        return {
          ...item,
          key,
          groupId: group.id,
          groupTitle: group.title,
          done: doneSet.has(key),
          newIn: item.minVersion ?? null,
        };
      })
      .sort((a, b) => b.weight - a.weight);
    return {
      id: group.id,
      title: group.title,
      items,
      doneCount: items.filter((item) => item.done).length,
    };
  }).filter((group) => group.items.length > 0);

  const allItems = groups.flatMap((group) => group.items);
  const totalWeight = allItems.reduce((sum, item) => sum + item.weight, 0);
  const doneWeight = allItems
    .filter((item) => item.done)
    .reduce((sum, item) => sum + item.weight, 0);

  // totalWeight is never zero: several items have no version or profile gate.
  const hardeningScore = Math.round((doneWeight / totalWeight) * 100);

  const unavailable = GROUPS.flatMap((group) =>
    group.items
      .filter((item) => item.minVersion && version < item.minVersion)
      .map((item) => ({
        title: item.title,
        minVersion: item.minVersion,
        gap: item.minVersion - version,
      })),
  ).sort((a, b) => a.minVersion - b.minVersion);

  const nextUp = allItems
    .filter((item) => !item.done)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3);

  // Patch freshness.
  let patch = null;
  if (patchDate) {
    const patchMs = parseIsoDate(patchDate);
    if (Number.isNaN(patchMs)) {
      return { error: "Enter the security patch level as a real calendar date." };
    }
    const todayMs = today ? parseIsoDate(today) : NaN;
    if (Number.isNaN(todayMs)) {
      return { error: "Enter today's date as a real calendar date." };
    }
    if (patchMs > todayMs) {
      return { error: "The security patch date cannot be in the future." };
    }
    const days = Math.round((todayMs - patchMs) / MS_PER_DAY);
    const missedBulletins = Math.floor(days / PATCH_CYCLE_DAYS);
    const status =
      days >= PATCH_CRITICAL_DAYS
        ? { id: "critical", label: "Badly out of date", tone: "danger" }
        : days >= PATCH_STALE_DAYS
          ? { id: "stale", label: "Behind on patches", tone: "warning" }
          : { id: "current", label: "Reasonably current", tone: "success" };
    patch = { days, missedBulletins, status };
  }

  const versionNotes = [];
  if (version < 10) {
    versionNotes.push(
      "File-based encryption only became mandatory in Android 10. On an older release, confirm the device reports itself as encrypted before relying on the screen lock for anything.",
    );
  }
  if (version < 12) {
    versionNotes.push(
      "Without the Android 12 privacy dashboard and the camera and microphone indicators, you have no easy way to see which apps used those sensors.",
    );
  }
  if (version < 13) {
    versionNotes.push(
      "The restricted-settings gate that blocks sideloaded apps from grabbing accessibility access arrived in Android 13. Below that, be far more careful about what you install.",
    );
  }
  if (version <= 11) {
    versionNotes.push(
      "An Android release this old is very unlikely to still receive security bulletins. Check the manufacturer's support window before spending time on the rest of this list.",
    );
  }

  return {
    groups,
    profile: profileInfo,
    version,
    hardeningScore: clamp(hardeningScore, 0, 100),
    doneCount: allItems.filter((item) => item.done).length,
    totalItems: allItems.length,
    totalWeight,
    doneWeight,
    unavailable,
    nextUp,
    patch,
    versionNotes,
  };
}

/** Plain-text export for the copy button. */
export function formatAndroidChecklist(result) {
  if (!result || result.error) return "";
  const lines = [
    `Android hardening checklist — Android ${result.version}, ${result.profile.label}`,
    `Hardening score ${result.hardeningScore}% · ${result.doneCount}/${result.totalItems} done`,
  ];
  if (result.patch) {
    lines.push(
      `Security patch is ${result.patch.days} days old (${result.patch.missedBulletins} monthly bulletin(s) behind) — ${result.patch.status.label}`,
    );
  }
  lines.push("");
  for (const group of result.groups) {
    lines.push(group.title.toUpperCase());
    for (const item of group.items) {
      lines.push(`  [${item.done ? "x" : " "}] ${item.title}`);
      lines.push(`      ${item.how}`);
    }
    lines.push("");
  }
  if (result.unavailable.length > 0) {
    lines.push(
      "NOT AVAILABLE ON THIS ANDROID VERSION:",
      ...result.unavailable.map((item) => `  - ${item.title} (needs Android ${item.minVersion})`),
    );
  }
  return lines.join("\n").trim();
}
