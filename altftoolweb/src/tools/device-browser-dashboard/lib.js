/**
 * Device & browser dashboard — pure logic.
 *
 * Nothing here touches the DOM. The page collects a plain "snapshot" object
 * from navigator, screen and window and hands it in; every function below is a
 * deterministic transform of that object, which is what makes the detection
 * testable.
 *
 * User-agent detection follows the only reliable rule for UA strings: match
 * the most specific token first. Every Chromium browser puts "Chrome" in its
 * UA, Chrome puts "Safari" in its UA, and Edge puts both — so the order Edge,
 * Opera, Samsung, Chrome, Firefox, Safari is the order that works.
 */

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

/**
 * Viewport breakpoints, in CSS pixels. These are Tailwind CSS v4 defaults,
 * which is what the surrounding site is built on.
 */
export const BREAKPOINTS = [
  { key: "xs", label: "Extra small", min: 0 },
  { key: "sm", label: "Small", min: 640 },
  { key: "md", label: "Medium", min: 768 },
  { key: "lg", label: "Large", min: 1024 },
  { key: "xl", label: "Extra large", min: 1280 },
  { key: "2xl", label: "2X large", min: 1536 },
];

/** Width below which a viewport is treated as a phone, per common practice. */
export const PHONE_MAX_WIDTH = 767;
/** Width below which a viewport is treated as a tablet. */
export const TABLET_MAX_WIDTH = 1023;

/**
 * Privacy checks and their weight out of 100. The weights reflect how much
 * each signal actually reduces passive tracking, not how easy it is to set.
 */
export const PRIVACY_CHECKS = [
  {
    key: "gpc",
    label: "Global Privacy Control sent",
    weight: 30,
    detail: "GPC is legally binding as an opt-out signal in California and Colorado.",
  },
  {
    key: "dnt",
    label: "Do Not Track header sent",
    weight: 10,
    detail: "DNT is advisory only — most sites ignore it, so it scores low.",
  },
  {
    key: "reducedMotion",
    label: "Reduced motion honoured",
    weight: 5,
    detail: "Not privacy in itself, but it is one fewer bit of entropy when it matches the default.",
  },
  {
    key: "noThirdPartyCookies",
    label: "Third-party cookies unavailable",
    weight: 25,
    detail: "Blocking third-party cookies removes the classic cross-site tracking channel.",
  },
  {
    key: "noBattery",
    label: "Battery API unavailable",
    weight: 10,
    detail: "The Battery Status API was removed from Firefox and Safari because it was used for fingerprinting.",
  },
  {
    key: "noDeviceMemory",
    label: "Device memory not exposed",
    weight: 10,
    detail: "navigator.deviceMemory is a Chromium-only fingerprinting surface.",
  },
  {
    key: "coarseHardwareConcurrency",
    label: "CPU core count not precisely exposed",
    weight: 10,
    detail: "Exact core counts narrow a fingerprint quickly when combined with screen size.",
  },
];

/** Total of every privacy weight. Used to normalise the score. */
export const PRIVACY_TOTAL_WEIGHT = PRIVACY_CHECKS.reduce((sum, check) => sum + check.weight, 0);

/** Privacy score bands. */
export const PRIVACY_BANDS = [
  { min: 75, label: "Well protected" },
  { min: 50, label: "Reasonably protected" },
  { min: 25, label: "Lightly protected" },
  { min: 0, label: "Highly identifiable" },
];

/**
 * Browser detection patterns, most specific first. The version group is the
 * first capture group of each pattern.
 */
export const BROWSER_PATTERNS = [
  { name: "Microsoft Edge", pattern: /Edg(?:e|A|iOS)?\/([\d.]+)/ },
  { name: "Opera", pattern: /(?:OPR|Opera)\/([\d.]+)/ },
  { name: "Samsung Internet", pattern: /SamsungBrowser\/([\d.]+)/ },
  { name: "Vivaldi", pattern: /Vivaldi\/([\d.]+)/ },
  { name: "Firefox", pattern: /(?:Firefox|FxiOS)\/([\d.]+)/ },
  { name: "Chrome", pattern: /(?:Chrome|CriOS)\/([\d.]+)/ },
  { name: "Safari", pattern: /Version\/([\d.]+).*Safari/ },
];

