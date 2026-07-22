// Loans registry — the single source of truth for the Loans module.
//
// Each vertical is one data file in this folder. Import it below and add it to
// LOANS (order = display order in the hub, footer and cross-links). The route
// under src/app/business-ops/loans/<slug>/ and the collections.js listing derive from
// this array, so a new loan type is: one data file + one line here.

import personalLoan from "./personal-loan";
import debtConsolidation from "./debt-consolidation";
import homeMortgage from "./home-mortgage";
import mortgageRefinance from "./mortgage-refinance";
import heloc from "./heloc";
import autoLoan from "./auto-loan";
import autoRefinance from "./auto-refinance";
import businessLoan from "./business-loan";
import sbaLoan from "./sba-loan";
import badCreditLoan from "./bad-credit-loan";
import studentLoanRefinance from "./student-loan-refinance";
import creditBuilderLoan from "./credit-builder-loan";

export const LOANS = [
  personalLoan,
  debtConsolidation,
  homeMortgage,
  mortgageRefinance,
  heloc,
  autoLoan,
  autoRefinance,
  businessLoan,
  sbaLoan,
  badCreditLoan,
  studentLoanRefinance,
  creditBuilderLoan,
];

const BY_SLUG = new Map(LOANS.map((loan) => [loan.slug, loan]));

export function getLoan(slug) {
  return BY_SLUG.get(slug) ?? null;
}
