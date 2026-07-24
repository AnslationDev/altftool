const MAX_OFFER_LENGTH = 40_000;
const MAX_FINDINGS = 30;

const CATEGORY_META = {
  fees: {
    label: "Upfront fee or deposit",
    description:
      "The offer asks the candidate to pay before or during hiring, onboarding, training, or equipment delivery.",
  },
  payment: {
    label: "Hard-to-recover payment",
    description:
      "The requested payment method can be difficult to trace, dispute, or reverse.",
  },
  mule: {
    label: "Money movement or reshipping",
    description:
      "The role appears to involve receiving, forwarding, converting, or reshipping value through a personal account or address.",
  },
  personalPayment: {
    label: "Personal-account payment",
    description:
      "The payment destination appears personal or separate from a clearly identified employer billing flow.",
  },
  urgency: {
    label: "Urgency or pressure",
    description:
      "The message shortens the time available for independent employer and role verification.",
  },
  contact: {
    label: "Contact or domain mismatch",
    description:
      "The recruiter contact does not clearly align with an independently supplied official company domain.",
  },
  compensation: {
    label: "Compensation claim needs comparison",
    description:
      "The pay claim, work description, or hiring process deserves comparison with the employer’s independently found listing.",
  },
  identity: {
    label: "Identity-document pressure",
    description:
      "The offer requests identity, financial, or authentication data before the employer and hiring stage are established.",
  },
};

const FREE_MAIL_DOMAINS = new Set([
  "aol.com",
  "gmail.com",
  "hotmail.com",
  "icloud.com",
  "live.com",
  "outlook.com",
  "proton.me",
  "protonmail.com",
  "yahoo.com",
  "yandex.com",
  "zoho.com",
]);

