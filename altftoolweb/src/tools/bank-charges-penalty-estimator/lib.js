/**
 * Annual cost of running an Indian savings account: minimum balance penalties,
 * excess ATM fees, return charges, card fees and GST.
 *
 * Sources for the rules and ceilings encoded here:
 *
 *  - RBI circular DBOD.No.Dir.BC.53/13.03.00/2014-15 dated 20 November 2014,
 *    "Levy of penal charges on non-maintenance of minimum balances in savings bank
 *    accounts": the bank must notify the customer, allow one month to restore the
 *    balance, and then levy a penalty that is a fixed percentage of the SHORTFALL,
 *    not a flat fee. The penalty must not push the account into negative balance.
 *
 *  - RBI circular DBOD.No.Leg.BC.35/09.07.005/2012-13 dated 10 August 2012 and the
 *    Basic Savings Bank Deposit Account rules: a BSBDA carries no minimum balance
 *    requirement, so no non-maintenance penalty can be levied on it.
 *
 *  - RBI Master Direction on Inoperative Accounts / Unclaimed Deposits dated
 *    1 January 2024 (effective 1 April 2024): no penal charge for non-maintenance of
 *    minimum balance may be levied on an account classified inoperative.
 *
 *  - RBI circular DPSS.CO.PD No.316/02.10.002/2014-2015 dated 14 August 2014: five
 *    free transactions a month at the card-issuing bank's own ATMs, and three free
 *    at other banks' ATMs in six metro centres (Bengaluru, Chennai, Hyderabad,
 *    Kolkata, Mumbai and New Delhi) or five free elsewhere. Free counts include both
 *    financial and non-financial transactions.
 *
 *  - RBI circular CO.DPSS.POLC.No.S1330/02-10-002/2024-2025 dated 28 March 2025:
 *    the ceiling a bank may charge a customer beyond the free limit rose to ₹23 per
 *    transaction with effect from 1 May 2025, from the ₹21 ceiling that applied from
 *    1 January 2022. The same ceiling covers Cash Recycler Machine transactions.
 *
 *  - GST: banking services fall under SAC 9971 and are taxed at 18%.
 *
 * Cheque and NACH mandate return charges are not capped by the RBI, so they are an
 * input here — take the figure from your bank's published schedule of charges.
 */

/** Free transactions per month at the card-issuing bank's own ATMs. */
export const FREE_OWN_BANK_ATM_TXNS = 5;

/** Free transactions per month at other banks' ATMs in the six metro centres. */
export const FREE_OTHER_BANK_ATM_TXNS_METRO = 3;

/** Free transactions per month at other banks' ATMs outside the metro centres. */
export const FREE_OTHER_BANK_ATM_TXNS_NON_METRO = 5;

/** The six metro centres named in the RBI ATM circular. */
export const METRO_CENTRES = [
  "Bengaluru",
  "Chennai",
  "Hyderabad",
  "Kolkata",
  "Mumbai",
  "New Delhi",
];

/** RBI ceiling on the customer charge per ATM transaction beyond the free limit, from 1 May 2025. */
export const ATM_CHARGE_CEILING = 23;

/** The ceiling that applied from 1 January 2022 to 30 April 2025. */
export const ATM_CHARGE_CEILING_LEGACY = 21;

/** GST on banking services (SAC 9971). */
export const GST_PERCENT = 18;

/** Months in a financial year, used to annualise monthly counts. */
export const MONTHS_IN_YEAR = 12;

/** Quarters in a year, used for quarterly SMS alert billing. */
export const QUARTERS_IN_YEAR = 4;

const round2 = (value) => Math.round(value * 100) / 100;

const clamp = (value, low, high) => Math.min(Math.max(value, low), high);

/**
 * Monthly penalty for not maintaining the required balance, as an RBI-compliant
 * percentage of the shortfall bounded by the bank's own floor and cap.
 *
 * @param {number} shortfall          Required balance minus balance actually held.
 * @param {number} chargePercent      Bank's percentage of the shortfall.
 * @param {number} floorCharge        Bank's minimum penalty in a month.
 * @param {number} capCharge          Bank's maximum penalty in a month.
 * @returns {number} penalty before GST, zero when there is no shortfall.
 */
