/**
 * "Do Not Sell" opt-out link copy generator.
 *
 * The California Consumer Privacy Act as amended by the CPRA prescribes the link
 * titles almost word for word, so this module treats them as fixed constants
 * rather than free text:
 *
 *  - Cal. Civ. Code s.1798.135(a)(1): a business that sells or shares personal
 *    information must post a clear and conspicuous link on its internet homepage
 *    titled "Do Not Sell or Share My Personal Information".
 *  - Cal. Civ. Code s.1798.135(a)(2): a business that uses or discloses sensitive
 *    personal information beyond the permitted purposes must also post a link
 *    titled "Limit the Use of My Sensitive Personal Information".
 *  - Cal. Civ. Code s.1798.135(b) and CCPA Regulations s.7015: instead of the two
 *    links above, a business may post a single "Alternative Opt-out Link" titled
 *    "Your Privacy Choices" or "Your California Privacy Choices", accompanied by
 *    the opt-out icon, provided it covers both rights.
 *  - CCPA Regulations s.7026(f)(1): an opt-out request must be acted on as soon as
 *    feasibly possible and no later than 15 business days from receipt.
 *  - CCPA Regulations s.7026(a)(1) and s.7026(g): the opt-out method must be easy
 *    to execute, require minimal steps, and may not require the consumer to verify
 *    their identity or create an account.
 *  - CCPA Regulations s.7025: a business must treat an opt-out preference signal
 *    such as Global Privacy Control as a valid opt-out request.
 *  - Cal. Civ. Code s.1798.130(a)(2): verifiable consumer requests must be
 *    answered within 45 calendar days, extendable once by a further 45 days.
 *  - Cal. Civ. Code s.1798.130(a)(1)(A): at least two designated request methods
 *    including a toll-free number, unless the business operates exclusively online
 *    and has a direct relationship with the consumer, when an email address is
 *    enough.
 *  - Cal. Civ. Code s.1798.135(c)(4): the opt-out may not be met with a notice
 *    that degrades or penalises the consumer's experience.
 */

/** CCPA Regs s.7026(f)(1) — deadline to action an opt-out request. */
export const OPT_OUT_BUSINESS_DAYS = 15;

/** Cal. Civ. Code s.1798.130(a)(2) — deadline to answer a verifiable request. */
export const VERIFIABLE_REQUEST_DAYS = 45;

/** Cal. Civ. Code s.1798.130(a)(2) — single permitted extension. */
export const REQUEST_EXTENSION_DAYS = 45;

/** CCPA Regs s.7026(f)(2) — notify service providers within this many days. */
export const NOTIFY_THIRD_PARTIES_DAYS = 15;

/** Statutory link titles. These wordings are prescribed; do not paraphrase them. */
export const LINK_TITLES = {
  sale: "Do Not Sell or Share My Personal Information",
  sensitive: "Limit the Use of My Sensitive Personal Information",
  combined: "Your Privacy Choices",
  combinedCalifornia: "Your California Privacy Choices",
};

export const REQUEST_METHODS = [
  { id: "webform", label: "Interactive web form on the opt-out page" },
  { id: "email", label: "Dedicated privacy email address" },
  { id: "tollfree", label: "Toll-free telephone number" },
  { id: "account", label: "Toggle inside the signed-in account area" },
  { id: "gpc", label: "Global Privacy Control browser signal" },
];

const clean = (value) => String(value ?? "").trim();

/**
 * @param {object} input
 * @param {string} input.businessName    Legal or trading name of the business.
 * @param {boolean} input.sellsData      Sells personal information for value.
 * @param {boolean} input.sharesForAds   Shares identifiers for cross-context ads.
 * @param {boolean} input.usesSensitive  Uses sensitive PI beyond permitted purposes.
 * @param {boolean} input.useCombinedLink Use the single "Your Privacy Choices" link.
 * @param {boolean} input.californiaOnly Label the combined link as California-specific.
 * @param {string[]} input.methods       Ids from REQUEST_METHODS.
 * @param {boolean} input.onlineOnly     Business operates exclusively online.
 * @param {boolean} input.requiresAccount Opt-out requires creating or using an account.
 * @param {string} input.contactEmail    Privacy contact address.
 * @param {string} input.tollFreeNumber  Toll-free number, if any.
 * @returns {object} link labels and page copy, or { error }.
 */
