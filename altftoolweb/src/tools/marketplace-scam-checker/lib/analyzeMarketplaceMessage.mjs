const MAX_MESSAGE_LENGTH = 40_000;
const MAX_FINDINGS = 32;

const CATEGORY_META = {
  offPlatform: {
    label: "Off-platform contact or payment",
    description:
      "The message asks to move communication, checkout, or payment away from marketplace protections.",
  },
  escrowCourier: {
    label: "Escrow, courier, or refund claim",
    description:
      "The message relies on an escrow, courier, payment-hold, account-upgrade, or refund story that needs independent confirmation.",
  },
  overpayment: {
    label: "Overpayment or money-back request",
    description:
      "The sender claims too much was paid and asks for money to be returned, redirected, or forwarded.",
  },
  secrets: {
    label: "OTP, PIN, or verification code",
    description:
      "The message requests an authentication or payment code that should not be shared with another marketplace user.",
  },
  remoteAccess: {
    label: "Remote access or screen sharing",
    description:
      "The sender asks for software or screen access that can expose accounts, messages, and payment apps.",
  },
  urgency: {
    label: "Urgency or pressure",
    description:
      "The message shortens the time available to verify payment and transaction details independently.",
  },
  fees: {
    label: "Advance fee or release payment",
    description:
      "The message asks for money before funds, a refund, delivery, or account access can supposedly be released.",
  },
  shipping: {
    label: "Shipping or reshipping pressure",
    description:
      "The message asks for shipment, pickup, forwarding, or an address change before payment and order details are independently confirmed.",
  },
  takeover: {
    label: "Account-takeover instruction",
    description:
      "The message asks for sign-in, recovery, contact-detail, or security changes that could transfer account control.",
  },
};

const NEGATION_PATTERN =
  /\b(?:never|do\s+not|don't|will\s+not|won't|should\s+not|shouldn't|no\s+need\s+to|without)\b[\s\p{L}\p{N}'’:/.-]{0,52}$/iu;

