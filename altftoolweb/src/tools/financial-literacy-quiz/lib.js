/**
 * A beginner financial literacy quiz covering interest, inflation, insurance and tax.
 *
 * Sources for the facts tested
 *  - The compounding, inflation and diversification items follow the "Big Three" financial
 *    literacy questions of Lusardi and Mitchell (2011), which national surveys including the
 *    RBI/NCFE Financial Literacy and Inclusion Survey use in the same form.
 *  - Inflation target: section 45ZA of the Reserve Bank of India Act, under which the Central
 *    Government notifies the target — 4% consumer price inflation with a tolerance band of
 *    2 percentage points either side.
 *  - Pre-existing disease waiting period: IRDAI health insurance norms, reduced to a maximum of
 *    3 years by the 2024 master circular (previously 4 years).
 *  - Third-party motor cover: section 146 of the Motor Vehicles Act, 1988.
 *  - No claim bonus slabs: the standard motor own-damage tariff — 20%, 25%, 35%, 45% and 50%
 *    after one to five consecutive claim-free years.
 *  - Form 16: certificate of tax deducted at source on salary, issued under section 203 of the
 *    Income-tax Act, 1961.
 *  - Section 80C ceiling: Rs 1,50,000 a year, available only under the old regime.
 *  - TDS on bank deposit interest: 10% under section 194A when a PAN is on record, and 20%
 *    under section 206AA when it is not.
 *  - Rule of 72: dividing 72 by the annual rate approximates the doubling period.
 */

/** Topics the quiz reports on. */
export const TOPICS = ["Interest", "Inflation", "Insurance", "Tax"];

/**
 * Every question. `answer` is the zero-based index of the correct option.
 * Keep the wording plain — this is a beginner test, not a trick test.
 */
