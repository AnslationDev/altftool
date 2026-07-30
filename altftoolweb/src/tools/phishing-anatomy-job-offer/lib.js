/**
 * Job Offer Phishing Anatomy — specimen teardown and a scam-marker scanner.
 *
 * Pure module: no React, no DOM, no clock reads, no network. Same input, same
 * output. Every exported function is total — unusable input returns { error }
 * rather than NaN or a number that looks like a verdict.
 *
 * The scanner is a weighted rule engine, not a classifier: it reports which
 * documented markers of the fake-offer family appear in a message and how
 * heavily each is weighted. It cannot prove an offer is genuine.
 */

/* ------------------------------------------------------------------ *
 * The specimen
 * ------------------------------------------------------------------ */

/**
 * A composite of the fake offer letters and "part-time work from home"
 * messages reported to Indian job portals and to the cybercrime portal. The
 * company is fictional, the address is defanged with [.] so nothing here is
 * clickable, and the phone number is redacted.
 */
export const SPECIMEN = {
  channel: "WhatsApp, sometimes an email with a PDF offer letter attached",
  senderLabel: "hr.nexora.recruit@gmail[.]com, with a WhatsApp number for follow-up",
  context:
    "Sent to phone numbers scraped from job portals, usually to people who applied somewhere recently and are expecting to hear back.",
  lines: [
    {
      text: "Congratulations! You are SELECTED for Data Entry Executive at Nexora Infotech Pvt Ltd.",
      signal: "selected-without-interview",
    },
    {
      text: "Salary Rs.38,000/month, work from home, 2 hours daily, no experience required.",
      signal: "unrealistic-pay",
    },
    {
      text: "Pay a refundable registration and ID card fee of Rs.1,850 to confirm your seat.",
      signal: "upfront-fee",
    },
    { text: "Only 4 seats left, confirmation closes today at 5 PM.", signal: "scarcity" },
    {
      text: "Send your Aadhaar, PAN and bank account number with IFSC for onboarding.",
      signal: "document-harvest",
    },
    {
      text: "Offer letter: http://nexora-careers-hr[.]online/offer.pdf",
      signal: "lookalike-domain",
    },
    {
      text: "Download the joining kit: Nexora-Onboarding.apk",
      signal: "apk-sideload",
    },
    {
      text: "All further communication on WhatsApp only. HR: 9x-xxxxx-xxxxx",
      signal: "channel-shift",
    },
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
    id: "selected-without-interview",
    label: "Selected without an interview you remember",
    severity: "high",
    what: "A named role and a confirmed selection, with no application, test or interview behind it.",
    why:
      "Hiring costs money, so employers do not hand out roles to strangers. This line works because it arrives while you are genuinely applying elsewhere and half-expecting good news — the sender is guessing, at scale.",
  },
  {
    id: "unrealistic-pay",
    label: "Pay that does not match the work",
    severity: "high",
    what: "Rs.38,000 a month for two hours a day of data entry, no experience required.",
    why:
      "The number is set high enough to be worth chasing and low enough to sound survivable. Data entry does not pay a full salary for part-time work anywhere, and \"no experience required\" removes the one filter that would slow you down.",
  },
  {
    id: "upfront-fee",
    label: "A fee to take the job",
    severity: "critical",
    what: "Rs.1,850, described as refundable, for registration and an ID card.",
    why:
      "This is the entire scam in one line. No employer charges a candidate to hire them — not for registration, ID cards, training, background verification, a laptop or a kit. \"Refundable\" is what makes a small first payment feel safe, and it is the reason the next demand will be larger.",
  },
  {
    id: "scarcity",
    label: "Seats closing this evening",
    severity: "high",
    what: "\"Only 4 seats left, confirmation closes today at 5 PM.\"",
    why:
      "A real vacancy stays open while HR finishes interviewing; it does not expire the same afternoon. The clock exists so the payment happens before anyone in your family hears about it.",
  },
  {
    id: "document-harvest",
    label: "Aadhaar, PAN and bank details before any contract",
    severity: "critical",
    what: "The full identity and account set, requested over chat.",
    why:
      "A genuine employer collects documents after an offer you have signed, through an HR system, and never over WhatsApp. Handed over this way, the set is enough to open accounts and take small loans in your name.",
  },
  {
    id: "lookalike-domain",
    label: "A careers page on a domain the company does not own",
    severity: "critical",
    what: "nexora-careers-hr[.]online rather than the employer's own site.",
    why:
      "Only the registrable domain immediately before the first single slash says who runs the page. Real companies recruit from their own domain — careers.example.com — or through an established portal, never from a fresh lookalike.",
  },
  {
    id: "apk-sideload",
    label: "An onboarding app to sideload",
    severity: "critical",
    what: "Nexora-Onboarding.apk, outside the Play Store.",
    why:
      "No onboarding needs an APK. What it does need are SMS and accessibility permissions, which let it read your OTPs and operate your screen once you have installed it.",
  },
  {
    id: "channel-shift",
    label: "Everything happens on WhatsApp or Telegram",
    severity: "high",
    what: "A free email address for the offer and a personal number for everything else.",
    why:
      "There is no company system anywhere in the process — no HR portal, no corporate email, no video interview. Chat also lets the sender delete the thread the moment you start asking questions.",
  },
  {
    id: "free-email",
    label: "HR writing from a free mailbox",
    severity: "high",
    what: "hr.nexora.recruit@gmail[.]com.",
    why:
      "A company that exists has a domain, and its recruiters write from it. A free mailbox with the company's name in the local part is the cheapest possible imitation of that.",
  },
];

