/**
 * Utility Transfer Request Generator.
 *
 * Transferring an electricity, gas, water or broadband connection into a new
 * name fails on paperwork far more often than on policy. This module holds the
 * documents each utility asks for, the statutory timeline where one exists,
 * and the letter that goes with them.
 *
 * Rules encoded:
 *  - Electricity Act 2003, Section 43: a distribution licensee has a duty to
 *    supply on application and must give supply within one month of receiving
 *    the application.
 *  - Electricity (Rights of Consumers) Rules, 2020, Rule 4(3): the maximum
 *    time for a new connection or for modification of an existing connection —
 *    which is how a change of name on a connection is processed — is 7 days in
 *    metropolitan areas, 15 days in other municipal areas and 30 days in rural
 *    areas. State supply codes may prescribe shorter periods; they cannot
 *    prescribe longer ones. These are AREA_TYPES below.
 *  - Electricity Act 2003, Section 56: arrears on the connection follow the
 *    supply, which is why a no-dues certificate or the last paid bill from the
 *    outgoing consumer is on every electricity checklist. Section 56(2) also
 *    bars recovery of a sum not shown as continuously due for more than two
 *    years, which is worth knowing when old arrears surface at transfer.
 *  - Domestic LPG: a cylinder connection is not transferred between people
 *    directly. The outgoing consumer surrenders the connection and receives a
 *    Termination Voucher from the distributor; the incoming consumer applies
 *    with that voucher plus KYC. That is why the LPG checklist looks different.
 *  - Piped gas, municipal water and broadband have no single national
 *    timeline, so the request uses the period you specify and cites the
 *    provider's own citizen charter.
 *
 * Informational only — confirm the current forms, fees and deposits with the
 * utility concerned.
 */

/** Free-text field cap. */
const MAX_FIELD = 140;
/** Range of days a non-statutory request may reasonably ask for. */
const MIN_REQUEST_DAYS = 3;
const MAX_REQUEST_DAYS = 90;

const MS_PER_DAY = 86400000;

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
 * Maximum time for a new connection or modification of an existing connection
 * under Rule 4(3) of the Electricity (Rights of Consumers) Rules, 2020.
 */
export const AREA_TYPES = [
  { id: "metro", label: "Metropolitan area", prescribedDays: 7 },
  { id: "municipal", label: "Other municipal area", prescribedDays: 15 },
  { id: "rural", label: "Rural area", prescribedDays: 30 },
];

/** Documents referenced by the checklists. */
export const DOCUMENTS = {
  form: "Utility's own transfer / name-change application form, signed",
  lastBill: "Last paid bill for the connection",
  noDues: "No-dues certificate or paid receipt from the outgoing consumer",
  nocPrevious: "No-objection letter from the outgoing consumer or owner",
  idProof: "Photo ID of the incoming consumer (Aadhaar / passport / voter ID)",
  addressProof: "Address proof for the premises",
  saleDeed: "Registered sale deed or allotment letter",
  rentAgreement: "Registered leave-and-licence or rent agreement",
  ownerNoc: "Owner's no-objection letter for the tenancy",
  deathCert: "Death certificate of the recorded consumer",
  heirProof: "Legal heir certificate, succession certificate or registered will",
  taxReceipt: "Latest municipal property tax receipt",
  indemnity: "Indemnity bond on stamp paper, where the utility requires one",
  depositReceipt: "Original security deposit receipt, if available",
  meterReading: "Joint meter reading recorded on the handover date",
  terminationVoucher: "Termination Voucher from the outgoing consumer's distributor",
  photos: "Passport-size photographs of the incoming consumer",
};

