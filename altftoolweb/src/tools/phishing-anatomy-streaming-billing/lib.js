/**
 * "Payment failed — update your billing details" streaming phishing anatomy.
 *
 * Pure helpers — no React, no DOM, no network. Each service entry lists the
 * registrable domains that service actually uses and the in-app route to its
 * real billing page, because that route is the answer to every message of this
 * kind.
 */

/** Streaming services these campaigns copy, with the domains they really use. */
export const SERVICES = [
  {
    id: "netflix",
    name: "Netflix",
    domains: ["netflix.com"],
    route: "Open the Netflix app, or type netflix.com yourself, then Account → Membership & Billing.",
    note: "Netflix's guidance is explicit that it never asks for payment details by email or text message. Billing is only ever changed from inside your own account.",
  },
  {
    id: "prime",
    name: "Amazon Prime Video",
    domains: [
      "amazon.com", "amazon.co.uk", "amazon.in", "amazon.de", "amazon.fr", "amazon.it",
      "amazon.es", "amazon.ca", "amazon.com.au", "amazon.co.jp", "amazon.ae", "primevideo.com",
    ],
    route: "Open the Amazon app → Your Account → Message Centre, which lists every message Amazon has genuinely sent you.",
    note: "The Message Centre is the deciding check: if a 'payment failed' email is not there, Amazon did not send it.",
  },
  {
    id: "disney",
    name: "Disney+",
    domains: ["disneyplus.com", "disney.com"],
    route: "Sign in at disneyplus.com by typing the address, then Account → Subscription.",
    note: "Subscription state is visible in the app the moment you open it — a genuine payment problem shows there, not only in an email.",
  },
  {
    id: "hotstar",
    name: "JioHotstar / Hotstar",
    domains: ["hotstar.com", "jiohotstar.com"],
    route: "Open the app → My Space → Subscription, or check the payment in your bank or UPI app statement.",
    note: "Indian subscription renewals appear in your UPI mandate list, which is a second independent way to confirm what was actually charged.",
  },
  {
    id: "spotify",
    name: "Spotify",
    domains: ["spotify.com"],
    route: "Type spotify.com yourself, sign in, then Account → Your plan.",
    note: "Spotify's account page shows the current plan and the next payment date without you clicking anything from a message.",
  },
  {
    id: "youtube",
    name: "YouTube Premium",
    domains: ["youtube.com", "google.com", "youtube.co.uk"],
    route: "youtube.com → your avatar → Purchases and memberships, or check pay.google.com.",
    note: "Google subscriptions are billed through Google Payments, so pay.google.com shows the authoritative record.",
  },
  {
    id: "appletv",
    name: "Apple TV+",
    domains: ["apple.com", "icloud.com"],
    route: "iPhone or iPad: Settings → your name → Subscriptions. Mac: System Settings → your name → Media & Purchases.",
    note: "Apple states it does not ask for passwords, verification codes or payment details by email or message.",
  },
];

/** Brand names a template might mention. Used to catch a kit that forgot to swap one. */
export const BRAND_NAMES = [
  { id: "netflix", label: "Netflix", words: ["netflix"] },
  { id: "prime", label: "Amazon Prime Video", words: ["prime video", "amazon prime", "primevideo"] },
  { id: "disney", label: "Disney+", words: ["disney+", "disney plus", "disneyplus"] },
  { id: "hotstar", label: "Hotstar", words: ["hotstar", "jiohotstar"] },
  { id: "spotify", label: "Spotify", words: ["spotify"] },
  { id: "youtube", label: "YouTube Premium", words: ["youtube premium", "youtube music premium"] },
  { id: "appletv", label: "Apple TV+", words: ["apple tv+", "apple tv plus"] },
];

/** Card-harvesting wording. No streaming service collects these through an emailed link. */
export const CARD_PHRASES = [
  "card number", "cvv", "cvc", "security code", "expiry date", "expiration date",
  "update your payment", "update your billing", "confirm your payment method",
  "re-enter your card", "billing information", "verify your payment details",
];

/** The pretext itself. */
export const HOLD_PHRASES = [
  "payment failed", "payment declined", "we were unable to charge", "billing problem",
  "your membership is on hold", "account on hold", "subscription suspended", "unable to renew",
  "your account has been suspended", "we could not process",
];

/** Deadline pressure. */
export const DEADLINE_PHRASES = [
  "within 24 hours", "within 48 hours", "in the next 24", "expires today", "final notice",
  "immediately", "avoid interruption", "before your account is cancelled", "last reminder", "48 hours",
];

