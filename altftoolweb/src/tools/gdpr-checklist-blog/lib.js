/**
 * GDPR compliance checklist for blogs — pure logic.
 *
 * Every item cites the provision it comes from: the GDPR (Regulation (EU)
 * 2016/679) or, for cookies and similar storage, Article 5(3) of the
 * ePrivacy Directive 2002/58/EC. This is an informational self-assessment,
 * not legal advice or a certification.
 */

/**
 * Article 12(3): a data subject request must be answered without undue delay
 * and in any event within one month of receipt, extendable by two further
 * months for complex or numerous requests.
 */
export const DSAR_RESPONSE_DAYS = 30;
export const DSAR_EXTENSION_MONTHS = 2;

/** Article 33(1): personal data breaches are notified to the supervisory authority within 72 hours. */
export const BREACH_NOTIFICATION_HOURS = 72;

/**
 * Article 83(5): the higher fine tier is up to EUR 20 million or 4% of total
 * worldwide annual turnover, whichever is higher. Article 83(4) sets the lower
 * tier at EUR 10 million or 2%.
 */
export const MAX_FINE_EUR = 20000000;
export const MAX_FINE_TURNOVER_PERCENT = 4;

/**
 * Article 30(5): the record-of-processing obligation is relaxed for
 * organisations with fewer than 250 employees, unless the processing is likely
 * to result in a risk to rights and freedoms, is not occasional, or involves
 * special category or criminal conviction data.
 */
export const ROPA_EMPLOYEE_THRESHOLD = 250;

/** Features a blog may or may not have. Each checklist item maps to these. */
export const BLOG_FEATURES = [
  { id: "euVisitors", label: "You have readers in the EU, EEA or UK", defaultOn: true },
  { id: "analytics", label: "Analytics (Google Analytics, Plausible, Matomo…)", defaultOn: true },
  { id: "ads", label: "Advertising or affiliate tracking", defaultOn: false },
  { id: "newsletter", label: "Email newsletter sign-up", defaultOn: true },
  { id: "comments", label: "Comments on posts", defaultOn: true },
  { id: "contactForm", label: "Contact form", defaultOn: true },
  { id: "embeds", label: "Embedded video, maps or social posts", defaultOn: true },
  { id: "accounts", label: "Reader accounts or a members area", defaultOn: false },
  { id: "payments", label: "Paid products or subscriptions", defaultOn: false },
  { id: "nonEuHosting", label: "Hosting or vendors outside the EU/UK", defaultOn: true },
];

/** Severity drives the risk score: "critical" items are the ones regulators act on first. */
export const SEVERITIES = ["critical", "important", "good-practice"];

export const CHECKLIST_GROUPS = [
  { id: "foundations", label: "Foundations" },
  { id: "consent", label: "Cookies and consent" },
  { id: "collection", label: "Data you collect" },
  { id: "rights", label: "Reader rights" },
  { id: "vendors", label: "Vendors and transfers" },
  { id: "security", label: "Security and incidents" },
];

/**
 * The checklist. `appliesTo` is null when the item always applies, otherwise
 * the item only appears when at least one of those features is switched on.
 */