/** Rendering engine patterns, checked in order. */
export const ENGINE_PATTERNS = [
  { name: "Gecko", pattern: /Gecko\/\d+/ },
  { name: "Blink", pattern: /Chrome\/[\d.]+/ },
  { name: "WebKit", pattern: /AppleWebKit\/([\d.]+)/ },
];

/** Operating-system patterns, most specific first. */
export const OS_PATTERNS = [
  { name: "Windows", pattern: /Windows NT ([\d.]+)/, versions: { "10.0": "10 or 11", 6.3: "8.1", 6.2: "8", 6.1: "7" } },
  { name: "Android", pattern: /Android ([\d.]+)/ },
  { name: "iOS", pattern: /(?:iPhone|iPad|iPod).*?OS ([\d_]+)/ },
  { name: "macOS", pattern: /Mac OS X ([\d_]+)/ },
  { name: "Chrome OS", pattern: /CrOS \w+ ([\d.]+)/ },
  { name: "Linux", pattern: /Linux/ },
];

/** Capabilities reported, grouped for the UI. */
export const CAPABILITY_GROUPS = [
  {
    title: "Graphics and media",
    keys: ["webgl", "webgl2", "webgpu", "offscreenCanvas", "webCodecs", "mediaDevices"],
  },
  {
    title: "Storage",
    keys: ["localStorage", "indexedDb", "cacheStorage", "storageEstimate", "cookiesEnabled"],
  },
  {
    title: "Platform",
    keys: ["serviceWorker", "webAssembly", "sharedArrayBuffer", "webShare", "clipboard", "notifications"],
  },
  {
    title: "Sensors and input",
    keys: ["touch", "pointerEvents", "geolocation", "deviceOrientation", "vibrate", "gamepad"],
  },
];

/** Human labels for each capability key. */
export const CAPABILITY_LABELS = {
  webgl: "WebGL",
  webgl2: "WebGL 2",
  webgpu: "WebGPU",
  offscreenCanvas: "OffscreenCanvas",
  webCodecs: "WebCodecs",
  mediaDevices: "Camera / microphone API",
  localStorage: "localStorage",
  indexedDb: "IndexedDB",
  cacheStorage: "Cache Storage",
  storageEstimate: "Storage quota estimate",
  cookiesEnabled: "Cookies enabled",
  serviceWorker: "Service Worker",
  webAssembly: "WebAssembly",
  sharedArrayBuffer: "SharedArrayBuffer",
  webShare: "Web Share",
  clipboard: "Async clipboard",
  notifications: "Notifications",
  touch: "Touch input",
  pointerEvents: "Pointer Events",
  geolocation: "Geolocation",
  deviceOrientation: "Device orientation",
  vibrate: "Vibration",
  gamepad: "Gamepad",
};

/* ------------------------------------------------------------------ */
/* User-agent parsing                                                  */
/* ------------------------------------------------------------------ */

const majorOf = (version) => String(version || "").split(/[._]/)[0] || "";

/** Identify the browser and its version from a user-agent string. */
export function detectBrowser(userAgent) {
  const ua = String(userAgent || "");
  if (!ua) return { name: "Unknown", version: "", major: "" };
  for (const candidate of BROWSER_PATTERNS) {
    const match = candidate.pattern.exec(ua);
    if (match) {
      const version = match[1] || "";
      return { name: candidate.name, version, major: majorOf(version) };
    }
  }
  return { name: "Unknown", version: "", major: "" };
}

