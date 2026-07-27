/**
 * GST query prompt builder — pure logic.
 *
 * Statutory rules encoded here, with their source:
 *  - Registration thresholds: section 22 of the CGST Act, 2017 read with
 *    Notification 10/2019-Central Tax, which raised the goods threshold to
 *    Rs 40 lakh for normal category states while leaving services at Rs 20 lakh.
 *    Special category states use Rs 20 lakh (goods) and Rs 10 lakh (services).
 *  - Compulsory registration irrespective of turnover: section 24 of the CGST Act.
 *  - Composition scheme limits: section 10 of the CGST Act (Rs 1.5 crore, Rs 75
 *    lakh in specified states) and Notification 2/2019-Central Tax (Rate) for
 *    the Rs 50 lakh service-provider option.
 *  - Return due dates: rules 59, 61 and 80 of the CGST Rules.
 *
 * Nothing in this file is tax advice. It reproduces published thresholds and
 * dates so a prompt can carry them; a chartered accountant must confirm how
 * they apply to any particular business.
 */

/** Section 22 threshold: goods, normal category states. */
export const THRESHOLD_GOODS_NORMAL = 4000000; // Rs 40 lakh
/** Section 22 threshold: services, normal category states. */
export const THRESHOLD_SERVICES_NORMAL = 2000000; // Rs 20 lakh
/** Section 22 threshold: goods, special category states. */
export const THRESHOLD_GOODS_SPECIAL = 2000000; // Rs 20 lakh
/** Section 22 threshold: services, special category states. */
export const THRESHOLD_SERVICES_SPECIAL = 1000000; // Rs 10 lakh

/** Section 10 composition turnover limit for goods and restaurants. */
export const COMPOSITION_LIMIT_NORMAL = 15000000; // Rs 1.5 crore
/** Section 10 composition turnover limit in specified states. */
export const COMPOSITION_LIMIT_SPECIAL = 7500000; // Rs 75 lakh
/** Notification 2/2019 composition-style option for service providers. */
export const COMPOSITION_LIMIT_SERVICES = 5000000; // Rs 50 lakh

/** E-way bill is required once consignment value crosses this figure (rule 138). */
export const EWAY_BILL_THRESHOLD = 50000; // Rs 50,000

/**
 * States and union territories treated as special category for the section 22
 * registration threshold after Notification 10/2019.
 */
export const SPECIAL_CATEGORY_STATES = ["Manipur", "Mizoram", "Nagaland", "Tripura"];

/**
 * GST rate slabs are the single most-changed part of the law — the Council
 * rationalised them in 2025. Any prompt must therefore force verification
 * rather than assert a rate.
 */
export const RATE_NOTE =
  "GST rate slabs have been revised by the GST Council more than once, most recently in a rationalisation exercise in 2025. Never state a rate from memory: quote the rate only if you can name the notification and its effective date, otherwise say the rate must be confirmed on cbic-gst.gov.in or the GST portal's rate finder.";

