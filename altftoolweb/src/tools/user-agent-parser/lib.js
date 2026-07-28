/**
 * User-Agent string parsing.
 *
 * The User-Agent header is defined in RFC 9110 §10.1.5 as a list of product
 * tokens, but in practice every browser copies fragments of every other
 * browser's token list for compatibility. Chrome, Edge, Opera, Samsung Internet
 * and Brave all contain the literal "Safari", and almost every browser starts
 * with "Mozilla/5.0". Parsing therefore has to be ordered: the most specific
 * token wins, and the generic ones are only used as a fallback.
 *
 * That ordering is the whole rule set here:
 *   1. bots and HTTP clients, which do not pretend to be browsers
 *   2. Chromium forks that add their own token (Edg, OPR, SamsungBrowser, …)
 *   3. iOS browsers, which must use WebKit and add a suffix (CriOS, FxiOS, …)
 *   4. mainstream engines (Firefox, Chrome, Chromium)
 *   5. Safari, matched last because everyone else claims it
 *
 * Pure module: no React, no DOM, no navigator access, no clock reads.
 */

/** Longest string accepted. Real User-Agent headers are well under 512 bytes;
 * anything past 2048 is either padding or an attack payload, not a UA. */
export const MAX_UA_LENGTH = 2048;

/**
 * Automated clients. Checked first because many of them embed "Mozilla/5.0"
 * and would otherwise be reported as a browser.
 */
export const BOT_RULES = [
  { name: "Googlebot", pattern: /Googlebot\/?([\d.]+)?/i },
  { name: "Google AdsBot", pattern: /AdsBot-Google(?:-Mobile)?/i },
  { name: "Bingbot", pattern: /bingbot\/?([\d.]+)?/i },
  { name: "DuckDuckBot", pattern: /DuckDuckBot\/?([\d.]+)?/i },
  { name: "Applebot", pattern: /Applebot\/?([\d.]+)?/i },
  { name: "Baiduspider", pattern: /Baiduspider\/?([\d.]+)?/i },
  { name: "YandexBot", pattern: /YandexBot\/?([\d.]+)?/i },
  { name: "Facebook crawler", pattern: /facebookexternalhit\/?([\d.]+)?/i },
  { name: "Twitterbot", pattern: /Twitterbot\/?([\d.]+)?/i },
  { name: "LinkedInBot", pattern: /LinkedInBot\/?([\d.]+)?/i },
  { name: "Slackbot", pattern: /Slackbot(?:-LinkExpanding)?\/?([\d.]+)?/i },
  { name: "AhrefsBot", pattern: /AhrefsBot\/?([\d.]+)?/i },
  { name: "SemrushBot", pattern: /SemrushBot\/?([\d.]+)?/i },
  { name: "PetalBot", pattern: /PetalBot/i },
  { name: "GPTBot", pattern: /GPTBot\/?([\d.]+)?/i },
  { name: "Generic crawler", pattern: /(?:bot|crawler|spider|slurp|scraper)\b/i },
];

/** Non-browser HTTP clients that identify themselves honestly. */
export const CLIENT_RULES = [
  { name: "curl", pattern: /curl\/([\d.]+)/i },
  { name: "Wget", pattern: /Wget\/([\d.]+)/i },
  { name: "Postman", pattern: /PostmanRuntime\/([\d.]+)/i },
  { name: "python-requests", pattern: /python-requests\/([\d.]+)/i },
  { name: "axios", pattern: /axios\/([\d.]+)/i },
  { name: "OkHttp", pattern: /okhttp\/([\d.]+)/i },
  { name: "Go HTTP client", pattern: /Go-http-client\/([\d.]+)/i },
  { name: "Java", pattern: /Java\/([\d._]+)/i },
  { name: "node-fetch", pattern: /node-fetch\/([\d.]+)/i },
];

/**
 * Browser rules, most specific first. Chromium forks must all be tested before
 * the plain Chrome rule, and Chrome before Safari.
 */
