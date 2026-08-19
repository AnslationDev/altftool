/**
 * Mobile deep-link safety inspector.
 *
 * Takes one link and works out what it actually asks a phone to do:
 *
 *  - Android `intent://` URIs are parsed in the format Intent.parseUri produces
 *    for URI_INTENT_SCHEME: the target scheme, action, categories, package,
 *    component, selector, typed extras (S. B. i. l. d. f. b. c. s.) and the
 *    launchFlags bitmask, which is decoded bit by bit against the real
 *    android.content.Intent constants.
 *  - S.browser_fallback_url is followed: it is percent-decoded, and any
 *    redirect parameter inside it is decoded again, layer by layer, until the
 *    final destination is visible.
 *  - Custom schemes are reported for what they are — a first-come claim that
 *    any installed app can register, which is why RFC 8252 requires PKCE for
 *    an authorization code delivered this way.
 *  - https links are checked as Android App Links / iOS Universal Links, with
 *    the two .well-known files that have to exist on the host named exactly.
 *  - The authority is examined for the userinfo trick (everything before the
 *    last @ is not the host), for backslashes, for raw non-ASCII, and for
 *    credentials or tokens carried in the query.
 *
 * Pure functions. No network, no DOM, no clock, no randomness.
 */

/* ------------------------------------------------------------------ */
/* URI parsing                                                         */
/* ------------------------------------------------------------------ */

/** decodeURIComponent that returns the input instead of throwing. */
export function percentDecode(value) {
  const text = String(value == null ? "" : value);
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}

/** Query-string decoding: "+" means space in application/x-www-form-urlencoded. */
export function formDecode(value) {
  return percentDecode(String(value == null ? "" : value).replace(/\+/g, " "));
}

/**
 * Peel percent-encoding until nothing changes. Double and triple encoding is
 * the usual way an open redirect gets past a filter that only decodes once.
 */
export function fullyDecode(value, maxLayers) {
  const limit = Number.isInteger(maxLayers) && maxLayers > 0 ? maxLayers : 6;
  let current = String(value == null ? "" : value);
  let layers = 0;
  for (let i = 0; i < limit; i += 1) {
    if (!/%[0-9a-fA-F]{2}/.test(current)) break;
    const next = percentDecode(current);
    if (next === current) break;
    current = next;
    layers += 1;
  }
  return { value: current, layers };
}

const SCHEME_RE = /^([A-Za-z][A-Za-z0-9+.-]*):([\s\S]*)$/;

/**
 * WHATWG "special" schemes. Per the URL Standard (and every real browser),
 * these ALWAYS get authority/host parsing, no matter how many (including
 * zero) leading "/" or "\" characters follow the scheme colon — all of
 * "https:evil.example", "https:/evil.example", "https:\evil.example" etc.
 * resolve to host "evil.example". Custom app schemes (myapp:, intent:, ...)
 * are not "special" and keep the strict exact-"//" authority check below.
 */
const SPECIAL_SCHEMES = new Set(["http", "https", "ws", "wss", "ftp", "file"]);

/**
 * Split a URI without using the WHATWG URL parser, which rejects or rewrites
 * the very shapes worth inspecting (intent://, bare custom schemes, backslashes
 * in the authority).
 */
export function parseUri(input) {
  const text = String(input == null ? "" : input).trim();
  if (!text) return null;
  const match = SCHEME_RE.exec(text);
  if (!match) return null;

  const scheme = match[1].toLowerCase();
  let rest = match[2];

  let fragment = "";
  const hash = rest.indexOf("#");
  if (hash !== -1) {
    fragment = rest.slice(hash + 1);
    rest = rest.slice(0, hash);
  }

  let query = "";
  const questionMark = rest.indexOf("?");
  if (questionMark !== -1) {
    query = rest.slice(questionMark + 1);
    rest = rest.slice(0, questionMark);
  }

  let authority = "";
  let path = rest;
  let hasAuthority = false;
  if (SPECIAL_SCHEMES.has(scheme)) {
    // Special scheme: consume ALL leading "/" and "\" (any count, any mix,
    // including zero) before parsing the authority — matches real browsers.
    hasAuthority = true;
    let i = 0;
    while (i < rest.length && (rest[i] === "/" || rest[i] === "\\")) i += 1;
    const after = rest.slice(i);
    const slash = after.search(/[/\\]/);
    authority = slash === -1 ? after : after.slice(0, slash);
    path = slash === -1 ? "" : after.slice(slash);
  } else if (/^\/\//.test(rest) || /^\\\\/.test(rest)) {
    hasAuthority = true;
    const after = rest.slice(2);
    const slash = after.search(/[/\\]/);
    authority = slash === -1 ? after : after.slice(0, slash);
    path = slash === -1 ? "" : after.slice(slash);
  }

  // The host is what follows the LAST "@" — everything before it is userinfo,
  // which is where "https://bank.example@evil.example" gets its deception from.
  const at = authority.lastIndexOf("@");
  const userinfo = at === -1 ? "" : authority.slice(0, at);
  let hostport = at === -1 ? authority : authority.slice(at + 1);

  let port = "";
  if (hostport.startsWith("[")) {
    const close = hostport.indexOf("]");
    if (close !== -1 && hostport[close + 1] === ":") {
      port = hostport.slice(close + 2);
      hostport = hostport.slice(0, close + 1);
    }
  } else {
    const colon = hostport.lastIndexOf(":");
    if (colon !== -1 && /^\d*$/.test(hostport.slice(colon + 1))) {
      port = hostport.slice(colon + 1);
      hostport = hostport.slice(0, colon);
    }
  }

  return {
    raw: text,
    scheme,
    hasAuthority,
    authority,
    userinfo,
    host: hostport,
    hostLower: hostport.toLowerCase(),
    port,
    path,
    query,
    fragment,
    params: parseQuery(query),
  };
}

