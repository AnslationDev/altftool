/**
 * Browser Extension Permission Analyzer.
 *
 * Parses a Chrome/Edge/Firefox extension manifest.json (manifest_version 2 or
 * 3) and reports what each declared permission actually allows, how broad the
 * host access is, and which *combinations* of declarations add up to more than
 * their parts.
 *
 * Pure JavaScript: no DOM, no network, no clock, no randomness. The same
 * manifest always produces the same report.
 *
 * Risk tiers are a fixed classification, not a computed score:
 *   critical — arbitrary code, arbitrary page data, or a path out of the browser sandbox
 *   high     — broad access to sensitive user data, or control over how traffic is handled
 *   moderate — a bounded class of user data, or a capability the user would notice
 *   low      — a local capability with no user-data exposure
 */

export const TIERS = ["critical", "high", "moderate", "low", "unknown"];

export const TIER_LABELS = {
  critical: "Critical",
  high: "High",
  moderate: "Moderate",
  low: "Low",
  unknown: "Unrecognised",
};

const tierRank = { critical: 4, high: 3, moderate: 2, low: 1, unknown: 0 };

/* ------------------------------------------------------------------ */
/* Permission catalogue                                                */
/* ------------------------------------------------------------------ */

const CATALOG_SOURCE = [
  // critical
  ["debugger", "critical", "Attaches the DevTools protocol to any tab: read and rewrite page content, cookies, network traffic, and run arbitrary JavaScript. It bypasses the boundaries every other permission respects."],
  ["nativeMessaging", "critical", "Exchanges messages with a native binary installed on the machine. Anything the extension can read can leave the browser sandbox, and the native host runs with the user's OS privileges."],
  ["proxy", "critical", "Sets the browser's proxy configuration, so every request the browser makes can be routed through a host of the extension's choosing."],
  ["webRequestBlocking", "critical", "Pauses each matching request synchronously and can rewrite or cancel it before it is sent. With broad host access this is full traffic interception."],
  ["desktopCapture", "critical", "Captures the screen, a window, or a tab as a media stream after a picker prompt."],
  ["pageCapture", "critical", "Saves any tab as MHTML — the fully rendered page, including content behind a login."],
  ["tabCapture", "critical", "Captures a tab's audio and video stream, including rendered page content."],
  ["webAuthenticationProxy", "critical", "Intercepts WebAuthn ceremonies, placing the extension between the user and passkey or security-key authentication."],
  ["vpnProvider", "critical", "Implements a VPN client, taking over the device's network routing."],
  ["certificateProvider", "critical", "Supplies TLS client certificates and can be asked to sign with the associated private keys."],
  ["enterprise.platformKeys", "critical", "Generates and uses hardware-backed enterprise certificates on managed devices."],
  ["platformKeys", "critical", "Uses the client certificates the platform manages, including signing operations."],

  // high
  ["scripting", "high", "Injects scripts and stylesheets into pages within the granted hosts. Injected code runs with the page's own origin."],
  ["tabs", "high", "Reads the URL, title and favicon of every tab — not only the active one — and can create, move, reload and close them."],
  ["cookies", "high", "Reads and writes cookies for the granted hosts, including the session cookies that authenticate the user."],
  ["history", "high", "Reads, searches and deletes the full browsing history."],
  ["webRequest", "high", "Observes every matching request, its URL and its headers, as it happens."],
  ["declarativeNetRequestWithHostAccess", "high", "Applies block, redirect and header rules to matching requests, with request details available for the granted hosts."],
  ["declarativeNetRequestFeedback", "high", "Reports which rules matched which requests, which effectively hands the extension a live browsing log."],
  ["browsingData", "high", "Clears cookies, cache, history, downloads, form data and stored passwords."],
  ["management", "high", "Lists, enables, disables and uninstalls other extensions — including security extensions."],
  ["privacy", "high", "Changes privacy-related browser settings such as Safe Browsing, network prediction and WebRTC IP handling."],
  ["contentSettings", "high", "Overrides per-site settings for cookies, JavaScript, images, location, camera and microphone."],
  ["clipboardRead", "high", "Reads the clipboard, which routinely holds passwords, recovery codes and one-time codes."],
  ["geolocation", "high", "Reads the device's location without a further per-site prompt."],
  ["identity", "high", "Obtains OAuth2 access tokens for the browser's signed-in account."],
  ["identity.email", "high", "Reads the signed-in account's email address."],
  ["webNavigation", "high", "Receives an event, with the URL, for every navigation in every tab."],
  ["downloads", "high", "Starts downloads to disk and reads the full download history."],
  ["bookmarks", "high", "Reads and rewrites the entire bookmark tree."],
  ["sessions", "high", "Reads recently closed tabs and the tabs open on other synced devices."],
  ["topSites", "high", "Reads the most-visited sites list that backs the new tab page."],
  ["signedInDevices", "high", "Lists the other devices signed into the same browser account."],
  ["processes", "high", "Reads per-tab process, memory and network statistics."],
  ["webRequestAuthProvider", "high", "Answers HTTP authentication challenges on the user's behalf."],
  ["fileSystemProvider", "high", "Mounts a virtual file system the OS file manager can browse."],
  ["fileBrowserHandler", "high", "Handles files the user opens from the ChromeOS file browser."],
  ["documentScan", "high", "Reads images directly from an attached scanner."],
  ["readingList", "high", "Reads and writes the browser's reading list, which is a record of saved URLs."],
  ["pkcs11", "high", "Installs and removes PKCS#11 security modules (Firefox)."],
  ["browserSettings", "high", "Changes global browser settings such as homepage and search (Firefox)."],
  ["dns", "high", "Resolves hostnames directly from the extension (Firefox)."],
  ["nativeMessagingHost", "high", "Declares a native messaging host association."],

  // moderate
  ["activeTab", "moderate", "Grants host access to the current tab, and only after the user invokes the extension. This is the narrow, revocable alternative to host permissions."],
  ["declarativeNetRequest", "moderate", "Applies static block and redirect rules. Without host access the extension acts on requests but does not see their details."],
  ["declarativeContent", "moderate", "Reacts to page state — URL and CSS selectors — without reading page content."],
  ["notifications", "moderate", "Shows system notifications, which can be used for convincing phishing prompts."],
  ["clipboardWrite", "moderate", "Writes to the clipboard, which can substitute an address or account number the user is about to paste."],
  ["printing", "moderate", "Submits print jobs and reads printer state."],
  ["printingMetrics", "moderate", "Reads the device's print job history."],
  ["printerProvider", "moderate", "Acts as a printer driver for the browser."],
  ["tabGroups", "moderate", "Reads and modifies tab groups, including their titles."],
  ["search", "moderate", "Runs queries through the default search provider."],
  ["sidePanel", "moderate", "Renders extension UI in the browser side panel."],
  ["contextMenus", "moderate", "Adds entries to the right-click menu."],
  ["menus", "moderate", "Adds entries to browser menus (Firefox)."],
  ["unlimitedStorage", "moderate", "Removes the extension's storage quota."],
  ["gcm", "moderate", "Receives push messages from Firebase Cloud Messaging."],
  ["background", "moderate", "Keeps the browser process alive for the extension after all windows are closed."],
  ["tts", "moderate", "Speaks text through the platform's speech engine."],
  ["ttsEngine", "moderate", "Provides a speech engine, so it receives the text other extensions speak."],
  ["accessibilityFeatures.modify", "moderate", "Changes the browser's accessibility settings."],
  ["accessibilityFeatures.read", "moderate", "Reads the browser's accessibility settings."],
  ["fontSettings", "moderate", "Reads and changes font settings per script and generic family."],
  ["wallpaper", "moderate", "Sets the ChromeOS wallpaper."],
  ["loginState", "moderate", "Reads whether the ChromeOS session is a login screen or a user session."],
  ["enterprise.deviceAttributes", "moderate", "Reads managed-device identifiers."],
  ["enterprise.hardwarePlatform", "moderate", "Reads the device manufacturer and model."],
  ["enterprise.networkingAttributes", "moderate", "Reads the managed device's network details."],
  ["favicon", "moderate", "Reads favicons for arbitrary URLs from the browser's cache."],
  ["theme", "moderate", "Changes the browser theme (Firefox)."],
  ["find", "moderate", "Runs find-in-page across tabs and reads the matches (Firefox)."],
  ["downloads.open", "moderate", "Opens a downloaded file with its default application."],
  ["downloads.ui", "moderate", "Hides or shows the downloads shelf."],
  ["audio", "moderate", "Reads and controls audio input and output devices."],

  // low
  ["storage", "low", "Stores the extension's own data in extension-scoped storage."],
  ["alarms", "low", "Schedules the extension's own code to run later."],
  ["idle", "low", "Reads whether the machine is active, idle or locked."],
  ["power", "low", "Requests that the display or system stay awake."],
  ["offscreen", "low", "Creates a hidden document so a service worker can use DOM APIs."],
  ["system.cpu", "low", "Reads CPU model and utilisation."],
  ["system.memory", "low", "Reads total and available memory."],
  ["system.display", "low", "Reads display geometry and scaling."],
  ["system.storage", "low", "Reads storage device capacity and free space."],
];

