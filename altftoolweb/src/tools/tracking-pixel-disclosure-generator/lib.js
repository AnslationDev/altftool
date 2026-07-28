/**
 * Tracking pixel disclosure generator.
 *
 * A "pixel" is a 1x1 image or inline script a third party serves from its own
 * domain so it can read the request headers, set an identifier and tie a page
 * view or conversion back to an advertising profile. Disclosing them properly
 * means naming four things per pixel: the vendor (the recipient of the data),
 * the purpose, the identifiers stored on the device, and how to stop it.
 *
 * Legal anchors used below:
 *  - ePrivacy Directive 2002/58/EC Art. 5(3): storing or accessing information on
 *    a user's device requires prior consent unless it is strictly necessary for a
 *    service the user requested. This applies to any pixel that sets or reads an
 *    identifier, whatever the GDPR lawful basis chosen for the later processing.
 *  - GDPR Art. 13(1)(e): the categories of recipients of personal data must be
 *    disclosed at the point of collection.
 *  - GDPR Art. 44-49: transfers outside the EEA need a transfer mechanism, in
 *    practice Standard Contractual Clauses or the EU-US Data Privacy Framework.
 *  - CCPA as amended by the CPRA, Cal. Civ. Code s.1798.140(ah): disclosing
 *    identifiers to a third party for cross-context behavioural advertising is
 *    "sharing" and triggers the opt-out link duty in s.1798.135.
 *  - India's DPDP Act, 2023 s.5: the notice must itemise the personal data and
 *    the purpose, in plain language.
 *
 * Cookie names below are the identifiers each vendor documents publicly. Vendors
 * change them, so treat the list as a starting point and verify against your own
 * tag manager before publishing.
 */

/** Beyond this, most regulators expect a documented justification for the period. */
export const LONG_RETENTION_MONTHS = 26;