/** The utilities this tool drafts for. */
export const UTILITIES = [
  {
    id: "electricity",
    label: "Electricity connection",
    addressee: "The Executive Engineer / Nodal Officer (Consumer Services)",
    statutory: true,
    basis:
      "Section 43 of the Electricity Act 2003 obliges the licensee to supply on application, and Rule 4(3) of the Electricity (Rights of Consumers) Rules, 2020 caps the time for a new connection or a modification of an existing connection.",
    docs: ["form", "lastBill", "noDues", "nocPrevious", "idProof", "meterReading", "indemnity", "depositReceipt"],
    extra:
      "Ask for the security deposit to be reassessed and either transferred or refunded to the outgoing consumer, and record a joint meter reading so the two consumers' liabilities are cleanly separated.",
    letterAsk:
      "I request that a joint meter reading be recorded on the date of transfer so that the liability of the outgoing consumer and my own are cleanly separated, and that the security deposit be reassessed and either transferred to my account or refunded to the outgoing consumer.",
  },
  {
    id: "piped-gas",
    label: "Piped natural gas (PNG)",
    addressee: "The Customer Service Manager",
    statutory: false,
    basis:
      "City gas distribution companies process a change of name under their own registration terms and citizen charter; there is no single national timeline.",
    docs: ["form", "lastBill", "noDues", "nocPrevious", "idProof", "addressProof", "depositReceipt", "meterReading"],
    extra:
      "Request a joint meter reading on the handover date and confirmation in writing that the security deposit has been transferred or refunded.",
    letterAsk:
      "I request that a joint meter reading be recorded on the date of transfer and that written confirmation be issued of how the existing security deposit has been dealt with.",
  },
  {
    id: "lpg",
    label: "Domestic LPG (cylinder) connection",
    addressee: "The Distributor",
    statutory: false,
    basis:
      "A domestic LPG connection is not transferred person to person. The outgoing consumer surrenders it and receives a Termination Voucher, against which the incoming consumer takes a fresh connection.",
    docs: ["form", "terminationVoucher", "idProof", "addressProof", "photos"],
    extra:
      "The cylinder and regulator are returned against the Termination Voucher and the outgoing consumer's deposit is refunded on it, so collect the voucher before the outgoing consumer moves out.",
    letterAsk:
      "I request that the connection be released against the enclosed Termination Voucher, and that the cylinder, regulator and Subscription Voucher be issued in my name at the above address.",
  },
  {
    id: "water",
    label: "Municipal water connection",
    addressee: "The Assistant Engineer (Water Works), Ward Office",
    statutory: false,
    basis:
      "Water connections are transferred by the municipal corporation under its own bye-laws, normally alongside the property tax record.",
    docs: ["form", "taxReceipt", "lastBill", "noDues", "nocPrevious", "idProof", "indemnity"],
    extra:
      "Get the property tax record updated in the same visit — most corporations will not transfer the water connection while the tax record shows a different name.",
    letterAsk:
      "I request that the connection be recorded in my name and that the corresponding entry in the property tax record be updated in the same proceeding, and that any outstanding charges be intimated to me in writing.",
  },
  {
    id: "broadband",
    label: "Broadband / DTH account",
    addressee: "The Nodal Officer, Customer Care",
    statutory: false,
    basis:
      "Handled under the service provider's own terms of service; a change of name is usually processed as a re-KYC on the existing account.",
    docs: ["form", "lastBill", "nocPrevious", "idProof", "addressProof"],
    extra:
      "Ask for the transfer to be effective from the start of a billing cycle so the outgoing and incoming consumers are not billed for the same period.",
    letterAsk:
      "I request that the change of name take effect from the start of the next billing cycle so that the outgoing consumer and I are not billed for the same period, and that a revised bill be raised accordingly.",
  },
];

/**
 * Why the connection is changing hands. Each reason adds its own proof of
 * title or occupancy to the checklist.
 */