export const PERMISSION_CATALOG = CATALOG_SOURCE.reduce((acc, [name, tier, summary]) => {
  acc[name] = { name, tier, summary };
  return acc;
}, {});

export function describePermission(name) {
  const known = PERMISSION_CATALOG[name];
  if (known) return { ...known, known: true };
  return {
    name,
    tier: "unknown",
    known: false,
    summary:
      "Not in this tool's catalogue. It may be a newer API, a browser-specific permission, or a typo that the browser will simply ignore.",
  };
}

/* ------------------------------------------------------------------ */
/* Match patterns                                                      */
/* ------------------------------------------------------------------ */

const VALID_SCHEMES = ["*", "http", "https", "file", "ftp", "ws", "wss", "urn", "data"];

/**
 * Parse a Chrome extension match pattern: <scheme>://<host><path>, or the
 * literal <all_urls>.
 */
export function parseMatchPattern(pattern) {
  if (typeof pattern !== "string" || pattern.trim().length === 0) {
    return { pattern: String(pattern), valid: false, error: "Not a string." };
  }
  const value = pattern.trim();

  if (value === "<all_urls>" || value === "*://*/*") {
    return {
      pattern: value,
      valid: true,
      scheme: value === "<all_urls>" ? "any" : "*",
      host: "*",
      path: "/*",
      breadth: "all-urls",
      label: "Every site the browser can load",
    };
  }

  const schemeSplit = value.indexOf("://");
  if (schemeSplit === -1) {
    return {
      pattern: value,
      valid: false,
      error: "Missing scheme separator '://'. A match pattern is <scheme>://<host>/<path>.",
    };
  }

  const scheme = value.slice(0, schemeSplit);
  const rest = value.slice(schemeSplit + 3);
  if (!VALID_SCHEMES.includes(scheme)) {
    return {
      pattern: value,
      valid: false,
      error: `Scheme "${scheme}" is not one of ${VALID_SCHEMES.join(", ")}.`,
    };
  }

  const slash = rest.indexOf("/");
  if (slash === -1) {
    return {
      pattern: value,
      valid: false,
      error: "Missing path. A match pattern must end with a path, even if it is just /*.",
    };
  }

  const host = rest.slice(0, slash);
  const path = rest.slice(slash);

  if (host.length === 0 && scheme !== "file") {
    return { pattern: value, valid: false, error: "Empty host." };
  }
  if (host.includes("*") && host !== "*" && !host.startsWith("*.")) {
    return {
      pattern: value,
      valid: false,
      error: "'*' is only allowed as the whole host or as a leading '*.' label.",
    };
  }

  let breadth;
  let label;
  if (host === "*") {
    breadth = scheme === "*" ? "all-urls" : "all-hosts";
    label =
      scheme === "*"
        ? "Every http and https site"
        : `Every host over ${scheme}`;
  } else if (host.startsWith("*.")) {
    breadth = "subdomains";
    label = `${host.slice(2)} and every subdomain`;
  } else if (scheme === "file") {
    breadth = "files";
    label = "Local files on this machine";
  } else {
    breadth = "host";
    label = host;
  }

  const pathAll = path === "/*";
  return {
    pattern: value,
    valid: true,
    scheme,
    host,
    path,
    breadth,
    label: pathAll ? label : `${label} (paths matching ${path})`,
  };
}

