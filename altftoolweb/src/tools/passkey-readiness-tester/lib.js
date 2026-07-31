/**
 * Passkey Readiness Tester — pure logic.
 *
 * Input is the JSON you pass to navigator.credentials.create() or .get():
 * a PublicKeyCredentialCreationOptions or PublicKeyCredentialRequestOptions object,
 * plus the origin the ceremony runs on and a short fallback-UX checklist.
 *
 * Every finding is a rule from the WebAuthn Level 3 specification or from the
 * discoverable-credential ("passkey") requirements. Nothing is scored, nothing is
 * randomised, nothing is fetched. The same JSON always produces the same findings.
 */

export const CEREMONY_MODES = [
  { key: "auto", label: "Detect from the JSON" },
  { key: "registration", label: "Registration — navigator.credentials.create()" },
  { key: "authentication", label: "Authentication — navigator.credentials.get()" },
];

export const MEDIATION_MODES = [
  { key: "optional", label: "optional — a modal prompt when the user clicks sign in" },
  { key: "conditional", label: "conditional — passkey autofill in the username field" },
  { key: "required", label: "required — always show the account chooser" },
  { key: "silent", label: "silent — no user interaction" },
];

/** Fallback and recovery questions the JSON cannot answer. Each maps to a fixed finding. */
export const FALLBACK_CHECKS = [
  {
    key: "hasFallbackMethod",
    label: "A non-passkey way to sign in is still offered",
    pass: "There is another route in, so a user on a borrowed machine or an unsupported browser is not locked out.",
    fail: "A passkey-only sign-in page strands anyone whose authenticator is unavailable — a work laptop with the credential left at home, a browser without WebAuthn, a shared computer. Keep at least one recovery route (emailed link, recovery code, second passkey).",
  },
  {
    key: "handlesNotAllowedError",
    label: "NotAllowedError is handled without a dead end",
    pass: "The cancel and timeout path returns the user to a usable screen.",
    fail: "NotAllowedError is what you get for a cancelled prompt AND for a timeout, with no way to tell them apart. If that path shows a generic failure the user has no idea what to do next — catch it and re-offer both the passkey button and the fallback.",
  },
  {
    key: "checksAvailability",
    label: "Availability is probed before passkey UI is shown",
    pass: "isUserVerifyingPlatformAuthenticatorAvailable() or isConditionalMediationAvailable() gates the UI.",
    fail: "Without probing, browsers with no platform authenticator and no autofill support still get a passkey button that cannot work. Both probes are promises that resolve to a boolean and cost nothing.",
  },
  {
    key: "conditionalAutocomplete",
    label: 'The username field carries autocomplete="username webauthn"',
    pass: "Conditional mediation has the autocomplete token it needs to show passkeys in the dropdown.",
    fail: 'Conditional UI silently does nothing without the "webauthn" token in the field\'s autocomplete attribute. This is the single most common reason passkey autofill "does not work".',
  },
  {
    key: "crossDeviceOffered",
    label: "Cross-device (phone / QR) sign-in is reachable",
    pass: "A user whose passkey lives on a phone can still sign in on a desktop.",
    fail: "If the flow is pinned to platform authenticators, a passkey synced to a phone cannot be used on a desktop that has none. Leave authenticatorAttachment unset, or offer hybrid transport explicitly.",
  },
  {
    key: "allowsSecondPasskey",
    label: "Users can register more than one passkey",
    pass: "A second credential means losing one device is not an account loss.",
    fail: "One passkey per account turns a lost or wiped device into a support ticket. Let users add a passkey per device or per provider, and show the list in account settings.",
  },
];

const PUBLIC_SUFFIXES = new Set([
  "com", "net", "org", "edu", "gov", "int", "mil", "io", "dev", "app", "co", "me", "ai", "sh",
  "in", "uk", "de", "fr", "jp", "au", "ca", "nl", "es", "it", "br", "cn", "ru", "za",
  "co.uk", "org.uk", "ac.uk", "gov.uk", "com.au", "net.au", "co.in", "co.jp", "com.br", "co.za",
  "github.io", "gitlab.io", "vercel.app", "netlify.app", "pages.dev", "workers.dev",
  "herokuapp.com", "azurewebsites.net", "web.app", "firebaseapp.com", "glitch.me", "onrender.com",
]);