export const TRANSFER_REASONS = [
  {
    id: "purchase",
    label: "Bought the property",
    docs: ["saleDeed"],
    phrase: "I have purchased the above premises and the connection stands in the name of the previous owner",
  },
  {
    id: "tenancy",
    label: "Moved in as a tenant",
    docs: ["rentAgreement", "ownerNoc"],
    phrase: "I have taken the above premises on leave and licence and the connection stands in the name of the owner",
  },
  {
    id: "tenant-out",
    label: "Tenant left, back to the owner",
    docs: ["saleDeed"],
    phrase: "I own the above premises, the tenant in whose name the connection stands has vacated, and the connection has to revert to me",
  },
  {
    id: "inheritance",
    label: "Inherited the property",
    docs: ["deathCert", "heirProof"],
    phrase: "The recorded consumer has passed away and I have succeeded to the above premises",
  },
  {
    id: "family",
    label: "Transfer within the family",
    docs: ["saleDeed"],
    phrase: "The connection stands in the name of a family member and is to be recorded in my name",
  },
];

function clean(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

/**
 * Parse yyyy-mm-dd into a UTC-midnight timestamp, or null.
 * @param {string} iso
 * @returns {number|null}
 */
export function parseIsoDate(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso ?? "").trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const stamp = Date.UTC(year, month - 1, day);
  const check = new Date(stamp);
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    return null;
  }
  return stamp;
}

