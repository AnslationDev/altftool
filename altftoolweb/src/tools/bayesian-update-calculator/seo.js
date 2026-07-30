const seo = {
  intro:
    "The Bayesian Update Calculator applies Bayes' theorem to turn a starting belief and one piece of evidence into a revised probability, using posterior = P(E|H)·P(H) divided by P(E|H)·P(H) + P(E|¬H)·P(1−H). Enter three percentages — your prior, how likely the evidence is if the hypothesis is true, and how likely it is if the hypothesis is false — and it returns the posterior along with prior odds, the likelihood ratio and posterior odds. It is for anyone who has to reason about a positive test, a warning signal or a noisy indicator and wants the base rate accounted for properly.",
  useCases: [
    "A screening test came back positive and you want to see what the result actually implies once the condition's rarity in the population is factored in, before drawing any conclusion.",
    "Your fraud rule fires on 4 percent of legitimate transactions and catches 85 percent of fraudulent ones — you need to know what fraction of flagged transactions are genuinely fraud.",
    "A monitoring alert has gone off and you want to justify to the team, with numbers, why a highly sensitive check on a rare failure still produces mostly false alarms.",
  ],
  benefits: [
    ["Odds form alongside the percentage", "Prior odds, likelihood ratio and posterior odds are shown together, which makes chaining a second piece of evidence straightforward."],
    ["Exposes the base rate trap directly", "Changing only the prior while holding the test quality fixed shows immediately how much the starting rate drives the answer."],
    ["Shows the denominator", "The total evidence probability P(E) is reported as its own row, so you can see how many of all positives come from the false-positive branch."],
  ],
  faqs: [
    [
      "What three numbers do I need to enter?",
      "The prior probability that the hypothesis is true, P(evidence | hypothesis) — the true positive rate or sensitivity — and P(evidence | not hypothesis), the false positive rate. All three are entered as percentages between 0 and 100.",
    ],
    [
      "Why is a positive result on a 90 percent accurate test often still probably wrong?",
      "Because the false positives are drawn from a much larger group. With a 1 percent prior, 90 percent sensitivity and a 5 percent false positive rate, the posterior is only about 15.4 percent: 0.9 percent of the population are true positives while 4.95 percent are false positives.",
    ],
    [
      "What is the likelihood ratio and how do I read it?",
      "It is P(evidence | hypothesis) divided by P(evidence | not hypothesis) — how many times more often the evidence appears when the hypothesis is true. Multiply your prior odds by it to get the posterior odds. A ratio of 18, from 90 percent over 5 percent, means the evidence is 18 times more expected under the hypothesis.",
    ],
    [
      "Can I update on more than one piece of evidence?",
      "Yes, one step at a time: run the calculation, then feed the posterior back in as the prior for the next piece of evidence. This is only valid when the two pieces of evidence are conditionally independent — two tests that fail in the same way will overstate the result.",
    ],
  ],
};

export default seo;
