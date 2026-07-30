/**
 * Employer Data Breach Employee Checklist — applicability and scoring logic.
 *
 * Pure module: no React, no DOM, no clocks. Every exported function is total —
 * unusable input returns { error } rather than NaN or a misleading number.
 *
 * The model differs from a generic breach checklist in one way that matters:
 * an employee's response is driven entirely by which data categories the
 * employer's own notice lists. Payroll bank details lead to salary-diversion
 * defences; a tax number leads to credit and refund fraud defences; leaked
 * work credentials lead to password-reuse work. Steps therefore declare which
 * categories they apply to, and the score is calculated over the applicable
 * steps only — so ticking everything relevant to your notice reaches 100%.
 */

/**
 * Data categories as they usually appear in a breach notification letter.
 *
 * `severity` ranks how much direct financial or identity harm the category
 * enables on its own: a tax or national ID number supports fraudulent credit
 * applications, payroll bank details support salary diversion, whereas a name
 * and desk phone number mostly enable better-targeted phishing.
 */
export const DATA_CLASSES = [
  { id: "identifiers", label: "Name, home address and contact details", severity: 2 },
  { id: "nationalId", label: "National ID or tax number (SSN, PAN, Aadhaar, NI)", severity: 6 },
  { id: "payrollBank", label: "Payroll bank account details", severity: 5 },
  { id: "compensation", label: "Salary, bonus or performance records", severity: 2 },
  { id: "health", label: "Health plan or medical claim data", severity: 5 },
  { id: "idDocs", label: "Scanned ID documents (passport, licence, visa)", severity: 4 },
  { id: "credentials", label: "Work account credentials or password hashes", severity: 4 },
  { id: "dependents", label: "Dependant or family member records", severity: 3 },
];

const CLASS_BY_ID = new Map(DATA_CLASSES.map((entry) => [entry.id, entry]));

/** Highest possible severity total: every category in one notice. */
export const MAX_SEVERITY = DATA_CLASSES.reduce((sum, entry) => sum + entry.severity, 0);

/** Severity tiers, read top-down: the first tier the total reaches wins. */
export const SEVERITY_TIERS = [
  {
    id: "severe",
    min: 16,
    label: "Severe",
    hint: "Enough for identity theft and salary diversion. Treat the monitoring offer as a starting point, not a remedy.",
  },
  {
    id: "serious",
    min: 9,
    label: "Serious",
    hint: "Direct financial fraud is plausible. Work through the payroll and credit steps this week.",
  },
  {
    id: "moderate",
    min: 4,
    label: "Moderate",
    hint: "Mainly a targeted-phishing and account-takeover problem rather than an identity theft one.",
  },
  {
    id: "limited",
    min: 0,
    label: "Limited",
    hint: "Low direct risk, but breach-themed phishing that names your employer is very likely.",
  },
];

/**
 * The checklist.
 *
 * appliesTo = null means the step applies to every breach. Otherwise the step
 *             only appears if the notice lists at least one of the categories.
 * weight    = relative importance within whatever set applies to you.
 * critical  = leaving it open keeps a direct loss path open, so it caps the
 *             score (see CRITICAL_CAP_PERCENT) whenever the step applies.
 */
