/**
 * Marketing Consent Withdrawal Builder — drafts an opt-out message and works out the
 * date by which the company should have acted.
 *
 * Rules encoded
 * -------------
 * - EU/EEA (GDPR): Article 7(3) gives an absolute right to withdraw consent at any time,
 *   and Article 21(2)-(3) gives an unconditional right to object to processing for direct
 *   marketing, after which the data must no longer be processed for that purpose. The
 *   controller must inform you of the action taken within one calendar month under
 *   Article 12(3).
 * - UK: the same rights under the UK GDPR, with electronic marketing also covered by the
 *   Privacy and Electronic Communications Regulations. Complaints go to the ICO.
 * - India: section 6(6) of the DPDP Act 2023 lets a Data Principal withdraw consent at any
 *   time. For telemarketing, TRAI's commercial communication regulations run a separate
 *   preference register reached on 1909, and TRAI requires a registered preference to take
 *   effect within 7 days.
 * - United States: the CAN-SPAM Act requires a commercial email opt-out to be honoured
 *   within 10 business days, and the opt-out mechanism to keep working for at least 30 days
 *   after the message was sent. The FCC applies a comparable 10-business-day window to
 *   revoking consent for marketing calls and texts.
 *
 * Business-day arithmetic skips Saturdays and Sundays only; public holidays are not
 * modelled, so treat the date as the earliest the deadline can fall.
 */

/** CAN-SPAM / FCC opt-out window, in business days. */
export const US_OPT_OUT_BUSINESS_DAYS = 10;

/** CAN-SPAM requires the opt-out mechanism to work for at least this many days. */
export const US_OPT_OUT_MECHANISM_DAYS = 30;

/** TRAI: a registered preference takes effect within this many days. */
export const TRAI_PREFERENCE_DAYS = 7;

/** India's telecom preference short code. */
export const TRAI_SHORTCODE = "1909";

/** Practical follow-up window where no statutory deadline applies. */
export const GENERIC_FOLLOW_UP_DAYS = 30;

const MS_PER_DAY = 86400000;

export const CHANNELS = [
  { id: "email", label: "Email" },
  { id: "sms", label: "SMS / text reply" },
  { id: "call", label: "Phone call script" },
  { id: "letter", label: "Written letter" },
];

export const REGIMES = [
  {
    id: "gdpr",
    label: "EU / EEA (GDPR)",
    legalLine:
      "I withdraw my consent under Article 7(3) of the GDPR and object to the processing of my personal data for direct marketing under Article 21(2).",
    deadline: { type: "months", value: 1 },
    deadlineNote:
      "Marketing must stop as soon as you object; the controller has one calendar month to tell you what action it has taken.",
    escalation: "your national data protection supervisory authority",
  },
  {
    id: "uk",
    label: "United Kingdom (UK GDPR / PECR)",
    legalLine:
      "I withdraw my consent under Article 7(3) of the UK GDPR, object to direct marketing under Article 21(2), and withdraw any consent relied on under the Privacy and Electronic Communications Regulations.",
    deadline: { type: "months", value: 1 },
    deadlineNote:
      "Marketing must stop on receipt; you should be told what action was taken within one calendar month.",
    escalation: "the Information Commissioner's Office",
  },
  {
    id: "india",
    label: "India (DPDP Act / TRAI)",
    legalLine:
      "I withdraw my consent to the processing of my personal data for marketing purposes under section 6(6) of the Digital Personal Data Protection Act, 2023.",
    deadline: { type: "days", value: GENERIC_FOLLOW_UP_DAYS },
    deadlineNote: `Also register your preference with your telecom operator on ${TRAI_SHORTCODE}; TRAI requires a registered preference to take effect within ${TRAI_PREFERENCE_DAYS} days.`,
    escalation: "the company's grievance officer, and then the Data Protection Board of India",
  },
  {
    id: "us",
    label: "United States (CAN-SPAM / FCC)",
    legalLine:
      "I revoke any consent to receive marketing communications from you, and I am opting out of all commercial messages under the CAN-SPAM Act and the FCC's rules on marketing calls and texts.",
    deadline: { type: "business-days", value: US_OPT_OUT_BUSINESS_DAYS },
    deadlineNote: `An opt-out must be honoured within ${US_OPT_OUT_BUSINESS_DAYS} business days, and the opt-out mechanism must keep working for at least ${US_OPT_OUT_MECHANISM_DAYS} days after the message was sent.`,
    escalation: "the Federal Trade Commission, or the FCC for calls and texts",
  },
  {
    id: "other",
    label: "Elsewhere / not sure",
    legalLine:
      "I withdraw any consent I previously gave to receive marketing communications from you, and I ask you to stop using my details for marketing.",
    deadline: { type: "days", value: GENERIC_FOLLOW_UP_DAYS },
    deadlineNote: "No statutory clock is assumed — follow up in writing if nothing happens.",
    escalation: "the company's published complaints process, and any local consumer regulator",
  },
];