export const CHECKLIST_ITEMS = [
  {
    id: "privacy-notice",
    group: "foundations",
    severity: "critical",
    appliesTo: null,
    title: "Publish a privacy notice readers can find from every page",
    detail:
      "It must say who you are, what you collect, why, on what lawful basis, who you share it with, how long you keep it and what rights readers have.",
    reference: "GDPR Articles 12-14",
  },
  {
    id: "lawful-basis",
    group: "foundations",
    severity: "critical",
    appliesTo: null,
    title: "Write down a lawful basis for each thing you collect",
    detail:
      "Newsletter sign-ups normally rest on consent; replying to a contact form can rest on legitimate interests. One basis per purpose, decided before you collect.",
    reference: "GDPR Article 6",
  },
  {
    id: "identity",
    group: "foundations",
    severity: "important",
    appliesTo: null,
    title: "Name the controller and give a real contact route",
    detail:
      "A pseudonymous blog still has to identify who is responsible for the data and give an address or email that reaches them.",
    reference: "GDPR Article 13(1)(a)",
  },
  {
    id: "ropa",
    group: "foundations",
    severity: "good-practice",
    appliesTo: null,
    title: "Keep a one-page record of your processing",
    detail: `Under ${ROPA_EMPLOYEE_THRESHOLD} employees the formal record obligation is relaxed, but regular analytics and mailing-list processing is not "occasional", so keep a short record anyway.`,
    reference: "GDPR Article 30(5)",
  },
  {
    id: "cookie-consent",
    group: "consent",
    severity: "critical",
    appliesTo: ["analytics", "ads", "embeds"],
    title: "Ask for consent before any non-essential cookie or script loads",
    detail:
      "Storing or reading anything on a reader's device beyond what is strictly necessary needs prior consent. Blocking the script until consent is given is the part most blogs get wrong.",
    reference: "ePrivacy Directive Article 5(3)",
  },
  {
    id: "reject-button",
    group: "consent",
    severity: "critical",
    appliesTo: ["analytics", "ads", "embeds"],
    title: "Make rejecting as easy as accepting",
    detail:
      "A visible Reject button at the same level as Accept, no pre-ticked boxes, and no design that pushes readers towards consent.",
    reference: "GDPR Article 7(2) and Recital 32",
  },
  {
    id: "withdraw-consent",
    group: "consent",
    severity: "important",
    appliesTo: ["analytics", "ads", "embeds", "newsletter"],
    title: "Let readers withdraw consent as easily as they gave it",
    detail:
      "A permanent link to reopen cookie preferences, and a one-click unsubscribe in every marketing email.",
    reference: "GDPR Article 7(3)",
  },
  {
    id: "cookie-list",
    group: "consent",
    severity: "good-practice",
    appliesTo: ["analytics", "ads", "embeds"],
    title: "List the cookies you actually set, with purpose and lifetime",
    detail:
      "Audit with your browser's storage inspector rather than copying a template list — embeds often set cookies you did not expect.",
    reference: "GDPR Articles 13(1)(c) and 13(2)(a)",
  },
  {
    id: "newsletter-optin",
    group: "collection",
    severity: "critical",
    appliesTo: ["newsletter"],
    title: "Use unbundled, unticked opt-in for the newsletter",
    detail:
      "Consent must be a separate affirmative action, not a condition of downloading a freebie, and you must keep a record of when and how it was given.",
    reference: "GDPR Articles 4(11) and 7(1)",
  },
  {
    id: "form-minimisation",
    group: "collection",
    severity: "important",
    appliesTo: ["newsletter", "contactForm", "comments", "accounts"],
    title: "Ask only for the fields you genuinely need",
    detail:
      "An email address is enough for a newsletter. Every extra required field is data you now have to protect, justify and delete.",
    reference: "GDPR Article 5(1)(c)",
  },
  {
    id: "comment-ip",
    group: "collection",
    severity: "important",
    appliesTo: ["comments"],
    title: "Tell commenters what happens to their name, email and IP address",
    detail:
      "Comment systems usually store the IP address and pass the email to a gravatar service. Say so, and say how long comments are kept.",
    reference: "GDPR Article 13",
  },
  {
    id: "retention",
    group: "collection",
    severity: "important",
    appliesTo: null,
    title: "Set and publish a retention period for each data set",
    detail:
      "For example: contact form emails deleted after 12 months, inactive newsletter subscribers removed after 24 months, analytics retention capped in the tool's settings.",
    reference: "GDPR Article 5(1)(e)",
  },
  {
    id: "childrens-data",
    group: "collection",
    severity: "good-practice",
    appliesTo: ["newsletter", "accounts", "comments"],
    title: "Decide how you handle readers under 16",
    detail:
      "Information society services offered to children need parental authorisation below the national age of consent, which member states may set anywhere between 13 and 16.",
    reference: "GDPR Article 8",
  },
  {
    id: "rights-route",
    group: "rights",
    severity: "critical",
    appliesTo: null,
    title: "Give one clear address for access, correction and deletion requests",
    detail: `You must answer without undue delay and within ${DSAR_RESPONSE_DAYS} days, extendable by ${DSAR_EXTENSION_MONTHS} months for complex requests, and you cannot charge for the first copy.`,
    reference: "GDPR Articles 15-17 and 12(3)",
  },
  {
    id: "rights-process",
    group: "rights",
    severity: "important",
    appliesTo: null,
    title: "Know where a reader's data actually lives before a request arrives",
    detail:
      "List the systems holding personal data — mailing list, comments database, form inbox, analytics, payment processor — so a deletion request can be completed in all of them.",
    reference: "GDPR Article 17",
  },
  {
    id: "portability",
    group: "rights",
    severity: "good-practice",
    appliesTo: ["accounts", "newsletter", "payments"],
    title: "Be able to export a reader's data in a machine-readable format",
    detail:
      "Where processing rests on consent or a contract and is automated, readers can ask for their data in a structured, commonly used, machine-readable form.",
    reference: "GDPR Article 20",
  },
  {
    id: "objection",
    group: "rights",
    severity: "important",
    appliesTo: ["newsletter", "ads"],
    title: "Honour objections to direct marketing immediately and absolutely",
    detail:
      "There is no balancing test for direct marketing: once a reader objects, you stop, and you keep a suppression record so they are not re-added.",
    reference: "GDPR Article 21(2)-(3)",
  },
  {
    id: "processor-terms",
    group: "vendors",
    severity: "critical",
    appliesTo: ["analytics", "newsletter", "ads", "payments", "accounts", "nonEuHosting"],
    title: "Accept a data processing agreement with every vendor",
    detail:
      "Your host, mailing list, analytics tool and form provider all process data on your behalf, and each needs a contract with the Article 28 clauses in it.",
    reference: "GDPR Article 28(3)",
  },
  {
    id: "transfers",
    group: "vendors",
    severity: "critical",
    appliesTo: ["nonEuHosting", "analytics", "ads", "newsletter"],
    title: "Check the transfer mechanism for vendors outside the EU/UK",
    detail:
      "An adequacy decision, standard contractual clauses or a certification framework has to be in place, and you should say in the privacy notice where data goes.",
    reference: "GDPR Articles 44-46",
  },
  {
    id: "subprocessor-list",
    group: "vendors",
    severity: "good-practice",
    appliesTo: ["analytics", "newsletter", "ads", "payments"],
    title: "List your vendors in the privacy notice by name or category",
    detail:
      "Readers are entitled to know the recipients or categories of recipient of their data — naming the actual tools is clearer and easier to keep honest.",
    reference: "GDPR Article 13(1)(e)",
  },
  {
    id: "https",
    group: "security",
    severity: "critical",
    appliesTo: null,
    title: "Serve the whole site over HTTPS, including forms",
    detail:
      "Encryption in transit is the baseline appropriate technical measure, and a form posting over plain HTTP is an easy finding against you.",
    reference: "GDPR Article 32(1)",
  },
  {
    id: "access-control",
    group: "security",
    severity: "important",
    appliesTo: null,
    title: "Lock down admin access with strong, unique credentials and 2FA",
    detail:
      "Most blog breaches are a reused admin password rather than anything sophisticated. Remove old contributor accounts too.",
    reference: "GDPR Article 32(1)(b)",
  },
  {
    id: "breach-plan",
    group: "security",
    severity: "important",
    appliesTo: null,
    title: `Write down what you would do in the first ${BREACH_NOTIFICATION_HOURS} hours of a breach`,
    detail: `A notifiable breach has to reach the supervisory authority within ${BREACH_NOTIFICATION_HOURS} hours of you becoming aware of it, so decide now who assesses it and which authority you would contact.`,
    reference: "GDPR Article 33(1)",
  },
  {
    id: "backups",
    group: "security",
    severity: "good-practice",
    appliesTo: null,
    title: "Keep restorable backups and test one",
    detail:
      "Availability and resilience are explicit security requirements, and an untested backup is not a restorable one.",
    reference: "GDPR Article 32(1)(c)",
  },
];

