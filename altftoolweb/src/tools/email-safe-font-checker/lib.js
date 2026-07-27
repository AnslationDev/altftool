/**
 * Email font-stack resolution.
 *
 * Two facts decide what a subscriber sees:
 *   1. Whether the mail client honours @font-face at all. Gmail (every platform), Outlook on
 *      Windows (Word rendering engine), Outlook.com, Yahoo Mail and AOL strip or ignore webfonts.
 *   2. Which families are pre-installed on the operating system the client is running on.
 *
 * This module walks a CSS font stack the way a client does — first family that resolves wins —
 * and reports what actually renders for each client, plus what it falls back to.
 */

export const PLATFORMS = ["windows", "macos", "ios", "android", "linux"];

/**
 * Client / platform pairs, with whether the client honours @font-face.
 * The webfont column reflects long-standing, widely documented behaviour rather than a
 * point-in-time test: treat it as a planning guide and always send a fallback.
 */
export const CLIENTS = [
  {
    id: "outlook-win",
    name: "Outlook 2016-2021 / 365 (Windows)",
    platform: "windows",
    webfonts: false,
    note: "Renders with the Word engine and ignores @font-face; also needs an mso-font fallback for Office fonts.",
  },
  {
    id: "outlook-web",
    name: "Outlook.com and Outlook on the web",
    platform: "windows",
    webfonts: false,
    note: "Strips @font-face from the head and from style attributes.",
  },
  {
    id: "outlook-mac",
    name: "Outlook for Mac",
    platform: "macos",
    webfonts: true,
    note: "Uses WebKit, so linked webfonts do render.",
  },
  {
    id: "gmail-web",
    name: "Gmail (web)",
    platform: "windows",
    webfonts: false,
    note: "Removes @font-face rules; only locally installed families resolve.",
  },
  {
    id: "gmail-ios",
    name: "Gmail app (iOS)",
    platform: "ios",
    webfonts: false,
    note: "Same sanitiser as Gmail web, on top of the iOS font set.",
  },
  {
    id: "gmail-android",
    name: "Gmail app (Android)",
    platform: "android",
    webfonts: false,
    note: "Android ships Roboto and Noto, not the Microsoft core fonts.",
  },
  {
    id: "apple-mail-mac",
    name: "Apple Mail (macOS)",
    platform: "macos",
    webfonts: true,
    note: "Full WebKit support for @font-face.",
  },
  {
    id: "apple-mail-ios",
    name: "Apple Mail (iOS and iPadOS)",
    platform: "ios",
    webfonts: true,
    note: "Full WebKit support for @font-face.",
  },
  {
    id: "yahoo",
    name: "Yahoo Mail (web)",
    platform: "windows",
    webfonts: false,
    note: "Webfonts are stripped.",
  },
  {
    id: "aol",
    name: "AOL Mail (web)",
    platform: "windows",
    webfonts: false,
    note: "Shares Yahoo's rendering pipeline.",
  },
  {
    id: "samsung",
    name: "Samsung Email (Android)",
    platform: "android",
    webfonts: true,
    note: "Chromium-based and honours @font-face.",
  },
  {
    id: "thunderbird",
    name: "Thunderbird (desktop)",
    platform: "windows",
    webfonts: true,
    note: "Gecko engine with full @font-face support.",
  },
];

/**
 * Pre-installed font availability by platform.
 * "installed" means the family ships with a default OS install, not with an optional Office or
 * design-suite bundle unless the note says so.
 */
export const FONTS = [
  { name: "Arial", category: "sans", windows: true, macos: true, ios: true, android: false, linux: false, note: "On Linux, Liberation Sans is the metric-compatible substitute." },
  { name: "Helvetica", category: "sans", windows: false, macos: true, ios: true, android: false, linux: false, note: "Windows maps requests for Helvetica to Arial." },
  { name: "Helvetica Neue", category: "sans", windows: false, macos: true, ios: true, android: false, linux: false },
  { name: "Verdana", category: "sans", windows: true, macos: true, ios: true, android: false, linux: false, note: "Wide by design — the same point size looks larger than Arial." },
  { name: "Tahoma", category: "sans", windows: true, macos: true, ios: false, android: false, linux: false, note: "Reaches macOS through Microsoft Office rather than the base OS." },
  { name: "Trebuchet MS", category: "sans", windows: true, macos: true, ios: false, android: false, linux: false },
  { name: "Segoe UI", category: "sans", windows: true, macos: false, ios: false, android: false, linux: false, note: "The Windows system UI face." },
  { name: "Roboto", category: "sans", windows: false, macos: false, ios: false, android: true, linux: false, note: "The Android system face." },
  { name: "Lucida Sans Unicode", category: "sans", windows: true, macos: false, ios: false, android: false, linux: false },
  { name: "Lucida Grande", category: "sans", windows: false, macos: true, ios: false, android: false, linux: false },
  { name: "Arial Black", category: "display", windows: true, macos: true, ios: false, android: false, linux: false },
  { name: "Impact", category: "display", windows: true, macos: true, ios: false, android: false, linux: false },
  { name: "Comic Sans MS", category: "display", windows: true, macos: true, ios: false, android: false, linux: false },
  { name: "Georgia", category: "serif", windows: true, macos: true, ios: true, android: false, linux: false, note: "The most reliable serif across desktop and iOS." },
  { name: "Times New Roman", category: "serif", windows: true, macos: true, ios: true, android: false, linux: false },
  { name: "Times", category: "serif", windows: false, macos: true, ios: true, android: false, linux: false },
  { name: "Palatino Linotype", category: "serif", windows: true, macos: false, ios: false, android: false, linux: false },
  { name: "Palatino", category: "serif", windows: false, macos: true, ios: true, android: false, linux: false },
  { name: "Baskerville", category: "serif", windows: false, macos: true, ios: false, android: false, linux: false },
  { name: "Book Antiqua", category: "serif", windows: true, macos: false, ios: false, android: false, linux: false },
  { name: "Noto Serif", category: "serif", windows: false, macos: false, ios: false, android: true, linux: true },
  { name: "Courier New", category: "mono", windows: true, macos: true, ios: true, android: false, linux: false },
  { name: "Courier", category: "mono", windows: false, macos: true, ios: true, android: false, linux: false },
  { name: "Consolas", category: "mono", windows: true, macos: false, ios: false, android: false, linux: false },
  { name: "Menlo", category: "mono", windows: false, macos: true, ios: false, android: false, linux: false },
  { name: "Monaco", category: "mono", windows: false, macos: true, ios: false, android: false, linux: false },
  { name: "Lucida Console", category: "mono", windows: true, macos: false, ios: false, android: false, linux: false },
];

