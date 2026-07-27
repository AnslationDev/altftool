/**
 * First-year cost of a baby.
 *
 * The estimate is built bottom-up from quantities rather than from a single lump figure,
 * because the quantities are the part people underestimate.
 *
 * Diapers. Usage falls steadily through the first year, so the count is summed over four
 * quarters at the typical rate for each stage rather than at one flat number:
 *
 *     diapers = Σ perDay(quarter) * 3 months * DAYS_PER_MONTH
 *
 * With the default profile (9, 7, 6 and 5 a day) that is about 2,464 diapers in the first
 * twelve months. Every rate is adjustable, because cloth nappies change the picture
 * entirely.
 *
 * Feeding. Formula spend is scaled by how the baby is fed: exclusively breastfed costs
 * nothing in tins, mixed feeding is modelled at half the formula volume, and exclusive
 * formula at the full amount. The WHO and India's Ministry of Health both recommend
 * exclusive breastfeeding for the first six months, after which complementary foods begin,
 * so solids are counted only from month 6 onwards.
 *
 * Immunisation. India's National Immunisation Schedule has five routine contacts in the
 * first year — at birth, 6 weeks, 10 weeks, 14 weeks and 9 months. Those vaccines are
 * provided free at government facilities; the per-visit cost input covers private paediatric
 * schedules, which add optional vaccines and consultation fees.
 *
 * Everything else is a monthly amount multiplied by the months it applies for. One-off
 * costs are reduced by whatever a maternity insurance policy actually reimburses.
 *
 * Finally the total is turned into a monthly saving using an ordinary annuity over the
 * months you have before the baby arrives:  C = gap * i / ((1+i)^n - 1).
 */

/** 365 / 12, so a "month" of daily consumption is counted consistently. */
export const DAYS_PER_MONTH = 365 / 12;

/** Typical diapers a day by stage. Usage drops as feeds space out and solids begin. */
export const DIAPER_PROFILE = [
  { label: "0-3 months", months: 3, perDay: 9 },
  { label: "3-6 months", months: 3, perDay: 7 },
  { label: "6-9 months", months: 3, perDay: 6 },
  { label: "9-12 months", months: 3, perDay: 5 },
];

/** Share of full formula volume by feeding pattern. */
export const FEEDING_MODES = [
  { id: "breast", label: "Exclusively breastfed", formulaShare: 0 },
  { id: "mixed", label: "Mixed feeding", formulaShare: 0.5 },
  { id: "formula", label: "Formula fed", formulaShare: 1 },
];

/** WHO and MoHFW guidance: complementary foods start at six completed months. */
export const SOLIDS_START_MONTH = 6;
/** Routine contacts in India's National Immunisation Schedule during year one. */
export const NIS_YEAR_ONE_VISITS = 5;
export const MONTHS_IN_YEAR = 12;

export const MAX_MONTHS_TO_BIRTH = 24;
export const MAX_RATE_PCT = 20;

const toNumber = (value, fallback = 0) => {
  if (value === "" || value === null || value === undefined) return fallback;
  const number = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(number) ? number : NaN;
};

const round0 = (value) => Math.round(value);
const round2 = (value) => Math.round(value * 100) / 100;

/** Total diapers used across the first year for a given daily-rate profile. */
export function diapersInFirstYear(profile = DIAPER_PROFILE, scale = 1) {
  return profile.reduce(
    (total, stage) => total + stage.perDay * scale * stage.months * DAYS_PER_MONTH,
    0,
  );
}

