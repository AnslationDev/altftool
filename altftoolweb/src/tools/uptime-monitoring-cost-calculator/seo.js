const seo = {
  title: "Uptime Monitoring Cost Calculator: Checks & Detection",
  metaDescription:
    "Turn endpoints, check interval and probe locations into check runs per month, cost under metered or per-monitor pricing, and time to detect.",
  steps: [
    "Enter 'Endpoints monitored' and 'Probe locations', and pick a 'Check interval' from Every 10 seconds up to Every 1 hour.",
    "Choose the 'Pricing model' - 'Metered - price per 1,000 check runs' or flat per-monitor pricing - then fill in the price fields and your 'Availability target (%)'.",
    "Read 'Monthly monitoring cost' with check runs per month, mean and worst-case time to detect and the monthly downtime budget, then press 'Copy result' for the breakdown.",
  ],
  intro:
    "An uptime monitoring cost calculator converts a synthetic monitoring setup — endpoint count, check interval and number of probe locations — into check runs per month and the bill that follows, under either metered per-check-run pricing or flat per-monitor pricing. It also reports mean and worst-case time to detect, because a cheap 30-minute interval buys you a slow outage. Calculations use an average month of 30.4375 days (365.25 / 12), so annual figures are exactly twelve monthly ones.",
  useCases: [
    "Comparing a 1-minute and a 5-minute check interval across 3 regions before committing to a monitoring plan",
    "Explaining to finance why adding a fourth probe location quadruples nothing but the check count",
    "Checking whether your check interval is fine enough to notice an outage inside the downtime budget your SLO allows",
  ],
  benefits: [
    ["Volume before price", "Shows the check-run count that drives metered billing, so vendor quotes become comparable."],
    ["Detection time included", "Mean and worst-case detection make the real trade-off of a longer interval visible."],
    ["Budget cross-check", "Compares one missed detection against the monthly downtime budget your availability target allows."],
  ],
  faqs: [
    [
      "How many uptime checks per month does a 1-minute interval generate?",
      "43,830 per endpoint per location. An average month is 30.4375 days, or 2,629,800 seconds, so a 60-second interval runs 43,830 times — and 20 endpoints across 3 locations is 2,629,800 check runs a month.",
    ],
    [
      "How much downtime does 99.9% uptime allow?",
      "About 43.8 minutes a month, or roughly 8.8 hours a year. 99.95% allows about 21.9 minutes a month and 99.99% about 4.4 minutes — which is why a 5-minute check interval cannot meaningfully verify a 99.99% target.",
    ],
    [
      "Does checking from more locations cost more?",
      "Yes, almost always linearly. Most vendors bill each location's run as its own check, so three locations at a 1-minute interval costs three times a single location. The upside is that multi-location checks let you distinguish a real outage from one broken network path.",
    ],
    [
      "Do confirmation retries slow down alerting?",
      "Yes. Each retry adds its own delay before the alert fires, so two retries 30 seconds apart add a full minute on top of the check interval. Retries exist to suppress false positives from a single dropped request; one or two is usually the right balance.",
    ],
  ],
};

export default seo;
