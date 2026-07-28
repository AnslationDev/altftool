export const PERMISSIONS = [
  { id: "precise-location", label: "Precise location", need: "risky", weight: 6, reason: "Can expose home, workplace and routine if the app checks location often.", fix: "Use approximate location or set a manual dating area where available." },
  { id: "background-location", label: "Background location", need: "risky", weight: 6, reason: "Continues location collection after you leave the app.", fix: "Deny background location unless a safety feature explicitly requires it." },
  { id: "photos-all", label: "All photos/videos", need: "risky", weight: 5, reason: "Full library access can expose IDs, screenshots, family photos and hidden albums.", fix: "Use selected-photos access and only grant profile pictures." },
  { id: "camera", label: "Camera", need: "optional", weight: 3, reason: "Useful for profile verification or new photos, not needed for browsing.", fix: "Allow only while using or deny until verification." },
  { id: "microphone", label: "Microphone", need: "optional", weight: 4, reason: "Used for voice prompts, video dates or voice notes.", fix: "Deny unless actively recording." },
  { id: "contacts", label: "Contacts", need: "risky", weight: 5, reason: "Contact matching can expose who you know and may upload people who never opted in.", fix: "Deny contact sync; use block-by-phone only if you understand the upload." },
  { id: "notifications", label: "Notifications", need: "optional", weight: 1, reason: "Useful for matches/messages but can leak app usage on lock screen.", fix: "Hide notification previews or mute promotional alerts." },
  { id: "ad-id", label: "Ad ID / tracking", need: "risky", weight: 4, reason: "Can link dating activity with ad networks and other apps.", fix: "Deny tracking, reset ad ID and turn off personalization." },
  { id: "bluetooth", label: "Nearby devices / Bluetooth", need: "optional", weight: 2, reason: "Rarely core for dating; may support nearby/social discovery features.", fix: "Deny unless you use a specific nearby feature." },
  { id: "profile-discovery", label: "Broad profile discovery", need: "risky", weight: 4, reason: "Searchability, distance range and social sharing settings can reveal your profile to unintended people.", fix: "Limit discovery distance, pause profile when needed and review linked socials." },
];

const BANDS = [
  { min: 85, id: "minimal", label: "Minimal exposure" },
  { min: 70, id: "low", label: "Low exposure" },
  { min: 50, id: "moderate", label: "Moderate exposure" },
  { min: 30, id: "high", label: "High exposure" },
  { min: 0, id: "severe", label: "Severe exposure" },
];

export function auditDatingPermissions(granted = []) {
  if (!Array.isArray(granted)) return { error: "Granted permissions must be a list." };
  const selected = PERMISSIONS.filter((permission) => granted.includes(permission.id));
  const max = PERMISSIONS.reduce((sum, permission) => sum + permission.weight, 0);
  const risk = selected.reduce(
    (sum, permission) => sum + permission.weight * (permission.need === "risky" ? 1 : 0.45),
    0,
  );
  const score = Math.max(0, Math.round(100 - (risk / max) * 100));
  const band = BANDS.find((item) => score >= item.min) || BANDS[BANDS.length - 1];
  const topRisks = selected.slice().sort((a, b) => b.weight - a.weight).slice(0, 5);
  return { score, band, selectedCount: selected.length, topRisks };
}

export function resultToText(result, appName) {
  if (!result || result.error) return "";
  return [
    `${appName || "Dating app"} permission audit`,
    `Privacy score: ${result.score}/100 (${result.band.label})`,
    `Granted items: ${result.selectedCount}`,
    "",
    "Top fixes:",
    ...result.topRisks.map((item) => `- ${item.label}: ${item.fix}`),
  ].join("\n");
}