/** What each CSS generic keyword actually resolves to on each platform. */
export const GENERIC_KEYWORDS = {
  "sans-serif": { windows: "Arial", macos: "Helvetica", ios: "Helvetica", android: "Roboto", linux: "DejaVu Sans" },
  serif: { windows: "Times New Roman", macos: "Times", ios: "Times", android: "Noto Serif", linux: "DejaVu Serif" },
  monospace: { windows: "Courier New", macos: "Menlo", ios: "Courier", android: "Droid Sans Mono", linux: "DejaVu Sans Mono" },
  cursive: { windows: "Comic Sans MS", macos: "Apple Chancery", ios: "Snell Roundhand", android: "Dancing Script", linux: "URW Chancery L" },
  fantasy: { windows: "Impact", macos: "Papyrus", ios: "Papyrus", android: "Droid Sans", linux: "Impact" },
};

/** Ready-made stacks that resolve to something sensible in every client above. */
export const SAFE_STACKS = [
  { label: "Neutral sans", stack: "Arial, Helvetica, sans-serif" },
  { label: "Wide sans (small type)", stack: "Verdana, Geneva, Tahoma, sans-serif" },
  { label: "Classic serif", stack: "Georgia, 'Times New Roman', Times, serif" },
  { label: "System UI", stack: "-apple-system, 'Segoe UI', Roboto, Arial, sans-serif" },
  { label: "Monospace", stack: "'Courier New', Courier, monospace" },
  { label: "Google font with fallback", stack: "'Inter', 'Helvetica Neue', Arial, sans-serif" },
];

const CATEGORY_GENERIC = { sans: "sans-serif", serif: "serif", mono: "monospace", display: "sans-serif" };

