/**
 * WHOIS / RDAP privacy explainer.
 *
 * Works out, field by field, what a public registration data lookup shows for
 * a domain, scores the personal exposure that creates, and lists what you give
 * up by putting a privacy or proxy service in front of it.
 *
 * The policy background, all publicly documented:
 *  - ICANN's Temporary Specification (May 2018) and the Registration Data
 *    Policy that replaced it (effective 21 August 2024, with contracted-party
 *    compliance required by 21 August 2025) redact most registrant fields for
 *    generic top-level domains. Registrant State/Province and Country stay
 *    public, and the registrant email is replaced by an anonymised address or
 *    a web contact form.
 *  - Registrant Organization is not personal data when it names a company, and
 *    it is commonly published. Typing a company name into that field on a
 *    domain you hold personally is the most common self-inflicted disclosure.
 *  - RDAP has replaced WHOIS as the required registration data protocol for
 *    gTLDs; ICANN set 28 January 2025 as the sunset date for the legacy port
 *    43 WHOIS service at contracted registries and registrars.
 *  - Country-code registries set their own rules and are not bound by ICANN
 *    policy. Some redact individuals by default, some publish limited data for
 *    everyone, and a few prohibit privacy and proxy services entirely.
 *  - Privacy and proxy are not the same thing. With a privacy service you stay
 *    the registrant and only the contact details are masked. With a proxy
 *    service the provider is the registrant of record, which is a real change
 *    in who holds the name.
 *  - The CA/Browser Forum voted in 2024 to sunset the domain validation
 *    methods that relied on registration data contact email, so masked
 *    contacts no longer stand between you and a TLS certificate.
 *
 * Informational only. This is not legal advice, and disclosure obligations for
 * a business operating a website exist independently of registration data —
 * consult a qualified adviser for your own situation.
 */

export const REGISTRANT_TYPES = [
  { id: "individual", label: "An individual, in my own name" },
  { id: "sole-trader", label: "A sole trader or freelancer" },
  { id: "company", label: "A registered company" },
  { id: "nonprofit", label: "A charity, club or non-profit" },
];

export const REGISTRANT_TYPE_IDS = REGISTRANT_TYPES.map((item) => item.id);

export const TLD_POLICIES = [
  {
    id: "gtld",
    label: "A generic TLD (.com, .net, .org, .io, .app …)",
    summary:
      "Covered by ICANN's Registration Data Policy. Personal fields are redacted by default; State/Province and Country stay public, and email is replaced by an anonymised address or a web form.",
    allowsPrivacy: true,
  },
  {
    id: "cc-privacy-default",
    label: "A ccTLD that shields individuals by default (.ca, .uk with the opt-out …)",
    summary:
      "The registry hides individual registrants automatically but publishes organisations. Registering as a company removes the shield.",
    allowsPrivacy: true,
  },
  {
    id: "cc-limited",
    label: "A ccTLD that publishes almost nothing (.de and similar)",
    summary:
      "The public lookup returns technical data only. There is little for a privacy service to hide, and little for anyone to find.",
    allowsPrivacy: false,
    privacyNote:
      "The registry already withholds the registrant, so a paid privacy product adds nothing here.",
  },
  {
    id: "cc-public",
    label: "A ccTLD that publishes registrant data and bans privacy services",
    summary:
      "Some registries require full public registrant data as a condition of registration and prohibit proxy and privacy services outright — the usTLD policy is the long-standing example.",
    allowsPrivacy: false,
    privacyNote:
      "Privacy and proxy services are not permitted, so the only lever you have is which details you supply in the first place.",
  },
];

export const TLD_POLICY_IDS = TLD_POLICIES.map((item) => item.id);

export const PRIVACY_MODES = [
  { id: "none", label: "No privacy service — my own details are on file" },
  { id: "privacy", label: "A privacy service — I stay the registrant, contacts are masked" },
  { id: "proxy", label: "A proxy service — the provider is the registrant of record" },
];

