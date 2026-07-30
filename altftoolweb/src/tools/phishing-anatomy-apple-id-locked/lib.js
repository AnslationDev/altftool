/**
 * "Your Apple ID has been locked" phishing anatomy.
 *
 * Pure helpers — no React, no DOM, no network. Rules are taken from Apple's own
 * published guidance on recognising genuine messages, plus the structural
 * properties of the link itself.
 */

/**
 * Registrable domains Apple actually uses for account mail and sign-in.
 * Genuine Apple mail arrives from hosts under apple.com (for example
 * email.apple.com) and account pages live at appleid.apple.com or
 * account.apple.com.
 */
export const APPLE_DOMAINS = ["apple.com", "icloud.com", "me.com", "mac.com", "itunes.com"];

/** Where you can safely deal with an account problem, none of them reached from a link. */
export const SAFE_ROUTES = [
  "On iPhone or iPad: Settings, then your name at the top — account, security and payment live there.",
  "On the web: type appleid.apple.com yourself rather than following a link.",
  "Locked or forgotten password: iforgot.apple.com, again typed by hand.",
  "Charges you do not recognise: check Purchase History in Settings or the App Store, not through an emailed receipt.",
  "Forward phishing email to reportphishing@apple.com; report an iMessage with the Report Junk link under the conversation.",
];

/**
 * Things Apple states it does not do. These are the load-bearing facts: if the
 * message asks for any of them, the sender is not Apple regardless of styling.
 */
export const APPLE_POLICY_FACTS = [
  "Apple does not ask for your password, verification code or security answers by email, message or phone.",
  "Apple does not ask you to sign in to a page you reached from a link in an unexpected message.",
  "Apple gift cards pay for Apple products and services only — never for fines, taxes, support or unlocking an account.",
  "Apple does not make unsolicited calls asking to take remote control of your device.",
  "Genuine App Store receipts include your billing address; a phishing copy usually cannot.",
  "A locked Apple ID is unlocked from your device or iforgot.apple.com, never through an emailed form.",
];

/** Requests that contradict Apple's stated policy. */
export const CREDENTIAL_REQUEST_PHRASES = [
  "confirm your password", "enter your password", "verify your password", "your apple id password",
  "verification code", "two-factor code", "security questions", "security answers",
  "confirm your apple id", "re-enter your credentials", "validate your account",
];

/** Payment-harvesting wording. */
export const PAYMENT_PHRASES = [
  "billing information", "payment method", "update your card", "credit card details",
  "card number", "cvv", "expiry date", "billing address to continue",
];

/** Gift-card demands, which only ever appear in fraud. */
export const GIFT_CARD_PHRASES = ["gift card", "itunes card", "app store card", "redeem code", "voucher code"];

/** Deadline pressure. */
export const DEADLINE_PHRASES = [
  "within 24 hours", "within 48 hours", "24 hours", "48 hours", "permanently deleted",
  "will be disabled", "will be terminated", "immediately", "final warning", "last chance", "expires today",
];

/** Openings a company with your name on file would not use. */
export const GENERIC_GREETINGS = ["dear customer", "dear user", "dear apple user", "dear client", "dear sir", "dear madam", "hello user"];

/** Two-label public suffixes for eTLD+1. Approximation of the PSL. */
const MULTI_LABEL_SUFFIXES = new Set([
  "co.uk", "org.uk", "ac.uk", "gov.uk", "me.uk",
  "co.in", "net.in", "org.in", "ac.in", "gov.in",
  "com.au", "net.au", "org.au", "com.br", "com.mx",
  "co.nz", "co.za", "co.jp", "or.jp", "ne.jp",
  "com.sg", "com.my", "com.hk", "com.cn", "com.tw", "co.kr", "com.tr", "com.ph", "co.th", "com.vn", "com.pk",
]);

export const CHANNELS = [
  { id: "email", label: "Email" },
  { id: "sms", label: "SMS / text message" },
  { id: "imessage", label: "iMessage" },
  { id: "call", label: "Phone call or voicemail" },
];

export const RISK_BANDS = [
  { min: 70, band: "Phishing — do not interact", tone: "danger" },
  { min: 45, band: "High risk", tone: "danger" },
  { min: 20, band: "Suspicious", tone: "warn" },
  { min: 10, band: "Worth a second look", tone: "warn" },
  { min: 0, band: "No strong signals found", tone: "ok" },
];

