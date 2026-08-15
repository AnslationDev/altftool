const seo = {
  title: "CI Build Matrix Job Count & Runner Minutes Estimator",
  metaDescription:
    "Multiply matrix dimensions minus excludes plus includes for the real job count, checked against GitHub's 256-job cap, plus runner minutes per month.",
  steps: [
    "List Matrix dimensions one per line (name: value, value, ...) and set Excluded combinations, include entries, Average job duration (minutes) and max-parallel (0 = unlimited).",
    "Read Jobs per workflow run - the headline turns red when the matrix would break GitHub's 256-job limit, with warnings for GitLab's 200-job parallel:matrix cap.",
    "Check runner minutes per run, per day and per 30-day month alongside wall-clock time under max-parallel, then click Copy result for the breakdown.",
  ],
  intro:
    "This estimator computes how many jobs a CI build matrix really generates — the cartesian product of every dimension's values, minus exclude entries, plus include entries that add new combinations — and converts that into runner minutes per run, per day and per 30-day month. It checks the result against GitHub Actions' hard limit of 256 jobs per matrix and GitLab's 200-job parallel:matrix cap, and models wall-clock time under a max-parallel constraint.",
  useCases: [
    "Checking whether adding a fourth OS to an os x node x database matrix keeps the workflow under GitHub's 256-job limit",
    "Estimating the monthly runner-minute burn of a 27-job matrix that fires on every one of 40 daily pushes",
    "Comparing wall-clock feedback time at max-parallel 5 versus unlimited before capping concurrency to save money",
  ],
  benefits: [
    ["True fan-out math", "Product of dimensions minus excludes plus additive includes — the same arithmetic GitHub applies."],
    ["Limit warnings", "Flags matrices that would fail GitHub's 256-job cap or exceed GitLab's 200-job matrix limit."],
    ["Time and minutes together", "Separates billable runner minutes from wall-clock latency under max-parallel."],
  ],
  faqs: [
    [
      "How many jobs does a GitHub Actions matrix create?",
      "One job per combination of dimension values — the sizes multiplied together. A matrix with 3 operating systems and 4 language versions creates 12 jobs; exclude entries subtract matching combinations and include entries that match nothing add extra jobs on top.",
    ],
    [
      "What is the maximum number of jobs in a GitHub Actions matrix?",
      "256 jobs per workflow run. If the matrix would generate more, GitHub fails the workflow immediately rather than running a subset, so a 4 x 4 x 4 x 4 matrix (256) passes while adding a single include entry (257) breaks it.",
    ],
    [
      "Does max-parallel reduce the cost of a matrix build?",
      "No — every job still runs, so billable runner minutes are identical. max-parallel only limits how many jobs run at once, which stretches wall-clock time; teams use it to keep a big matrix from saturating self-hosted runners or concurrency limits, not to save money.",
    ],
    [
      "How do I shrink a CI matrix that has exploded?",
      "Cut whole dimensions before trimming values: testing 3 OSes only on the latest language version and one OS for older versions via include entries often cuts jobs by two-thirds. If you find yourself excluding more than half the combinations, invert the approach and list the wanted combos directly with include.",
    ],
  ],
};

export default seo;
