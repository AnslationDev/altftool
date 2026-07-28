/**
 * Marketing consent checkbox copy generator.
 *
 * Rules the generated copy is built around:
 *
 *  - GDPR Art. 4(11) and Recital 32: consent must be a freely given, specific,
 *    informed and unambiguous indication given by a statement or clear affirmative
 *    action. Silence, pre-ticked boxes and inactivity do not constitute consent.
 *  - GDPR Art. 7(2): a consent request bundled into other matters must be clearly
 *    distinguishable, in plain language. In practice regulators read this with
 *    Art. 6(1)(a) as requiring separate ("granular") consent per purpose and per
 *    channel, so one checkbox covering email plus SMS plus phone is not specific.
 *  - GDPR Art. 7(3): withdrawal must be as easy as giving consent.
 *  - GDPR Art. 7(4): consent is not freely given where performance of a contract
 *    is made conditional on consent that is not necessary for that contract, so a
 *    marketing checkbox may not be mandatory to complete a purchase or signup.
 *  - UK PECR reg. 22: consent is needed for marketing email and SMS, with a "soft
 *    opt-in" exception in reg. 22(3) for an existing customer whose details were
 *    obtained in the course of a sale of a similar product, where an opt-out was
 *    offered at collection and in every message since.
 *  - India: DPDP Act, 2023 s.6 sets the consent standard and s.6(4) requires
 *    withdrawal to be as easy as giving; the TRAI TCCCP Regulations, 2018 govern
 *    commercial communications, with preference changes taking effect within seven
 *    days and senders required to use registered headers and templates on the DLT
 *    platform.
 *  - United States: the CAN-SPAM Act does not require prior consent for commercial
 *    email, but 15 U.S.C. s.7704 requires a functioning opt-out honoured within ten
 *    business days, a valid physical postal address in every message, and honest
 *    headers and subject lines. Autodialled or prerecorded marketing calls and texts
 *    need prior express written consent under the TCPA.
 */

/** CAN-SPAM: an opt-out request must be honoured within 10 business days. */
export const CAN_SPAM_OPT_OUT_BUSINESS_DAYS = 10;

/** TRAI TCCCP Regulations, 2018: a preference change takes effect within 7 days. */
export const TRAI_PREFERENCE_DAYS = 7;

export const CHANNELS = [
  {
    id: "email",
    label: "Email",
    verb: "email me",
    noun: "emails",
    needsExpressConsent: true,
  },
  {
    id: "sms",
    label: "SMS / text message",
    verb: "text me",
    noun: "text messages",
    needsExpressConsent: true,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    verb: "message me on WhatsApp",
    noun: "WhatsApp messages",
    needsExpressConsent: true,
  },
  {
    id: "phone",
    label: "Phone call",
    verb: "call me",
    noun: "phone calls",
    needsExpressConsent: true,
  },
  {
    id: "push",
    label: "App push notification",
    verb: "send me push notifications",
    noun: "push notifications",
    needsExpressConsent: true,
  },
  {
    id: "post",
    label: "Postal mail",
    verb: "post me",
    noun: "letters",
    needsExpressConsent: false,
  },
];

export const REGIMES = [
  {
    id: "gdpr",
    label: "EU — GDPR + ePrivacy",
    citation: "GDPR Art. 4(11), 7(2), 7(3), 7(4); Recital 32",
    optInRequired: true,
    needsPostalAddress: false,
  },
  {
    id: "uk-pecr",
    label: "UK — UK GDPR + PECR",
    citation: "PECR reg. 22; UK GDPR Art. 7",
    optInRequired: true,
    needsPostalAddress: false,
  },
  {
    id: "india",
    label: "India — DPDP Act + TRAI TCCCP",
    citation: "DPDP Act, 2023 ss. 6, 6(4); TRAI TCCCP Regulations, 2018",
    optInRequired: true,
    needsPostalAddress: false,
  },
  {
    id: "us",
    label: "United States — CAN-SPAM + TCPA",
    citation: "15 U.S.C. s.7704; TCPA 47 U.S.C. s.227",
    optInRequired: false,
    needsPostalAddress: true,
  },
];