/** Split a query string into ordered name/value pairs, decoded. */
export function parseQuery(query) {
  const text = String(query == null ? "" : query);
  if (!text) return [];
  return text
    .split("&")
    .filter((pair) => pair !== "")
    .map((pair) => {
      const eq = pair.indexOf("=");
      const rawKey = eq === -1 ? pair : pair.slice(0, eq);
      const rawValue = eq === -1 ? "" : pair.slice(eq + 1);
      return {
        key: formDecode(rawKey),
        rawKey,
        value: formDecode(rawValue),
        rawValue,
      };
    });
}

/* ------------------------------------------------------------------ */
/* Android intent:// URIs                                              */
/* ------------------------------------------------------------------ */

/** Typed extra prefixes used by Intent.toUri / Intent.parseUri. */
export const EXTRA_TYPES = {
  "S.": "String",
  "B.": "boolean",
  "b.": "byte",
  "c.": "char",
  "d.": "double",
  "f.": "float",
  "i.": "int",
  "l.": "long",
  "s.": "short",
};

/**
 * android.content.Intent flag constants. Only bits that are documented in the
 * platform are named; anything else is reported as an unknown bit rather than
 * guessed at.
 */
export const INTENT_FLAGS = [
  [0x00000001, "FLAG_GRANT_READ_URI_PERMISSION", "high", "Hands the receiving app read access to the content: URIs carried in this intent — using the sending app's permissions."],
  [0x00000002, "FLAG_GRANT_WRITE_URI_PERMISSION", "high", "Hands the receiving app write access to the content: URIs carried in this intent."],
  [0x00000004, "FLAG_FROM_BACKGROUND", "low", "Marks the intent as sent without a user gesture."],
  [0x00000008, "FLAG_DEBUG_LOG_RESOLUTION", "low", "Asks the system to log how the intent resolved."],
  [0x00000010, "FLAG_EXCLUDE_STOPPED_PACKAGES", "low", "Skips apps that have been force-stopped."],
  [0x00000020, "FLAG_INCLUDE_STOPPED_PACKAGES", "medium", "Includes force-stopped apps, which can restart an app the user deliberately stopped."],
  [0x00000040, "FLAG_GRANT_PERSISTABLE_URI_PERMISSION", "high", "Makes the granted URI permission survive a reboot."],
  [0x00000080, "FLAG_GRANT_PREFIX_URI_PERMISSION", "high", "Grants access to every URI under the given path prefix, not just the exact URI."],
  [0x00000200, "FLAG_ACTIVITY_REQUIRE_DEFAULT", "low", "Only launch if a default handler is already set."],
  [0x00000400, "FLAG_ACTIVITY_REQUIRE_NON_BROWSER", "low", "Only launch if a non-browser app handles it."],
  [0x00000800, "FLAG_ACTIVITY_MATCH_EXTERNAL", "low", "Allows matching an instant app."],
  [0x00001000, "FLAG_ACTIVITY_LAUNCH_ADJACENT", "low", "Requests split-screen placement."],
  [0x00002000, "FLAG_ACTIVITY_RETAIN_IN_RECENTS", "low", "Keeps the task in Recents after it finishes."],
  [0x00004000, "FLAG_ACTIVITY_TASK_ON_HOME", "low", "Places the new task above Home in the back stack."],
  [0x00008000, "FLAG_ACTIVITY_CLEAR_TASK", "medium", "Clears the target app's existing task before launching — the user loses whatever state they had."],
  [0x00010000, "FLAG_ACTIVITY_NO_ANIMATION", "low", "Suppresses the launch animation, so the transition is not visible."],
  [0x00020000, "FLAG_ACTIVITY_REORDER_TO_FRONT", "low", "Brings an existing instance forward instead of starting a new one."],
  [0x00040000, "FLAG_ACTIVITY_NO_USER_ACTION", "medium", "Tells the previous activity this was not a user action, suppressing onUserLeaveHint."],
  [0x00080000, "FLAG_ACTIVITY_NEW_DOCUMENT", "low", "Opens the activity as a separate document in Recents (formerly CLEAR_WHEN_TASK_RESET)."],
  [0x00100000, "FLAG_ACTIVITY_LAUNCHED_FROM_HISTORY", "low", "Set by the system when a task is resumed from Recents."],
  [0x00200000, "FLAG_ACTIVITY_RESET_TASK_IF_NEEDED", "low", "Applies the task's reset rules on launch."],
  [0x00400000, "FLAG_ACTIVITY_BROUGHT_TO_FRONT", "low", "Set by the system when an existing task is brought forward."],
  [0x00800000, "FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS", "medium", "Keeps the launched screen out of Recents, so the user has no trace of what opened."],
  [0x01000000, "FLAG_ACTIVITY_PREVIOUS_IS_TOP", "low", "Treats the previous activity as the top for launch-mode purposes."],
  [0x02000000, "FLAG_ACTIVITY_FORWARD_RESULT", "medium", "Forwards the original caller's result target to the new activity — the mechanism behind several intent-redirection escalations."],
  [0x04000000, "FLAG_ACTIVITY_CLEAR_TOP", "low", "Clears activities above the target in the same task."],
  [0x08000000, "FLAG_ACTIVITY_MULTIPLE_TASK", "low", "Always creates a new task rather than reusing one."],
  [0x10000000, "FLAG_ACTIVITY_NEW_TASK", "low", "Starts the activity in a new task. Required when launching from a non-activity context."],
  [0x20000000, "FLAG_ACTIVITY_SINGLE_TOP", "low", "Reuses the activity if it is already on top."],
  [0x40000000, "FLAG_ACTIVITY_NO_HISTORY", "medium", "The launched screen is dropped from the back stack as soon as the user leaves it, so pressing Back never returns to it."],
];

