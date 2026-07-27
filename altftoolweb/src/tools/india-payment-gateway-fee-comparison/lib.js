/**
 * Indian payment gateway fee comparison.
 *
 * Pure arithmetic. Rates are supplied as arguments (the UI seeds them from the
 * published standard-plan defaults below and lets the user overwrite them),
 * so nothing here goes stale silently.
 */

/**
 * GST on payment gateway service fees is 18% (services under SAC 9971 /
 * financial and related services). The fee is the taxable value; GST is charged
 * on the fee, never on the transaction amount itself.
 */
export const GST_RATE_PCT = 18;

/**
 * Zero MDR is statutory, not a discount. Section 10A of the Payment and
 * Settlement Systems Act 2007 read with section 269SU of the Income-tax Act
 * 1961 (both inserted by the Finance (No. 2) Act 2019, effective 1 January
 * 2020) bars any charge to the merchant or payer on UPI and RuPay debit card
 * transactions. Percentage and flat fees are therefore both skipped on these
 * rails.
 */
export const ZERO_MDR_RAILS = ["upi", "rupayDebit"];

export const RAILS = [
  { id: "upi", label: "UPI", zeroMdr: true },
  { id: "rupayDebit", label: "RuPay debit card", zeroMdr: true },
  { id: "cards", label: "Credit / other debit cards", zeroMdr: false },
  { id: "netbanking", label: "Netbanking", zeroMdr: false },
  { id: "wallets", label: "Wallets", zeroMdr: false },
  { id: "international", label: "International cards", zeroMdr: false },
];

/**
 * Published standard-plan pricing as commonly advertised by Indian gateways for
 * a self-serve merchant with no negotiated rate. These are starting points to
 * be edited: anyone processing meaningful volume negotiates below them, and
 * gateways revise list pricing from time to time.
 */
export const GATEWAY_DEFAULTS = [
  {
    id: "razorpay",
    name: "Razorpay (standard)",
    rates: { upi: 0, rupayDebit: 0, cards: 2, netbanking: 2, wallets: 2, international: 3 },
    flatFeePerTxn: 0,
    monthlyFee: 0,
  },
  {
    id: "payu",
    name: "PayU (standard)",
    rates: { upi: 0, rupayDebit: 0, cards: 2, netbanking: 1.9, wallets: 2, international: 3 },
    flatFeePerTxn: 0,
    monthlyFee: 0,
  },
  {
    id: "cashfree",
    name: "Cashfree (standard)",
    rates: { upi: 0, rupayDebit: 0, cards: 1.95, netbanking: 1.9, wallets: 1.95, international: 3.5 },
    flatFeePerTxn: 0,
    monthlyFee: 0,
  },
  {
    id: "ccavenue",
    name: "CCAvenue (standard)",
    rates: { upi: 0, rupayDebit: 0, cards: 2, netbanking: 2, wallets: 2, international: 3 },
    flatFeePerTxn: 0,
    monthlyFee: 0,
  },
  {
    id: "instamojo",
    name: "Instamojo (percentage + flat)",
    rates: { upi: 0, rupayDebit: 0, cards: 2, netbanking: 2, wallets: 2, international: 3 },
    flatFeePerTxn: 3,
    monthlyFee: 0,
  },
];

export const DEFAULT_MIX = {
  upi: 60,
  rupayDebit: 5,
  cards: 20,
  netbanking: 8,
  wallets: 5,
  international: 2,
};

/** Mix percentages must add to 100 within this tolerance. */
export const MIX_TOLERANCE_PCT = 0.01;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round2 = (value) => Math.round(value * 100) / 100;

export function isZeroMdrRail(railId) {
  return ZERO_MDR_RAILS.includes(railId);
}

/**
 * Fee for a single gateway against a payment mix.
 *
 * @param {object} args
 * @param {number} args.monthlyVolume total value processed per month, INR
 * @param {number} args.averageTicket average order value, INR
 * @param {object} args.mix percentage of VALUE on each rail, keys of RAILS
 * @param {object} args.gateway {name, rates, flatFeePerTxn, monthlyFee}
 * @returns {{error:string}|object}
 */