/** GSM 03.38 basic character set — one 7-bit unit each. */
const GSM7_BASIC =
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";

/** GSM 03.38 extension table — two 7-bit units each. */
const GSM7_EXTENDED = "^{}\\[~]|€";

/**
 * Count SMS units and segments the way a gateway bills them.
 * GSM-7: 160 units in a single message, 153 per part when concatenated.
 * UCS-2: 70 units in a single message, 67 per part when concatenated.
 */
export function countSms(text) {
  const value = String(text ?? "");
  let units = 0;
  let gsm = true;
  for (const char of value) {
    if (GSM7_BASIC.includes(char)) units += 1;
    else if (GSM7_EXTENDED.includes(char)) units += 2;
    else {
      gsm = false;
      break;
    }
  }
  if (!gsm) {
    // UCS-2 counts 16-bit code units, so an emoji outside the BMP costs two.
    units = value.length;
    const single = 70;
    const multi = 67;
    return {
      encoding: "UCS-2",
      units,
      segments: units === 0 ? 0 : units <= single ? 1 : Math.ceil(units / multi),
      singleLimit: single,
    };
  }
  const single = 160;
  const multi = 153;
  return {
    encoding: "GSM-7",
    units,
    segments: units === 0 ? 0 : units <= single ? 1 : Math.ceil(units / multi),
    singleLimit: single,
  };
}

function parseDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return NaN;
  const [y, m, d] = value.split("-").map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return NaN;
  const ts = Date.UTC(y, m - 1, d);
  const back = new Date(ts);
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== m - 1 || back.getUTCDate() !== d) {
    return NaN;
  }
  return ts;
}

function toIso(ts) {
  return new Date(ts).toISOString().slice(0, 10);
}

/** Add calendar months, rolling an impossible date back to the last day of the month. */
export function addMonths(ts, months) {
  const d = new Date(ts);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth() + months;
  const day = d.getUTCDate();
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return Date.UTC(year, month, Math.min(day, lastDay));
}

/** Add whole business days, skipping Saturdays and Sundays. Public holidays are not modelled. */
export function addBusinessDays(ts, days) {
  let cursor = ts;
  let left = days;
  while (left > 0) {
    cursor += MS_PER_DAY;
    const day = new Date(cursor).getUTCDay();
    if (day !== 0 && day !== 6) left -= 1;
  }
  return cursor;
}

function deadlineFor(regime, sentTs) {
  if (regime.deadline.type === "months") return addMonths(sentTs, regime.deadline.value);
  if (regime.deadline.type === "business-days") return addBusinessDays(sentTs, regime.deadline.value);
  return sentTs + regime.deadline.value * MS_PER_DAY;
}

function deadlineLabel(regime) {
  if (regime.deadline.type === "months") {
    return `${regime.deadline.value} calendar month${regime.deadline.value === 1 ? "" : "s"}`;
  }
  if (regime.deadline.type === "business-days") return `${regime.deadline.value} business days`;
  return `${regime.deadline.value} days`;
}

/**
 * Build the withdrawal message.
 * @param {{channel:string, regime:string, fullName:string, contact:string, company:string,
 *          accountRef:string, sentOn:string, includeThirdParties:boolean,
 *          requestConfirmation:boolean, alsoErase:boolean}} input
 */
