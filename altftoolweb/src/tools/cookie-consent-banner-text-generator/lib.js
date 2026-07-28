/**
 * Cookie consent banner copy generator.
 *
 * The wording a banner needs is driven by the consent model that applies:
 *
 *  - Opt-in ("consent before storage") regimes: ePrivacy Directive 2002/58/EC
 *    Art. 5(3) as implemented across the EU, and PECR reg. 6 in the UK. Consent
 *    must meet the GDPR / UK GDPR Art. 4(11) standard — freely given, specific,
 *    informed and unambiguous, given by a clear affirmative action. Pre-ticked
 *    boxes do not qualify (CJEU C-673/17, Planet49). Refusing must be as easy as
 *    accepting, so a "Reject all" control belongs on the first layer alongside
 *    "Accept all" (EDPB Guidelines 03/2022 on deceptive design patterns).
 *    Consent must be withdrawable at any time and as easily as it was given
 *    (GDPR Art. 7(3)).
 *
 *  - India's Digital Personal Data Protection Act, 2023: s.5 requires an itemised
 *    notice, s.6 requires free, specific, informed, unconditional and unambiguous
 *    consent by clear affirmative action limited to the data necessary for the
 *    stated purpose, s.6(4) requires withdrawal to be as easy as giving consent,
 *    and s.5(3) requires the notice to be available in English or any language in
 *    the Eighth Schedule to the Constitution.
 *
 *  - Opt-out regime: the California Consumer Privacy Act as amended by the CPRA.
 *    No prior consent is required to set advertising cookies, but the business
 *    must offer an opt-out from sale/sharing (Cal. Civ. Code s.1798.135) and must
 *    honour the Global Privacy Control browser signal (CCPA Regs s.7025).
 *
 * All copy below is generated deterministically from the inputs. Nothing here is
 * legal advice — the output is a drafting starting point for review by counsel.
 */

/** CNIL recommends analytics cookies and their identifiers live no longer than 13 months. */
export const MAX_RECOMMENDED_COOKIE_MONTHS = 13;

/** CNIL guidance: re-ask for consent no more often than every 6 months after a refusal. */
export const MIN_REASK_MONTHS = 6;

export const REGIMES = [
  {
    id: "gdpr-eu",
    label: "EU — GDPR + ePrivacy Directive",
    model: "opt-in",
    requiresRejectAll: true,
    citation: "ePrivacy Directive 2002/58/EC Art. 5(3); GDPR Art. 4(11), 6, 7",
  },
  {
    id: "uk-pecr",
    label: "UK — UK GDPR + PECR",
    model: "opt-in",
    requiresRejectAll: true,
    citation: "PECR reg. 6; UK GDPR Art. 4(11), 7",
  },
  {
    id: "india-dpdp",
    label: "India — DPDP Act, 2023",
    model: "opt-in",
    requiresRejectAll: true,
    citation: "DPDP Act, 2023 ss. 5, 6 and 6(4)",
  },
  {
    id: "us-cpra",
    label: "California — CCPA/CPRA",
    model: "opt-out",
    requiresRejectAll: false,
    citation: "Cal. Civ. Code s.1798.135; CCPA Regs s.7025 (Global Privacy Control)",
  },
  {
    id: "global",
    label: "Global baseline (strictest of the above)",
    model: "opt-in",
    requiresRejectAll: true,
    citation: "Strictest-common baseline across GDPR, PECR, DPDP and CPRA",
  },
];

export const COOKIE_CATEGORIES = [
  {
    id: "necessary",
    label: "Strictly necessary",
    alwaysOn: true,
    blurb:
      "Keep you signed in, remember what is in your basket and protect the site from fraud. The site does not work without them, so they are set without asking.",
  },
  {
    id: "functional",
    label: "Functional / preferences",
    alwaysOn: false,
    blurb:
      "Remember choices such as your language, region and dark mode so you do not have to set them again.",
  },
  {
    id: "analytics",
    label: "Analytics / performance",
    alwaysOn: false,
    blurb:
      "Count visits and see which pages are used most, so we can fix what is slow or confusing. The reports are aggregated.",
  },
  {
    id: "advertising",
    label: "Advertising / targeting",
    alwaysOn: false,
    blurb:
      "Let us and our advertising partners build a profile of your interests, show you relevant ads elsewhere and measure whether those ads worked.",
  },
  {
    id: "personalisation",
    label: "Personalisation",
    alwaysOn: false,
    blurb:
      "Tailor the content, offers and recommendations you see based on what you have viewed before.",
  },
];