/** Query topics this builder can frame. */
export const GST_TOPICS = {
  registration: {
    label: "Registration and thresholds",
    anchors:
      "Section 22 (liability to register), section 24 (compulsory registration irrespective of turnover), section 23 (persons not liable), and the definition of aggregate turnover in section 2(6).",
    watchouts:
      "Aggregate turnover is PAN-level and all-India, and it includes exempt supplies and exports. Inter-state supply of goods, supply through an e-commerce operator, casual taxable persons and reverse-charge liability all force registration regardless of turnover.",
  },
  rates: {
    label: "Rates, HSN and classification",
    anchors:
      "The rate notifications issued under section 9(1), the HSN/SAC classification in the Customs Tariff as adopted for GST, and any relevant advance rulings.",
    watchouts:
      "Classification disputes turn on the exact description and use of the goods, not the trade name. Composite and mixed supply (section 8) can change the rate applied to the whole bundle.",
  },
  itc: {
    label: "Input tax credit",
    anchors:
      "Sections 16 (conditions for taking ITC), 17 (apportionment and blocked credits, including 17(5)), and rule 36(4) read with GSTR-2B matching.",
    watchouts:
      "ITC is only available if the supplier has actually filed and the invoice appears in your GSTR-2B, payment is made to the supplier within 180 days, and the credit is not blocked under section 17(5).",
  },
  returns: {
    label: "Returns and due dates",
    anchors: "Rule 59 (GSTR-1), rule 61 (GSTR-3B), rule 80 (annual return), and the QRMP scheme.",
    watchouts:
      "Due dates are staggered under QRMP and are frequently extended by notification. Late fee runs per day per return and interest under section 50 runs on tax paid late.",
  },
  eway: {
    label: "E-way bill and e-invoicing",
    anchors: "Rule 138 (e-way bill) and rule 48(4) with the e-invoicing turnover notifications.",
    watchouts:
      "The e-way bill threshold of Rs 50,000 is on consignment value, and several states set lower limits for intra-state movement. The e-invoicing turnover trigger has been lowered several times, so the applicable limit must be checked.",
  },
  rcm: {
    label: "Reverse charge (RCM)",
    anchors:
      "Section 9(3) and 9(4) of the CGST Act with the RCM notifications, and section 5(3) of the IGST Act for imports of service.",
    watchouts:
      "RCM liability must be paid in cash, not from the credit ledger, and a self-invoice is required for supplies received from unregistered persons.",
  },
  "place-of-supply": {
    label: "Place of supply and IGST vs CGST/SGST",
    anchors: "Sections 10 to 13 of the IGST Act, and section 8 for intra-state supply.",
    watchouts:
      "Getting place of supply wrong means paying the wrong tax head, and a wrong-head payment cannot simply be adjusted - it usually needs a refund claim under section 77.",
  },
  composition: {
    label: "Composition scheme",
    anchors:
      "Section 10 of the CGST Act, rule 7 for the rates, and Notification 2/2019-Central Tax (Rate) for service providers.",
    watchouts:
      "A composition dealer cannot collect GST from customers, cannot claim input tax credit, and cannot make inter-state outward supplies of goods.",
  },
  refunds: {
    label: "Refunds and exports",
    anchors:
      "Section 54 (refunds), rule 89 and rule 96 (exports with and without payment of tax), and the LUT requirement under rule 96A.",
    watchouts:
      "Refund claims are time barred two years from the relevant date, and exports without payment of tax need a valid LUT filed before the supply.",
  },
  notices: {
    label: "Notices, demands and appeals",
    anchors:
      "Sections 73 and 74 (demands), section 61 (scrutiny), section 107 (appeals) and the limitation periods in each.",
    watchouts:
      "Reply deadlines on a notice are strict and appeals need a pre-deposit. This is the area where professional representation matters most.",
  },
};

/** Business types the prompt can describe. */
export const BUSINESS_TYPES = {
  goods: "Supplier of goods",
  services: "Supplier of services",
  both: "Supplier of both goods and services",
  ecommerce: "Seller through an e-commerce operator",
  exporter: "Exporter of goods or services",
  freelancer: "Freelancer or independent professional",
};

/** Output shapes for the answer. */
export const OUTPUT_FORMATS = {
  explainer: "A plain-language explanation followed by the exact statutory wording it rests on.",
  checklist: "A numbered compliance checklist with the section or rule against each step.",
  table: "A comparison table with the options as rows and consequences as columns.",
  "notice-reply": "A structured outline for a written reply: facts, legal position, relief sought, annexures.",
};

const round = (value, places = 2) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

/**
 * Section 22 / 24 registration check.
 *
 * Liability arises when aggregate turnover EXCEEDS the threshold, so a business
 * sitting exactly on Rs 40 lakh is not yet liable under section 22 alone.
 * Section 24 overrides the threshold entirely for the listed cases.
 */
