const MAX_VALUE_LENGTH = 2_000;
const CONTROL_PATTERN = /[\u200B-\u200F\u202A-\u202E\u2060\u2066-\u2069\uFEFF]/g;

function bounded(value) {
  return String(value || "").trim().slice(0, MAX_VALUE_LENGTH);
}

function removeControls(value) {
  const text = bounded(value);
  return {
    value: text.replace(CONTROL_PATTERN, ""),
    hiddenControlCount: (text.match(CONTROL_PATTERN) || []).length,
  };
}

function normalizeDomain(value) {
  const cleaned = removeControls(value);
  const candidate = cleaned.value.toLowerCase().replace(/\.$/, "");
  if (!candidate || /[/@?#\s]/.test(candidate)) {
    return { ok: false, error: "Enter a hostname only, without a path or account name." };
  }
  try {
    const url = new URL(`https://${candidate}`);
    if (
      url.pathname !== "/" ||
      url.search ||
      url.hash ||
      url.port ||
      url.username ||
      url.password
    ) {
      return { ok: false, error: "Enter a valid hostname only." };
    }
    const normalized = url.hostname.toLowerCase().replace(/\.$/, "");
    return {
      ok: true,
      normalized,
      host: normalized,
      hiddenControlCount: cleaned.hiddenControlCount,
      punycode: normalized.split(".").some((part) => part.startsWith("xn--")),
    };
  } catch {
    return { ok: false, error: "Enter a valid hostname." };
  }
}

function normalizeUrl(value) {
  const cleaned = removeControls(value);
  try {
    const url = new URL(cleaned.value);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
      return { ok: false, error: "Enter an HTTP or HTTPS URL without embedded credentials." };
    }
    url.hash = "";
    if (url.pathname !== "/") url.pathname = url.pathname.replace(/\/+$/, "") || "/";
    const normalized = url.toString();
    return {
      ok: true,
      normalized,
      host: url.hostname.toLowerCase(),
      origin: url.origin.toLowerCase(),
      hiddenControlCount: cleaned.hiddenControlCount,
      punycode: url.hostname.split(".").some((part) => part.startsWith("xn--")),
    };
  } catch {
    return { ok: false, error: "Enter a complete valid HTTP or HTTPS URL." };
  }
}

function normalizeEmail(value) {
  const cleaned = removeControls(value);
  const match = cleaned.value.match(/^([^\s@]+)@([^\s@]+)$/);
  if (!match) return { ok: false, error: "Enter one complete email address." };
  const domain = normalizeDomain(match[2]);
  if (!domain.ok) return { ok: false, error: "The email domain is invalid." };
  return {
    ok: true,
    normalized: `${match[1]}@${domain.normalized}`,
    caseFolded: `${match[1]}@${domain.normalized}`.toLowerCase(),
    host: domain.normalized,
    hiddenControlCount:
      cleaned.hiddenControlCount + (domain.hiddenControlCount || 0),
    punycode: domain.punycode,
  };
}

function normalizePhone(value) {
  const cleaned = removeControls(value);
  const compact = cleaned.value.replace(/[\s().-]/g, "");
  if (!/^\+?[0-9]{7,15}$/.test(compact)) {
    return {
      ok: false,
      error: "Enter 7–15 digits, with an optional leading + country code.",
    };
  }
  return {
    ok: true,
    normalized: compact,
    hiddenControlCount: cleaned.hiddenControlCount,
    punycode: false,
  };
}

function normalizeHandle(value) {
  const cleaned = removeControls(value);
  const normalized = cleaned.value.replace(/^@/, "");
  if (!normalized || /\s/.test(normalized) || normalized.length > 200) {
    return { ok: false, error: "Enter one handle without spaces." };
  }
  return {
    ok: true,
    normalized,
    caseFolded: normalized.toLowerCase(),
    hiddenControlCount: cleaned.hiddenControlCount,
    punycode: false,
  };
}

export function normalizeContact(type, value) {
  if (type === "domain") return normalizeDomain(value);
  if (type === "url") return normalizeUrl(value);
  if (type === "email") return normalizeEmail(value);
  if (type === "phone") return normalizePhone(value);
  if (type === "handle") return normalizeHandle(value);
  return { ok: false, error: "Choose a supported contact type." };
}

function sameDomainFamily(first, second) {
  return (
    first === second ||
    first.endsWith(`.${second}`) ||
    second.endsWith(`.${first}`)
  );
}

export function compareContact({
  type,
  officialValue,
  claimedValue,
  trustedReferenceConfirmed = false,
} = {}) {
  if (!trustedReferenceConfirmed) {
    return {
      ok: false,
      errors: [
        "Confirm that the reference came from an independently obtained official source.",
      ],
    };
  }
  const official = normalizeContact(type, officialValue);
  const claimed = normalizeContact(type, claimedValue);
  const errors = [];
  if (!official.ok) errors.push(`Official reference: ${official.error}`);
  if (!claimed.ok) errors.push(`Contact being checked: ${claimed.error}`);
  if (errors.length) return { ok: false, errors };

  let status = "different";
  let reason = "The normalized values are different.";
  if (official.normalized === claimed.normalized) {
    status = "exact-match";
    reason = "The normalized values match exactly.";
  } else if (
    ["email", "handle"].includes(type) &&
    official.caseFolded === claimed.caseFolded
  ) {
    status = "case-only-difference";
    reason =
      "The values differ only by letter case; the service may or may not treat case as significant.";
  } else if (
    type === "domain" &&
    sameDomainFamily(official.host, claimed.host)
  ) {
    status = "same-domain-family";
    reason =
      "One hostname is a subdomain of the other; this is related but not an exact match.";
  } else if (
    type === "url" &&
    official.origin === claimed.origin
  ) {
    status = "same-origin-different-url";
    reason =
      "The protocol and host match, but the path or query is different.";
  }

  const cues = [];
  if (official.hiddenControlCount || claimed.hiddenControlCount) {
    cues.push({
      id: "hidden-unicode",
      message:
        "Hidden directional or zero-width Unicode characters were removed before comparison.",
    });
  }
  if (official.punycode || claimed.punycode) {
    cues.push({
      id: "internationalized-domain",
      message:
        "At least one hostname uses an internationalized-domain encoding; compare the ASCII hostname carefully.",
    });
  }

  return {
    ok: true,
    type,
    status,
    reason,
    cues,
    normalized: {
      official: official.normalized,
      claimed: claimed.normalized,
    },
    limitations: [
      "A match only means the entered strings match under the disclosed normalization rules.",
      "This tool does not query an official directory, validate ownership, detect account compromise, or prove a message is genuine.",
      "Independently initiate contact using a source you already trust; do not use contact details supplied by the message being checked.",
    ],
  };
}

export function buildContactReport(result) {
  if (!result?.ok) return null;
  return {
    schema: "altftool.official-contact-comparison.v1",
    createdAt: new Date().toISOString(),
    type: result.type,
    status: result.status,
    cueIds: result.cues.map((cue) => cue.id),
    scope: {
      localOnly: true,
      liveDirectoryQueried: false,
      authenticityEstablished: false,
      includesContactValues: false,
    },
  };
}
