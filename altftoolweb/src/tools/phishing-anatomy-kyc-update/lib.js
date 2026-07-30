/**
 * KYC Update Phishing Anatomy — specimen teardown and a scam-marker scanner.
 *
 * Pure module: no React, no DOM, no clock reads, no network. Same input, same
 * output. Every exported function is total — unusable input returns { error }
 * rather than NaN or a number that looks like a verdict.
 *
 * The scanner is a weighted rule engine, not a classifier: it reports which
 * documented markers of the re-KYC family appear in a message and how heavily
 * each is weighted. It cannot prove a message is genuine.
 */

/* ------------------------------------------------------------------ *
 * The specimen
 * ------------------------------------------------------------------ */

/**
 * A composite of the "KYC expired, account will be blocked today" message
 * reported to Indian banks, wallets and the cybercrime portal. Hostnames are
 * defanged (with [.] instead of .) so nothing here is clickable, and the phone
 * number is redacted.
 */
export const SPECIMEN = {
  channel: "SMS, often repeated on WhatsApp",
  senderLabel: "BX-KYCUPD",
  context:
    "Sent in the afternoon with a same-day deadline, so the branch closes before you can ask anyone.",
  lines: [
    { text: "Dear Customer, your bank KYC has EXPIRED as per RBI guidelines.", signal: "rbi-claim" },
    {
      text: "Your account and net banking will be BLOCKED today at 6pm.",
      signal: "block-deadline",
    },
    {
      text: "Complete re-KYC now: http://kyc-update-verify[.]xyz/form",
      signal: "lookalike-domain",
    },
    {
      text: "Enter your full Aadhaar number, PAN and date of birth in the form.",
      signal: "identity-harvest",
    },
    {
      text: "Or install AnyDesk QuickSupport and share the 9-digit code with our executive for assisted KYC.",
      signal: "remote-access",
    },
    {
      text: "A verification transaction of Rs.1 will be sent - approve it with your UPI PIN to confirm the account is active.",
      signal: "one-rupee-test",
    },
    {
      text: "For assistance call 9x-xxxxx-xxxxx (Emp Code KYC/2231).",
      signal: "callback-mobile",
    },
    { text: "- Customer Verification Dept", signal: "fake-department" },
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
    id: "rbi-claim",
    label: "Invoking RBI to make it sound official",
    severity: "high",
    what: "\"As per RBI guidelines\" with no circular, date or reference.",
    why:
      "The Reserve Bank does not hold retail accounts and never writes to individual customers about KYC. Periodic updation is real, but it is your own bank's obligation and it runs on a cycle of years — high-risk customers at least every two years, medium risk every eight, low risk every ten — not on a same-day SMS.",
  },
  {
    id: "block-deadline",
    label: "Account blocked today, at a named hour",
    severity: "high",
    what: "\"Will be BLOCKED today at 6pm.\"",
    why:
      "The hour is chosen so branches shut before you can ask. Real periodic KYC reminders arrive weeks or months ahead, repeat, and tell you to visit a branch or use the bank's own app — they do not hinge on one evening.",
  },
  {
    id: "lookalike-domain",
    label: "A KYC form on a domain no bank owns",
    severity: "critical",
    what: "kyc-update-verify[.]xyz — sometimes a Google Form or a free page builder instead.",
    why:
      "Only the registrable domain immediately before the first single slash decides who is collecting the data. No bank collects KYC on a generic .xyz page, and none of them collects it on a public form service.",
  },
  {
    id: "identity-harvest",
    label: "Full Aadhaar, PAN and date of birth in one form",
    severity: "critical",
    what: "The complete identity set, typed into a page reached from an SMS.",
    why:
      "That combination is enough to open accounts, take small-ticket loans and pass telephone verification in your name. Your bank already holds these details, so a genuine update never needs you to retype the whole set into a web form.",
  },
  {
    id: "remote-access",
    label: "AnyDesk or QuickSupport for \"assisted KYC\"",
    severity: "critical",
    what: "Install a screen-sharing app and read out the nine-digit code.",
    why:
      "That code is the session key. Once it is shared, the caller sees your screen, your SMS and your banking app in real time and can operate them while talking you through a fake form. This single step is the most common ending of the KYC scam.",
  },
  {
    id: "one-rupee-test",
    label: "A one-rupee \"verification\" that needs your UPI PIN",
    severity: "critical",
    what: "\"Approve the Rs.1 request with your UPI PIN.\"",
    why:
      "A UPI PIN is only ever needed to send money, never to receive or verify. The collect request you approve can carry any amount, and approving it is an instruction to pay — the rupee is theatre.",
  },
  {
    id: "callback-mobile",
    label: "A mobile number and an invented employee code",
    severity: "medium",
    what: "\"Emp Code KYC/2231\" attached to a ten-digit mobile.",
    why:
      "The code exists to survive a challenge: it sounds checkable and is not. Bank helplines are the 1800 or 1860 numbers printed on your card and on the official site.",
  },
  {
    id: "fake-department",
    label: "A department that does not exist",
    severity: "medium",
    what: "\"Customer Verification Dept\", with no bank name and no ticket reference.",
    why:
      "Note that the message never names your actual bank. It cannot — it was blasted to a leaked phone list, and a specific wrong bank would give the game away.",
  },
  {
    id: "sender-header",
    label: "A generic sender header",
    severity: "medium",
    what: "BX-KYCUPD rather than the header your bank normally uses.",
    why:
      "Compare it against an older message from the same bank in your inbox. The genuine thread already on your phone is the reference, not the new message asking you to hurry.",
  },
];

