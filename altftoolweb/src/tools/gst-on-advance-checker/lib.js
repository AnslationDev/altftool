/**
 * Does an advance received attract GST?
 *
 * The whole answer turns on the time of supply.
 *
 * SERVICES - section 13(2) of the CGST Act, 2017
 *   Time of supply is the EARLIER of the date of invoice (when issued within the
 *   30 days allowed by section 31(2)) or the date of receipt of payment. So an
 *   advance for a service is taxable the moment it hits the bank.
 *
 * GOODS - section 12(2) read with Notification No. 66/2017-Central Tax dated
 * 15 November 2017
 *   That notification exempts every registered person, other than one who has opted
 *   for composition under section 10, from paying tax on advances for a supply of
 *   goods. Time of supply for them is simply the date of issue of the invoice, so no
 *   GST is due when the advance is received. (Notification 40/2017 had earlier given
 *   this relief only up to Rs 1.5 crore of turnover; 66/2017 extended it to all.)
 *
 * REVERSE CHARGE - sections 12(3) and 13(3)
 *   The recipient's liability is triggered by the earliest of the date of payment,
 *   the date of receipt of goods, or 31 days (goods) / 61 days (services) from the
 *   supplier's invoice. Paying an advance therefore does create a reverse-charge
 *   liability, for goods as well as for services.
 *
 * DOCUMENTS - section 31(3)(d), (f) and (e) with rules 50 and 52 of the CGST Rules
 *   A supplier issues a receipt voucher under section 31(3)(d) on their own advance.
 *   Rule 50 adds two fallbacks: where the rate of tax is not determinable, tax is
 *   paid at 18%; where the nature of supply is not determinable, it is treated as an
 *   inter-State supply. A recipient paying under reverse charge instead issues a
 *   PAYMENT voucher under section 31(3)(f)/rule 52 — never a receipt voucher, since
 *   they are not the supplier. Composition dealers and unregistered persons cannot
 *   issue a tax invoice or receipt voucher at all. If the deal falls through and the
 *   advance is returned, a refund voucher is issued under section 31(3)(e).
 *
 * REPORTING - a supplier reports advances on which tax is paid in Table 11A of
 * GSTR-1 and includes them in the outward supplies of Table 3.1(a) of GSTR-3B; the
 * adjustment when the invoice is finally raised goes into Table 11B of GSTR-1. A
 * recipient paying under reverse charge instead reports the inward supply in GSTR-3B
 * Table 3.1(d), never in the supplier-side outward-supply tables.
 */

/** Fallback rate under the first proviso to rule 50 when the rate is not determinable. */
export const UNDETERMINED_RATE_FALLBACK = 18;

/** Common GST rates for the quick picker. */
export const GST_RATES = [0, 5, 12, 18, 28];

export const SUPPLY_TYPES = [
  { value: "goods", label: "Supply of goods" },
  { value: "services", label: "Supply of services" },
];

export const REGISTRATION_TYPES = [
  { value: "regular", label: "Registered — regular scheme" },
  { value: "composition", label: "Registered — composition scheme (section 10)" },
  { value: "unregistered", label: "Not registered (below the threshold)" },
];

export const SUPPLY_NATURES = [
  { value: "intra", label: "Intra-State (CGST + SGST)" },
  { value: "inter", label: "Inter-State (IGST)" },
  { value: "unknown", label: "Not determinable yet" },
];

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;
const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Split a tax amount into the heads that actually apply.
 * @param {number} tax total tax
 * @param {"intra"|"inter"} nature resolved nature of supply
 */
export function splitTax(tax, nature) {
  if (nature === "intra") {
    const half = round2(tax / 2);
    return { cgst: half, sgst: round2(tax - half), igst: 0 };
  }
  return { cgst: 0, sgst: 0, igst: round2(tax) };
}

/**
 * @param {object} input
 * @param {number} input.advanceAmount        Money actually received.
 * @param {"goods"|"services"} input.supplyType
 * @param {"regular"|"composition"|"unregistered"} input.registration
 * @param {"intra"|"inter"|"unknown"} input.supplyNature
 * @param {number} [input.gstRate]            Rate on the underlying supply.
 * @param {boolean} [input.rateKnown]         False applies the rule 50 fallback of 18%.
 * @param {boolean} [input.amountIncludesGst] True when the advance already carries the tax.
 * @param {boolean} [input.reverseCharge]     True when the recipient pays under RCM.
 * @param {boolean} [input.exportUnderLut]    Zero-rated export made under an LUT/bond.
 * @returns {object} verdict and figures, or { error }.
 */