const BREADTH_RANK = { "all-urls": 4, "all-hosts": 3, subdomains: 2, files: 2, host: 1 };

/** True when a parsed pattern covers hosts the extension does not own. */
function isBroad(parsed) {
  return parsed.valid && (parsed.breadth === "all-urls" || parsed.breadth === "all-hosts");
}

/** A string is a host permission rather than an API permission. */
function looksLikeMatchPattern(value) {
  return (
    typeof value === "string" &&
    (value === "<all_urls>" || value.includes("://") || value.startsWith("*."))
  );
}

/* ------------------------------------------------------------------ */
/* JSON with comments                                                  */
/* ------------------------------------------------------------------ */

/**
 * Remove // and /* *\/ comments while respecting string literals, so a manifest
 * copied out of a repository that carries annotations still parses. Returns the
 * cleaned text and whether anything was removed.
 */
export function stripJsonComments(text) {
  let out = "";
  let removed = false;
  let inString = false;
  let inLine = false;
  let inBlock = false;
  let escaped = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

    if (inLine) {
      if (ch === "\n") {
        inLine = false;
        out += ch;
      }
      continue;
    }
    if (inBlock) {
      if (ch === "*" && next === "/") {
        inBlock = false;
        i += 1;
      } else if (ch === "\n") {
        out += ch;
      }
      continue;
    }
    if (inString) {
      out += ch;
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      out += ch;
      continue;
    }
    if (ch === "/" && next === "/") {
      inLine = true;
      removed = true;
      i += 1;
      continue;
    }
    if (ch === "/" && next === "*") {
      inBlock = true;
      removed = true;
      i += 1;
      continue;
    }
    out += ch;
  }

  return { text: out, removed };
}

