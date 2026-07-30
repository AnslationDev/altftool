/**
 * Electricity Bill Scam Anatomy — specimen teardown and a scam-marker scanner.
 *
 * Pure module: no React, no DOM, no clock reads, no network. Same input, same
 * output. Every exported function is total — unusable input returns { error }
 * rather than NaN or a number that looks like a verdict.
 *
 * The scanner is a weighted rule engine, not a classifier: it reports which
 * documented markers of the disconnection-tonight family appear in a message
 * and how heavily each is weighted. It cannot prove a message is genuine.
 */

/* ------------------------------------------------------------------ *
 * The specimen
 * ------------------------------------------------------------------ */

/**
 * A composite of the "power will be cut tonight" SMS reported across Indian
 * distribution companies. Hostnames are defanged (with [.] instead of .) so
 * nothing here is clickable, and the phone number is redacted.
 */
export const SPECIMEN = {
  channel: "SMS, then a phone call within minutes",
  senderLabel: "A ten-digit mobile number, not a discom sender header",
  context:
    "Timed for the evening, after the discom's own call centre has closed and while the threat of a night without power is at its most persuasive.",
  lines: [
    {
      text: "Dear Consumer, your electricity connection will be DISCONNECTED tonight at 9:30 PM",
      signal: "disconnect-threat",
    },
    { text: "from the electricity office as your previous month bill was not updated.", signal: "vague-reason" },
    {
      text: "Please contact our electricity officer immediately 9x-xxxxx-xxxxx.",
      signal: "mobile-callback",
    },
    { text: "Pay the pending amount here: http://bses-billpay-update[.]top", signal: "lookalike-domain" },
    {
      text: "Or install QuickSupport so our engineer can update the bill on your phone.",
      signal: "remote-access",
    },
    {
      text: "A test payment of Rs.10 is required to verify the meter - enter your UPI PIN to confirm.",
      signal: "ten-rupee-test",
    },
    { text: "- Electricity Board Billing Section", signal: "fake-department" },
  ],
};

/** Full specimen text, the way a person would paste it into the scanner. */
export const SPECIMEN_TEXT = SPECIMEN.lines.map((line) => line.text).join("\n");

/**
 * Why each line is a tell. severity is used only for ordering and colour, not
 * for the scan score — the scanner has its own weights below.
 */
export const SIGNALS = [
  {
    id: "disconnect-threat",
    label: "Disconnection tonight, at a precise hour",
    severity: "high",
    what: "\"Will be DISCONNECTED tonight at 9:30 PM.\"",
    why:
      "The named hour makes it feel procedural, and the evening timing means the discom's own call centre is shut. Real disconnection follows a printed notice with a due date, usually weeks after the bill, and no utility disconnects at half past nine at night on the strength of an SMS.",
  },
  {
    id: "vague-reason",
    label: "No consumer number, no bill number, no amount",
    severity: "critical",
    what: "\"Your previous month bill was not updated\" — with nothing identifying your connection.",
    why:
      "Every genuine discom message quotes the consumer number or CA number and the exact amount, because it is generated from your billing record. This message cannot: it was sent to a bought list of phone numbers, and the sender does not know which utility supplies you.",
  },
  {
    id: "mobile-callback",
    label: "A personal mobile as the \"electricity officer\"",
    severity: "high",
    what: "One ten-digit number to call, in place of the discom's helpline.",
    why:
      "This is the pivot the whole scam depends on: the SMS only exists to make you dial. Discom helplines are 1912 or the toll-free number printed on your bill, and no lineman or billing officer works from a private mobile.",
  },
  {
    id: "lookalike-domain",
    label: "A payment page on a domain the utility does not own",
    severity: "critical",
    what: "bses-billpay-update[.]top borrows a discom name in someone else's domain.",
    why:
      "Only the registrable domain immediately before the first single slash decides who receives your money. The address printed on your paper bill is the reference — a .top or .xyz lookalike never is.",
  },
  {
    id: "remote-access",
    label: "A screen-sharing app to \"update the bill\"",
    severity: "critical",
    what: "QuickSupport, AnyDesk or TeamViewer, installed while you are on the call.",
    why:
      "Nothing about a utility bill is fixed from inside your phone. What the app actually does is show the caller your screen and your incoming SMS while they walk you into your own banking app.",
  },
  {
    id: "ten-rupee-test",
    label: "A ten-rupee \"test payment\" that needs your UPI PIN",
    severity: "critical",
    what: "\"Enter your UPI PIN to verify the meter.\"",
    why:
      "A UPI PIN is only ever needed to send money — never to verify a meter, an account or anything else. The collect request you approve can carry any amount, and the small figure on the screen is not what you are authorising.",
  },
  {
    id: "fake-department",
    label: "A department invented to sound official",
    severity: "medium",
    what: "\"Electricity Board Billing Section\", naming no actual discom.",
    why:
      "India has dozens of distribution companies and each has a name. A generic \"Electricity Board\" is the only wording that works when the sender does not know where you live.",
  },
  {
    id: "sender-header",
    label: "Sent from a mobile number, not a registered header",
    severity: "high",
    what: "A personal number in place of a six-character commercial header.",
    why:
      "Discoms send bulk SMS through registered headers such as AD-BSESRJ or VM-MSEDCL. A message from a personal mobile claiming to be the electricity board has no legitimate explanation.",
  },
];

