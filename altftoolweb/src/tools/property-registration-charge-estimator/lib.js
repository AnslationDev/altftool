/**
 * Property registration cost estimator.
 *
 * The rules that drive the arithmetic:
 *
 *  - Stamp duty and the registration fee are charged on the CHARGEABLE VALUE,
 *    which is the higher of the consideration written in the deed and the
 *    government-notified value (circle rate, ready reckoner rate, guidance value
 *    or market value, depending on the state). Section 47-A of the Indian Stamp
 *    Act, 1899 as adopted by the states lets the registering officer refer an
 *    undervalued instrument for determination of the true market value.
 *  - Registration of a sale deed of immovable property worth more than Rs 100 is
 *    compulsory under section 17 of the Registration Act, 1908.
 *  - The registration fee is levied by the state and is commonly 1% of the
 *    chargeable value; several states cap it in rupees and a few use a different
 *    percentage altogether.
 *  - Some states add a cess or surcharge computed on the stamp duty (for example
 *    a labour cess), and others add a separate transfer duty computed on the
 *    value itself.
 *  - Scanning / document handling is charged per page of the deed.
 *  - Franking is one of the ways of paying stamp duty; the bank or franking
 *    agent's service charge is separate from the duty and is entered here as a
 *    percentage and/or a flat fee.
 *  - Section 194-IA of the Income-tax Act, 1961 requires the BUYER to deduct TDS
 *    at 1% of the higher of the consideration and the stamp duty value, but only
 *    where that value is Rs 50,00,000 or more. Agricultural land is excluded.
 *
 * The state rates below are indicative published figures for illustration; every
 * one of them is an editable input, because states revise them and district or
 * municipal-body add-ons vary. Confirm with the sub-registrar before paying.
 */

/** Section 194-IA threshold: no TDS below this value. */
export const TDS_194IA_THRESHOLD = 5000000;

/** Section 194-IA rate on the higher of consideration and stamp duty value. */
export const TDS_194IA_RATE_PERCENT = 1;

/**
 * Indicative state presets. Percentages are of the chargeable value unless the
 * field name says otherwise. `registrationCap` of null means no rupee cap.
 */
export const STATE_PRESETS = [
  {
    id: "maharashtra",
    name: "Maharashtra (Mumbai)",
    stampDutyPercent: 6,
    registrationPercent: 1,
    registrationCap: 30000,
    cessPercentOfStampDuty: 0,
    transferDutyPercent: 0,
    scanningPerPage: 20,
    note: "5% stamp duty plus 1% metro cess in Mumbai, Pune, Nagpur, Thane and Nashik. Registration fee is capped at Rs 30,000.",
  },
  {
    id: "delhi",
    name: "Delhi",
    stampDutyPercent: 6,
    registrationPercent: 1,
    registrationCap: null,
    cessPercentOfStampDuty: 0,
    transferDutyPercent: 0,
    scanningPerPage: 0,
    note: "6% where the buyer is male, 4% for a sole female buyer and 5% for a joint male-female purchase.",
  },
  {
    id: "karnataka",
    name: "Karnataka",
    stampDutyPercent: 5,
    registrationPercent: 1,
    registrationCap: null,
    cessPercentOfStampDuty: 12,
    transferDutyPercent: 0,
    scanningPerPage: 0,
    note: "5% above Rs 45 lakh, with a 10% cess and a 2% urban surcharge computed on the stamp duty.",
  },
  {
    id: "tamil-nadu",
    name: "Tamil Nadu",
    stampDutyPercent: 7,
    registrationPercent: 4,
    registrationCap: null,
    cessPercentOfStampDuty: 0,
    transferDutyPercent: 0,
    scanningPerPage: 0,
    note: "One of the few states where the registration fee is well above 1%.",
  },
  {
    id: "telangana",
    name: "Telangana",
    stampDutyPercent: 4,
    registrationPercent: 0.5,
    registrationCap: null,
    cessPercentOfStampDuty: 0,
    transferDutyPercent: 1.5,
    scanningPerPage: 0,
    note: "4% stamp duty, 1.5% transfer duty and 0.5% registration fee on a sale deed.",
  },
  {
    id: "uttar-pradesh",
    name: "Uttar Pradesh",
    stampDutyPercent: 7,
    registrationPercent: 1,
    registrationCap: null,
    cessPercentOfStampDuty: 0,
    transferDutyPercent: 0,
    scanningPerPage: 0,
    note: "A rebate is available where the buyer is a woman, subject to a value limit.",
  },
  {
    id: "gujarat",
    name: "Gujarat",
    stampDutyPercent: 4.9,
    registrationPercent: 1,
    registrationCap: null,
    cessPercentOfStampDuty: 0,
    transferDutyPercent: 0,
    scanningPerPage: 0,
    note: "3.5% basic duty with a 40% surcharge gives the effective 4.9%. Sole female buyers are exempt from the registration fee.",
  },
  {
    id: "west-bengal",
    name: "West Bengal",
    stampDutyPercent: 5,
    registrationPercent: 1,
    registrationCap: null,
    cessPercentOfStampDuty: 0,
    transferDutyPercent: 0,
    scanningPerPage: 0,
    note: "Higher slabs apply above Rs 1 crore and in specified urban areas.",
  },
  {
    id: "rajasthan",
    name: "Rajasthan",
    stampDutyPercent: 6,
    registrationPercent: 1,
    registrationCap: null,
    cessPercentOfStampDuty: 20,
    transferDutyPercent: 0,
    scanningPerPage: 0,
    note: "A 20% labour cess is charged on the stamp duty. Female buyers pay a lower duty rate.",
  },
  {
    id: "haryana",
    name: "Haryana",
    stampDutyPercent: 7,
    registrationPercent: 1,
    registrationCap: 50000,
    cessPercentOfStampDuty: 0,
    transferDutyPercent: 0,
    scanningPerPage: 0,
    note: "Urban rate for a male buyer; the registration fee is capped in rupees.",
  },
  {
    id: "custom",
    name: "Other state — enter my own rates",
    stampDutyPercent: 5,
    registrationPercent: 1,
    registrationCap: null,
    cessPercentOfStampDuty: 0,
    transferDutyPercent: 0,
    scanningPerPage: 0,
    note: "Take the rates from your state's stamp and registration department website.",
  },
];