export const CHECKLIST = [
  {
    id: "keep-notice",
    group: "Pin down what actually happened",
    title: "Save the notice, the dates and the incident reference",
    detail:
      "Keep the letter or email, the date you received it, the incident reference and the stated date of the breach. Statutory claim and complaint windows run from dates you will not remember in six months.",
    weight: 5,
    appliesTo: null,
  },
  {
    id: "ask-hr-scope",
    group: "Pin down what actually happened",
    title: "Ask HR exactly which fields and which system were involved",
    detail:
      "Notices are written to be reassuring and vague. Ask in writing which dataset, which fields per person, whether your record specifically was in it, and whether the data left the network or was only accessible.",
    weight: 7,
    appliesTo: null,
    critical: true,
  },
  {
    id: "check-encryption",
    group: "Pin down what actually happened",
    title: "Ask whether the data was encrypted and whether it was exfiltrated",
    detail:
      "Encrypted-at-rest data that never left the network is a very different exposure from a copied plaintext export. The answer decides how much of the rest of this list you actually need.",
    weight: 4,
    appliesTo: null,
  },
  {
    id: "enrol-monitoring",
    group: "Pin down what actually happened",
    title: "Enrol in the offered monitoring before the deadline",
    detail:
      "Employer-funded credit or identity monitoring almost always has an enrolment cut-off and does nothing until you activate it. Take it, note the expiry, and do not treat it as protection on its own — it reports fraud, it does not prevent it.",
    weight: 5,
    appliesTo: ["nationalId", "payrollBank", "idDocs", "health"],
  },

  {
    id: "payroll-callback",
    group: "Protect your pay",
    title: "Confirm payroll verifies bank-detail changes out of band",
    detail:
      "Salary diversion is the fastest way to monetise an HR breach: the attacker emails payroll a new account number just before pay day. Ask payroll to confirm they call the employee on a known number before changing any bank detail.",
    weight: 8,
    appliesTo: ["payrollBank", "identifiers", "credentials"],
    critical: true,
  },
  {
    id: "verify-bank-on-file",
    group: "Protect your pay",
    title: "Check the bank account on the self-service portal is still yours",
    detail:
      "Open the employee self-service or payroll portal and read the account number on file digit by digit. Do this again a day or two before each of the next two pay runs.",
    weight: 7,
    appliesTo: ["payrollBank", "credentials"],
    critical: true,
  },
  {
    id: "credit-freeze",
    group: "Protect your pay",
    title: "Freeze credit or set bureau alerts",
    detail:
      "A tax or national ID number with a name and address is the application set for new credit. A freeze blocks new lending checks until you lift it and is free at most bureaus.",
    weight: 7,
    appliesTo: ["nationalId", "idDocs"],
  },
  {
    id: "tax-filing-early",
    group: "Protect your pay",
    title: "File your tax return early and watch for one filed for you",
    detail:
      "Refund fraud needs your tax number and your income figures, which is exactly what a payroll breach leaks. Filing first blocks the duplicate return, and a rejected filing is often the first sign someone got there ahead of you.",
    weight: 5,
    appliesTo: ["nationalId", "compensation"],
  },
  {
    id: "id-doc-reissue",
    group: "Protect your pay",
    title: "Record the ID document as compromised and ask about reissue",
    detail:
      "Passport, licence and visa scans are used to open accounts and to pass remote identity checks. Ask the issuing authority what they can flag, and note the document numbers so you can prove which copies were exposed.",
    weight: 5,
    appliesTo: ["idDocs"],
  },
  {
    id: "health-claims",
    group: "Protect your pay",
    title: "Read insurer statements for treatment you never had",
    detail:
      "Medical identity fraud shows up as claims and explanation-of-benefits entries for care you did not receive, and it corrupts your medical record as well as your money. Query anything unfamiliar with the insurer directly.",
    weight: 5,
    appliesTo: ["health"],
  },
  {
    id: "dependents-check",
    group: "Protect your pay",
    title: "Check credit files for the dependants named in the breach",
    detail:
      "A child's identity is attractive precisely because nobody checks it for a decade. If dependants were in the dataset, request their credit file and freeze it where the bureau allows.",
    weight: 5,
    appliesTo: ["dependents"],
  },

  {
    id: "change-work-password",
    group: "Close the account paths",
    title: "Change the work password now",
    detail:
      "Change it even if the notice says hashes only — offline cracking of a stolen hash is routine, and the delay between breach and notice is usually measured in weeks.",
    weight: 7,
    appliesTo: ["credentials"],
    critical: true,
  },
  {
    id: "kill-reuse",
    group: "Close the account paths",
    title: "Change every personal account that reused the work password",
    detail:
      "Credential stuffing is automated: the same address and password are replayed against banks, email and shopping sites within hours. Any account sharing that password, or a variation of it, needs a new unique one.",
    weight: 8,
    appliesTo: ["credentials"],
    critical: true,
  },
  {
    id: "mfa-everywhere",
    group: "Close the account paths",
    title: "Turn on multi-factor authentication on work and personal accounts",
    detail:
      "Start with the mailbox that can reset everything else. An authenticator app or passkey resists the phishing pages that follow a publicised breach; SMS codes do not.",
    weight: 7,
    appliesTo: null,
  },
  {
    id: "revoke-sessions",
    group: "Close the account paths",
    title: "Sign out of active sessions and revoke connected apps",
    detail:
      "Changing a password does not always end existing sessions or invalidate issued tokens. Use the security page of each account to end other sessions and remove third-party app access you no longer recognise.",
    weight: 5,
    appliesTo: ["credentials"],
  },

  {
    id: "phish-verify",
    group: "Survive the follow-on scams",
    title: "Verify any breach-support contact through a channel you already had",
    detail:
      "Breach notices are public, and impersonating the employer's support line or the monitoring vendor is the obvious next move. Go to the vendor site or the HR number you already had rather than following a link or calling a number in a message.",
    weight: 7,
    appliesTo: null,
  },
  {
    id: "no-payment-changes",
    group: "Survive the follow-on scams",
    title: "Never action a payment or bank-detail change from an inbound message",
    detail:
      "This applies to you and to anyone you can warn in finance. Emailed instructions to redirect a salary, an invoice or a vendor payment must be confirmed by a call to a number already on file.",
    weight: 6,
    appliesTo: null,
  },
  {
    id: "report-suspicions",
    group: "Survive the follow-on scams",
    title: "Report attempts to the security team and the national authority",
    detail:
      "Tell the employer's security team about any approach that uses breach details, and report fraud to the relevant national body — cybercrime.gov.in in India, the FTC identity theft service in the US, Action Fraud in the UK.",
    weight: 5,
    appliesTo: null,
  },
  {
    id: "read-before-signing",
    group: "Survive the follow-on scams",
    title: "Read any settlement or release before signing it",
    detail:
      "Accepting compensation can waive later claims, and the monitoring offer sometimes arrives bundled with terms. Read what you are giving up, and take legal advice before signing if the exposure was significant.",
    weight: 4,
    appliesTo: null,
  },
];

