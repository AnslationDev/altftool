/**
 * Marketing opt-out (objection to direct marketing) request generator.
 *
 * Rules encoded here:
 *
 *  - GDPR Art. 21(2): where personal data is processed for direct marketing, the
 *    data subject may object at any time. Art. 21(3): on objection the data must
 *    no longer be processed for that purpose. There is no balancing test and no
 *    exemption — the right is absolute, and it is free of charge under Art. 12(5).
 *    Art. 12(3) still requires the controller to confirm the action taken within
 *    one calendar month.
 *  - GDPR Art. 17(3) and ICO guidance: honouring an objection normally means
 *    keeping a minimal suppression record (name, email, phone) so the person is
 *    not re-imported later. Asking for total erasure can therefore defeat the
 *    opt-out, which is why suppression is the default here.
 *  - UK PECR reg. 22: consent is required for marketing email and SMS, and a
 *    withdrawal removes the basis for further messages.
 *  - United States, CAN-SPAM 15 U.S.C. s.7704(a)(3) and (a)(4): the opt-out
 *    mechanism must stay functional for at least 30 days after a message is sent,
 *    and the sender must stop within 10 business days of receiving the opt-out.
 *  - India, TRAI TCCCP Regulations, 2018: commercial-communication preferences are
 *    registered through 1909 or the DND app and take effect within 7 days. The
 *    DPDP Act, 2023 s.6(4) separately requires consent withdrawal to be as easy as
 *    giving consent.
 *
 * Business-day maths below counts Saturdays and Sundays as non-working days. It
 * does not know about public holidays, which vary by country and state, so a
 * real deadline may fall slightly later.
 */

const ISO_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** CAN-SPAM 15 U.S.C. s.7704(a)(4)(A)(i). */
export const CAN_SPAM_BUSINESS_DAYS = 10;

/** CAN-SPAM 15 U.S.C. s.7704(a)(3)(A)(ii) — opt-out route must work this long. */
export const CAN_SPAM_MECHANISM_DAYS = 30;

/** TRAI TCCCP Regulations, 2018 — preference change effective within 7 days. */
export const TRAI_PREFERENCE_DAYS = 7;

/** GDPR Art. 12(3) — confirmation of action taken. */
export const GDPR_CONFIRMATION_MONTHS = 1;

export const CHANNELS = [
  { id: "email", label: "Marketing email", identifier: "email" },
  { id: "sms", label: "SMS / text message", identifier: "phone" },
  { id: "whatsapp", label: "WhatsApp", identifier: "phone" },
  { id: "phone", label: "Marketing phone calls", identifier: "phone" },
  { id: "post", label: "Addressed postal mail", identifier: "address" },
  { id: "push", label: "App push notifications", identifier: "account" },
];

export const REGIMES = [
  {
    id: "gdpr",
    label: "EU — GDPR",
    stopRule: "immediate",
    right: "Article 21(2) GDPR (objection to direct marketing)",
    confirmMonths: GDPR_CONFIRMATION_MONTHS,
  },
  {
    id: "uk",
    label: "UK — UK GDPR + PECR",
    stopRule: "immediate",
    right: "Article 21(2) UK GDPR and regulation 22 PECR",
    confirmMonths: GDPR_CONFIRMATION_MONTHS,
  },
  {
    id: "india",
    label: "India — DPDP Act + TRAI TCCCP",
    stopRule: "trai",
    right: "Section 6(4), Digital Personal Data Protection Act, 2023 and the TRAI TCCCP Regulations, 2018",
    confirmMonths: 0,
  },
  {
    id: "us",
    label: "United States — CAN-SPAM / TCPA",
    stopRule: "business-days",
    right: "15 U.S.C. s.7704(a)(4) (CAN-SPAM opt-out)",
    confirmMonths: 0,
  },
];

export const HANDLING_OPTIONS = [
  {
    id: "suppress",
    label: "Add me to your suppression list (recommended)",
    note: "Keeps the minimum data needed to make sure you are never re-added to a campaign.",
  },
  {
    id: "erase",
    label: "Erase my marketing record entirely",
    note: "Cleaner, but with nothing on file a future data import can put you straight back on the list.",
  },
];

const CHANNEL_BY_ID = new Map(CHANNELS.map((item) => [item.id, item]));
const REGIME_BY_ID = new Map(REGIMES.map((item) => [item.id, item]));

const clean = (value) => String(value ?? "").trim();

