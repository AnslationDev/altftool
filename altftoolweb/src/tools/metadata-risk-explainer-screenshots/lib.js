/**
 * Screenshot Metadata Risk Explainer — logic module.
 *
 * Pure data + arithmetic. No React, no DOM, no clock reads.
 *
 * The catalogue below lists the identifying signals that ride along with a
 * screenshot. Each entry records what it reveals, how damaging it is, and which
 * sharing channels strip it before other people see the file.
 */

/**
 * Severity ladder. Weights are 1 / 3 / 6 so that a single "high" signal always
 * outranks two "medium" ones, and a "medium" always outranks two "low" ones.
 * This is a disclosure-severity ranking, not a probability.
 */
export const SEVERITY_WEIGHT = Object.freeze({ low: 1, medium: 3, high: 6 });

export const SEVERITY_LABEL = Object.freeze({
  low: "Low",
  medium: "Medium",
  high: "High",
});

/**
 * Sharing channels and how they treat an uploaded image.
 *
 * `reencodes`: the platform decodes and re-saves the pixels, which destroys
 * every metadata block that is not part of the pixel data.
 * `stripsMetadata`: embedded tags (EXIF / XMP / PNG text chunks) are removed.
 * `renamesFile`: the original filename is replaced with a platform-generated id.
 *
 * Behaviour summary: major social networks (X, Facebook, Instagram, Reddit)
 * re-encode uploads and drop EXIF; workplace chat (Slack, Teams) and email
 * store the original bytes and the original filename; helpdesk uploads keep the
 * file but record the uploader account alongside it.
 */
export const CHANNELS = Object.freeze([
  {
    id: "social",
    label: "Public social post (X, Instagram, Reddit)",
    reencodes: true,
    stripsMetadata: true,
    renamesFile: true,
    note: "Pixels are re-encoded and tags dropped, but everything visible on screen stays visible to everyone.",
  },
  {
    id: "chat",
    label: "Work chat (Slack, Teams, Discord)",
    reencodes: false,
    stripsMetadata: false,
    renamesFile: false,
    note: "The original file is stored as-is, keeps its filename, and stays searchable in history.",
  },
  {
    id: "email",
    label: "Email attachment",
    reencodes: false,
    stripsMetadata: false,
    renamesFile: false,
    note: "Attachments are transferred byte-for-byte, so every embedded tag and the filename survive.",
  },
  {
    id: "ticket",
    label: "Support ticket / bug tracker upload",
    reencodes: false,
    stripsMetadata: false,
    renamesFile: false,
    note: "Kept verbatim and often visible to every agent and integration on the ticket.",
  },
  {
    id: "messaging",
    label: "Messaging app (WhatsApp, Signal, iMessage)",
    reencodes: true,
    stripsMetadata: true,
    renamesFile: true,
    note: "Images are recompressed for delivery, so embedded tags and the filename are usually lost.",
  },
]);

/**
 * How a signal is carried:
 *  - "embedded"  → lives in file tags (EXIF / XMP / PNG tEXt); removed by
 *                  metadata-stripping channels.
 *  - "filename"  → lives in the file's name; removed by renaming channels.
 *  - "container" → lives in bytes after the visible image (trailing data);
 *                  destroyed only by a full re-encode.
 *  - "pixels"    → visible in the picture itself; survives everything.
 */
export const CARRIERS = Object.freeze(["embedded", "filename", "container", "pixels"]);

