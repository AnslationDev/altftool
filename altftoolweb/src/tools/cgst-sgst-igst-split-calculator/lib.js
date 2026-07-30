/**
 * Which GST applies — CGST + SGST, or IGST?
 *
 * The test is in the IGST Act, 2017:
 *  - Section 8(1) and 8(2): a supply is INTRA-state when the location of the supplier and the
 *    place of supply are in the same State or Union territory. CGST and SGST/UTGST then apply.
 *  - Section 7(1) and 7(3): where the two are in different States or Union territories, the
 *    supply is INTER-state and IGST applies.
 *  - Section 7(5): supply to or by a Special Economic Zone developer or unit, and any supply
 *    in the course of import or export, is treated as inter-state whatever the state codes say.
 *  - Section 16: exports and supplies to an SEZ are zero-rated — they can be made under a
 *    letter of undertaking without paying tax, or on payment of IGST with a refund claim.
 *
 * The state codes below are the first two digits of a GSTIN, taken from the census codes used
 * by the GST system.
 */

export const STATE_CODES = [
  { code: "01", name: "Jammu and Kashmir" },
  { code: "02", name: "Himachal Pradesh" },
  { code: "03", name: "Punjab" },
  { code: "04", name: "Chandigarh" },
  { code: "05", name: "Uttarakhand" },
  { code: "06", name: "Haryana" },
  { code: "07", name: "Delhi" },
  { code: "08", name: "Rajasthan" },
  { code: "09", name: "Uttar Pradesh" },
  { code: "10", name: "Bihar" },
  { code: "11", name: "Sikkim" },
  { code: "12", name: "Arunachal Pradesh" },
  { code: "13", name: "Nagaland" },
  { code: "14", name: "Manipur" },
  { code: "15", name: "Mizoram" },
  { code: "16", name: "Tripura" },
  { code: "17", name: "Meghalaya" },
  { code: "18", name: "Assam" },
  { code: "19", name: "West Bengal" },
  { code: "20", name: "Jharkhand" },
  { code: "21", name: "Odisha" },
  { code: "22", name: "Chhattisgarh" },
  { code: "23", name: "Madhya Pradesh" },
  { code: "24", name: "Gujarat" },
  { code: "26", name: "Dadra and Nagar Haveli and Daman and Diu" },
  { code: "27", name: "Maharashtra" },
  { code: "29", name: "Karnataka" },
  { code: "30", name: "Goa" },
  { code: "31", name: "Lakshadweep" },
  { code: "32", name: "Kerala" },
  { code: "33", name: "Tamil Nadu" },
  { code: "34", name: "Puducherry" },
  { code: "35", name: "Andaman and Nicobar Islands" },
  { code: "36", name: "Telangana" },
  { code: "37", name: "Andhra Pradesh" },
  { code: "38", name: "Ladakh" },
  { code: "97", name: "Other Territory" },
];

/**
 * Codes that no longer appear in new GSTINs. 25 (Daman and Diu) merged into 26 when the union
 * territories were combined in 2020; 28 was the undivided Andhra Pradesh before Telangana was
 * carved out, and new Andhra Pradesh registrations use 37.
 */
export const RETIRED_STATE_CODES = {
  25: "Daman and Diu — merged into code 26",
  28: "Andhra Pradesh (before bifurcation) — now code 37",
};

/** Union territories without their own legislature charge UTGST instead of SGST. */
export const UT_CODES_WITH_UTGST = ["04", "26", "31", "35", "38", "97"];

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

export function getState(code) {
  return STATE_CODES.find((entry) => entry.code === String(code).padStart(2, "0"));
}

/** Pull the two-digit state code out of a 15-character GSTIN. Returns null if it is not there. */
export function stateCodeFromGstin(gstin) {
  const value = String(gstin ?? "").trim().toUpperCase();
  if (value.length < 2) return null;
  const prefix = value.slice(0, 2);
  if (!/^\d{2}$/.test(prefix)) return null;
  return prefix;
}

