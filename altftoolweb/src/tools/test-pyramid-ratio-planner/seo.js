const seo = {
  title: "Test Pyramid Ratio Planner: Runtime, CI Cost",
  metaDescription:
    "Split a suite across unit, integration and E2E to see wall-clock per run, billed CI minutes, monthly spend and the odds a run fails on flakes.",
  steps: [
    "Set Total tests in the suite and Parallel CI workers, or start from a shape preset such as Classic pyramid — 70 / 20 / 10 (Cohn).",
    "Give the Unit, Integration and End-to-end rows a Share (%), Avg seconds / test and Flake rate (%), then set CI cost per billed minute (USD) and CI runs per day.",
    "Wall-clock per CI run leads the result with the shape it diagnoses, over a Layer table of Tests, Serial runtime and Expected flakes / run; Copy plan copies the lot.",
  ],
  intro:
    "This planner splits a test suite across unit, integration and end-to-end layers — the test pyramid popularised by Mike Cohn and Martin Fowler — and computes what each mix actually costs: serial and wall-clock runtime, billed CI minutes, monthly spend, and the probability a run fails on flaky tests alone (modelled as independent failures, 1 − Π(1 − p)^n). It is for tech leads and QA engineers deciding how many tests of each kind a suite should carry before the feedback loop or the CI bill gets out of hand.",
  useCases: [
    "A tech lead comparing the classic 70/20/10 pyramid against an integration-heavy trophy shape to see the runtime difference on their 1,000-test suite",
    "A team whose CI takes 40 minutes discovering that 100 E2E tests consume over 90% of the runtime despite being 10% of the suite",
    "An engineering manager estimating monthly CI spend from billed minutes per run, runs per day and their provider's per-minute price",
  ],
  benefits: [
    ["Runtime and cost together", "Converts a ratio into wall-clock feedback time, billed worker-minutes and a monthly bill — the numbers a mix actually produces."],
    ["Flakiness forecast", "Applies per-layer flake rates to show expected flaky failures per run and the chance a whole run goes red for no real reason."],
    ["Shape diagnosis", "Names the shape you have built — pyramid, trophy, or ice-cream cone — including the case where the count looks fine but the runtime is E2E-dominated."],
  ],
  faqs: [
    [
      "What is the ideal ratio of unit to integration to E2E tests?",
      "There is no single correct ratio — the classic pyramid illustration is roughly 70% unit, 20% integration and 10% end-to-end, from Mike Cohn's Succeeding with Agile. The principle behind it is what matters: push tests to the cheapest layer that can catch the failure, because unit tests run in milliseconds while E2E tests run in tens of seconds and flake more.",
    ],
    [
      "What is the ice-cream cone anti-pattern in testing?",
      "It is the inverted pyramid: more end-to-end tests than unit tests. It produces slow feedback (E2E tests are commonly hundreds of times slower than unit tests), high flake exposure, and failures that are hard to localise because one broken behaviour trips dozens of full-stack tests.",
    ],
    [
      "Does running tests in parallel reduce CI cost?",
      "No — parallel workers shorten wall-clock time, but CI providers bill per worker-minute, so total billed minutes stay roughly the same as the serial runtime. Parallelism buys faster feedback, not a smaller bill; only removing or speeding up tests reduces cost.",
    ],
    [
      "How much do flaky tests affect a CI pipeline?",
      "More than their rate suggests, because failure chances compound across the suite: 100 E2E tests that each flake 2% of the time give a (1 − 0.98^100) ≈ 87% chance that at least one fails per run, before any real bug. That is why suites concentrate flake-prone tests in a small E2E layer and quarantine or retry known flakes.",
    ],
  ],
};

export default seo;