/* ------------------------------------------------------------------ *
 * Link inspection
 * ------------------------------------------------------------------ */

/**
 * A starter list of genuine utility and bill-payment domains. India has dozens
 * of distribution companies, so the authoritative reference is always the
 * address printed on your own paper or PDF bill.
 */
export const OFFICIAL_DOMAINS = [
  "bsesdelhi.com",
  "tatapower-ddl.com",
  "tatapower.com",
  "adanielectricity.com",
  "mahadiscom.in",
  "uppcl.org",
  "torrentpower.com",
  "pspcl.in",
  "bharatbillpay.com",
  "npci.org.in",
  "billdesk.com",
  "paytm.com",
  "phonepe.com",
];

/** Brand and process words a utility-phishing domain borrows. */
export const BRAND_TOKENS = [
  "bses",
  "tatapower",
  "adani",
  "msedcl",
  "mahadiscom",
  "uppcl",
  "discom",
  "electricity",
  "bijli",
  "vidyut",
  "powerbill",
  "billpay",
  "meter",
  "kseb",
  "tneb",
];

/** Wording used in the link findings for this scam family. */
export const ENTITY = {
  words: "Electricity",
  subjectPlural: "Distribution companies",
  subjectSingular: "a discom",
  possessive: "A utility's",
  pathWords: /bill|electric|power|meter|payment|discom|consumer|recharge/,
};

/** Link shorteners hide the destination until the tap has happened. */
export const SHORTENERS = [
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "goo.gl",
  "ow.ly",
  "is.gd",
  "buff.ly",
  "cutt.ly",
  "rb.gy",
  "rebrand.ly",
  "shorturl.at",
  "tiny.cc",
  "t.ly",
  "bl.ink",
  "s.id",
  "shrtco.de",
];

/**
 * Cheap, bulk-registered TLDs that dominate abuse reports. Presence is a weak
 * signal on its own — plenty of legitimate sites use them — so it is weighted
 * low and only matters next to a borrowed brand name.
 */
export const HIGH_ABUSE_TLDS = [
  "top",
  "xyz",
  "icu",
  "cyou",
  "sbs",
  "cfd",
  "rest",
  "buzz",
  "click",
  "link",
  "monster",
  "quest",
  "wiki",
  "gq",
  "cf",
  "ml",
  "tk",
  "ga",
];

/** Two-level public suffixes seen in Indian and Commonwealth addresses. */
export const MULTI_PART_SUFFIXES = [
  "co.in",
  "net.in",
  "org.in",
  "gen.in",
  "firm.in",
  "ind.in",
  "gov.in",
  "nic.in",
  "ac.in",
  "res.in",
  "edu.in",
  "co.uk",
  "org.uk",
  "ac.uk",
  "gov.uk",
  "com.au",
  "com.br",
  "com.sg",
  "com.my",
  "co.za",
];

/**
 * TLDs accepted when a candidate has no scheme. Without this, ordinary
 * sentences like "verify.Your account" would be read as domains.
 */