export const BROWSER_RULES = [
  { name: "Microsoft Edge", pattern: /Edg\/([\d.]+)/ },
  { name: "Microsoft Edge (Android)", pattern: /EdgA\/([\d.]+)/ },
  { name: "Microsoft Edge (iOS)", pattern: /EdgiOS\/([\d.]+)/ },
  { name: "Microsoft Edge (legacy)", pattern: /Edge\/([\d.]+)/ },
  { name: "Opera", pattern: /OPR\/([\d.]+)/ },
  { name: "Opera Mini", pattern: /Opera Mini\/([\d.]+)/i },
  { name: "Opera GX", pattern: /OPX\/([\d.]+)/ },
  { name: "Opera (Presto)", pattern: /Opera[/ ]([\d.]+)/i },
  { name: "Samsung Internet", pattern: /SamsungBrowser\/([\d.]+)/ },
  { name: "Vivaldi", pattern: /Vivaldi\/([\d.]+)/ },
  { name: "Brave", pattern: /Brave\/([\d.]+)/ },
  { name: "Yandex Browser", pattern: /YaBrowser\/([\d.]+)/ },
  { name: "UC Browser", pattern: /UCBrowser\/([\d.]+)/ },
  { name: "Silk", pattern: /Silk\/([\d.]+)/ },
  { name: "Firefox (iOS)", pattern: /FxiOS\/([\d.]+)/ },
  { name: "Firefox", pattern: /Firefox\/([\d.]+)/ },
  { name: "Chrome (iOS)", pattern: /CriOS\/([\d.]+)/ },
  { name: "Chrome", pattern: /Chrome\/([\d.]+)/ },
  { name: "Chromium", pattern: /Chromium\/([\d.]+)/ },
  { name: "Internet Explorer", pattern: /MSIE ([\d.]+)/ },
  { name: "Internet Explorer", pattern: /Trident\/[\d.]+;.*rv:([\d.]+)/ },
  { name: "Safari", pattern: /Version\/([\d.]+).*Safari\// },
  { name: "Safari (WebKit)", pattern: /Safari\/([\d.]+)/ },
];

/** Rendering engines, most specific first. */
export const ENGINE_RULES = [
  { name: "Trident", pattern: /Trident\/([\d.]+)/ },
  { name: "EdgeHTML", pattern: /Edge\/([\d.]+)/ },
  { name: "Presto", pattern: /Presto\/([\d.]+)/ },
  { name: "Gecko", pattern: /rv:([\d.]+)\).*Gecko\// },
  { name: "Gecko", pattern: /Gecko\/(\d+)/ },
  { name: "Blink", pattern: /(?:Chrome|Chromium|CriOS|Edg|OPR|SamsungBrowser)\/([\d.]+)/ },
  { name: "WebKit", pattern: /AppleWebKit\/([\d.]+)/ },
];

/** Operating systems, most specific first. */
export const OS_RULES = [
  { name: "Windows", pattern: /Windows NT ([\d.]+)/, map: windowsVersion },
  { name: "Windows Phone", pattern: /Windows Phone(?: OS)? ([\d.]+)/ },
  { name: "Chrome OS", pattern: /CrOS \w+ ([\d.]+)/ },
  { name: "Android", pattern: /Android ([\d.]+)/ },
  { name: "iOS", pattern: /iPhone OS ([\d_]+)/, map: underscoreVersion },
  { name: "iPadOS", pattern: /iPad;.*CPU OS ([\d_]+)/, map: underscoreVersion },
  { name: "iOS", pattern: /CPU OS ([\d_]+)/, map: underscoreVersion },
  { name: "macOS", pattern: /Mac OS X ([\d_.]+)/, map: underscoreVersion },
  { name: "macOS", pattern: /Macintosh/ },
  { name: "Ubuntu", pattern: /Ubuntu(?:\/([\d.]+))?/ },
  { name: "Fedora", pattern: /Fedora/ },
  { name: "FreeBSD", pattern: /FreeBSD/ },
  { name: "OpenBSD", pattern: /OpenBSD/ },
  { name: "Linux", pattern: /(?:X11|Linux)/ },
];

/**
 * Windows NT kernel version to marketing name.
 * Source: Microsoft's documented NT version mapping. Note that Windows 11
 * reports NT 10.0 exactly like Windows 10 — the User-Agent string genuinely
 * cannot tell them apart, only the Sec-CH-UA-Platform-Version client hint can.
 */
export const WINDOWS_NT_VERSIONS = {
  "10.0": "10 or 11",
  "6.3": "8.1",
  "6.2": "8",
  "6.1": "7",
  "6.0": "Vista",
  "5.2": "XP 64-bit / Server 2003",
  "5.1": "XP",
  "5.0": "2000",
};

/** CPU architecture tokens. */
export const CPU_RULES = [
  { name: "ARM 64-bit", pattern: /(?:arm64|aarch64)/i },
  { name: "ARM", pattern: /(?:armv[5-8]|\barm\b)/i },
  { name: "x86 64-bit", pattern: /(?:x86_64|x86-64|Win64|WOW64|amd64|\bx64\b)/i },
  { name: "x86 32-bit", pattern: /(?:i[3-6]86|\bx86\b)/i },
  { name: "PowerPC", pattern: /\bPPC\b/i },
];

/** Device classes. */
export const DEVICE_RULES = [
  { name: "Console", pattern: /(?:Xbox|PlayStation|Nintendo)/i },
  { name: "TV", pattern: /(?:SmartTV|Smart-TV|GoogleTV|AppleTV|CrKey|HbbTV|NetCast|Web0S|BRAVIA)/i },
  { name: "Wearable", pattern: /(?:Watch OS|watchOS|Glass)/i },
  { name: "Tablet", pattern: /(?:iPad|Tablet|Kindle|Silk|PlayBook)/i },
  { name: "Mobile", pattern: /(?:iPhone|iPod|Mobile|Windows Phone|BlackBerry|Opera Mini|IEMobile)/i },
];

/** Sample strings offered in the UI, all real, current-format User-Agents. */
export const SAMPLE_USER_AGENTS = [
  {
    label: "Chrome 131 on Windows",
    value:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  },
  {
    label: "Safari 17 on iPhone",
    value:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
  },
  {
    label: "Firefox 121 on Android",
    value: "Mozilla/5.0 (Android 13; Mobile; rv:109.0) Gecko/121.0 Firefox/121.0",
  },
  {
    label: "Edge 131 on macOS",
    value:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.2903.86",
  },
  {
    label: "Googlebot",
    value:
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  },
  { label: "curl", value: "curl/8.4.0" },
];

function underscoreVersion(raw) {
  return raw ? raw.replace(/_/g, ".") : "";
}

function windowsVersion(raw) {
  return WINDOWS_NT_VERSIONS[raw] || `NT ${raw}`;
}

function firstMatch(rules, ua) {
  for (const rule of rules) {
    const match = ua.match(rule.pattern);
    if (match) {
      const raw = match[1] || "";
      const version = rule.map ? rule.map(raw) : raw;
      return { name: rule.name, version, raw };
    }
  }
  return null;
}

/**
 * Major version number as a string, e.g. "131.0.6778.86" -> "131".
 * @param {string} version
 * @returns {string}
 */
export function majorVersion(version) {
  if (typeof version !== "string" || !version) return "";
  const [major] = version.split(".");
  return major || "";
}

/**
 * Parse a User-Agent string.
 *
 * @param {string} userAgent
 * @returns {{
 *   userAgent: string,
 *   isBot: boolean,
 *   browser: { name: string, version: string, major: string },
 *   engine: { name: string, version: string },
 *   os: { name: string, version: string },
 *   device: { type: string, vendor: string },
 *   cpu: string,
 *   tokens: string[],
 *   notes: string[]
 * } | { error: string }}
 */
export function parseUserAgent(userAgent) {
  if (typeof userAgent !== "string") {
    return { error: "Paste a User-Agent string to parse." };
  }
  const ua = userAgent.trim();
  if (!ua) return { error: "Paste a User-Agent string to parse." };
  if (ua.length > MAX_UA_LENGTH) {
    return { error: `That string is ${ua.length} characters. Real User-Agent headers are under ${MAX_UA_LENGTH}.` };
  }

  const notes = [];

  const bot = firstMatch(BOT_RULES, ua);
  const client = firstMatch(CLIENT_RULES, ua);
  const browser = bot || client || firstMatch(BROWSER_RULES, ua);
  const engine = bot || client ? null : firstMatch(ENGINE_RULES, ua);
  const os = firstMatch(OS_RULES, ua);
  const cpu = firstMatch(CPU_RULES, ua);
  const device = firstMatch(DEVICE_RULES, ua);

  const isBot = Boolean(bot);
  const deviceType = isBot
    ? "Crawler"
    : client
      ? "Script or HTTP client"
      : device
        ? device.name
        : "Desktop";

  let vendor = "";
  if (/iPhone|iPad|iPod|Macintosh/.test(ua)) vendor = "Apple";
  else if (/Windows/.test(ua)) vendor = "Microsoft";
  else if (/SamsungBrowser|SM-[A-Z0-9]+/.test(ua)) vendor = "Samsung";
  else if (/Pixel/.test(ua)) vendor = "Google";
  else if (/Kindle|Silk/.test(ua)) vendor = "Amazon";

  // Real, documented quirks worth flagging.
  if (/Windows NT 10\.0/.test(ua)) {
    notes.push(
      "Windows 11 sends the same 'Windows NT 10.0' token as Windows 10; only the Sec-CH-UA-Platform-Version client hint distinguishes them.",
    );
  }
  if (/Mac OS X 10[._]15[._]7/.test(ua)) {
    notes.push(
      "macOS has been frozen at 10_15_7 in Chrome and Safari User-Agents since 2021, so the real macOS version is hidden.",
    );
  }
  if (/Chrome\/1\d\d\.0\.0\.0/.test(ua)) {
    notes.push(
      "Chrome's reduced User-Agent zeroes the minor, build and patch numbers, so only the major version is meaningful.",
    );
  }
  if (/Macintosh/.test(ua) && /Mobile\//.test(ua)) {
    notes.push(
      "iPadOS 13 and later report as 'Macintosh' in desktop mode, so an iPad can look like a Mac.",
    );
  }
  if (!isBot && !client && !browser) {
    notes.push("No known browser token was found — this may be a custom or spoofed User-Agent.");
  }
  if (/Safari/.test(ua) && /Chrome/.test(ua)) {
    notes.push(
      "The 'Safari' token here is legacy compatibility text; Chromium browsers keep it for old server-side sniffing.",
    );
  }

  return {
    userAgent: ua,
    isBot,
    browser: {
      name: browser ? browser.name : "Unknown",
      version: browser ? browser.version : "",
      major: browser ? majorVersion(browser.version) : "",
    },
    engine: {
      name: engine ? engine.name : isBot || client ? "None" : "Unknown",
      version: engine ? engine.version : "",
    },
    os: {
      name: os ? os.name : "Unknown",
      version: os ? os.version : "",
    },
    device: { type: deviceType, vendor },
    cpu: cpu ? cpu.name : "Unknown",
    tokens: tokenise(ua),
    notes,
  };
}

/**
 * Split a User-Agent into its product tokens and comment blocks.
 * @param {string} ua
 * @returns {string[]}
 */
export function tokenise(ua) {
  if (typeof ua !== "string" || !ua.trim()) return [];
  const parts = [];
  let buffer = "";
  let depth = 0;
  for (const char of ua) {
    if (char === "(") depth += 1;
    if (char === ")") depth = Math.max(0, depth - 1);
    if (char === " " && depth === 0) {
      if (buffer.trim()) parts.push(buffer.trim());
      buffer = "";
    } else {
      buffer += char;
    }
  }
  if (buffer.trim()) parts.push(buffer.trim());
  return parts;
}