/* ------------------------------------------------------------------ */
/* Content Security Policy                                             */
/* ------------------------------------------------------------------ */

/** Parse a CSP string into { directive: [values] }. */
export function parseCsp(value) {
  const directives = {};
  if (typeof value !== "string") return directives;
  for (const chunk of value.split(";")) {
    const parts = chunk.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) continue;
    directives[parts[0].toLowerCase()] = parts.slice(1);
  }
  return directives;
}

/**
 * The MV3 "no remote script sources" restriction only applies to the
 * extension_pages CSP key (and the legacy V2 single-string key, which governs
 * the same surface). The sandbox key is explicitly exempt: sandboxed pages
 * run outside the extension's regular privileges and are allowed a more
 * permissive CSP, including remote script sources, regardless of manifest
 * version.
 */
function cspKeyNote(key, manifestVersion) {
  if (key === "sandbox") {
    return "Sandboxed pages have their own, more permissive CSP and are not subject to the extension_pages restriction, so a browser will honour a remote script source declared here.";
  }
  if (manifestVersion === 3) {
    return "Manifest V3 refuses remote script sources for extension_pages, so a browser will reject these rather than honour them.";
  }
  if (manifestVersion === 2) {
    return "Manifest V2 honoured remote script sources for extension_pages, which is the main reason V3 removed them.";
  }
  return "No valid manifest_version was declared, so it is not certain which rule applies to extension_pages — Chrome requires 3, which forbids remote script sources.";
}

function analyseCsp(raw, manifestVersion) {
  if (raw === undefined) return null;

  const entries = [];
  if (typeof raw === "string") {
    entries.push({ key: "content_security_policy", value: raw });
  } else if (raw && typeof raw === "object") {
    for (const key of ["extension_pages", "sandbox"]) {
      if (typeof raw[key] === "string") entries.push({ key, value: raw[key] });
    }
  }
  if (entries.length === 0) return null;

  const findings = [];
  for (const entry of entries) {
    const directives = parseCsp(entry.value);
    const sources = [...(directives["script-src"] || []), ...(directives["default-src"] || [])];
    for (const source of sources) {
      const lower = source.toLowerCase();
      if (lower === "'unsafe-eval'") {
        findings.push({
          key: entry.key,
          source,
          note: "'unsafe-eval' allows eval() and new Function(), so code assembled at runtime can execute inside the extension's own origin.",
        });
      }
      if (lower === "'unsafe-inline'") {
        findings.push({
          key: entry.key,
          source,
          note: "'unsafe-inline' allows inline <script> in extension pages.",
        });
      }
      if (lower.startsWith("http://")) {
        findings.push({
          key: entry.key,
          source,
          note: "A plaintext http: script source means an on-path attacker can replace the extension's code.",
        });
      } else if (lower.startsWith("https://")) {
        findings.push({
          key: entry.key,
          source,
          note: "A remote script source means the code the extension runs is decided by that server, not by the reviewed package.",
        });
      }
    }
  }

  const keysPresent = [...new Set(entries.map((entry) => entry.key))];

  return {
    entries,
    findings,
    note: keysPresent.map((key) => cspKeyNote(key, manifestVersion)).join(" "),
  };
}

/* ------------------------------------------------------------------ */
/* Main analysis                                                       */
/* ------------------------------------------------------------------ */

function toArray(value) {
  if (Array.isArray(value)) return value.filter((item) => typeof item === "string");
  return [];
}

function classify(names) {
  return names.map((name) => describePermission(name));
}

function countTiers(entries) {
  const counts = { critical: 0, high: 0, moderate: 0, low: 0, unknown: 0 };
  for (const entry of entries) counts[entry.tier] += 1;
  return counts;
}