/** Display order of the groups used by CHECKLIST. */
export const GROUPS = [
  "Pin down what actually happened",
  "Protect your pay",
  "Close the account paths",
  "Survive the follow-on scams",
];

/** A typical HR-system notice: identity fields, tax number and payroll banking. */
export const DEFAULT_CLASSES = ["identifiers", "nationalId", "payrollBank"];

/** Ticked at first paint — most people still have the notice in their inbox. */
export const DEFAULT_DONE = ["keep-notice"];

/** Bands as a percentage of the applicable weight; the first band reached wins. */
export const BANDS = [
  { id: "covered", min: 90, label: "Response complete", hint: "Every path this breach opened has been closed or is being watched." },
  { id: "strong", min: 70, label: "Mostly covered", hint: "The direct-loss paths are shut. Finish the monitoring steps." },
  { id: "partial", min: 40, label: "Partly covered", hint: "A direct route to your salary or your identity is still open." },
  { id: "exposed", min: 0, label: "Barely started", hint: "The breach is still fully exploitable against you." },
];

/**
 * A missing applicable critical step caps the band at "Partly covered": nothing
 * else compensates for an unverified payroll account or a reused password.
 */
export const CRITICAL_CAP_PERCENT = 69;

const BY_ID = new Map(CHECKLIST.map((item) => [item.id, item]));

/** First band whose minimum the percent reaches. Percent is clamped to 0..100. */
export function bandFor(percent) {
  const value = Number.isFinite(percent) ? Math.min(100, Math.max(0, percent)) : 0;
  return BANDS.find((band) => value >= band.min) || BANDS[BANDS.length - 1];
}

function normalise(ids, lookup) {
  const seen = new Set();
  for (const raw of ids) {
    if (typeof raw === "string" && lookup.has(raw)) seen.add(raw);
  }
  return seen;
}

/**
 * Steps that apply to a given set of breached data categories.
 *
 * @param {string[]} classIds ids from DATA_CLASSES listed in the notice.
 * @returns {object[]|{error:string}} applicable checklist items in listed order.
 */
