/**
 * Bank OTP Phishing Anatomy — specimen teardown and a scam-marker scanner.
 *
 * Pure module: no React, no DOM, no clock reads, no network. Same input, same
 * output. Every exported function is total — unusable input returns { error }
 * rather than NaN or a number that looks like a verdict.
 *
 * The scanner is a weighted rule engine, not a classifier: it reports which
 * documented scam markers appear in a message and how heavily each one is
 * weighted. It cannot prove a message is genuine, only that it carries the
 * markers this scam family is built from.
 */

/* ------------------------------------------------------------------ *
 * The specimen
 * ------------------------------------------------------------------ */

/**
 * A composite of the OTP/"account will be blocked" SMS reported to Indian
 * banks and to the national cybercrime portal. Hostnames are written defanged
 * (with [.] instead of .) so nothing here is clickable, and the bank name is a
 * placeholder rather than one real institution.
 */
export const SPECIMEN = {
  channel: "SMS",
  senderLabel: "VK-SBIINB",
  context:
    "Arrives at 9:14pm on a Sunday, when no branch is open and the customer cannot check with anyone.",
  lines: [
    { text: "Dear Customer,", signal: "generic-greeting" },
    {
      text: "Your NetBanking account has been SUSPENDED due to incomplete verification.",
      signal: "account-block-threat",
    },
    {
      text: "All debit and credit transactions will stop within 24 hours.",
      signal: "urgency-deadline",
    },
    {
      text: "Re-activate now: http://sbi-secure-verify[.]top/login",
      signal: "lookalike-domain",
    },
    {
      text: "Enter your User ID, Password, Debit Card no, CVV and DOB to confirm identity.",
      signal: "credential-harvest",
    },
    {
      text: "Share the OTP received on your registered mobile with our officer to complete verification.",
      signal: "otp-request",
    },
    {
      text: "For help call 9x-xxxxx-xxxxx (Customer Care).",
      signal: "callback-mobile",
    },
    {
      text: "Or install SBI-Secure-Update.apk from the link above for faster KYC.",
      signal: "apk-sideload",
    },
    { text: "- SBI Security Team", signal: "fake-department" },
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
    id: "generic-greeting",
    label: "No name, no masked account number",
    severity: "high",
    what: "It opens with \"Dear Customer\" and never says who you are.",
    why:
      "A bank that is genuinely writing about your account already knows your name and always quotes the last four digits of the account or card. A blast SMS sent to a leaked phone list cannot, because the sender does not know which bank you actually use.",
  },
  {
    id: "account-block-threat",
    label: "Suspension threat as the opening move",
    severity: "high",
    what: "The very first claim is that the account is already suspended.",
    why:
      "Fear collapses the gap between reading and clicking. Real suspension notices come after prior contact, arrive by post or in the banking app's message centre, and never depend on you acting from an SMS in the next few minutes.",
  },
  {
    id: "urgency-deadline",
    label: "A countdown that leaves no time to check",
    severity: "high",
    what: "\"Within 24 hours\" attaches a deadline to the threat.",
    why:
      "The deadline exists to stop you calling the number on the back of your card. Any message whose value depends on you not verifying it is the shape of a scam, whatever the subject.",
  },
  {
    id: "lookalike-domain",
    label: "A domain the bank does not own",
    severity: "critical",
    what: "sbi-secure-verify[.]top carries the brand name in a domain registered by someone else.",
    why:
      "The only part of a URL that decides where you land is the registrable domain immediately before the first single slash. \"sbi\" appearing as a word in a longer name means nothing — State Bank's netbanking lives on onlinesbi.sbi, and a .top address is not it.",
  },
  {
    id: "credential-harvest",
    label: "Asking for the full card and login set",
    severity: "critical",
    what: "User ID, password, card number, CVV and date of birth in one form.",
    why:
      "No bank ever needs all of these together, and no bank asks for CVV outside a merchant payment page. That combination is exactly what is needed to take over the account and pass a card-not-present check.",
  },
  {
    id: "otp-request",
    label: "Asking you to share the OTP",
    severity: "critical",
    what: "\"Share the OTP with our officer.\"",
    why:
      "The OTP is the last control standing between an attacker holding your password and a completed transfer. Genuine bank messages carry the opposite instruction — RBI-mandated alerts say never to share it, and no bank employee is permitted to ask for it.",
  },
  {
    id: "callback-mobile",
    label: "A personal mobile number as \"customer care\"",
    severity: "high",
    what: "A ten-digit mobile is given for help instead of the printed toll-free line.",
    why:
      "Bank helplines are 1800/1860 numbers printed on your card and on the official website. A mobile number in the message means the \"help\" is the same person who sent it.",
  },
  {
    id: "apk-sideload",
    label: "An APK to install outside the Play Store",
    severity: "critical",
    what: "SBI-Secure-Update.apk, downloaded from the same link.",
    why:
      "Sideloaded banking APKs ask for SMS and accessibility permissions, then read incoming OTPs and drive the screen themselves. This is the step that turns a phishing page into a drained account, and no bank distributes an app outside the Play Store or App Store.",
  },
  {
    id: "fake-department",
    label: "A department that does not exist",
    severity: "medium",
    what: "Signed \"SBI Security Team\" with no employee name or reference number.",
    why:
      "Genuine bank correspondence carries a service request or ticket reference you can quote back. An anonymous department name is there to sound official while staying unverifiable.",
  },
  {
    id: "sender-header",
    label: "A sender ID that looks close enough",
    severity: "medium",
    what: "VK-SBIINB in place of the header your bank normally uses.",
    why:
      "Indian commercial SMS uses six-character sender headers, and one wrong letter is invisible at a glance. Compare it with older messages from the same bank in your inbox — the genuine thread is the reference, not the message in front of you.",
  },
];