/**
 * Decode a launchFlags value. Accepts the hexadecimal form Intent.toUri writes
 * ("0x10000000") as well as a plain decimal integer.
 */
export function decodeLaunchFlags(raw) {
  const text = String(raw == null ? "" : raw).trim();
  if (!text) return null;
  const isHex = /^0x[0-9a-fA-F]+$/.test(text);
  if (!isHex && !/^\d+$/.test(text)) {
    return { raw: text, error: "launchFlags is neither a 0x hexadecimal nor a decimal integer." };
  }
  const value = isHex ? parseInt(text.slice(2), 16) : parseInt(text, 10);
  if (!Number.isFinite(value) || value < 0 || value > 0xffffffff) {
    return { raw: text, error: "launchFlags is outside the 32-bit range Android uses." };
  }

  const matched = [];
  let covered = 0;
  for (const [bit, name, risk, note] of INTENT_FLAGS) {
    if ((value & bit) === bit) {
      matched.push({ bit, hex: `0x${bit.toString(16).toUpperCase().padStart(8, "0")}`, name, risk, note });
      covered += bit;
    }
  }
  const unknown = value & ~covered;

  return {
    raw: text,
    value,
    hex: `0x${value.toString(16).toUpperCase().padStart(8, "0")}`,
    flags: matched,
    unknownBits: unknown ? `0x${(unknown >>> 0).toString(16).toUpperCase().padStart(8, "0")}` : "",
    error: "",
  };
}

/**
 * Parse an `intent://` URI. The fragment after "#Intent" is a list of
 * semicolon-separated fields terminated by "end".
 */
export function parseIntentUri(input) {
  const uri = parseUri(input);
  if (!uri || uri.scheme !== "intent") return null;

  const fragment = uri.fragment;
  const body = /^Intent;/i.test(fragment) ? fragment.slice("Intent;".length) : fragment;
  const fields = body.split(";");

  const result = {
    dataHost: uri.host,
    dataPath: uri.path,
    dataQuery: uri.query,
    dataParams: uri.params,
    userinfo: uri.userinfo,
    scheme: "",
    action: "",
    categories: [],
    package: "",
    component: "",
    selector: "",
    launchFlags: null,
    extras: [],
    fallbackUrl: "",
    fallbackRaw: "",
    unknownFields: [],
    terminated: false,
    wellFormedFragment: /^Intent;/i.test(fragment),
  };

  for (const field of fields) {
    const trimmed = field.trim();
    if (!trimmed) continue;
    if (trimmed.toLowerCase() === "end") {
      result.terminated = true;
      continue;
    }
    const eq = trimmed.indexOf("=");
    if (eq === -1) {
      result.unknownFields.push(trimmed);
      continue;
    }
    const key = trimmed.slice(0, eq);
    const rawValue = trimmed.slice(eq + 1);
    const value = percentDecode(rawValue);

    switch (key) {
      case "scheme":
        result.scheme = value.toLowerCase();
        break;
      case "action":
        result.action = value;
        break;
      case "category":
        result.categories.push(value);
        break;
      case "package":
        result.package = value;
        break;
      case "component":
        result.component = value;
        break;
      case "SEL":
        result.selector = value;
        break;
      case "launchFlags":
        result.launchFlags = decodeLaunchFlags(value);
        break;
      default: {
        const prefix = key.slice(0, 2);
        if (EXTRA_TYPES[prefix]) {
          const name = key.slice(2);
          result.extras.push({ name, type: EXTRA_TYPES[prefix], prefix, value, rawValue });
          if (name === "browser_fallback_url") {
            result.fallbackUrl = value;
            result.fallbackRaw = rawValue;
          }
        } else {
          result.unknownFields.push(trimmed);
        }
      }
    }
  }

  // What the intent resolves to once Android rebuilds the data URI.
  const targetPath = `${result.dataHost ? `//${result.dataHost}` : ""}${result.dataPath}${result.dataQuery ? `?${result.dataQuery}` : ""}`;
  result.targetUri = result.scheme ? `${result.scheme}:${targetPath}` : `intent:${targetPath}`;
  return result;
}