export const PIXEL_CATALOG = [
  {
    id: "ga4",
    name: "Google Analytics 4",
    vendor: "Google Ireland Limited / Google LLC",
    category: "analytics",
    purpose: "Count visits, sessions and conversions and report aggregated site usage.",
    identifiers: "_ga, _ga_<container-id>",
    setsIdentifier: true,
    transfersOutsideEea: true,
    optOut: "https://tools.google.com/dlpage/gaoptout",
    typicalRetentionMonths: 14,
  },
  {
    id: "google-ads",
    name: "Google Ads conversion and remarketing tag",
    vendor: "Google Ireland Limited / Google LLC",
    category: "advertising",
    purpose: "Attribute conversions to ads and build remarketing audiences.",
    identifiers: "_gcl_au, _gcl_aw",
    setsIdentifier: true,
    transfersOutsideEea: true,
    optOut: "https://adssettings.google.com",
    typicalRetentionMonths: 24,
  },
  {
    id: "meta-pixel",
    name: "Meta Pixel",
    vendor: "Meta Platforms Ireland Limited",
    category: "advertising",
    purpose: "Measure ad conversions and target ads on Facebook and Instagram.",
    identifiers: "_fbp, fbc (from the fbclid URL parameter)",
    setsIdentifier: true,
    transfersOutsideEea: true,
    optOut: "https://www.facebook.com/adpreferences/ad_settings",
    typicalRetentionMonths: 24,
  },
  {
    id: "linkedin-insight",
    name: "LinkedIn Insight Tag",
    vendor: "LinkedIn Ireland Unlimited Company",
    category: "advertising",
    purpose: "Report campaign conversions and build professional-audience segments.",
    identifiers: "li_sugr, UserMatchHistory, bcookie",
    setsIdentifier: true,
    transfersOutsideEea: true,
    optOut: "https://www.linkedin.com/psettings/guest-controls/retargeting-opt-out",
    typicalRetentionMonths: 6,
  },
  {
    id: "microsoft-uet",
    name: "Microsoft Advertising UET tag",
    vendor: "Microsoft Corporation",
    category: "advertising",
    purpose: "Track conversions from Bing and Microsoft Audience Network ads.",
    identifiers: "_uetsid, _uetvid",
    setsIdentifier: true,
    transfersOutsideEea: true,
    optOut: "https://account.microsoft.com/privacy/ad-settings",
    typicalRetentionMonths: 13,
  },
  {
    id: "tiktok-pixel",
    name: "TikTok Pixel",
    vendor: "TikTok Information Technologies UK Limited",
    category: "advertising",
    purpose: "Measure conversions from TikTok ads and build lookalike audiences.",
    identifiers: "_ttp",
    setsIdentifier: true,
    transfersOutsideEea: true,
    optOut: "https://www.tiktok.com/legal/privacy-policy",
    typicalRetentionMonths: 13,
  },
  {
    id: "pinterest-tag",
    name: "Pinterest Tag",
    vendor: "Pinterest Europe Limited",
    category: "advertising",
    purpose: "Attribute purchases to Pin campaigns and retarget visitors.",
    identifiers: "_pinterest_ct_ua, _epik",
    setsIdentifier: true,
    transfersOutsideEea: true,
    optOut: "https://policy.pinterest.com/privacy-policy",
    typicalRetentionMonths: 13,
  },
  {
    id: "hotjar",
    name: "Hotjar tracking code",
    vendor: "Hotjar Limited (Malta)",
    category: "behavioural",
    purpose: "Record heatmaps and anonymised session replays to find usability problems.",
    identifiers: "_hjSessionUser_<site-id>, _hjSession_<site-id>",
    setsIdentifier: true,
    transfersOutsideEea: false,
    optOut: "https://www.hotjar.com/policies/do-not-track/",
    typicalRetentionMonths: 12,
  },
  {
    id: "clarity",
    name: "Microsoft Clarity",
    vendor: "Microsoft Corporation",
    category: "behavioural",
    purpose: "Record heatmaps and session replays to diagnose interface problems.",
    identifiers: "_clck, _clsk, CLID",
    setsIdentifier: true,
    transfersOutsideEea: true,
    optOut: "https://account.microsoft.com/privacy",
    typicalRetentionMonths: 13,
  },
  {
    id: "email-open-pixel",
    name: "Email open-tracking pixel",
    vendor: "Your email service provider",
    category: "marketing",
    purpose: "Record that a marketing email was opened, when, and on what device.",
    identifiers: "None stored on the device; a unique image URL per recipient",
    setsIdentifier: false,
    transfersOutsideEea: false,
    optOut: "Disable remote image loading in your email client, or unsubscribe.",
    typicalRetentionMonths: 24,
  },
];

export const REGIONS = [
  { id: "eu", label: "EU / EEA", consentRequired: true, saleLanguage: false },
  { id: "uk", label: "United Kingdom", consentRequired: true, saleLanguage: false },
  { id: "india", label: "India (DPDP Act, 2023)", consentRequired: true, saleLanguage: false },
  { id: "us-ca", label: "California (CCPA/CPRA)", consentRequired: false, saleLanguage: true },
  { id: "global", label: "Global audience", consentRequired: true, saleLanguage: true },
];

export const LEGAL_BASES = [
  { id: "consent", label: "Consent" },
  { id: "legitimate-interests", label: "Legitimate interests" },
  { id: "contract", label: "Performance of a contract" },
];

/** Industry opt-out portals that cover many vendors at once. */
export const INDUSTRY_OPT_OUTS = [
  ["Network Advertising Initiative (US)", "https://optout.networkadvertising.org/"],
  ["Digital Advertising Alliance (US)", "https://optout.aboutads.info/"],
  ["Your Online Choices (EU)", "https://www.youronlinechoices.eu/"],
];

const CATALOG_BY_ID = new Map(PIXEL_CATALOG.map((item) => [item.id, item]));
const REGION_BY_ID = new Map(REGIONS.map((item) => [item.id, item]));

const clean = (value) => String(value ?? "").trim();

const CATEGORY_LABELS = {
  analytics: "analytics",
  advertising: "advertising",
  behavioural: "session recording",
  marketing: "email marketing",
};