/** Upper sanity bound on a property value. */
const MAX_VALUE = 1e12;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Look up a state preset by id.
 * @param {string} id
 */
export function presetById(id) {
  return STATE_PRESETS.find((entry) => entry.id === id) || STATE_PRESETS[0];
}

/**
 * Estimate the full cost of registering a property transfer.
 *
 * @param {object} input
 * @param {number} input.considerationValue price written in the deed
 * @param {number} [input.circleRateValue] government notified value
 * @param {number} input.stampDutyPercent
 * @param {number} [input.cessPercentOfStampDuty] cess computed on the stamp duty
 * @param {number} [input.transferDutyPercent] separate duty on the value
 * @param {number} input.registrationPercent
 * @param {number|null} [input.registrationCap] rupee cap, null for none
 * @param {number} [input.pages] pages in the deed
 * @param {number} [input.scanningPerPage]
 * @param {number} [input.frankingPercent] franking agent charge on the value
 * @param {number} [input.frankingFlat] flat franking or e-stamping service fee
 * @param {number} [input.documentHandlingCharge] flat DHC / pasting charge
 * @param {number} [input.legalFee] advocate or deed-writer fee
 * @param {boolean} [input.agriculturalLand] excluded from section 194-IA
 * @returns {object} breakdown, or { error } when the input is unusable
 */