export function computeShortfallPenalty(shortfall, chargePercent, floorCharge, capCharge) {
  if (!(shortfall > 0)) return 0;
  const raw = (shortfall * chargePercent) / 100;
  const high = capCharge > 0 ? capCharge : raw;
  const low = Math.min(floorCharge, high);
  return round2(clamp(raw, low, high));
}

/**
 * Chargeable ATM transactions in a month after the RBI free allowances.
 *
 * @param {number} ownBankTxns    Transactions a month at your own bank's ATMs.
 * @param {number} otherBankTxns  Transactions a month at other banks' ATMs.
 * @param {boolean} isMetro       True if you are in one of the six metro centres.
 * @returns {{ own: number, other: number, total: number, freeOther: number }}
 */
export function computeChargeableAtmTxns(ownBankTxns, otherBankTxns, isMetro) {
  const freeOther = isMetro ? FREE_OTHER_BANK_ATM_TXNS_METRO : FREE_OTHER_BANK_ATM_TXNS_NON_METRO;
  const own = Math.max(0, ownBankTxns - FREE_OWN_BANK_ATM_TXNS);
  const other = Math.max(0, otherBankTxns - freeOther);
  return { own, other, total: own + other, freeOther };
}

/**
 * Full year of account charges.
 *
 * @returns {object} result object, or { error } when an input is not usable.
 */