/** Send frequency options, with the number of messages each implies per year. */
export const FREQUENCIES = [
  { id: "weekly", label: "Weekly", perYear: 52, phrase: "about once a week" },
  { id: "fortnightly", label: "Fortnightly", perYear: 26, phrase: "about twice a month" },
  { id: "monthly", label: "Monthly", perYear: 12, phrase: "about once a month" },
  { id: "quarterly", label: "Quarterly", perYear: 4, phrase: "about four times a year" },
  { id: "occasional", label: "Occasional", perYear: 6, phrase: "no more than six times a year" },
];

const CHANNEL_BY_ID = new Map(CHANNELS.map((item) => [item.id, item]));
const REGIME_BY_ID = new Map(REGIMES.map((item) => [item.id, item]));
const FREQ_BY_ID = new Map(FREQUENCIES.map((item) => [item.id, item]));

const clean = (value) => String(value ?? "").trim();

const joinList = (items) => {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
};

/**
 * @param {object} input
 * @param {string} input.brandName        Brand shown in the checkbox label.
 * @param {string[]} input.channels       Channel ids you want consent for.
 * @param {string} input.regime           One of REGIMES[].id.
 * @param {string} input.frequency        One of FREQUENCIES[].id.
 * @param {boolean} input.granular        One checkbox per channel instead of one for all.
 * @param {boolean} input.preChecked      Boxes start ticked.
 * @param {boolean} input.requiredToSubmit Form cannot be submitted without ticking.
 * @param {string} input.thirdParties     Named partners data is shared with, or "".
 * @param {string} input.privacyUrl       Link to the privacy policy.
 * @param {string} input.postalAddress    Physical address for CAN-SPAM footers.
 * @returns {object} generated copy and checks, or { error }.
 */