/**
 * @param {object} input
 * @param {string} input.siteName       Public name of the site.
 * @param {string} input.controllerName Legal entity acting as controller.
 * @param {string[]} input.pixels       Ids from PIXEL_CATALOG.
 * @param {string} input.region         One of REGIONS[].id.
 * @param {string} input.legalBasis     One of LEGAL_BASES[].id.
 * @param {number} input.retentionMonths How long you keep the pixel-derived data.
 * @param {string} input.contactEmail   Privacy contact.
 * @param {string} input.lastUpdated    ISO date shown on the disclosure (yyyy-mm-dd).
 * @returns {object} disclosure text and stats, or { error }.
 */
export function buildPixelDisclosure({
  siteName = "",
  controllerName = "",
  pixels = [],
  region = "eu",
  legalBasis = "consent",
  retentionMonths = 14,
  contactEmail = "",
  lastUpdated = "",
} = {}) {
  const site = clean(siteName);
  if (!site) return { error: "Enter the name of the site the disclosure is for." };
  if (site.length > 80) return { error: "Keep the site name to 80 characters or fewer." };

  const controller = clean(controllerName) || site;
  const law = REGION_BY_ID.get(region);
  if (!law) return { error: "Choose one of the supported regions." };
  if (!LEGAL_BASES.some((item) => item.id === legalBasis)) {
    return { error: "Choose a lawful basis for the processing." };
  }

  if (!Number.isFinite(retentionMonths) || retentionMonths <= 0) {
    return { error: "Retention must be at least one month." };
  }
  if (retentionMonths > 120) {
    return { error: "Enter a retention period of 120 months or fewer." };
  }

  const rows = pixels
    .map((id) => CATALOG_BY_ID.get(id))
    .filter(Boolean)
    .map((item) => ({ ...item, categoryLabel: CATEGORY_LABELS[item.category] || item.category }));

  if (rows.length === 0) {
    return { error: "Select at least one pixel or tag to disclose." };
  }

  const vendors = Array.from(new Set(rows.map((row) => row.vendor)));
  const deviceStoring = rows.filter((row) => row.setsIdentifier);
  const transferring = rows.filter((row) => row.transfersOutsideEea);
  const advertising = rows.filter((row) => row.category === "advertising");
  const behavioural = rows.filter((row) => row.category === "behavioural");
  const longestVendorRetention = rows.reduce(
    (max, row) => Math.max(max, row.typicalRetentionMonths),
    0,
  );

  const categoriesUsed = Array.from(new Set(rows.map((row) => row.categoryLabel)));
  const categoryPhrase =
    categoriesUsed.length === 1
      ? categoriesUsed[0]
      : `${categoriesUsed.slice(0, -1).join(", ")} and ${categoriesUsed[categoriesUsed.length - 1]}`;

  const title = `How ${site} uses tracking pixels`;

  const summary = `${site} loads ${rows.length} third-party tracking pixel${rows.length === 1 ? "" : "s"} from ${vendors.length} vendor${vendors.length === 1 ? "" : "s"} for ${categoryPhrase} purposes. ${deviceStoring.length} of them store an identifier in your browser.`;

  const paragraphs = [
    `A tracking pixel is a tiny image or script loaded from another company's server. Because your browser has to request it, that company sees your IP address, the page you are on, your device and browser details, and any identifier it has already stored. ${controller} uses these pixels to ${categoryPhrase === "analytics" ? "understand how the site is used" : "measure how the site is used and how well its advertising performs"}.`,
    law.consentRequired
      ? `Pixels that store or read information on your device are loaded only after you consent, and you can withdraw that consent at any time from the cookie settings link in the footer. Strictly necessary functionality never depends on them.`
      : `You do not have to opt in before these pixels load, but you can opt out of the sale or sharing of your personal information at any time using the opt-out link in the footer, and ${controller} honours the Global Privacy Control signal.`,
    `${controller} keeps the data derived from these pixels for ${retentionMonths} month${retentionMonths === 1 ? "" : "s"}, after which it is deleted or aggregated so it can no longer identify you. Each vendor applies its own retention period to the copy it holds.`,
    transferring.length > 0
      ? `${transferring.length} of these vendor${transferring.length === 1 ? "" : "s"} may process your data outside the EEA, principally in the United States. Those transfers rely on Standard Contractual Clauses or the vendor's certification under the EU-US Data Privacy Framework.`
      : `These vendors process your data within the EEA or the United Kingdom.`,
    behavioural.length > 0
      ? `Session-recording tools reconstruct how you moved through a page. ${controller} masks form fields and payment details so keystrokes in them are not captured, and does not use replays to identify individuals.`
      : "",
    contactEmail
      ? `Questions about any pixel listed here, or a request to access or delete what has been collected, can be sent to ${contactEmail}.`
      : `Questions about any pixel listed here can be sent to the contact address in the privacy policy.`,
  ].filter(Boolean);

  const optOutLines = [
    ...rows.map((row) => `${row.name} — ${row.optOut}`),
    ...INDUSTRY_OPT_OUTS.map(([label, url]) => `${label} — ${url}`),
    "Most browsers can also block third-party cookies entirely in their privacy settings.",
  ];

  const warnings = [];
  if (law.consentRequired && legalBasis !== "consent" && deviceStoring.length > 0) {
    warnings.push(
      `${deviceStoring.length} of the selected pixels store an identifier on the device. ePrivacy Directive Art. 5(3) (and PECR reg. 6 in the UK) requires prior consent for that regardless of which GDPR lawful basis you pick for the later processing, so "${legalBasis.replace("-", " ")}" will not hold up on its own.`,
    );
  }
  if (law.saleLanguage && advertising.length > 0) {
    warnings.push(
      'Disclosing identifiers to advertising vendors is "sharing for cross-context behavioural advertising" under Cal. Civ. Code s.1798.140(ah), which triggers the "Do Not Sell or Share My Personal Information" link duty in s.1798.135. Add that link to your homepage footer.',
    );
  }
  if (retentionMonths > LONG_RETENTION_MONTHS) {
    warnings.push(
      `A ${retentionMonths}-month retention period is longer than the ${LONG_RETENTION_MONTHS} months most supervisory authorities expect for advertising identifiers. Document why you need it or shorten it.`,
    );
  }
  if (retentionMonths > longestVendorRetention && longestVendorRetention > 0) {
    warnings.push(
      `You claim to keep pixel data for ${retentionMonths} months, but the longest default retention among the selected vendors is ${longestVendorRetention} months. Make sure your own stated period matches what you actually configure in each platform.`,
    );
  }
  if (rows.some((row) => row.id === "email-open-pixel")) {
    warnings.push(
      "Email open tracking also needs disclosing inside the email itself, not only on the website. Under ePrivacy Art. 5(3) an open pixel accesses information on the recipient's device, so include it in the consent you collect at signup.",
    );
  }
  if (behavioural.length > 0) {
    warnings.push(
      "Session replay can capture free-text fields. Confirm that input masking is switched on for every form before you publish a disclosure that says data is masked.",
    );
  }
  if (!contactEmail) {
    warnings.push(
      "Add a privacy contact address. GDPR Art. 13 requires the controller's contact details in the information you give at collection.",
    );
  }

  const plainText = [
    title,
    lastUpdated ? `Last updated: ${clean(lastUpdated)}` : "",
    "",
    summary,
    "",
    ...paragraphs,
    "",
    "Pixels in use",
    ...rows.map(
      (row) =>
        `- ${row.name} (${row.vendor}) — ${row.categoryLabel}. Purpose: ${row.purpose} Identifiers: ${row.identifiers}.`,
    ),
    "",
    "How to opt out",
    ...optOutLines.map((line) => `- ${line}`),
  ]
    .filter((line, index, all) => !(line === "" && all[index - 1] === ""))
    .join("\n");

  return {
    title,
    summary,
    paragraphs,
    rows,
    optOutLines,
    plainText,
    warnings,
    stats: {
      pixelCount: rows.length,
      vendorCount: vendors.length,
      deviceStoringCount: deviceStoring.length,
      transferCount: transferring.length,
      advertisingCount: advertising.length,
      longestVendorRetention,
    },
    consentRequired: law.consentRequired,
    regionLabel: law.label,
  };
}
