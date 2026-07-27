/**
 * Does this activity need an Importer-Exporter Code (IEC)?
 *
 * Statutory basis — India
 *  - Section 7 of the Foreign Trade (Development and Regulation) Act, 1992: no person may
 *    import or export except under an IEC number granted by the DGFT.
 *  - Foreign Trade Policy 2023, Para 2.05: IEC is mandatory for import/export of GOODS.
 *    For SERVICES or TECHNOLOGY, IEC is required only when the provider is taking benefits
 *    under the FTP or when the service/technology is a SCOMET item (Appendix 3 list of
 *    dual-use items), in which case specific provisions of the FTP apply.
 *  - Since GST (Trade Notice 23/2018-19, DGFT), the IEC issued IS the firm's PAN — but it
 *    still has to be applied for and granted by DGFT on the portal.
 *  - FTP 2023 Para 2.07 / Handbook of Procedures: categories exempt from IEC —
 *      (i)  Ministries and Departments of the Central or a State Government;
 *      (ii) persons importing or exporting for personal use, not connected with trade,
 *           manufacture or agriculture;
 *      (iii) persons importing/exporting from/to Nepal or Myanmar through Indo-Myanmar
 *           border areas, or China through Gunji, Namgaya Shipkila or Nathula ports,
 *           provided the CIF value of a single consignment does not exceed Rs 25,000
 *           (Rs 1,00,000 for trade through Nathula).
 *    Exemption from IEC never applies to export of SCOMET items.
 *  - Application: online form ANF-2A on dgft.gov.in, government fee Rs 500, normally
 *    auto-granted the same day.
 *  - FTP 2023 Para 2.05(e): every IEC holder must confirm/update the IEC electronically
 *    between April and June each year, failing which the IEC is deactivated.
 */

/** FTP Para 2.07: per-consignment CIF ceiling for the border-trade exemption. */
export const BORDER_TRADE_CIF_LIMIT = 25000; // Rs 25,000 — Nepal, Myanmar border, China (Gunji, Namgaya Shipkila)
export const NATHULA_CIF_LIMIT = 100000; // Rs 1,00,000 — trade with China through Nathula port

/** DGFT application fee for form ANF-2A. */
export const IEC_APPLICATION_FEE = 500;

/** FTP 2023 Para 2.05(e): annual electronic update window. */
export const ANNUAL_UPDATE_WINDOW = "April to June every year";

export const DEALING_OPTIONS = [
  { id: "goods", label: "Goods — physical import or export" },
  { id: "services", label: "Services — software, consulting, freelancing, SaaS" },
  { id: "technology", label: "Technology transfer" },
];

export const BORDER_ROUTE_OPTIONS = [
  { id: "none", label: "Ordinary trade — any port, airport or courier" },
  { id: "nepal", label: "Trade with Nepal" },
  { id: "myanmar", label: "Trade with Myanmar through Indo-Myanmar border areas" },
  { id: "china-other", label: "Trade with China through Gunji or Namgaya Shipkila" },
  { id: "nathula", label: "Trade with China through Nathula port" },
];

const DEALING_IDS = DEALING_OPTIONS.map((option) => option.id);
const ROUTE_IDS = BORDER_ROUTE_OPTIONS.map((option) => option.id);

/** Verdict levels used by the UI. */
export const VERDICTS = {
  required: "IEC required",
  notRequired: "IEC not required",
};

/**
 * Decide whether an IEC is needed.
 *
 * @param {object} input
 * @param {string}  input.dealing           "goods" | "services" | "technology".
 * @param {boolean} input.personalUse       Import/export for personal use, not connected with
 *                                          trade, manufacture or agriculture.
 * @param {boolean} input.isGovernment      Applicant is a Ministry/Department of Central or
 *                                          State Government.
 * @param {string}  input.borderRoute       One of BORDER_ROUTE_OPTIONS ids.
 * @param {number}  [input.consignmentCif]  CIF value of a single consignment in rupees,
 *                                          used only for border-trade routes.
 * @param {boolean} input.claimsFtpBenefits Service/technology provider takes FTP benefits.
 * @param {boolean} input.isScomet          The item is on the SCOMET dual-use list.
 * @returns {object} { required, headline, reasons, nextSteps } or { error }.
 */
