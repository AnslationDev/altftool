/**
 * Family income as an Indian income certificate application computes it.
 *
 * The same rupee of income counts differently depending on the certificate, which is
 * the single most common reason applications are rejected. Rule sources:
 *
 *  A. EWS (Economically Weaker Sections, the 10% reservation) — Department of
 *     Personnel and Training OM No. 36039/1/2019-Estt(Res) dated 31 January 2019,
 *     following the Ministry of Social Justice and Empowerment OM of 17 January 2019:
 *       • eligible where the FAMILY has a gross annual income BELOW ₹8,00,000;
 *       • income is counted from ALL sources — salary, agriculture, business and
 *         profession alike;
 *       • the year tested is the financial year immediately preceding the year of
 *         application;
 *       • "family" means the applicant, their parents, siblings below 18 years, and
 *         the spouse and children below 18 years;
 *       • separate asset tests disqualify irrespective of income, and property in
 *         different locations is clubbed for those tests.
 *
 *  B. OBC non-creamy-layer — DoPT OM No. 36012/22/93-Estt.(SCT) dated 8 September
 *     1993, with the ceiling raised to ₹8,00,000 a year by OM No. 36033/1/2013-
 *     Estt.(Res.) dated 13 September 2017:
 *       • the Category VI income test looks at gross annual income for three
 *         consecutive years;
 *       • income from SALARY and from AGRICULTURAL LAND is expressly excluded when
 *         applying that income test (DoPT clarification dated 14 October 2004);
 *       • the income tested is that of the candidate's parents. The candidate's own
 *         income, and the income of the candidate's spouse, are not counted;
 *       • the income test is only one of six categories. Constitutional posts,
 *         Group A and Group B service, armed forces rank and professional standing
 *         can place a family in the creamy layer whatever the income.
 *
 *  C. State income certificates issued by a Tahsildar, SDM or revenue officer follow
 *     state rules. They generally aggregate every source for the whole household, but
 *     the ceiling, the definition of family and the number of years differ from state
 *     to state, so the limit is an input here rather than a fixed constant.
 *
 * Informational only. It is not legal advice, and a certificate is issued only after
 * the revenue authority's own enquiry.
 */

/** EWS eligibility requires gross annual family income strictly BELOW this figure. */
export const EWS_INCOME_LIMIT = 800000;

/** OBC creamy layer begins at this gross annual income, so non-creamy-layer needs less. */
export const OBC_CREAMY_LAYER_LIMIT = 800000;

/** Consecutive years over which the OBC income test is applied. */
export const OBC_TEST_YEARS = 3;

/** EWS asset test: agricultural land of this size and above disqualifies. */
export const EWS_LAND_LIMIT_ACRES = 5;

/** EWS asset test: a residential flat of this floor area and above disqualifies. */
export const EWS_FLAT_LIMIT_SQFT = 1000;

/** EWS asset test: a residential plot this size and above in a notified municipality. */
export const EWS_PLOT_LIMIT_NOTIFIED_SQYD = 100;

/** EWS asset test: a residential plot this size and above outside notified municipalities. */
export const EWS_PLOT_LIMIT_OTHER_SQYD = 200;

/** Every income head an application form asks about. */
export const INCOME_SOURCES = [
  { id: "salary", label: "Salary and wages", hint: "Gross pay of every earning member, before deductions" },
  { id: "pension", label: "Pension and family pension", hint: "Including commuted pension received in the year" },
  { id: "agriculture", label: "Agricultural income", hint: "Net income from land held by the family" },
  { id: "business", label: "Business and profession", hint: "Net profit after allowable business expenses" },
  { id: "houseRent", label: "Rent from house property", hint: "Annual rent received, net of municipal tax" },
  { id: "interestDividend", label: "Interest and dividend", hint: "Bank, post office, bonds, shares and mutual funds" },
  { id: "other", label: "Any other income", hint: "Remittances, contract work, royalties and the like" },
];

/**
 * The certificates this calculator supports, and what each one counts.
 * `excludes` lists the income source ids that the rule leaves out of the test.
 */