/* ------------------------------------------------------------------ */
/* Risk vocabulary                                                     */
/* ------------------------------------------------------------------ */

/** Schemes that must never appear as a redirect or fallback destination. */
export const DANGEROUS_SCHEMES = {
  javascript: "Executes script in whatever page performs the redirect. A javascript: fallback turns an open redirect into stored XSS.",
  data: "Renders attacker-controlled content, often a full HTML document, from the URL itself.",
  vbscript: "Legacy script execution.",
  file: "Reads from the device filesystem.",
  content: "Reads from an Android content provider — the target of most intent-redirection privilege escalations.",
  blob: "References an in-page object the redirecting origin controls.",
  intent: "A nested intent. Chaining intents is how a fallback escapes the restrictions the first one was subject to.",
  jar: "Legacy archive URL, historically a code-execution vector.",
};

/** Actions worth calling out when they arrive from an untrusted link. */
export const NOTABLE_ACTIONS = {
  "android.intent.action.VIEW": ["low", "The ordinary action for opening content. Expected in a deep link."],
  "android.intent.action.MAIN": ["low", "Launches an app's entry point."],
  "android.intent.action.DIAL": ["medium", "Opens the dialler with a number pre-filled. The user still has to press call."],
  "android.intent.action.CALL": ["high", "Places a call directly, with no confirmation screen. A web link should never ask for this."],
  "android.intent.action.SEND": ["medium", "Opens a share sheet with content the link chose."],
  "android.intent.action.SENDTO": ["medium", "Composes a message to a recipient the link chose."],
  "android.intent.action.INSTALL_PACKAGE": ["high", "Starts installing an application package."],
  "android.intent.action.UNINSTALL_PACKAGE": ["high", "Starts removing an installed application."],
  "android.intent.action.DELETE": ["high", "Asks to delete the data the intent points at."],
  "android.intent.action.CALL_PRIVILEGED": ["high", "A system-only calling action; a link asking for it is probing for a vulnerable handler."],
  "android.settings.APPLICATION_DETAILS_SETTINGS": ["medium", "Opens a system settings page, commonly used to walk a user into granting a permission."],
};

/** Query names that usually carry another URL. */
export const REDIRECT_PARAMS = [
  "url", "u", "uri", "link", "redirect", "redirect_uri", "redirect_url", "redirecturl",
  "return", "returnto", "return_to", "returnurl", "return_url", "next", "continue",
  "dest", "destination", "target", "goto", "forward", "callback", "callback_url",
  "out", "to", "r", "deeplink", "deep_link", "fallback", "fallback_url",
  "browser_fallback_url", "afterlogin", "service",
];

/** Query names that usually carry something that should not be in a URL. */
export const SENSITIVE_PARAMS = {
  access_token: "A bearer token in a URL is logged by every proxy, browser history and Referer header it passes through.",
  id_token: "An OpenID Connect identity token, which is a signed assertion about the user.",
  refresh_token: "A refresh token is long-lived; leaking one is worse than leaking a session.",
  token: "A credential of some kind travelling in the clear.",
  auth: "An authentication value in the query string.",
  authorization: "An authorization header value moved into a URL.",
  api_key: "An API key in a URL ends up in server logs and analytics.",
  apikey: "An API key in a URL ends up in server logs and analytics.",
  secret: "A value named secret should not be in a link at all.",
  password: "A password in a URL is stored in history on the device.",
  passwd: "A password in a URL is stored in history on the device.",
  pwd: "A password in a URL is stored in history on the device.",
  otp: "A one-time code in a link can be replayed by anything that sees the link.",
  session: "A session identifier in a URL enables session fixation.",
  sessionid: "A session identifier in a URL enables session fixation.",
  sid: "A session identifier in a URL enables session fixation.",
  jwt: "A signed token travelling in the clear.",
  signature: "A request signature that can be replayed if it is not bound to a nonce.",
};

/* ------------------------------------------------------------------ */
/* Host checks                                                         */
/* ------------------------------------------------------------------ */

const IPV4_RE = /^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

/** Registrable-ish domain: the last two labels, which is enough to compare origins. */
export function baseDomain(host) {
  const clean = String(host == null ? "" : host).toLowerCase().replace(/\.$/, "");
  if (!clean || IPV4_RE.test(clean)) return clean;
  const parts = clean.split(".").filter(Boolean);
  return parts.length <= 2 ? parts.join(".") : parts.slice(-2).join(".");
}

/** Everything worth saying about an authority component. */
export function analyzeAuthority(uri) {
  if (!uri) return null;
  const host = uri.host;
  const nonAscii = /[^\x00-\x7f]/.test(host);
  return {
    authority: uri.authority,
    userinfo: uri.userinfo,
    host,
    port: uri.port,
    hasUserinfo: Boolean(uri.userinfo),
    hasBackslash: uri.authority.indexOf("\\") !== -1 || uri.path.indexOf("\\") !== -1,
    nonAscii,
    isPunycode: /(^|\.)xn--/i.test(host),
    isIpLiteral: IPV4_RE.test(host) || host.startsWith("["),
    hasNullByte: /%00/i.test(uri.raw),
    baseDomain: baseDomain(host),
  };
}