export function checkIecRequirement({
  dealing = "goods",
  personalUse = false,
  isGovernment = false,
  borderRoute = "none",
  consignmentCif = 0,
  claimsFtpBenefits = false,
  isScomet = false,
}) {
  if (!DEALING_IDS.includes(dealing)) {
    return { error: "Choose what you are importing or exporting." };
  }
  if (!ROUTE_IDS.includes(borderRoute)) {
    return { error: "Choose the trade route." };
  }
  const cif = Number(consignmentCif);
  if (!Number.isFinite(cif) || cif < 0) {
    return { error: "Consignment value must be zero or more." };
  }

  const reasons = [];
  let required = false;

  // SCOMET beats every exemption, for goods, services and technology alike.
  if (isScomet) {
    required = true;
    reasons.push(
      "The item is on the SCOMET list. Export of SCOMET items is never exempt from IEC, and a separate SCOMET authorisation from DGFT is also needed.",
    );
  }

  if (!isScomet && isGovernment) {
    reasons.push(
      "Ministries and Departments of the Central and State Governments are exempt from IEC under the FTP exemption list.",
    );
    return buildResult(false, reasons, dealing);
  }

  if (dealing === "services" || dealing === "technology") {
    if (isScomet) {
      // already required above
    } else if (claimsFtpBenefits) {
      required = true;
      reasons.push(
        "For services and technology, FTP 2023 Para 2.05 makes IEC necessary when the provider takes benefits under the Foreign Trade Policy.",
      );
    } else {
      reasons.push(
        "Export of services or technology without claiming FTP benefits does not require an IEC — banks process the remittance against your PAN and an RBI purpose code.",
      );
      reasons.push(
        "Many exporters still take an IEC voluntarily because some banks and marketplaces ask for it, and it is needed the day you claim any FTP benefit.",
      );
    }
    return buildResult(required, reasons, dealing);
  }

  // Goods.
  if (!isScomet && personalUse) {
    reasons.push(
      "Import or export of goods for personal use, not connected with trade, manufacture or agriculture, is exempt from IEC under the FTP exemption list.",
    );
    return buildResult(false, reasons, dealing);
  }

  if (!isScomet && borderRoute !== "none") {
    const limit = borderRoute === "nathula" ? NATHULA_CIF_LIMIT : BORDER_TRADE_CIF_LIMIT;
    if (cif > 0 && cif <= limit) {
      reasons.push(
        `Trade on this route is exempt from IEC while the CIF value of a single consignment stays within Rs ${limit.toLocaleString("en-IN")}. Your consignment of Rs ${cif.toLocaleString("en-IN")} is within the ceiling.`,
      );
      return buildResult(false, reasons, dealing);
    }
    if (cif > limit) {
      required = true;
      reasons.push(
        `The border-trade exemption on this route is capped at Rs ${limit.toLocaleString("en-IN")} CIF per consignment; your consignment of Rs ${cif.toLocaleString("en-IN")} exceeds it, so an IEC is required.`,
      );
      return buildResult(true, reasons, dealing);
    }
    reasons.push(
      `Enter the consignment CIF value: this route is exempt only up to Rs ${limit.toLocaleString("en-IN")} per consignment. Without a value the general rule applies.`,
    );
  }

  required = true;
  reasons.push(
    "Commercial import or export of goods requires an IEC under section 7 of the Foreign Trade (Development and Regulation) Act, 1992 and FTP 2023 Para 2.05. Customs will not clear a commercial shipment without it.",
  );
  return buildResult(true, reasons, dealing);
}

function buildResult(required, reasons, dealing) {
  const nextSteps = required
    ? [
        `Apply online in form ANF-2A on dgft.gov.in — government fee Rs ${IEC_APPLICATION_FEE}, normally auto-granted the same day.`,
        "Since 2017 the IEC is your PAN; you need a PAN, a bank account in the firm's name and a business address proof.",
        `Confirm or update the IEC on the DGFT portal every year (${ANNUAL_UPDATE_WINDOW}) or it is deactivated.`,
      ]
    : [
        "No DGFT application is needed for this activity as described.",
        "If circumstances change — you start trading commercially, exceed a border-trade ceiling, or claim FTP benefits — apply before the first shipment.",
        dealing === "goods"
          ? "Keep evidence that the goods are for personal use; customs may ask."
          : "Keep your PAN and RBI purpose codes handy for bank remittances.",
      ];
  return {
    required,
    headline: required ? VERDICTS.required : VERDICTS.notRequired,
    reasons,
    nextSteps,
    applicationFee: IEC_APPLICATION_FEE,
    updateWindow: ANNUAL_UPDATE_WINDOW,
  };
}
