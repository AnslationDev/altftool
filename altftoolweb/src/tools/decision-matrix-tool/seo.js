const seo = {
  intro:
    "A decision matrix scores each option against weighted criteria and ranks them: normalise the weights so they sum to 1, multiply each rating by its weight share, and add up. This tool runs that weighted scoring model on a 1-10 rating scale, mirrors the rating for criteria where lower is better such as cost or lead time, and then does the part most templates skip — telling you which weight would have to change, and by how much, for the runner-up to win. It is for teams making a build-versus-buy, vendor or hiring call that has to be defensible afterwards.",
  useCases: [
    "Compare three vendors on cost, feature fit, lead time and support, then show stakeholders exactly which criterion decided it",
    "Test whether a shortlist ranking survives a different set of weights before presenting one recommendation",
    "Turn an argument about a build-versus-buy decision into explicit numbers people can disagree with specifically",
  ],
  benefits: [
    ["Sensitivity analysis included", "For every criterion, the exact weight at which the second-placed option would overtake the winner."],
    ["Cost criteria handled properly", "Mark a criterion lower-is-better and its rating is mirrored, so cheap scores well without inverting numbers by hand."],
    ["Honest about ties", "Scores within 0.1 are reported as effectively tied rather than dressed up as a winner."],
  ],
  faqs: [
    [
      "How do you calculate a weighted decision matrix?",
      "Divide each criterion's weight by the total of all weights to get its share, multiply each option's rating by that share, then sum across criteria. With weights 5, 3 and 2 the shares are 50%, 30% and 20%, so ratings of 3, 9 and 6 give 0.5x3 + 0.3x9 + 0.2x6 = 5.4 out of 10. Because the shares sum to 1, the score stays on the same 1-10 scale as the ratings.",
    ],
    [
      "How do I score cost, where a lower number is better?",
      "Rate the raw quality of that cost on the same 1-10 scale and tick lower-is-better, which mirrors it as 11 minus the rating. Never mix directions inside one matrix without flagging it — a matrix where high means good on three criteria and bad on the fourth is the most common way these get silently wrong.",
    ],
    [
      "How many criteria should a decision matrix have?",
      "Between four and seven for most decisions, and this tool caps it at 12. Past that point the weight shares get so small that no single criterion moves the result, everything scores near the middle, and the matrix stops discriminating between options rather than becoming more accurate.",
    ],
    [
      "What if two options score almost the same?",
      "Treat it as a tie and decide on something the matrix does not measure — reversibility, who has to live with it, or which option preserves more choices later. A gap under 0.1 on a 10-point scale is well inside the noise of subjective ratings, so declaring a winner there is false precision.",
    ],
  ],
};

export default seo;