/**
 * Decide the split and compute the amounts.
 *
 * @param {object} input
 * @param {string} input.supplierStateCode
 * @param {string} input.placeOfSupplyStateCode
 * @param {number} input.taxableValue
 * @param {number} input.gstRate           Total GST rate in per cent.
 * @param {number} [input.cessRate]        Ad valorem compensation cess in per cent.
 * @param {boolean} [input.sezInvolved]    Supply to or by an SEZ developer or unit.
 * @param {boolean} [input.exportSupply]   Supply in the course of export out of India.
 * @param {boolean} [input.underLut]       Zero-rated supply made under a letter of undertaking.
 * @returns {object} the split, or { error }.
 */
export function computeGstSplit({
  supplierStateCode,
  placeOfSupplyStateCode,
  taxableValue,
  gstRate,
  cessRate = 0,
  sezInvolved = false,
  exportSupply = false,
  underLut = false,
}) {
  const supplier = getState(supplierStateCode);
  const destination = getState(placeOfSupplyStateCode);
  if (!supplier) return { error: "Choose a valid supplier state code." };
  if (!destination && !exportSupply) return { error: "Choose a valid place-of-supply state code." };

  const base = Number(taxableValue);
  const rate = Number(gstRate);
  const cess = Number(cessRate);

  if (!Number.isFinite(base)) return { error: "Enter the taxable value as a number." };
  if (base < 0) return { error: "Taxable value cannot be negative." };
  if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
    return { error: "GST rate should be between 0% and 100%." };
  }
  if (!Number.isFinite(cess) || cess < 0 || cess > 100) {
    return { error: "Cess rate should be between 0% and 100%." };
  }

  const sameState = Boolean(destination) && supplier.code === destination.code;

  let supplyType;
  let reason;
  if (exportSupply) {
    supplyType = "export";
    reason =
      "Section 7(5)(a) of the IGST Act treats a supply in the course of export as inter-state, and section 16 makes it zero-rated.";
  } else if (sezInvolved) {
    supplyType = "sez";
    reason =
      "Section 7(5)(b) of the IGST Act treats any supply to or by an SEZ developer or unit as inter-state, even inside the same state.";
  } else if (sameState) {
    supplyType = "intra";
    reason = `Supplier and place of supply are both in ${supplier.name}, so section 8 of the IGST Act makes this an intra-state supply.`;
  } else {
    supplyType = "inter";
    reason = `Supplier is in ${supplier.name} and the place of supply is in ${destination.name}, so section 7 of the IGST Act makes this an inter-state supply.`;
  }

  const zeroRated = supplyType === "export" || supplyType === "sez";
  const chargeTax = !(zeroRated && underLut);

  const totalGst = chargeTax ? round2(base * (rate / 100)) : 0;
  const cessAmount = chargeTax ? round2(base * (cess / 100)) : 0;

  const isSplit = supplyType === "intra";
  const cgst = isSplit ? round2(totalGst / 2) : 0;
  const sgst = isSplit ? round2(totalGst - cgst) : 0;
  const igst = isSplit ? 0 : totalGst;

  const sgstLabel = UT_CODES_WITH_UTGST.includes(supplier.code) ? "UTGST" : "SGST";

  return {
    supplier: supplier.name,
    supplierCode: supplier.code,
    destination: supplyType === "export" ? "Outside India" : destination ? destination.name : "Outside India",
    destinationCode: supplyType === "export" ? null : destination ? destination.code : null,
    supplyType,
    reason,
    zeroRated,
    underLut: zeroRated ? underLut : false,
    taxHead: isSplit ? `CGST + ${sgstLabel}` : "IGST",
    sgstLabel,
    gstRate: rate,
    halfRate: round2(rate / 2),
    cessRate: cess,
    taxableValue: round2(base),
    cgst,
    sgst,
    igst,
    cessAmount,
    totalTax: round2(totalGst + cessAmount),
    invoiceTotal: round2(base + totalGst + cessAmount),
  };
}
