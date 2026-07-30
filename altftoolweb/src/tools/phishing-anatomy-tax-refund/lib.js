/**
 * Income Tax Refund Phishing Anatomy — specimen teardown and a scam-marker scanner.
 *
 * Pure module: no React, no DOM, no clock reads, no network. Same input, same
 * output. Every exported function is total — unusable input returns { error }
 * rather than NaN or a number that looks like a verdict.
 *
 * The scanner is a weighted rule engine, not a classifier: it reports which
 * documented markers of the refund-notice family appear in a message and how
 * heavily each is weighted. It cannot prove a message is genuine.
 */

/* ------------------------------------------------------------------ *
 * The specimen
 * ------------------------------------------------------------------ */

/**
 * A composite of the "your refund has been approved, update your bank
 * account" message reported around every filing season. Hostnames are defanged
 * (with [.] instead of .) so nothing here is clickable, and the figures are
 * illustrative.
 */
export const SPECIMEN = {
  channel: "SMS and email, usually within days of the filing deadline",
  senderLabel: "refund-cpc@incometaxindia-refund[.]online",
  context:
    "Timed to the weeks when millions of people are genuinely waiting for a refund and will not be surprised to hear about one.",
  lines: [
    {
      text: "INCOME TAX DEPARTMENT: Your refund of Rs.15,490 for AY 2024-25 has been approved.",
      signal: "refund-bait",
    },
    {
      text: "The amount could not be credited because your bank account details do not match our records.",
      signal: "mismatch-pretext",
    },
    {
      text: "Update your account number and IFSC here: http://incometaxindia-refund[.]online/claim",
      signal: "lookalike-domain",
    },
    {
      text: "Login with your net banking user ID and password to validate the account.",
      signal: "credential-harvest",
    },
    {
      text: "Claim within 24 hours or the refund will be cancelled and returned to the treasury.",
      signal: "deadline",
    },
    {
      text: "For faster processing install ITR-Refund-Claim.apk from the same page.",
      signal: "apk-sideload",
    },
    { text: "- CPC Refund Cell", signal: "no-din" },
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
    id: "refund-bait",
    label: "A precise refund amount you did not calculate",
    severity: "high",
    what: "\"Rs.15,490 for AY 2024-25 has been approved.\"",
    why:
      "An odd, specific figure reads as machine-generated and therefore true. It is a guess: sent to a bought list in the weeks when a large share of recipients really are waiting for a refund, some of the guesses will land close enough to be believed.",
  },
  {
    id: "mismatch-pretext",
    label: "A bank-account mismatch that only you can fix",
    severity: "high",
    what: "\"The amount could not be credited because your details do not match.\"",
    why:
      "It converts good news into a task. In reality a refund is credited only to a bank account you have already pre-validated on the e-filing portal and linked to your PAN — the department does not collect fresh account details over a message.",
  },
  {
    id: "lookalike-domain",
    label: "A domain that is not the e-filing portal",
    severity: "critical",
    what: "incometaxindia-refund[.]online, with the brand words used as decoration.",
    why:
      "Only the registrable domain immediately before the first single slash decides who is collecting the data. Indian tax filing lives on incometax.gov.in — a .gov.in address that no private party can register — and a .online lookalike is not it.",
  },
  {
    id: "credential-harvest",
    label: "Net banking login, on a tax page",
    severity: "critical",
    what: "User ID and password \"to validate the account\".",
    why:
      "There is no step in any refund process where the tax department needs your banking login. This is the actual objective; the refund story exists to make typing it feel reasonable.",
  },
  {
    id: "deadline",
    label: "A refund that expires in 24 hours",
    severity: "high",
    what: "\"Or the refund will be cancelled and returned to the treasury.\"",
    why:
      "Refunds do not lapse overnight. If a refund fails, the portal shows the failure and lets you revalidate the account at your own pace — there is no forfeiture clock.",
  },
  {
    id: "apk-sideload",
    label: "A refund app to sideload",
    severity: "critical",
    what: "ITR-Refund-Claim.apk from the same page.",
    why:
      "The APK asks for SMS and accessibility permissions, then reads incoming OTPs and can drive the screen. The department has no such app, and nothing about a refund requires installing software.",
  },
  {
    id: "no-din",
    label: "No DIN, no PAN, no acknowledgement number",
    severity: "critical",
    what: "Signed \"CPC Refund Cell\" with nothing you can verify.",
    why:
      "Every communication issued by the Income Tax Department since 1 October 2019 carries a computer-generated Document Identification Number, and one without a valid DIN is treated as never issued. You can check any notice or order under \"Authenticate notice/order issued by ITD\" on the e-filing portal.",
  },
  {
    id: "sender-domain",
    label: "A from-address built to be misread",
    severity: "high",
    what: "refund-cpc@incometaxindia-refund[.]online.",
    why:
      "The eye stops at the familiar words and skips the domain after the @, which is the only part that identifies the sender. Genuine departmental mail comes from the incometax.gov.in family of addresses.",
  },
];