export const METADATA_ITEMS = Object.freeze([
  {
    id: "filename-timestamp",
    group: "Filename and file system",
    label: "Default screenshot filename",
    carrier: "filename",
    severity: "medium",
    reveals:
      "macOS writes 'Screenshot 2026-07-28 at 14.03.22.png' and Android writes 'Screenshot_20260728-140322_Chrome.jpg' — your local date, minute-accurate time and, on Android, the app that was open.",
    fix: "Rename the file to something neutral before you attach it.",
  },
  {
    id: "fs-timestamps",
    group: "Filename and file system",
    label: "File created / modified timestamps",
    carrier: "embedded",
    severity: "low",
    reveals:
      "The file system records creation and last-modified time to the second, which pins when you were at the keyboard.",
    fix: "Re-export or re-save the image; the copy takes a fresh timestamp.",
  },
  {
    id: "png-text-chunks",
    group: "Embedded tags",
    label: "PNG text chunks and EXIF Software tag",
    carrier: "embedded",
    severity: "low",
    reveals:
      "Screenshot utilities and editors write their name and version into PNG tEXt/iTXt chunks or the EXIF Software field, identifying your OS build and tooling.",
    fix: "Strip metadata with an EXIF cleaner, or re-save through a tool that writes no tags.",
  },
  {
    id: "screen-geometry",
    group: "Embedded tags",
    label: "Pixel dimensions and display scale",
    carrier: "embedded",
    severity: "low",
    reveals:
      "Exact width, height and DPI narrow your device to a small set of models — a 1179x2556 PNG is an iPhone 15-class display.",
    fix: "Crop and resize before sharing if you do not want the device fingerprinted.",
  },
  {
    id: "crop-remnant",
    group: "Embedded tags",
    label: "Recoverable data behind a crop",
    carrier: "container",
    severity: "high",
    reveals:
      "Some editors truncated the image but left the original bytes in the file — the aCropalypse bug (CVE-2023-21036 in Google's Markup, and the same flaw in Windows 11 Snipping Tool) let anyone rebuild the uncropped screenshot.",
    fix: "Crop by exporting a new file rather than overwriting the original, and re-encode before sharing.",
  },
  {
    id: "status-bar-carrier",
    group: "Status bar",
    label: "Carrier name, signal and Wi-Fi indicator",
    carrier: "pixels",
    severity: "medium",
    reveals:
      "The carrier string narrows your country and network; a roaming indicator says you are travelling; the Wi-Fi glyph says you are on a known network rather than mobile data.",
    fix: "Crop the status bar off, or use your phone's guided-access/demo mode before capturing.",
  },
  {
    id: "status-bar-clock",
    group: "Status bar",
    label: "On-screen clock and battery percentage",
    carrier: "pixels",
    severity: "medium",
    reveals:
      "The clock gives local time — combined with a time zone guess it dates the capture even after every tag is stripped. Battery level plus charging icon hints at your routine.",
    fix: "Crop the top strip out of the image.",
  },
  {
    id: "notifications",
    group: "Status bar",
    label: "Notification previews and badge counts",
    carrier: "pixels",
    severity: "high",
    reveals:
      "Banner previews expose sender names, message text and one-time passcodes; badge counts show which apps you use and how much.",
    fix: "Turn on Do Not Disturb or hide previews before capturing anything you will share.",
  },
  {
    id: "desktop-context",
    group: "Visible desktop",
    label: "Dock, taskbar, tabs and window titles",
    carrier: "pixels",
    severity: "medium",
    reveals:
      "Open tabs, browser profile avatars, extension icons and window titles list your employer's tools, internal hostnames and side projects.",
    fix: "Capture a single window (Cmd+Shift+4 then Space on macOS, Alt+PrtSc on Windows) instead of the full screen.",
  },
  {
    id: "file-paths",
    group: "Visible desktop",
    label: "File paths and usernames on screen",
    carrier: "pixels",
    severity: "high",
    reveals:
      "A path like C:\\Users\\anita.rao\\ or /Users/arao/work/acme-migration/ leaks your real name, account name and current client.",
    fix: "Crop the path bar, or reproduce the screenshot in a throwaway account.",
  },
  {
    id: "account-identity",
    group: "Visible desktop",
    label: "Signed-in account, avatar and email address",
    carrier: "pixels",
    severity: "high",
    reveals:
      "A visible profile chip ties the screenshot to a specific person, and a corporate email domain ties it to a specific employer.",
    fix: "Sign into a demo account, or black out the account chip with a solid opaque shape.",
  },
  {
    id: "blur-redaction",
    group: "Redaction",
    label: "Blurred or pixelated redaction",
    carrier: "pixels",
    severity: "high",
    reveals:
      "Blur and mosaic are reversible for short, predictable strings: the attacker re-renders candidate text in the same font, applies the same filter and matches the result, which has recovered redacted names and account numbers many times.",
    fix: "Cover sensitive text with a solid opaque rectangle and flatten the export — never blur, never pixelate.",
  },
  {
    id: "personalisation",
    group: "Redaction",
    label: "Wallpaper, theme, language and font size",
    carrier: "pixels",
    severity: "low",
    reveals:
      "A distinctive wallpaper links two anonymous screenshots to the same person, and interface language plus date format narrows your locale.",
    fix: "Use a plain background and default settings for screenshots you publish.",
  },
]);