/* ------------------------------------------------------------------ *
 * Link inspection
 * ------------------------------------------------------------------ */

/** Domains that genuinely handle KYC or identity for Indian consumers. */
export const OFFICIAL_DOMAINS = [
  "rbi.org.in",
  "uidai.gov.in",
  "incometax.gov.in",
  "onlinesbi.sbi",
  "sbi.co.in",
  "hdfcbank.com",
  "icicibank.com",
  "axisbank.com",
  "kotak.com",
  "pnbindia.in",
  "bankofbaroda.in",
  "paytm.com",
  "paytmbank.com",
  "phonepe.com",
  "mobikwik.com",
  "cvlkra.com",
  "camskra.com",
  "npci.org.in",
];

/** Brand and process words a KYC-phishing domain borrows. */
export const BRAND_TOKENS = [
  "kyc",
  "rekyc",
  "re-kyc",
  "rbi",
  "uidai",
  "aadhaar",
  "aadhar",
  "pancard",
  "paytm",
  "phonepe",
  "mobikwik",
  "sbi",
  "hdfc",
  "icici",
  "axis",
  "kotak",
  "netbanking",
];

/** Wording used in the link findings for this scam family. */
export const ENTITY = {
  words: "KYC",
  subjectPlural: "Banks and wallets",
  subjectSingular: "a bank",
  possessive: "A bank's",
  pathWords: /kyc|aadhaar|aadhar|pan|verify|update|account|form/,
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
 * marker separates a scam from a genuine periodic-KYC reminder — a remote-access
 * request is decisive, the word KYC on its own is not.
 */
export const MARKERS = [
  {
    id: "remote-access",
    label: "Asks you to install AnyDesk, QuickSupport or another screen-share tool",
    weight: 14,
    category: "Takeover",
    test: (t) => /\b(anydesk|teamviewer|quicksupport|rustdesk|airdroid|screen[\s-]?shar|remote (?:access|desktop|support))\b/.test(t),
    why: "The nine-digit code is a session key. Sharing it hands over your screen, your SMS and your banking app at once.",
  },
  {
    id: "upi-pin",
    label: "Asks for a UPI PIN, or to approve a collect request",
    weight: 13,
    category: "Payment theft",
    test: (t) => /\b(upi pin|mpin|approve the (?:collect )?request|accept the request|scan (?:the )?qr|enter (?:your )?pin to (?:verify|receive|confirm))\b/.test(t),
    why: "A UPI PIN is only ever required to send money. Nothing you receive or verify needs it.",
  },
  {
    id: "one-rupee",
    label: "Proposes a token Rs.1 or Rs.10 verification transaction",
    weight: 12,
    category: "Payment theft",
    test: (t) => /\b(?:rs\.?\s?|inr\s?|₹\s?)(?:1|2|5|10)\b[^\n]{0,40}\b(verif|test|confirm|activat|validat)/.test(t) ||
      /\b(verification|test|token)\s+(?:transaction|payment|amount)\b/.test(t),
    why: "The amount displayed is not the amount authorised; the request you approve can carry any figure.",
  },
  {
    id: "apk",
    label: "Points at an APK or an app to install outside the store",
    weight: 12,
    category: "Malware",
    test: (t) => /\.apk\b|\binstall (?:this|the|our) app\b|\bsideload\b|\benable unknown sources\b|\bdownload the kyc app\b/.test(t),
    why: "A sideloaded KYC app reads incoming SMS and can drive the screen, which is how the OTP is captured.",
  },
  {
    id: "otp-share",
    label: "Asks you to share, forward or read out an OTP",
    weight: 12,
    category: "Credential theft",
    test: (t) =>
      /\b(otp|one[\s-]?time (?:password|pin)|verification code)\b/.test(t) &&
      /\b(share|send|forward|tell|read out|provide|confirm|give|reply with)\b/.test(t),
    why: "No bank employee is permitted to ask for an OTP, during a KYC update or at any other time.",
  },
  {
    id: "card-secrets",
    label: "Asks for card number, CVV, PIN or net banking password",
    weight: 11,
    category: "Credential theft",
    test: (t) => /\b(cvv|cvc|atm pin|card pin|debit card (?:no|number)|card number|net\s?banking password|login password|user\s?id)\b/.test(t),
    why: "KYC is identity paperwork; it never involves card secrets or a login, and no bank asks for them.",
  },
  {
    id: "identity-set",
    label: "Asks for full Aadhaar or PAN through a link or a reply",
    weight: 10,
    category: "Identity theft",
    test: (t) => /\b(aadhaar|aadhar|pan (?:card|number|no)|date of birth|dob)\b/.test(t) && /\b(enter|send|share|upload|fill|reply|submit|type)\b/.test(t),
    why: "Your bank already holds these; being asked to retype the whole set into a web form is the tell.",
  },
  {
    id: "rbi-authority",
    label: "Cites RBI, a circular or a government mandate as the reason",
    weight: 9,
    category: "Impersonation",
    test: (t) => /\b(rbi|reserve bank|as per (?:the )?(?:new )?(?:guidelines|mandate|circular|govt|government)|regulatory (?:mandate|requirement))\b/.test(t),
    why: "The Reserve Bank holds no retail accounts and never writes to customers about their KYC.",
  },
  {
    id: "public-form",
    label: "Sends you to a public form service instead of the bank's own site",
    weight: 8,
    category: "Delivery",
    test: (t) => /\b(docs\.google\.com\/forms|forms\.gle|google form|typeform|jotform|surveymonkey|wufoo)\b/.test(t),
    why: "No regulated institution collects identity documents on a free public form; anyone can build one in five minutes.",
  },
  {
    id: "block-threat",
    label: "Threatens that the account will be blocked, frozen or deactivated",
    weight: 8,
    category: "Pressure",
    test: (t) => /\b(block(?:ed|ing)?|suspend(?:ed)?|freez(?:e|ing|ed)|deactivat\w*|will be closed|will be stopped|dormant)\b/.test(t) && /\b(account|kyc|net\s?banking|wallet|card)\b/.test(t),
    why: "Losing access is the lever. Genuine reminders repeat over weeks and never depend on one evening.",
  },
  {
    id: "deadline",
    label: "Sets a same-day or few-hour deadline",
    weight: 7,
    category: "Pressure",
    test: (t) => /\b(today|tonight|within \d+\s*(?:hour|hrs|hours|minutes|mins)|before \d{1,2}\s?(?:am|pm)|immediately|urgent(?:ly)?|last (?:day|chance|warning)|expires? (?:today|tonight))\b/.test(t),
    why: "The clock exists to stop you calling the number printed on your card.",
  },
  {
    id: "mobile-callback",
    label: "Gives a personal mobile number, often with an employee code",
    weight: 7,
    category: "Impersonation",
    test: (t) => /\b(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b/.test(t) && /\b(call|contact|whatsapp|executive|officer|customer care|helpline|support)\b/.test(t),
    why: "The employee code sounds checkable and is not; real helplines are 1800 or 1860 numbers printed on the card.",
  },
  {
    id: "kyc-expiry",
    label: "Claims KYC has expired, using no bank name",
    weight: 6,
    category: "Bait",
    test: (t) => /\b(kyc|re-?kyc|know your customer)\b/.test(t) && /\b(expir\w*|lapsed|pending|incomplete|not updated|failed)\b/.test(t),
    why: "Periodic updation is real, but your bank names itself and gives you branch, app and post options.",
  },
];

/** Verdict bands, in absolute weighted points. */
export const BANDS = [
  {
    id: "critical",
    min: 30,
    label: "Almost certainly a scam",
    hint: "Multiple decisive markers. Do not install anything, do not approve any request, and call your bank on the number on your card.",
  },
  {
    id: "high",
    min: 18,
    label: "Very likely a scam",
    hint: "This is built like the re-KYC funnel. Any real KYC update can wait until you have called the bank yourself.",
  },
  {
    id: "medium",
    min: 9,
    label: "Suspicious",
    hint: "Some markers present. Verify through your bank's app or branch, never through this message.",
  },
  {
    id: "low",
    min: 3,
    label: "A few weak markers",
    hint: "Nothing decisive, but a genuine KYC reminder names your bank and never needs a link.",
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

/** How periodic KYC actually works for a bank customer in India. */
export const REAL_BEHAVIOUR = [
  "Periodic KYC updation runs on a cycle of years under the RBI Master Direction — at least every two years for high-risk customers, eight for medium risk and ten for low risk — not on a same-day deadline.",
  "Where nothing about your KYC details has changed, RBI has allowed banks to accept a self-declaration of no change through registered email, registered mobile, ATM, net banking or the branch.",
  "Your bank names itself, quotes your customer ID or masked account number, and offers branch, app and post as options.",
  "The Reserve Bank of India holds no individual accounts and never contacts customers about their KYC.",
  "No bank asks for an OTP, a UPI PIN, a CVV or a screen-sharing code — during KYC or at any other time.",
  "Banking and KYC apps are distributed only through the Google Play Store or the Apple App Store.",
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
    detail: "File the complaint in writing on the National Cyber Crime Reporting Portal, with screenshots of the message.",
  },
  {
    label: "Your bank's own helpline",
    detail: "Use the number printed on your card. Ask for net banking to be locked and for any UPI mandate created in the last few hours to be revoked.",
  },
  {
    label: "Uninstall the remote-access app",
    detail: "If AnyDesk, QuickSupport or similar was installed, remove it, change the banking passwords from a different device, and check for new UPI mandates and beneficiaries.",
  },
  {
    label: "Sanchar Saathi (Chakshu)",
    detail: "Report the fraudulent SMS or call itself so the sender header and number can be acted on.",
  },
];