export function applicableSteps(classIds) {
  if (!Array.isArray(classIds)) {
    return { error: "Breached data categories must be provided as a list." };
  }
  const selected = normalise(classIds, CLASS_BY_ID);
  return CHECKLIST.filter(
    (item) => item.appliesTo === null || item.appliesTo.some((id) => selected.has(id))
  );
}

/**
 * Severity of the notice itself, independent of how much you have done.
 *
 * @param {string[]} classIds ids from DATA_CLASSES listed in the notice.
 */
export function breachSeverity(classIds) {
  if (!Array.isArray(classIds)) {
    return { error: "Breached data categories must be provided as a list." };
  }
  const selected = normalise(classIds, CLASS_BY_ID);
  if (selected.size === 0) {
    return { error: "Tick at least one data category from your breach notice." };
  }

  let points = 0;
  const classes = [];
  for (const entry of DATA_CLASSES) {
    if (selected.has(entry.id)) {
      points += entry.severity;
      classes.push(entry);
    }
  }

  const tier =
    SEVERITY_TIERS.find((entry) => points >= entry.min) ||
    SEVERITY_TIERS[SEVERITY_TIERS.length - 1];

  return {
    points,
    maxPoints: MAX_SEVERITY,
    percent: MAX_SEVERITY > 0 ? Math.round((points / MAX_SEVERITY) * 100) : 0,
    classes,
    classCount: classes.length,
    tier: tier.id,
    tierLabel: tier.label,
    tierHint: tier.hint,
  };
}

/**
 * Score the response against the steps that apply to this breach only.
 *
 * Ticks on steps that do not apply are ignored rather than counted, so changing
 * the data categories can never inflate the percentage.
 *
 * @param {object} input
 * @param {string[]} input.classIds categories from the notice.
 * @param {string[]} input.doneIds completed step ids.
 * @returns {object} summary, or { error } for unusable input.
 */
export function assessResponse({ classIds, doneIds } = {}) {
  if (!Array.isArray(classIds) || !Array.isArray(doneIds)) {
    return { error: "Categories and completed steps must both be provided as lists." };
  }

  // Without at least one category the "always applicable" steps would still
  // score, which would read as a complete response to a breach nobody described.
  if (normalise(classIds, CLASS_BY_ID).size === 0) {
    return { error: "Tick at least one data category from your breach notice." };
  }

  const steps = applicableSteps(classIds);
  if (steps.error) return steps;
  if (steps.length === 0) {
    return { error: "No steps apply to the categories selected." };
  }

  const done = normalise(doneIds, BY_ID);
  const maxPoints = steps.reduce((sum, item) => sum + item.weight, 0);
  if (!(maxPoints > 0)) {
    return { error: "No weighted steps apply to the categories selected." };
  }

  let points = 0;
  const remaining = [];
  const missingCritical = [];

  for (const item of steps) {
    if (done.has(item.id)) {
      points += item.weight;
    } else {
      remaining.push(item);
      if (item.critical) missingCritical.push(item);
    }
  }

  const rawPercent = Math.round((points / maxPoints) * 100);
  const capped = missingCritical.length > 0 && rawPercent > CRITICAL_CAP_PERCENT;
  const percent = capped ? CRITICAL_CAP_PERCENT : rawPercent;
  const band = bandFor(percent);

  const groups = GROUPS.map((name) => {
    const items = steps.filter((item) => item.group === name);
    const doneCount = items.filter((item) => done.has(item.id)).length;
    return {
      name,
      done: doneCount,
      total: items.length,
      percent: items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0,
    };
  });

  const nextActions = remaining
    .slice()
    .sort((a, b) => Number(Boolean(b.critical)) - Number(Boolean(a.critical)) || b.weight - a.weight)
    .slice(0, 3);

  return {
    steps,
    points,
    maxPoints,
    rawPercent,
    percent,
    capped,
    completed: steps.filter((item) => done.has(item.id)).length,
    total: steps.length,
    criticalTotal: steps.filter((item) => item.critical).length,
    band: band.id,
    bandLabel: band.label,
    bandHint: band.hint,
    remaining,
    missingCritical,
    groups,
    nextActions,
  };
}