export function estimateRegistrationCost({
  considerationValue,
  circleRateValue = 0,
  stampDutyPercent,
  cessPercentOfStampDuty = 0,
  transferDutyPercent = 0,
  registrationPercent,
  registrationCap = null,
  pages = 0,
  scanningPerPage = 0,
  frankingPercent = 0,
  frankingFlat = 0,
  documentHandlingCharge = 0,
  legalFee = 0,
  agriculturalLand = false,
} = {}) {
  const numbers = [
    considerationValue,
    circleRateValue,
    stampDutyPercent,
    cessPercentOfStampDuty,
    transferDutyPercent,
    registrationPercent,
    pages,
    scanningPerPage,
    frankingPercent,
    frankingFlat,
    documentHandlingCharge,
    legalFee,
  ];
  if (!numbers.every(isNum)) {
    return { error: "Enter a valid number in every field." };
  }
  if (numbers.some((value) => value < 0)) {
    return { error: "Values, rates and charges cannot be negative." };
  }
  if (considerationValue <= 0) {
    return { error: "Enter the agreement value of the property." };
  }
  if (considerationValue > MAX_VALUE || circleRateValue > MAX_VALUE) {
    return { error: "Enter a property value below Rs 1 lakh crore." };
  }
  if (stampDutyPercent > 20 || registrationPercent > 20 || transferDutyPercent > 20) {
    return { error: "Stamp duty, transfer duty and registration fee rates should be 20% or less." };
  }
  if (cessPercentOfStampDuty > 100) {
    return { error: "A cess above 100% of the stamp duty is not realistic." };
  }
  if (frankingPercent > 5) {
    return { error: "Franking service charge should be 5% or less." };
  }
  if (pages > 5000) {
    return { error: "Enter a page count of 5,000 or less." };
  }
  if (registrationCap !== null && (!isNum(registrationCap) || registrationCap < 0)) {
    return { error: "The registration fee cap must be zero or more." };
  }

  const chargeableValue = Math.max(considerationValue, circleRateValue);
  const usesCircleRate = circleRateValue > considerationValue;

  const stampDuty = (chargeableValue * stampDutyPercent) / 100;
  const cess = (stampDuty * cessPercentOfStampDuty) / 100;
  const transferDuty = (chargeableValue * transferDutyPercent) / 100;

  const registrationBeforeCap = (chargeableValue * registrationPercent) / 100;
  const registrationFee =
    registrationCap === null ? registrationBeforeCap : Math.min(registrationBeforeCap, registrationCap);
  const registrationCapped = registrationCap !== null && registrationBeforeCap > registrationCap;

  const scanningCharge = pages * scanningPerPage;
  const frankingCharge = (chargeableValue * frankingPercent) / 100 + frankingFlat;

  const statutoryCharges = stampDuty + cess + transferDuty + registrationFee;
  const incidentalCharges = scanningCharge + frankingCharge + documentHandlingCharge + legalFee;
  const totalCharges = statutoryCharges + incidentalCharges;

  const tdsApplies = !agriculturalLand && chargeableValue >= TDS_194IA_THRESHOLD;
  const tds194ia = tdsApplies ? (chargeableValue * TDS_194IA_RATE_PERCENT) / 100 : 0;

  return {
    considerationValue,
    circleRateValue,
    chargeableValue,
    usesCircleRate,

    stampDutyPercent,
    stampDuty,
    cessPercentOfStampDuty,
    cess,
    transferDutyPercent,
    transferDuty,

    registrationPercent,
    registrationBeforeCap,
    registrationFee,
    registrationCap,
    registrationCapped,

    pages,
    scanningPerPage,
    scanningCharge,
    frankingCharge,
    documentHandlingCharge,
    legalFee,

    statutoryCharges,
    incidentalCharges,
    totalCharges,
    /** Total charges as a percentage of the chargeable value. */
    totalChargesPercent: chargeableValue > 0 ? (totalCharges / chargeableValue) * 100 : 0,
    /** Consideration plus every charge — the cash the buyer must arrange. */
    allInCost: considerationValue + totalCharges,

    tdsApplies,
    tds194ia,
    tdsThreshold: TDS_194IA_THRESHOLD,
    /**
     * Amount actually paid to the seller after the buyer withholds TDS.
     * TDS is computed on the chargeable value (the higher of consideration
     * and circle rate), which can exceed the consideration itself when the
     * circle rate is far above the agreement value — floor at zero so a
     * buyer is never shown as owing the seller a negative amount.
     */
    netToSeller: Math.max(0, considerationValue - tds194ia),

    lineItems: [
      { label: "Stamp duty", amount: stampDuty },
      { label: "Cess / surcharge on stamp duty", amount: cess },
      { label: "Transfer duty", amount: transferDuty },
      { label: "Registration fee", amount: registrationFee },
      { label: "Scanning / document handling per page", amount: scanningCharge },
      { label: "Franking or e-stamping service charge", amount: frankingCharge },
      { label: "Document handling / pasting charge", amount: documentHandlingCharge },
      { label: "Advocate or deed-writer fee", amount: legalFee },
    ].filter((row) => row.amount > 0),
  };
}
