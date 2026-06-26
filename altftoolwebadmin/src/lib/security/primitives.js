/**
 * Pure, dependency-free security primitives (server-safe, unit-testable).
 * No Firestore / network here — just transforms over request data.
 */
import crypto from "crypto";

/* ------------------------------------------------------------------ *
 * Client IP extraction
 * ------------------------------------------------------------------ */

const IP_HEADER_ORDER = [
  "cf-connecting-ip",
  "x-real-ip",
  "x-vercel-forwarded-for",
  "x-forwarded-for",
  "forwarded",
];

export function extractClientIp(headers) {
  const get = headerGetter(headers);
  for (const name of IP_HEADER_ORDER) {
    const raw = get(name);
    if (!raw) continue;
    // x-forwarded-for may be a comma list: client is the first entry.
    const first = String(raw).split(",")[0].trim();
    const cleaned = stripForwardedPrefix(first);
    if (isValidIp(cleaned)) return cleaned;
  }
  return null;
}

function stripForwardedPrefix(value) {
  // "for=1.2.3.4" / "for=\"[::1]\"" -> 1.2.3.4 / ::1
  const m = /for=\"?\[?([^"\];]+)\]?\"?/i.exec(value);
  if (m) return m[1];
  return value.replace(/^\[|\]$/g, "");
}

export function isValidIp(ip) {
  if (!ip) return false;
  const v4 = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (v4.test(ip)) return ip.split(".").every((o) => Number(o) <= 255);
  // loose IPv6 check
  return /^[0-9a-f:]+$/i.test(ip) && ip.includes(":");
}

/* ------------------------------------------------------------------ *
 * IP masking (anonymisation for display) + reversible encryption
 * ------------------------------------------------------------------ */

export function maskIp(ip) {
  if (!isValidIp(ip)) return null;
  if (ip.includes(":")) {
    // IPv6: keep first 3 hextets, zero the rest
    const parts = ip.split(":");
    return `${parts.slice(0, 3).join(":")}::`;
  }
  const octets = ip.split(".");
  octets[3] = "0";
  return octets.join(".");
}

function getEncKey() {
  const raw = process.env.SECURITY_IP_ENC_KEY;
  if (!raw) return null;
  // Accept 64-char hex, base64, or any string (hashed to 32 bytes).
  if (/^[0-9a-f]{64}$/i.test(raw)) return Buffer.from(raw, "hex");
  try {
    const b = Buffer.from(raw, "base64");
    if (b.length === 32) return b;
  } catch {
    /* ignore */
  }
  return crypto.createHash("sha256").update(raw).digest();
}