/**
 * @param {object} input
 * @param {number|string} [input.deliveryCost] Hospital and delivery package.
 * @param {number|string} [input.prenatalCost] Scans, tests and consultations before birth.
 * @param {number|string} [input.gearCost] Cot, pram, car seat, sterilisers and other one-offs.
 * @param {number|string} [input.insuranceReimbursement] Amount the maternity policy pays back.
 * @param {number|string} [input.diaperPrice] Price of one disposable diaper.
 * @param {number|string} [input.diaperUsageScale] Multiplier on the standard usage profile.
 * @param {string} [input.feedingMode] One of FEEDING_MODES ids.
 * @param {number|string} [input.formulaTinsPerMonth] Tins a month at full formula feeding.
 * @param {number|string} [input.formulaTinPrice] Price of one tin.
 * @param {number|string} [input.solidsPerMonth] Monthly spend on baby food once solids start.
 * @param {number|string} [input.clothingPerMonth] Clothes and bedding a month.
 * @param {number|string} [input.vaccinationVisitCost] Cost of one immunisation visit.
 * @param {number|string} [input.vaccinationVisits] Number of immunisation visits in year one.
 * @param {number|string} [input.doctorVisits] Paediatric consultations beyond immunisation.
 * @param {number|string} [input.doctorVisitCost] Cost per consultation.
 * @param {number|string} [input.childcarePerMonth] Creche or nanny cost per month.
 * @param {number|string} [input.childcareMonths] Months of paid childcare in year one.
 * @param {number|string} [input.miscPerMonth] Everything else, per month.
 * @param {number|string} [input.monthsToBirth] Months you have left to save.
 * @param {number|string} [input.existingSavings] Amount already set aside.
 * @param {number|string} [input.savingsReturn] Return on those savings, % per year.
 */