/**
 * Analyse an extension manifest.
 *
 * @param {string} manifestText raw manifest.json text
 * @returns {{error: string}|object}
 */
export function analyzeManifest(manifestText) {
  if (typeof manifestText !== "string" || manifestText.trim().length === 0) {
    return { error: "Paste the contents of the extension's manifest.json." };
  }

  let manifest;
  let commentsStripped = false;
  try {
    manifest = JSON.parse(manifestText);
  } catch (firstError) {
    const cleaned = stripJsonComments(manifestText);
    if (!cleaned.removed) {
      return { error: `That is not valid JSON: ${firstError.message}` };
    }
    try {
      manifest = JSON.parse(cleaned.text);
      commentsStripped = true;
    } catch (secondError) {
      return { error: `That is not valid JSON: ${secondError.message}` };
    }
  }

  if (manifest === null || typeof manifest !== "object" || Array.isArray(manifest)) {
    return { error: "A manifest must be a JSON object at the top level." };
  }

  const notes = [];
  if (commentsStripped) {
    notes.push("Comments were stripped before parsing. A browser would reject them — manifest.json must be strict JSON.");
  }

  const manifestVersion =
    typeof manifest.manifest_version === "number" ? manifest.manifest_version : null;
  if (manifestVersion === null) {
    notes.push("No manifest_version. Chrome requires 3; Firefox accepts 2 or 3.");
  } else if (manifestVersion === 2) {
    notes.push("Manifest V2. Chrome no longer runs V2 extensions, and in V2 host permissions are mixed into the same permissions array as API permissions.");
  } else if (manifestVersion !== 3) {
    notes.push(`manifest_version ${manifestVersion} is not a version any current browser accepts.`);
  }

  // In V2 the permissions array mixes API names and match patterns.
  const rawPermissions = toArray(manifest.permissions);
  const rawOptional = toArray(manifest.optional_permissions);

  const apiNames = rawPermissions.filter((item) => !looksLikeMatchPattern(item));
  const optionalApiNames = rawOptional.filter((item) => !looksLikeMatchPattern(item));

  const hostStrings = [
    ...rawPermissions.filter(looksLikeMatchPattern).map((p) => ({ pattern: p, source: "permissions" })),
    ...toArray(manifest.host_permissions).map((p) => ({ pattern: p, source: "host_permissions" })),
  ];
  const optionalHostStrings = [
    ...rawOptional.filter(looksLikeMatchPattern).map((p) => ({ pattern: p, source: "optional_permissions" })),
    ...toArray(manifest.optional_host_permissions).map((p) => ({
      pattern: p,
      source: "optional_host_permissions",
    })),
  ];

  const apiPermissions = classify(apiNames);
  const optionalApiPermissions = classify(optionalApiNames);

  const hostPermissions = hostStrings.map((item) => ({
    ...parseMatchPattern(item.pattern),
    source: item.source,
  }));
  const optionalHostPermissions = optionalHostStrings.map((item) => ({
    ...parseMatchPattern(item.pattern),
    source: item.source,
  }));

  // Content scripts
  const contentScripts = (Array.isArray(manifest.content_scripts) ? manifest.content_scripts : [])
    .filter((item) => item && typeof item === "object")
    .map((item, index) => ({
      index,
      matches: toArray(item.matches).map(parseMatchPattern),
      excludeMatches: toArray(item.exclude_matches).map(parseMatchPattern),
      allFrames: item.all_frames === true,
      matchAboutBlank: item.match_about_blank === true,
      runAt: typeof item.run_at === "string" ? item.run_at : "document_idle",
      world: typeof item.world === "string" ? item.world : "ISOLATED",
      jsCount: toArray(item.js).length,
      cssCount: toArray(item.css).length,
    }));

  const contentScriptHosts = contentScripts.flatMap((script) => script.matches);

  const allHosts = [...hostPermissions, ...contentScriptHosts];
  const broadHosts = allHosts.filter(isBroad);
  const broadestHost = allHosts.reduce((best, current) => {
    if (!current.valid) return best;
    if (!best) return current;
    return (BREADTH_RANK[current.breadth] || 0) > (BREADTH_RANK[best.breadth] || 0) ? current : best;
  }, null);
  const invalidHosts = [...allHosts, ...optionalHostPermissions].filter((item) => !item.valid);

  // Background
  let background = null;
  if (manifest.background && typeof manifest.background === "object") {
    const bg = manifest.background;
    if (typeof bg.service_worker === "string") {
      background = {
        type: "service_worker",
        file: bg.service_worker,
        persistent: false,
        note: "A Manifest V3 service worker. It is terminated when idle, so it cannot hold state or block requests synchronously.",
      };
    } else if (Array.isArray(bg.scripts) || typeof bg.page === "string") {
      background = {
        type: Array.isArray(bg.scripts) ? "scripts" : "page",
        file: Array.isArray(bg.scripts) ? bg.scripts.join(", ") : bg.page,
        persistent: bg.persistent !== false,
        note:
          bg.persistent !== false
            ? "A persistent V2 background page: it stays resident for the whole browser session."
            : "An event page: loaded on demand and unloaded when idle.",
      };
    }
  }

  // Web-accessible resources
  const warEntries = [];
  const rawWar = manifest.web_accessible_resources;
  if (Array.isArray(rawWar)) {
    for (const item of rawWar) {
      if (typeof item === "string") {
        warEntries.push({ resources: [item], matches: [], extensionIds: [], legacy: true });
      } else if (item && typeof item === "object") {
        warEntries.push({
          resources: toArray(item.resources),
          matches: toArray(item.matches).map(parseMatchPattern),
          extensionIds: toArray(item.extension_ids),
          useDynamicUrl: item.use_dynamic_url === true,
          legacy: false,
        });
      }
    }
  }

  // externally_connectable
  let externallyConnectable = null;
  if (manifest.externally_connectable && typeof manifest.externally_connectable === "object") {
    externallyConnectable = {
      matches: toArray(manifest.externally_connectable.matches).map(parseMatchPattern),
      ids: toArray(manifest.externally_connectable.ids),
      acceptsTlsChannelId: manifest.externally_connectable.accepts_tls_channel_id === true,
    };
  }

  const csp = analyseCsp(manifest.content_security_policy, manifestVersion);

  /* ---------------- combinations ---------------- */

  const has = (name) => apiNames.includes(name);
  const combinations = [];
  const add = (level, title, detail) => combinations.push({ level, title, detail });

  const injectsCode = has("scripting") || contentScripts.length > 0;
  const broadLabel = broadHosts.length > 0 ? broadHosts[0].pattern : null;

  if (broadHosts.length > 0 && (has("scripting") || contentScripts.length > 0)) {
    add(
      "critical",
      "Arbitrary code on every site",
      `${broadLabel} plus ${has("scripting") ? "the scripting API" : "content scripts"} means the extension can read and rewrite the DOM of any page you open — bank pages, webmail, internal tools — with no further prompt.`,
    );
  }
  if (broadHosts.length > 0 && has("cookies")) {
    add(
      "critical",
      "Session cookies for every site",
      "Broad host access plus the cookies API means the extension can read the authentication cookies of every site you are signed into and use them elsewhere.",
    );
  }
  if (broadHosts.length > 0 && (has("webRequest") || has("webRequestBlocking"))) {
    add(
      "critical",
      has("webRequestBlocking") ? "Full traffic interception" : "Full traffic visibility",
      has("webRequestBlocking")
        ? "Broad hosts with webRequestBlocking lets the extension see, alter or cancel every request and its headers before it is sent."
        : "Broad hosts with webRequest lets the extension observe every request URL and header the browser makes.",
    );
  }
  if (has("nativeMessaging") && (broadHosts.length > 0 || injectsCode)) {
    add(
      "critical",
      "An exfiltration path out of the sandbox",
      "nativeMessaging alongside page access means data read from web pages can be handed to a native binary, where browser policy no longer applies and no request appears in DevTools.",
    );
  }
  if (has("debugger")) {
    add(
      "critical",
      "Debugger access supersedes every other permission",
      "chrome.debugger attaches the DevTools protocol to a tab. It can read cookies flagged HttpOnly, dump storage, and evaluate arbitrary JavaScript regardless of what the host permissions say.",
    );
  }
  if (has("management") && (broadHosts.length > 0 || has("scripting"))) {
    add(
      "high",
      "Can disable the extensions that would notice",
      "The management API can turn off other extensions, including ad blockers and security tooling, before acting on the page access it also holds.",
    );
  }
  if (has("proxy") && (has("webRequest") || broadHosts.length > 0)) {
    add(
      "high",
      "Can route and inspect traffic together",
      "Proxy configuration plus request observation means the extension can both redirect traffic through a host it chooses and read what goes over it.",
    );
  }
  if (has("clipboardRead") && broadHosts.length > 0) {
    add(
      "high",
      "Clipboard plus page access",
      "Clipboard reads catch what password managers paste. Combined with broad page access, the extension sees both the credential and the site it was pasted into.",
    );
  }
  if (has("tabs") && has("history")) {
    add(
      "high",
      "A complete browsing profile",
      "tabs supplies the live URL of every tab and history supplies the archive. Together they reconstruct browsing without touching page content at all.",
    );
  }
  if (has("declarativeNetRequestFeedback") && has("declarativeNetRequest")) {
    add(
      "high",
      "Declarative rules with a matching log",
      "declarativeNetRequestFeedback reports which rule matched which request, which turns the privacy-preserving declarative API back into a browsing log.",
    );
  }
  if (has("downloads") && has("nativeMessaging")) {
    add(
      "high",
      "Can write a file and then run it",
      "The downloads API places a file on disk and nativeMessaging can hand it to a native host. That is a full drop-and-execute chain in two documented APIs.",
    );
  }
  if (background && background.persistent && has("webRequestBlocking")) {
    add(
      "high",
      "Persistent background page with blocking interception",
      "A resident V2 background page holding a blocking webRequest listener sits in the path of every request for the whole session.",
    );
  }
  if (csp && csp.findings.some((f) => f.source.toLowerCase().startsWith("http"))) {
    add(
      "critical",
      "Code loaded from a remote server",
      "The CSP admits a remote script source. When code arrives from a server at runtime, the permissions above describe a ceiling that whoever controls that server can use, not what the reviewed package does.",
    );
  }
  if (csp && csp.findings.some((f) => f.source.toLowerCase() === "'unsafe-eval'")) {
    add(
      "high",
      "unsafe-eval in the extension CSP",
      "eval() inside the extension's own origin means any string the extension obtains — from a page, a message or storage — can become executable code.",
    );
  }
  if (externallyConnectable && externallyConnectable.matches.some(isBroad)) {
    add(
      "critical",
      "Any web page can message the extension",
      "externally_connectable matches every site, so any page — including an attacker's — can send messages to this extension and try to drive the privileges it holds.",
    );
  }
  for (const entry of warEntries) {
    if (entry.legacy) {
      add(
        "moderate",
        "Web-accessible resources exposed to every site",
        `Manifest V2 style web_accessible_resources are readable by any page, so ${entry.resources.join(", ")} can be fetched to detect that this extension is installed.`,
      );
      break;
    }
    if (entry.matches.some(isBroad) && !entry.useDynamicUrl) {
      add(
        "moderate",
        "Web-accessible resources readable by every site",
        "These resources are exposed to all sites at a stable URL, which lets any page fingerprint the browser by checking whether the extension is installed. use_dynamic_url:true avoids it.",
      );
      break;
    }
  }
  const optionalHeavy = optionalApiPermissions.filter(
    (item) => item.tier === "critical" || item.tier === "high",
  );
  if (optionalHeavy.length > 0) {
    add(
      "high",
      "The install prompt understates the ceiling",
      `${optionalHeavy.map((item) => item.name).join(", ")} ${optionalHeavy.length === 1 ? "is" : "are"} declared as optional, so ${optionalHeavy.length === 1 ? "it does" : "they do"} not appear at install time. The extension can request ${optionalHeavy.length === 1 ? "it" : "them"} later, at a moment of its choosing.`,
    );
  }
  if (optionalHostPermissions.some(isBroad)) {
    add(
      "high",
      "Broad host access is one prompt away",
      "An optional host permission covering all sites can be requested after install, so the reviewed install prompt is not the ceiling.",
    );
  }
  for (const script of contentScripts) {
    if (script.matches.some(isBroad) && script.allFrames && script.runAt === "document_start") {
      add(
        "high",
        "Content script runs first, in every frame, on every site",
        `Content script #${script.index + 1} injects at document_start into all frames of every site, so it executes before the page's own scripts and inside third-party iframes.`,
      );
      break;
    }
  }
  if (contentScripts.some((script) => script.world === "MAIN" && script.matches.some(isBroad))) {
    add(
      "critical",
      "Content script runs in the page's own JavaScript world",
      "world:\"MAIN\" removes the isolated world boundary, so the injected code shares globals with the page and can hook fetch, XMLHttpRequest or form handlers directly.",
    );
  }
  if (
    has("activeTab") &&
    broadHosts.length === 0 &&
    hostPermissions.length === 0 &&
    contentScripts.length === 0
  ) {
    add(
      "low",
      "activeTab only — this is the good pattern",
      "Access is limited to the tab you are on, only after you click the extension, and it lapses on navigation. There is no standing access to any site.",
    );
  }
  if (has("activeTab") && broadHosts.length > 0) {
    add(
      "moderate",
      "activeTab is redundant here",
      "activeTab suggests click-to-grant access, but a broad host permission is already granted permanently, so the narrow permission changes nothing.",
    );
  }
  if (typeof manifest.update_url === "string" && !/clients2\.google\.com|addons\.mozilla\.org/.test(manifest.update_url)) {
    add(
      "high",
      "Self-hosted updates",
      `update_url points at ${manifest.update_url}, not a browser store. Whoever controls that endpoint decides what code lands in the browser on the next update, without store review.`,
    );
  }

  const allGranted = [...apiPermissions];
  const tierCounts = countTiers(allGranted);
  const optionalTierCounts = countTiers(optionalApiPermissions);

  let overallLevel = "low";
  for (const entry of allGranted) {
    if (tierRank[entry.tier] > tierRank[overallLevel]) overallLevel = entry.tier;
  }
  for (const item of combinations) {
    if (tierRank[item.level] > tierRank[overallLevel]) overallLevel = item.level;
  }
  if (broadHosts.length > 0 && tierRank[overallLevel] < tierRank.high) overallLevel = "high";

  const unknownPermissions = allGranted.filter((item) => !item.known).map((item) => item.name);

  return {
    name: typeof manifest.name === "string" ? manifest.name : null,
    version: typeof manifest.version === "string" ? manifest.version : null,
    description: typeof manifest.description === "string" ? manifest.description : null,
    manifestVersion,
    apiPermissions,
    optionalApiPermissions,
    hostPermissions,
    optionalHostPermissions,
    contentScripts,
    contentScriptHosts,
    broadHostCount: broadHosts.length,
    broadestHost,
    invalidHosts,
    background,
    webAccessibleResources: warEntries,
    externallyConnectable,
    csp,
    combinations,
    tierCounts,
    optionalTierCounts,
    unknownPermissions,
    overallLevel,
    overallLabel: TIER_LABELS[overallLevel],
    notes,
    totals: {
      apiPermissions: apiPermissions.length,
      optionalApiPermissions: optionalApiPermissions.length,
      hostPermissions: hostPermissions.length,
      optionalHostPermissions: optionalHostPermissions.length,
      contentScripts: contentScripts.length,
      combinations: combinations.length,
    },
  };
}