export function checkGstOnAdvance({
  advanceAmount,
  supplyType = "services",
  registration = "regular",
  supplyNature = "intra",
  gstRate = 18,
  rateKnown = true,
  amountIncludesGst = true,
  reverseCharge = false,
  exportUnderLut = false,
} = {}) {
  if (!isNum(advanceAmount)) return { error: "Enter the advance amount as a number." };
  if (advanceAmount <= 0) return { error: "The advance must be greater than zero." };
  if (!SUPPLY_TYPES.some((option) => option.value === supplyType)) {
    return { error: "Choose whether the supply is of goods or services." };
  }
  if (!REGISTRATION_TYPES.some((option) => option.value === registration)) {
    return { error: "Choose a valid registration status." };
  }
  if (!SUPPLY_NATURES.some((option) => option.value === supplyNature)) {
    return { error: "Choose a valid nature of supply." };
  }
  // When the rate isn't known yet, rule 50's 18% fallback applies regardless of
  // whatever (or nothing) sits in gstRate, so only validate it when it will be used.
  if (rateKnown && (!isNum(gstRate) || gstRate < 0 || gstRate > 100)) {
    return { error: "GST rate must be between 0% and 100%." };
  }

  // Rule 50, first proviso: an undeterminable rate is taxed at 18%.
  const appliedRate = rateKnown ? gstRate : UNDETERMINED_RATE_FALLBACK;
  // Rule 50, second proviso: an undeterminable nature of supply is treated as inter-State.
  const resolvedNature = supplyNature === "unknown" ? "inter" : supplyNature;

  const reasons = [];
  let status = "payable";
  let liableParty = "supplier";

  if (reverseCharge) {
    liableParty = "recipient";
    status = "payable";
    reasons.push(
      supplyType === "goods"
        ? "Reverse charge: section 12(3) fixes the time of supply at the earliest of the payment date, the receipt of goods, or 31 days from the supplier's invoice — so paying the advance triggers the liability."
        : "Reverse charge: section 13(3) fixes the time of supply at the earlier of the payment date or 61 days from the supplier's invoice — so paying the advance triggers the liability.",
    );
    reasons.push("The recipient pays this in cash under section 49(4); it cannot be set off against input tax credit.");
  } else if (registration === "unregistered") {
    status = "notPayable";
    reasons.push("An unregistered person cannot collect GST or issue a tax invoice, so no tax arises on the advance.");
    reasons.push("Watch the registration threshold — 20 lakh of aggregate turnover for services and 40 lakh for goods only, and 10 lakh / 20 lakh in the special category states.");
  } else if (exportUnderLut) {
    status = "notPayable";
    reasons.push("A zero-rated supply made under a letter of undertaking carries no tax, so no tax is paid on the advance either (section 16 of the IGST Act).");
    reasons.push("A receipt voucher is still issued, and the advance is reported as a zero-rated advance.");
  } else if (registration === "composition") {
    // Rule 5(1)(f) of the CGST Rules bars every composition taxpayer, goods or
    // services, from collecting any tax from the recipient — so neither branch
    // below can be computed and charged the way a regular taxpayer's can.
    status = "checkAdviser";
    reasons.push(
      supplyType === "goods"
        ? "Notification 66/2017-Central Tax excludes composition taxpayers from the relief on advances for goods."
        : "Rule 5(1)(f) of the CGST Rules bars a composition taxpayer from collecting any tax from the recipient, on goods or services alike.",
    );
    reasons.push("A composition dealer pays the section 10 levy on turnover rather than transaction-wise GST, so confirm the treatment of this receipt with your practitioner before you file.");
  } else if (supplyType === "services") {
    status = "payable";
    reasons.push("Section 13(2): for services the time of supply is the earlier of the invoice date or the date payment is received, so the advance is taxable now.");
    reasons.push("Issue a receipt voucher under section 31(3)(d) on the day the advance is received.");
  } else {
    status = "notPayable";
    reasons.push("Notification No. 66/2017-Central Tax dated 15 November 2017 relieves every registered person outside the composition scheme from paying tax on an advance for goods.");
    reasons.push("Time of supply for goods is therefore the invoice date — charge GST when you raise the invoice, not when the money arrives.");
  }

  if (!rateKnown) {
    reasons.push(`Rate not determinable: the first proviso to rule 50 requires tax at ${UNDETERMINED_RATE_FALLBACK}%.`);
  }
  if (supplyNature === "unknown") {
    reasons.push("Nature of supply not determinable: the second proviso to rule 50 treats it as an inter-State supply, so IGST applies.");
  }

  const taxApplies = status === "payable";

  let taxableValue = 0;
  let totalTax = 0;
  if (taxApplies) {
    if (amountIncludesGst) {
      taxableValue = (advanceAmount * 100) / (100 + appliedRate);
      totalTax = advanceAmount - taxableValue;
    } else {
      taxableValue = advanceAmount;
      totalTax = (advanceAmount * appliedRate) / 100;
    }
  }

  const split = splitTax(totalTax, resolvedNature);
  const grossOutflow = amountIncludesGst ? advanceAmount : advanceAmount + totalTax;

  const documents = [];
  if (reverseCharge) {
    // Section 31(3)(d) receipt vouchers are issued by the SUPPLIER on their own
    // advance. A recipient paying under reverse charge issues a payment voucher
    // instead — the supplier never raises a receipt voucher for this money.
    documents.push(
      "Payment voucher under section 31(3)(f), with the particulars listed in rule 52 — the recipient issues this, not a receipt voucher, since the recipient (not the supplier) is liable for the tax.",
    );
  } else if (registration === "unregistered") {
    documents.push(
      "No GST document — an unregistered person cannot issue a receipt voucher or a tax invoice. Keep your own record of the advance for when you cross the registration threshold.",
    );
  } else if (registration === "composition") {
    documents.push(
      "No receipt voucher — composition dealers issue a bill of supply, never a tax invoice or receipt voucher with GST, and account for this money through the quarterly CMP-08 turnover statement instead.",
    );
  } else if (exportUnderLut) {
    documents.push(
      "Receipt voucher under section 31(3)(d), recorded as a zero-rated advance — no tax entry is made since the supply is zero-rated under the LUT.",
    );
  } else if (status === "notPayable" && supplyType === "goods") {
    documents.push("No receipt voucher with tax — record the money as an advance in your books and raise a tax invoice when the goods are supplied.");
  } else {
    documents.push("Receipt voucher under section 31(3)(d), with the particulars listed in rule 50.");
  }
  documents.push("Refund voucher under section 31(3)(e) if the advance is returned and no supply happens.");

  let reporting;
  if (taxApplies && liableParty === "recipient") {
    reporting = [
      "GSTR-3B Table 3.1(d) — inward supplies liable to reverse charge, self-assessed and paid in cash by the recipient.",
      "Input tax credit on this reverse-charge tax can be claimed in the same return once it is paid, subject to the usual conditions — it is not reported in Table 11A/11B or Table 3.1(a), which are for the supplier's own outward supplies.",
    ];
  } else if (taxApplies) {
    reporting = [
      "GSTR-1 Table 11A — advances received on which tax is paid.",
      "GSTR-3B Table 3.1(a) — include the advance in outward taxable supplies for the month.",
      "GSTR-1 Table 11B — reverse the advance in the month the tax invoice is finally raised.",
    ];
  } else {
    reporting = ["Nothing to report on this advance; report the supply when the tax invoice is issued."];
  }

  return {
    status,
    statusLabel:
      status === "payable"
        ? "GST is payable on this advance"
        : status === "notPayable"
          ? "No GST on this advance"
          : "Check with your GST practitioner",
    liableParty,
    appliedRate,
    rateWasAssumed: !rateKnown,
    resolvedNature,
    natureWasAssumed: supplyNature === "unknown",
    advanceAmount: round2(advanceAmount),
    taxableValue: round2(taxableValue),
    cgst: split.cgst,
    sgst: split.sgst,
    igst: split.igst,
    totalTax: round2(totalTax),
    grossOutflow: round2(grossOutflow),
    reasons,
    documents,
    reporting,
  };
}