const SEVERITY_WEIGHT = { critical: 3, important: 2, "good-practice": 1 };

/**
 * Score a blog against the checklist.
 *
 * @param {object} input
 * @param {string[]} input.features Feature ids that are switched on.
 * @param {string[]} input.doneIds  Checklist item ids already completed.
 * @returns {object} assessment, or { error } for invalid input.
 */
export function evaluateGdprChecklist(input) {
  const { features, doneIds } = input || {};
  if (!Array.isArray(features)) return { error: "Select which features your blog uses." };
  if (!Array.isArray(doneIds)) return { error: "Checklist progress could not be read." };

  const featureSet = new Set(features);
  const doneSet = new Set(doneIds);

  const applicable = CHECKLIST_ITEMS.filter(
    (item) => item.appliesTo === null || item.appliesTo.some((feature) => featureSet.has(feature)),
  ).map((item) => ({ ...item, done: doneSet.has(item.id) }));

  if (applicable.length === 0) {
    return { error: "No checklist items apply — switch on at least one feature your blog uses." };
  }

  const doneItems = applicable.filter((item) => item.done);
  const outstanding = applicable.filter((item) => !item.done);
  const criticalOutstanding = outstanding.filter((item) => item.severity === "critical");
  const importantOutstanding = outstanding.filter((item) => item.severity === "important");

  const totalWeight = applicable.reduce((sum, item) => sum + SEVERITY_WEIGHT[item.severity], 0);
  const doneWeight = doneItems.reduce((sum, item) => sum + SEVERITY_WEIGHT[item.severity], 0);
  const weightedScore = Math.round((doneWeight / totalWeight) * 100);
  const plainPercent = Math.round((doneItems.length / applicable.length) * 100);

  let risk = "low";
  if (criticalOutstanding.length > 0) risk = "high";
  else if (importantOutstanding.length > 0) risk = "medium";

  const groups = CHECKLIST_GROUPS.map((group) => {
    const items = applicable.filter((item) => item.group === group.id);
    return {
      ...group,
      items,
      done: items.filter((item) => item.done).length,
      total: items.length,
    };
  }).filter((group) => group.total > 0);

  const notes = [];
  if (!featureSet.has("euVisitors")) {
    notes.push(
      "You have said you have no EU, EEA or UK readers. A public blog usually does anyway, and the UK GDPR, Swiss FADP and several US state laws impose similar duties, so working through this list is still worthwhile.",
    );
  }
  if (featureSet.has("analytics") || featureSet.has("ads") || featureSet.has("embeds")) {
    notes.push(
      "Consent for cookies and similar storage comes from Article 5(3) of the ePrivacy Directive, not from the GDPR itself — which is why it applies even to analytics you consider harmless.",
    );
  }
  if (criticalOutstanding.length > 0) {
    notes.push(
      `${criticalOutstanding.length} critical item${criticalOutstanding.length === 1 ? " is" : "s are"} still open. Start with: ${criticalOutstanding[0].title}.`,
    );
  } else {
    notes.push("No critical items are outstanding. Work through the important ones next.");
  }
  notes.push(
    `Article 83(5) puts the top fine band at EUR ${(MAX_FINE_EUR / 1000000).toFixed(0)} million or ${MAX_FINE_TURNOVER_PERCENT}% of worldwide annual turnover, whichever is higher — the practical risk for a small blog is a complaint and an order to fix, not a headline fine.`,
  );

  return {
    applicable,
    groups,
    totalItems: applicable.length,
    doneCount: doneItems.length,
    outstandingCount: outstanding.length,
    criticalOutstanding,
    importantOutstanding,
    weightedScore,
    plainPercent,
    risk,
    notes,
  };
}
