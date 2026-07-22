// Simulates how a subject line gets truncated in real inbox lists.
// Limits are widely-cited industry approximations, not exact pixel
// measurements (actual truncation depends on font, zoom and screen width) —
// the UI labels them "approx." so the numbers are never overstated.

export const INBOX_CLIENTS = [
  { id: "gmail-desktop", label: "Gmail Desktop", limit: 70, note: "≈70 characters before truncation" },
  { id: "gmail-mobile", label: "Gmail Mobile", limit: 40, note: "≈40 characters on a phone-width inbox list" },
  { id: "outlook", label: "Outlook", limit: 60, note: "≈60 characters in the reading-pane list" },
  { id: "apple-mail", label: "Apple Mail", limit: 90, note: "≈90 characters on iPhone/iPad Mail" },
];

// Real inboxes truncate mid-word, so this does a hard character cut rather
// than snapping back to the previous word boundary.
export function truncateForClient(subject, limit) {
  if (!subject) return { visible: "", truncated: false, hiddenChars: 0 };
  if (subject.length <= limit) return { visible: subject, truncated: false, hiddenChars: 0 };

  const visible = `${subject.slice(0, Math.max(0, limit - 1)).trimEnd()}…`;
  return { visible, truncated: true, hiddenChars: subject.length - (limit - 1) };
}

export function buildInboxPreviews(subject) {
  const previews = {};
  for (const client of INBOX_CLIENTS) {
    previews[client.id] = { ...client, ...truncateForClient(subject, client.limit) };
  }
  return previews;
}
