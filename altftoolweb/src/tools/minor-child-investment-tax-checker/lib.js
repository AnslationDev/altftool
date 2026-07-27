/**
 * Tax treatment of income earned on investments held in a minor child's name.
 *
 * Statutory basis (Income-tax Act, 1961)
 *  - s.64(1A): all income of a minor child is included in the total income of the parent.
 *    Where the marriage of the parents subsists, it goes to the parent whose total income
 *    (excluding the minor's income) is GREATER. Where it does not subsist, it goes to the
 *    parent who maintains the child. Once clubbed with one parent, it stays with that parent
 *    in later years unless the Assessing Officer directs otherwise after hearing the parent.
 *  - Proviso to s.64(1A): clubbing does NOT apply to income of the minor that arises from
 *    (a) manual work done by the child, or (b) an activity involving the child's own skill,
 *    talent or specialised knowledge and experience. Such income is taxed in the child's hands.
 *  - Proviso to s.64(1A) read with s.80U: clubbing does not apply to a minor child suffering
 *    from a disability of the nature specified in s.80U; that income is assessed in the child's
 *    own hands and gets the child's own basic exemption limit.
 *  - s.10(32): where a minor's income is clubbed under s.64(1A), the parent may exclude
 *    Rs 1,500 per minor child, or the amount of income so included, whichever is LESS.
 *  - s.115BAC(2)(i): under the new tax regime, the exemption in clause (32) of section 10 is
 *    not available, so no Rs 1,500 deduction is allowed there.
 *  - s.10(11) and s.10(11A): interest on a Public Provident Fund account and on a Sukanya
 *    Samriddhi Account is exempt, so nothing is added to anyone's total income.
 *  - Health and education cess of 4% under the Finance Act applies on the income tax.
 */

/** s.10(32) — exemption per minor child per year, capped at the income actually clubbed. */
export const SECTION_10_32_EXEMPTION = 1500;

/** Health and education cess levied on income tax, in per cent. */
export const HEALTH_EDUCATION_CESS_PCT = 4;

/**
 * Instruments commonly opened in a child's name.
 *  - fullyExempt: the income itself is exempt, so clubbing has nothing to add.
 *  - ownHands: the proviso to s.64(1A) keeps it out of the parent's return.
 */
export const INSTRUMENTS = [
  {
    id: "savings",
    label: "Savings bank or post office savings account interest",
    detail: "Interest is fully taxable once clubbed; the parent's section 80TTA claim is contested, so treat it as taxable.",
  },
  {
    id: "fd",
    label: "Fixed or recurring deposit interest",
    detail: "Bank and post office deposit interest is taxable in full at the parent's slab rate.",
  },
  {
    id: "nsc",
    label: "NSC, KVP or bond interest",
    detail: "Accrued or received interest is taxable as income from other sources.",
  },
  {
    id: "mutualFund",
    label: "Mutual fund or share capital gains and dividend",
    detail: "Capital gains keep their own special rates in the parent's return; dividends are taxed at slab rate.",
  },
  {
    id: "rent",
    label: "Rent from property gifted to the child",
    detail: "Taxable as income from house property in the parent's return after the standard deduction.",
  },
  {
    id: "ppf",
    label: "PPF account opened in the minor's name",
    fullyExempt: true,
    exemptSection: "section 10(11)",
    detail: "Interest on a Public Provident Fund account is exempt, so nothing is clubbed.",
  },
  {
    id: "ssy",
    label: "Sukanya Samriddhi Account interest",
    fullyExempt: true,
    exemptSection: "section 10(11A)",
    detail: "Interest on a Sukanya Samriddhi Account is exempt, so nothing is clubbed.",
  },
  {
    id: "skill",
    label: "Earnings from the child's own skill, talent or knowledge",
    ownHands: true,
    detail: "The proviso to section 64(1A) keeps acting, sport, music and similar earnings in the child's own hands.",
  },
  {
    id: "manual",
    label: "Earnings from manual work done by the child",
    ownHands: true,
    detail: "The proviso to section 64(1A) excludes income from manual work from clubbing.",
  },
];

export const INSTRUMENT_IDS = INSTRUMENTS.map((item) => item.id);

