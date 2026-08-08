const seo = {
  title: "Safe Score Target Setter: Cutoff Buffer + Attempt Plan",
  metaDescription:
    "Turn past cutoffs into a target: their standard deviation times the z value for 80-99% confidence, then an attempt plan under negative marking.",
  steps: [
    "Enter Past cutoffs, one per year (comma separated), the Expected cutoff this year (marks) and Total marks in the paper.",
    "Pick a Risk appetite - Aggressive at 80%, Balanced at 90%, Safe at 95% or Very safe at 99% confidence.",
    "Target score to aim at reports the buffer added and headroom; fill Questions in the paper, Marks per correct answer and Negative marking per wrong answer to get Questions to attempt and Break-even accuracy.",
  ],
  intro:
    "A safe score target is the expected cutoff plus a buffer sized from how far the cutoff has actually swung between years, so that landing on it clears the real cutoff at a confidence level you choose rather than at coin-flip odds. This tool takes past cutoffs, computes their sample standard deviation with Bessel's correction, multiplies it by the one-sided normal z value for 80%, 90%, 95% or 99% confidence, and adds that to your expectation. It then converts the target into a concrete attempt plan using the paper's marking scheme: expected net marks per attempt equal accuracy times marks per correct, minus the miss rate times the negative penalty.",
  useCases: [
    "Turn five years of SSC or banking cutoffs into a mark target that still clears the list in an easy-paper year.",
    "Decide how many of 100 questions to attempt at 75% accuracy when each wrong answer costs 0.5 marks.",
    "Set a deliberately conservative target for a final attempt when age or attempt limits leave no second chance.",
  ],
  benefits: [
    ["Buffer from real data", "The cushion comes from the spread of your own cutoff history, not a guessed 'add 10 marks'."],
    ["Risk stated as a number", "Each option is labelled with the confidence it buys, so you can see what extra safety costs in marks."],
    ["Negative marking built in", "Shows the break-even accuracy below which every extra attempt loses marks."],
  ],
  faqs: [
    [
      "How many marks above the expected cutoff should I target?",
      "Roughly 1.28 standard deviations of the past cutoffs for 90% confidence, or 1.64 for 95%. If cutoffs over five years had a standard deviation of about 6 marks, that means aiming 8 marks above expectation for 90% safety and 10 for 95%.",
    ],
    [
      "What is break-even accuracy under negative marking?",
      "It is penalty divided by the sum of penalty and marks per correct answer. With 2 marks for a correct answer and 0.5 deducted for a wrong one, break-even is 0.5 / 2.5 = 20% accuracy — below that, attempting more questions reduces your score.",
    ],
    [
      "Why not just aim exactly at last year's cutoff?",
      "Because a cutoff is the outcome of that year's paper difficulty, vacancy count and applicant pool, all of which move. Matching last year's number leaves no margin for the year the paper turns out easy and the cutoff rises.",
    ],
    [
      "What if I only know one past cutoff?",
      "The tool falls back to a buffer of 3% of total marks, a conventional planning cushion rather than a statistic. One data point cannot show variability, so gather at least three years of cutoffs for a meaningful spread.",
    ],
  ],
};

export default seo;