export function buildWithdrawal({
  channel,
  regime,
  fullName,
  contact,
  company,
  accountRef = "",
  sentOn,
  includeThirdParties = true,
  requestConfirmation = true,
  alsoErase = false,
} = {}) {
  const ch = CHANNELS.find((option) => option.id === channel);
  if (!ch) return { error: "Choose how you are sending the withdrawal." };

  const reg = REGIMES.find((option) => option.id === regime);
  if (!reg) return { error: "Choose which rules apply where you live." };

  const name = String(fullName ?? "").trim();
  if (!name) return { error: "Enter the name the company has on file for you." };

  const contactValue = String(contact ?? "").trim();
  if (!contactValue) {
    return { error: "Enter the email address or phone number they are contacting you on." };
  }

  const companyName = String(company ?? "").trim();
  if (!companyName) return { error: "Enter the company name." };

  const sentTs = parseDate(sentOn);
  if (Number.isNaN(sentTs)) return { error: "Enter a valid date for when you are sending this." };

  const ref = String(accountRef ?? "").trim();
  const deadlineTs = deadlineFor(reg, sentTs);

  const identity = ref ? `${name} (${contactValue}, reference ${ref})` : `${name} (${contactValue})`;

  const asks = [
    `stop sending me marketing by email, SMS, phone, push notification and post`,
  ];
  if (includeThirdParties) {
    asks.push("tell any partners or agencies you shared my details with to do the same");
  }
  if (alsoErase) {
    asks.push(
      "delete my details from your marketing lists, keeping only the minimum record needed to honour this opt-out",
    );
  }
  if (requestConfirmation) {
    asks.push("confirm in writing what you have done, and by when");
  }

  const askSentence = `Please ${asks.join("; ")}.`;

  let subject = "";
  let body = "";

  if (ch.id === "email") {
    subject = `Withdrawal of marketing consent — ${name}${ref ? ` (ref ${ref})` : ""}`;
    body = [
      `To: ${companyName}`,
      "",
      `I am ${identity}.`,
      "",
      reg.legalLine,
      "",
      askSentence,
      "",
      `This is not a request to close my account or to stop service messages I actually need; it applies to marketing only.`,
      "",
      `Sent on ${toIso(sentTs)}. I expect a reply by ${toIso(deadlineTs)}.`,
      "",
      name,
    ].join("\n");
  } else if (ch.id === "sms") {
    subject = "";
    body =
      `STOP. ${name} (${contactValue}). I withdraw consent to all marketing messages and calls from ${companyName}. ` +
      `${requestConfirmation ? "Please confirm in writing." : "Do not contact me for marketing again."}`;
  } else if (ch.id === "call") {
    subject = `Call script — ${companyName}`;
    body = [
      `1. "My name is ${name}. You have me on ${contactValue}${ref ? `, reference ${ref}` : ""}."`,
      `2. "I am withdrawing my consent to marketing. Please stop all marketing calls, texts, emails and post."`,
      includeThirdParties
        ? `3. "Please also pass that on to any partner or agency you shared my details with."`
        : `3. "Please make sure that applies across every list you hold."`,
      `4. "Can you give me a reference number for this request, and the name of the person I am speaking to?"`,
      `5. Note the date and time: ${toIso(sentTs)}. Expect the change to be in effect by ${toIso(deadlineTs)}.`,
      "",
      `If they push back: "${reg.legalLine}"`,
    ].join("\n");
  } else {
    subject = `Withdrawal of marketing consent — ${name}`;
    body = [
      toIso(sentTs),
      "",
      `Dear ${companyName},`,
      "",
      `I am ${identity}.`,
      "",
      reg.legalLine,
      "",
      askSentence,
      "",
      `Please reply in writing to the address above by ${toIso(deadlineTs)}.`,
      "",
      "Yours faithfully,",
      name,
    ].join("\n");
  }

  const sms = countSms(body);

  return {
    channel: ch.id,
    channelLabel: ch.label,
    regime: reg.id,
    regimeLabel: reg.label,
    subject,
    body,
    legalLine: reg.legalLine,
    deadlineNote: reg.deadlineNote,
    escalation: reg.escalation,
    sentOn: toIso(sentTs),
    deadlineOn: toIso(deadlineTs),
    deadlineLabel: deadlineLabel(reg),
    characters: body.length,
    smsUnits: sms.units,
    smsSegments: sms.segments,
    smsEncoding: sms.encoding,
    smsSingleLimit: sms.singleLimit,
    smsTooLong: ch.id === "sms" && sms.segments > 1,
  };
}