/* ------------------------------------------------------------------ *
 * Link inspection
 * ------------------------------------------------------------------ */

/** Established job portals whose domains are worth recognising. */
export const OFFICIAL_DOMAINS = [
  "naukri.com",
  "linkedin.com",
  "indeed.com",
  "indeed.co.in",
  "foundit.in",
  "shine.com",
  "timesjobs.com",
  "internshala.com",
  "apna.co",
  "glassdoor.co.in",
  "hirist.tech",
  "instahyre.com",
];

/** Words a recruitment-phishing domain borrows to look plausible. */
export const BRAND_TOKENS = [
  "naukri",
  "linkedin",
  "indeed",
  "foundit",
  "shine",
  "internshala",
  "monster",
  "careers",
  "career",
  "recruitment",
  "recruit",
  "hiring",
  "jobs",
  "placement",
  "hrportal",
];

/** Wording used in the link findings for this scam family. */
export const ENTITY = {
  words: "Recruitment",
  subjectPlural: "Employers",
  subjectSingular: "an employer",
  possessive: "A real employer's",
  pathWords: /career|job|hiring|recruit|apply|offer|onboard|hr/,
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
 * marker separates a scam from a genuine recruitment message — a fee demand is
 * decisive on its own, a mention of work from home is not.
 */
export const MARKERS = [
  {
    id: "upfront-fee",
    label: "Asks the candidate to pay a fee, deposit or charge",
    weight: 14,
    category: "Advance fee",
    test: (t) =>
      /\b(registration|processing|security|training|joining|onboarding|id ?card|kit|laptop|verification|application)\s*(?:fee|charge|amount|deposit|money)\b/.test(t) ||
      /\b(pay|deposit|transfer|send)\s*(?:rs\.?|inr|₹)\s?\d{2,6}\b/.test(t),
    why: "No employer charges a candidate to hire them. This single marker is enough on its own.",
  },
  {
    id: "task-earning",
    label: "Offers per-task earnings for likes, ratings, reviews or orders",
    weight: 12,
    category: "Advance fee",
    test: (t) => /\b(complete (?:the )?tasks?|per task|like (?:the )?videos?|rate (?:the )?(?:hotels?|products?|apps?)|prepaid (?:orders?|tasks?)|daily commission|earn rs\.?\s?\d+ (?:per|daily|a day))\b/.test(t),
    why: "The task-based job is the entry point of an investment scam: small payouts first, then a deposit that never comes back.",
  },
  {
    id: "apk",
    label: "Points at an APK or an app to install outside the store",
    weight: 11,
    category: "Malware",
    test: (t) => /\.apk\b|\binstall (?:this|the|our) app\b|\bsideload\b|\benable unknown sources\b/.test(t),
    why: "Onboarding never needs a sideloaded app; one that is sideloaded can read your SMS and drive your screen.",
  },
  {
    id: "refundable",
    label: "Calls the payment refundable or security money",
    weight: 11,
    category: "Advance fee",
    test: (t) => /\b(refundable|fully refunded|will be refunded|security (?:deposit|money)|returnable deposit|adjustable against salary)\b/.test(t),
    why: "\"Refundable\" is what makes the first small payment feel safe, and it is why the next demand will be larger.",
  },
  {
    id: "bank-account-ask",
    label: "Asks for bank account, IFSC, UPI or card details during hiring",
    weight: 10,
    category: "Data harvest",
    test: (t) => /\b(ifsc|account (?:no|number)|bank details|upi (?:id|pin)|cvv|debit card|credit card|net\s?banking)\b/.test(t),
    why: "Salary account details are collected after joining, through an HR system — never over chat before a contract.",
  },
  {
    id: "otp-share",
    label: "Asks you to share, forward or read out an OTP",
    weight: 10,
    category: "Credential theft",
    test: (t) =>
      /\b(otp|one[\s-]?time (?:password|pin)|verification code)\b/.test(t) &&
      /\b(share|send|forward|tell|read out|provide|confirm|give|reply with)\b/.test(t),
    why: "Nothing in a hiring process needs a code from your phone. Any OTP in play belongs to your bank.",
  },
  {
    id: "free-email",
    label: "HR writing from a free mailbox rather than a company domain",
    weight: 10,
    category: "Impersonation",
    test: (t) => /@(?:gmail|yahoo|outlook|hotmail|rediffmail|proton|ymail|live)\.[a-z.]{2,8}\b/.test(t) && /\b(hr|recruit|career|offer|selected|joining|interview)\b/.test(t),
    why: "A company that exists has a domain, and its recruiters write from it.",
  },
  {
    id: "no-interview",
    label: "Announces selection with no interview or test",
    weight: 9,
    category: "Bait",
    test: (t) => /\b(you (?:have been |are )?selected|congratulations[!,. ]|shortlisted|direct joining|offer letter (?:is )?(?:attached|ready)|no interview)\b/.test(t),
    why: "Hiring costs money, so nobody hands a role to a stranger who never applied.",
  },
  {
    id: "unrealistic-pay",
    label: "Promises high pay for very little work or no experience",
    weight: 9,
    category: "Bait",
    test: (t) =>
      /\b(no experience (?:required|needed)|work from home|part[\s-]?time|freshers? (?:welcome|can apply)|\d\s*(?:-|to)?\s*\d?\s*hours? (?:daily|a day|per day))\b/.test(t) &&
      /\b(?:rs\.?|inr|₹)\s?\d{4,7}\b/.test(t),
    why: "The figure is set high enough to chase and low enough to sound survivable; the work described cannot pay it.",
  },
  {
    id: "crypto-payout",
    label: "Pays or collects in USDT, crypto or through a wallet app",
    weight: 9,
    category: "Advance fee",
    test: (t) => /\b(usdt|tether|bitcoin|btc|crypto|binance|trust ?wallet|tron|trc-?20)\b/.test(t),
    why: "Crypto payouts exist so the money cannot be recalled and the payer cannot be traced.",
  },
  {
    id: "document-harvest",
    label: "Asks for Aadhaar, PAN or a photo of your ID over chat",
    weight: 8,
    category: "Data harvest",
    test: (t) => /\b(aadhaar|aadhar|pan (?:card|no|number)|photo of (?:your )?id|id proof|marksheet|passbook)\b/.test(t) && /\b(send|share|upload|whatsapp|reply|photo|scan)\b/.test(t),
    why: "Handed over this way, the identity set is enough to open accounts and take small loans in your name.",
  },
  {
    id: "channel-shift",
    label: "Moves the entire process to WhatsApp or Telegram",
    weight: 8,
    category: "Delivery",
    test: (t) => /\b(whatsapp|telegram|t\.me|join (?:the )?group|chat only|dm me|message on wa)\b/.test(t),
    why: "There is no HR portal, no corporate mail and no video interview — and the thread can be deleted the moment you ask questions.",
  },
  {
    id: "scarcity",
    label: "Seats closing today, limited vacancies",
    weight: 6,
    category: "Pressure",
    test: (t) => /\b(only \d+ (?:seats?|slots?|vacanc)|seats? (?:are )?(?:closing|filling|left)|limited (?:seats|vacancies|slots)|apply (?:before|within)|closes today|last date today|hurry)\b/.test(t),
    why: "A genuine vacancy stays open while HR finishes interviewing; it does not expire the same afternoon.",
  },
];

/** Verdict bands, in absolute weighted points. */
export const BANDS = [
  {
    id: "critical",
    min: 30,
    label: "Almost certainly a scam",
    hint: "Multiple decisive markers. Pay nothing, send no documents, and stop the chat.",
  },
  {
    id: "high",
    min: 18,
    label: "Very likely a scam",
    hint: "This is built like the fake-offer funnel. Verify the company and the recruiter independently before replying.",
  },
  {
    id: "medium",
    min: 9,
    label: "Suspicious",
    hint: "Some markers present. A real offer survives being checked on the company's own careers page.",
  },
  {
    id: "low",
    min: 3,
    label: "A few weak markers",
    hint: "Nothing decisive, but never pay to be hired, whatever the payment is called.",
  },
  {
    id: "clean",
    min: 0,
    label: "No scam markers found",
    hint: "This checks for known markers only. A clean result is not proof the offer is genuine.",
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

/** How genuine recruitment actually works. */
export const REAL_BEHAVIOUR = [
  "No employer charges a candidate anything — not registration, training, ID cards, background verification, a laptop or a refundable deposit.",
  "Recruiters write from the company's own email domain, and the careers page sits on the company's own website.",
  "There is an interview, a test or at least a call before any offer, and the offer letter names a person you can look up.",
  "Bank and salary details are collected after you have signed, inside an HR system, not over WhatsApp.",
  "Documents are shared through an onboarding portal; a genuine employer does not ask for Aadhaar and PAN photos in a chat thread.",
  "A vacancy stays open while hiring finishes — it does not close at 5pm today because you have not paid.",
];

/** Reporting routes in India. */
export const REPORTING = [
  {
    label: "Call 1930",
    detail:
      "The national cyber-crime helpline. If money has already been transferred, calling within the first hours gives the best chance of a freeze on the receiving account.",
  },
  {
    label: "cybercrime.gov.in",
    detail: "File the complaint in writing on the National Cyber Crime Reporting Portal, with the chat export, the UPI reference and the offer letter.",
  },
  {
    label: "The company being impersonated",
    detail: "Large employers run a fraud-alert page and want fake recruitment reported; it also confirms for you that the offer was never theirs.",
  },
  {
    label: "The job portal",
    detail: "If the contact came through a portal, report the recruiter profile there so the account can be removed.",
  },
  {
    label: "Sanchar Saathi (Chakshu)",
    detail: "Report the fraudulent number or message so the connection can be acted on.",
  },
];
