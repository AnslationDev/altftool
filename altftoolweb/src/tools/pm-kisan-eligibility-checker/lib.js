/**
 * PM-KISAN (Pradhan Mantri Kisan Samman Nidhi) eligibility rules.
 *
 * Source: the PM-KISAN operational guidelines of the Department of Agriculture
 * and Farmers Welfare, Ministry of Agriculture and Farmers Welfare.
 *
 * Key rules encoded here:
 *  - The scheme pays Rs 6,000 a year to an eligible landholding farmer family in
 *    three equal four-monthly instalments of Rs 2,000, by direct benefit transfer.
 *  - The unit of benefit is the FAMILY, defined as husband, wife and minor
 *    children who own cultivable land. One family gets one benefit, not one per
 *    adult.
 *  - The scheme originally covered only small and marginal farmers with up to
 *    2 hectares of cultivable land. That landholding ceiling was WITHDRAWN with
 *    effect from 1 June 2019, so all landholding farmer families are covered
 *    regardless of the size of the holding.
 *  - Land records must stand in the applicant's name, subject to the special
 *    dispensation the guidelines give to certain states and union territories
 *    where land records are maintained differently.
 *  - The guidelines list exclusion categories; a family is out if ANY member
 *    falls into one of them.
 *  - Aadhaar seeding, e-KYC and a DBT-enabled bank account are required for the
 *    instalment to be released, even where the family is otherwise eligible.
 *
 * This module is a rules engine, not tax or legal advice.
 */

/** Annual benefit under the scheme, in rupees. */
export const ANNUAL_BENEFIT = 6000;

/** Number of instalments a year. */
export const INSTALMENTS_PER_YEAR = 3;

/** Amount of each instalment, in rupees. */
export const INSTALMENT_AMOUNT = ANNUAL_BENEFIT / INSTALMENTS_PER_YEAR;

/**
 * Monthly pension at or above which a retired person is excluded. Multi Tasking
 * Staff, Class IV and Group D pensioners are outside this exclusion.
 */
export const PENSION_EXCLUSION_THRESHOLD = 10000;

/**
 * Landholding ceiling that applied before 1 June 2019, in hectares. Kept as a
 * documented constant because the limit is still widely believed to apply.
 */
export const WITHDRAWN_LANDHOLDING_CEILING_HECTARES = 2;

/** The four-monthly instalment windows used by the scheme. */
export const INSTALMENT_WINDOWS = [
  "April to July",
  "August to November",
  "December to March",
];

/**
 * The exclusion categories in the operational guidelines, in the order they
 * appear there.
 */
export const EXCLUSION_CRITERIA = [
  {
    id: "institutional",
    label: "The land is held by an institution rather than by a family",
    detail: "All institutional landholders are excluded.",
  },
  {
    id: "constitutionalPost",
    label: "A family member holds or has held a constitutional post",
    detail: "Former and present holders of constitutional posts are excluded.",
  },
  {
    id: "politicalOffice",
    label:
      "A family member is or was a Minister, MP, MLA, MLC, Mayor of a municipal corporation or Chairperson of a district panchayat",
    detail: "Former and present holders of these offices are excluded.",
  },
  {
    id: "governmentEmployee",
    label:
      "A family member is a serving or retired officer or employee of central or state government, a PSU, an autonomous body or a local body",
    detail:
      "Multi Tasking Staff, Class IV and Group D employees are NOT excluded by this clause.",
  },
  {
    id: "pensioner",
    label: `A retired family member draws a monthly pension of Rs ${PENSION_EXCLUSION_THRESHOLD.toLocaleString("en-IN")} or more`,
    detail:
      "Multi Tasking Staff, Class IV and Group D pensioners are outside this exclusion whatever the pension.",
  },
  {
    id: "incomeTaxPayer",
    label: "A family member paid income tax in the last assessment year",
    detail: "Paying income tax in the last assessment year excludes the family.",
  },
  {
    id: "professional",
    label:
      "A family member is a practising doctor, engineer, lawyer, chartered accountant or architect registered with a professional body",
    detail: "The exclusion applies to registered professionals who are actually practising.",
  },
];

const isBool = (value) => typeof value === "boolean";
const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Check a farmer family against the PM-KISAN rules.
 *
 * @param {object} input
 * @param {boolean} input.ownsCultivableLand family owns cultivable land
 * @param {number} [input.landHectares] size of the holding, informational only
 * @param {boolean} [input.landRecordInName] land records stand in the applicant's name
 * @param {boolean} [input.institutionalLandholder]
 * @param {boolean} [input.constitutionalPost]
 * @param {boolean} [input.politicalOffice]
 * @param {boolean} [input.governmentEmployee] serving or retired
 * @param {boolean} [input.groupDEmployee] Multi Tasking Staff / Class IV / Group D
 * @param {boolean} [input.isPensioner]
 * @param {number} [input.monthlyPension]
 * @param {boolean} [input.paidIncomeTaxLastYear]
 * @param {boolean} [input.practisingProfessional]
 * @param {boolean} [input.aadhaarSeeded]
 * @param {boolean} [input.eKycDone]
 * @param {boolean} [input.bankAccountDbtEnabled]
 * @returns {object} verdict, or { error } when the input is unusable
 */