/**
 * Render an analysis as plain text, for pasting into a review ticket.
 * Deterministic: derived entirely from the analysis object.
 */
export function formatReport(result) {
  if (!result || result.error) return "";
  const lines = [];
  lines.push(`Extension permission review: ${result.name || "(unnamed)"}${result.version ? ` ${result.version}` : ""}`);
  lines.push(`Manifest version: ${result.manifestVersion === null ? "not declared" : result.manifestVersion}`);
  lines.push(`Highest classification: ${result.overallLabel}`);
  lines.push("");

  if (result.combinations.length > 0) {
    lines.push("Combinations that matter:");
    for (const item of result.combinations) {
      lines.push(`  [${TIER_LABELS[item.level]}] ${item.title}`);
      lines.push(`      ${item.detail}`);
    }
    lines.push("");
  }

  if (result.apiPermissions.length > 0) {
    lines.push("API permissions:");
    for (const item of result.apiPermissions) {
      lines.push(`  [${TIER_LABELS[item.tier]}] ${item.name} — ${item.summary}`);
    }
    lines.push("");
  }

  if (result.optionalApiPermissions.length > 0) {
    lines.push("Optional API permissions (requested after install):");
    for (const item of result.optionalApiPermissions) {
      lines.push(`  [${TIER_LABELS[item.tier]}] ${item.name}`);
    }
    lines.push("");
  }

  if (result.hostPermissions.length > 0) {
    lines.push("Host permissions:");
    for (const item of result.hostPermissions) {
      lines.push(`  ${item.pattern} — ${item.valid ? item.label : `invalid: ${item.error}`}`);
    }
    lines.push("");
  }

  if (result.contentScripts.length > 0) {
    lines.push("Content scripts:");
    for (const script of result.contentScripts) {
      lines.push(
        `  #${script.index + 1} run_at=${script.runAt} all_frames=${script.allFrames} world=${script.world} matches=${script.matches.map((m) => m.pattern).join(" ") || "(none)"}`,
      );
    }
    lines.push("");
  }

  for (const note of result.notes) lines.push(`Note: ${note}`);

  return lines.join("\n").trim();
}
