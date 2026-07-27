const seo = {
  intro:
    "Break-even accuracy is the accuracy at which answering a question and leaving it blank are worth exactly the same, and it equals P ÷ (M + P) where M is the marks for a correct answer and P is the deduction for a wrong one. This calculator applies that identity to any marking scheme — NEET and JEE at +4/-1 give 20%, UPSC prelims at one-third gives 25%, and IBPS at one-fourth gives 20% — and then shows how many options you must rule out before a guess becomes profitable. It is for candidates deciding, question by question, whether to attempt or move on.",
  useCases: [
    "Settling whether a 50-50 guess is worth taking in an exam where a wrong answer costs a third of the marks.",
    "Comparing the guessing economics of NEET, UPSC prelims and a bank PO paper before switching exam tracks.",
    "Checking a custom scheme used by a state PSC or a private mock series that does not match any national pattern.",
  ],
  benefits: [
    ["One formula, every exam", "The same expected-value identity covers NEET, JEE, UPSC, SSC, CAT, GATE, CLAT and any custom scheme."],
    ["Elimination ladder", "Shows the expected marks from a guess at every level of option elimination, not just a blind pick."],
    ["Translates into real marks", "Converts your accuracy and attempt count into net marks and marks lost per 100 attempts."],
  ],
  faqs: [
    [
      "What is break-even accuracy in an exam?",
      "It is the accuracy at which attempting a question earns the same expected marks as leaving it blank, namely zero. It equals P ÷ (M + P): for a +4/-1 scheme that is 1 ÷ 5, or 20%, and for a scheme that deducts one-third of the marks it is 25%.",
    ],
    [
      "How do I know whether to guess or leave a question blank?",
      "Compare your chance of being right with the break-even accuracy. If you can eliminate enough options that your hit rate beats the threshold, answer; otherwise leave it. On a four-option question with a one-third deduction, a blind guess is exactly break-even, so you need to rule out at least one option before guessing adds anything.",
    ],
    [
      "Why is blind guessing neutral in UPSC prelims and bank exams?",
      "Because the number of options exactly matches the penalty. UPSC has four options and deducts one-third, giving a 25% hit rate against a 25% threshold. Bank papers have five options and deduct one-fourth, giving 20% against 20%. In both cases the expected value of a blind guess is exactly zero.",
    ],
    [
      "Does a higher penalty always mean fewer attempts?",
      "It means a higher accuracy bar, not necessarily fewer attempts. A scheme deducting one mark against four raises the bar to 20%, while one deducting one against three raises it to 25%. What changes is the quality of question you can afford to attempt, which is why elimination skill matters more than raw attempt count.",
    ],
  ],
};

export default seo;