const COSE_ALGORITHMS = {
  "-7": { name: "ES256", note: "ECDSA over P-256 with SHA-256. Every passkey provider supports it; a credential request without it will fail on most authenticators." },
  "-8": { name: "EdDSA", note: "Ed25519. Supported by some security keys, rarely by platform authenticators." },
  "-35": { name: "ES384", note: "ECDSA over P-384. Uncommon." },
  "-36": { name: "ES512", note: "ECDSA over P-521. Uncommon." },
  "-257": { name: "RS256", note: "RSASSA-PKCS1-v1_5 with SHA-256. Windows Hello TPMs historically produced this, so include it for older Windows clients." },
  "-258": { name: "RS384", note: "Uncommon." },
  "-259": { name: "RS512", note: "Uncommon." },
  "-37": { name: "PS256", note: "RSASSA-PSS. Uncommon." },
};

/* --------------------------------------------------------------- base64url */

const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** @returns {number[]|null} bytes, or null when the string is not valid base64/base64url */
export function decodeBase64Url(text) {
  if (typeof text !== "string") return null;
  const cleaned = text.replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/").replace(/=+$/, "");
  if (!cleaned) return null;
  if (cleaned.length % 4 === 1) return null;
  if (/[^A-Za-z0-9+/]/.test(cleaned)) return null;
  const bytes = [];
  let buffer = 0;
  let bits = 0;
  for (const char of cleaned) {
    buffer = (buffer << 6) | B64.indexOf(char);
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }
  return bytes;
}

/** Length in bytes of a BufferSource written as base64url, a byte array, or {0:..,1:..}. */
function bufferLength(value) {
  if (Array.isArray(value)) {
    return value.every((item) => Number.isInteger(item) && item >= 0 && item <= 255) ? value.length : null;
  }
  if (typeof value === "string") {
    const bytes = decodeBase64Url(value);
    return bytes ? bytes.length : null;
  }
  if (value && typeof value === "object") {
    const keys = Object.keys(value);
    if (keys.length && keys.every((key) => /^\d+$/.test(key))) return keys.length;
  }
  return null;
}

function bufferBytes(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return decodeBase64Url(value);
  return null;
}

const asciiText = (bytes) =>
  bytes && bytes.every((byte) => byte >= 0x20 && byte <= 0x7e)
    ? bytes.map((byte) => String.fromCharCode(byte)).join("")
    : null;

/* ------------------------------------------------------------ origin / rpId */

/** True for any address in the 127.0.0.0/8 loopback range, not just 127.0.0.1. */
function isIPv4Loopback(host) {
  const match = host.match(/^127\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!match) return false;
  return match.slice(1).every((octet) => Number(octet) <= 255);
}

export function parseOrigin(origin) {
  if (typeof origin !== "string" || !origin.trim()) return { error: "No origin given." };
  const match = origin.trim().match(/^(https?):\/\/(\[[0-9a-fA-F:]+\]|[^/:\s]+)(?::(\d+))?\/?$/i);
  if (!match) return { error: "An origin looks like https://example.com — scheme and host, no path." };
  const [, scheme, rawHost, port] = match;
  const host = rawHost.toLowerCase();
  const loopback = host === "localhost" || host === "[::1]" || isIPv4Loopback(host);
  return { scheme: scheme.toLowerCase(), host, port: port || "", loopback };
}

/** WebAuthn: the RP ID must equal the origin's host or be a registrable suffix of it. */
export function rpIdMatchesOrigin(rpId, host) {
  if (rpId === host) return true;
  return host.endsWith(`.${rpId}`);
}

export function isPublicSuffix(rpId) {
  return PUBLIC_SUFFIXES.has(rpId);
}

/* ------------------------------------------------------------------ engine */

const STATUS_RANK = { fail: 3, warn: 2, pass: 1, info: 0 };

function detectCeremony(options) {
  if (options && typeof options === "object") {
    if (options.pubKeyCredParams || options.user || options.attestation || options.excludeCredentials) {
      return "registration";
    }
    if (options.allowCredentials || options.rpId) return "authentication";
  }
  return "authentication";
}

function unwrap(parsed) {
  if (parsed && typeof parsed === "object" && parsed.publicKey && typeof parsed.publicKey === "object") {
    return { options: parsed.publicKey, wrapped: true };
  }
  return { options: parsed, wrapped: false };
}