function isNum(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function round(value) {
  return Math.round(value * 100) / 100;
}

/**
 * Work out where a minor child's income is taxed and what it costs.
 *
 * @param {object} input
 * @param {string} input.instrument            One of INSTRUMENT_IDS.
 * @param {number} input.annualIncome          Income earned in the year on that investment, in rupees.
 * @param {boolean} input.childHasDisability80U Child has a disability specified in section 80U.
 * @param {boolean} input.marriageSubsists     Marriage of the parents subsists.
 * @param {number} input.parentAIncome         Parent A total income, EXCLUDING the minor's income.
 * @param {number} input.parentBIncome         Parent B total income, EXCLUDING the minor's income.
 * @param {"A"|"B"} input.maintainingParent    Parent who maintains the child, used when the marriage does not subsist.
 * @param {"old"|"new"} input.regime           Tax regime the clubbing parent files under.
 * @param {number} input.marginalRatePct       Parent's marginal slab rate, in per cent.
 */
export function assessMinorIncome({
  instrument = "fd",
  annualIncome = 0,
  childHasDisability80U = false,
  marriageSubsists = true,
  parentAIncome = 0,
  parentBIncome = 0,
  maintainingParent = "A",
  regime = "old",
  marginalRatePct = 30,
}) {
  const meta = INSTRUMENTS.find((item) => item.id === instrument);
  if (!meta) {
    return { error: "Choose one of the listed investment or income types." };
  }
  if (!isNum(annualIncome) || annualIncome < 0) {
    return { error: "Annual income from the investment must be zero or more." };
  }
  if (!isNum(parentAIncome) || parentAIncome < 0 || !isNum(parentBIncome) || parentBIncome < 0) {
    return { error: "Each parent's total income must be zero or more." };
  }
  if (maintainingParent !== "A" && maintainingParent !== "B") {
    return { error: "Choose which parent maintains the child." };
  }
  if (regime !== "old" && regime !== "new") {
    return { error: "Choose either the old regime or the new regime." };
  }
  if (!isNum(marginalRatePct) || marginalRatePct < 0 || marginalRatePct > 100) {
    return { error: "The marginal tax rate must be between 0 and 100 per cent." };
  }

  const reasons = [];

  // 1. Income that is exempt in the first place never reaches the clubbing test.
  if (meta.fullyExempt) {
    reasons.push(
      `Interest on this account is exempt under ${meta.exemptSection}, so no amount enters anybody's total income.`,
    );
    reasons.push(
      "Section 64(1A) only moves taxable income between returns; it cannot make exempt income taxable.",
    );
    return {
      treatment: "exempt",
      headline: "Exempt — nothing is taxed and nothing is clubbed",
      taxedIn: "Nobody — the income is exempt",
      clubbingParent: null,
      grossIncome: round(annualIncome),
      instrumentExempt: round(annualIncome),
      section1032Exemption: 0,
      taxableAmount: 0,
      incomeTax: 0,
      cess: 0,
      totalTax: 0,
      reasons,
      instrumentLabel: meta.label,
      instrumentDetail: meta.detail,
      exemptionLimit: SECTION_10_32_EXEMPTION,
    };
  }

  // 2. The proviso to s.64(1A) — child's own effort, or a s.80U disability.
  if (meta.ownHands || childHasDisability80U) {
    reasons.push(
      childHasDisability80U && !meta.ownHands
        ? "The proviso to section 64(1A) excludes the income of a minor child suffering from a disability specified in section 80U, so it is assessed in the child's own hands."
        : "The proviso to section 64(1A) excludes income from the child's own manual work, skill, talent or specialised knowledge from clubbing.",
    );
    reasons.push(
      "The child is a separate assessee for this income, gets the full basic exemption limit, and the return is verified by a guardian.",
    );
    reasons.push(
      `Section 10(32) gives no benefit here — the Rs ${SECTION_10_32_EXEMPTION} exemption only applies to income actually clubbed under section 64(1A).`,
    );
    return {
      treatment: "childsOwnHands",
      headline: "Not clubbed — taxed in the child's own hands",
      taxedIn: "The minor child, as a separate assessee",
      clubbingParent: null,
      grossIncome: round(annualIncome),
      instrumentExempt: 0,
      section1032Exemption: 0,
      taxableAmount: round(annualIncome),
      incomeTax: null,
      cess: null,
      totalTax: null,
      reasons,
      instrumentLabel: meta.label,
      instrumentDetail: meta.detail,
      exemptionLimit: SECTION_10_32_EXEMPTION,
    };
  }

  // 3. Ordinary clubbing. Pick the parent.
  let clubbingParent;
  if (marriageSubsists) {
    if (parentAIncome === parentBIncome) {
      clubbingParent = "A";
      reasons.push(
        "Both parents show the same total income, so either return can carry the minor's income; Parent A is assumed here and the choice must then be kept consistent in later years.",
      );
    } else {
      clubbingParent = parentAIncome > parentBIncome ? "A" : "B";
      reasons.push(
        `The marriage subsists, so section 64(1A) clubs the income with the parent whose own total income is greater — Parent ${clubbingParent}.`,
      );
    }
  } else {
    clubbingParent = maintainingParent;
    reasons.push(
      `The marriage of the parents does not subsist, so the income is clubbed with the parent who maintains the child — Parent ${clubbingParent}.`,
    );
  }

  // 4. Section 10(32), denied by section 115BAC in the new regime.
  const section1032Exemption =
    regime === "old" ? Math.min(SECTION_10_32_EXEMPTION, annualIncome) : 0;
  reasons.push(
    regime === "old"
      ? `Section 10(32) lets the parent exclude Rs ${SECTION_10_32_EXEMPTION} per minor child, or the income clubbed if that is less, so Rs ${Math.round(section1032Exemption)} is excluded.`
      : "Section 115BAC(2)(i) withdraws the clause (32) exemption under the new regime, so the whole amount is added with no Rs 1,500 relief.",
  );

  const taxableAmount = Math.max(0, annualIncome - section1032Exemption);
  const incomeTax = (taxableAmount * marginalRatePct) / 100;
  const cess = (incomeTax * HEALTH_EDUCATION_CESS_PCT) / 100;
  const totalTax = incomeTax + cess;

  reasons.push(
    `At a marginal rate of ${marginalRatePct}% plus ${HEALTH_EDUCATION_CESS_PCT}% cess, the clubbed income adds about Rs ${Math.round(totalTax)} to Parent ${clubbingParent}'s tax.`,
  );

  return {
    treatment: "clubbed",
    headline: `Clubbed with Parent ${clubbingParent}`,
    taxedIn: `Parent ${clubbingParent}'s return under section 64(1A)`,
    clubbingParent,
    grossIncome: round(annualIncome),
    instrumentExempt: 0,
    section1032Exemption: round(section1032Exemption),
    taxableAmount: round(taxableAmount),
    incomeTax: round(incomeTax),
    cess: round(cess),
    totalTax: round(totalTax),
    reasons,
    instrumentLabel: meta.label,
    instrumentDetail: meta.detail,
    exemptionLimit: SECTION_10_32_EXEMPTION,
  };
}