/* ------------------------------------------------------------------ */
/* Redirect chain                                                      */
/* ------------------------------------------------------------------ */

function looksLikeUrl(value) {
  return /^[A-Za-z][A-Za-z0-9+.-]*:/.test(value) || value.startsWith("//");
}

/**
 * An Android package name is conventionally the reverse of a domain the
 * publisher owns, so com.acme.shop suggests acme.com. Convention only — nothing
 * enforces it — but it is the one origin signal an intent link carries.
 */
export function packageToDomain(packageName) {
  const parts = String(packageName == null ? "" : packageName)
    .toLowerCase()
    .split(".")
    .filter(Boolean);
  if (parts.length < 2) return "";
  return `${parts[1]}.${parts[0]}`;
}

/**
 * Walk a URL's query for parameters that hold another URL, decoding each one
 * until it stops changing, and recursing into what it finds.
 */
export function traceRedirects(uri, depth) {
  const level = Number.isInteger(depth) ? depth : 0;
  if (!uri || level > 3) return [];
  const hops = [];
  for (const param of uri.params) {
    const name = param.key.toLowerCase();
    const decoded = fullyDecode(param.rawValue);
    const isNamedRedirect = REDIRECT_PARAMS.includes(name);
    const absolute = looksLikeUrl(decoded.value);
    if (!isNamedRedirect && !absolute) continue;

    if (!absolute) {
      hops.push({
        level,
        param: param.key,
        raw: param.rawValue,
        decoded: decoded.value,
        encodingLayers: decoded.layers,
        scheme: "",
        host: "",
        baseDomain: "",
        sameSite: true,
        relative: true,
        dangerousScheme: "",
        namedRedirect: true,
      });
      continue;
    }

    const target = parseUri(decoded.value.startsWith("//") ? `https:${decoded.value}` : decoded.value);
    hops.push({
      level,
      param: param.key,
      raw: param.rawValue,
      decoded: decoded.value,
      encodingLayers: decoded.layers,
      scheme: target ? target.scheme : "",
      host: target ? target.hostLower : "",
      baseDomain: target ? baseDomain(target.host) : "",
      sameSite: target ? baseDomain(target.host) === baseDomain(uri.host) : false,
      relative: false,
      protocolRelative: decoded.value.startsWith("//"),
      dangerousScheme: target && DANGEROUS_SCHEMES[target.scheme] ? DANGEROUS_SCHEMES[target.scheme] : "",
      namedRedirect: isNamedRedirect,
    });
    if (target) hops.push(...traceRedirects(target, level + 1));
  }
  return hops;
}

/* ------------------------------------------------------------------ */
/* Inspection                                                          */
/* ------------------------------------------------------------------ */

function finding(level, title, detail) {
  return { level, title, detail };
}

const LINK_TYPES = {
  intent: "Android intent:// URI",
  applink: "https link — Android App Link / iOS Universal Link candidate",
  http: "Plain http link",
  custom: "Private-use (custom) scheme",
};

/**
 * Inspect one deep link.
 *
 * @param {string} input the link
 * @returns {object} { error } or the report
 */