export const QUESTIONS = [
  {
    id: "i1",
    topic: "Interest",
    question:
      "You put Rs 100 in a savings account paying 2% a year and never touch it. After 5 years the balance is:",
    options: ["More than Rs 110", "Exactly Rs 110", "Less than Rs 110", "It is impossible to say"],
    answer: 0,
    explanation:
      "Interest earns interest. Rs 100 x 1.02^5 is Rs 110.41, which beats the Rs 110 that simple interest of Rs 2 a year would give.",
  },
  {
    id: "i2",
    topic: "Interest",
    question: "Rs 10,000 lent at 10% a year SIMPLE interest for 3 years earns interest of:",
    options: ["Rs 1,000", "Rs 3,000", "Rs 3,310", "Rs 30,000"],
    answer: 1,
    explanation:
      "Simple interest is principal x rate x time: 10,000 x 0.10 x 3 = Rs 3,000. At compound interest the same deposit would earn Rs 3,310.",
  },
  {
    id: "i3",
    topic: "Interest",
    question: "At 8% a year compounded annually, money roughly doubles in:",
    options: ["About 5 years", "About 9 years", "About 12 years", "About 25 years"],
    answer: 1,
    explanation:
      "The rule of 72 divides 72 by the rate: 72 / 8 = 9 years. The exact answer is 9.01 years, so the shortcut is close enough for planning.",
  },
  {
    id: "i4",
    topic: "Interest",
    question:
      "Two loans of the same amount and tenure quote 12%. One is a flat rate, the other reducing balance. Which costs more?",
    options: [
      "The flat rate loan",
      "The reducing balance loan",
      "They cost exactly the same",
      "It depends on the lender",
    ],
    answer: 0,
    explanation:
      "A flat rate charges interest on the original principal for the whole tenure, even though you have repaid part of it. On a typical multi-year loan a 12% flat rate works out to roughly 21-22% on a reducing balance basis.",
  },
  {
    id: "f1",
    topic: "Inflation",
    question:
      "Your savings pay 1% a year and prices rise 2% a year. After one year, with the money in that account you could buy:",
    options: ["More than today", "Exactly the same as today", "Less than today", "It is impossible to say"],
    answer: 2,
    explanation:
      "The real return is roughly the interest rate minus inflation, so 1% minus 2% is about minus 1%. Your money grows in rupees but shrinks in purchasing power.",
  },
  {
    id: "f2",
    topic: "Inflation",
    question: "If inflation averages 6% a year, a household bill of Rs 1,00,000 today will cost about Rs 2,00,000 in:",
    options: ["About 6 years", "About 12 years", "About 20 years", "About 33 years"],
    answer: 1,
    explanation:
      "The rule of 72 works for prices too: 72 / 6 = 12 years to double. The precise figure is 11.9 years.",
  },
  {
    id: "f3",
    topic: "Inflation",
    question: "India's monetary policy framework sets the inflation target at:",
    options: [
      "2% with a band of 1 percentage point either side",
      "4% with a band of 2 percentage points either side",
      "6% with no tolerance band",
      "There is no numerical target",
    ],
    answer: 1,
    explanation:
      "Under section 45ZA of the RBI Act the target is 4% consumer price inflation, with a tolerance band of 2 percentage points either way, so 2% to 6%.",
  },
  {
    id: "f4",
    topic: "Inflation",
    question: "A fixed deposit pays 7% and inflation is 5%. Ignoring tax, your real return is about:",
    options: ["12%", "7%", "2%", "Minus 2%"],
    answer: 2,
    explanation:
      "Real return is close to the nominal rate minus inflation, so 7% minus 5% is about 2%. Tax on the interest is charged on the full 7%, which is why post-tax real returns on deposits are often near zero.",
  },
  {
    id: "n1",
    topic: "Insurance",
    question: "Which life insurance product gives the largest cover for the smallest premium?",
    options: [
      "An endowment policy",
      "A unit linked insurance plan",
      "A pure term insurance plan",
      "A money back policy",
    ],
    answer: 2,
    explanation:
      "Term insurance pays only on death and has no savings element, so almost the whole premium buys cover. That is why a large sum assured costs a fraction of what a bundled savings policy costs.",
  },
  {
    id: "n2",
    topic: "Insurance",
    question: "Under current IRDAI norms, the waiting period for a declared pre-existing disease can be at most:",
    options: ["30 days", "1 year", "3 years", "8 years"],
    answer: 2,
    explanation:
      "The 2024 IRDAI health insurance master circular capped the pre-existing disease waiting period at 3 years, down from 4. Declaring the condition honestly at proposal stage is what makes the cover valid after that period.",
  },
  {
    id: "n3",
    topic: "Insurance",
    question: "Third-party motor insurance in India is:",
    options: [
      "Optional if you drive carefully",
      "Compulsory for every vehicle used in a public place",
      "Compulsory only for commercial vehicles",
      "Included automatically with the vehicle registration",
    ],
    answer: 1,
    explanation:
      "Section 146 of the Motor Vehicles Act, 1988 makes third-party cover compulsory for any vehicle used in a public place. Own damage cover is the optional part of a comprehensive policy.",
  },
  {
    id: "n4",
    topic: "Insurance",
    question: "The no claim bonus on a motor policy reaches its maximum of 50% after:",
    options: [
      "1 claim-free year",
      "3 consecutive claim-free years",
      "5 consecutive claim-free years",
      "10 consecutive claim-free years",
    ],
    answer: 2,
    explanation:
      "The slabs run 20%, 25%, 35%, 45% and 50% after one to five consecutive claim-free years. The discount applies to the own damage premium only, not the third-party portion, and a single claim resets it.",
  },
  {
    id: "t1",
    topic: "Tax",
    question: "Form 16 issued by an employer is:",
    options: [
      "An offer letter for tax purposes",
      "A certificate of salary paid and tax deducted at source",
      "The income tax return itself",
      "A declaration of investments you plan to make",
    ],
    answer: 1,
    explanation:
      "Form 16 is the TDS certificate issued under section 203. Part A shows the tax deducted and deposited, Part B shows the salary breakup and deductions used to compute it. You still have to file a return.",
  },
  {
    id: "t2",
    topic: "Tax",
    question: "The maximum deduction under section 80C in a financial year is:",
    options: ["Rs 50,000", "Rs 1,00,000", "Rs 1,50,000", "Rs 2,00,000"],
    answer: 2,
    explanation:
      "Rs 1,50,000 across all eligible items combined, including PPF, EPF, life insurance premium, ELSS, principal repayment on a home loan and tuition fees. It is available only if you file under the old regime.",
  },
  {
    id: "t3",
    topic: "Tax",
    question: "What is the difference between a tax deduction and a tax rebate?",
    options: [
      "There is none, the words mean the same thing",
      "A deduction reduces taxable income; a rebate reduces the tax itself",
      "A deduction reduces the tax; a rebate reduces taxable income",
      "A rebate is a refund of excess TDS",
    ],
    answer: 1,
    explanation:
      "A deduction such as section 80C is subtracted before the slab rates are applied, so it saves tax at your marginal rate. A rebate under section 87A is subtracted from the tax computed, so it saves rupee for rupee.",
  },
  {
    id: "t4",
    topic: "Tax",
    question: "When a bank deducts TDS on fixed deposit interest and your PAN is on record, the rate is:",
    options: ["5%", "10%", "20%", "30%"],
    answer: 1,
    explanation:
      "10% under section 194A once the interest crosses the threshold. Without a PAN the rate becomes 20% under section 206AA. TDS is not the final tax — the interest is still taxed at your slab rate when you file.",
  },
];

