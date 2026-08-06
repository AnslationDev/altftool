/**
 * Saudi Arabia Value Added Tax maths.
 *
 * Statutory source: the VAT Law issued by Royal Decree No. M/113 dated
 * 2/11/1438H and its Implementing Regulations, administered by the Zakat, Tax
 * and Customs Authority (ZATCA). VAT started at 5% on 1 January 2018 and the
 * standard rate was raised to 15% from 1 July 2020 by Royal Order A/638.
 */

/** Standard KSA VAT rate, % — in force from 1 July 2020. */
export const KSA_STANDARD_VAT_RATE = 15;

/** The original KSA VAT rate, % — 1 January 2018 to 30 June 2020. Kept for
 *  recalculating or crediting invoices issued in that window. */
export const KSA_LEGACY_VAT_RATE = 5;

/** Zero rate, % — exports outside the GCC, international transport, qualifying
 *  medicines and medical equipment (Implementing Regulations Articles 32-35). */
export const KSA_ZERO_VAT_RATE = 0;

/** Mandatory registration threshold, SAR of annual taxable supplies
 *  (Article 3 of the Implementing Regulations). */
export const KSA_MANDATORY_REGISTRATION_THRESHOLD = 375000;

/** Voluntary registration threshold, SAR of annual taxable supplies or
 *  expenses (Article 7 of the Implementing Regulations). */
export const KSA_VOLUNTARY_REGISTRATION_THRESHOLD = 187500;

/** Above this tax-inclusive total a supply to a consumer needs a full tax
 *  invoice rather than a simplified one, SAR (Implementing Regulations
 *  Article 53 simplified-invoice limit). */
export const KSA_SIMPLIFIED_INVOICE_LIMIT = 1000;

/** 1 SAR = 100 halalas, so money rounds to 2 decimal places. */
const CURRENCY_DECIMALS = 2;

/** Upper input guard so results stay inside safe double precision. */
export const MAX_AMOUNT = 1e12;

export const VAT_MODES = ["exclusive", "inclusive"];

function roundMoney(value) {
  const factor = 10 ** CURRENCY_DECIMALS;
  return Math.round(value * factor) / factor;
}

/** Reduce a fraction so 15/115 is reported as the familiar 3/23. */
function simplifyFraction(numerator, denominator) {
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  const scale = 100;
  let n = Math.round(numerator * scale);
  let d = Math.round(denominator * scale);
  if (n === 0 || d === 0) return `${numerator}/${denominator}`;
  const divisor = gcd(n, d);
  n /= divisor;
  d /= divisor;
  return `${n}/${d}`;
}

/**
 * Add or extract Saudi VAT on an invoice line.
 *
 * mode "exclusive": taxable = unitPrice x qty less discount, VAT = taxable x rate/100.
 * mode "inclusive": the discounted line total already contains VAT, so
 *   VAT = gross x rate / (100 + rate). At 15% that fraction is 15/115 = 3/23.
 *
 * @returns {{net:number, vat:number, gross:number, grossBeforeDiscount:number,
 *   discountAmount:number, unitNet:number, unitVat:number, unitGross:number,
 *   rate:number, mode:string, quantity:number, discountPercent:number,
 *   vatFraction:string, needsFullTaxInvoice:boolean} | {error:string}}
 */
export function calculateKsaVat({
  amount,
  rate = KSA_STANDARD_VAT_RATE,
  mode = "inclusive",
  quantity = 1,
  discountPercent = 0,
} = {}) {
  const amt = Number(amount);
  const rt = Number(rate);
  const qty = Number(quantity);
  const disc = Number(discountPercent);

  if (!Number.isFinite(amt)) return { error: "Enter a valid amount in riyals." };
  if (!Number.isFinite(rt)) return { error: "Enter a valid VAT rate." };
  if (!Number.isFinite(qty)) return { error: "Enter a valid quantity." };
  if (!Number.isFinite(disc)) return { error: "Enter a valid discount percentage." };
  if (amt < 0) return { error: "Amount cannot be negative." };
  if (amt > MAX_AMOUNT) return { error: "Amount is too large to calculate reliably." };
  if (rt < 0 || rt > 100) return { error: "VAT rate must be between 0% and 100%." };
  if (qty <= 0) return { error: "Quantity must be greater than 0." };
  if (qty > 1e6) return { error: "Quantity is too large to calculate reliably." };
  if (disc < 0 || disc > 100) return { error: "Discount must be between 0% and 100%." };

  const normalisedMode = VAT_MODES.includes(mode) ? mode : "inclusive";
  const lineBeforeDiscount = amt * qty;
  // MAX_AMOUNT alone only bounds the per-unit amount; amount x quantity can
  // still land outside safe double precision even when both individually
  // pass, so bound the line total too.
  if (lineBeforeDiscount > MAX_AMOUNT) {
    return { error: "Amount × quantity is too large to calculate reliably." };
  }
  const discountAmount = (lineBeforeDiscount * disc) / 100;
  const lineAmount = lineBeforeDiscount - discountAmount;

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
    grossBeforeDiscount: roundMoney(lineBeforeDiscount),
    discountAmount: roundMoney(discountAmount),
    unitNet: roundMoney(net / qty),
    unitVat: roundMoney(vat / qty),
    unitGross: roundMoney(gross / qty),
    rate: rt,
    mode: normalisedMode,
    quantity: qty,
    discountPercent: disc,
    vatFraction: rt > 0 ? simplifyFraction(rt, 100 + rt) : "0/100",
    needsFullTaxInvoice: gross > KSA_SIMPLIFIED_INVOICE_LIMIT,
  };
}

/**
 * Where a business sits against the ZATCA registration thresholds.
 * @returns {{status:string, label:string, detail:string, toMandatory:number} | {error:string}}
 */
export function ksaRegistrationStatus(annualTaxableSupplies) {
  const turnover = Number(annualTaxableSupplies);
  if (!Number.isFinite(turnover)) return { error: "Enter a valid 12-month taxable supply figure." };
  if (turnover < 0) return { error: "Taxable supplies cannot be negative." };

  if (turnover >= KSA_MANDATORY_REGISTRATION_THRESHOLD) {
    return {
      status: "mandatory",
      label: "VAT registration with ZATCA is mandatory",
      detail: "Annual taxable supplies are at or above the SAR 375,000 mandatory threshold.",
      toMandatory: 0,
    };
  }
  if (turnover >= KSA_VOLUNTARY_REGISTRATION_THRESHOLD) {
    return {
      status: "voluntary",
      label: "Voluntary registration is available",
      detail:
        "Above the SAR 187,500 voluntary threshold, so registering to recover input VAT is optional.",
      toMandatory: roundMoney(KSA_MANDATORY_REGISTRATION_THRESHOLD - turnover),
    };
  }
  return {
    status: "not-required",
    label: "No registration required yet",
    detail: "Below the SAR 187,500 voluntary registration threshold.",
    toMandatory: roundMoney(KSA_MANDATORY_REGISTRATION_THRESHOLD - turnover),
  };
}