export const TONES = [
  { id: "plain", label: "Plain English" },
  { id: "formal", label: "Formal / legal" },
  { id: "friendly", label: "Friendly" },
];

const CATEGORY_BY_ID = new Map(COOKIE_CATEGORIES.map((item) => [item.id, item]));
const REGIME_BY_ID = new Map(REGIMES.map((item) => [item.id, item]));

const clean = (value) => String(value ?? "").trim();

const joinList = (items) => {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
};

/**
 * @param {object} input
 * @param {string} input.siteName        Name shown in the banner.
 * @param {string} input.regime          One of REGIMES[].id.
 * @param {string[]} input.categories    Non-essential category ids actually used.
 * @param {boolean} input.includeRejectAll  Show a first-layer "Reject all" button.
 * @param {boolean} input.preChecked     Non-essential toggles start switched on.
 * @param {string} input.policyUrl       Link to the cookie or privacy policy.
 * @param {string} input.prefsUrl        Link to the persistent preferences page.
 * @param {number} input.retentionMonths Longest non-essential cookie lifetime.
 * @param {string} input.contactEmail    Privacy contact / grievance officer.
 * @param {string} input.tone            One of TONES[].id.
 * @returns {object} generated copy, or { error } for unusable input.
 */
export function buildBannerCopy({
  siteName = "",
  regime = "gdpr-eu",
  categories = [],
  includeRejectAll = true,
  preChecked = false,
  policyUrl = "",
  prefsUrl = "",
  retentionMonths = 12,
  contactEmail = "",
  tone = "plain",
} = {}) {
  const name = clean(siteName);
  if (!name) return { error: "Enter the site or company name that should appear in the banner." };
  if (name.length > 80) return { error: "Keep the site name to 80 characters or fewer." };

  const law = REGIME_BY_ID.get(regime);
  if (!law) return { error: "Choose one of the supported privacy regimes." };

  if (!Number.isFinite(retentionMonths) || retentionMonths < 0) {
    return { error: "Cookie lifetime must be zero months or more." };
  }
  if (retentionMonths > 120) {
    return { error: "Enter a cookie lifetime of 120 months or fewer." };
  }

  const selected = COOKIE_CATEGORIES.filter(
    (item) => !item.alwaysOn && categories.includes(item.id),
  );
  if (selected.length === 0) {
    return {
      error:
        "Select at least one non-essential category. With only strictly necessary cookies you do not need a consent banner at all.",
    };
  }

  const optIn = law.model === "opt-in";
  const purposeList = joinList(selected.map((item) => item.label.toLowerCase()));

  const headings = {
    plain: `${name} uses cookies`,
    formal: `Cookie notice — ${name}`,
    friendly: `Mind if we use cookies on ${name}?`,
  };

  const bodies = {
    plain: optIn
      ? `We use strictly necessary cookies to make ${name} work. We would also like to set ${purposeList} cookies, but only if you say yes. You can change your mind at any time.`
      : `${name} uses cookies for ${purposeList}, and shares some of this information with advertising partners. You can opt out of that sharing at any time without losing access to the site.`,
    formal: optIn
      ? `${name} stores strictly necessary cookies on the basis that they are essential to deliver the service you requested. ${purposeList.charAt(0).toUpperCase()}${purposeList.slice(1)} cookies are set only with your consent, which you may withdraw at any time.`
      : `${name} collects personal information through cookies for ${purposeList} purposes and discloses certain identifiers to third parties for cross-context behavioural advertising. You may direct us to stop.`,
    friendly: optIn
      ? `The essential cookies keep ${name} running. The rest — ${purposeList} — are entirely up to you, and "no" costs you nothing.`
      : `Cookies help ${name} with ${purposeList}. Not into it? Opt out below, and the site still works exactly the same.`,
  };

  const heading = headings[tone] || headings.plain;
  const body = bodies[tone] || bodies.plain;

  const buttons = optIn
    ? {
        primary: "Accept all",
        secondary: includeRejectAll ? "Reject all" : "",
        tertiary: "Manage preferences",
        save: "Save my choices",
      }
    : {
        primary: "Got it",
        secondary: "Do not sell or share my personal information",
        tertiary: "Your privacy choices",
        save: "Save my choices",
      };

  const categoryRows = COOKIE_CATEGORIES.filter(
    (item) => item.alwaysOn || categories.includes(item.id),
  ).map((item) => ({
    id: item.id,
    label: item.label,
    blurb: item.blurb,
    alwaysOn: item.alwaysOn,
    defaultState: item.alwaysOn ? "Always active" : preChecked ? "On" : "Off",
  }));

  const withdrawal = optIn
    ? `Change or withdraw your consent at any time from ${prefsUrl ? `${prefsUrl}` : "the “Cookie settings” link in the footer"} — it takes the same one click as giving it.`
    : `Opt out at any time from ${prefsUrl ? `${prefsUrl}` : "the “Your privacy choices” link in the footer"}. We also honour the Global Privacy Control signal sent by your browser.`;

  const retentionLine =
    retentionMonths > 0
      ? `Non-essential cookies set by ${name} expire after ${retentionMonths} month${retentionMonths === 1 ? "" : "s"} at the latest, and we ask again rather than assuming your answer still holds.`
      : `Non-essential cookies are session-only and are cleared when you close the browser.`;

  const footerLinks = [
    policyUrl ? `Cookie policy: ${policyUrl}` : "Cookie policy: [add the URL]",
    prefsUrl ? `Cookie settings: ${prefsUrl}` : "Cookie settings: [add the URL]",
    contactEmail ? `Questions: ${contactEmail}` : "",
  ].filter(Boolean);

  const reaskLine = optIn
    ? `If you say no, we will not ask again for at least ${MIN_REASK_MONTHS} months.`
    : `Your opt-out is remembered on this browser; clearing cookies resets it.`;

  const secondLayer = [
    `About cookies on ${name}`,
    `Cookies are small files a site stores in your browser. Below is every category ${name} uses, what it is for, and a switch to turn it on or off. Strictly necessary cookies cannot be switched off because the site cannot function without them.`,
    ...categoryRows.map((row) => `${row.label} — ${row.defaultState}. ${row.blurb}`),
    retentionLine,
    withdrawal,
    reaskLine,
  ];

  const warnings = [];
  if (optIn && !includeRejectAll) {
    warnings.push(
      'Add a first-layer "Reject all" button. Where consent is required, refusing must be as easy as accepting — a banner with only "Accept all" and a buried settings link is the pattern regulators fine most often (EDPB Guidelines 03/2022).',
    );
  }
  if (optIn && preChecked) {
    warnings.push(
      "Switch the non-essential toggles to off by default. Pre-ticked boxes are not valid consent (CJEU C-673/17, Planet49), and the DPDP Act, 2023 s.6 requires a clear affirmative action too.",
    );
  }
  if (optIn && retentionMonths > MAX_RECOMMENDED_COOKIE_MONTHS) {
    warnings.push(
      `A ${retentionMonths}-month lifetime exceeds the ${MAX_RECOMMENDED_COOKIE_MONTHS} months CNIL recommends for analytics cookies and their identifiers. Shorten it, or document why a longer period is necessary.`,
    );
  }
  if (!policyUrl) {
    warnings.push(
      "Link a cookie or privacy policy. Consent is only 'informed' if the user can reach the full list of cookies, purposes and recipients from the banner.",
    );
  }
  if (!prefsUrl) {
    warnings.push(
      "Add a persistent settings link in the footer. Withdrawal must be as easy as giving consent (GDPR Art. 7(3); DPDP Act s.6(4)), which means it cannot require emailing you.",
    );
  }
  if (regime === "india-dpdp") {
    warnings.push(
      "Under DPDP Act s.5(3) the notice must also be available in English and each of the 22 languages in the Eighth Schedule to the Constitution, at the user's option.",
    );
  }
  if (!optIn && !contactEmail) {
    warnings.push(
      "Publish a contact route for privacy requests. CCPA requires at least two designated methods for submitting consumer requests, one of which is a toll-free number for businesses operating offline.",
    );
  }

  const plainText = [
    heading,
    "",
    body,
    "",
    `[${buttons.primary}]${buttons.secondary ? `  [${buttons.secondary}]` : ""}  [${buttons.tertiary}]`,
    "",
    ...secondLayer,
    "",
    ...footerLinks,
  ].join("\n");

  return {
    heading,
    body,
    buttons,
    categoryRows,
    secondLayer,
    withdrawal,
    retentionLine,
    reaskLine,
    footerLinks,
    warnings,
    plainText,
    model: law.model,
    citation: law.citation,
    regimeLabel: law.label,
  };
}