export function gstRegistrationCheck({
  aggregateTurnover,
  supplyType,
  specialCategoryState = false,
  interStateGoods = false,
  throughEcommerce = false,
  reverseChargeLiability = false,
}) {
  const turnover = Number(aggregateTurnover);
  if (!Number.isFinite(turnover)) return { error: "Enter your aggregate turnover in rupees." };
  if (turnover < 0) return { error: "Aggregate turnover cannot be negative." };
  if (!["goods", "services", "both"].includes(supplyType)) {
    return { error: "Supply type must be goods, services or both." };
  }

  // A business supplying any service falls to the lower services threshold.
  const usesServicesThreshold = supplyType !== "goods";
  const threshold = specialCategoryState
    ? usesServicesThreshold
      ? THRESHOLD_SERVICES_SPECIAL
      : THRESHOLD_GOODS_SPECIAL
    : usesServicesThreshold
      ? THRESHOLD_SERVICES_NORMAL
      : THRESHOLD_GOODS_NORMAL;

  const section24Triggers = [];
  if (interStateGoods) {
    section24Triggers.push("inter-state taxable supply of goods");
  }
  if (throughEcommerce) {
    section24Triggers.push("supply through an e-commerce operator required to collect TCS");
  }
  if (reverseChargeLiability) {
    section24Triggers.push("liability to pay tax under reverse charge");
  }

  if (section24Triggers.length > 0) {
    return {
      required: true,
      basis: "Section 24 (compulsory registration)",
      threshold,
      thresholdLabel: formatRupees(threshold),
      reason: `Registration is compulsory irrespective of turnover because of: ${section24Triggers.join("; ")}.`,
      headroom: 0,
      utilisationPct: 100,
    };
  }

  const required = turnover > threshold;
  const headroom = Math.max(0, threshold - turnover);

  return {
    required,
    basis: "Section 22 (turnover threshold)",
    threshold,
    thresholdLabel: formatRupees(threshold),
    reason: required
      ? `Aggregate turnover of ${formatRupees(turnover)} exceeds the ${formatRupees(threshold)} threshold that applies to this supply type and state category.`
      : `Aggregate turnover of ${formatRupees(turnover)} is within the ${formatRupees(threshold)} threshold, so section 22 does not force registration yet.`,
    headroom,
    headroomLabel: formatRupees(headroom),
    utilisationPct: threshold > 0 ? round(Math.min(100, (turnover / threshold) * 100), 1) : 0,
  };
}

/** Format a rupee figure in the Indian crore/lakh convention. */
export function formatRupees(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 10000000) return `${sign}Rs ${round(abs / 10000000, 2)} crore`;
  if (abs >= 100000) return `${sign}Rs ${round(abs / 100000, 2)} lakh`;
  return `${sign}Rs ${Math.round(abs).toLocaleString("en-IN")}`;
}

