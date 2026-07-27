/**
 * Cost of putting a residential rent agreement in place in India.
 *
 * Three separate charges make up the bill:
 *   stamp duty  — a percentage of a "consideration" figure defined by state stamp law,
 *   registration fee — flat or a percentage, charged by the sub-registrar,
 *   brokerage — usually quoted in months of rent, plus GST on the agent's service.
 *
 * The consideration base differs by state, which is why each preset carries its own
 * `base` key rather than a single hard-coded formula.
 */

/** GST on a real-estate agent's commission (SAC 997222) is 18%. */
export const GST_ON_BROKERAGE_PERCENT = 18;

/**
 * Maharashtra values a refundable security deposit at 10% a year of notional
 * interest when computing stamp duty on a leave and licence agreement
 * (Article 36A, Schedule I, Maharashtra Stamp Act).
 */
export const MH_DEPOSIT_NOTIONAL_INTEREST_PERCENT = 10;

/** Rent agreements longer than this are lease deeds priced on a different article. */
export const MAX_TERM_MONTHS = 360;

/**
 * How each preset builds the amount that stamp duty is charged on.
 *   totalRent            — rent for the whole term
 *   averageAnnualRent    — rent for the whole term scaled to one year
 *   totalRentPlusDeposit — rent for the whole term plus every deposit
 *   mhLeaveLicence       — total rent + non-refundable deposit + notional interest
 */
export const CONSIDERATION_BASES = [
  "totalRent",
  "averageAnnualRent",
  "totalRentPlusDeposit",
  "mhLeaveLicence",
];

/**
 * Commonly applied state rates. These are the published headline rates for a
 * residential agreement; districts and sub-registrars can add small handling or
 * scanning charges, so every value stays editable in the interface.
 */
export const STATE_PRESETS = [
  {
    id: "maharashtra",
    label: "Maharashtra (leave & licence)",
    base: "mhLeaveLicence",
    stampPercent: 0.25,
    registrationMode: "flat",
    registrationUrban: 1000,
    registrationRural: 500,
    registrationPercent: 0,
    note: "Article 36A of the Maharashtra Stamp Act charges 0.25% of total rent, plus any non-refundable deposit, plus 10% a year of notional interest on the refundable deposit. Registration is Rs 1,000 inside a municipal corporation and Rs 500 outside it.",
  },
  {
    id: "delhi",
    label: "Delhi",
    base: "averageAnnualRent",
    stampPercent: 2,
    registrationMode: "percent",
    registrationUrban: 0,
    registrationRural: 0,
    registrationPercent: 1.1,
    note: "Delhi charges 2% of the average annual rent as stamp duty on leases of up to five years. Registration, which is optional below one year but advisable, costs about 1.1% of the average annual rent.",
  },
  {
    id: "karnataka",
    label: "Karnataka",
    base: "totalRentPlusDeposit",
    stampPercent: 0.5,
    registrationMode: "percent",
    registrationUrban: 0,
    registrationRural: 0,
    registrationPercent: 1,
    note: "Karnataka charges 0.5% of total rent plus deposit on an agreement of up to 11 months, with a registration fee of about 1% of the same amount.",
  },
  {
    id: "tamilnadu",
    label: "Tamil Nadu",
    base: "totalRentPlusDeposit",
    stampPercent: 1,
    registrationMode: "percent",
    registrationUrban: 0,
    registrationRural: 0,
    registrationPercent: 1,
    note: "Tamil Nadu charges 1% of rent plus advance on a lease below 30 years, with a registration fee of about 1% of the same amount.",
  },
  {
    id: "custom",
    label: "Other state — enter my own rates",
    base: "totalRent",
    stampPercent: 1,
    registrationMode: "percent",
    registrationUrban: 0,
    registrationRural: 0,
    registrationPercent: 1,
    note: "Check the stamp duty article and registration fee published by your state's registration department, then enter them here.",
  },
];

export function getPreset(id) {
  return STATE_PRESETS.find((preset) => preset.id === id) || STATE_PRESETS[0];
}

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** The amount stamp duty is charged on, for a given base rule. */
export function considerationAmount({
  base,
  monthlyRent,
  termMonths,
  refundableDeposit,
  nonRefundableDeposit,
}) {
  const totalRent = monthlyRent * termMonths;
  const years = termMonths / 12;
  switch (base) {
    case "averageAnnualRent":
      return years > 0 ? totalRent / years : 0;
    case "totalRentPlusDeposit":
      return totalRent + refundableDeposit + nonRefundableDeposit;
    case "mhLeaveLicence":
      return (
        totalRent +
        nonRefundableDeposit +
        (refundableDeposit * MH_DEPOSIT_NOTIONAL_INTEREST_PERCENT * years) / 100
      );
    case "totalRent":
    default:
      return totalRent;
  }
}

