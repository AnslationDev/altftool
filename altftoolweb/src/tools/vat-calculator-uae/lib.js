/**
 * UAE Value Added Tax maths.
 *
 * Statutory source: Federal Decree-Law No. (8) of 2017 on Value Added Tax and
 * Cabinet Decision No. (52) of 2017 (Executive Regulations). VAT came into
 * force in the UAE on 1 January 2018.
 */

/** Standard UAE VAT rate, % — Article 3 of Federal Decree-Law No. (8) of 2017. */
export const UAE_STANDARD_VAT_RATE = 5;

/** Zero rate, % — applies to exports, international transport, certain
 *  healthcare/education supplies and investment-grade precious metals
 *  (Article 45 of Federal Decree-Law No. (8) of 2017). */
export const UAE_ZERO_VAT_RATE = 0;

/** Mandatory registration threshold, AED of taxable supplies in 12 months
 *  (Article 13 of the Decree-Law, Article 7 of the Executive Regulations). */
export const UAE_MANDATORY_REGISTRATION_THRESHOLD = 375000;

/** Voluntary registration threshold, AED of taxable supplies or expenses
 *  in 12 months (Article 17 of the Decree-Law). */
export const UAE_VOLUNTARY_REGISTRATION_THRESHOLD = 187500;

/** Minimum tax-inclusive spend per invoice to qualify for the tourist VAT
 *  refund scheme, AED (Federal Tax Authority tourist refund rules). */
export const UAE_TOURIST_REFUND_MIN_SPEND = 250;

/** Smallest UAE currency unit: 1 AED = 100 fils, so money rounds to 2 dp. */
const CURRENCY_DECIMALS = 2;

/** Upper input guard so results stay inside safe double precision. */
export const MAX_AMOUNT = 1e12;

export const VAT_MODES = ["exclusive", "inclusive"];

function roundMoney(value) {
  const factor = 10 ** CURRENCY_DECIMALS;
  return Math.round(value * factor) / factor;
}

/**
 * Add or remove UAE VAT.
 *
 * mode "exclusive": `amount` is the price before VAT, VAT is added on top.
 *   vat = net x rate / 100
 * mode "inclusive": `amount` already contains VAT, VAT is extracted.
 *   vat = gross x rate / (100 + rate)   (5% -> gross x 5/105)
 *
 * @returns {{net:number, vat:number, gross:number, unitNet:number,
 *   unitVat:number, unitGross:number, rate:number, mode:string,
 *   quantity:number, effectiveRate:number, vatFraction:string,
 *   qualifiesForTouristRefund:boolean} | {error:string}}
 */
export function calculateUaeVat({
  amount,
  rate = UAE_STANDARD_VAT_RATE,
  mode = "exclusive",
  quantity = 1,
} = {}) {
  const amt = Number(amount);
  const rt = Number(rate);
  const qty = Number(quantity);

  if (!Number.isFinite(amt)) return { error: "Enter a valid amount in dirhams." };
  if (!Number.isFinite(rt)) return { error: "Enter a valid VAT rate." };
  if (!Number.isFinite(qty)) return { error: "Enter a valid quantity." };
  if (amt < 0) return { error: "Amount cannot be negative." };
  if (amt > MAX_AMOUNT) return { error: "Amount is too large to calculate reliably." };
  if (rt < 0 || rt > 100) return { error: "VAT rate must be between 0% and 100%." };
  if (qty <= 0) return { error: "Quantity must be at least 1." };
  if (qty > 1e6) return { error: "Quantity is too large to calculate reliably." };

  const normalisedMode = VAT_MODES.includes(mode) ? mode : "exclusive";
  const lineAmount = amt * qty;

  let net;
  let vat;
  let gross;

  if (normalisedMode === "inclusive") {
    gross = roundMoney(lineAmount);
    vat = roundMoney((lineAmount * rt) / (100 + rt));
    net = roundMoney(gross - vat);
  } else {
    net = roundMoney(lineAmount);
    vat = roundMoney((lineAmount * rt) / 100);
    gross = roundMoney(net + vat);
  }

  return {
    net,
    vat,
    gross,
    unitNet: roundMoney(qty > 0 ? net / qty : 0),
    unitVat: roundMoney(qty > 0 ? vat / qty : 0),
    unitGross: roundMoney(qty > 0 ? gross / qty : 0),
    rate: rt,
    mode: normalisedMode,
    quantity: qty,
    effectiveRate: net > 0 ? roundMoney((vat / net) * 100) : 0,
    vatFraction: `${rt}/${100 + rt}`,
    qualifiesForTouristRefund: gross >= UAE_TOURIST_REFUND_MIN_SPEND,
  };
}

/**
 * Where a business sits against the UAE registration thresholds.
 * @returns {{status:string, label:string, detail:string,
 *   toMandatory:number, toVoluntary:number} | {error:string}}
 */
export function uaeRegistrationStatus(annualTaxableTurnover) {
  const turnover = Number(annualTaxableTurnover);
  if (!Number.isFinite(turnover)) return { error: "Enter a valid 12-month turnover." };
  if (turnover < 0) return { error: "Turnover cannot be negative." };

  if (turnover >= UAE_MANDATORY_REGISTRATION_THRESHOLD) {
    return {
      status: "mandatory",
      label: "VAT registration is mandatory",
      detail: `Taxable supplies are at or above the AED ${UAE_MANDATORY_REGISTRATION_THRESHOLD.toLocaleString("en-AE")} mandatory threshold.`,
      toMandatory: 0,
      toVoluntary: 0,
    };
  }
  if (turnover >= UAE_VOLUNTARY_REGISTRATION_THRESHOLD) {
    return {
      status: "voluntary",
      label: "Voluntary registration is available",
      detail: `Above the AED ${UAE_VOLUNTARY_REGISTRATION_THRESHOLD.toLocaleString("en-AE")} voluntary threshold but below the mandatory one.`,
      toMandatory: roundMoney(UAE_MANDATORY_REGISTRATION_THRESHOLD - turnover),
      toVoluntary: 0,
    };
  }
  return {
    status: "not-required",
    label: "No registration required yet",
    detail: `Below the AED ${UAE_VOLUNTARY_REGISTRATION_THRESHOLD.toLocaleString("en-AE")} voluntary threshold.`,
    toMandatory: roundMoney(UAE_MANDATORY_REGISTRATION_THRESHOLD - turnover),
    toVoluntary: roundMoney(UAE_VOLUNTARY_REGISTRATION_THRESHOLD - turnover),
  };
}