export function gatewayMonthlyCost({ monthlyVolume, averageTicket, mix, gateway }) {
  if (!isNum(monthlyVolume) || monthlyVolume <= 0) {
    return { error: "Monthly processed volume must be greater than zero." };
  }
  if (!isNum(averageTicket) || averageTicket <= 0) {
    return { error: "Average ticket size must be greater than zero." };
  }
  if (!gateway || typeof gateway !== "object" || !gateway.rates) {
    return { error: "Gateway rate card is missing." };
  }

  const totalTxns = monthlyVolume / averageTicket;
  const flat = isNum(gateway.flatFeePerTxn) ? gateway.flatFeePerTxn : 0;
  const monthlyFee = isNum(gateway.monthlyFee) ? gateway.monthlyFee : 0;

  const lines = [];
  let percentFee = 0;
  let flatFee = 0;

  for (const rail of RAILS) {
    const sharePct = Number(mix?.[rail.id]) || 0;
    if (sharePct <= 0) continue;
    const railVolume = (monthlyVolume * sharePct) / 100;
    const railTxns = railVolume / averageTicket;
    const ratePct = rail.zeroMdr ? 0 : Number(gateway.rates[rail.id]) || 0;
    const railPercentFee = rail.zeroMdr ? 0 : (railVolume * ratePct) / 100;
    const railFlatFee = rail.zeroMdr ? 0 : railTxns * flat;
    percentFee += railPercentFee;
    flatFee += railFlatFee;
    lines.push({
      railId: rail.id,
      label: rail.label,
      sharePct,
      volume: railVolume,
      txns: railTxns,
      ratePct,
      fee: railPercentFee + railFlatFee,
      zeroMdr: rail.zeroMdr,
    });
  }

  const feeExGst = percentFee + flatFee + monthlyFee;
  const gst = (feeExGst * GST_RATE_PCT) / 100;
  const totalFee = feeExGst + gst;

  return {
    name: gateway.name,
    id: gateway.id,
    totalTxns,
    percentFee,
    flatFee,
    monthlyFee,
    feeExGst,
    gst,
    totalFee,
    netSettlement: monthlyVolume - totalFee,
    effectiveRatePct: round2((totalFee / monthlyVolume) * 100),
    costPerTxn: totalTxns > 0 ? totalFee / totalTxns : 0,
    annualFee: totalFee * 12,
    lines,
  };
}

/**
 * Compare every gateway and rank by total monthly fee.
 * @returns {{error:string}|{results:Array,cheapest:object,dearest:object,spread:number,totalTxns:number,mixTotal:number}}
 */
export function compareGateways({ monthlyVolume, averageTicket, mix, gateways }) {
  if (!isNum(monthlyVolume) || monthlyVolume <= 0) {
    return { error: "Monthly processed volume must be greater than zero." };
  }
  if (!isNum(averageTicket) || averageTicket <= 0) {
    return { error: "Average ticket size must be greater than zero." };
  }
  if (averageTicket > monthlyVolume) {
    return { error: "Average ticket size cannot exceed the whole monthly volume." };
  }
  if (!Array.isArray(gateways) || gateways.length === 0) {
    return { error: "Select at least one gateway to compare." };
  }

  let mixTotal = 0;
  for (const rail of RAILS) {
    const value = Number(mix?.[rail.id]);
    if (!isNum(value)) return { error: `Enter a number for the ${rail.label} share.` };
    if (value < 0) return { error: "Payment mix shares cannot be negative." };
    mixTotal += value;
  }
  if (Math.abs(mixTotal - 100) > MIX_TOLERANCE_PCT) {
    return { error: `Your payment mix adds up to ${round2(mixTotal)}%. It must total 100%.` };
  }

  const results = [];
  for (const gateway of gateways) {
    const result = gatewayMonthlyCost({ monthlyVolume, averageTicket, mix, gateway });
    if (result.error) return result;
    results.push(result);
  }

  results.sort((a, b) => a.totalFee - b.totalFee);
  const cheapest = results[0];
  const dearest = results[results.length - 1];

  return {
    results,
    cheapest,
    dearest,
    spread: dearest.totalFee - cheapest.totalFee,
    annualSpread: (dearest.totalFee - cheapest.totalFee) * 12,
    totalTxns: monthlyVolume / averageTicket,
    mixTotal: round2(mixTotal),
  };
}

/** Share of monthly volume that carries no MDR at all. */
export function zeroMdrSharePct(mix) {
  return ZERO_MDR_RAILS.reduce((sum, railId) => sum + (Number(mix?.[railId]) || 0), 0);
}