export function buildConsentCopy({
  brandName = "",
  channels = [],
  regime = "gdpr",
  frequency = "monthly",
  granular = true,
  preChecked = false,
  requiredToSubmit = false,
  thirdParties = "",
  privacyUrl = "",
  postalAddress = "",
} = {}) {
  const brand = clean(brandName);
  if (!brand) return { error: "Enter the brand name that should appear in the checkbox label." };
  if (brand.length > 60) return { error: "Keep the brand name to 60 characters or fewer." };

  const law = REGIME_BY_ID.get(regime);
  if (!law) return { error: "Choose one of the supported regimes." };

  const freq = FREQ_BY_ID.get(frequency);
  if (!freq) return { error: "Choose how often you will contact people." };

  const selected = channels.map((id) => CHANNEL_BY_ID.get(id)).filter(Boolean);
  if (selected.length === 0) {
    return { error: "Select at least one channel you want consent for." };
  }

  const partners = clean(thirdParties);
  const policy = clean(privacyUrl);
  const address = clean(postalAddress);

  const messagesPerYear = selected.length * freq.perYear;

  const sharingClause = partners ? ` We share your details with ${partners} for this purpose only.` : "";

  const checkboxes = granular
    ? selected.map((channel) => ({
        id: `consent-${channel.id}`,
        channel: channel.id,
        label: `Yes, ${channel.verb} about ${brand} offers and news, ${freq.phrase}.`,
        helper: `You can stop the ${channel.noun} at any time. ${channel.label} only — ticking this does not sign you up for anything else.`,
      }))
    : [
        {
          id: "consent-all",
          channel: "all",
          label: `Yes, contact me about ${brand} offers and news by ${joinList(selected.map((item) => item.label.toLowerCase()))}, ${freq.phrase}.`,
          helper: "You can stop these messages at any time.",
        },
      ];

  const helperText = `${brand} will use your contact details only to send what you have ticked above, ${freq.phrase} per channel.${sharingClause} Full detail is in our privacy policy${policy ? ` at ${policy}` : ""}.`;

  const submitNote = requiredToSubmit
    ? `You must tick at least one box to continue.`
    : `Leaving every box unticked is fine — you will still get the ${brand} service messages you need, such as order confirmations and security alerts.`;

  const unsubscribeLines = [];
  for (const channel of selected) {
    if (channel.id === "email") {
      unsubscribeLines.push(
        `Email: one-click unsubscribe link in the footer of every message${law.id === "us" ? `, honoured within ${CAN_SPAM_OPT_OUT_BUSINESS_DAYS} business days` : ", processed immediately"}.`,
      );
    } else if (channel.id === "sms" || channel.id === "whatsapp") {
      unsubscribeLines.push(
        `${channel.label}: reply STOP to any message${law.id === "india" ? `, or change your preference on 1909, effective within ${TRAI_PREFERENCE_DAYS} days` : ""}.`,
      );
    } else if (channel.id === "phone") {
      unsubscribeLines.push(
        law.id === "india"
          ? "Phone: register or update your preference on 1909 or the DND app, or tell the caller to remove you."
          : "Phone: tell the caller to remove you, or update your preferences in your account.",
      );
    } else if (channel.id === "push") {
      unsubscribeLines.push("Push: switch notifications off in the app settings or at OS level.");
    } else {
      unsubscribeLines.push("Post: email us and we will remove your address from the mailing list.");
    }
  }
  unsubscribeLines.push(
    `Or change everything at once in your ${brand} account preferences — it takes the same one click as opting in.`,
  );

  const warnings = [];
  if (preChecked) {
    warnings.push(
      "Untick the boxes by default. Recital 32 of the GDPR states that silence, pre-ticked boxes and inactivity do not constitute consent, and CJEU C-673/17 (Planet49) confirmed it.",
    );
  }
  if (requiredToSubmit) {
    warnings.push(
      "Do not make the marketing box mandatory. GDPR Art. 7(4) says consent is not freely given where a contract is made conditional on consent that is not necessary to perform it, so a required marketing tick invalidates the consent you collect.",
    );
  }
  if (!granular && selected.length > 1) {
    warnings.push(
      `One checkbox covering ${selected.length} channels is not "specific" consent. Split it into one box per channel so a person can accept email without also accepting ${selected.filter((item) => item.id !== "email")[0]?.label.toLowerCase() || "the rest"}.`,
    );
  }
  if (!policy) {
    warnings.push(
      "Link the privacy policy next to the checkbox. Consent is only informed if the identity of the controller and the purposes are available at the moment of ticking (GDPR Art. 13).",
    );
  }
  if (partners === "" && selected.length > 0) {
    warnings.push(
      "If any third party will send or receive this marketing, name them individually next to the checkbox. Regulators do not accept 'selected partners' or 'carefully chosen third parties' as specific consent.",
    );
  }
  if (law.needsPostalAddress && !address) {
    warnings.push(
      "Add a valid physical postal address. 15 U.S.C. s.7704(a)(5) requires one in every commercial email, and omitting it is a per-message violation.",
    );
  }
  if (law.id === "us" && selected.some((item) => item.id === "sms" || item.id === "phone")) {
    warnings.push(
      "Autodialled or prerecorded marketing calls and texts need prior express written consent under the TCPA, disclosed clearly and conspicuously and kept on record — a plain tick box with generic wording is not enough.",
    );
  }
  if (law.id === "india" && selected.some((item) => ["sms", "phone", "whatsapp"].includes(item.id))) {
    warnings.push(
      `Under the TRAI TCCCP Regulations, 2018 you must send commercial messages through a registered header and template on the DLT platform, and honour preference changes within ${TRAI_PREFERENCE_DAYS} days.`,
    );
  }
  if (law.optInRequired === false) {
    warnings.push(
      "CAN-SPAM does not require opt-in for email, but collecting consent anyway improves deliverability and is required if any of your recipients are in the EU, the UK or India.",
    );
  }

  const plainText = [
    `Marketing consent copy — ${brand}`,
    "",
    ...checkboxes.map((box) => `[ ] ${box.label}\n    ${box.helper}`),
    "",
    helperText,
    submitNote,
    "",
    "How to stop:",
    ...unsubscribeLines.map((line) => `- ${line}`),
    address ? `\n${brand}, ${address}` : "",
  ]
    .filter((line, index, all) => !(line === "" && all[index - 1] === ""))
    .join("\n");

  return {
    checkboxes,
    helperText,
    submitNote,
    unsubscribeLines,
    warnings,
    plainText,
    citation: law.citation,
    regimeLabel: law.label,
    stats: {
      checkboxCount: checkboxes.length,
      channelCount: selected.length,
      messagesPerYear,
      perChannelPerYear: freq.perYear,
    },
  };
}