export function buildOptOutCopy({
  businessName = "",
  sellsData = false,
  sharesForAds = false,
  usesSensitive = false,
  useCombinedLink = false,
  californiaOnly = false,
  methods = [],
  onlineOnly = true,
  requiresAccount = false,
  contactEmail = "",
  tollFreeNumber = "",
} = {}) {
  const name = clean(businessName);
  if (!name) return { error: "Enter the business name that appears on the opt-out page." };
  if (name.length > 80) return { error: "Keep the business name to 80 characters or fewer." };

  const saleTrigger = Boolean(sellsData || sharesForAds);
  if (!saleTrigger && !usesSensitive) {
    return {
      error:
        "No opt-out link is required. Cal. Civ. Code s.1798.135 only applies if you sell personal information, share it for cross-context behavioural advertising, or use sensitive personal information beyond the permitted purposes.",
    };
  }

  const chosenMethods = REQUEST_METHODS.filter((item) => methods.includes(item.id));
  if (chosenMethods.length === 0) {
    return { error: "Select at least one way for consumers to submit the opt-out request." };
  }

  const email = clean(contactEmail);
  const phone = clean(tollFreeNumber);

  const linkLabels = [];
  if (useCombinedLink) {
    linkLabels.push({
      id: "combined",
      label: californiaOnly ? LINK_TITLES.combinedCalifornia : LINK_TITLES.combined,
      basis: "Cal. Civ. Code s.1798.135(b); CCPA Regs s.7015",
      note: "Must be accompanied by the official opt-out icon and must cover both opt-out rights.",
    });
  } else {
    if (saleTrigger) {
      linkLabels.push({
        id: "sale",
        label: LINK_TITLES.sale,
        basis: "Cal. Civ. Code s.1798.135(a)(1)",
        note: "Clear and conspicuous, on the homepage and on every page that collects personal information.",
      });
    }
    if (usesSensitive) {
      linkLabels.push({
        id: "sensitive",
        label: LINK_TITLES.sensitive,
        basis: "Cal. Civ. Code s.1798.135(a)(2)",
        note: "Required in addition to the sale link when sensitive personal information is used beyond permitted purposes.",
      });
    }
  }

  const footerText = linkLabels.map((item) => item.label).join("  |  ");

  const activityPhrase = [
    sellsData ? "sells personal information" : "",
    sharesForAds ? "shares identifiers with advertising partners for cross-context behavioural advertising" : "",
    usesSensitive ? "uses sensitive personal information beyond the purposes the law permits without a limit request" : "",
  ]
    .filter(Boolean)
    .join(", and ");

  const landingHeading = useCombinedLink
    ? californiaOnly
      ? LINK_TITLES.combinedCalifornia
      : LINK_TITLES.combined
    : LINK_TITLES.sale;

  const landingIntro = `${name} ${activityPhrase}. California residents have the right to tell us to stop, and exercising that right costs nothing and changes nothing about the price, quality or level of service you receive.`;

  const landingSteps = chosenMethods.map((method) => {
    if (method.id === "webform") {
      return "Submit the form on this page. It takes one click and we do not ask you to prove who you are.";
    }
    if (method.id === "email") {
      return email
        ? `Email ${email} with the subject line "Do Not Sell or Share". Include the email address or phone number you use with us so we can find the right record.`
        : 'Email our privacy address with the subject line "Do Not Sell or Share".';
    }
    if (method.id === "tollfree") {
      return phone
        ? `Call ${phone}, free of charge, and ask to opt out.`
        : "Call our toll-free number and ask to opt out.";
    }
    if (method.id === "account") {
      return "Switch the opt-out toggle on in your account settings. This is an extra convenience, not a requirement.";
    }
    return "Turn on Global Privacy Control in your browser or extension. We treat that signal as a valid opt-out request for the browser it is sent from, with no form to fill in.";
  });

  const confirmationText = `Your request is recorded. ${name} will stop selling and sharing your personal information within ${OPT_OUT_BUSINESS_DAYS} business days, and will tell the third parties that received it in the preceding 90 days to do the same. We will not ask you to opt out again for at least twelve months. You can opt back in at any time, and we will always ask before treating you as opted in.`;

  const rightsLines = [
    `Opt-out requests are actioned within ${OPT_OUT_BUSINESS_DAYS} business days of receipt (CCPA Regs s.7026(f)(1)).`,
    `Service providers and third parties are notified within ${NOTIFY_THIRD_PARTIES_DAYS} days so they stop too (CCPA Regs s.7026(f)(2)).`,
    `Requests to know, delete or correct are answered within ${VERIFIABLE_REQUEST_DAYS} calendar days, extendable once by a further ${REQUEST_EXTENSION_DAYS} days with notice (Cal. Civ. Code s.1798.130(a)(2)).`,
    "We do not verify identity before honouring an opt-out, because the regulations do not permit us to make that a condition (CCPA Regs s.7026(g)).",
    "Opting out never results in a different price, a lower service level or a denial of goods (Cal. Civ. Code s.1798.125).",
  ];

  const warnings = [];
  if (useCombinedLink && !usesSensitive && !saleTrigger) {
    warnings.push(
      "The alternative single link only replaces the statutory links where it covers both opt-out rights. Confirm the page it points to handles sale/sharing and sensitive-information limits.",
    );
  }
  if (useCombinedLink) {
    warnings.push(
      'The "Your Privacy Choices" link must be shown with the official opt-out icon (the blue toggle) immediately to its left, at the same size as the surrounding text (CCPA Regs s.7015). Text alone is not compliant.',
    );
  }
  if (!methods.includes("gpc")) {
    warnings.push(
      "Add Global Privacy Control handling. CCPA Regs s.7025 requires a business to treat an opt-out preference signal as a valid request, and this is the most commonly missed obligation in enforcement sweeps.",
    );
  }
  if (requiresAccount) {
    warnings.push(
      "Do not require an account to opt out. CCPA Regs s.7026(d) prohibits requiring a consumer to create an account, and s.7026(a)(1) requires the method to need minimal steps.",
    );
  }
  if (!onlineOnly && !phone) {
    warnings.push(
      "A business that is not exclusively online must offer at least two methods including a toll-free telephone number (Cal. Civ. Code s.1798.130(a)(1)(A)). Add one, or confirm you operate solely online with a direct consumer relationship.",
    );
  }
  if (methods.includes("email") && !email) {
    warnings.push("You listed email as a request method but did not supply the address.");
  }
  if (methods.includes("tollfree") && !phone) {
    warnings.push("You listed a toll-free number as a request method but did not supply the number.");
  }
  if (chosenMethods.length === 1 && chosenMethods[0].id === "gpc") {
    warnings.push(
      "A browser signal alone is not enough. Consumers who do not use Global Privacy Control still need a link and a form or address they can use directly.",
    );
  }

  const plainText = [
    "Footer link text",
    footerText,
    "",
    `Landing page: ${landingHeading}`,
    landingIntro,
    "",
    "How to opt out",
    ...landingSteps.map((step) => `- ${step}`),
    "",
    "What happens next",
    confirmationText,
    "",
    "Your rights and our deadlines",
    ...rightsLines.map((line) => `- ${line}`),
  ].join("\n");

  return {
    linkLabels,
    footerText,
    landingHeading,
    landingIntro,
    landingSteps,
    confirmationText,
    rightsLines,
    warnings,
    plainText,
    deadlines: {
      optOutBusinessDays: OPT_OUT_BUSINESS_DAYS,
      notifyThirdPartiesDays: NOTIFY_THIRD_PARTIES_DAYS,
      verifiableRequestDays: VERIFIABLE_REQUEST_DAYS,
      maxWithExtensionDays: VERIFIABLE_REQUEST_DAYS + REQUEST_EXTENSION_DAYS,
    },
    stats: {
      linkCount: linkLabels.length,
      methodCount: chosenMethods.length,
      warningCount: warnings.length,
    },
  };
}
