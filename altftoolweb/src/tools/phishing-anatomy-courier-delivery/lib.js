/**
 * Courier Delivery Phishing Anatomy — specimen teardown and a scam-marker scanner.
 *
 * Pure module: no React, no DOM, no clock reads, no network. Same input, same
 * output. Every exported function is total — unusable input returns { error }
 * rather than NaN or a number that looks like a verdict.
 *
 * The scanner is a weighted rule engine, not a classifier: it reports which
 * documented markers of the fake-delivery family appear in a message and how
 * heavily each is weighted. It cannot prove a message is genuine.
 */

/* ------------------------------------------------------------------ *
 * The specimen
 * ------------------------------------------------------------------ */

/**
 * A composite of the "parcel held, pay the redelivery fee" SMS reported to
 * postal and courier operators. Hostnames are written defanged (with [.]
 * instead of .) so nothing here is clickable, and the tracking number is
 * fictional.
 */
export const SPECIMEN = {
  channel: "SMS",
  senderLabel: "+63 9xx xxx xxxx (an international mobile, not a sender header)",
  context:
    "Arrives during a week when almost everyone has something in transit, which is what makes the guess work.",
  lines: [
    {
      text: "INDIA POST: Your parcel #IN4482910XX is on hold at the sorting facility.",
      signal: "parcel-held",
    },
    { text: "Reason: incomplete address details.", signal: "address-bait" },
    {
      text: "Update your address and pay the redelivery charge of Rs.25 within 24 hours,",
      signal: "tiny-fee",
    },
    { text: "or the item will be returned to the sender.", signal: "deadline-return" },
    { text: "Update here: http://indiapost-redelivery[.]top/pay", signal: "lookalike-domain" },
    {
      text: "Enter your card number, expiry date and CVV on the payment page to release the parcel.",
      signal: "card-harvest",
    },
    {
      text: "You will receive an OTP - enter it to authorise the Rs.25 charge.",
      signal: "otp-mandate",
    },
    { text: "Track faster: install ParcelTrack-Update.apk from the same link.", signal: "apk-sideload" },
    { text: "- India Post Delivery Team", signal: "fake-department" },
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
    id: "parcel-held",
    label: "A parcel you cannot immediately place",
    severity: "high",
    what: "It names a tracking number and a facility, with no seller and no item.",
    why:
      "The message is sent to millions of numbers on the safe assumption that a good share of them are expecting something. A genuine carrier notification names the shipper or the order, because it came from a real consignment record.",
  },
  {
    id: "address-bait",
    label: "A problem only you can fix, right now",
    severity: "medium",
    what: "\"Incomplete address details\" invites you to correct something.",
    why:
      "Fixing an address feels helpful rather than risky, so it lowers your guard before the payment page appears. Real carriers resolve address problems by calling the delivery number or through the tracking page you opened yourself.",
  },
  {
    id: "tiny-fee",
    label: "A fee small enough not to argue about",
    severity: "critical",
    what: "Rs.25 to release a parcel.",
    why:
      "The fee is not the fraud, it is the excuse to open a card form. Twenty-five rupees is below the threshold at which most people stop to verify, and the card details you type are worth far more than the amount charged.",
  },
  {
    id: "deadline-return",
    label: "Return to sender as the countdown",
    severity: "high",
    what: "\"Within 24 hours, or the item will be returned.\"",
    why:
      "A loss you can picture is more motivating than an abstract warning. Genuine undelivered items sit at the facility for days and are tracked on the carrier's own site, with no SMS deadline attached.",
  },
  {
    id: "lookalike-domain",
    label: "A domain the carrier does not own",
    severity: "critical",
    what: "indiapost-redelivery[.]top carries the brand in a domain registered by someone else.",
    why:
      "Only the registrable domain immediately before the first single slash decides where you land. India Post tracking lives on indiapost.gov.in — a .gov.in address that nobody else can register — and a .top lookalike is not it.",
  },
  {
    id: "card-harvest",
    label: "Card number, expiry and CVV on a page you did not seek out",
    severity: "critical",
    what: "The full card set collected to pay Rs.25.",
    why:
      "Those three fields are everything needed for a card-not-present purchase anywhere in the world. A genuine Rs.25 charge would run through a payment gateway you recognise, reached from the carrier's own app or site.",
  },
  {
    id: "otp-mandate",
    label: "An OTP for a much larger amount than you were told",
    severity: "critical",
    what: "\"Enter the OTP to authorise the Rs.25 charge.\"",
    why:
      "Read what the OTP message from your own bank actually says: the amount and the merchant in that SMS are the transaction being approved, not the amount on the web page. This is how a Rs.25 redelivery fee becomes a recurring mandate or a five-figure debit.",
  },
  {
    id: "apk-sideload",
    label: "A tracking app to sideload",
    severity: "critical",
    what: "ParcelTrack-Update.apk from the same link.",
    why:
      "The APK asks for SMS and accessibility permissions, then reads the OTPs arriving on your phone and can operate the screen itself. No carrier distributes a tracking app outside the Play Store or App Store.",
  },
  {
    id: "fake-department",
    label: "A department with no reference number",
    severity: "medium",
    what: "Signed \"India Post Delivery Team\".",
    why:
      "Genuine correspondence carries a consignment or complaint reference you can quote back on the official helpline. An anonymous team name sounds official while staying unverifiable.",
  },
  {
    id: "sender-header",
    label: "An international mobile number instead of a sender header",
    severity: "high",
    what: "The message comes from a +63 number, not a six-character commercial header.",
    why:
      "Indian carriers send bulk SMS through registered headers like AD-IPOST or VM-BLUDRT. A foreign mobile number sending Indian delivery updates has no legitimate explanation.",
  },
];

