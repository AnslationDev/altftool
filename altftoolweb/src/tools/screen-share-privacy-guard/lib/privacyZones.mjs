export const MIN_ZONE_SIZE = 2;

export const PRIVACY_CHECKLIST_ITEMS = Object.freeze([
  {
    id: "notifications",
    label: "Notifications and message previews are disabled",
    detail: "Use your operating system's focus or do-not-disturb mode.",
  },
  {
    id: "tabs",
    label: "Unrelated tabs and bookmarks are hidden",
    detail: "Close private tabs or move the presentation into a clean window.",
  },
  {
    id: "identity",
    label: "Names, email addresses, and profile photos are safe",
    detail: "Check account menus, chat sidebars, and document headers.",
  },
  {
    id: "secrets",
    label: "Passwords, API keys, and recovery codes are not visible",
    detail: "Move terminals, password managers, and environment files away.",
  },
  {
    id: "financial",
    label: "Payment, account, and government identifiers are hidden",
    detail: "Look for QR codes, card details, UPI IDs, and document numbers.",
  },
  {
    id: "background",
    label: "Desktop files, taskbar, and recent-item lists are safe",
    detail: "A single application window is usually safer than the full screen.",
  },
]);

function finiteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function clampPercent(value) {
  return Math.min(100, Math.max(0, finiteNumber(value)));
}

export function zoneFromDrag(start, end, options = {}) {
  if (!start || !end) return null;

  const startX = clampPercent(start.x);
  const startY = clampPercent(start.y);
  const endX = clampPercent(end.x);
  const endY = clampPercent(end.y);
  const width = Math.abs(endX - startX);
  const height = Math.abs(endY - startY);

  if (width < MIN_ZONE_SIZE || height < MIN_ZONE_SIZE) return null;

  return {
    id: options.id || "privacy-zone",
    label: options.label || "Privacy zone",
    x: Math.min(startX, endX),
    y: Math.min(startY, endY),
    width,
    height,
  };
}

export function normalizeZone(zone) {
  const x = Math.min(100 - MIN_ZONE_SIZE, clampPercent(zone?.x));
  const y = Math.min(100 - MIN_ZONE_SIZE, clampPercent(zone?.y));
  const requestedWidth = Math.max(MIN_ZONE_SIZE, finiteNumber(zone?.width, MIN_ZONE_SIZE));
  const requestedHeight = Math.max(MIN_ZONE_SIZE, finiteNumber(zone?.height, MIN_ZONE_SIZE));

  return {
    ...zone,
    x,
    y,
    width: Math.min(requestedWidth, 100 - x),
    height: Math.min(requestedHeight, 100 - y),
  };
}

export function updateZone(zone, patch) {
  return normalizeZone({ ...zone, ...patch });
}

export function summarizeChecklist(checkedIds, items = PRIVACY_CHECKLIST_ITEMS) {
  const validIds = new Set(items.map((item) => item.id));
  const completedIds = new Set(
    Array.from(checkedIds || []).filter((id) => validIds.has(id)),
  );
  const total = items.length;
  const completed = completedIds.size;

  return {
    total,
    completed,
    remaining: Math.max(0, total - completed),
    ready: total > 0 && completed === total,
  };
}
