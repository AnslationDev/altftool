export const PERMISSIONS = [
  { id: "camera", label: "Camera", need: "optional", weight: 3, reason: "Needed for posts, stories and profile photos, but not for browsing.", fix: "Allow only while using, or deny until you post." },
  { id: "microphone", label: "Microphone", need: "optional", weight: 4, reason: "Needed for reels, voice notes and live rooms; otherwise it is sensitive.", fix: "Deny unless you actively record." },
  { id: "photos-all", label: "All photos/videos", need: "risky", weight: 5, reason: "Full library access exposes old screenshots, IDs, family photos and location context.", fix: "Use selected-photos access where possible." },
  { id: "location", label: "Precise location", need: "optional", weight: 5, reason: "Location tags and nearby-friends features can map home, work and routine.", fix: "Use approximate or deny; add location manually only when needed." },
  { id: "contacts", label: "Contacts", need: "risky", weight: 5, reason: "Contact upload builds a social graph of people who never opted in.", fix: "Deny contact sync and delete uploaded contacts in app settings." },
  { id: "notifications", label: "Notifications", need: "optional", weight: 1, reason: "Useful for messages, but often becomes an attention/ad channel.", fix: "Keep DMs on and mute marketing channels." },
  { id: "bluetooth", label: "Bluetooth / nearby devices", need: "optional", weight: 2, reason: "Used for nearby sharing, audio devices or local discovery.", fix: "Deny unless a feature clearly needs it." },
  { id: "ad-id", label: "Ad ID / cross-app tracking", need: "risky", weight: 4, reason: "Links activity across apps, websites and ad networks.", fix: "Reset ad ID, deny tracking and disable personalization." },
  { id: "background-refresh", label: "Background activity", need: "optional", weight: 3, reason: "Keeps uploads and notifications live, but can continue collection in the background.", fix: "Restrict background data/battery unless uploads need it." },
  { id: "accessibility", label: "Accessibility service", need: "risky", weight: 6, reason: "Can read and control screen content; social apps rarely need it.", fix: "Disable unless it is an assistive feature you knowingly use." },
];

const BAND = [
  { min: 85, id: "minimal", label: "Minimal exposure" },
  { min: 70, id: "low", label: "Low exposure" },
  { min: 50, id: "moderate", label: "Moderate exposure" },
  { min: 30, id: "high", label: "High exposure" },
  { min: 0, id: "severe", label: "Severe over-collection" },
];

export function auditPermissions(granted = []) {
  if (!Array.isArray(granted)) return { error: "Granted permissions must be a list." };
  const selected = PERMISSIONS.filter((permission) => granted.includes(permission.id));
  const maxRisk = PERMISSIONS.reduce((sum, permission) => sum + permission.weight, 0);
  const risk = selected.reduce(
    (sum, permission) => sum + permission.weight * (permission.need === "risky" ? 1 : 0.55),
    0,
  );
  const privacyScore = Math.max(0, Math.round(100 - (risk / maxRisk) * 100));
  const band = BAND.find((item) => privacyScore >= item.min) || BAND[BAND.length - 1];
  const topRisks = selected
    .slice()
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5);
  return { privacyScore, band, selected, topRisks, grantedCount: selected.length };
}

export function resultToText(result, appName) {
  if (!result || result.error) return "";
  return [
    `${appName || "Social app"} permission audit`,
    `Privacy score: ${result.privacyScore}/100 (${result.band.label})`,
    `Granted permissions: ${result.grantedCount}`,
    "",
    "Top fixes:",
    ...result.topRisks.map((permission) => `- ${permission.label}: ${permission.fix}`),
  ].join("\n");
}