const NEGATION_PATTERN =
  /\b(?:never|do\s+not|don't|will\s+not|won't|not\s+required\s+to|no\s+need\s+to|without)\b[\s\p{L}\p{N}'’-]{0,48}$/iu;

const TEXT_RULES = [
  {
    id: "upfront-fee-action",
    category: "fees",
    severity: "high",
    points: 26,
    title: "Payment requested during hiring",
    explanation:
      "A candidate payment tied to an application, interview, onboarding, training, equipment, or verification step needs independent confirmation.",
    patterns: [
      /\b(?:pay|send|transfer|deposit|submit)\b[\s\S]{0,60}\b(?:application|registration|processing|training|onboarding|security|background\s+check|verification|equipment|uniform|laptop|software)\s+(?:fee|charge|deposit|amount|money)\b/giu,
      /\b(?:application|registration|processing|training|onboarding|security|background\s+check|verification|equipment|uniform|laptop|software)\s+(?:fee|charge|deposit)\b[\s\S]{0,60}\b(?:required|mandatory|refundable|payable|before|continue|confirm|reserve)\b/giu,
    ],
    negationWindow: 56,
  },
  {
    id: "refundable-deposit",
    category: "fees",
    severity: "high",
    points: 24,
    title: "Refundable deposit claim",
    explanation:
      "Calling a candidate payment refundable does not establish who receives it or whether it can actually be recovered.",
    patterns: [
      /\b(?:fully\s+)?refundable\s+(?:security\s+|training\s+|equipment\s+|joining\s+)?(?:deposit|fee|amount)\b/giu,
      /\bdeposit\b[\s\S]{0,45}\b(?:refunded|reimbursed|returned)\b[\s\S]{0,30}\b(?:joining|first salary|onboarding|training)\b/giu,
    ],
    negationWindow: 48,
  },
  {
    id: "gift-card-payment",
    category: "payment",
    severity: "high",
    points: 30,
    title: "Gift-card or voucher payment",
    explanation:
      "Gift-card and voucher codes are cash-like and difficult to recover after disclosure.",
    patterns: [
      /\b(?:gift\s*cards?|google\s+play\s+cards?|apple\s+gift\s+cards?|steam\s+cards?|voucher\s+codes?)\b/giu,
    ],
    negationWindow: 44,
  },
  {
    id: "crypto-payment",
    category: "payment",
    severity: "high",
    points: 28,
    title: "Cryptocurrency payment request",
    explanation:
      "A hiring-related request for cryptocurrency should be paused and verified independently.",
    patterns: [
      /\b(?:pay|send|transfer|deposit|buy|convert|forward)\b[\s\S]{0,48}\b(?:bitcoin|btc|crypto(?:currency)?|ethereum|eth|usdt|tether|wallet\s+address)\b/giu,
      /\b(?:bitcoin|btc|crypto(?:currency)?|ethereum|eth|usdt|tether)\b[\s\S]{0,48}\b(?:fee|deposit|payment|transfer)\b/giu,
    ],
    negationWindow: 44,
  },
  {
    id: "money-forwarding",
    category: "mule",
    severity: "high",
    points: 34,
    title: "Receive-and-forward money instruction",
    explanation:
      "Using a worker’s personal account to receive and forward funds can expose the worker to financial loss and legal risk.",
    patterns: [
      /\b(?:receive|accept)\b[\s\S]{0,50}\b(?:money|funds|payments?|transfers?)\b[\s\S]{0,70}\b(?:forward|send|transfer|convert|withdraw)\b/giu,
      /\b(?:use|provide)\s+(?:your\s+)?(?:personal\s+)?(?:bank|upi|wallet)\s+(?:account|id)\b[\s\S]{0,70}\b(?:client|customer|company|business)\s+payments?\b/giu,
      /\bkeep\s+(?:a\s+)?(?:commission|percentage|share)\b[\s\S]{0,50}\b(?:forward|transfer|send)\s+(?:the\s+)?(?:rest|balance|remaining)\b/giu,
    ],
    negationWindow: 48,
  },
  {
    id: "parcel-reshipping",
    category: "mule",
    severity: "high",
    points: 28,
    title: "Personal-address reshipping role",
    explanation:
      "A role that sends goods to a personal address for relabeling or onward shipping needs careful employer and inventory verification.",
    patterns: [
      /\b(?:receive|accept)\s+(?:packages?|parcels?|goods)\b[\s\S]{0,70}\b(?:repack|relabel|reship|forward|send\s+on)\b/giu,
      /\b(?:package|parcel)\s+(?:processing|inspection|forwarding|reshipping)\s+(?:job|agent|position|role)\b/giu,
    ],
    negationWindow: 40,
  },
  {
    id: "personal-payment-destination",
    category: "personalPayment",
    severity: "high",
    points: 24,
    title: "Payment directed to a personal destination",
    explanation:
      "A personal account, individual UPI ID, recruiter account, or unrelated account name needs independent billing verification.",
    patterns: [
      /\b(?:pay|send|transfer|deposit)\b[\s\S]{0,55}\b(?:personal|individual|recruiter(?:'s)?|manager(?:'s)?|hr(?:'s)?)\s+(?:bank\s+)?(?:account|upi|wallet)\b/giu,
      /\b(?:scan|pay)\s+(?:this|the)\s+(?:personal\s+)?qr(?:\s+code)?\b/giu,
      /\b(?:account\s+holder|beneficiary|upi\s+name)\b[\s\S]{0,35}\b(?:different|individual|personal|recruiter|manager)\b/giu,
    ],
    negationWindow: 44,
  },
  {
    id: "rushed-decision",
    category: "urgency",
    severity: "medium",
    points: 12,
    title: "Short decision or payment deadline",
    explanation:
      "Urgency can prevent the candidate from checking the employer, recruiter, role, and payment destination.",
    patterns: [
      /\b(?:pay|deposit|transfer|confirm|accept|reply|submit)\b[\s\S]{0,40}\b(?:immediately|right\s+now|today|within\s+\d+\s*(?:minutes?|hours?))\b/giu,
      /\b(?:limited\s+slots?|last\s+chance|final\s+notice|offer\s+expires?|urgent\s+hiring)\b/giu,
      /\b(?:do\s+not|don't)\s+(?:contact|call|email|tell)\s+(?:the\s+)?(?:company|office|employer|anyone)\b/giu,
    ],
  },
  {
    id: "messaging-only-contact",
    category: "contact",
    severity: "medium",
    points: 12,
    title: "Messaging-only recruitment channel",
    explanation:
      "A request to keep recruitment only on a messaging app deserves verification through the employer’s independently found contact details.",
    patterns: [
      /\b(?:contact|message|interview|reply)\b[\s\S]{0,42}\b(?:only\s+(?:on|via)|through)\s+(?:whatsapp|telegram|signal)\b/giu,
      /\b(?:whatsapp|telegram|signal)\s+(?:only|interview|recruitment|hiring)\b/giu,
    ],
  },
  {
    id: "guaranteed-income",
    category: "compensation",
    severity: "medium",
    points: 12,
    title: "Guaranteed or effortless income claim",
    explanation:
      "Guaranteed earnings or unusually simple work claims should be compared with a detailed, independently sourced job description.",
    patterns: [
      /\b(?:guaranteed|assured)\s+(?:income|salary|earnings?|returns?|payout)\b/giu,
      /\b(?:earn|make)\b[\s\S]{0,45}\b(?:daily|per\s+day|weekly|per\s+week)\b[\s\S]{0,55}\b(?:no\s+experience|simple\s+tasks?|easy\s+work|few\s+hours?|from\s+your\s+phone)\b/giu,
      /\b(?:no\s+interview|no\s+experience|instant\s+selection)\b[\s\S]{0,65}\b(?:high\s+salary|high\s+income|earn|salary|income)\b/giu,
    ],
    negationWindow: 36,
  },
  {
    id: "identity-document-request",
    category: "identity",
    severity: "medium",
    points: 16,
    title: "Identity document requested",
    explanation:
      "Identity documents can be needed at legitimate stages, but the employer, purpose, retention, and minimum fields should be verified first.",
    patterns: [
      /\b(?:send|share|upload|submit|provide|whatsapp)\b[\s\S]{0,42}\b(?:aadhaar|aadhar|pan\s+card|passport|driver'?s?\s+licen[cs]e|national\s+id|identity\s+card|id\s+proof|bank\s+statement|selfie\s+with\s+(?:your\s+)?id)\b/giu,
      /\b(?:complete|finish|submit)\s+(?:your\s+)?kyc\b[\s\S]{0,45}\b(?:before|immediately|now|to\s+receive|to\s+confirm)\b/giu,
    ],
    negationWindow: 48,
  },
  {
    id: "authentication-secret-request",
    category: "identity",
    severity: "high",
    points: 34,
    title: "Authentication or banking secret requested",
    explanation:
      "Passwords, OTPs, PINs, CVVs, recovery codes, and banking login details should not be sent to a recruiter.",
    patterns: [
      /\b(?:send|share|provide|tell|forward|reply\s+with)\b[\s\S]{0,36}\b(?:otp|one[- ]time\s+password|password|pin|cvv|security\s+code|recovery\s+code|banking\s+login|netbanking\s+password)\b/giu,
      /\b(?:enter|submit)\b[\s\S]{0,28}\b(?:otp|pin|cvv|password)\b[\s\S]{0,32}\b(?:form|link|portal|message|chat)\b/giu,
    ],
    negationWindow: 52,
  },
];

const COMPENSATION_PATTERN =
  /(?:₹|rs\.?|inr|\$|usd|€|eur|£|gbp)\s*([\d,]+(?:\.\d+)?)\s*(?:\/|per\s+)?(day|daily|week|weekly|month|monthly)\b/giu;

const COMPENSATION_THRESHOLDS = {
  inr: { day: 10_000, week: 50_000, month: 300_000 },
  usd: { day: 700, week: 3_500, month: 15_000 },
  eur: { day: 650, week: 3_000, month: 12_000 },
  gbp: { day: 600, week: 2_800, month: 11_000 },
};

const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@([A-Z0-9.-]+\.[A-Z]{2,})\b/giu;

function normalizeText(value) {
  return typeof value === "string" ? value.replace(/\r\n?/g, "\n") : String(value ?? "");
}

function lineForIndex(text, index) {
  return text.slice(0, index).split("\n").length;
}

export function redactSensitiveValues(value) {
  return normalizeText(value)
    .replace(/\b(?:https?:\/\/|www\.)[^\s<>"'`]+/giu, "[LINK]")
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/giu, "[EMAIL]")
    .replace(/\b[a-z0-9._-]{2,}@[a-z]{2,}\b/giu, "[UPI ID]")
    .replace(
      /(?:₹|rs\.?|inr|\$|usd|€|eur|£|gbp)\s*[\d,.]+|[\d,.]+\s*(?:rupees?|inr|dollars?|usd|euros?|eur|pounds?|gbp)\b/giu,
      "[AMOUNT]",
    )
    .replace(/\b(?:\+?\d[\d\s().-]{7,}\d)\b/gu, "[PHONE OR NUMBER]")
    .replace(/\b(?:bc1|[13])[a-zA-HJ-NP-Z0-9]{24,60}\b/gu, "[WALLET]")
    .replace(/\b\d{10,18}\b/gu, "[LONG NUMBER]");
}

function excerptAround(text, index, length) {
  const radius = 55;
  const start = Math.max(0, index - radius);
  const end = Math.min(text.length, index + Math.max(1, length) + radius);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < text.length ? "…" : "";
  return redactSensitiveValues(
    `${prefix}${text.slice(start, end).replace(/\s+/gu, " ").trim()}${suffix}`,
  );
}

function collectMatches(text, rule) {
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

function compensationCurrency(rawMatch) {
  const prefix = rawMatch.toLowerCase();
  if (/^(?:₹|rs\.?|inr)/u.test(prefix)) return "inr";
  if (/^(?:€|eur)/u.test(prefix)) return "eur";
  if (/^(?:£|gbp)/u.test(prefix)) return "gbp";
  return "usd";
}

function compensationPeriod(rawPeriod) {
  if (/day/iu.test(rawPeriod)) return "day";
  if (/week/iu.test(rawPeriod)) return "week";
  return "month";
}

function inspectCompensation(text) {
  COMPENSATION_PATTERN.lastIndex = 0;
  const matches = [];
  let match;
  while ((match = COMPENSATION_PATTERN.exec(text)) && matches.length < 4) {
    const amount = Number(match[1].replace(/,/gu, ""));
    const currency = compensationCurrency(match[0]);
    const period = compensationPeriod(match[2]);
    if (
      Number.isFinite(amount) &&
      amount >= COMPENSATION_THRESHOLDS[currency][period]
    ) {
      matches.push({
        line: lineForIndex(text, match.index),
        excerpt: excerptAround(text, match.index, match[0].length),
      });
    }
  }
  if (!matches.length) return null;
  return {
    id: "high-periodic-compensation",
    category: "compensation",
    severity: "medium",
    points: 14,
    title: "High short-period compensation claim",
    explanation:
      "A high daily, weekly, or monthly amount should be compared with the role, seniority, hours, location, currency, and independently found listing.",
    matches,
  };
}

export function normalizeCompanyDomain(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "";
  const emailDomain = raw.includes("@") ? raw.split("@").at(-1) : raw;
  try {
    const parsed = new URL(
      /^[a-z][a-z\d+.-]*:\/\//iu.test(emailDomain)
        ? emailDomain
        : `https://${emailDomain}`,
    );
    return parsed.hostname.replace(/^www\./u, "").replace(/\.$/u, "");
  } catch {
    return emailDomain
      .split(/[/?#]/u)[0]
      .replace(/^www\./u, "")
      .replace(/\.$/u, "");
  }
}

function extractEmailDomains(value) {
  const domains = [];
  EMAIL_PATTERN.lastIndex = 0;
  let match;
  while ((match = EMAIL_PATTERN.exec(String(value || ""))) && domains.length < 12) {
    domains.push(match[1].toLowerCase().replace(/^www\./u, "").replace(/\.$/u, ""));
  }
  return [...new Set(domains)];
}

function contactFindings(text, recruiterContact, officialDomainInput) {
  const findings = [];
  const fromHeader =
    text.match(/^(?:from|reply-to)\s*:\s*([^\r\n]{0,240})$/imu)?.[1] || "";
  const contactSource = String(recruiterContact || "").trim() || fromHeader;
  const contactDomains = extractEmailDomains(contactSource);
  const officialDomain = normalizeCompanyDomain(officialDomainInput);

  const freeMailCount = contactDomains.filter((domain) => FREE_MAIL_DOMAINS.has(domain)).length;
  if (freeMailCount) {
    findings.push({
      id: "free-mail-recruiter",
      category: "contact",
      severity: "medium",
      points: 12,
      title: "Recruiter uses a free-mail domain",
      explanation:
        "A free-mail address can be legitimate, but it should be verified through contact details independently found on the employer’s official site.",
      matches: [],
      count: freeMailCount,
    });
  }

  if (officialDomain && contactDomains.length) {
    const mismatches = contactDomains.filter(
      (domain) =>
        domain !== officialDomain && !domain.endsWith(`.${officialDomain}`),
    );
    if (mismatches.length) {
      findings.push({
        id: "official-domain-mismatch",
        category: "contact",
        severity: "high",
        points: 22,
        title: "Recruiter email does not match supplied official domain",
        explanation:
          "The recruiter address and the independently supplied company domain differ. Verify the person through the company’s published contact channel.",
        matches: [],
        count: mismatches.length,
      });
    }
  }

  return findings;
}

function categorySummary(findings) {
  const counts = new Map();
  findings.forEach((finding) => {
    const current = counts.get(finding.category) || {
      id: finding.category,
      ...CATEGORY_META[finding.category],
      findingCount: 0,
      matchCount: 0,
    };
    current.findingCount += 1;
    current.matchCount += finding.count || finding.matches.length || 1;
    counts.set(finding.category, current);
  });
  return [...counts.values()];
}

function nextStepsFor(categories) {
  const ids = new Set(categories.map((category) => category.id));
  const steps = [
    "Pause before paying, sharing documents, or moving money. Do not use links, phone numbers, or payment details supplied only in the offer.",
    "Find the employer’s website and careers page independently, then confirm the role and recruiter through a published switchboard or hiring contact.",
  ];
  if (ids.has("fees") || ids.has("payment") || ids.has("personalPayment")) {
    steps.push(
      "Verify every fee and beneficiary through the independently found employer channel. A refund promise, invoice, QR code, or account name is not independent confirmation.",
    );
  }
  if (ids.has("mule")) {
    steps.push(
      "Do not receive, forward, convert, or reship money or goods through a personal account or address. If this already happened, contact your bank or payment provider promptly.",
    );
  }
  if (ids.has("contact")) {
    steps.push(
      "Ask the employer’s published contact to confirm the recruiter’s name, email domain, interview, and requisition—not merely whether the company exists.",
    );
  }
  if (ids.has("identity")) {
    steps.push(
      "Ask why each identity field is needed, who retains it, and at what hiring stage. Share the minimum necessary only after independently confirming the employer and recipient.",
    );
  }
  if (ids.has("compensation")) {
    steps.push(
      "Compare pay, currency, hours, duties, location, and employment status with the independently found listing and a written contract.",
    );
  }
  if (ids.has("urgency")) {
    steps.push(
      "Ignore the stated deadline long enough to verify the role. A genuine process should withstand a reasonable independent check.",
    );
  }
  steps.push(
    "Keep the original offer, headers, chat history, payment instructions, and receipts. If money or credentials were already sent, secure the affected accounts and contact the relevant provider.",
  );
  return steps;
}

function assessmentFor(score, findings, categories) {
  const highCount = findings.filter((finding) => finding.severity === "high").length;
  const categoryIds = new Set(categories.map((category) => category.id));
  if (
    highCount >= 2 ||
    categoryIds.has("mule") ||
    (categoryIds.has("fees") && categoryIds.has("payment")) ||
    score >= 58
  ) {
    return {
      level: "strong",
      label: "Strong warning-pattern cluster",
      summary:
        "Pause payment and document sharing. Multiple or high-impact patterns need independent employer verification before proceeding.",
    };
  }
  if (highCount >= 1 || score >= 30) {
    return {
      level: "caution",
      label: "Important checks needed",
      summary:
        "One or more higher-impact patterns deserve verification through contact details you source independently.",
    };
  }
  if (score > 0) {
    return {
      level: "notice",
      label: "Some clues need review",
      summary:
        "The message contains ambiguous or context-dependent patterns. Check them against the real employer and role.",
    };
  }
  return {
    level: "none",
    label: "No configured warning patterns found",
    summary:
      "The configured rules did not match. This does not confirm that the offer, recruiter, company, or payment request is legitimate.",
  };
}

export function analyzeJobOffer(value, options = {}) {
  const originalText = normalizeText(value);
  const text = originalText.slice(0, MAX_OFFER_LENGTH);
  const findings = [];

  for (const rule of TEXT_RULES) {
    const matches = collectMatches(text, rule);
    if (matches.length) findings.push({ ...rule, patterns: undefined, matches });
  }
  const compensationFinding = inspectCompensation(text);
  if (compensationFinding) findings.push(compensationFinding);
  findings.push(
    ...contactFindings(
      text,
      options.recruiterContact,
      options.officialDomain,
    ),
  );

  const compactFindings = findings
    .slice(0, MAX_FINDINGS)
    .map(({ negationWindow, ...finding }) => ({
      ...finding,
      count: finding.count || finding.matches.length || 1,
    }));
  const score = Math.min(
    100,
    compactFindings.reduce(
      (total, finding) =>
        total + finding.points + Math.min(6, Math.max(0, finding.count - 1) * 2),
      0,
    ),
  );
  const categories = categorySummary(compactFindings);
  const assessment = assessmentFor(score, compactFindings, categories);

  return {
    messageLength: text.length,
    originalLength: originalText.length,
    truncated: originalText.length > MAX_OFFER_LENGTH,
    findings: compactFindings,
    categories,
    score,
    assessment,
    nextSteps: nextStepsFor(categories),
    disclaimer:
      "This deterministic score is not a probability or a definitive scam verdict. The tool performs no live company, person, domain, job-listing, or payment verification.",
  };
}

export function buildSafeJobOfferReport(result) {
  const lines = [
    "Job Offer Deposit Check — Safe Summary",
    "======================================",
    `Assessment: ${result.assessment.label}`,
    `Signal score: ${result.score}/100 (not a probability)`,
    `Evidence categories: ${result.categories.length}`,
    `Configured finding groups: ${result.findings.length}`,
    "",
    "Important: This is deterministic triage, not a definitive scam verdict or live verification.",
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
    "Privacy: This report excludes the pasted offer, recruiter contact, domains, email addresses, phone numbers, links, payment values, account details, document numbers, and matched excerpts.",
    "Processing: Analysis ran locally. The tool did not upload, store, contact, resolve, or verify any person, company, domain, listing, account, or link.",
  );
  return lines.join("\n");
}

export const analyzerLimits = {
  maxOfferLength: MAX_OFFER_LENGTH,
  maxFindings: MAX_FINDINGS,
};