const parseIso = (iso) => {
  if (!ISO_PATTERN.test(String(iso))) return null;
  const [year, month, day] = String(iso).split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
};

const toIso = (date) => date.toISOString().slice(0, 10);

/** Add whole calendar days. */
export function addCalendarDays(iso, days) {
  const date = parseIso(iso);
  if (!date || !Number.isInteger(days)) return null;
  return toIso(new Date(date.getTime() + days * 86400000));
}

/** Add whole calendar months, clamping to the last day of a shorter month. */
export function addCalendarMonths(iso, months) {
  const date = parseIso(iso);
  if (!date || !Number.isInteger(months)) return null;
  const monthIndex = date.getUTCMonth() + months;
  const year = date.getUTCFullYear() + Math.floor(monthIndex / 12);
  const month = ((monthIndex % 12) + 12) % 12;
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return toIso(new Date(Date.UTC(year, month, Math.min(date.getUTCDate(), lastDay))));
}

/**
 * Add whole business days, skipping Saturday and Sunday. Public holidays are not
 * modelled, so a statutory deadline may in practice fall one or two days later.
 */
export function addBusinessDays(iso, days) {
  const date = parseIso(iso);
  if (!date || !Number.isInteger(days) || days < 0) return null;
  let remaining = days;
  const cursor = new Date(date.getTime());
  while (remaining > 0) {
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    const weekday = cursor.getUTCDay();
    if (weekday !== 0 && weekday !== 6) remaining -= 1;
  }
  return toIso(cursor);
}

/**
 * @param {object} input
 * @param {string} input.fullName     Person objecting.
 * @param {string} input.email        Email the marketing arrives at.
 * @param {string} input.phone        Phone number used for SMS or calls.
 * @param {string} input.postalAddress Address used for addressed mail.
 * @param {string} input.organisation Sender the objection goes to.
 * @param {string[]} input.channels   Channel ids to stop.
 * @param {string} input.regime       One of REGIMES[].id.
 * @param {string} input.requestDate  ISO date the objection is sent.
 * @param {string} input.handling     One of HANDLING_OPTIONS[].id.
 * @param {boolean} input.notifyPartners Ask them to tell third parties too.
 * @param {boolean} input.keepServiceMessages Keep transactional messages coming.
 * @returns {object} letter, deadlines and checks, or { error }.
 */