export const RISK_BANDS = Object.freeze([
  { id: "none", label: "No surviving signals", min: 0, max: 0, advice: "Nothing ticked survives this channel — still check the picture itself for anything readable." },
  { id: "low", label: "Low exposure", min: 1, max: 24, advice: "Little identifying data survives. A quick crop finishes the job." },
  { id: "moderate", label: "Moderate exposure", min: 25, max: 49, advice: "Enough context to fingerprint your device or routine. Crop and strip tags before sharing." },
  { id: "high", label: "High exposure", min: 50, max: 74, advice: "Directly identifying signals survive this channel. Re-capture cleanly rather than patching this file." },
  { id: "severe", label: "Severe exposure", min: 75, max: 100, advice: "This screenshot identifies you and your employer. Do not share it in its current form." },
]);

/** Sum of weights across the whole catalogue — the 100% reference point. */
export const MAX_WEIGHT = METADATA_ITEMS.reduce(
  (total, item) => total + SEVERITY_WEIGHT[item.severity],
  0,
);

export function getChannel(channelId) {
  return CHANNELS.find((channel) => channel.id === channelId) || null;
}

/**
 * Does this signal still reach the recipient over the given channel?
 * Embedded tags die to metadata stripping, filenames die to renaming,
 * trailing container bytes die to re-encoding, pixels always survive.
 */
export function survivesChannel(item, channel) {
  if (!item || !channel) return false;
  if (item.carrier === "pixels") return true;
  if (item.carrier === "filename") return !channel.renamesFile;
  if (item.carrier === "container") return !channel.reencodes;
  return !channel.stripsMetadata;
}

function bandFor(score) {
  return (
    RISK_BANDS.find((band) => score >= band.min && score <= band.max) ||
    RISK_BANDS[RISK_BANDS.length - 1]
  );
}

/**
 * Score a screenshot before sharing.
 *
 * score = 100 x (sum of severity weights that survive the channel)
 *             / (sum of severity weights in the whole catalogue)
 *
 * @param {{ selectedIds?: string[], channelId?: string }} input
 * @returns {{ score:number, band:object, ... }|{ error:string }}
 */
export function assessScreenshotRisk({ selectedIds = [], channelId = "chat" } = {}) {
  if (!Array.isArray(selectedIds)) {
    return { error: "Selected signals must be a list of catalogue ids." };
  }
  const channel = getChannel(channelId);
  if (!channel) {
    return { error: "Choose one of the listed sharing channels." };
  }

  const unique = Array.from(new Set(selectedIds.filter((id) => typeof id === "string")));
  const known = unique
    .map((id) => METADATA_ITEMS.find((item) => item.id === id))
    .filter(Boolean);
  const unknownCount = unique.length - known.length;

  const surviving = [];
  const removed = [];
  known.forEach((item) => {
    if (survivesChannel(item, channel)) surviving.push(item);
    else removed.push(item);
  });

  const survivingWeight = surviving.reduce(
    (total, item) => total + SEVERITY_WEIGHT[item.severity],
    0,
  );
  const selectedWeight = known.reduce(
    (total, item) => total + SEVERITY_WEIGHT[item.severity],
    0,
  );

  const score = MAX_WEIGHT > 0 ? Math.round((survivingWeight / MAX_WEIGHT) * 100) : 0;
  const removedShare =
    selectedWeight > 0 ? Math.round(((selectedWeight - survivingWeight) / selectedWeight) * 100) : 0;

  const bySeverity = { high: 0, medium: 0, low: 0 };
  surviving.forEach((item) => {
    bySeverity[item.severity] += 1;
  });

  const actions = surviving
    .slice()
    .sort((a, b) => SEVERITY_WEIGHT[b.severity] - SEVERITY_WEIGHT[a.severity])
    .map((item) => ({ label: item.label, severity: item.severity, fix: item.fix }));

  return {
    score,
    band: bandFor(score),
    channel,
    selectedCount: known.length,
    unknownCount,
    surviving,
    removed,
    survivingWeight,
    selectedWeight,
    maxWeight: MAX_WEIGHT,
    removedShare,
    bySeverity,
    actions,
  };
}

/** Catalogue grouped for display, in declaration order. */
export function groupedItems() {
  const groups = [];
  METADATA_ITEMS.forEach((item) => {
    let group = groups.find((entry) => entry.name === item.group);
    if (!group) {
      group = { name: item.group, items: [] };
      groups.push(group);
    }
    group.items.push(item);
  });
  return groups;
}