/** Identify the rendering engine. */
export function detectEngine(userAgent) {
  const ua = String(userAgent || "");
  // Gecko's token appears verbatim only in Firefox-family UAs; every WebKit UA
  // contains the decoy "like Gecko", so the Chrome check has to come first.
  if (/Chrome\/[\d.]+/.test(ua) && !/Edg(?:e)?\//.test(ua)) return "Blink";
  if (/Edg(?:e|A|iOS)?\//.test(ua)) return "Blink";
  if (/Firefox\/|FxiOS\//.test(ua)) return "Gecko";
  if (/AppleWebKit\//.test(ua)) return "WebKit";
  return "Unknown";
}

/** Identify the operating system and its version. */
export function detectOs(userAgent) {
  const ua = String(userAgent || "");
  for (const candidate of OS_PATTERNS) {
    const match = candidate.pattern.exec(ua);
    if (match) {
      const raw = (match[1] || "").replace(/_/g, ".");
      const mapped = candidate.versions && candidate.versions[raw] ? candidate.versions[raw] : raw;
      return { name: candidate.name, version: mapped };
    }
  }
  return { name: "Unknown", version: "" };
}

/** Phone, tablet or desktop, from viewport width plus touch and UA hints. */
export function detectDeviceType({ userAgent, viewportWidth, maxTouchPoints }) {
  const ua = String(userAgent || "");
  const width = Number(viewportWidth);
  const touch = Number(maxTouchPoints) > 0;
  if (/iPhone|iPod|Android.*Mobile|Windows Phone/.test(ua)) return "Phone";
  if (/iPad|Android(?!.*Mobile)|Tablet/.test(ua)) return "Tablet";
  if (!Number.isFinite(width)) return touch ? "Touch device" : "Desktop";
  if (width <= PHONE_MAX_WIDTH) return touch ? "Phone" : "Small window";
  if (width <= TABLET_MAX_WIDTH) return touch ? "Tablet" : "Desktop";
  return "Desktop";
}

/** Which Tailwind breakpoint the current viewport width falls in. */
export function breakpointFor(viewportWidth) {
  const width = Number(viewportWidth);
  if (!Number.isFinite(width) || width < 0) {
    return { error: "Viewport width must be a number of 0 or more." };
  }
  const band = [...BREAKPOINTS].reverse().find((entry) => width >= entry.min) || BREAKPOINTS[0];
  return { key: band.key, label: band.label, min: band.min };
}

/* ------------------------------------------------------------------ */
/* Privacy                                                             */
/* ------------------------------------------------------------------ */

/**
 * Score how exposed the browser is to passive tracking, 0-100.
 * Higher is more private.
 */
export function privacyScore(snapshot = {}) {
  const results = PRIVACY_CHECKS.map((check) => {
    let passed = false;
    if (check.key === "gpc") passed = snapshot.globalPrivacyControl === true;
    else if (check.key === "dnt") passed = snapshot.doNotTrack === "1" || snapshot.doNotTrack === "yes";
    else if (check.key === "reducedMotion") passed = snapshot.prefersReducedMotion === true;
    else if (check.key === "noThirdPartyCookies") passed = snapshot.thirdPartyCookies === false;
    else if (check.key === "noBattery") passed = snapshot.hasBatteryApi !== true;
    else if (check.key === "noDeviceMemory") passed = snapshot.deviceMemory == null;
    else if (check.key === "coarseHardwareConcurrency") passed = snapshot.hardwareConcurrency == null;
    return { ...check, passed };
  });

  const earned = results.reduce((sum, check) => sum + (check.passed ? check.weight : 0), 0);
  // PRIVACY_TOTAL_WEIGHT is a non-zero constant, so this cannot divide by zero.
  const score = Math.round((earned / PRIVACY_TOTAL_WEIGHT) * 100);
  const band = PRIVACY_BANDS.find((entry) => score >= entry.min) || PRIVACY_BANDS[PRIVACY_BANDS.length - 1];

  return {
    score,
    band: band.label,
    passed: results.filter((check) => check.passed).length,
    total: results.length,
    checks: results,
  };
}

/* ------------------------------------------------------------------ */
/* Fingerprint surface                                                 */
/* ------------------------------------------------------------------ */

/**
 * Count how many identifying attributes the browser volunteers. This is not a
 * real fingerprint — nothing is hashed or stored — it is a count of the
 * distinguishing values a script could read on this page load.
 */
export function fingerprintSurface(snapshot = {}) {
  const attributes = [
    ["User agent", snapshot.userAgent],
    ["Screen resolution", snapshot.screenWidth && `${snapshot.screenWidth}x${snapshot.screenHeight}`],
    ["Colour depth", snapshot.colorDepth],
    ["Device pixel ratio", snapshot.devicePixelRatio],
    ["Time zone", snapshot.timeZone],
    ["Language", snapshot.language],
    ["Languages list", Array.isArray(snapshot.languages) && snapshot.languages.length > 1 ? snapshot.languages.join(",") : null],
    ["CPU cores", snapshot.hardwareConcurrency],
    ["Device memory", snapshot.deviceMemory],
    ["Platform", snapshot.platform],
    ["Touch points", snapshot.maxTouchPoints],
    ["GPU renderer", snapshot.gpuRenderer],
    ["Network type", snapshot.effectiveType],
  ];
  const exposed = attributes.filter(([, value]) => value !== null && value !== undefined && value !== "" && value !== false);
  return {
    exposedCount: exposed.length,
    totalChecked: attributes.length,
    exposed: exposed.map(([label, value]) => ({ label, value: String(value) })),
  };
}

/* ------------------------------------------------------------------ */
/* Public entry point                                                  */
/* ------------------------------------------------------------------ */

/**
 * Turn a raw snapshot into everything the dashboard displays.
 * Returns { error } when there is no snapshot to read.
 */
export function analyseSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== "object") {
    return { error: "No browser data available — this dashboard needs to run in a browser." };
  }
  if (!snapshot.userAgent) {
    return { error: "This browser reported no user-agent string, so it cannot be identified." };
  }

  const browser = detectBrowser(snapshot.userAgent);
  const os = detectOs(snapshot.userAgent);
  const engine = detectEngine(snapshot.userAgent);
  const deviceType = detectDeviceType(snapshot);
  const breakpoint = breakpointFor(snapshot.viewportWidth);
  const privacy = privacyScore(snapshot);
  const fingerprint = fingerprintSurface(snapshot);

  const capabilities = snapshot.capabilities || {};
  const groups = CAPABILITY_GROUPS.map((group) => ({
    title: group.title,
    items: group.keys.map((key) => ({
      key,
      label: CAPABILITY_LABELS[key] || key,
      supported: capabilities[key] === true,
    })),
  }));
  const supportedCount = groups.reduce(
    (sum, group) => sum + group.items.filter((item) => item.supported).length,
    0,
  );
  const capabilityCount = groups.reduce((sum, group) => sum + group.items.length, 0);

  return {
    browser,
    os,
    engine,
    deviceType,
    breakpoint: breakpoint.error ? null : breakpoint,
    privacy,
    fingerprint,
    groups,
    supportedCount,
    capabilityCount,
    // Guard: capabilityCount is a constant length, never zero.
    supportPercent: Math.round((supportedCount / capabilityCount) * 100),
    viewport:
      Number.isFinite(Number(snapshot.viewportWidth)) && Number.isFinite(Number(snapshot.viewportHeight))
        ? `${snapshot.viewportWidth} x ${snapshot.viewportHeight}`
        : "—",
    screen:
      Number.isFinite(Number(snapshot.screenWidth)) && Number.isFinite(Number(snapshot.screenHeight))
        ? `${snapshot.screenWidth} x ${snapshot.screenHeight}`
        : "—",
  };
}

/** Plain-text report for the copy button. */
export function formatReport(result) {
  if (!result || result.error) return "";
  const lines = [];
  lines.push("Device & browser report");
  lines.push("=======================");
  lines.push(`Browser: ${result.browser.name} ${result.browser.version}`);
  lines.push(`Engine: ${result.engine}`);
  lines.push(`Operating system: ${result.os.name} ${result.os.version}`);
  lines.push(`Device type: ${result.deviceType}`);
  lines.push(`Viewport: ${result.viewport}${result.breakpoint ? ` (${result.breakpoint.key})` : ""}`);
  lines.push(`Screen: ${result.screen}`);
  lines.push(`Privacy score: ${result.privacy.score}/100 — ${result.privacy.band}`);
  lines.push(`Identifying attributes exposed: ${result.fingerprint.exposedCount} of ${result.fingerprint.totalChecked}`);
  lines.push(`Web APIs supported: ${result.supportedCount} of ${result.capabilityCount}`);
  lines.push("");
  for (const group of result.groups) {
    lines.push(group.title);
    for (const item of group.items) {
      lines.push(`  ${item.supported ? "yes" : "no "} ${item.label}`);
    }
  }
  return lines.join("\n");
}