export function inspectDeepLink(input) {
  const text = String(input == null ? "" : input).trim();
  if (!text) return { error: "Paste a deep link to inspect." };
  if (/\s/.test(text)) {
    return { error: "That contains whitespace. Paste a single link with no spaces or line breaks." };
  }

  const uri = parseUri(text);
  if (!uri) {
    return {
      error:
        "No URI scheme found. A deep link starts with a scheme and a colon — intent://, myapp://, or https://.",
    };
  }

  const findings = [];
  const intent = uri.scheme === "intent" ? parseIntentUri(text) : null;
  const isHttps = uri.scheme === "https";
  const isHttp = uri.scheme === "http";
  const type = intent ? "intent" : isHttps ? "applink" : isHttp ? "http" : "custom";

  /* -- the effective target once the intent (if any) is unwrapped -- */
  const effectiveUri = intent ? parseUri(intent.targetUri) || uri : uri;
  const authority = analyzeAuthority(effectiveUri);

  /* -- authority tricks -- */
  if (authority.hasUserinfo) {
    findings.push(
      finding(
        "high",
        "Credentials section hides the real host",
        `Everything before the last "@" is userinfo, not a host. This link goes to ${authority.host || "(no host)"}, not to ${authority.userinfo}. It is the oldest trick in phishing and it still renders convincingly in a link preview.`,
      ),
    );
  }
  if (authority.hasBackslash) {
    findings.push(
      finding(
        "high",
        "Backslash in the authority or path",
        "Browsers normalise a backslash to a forward slash while many server-side URL parsers do not, so the two disagree about where the host ends. That disagreement is how host-confusion bypasses are built.",
      ),
    );
  }
  if (authority.hasNullByte) {
    findings.push(
      finding("high", "Encoded null byte in the link", "A %00 truncates the string for some parsers and not for others, so validation and execution can see two different URLs."),
    );
  }
  if (authority.nonAscii) {
    findings.push(
      finding("medium", "Non-ASCII characters in the host", "The host has to be converted to Punycode before it is resolved. Check what it converts to — look-alike letters from another script render identically to Latin ones."),
    );
  } else if (authority.isPunycode) {
    findings.push(
      finding("medium", "Punycode host label", `A label of ${authority.host} starts with xn--, so it renders as non-Latin characters rather than as the letters shown here.`),
    );
  }
  if (authority.isIpLiteral) {
    findings.push(
      finding("medium", "Raw IP address instead of a hostname", "There is no certificate name to check and no domain to recognise. Legitimate apps almost never deep-link to a bare IP."),
    );
  }

  /* -- intent specifics -- */
  if (intent) {
    if (!intent.wellFormedFragment) {
      findings.push(
        finding("medium", "Fragment does not begin with \"Intent;\"", "Intent.parseUri expects the extras block to start with Intent; — without it the fragment is treated as ordinary URI data and nothing here is applied."),
      );
    }
    if (!intent.terminated) {
      findings.push(
        finding("low", "Fragment is not terminated with \"end\"", "Intent.toUri always writes a trailing end. Its absence usually means the link was assembled by hand."),
      );
    }
    if (!intent.scheme) {
      findings.push(
        finding("medium", "No scheme= in the intent", "Without scheme= there is no data URI for the intent to carry, so only the action, package and extras decide what opens."),
      );
    }
    if (!intent.categories.some((item) => item === "android.intent.category.BROWSABLE")) {
      findings.push(
        finding("low", "No BROWSABLE category declared", "Chrome adds android.intent.category.BROWSABLE itself before firing an intent from a web page, so this only matters for an app that parses the URI with Intent.parseUri on its own."),
      );
    }
    if (intent.component) {
      findings.push(
        finding(
          "high",
          `Explicit component: ${intent.component}`,
          "A component names one exact class instead of letting the system resolve the intent, which is how a link reaches an activity that was never meant to be launched from outside. Chrome clears the component before launching an intent from a web page; an app that calls Intent.parseUri itself and does not clear it is the vulnerable case.",
        ),
      );
    }
    if (intent.selector) {
      findings.push(
        finding("high", "Selector (SEL) present", "A selector overrides how the intent resolves. Chrome clears it for web-originated intents; anything parsing the URI directly must do the same."),
      );
    }
    if (intent.package) {
      findings.push(
        finding("low", `Restricted to package ${intent.package}`, "Naming a package narrows the intent to one app, which is the safer form. Verify the package is the one you expect rather than a look-alike."),
      );
    } else {
      findings.push(
        finding("medium", "No package= restriction", "Any installed app that declares a matching intent filter can handle this. On a device with a malicious app installed, that app receives whatever the extras carry."),
      );
    }
    if (intent.action && NOTABLE_ACTIONS[intent.action]) {
      const [risk, note] = NOTABLE_ACTIONS[intent.action];
      if (risk !== "low") findings.push(finding(risk, `Action ${intent.action}`, note));
    } else if (intent.action) {
      findings.push(
        finding("medium", `Non-standard action ${intent.action}`, "This is not one of the common platform actions, so it targets a specific app's own intent filter. Whatever that filter does is what this link does."),
      );
    }
    if (intent.launchFlags && intent.launchFlags.error) {
      findings.push(finding("medium", "launchFlags could not be decoded", intent.launchFlags.error));
    }
    if (intent.launchFlags && !intent.launchFlags.error) {
      for (const flag of intent.launchFlags.flags) {
        if (flag.risk === "high" || flag.risk === "medium") {
          findings.push(finding(flag.risk, `${flag.name} (${flag.hex})`, flag.note));
        }
      }
      if (intent.launchFlags.unknownBits) {
        findings.push(
          finding("low", `Unrecognised launchFlags bits ${intent.launchFlags.unknownBits}`, "These bits are set but do not correspond to a documented Intent flag on this list."),
        );
      }
    }
    for (const extra of intent.extras) {
      const lower = extra.name.toLowerCase();
      if (SENSITIVE_PARAMS[lower]) {
        findings.push(
          finding("high", `Extra ${extra.prefix}${extra.name} carries a credential`, `${SENSITIVE_PARAMS[lower]} Whichever app resolves this intent receives it verbatim.`),
        );
      }
    }
  }

  /* -- fallback URL -- */
  let fallback = null;
  if (intent && intent.fallbackUrl) {
    // parseIntentUri already decoded the extra once, which is the single layer
    // Intent.toUri applies. Decoding further here would flatten the fallback's
    // own query and hide a nested redirect rather than reveal it.
    const parsedFallback = parseUri(intent.fallbackUrl);
    fallback = {
      raw: intent.fallbackRaw,
      decoded: intent.fallbackUrl,
      encodingLayers: fullyDecode(intent.fallbackRaw).layers,
      scheme: parsedFallback ? parsedFallback.scheme : "",
      host: parsedFallback ? parsedFallback.hostLower : "",
      baseDomain: parsedFallback ? baseDomain(parsedFallback.host) : "",
      hops: parsedFallback ? traceRedirects(parsedFallback, 1) : [],
      parsed: parsedFallback,
    };
    if (parsedFallback && DANGEROUS_SCHEMES[parsedFallback.scheme]) {
      findings.push(
        finding("high", `Fallback URL uses the ${parsedFallback.scheme}: scheme`, `${DANGEROUS_SCHEMES[parsedFallback.scheme]} Chrome navigates to browser_fallback_url whenever no app handles the intent, so this is not a rare path — it is the path taken on every device without the app installed.`),
      );
    } else if (parsedFallback && parsedFallback.scheme !== "https") {
      findings.push(
        finding("medium", `Fallback URL is ${parsedFallback.scheme}:, not https:`, "Every device without the target app installed follows this URL. It should be an https page on a host you control."),
      );
    }
    const publisherDomain = packageToDomain(intent.package);
    if (parsedFallback && parsedFallback.host && publisherDomain) {
      if (baseDomain(parsedFallback.host) !== publisherDomain) {
        findings.push(
          finding(
            "medium",
            "Fallback host does not match the package's own domain",
            `The package ${intent.package} is reverse-DNS for ${publisherDomain}, but the fallback goes to ${parsedFallback.hostLower}. Package names are only conventionally reverse-DNS, so this is a prompt to check rather than proof — but the fallback is the page every user without the app will actually see.`,
          ),
        );
      }
    } else if (parsedFallback && parsedFallback.host && !intent.package) {
      findings.push(
        finding(
          "low",
          `Fallback host is ${parsedFallback.hostLower}`,
          "With no package= to compare against, there is nothing in the link that ties this host to the app it claims to open. Confirm it by hand.",
        ),
      );
    }
  } else if (intent) {
    findings.push(
      finding("low", "No browser_fallback_url", "On a device without the target app, Chrome shows an error instead of a page. That is safe, if unhelpful."),
    );
  }

  /* -- redirect chain on the link itself -- */
  const hops = traceRedirects(effectiveUri, 0);
  const allHops = fallback ? [...hops, ...fallback.hops] : hops;
  for (const hop of allHops) {
    if (hop.dangerousScheme) {
      findings.push(
        finding("high", `Redirect parameter ${hop.param} targets ${hop.scheme}:`, hop.dangerousScheme),
      );
      continue;
    }
    if (hop.encodingLayers > 1) {
      findings.push(
        finding("high", `${hop.param} is percent-encoded ${hop.encodingLayers} times`, `It decodes to ${hop.decoded}. Multiple encoding layers exist to get a value past a filter that only decodes once.`),
      );
      continue;
    }
    if (!hop.sameSite && hop.host) {
      findings.push(
        finding("medium", `${hop.param} redirects off-site to ${hop.host}`, `A redirect target taken from the query is an open redirect unless the server checks it against an allow-list. It decodes to ${hop.decoded}.`),
      );
    }
  }

  /* -- credentials in the query -- */
  const sensitive = [];
  const scanParams = (params, where) => {
    for (const param of params || []) {
      const lower = param.key.toLowerCase();
      if (SENSITIVE_PARAMS[lower]) sensitive.push({ where, key: param.key, why: SENSITIVE_PARAMS[lower] });
    }
  };
  scanParams(effectiveUri.params, "query");
  scanParams(parseQuery(effectiveUri.fragment), "fragment");
  if (fallback && fallback.parsed) scanParams(fallback.parsed.params, "fallback query");
  for (const item of sensitive) {
    findings.push(finding("high", `${item.key} in the ${item.where}`, item.why));
  }

  /* -- OAuth over a custom scheme -- */
  const paramNames = new Set(effectiveUri.params.map((param) => param.key.toLowerCase()));
  const oauthCode = paramNames.has("code") || paramNames.has("state");
  const hasPkce = paramNames.has("code_challenge") || paramNames.has("code_verifier");
  if (type === "custom" && oauthCode) {
    findings.push(
      finding(
        hasPkce ? "medium" : "high",
        hasPkce ? "OAuth redirect over a custom scheme, with PKCE" : "OAuth authorization code over a custom scheme, no PKCE parameter",
        hasPkce
          ? "RFC 8252 allows a private-use scheme for a native app redirect provided PKCE protects the code. A code_challenge or code_verifier is present here."
          : "Any app on the device can register the same scheme and receive this redirect. RFC 8252 section 8.1 requires PKCE for exactly this reason, and no code_challenge or code_verifier appears in the link.",
      ),
    );
  }

  /* -- scheme-level notes -- */
  if (type === "custom" || (intent && intent.scheme && intent.scheme !== "https" && intent.scheme !== "http")) {
    findings.push(
      finding(
        "medium",
        `Private-use scheme "${intent ? intent.scheme : uri.scheme}:" is not owned by anyone`,
        "A private-use scheme is claimed on a first-come basis: any app can declare the same one in its manifest or Info.plist. Android shows a chooser when two apps claim it; iOS behaviour when two apps declare the same scheme is undefined. Only an https App Link or Universal Link is tied to a domain you have to prove you control.",
      ),
    );
  }
  if (type === "http") {
    findings.push(
      finding("high", "Plain http, not https", "App Links and Universal Links are only verified over https. An http link is neither verified nor confidential."),
    );
  }

  const wellKnown =
    type === "applink" && authority.host
      ? {
          assetLinks: `https://${authority.host}/.well-known/assetlinks.json`,
          appSiteAssociation: `https://${authority.host}/.well-known/apple-app-site-association`,
        }
      : null;
  if (wellKnown) {
    findings.push(
      finding(
        "low",
        "Verification depends on two files on the host",
        `Android checks ${wellKnown.assetLinks} against the app's signing certificate, and iOS checks ${wellKnown.appSiteAssociation}. If either is missing or does not list the app, the link opens in the browser instead. This page cannot fetch them.`,
      ),
    );
  }

  const counts = findings.reduce(
    (acc, item) => ({ ...acc, [item.level]: (acc[item.level] || 0) + 1 }),
    { high: 0, medium: 0, low: 0 },
  );
  const verdict = counts.high > 0 ? "high" : counts.medium > 0 ? "medium" : "low";

  return {
    error: "",
    input: text,
    uri,
    type,
    typeLabel: LINK_TYPES[type] || LINK_TYPES.other,
    intent,
    effective: {
      uri: effectiveUri.raw,
      scheme: effectiveUri.scheme,
      host: effectiveUri.host,
      path: effectiveUri.path,
      params: effectiveUri.params,
      fragment: effectiveUri.fragment,
    },
    authority,
    fallback,
    hops: allHops,
    sensitive,
    wellKnown,
    findings,
    counts,
    verdict,
    limits: [
      "Nothing is fetched. Whether the app is installed, whether the fallback page exists, and whether the .well-known files list the app are all live questions this page does not ask.",
      "An intent is read the way Intent.parseUri would read it. Chrome additionally clears the component and the selector and adds the BROWSABLE category before launching one from a web page, so a component here only bites an app that parses the URI itself.",
      "Registrable domains are compared on the last two labels, which is right for example.com and one label short for a name under a multi-part suffix such as co.uk.",
    ],
  };
}