/** Generic openings. */
export const GENERIC_GREETINGS = ["dear customer", "dear user", "dear member", "dear subscriber", "hello customer", "valued customer"];

/** Common link shorteners — they hide the destination entirely. */
export const SHORTENER_HOSTS = [
  "bit.ly", "tinyurl.com", "t.co", "is.gd", "v.gd", "ow.ly", "buff.ly", "cutt.ly",
  "rebrand.ly", "shorturl.at", "tiny.cc", "t.ly", "rb.gy", "s.id", "lnkd.in", "shorturl.com",
];

/** Two-label public suffixes for eTLD+1. Approximation of the PSL. */
const MULTI_LABEL_SUFFIXES = new Set([
  "co.uk", "org.uk", "ac.uk", "gov.uk", "me.uk",
  "co.in", "net.in", "org.in", "ac.in", "gov.in",
  "com.au", "net.au", "org.au", "com.br", "com.mx", "com.ar",
  "co.nz", "co.za", "co.jp", "or.jp", "ne.jp",
  "com.sg", "com.my", "com.hk", "com.cn", "com.tw", "co.kr", "com.tr", "com.ph", "co.th", "com.vn", "com.pk",
]);

export const RISK_BANDS = [
  { min: 70, band: "Phishing — do not enter card details", tone: "danger" },
  { min: 45, band: "High risk", tone: "danger" },
  { min: 20, band: "Suspicious", tone: "warn" },
  { min: 10, band: "Worth a second look", tone: "warn" },
  { min: 0, band: "No strong signals found", tone: "ok" },
];

