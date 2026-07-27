/**
 * Scholarship Income Certificate Helper.
 *
 * An income certificate (issued by the Tehsildar / SDM / revenue authority)
 * certifies the ANNUAL income of the family from ALL sources. This module
 * totals monthly earnings and other annual income exactly the way the
 * certificate form asks for it, then compares the figure against the income
 * ceilings published for common Indian scholarship schemes.
 *
 * Ceilings below are the widely published scheme guideline figures; schemes
 * revise them by notification, so the UI tells users to verify the current
 * year's guidelines before applying.
 */

export const MONTHS_PER_YEAR = 12;

/**
 * Income ceilings (annual family income, INR) from published scheme guidelines:
 * - Pre-Matric Scholarship for Minorities (Ministry of Minority Affairs): Rs 1,00,000
 * - Post-Matric Scholarship for Minorities: Rs 2,00,000
 * - Merit-cum-Means Scholarship for Minorities: Rs 2,50,000
 * - Post-Matric Scholarship for SC students (centrally sponsored): Rs 2,50,000
 * - National Means-cum-Merit Scholarship (NMMSS, Ministry of Education): Rs 3,50,000
 * - Central Sector Scheme of Scholarship for College & University Students (CSSS): Rs 4,50,000
 * - AICTE Pragati / Saksham scholarships: Rs 8,00,000
 * - EWS (Economically Weaker Section) certificate, per DoPT OM 36039/1/2019: Rs 8,00,000
 */
export const SCHEME_CEILINGS = [
  { id: "prematric-minority", name: "Pre-Matric Scholarship (Minorities)", ceiling: 100000 },
  { id: "postmatric-minority", name: "Post-Matric Scholarship (Minorities)", ceiling: 200000 },
  { id: "mcm-minority", name: "Merit-cum-Means Scholarship (Minorities)", ceiling: 250000 },
  { id: "postmatric-sc", name: "Post-Matric Scholarship (SC students)", ceiling: 250000 },
  { id: "nmmss", name: "National Means-cum-Merit Scholarship (NMMSS)", ceiling: 350000 },
  { id: "csss", name: "Central Sector Scheme (CSSS) for college students", ceiling: 450000 },
  { id: "pragati-saksham", name: "AICTE Pragati / Saksham", ceiling: 800000 },
  { id: "ews", name: "EWS certificate (10% reservation)", ceiling: 800000 },
];

/**
 * Documents most revenue offices ask for with the income certificate
 * application. Exact lists vary by state — this is the common core.
 */
export const DOCUMENT_CHECKLIST = [
  "Filled application form (state e-district portal or tehsil office)",
  "Self-declaration / affidavit of family income from all sources",
  "Salary slips or Form 16 for salaried earners (usually last 3-12 months)",
  "Income proof for self-employed earners (ITR, or a gram pradhan / patwari report)",
  "Aadhaar card of the applicant (and often of the head of family)",
  "Ration card, or another document listing family members",
  "Address proof (electricity bill, rent agreement or similar)",
  "Passport-size photograph of the applicant",
];

/**
 * Total the family's annual income from all sources.
 *
 * @param {object} input
 * @param {Array<{label?: string, monthly: number}>} input.earners
 *        Each earning family member's MONTHLY income.
 * @param {number} [input.otherAnnual] Annual income from other sources
 *        (agriculture, rent, pension, interest), already annual.
 * @returns {{annualIncome:number, monthlyTotal:number, earnerAnnuals:number[],
 *   otherAnnual:number, schemes:Array<{id:string,name:string,ceiling:number,
 *   withinCeiling:boolean,margin:number}>}|{error:string}}
 */
export function computeFamilyIncome({ earners, otherAnnual = 0 }) {
  if (!Array.isArray(earners) || earners.length === 0) {
    return { error: "Add at least one earning family member (enter 0 if none earn)." };
  }

  const earnerAnnuals = [];
  let monthlyTotal = 0;
  for (let i = 0; i < earners.length; i += 1) {
    const monthly = Number(earners[i]?.monthly);
    if (!Number.isFinite(monthly)) {
      return { error: `Earner ${i + 1}: enter the monthly income as a number (0 is fine).` };
    }
    if (monthly < 0) {
      return { error: `Earner ${i + 1}: monthly income cannot be negative.` };
    }
    monthlyTotal += monthly;
    earnerAnnuals.push(monthly * MONTHS_PER_YEAR);
  }

  const other = Number(otherAnnual);
  if (!Number.isFinite(other)) {
    return { error: "Enter other annual income as a number (0 is fine)." };
  }
  if (other < 0) {
    return { error: "Other annual income cannot be negative." };
  }

  const annualisedMonthly = monthlyTotal * MONTHS_PER_YEAR;
  const annualIncome = annualisedMonthly + other;

  const schemes = SCHEME_CEILINGS.map((scheme) => ({
    ...scheme,
    withinCeiling: annualIncome <= scheme.ceiling,
    margin: scheme.ceiling - annualIncome,
  }));

  return {
    annualIncome,
    monthlyTotal,
    annualisedMonthly,
    earnerAnnuals,
    otherAnnual: other,
    schemes,
  };
}