/* ------------------------------------------------------------------ *
 * Link inspection
 * ------------------------------------------------------------------ */

/** Domains State Bank and the UPI/NPCI rails actually use for customers. */
export const OFFICIAL_DOMAINS = [
  "onlinesbi.sbi",
  "sbi.co.in",
  "bank.sbi",
  "yono.sbi",
  "hdfcbank.com",
  "icicibank.com",
  "axisbank.com",
  "kotak.com",
  "pnbindia.in",
  "bankofbaroda.in",
  "unionbankofindia.co.in",
  "canarabank.com",
  "idfcfirstbank.com",
  "npci.org.in",
  "rbi.org.in",
];

/** Brand words a bank-phishing domain borrows to look plausible. */
export const BRAND_TOKENS = [
  "sbi",
  "hdfc",
  "icici",
  "axis",
  "kotak",
  "pnb",
  "baroda",
  "canara",
  "netbanking",
  "onlinebanking",
  "yono",
  "upi",
  "npci",
  "rbi",
];

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
  } else if (!brandInHost && !official && /sbi|bank|upi|kyc|secure|verify|login/.test(path.toLowerCase())) {
    findings.push({
      id: "brand-in-path-only",
      weight: LINK_RULES["brand-in-path-only"],
      label: `Bank words appear only after the slash, on ${registrable}`,
      why: "Anything after the first single slash is chosen by the site owner and proves nothing.",
    });
  }

  if (SHORTENERS.includes(registrable)) {
    findings.push({
      id: "shortener",
      weight: LINK_RULES.shortener,
      label: `${registrable} is a link shortener, so the real destination is hidden`,
      why: "Banks do not shorten links in customer messages; there is nothing to hide in a domain they own.",
    });
  }

  if (IPV4.test(host)) {
    findings.push({
      id: "ip-host",
      weight: LINK_RULES["ip-host"],
      label: "The address is a bare IP, with no domain name at all",
      why: "A bank's public site always has a name and a certificate to match it.",
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
      why: "https alone never proves identity, but a bank login page without it is not a bank login page.",
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
      why: "Weak on its own, meaningful next to a borrowed bank name.",
    });
  }

  if (/\.apk(\?|$|\/)/i.test(path)) {
    findings.push({
      id: "apk-file",
      weight: LINK_RULES["apk-file"],
      label: "The link ends in an .apk file for manual installation",
      why: "Sideloaded banking apps read your SMS and can drive the screen; no bank ships one this way.",
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
 * marker separates a scam from a genuine bank SMS — an OTP request is decisive,
 * a generic greeting is only suggestive.
 */
export const MARKERS = [
  {
    id: "otp-share",
    label: "Asks you to share, confirm or forward an OTP",
    weight: 14,
    category: "Credential theft",
    test: (t) =>
      /\b(otp|one[\s-]?time (?:password|pin)|verification code)\b/.test(t) &&
      /\b(share|send|forward|tell|provide|confirm|give|read out|reply with|enter)\b/.test(t),
    why: "No bank, and no bank employee, is permitted to ask for an OTP. This single marker is enough on its own.",
  },
  {
    id: "card-secrets",
    label: "Asks for CVV, PIN, card number or expiry",
    weight: 13,
    category: "Credential theft",
    test: (t) => /\b(cvv|cvc|atm pin|card pin|upi pin|mpin|debit card (?:no|number)|card number|expiry date)\b/.test(t),
    why: "CVV and PIN are never collected by a bank over SMS, email or a phone call.",
  },
  {
    id: "login-credentials",
    label: "Asks for user ID, password or net banking login",
    weight: 11,
    category: "Credential theft",
    test: (t) => /\b(user\s?id|username|password|net\s?banking (?:id|login|credentials)|login (?:id|details|credentials))\b/.test(t),
    why: "A genuine bank message never collects the login itself — you go to the app or the site you already use.",
  },
  {
    id: "apk",
    label: "Points at an APK or an app to install outside the store",
    weight: 12,
    category: "Malware",
    test: (t) => /\.apk\b|\binstall (?:this|the|our) app\b|\bsideload\b|\benable unknown sources\b|\bdownload .{0,20}app from (?:the )?link\b/.test(t),
    why: "The sideloaded app reads incoming SMS and can approve transactions without you seeing them.",
  },
  {
    id: "remote-access",
    label: "Asks you to install AnyDesk, TeamViewer or a screen-share tool",
    weight: 12,
    category: "Malware",
    test: (t) => /\b(anydesk|teamviewer|quicksupport|rustdesk|screen[\s-]?shar|remote (?:access|desktop|support) app)\b/.test(t),
    why: "Screen sharing hands over the session live; the caller watches you type the OTP.",
  },
  {
    id: "block-threat",
    label: "Threatens suspension, blocking or freezing of the account",
    weight: 8,
    category: "Pressure",
    test: (t) => /\b(suspend|suspended|block(?:ed|ing)?|freez(?:e|ing|ed)|deactivat\w*|will be closed|will be stopped|dormant)\b/.test(t) &&
      /\b(account|card|net\s?banking|debit|credit)\b/.test(t),
    why: "Fear of losing access is the lever; genuine restriction notices do not arrive as a first contact by SMS.",
  },
  {
    id: "deadline",
    label: "Sets a countdown — today, 24 hours, immediately",
    weight: 7,
    category: "Pressure",
    test: (t) => /\b(within \d+\s*(?:hour|hrs|hours|minutes|mins|days)|before (?:today|tonight|midnight)|immediately|urgent(?:ly)?|last (?:warning|chance)|expires? (?:today|tonight|in))\b/.test(t),
    why: "The deadline exists to stop you calling the number printed on your card.",
  },
  {
    id: "generic-greeting",
    label: "Generic greeting with no name and no masked account number",
    weight: 5,
    category: "Impersonation",
    test: (t) =>
      /\b(dear (?:customer|user|sir\/madam|account holder)|valued customer)\b/.test(t) &&
      !/\b(?:xx+|\*{2,})\d{3,4}\b/.test(t),
    why: "A real alert quotes the last four digits of the account or card, because the bank knows them.",
  },
  {
    id: "mobile-callback",
    label: "Gives a personal mobile number as customer care",
    weight: 7,
    category: "Impersonation",
    test: (t) => /\b(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b/.test(t) && /\b(call|contact|whatsapp|customer care|helpline|support)\b/.test(t),
    why: "Bank helplines are 1800 or 1860 numbers printed on the card and on the official site, never a 10-digit mobile.",
  },
  {
    id: "reward-bait",
    label: "Dangles reward points, cashback or a refund about to lapse",
    weight: 6,
    category: "Bait",
    test: (t) => /\b(reward points?|cashback|refund|credit of rs|amount will be credited|redeem (?:your|now))\b/.test(t),
    why: "The greed variant of the same funnel: the page it leads to still asks for the card and the OTP.",
  },
  {
    id: "kyc-bait",
    label: "Cites KYC, PAN or Aadhaar as the reason",
    weight: 6,
    category: "Bait",
    test: (t) => /\b(kyc|re-?kyc|pan (?:card|update|link)|aadhaar|aadhar|link your pan)\b/.test(t),
    why: "Banks do collect KYC, but through the branch, the app or a call you initiated — never through an SMS link.",
  },
  {
    id: "reply-with-details",
    label: "Asks you to reply to the SMS or WhatsApp with details",
    weight: 8,
    category: "Credential theft",
    test: (t) => /\b(reply (?:with|to this)|send (?:your )?details|share (?:your )?details|whatsapp (?:us|your)|msg your)\b/.test(t),
    why: "Nothing about your account is ever collected over a reply-to-SMS or WhatsApp thread.",
  },
  {
    id: "sketchy-form",
    label: "Sends you to a form or login page from the message itself",
    weight: 6,
    category: "Delivery",
    test: (t) => /\b(click (?:here|the link|below)|tap (?:here|the link)|visit (?:the )?link|update here|verify here|re-?activate (?:now|here)|log ?in (?:here|now))\b/.test(t),
    why: "Type the bank's address yourself or use the app. A link in an unexpected message is the whole attack surface.",
  },
];

export const MAX_MARKER_SCORE = MARKERS.reduce((sum, marker) => sum + marker.weight, 0);

/** Verdict bands, in absolute weighted points. */
export const BANDS = [
  {
    id: "critical",
    min: 30,
    label: "Almost certainly a scam",
    hint: "Multiple decisive markers. Do not reply, do not tap the link, and delete it.",
  },
  {
    id: "high",
    min: 18,
    label: "Very likely a scam",
    hint: "This carries the shape of the OTP funnel. Verify only through the number on your card.",
  },
  {
    id: "medium",
    min: 9,
    label: "Suspicious",
    hint: "Some markers present. Treat the link as hostile until the bank confirms otherwise.",
  },
  {
    id: "low",
    min: 3,
    label: "A few weak markers",
    hint: "Nothing decisive, but check the sender against an older genuine message before acting.",
  },
  {
    id: "clean",
    min: 0,
    label: "No scam markers found",
    hint: "This checks for known markers only. A clean result is not proof the message is genuine.",
  },
];

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

/** Things a bank in India genuinely does and does not do. */
export const REAL_BANK_BEHAVIOUR = [
  "Quotes the last four digits of the account or card in every alert, because it knows them.",
  "Sends transaction alerts with no link and nothing to click.",
  "Publishes its helpline as an 1800 or 1860 number printed on the card and on the official website.",
  "Never asks for an OTP, PIN, CVV, password or full card number — not by SMS, not by email, not on a call.",
  "Distributes its app only through the Google Play Store or the Apple App Store.",
  "Handles KYC through the branch, the app, or a process you started yourself.",
];

/** Reporting routes in India. */
export const REPORTING = [
  {
    label: "Call 1930",
    detail:
      "The national cyber-crime helpline. If money has already left the account, calling within the first hours gives the best chance of a freeze on the receiving account.",
  },
  {
    label: "cybercrime.gov.in",
    detail: "File the complaint in writing on the National Cyber Crime Reporting Portal, with screenshots.",
  },
  {
    label: "Your bank's own helpline",
    detail: "Use the number printed on your card, not any number in the message, and ask for the card or net banking to be blocked.",
  },
  {
    label: "Sanchar Saathi (Chakshu)",
    detail: "Report the fraudulent SMS or call itself so the sender header and number can be acted on.",
  },
];