/** Annotated teardown of the standard payment-failed email. */
export const BILLING_LURE_ANATOMY = [
  {
    part: "Subject",
    lure: "Payment declined — update your details to keep watching",
    tell: "Losing access tonight is a small, believable consequence. Small stakes get acted on quickly; large ones get questioned.",
  },
  {
    part: "Sender",
    lure: "Netflix <info@netflix-billing-update.com>",
    tell: "Only the registrable domain counts. netflix-billing-update.com is a domain someone bought; it has no relationship to netflix.com.",
  },
  {
    part: "Greeting",
    lure: "\"Dear Valued Customer,\"",
    tell: "Your streaming service knows the name on the account and, usually, the last four digits of the card.",
  },
  {
    part: "The reason",
    lure: "\"We couldn't authorise your last payment.\"",
    tell: "Card failures genuinely happen, which is what makes this the most effective billing pretext there is.",
  },
  {
    part: "The button",
    lure: "Update Payment Method → https://netflix.com.billing-update.io/pay",
    tell: "The brand appears as a subdomain of the attacker's site. Read to the left of the first single slash: the owner is billing-update.io.",
  },
  {
    part: "The form",
    lure: "Full card number, expiry, CVV, then 'confirm with the code we just sent'",
    tell: "CVV plus a live one-time code is enough to authorise a payment on a card in real time. That combination is the entire objective.",
  },
  {
    part: "The finish",
    lure: "Redirects to the real service after 'success'",
    tell: "You end up on a page that looks normal, so nothing feels wrong until the charge appears.",
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

/** Host of a URL, or "". Never throws. */
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

/** Which service brands are named in the text. */
export function detectBrands(text) {
  const hay = String(text ?? "").toLowerCase();
  return BRAND_NAMES.filter((brand) => brand.words.some((w) => hay.includes(w)));
}

export function serviceById(id) {
  return SERVICES.find((s) => s.id === id) ?? SERVICES[0];
}

function matched(text, phrases) {
  const hay = String(text ?? "").toLowerCase();
  return phrases.filter((p) => hay.includes(p));
}

function bandFor(score) {
  return RISK_BANDS.find((b) => score >= b.min) ?? RISK_BANDS[RISK_BANDS.length - 1];
}

/**
 * Score a "payment failed" streaming message.
 *
 * @param {object} input
 * @param {string} input.serviceId    Which service the message claims to be from.
 * @param {string} input.fromAddress  Sender address.
 * @param {string} input.linkUrl      Target of the update-payment button.
 * @param {string} input.body         Visible message text.
 * @param {boolean} input.hasAttachment Whether a file was attached.
 */
export function analyseBillingLure({
  serviceId = "netflix",
  fromAddress = "",
  linkUrl = "",
  body = "",
  hasAttachment = false,
} = {}) {
  const service = serviceById(serviceId);
  const from = String(fromAddress ?? "").trim();
  const link = String(linkUrl ?? "").trim();
  const text = String(body ?? "");

  if (!from && !link && !text.trim()) {
    return { error: "Paste the sender address, the button link, or the text of the message." };
  }

  const findings = [];
  const add = (severity, weight, title, detail) => findings.push({ severity, weight, title, detail });

  const fromReg = registrableDomain(emailDomain(from));
  const host = urlHost(link);
  const linkReg = registrableDomain(host);

  if (from && !fromReg) {
    add("warn", 8, "Sender address could not be read", "Copy the full address from the message header, including everything after the @.");
  } else if (fromReg && service.domains.includes(fromReg)) {
    add("ok", 0, `Sender is on a ${service.name} domain`,
      `${fromReg} is one of the domains ${service.name} uses. The From header can still be forged, so this is one weak signal — check the link and the request.`);
  } else if (fromReg) {
    add("critical", 28, "Sender is not on a domain the service uses",
      `The message came from ${fromReg}. ${service.name} mail comes from ${service.domains.slice(0, 3).join(", ")}. A hyphenated variant such as "${service.domains[0].split(".")[0]}-billing-update.com" is an unrelated domain someone registered.`);
  }

  if (link && !host) {
    add("warn", 10, "Link could not be read", "Copy the link target rather than the visible words: long press on a phone, or right click then Copy link address.");
  }

  if (host && SHORTENER_HOSTS.includes(linkReg)) {
    add("warn", 18, "Button hides behind a link shortener",
      `${linkReg} is a shortening service, so the real destination is invisible until you arrive. Some brands do use their own short domains, but a generic shortener in a billing message is a reason to stop.`);
  } else if (host && !service.domains.includes(linkReg)) {
    add("critical", 36, `Link does not go to ${service.name}`,
      `The button leads to ${linkReg}, not ${service.domains[0]}. Placing the brand in a subdomain — ${service.domains[0]}.example.io — changes nothing: the owner is the rightmost part of the host.`);
  } else if (host) {
    add("ok", 0, `Link host belongs to ${service.name}`,
      `${linkReg} is the service's own domain. Even then, open the app instead: ${service.route}`);
  }

  if (host && host.split(".").some((l) => l.startsWith("xn--"))) {
    add("critical", 26, "Punycode in the link host",
      "Part of the host is a Unicode name encoded for DNS, so characters from other alphabets can render as ordinary Latin letters.");
  }

  const cards = matched(text, CARD_PHRASES);
  if (cards.length) {
    add("critical", 32, "Asks for card details through the message",
      `"${cards[0]}" is the payload. ${service.note} A payment method is changed inside the app or on a page you opened yourself, never through a link you were sent.`);
  }

  const brands = detectBrands(text);
  const otherBrands = brands.filter((b) => b.id !== service.id);
  if (brands.length > 1 || (brands.length === 1 && otherBrands.length === 1)) {
    add("critical", 24, "The message names more than one service",
      `Text mentioning ${brands.map((b) => b.label).join(" and ")} while claiming to be ${service.name} is a phishing kit reused across brands with a name left unchanged.`);
  }

  const hold = matched(text, HOLD_PHRASES);
  if (hold.length) {
    add("warn", 10, "Standard payment-hold pretext",
      `"${hold[0]}" is normal wording for both genuine dunning mail and its copies, which is why it cannot decide anything on its own. The app tells you the truth in five seconds.`);
  }

  const deadline = matched(text, DEADLINE_PHRASES);
  if (deadline.length) {
    add("warn", 12, "Deadline pressure",
      `"${deadline[0]}" is there to beat your instinct to check. A genuine failed payment simply retries; nothing is lost by opening the app instead of the link.`);
  }

  const greeting = matched(text, GENERIC_GREETINGS);
  if (greeting.length) {
    add("warn", 10, "Generic greeting",
      `"${greeting[0]}" points to a bulk send. Your service knows the name on the account and usually shows the last four digits of the card.`);
  }

  if (hasAttachment) {
    add("critical", 22, "An attachment came with it",
      "Streaming billing notices never need you to open a file. An attached 'invoice' is either malware or an HTML page that opens a fake payment form from your own disk.");
  }

  const score = Math.min(100, findings.reduce((sum, f) => sum + f.weight, 0));
  const { band, tone } = bandFor(score);
  const order = { critical: 0, warn: 1, info: 2, ok: 3 };

  return {
    score,
    band,
    tone,
    service,
    senderDomain: fromReg,
    linkDomain: linkReg,
    brandsMentioned: brands.map((b) => b.label),
    findings: findings.sort((a, b) => (order[a.severity] - order[b.severity]) || (b.weight - a.weight)),
  };
}