const RULES = [
  {
    id: "off-platform-payment",
    category: "offPlatform",
    severity: "high",
    points: 25,
    title: "Payment moved outside the marketplace",
    explanation:
      "Leaving marketplace checkout can remove platform records, dispute options, and transaction safeguards.",
    patterns: [
      /\b(?:pay|send|transfer|settle|complete)\b[\s\S]{0,55}\b(?:outside|off)\s+(?:the\s+)?(?:platform|marketplace|app)\b/giu,
      /\b(?:avoid|skip|save)\b[\s\S]{0,35}\b(?:platform|marketplace|app)\s+(?:fee|commission|checkout|payment)\b/giu,
      /\b(?:cancel|close|mark)\b[\s\S]{0,45}\b(?:order|listing|item)\b[\s\S]{0,55}\b(?:pay|transfer|deal)\s+(?:directly|privately|by\s+bank|by\s+upi|in\s+crypto)\b/giu,
    ],
    negationWindow: 52,
  },
  {
    id: "off-platform-chat",
    category: "offPlatform",
    severity: "medium",
    points: 10,
    title: "Conversation moved to private messaging",
    explanation:
      "Moving the deal away from marketplace messages can reduce the transaction record available for review.",
    patterns: [
      /\b(?:continue|contact|message|reply|chat|talk)\b[\s\S]{0,45}\b(?:only\s+)?(?:on|via|through)\s+(?:whatsapp|telegram|signal|private\s+email)\b/giu,
      /\b(?:whatsapp|telegram|signal)\s+(?:only|instead\s+of\s+the\s+app)\b/giu,
    ],
    negationWindow: 40,
  },
  {
    id: "fake-escrow-hold",
    category: "escrowCourier",
    severity: "high",
    points: 26,
    title: "Escrow or payment-hold release story",
    explanation:
      "A claim that money is held until shipping, tracking, a fee, or an email step is completed should be checked inside the marketplace and payment account opened independently.",
    patterns: [
      /\b(?:escrow|secure\s+payment)\b[\s\S]{0,65}\b(?:held|pending|release|fee|email|link|tracking|ship)\b/giu,
      /\bpayment\b[\s\S]{0,45}\b(?:held|pending|on\s+hold)\b[\s\S]{0,60}\b(?:ship|tracking|courier|fee|upgrade|release)\b/giu,
      /\bfunds?\s+(?:will\s+be\s+)?released\b[\s\S]{0,60}\b(?:after|once|when)\b[\s\S]{0,55}\b(?:ship|tracking|fee|upgrade|verify)\b/giu,
    ],
    negationWindow: 44,
  },
  {
    id: "account-upgrade-payment",
    category: "escrowCourier",
    severity: "high",
    points: 25,
    title: "Account upgrade required to receive money",
    explanation:
      "A sender-supplied notice requiring an upgrade or payment to receive funds should be checked directly in the official marketplace or payment account.",
    patterns: [
      /\b(?:upgrade|convert)\b[\s\S]{0,35}\b(?:seller|business|merchant|payment)\s+account\b[\s\S]{0,55}\b(?:receive|release|accept)\s+(?:the\s+)?(?:payment|funds|money)\b/giu,
      /\b(?:payment|funds)\b[\s\S]{0,40}\b(?:exceed|limit)\b[\s\S]{0,50}\b(?:upgrade|business\s+account|merchant\s+account|pay\s+a\s+fee)\b/giu,
    ],
    negationWindow: 40,
  },
  {
    id: "courier-agent-payment",
    category: "escrowCourier",
    severity: "high",
    points: 23,
    title: "Buyer-appointed courier or agent payment",
    explanation:
      "A courier or agent who supposedly handles payment, cash, insurance, or reimbursement needs independent confirmation.",
    patterns: [
      /\b(?:my|the)\s+(?:courier|shipping\s+agent|delivery\s+agent|mover)\b[\s\S]{0,75}\b(?:pay|cash|cheque|check|collect|reimburse|insurance|fee)\b/giu,
      /\b(?:courier|shipping\s+agent|delivery\s+agent)\b[\s\S]{0,60}\b(?:will\s+contact|will\s+email|will\s+send|arrange\s+payment)\b/giu,
    ],
    negationWindow: 36,
  },
  {
    id: "refund-release-fee",
    category: "escrowCourier",
    severity: "high",
    points: 24,
    title: "Refund requires another payment",
    explanation:
      "A request to pay before a refund can be released should be verified through the official payment provider opened independently.",
    patterns: [
      /\b(?:refund|reimbursement)\b[\s\S]{0,55}\b(?:processing|release|verification|activation|handling)\s+(?:fee|charge|payment)\b/giu,
      /\b(?:pay|send|deposit)\b[\s\S]{0,45}\b(?:to\s+)?(?:unlock|release|receive|process)\b[\s\S]{0,32}\b(?:refund|reimbursement)\b/giu,
    ],
    negationWindow: 52,
  },
  {
    id: "overpayment-refund",
    category: "overpayment",
    severity: "high",
    points: 29,
    title: "Claimed overpayment with money-back request",
    explanation:
      "A claimed excess payment can disappear or be reversed after separate money has been returned.",
    patterns: [
      /\b(?:overpaid|paid\s+too\s+much|sent\s+too\s+much|sent\s+extra|paid\s+extra)\b[\s\S]{0,75}\b(?:refund|return|send|transfer|forward)\b/giu,
      /\b(?:refund|return|send|transfer)\b[\s\S]{0,45}\b(?:difference|extra|excess|balance|overpayment)\b/giu,
      /\b(?:cashier'?s?\s+check|banker'?s?\s+cheque|certified\s+check)\b[\s\S]{0,90}\b(?:more|extra|difference|refund|shipping\s+agent)\b/giu,
    ],
    negationWindow: 44,
  },
  {
    id: "verification-code-request",
    category: "secrets",
    severity: "high",
    points: 32,
    title: "OTP or verification code requested",
    explanation:
      "A code sent to your device may approve a login, password reset, payment, or account change—not verify another buyer or seller.",
    patterns: [
      /\b(?:send|share|tell|provide|forward|reply\s+with)\b[\s\S]{0,36}\b(?:otp|one[- ]time\s+(?:password|code)|verification\s+code|security\s+code|login\s+code|recovery\s+code|pin|cvv)\b/giu,
      /\b(?:code|otp)\b[\s\S]{0,50}\b(?:prove|confirm|verify)\b[\s\S]{0,40}\b(?:real|seller|buyer|listing|identity|account)\b/giu,
    ],
    negationWindow: 56,
  },
  {
    id: "receive-money-pin-qr",
    category: "secrets",
    severity: "high",
    points: 30,
    title: "PIN or QR step presented as receiving money",
    explanation:
      "A PIN, approval, or payment QR can authorize money leaving an account. Check the transaction in the official payment app.",
    patterns: [
      /\b(?:enter|type|share)\b[\s\S]{0,28}\b(?:upi\s+)?pin\b[\s\S]{0,45}\b(?:receive|get|claim|accept)\b[\s\S]{0,22}\b(?:money|payment|refund|funds)\b/giu,
      /\b(?:scan|approve|accept)\b[\s\S]{0,24}\b(?:qr|collect\s+request)\b[\s\S]{0,45}\b(?:receive|get|claim|accept)\b[\s\S]{0,22}\b(?:money|payment|refund|funds)\b/giu,
    ],
    negationWindow: 48,
  },
  {
    id: "remote-access-request",
    category: "remoteAccess",
    severity: "high",
    points: 32,
    title: "Remote access or screen sharing requested",
    explanation:
      "Remote-control and screen-sharing access can expose marketplace, banking, email, and authentication data.",
    patterns: [
      /\b(?:install|download|open|use)\b[\s\S]{0,30}\b(?:anydesk|teamviewer|quicksupport|rustdesk|remote\s+desktop|remote\s+access|screen[- ]sharing)\b/giu,
      /\b(?:share|show|give)\b[\s\S]{0,28}\b(?:your\s+)?(?:screen|remote\s+access|access\s+code)\b/giu,
    ],
    negationWindow: 48,
  },
  {
    id: "urgent-transaction",
    category: "urgency",
    severity: "medium",
    points: 11,
    title: "Rushed payment or shipping deadline",
    explanation:
      "Pressure to pay, refund, verify, or ship quickly can interrupt independent checks.",
    patterns: [
      /\b(?:pay|refund|transfer|ship|send|verify|confirm|click|reply)\b[\s\S]{0,70}\b(?:immediately|right\s+now|today|within\s+\d+\s*(?:minutes?|hours?))\b/giu,
      /\b(?:urgent|last\s+chance|final\s+notice|offer\s+expires?|courier\s+is\s+waiting|driver\s+is\s+waiting)\b/giu,
      /\b(?:do\s+not|don't)\s+(?:contact|call|message|open)\b[\s\S]{0,35}\b(?:support|marketplace|platform|bank|payment\s+app)\b/giu,
    ],
  },
  {
    id: "advance-release-fee",
    category: "fees",
    severity: "high",
    points: 24,
    title: "Advance shipping, insurance, or release fee",
    explanation:
      "An advance payment tied to release, delivery, insurance, customs, processing, or verification should be confirmed in the official transaction flow.",
    patterns: [
      /\b(?:pay|send|transfer|deposit)\b[\s\S]{0,55}\b(?:shipping|courier|insurance|customs|tax|processing|handling|activation|release|verification|clearance)\s+(?:fee|charge|deposit|amount)\b/giu,
      /\b(?:refundable|temporary)\s+(?:shipping|courier|insurance|processing|verification|release|security)\s+(?:fee|charge|deposit)\b/giu,
    ],
    negationWindow: 54,
  },
  {
    id: "ship-before-settlement",
    category: "shipping",
    severity: "high",
    points: 23,
    title: "Shipment requested before verified settlement",
    explanation:
      "A payment email, screenshot, pending status, or sender claim is not the same as settled funds visible in an account opened independently.",
    patterns: [
      /\b(?:ship|send|dispatch|hand\s+over)\b[\s\S]{0,50}\b(?:before|while)\b[\s\S]{0,45}\b(?:payment\s+clears?|funds\s+clear|payment\s+settles?|money\s+arrives?)\b/giu,
      /\b(?:payment|transfer)\s+(?:is\s+)?(?:pending|on\s+hold|processing)\b[\s\S]{0,60}\b(?:ship|send|dispatch|tracking)\b/giu,
      /\b(?:screenshot|email|sms|receipt)\b[\s\S]{0,45}\b(?:proof\s+of\s+payment|payment\s+proof|shows?\s+payment)\b[\s\S]{0,55}\b(?:ship|send|dispatch)\b/giu,
    ],
    negationWindow: 64,
  },
  {
    id: "address-change-or-reship",
    category: "shipping",
    severity: "medium",
    points: 13,
    title: "Address change or onward shipping request",
    explanation:
      "A last-minute address change, package forwarding, or reshipping request should be reconciled with the official order and protection policy.",
    patterns: [
      /\b(?:change|use|ship\s+to|send\s+to)\b[\s\S]{0,38}\b(?:different|new|alternate)\s+(?:address|recipient|location)\b[\s\S]{0,35}\b(?:after|instead|now|urgent)?\b/giu,
      /\b(?:receive|accept)\b[\s\S]{0,45}\b(?:package|parcel|item)\b[\s\S]{0,60}\b(?:forward|reship|relabel|send\s+on)\b/giu,
    ],
    negationWindow: 40,
  },
  {
    id: "account-login-link",
    category: "takeover",
    severity: "high",
    points: 30,
    title: "Sender-supplied account sign-in or recovery step",
    explanation:
      "A sender-supplied sign-in, verification, or recovery link can capture credentials or change account control.",
    patterns: [
      /\b(?:log\s*in|sign\s*in|verify\s+your\s+account|unlock\s+your\s+account|restore\s+your\s+account)\b[\s\S]{0,55}\b(?:link|website|page|portal|here)\b/giu,
      /\b(?:reset|change|update|add)\b[\s\S]{0,34}\b(?:password|recovery\s+(?:email|phone)|email\s+address|phone\s+number|two[- ]factor|2fa)\b[\s\S]{0,45}\b(?:to|with|using)\b/giu,
    ],
    negationWindow: 52,
  },
  {
    id: "account-credential-request",
    category: "takeover",
    severity: "high",
    points: 34,
    title: "Marketplace or email credential requested",
    explanation:
      "Another buyer or seller should not need your marketplace password, email password, backup code, or session details.",
    patterns: [
      /\b(?:send|share|provide|tell|enter)\b[\s\S]{0,36}\b(?:marketplace\s+password|account\s+password|email\s+password|backup\s+code|recovery\s+code|session\s+cookie|login\s+details)\b/giu,
    ],
    negationWindow: 56,
  },
];

function normalizeText(value) {
  return typeof value === "string" ? value.replace(/\r\n?/g, "\n") : String(value ?? "");
}

export function redactMarketplaceEvidence(value) {
  return normalizeText(value)
    .replace(/\b(?:https?:\/\/|www\.)[^\s<>"'`]+/giu, "[LINK]")
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/giu, "[EMAIL]")
    .replace(/\b[a-z0-9._-]{2,}@[a-z]{2,}\b/giu, "[PAYMENT ID]")
    .replace(
      /(?:₹|rs\.?|inr|\$|usd|€|eur|£|gbp)\s*[\d,.]+|[\d,.]+\s*(?:rupees?|inr|dollars?|usd|euros?|eur|pounds?|gbp)\b/giu,
      "[AMOUNT]",
    )
    .replace(/\b(?:\+?\d[\d\s().-]{7,}\d)\b/gu, "[PHONE OR NUMBER]")
    .replace(/\b\d{4,8}\b/gu, "[CODE OR NUMBER]")
    .replace(/\b\d{9,18}\b/gu, "[LONG NUMBER]");
}

function lineForIndex(text, index) {
  return text.slice(0, index).split("\n").length;
}

function excerptAround(text, index, length) {
  const radius = 58;
  const start = Math.max(0, index - radius);
  const end = Math.min(text.length, index + Math.max(1, length) + radius);
  return redactMarketplaceEvidence(
    `${start > 0 ? "…" : ""}${text.slice(start, end).replace(/\s+/gu, " ").trim()}${end < text.length ? "…" : ""}`,
  );
}

function collectRuleMatches(text, rule) {
  const matches = [];
  const seen = new Set();
  for (const pattern of rule.patterns) {
    const matcher = new RegExp(
      pattern.source,
      pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`,
    );
    for (const match of text.matchAll(matcher)) {
      const index = match.index ?? 0;
      const prefix = text.slice(
        Math.max(0, index - (rule.negationWindow || 0)),
        index,
      );
      if (rule.negationWindow && NEGATION_PATTERN.test(prefix)) continue;
      const key = `${index}:${match[0].toLocaleLowerCase("en-US")}`;
      if (seen.has(key)) continue;
      seen.add(key);
      matches.push({
        line: lineForIndex(text, index),
        excerpt: excerptAround(text, index, match[0].length),
      });
      if (matches.length >= 4) return matches;
    }
  }
  return matches;
}

function positiveNumber(value) {
  const number = Number(String(value ?? "").replace(/,/gu, ""));
  return Number.isFinite(number) && number > 0 ? number : null;
}

function contextOverpaymentFinding(options) {
  const listingAmount = positiveNumber(options.listingAmount);
  const claimedAmount = positiveNumber(options.claimedPaymentAmount);
  if (!listingAmount || !claimedAmount || claimedAmount <= listingAmount * 1.05) {
    return null;
  }
  return {
    id: "context-amount-overpayment",
    category: "overpayment",
    severity: "medium",
    points: 18,
    title: "Claimed payment exceeds the listing amount",
    explanation:
      "The optional context values indicate an overpayment. Confirm settled funds independently and do not return a difference based only on a sender claim.",
    matches: [],
    count: 1,
  };
}

function categorySummary(findings) {
  const grouped = new Map();
  findings.forEach((finding) => {
    const current = grouped.get(finding.category) || {
      id: finding.category,
      ...CATEGORY_META[finding.category],
      findingCount: 0,
      matchCount: 0,
    };
    current.findingCount += 1;
    current.matchCount += finding.count;
    grouped.set(finding.category, current);
  });
  return [...grouped.values()];
}

function nextStepsFor(categories, role) {
  const ids = new Set(categories.map((category) => category.id));
  const steps = [
    "Keep the conversation and transaction inside the marketplace while you verify it. Open the official app or site yourself instead of using sender-supplied links.",
  ];
  if (role === "seller") {
    steps.push(
      "Confirm that funds are settled inside the marketplace or payment account you open independently. Do not rely on screenshots, emails, SMS messages, or a pending balance.",
    );
  } else if (role === "buyer") {
    steps.push(
      "Use the marketplace checkout and buyer-protection flow you open independently. Confirm the seller, item, delivery terms, and refund policy before paying.",
    );
  } else {
    steps.push(
      "Confirm the order, participant, payment status, and protection terms inside the marketplace account you open independently.",
    );
  }
  if (ids.has("overpayment")) {
    steps.push(
      "Do not refund or forward a claimed excess payment from separate funds. Ask the payment provider to confirm final settlement and the correct reversal process.",
    );
  }
  if (ids.has("fees") || ids.has("escrowCourier")) {
    steps.push(
      "Verify every escrow, courier, insurance, account-upgrade, release, or refund fee through official support reached independently.",
    );
  }
  if (ids.has("secrets") || ids.has("takeover")) {
    steps.push(
      "Do not share OTPs, PINs, passwords, recovery codes, or login sessions. If you entered any, change credentials through the official app and review active sessions.",
    );
  }
  if (ids.has("remoteAccess")) {
    steps.push(
      "Do not install remote-control software or share your screen. End any active session and review permissions if access was already granted.",
    );
  }
  if (ids.has("shipping")) {
    steps.push(
      "Match the shipping address and pickup instructions to the protected order. Do not dispatch while payment is pending or redirect goods outside the recorded order.",
    );
  }
  if (ids.has("urgency")) {
    steps.push(
      "Ignore the sender’s deadline long enough to check official support, payment settlement, and order details independently.",
    );
  }
  steps.push(
    "Preserve the listing, profile, messages, headers, payment instructions, receipts, and shipment details. If money or account access was lost, contact the relevant marketplace, bank, or payment provider promptly.",
  );
  return steps;
}

function assessmentFor(score, findings, categories) {
  const highCount = findings.filter((finding) => finding.severity === "high").length;
  const ids = new Set(categories.map((category) => category.id));
  if (
    highCount >= 2 ||
    ids.has("remoteAccess") ||
    ids.has("takeover") ||
    (ids.has("overpayment") && ids.has("fees")) ||
    score >= 58
  ) {
    return {
      level: "strong",
      label: "Strong warning-pattern cluster",
      summary:
        "Pause payment, refunds, shipping, code sharing, and account changes until the transaction is independently verified.",
    };
  }
  if (highCount >= 1 || score >= 30) {
    return {
      level: "caution",
      label: "Important checks needed",
      summary:
        "One or more higher-impact patterns need verification inside the official marketplace and payment account.",
    };
  }
  if (score > 0) {
    return {
      level: "notice",
      label: "Some clues need review",
      summary:
        "The message contains ambiguous or context-dependent patterns. Compare them with the protected transaction flow.",
    };
  }
  return {
    level: "none",
    label: "No configured warning patterns found",
    summary:
      "The configured rules did not match. This does not confirm the listing, buyer, seller, payment, courier, or message is legitimate.",
  };
}

export function analyzeMarketplaceMessage(value, options = {}) {
  const originalText = normalizeText(value);
  const text = originalText.slice(0, MAX_MESSAGE_LENGTH);
  const findings = [];

  for (const rule of RULES) {
    const matches = collectRuleMatches(text, rule);
    if (matches.length) {
      findings.push({
        id: rule.id,
        category: rule.category,
        severity: rule.severity,
        points: rule.points,
        title: rule.title,
        explanation: rule.explanation,
        matches,
        count: matches.length,
      });
    }
  }
  const contextFinding = contextOverpaymentFinding(options);
  if (contextFinding) findings.push(contextFinding);

  const compactFindings = findings.slice(0, MAX_FINDINGS);
  const score = Math.min(
    100,
    compactFindings.reduce(
      (total, finding) =>
        total + finding.points + Math.min(6, Math.max(0, finding.count - 1) * 2),
      0,
    ),
  );
  const categories = categorySummary(compactFindings);

  return {
    messageLength: text.length,
    originalLength: originalText.length,
    truncated: originalText.length > MAX_MESSAGE_LENGTH,
    findings: compactFindings,
    categories,
    score,
    assessment: assessmentFor(score, compactFindings, categories),
    nextSteps: nextStepsFor(categories, options.role),
    disclaimer:
      "This deterministic score is not a probability or a fraud verdict. The tool performs no live profile, listing, reputation, domain, payment, escrow, courier, or shipment verification.",
  };
}

export function buildSafeMarketplaceReport(result) {
  const lines = [
    "Marketplace Message Check — Safe Summary",
    "========================================",
    `Assessment: ${result.assessment.label}`,
    `Signal score: ${result.score}/100 (not a probability)`,
    `Evidence categories: ${result.categories.length}`,
    `Configured finding groups: ${result.findings.length}`,
    "",
    "Important: This is deterministic triage, not a fraud verdict or live reputation check.",
    "",
    "Evidence categories",
  ];
  if (!result.categories.length) lines.push("- No configured category matched");
  result.categories.forEach((category) => {
    lines.push(`- ${category.label}: ${category.matchCount} pattern match(es)`);
  });
  lines.push("", "Finding types");
  if (!result.findings.length) lines.push("- None");
  result.findings.forEach((finding) => {
    lines.push(
      `- [${finding.severity.toUpperCase()}] ${finding.title}: ${finding.count} match(es)`,
    );
  });
  lines.push("", "Safer checks");
  result.nextSteps.forEach((step, index) => lines.push(`${index + 1}. ${step}`));
  lines.push(
    "",
    "Privacy: This report excludes the pasted message, listing details, participant names, contact details, domains, links, payment values, account identifiers, codes, addresses, and matched excerpts.",
    "Processing: Analysis ran locally. The tool did not upload, store, contact, open, resolve, or verify any profile, listing, domain, link, payment, escrow, courier, or shipment.",
  );
  return lines.join("\n");
}

export const analyzerLimits = {
  maxMessageLength: MAX_MESSAGE_LENGTH,
  maxFindings: MAX_FINDINGS,
};