export const CERTIFICATE_PURPOSES = [
  {
    id: "ews",
    label: "EWS certificate (10% reservation)",
    limit: EWS_INCOME_LIMIT,
    fixedLimit: true,
    excludes: [],
    assetTest: true,
    family:
      "the applicant, their parents, siblings below 18 years, and the spouse and children below 18 years",
    period: "the financial year immediately before the year of application",
    rule: "DoPT OM No. 36039/1/2019-Estt(Res) dated 31 January 2019",
  },
  {
    id: "obc",
    label: "OBC non-creamy-layer certificate",
    limit: OBC_CREAMY_LAYER_LIMIT,
    fixedLimit: true,
    excludes: ["salary", "agriculture"],
    assetTest: false,
    family:
      "the candidate's parents. The candidate's own income and their spouse's income are not counted",
    period: `${OBC_TEST_YEARS} consecutive financial years`,
    rule: "DoPT OM No. 36033/1/2013-Estt.(Res.) dated 13 September 2017",
  },
  {
    id: "state",
    label: "State income certificate or scholarship",
    limit: 100000,
    fixedLimit: false,
    excludes: [],
    assetTest: false,
    family: "every member of the household who lives together and is dependent",
    period: "usually the last financial year, though some states ask for three",
    rule: "state revenue department rules — the ceiling and family definition vary by state",
  },
];

const round2 = (value) => Math.round(value * 100) / 100;

/**
 * Run the EWS asset tests. Each one disqualifies on its own, whatever the income.
 *
 * @param {object} assets
 * @param {number} assets.agriculturalLandAcres
 * @param {number} assets.flatAreaSqft
 * @param {number} assets.plotAreaSqyd
 * @param {boolean} assets.plotInNotifiedMunicipality
 * @returns {Array<{id:string,label:string,failed:boolean,detail:string}>}
 */
export function runEwsAssetTests({
  agriculturalLandAcres = 0,
  flatAreaSqft = 0,
  plotAreaSqyd = 0,
  plotInNotifiedMunicipality = true,
} = {}) {
  const land = Number(agriculturalLandAcres) || 0;
  const flat = Number(flatAreaSqft) || 0;
  const plot = Number(plotAreaSqyd) || 0;
  const plotLimit = plotInNotifiedMunicipality
    ? EWS_PLOT_LIMIT_NOTIFIED_SQYD
    : EWS_PLOT_LIMIT_OTHER_SQYD;

  return [
    {
      id: "land",
      label: `Agricultural land of ${EWS_LAND_LIMIT_ACRES} acres or more`,
      failed: land >= EWS_LAND_LIMIT_ACRES,
      detail: `Family holds ${land} acre(s). Land in different locations is clubbed for this test.`,
    },
    {
      id: "flat",
      label: `Residential flat of ${EWS_FLAT_LIMIT_SQFT} sq ft or more`,
      failed: flat >= EWS_FLAT_LIMIT_SQFT,
      detail: `Family holds ${flat} sq ft of residential flat area.`,
    },
    {
      id: "plot",
      label: `Residential plot of ${plotLimit} sq yards or more${plotInNotifiedMunicipality ? " in a notified municipality" : " outside a notified municipality"}`,
      failed: plot >= plotLimit,
      detail: `Family holds ${plot} sq yard(s). The limit is ${EWS_PLOT_LIMIT_NOTIFIED_SQYD} sq yards inside a notified municipality and ${EWS_PLOT_LIMIT_OTHER_SQYD} outside it.`,
    },
  ];
}

/**
 * Aggregate family income for a chosen certificate and test it against the limit.
 *
 * @param {object} input
 * @param {string} input.purpose        One of the CERTIFICATE_PURPOSES ids.
 * @param {object} input.incomes        Amounts keyed by INCOME_SOURCES id, in INR per year.
 * @param {number} [input.customLimit]  Ceiling to use where the purpose has no fixed one.
 * @param {object} [input.assets]       EWS asset figures.
 * @returns {object} result object, or { error } for input that cannot be used.
 */