export function buildOptOutRequest({
  fullName = "",
  email = "",
  phone = "",
  postalAddress = "",
  organisation = "",
  channels = [],
  regime = "gdpr",
  requestDate = "",
  handling = "suppress",
  notifyPartners = true,
  keepServiceMessages = true,
} = {}) {
  const name = clean(fullName);
  if (!name) return { error: "Enter the name of the person objecting." };

  const org = clean(organisation);
  if (!org) return { error: "Enter the organisation sending the marketing." };

  const law = REGIME_BY_ID.get(regime);
  if (!law) return { error: "Choose one of the supported regimes." };

  if (!parseIso(requestDate)) {
    return { error: "Enter the request date as a real calendar date." };
  }

  const selected = channels.map((id) => CHANNEL_BY_ID.get(id)).filter(Boolean);
  if (selected.length === 0) {
    return { error: "Select at least one channel you want the marketing stopped on." };
  }

  const handlingChoice = HANDLING_OPTIONS.find((item) => item.id === handling) || HANDLING_OPTIONS[0];

  const identifiers = {
    email: clean(email),
    phone: clean(phone),
    address: clean(postalAddress),
    account: name,
  };

  const channelRows = selected.map((channel) => {
    let stopBy = requestDate;
    let rule = "";
    if (law.stopRule === "immediate") {
      stopBy = requestDate;
      rule = "Immediately on receipt — Article 21(3) leaves no grace period.";
    } else if (law.stopRule === "business-days") {
      stopBy = addBusinessDays(requestDate, CAN_SPAM_BUSINESS_DAYS);
      rule = `${CAN_SPAM_BUSINESS_DAYS} business days from receipt (CAN-SPAM).`;
    } else {
      stopBy = addCalendarDays(requestDate, TRAI_PREFERENCE_DAYS);
      rule = `${TRAI_PREFERENCE_DAYS} days from registration of the preference (TRAI TCCCP).`;
    }
    return {
      id: channel.id,
      label: channel.label,
      identifier: identifiers[channel.identifier] || "",
      identifierKind: channel.identifier,
      stopBy,
      rule,
    };
  });

  const latestStop = channelRows.reduce(
    (latest, row) => (row.stopBy > latest ? row.stopBy : latest),
    requestDate,
  );

  const confirmBy =
    law.confirmMonths > 0 ? addCalendarMonths(requestDate, law.confirmMonths) : null;

  const subject = `Objection to direct marketing — ${name}`;

  const bodyLines = [
    `Dear ${org},`,
    "",
    `I object to the processing of my personal data for direct marketing purposes, under ${law.right}.`,
    `Please stop sending me marketing on the following channels, using these details:`,
    ...channelRows.map(
      (row) => `- ${row.label}: ${row.identifier || "(please match on my account record)"}`,
    ),
    "",
    handlingChoice.id === "suppress"
      ? "Please add these details to your suppression list rather than deleting them, so that a future data import or list purchase cannot put me back on a campaign."
      : "Please erase my marketing record entirely. I understand this means you will hold nothing to check future imports against.",
    keepServiceMessages
      ? "This objection covers marketing only. You may continue to send genuine service messages such as order confirmations, delivery updates, security alerts and statutory notices."
      : "This objection covers all non-essential contact.",
    notifyPartners
      ? "If you have shared my details with any other organisation for marketing purposes, please tell me who they are and pass this objection on to them."
      : "",
    "",
    law.stopRule === "immediate"
      ? `Article 21(3) requires you to stop processing for direct marketing as soon as you receive this, with no grace period. There is no balancing exercise and no fee.`
      : law.stopRule === "business-days"
        ? `CAN-SPAM gives you ${CAN_SPAM_BUSINESS_DAYS} business days from receipt to stop, so I expect no further marketing after ${latestStop}. The opt-out mechanism in your messages must also remain functional for at least ${CAN_SPAM_MECHANISM_DAYS} days after each message is sent.`
        : `Please register this preference so it takes effect within ${TRAI_PREFERENCE_DAYS} days, by ${latestStop}. I have also recorded my preference through 1909.`,
    confirmBy
      ? `Please confirm in writing what you have done by ${confirmBy}, as required by Article 12(3).`
      : "Please confirm in writing what you have done.",
    "",
    `Sent on ${requestDate}.`,
    "",
    "Yours faithfully,",
    name,
  ].filter((line, index, all) => line !== "" || (all[index - 1] !== "" && all[index - 1] !== undefined));

  const warnings = [];
  const missing = channelRows.filter((row) => !row.identifier);
  if (missing.length > 0) {
    warnings.push(
      `You have not supplied the ${Array.from(new Set(missing.map((row) => row.identifierKind))).join(" or ")} the marketing is sent to. Without it the sender may not be able to match your record, which gives it a reason to delay.`,
    );
  }
  if (handlingChoice.id === "erase") {
    warnings.push(
      "Asking for total erasure can undo the opt-out. Regulators including the ICO expect a sender to keep a minimal suppression record precisely so an objector is not re-added when a new list is imported. Suppression is usually the stronger choice.",
    );
  }
  if (!keepServiceMessages) {
    warnings.push(
      "Blocking all contact may also stop order confirmations, delivery notices, safety recalls and statutory communications, which the sender may be legally obliged to send.",
    );
  }
  if (law.stopRule === "business-days") {
    warnings.push(
      `The ${CAN_SPAM_BUSINESS_DAYS}-business-day date is calculated skipping weekends only. Public holidays are not counted, so the lawful deadline may fall a day or two later than ${latestStop}.`,
    );
  }
  if (law.id === "india" && selected.some((item) => ["sms", "phone", "whatsapp"].includes(item.id))) {
    warnings.push(
      "Register your preference on 1909 or the DND app as well as writing to the sender. A registered preference binds every registered sender, not just this one.",
    );
  }
  if (law.stopRule === "immediate") {
    warnings.push(
      "Keep proof of the date you sent this. If marketing continues afterwards, the breach of Article 21(3) is easiest to evidence when you can show exactly when the objection was received.",
    );
  }

  return {
    subject,
    bodyLines,
    letter: bodyLines.join("\n"),
    channelRows,
    latestStop,
    confirmBy,
    warnings,
    regimeLabel: law.label,
    right: law.right,
    handlingLabel: handlingChoice.label,
    stats: {
      channelCount: channelRows.length,
      channelsMissingIdentifier: missing.length,
      warningCount: warnings.length,
    },
  };
}