export function estimateBabyFirstYearCost({
  deliveryCost = 0,
  prenatalCost = 0,
  gearCost = 0,
  insuranceReimbursement = 0,
  diaperPrice = 0,
  diaperUsageScale = 1,
  feedingMode = "mixed",
  formulaTinsPerMonth = 0,
  formulaTinPrice = 0,
  solidsPerMonth = 0,
  clothingPerMonth = 0,
  vaccinationVisitCost = 0,
  vaccinationVisits = NIS_YEAR_ONE_VISITS,
  doctorVisits = 0,
  doctorVisitCost = 0,
  childcarePerMonth = 0,
  childcareMonths = 0,
  miscPerMonth = 0,
  monthsToBirth = 6,
  existingSavings = 0,
  savingsReturn = 0,
} = {}) {
  const delivery = toNumber(deliveryCost);
  const prenatal = toNumber(prenatalCost);
  const gear = toNumber(gearCost);
  const reimbursed = toNumber(insuranceReimbursement);
  const diaper = toNumber(diaperPrice);
  const diaperScale = toNumber(diaperUsageScale, 1);
  const tins = toNumber(formulaTinsPerMonth);
  const tinPrice = toNumber(formulaTinPrice);
  const solids = toNumber(solidsPerMonth);
  const clothing = toNumber(clothingPerMonth);
  const vaccineCost = toNumber(vaccinationVisitCost);
  const vaccineVisits = toNumber(vaccinationVisits);
  const visits = toNumber(doctorVisits);
  const visitCost = toNumber(doctorVisitCost);
  const childcare = toNumber(childcarePerMonth);
  const childcareUsed = toNumber(childcareMonths);
  const misc = toNumber(miscPerMonth);
  const months = toNumber(monthsToBirth);
  const existing = toNumber(existingSavings);
  const returnPct = toNumber(savingsReturn);

  const numbers = [
    delivery, prenatal, gear, reimbursed, diaper, diaperScale, tins, tinPrice, solids,
    clothing, vaccineCost, vaccineVisits, visits, visitCost, childcare, childcareUsed,
    misc, months, existing, returnPct,
  ];
  if (numbers.some((value) => Number.isNaN(value))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (numbers.some((value) => value < 0)) {
    return { error: "Costs, counts and rates cannot be negative." };
  }
  if (childcareUsed > MONTHS_IN_YEAR) {
    return { error: `Childcare months cannot exceed ${MONTHS_IN_YEAR} in the first year.` };
  }
  if (diaperScale > 3) return { error: "The diaper usage multiplier should be 3 or less." };
  if (!(months >= 1) || months > MAX_MONTHS_TO_BIRTH) {
    return { error: `Months left to save should be between 1 and ${MAX_MONTHS_TO_BIRTH}.` };
  }
  if (returnPct > MAX_RATE_PCT) {
    return { error: `An assumed return above ${MAX_RATE_PCT}% a year is not realistic for a one-year goal.` };
  }
  const mode = FEEDING_MODES.find((entry) => entry.id === feedingMode);
  if (!mode) return { error: "Choose how the baby will be fed." };

  const diaperCount = diapersInFirstYear(DIAPER_PROFILE, diaperScale);
  const diaperTotal = diaperCount * diaper;
  const formulaTotal = tins * mode.formulaShare * tinPrice * MONTHS_IN_YEAR;
  const solidsMonths = MONTHS_IN_YEAR - SOLIDS_START_MONTH;
  const solidsTotal = solids * solidsMonths;
  const clothingTotal = clothing * MONTHS_IN_YEAR;
  const vaccinationTotal = vaccineVisits * vaccineCost;
  const doctorTotal = visits * visitCost;
  const childcareTotal = childcare * childcareUsed;
  const miscTotal = misc * MONTHS_IN_YEAR;

  const oneOffGross = delivery + prenatal + gear;
  const reimbursementApplied = Math.min(reimbursed, oneOffGross);
  const oneOffNet = oneOffGross - reimbursementApplied;

  const categories = [
    { label: "Delivery & hospital", amount: delivery, group: "one-off" },
    { label: "Pre-natal care", amount: prenatal, group: "one-off" },
    { label: "Cot, pram, car seat & gear", amount: gear, group: "one-off" },
    { label: "Diapers", amount: diaperTotal, group: "recurring" },
    { label: "Formula", amount: formulaTotal, group: "recurring" },
    { label: "Solids & baby food", amount: solidsTotal, group: "recurring" },
    { label: "Clothing & bedding", amount: clothingTotal, group: "recurring" },
    { label: "Immunisation visits", amount: vaccinationTotal, group: "recurring" },
    { label: "Paediatric consultations", amount: doctorTotal, group: "recurring" },
    { label: "Childcare", amount: childcareTotal, group: "recurring" },
    { label: "Everything else", amount: miscTotal, group: "recurring" },
  ];

  const recurringTotal = categories
    .filter((entry) => entry.group === "recurring")
    .reduce((sum, entry) => sum + entry.amount, 0);

  const total = oneOffNet + recurringTotal;
  if (!(total > 0)) {
    return { error: "Every cost is zero — fill in at least the delivery or the monthly figures." };
  }

  const ranked = categories
    .filter((entry) => entry.amount > 0)
    .map((entry) => ({
      label: entry.label,
      group: entry.group,
      amount: round0(entry.amount),
      sharePct: round2((entry.amount / (oneOffGross + recurringTotal)) * 100),
    }))
    .sort((a, b) => b.amount - a.amount);

  const wholeMonths = Math.round(months);
  const i = returnPct / 100 / 12;
  const growthFactor = Math.pow(1 + i, wholeMonths);
  const existingFuture = existing * growthFactor;

  // Money needed by the birth: the one-off block. The recurring block is met from income
  // through the year, so it is reported separately as a monthly running cost.
  const needByBirth = oneOffNet;
  const gap = Math.max(0, needByBirth - existingFuture);
  let monthlySaving = 0;
  if (gap > 0) {
    monthlySaving = i <= 0 ? gap / wholeMonths : (gap * i) / (growthFactor - 1);
    if (!Number.isFinite(monthlySaving)) monthlySaving = 0;
  }

  return {
    diaperCount: round0(diaperCount),
    diaperTotal: round0(diaperTotal),
    formulaTotal: round0(formulaTotal),
    solidsMonths,
    solidsTotal: round0(solidsTotal),
    clothingTotal: round0(clothingTotal),
    vaccinationTotal: round0(vaccinationTotal),
    doctorTotal: round0(doctorTotal),
    childcareTotal: round0(childcareTotal),
    miscTotal: round0(miscTotal),
    oneOffGross: round0(oneOffGross),
    reimbursementApplied: round0(reimbursementApplied),
    oneOffNet: round0(oneOffNet),
    recurringTotal: round0(recurringTotal),
    recurringPerMonth: round0(recurringTotal / MONTHS_IN_YEAR),
    total: round0(total),
    averagePerMonth: round0(total / MONTHS_IN_YEAR),
    feedingMode: mode.id,
    feedingLabel: mode.label,
    categories: ranked,
    monthsToBirth: wholeMonths,
    existingFuture: round0(existingFuture),
    needByBirth: round0(needByBirth),
    gap: round0(gap),
    monthlySaving: round0(monthlySaving),
    birthFunded: gap <= 0,
  };
}