/** Plain-text report for the copy button. */
export function formatReport(result) {
  if (!result || result.error) return "";
  const lines = ["DEEP-LINK INSPECTION", "", `Link:  ${result.input}`, `Type:  ${result.typeLabel}`, ""];

  if (result.intent) {
    lines.push("INTENT");
    lines.push(`  resolves to    ${result.intent.targetUri}`);
    lines.push(`  action         ${result.intent.action || "(none)"}`);
    lines.push(`  categories     ${result.intent.categories.join(", ") || "(none)"}`);
    lines.push(`  package        ${result.intent.package || "(unrestricted)"}`);
    lines.push(`  component      ${result.intent.component || "(none)"}`);
    if (result.intent.launchFlags && !result.intent.launchFlags.error) {
      lines.push(`  launchFlags    ${result.intent.launchFlags.hex}`);
      for (const flag of result.intent.launchFlags.flags) lines.push(`                 ${flag.hex}  ${flag.name}`);
    }
    for (const extra of result.intent.extras) {
      lines.push(`  extra          ${extra.prefix}${extra.name} (${extra.type}) = ${extra.value}`);
    }
    lines.push("");
  }

  if (result.fallback) {
    lines.push("FALLBACK");
    lines.push(`  ${result.fallback.decoded}`);
    lines.push(`  decoded through ${result.fallback.encodingLayers} encoding layer(s)`);
    lines.push("");
  }

  if (result.hops.length) {
    lines.push("REDIRECT PARAMETERS");
    for (const hop of result.hops) {
      lines.push(`  ${hop.param} -> ${hop.decoded}  (${hop.encodingLayers} layer(s), ${hop.sameSite ? "same site" : "off-site"})`);
    }
    lines.push("");
  }

  lines.push("FINDINGS");
  for (const item of result.findings) {
    lines.push(`  [${item.level}] ${item.title}`);
    lines.push(`      ${item.detail}`);
  }
  lines.push("");
  lines.push("LIMITS");
  for (const note of result.limits) lines.push(`  - ${note}`);
  return lines.join("\n");
}