/* ------------------------------------------------------------------ *
 * Link inspection
 * ------------------------------------------------------------------ */

/** Domains the carriers and the big marketplaces actually use. */
export const OFFICIAL_DOMAINS = [
  "indiapost.gov.in",
  "dtdc.in",
  "dtdc.com",
  "bluedart.com",
  "delhivery.com",
  "ecomexpress.in",
  "xpressbees.com",
  "shiprocket.in",
  "fedex.com",
  "dhl.com",
  "ups.com",
  "aramex.com",
  "amazon.in",
  "flipkart.com",
  "myntra.com",
  "meesho.com",
];

/** Brand words a delivery-phishing domain borrows to look plausible. */
export const BRAND_TOKENS = [
  "indiapost",
  "india-post",
  "speedpost",
  "bluedart",
  "dtdc",
  "delhivery",
  "ecomexpress",
  "xpressbees",
  "fedex",
  "dhl",
  "aramex",
  "courier",
  "parcel",
  "shipment",
  "tracking",
  "redelivery",
];

/** Wording used in the link findings for this scam family. */
export const ENTITY = {
  words: "Delivery",
  subjectPlural: "Carriers",
  subjectSingular: "a carrier",
  possessive: "A carrier's",
  pathWords: /parcel|courier|track|deliver|redeliver|shipment|customs|consignment/,
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
 * marker separates a scam from a genuine delivery notification — a CVV request
 * is decisive, a mention of a parcel on hold is only suggestive.
 */
export const MARKERS = [
  {
    id: "card-details",
    label: "Asks for card number, expiry or CVV",
    weight: 13,
    category: "Payment theft",
    test: (t) => /\b(cvv|cvc|card (?:no|number|details)|expiry (?:date)?|debit card|credit card)\b/.test(t),
    why: "A carrier collecting a genuine fee sends you to a gateway from its own app; it never asks for the CVV in a message.",
  },
  {
    id: "otp-share",
    label: "Asks you to share, forward or enter an OTP to release the parcel",
    weight: 12,
    category: "Payment theft",
    test: (t) =>
      /\b(otp|one[\s-]?time (?:password|pin)|verification code)\b/.test(t) &&
      /\b(share|send|forward|enter|provide|confirm|authorise|authorize|reply with)\b/.test(t),
    why: "The amount in your bank's own OTP message is the transaction being approved — not the small fee shown on the page.",
  },
  {
    id: "apk",
    label: "Points at an APK or an app to install outside the store",
    weight: 12,
    category: "Malware",
    test: (t) => /\.apk\b|\binstall (?:this|the|our) app\b|\bsideload\b|\benable unknown sources\b/.test(t),
    why: "A sideloaded tracking app reads the OTPs on your phone and can operate the screen without you seeing it.",
  },
  {
    id: "remote-access",
    label: "Asks you to install AnyDesk, TeamViewer or a screen-share tool",
    weight: 12,
    category: "Malware",
    test: (t) => /\b(anydesk|teamviewer|quicksupport|rustdesk|screen[\s-]?shar|remote (?:access|desktop|support) app)\b/.test(t),
    why: "No delivery problem is ever solved by letting a stranger watch or drive your phone.",
  },
  {
    id: "redelivery-fee",
    label: "Demands a small redelivery, handling or shipping fee",
    weight: 11,
    category: "Payment theft",
    test: (t) =>
      /\b(redelivery|re-?delivery|delivery|shipping|handling|service|clearance)\s*(?:charge|fee|cost)\b/.test(t) ||
      /\bpay (?:only |just )?(?:rs\.?|inr|₹)\s?\d{1,4}\b/.test(t),
    why: "The fee exists to justify a card form. Indian carriers collect COD and duty at the door or in their own app, not through an SMS link.",
  },
  {
    id: "upi-pull",
    label: "Asks you to scan a QR or approve a UPI request to receive something",
    weight: 10,
    category: "Payment theft",
    test: (t) => /\b(scan (?:the )?(?:qr|code)|upi (?:id|request|collect)|approve the request|enter (?:your )?upi pin)\b/.test(t),
    why: "Scanning a QR or entering a UPI PIN always sends money out. Nothing you receive ever requires either.",
  },
  {
    id: "customs-duty",
    label: "Claims customs duty or import clearance is pending",
    weight: 8,
    category: "Bait",
    test: (t) => /\b(customs|import duty|clearance (?:fee|charge)|duty payment|held by customs)\b/.test(t),
    why: "Genuine customs charges on an inbound parcel are billed by the carrier through its own tracking page or collected at delivery.",
  },
  {
    id: "parcel-held",
    label: "Says a parcel is held, undelivered or on hold",
    weight: 7,
    category: "Bait",
    test: (t) => /\b(parcel|package|shipment|consignment|item|order)\b/.test(t) && /\b(on hold|held|pending|undelivered|could not be delivered|delivery failed|suspended)\b/.test(t),
    why: "Sent blind to millions of numbers on the assumption that many are expecting something.",
  },
  {
    id: "address-update",
    label: "Asks you to confirm or update your delivery address through a link",
    weight: 7,
    category: "Bait",
    test: (t) => /\b(update (?:your )?address|confirm (?:your )?address|incomplete address|address (?:is )?(?:incorrect|invalid)|reschedule (?:the )?delivery)\b/.test(t),
    why: "Correcting an address feels harmless, which is exactly why it is the opening move.",
  },
  {
    id: "deadline",
    label: "Sets a countdown — 24 hours, or returned to sender",
    weight: 7,
    category: "Pressure",
    test: (t) => /\b(within \d+\s*(?:hour|hrs|hours|days)|returned to (?:the )?sender|will be destroyed|last (?:attempt|chance)|expires? (?:today|tonight|in)|immediately|urgent(?:ly)?)\b/.test(t),
    why: "A loss you can picture beats an abstract warning, and the clock is there to stop you checking the carrier's own site.",
  },
  {
    id: "click-link",
    label: "Pushes you to a link rather than to the carrier's own app",
    weight: 6,
    category: "Delivery",
    test: (t) => /\b(click (?:here|the link|below)|tap (?:here|the link)|visit (?:the )?link|update here|pay here|track here|schedule here)\b/.test(t),
    why: "Open the carrier's app or type its address yourself; the link in an unexpected message is the whole attack.",
  },
  {
    id: "mobile-callback",
    label: "Gives a personal mobile or WhatsApp number as support",
    weight: 6,
    category: "Impersonation",
    test: (t) => /\b(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b/.test(t) && /\b(call|contact|whatsapp|customer care|helpline|support)\b/.test(t),
    why: "Carrier support numbers are published on the official site; a personal mobile in the message is the sender's own line.",
  },
  {
    id: "no-order-reference",
    label: "Talks about your parcel without naming the seller or order",
    weight: 5,
    category: "Impersonation",
    test: (t) =>
      /\b(your (?:parcel|package|shipment|order|item))\b/.test(t) &&
      !/\b(amazon|flipkart|myntra|meesho|ajio|nykaa|order (?:id|no|number)|invoice)\b/.test(t),
    why: "A genuine notification comes from a consignment record and names the shipper; a blast message cannot.",
  },
];

/** Verdict bands, in absolute weighted points. */
export const BANDS = [
  {
    id: "critical",
    min: 30,
    label: "Almost certainly a scam",
    hint: "Multiple decisive markers. Do not pay, do not tap, and check the parcel on the carrier's own site.",
  },
  {
    id: "high",
    min: 18,
    label: "Very likely a scam",
    hint: "This is built like the redelivery-fee funnel. Track the parcel yourself instead of using this link.",
  },
  {
    id: "medium",
    min: 9,
    label: "Suspicious",
    hint: "Some markers present. Treat the link as hostile until the carrier's own tracking page agrees.",
  },
  {
    id: "low",
    min: 3,
    label: "A few weak markers",
    hint: "Nothing decisive, but confirm the tracking number on the carrier's site before paying anything.",
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

/** Things a real courier or postal operator does and does not do. */
export const REAL_BEHAVIOUR = [
  "Quotes a tracking or AWB number that already exists on its own site, along with the shipper or the order.",
  "Collects cash on delivery and customs charges at the door or inside its own app, not through a link in an SMS.",
  "Never asks for a card's CVV, a UPI PIN or an OTP — those are never needed to receive something.",
  "Publishes support numbers on the official website; India Post tracking is on indiapost.gov.in, which nobody else can register.",
  "Distributes its tracking app only through the Google Play Store or the Apple App Store.",
  "Sends bulk SMS from a registered six-character header, not from a personal or foreign mobile number.",
];

/** Reporting routes in India. */
export const REPORTING = [
  {
    label: "Call 1930",
    detail:
      "The national cyber-crime helpline. If a card was used or money left the account, calling within the first hours gives the best chance of a freeze on the receiving account.",
  },
  {
    label: "cybercrime.gov.in",
    detail: "File the complaint in writing on the National Cyber Crime Reporting Portal, with screenshots of the message.",
  },
  {
    label: "Your bank, on the number printed on the card",
    detail: "Block the card and dispute the charge. A card used on a fake payment page should be treated as compromised.",
  },
  {
    label: "The carrier's own complaint page",
    detail: "Report the impersonation so the operator can publish a warning; India Post and the private carriers all run fraud-alert pages.",
  },
  {
    label: "Sanchar Saathi (Chakshu)",
    detail: "Report the fraudulent SMS or call itself so the sending number can be acted on.",
  },
];