/**
 * @param {{json:string, origin:string, mode:string, mediation:string, fallback:Object}} input
 * @returns {{error:string}|object}
 */
export function analysePasskeyOptions(input) {
  const source = input || {};
  const text = typeof source.json === "string" ? source.json.trim() : "";
  if (!text) {
    return { error: "Paste the PublicKeyCredentialCreationOptions or PublicKeyCredentialRequestOptions object you pass to navigator.credentials." };
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (caught) {
    return { error: `That is not valid JSON: ${caught.message}. Options logged from a browser often contain ArrayBuffers — replace them with their base64url string form before pasting.` };
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { error: "The JSON must be an object — the options bag itself, or the { publicKey: … } wrapper around it." };
  }

  const { options, wrapped } = unwrap(parsed);
  if (!options || typeof options !== "object" || Array.isArray(options)) {
    return { error: "The publicKey property must be an object containing the credential options." };
  }

  const origin = parseOrigin(source.origin);
  if (origin.error) return { error: origin.error };

  const requested = source.mode && source.mode !== "auto" ? source.mode : detectCeremony(options);
  const ceremony = requested === "registration" ? "registration" : "authentication";
  const mediation = MEDIATION_MODES.some((item) => item.key === source.mediation) ? source.mediation : "optional";

  const checks = [];
  const add = (status, id, title, detail) => checks.push({ status, id, title, detail });

  /* ---- origin ---- */
  if (origin.scheme !== "https" && !origin.loopback) {
    add("fail", "origin-scheme", "Origin is not a secure context", "WebAuthn is only exposed on secure contexts. Plain HTTP works on localhost and 127.0.0.1 only; every other host needs HTTPS or navigator.credentials will be undefined.");
  } else {
    add("pass", "origin-scheme", "Origin is a secure context", origin.loopback ? "Loopback origins are treated as secure, so local development works over HTTP." : "HTTPS origin, so the WebAuthn API is available.");
  }

  const rpId = ceremony === "registration"
    ? (options.rp && typeof options.rp === "object" ? options.rp.id : undefined)
    : options.rpId;

  if (rpId === undefined || rpId === null || rpId === "") {
    add("warn", "rp-id", "No RP ID set — it defaults to the origin's host", `With no RP ID the browser uses "${origin.host}". That works, but the credential is then bound to that exact host: moving sign-in to another subdomain later will orphan every passkey. Set it explicitly to the domain you intend to keep.`);
  } else if (typeof rpId !== "string") {
    add("fail", "rp-id", "RP ID is not a string", "It must be a domain string such as \"example.com\".");
  } else if (!rpIdMatchesOrigin(rpId.toLowerCase(), origin.host)) {
    add("fail", "rp-id", "RP ID does not cover the origin", `"${rpId}" is neither "${origin.host}" nor a parent domain of it, so the browser will reject the ceremony with a SecurityError. The RP ID must be the origin's host or a registrable suffix of it.`);
  } else if (isPublicSuffix(rpId.toLowerCase())) {
    add("fail", "rp-id", "RP ID is a public suffix", `"${rpId}" is on the Public Suffix List, so it is not a registrable domain and browsers refuse it. Use your own domain instead. (This tool carries a short list of common suffixes, not the full one.)`);
  } else if (rpId.toLowerCase() === origin.host) {
    add("pass", "rp-id", "RP ID matches the origin exactly", `Credentials are bound to "${rpId}" and will not be offered on any other host — including sibling subdomains.`);
  } else {
    add("pass", "rp-id", "RP ID is a parent domain of the origin", `Credentials are bound to "${rpId}", so they will also be offered on other subdomains of it. That is usually what you want for a multi-subdomain product.`);
  }

  /* ---- challenge ---- */
  const challengeLength = bufferLength(options.challenge);
  if (options.challenge === undefined) {
    add("fail", "challenge", "No challenge", "challenge is required. Without a fresh server-generated random value the ceremony cannot be replay-protected.");
  } else if (challengeLength === null) {
    add("fail", "challenge", "Challenge is not readable", "It is neither a base64url string nor a byte array, so its length cannot be checked. In the browser it must be an ArrayBuffer; over the wire it is normally base64url.");
  } else if (challengeLength < 16) {
    add("fail", "challenge", `Challenge is only ${challengeLength} byte${challengeLength === 1 ? "" : "s"}`, "The specification requires at least 16 bytes of cryptographically random data. A short or guessable challenge undermines the entire ceremony.");
  } else {
    add("pass", "challenge", `Challenge is ${challengeLength} bytes`, "At or above the 16-byte minimum. It must also be freshly generated per ceremony and verified server-side — that part cannot be checked from a static options object.");
  }

  /* ---- timeout ---- */
  if (options.timeout === undefined) {
    add("warn", "timeout", "No timeout set", "The browser picks its own, which varies. Set it explicitly: 300000 ms (5 minutes) when user verification is required, 120000 ms otherwise.");
  } else if (typeof options.timeout !== "number" || !Number.isFinite(options.timeout) || options.timeout <= 0) {
    add("fail", "timeout", "Timeout is not a positive number", "timeout is milliseconds as a number.");
  } else if (options.timeout < 30000) {
    add("warn", "timeout", `Timeout is ${options.timeout} ms`, "Under 30 seconds is not enough time to unlock a phone, scan a QR code or find a security key. Users see the cancellation as NotAllowedError with no explanation.");
  } else if (options.timeout > 600000) {
    add("warn", "timeout", `Timeout is ${options.timeout} ms`, "Over 10 minutes leaves a prompt open long after the user has walked away. Browsers may clamp it anyway.");
  } else {
    add("pass", "timeout", `Timeout is ${options.timeout} ms`, "Inside the recommended 30 second to 10 minute band.");
  }

  if (ceremony === "registration") {
    /* ---- rp ---- */
    if (!options.rp || typeof options.rp !== "object") {
      add("fail", "rp", "No rp object", "Registration requires rp with at least a name.");
    } else if (!options.rp.name) {
      add("fail", "rp", "rp.name is missing", "rp.name is required and is the label the user sees in their passkey manager. Blank names produce entries the user cannot identify later.");
    } else {
      add("pass", "rp", `Relying party name is "${options.rp.name}"`, "This is the text shown in the passkey list on the user's device, so it should be the product name they recognise.");
    }

    /* ---- user ---- */
    const user = options.user;
    if (!user || typeof user !== "object") {
      add("fail", "user", "No user object", "Registration requires user with id, name and displayName.");
    } else {
      const idLength = bufferLength(user.id);
      const idBytes = bufferBytes(user.id);
      const idText = asciiText(idBytes);
      if (user.id === undefined) {
        add("fail", "user-id", "No user.id", "The user handle is required and is what the authenticator stores to identify the account.");
      } else if (idLength === null) {
        add("fail", "user-id", "user.id is not readable", "It must be a BufferSource in the browser, normally sent as base64url.");
      } else if (idLength < 1 || idLength > 64) {
        add("fail", "user-id", `user.id is ${idLength} bytes`, "The specification allows 1 to 64 bytes. Anything longer is rejected by the authenticator.");
      } else if (idText && idText.includes("@")) {
        add("fail", "user-id", "user.id contains an email address", `The handle decodes to "${idText}". The specification says the user handle must not contain personally identifying information: it is stored on the authenticator in the clear and can be read back by any site the credential is offered to. Use an opaque random value mapped to the account server-side.`);
      } else if (idText) {
        add("warn", "user-id", "user.id is human-readable text", `The handle decodes to "${idText}". Even a username is personally identifying, and the handle is stored unencrypted on the authenticator. Prefer 16 to 32 random bytes.`);
      } else {
        add("pass", "user-id", `user.id is ${idLength} opaque bytes`, "Inside the 1–64 byte range and not readable text, which is what the specification asks for.");
      }

      if (!user.name) {
        add("fail", "user-name", "user.name is missing", "Required. It is the account identifier shown beside the passkey — usually the email address or username the person signed up with.");
      } else if (!user.displayName) {
        add("warn", "user-name", "user.displayName is missing", "It is required by the specification and is the friendly name in the passkey chooser. An empty string is allowed but leaves the entry looking blank.");
      } else {
        add("pass", "user-name", "user.name and user.displayName are set", `The passkey will appear as "${user.displayName}" against "${user.name}".`);
      }
    }

    /* ---- algorithms ---- */
    const params = Array.isArray(options.pubKeyCredParams) ? options.pubKeyCredParams : null;
    if (!params) {
      add("fail", "algorithms", "No pubKeyCredParams array", "Required. List the COSE algorithms you can verify, best first.");
    } else if (!params.length) {
      add("fail", "algorithms", "pubKeyCredParams is empty", "An empty list means no acceptable algorithm, so every authenticator refuses.");
    } else {
      const algorithms = params
        .filter((item) => item && typeof item === "object")
        .map((item) => item.alg)
        .filter((alg) => typeof alg === "number");
      const known = algorithms.map((alg) => ({ alg, ...(COSE_ALGORITHMS[String(alg)] || { name: "unrecognised", note: "Not a COSE algorithm identifier this tool knows. Check the IANA COSE registry." }) }));
      const hasEs256 = algorithms.includes(-7);
      const hasRs256 = algorithms.includes(-257);
      const list = known.map((item) => `${item.name} (${item.alg})`).join(", ");
      if (!hasEs256) {
        add("fail", "algorithms", "ES256 (-7) is not offered", `Offered: ${list || "nothing usable"}. ES256 is the algorithm every passkey provider produces; omitting it makes registration fail on Apple, Google and Windows platform authenticators alike.`);
      } else if (!hasRs256) {
        add("warn", "algorithms", "RS256 (-257) is not offered", `Offered: ${list}. ES256 covers modern platforms, but some older Windows Hello TPMs only produce RS256. Adding it costs nothing.`);
      } else {
        add("pass", "algorithms", "ES256 and RS256 are both offered", `Offered: ${list}. That covers every mainstream authenticator.`);
      }
    }

    /* ---- discoverable credential ---- */
    const selection = options.authenticatorSelection && typeof options.authenticatorSelection === "object"
      ? options.authenticatorSelection
      : {};
    const residentKey = selection.residentKey;
    if (residentKey === "required") {
      add("pass", "resident-key", "residentKey is required", "The credential is discoverable, which is what makes it a passkey: it can be used with no username typed first, and it appears in the user's passkey manager.");
    } else if (residentKey === "preferred") {
      add("warn", "resident-key", "residentKey is preferred, not required", "The authenticator may create a non-discoverable credential instead. That still authenticates, but it cannot be used for usernameless or autofill sign-in, and the user will not see it listed as a passkey. Check the credProps extension result to find out which you got.");
    } else if (residentKey === "discouraged") {
      add("fail", "resident-key", "residentKey is discouraged", "This asks for a server-side credential, the opposite of a passkey. Set it to \"required\".");
    } else {
      add("fail", "resident-key", "residentKey is not set", "Without it the default is \"discouraged\", so you get an old-style second-factor credential and no passkey. Set residentKey to \"required\".");
    }

    if (selection.requireResidentKey !== undefined) {
      const consistent = (residentKey === "required") === (selection.requireResidentKey === true);
      if (consistent) {
        add("pass", "require-resident-key", "Legacy requireResidentKey agrees with residentKey", "Keeping the deprecated boolean in step with residentKey is the documented way to support older clients.");
      } else {
        add("warn", "require-resident-key", "requireResidentKey contradicts residentKey", `requireResidentKey is ${String(selection.requireResidentKey)} while residentKey is "${residentKey || "unset"}". Older clients read the boolean, newer ones read the string, so the two must agree.`);
      }
    }

    /* ---- attestation ---- */
    const attestation = options.attestation;
    if (attestation === undefined || attestation === "none") {
      add("pass", "attestation", "Attestation is none", "The right default for consumer passkeys: no hardware identity is collected, so no extra consent prompt appears and there is no attestation certificate to verify.");
    } else if (attestation === "direct" || attestation === "enterprise") {
      add("warn", "attestation", `Attestation is ${attestation}`, "This asks the authenticator to identify its make and model, which adds a privacy prompt on some platforms and is silently downgraded by synced-passkey providers. Only ask for it if you genuinely verify the attestation statement and have a policy that needs it.");
    } else if (attestation === "indirect") {
      add("warn", "attestation", "Attestation is indirect", "The client may anonymise the statement, so you often cannot rely on what comes back. Use \"none\" unless you verify attestation.");
    } else {
      add("fail", "attestation", `Attestation value "${attestation}" is not valid`, "Allowed values are none, indirect, direct and enterprise.");
    }

    /* ---- exclude credentials ---- */
    const exclude = options.excludeCredentials;
    if (Array.isArray(exclude) && exclude.length) {
      add("pass", "exclude-credentials", `excludeCredentials lists ${exclude.length} existing credential${exclude.length === 1 ? "" : "s"}`, "The authenticator will refuse to create a second passkey for an account it already holds, which is what stops confusing duplicates.");
    } else {
      add("warn", "exclude-credentials", "excludeCredentials is empty", "A user who registers twice on the same device ends up with two passkeys for one account and no way to tell them apart. Send the account's existing credential IDs here.");
    }

    /* ---- credProps ---- */
    const extensions = options.extensions && typeof options.extensions === "object" ? options.extensions : {};
    if (extensions.credProps === true) {
      add("pass", "cred-props", "credProps extension is requested", "The response tells you whether the credential really is discoverable (rk: true), which is the only reliable way to confirm you created a passkey rather than a second factor.");
    } else {
      add("warn", "cred-props", "credProps extension is not requested", "Add extensions: { credProps: true } and read getClientExtensionResults().credProps.rk after registration. Without it you cannot tell a passkey from a non-discoverable credential.");
    }

    reportUserVerification(add, selection.userVerification, "registration");
    reportAttachment(add, selection.authenticatorAttachment, options.hints);
  } else {
    /* ---- authentication ---- */
    const allow = options.allowCredentials;
    const allowCount = Array.isArray(allow) ? allow.length : 0;
    if (!Array.isArray(allow) || allowCount === 0) {
      add("pass", "allow-credentials", "allowCredentials is empty", "This is the usernameless flow: the browser offers whatever discoverable credentials exist for the RP ID, so the user does not have to say who they are first. It is also a precondition for autofill.");
    } else {
      add("warn", "allow-credentials", `allowCredentials lists ${allowCount} credential${allowCount === 1 ? "" : "s"}`, "The user must be identified before the ceremony starts, so this cannot be a usernameless flow. It also leaks which credentials the account holds to anyone who can trigger the request.");
    }

    if (mediation === "conditional") {
      if (allowCount > 0) {
        add("fail", "conditional", "Conditional mediation with a non-empty allowCredentials", "Autofill requires allowCredentials to be empty. With entries present the browser will not surface passkeys in the username dropdown, and nothing visible happens at all.");
      } else {
        add("pass", "conditional", "Conditional mediation with an empty allowCredentials", "Correct shape for passkey autofill. It still needs autocomplete=\"username webauthn\" on the input and an isConditionalMediationAvailable() check before you call get().");
      }
      if (typeof options.timeout === "number") {
        add("warn", "conditional-timeout", "Timeout set on a conditional request", "A conditional request sits in the background until the user picks a passkey. A timeout can cancel the autofill offer while the user is still reading the page; most implementations omit it here.");
      }
    } else {
      add("info", "conditional", `Mediation is ${mediation}`, "Modal mediation shows the prompt when the user asks for it. Conditional mediation is what puts passkeys in the username field's autofill dropdown, and it is the flow users find easiest.");
    }

    reportUserVerification(add, options.userVerification, "authentication");
    reportAttachment(add, undefined, options.hints);
  }

  /* ---- fallback UX ---- */
  const fallbackInput = source.fallback && typeof source.fallback === "object" ? source.fallback : {};
  const fallback = FALLBACK_CHECKS.map((check) => {
    const ok = fallbackInput[check.key] === true;
    return {
      key: check.key,
      label: check.label,
      status: ok ? "pass" : "warn",
      detail: ok ? check.pass : check.fail,
    };
  });

  const counts = { fail: 0, warn: 0, pass: 0, info: 0 };
  for (const check of checks) counts[check.status] += 1;
  const fallbackCounts = { pass: 0, warn: 0 };
  for (const check of fallback) fallbackCounts[check.status] += 1;

  const worst = checks.reduce((rank, check) => Math.max(rank, STATUS_RANK[check.status]), 0);
  const verdict =
    counts.fail > 0
      ? "blocked"
      : counts.warn > 0 || fallbackCounts.warn > 0
        ? "workable"
        : "ready";

  return {
    ceremony,
    detected: !source.mode || source.mode === "auto",
    wrapped,
    origin: { ...origin, value: source.origin },
    mediation,
    rpId: typeof rpId === "string" ? rpId : "",
    checks,
    counts,
    fallback,
    fallbackCounts,
    worst,
    verdict,
    graded: checks.filter((check) => check.status !== "info").length,
  };
}

function reportUserVerification(add, value, ceremony) {
  if (value === "required") {
    add("pass", "user-verification", "userVerification is required", "The authenticator must verify the user with a biometric or PIN, so the passkey counts as two factors on its own. This is the setting that lets you drop the password entirely.");
  } else if (value === "preferred" || value === undefined) {
    add("warn", "user-verification", `userVerification is ${value === undefined ? "unset, which means preferred" : "preferred"}`, `A security key with no PIN will satisfy this without verifying anyone, so the ${ceremony} may complete with possession alone. Check the UV flag in the authenticator data, or set it to "required".`);
  } else if (value === "discouraged") {
    add("warn", "user-verification", "userVerification is discouraged", "This deliberately skips the biometric or PIN, leaving a single possession factor. It is only appropriate as a second factor behind a password.");
  } else {
    add("fail", "user-verification", `userVerification value "${value}" is not valid`, "Allowed values are required, preferred and discouraged.");
  }
}

function reportAttachment(add, attachment, hints) {
  if (attachment === "platform") {
    add("warn", "attachment", "authenticatorAttachment is platform", "This restricts the ceremony to an authenticator built into the current device: no security keys, and no scanning a QR code to use a passkey from a phone. Users on a desktop with no platform authenticator get nothing at all.");
  } else if (attachment === "cross-platform") {
    add("warn", "attachment", "authenticatorAttachment is cross-platform", "This excludes the device's own passkey provider — Touch ID, Windows Hello, Android — and only offers external keys and phones. It is right for a security-key policy, wrong for consumer passkeys.");
  } else if (attachment === undefined) {
    add("pass", "attachment", "authenticatorAttachment is unset", "Every authenticator is eligible: the platform one, a security key, or a passkey on a nearby phone. This is the recommended default for passkeys.");
  } else {
    add("fail", "attachment", `authenticatorAttachment value "${attachment}" is not valid`, "Allowed values are platform and cross-platform.");
  }

  if (hints !== undefined) {
    const valid = ["security-key", "client-device", "hybrid"];
    if (!Array.isArray(hints)) {
      add("fail", "hints", "hints is not an array", "The WebAuthn Level 3 hints member is an array of strings, in preference order.");
    } else {
      const unknown = hints.filter((hint) => !valid.includes(hint));
      if (unknown.length) {
        add("warn", "hints", `Unrecognised hint value: ${unknown.join(", ")}`, `Defined hints are ${valid.join(", ")}. Unknown values are ignored by the client.`);
      } else {
        add("pass", "hints", `hints: ${hints.join(", ")}`, "Hints steer the browser's UI in preference order and, unlike authenticatorAttachment, they do not exclude anything. Where both are set, hints win on clients that support them.");
      }
    }
  }
}

export const VERDICTS = {
  ready: {
    label: "Ready",
    detail: "No rule in this checklist is broken. Verify the response server-side as well: origin, RP ID hash, signature, the UV and BE/BS flags, and the signature counter.",
  },
  workable: {
    label: "Works, with gaps",
    detail: "Nothing here blocks the ceremony, but the flagged items change what users can actually do — usually whether a real passkey is created and whether anyone can get in without one.",
  },
  blocked: {
    label: "Will not work as a passkey flow",
    detail: "At least one item breaks the ceremony or produces something that is not a passkey. Fix the failures first.",
  },
};

export function formatReadinessReport(result) {
  if (!result || result.error) return "";
  const lines = ["Passkey readiness review", ""];
  lines.push(`Ceremony: ${result.ceremony}${result.detected ? " (detected from the JSON)" : ""}`);
  lines.push(`Origin: ${result.origin.value}`);
  if (result.rpId) lines.push(`RP ID: ${result.rpId}`);
  lines.push(`Verdict: ${VERDICTS[result.verdict].label} — ${result.counts.fail} failing, ${result.counts.warn} to check, ${result.counts.pass} passing`);
  lines.push("");
  lines.push("Options object");
  for (const check of result.checks) {
    lines.push(`  [${check.status.toUpperCase()}] ${check.title}`);
    lines.push(`    ${check.detail}`);
  }
  lines.push("");
  lines.push("Fallback and recovery");
  for (const check of result.fallback) {
    lines.push(`  [${check.status.toUpperCase()}] ${check.label}`);
    lines.push(`    ${check.detail}`);
  }
  lines.push("");
  lines.push("Checked against the WebAuthn Level 3 options members in the browser, with no network call.");
  return lines.join("\n");
}