export function computeCertificateIncome({
  purpose = "ews",
  incomes = {},
  customLimit,
  assets = {},
} = {}) {
  const certificate = CERTIFICATE_PURPOSES.find((entry) => entry.id === purpose);
  if (!certificate) return { error: "Choose one of the certificate types listed." };

  const rows = INCOME_SOURCES.map((source) => {
    const raw = incomes[source.id];
    const amount = raw === undefined || raw === null || raw === "" ? 0 : Number(raw);
    return { ...source, amount, counted: !certificate.excludes.includes(source.id) };
  });

  if (!rows.every((row) => Number.isFinite(row.amount))) {
    return { error: "Enter valid numbers for every income head — use 0 where there is none." };
  }
  if (rows.some((row) => row.amount < 0)) {
    return { error: "Income cannot be negative. Enter 0 where a head does not apply." };
  }
  if (rows.some((row) => row.amount > 1e11)) {
    return { error: "That income figure is outside the range of this calculator." };
  }

  let limit = certificate.limit;
  if (!certificate.fixedLimit) {
    const supplied = Number(customLimit);
    if (customLimit !== undefined && customLimit !== null && customLimit !== "") {
      if (!Number.isFinite(supplied) || supplied <= 0) {
        return { error: "Enter your state's income ceiling as a positive number." };
      }
      if (supplied > 1e10) return { error: "That ceiling is outside the range of this calculator." };
      limit = supplied;
    }
  }

  const assetNumbers = {
    agriculturalLandAcres: Number(assets.agriculturalLandAcres ?? 0),
    flatAreaSqft: Number(assets.flatAreaSqft ?? 0),
    plotAreaSqyd: Number(assets.plotAreaSqyd ?? 0),
    plotInNotifiedMunicipality: assets.plotInNotifiedMunicipality !== false,
  };
  const assetValues = [
    assetNumbers.agriculturalLandAcres,
    assetNumbers.flatAreaSqft,
    assetNumbers.plotAreaSqyd,
  ];
  if (!assetValues.every((value) => Number.isFinite(value))) {
    return { error: "Enter valid numbers for land, flat and plot area — use 0 for none." };
  }
  if (assetValues.some((value) => value < 0)) {
    return { error: "Land, flat and plot areas cannot be negative." };
  }

  const countedRows = rows.filter((row) => row.counted);
  const excludedRows = rows.filter((row) => !row.counted);

  const countedTotal = round2(countedRows.reduce((sum, row) => sum + row.amount, 0));
  const excludedTotal = round2(excludedRows.reduce((sum, row) => sum + row.amount, 0));
  const grossTotal = round2(countedTotal + excludedTotal);

  // Both the EWS and the OBC ceilings are worded as "below" / "or above", so the
  // limit figure itself fails the test.
  const withinLimit = countedTotal < limit;
  const headroom = round2(limit - countedTotal);
  const usedShare = limit > 0 ? round2(Math.min(100, (countedTotal / limit) * 100)) : 100;
  const monthlyCounted = round2(countedTotal / 12);

  const assetTests = certificate.assetTest ? runEwsAssetTests(assetNumbers) : [];
  const failedAssetTests = assetTests.filter((test) => test.failed);
  const assetDisqualified = failedAssetTests.length > 0;

  const eligible = withinLimit && !assetDisqualified;

  let verdict;
  if (assetDisqualified) {
    verdict = `Not eligible — ${failedAssetTests.length} asset test failed, which disqualifies whatever the income.`;
  } else if (!withinLimit) {
    verdict = `Not eligible — counted income of ${countedTotal} is at or above the ${limit} ceiling.`;
  } else {
    verdict = `Within the ceiling, with ${headroom} of headroom on the counted income.`;
  }

  return {
    certificate,
    rows,
    countedRows,
    excludedRows,
    countedTotal,
    excludedTotal,
    grossTotal,
    monthlyCounted,
    limit,
    withinLimit,
    headroom,
    usedShare,
    assetTests,
    failedAssetTests,
    assetDisqualified,
    eligible,
    verdict,
  };
}

export default computeCertificateIncome;