/**
 * Full cost breakdown for a rent agreement.
 * Returns { error } when the input cannot produce a meaningful figure.
 */
export function computeAgreementCost({
  monthlyRent,
  termMonths,
  refundableDeposit = 0,
  nonRefundableDeposit = 0,
  advanceRentMonths = 1,
  base = "totalRent",
  stampPercent,
  registrationMode = "percent",
  registrationPercent = 0,
  registrationFlat = 0,
  registerAgreement = true,
  brokerageMonths = 1,
  brokerageGstApplies = true,
  otherCharges = 0,
  statutorySharePercent = 50,
  brokerageSharePercent = 100,
}) {
  const numbers = [
    monthlyRent,
    termMonths,
    refundableDeposit,
    nonRefundableDeposit,
    advanceRentMonths,
    stampPercent,
    registrationPercent,
    registrationFlat,
    brokerageMonths,
    otherCharges,
    statutorySharePercent,
    brokerageSharePercent,
  ];
  if (numbers.some((value) => !isNum(value))) {
    return { error: "Enter a valid number in every field." };
  }
  if (monthlyRent <= 0) return { error: "Monthly rent must be greater than zero." };
  if (termMonths <= 0) return { error: "Agreement term must be at least one month." };
  if (termMonths > MAX_TERM_MONTHS) {
    return {
      error: `Terms beyond ${MAX_TERM_MONTHS} months are registered as lease deeds and are charged under a different stamp article.`,
    };
  }
  if (refundableDeposit < 0 || nonRefundableDeposit < 0 || otherCharges < 0) {
    return { error: "Deposits and other charges cannot be negative." };
  }
  if (advanceRentMonths < 0 || advanceRentMonths > termMonths) {
    return { error: "Advance rent must be between 0 months and the length of the agreement." };
  }
  if (stampPercent < 0 || stampPercent > 20) {
    return { error: "Stamp duty rate should be between 0% and 20% of the consideration." };
  }
  if (registrationPercent < 0 || registrationPercent > 20) {
    return { error: "Registration fee rate should be between 0% and 20%." };
  }
  if (registrationFlat < 0) return { error: "A flat registration fee cannot be negative." };
  if (brokerageMonths < 0 || brokerageMonths > 12) {
    return { error: "Brokerage is normally between 0 and 12 months of rent." };
  }
  if (
    statutorySharePercent < 0 ||
    statutorySharePercent > 100 ||
    brokerageSharePercent < 0 ||
    brokerageSharePercent > 100
  ) {
    return { error: "Your share of each cost must be between 0% and 100%." };
  }

  const totalRent = monthlyRent * termMonths;
  const consideration = considerationAmount({
    base,
    monthlyRent,
    termMonths,
    refundableDeposit,
    nonRefundableDeposit,
  });

  const stampDuty = (consideration * stampPercent) / 100;

  let registrationFee = 0;
  if (registerAgreement) {
    registrationFee =
      registrationMode === "flat" ? registrationFlat : (consideration * registrationPercent) / 100;
  }

  const brokerage = monthlyRent * brokerageMonths;
  const brokerageGst = brokerageGstApplies ? (brokerage * GST_ON_BROKERAGE_PERCENT) / 100 : 0;
  const brokerageTotal = brokerage + brokerageGst;

  const statutoryTotal = stampDuty + registrationFee;
  const transactionCost = statutoryTotal + brokerageTotal + otherCharges;

  const advanceRent = monthlyRent * advanceRentMonths;
  const yourStatutory = (statutoryTotal * statutorySharePercent) / 100;
  const yourBrokerage = (brokerageTotal * brokerageSharePercent) / 100;
  const yourPaperwork = yourStatutory + yourBrokerage + otherCharges;
  const upfrontCash = refundableDeposit + nonRefundableDeposit + advanceRent + yourPaperwork;

  return {
    totalRent,
    consideration,
    stampDuty,
    registrationFee,
    brokerage,
    brokerageGst,
    brokerageTotal,
    statutoryTotal,
    transactionCost,
    advanceRent,
    yourStatutory,
    yourBrokerage,
    yourPaperwork,
    upfrontCash,
    refundableDeposit,
    nonRefundableDeposit,
    costAsPercentOfRent: totalRent > 0 ? (transactionCost / totalRent) * 100 : 0,
    paperworkPerMonth: termMonths > 0 ? yourPaperwork / termMonths : 0,
  };
}