/** Annotated teardown of the standard account-locked message. */
export const APPLE_LOCKED_ANATOMY = [
  {
    part: "Subject",
    lure: "[Apple ID] Your account has been locked — Case #AP-4471902",
    tell: "A case number makes it feel like an existing process. It refers to nothing; you cannot look it up anywhere.",
  },
  {
    part: "Sender",
    lure: "Apple Support <no-reply@apple-id-verify.support>",
    tell: "The display name is free text. Only the registrable domain matters, and Apple's account mail comes from apple.com or icloud.com.",
  },
  {
    part: "Greeting",
    lure: "\"Dear Customer,\"",
    tell: "Apple has your name and, on genuine App Store receipts, your billing address. A bulk send has neither.",
  },
  {
    part: "The reason",
    lure: "\"Unusual sign-in activity was detected from a new device.\"",
    tell: "Plausible and unfalsifiable. It also explains why you would be asked to prove who you are — the whole point of the message.",
  },
  {
    part: "The button",
    lure: "Verify Your Account → https://appleid.apple.com.verify-secure.co/login",
    tell: "The visible text and the actual destination are different things. Read the host to the left of the first single slash: the site here is verify-secure.co.",
  },
  {
    part: "The form",
    lure: "Apple ID, password, then date of birth and card details",
    tell: "Escalating fields. The password alone is worth money; the card details are the upsell once you have started typing.",
  },
  {
    part: "The deadline",
    lure: "\"Your account will be permanently deleted within 24 hours.\"",
    tell: "Fear plus a clock. Apple does not delete accounts by email deadline, and a real security hold is resolved from your device.",
  },
];

/** Best-effort registrable domain (eTLD+1). */
export function registrableDomain(host) {
  const clean = String(host ?? "").trim().toLowerCase()
    .replace(/^https?:\/\//, "").replace(/[/?#].*$/, "").replace(/\.+$/, "");
  if (!clean) return "";
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(clean)) return clean;
  const labels = clean.split(".").filter(Boolean);
  if (labels.length <= 2) return labels.join(".");
  const lastTwo = labels.slice(-2).join(".");
  if (MULTI_LABEL_SUFFIXES.has(lastTwo)) return labels.slice(-3).join(".");
  return lastTwo;
}

/** Domain part of an email address, or "". */
export function emailDomain(address) {
  const value = String(address ?? "").trim().toLowerCase();
  const at = value.lastIndexOf("@");
  if (at < 1 || at === value.length - 1) return "";
  const domain = value.slice(at + 1).replace(/[>\s]+$/, "");
  return /^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain) ? domain : "";
}

/** Host of a URL, or "" when it cannot be read. Never throws. */
export function urlHost(rawUrl) {
  const raw = String(rawUrl ?? "").trim().replace(/\\/g, "/");
  if (!raw) return "";
  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(candidate).hostname.toLowerCase();
  } catch {
    return "";
  }
}

/** Does the URL carry user information before an @ in the authority? */
export function urlUserInfo(rawUrl) {
  const raw = String(rawUrl ?? "").trim().replace(/\\/g, "/");
  if (!raw) return "";
  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(candidate).username || "";
  } catch {
    return "";
  }
}

export function isAppleDomain(host) {
  const reg = registrableDomain(host);
  return Boolean(reg) && APPLE_DOMAINS.includes(reg);
}

function matched(text, phrases) {
  const hay = String(text ?? "").toLowerCase();
  return phrases.filter((p) => hay.includes(p));
}

function bandFor(score) {
  return RISK_BANDS.find((b) => score >= b.min) ?? RISK_BANDS[RISK_BANDS.length - 1];
}

/**
 * Score an "Apple ID locked" message.
 *
 * @param {object} input
 * @param {string} input.fromAddress  Sender address (email channel).
 * @param {string} input.linkUrl      The link or button target in the message.
 * @param {string} input.body         Visible text of the message.
 * @param {string} input.channel      One of CHANNELS ids.
 * @param {boolean} input.hasAttachment Whether the message carried an attachment.
 */
