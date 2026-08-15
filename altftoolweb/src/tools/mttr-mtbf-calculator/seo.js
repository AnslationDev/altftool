const seo = {
  title: "MTTR & MTBF Calculator with Availability and Nines",
  metaDescription:
    "Enter window hours, failures and repair time to get MTBF, MTTR, failure rate λ and availability as a percentage and its nines. One-click copy.",
  steps: [
    "Enter the 'Observation window (hours)' — or tap a preset from '1 week (168 h)' to '1 year (8760 h)' — and the 'Number of failures in the window'.",
    "Add the 'Total repair / down time across all failures (hours)', summed from failure detection to restored service over every incident.",
    "Read the Availability headline with its nines plus the MTBF, MTTR, failure rate λ, uptime and downtime rows, then click 'Copy result'.",
  ],
  intro:
    "This calculator computes MTBF (mean time between failures = uptime ÷ number of failures), MTTR (mean time to repair = total repair time ÷ number of failures), the failure rate λ = 1 ÷ MTBF, and inherent availability A = MTBF ÷ (MTBF + MTTR). It is built for SREs, maintenance engineers and operations teams who track incidents over a window — a week, a month, a quarter — and want the standard reliability metrics from raw counts and hours.",
  useCases: [
    "An SRE turning last month's incident log — 720 hours, 3 outages, 6 hours down — into MTBF 238 h, MTTR 2 h and 99.17% availability for a service review",
    "A maintenance engineer comparing two machines' MTBF over the same 90-day window to decide which one gets replaced first",
    "A platform team estimating how much MTTR must drop to reach a 99.9% availability target with the current failure frequency",
  ],
  benefits: [
    ["All four metrics at once", "MTBF, MTTR, failure rate and availability from three inputs, using the standard definitions."],
    ["Contradiction guards", "Rejects impossible data such as repair time longer than the window or downtime with zero failures."],
    ["Nines included", "Shows the availability both as a percentage and as its equivalent number of nines."],
  ],
  faqs: [
    [
      "How do you calculate MTBF?",
      "Divide total operating (up) time by the number of failures in the observation window: MTBF = uptime ÷ failures. For example, a service up 714 of 720 hours with 3 failures has an MTBF of 238 hours. MTBF applies to repairable systems; for parts replaced rather than repaired, the analogous metric is MTTF.",
    ],
    [
      "What is the difference between MTTR and MTBF?",
      "MTTR measures how long a repair takes on average (total repair time ÷ failures), while MTBF measures how long the system runs between failures on average (uptime ÷ failures). Together they set availability: A = MTBF ÷ (MTBF + MTTR), so you can raise availability either by failing less often or by recovering faster.",
    ],
    [
      "How is availability calculated from MTBF and MTTR?",
      "Availability = MTBF ÷ (MTBF + MTTR), which is algebraically identical to uptime ÷ total time. With MTBF 238 h and MTTR 2 h, availability is 238 ÷ 240 = 99.17%, roughly two nines.",
    ],
    [
      "What is a good MTTR?",
      "There is no universal number — it depends on the system and how MTTR is scoped (repair only, or detect-to-restore). Many software teams aim to restore user-facing service in under an hour, while hardware repairs are often measured in hours or days. The more useful practice is to define the clock consistently (when it starts and stops) and track the trend over time.",
    ],
  ],
};

export default seo;