function round(value, places = 4) {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

/** Split a CSS font-family declaration into trimmed, unquoted family names. */
export function parseStack(stack) {
  return String(stack ?? "")
    .split(",")
    .map((part) => part.trim().replace(/^["']|["']$/g, "").trim())
    .filter((part) => part.length > 0);
}

/** Look up a family in the installed-font table, case-insensitively. */
export function findFont(name) {
  const key = String(name ?? "").trim().toLowerCase();
  return FONTS.find((font) => font.name.toLowerCase() === key) || null;
}

export function isGeneric(name) {
  return Object.prototype.hasOwnProperty.call(GENERIC_KEYWORDS, String(name ?? "").trim().toLowerCase());
}

/**
 * Resolve a stack the way one client would.
 * @returns {{ rendered: string, source: string, index: number }}
 */
export function resolveForClient(families, client, { webfontFamily = "" } = {}) {
  for (let index = 0; index < families.length; index += 1) {
    const family = families[index];
    const lower = family.toLowerCase();

    if (isGeneric(family)) {
      return { rendered: GENERIC_KEYWORDS[lower][client.platform], source: "generic", index, family };
    }
    // -apple-system and BlinkMacSystemFont are system-UI aliases, not real family names.
    if (lower === "-apple-system" || lower === "blinkmacsystemfont" || lower === "system-ui") {
      if (client.platform === "macos" || client.platform === "ios") {
        return { rendered: "San Francisco", source: "system-alias", index, family };
      }
      continue;
    }
    if (webfontFamily && lower === webfontFamily.trim().toLowerCase()) {
      if (client.webfonts) return { rendered: family, source: "webfont", index, family };
      continue;
    }
    const font = findFont(family);
    if (font && font[client.platform]) {
      return { rendered: font.name, source: "installed", index, family };
    }
  }
  return { rendered: "the client's own default font", source: "client-default", index: -1, family: null };
}

/**
 * Full report for a font stack.
 * @returns metrics object, or { error } when the stack cannot be evaluated.
 */
export function analyzeStack(options = {}) {
  const { stack = "", webfontFamily = "" } = options;
  const families = parseStack(stack);
  if (families.length === 0) {
    return { error: "Enter a font-family stack, for example: Georgia, 'Times New Roman', serif." };
  }
  if (families.length > 12) {
    return { error: "That is more than 12 families — trim the stack; clients only ever use the first one that resolves." };
  }

  const intended = families[0];
  const intendedLower = intended.toLowerCase();
  const usingWebfont = Boolean(webfontFamily && webfontFamily.trim());

  const results = CLIENTS.map((client) => {
    const resolved = resolveForClient(families, client, { webfontFamily });
    const exact =
      resolved.family !== null && resolved.family.toLowerCase() === intendedLower && resolved.source !== "generic";
    return {
      id: client.id,
      name: client.name,
      platform: client.platform,
      webfonts: client.webfonts,
      note: client.note,
      rendered: resolved.rendered,
      source: resolved.source,
      exact,
    };
  });

  const exactCount = results.filter((item) => item.exact).length;
  const defaultCount = results.filter((item) => item.source === "client-default").length;
  const lastFamily = families[families.length - 1];
  const hasGenericTail = isGeneric(lastFamily);

  const rendered = {};
  for (const item of results) rendered[item.rendered] = (rendered[item.rendered] || 0) + 1;
  const renderedBreakdown = Object.entries(rendered)
    .map(([name, count]) => ({ name, count, share: round(count / results.length) }))
    .sort((a, b) => b.count - a.count);

  const warnings = [];
  if (!hasGenericTail) {
    warnings.push(
      `The stack does not end in a generic keyword. Append sans-serif, serif or monospace so clients with none of your families installed still pick the right shape.`,
    );
  }
  if (usingWebfont && !findFont(intended)) {
    warnings.push(
      `${intended} is a webfont, and ${CLIENTS.filter((c) => !c.webfonts).length} of the ${CLIENTS.length} clients checked strip @font-face. Design the layout around the fallback, not the webfont.`,
    );
  }
  if (defaultCount > 0) {
    warnings.push(
      `${defaultCount} client${defaultCount === 1 ? "" : "s"} would fall all the way through to their own default font, which you do not control.`,
    );
  }
  const firstFont = findFont(intended);
  if (firstFont && !firstFont.android && !families.some((f) => isGeneric(f))) {
    warnings.push(
      `${firstFont.name} is not installed on Android, and Android devices are a large share of most lists.`,
    );
  }
  if (families.some((f) => f.toLowerCase() === "segoe ui") && !families.some((f) => f.toLowerCase() === "arial")) {
    warnings.push(
      "Segoe UI only exists on Windows. Follow it with Arial or Helvetica before the generic keyword so Mac and mobile do not jump straight to the default.",
    );
  }

  // A "closest safe" suggestion: keep the intended family first, then add wide-coverage fallbacks.
  const category = firstFont ? firstFont.category : "sans";
  const generic = CATEGORY_GENERIC[category] || "sans-serif";
  const suggestions = {
    sans: ["Arial", "Helvetica", "sans-serif"],
    serif: ["Georgia", "Times New Roman", "serif"],
    mono: ["Courier New", "Courier", "monospace"],
    display: ["Arial Black", "Arial", "sans-serif"],
  }[category] || ["Arial", "Helvetica", "sans-serif"];

  const suggestedFamilies = [intended, ...suggestions.filter((name) => name.toLowerCase() !== intendedLower)];
  if (!isGeneric(suggestedFamilies[suggestedFamilies.length - 1])) suggestedFamilies.push(generic);
  const suggestedStack = suggestedFamilies
    .map((name) => (name.includes(" ") && !isGeneric(name) ? `'${name}'` : name))
    .join(", ");

  return {
    families,
    intended,
    intendedFont: firstFont,
    usingWebfont,
    clients: results,
    clientCount: results.length,
    exactCount,
    exactShare: round(exactCount / results.length),
    defaultCount,
    hasGenericTail,
    renderedBreakdown,
    warnings,
    suggestedStack,
    verdict: defaultCount === 0 && hasGenericTail ? "safe" : "review",
  };
}

/** Plain-text summary for the copy button. */
export function formatReport(result) {
  if (!result || result.error) return "";
  const lines = [
    "Email font stack check",
    `Stack: ${result.families.join(", ")}`,
    `Intended family renders in ${result.exactCount} of ${result.clientCount} clients`,
    `Suggested safe stack: ${result.suggestedStack}`,
    "",
  ];
  for (const client of result.clients) {
    lines.push(`${client.name}: ${client.rendered}${client.exact ? "" : " (fallback)"}`);
  }
  if (result.warnings.length > 0) {
    lines.push("");
    for (const warning of result.warnings) lines.push(`- ${warning}`);
  }
  return lines.join("\n");
}