/**
 * Default sample: a real-shaped Android intent link that restricts the package,
 * carries a bearer token as a String extra, grants read and write URI
 * permission through launchFlags, and falls back to a double-encoded
 * off-site redirect.
 */
export const SAMPLE_LINK =
  "intent://pay/confirm?amount=4999&payee=acme#Intent;scheme=shopapp;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;package=com.acme.shop;S.access_token=eyJhbGciOiJIUzI1NiJ9.abc;i.retry=2;B.silent=true;launchFlags=0x10000003;S.browser_fallback_url=https%3A%2F%2Flogin.acme-support.example%2Fauth%3Fnext%3Dhttps%253A%252F%252Fevil.example%252Fgrab;end";

/** A few more links worth trying, each demonstrating one class of problem. */
export const EXAMPLES = [
  { label: "Android intent with a hostile fallback", value: SAMPLE_LINK },
  {
    label: "Userinfo trick on an https link",
    value: "https://accounts.bank.example@login-bank.example.co/session?next=%2Fdashboard",
  },
  {
    label: "OAuth code over a custom scheme, no PKCE",
    value: "myapp://oauth/callback?code=4/0AY0e-g7&state=xyz123&scope=email%20profile",
  },
  {
    label: "Universal Link on a verified domain",
    value: "https://www.example.com/orders/12345?utm_source=email",
  },
  {
    label: "Intent whose fallback runs script",
    value:
      "intent://open#Intent;scheme=app;S.browser_fallback_url=javascript%3Aalert(document.domain);end",
  },
];