export const KNOWN_TLDS = [
  "com", "net", "org", "info", "biz", "io", "co", "in", "me", "app", "dev", "ai", "xyz", "top",
  "club", "online", "site", "shop", "store", "live", "link", "click", "icu", "cyou", "sbs", "cfd",
  "rest", "buzz", "fun", "space", "website", "tech", "pro", "asia", "us", "uk", "ca", "au", "nz",
  "sg", "my", "ph", "id", "ae", "sa", "za", "ru", "cn", "jp", "kr", "de", "fr", "it", "es", "nl",
  "se", "no", "fi", "dk", "pl", "br", "mx", "ar", "cl", "ng", "ke", "pk", "bd", "lk", "np", "gov",
  "edu", "mil", "int", "bank", "sbi", "page", "gg", "tv", "cc", "ly", "gd", "to", "vip", "work",
  "life", "world", "today", "email", "help", "support", "services", "solutions", "digital", "cloud",
  "host", "press", "news", "money", "finance", "credit", "loan", "gq", "cf", "ml", "tk", "ga",
  "monster", "quest", "wiki", "one", "com.in",
];

const IPV4 = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;

/**
 * Undo the common "defanging" people use when pasting a scam message, so
 * hxxp://bad[.]top is analysed as the address it represents.
 */
export function refang(raw) {
  if (typeof raw !== "string") return "";
  return raw
    .replace(/hxxps/gi, "https")
    .replace(/hxxp/gi, "http")
    .replace(/\[\s*\.\s*\]/g, ".")
    .replace(/\(\s*\.\s*\)/g, ".")
    .replace(/\{\s*\.\s*\}/g, ".")
    .replace(/\[\s*dot\s*\]/gi, ".")
    .replace(/\[\s*:\s*\]/g, ":")
    .replace(/\[\s*@\s*\]/g, "@")
    .replace(/\[\s*at\s*\]/gi, "@");
}