/* ------------------------------------------------------------------ *
 * Link inspection
 * ------------------------------------------------------------------ */

/** Domains genuinely used for Indian income-tax filing, refunds and PAN. */
export const OFFICIAL_DOMAINS = [
  "incometax.gov.in",
  "incometaxindia.gov.in",
  "tin-nsdl.com",
  "utiitsl.com",
  "nsdl.co.in",
  "gov.in",
  "npci.org.in",
];

/** Brand and process words a refund-phishing domain borrows. */
export const BRAND_TOKENS = [
  "incometax",
  "income-tax",
  "itdepartment",
  "itr",
  "taxrefund",
  "refund",
  "cpc",
  "tin-nsdl",
  "efiling",
  "e-filing",
  "pancard",
  "cbdt",
];

/** Wording used in the link findings for this scam family. */
export const ENTITY = {
  words: "Tax",
  subjectPlural: "Tax authorities",
  subjectSingular: "the tax department",
  possessive: "A government portal's",
  pathWords: /refund|itr|tax|claim|efil|pan|verify|account/,
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
 * marker separates a scam from a genuine departmental communication — a request
 * for a banking login is decisive, the word "refund" is not.
 */
export const MARKERS = [
  {
    id: "netbanking-login",
    label: "Asks for a net banking user ID or password",
    weight: 13,
    category: "Credential theft",
    test: (t) => /\b(net\s?banking (?:id|login|user\s?id|password|credentials)|internet banking (?:id|login|password)|user\s?id and password|login (?:id|credentials))\b/.test(t),
    why: "No stage of any refund needs your banking login. The refund story exists to make typing it feel reasonable.",
  },
  {
    id: "card-details",
    label: "Asks for card number, expiry, CVV or ATM PIN",
    weight: 12,
    category: "Credential theft",
    test: (t) => /\b(cvv|cvc|atm pin|card pin|debit card (?:no|number)|credit card (?:no|number)|card number|expiry date)\b/.test(t),
    why: "The department credits money to a bank account; it has no use for a card at all.",
  },
  {
    id: "otp-share",
    label: "Asks you to share, forward or read out an OTP",
    weight: 12,
    category: "Credential theft",
    test: (t) =>
      /\b(otp|one[\s-]?time (?:password|pin)|verification code)\b/.test(t) &&
      /\b(share|send|forward|tell|read out|provide|confirm|give|reply with)\b/.test(t),
    why: "Any OTP in play here belongs to your bank, and no government office ever asks for one.",
  },
  {
    id: "apk",
    label: "Points at an APK or an app to install outside the store",
    weight: 12,
    category: "Malware",
    test: (t) => /\.apk\b|\binstall (?:this|the|our) app\b|\bsideload\b|\benable unknown sources\b/.test(t),
    why: "There is no refund app. A sideloaded one reads incoming SMS and can operate the screen itself.",
  },
  {
    id: "remote-access",
    label: "Asks you to install AnyDesk, QuickSupport or another screen-share tool",
    weight: 12,
    category: "Takeover",
    test: (t) => /\b(anydesk|teamviewer|quicksupport|rustdesk|screen[\s-]?shar|remote (?:access|desktop|support))\b/.test(t),
    why: "No refund is processed by letting a stranger watch or drive your screen.",
  },
  {
    id: "bank-account-ask",
    label: "Asks you to submit account number and IFSC through a link",
    weight: 10,
    category: "Data harvest",
    test: (t) => /\b(ifsc|account (?:no|number)|bank details|re-?validate (?:your )?(?:bank )?account|update (?:your )?(?:bank )?account)\b/.test(t) && /\b(link|here|form|page|click|update|submit|enter)\b/.test(t),
    why: "Refunds go only to a bank account already pre-validated on the e-filing portal and linked to your PAN.",
  },
  {
    id: "no-din",
    label: "Talks about a notice, order or refund without a DIN",
    weight: 9,
    category: "Impersonation",
    test: (t) =>
      /\b(notice|order|intimation|refund|assessment|demand)\b/.test(t) &&
      !/\b(din|document identification (?:no|number)|acknowledgement (?:no|number)|ack no)\b/.test(t),
    why: "Every departmental communication issued since 1 October 2019 carries a Document Identification Number; one without a valid DIN is treated as never issued.",
  },
  {
    id: "refund-claim-link",
    label: "Asks you to claim or release a refund through a link",
    weight: 9,
    category: "Bait",
    test: (t) => /\b(claim (?:your )?refund|release (?:the |your )?refund|process (?:your )?refund|refund[^\n]{0,40}\b(?:approved|pending|on hold|failed|cancelled))\b/.test(t),
    why: "A genuine refund arrives in the pre-validated account with nothing to claim and nothing to click.",
  },
  {
    id: "deadline",
    label: "Says the refund lapses within hours or days",
    weight: 8,
    category: "Pressure",
    test: (t) => /\b(within \d+\s*(?:hour|hrs|hours|days)|before (?:today|tonight|midnight)|will (?:be )?(?:cancelled|lapse|expire|forfeit)|last (?:date|day|chance)|immediately|urgent(?:ly)?)\b/.test(t),
    why: "Refunds do not expire. A failed credit simply sits until you revalidate the account.",
  },
  {
    id: "pan-ask",
    label: "Asks for the full PAN, Aadhaar or date of birth in a form",
    weight: 8,
    category: "Data harvest",
    test: (t) => /\b(pan (?:card|no|number)|aadhaar|aadhar|date of birth|dob)\b/.test(t) && /\b(enter|submit|share|send|fill|upload|type|reply)\b/.test(t),
    why: "The department already holds your PAN — that is how the refund was computed in the first place.",
  },
  {
    id: "public-form",
    label: "Sends you to a public form service rather than the e-filing portal",
    weight: 7,
    category: "Delivery",
    test: (t) => /\b(docs\.google\.com\/forms|forms\.gle|google form|typeform|jotform|surveymonkey)\b/.test(t),
    why: "No government department collects taxpayer data on a free form anyone can create.",
  },
  {
    id: "click-link",
    label: "Pushes you to a link rather than to incometax.gov.in typed by hand",
    weight: 6,
    category: "Delivery",
    test: (t) => /\b(click (?:here|the link|below)|tap (?:here|the link)|visit (?:the )?link|update here|claim here|login here)\b/.test(t),
    why: "Type the portal address yourself; a link in an unexpected message is the whole attack surface.",
  },
  {
    id: "mobile-callback",
    label: "Gives a personal mobile or WhatsApp number as the tax office",
    weight: 6,
    category: "Impersonation",
    test: (t) => /\b(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b/.test(t) && /\b(call|contact|whatsapp|officer|executive|helpline|support)\b/.test(t),
    why: "The department's helpdesk numbers are published on incometax.gov.in; a mobile number in the message is the sender's own line.",
  },
];

/** Verdict bands, in absolute weighted points. */
export const BANDS = [
  {
    id: "critical",
    min: 30,
    label: "Almost certainly a scam",
    hint: "Multiple decisive markers. Do not log in from this message; check the refund status on the portal you type yourself.",
  },
  {
    id: "high",
    min: 18,
    label: "Very likely a scam",
    hint: "This is built like the refund funnel. Refund status lives in your e-filing account, nowhere else.",
  },
  {
    id: "medium",
    min: 9,
    label: "Suspicious",
    hint: "Some markers present. Authenticate any notice using the DIN check on the e-filing portal.",
  },
  {
    id: "low",
    min: 3,
    label: "A few weak markers",
    hint: "Nothing decisive, but a genuine communication carries a DIN and never needs a banking login.",
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

/** How the Income Tax Department actually communicates about refunds. */
export const REAL_BEHAVIOUR = [
  "Credits a refund only to a bank account you have already pre-validated on the e-filing portal and linked to your PAN.",
  "Puts a computer-generated Document Identification Number on every communication issued since 1 October 2019; a communication without a valid DIN is treated as never issued.",
  "Lets you verify any notice or order under \"Authenticate notice/order issued by ITD\" on incometax.gov.in.",
  "Shows refund status inside your own e-filing account — there is nothing to claim and no link to click.",
  "Never asks for a net banking login, a card number, a CVV, a PIN or an OTP, by email, SMS or phone.",
  "Uses gov.in addresses; incometax.gov.in cannot be registered by a private party, which is what makes it checkable.",
];

/** Reporting routes in India. */
export const REPORTING = [
  {
    label: "Call 1930",
    detail:
      "The national cyber-crime helpline. If banking credentials were entered or money left the account, calling within the first hours gives the best chance of a freeze on the receiving account.",
  },
  {
    label: "cybercrime.gov.in",
    detail: "File the complaint in writing on the National Cyber Crime Reporting Portal, with the message and the full link.",
  },
  {
    label: "Report the phishing mail to the department",
    detail: "The Income Tax Department publishes a phishing-report address on incometaxindia.gov.in; forward the mail with full headers rather than a screenshot.",
  },
  {
    label: "Your bank, on the number printed on the card",
    detail: "If a banking login or card was entered on the fake page, treat both as compromised and have them locked.",
  },
  {
    label: "Check the refund yourself",
    detail: "Log in at incometax.gov.in, typed by hand, and read the refund status there. Nothing in the message changes what the portal says.",
  },
];
