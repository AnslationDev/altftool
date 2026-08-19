const seo = {
  title: "Monte Carlo Risk Lab: Lognormal Percentiles",
  metaDescription:
    "Run up to 20,000 seeded lognormal paths and read the 5th to 95th percentiles plus the share ending below your starting value. Same seed, same result.",
  steps: [
    "Set Starting value, Mean annual return (%), Annual volatility (%), Years, Simulations (100–20,000) and Seed, or click the 10-year scenario example.",
    "Every edit reruns the seeded lognormal paths; keep the Seed at 424242 to reproduce identical percentiles, or change it to draw an independent sample.",
    "Read the median outcome with the 5th, 25th, 75th and 95th percentile rows and Chance below start, then press Copy or Download for monte-carlo-risk-scenario-lab.txt.",
  ],
  intro:
    "The Monte Carlo Risk Scenario Lab runs thousands of seeded lognormal paths for a starting value, projecting each year as value × exp((μ − σ²⁄2) + σZ), and reports the spread of outcomes as the 5th, 25th, 50th, 75th and 95th percentiles plus the share of paths that finish below where they started. It is for anyone who wants to see a range instead of a single compounded number — how wide the outcomes get, and how often the downside case appears. Because the random draws come from a seeded generator, the same inputs always reproduce the same distribution, so a scenario can be shared or re-checked exactly. This is an illustration of a statistical model, not a forecast or investment advice.",
  useCases: [
    "You have been quoted an average annual return and want to see what an 18 percent volatility assumption does to the range around it before deciding how much certainty to attach to a plan.",
    "You are stress-testing a ten-year assumption for a written scenario note and need a downside figure — the 5th percentile path — rather than the average.",
    "A colleague questions your numbers, so you send them the seed along with the inputs and they regenerate the identical distribution to check it.",
  ],
  benefits: [
    ["Reproducible randomness", "A seeded linear congruential generator drives the draws, so the same seed and inputs return byte-identical percentiles every run instead of a slightly different answer each time."],
    ["The whole distribution, not the mean", "Five percentiles and an explicit probability of ending below the starting value show the shape of the risk, which a single average return hides."],
    ["Correct lognormal drift", "Annual growth is modelled as exp((μ − σ²⁄2) + σZ), so raising volatility widens the spread without silently inflating the expected outcome."],
  ],
  faqs: [
    [
      "How many simulations does it run?",
      "5,000 by default, adjustable from 100 up to 20,000. More paths make the tail percentiles steadier; below about 1,000 the 5th and 95th percentiles will visibly jump when you change the seed.",
    ],
    [
      "What does the seed do?",
      "It fixes the random sequence, so the same seed with the same inputs always produces exactly the same set of paths and percentiles. Changing the seed — the default is 424242 — gives an independent sample from the same model, which is a useful check on whether a result is stable or an artefact of one draw.",
    ],
    [
      "What does 'chance below start' mean?",
      "It is the fraction of simulated paths whose final value is lower than the starting value, expressed as a percentage. With the default setup — 100,000 starting value, 7 percent mean return, 18 percent volatility over 10 years — about 17 percent of the 5,000 paths end below the starting amount, which is the model's estimate of the probability of a nominal loss over that horizon.",
    ],
    [
      "Is this a prediction of what my investment will do?",
      "No. It is a seeded lognormal illustration that assumes a constant mean return and volatility and treats each year as independent — real returns are not normally distributed, and volatility clusters rather than staying fixed. Treat the output as a way to reason about spread, and speak to a licensed financial adviser before acting on it.",
    ],
  ],
};

export default seo;