/** Statutory due-date rules. day = day of the month the return is due. */
export const RETURN_DUE_RULES = {
  "gstr-1": { label: "GSTR-1 (monthly)", day: 11, offsetMonths: 1, cadence: "monthly" },
  "gstr-3b": { label: "GSTR-3B (monthly)", day: 20, offsetMonths: 1, cadence: "monthly" },
  "gstr-1-qrmp": { label: "GSTR-1 (quarterly, QRMP)", day: 13, offsetMonths: 1, cadence: "quarterly" },
  "cmp-08": { label: "CMP-08 (composition, quarterly)", day: 18, offsetMonths: 1, cadence: "quarterly" },
  "gstr-4": { label: "GSTR-4 (composition, annual)", day: 30, month: 6, cadence: "annual" },
  "gstr-9": { label: "GSTR-9 (annual return)", day: 31, month: 12, cadence: "annual" },
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * Statutory due date for a return period. Takes the period as arguments so the
 * function stays pure — it never reads the current date.
 *
 * Monthly and quarterly returns fall due in the month after the period ends;
 * GSTR-4 is due by 30 June and GSTR-9 by 31 December of the following
 * financial year. Extensions notified by CBIC are not modelled — the prompt
 * tells the model to verify.
 */
export function dueDateFor({ returnType, periodMonth, periodYear }) {
  const rule = RETURN_DUE_RULES[returnType];
  if (!rule) return { error: "Pick a return type." };

  const month = Number(periodMonth);
  const year = Number(periodYear);
  if (!Number.isFinite(month) || !Number.isFinite(year)) {
    return { error: "Enter the tax period month and year." };
  }
  if (month < 1 || month > 12) return { error: "Period month must be between 1 and 12." };
  if (year < 2017 || year > 2100) {
    return { error: "GST began in July 2017 — enter a year from 2017 onwards." };
  }
  if (rule.cadence === "quarterly" && ![3, 6, 9, 12].includes(month)) {
    return { error: "For a quarterly return, pick the quarter-ending month: March, June, September or December." };
  }

  if (rule.cadence === "annual") {
    // Period is a financial year that starts in the given year and ends 31 March
    // of the next; the annual return is due in the following calendar year.
    const dueYear = year + 1;
    return {
      label: rule.label,
      periodLabel: `FY ${year}-${String((year + 1) % 100).padStart(2, "0")}`,
      dueDate: isoDate(dueYear, rule.month, rule.day),
      dueDateLabel: `${rule.day} ${MONTH_NAMES[rule.month - 1]} ${dueYear}`,
    };
  }

  const dueMonthIndex = month - 1 + rule.offsetMonths;
  const dueYear = year + Math.floor(dueMonthIndex / 12);
  const dueMonth = (dueMonthIndex % 12) + 1;

  return {
    label: rule.label,
    periodLabel:
      rule.cadence === "quarterly"
        ? `Quarter ending ${MONTH_NAMES[month - 1]} ${year}`
        : `${MONTH_NAMES[month - 1]} ${year}`,
    dueDate: isoDate(dueYear, dueMonth, rule.day),
    dueDateLabel: `${rule.day} ${MONTH_NAMES[dueMonth - 1]} ${dueYear}`,
  };
}

function isoDate(year, month, day) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Compose the GST query prompt with citation and non-advisory guardrails.
 * Returns { title, prompt, registration, wordCount } or { error }.
 */
export function buildGstPrompt({
  topic,
  businessType,
  question,
  aggregateTurnover,
  stateName = "",
  specialCategoryState = false,
  outputFormat = "explainer",
  requireCitations = true,
}) {
  const topicSpec = GST_TOPICS[topic];
  if (!topicSpec) return { error: "Pick a GST topic." };
  if (!(businessType in BUSINESS_TYPES)) return { error: "Pick your business type." };
  const formatSpec = OUTPUT_FORMATS[outputFormat];
  if (!formatSpec) return { error: "Pick an output format." };

  const questionText = String(question || "").trim();
  if (questionText.length < 10) {
    return { error: "Write your actual question in at least a short sentence (10 characters)." };
  }

  const supplyType =
    businessType === "goods" ? "goods" : businessType === "both" ? "both" : "services";

  const registration = gstRegistrationCheck({
    aggregateTurnover,
    supplyType,
    specialCategoryState,
  });
  if (registration.error) return { error: registration.error };

  const lines = [
    "Act as a GST practitioner in India explaining the law to a business owner. You are giving information, not professional advice, and you say so.",
    "",
    "My situation:",
    `   - Business type: ${BUSINESS_TYPES[businessType]}`,
    `   - Aggregate turnover (PAN-level, all-India, section 2(6)): ${formatRupees(Number(aggregateTurnover))}`,
    stateName ? `   - State / UT: ${stateName}${specialCategoryState ? " (special category for the registration threshold)" : ""}` : "   - State / UT: not specified",
    `   - Registration threshold that applies to me: ${registration.thresholdLabel} (${registration.basis})`,
    `   - On turnover alone, registration is ${registration.required ? "required" : "not yet required"}.`,
    "",
    `Topic: ${topicSpec.label}`,
    `My question: ${questionText}`,
    "",
    "How to answer:",
    `1. Anchor the answer to the law. Relevant provisions here are: ${topicSpec.anchors}`,
    `2. ${requireCitations ? "Cite the section, rule or notification number behind every substantive statement. If you cannot name the provision, say so instead of stating the position." : "State the underlying provision where you are confident of it, and mark anything you are unsure of."}`,
    `3. ${RATE_NOTE}`,
    `4. Watch for these traps: ${topicSpec.watchouts}`,
    "5. Separate what is settled law from what is contested or depends on facts. Where an advance ruling or circular is relevant, say that rulings bind only the applicant.",
    "6. Do not give me a conclusion on my specific liability. Explain the rule, show how it would apply, and say clearly which facts a chartered accountant would need to confirm.",
    "7. If the position has changed by notification, tell me to verify the current text on cbic-gst.gov.in rather than relying on your answer.",
    "8. Flag anything that carries a deadline, a limitation period or a penalty, with the number of days involved.",
    "",
    `Output format: ${formatSpec}`,
    "",
    "End with two sections: 'What I should check on the GST portal myself' and 'What I should ask my CA', each three bullets.",
  ];

  const prompt = lines.join("\n");

  return {
    title: `${topicSpec.label} — ${BUSINESS_TYPES[businessType]}`,
    prompt,
    registration,
    wordCount: prompt.split(/\s+/).filter(Boolean).length,
  };
}