/** AES-256-GCM. Returns "v1:<iv>:<tag>:<cipher>" (base64) or null. */
export function encryptIp(ip) {
  const key = getEncKey();
  if (!key || !ip) return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(String(ip), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString("base64")}:${tag.toString("base64")}:${enc.toString("base64")}`;
}

export function decryptIp(token) {
  const key = getEncKey();
  if (!key || !token || typeof token !== "string") return null;
  const parts = token.split(":");
  if (parts.length !== 4 || parts[0] !== "v1") return null;
  try {
    const iv = Buffer.from(parts[1], "base64");
    const tag = Buffer.from(parts[2], "base64");
    const data = Buffer.from(parts[3], "base64");
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}

export function isIpEncryptionConfigured() {
  return Boolean(getEncKey());
}

/* ------------------------------------------------------------------ *
 * User-Agent parsing (browser / OS / device type)
 * ------------------------------------------------------------------ */

export function parseUserAgent(ua) {
  const raw = String(ua || "").trim();
  if (!raw) {
    return { browser: "Unknown", browserVersion: "", os: "Unknown", deviceType: "unknown", raw: "" };
  }
  const browser = detectBrowser(raw);
  return {
    browser: browser.name,
    browserVersion: browser.version,
    os: detectOs(raw),
    deviceType: detectDeviceType(raw),
    raw: raw.slice(0, 400),
  };
}

function detectBrowser(ua) {
  const tests = [
    ["Edge", /Edg(?:e|A|iOS)?\/([\d.]+)/],
    ["Opera", /OPR\/([\d.]+)/],
    ["Samsung Internet", /SamsungBrowser\/([\d.]+)/],
    ["Chrome", /Chrome\/([\d.]+)/],
    ["Firefox", /Firefox\/([\d.]+)/],
    ["Safari", /Version\/([\d.]+).*Safari/],
  ];
  for (const [name, re] of tests) {
    const m = re.exec(ua);
    if (m) return { name, version: (m[1] || "").split(".")[0] };
  }
  return { name: "Unknown", version: "" };
}

function detectOs(ua) {
  if (/Windows NT 10/.test(ua)) return "Windows 10/11";
  if (/Windows/.test(ua)) return "Windows";
  if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
  if (/Mac OS X/.test(ua)) return "macOS";
  if (/Android/.test(ua)) return "Android";
  if (/Linux/.test(ua)) return "Linux";
  return "Unknown";
}

function detectDeviceType(ua) {
  if (/iPad|Tablet/.test(ua)) return "tablet";
  if (/Mobi|Android.*Mobile|iPhone|iPod/.test(ua)) return "mobile";
  return "desktop";
}

/* ------------------------------------------------------------------ *
 * Approximate location from edge / CDN geo headers
 * ------------------------------------------------------------------ */

export function extractGeo(headers) {
  const get = headerGetter(headers);
  const country =
    get("x-vercel-ip-country") || get("cf-ipcountry") || get("x-geo-country") || null;
  const region =
    get("x-vercel-ip-country-region") || get("x-geo-region") || null;
  const city = decodeMaybe(get("x-vercel-ip-city") || get("x-geo-city")) || null;
  const tz = get("x-vercel-ip-timezone") || null;
  if (!country && !region && !city) return null;
  return { country, region, city, timezone: tz };
}

function decodeMaybe(v) {
  if (!v) return v;
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

/* ------------------------------------------------------------------ *
 * Stable device identifier (uid + browser + os + masked network)
 * ------------------------------------------------------------------ */

export function computeDeviceId({ uid, userAgent, maskedIp, clientHint }) {
  const ua = parseUserAgent(userAgent);
  const seed = [uid || "anon", ua.browser, ua.os, ua.deviceType, maskedIp || "", clientHint || ""].join("|");
  return crypto.createHash("sha256").update(seed).digest("hex").slice(0, 32);
}

export function deviceLabel(userAgent) {
  const ua = parseUserAgent(userAgent);
  return `${ua.browser} on ${ua.os}`.trim();
}

/* ------------------------------------------------------------------ *
 * Suspicious-login risk scoring (pure heuristic)
 * ------------------------------------------------------------------ */

export function scoreLogin({
  isKnownDevice = false,
  isKnownCountry = false,
  recentFailedAttempts = 0,
  activeSessionCount = 0,
  deviceLimit = 3,
  impossibleTravel = false,
  knownDeviceCount = 0,
} = {}) {
  let score = 0;
  const reasons = [];

  if (!isKnownDevice) {
    score += knownDeviceCount === 0 ? 10 : 35;
    if (knownDeviceCount > 0) reasons.push("new_device");
  }
  if (!isKnownCountry && knownDeviceCount > 0) {
    score += 30;
    reasons.push("new_country");
  }
  if (recentFailedAttempts >= 5) {
    score += 30;
    reasons.push("repeated_failures");
  } else if (recentFailedAttempts >= 3) {
    score += 15;
    reasons.push("multiple_failures");
  }
  if (activeSessionCount >= deviceLimit) {
    score += 20;
    reasons.push("device_limit_reached");
  }
  if (impossibleTravel) {
    score += 40;
    reasons.push("impossible_travel");
  }

  score = Math.min(100, score);
  const level = score >= 70 ? "high" : score >= 40 ? "medium" : "low";
  return { score, level, reasons, suspicious: level !== "low" };
}

/* ------------------------------------------------------------------ *
 * helpers
 * ------------------------------------------------------------------ */

function headerGetter(headers) {
  if (!headers) return () => null;
  if (typeof headers.get === "function") return (k) => headers.get(k);
  // plain object
  const lower = {};
  for (const [k, v] of Object.entries(headers)) lower[k.toLowerCase()] = v;
  return (k) => lower[k.toLowerCase()] ?? null;
}
