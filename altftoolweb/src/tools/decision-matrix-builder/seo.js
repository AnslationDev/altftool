const seo = {
  title: "Decision Matrix Builder: Weight Criteria, Rank",
  metaDescription:
    "Score options 0-10 against criteria whose weights auto-normalise to 100%, and rank them by SUM(weight x score) / SUM(weights) x 10.",
  steps: [
    "Add each choice under Options, then define what matters under Criteria, where the weights auto-normalize to 100%.",
    "Rate every option against every criterion from 1 to 10 in the Scoring Matrix grid.",
    "Read Rankings sorted by weighted score with the per-criterion Score Breakdown, then use Copy Results or Download CSV to save decision-matrix.csv.",
  ],
  intro:
    "The Decision Matrix Builder scores each option you are choosing between against criteria you weight by importance, using the weighted-sum formula Σ(weight × score) ÷ Σ(weights) × 10 to produce a single ranked number out of 100. Criteria weights auto-normalise to 100%, so raising one importance level pushes the others down proportionally instead of letting the totals drift, and every option is scored 0–10 on each criterion. It is for anyone stuck between shortlisted choices who wants the trade-off written down rather than argued from memory.",
  useCases: [
    "Choosing between three shortlisted software vendors where one is cheapest, one has the best support and one is easiest to use, and the team keeps changing its mind about which matters most.",
    "Comparing job offers by weighting salary, commute, growth and team, so you can see whether the higher offer still wins once commute is weighted realistically.",
    "Settling a hiring or supplier decision in a meeting by agreeing the weights first, then scoring each candidate, so the debate is about importance rather than about the winner.",
  ],
  benefits: [
    [
      "Weights that always add to 100%",
      "Adjusting one criterion redistributes the remaining percentage across the others in proportion, so the matrix stays internally consistent without manual arithmetic.",
    ],
    [
      "Ranked totals, not just a table",
      "Options are sorted by weighted score with rank badges, so the outcome and the size of the gap between first and second are both visible.",
    ],
    [
      "Per-criterion breakdown kept visible",
      "The score matrix shows every option's 0–10 rating on every criterion alongside its weight, so you can see exactly which criterion decided the ranking.",
    ],
  ],
  faqs: [
    [
      "What is a weighted decision matrix?",
      "It is a grid where each option is scored against several criteria, and each criterion carries a weight reflecting how much it matters. The score for an option is the weighted average of its ratings — here Σ(weight × score) ÷ Σ(weights), then multiplied by 10 to land on a 0–100 scale.",
    ],
    [
      "How do I choose the weights?",
      "Set them as percentages of importance that add to 100 — for example cost 30%, quality 25%, support 25%, ease of use 20%. Agree the weights before you score any option, because deciding importance after you have seen the scores is how a matrix gets bent toward a favourite.",
    ],
    [
      "What scale should I score options on?",
      "Each option is rated 0 to 10 on each criterion, where 10 is the best possible performance on that criterion. Keep the direction consistent — for a cost criterion, a cheaper option should score higher, not lower.",
    ],
    [
      "What if two options score almost the same?",
      "Treat a near-tie as a genuine tie: a one- or two-point gap out of 100 is inside the noise of subjective 0–10 ratings. Test it by nudging the weight of your most uncertain criterion and seeing whether the ranking flips, and if it does, decide on a factor the matrix does not capture.",
    ],
  ],
};

export default seo;