export const PRIVACY_MODE_IDS = PRIVACY_MODES.map((item) => item.id);

export const PURPOSES = [
  { id: "personal", label: "A personal site, blog or side project", multiplier: 1 },
  { id: "business", label: "A business or a product people pay for", multiplier: 1 },
  {
    id: "sensitive",
    label: "Something where being found personally would be a real problem",
    multiplier: 1.2,
  },
];

export const PURPOSE_IDS = PURPOSES.map((item) => item.id);

/**
 * Exposure weights. The maximum is the worst realistic case — a home address
 * and personal contacts published in full — and every score is expressed as a
 * share of that fixed maximum so configurations stay comparable.
 */
export const WEIGHTS = {
  name: 12,
  organization: 4,
  streetHome: 30,
  streetBusiness: 6,
  city: 8,
  stateProvince: 3,
  country: 1,
  phonePersonal: 16,
  phoneBusiness: 6,
  emailPersonal: 14,
  emailRole: 4,
};

export const MAX_EXPOSURE =
  WEIGHTS.name +
  WEIGHTS.organization +
  WEIGHTS.streetHome +
  WEIGHTS.city +
  WEIGHTS.stateProvince +
  WEIGHTS.country +
  WEIGHTS.phonePersonal +
  WEIGHTS.emailPersonal;

const STATUS = {
  published: "Published in full",
  redacted: "Redacted by registry policy",
  masked: "Replaced by the privacy service",
  proxy: "Shows the proxy provider, not you",
  anonymised: "Replaced by an anonymised address or web form",
  absent: "Not collected or not shown",
};

const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

/**
 * Assess what a public lookup reveals and what privacy would cost.
 *
 * @param {object} input
 * @param {string} input.registrantType One of REGISTRANT_TYPE_IDS.
 * @param {string} input.tldPolicy      One of TLD_POLICY_IDS.
 * @param {string} input.privacyMode    One of PRIVACY_MODE_IDS.
 * @param {string} input.purpose        One of PURPOSE_IDS.
 * @param {boolean} input.filledOrganization  The Organization field is filled in.
 * @param {boolean} input.usesHomeAddress     The address on file is where you live.
 * @param {boolean} input.usesPersonalContacts The phone and email are your personal ones.
 * @returns {object} assessment, or { error }.
 */