export function checkPmKisanEligibility({
  ownsCultivableLand = false,
  landHectares = 0,
  landRecordInName = true,
  institutionalLandholder = false,
  constitutionalPost = false,
  politicalOffice = false,
  governmentEmployee = false,
  groupDEmployee = false,
  isPensioner = false,
  monthlyPension = 0,
  paidIncomeTaxLastYear = false,
  practisingProfessional = false,
  aadhaarSeeded = true,
  eKycDone = true,
  bankAccountDbtEnabled = true,
} = {}) {
  const flags = [
    ownsCultivableLand,
    landRecordInName,
    institutionalLandholder,
    constitutionalPost,
    politicalOffice,
    governmentEmployee,
    groupDEmployee,
    isPensioner,
    paidIncomeTaxLastYear,
    practisingProfessional,
    aadhaarSeeded,
    eKycDone,
    bankAccountDbtEnabled,
  ];
  if (!flags.every(isBool)) {
    return { error: "Answer every yes or no question." };
  }
  if (!isNum(landHectares) || !isNum(monthlyPension)) {
    return { error: "Enter a valid number for the landholding and the pension." };
  }
  if (landHectares < 0 || monthlyPension < 0) {
    return { error: "Landholding and pension cannot be negative." };
  }
  if (landHectares > 100000) {
    return { error: "Enter a landholding below 1,00,000 hectares." };
  }
  if (monthlyPension > 1e7) {
    return { error: "Enter a monthly pension below Rs 1 crore." };
  }

  const disqualifiers = [];

  if (!ownsCultivableLand) {
    disqualifiers.push(
      "The family does not own cultivable land. PM-KISAN covers landholding farmer families only, so tenant farmers and agricultural labourers are outside it.",
    );
  }
  if (institutionalLandholder) {
    disqualifiers.push("All institutional landholders are excluded from the scheme.");
  }
  if (constitutionalPost) {
    disqualifiers.push("A family member holds or has held a constitutional post.");
  }
  if (politicalOffice) {
    disqualifiers.push(
      "A family member is or was a Minister, MP, MLA, MLC, Mayor or district panchayat Chairperson.",
    );
  }
  if (governmentEmployee && !groupDEmployee) {
    disqualifiers.push(
      "A family member is a serving or retired government, PSU, autonomous body or local body employee above Group D.",
    );
  }
  if (isPensioner && !groupDEmployee && monthlyPension >= PENSION_EXCLUSION_THRESHOLD) {
    disqualifiers.push(
      `A retired family member draws a monthly pension of Rs ${monthlyPension.toLocaleString("en-IN")}, which is at or above the Rs ${PENSION_EXCLUSION_THRESHOLD.toLocaleString("en-IN")} exclusion threshold.`,
    );
  }
  if (paidIncomeTaxLastYear) {
    disqualifiers.push("A family member paid income tax in the last assessment year.");
  }
  if (practisingProfessional) {
    disqualifiers.push(
      "A family member is a registered professional in practice — doctor, engineer, lawyer, chartered accountant or architect.",
    );
  }

  const pendingActions = [];
  if (!landRecordInName) {
    pendingActions.push(
      "Get the land records mutated into your name. Some states and union territories have a special dispensation, so check with the local revenue office.",
    );
  }
  if (!aadhaarSeeded) {
    pendingActions.push("Seed your Aadhaar number with the PM-KISAN record and the bank account.");
  }
  if (!eKycDone) {
    pendingActions.push("Complete e-KYC on the PM-KISAN portal or at a Common Service Centre.");
  }
  if (!bankAccountDbtEnabled) {
    pendingActions.push("Link a DBT-enabled bank account, otherwise the instalment cannot be credited.");
  }

  const eligible = disqualifiers.length === 0;
  const paymentBlocked = eligible && pendingActions.length > 0;

  return {
    eligible,
    paymentBlocked,
    disqualifiers,
    pendingActions,
    annualBenefit: eligible ? ANNUAL_BENEFIT : 0,
    instalmentAmount: eligible ? INSTALMENT_AMOUNT : 0,
    instalmentsPerYear: INSTALMENTS_PER_YEAR,
    instalmentWindows: INSTALMENT_WINDOWS,
    landHectares,
    /** True where the holding is above the ceiling that applied before 1 June 2019. */
    aboveWithdrawnCeiling: landHectares > WITHDRAWN_LANDHOLDING_CEILING_HECTARES,
    withdrawnCeilingHectares: WITHDRAWN_LANDHOLDING_CEILING_HECTARES,
    status: !eligible ? "not-eligible" : paymentBlocked ? "eligible-action-needed" : "eligible",
    summary: !eligible
      ? "Not eligible on the criteria entered"
      : paymentBlocked
        ? "Eligible, but the instalment cannot be released yet"
        : "Eligible for the full annual benefit",
  };
}