function formatStamp(stamp) {
  const date = new Date(stamp);
  return `${date.getUTCDate()} ${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/**
 * The full document list for a utility and reason, in checklist order.
 * @param {string} utilityId
 * @param {string} reasonId
 * @returns {{id:string, label:string}[]}
 */
export function requiredDocuments(utilityId, reasonId) {
  const utility = UTILITIES.find((u) => u.id === utilityId);
  const reason = TRANSFER_REASONS.find((r) => r.id === reasonId);
  if (!utility || !reason) return [];
  const ids = [...utility.docs];
  reason.docs.forEach((id) => {
    if (!ids.includes(id)) ids.push(id);
  });
  return ids.filter((id) => DOCUMENTS[id]).map((id) => ({ id, label: DOCUMENTS[id] }));
}

/**
 * Build the transfer application.
 *
 * For electricity the timeline is the statutory cap for the area under
 * Rule 4(3); for the other utilities it is the period you ask for.
 *
 * @param {object} input
 * @param {string} input.utilityId       One of UTILITIES ids.
 * @param {string} input.reasonId        One of TRANSFER_REASONS ids.
 * @param {string} input.areaTypeId      One of AREA_TYPES ids.
 * @param {string} input.applicationDate yyyy-mm-dd.
 * @param {number} input.requestedDays   Days asked for where no statutory cap applies.
 * @param {string[]} input.readyDocIds   Document ids already in hand.
 * @param {string} input.applicantName   Incoming consumer.
 * @param {string} input.outgoingName    Consumer currently on record.
 * @param {string} input.consumerNumber  Consumer / CA / K number.
 * @param {string} input.premises        Address of the premises.
 * @param {string} input.providerName    Name of the utility company or office.
 * @returns {object|{error:string}}
 */
export function buildUtilityTransfer({
  utilityId,
  reasonId,
  areaTypeId = "municipal",
  applicationDate,
  requestedDays = 15,
  readyDocIds = [],
  applicantName,
  outgoingName,
  consumerNumber,
  premises,
  providerName,
}) {
  const utility = UTILITIES.find((u) => u.id === utilityId);
  const reason = TRANSFER_REASONS.find((r) => r.id === reasonId);
  const area = AREA_TYPES.find((a) => a.id === areaTypeId);
  if (!utility || !reason || !area) {
    return { error: "Choose the utility, the reason for the transfer and the type of area." };
  }
  if (!Array.isArray(readyDocIds)) {
    return { error: "Documents in hand must be given as a list." };
  }

  const applicant = clean(applicantName);
  const outgoing = clean(outgoingName);
  const consumer = clean(consumerNumber);
  const address = clean(premises);
  const provider = clean(providerName);
  if (!applicant) return { error: "Enter the name of the incoming consumer." };
  if (!outgoing) return { error: "Enter the name the connection currently stands in." };
  if (!consumer) return { error: "Enter the consumer number printed on the bill." };
  if (!address) return { error: "Enter the address of the premises." };
  if (!provider) return { error: "Enter the name of the utility company or office." };
  if ([applicant, outgoing, consumer, address, provider].some((v) => v.length > MAX_FIELD)) {
    return { error: `Keep each field under ${MAX_FIELD} characters.` };
  }

  const applied = parseIsoDate(applicationDate);
  if (applied === null) return { error: "Enter a valid application date." };

  let days;
  if (utility.statutory) {
    days = area.prescribedDays;
  } else {
    days = Number(requestedDays);
    if (!Number.isFinite(days) || !Number.isInteger(days) || days < MIN_REQUEST_DAYS || days > MAX_REQUEST_DAYS) {
      return { error: `Ask for completion in ${MIN_REQUEST_DAYS} to ${MAX_REQUEST_DAYS} days.` };
    }
  }

  const expected = applied + days * MS_PER_DAY;

  const docs = requiredDocuments(utilityId, reasonId);
  const ready = docs.filter((doc) => readyDocIds.includes(doc.id));
  const missing = docs.filter((doc) => !readyDocIds.includes(doc.id));
  const readinessPercent = docs.length === 0 ? 100 : Math.round((ready.length / docs.length) * 100);

  const warnings = [];
  if (missing.length > 0) {
    warnings.push(
      `${missing.length} of ${docs.length} documents are still missing. An application filed short of documents is normally returned, and the clock restarts when it is refiled.`,
    );
  }
  if (utility.id === "electricity" && !readyDocIds.includes("noDues")) {
    warnings.push(
      "Get the no-dues position in writing before the transfer. Under Section 56 of the Electricity Act 2003 arrears attach to the connection, so unpaid amounts can be demanded from you after the transfer.",
    );
  }
  if (utility.id === "lpg" && !readyDocIds.includes("terminationVoucher")) {
    warnings.push(
      "Without the Termination Voucher the distributor cannot issue a connection in your name — collect it from the outgoing consumer before they move.",
    );
  }

  const timelineSentence = utility.statutory
    ? `Under Rule 4(3) of the Electricity (Rights of Consumers) Rules, 2020, a modification of an existing connection in a ${area.label.toLowerCase()} is to be completed within ${days} days, and Section 43 of the Electricity Act 2003 obliges the licensee to act on an application for supply. I therefore request that the transfer be completed on or before ${formatStamp(expected)}.`
    : `I request that the transfer be completed within ${days} days of this application, that is on or before ${formatStamp(expected)}, in line with your published service standards.`;

  const enclosureSentence =
    ready.length === 0
      ? "The documents required for this transfer are being submitted with this application; a list is annexed."
      : `The following documents are enclosed with this application: ${ready.map((doc) => doc.label).join("; ")}.`;

  const letter = [
    `Date: ${formatStamp(applied)}`,
    "",
    "To,",
    `${utility.addressee},`,
    provider,
    "",
    `Subject: Application for transfer of ${utility.label.toLowerCase()} bearing Consumer No. ${consumer} from ${outgoing} to ${applicant}`,
    "",
    "Dear Sir / Madam,",
    "",
    `I, ${applicant}, request that the ${utility.label.toLowerCase()} bearing Consumer No. ${consumer} at ${address} be transferred into my name. ${reason.phrase}, ${outgoing}.`,
    "",
    enclosureSentence,
    "",
    timelineSentence,
    "",
    utility.letterAsk,
    "",
    "I undertake to pay any charges, revised deposit or transfer fee assessed, and to comply with the conditions of supply applicable to the connection.",
    "",
    "Kindly acknowledge this application and issue a written confirmation once the transfer is effected.",
    "",
    "Yours faithfully,",
    "",
    applicant,
    address,
    `Consumer No. ${consumer}`,
  ].join("\n");

  return {
    letter,
    days,
    statutory: utility.statutory,
    expectedByIso: new Date(expected).toISOString().slice(0, 10),
    expectedByLong: formatStamp(expected),
    documents: docs,
    readyCount: ready.length,
    missing: missing.map((doc) => doc.label),
    readinessPercent,
    basis: utility.basis,
    warnings,
  };
}
