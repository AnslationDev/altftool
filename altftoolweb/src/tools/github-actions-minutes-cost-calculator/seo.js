const seo = {
  title: "GitHub Actions Minutes Cost – Estimate Your CI Bill",
  metaDescription:
    "Estimate the monthly GitHub Actions bill from jobs and durations: Linux $0.008/min, Windows 2x, macOS 10x, minus your plan's included minutes.",
  steps: [
    "Pick your 'GitHub plan' — Free (2,000), Pro or Team (3,000) or Enterprise Cloud (50,000 included minutes) — and tick 'Public repository (standard runners are free)' if that applies.",
    "For Linux (ubuntu-latest), Windows and macOS, enter 'jobs per month' and 'average minutes per job'; Windows minutes count 2x and macOS 10x against the allowance.",
    "Read the Raw minutes / Multiplier / Billed minutes table, overage minutes and the 'Estimated monthly overage cost' in USD, then click 'Copy result'.",
  ],
  intro:
    "This calculator estimates your monthly GitHub Actions bill from job counts and average durations, applying GitHub's documented billing rules: each job rounds up to a whole minute, Windows minutes count 2x and macOS minutes 10x against your plan's included allowance, and overage is charged from $0.008 per Linux minute. It is for engineering leads sizing a CI budget or hunting down why the Actions line item suddenly grew.",
  useCases: [
    "Forecasting the bill before adding a macOS build leg, where every minute counts ten times against the allowance",
    "Checking whether a team's 3,000 included minutes will survive moving nightly test runs from Linux to Windows runners",
    "Quantifying the saving from cutting an 8-minute test job to 5 minutes across 2,000 monthly runs",
  ],
  benefits: [
    ["Real GitHub rates", "Linux $0.008, Windows $0.016 and macOS $0.08 per minute, with the 1x/2x/10x allowance multipliers applied."],
    ["Rounding-aware estimate", "Your average minutes per job is rounded up to a whole minute, the same direction GitHub rounds each job — note this uses one averaged duration, so it approximates workloads where individual job lengths vary a lot."],
    ["Plan-aware", "Included allowances for Free (2,000), Pro and Team (3,000) and Enterprise Cloud (50,000) private-repo minutes."],
  ],
  faqs: [
    [
      "How much do GitHub Actions minutes cost?",
      "On standard GitHub-hosted runners, Linux costs $0.008 per minute, Windows $0.016 and macOS $0.08, billed only after your plan's included minutes are used. Included allowances for private repos are 2,000 minutes on Free, 3,000 on Pro and Team, and 50,000 on Enterprise Cloud.",
    ],
    [
      "Are GitHub Actions free for public repositories?",
      "Yes — standard GitHub-hosted runners are free without a minute cap for public repositories. Larger runners (4-core and up) are always billed regardless of repository visibility, and self-hosted runners are free to connect on any repo.",
    ],
    [
      "Why do macOS runners use up my GitHub Actions minutes so fast?",
      "Because of the 10x multiplier: one macOS minute consumes ten included minutes, so a 15-minute iOS build eats 150 minutes of allowance. Windows carries a 2x multiplier and Linux 1x, which is why moving jobs to ubuntu-latest is the single biggest lever on an Actions bill.",
    ],
    [
      "How does GitHub round Actions job time for billing?",
      "Each job is rounded up to the nearest whole minute individually — a job that runs 61 seconds bills as 2 minutes. Many short jobs therefore cost more than one long job of the same total duration, which is worth knowing before splitting a workflow into micro-jobs.",
    ],
  ],
};

export default seo;
