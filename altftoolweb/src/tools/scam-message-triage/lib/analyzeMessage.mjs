const MAX_MESSAGE_LENGTH = 20000;

const CATEGORY_META = {
  urgency: {
    label: "Urgency or pressure",
    description: "Language that tries to shorten the time available for an independent check.",
  },
  payment: {
    label: "Unusual payment request",
    description: "Requests involving hard-to-reverse payments or unexpected collection flows.",
  },
  credentials: {
    label: "Credential or secret request",
    description: "Requests to disclose or enter authentication or financial secrets.",
  },
  impersonation: {
    label: "Identity or authority claim",
    description: "Language that may be borrowing trust from a person, company, or authority.",
  },
  links: {
    label: "Link needs inspection",
    description: "A link has a structural trait that deserves an independent check before opening.",
  },
  unicode: {
    label: "Hidden or look-alike characters",
    description: "Invisible controls or mixed alphabets can make text and domains look misleading.",
  },
};

const TEXT_RULES = [
  {
    id: "immediate-action",
    category: "urgency",
    title: "Immediate-action language",
    weight: 12,
    explanation: "Pressure to act immediately can reduce the chance of independent verification.",
    patterns: [
      /\b(?:act|respond|reply|verify|confirm|pay|click)\s+(?:right\s+)?now\b/giu,
      /\b(?:urgent|immediately|final warning|last chance|time[- ]sensitive)\b/giu,
      /\bwithin\s+(?:the\s+next\s+)?\d+\s*(?:minutes?|hours?)\b/giu,
      /\b(?:today|tonight)\s+only\b/giu,
    ],
  },
  {
    id: "threatened-consequence",
    category: "urgency",
    title: "Threatened consequence",
    weight: 16,
    explanation: "A threatened loss or penalty is a common way to force a rushed decision.",
    patterns: [
      /\b(?:account|card|number|service|sim|wallet)\s+(?:will\s+be|has\s+been|is)\s+(?:blocked|closed|disabled|suspended|deactivated|frozen)\b/giu,
      /\b(?:legal action|arrest warrant|police case|penalty|fine|disconnection)\b/giu,
      /\b(?:parcel|package|delivery)\s+(?:will\s+be\s+)?(?:cancelled|canceled|returned|held)\b/giu,
    ],
  },
  {
    id: "irreversible-payment",
    category: "payment",
    title: "Hard-to-reverse payment method",
    weight: 24,
    explanation: "Gift cards, cryptocurrency, and cash-like transfers can be difficult to recover.",
    patterns: [
      /\b(?:gift\s*card|voucher code|steam card|google play card|apple gift card)\b/giu,
      /\b(?:bitcoin|btc|cryptocurrency|crypto wallet|usdt|ethereum)\b/giu,
      /\b(?:wire transfer|money transfer|western union|moneygram)\b/giu,
    ],
  },
  {
    id: "collect-or-qr-payment",
    category: "payment",
    title: "Collect request or payment QR",
    weight: 22,
    explanation: "Approving a collect request or entering a PIN authorizes payment; it is not required to receive money.",
    patterns: [
      /\b(?:approve|accept|authori[sz]e)\s+(?:the\s+)?(?:upi\s+)?collect request\b/giu,
      /\bscan\s+(?:this|the)\s+qr(?:\s+code)?\s+(?:to|for)\s+(?:receive|claim|get)\b/giu,
      /\benter\s+(?:your\s+)?upi\s+pin\s+(?:to|for)\s+(?:receive|refund|claim|get)\b/giu,
    ],
  },
  {
    id: "unexpected-payment",
    category: "payment",
    title: "Direct payment demand",
    weight: 12,
    explanation: "An unexpected demand to send money should be confirmed through a separately sourced channel.",
    patterns: [
      /\b(?:send|transfer|deposit|pay)\s+(?:me|us|them|the\s+fee|the\s+amount|money|funds|₹|rs\.?)\b/giu,
      /\b(?:processing|release|customs|verification|delivery)\s+fee\b/giu,
      /\b(?:pay|transfer)\s+₹?\s?\d[\d,.]*\b/giu,
    ],
  },
  {
    id: "secret-request",
    category: "credentials",
    title: "Authentication secret requested",
    weight: 28,
    explanation: "Passwords, OTPs, PINs, CVVs, and recovery codes should not be shared in a message or call.",
    patterns: [
      /\b(?:share|send|tell|provide|reply\s+with|forward)\s+(?:me|us|them|back\s+with)?\s*(?:your\s+)?(?:otp|one[- ]time password|password|pin|cvv|security code|recovery code|backup code|seed phrase)\b/giu,
      /\b(?:enter|submit|type)\s+(?:the|your)?\s*(?:otp|one[- ]time password|password|pin|cvv|security code|recovery code|seed phrase)\s+(?:at|on|into|here|below|to)\b/giu,
    ],
    negationWindow: 16,
  },
  {
    id: "sensitive-data-request",
    category: "credentials",
    title: "Sensitive personal data requested",
    weight: 18,
    explanation: "Unexpected requests for card, bank, or identity details deserve independent verification.",
    patterns: [
      /\b(?:share|send|provide|submit|confirm)\s+(?:your\s+)?(?:card number|bank details|account number|aadhaar|aadhar|pan number|date of birth)\b/giu,
      /\b(?:update|complete|verify)\s+(?:your\s+)?kyc\s+(?:at|on|using|through|via)\b/giu,
    ],
    negationWindow: 16,
  },
  {
    id: "remote-access",
    category: "credentials",
    title: "Remote-access instruction",
    weight: 26,
    explanation: "Unexpected requests to install screen-sharing or remote-control software can expose accounts and devices.",
    patterns: [
      /\b(?:install|download|open)\s+(?:the\s+)?(?:anydesk|teamviewer|quicksupport|remote access|screen[- ]sharing)\b/giu,
      /\b(?:share|give)\s+(?:me|us)?\s*(?:the\s+)?(?:remote access|screen access|access code)\b/giu,
    ],
  },
  {
    id: "institution-claim",
    category: "impersonation",
    title: "Institution or authority claim",
    weight: 12,
    explanation: "Names and titles in a message are easy to copy; verify the sender through an official channel.",
    patterns: [
      /\b(?:i am|i'm|this is|we are|calling|writing)\s+(?:from\s+)?(?:your\s+)?(?:bank|police|cyber crime|tax department|income tax|customs|courier|delivery company|tech support|customer care)\b/giu,
      /\b(?:official|authorized)\s+(?:bank|government|police|support|customer care)\s+(?:agent|officer|representative|team)\b/giu,
    ],
  },
  {
    id: "relationship-claim",
    category: "impersonation",
    title: "Familiar-person identity claim",
    weight: 14,
    explanation: "A claimed boss, relative, or friend using a new number should be checked using a known contact method.",
    patterns: [
      /\b(?:this is|it's)\s+(?:your\s+)?(?:boss|manager|ceo|son|daughter|friend|brother|sister|uncle|aunt)\b/giu,
      /\b(?:my|i have a)\s+new (?:phone|mobile|whatsapp)?\s*number\b/giu,
      /\b(?:don't|do not)\s+(?:call|tell)\s+(?:anyone|the office|my old number)\b/giu,
    ],
  },
];

const SHORTENER_HOSTS = new Set([
  "bit.ly",
  "cutt.ly",
  "is.gd",
  "rb.gy",
  "rebrand.ly",
  "shorturl.at",
  "t.co",
  "tiny.cc",
  "tinyurl.com",
]);

const URL_PATTERN = /(?:https?:\/\/|www\.)[^\s<>"'`]+/giu;
const CONTROL_PATTERN = /[\u200B-\u200F\u202A-\u202E\u2060\u2066-\u2069\uFEFF]/gu;
const FULLWIDTH_PATTERN = /[\uFF01-\uFF60\uFFE0-\uFFE6]/gu;
const NEGATION_PATTERN = /(?:\bnever\b|\bdo\s+not\b|\bdon't\b|\bshould(?:n'?t| not)\b)/iu;

function uniqueMatches(matches) {
  const seen = new Set();
  return matches.filter((match) => {
    const key = `${match.index}:${match.text.toLocaleLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function excerptAround(text, index, length) {
  const radius = 34;
  const start = Math.max(0, index - radius);
  const end = Math.min(text.length, index + length + radius);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < text.length ? "…" : "";
  return `${prefix}${text.slice(start, end).replace(/\s+/g, " ").trim()}${suffix}`;
}

function collectPatternMatches(text, patterns, negationWindow = 0) {
  const matches = [];

  for (const pattern of patterns) {
    const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
    const matcher = new RegExp(pattern.source, flags);

    for (const match of text.matchAll(matcher)) {
      const index = match.index ?? 0;
      const prefix = text.slice(Math.max(0, index - negationWindow), index);
      if (negationWindow && NEGATION_PATTERN.test(prefix)) continue;

      matches.push({
        text: match[0],
        index,
        excerpt: excerptAround(text, index, match[0].length),
      });
    }
  }

  return uniqueMatches(matches).slice(0, 6);
}

function trimUrl(raw) {
  return raw.replace(/[),.;!?]+$/u, "");
}

function rawHostname(rawUrl) {
  const withoutProtocol = rawUrl.replace(/^https?:\/\//iu, "").replace(/^www\./iu, "");
  const authority = withoutProtocol.split(/[/?#]/u)[0];
  return (authority.split("@").pop() || "").split(":")[0];
}

function parseUrl(raw) {
  const normalized = /^www\./iu.test(raw) ? `https://${raw}` : raw;
  try {
    return new URL(normalized);
  } catch {
    return null;
  }
}

function hasMixedAlphabet(value) {
  const hasLatin = /\p{Script=Latin}/u.test(value);
  const hasCyrillicOrGreek = /[\p{Script=Cyrillic}\p{Script=Greek}]/u.test(value);
  return hasLatin && hasCyrillicOrGreek;
}

function inspectUrls(text) {
  const rawUrls = [...text.matchAll(URL_PATTERN)].map((match) => ({
    raw: trimUrl(match[0]),
    index: match.index ?? 0,
  }));
  const findings = [];

  for (const item of rawUrls) {
    const parsed = parseUrl(item.raw);
    const displayHost = rawHostname(item.raw);
    const host = parsed?.hostname?.toLocaleLowerCase() || displayHost.toLocaleLowerCase();
    const reasons = [];
    let weight = 0;

    if (SHORTENER_HOSTS.has(host.replace(/^www\./u, ""))) {
      reasons.push("Shortened link hides its final destination");
      weight = Math.max(weight, 14);
    }
    if (/^(?:\d{1,3}\.){3}\d{1,3}$/u.test(host) || /^\[[0-9a-f:]+\]$/iu.test(host)) {
      reasons.push("Link uses a numeric IP address instead of a familiar domain");
      weight = Math.max(weight, 18);
    }
    if (host.includes("xn--")) {
      reasons.push("Domain contains an internationalized punycode label");
      weight = Math.max(weight, 18);
    }
    if (hasMixedAlphabet(displayHost)) {
      reasons.push("Domain mixes Latin with Cyrillic or Greek characters");
      weight = Math.max(weight, 24);
    }
    if (item.raw.replace(/^https?:\/\//iu, "").split("/")[0].includes("@")) {
      reasons.push("Link contains user-info before the actual host");
      weight = Math.max(weight, 18);
    }
    if (parsed?.protocol === "http:") {
      reasons.push("Link does not use HTTPS");
      weight = Math.max(weight, 8);
    }

    if (reasons.length) {
      findings.push({
        id: `url-${item.index}`,
        category: "links",
        title: "URL structure needs a closer look",
        weight,
        explanation:
          "These traits do not prove a link is harmful, but the destination should be verified independently.",
        matches: [
          {
            text: item.raw,
            index: item.index,
            excerpt: excerptAround(text, item.index, item.raw.length),
          },
        ],
        details: reasons,
      });
    }
  }

  return { count: rawUrls.length, findings };
}

function inspectUnicode(text) {
  const findings = [];
  const controlMatches = [...text.matchAll(CONTROL_PATTERN)].map((match) => ({
    text: `U+${match[0].codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`,
    index: match.index ?? 0,
    excerpt: excerptAround(text, match.index ?? 0, match[0].length),
  }));

  if (controlMatches.length) {
    findings.push({
      id: "unicode-controls",
      category: "unicode",
      title: "Invisible or direction-changing characters",
      weight: 24,
      explanation: "Hidden formatting controls can disguise how text, numbers, or links are displayed.",
      matches: controlMatches.slice(0, 6),
      details: ["One or more zero-width or bidirectional control characters were found"],
    });
  }

  const fullwidthMatches = [...text.matchAll(FULLWIDTH_PATTERN)].map((match) => ({
    text: match[0],
    index: match.index ?? 0,
    excerpt: excerptAround(text, match.index ?? 0, match[0].length),
  }));

  if (fullwidthMatches.length) {
    findings.push({
      id: "unicode-fullwidth",
      category: "unicode",
      title: "Full-width look-alike characters",
      weight: 12,
      explanation: "Full-width characters can visually resemble ordinary Latin letters or punctuation.",
      matches: fullwidthMatches.slice(0, 6),
      details: ["Compare the original text with a trusted source before acting"],
    });
  }

  const tokens = [...text.matchAll(/[\p{L}\p{N}._-]{3,}/gu)];
  const mixedMatches = tokens
    .filter((match) => hasMixedAlphabet(match[0]))
    .map((match) => ({
      text: match[0],
      index: match.index ?? 0,
      excerpt: excerptAround(text, match.index ?? 0, match[0].length),
    }));

  if (mixedMatches.length) {
    findings.push({
      id: "unicode-mixed-alphabet",
      category: "unicode",
      title: "Mixed-alphabet look-alike text",
      weight: 22,
      explanation: "A word mixes Latin with Cyrillic or Greek letters that may look similar on screen.",
      matches: uniqueMatches(mixedMatches).slice(0, 6),
      details: ["Check each character in the sender name and domain carefully"],
    });
  }

  return findings;
}

function nextStepsFor(categories, channel) {
  const steps = [
    "Pause. Do not reply, open links, call numbers, or use contact details supplied in the message.",
    "Verify the claim independently in the official app or website, or use a phone number you already trust.",
  ];

  if (categories.has("credentials")) {
    steps.push("Do not disclose an OTP, PIN, password, CVV, recovery code, or screen-access code.");
  }
  if (categories.has("payment")) {
    steps.push("Do not approve a collect request or payment to receive money; confirm any payment separately.");
  }
  if (categories.has("impersonation")) {
    steps.push("Contact the claimed person or organisation through a known number or a fresh, verified conversation.");
  }
  if (categories.has("links") || categories.has("unicode")) {
    steps.push("Navigate to the expected service yourself instead of copying or opening the supplied link.");
  }

  const channelLabel = channel === "email" ? "email provider" : channel === "whatsapp" ? "WhatsApp" : "messaging app";
  steps.push(`If it remains suspicious, block and report the sender using ${channelLabel}'s built-in controls.`);
  steps.push("If you already shared a secret or sent money, contact the relevant bank or provider through an official channel promptly.");

  return steps;
}

function assessmentFor(score, findingCount) {
  if (findingCount === 0) {
    return {
      level: "none",
      label: "No listed warning patterns detected",
      summary:
        "The checklist did not match its known warning patterns. That does not confirm the message is genuine.",
    };
  }
  if (score < 25) {
    return {
      level: "notice",
      label: "A few caution signals detected",
      summary:
        "One or more details deserve an independent check before you reply, click, disclose information, or pay.",
    };
  }
  if (score < 55) {
    return {
      level: "caution",
      label: "Several caution signals detected",
      summary:
        "Pause and verify the claim through a separately sourced official channel before taking any requested action.",
    };
  }
  return {
    level: "strong",
    label: "Multiple strong caution signals detected",
    summary:
      "The message combines several warning patterns. Do not use its links or contact details while you verify the claim independently.",
  };
}

export function analyzeMessage(rawMessage, options = {}) {
  const message = String(rawMessage || "").slice(0, MAX_MESSAGE_LENGTH);
  const channel = ["sms", "whatsapp", "email"].includes(options.channel)
    ? options.channel
    : "sms";

  if (!message.trim()) {
    const assessment = assessmentFor(0, 0);
    return {
      messageLength: 0,
      channel,
      score: 0,
      findings: [],
      categories: [],
      linkCount: 0,
      assessment,
      nextSteps: nextStepsFor(new Set(), channel),
      disclaimer:
        "This deterministic checklist cannot confirm whether a message is genuine or fraudulent.",
    };
  }

  const findings = TEXT_RULES.flatMap((rule) => {
    const matches = collectPatternMatches(
      message,
      rule.patterns,
      rule.negationWindow || 0,
    );
    if (!matches.length) return [];
    return [
      {
        id: rule.id,
        category: rule.category,
        title: rule.title,
        weight: rule.weight,
        explanation: rule.explanation,
        matches,
        details: [],
      },
    ];
  });

  const urlInspection = inspectUrls(message);
  findings.push(...urlInspection.findings, ...inspectUnicode(message));

  const categories = new Set(findings.map((finding) => finding.category));
  let score = findings.reduce((total, finding) => total + finding.weight, 0);

  if (categories.has("credentials") && categories.has("links")) score += 10;
  if (categories.has("payment") && categories.has("urgency")) score += 8;
  if (categories.has("impersonation") && categories.has("urgency")) score += 6;
  score = Math.min(100, score);

  const assessment = assessmentFor(score, findings.length);

  return {
    messageLength: message.length,
    channel,
    score,
    findings,
    categories: [...categories].map((id) => ({ id, ...CATEGORY_META[id] })),
    linkCount: urlInspection.count,
    assessment,
    nextSteps: nextStepsFor(categories, channel),
    disclaimer:
      "This deterministic checklist identifies text patterns only. It cannot confirm whether a message is genuine or fraudulent, and a low score does not mean a message is safe.",
  };
}

export function buildTriageReport(result) {
  const evidence = result.findings.length
    ? result.findings.flatMap((finding) => [
        `- ${finding.title}: ${finding.explanation}`,
        ...finding.matches.map((match) => `  Evidence: ${match.excerpt}`),
        ...finding.details.map((detail) => `  Note: ${detail}`),
      ])
    : ["- No listed warning patterns were matched."];

  return [
    "Scam Message Triage — local checklist",
    `Assessment: ${result.assessment.label}`,
    `Signal score: ${result.score}/100 (not a probability)`,
    "",
    "Observed evidence",
    ...evidence,
    "",
    "Safer next steps",
    ...result.nextSteps.map((step, index) => `${index + 1}. ${step}`),
    "",
    result.disclaimer,
  ].join("\n");
}

export const analyzerLimits = {
  maxMessageLength: MAX_MESSAGE_LENGTH,
};
