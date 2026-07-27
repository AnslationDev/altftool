const seo = {
  intro:
    "This helper prices a revaluation application as what it actually is — a bet with a fixed fee and a two-sided outcome. It computes the expected change in marks as P(rise) × gain − P(fall) × loss, the cost of each mark you can expect to gain, and the break-even probability at which the application stops being worth the money, then checks the answer against the deadline. The downside is priced deliberately, because boards including CBSE treat the marks awarded after re-evaluation as final whether they are higher or lower than the original.",
  useCases: [
    "A Class 12 student two marks below a college cutoff, deciding whether a re-evaluation is worth the fee when the expected gain is smaller than the gap.",
    "Choosing between paying for verification of marks in four subjects and paying for a photocopy of the one answer book where a whole question looks unmarked.",
    "Checking on the last weekend before the window closes whether the numbers still justify applying, or whether the money is better kept for a compartment or improvement exam.",
  ],
  benefits: [
    ["Prices the downside too", "Counts the risk that revised marks come out lower, which most students ignore."],
    ["Turns a hunch into a threshold", "Gives the break-even chance of a rise, so you can judge whether your case clears it."],
    ["Keeps the deadline in view", "Counts the days left to apply next to the money at stake."],
  ],
  faqs: [
    [
      "Can marks go down after revaluation?",
      "Yes. Under CBSE's Examination Bye-Laws and most university ordinances the marks awarded after re-evaluation are final, whether they are higher or lower than the original, and the earlier score cannot be restored. Verification or re-totalling carries less of this risk than a full re-evaluation, because it checks addition and unmarked questions rather than re-judging answers.",
    ],
    [
      "Is revaluation worth applying for?",
      "It is worth it when three things line up: the gain you realistically expect is at least as large as the gap to the mark you need, your grievance is specific rather than a general feeling, and the window is still open. A vague sense that the marking was harsh is a weak case; an entire question left unmarked, or a total on the front page that does not match the marks inside, is a strong one.",
    ],
    [
      "What is the difference between re-checking and re-evaluation?",
      "Re-checking, also called verification or re-totalling, is a clerical exercise: someone re-adds the marks and confirms that no question or page was left unmarked, without re-judging any answer. Re-evaluation puts a fresh examiner on the specific questions you name and can move marks either way. Boards usually require them in order — verification first, then a photocopy of the answer book, then re-evaluation of the questions the photocopy shows a case for.",
    ],
    [
      "How long do I have to apply for revaluation?",
      "The window opens the day the result is declared and is typically short — often a week or two for each stage, with the later stages having their own separate dates. Because the stages run in sequence, missing the first date can shut off the ones after it. Check the post-result circular on your board or university website on the day the result comes out rather than waiting; fees and dates are revised every year.",
    ],
  ],
};

export default seo;