export function assessWhoisPrivacy({
  registrantType,
  tldPolicy,
  privacyMode,
  purpose,
  filledOrganization = false,
  usesHomeAddress = true,
  usesPersonalContacts = true,
} = {}) {
  const type = REGISTRANT_TYPES.find((item) => item.id === registrantType);
  if (!type) return { error: "Choose who the domain is registered to." };

  const policy = TLD_POLICIES.find((item) => item.id === tldPolicy);
  if (!policy) return { error: "Choose which kind of top-level domain this is." };

  const mode = PRIVACY_MODES.find((item) => item.id === privacyMode);
  if (!mode) return { error: "Choose whether a privacy or proxy service is in use." };

  const use = PURPOSES.find((item) => item.id === purpose);
  if (!use) return { error: "Choose what the domain is for." };

  const isNaturalPerson = registrantType === "individual" || registrantType === "sole-trader";
  const privacyAllowed = policy.allowsPrivacy;
  const privacyActive = privacyAllowed && (mode.id === "privacy" || mode.id === "proxy");

  /** Decide what a public lookup shows for one field. */
  const resolve = (field) => {
    if (privacyActive) {
      return mode.id === "proxy" ? "proxy" : "masked";
    }
    if (policy.id === "cc-limited") return "absent";
    if (policy.id === "cc-public") return "published";
    if (policy.id === "cc-privacy-default") {
      return isNaturalPerson ? "redacted" : "published";
    }
    // gTLD under the Registration Data Policy.
    if (field === "stateProvince" || field === "country") return "published";
    if (field === "organization") return "published";
    if (field === "email") return "anonymised";
    return isNaturalPerson ? "redacted" : "published";
  };

  const streetWeight = usesHomeAddress ? WEIGHTS.streetHome : WEIGHTS.streetBusiness;
  const phoneWeight = usesPersonalContacts ? WEIGHTS.phonePersonal : WEIGHTS.phoneBusiness;
  const emailWeight = usesPersonalContacts ? WEIGHTS.emailPersonal : WEIGHTS.emailRole;

  const fieldDefs = [
    { id: "name", label: "Registrant name", weight: WEIGHTS.name },
    {
      id: "organization",
      label: "Registrant organisation",
      weight: WEIGHTS.organization,
      skip: !filledOrganization,
      note: "Not personal data when it names a company, so it is published even where the name is redacted.",
    },
    {
      id: "street",
      label: usesHomeAddress ? "Street address (your home)" : "Street address (business or agent)",
      weight: streetWeight,
    },
    { id: "city", label: "City", weight: WEIGHTS.city },
    {
      id: "stateProvince",
      label: "State or province",
      weight: WEIGHTS.stateProvince,
      note: "Stays public for generic TLDs even when everything else is redacted.",
    },
    {
      id: "country",
      label: "Country",
      weight: WEIGHTS.country,
      note: "Public everywhere. There is no configuration that hides it.",
    },
    {
      id: "phone",
      label: usesPersonalContacts ? "Phone (your personal number)" : "Phone (business line)",
      weight: phoneWeight,
    },
    {
      id: "email",
      label: usesPersonalContacts ? "Email (your personal address)" : "Email (role address)",
      weight: emailWeight,
    },
  ];

  const fields = fieldDefs
    .filter((field) => !field.skip)
    .map((field) => {
      const status = resolve(field.id);
      const exposed = status === "published";
      return {
        id: field.id,
        label: field.label,
        status,
        statusLabel: STATUS[status],
        exposed,
        points: exposed ? field.weight : 0,
        weight: field.weight,
        note: field.note ?? "",
      };
    });

  const rawExposure = fields.reduce((sum, field) => sum + field.points, 0);
  const score = clamp(Math.round((rawExposure / MAX_EXPOSURE) * 100 * use.multiplier), 0, 100);
  const exposedCount = fields.filter((field) => field.exposed).length;

  const band =
    score >= 60
      ? { id: "high", label: "Your personal details are largely public", tone: "danger" }
      : score >= 25
        ? { id: "medium", label: "Partly exposed — the gaps are avoidable", tone: "warning" }
        : { id: "low", label: "Little personal data is visible", tone: "success" };

  const findings = [];
  const add = (severity, title, detail) => findings.push({ severity, title, detail });

  if (filledOrganization && isNaturalPerson && policy.id === "gtld" && !privacyActive) {
    add(
      "high",
      "The organisation field is undoing your redaction",
      "A company name in Registrant Organization is treated as non-personal data and published, even though your name is redacted. If the domain is really yours personally, leave that field empty.",
    );
  }
  if (!privacyAllowed && (mode.id === "privacy" || mode.id === "proxy")) {
    add(
      "high",
      "This registry does not allow what you have selected",
      policy.privacyNote ?? "The registry's own policy overrides the registrar's privacy product.",
    );
  }
  if (usesHomeAddress && !privacyActive && policy.id !== "cc-limited" && !isNaturalPerson) {
    add(
      "high",
      "A home address is on file for an organisation registration",
      "Organisation registrations are published in most registries. Use a registered office, an accountant's address or a service address instead of where you live.",
    );
  }
  if (usesHomeAddress && policy.id === "cc-public") {
    add(
      "high",
      "Home address published with no way to mask it",
      "This registry publishes registrant data and does not permit privacy services. The only remaining control is which address you supply — use a service address that you are entitled to use.",
    );
  }
  if (mode.id === "proxy") {
    add(
      "medium",
      "A proxy provider is the legal registrant",
      "This is a genuine change of ownership on paper. If the provider goes out of business, suspends your account or is slow to respond, proving the domain is yours becomes a support ticket rather than a fact. A privacy service that leaves you as the registrant avoids that.",
    );
  }
  if (privacyActive && use.id === "business") {
    add(
      "medium",
      "Privacy does not remove a business disclosure duty",
      "Many jurisdictions require a trading website to publish an identifiable operator and a contact route, regardless of what the registration data shows. Masking the registration does not satisfy that, and does not hide you from it.",
    );
  }
  if (privacyActive) {
    add(
      "info",
      "Privacy is not opacity in a dispute",
      "A UDRP or URS complaint, a court order or a valid law-enforcement request routes through the provider and reaches the underlying registrant. Privacy raises the cost of casual lookups; it does not defeat a formal process.",
    );
  }
  if (use.id === "sensitive") {
    add(
      "high",
      "For a genuinely sensitive project, the registration is only one leak",
      "Certificate Transparency logs publish every hostname you get a certificate for, DNS history services archive old records, and old snapshots of registration data are widely resold. Treat the domain as one part of a plan rather than the plan.",
    );
  }
  if (usesPersonalContacts) {
    add(
      "medium",
      "Personal phone and email on file",
      "Use a dedicated address and number for domain registrations. It costs nothing, it survives you changing jobs or phones, and it keeps registrar mail out of a mailbox that matters.",
    );
  }
  if (policy.id === "gtld" && !privacyActive) {
    add(
      "info",
      "Most of the redaction already happened without you paying for it",
      "Under ICANN's Registration Data Policy, gTLD registration data for a natural person is redacted by default and the email is replaced with an anonymised address or a web form. A paid privacy product on top of that mainly covers the fields you filled in yourself.",
    );
  }

  const severityRank = { high: 0, medium: 1, info: 2 };
  findings.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);

  const tradeoffs = [
    {
      title: "Domain disputes",
      detail:
        "A complainant can still reach you. Providers disclose the underlying registrant when a UDRP or URS complaint is filed, so privacy delays contact rather than preventing it.",
    },
    {
      title: "Transfers",
      detail:
        "Some registrars require privacy to be switched off before releasing an authorisation code, and the code may be sent to the provider's address rather than yours. Plan an extra day for it.",
    },
    {
      title: "Proving ownership",
      detail:
        "With a proxy service the provider is the registrant of record. Keep your own paper trail — invoices, account records, DNS history — because the public record will not support your claim.",
    },
    {
      title: "Being contactable",
      detail:
        "Acquisition offers, abuse reports and security researchers all arrive through the registration record. A masked contact that nobody monitors means a vulnerability report goes nowhere.",
    },
    {
      title: "Certificates",
      detail:
        "No longer a problem. The CA/Browser Forum voted in 2024 to sunset the validation methods that used registration data contact email, so a masked contact does not block certificate issuance.",
    },
  ];

  return {
    score,
    band,
    fields,
    findings,
    tradeoffs,
    exposedCount,
    fieldCount: fields.length,
    registrantType: type,
    policy,
    privacyMode: mode,
    purpose: use,
    privacyActive,
    privacyAllowed,
  };
}

/** Plain-text export for the copy button. */
export function formatWhoisAssessment(result) {
  if (!result || result.error) return "";
  return [
    "WHOIS / RDAP exposure assessment",
    `${result.registrantType.label} · ${result.policy.label} · ${result.privacyMode.label}`,
    `Exposure score ${result.score}/100 — ${result.band.label}`,
    `${result.exposedCount} of ${result.fieldCount} fields published in full`,
    "",
    "FIELD BY FIELD:",
    ...result.fields.map((field) => `  ${field.label}: ${field.statusLabel}`),
    "",
    "FINDINGS:",
    ...result.findings.map((item) => `  [${item.severity}] ${item.title} — ${item.detail}`),
    "",
    "TRADE-OFFS OF PRIVACY:",
    ...result.tradeoffs.map((item) => `  - ${item.title}: ${item.detail}`),
  ].join("\n");
}