export function estimateBankCharges({
  requiredBalance = 10000,
  balanceMaintained = 10000,
  monthsShort = 0,
  shortfallChargePercent = 6,
  shortfallFloorCharge = 50,
  shortfallCapCharge = 600,
  ownBankAtmTxns = 4,
  otherBankAtmTxns = 2,
  isMetro = true,
  atmChargePerTxn = ATM_CHARGE_CEILING,
  returnCount = 0,
  returnCharge = 500,
  debitCardAnnualFee = 200,
  smsChargePerQuarter = 15,
  isBsbda = false,
  gstPercent = GST_PERCENT,
} = {}) {
  const n = {
    requiredBalance: Number(requiredBalance),
    balanceMaintained: Number(balanceMaintained),
    monthsShort: Number(monthsShort),
    shortfallChargePercent: Number(shortfallChargePercent),
    shortfallFloorCharge: Number(shortfallFloorCharge),
    shortfallCapCharge: Number(shortfallCapCharge),
    ownBankAtmTxns: Number(ownBankAtmTxns),
    otherBankAtmTxns: Number(otherBankAtmTxns),
    atmChargePerTxn: Number(atmChargePerTxn),
    returnCount: Number(returnCount),
    returnCharge: Number(returnCharge),
    debitCardAnnualFee: Number(debitCardAnnualFee),
    smsChargePerQuarter: Number(smsChargePerQuarter),
    gstPercent: Number(gstPercent),
  };

  if (!Object.values(n).every((value) => Number.isFinite(value))) {
    return { error: "Enter valid numbers in every field — use 0 for anything that does not apply." };
  }
  if (Object.values(n).some((value) => value < 0)) {
    return { error: "Charges, balances and counts cannot be negative." };
  }
  if (n.monthsShort > MONTHS_IN_YEAR) {
    return { error: `Months below the required balance cannot be more than ${MONTHS_IN_YEAR}.` };
  }
  if (n.shortfallChargePercent > 100) {
    return { error: "The shortfall charge percentage cannot exceed 100%." };
  }
  if (n.gstPercent > 100) {
    return { error: "GST cannot exceed 100%." };
  }
  if (n.ownBankAtmTxns > 500 || n.otherBankAtmTxns > 500) {
    return { error: "ATM transactions per month above 500 are outside a realistic range." };
  }
  if (n.returnCount > 365) {
    return { error: "Cheque or mandate returns above 365 in a year are outside a realistic range." };
  }
  if (n.shortfallCapCharge > 0 && n.shortfallFloorCharge > n.shortfallCapCharge) {
    return { error: "The minimum penalty cannot be higher than the maximum penalty." };
  }

  const shortfall = Math.max(0, round2(n.requiredBalance - n.balanceMaintained));

  const monthlyShortfallPenalty = isBsbda
    ? 0
    : computeShortfallPenalty(
        shortfall,
        n.shortfallChargePercent,
        n.shortfallFloorCharge,
        n.shortfallCapCharge,
      );
  const monthsCharged = isBsbda ? 0 : Math.round(n.monthsShort);
  const shortfallPenaltyYear = round2(monthlyShortfallPenalty * monthsCharged);

  const atm = computeChargeableAtmTxns(
    Math.round(n.ownBankAtmTxns),
    Math.round(n.otherBankAtmTxns),
    Boolean(isMetro),
  );
  const atmChargeMonth = round2(atm.total * n.atmChargePerTxn);
  const atmChargeYear = round2(atmChargeMonth * MONTHS_IN_YEAR);
  const atmTxnsYear = atm.total * MONTHS_IN_YEAR;

  const returnChargeYear = round2(Math.round(n.returnCount) * n.returnCharge);
  const cardFeeYear = round2(n.debitCardAnnualFee);
  const smsChargeYear = round2(n.smsChargePerQuarter * QUARTERS_IN_YEAR);

  const lines = [
    {
      id: "shortfall",
      label: isBsbda
        ? "Minimum balance penalty (BSBDA — not chargeable)"
        : "Minimum balance non-maintenance penalty",
      amount: shortfallPenaltyYear,
      detail: isBsbda
        ? "A Basic Savings Bank Deposit Account has no minimum balance requirement, so this penalty cannot be levied."
        : shortfall > 0
          ? `${monthsCharged} month(s) short by ${shortfall}, charged at ${n.shortfallChargePercent}% of the shortfall each month.`
          : "You are at or above the required balance, so no penalty arises.",
      avoidable: true,
    },
    {
      id: "atm",
      label: "ATM transactions beyond the free limit",
      amount: atmChargeYear,
      detail: `${atm.own} own-bank and ${atm.other} other-bank chargeable transactions a month (free limits: ${FREE_OWN_BANK_ATM_TXNS} own, ${atm.freeOther} other) at ${n.atmChargePerTxn} each.`,
      avoidable: true,
    },
    {
      id: "returns",
      label: "Cheque and mandate return charges",
      amount: returnChargeYear,
      detail: `${Math.round(n.returnCount)} return(s) in the year at ${n.returnCharge} each. Not capped by the RBI — check your bank's schedule of charges.`,
      avoidable: true,
    },
    {
      id: "card",
      label: "Debit card annual maintenance fee",
      amount: cardFeeYear,
      detail: "Recurring card fee, usually billed once a year on the card anniversary.",
      avoidable: false,
    },
    {
      id: "sms",
      label: "SMS alert charges",
      amount: smsChargeYear,
      detail: `Billed ${QUARTERS_IN_YEAR} times a year. The RBI requires these to be levied on actual usage, not as a flat fee.`,
      avoidable: false,
    },
  ];

  const subtotal = round2(lines.reduce((sum, line) => sum + line.amount, 0));
  const gst = round2((subtotal * n.gstPercent) / 100);
  const total = round2(subtotal + gst);

  const avoidableSubtotal = round2(
    lines.filter((line) => line.avoidable).reduce((sum, line) => sum + line.amount, 0),
  );
  const avoidableTotal = round2(avoidableSubtotal * (1 + n.gstPercent / 100));
  const monthlyAverage = round2(total / MONTHS_IN_YEAR);
  const avoidableShare = subtotal > 0 ? round2((avoidableSubtotal / subtotal) * 100) : 0;

  const ceilingBreached = n.atmChargePerTxn > ATM_CHARGE_CEILING;

  return {
    shortfall,
    monthlyShortfallPenalty,
    monthsCharged,
    chargeableAtmTxnsMonth: atm.total,
    chargeableAtmTxnsYear: atmTxnsYear,
    freeOtherBankTxns: atm.freeOther,
    lines,
    subtotal,
    gst,
    gstPercent: n.gstPercent,
    total,
    monthlyAverage,
    avoidableTotal,
    avoidableShare,
    isBsbda: Boolean(isBsbda),
    isMetro: Boolean(isMetro),
    ceilingBreached,
    ceilingNote: ceilingBreached
      ? `Your per-transaction ATM charge is above the RBI ceiling of ₹${ATM_CHARGE_CEILING}. Raise it with your bank.`
      : "",
  };
}

export default estimateBankCharges;