/** Score bands, expressed as the minimum percentage needed to reach each band. */
export const SCORE_BANDS = [
  {
    min: 85,
    label: "Confident",
    advice:
      "You have the fundamentals. Move on to asset allocation, tax-efficient withdrawal order and reading a scheme information document.",
  },
  {
    min: 65,
    label: "Competent",
    advice:
      "Solid base with a few gaps. Re-read the explanations you got wrong, then check one real product document against them.",
  },
  {
    min: 40,
    label: "Developing",
    advice:
      "You know some of the vocabulary but the maths is shaky. Spend time on compounding and real returns before choosing any product.",
  },
  {
    min: 0,
    label: "Beginner",
    advice:
      "Start with the two ideas that drive everything else: compounding and inflation. Nothing else makes sense without them.",
  },
];

/** Look up the band for a percentage score. */
export function bandFor(percent) {
  if (typeof percent !== "number" || !Number.isFinite(percent)) return null;
  const clamped = Math.min(100, Math.max(0, percent));
  return SCORE_BANDS.find((band) => clamped >= band.min) ?? SCORE_BANDS[SCORE_BANDS.length - 1];
}

/**
 * Score a set of answers.
 *
 * @param {Array<number|null>} answers One entry per question, in QUESTIONS order.
 *   A number is the chosen option index; null or undefined means unanswered.
 * @param {Array} questions Defaults to QUESTIONS; injectable so the maths can be tested.
 */
export function scoreQuiz(answers, questions = QUESTIONS) {
  if (!Array.isArray(questions) || questions.length === 0) {
    return { error: "The quiz has no questions to score." };
  }
  if (!Array.isArray(answers)) {
    return { error: "Answers must be supplied as a list, one entry per question." };
  }
  if (answers.length !== questions.length) {
    return {
      error: `Expected ${questions.length} answers but received ${answers.length}.`,
    };
  }

  const review = questions.map((question, index) => {
    const chosen = answers[index];
    const answered = Number.isInteger(chosen) && chosen >= 0 && chosen < question.options.length;
    return {
      id: question.id,
      topic: question.topic,
      question: question.question,
      options: question.options,
      chosen: answered ? chosen : null,
      answered,
      correctIndex: question.answer,
      isCorrect: answered && chosen === question.answer,
      explanation: question.explanation,
    };
  });

  const total = questions.length;
  const answeredCount = review.filter((row) => row.answered).length;
  const correct = review.filter((row) => row.isCorrect).length;
  const percent = Math.round((correct / total) * 100);

  const topics = TOPICS.map((topic) => {
    const rows = review.filter((row) => row.topic === topic);
    const topicTotal = rows.length;
    const topicCorrect = rows.filter((row) => row.isCorrect).length;
    return {
      topic,
      correct: topicCorrect,
      total: topicTotal,
      percent: topicTotal === 0 ? 0 : Math.round((topicCorrect / topicTotal) * 100),
    };
  }).filter((row) => row.total > 0);

  const weakest = topics.length
    ? topics.reduce((worst, row) => (row.percent < worst.percent ? row : worst))
    : null;

  const band = bandFor(percent);

  return {
    total,
    answeredCount,
    unanswered: total - answeredCount,
    correct,
    wrong: answeredCount - correct,
    percent,
    band: band.label,
    advice: band.advice,
    topics,
    weakestTopic: weakest && weakest.percent < 100 ? weakest.topic : null,
    review,
  };
}