const URL_PATTERN =
  /((?:https?:\/\/)?(?:[a-z0-9._%+-]+@)?(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,24})(?::\d{2,5})?(?:\/[^\s<>"')]*)?)/gi;

/** Registrable domain: the part that actually decides ownership. */
export function registrableDomain(host) {
  if (typeof host !== "string" || host.length === 0) return "";
  const clean = host.toLowerCase().replace(/^\.+|\.+$/g, "");
  if (IPV4.test(clean)) return clean;
  const labels = clean.split(".").filter(Boolean);
  if (labels.length <= 2) return labels.join(".");
  const lastTwo = labels.slice(-2).join(".");
  if (MULTI_PART_SUFFIXES.includes(lastTwo)) return labels.slice(-3).join(".");
  return lastTwo;
}

/** Every address-looking string in the text, refanged and de-duplicated. */
export function extractUrls(text) {
  if (typeof text !== "string") return [];
  const source = refang(text);
  const found = [];
  const seen = new Set();
  const matches = source.match(URL_PATTERN) || [];
  for (const candidate of matches) {
    const trimmed = candidate.replace(/[.,;:!?)\]]+$/, "");
    const hasScheme = /^https?:\/\//i.test(trimmed);
    // A bare email address is not a destination: with no scheme and no path,
    // name@example.com is a mailbox, so it must not be scored as a link.
    if (!hasScheme && trimmed.includes("@") && !trimmed.includes("/")) continue;
    const authority = trimmed.replace(/^https?:\/\//i, "").split("/")[0];
    const host = authority.split("@").pop().split(":")[0].toLowerCase();
    if (!host) continue;
    const tld = host.split(".").pop();
    if (!hasScheme && !IPV4.test(host) && !KNOWN_TLDS.includes(tld)) continue;
    if (seen.has(trimmed.toLowerCase())) continue;
    seen.add(trimmed.toLowerCase());
    found.push(trimmed);
  }
  return found;
}

/** Link findings and their weights. Weights add into the message score. */
export const LINK_RULES = {
  "brand-not-owned": 12,
  "shortener": 6,
  "ip-host": 9,
  "punycode": 9,
  "userinfo": 9,
  "no-tls": 3,
  "deep-subdomain": 4,
  "abuse-tld": 4,
  "apk-file": 10,
  "brand-in-path-only": 5,
};

/**
 * Inspect one address. Returns the registrable domain, whether it belongs to a
 * bank domain on the official list, and each finding with its weight.
 *
 * @param {string} rawUrl an address, defanged or not.
 */
export function inspectLink(rawUrl) {
  if (typeof rawUrl !== "string" || rawUrl.trim() === "") {
    return { error: "Enter a link to inspect." };
  }
  const value = refang(rawUrl.trim());
  const hasScheme = /^https?:\/\//i.test(value);
  const withoutScheme = value.replace(/^https?:\/\//i, "");
  const slash = withoutScheme.indexOf("/");
  const authority = slash === -1 ? withoutScheme : withoutScheme.slice(0, slash);
  const path = slash === -1 ? "" : withoutScheme.slice(slash);
  const userinfo = authority.includes("@") ? authority.split("@")[0] : "";
  const hostPort = authority.split("@").pop();
  const host = hostPort.split(":")[0].toLowerCase();

  if (!host || (!IPV4.test(host) && !host.includes("."))) {
    return { error: "That does not look like a web address." };
  }

  const registrable = registrableDomain(host);
  const tld = host.split(".").pop();
  const labels = host.split(".").filter(Boolean);
  const official = OFFICIAL_DOMAINS.includes(registrable);
  const findings = [];

  const authorityText = authority.toLowerCase();
  const brandInHost = BRAND_TOKENS.find((token) => authorityText.includes(token));
  if (brandInHost && !official) {
    findings.push({
      id: "brand-not-owned",
      weight: LINK_RULES["brand-not-owned"],
      label: `"${brandInHost}" appears before the first slash, but the site is ${registrable}`,
      why: "The brand word is decoration; the registrable domain is who owns the page.",
    });
  } else if (!brandInHost && !official && ENTITY.pathWords.test(path.toLowerCase())) {
    findings.push({
      id: "brand-in-path-only",
      weight: LINK_RULES["brand-in-path-only"],
      label: `${ENTITY.words} words appear only after the slash, on ${registrable}`,
      why: "Anything after the first single slash is chosen by the site owner and proves nothing.",
    });
  }

  if (SHORTENERS.includes(registrable)) {
    findings.push({
      id: "shortener",
      weight: LINK_RULES.shortener,
      label: `${registrable} is a link shortener, so the real destination is hidden`,
      why: `${ENTITY.subjectPlural} do not shorten links in customer messages; there is nothing to hide in a domain they own.`,
    });
  }

  if (IPV4.test(host)) {
    findings.push({
      id: "ip-host",
      weight: LINK_RULES["ip-host"],
      label: "The address is a bare IP, with no domain name at all",
      why: `${ENTITY.possessive} real site always has a name and a certificate to match it.`,
    });
  }

  if (labels.some((label) => label.startsWith("xn--"))) {
    findings.push({
      id: "punycode",
      weight: LINK_RULES.punycode,
      label: "The hostname is punycode (xn--), so it may be displaying non-Latin look-alike letters",
      why: "Punycode lets a Cyrillic or Greek letter render as an ordinary a, e or o in the address bar.",
    });
  }

  if (userinfo) {
    findings.push({
      id: "userinfo",
      weight: LINK_RULES.userinfo,
      label: `Everything before the @ (\"${userinfo}\") is ignored — the real host is ${host}`,
      why: "The userinfo trick puts a trusted-looking name in front of an @ so the eye stops reading there.",
    });
  }

  if (!hasScheme || /^http:\/\//i.test(value)) {
    findings.push({
      id: "no-tls",
      weight: LINK_RULES["no-tls"],
      label: hasScheme ? "Plain http, not https" : "No https in the link as written",
      why: "https alone never proves identity, but a login or payment page without it is not a real one.",
    });
  }

  if (labels.length >= 5 && !IPV4.test(host)) {
    findings.push({
      id: "deep-subdomain",
      weight: LINK_RULES["deep-subdomain"],
      label: `${labels.length} labels deep, which pushes the real domain off a phone screen`,
      why: "Long subdomain chains are used so the visible start of the address reads like the brand.",
    });
  }

  if (HIGH_ABUSE_TLDS.includes(tld) && !official) {
    findings.push({
      id: "abuse-tld",
      weight: LINK_RULES["abuse-tld"],
      label: `.${tld} is a cheap bulk-registration TLD common in abuse reports`,
      why: "Weak on its own, meaningful next to a borrowed brand name.",
    });
  }

  if (/\.apk(\?|$|\/)/i.test(path)) {
    findings.push({
      id: "apk-file",
      weight: LINK_RULES["apk-file"],
      label: "The link ends in an .apk file for manual installation",
      why: `Sideloaded apps read your SMS and can drive the screen; ${ENTITY.subjectSingular} never ships one this way.`,
    });
  }

  const score = findings.reduce((sum, item) => sum + item.weight, 0);
  return { input: rawUrl.trim(), url: value, host, registrable, tld, official, findings, score };
}



/* ------------------------------------------------------------------ *
 * Message markers
 * ------------------------------------------------------------------ */

/**
 * Weighted markers for this scam family. Weights are ranked by how strongly a
 * marker separates a scam from a genuine discom reminder — a screen-share
 * request is decisive, the word "bill" is not.
 */
export const MARKERS = [
  {
    id: "remote-access",
    label: "Asks you to install AnyDesk, QuickSupport or another screen-share tool",
    weight: 14,
    category: "Takeover",
    test: (t) => /\b(anydesk|teamviewer|quicksupport|rustdesk|airdroid|screen[\s-]?shar|remote (?:access|desktop|support))\b/.test(t),
    why: "No billing problem is solved from inside your phone. The app shows the caller your screen and your incoming SMS.",
  },
  {
    id: "upi-pin",
    label: "Asks for a UPI PIN, or to approve a collect request",
    weight: 13,
    category: "Payment theft",
    test: (t) => /\b(upi pin|mpin|approve the (?:collect )?request|accept the request|scan (?:the )?qr|enter (?:your )?pin to (?:verify|receive|confirm))\b/.test(t),
    why: "A UPI PIN only ever sends money. Verifying a meter or a connection never needs one.",
  },
  {
    id: "apk",
    label: "Points at an APK or an app to install outside the store",
    weight: 12,
    category: "Malware",
    test: (t) => /\.apk\b|\binstall (?:this|the|our) app\b|\bsideload\b|\benable unknown sources\b/.test(t),
    why: "A sideloaded 'bill update' app reads incoming SMS and can operate the screen itself.",
  },
  {
    id: "otp-share",
    label: "Asks you to share, forward or read out an OTP",
    weight: 12,
    category: "Credential theft",
    test: (t) =>
      /\b(otp|one[\s-]?time (?:password|pin)|verification code)\b/.test(t) &&
      /\b(share|send|forward|tell|read out|provide|confirm|give|reply with)\b/.test(t),
    why: "A utility never needs an OTP from you; the one being requested belongs to your bank.",
  },
  {
    id: "token-payment",
    label: "Proposes a small test or verification payment",
    weight: 11,
    category: "Payment theft",
    test: (t) =>
      /\b(?:rs\.?\s?|inr\s?|₹\s?)(?:1|2|5|10|20)\b[^\n]{0,40}\b(verif|test|confirm|activat|validat|updat)/.test(t) ||
      /\b(test|token|verification)\s+(?:payment|transaction|amount)\b/.test(t),
    why: "The figure on the screen is not the figure being authorised, and no meter is verified by a payment.",
  },
  {
    id: "card-details",
    label: "Asks for card number, expiry or CVV",
    weight: 10,
    category: "Payment theft",
    test: (t) => /\b(cvv|cvc|card (?:no|number|details)|expiry (?:date)?|debit card|credit card)\b/.test(t),
    why: "Bill payments run through BBPS or the discom's own gateway, which never collects a CVV by message.",
  },
  {
    id: "disconnect-threat",
    label: "Threatens disconnection, or that the supply will be cut",
    weight: 9,
    category: "Pressure",
    test: (t) => /\b(disconnect\w*|power (?:will be )?cut|supply (?:will be )?(?:cut|stopped|discontinued)|connection (?:will be )?(?:cut|terminated|stopped))\b/.test(t),
    why: "Real disconnection follows a printed notice with a due date, not an SMS with a same-night hour.",
  },
  {
    id: "tonight-deadline",
    label: "Sets a same-night or same-day deadline",
    weight: 8,
    category: "Pressure",
    test: (t) => /\b(tonight|today|within \d+\s*(?:hour|hrs|hours|minutes|mins)|before \d{1,2}[:.]?\d{0,2}\s?(?:am|pm)|immediately|urgent(?:ly)?)\b/.test(t),
    why: "The clock exists so you call the number in the message instead of the one on your bill.",
  },
  {
    id: "mobile-callback",
    label: "Gives a personal mobile or WhatsApp number as the officer to call",
    weight: 8,
    category: "Impersonation",
    test: (t) => /\b(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b/.test(t) && /\b(call|contact|whatsapp|officer|engineer|executive|lineman|helpline|support)\b/.test(t),
    why: "The SMS exists only to make you dial. Discom helplines are 1912 or the toll-free number on the bill.",
  },
  {
    id: "no-consumer-number",
    label: "Talks about your bill without a consumer number or an amount",
    weight: 8,
    category: "Impersonation",
    test: (t) =>
      /\b(bill|electricity|power|connection|meter)\b/.test(t) &&
      !/\b(consumer (?:no|number|id)|ca (?:no|number)|k\s?no|account (?:no|number)|bill (?:no|number))\b/.test(t),
    why: "A genuine discom message is generated from your billing record and always quotes the connection it refers to.",
  },
  {
    id: "bill-not-updated",
    label: "Uses the vague \"bill not updated\" phrasing",
    weight: 7,
    category: "Bait",
    test: (t) => /\b(not updated|update (?:your |the )?bill|previous month bill|last month(?:'s)? bill|pending (?:bill|amount|dues?))\b/.test(t),
    why: "\"Not updated\" is deliberately meaningless — it cannot be checked, and it explains any amount the caller later names.",
  },
  {
    id: "click-link",
    label: "Pushes you to a link rather than the discom's app or BBPS",
    weight: 6,
    category: "Delivery",
    test: (t) => /\b(click (?:here|the link|below)|tap (?:here|the link)|pay (?:here|now|online)|visit (?:the )?link|update here)\b/.test(t),
    why: "Pay through the discom's own app, its website typed by hand, or any BBPS-enabled app you already use.",
  },
  {
    id: "whatsapp-shift",
    label: "Moves the conversation to WhatsApp",
    weight: 6,
    category: "Delivery",
    test: (t) => /\b(whatsapp|w\.?app|send (?:me )?(?:a )?(?:screenshot|photo) of)\b/.test(t),
    why: "WhatsApp gets the exchange away from the operator's audited channels and makes the screenshot request feel normal.",
  },
];

/** Verdict bands, in absolute weighted points. */
export const BANDS = [
  {
    id: "critical",
    min: 30,
    label: "Almost certainly a scam",
    hint: "Multiple decisive markers. Do not call the number in the message; use the helpline printed on your bill.",
  },
  {
    id: "high",
    min: 18,
    label: "Very likely a scam",
    hint: "This is built like the disconnection-tonight funnel. Check your dues in the discom's own app instead.",
  },
  {
    id: "medium",
    min: 9,
    label: "Suspicious",
    hint: "Some markers present. A genuine notice quotes your consumer number and an exact amount.",
  },
  {
    id: "low",
    min: 3,
    label: "A few weak markers",
    hint: "Nothing decisive, but verify the dues on your bill or in a BBPS-enabled app before paying anything.",
  },
  {
    id: "clean",
    min: 0,
    label: "No scam markers found",
    hint: "This checks for known markers only. A clean result is not proof the message is genuine.",
  },
];

export const MAX_MARKER_SCORE = MARKERS.reduce((sum, marker) => sum + marker.weight, 0);

/** Longest message the scanner will read, so a pasted book cannot hang the page. */
export const MAX_INPUT_LENGTH = 8000;

export function bandFor(score) {
  const value = Number.isFinite(score) ? Math.max(0, score) : 0;
  return BANDS.find((band) => value >= band.min) || BANDS[BANDS.length - 1];
}

/**
 * Score a pasted message against the markers and any links it contains.
 *
 * @param {string} text the message as received.
 * @returns {object} the verdict, or { error } for unusable input.
 */
export function analyzeMessage(text) {
  if (typeof text !== "string") {
    return { error: "Paste the message as text." };
  }
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return { error: "Paste the message you received to scan it." };
  }
  if (trimmed.length > MAX_INPUT_LENGTH) {
    return {
      error: `That is longer than ${MAX_INPUT_LENGTH} characters — paste just the message, not the whole thread.`,
    };
  }

  const haystack = refang(trimmed).toLowerCase();

  const matched = [];
  const missed = [];
  for (const marker of MARKERS) {
    let hit = false;
    try {
      hit = Boolean(marker.test(haystack));
    } catch {
      hit = false;
    }
    if (hit) matched.push(marker);
    else missed.push(marker);
  }

  const markerScore = matched.reduce((sum, marker) => sum + marker.weight, 0);

  const links = extractUrls(trimmed).map((url) => inspectLink(url));
  const usableLinks = links.filter((link) => !link.error);
  const linkScore = usableLinks.reduce((sum, link) => sum + link.score, 0);

  const score = markerScore + linkScore;
  const band = bandFor(score);
  const maxScore = MAX_MARKER_SCORE;
  const percent = Math.min(100, Math.round((score / maxScore) * 100));

  const categories = [];
  for (const marker of matched) {
    const existing = categories.find((entry) => entry.name === marker.category);
    if (existing) existing.weight += marker.weight;
    else categories.push({ name: marker.category, weight: marker.weight });
  }
  categories.sort((a, b) => b.weight - a.weight);

  const worstLink = usableLinks.reduce(
    (worst, link) => (worst === null || link.score > worst.score ? link : worst),
    null
  );

  return {
    length: trimmed.length,
    score,
    markerScore,
    linkScore,
    maxScore,
    percent,
    band: band.id,
    bandLabel: band.label,
    bandHint: band.hint,
    matched,
    missed,
    categories,
    links: usableLinks,
    worstLink,
    officialLinkFound: usableLinks.some((link) => link.official),
  };
}



/* ------------------------------------------------------------------ *
 * What to do instead
 * ------------------------------------------------------------------ */

/** How a real distribution company actually communicates. */
export const REAL_BEHAVIOUR = [
  "Quotes your consumer number or CA number and the exact amount due, because the message is generated from your billing record.",
  "Names itself — BSES Rajdhani, MSEDCL, Tata Power-DDL, UPPCL and the rest all have names; \"the Electricity Board\" is not one of them.",
  "Gives notice with a due date on the bill itself, rather than announcing a cut for the same evening.",
  "Publishes a helpline you can find independently; 1912 reaches the electricity complaint line in most states, and the toll-free number is printed on your bill.",
  "Accepts payment through its own app or website and through any BBPS-enabled app, never through a link sent by an individual.",
  "Never asks for a UPI PIN, an OTP, a CVV or a screen-sharing code — no lineman needs any of them.",
];

/** Reporting routes in India. */
export const REPORTING = [
  {
    label: "Call 1930",
    detail:
      "The national cyber-crime helpline. If a UPI request was approved or money left the account, calling within the first hours gives the best chance of a freeze on the receiving account.",
  },
  {
    label: "cybercrime.gov.in",
    detail: "File the complaint in writing on the National Cyber Crime Reporting Portal, with screenshots of the message and the number that called.",
  },
  {
    label: "Your discom, on the number on your bill",
    detail: "Confirm the actual dues and report the impersonation; most operators publish fraud warnings and want the number reported.",
  },
  {
    label: "Uninstall the remote-access app",
    detail: "If QuickSupport, AnyDesk or similar was installed, remove it, change banking passwords from another device, and check for new UPI mandates.",
  },
  {
    label: "Sanchar Saathi (Chakshu)",
    detail: "Report the fraudulent SMS or call so the sending number can be acted on.",
  },
];