export function analyseAppleIdLure({
  fromAddress = "",
  linkUrl = "",
  body = "",
  channel = "email",
  hasAttachment = false,
} = {}) {
  const from = String(fromAddress ?? "").trim();
  const link = String(linkUrl ?? "").trim();
  const text = String(body ?? "");

  if (!from && !link && !text.trim()) {
    return { error: "Paste at least the sender address, the link, or the text of the message." };
  }

  const findings = [];
  const add = (severity, weight, title, detail) => findings.push({ severity, weight, title, detail });

  const fromReg = registrableDomain(emailDomain(from));
  const host = urlHost(link);
  const linkReg = registrableDomain(host);
  const userinfo = urlUserInfo(link);

  if (from && !fromReg) {
    add("warn", 8, "Sender address could not be read", "Copy the full address, including everything after the @, from the message header.");
  } else if (fromReg && APPLE_DOMAINS.includes(fromReg)) {
    add("ok", 0, "Sender domain is one Apple uses",
      `${fromReg} is an Apple domain. Note that the From header can be forged, so this lowers suspicion rather than settling it — judge the link and the request instead.`);
  } else if (fromReg) {
    add("critical", 30, "Sender is not on an Apple domain",
      `Mail claiming to be about your Apple ID arrived from ${fromReg}. Apple's account mail comes from apple.com or icloud.com; a lookalike such as "apple-id-verify.support" is simply a domain someone bought.`);
  }

  if (link && !host) {
    add("warn", 10, "Link could not be read", "Copy the link target itself rather than the visible text — long press or right click, then Copy link address.");
  }

  if (userinfo) {
    add("critical", 30, "Text before an @ in the link",
      `"${userinfo}" sits before the @ and is ignored by the browser when choosing where to connect. You would land on ${host}.`);
  }

  if (host && !isAppleDomain(host)) {
    add("critical", 36, "Link does not go to Apple",
      `The button leads to ${linkReg}. Apple ID sign-in lives at appleid.apple.com or account.apple.com; nothing that ends in another registrable domain is Apple, however the page is styled.`);
  } else if (host) {
    add("ok", 0, "Link host is an Apple domain",
      `${linkReg} is Apple's. Even so, unlock your account from Settings or by typing appleid.apple.com — that habit is what protects you when the next link is not genuine.`);
  }

  if (host && host.split(".").some((l) => l.startsWith("xn--"))) {
    add("critical", 26, "Punycode in the link host",
      "Part of the host is a Unicode name encoded for DNS. Letters from other alphabets can look identical to Latin ones on screen.");
  }

  const credentials = matched(text, CREDENTIAL_REQUEST_PHRASES);
  if (credentials.length) {
    add("critical", 34, "Asks for a password, code or security answer",
      `"${credentials[0]}" contradicts Apple's own guidance: Apple does not ask for your password, verification code or security answers by email, message or phone. A request for a two-factor code is the strongest single signal, because it means someone already has the password.`);
  }

  const payment = matched(text, PAYMENT_PHRASES);
  if (payment.length) {
    add("critical", 26, "Asks for billing or card details",
      `"${payment[0]}" is a harvesting step. Payment methods are changed in Settings under your name, or at appleid.apple.com, not through a link in a warning email.`);
  }

  const giftCard = matched(text, GIFT_CARD_PHRASES);
  if (giftCard.length) {
    add("critical", 34, "Mentions gift cards",
      "Apple gift cards buy Apple products and services. No genuine bill, fine, tax demand or support fee is ever settled with one — a gift card request is fraud with no exceptions.");
  }

  const deadline = matched(text, DEADLINE_PHRASES);
  if (deadline.length) {
    add("warn", 14, "Deadline pressure",
      `"${deadline[0]}" exists to stop you checking. Nothing about a genuine account hold expires because you took a day to look at it from your own device.`);
  }

  const greeting = matched(text, GENERIC_GREETINGS);
  if (greeting.length) {
    add("warn", 10, "Generic greeting",
      `"${greeting[0]}" suggests a bulk send. Genuine App Store receipts carry your name and billing address.`);
  }

  if (hasAttachment) {
    add("critical", 22, "Message carried an attachment",
      "Apple account notices do not need you to open a file. An attached receipt or 'invoice' is either malware or an HTML page that opens a fake sign-in form from your own disk.");
  }

  if (channel === "call") {
    add("critical", 24, "Arrived as an unsolicited call",
      "Apple does not phone people out of the blue about a locked account, and never asks to take remote control of a device. Hang up and go to Settings yourself.");
  } else if (channel === "sms") {
    add("warn", 12, "Arrived by SMS",
      "Sender IDs in SMS are trivially forged, and there is no header to inspect. In the US and UK you can forward the message to 7726 to report it, then delete it.");
  } else if (channel === "imessage") {
    add("warn", 10, "Arrived as an iMessage from an unknown sender",
      "Use the Report Junk link under the conversation. Never tap a link in an unexpected account warning, even inside Apple's own messaging app.");
  }

  const score = Math.min(100, findings.reduce((sum, f) => sum + f.weight, 0));
  const { band, tone } = bandFor(score);
  const order = { critical: 0, warn: 1, info: 2, ok: 3 };

  return {
    score,
    band,
    tone,
    senderDomain: fromReg,
    linkDomain: linkReg,
    findings: findings.sort((a, b) => (order[a.severity] - order[b.severity]) || (b.weight - a.weight)),
  };
}
