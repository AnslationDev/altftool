const seo = {
  title: "Apdex Score Calculator — Rating Bands and Fix Plan",
  metaDescription:
    "Compute Apdex = (satisfied + tolerating/2) ÷ total from your APM counts, get the rating band, and the fewest request fixes to reach a target score.",
  steps: [
    "Enter the Satisfied (≤ T), Tolerating (T to 4T) and Frustrated request counts from your monitoring window; Target time T in seconds is optional and only labels the buckets.",
    "Set the Target Apdex score for the fix plan — the default of 0.94 is the Excellent threshold.",
    "Read the 0-to-1 score with its rating band and each bucket's share, plus the fix plan to your target, then click Copy result for the text summary.",
  ],
  intro:
    "This calculator computes an Apdex (Application Performance Index) score — (satisfied + tolerating ÷ 2) ÷ total samples — the standardised 0-to-1 user-satisfaction metric defined by the Apdex Alliance specification and reported by New Relic, Datadog and most APM tools. Enter the satisfied, tolerating and frustrated request counts from your monitoring window and get the score, its rating band, and the cheapest set of request fixes that lifts you to a target.",
  useCases: [
    "An SRE converting a monitoring window of 800 satisfied, 150 tolerating and 50 frustrated requests into the 0.88 score an APM dashboard would show",
    "A developer checking how many slow requests must be fixed to move a service from a Fair rating to the 0.94 Excellent threshold before an SLO review",
    "A team lead explaining to stakeholders why 5% frustrated requests drags the score down twice as hard as 5% tolerating ones",
  ],
  benefits: [
    ["Spec-exact formula", "Uses the Apdex Alliance definition — tolerating counts half, frustrated counts zero, and the tolerating ceiling is fixed at 4T."],
    ["Rating bands built in", "Maps the score to the standard bands: Excellent ≥ 0.94, Good 0.85–0.93, Fair 0.70–0.84, Poor 0.50–0.69, Unacceptable below 0.50."],
    ["Fix plan to a target", "Shows the minimum number of frustrated and tolerating requests to repair to reach any target score, using their exact 1 and ½ weights."],
  ],
  faqs: [
    [
      "How is an Apdex score calculated?",
      "Apdex = (satisfied requests + tolerating requests ÷ 2) ÷ total requests. Against a chosen target time T, requests at or under T are satisfied, those between T and 4T are tolerating (worth half), and those over 4T — or errored — are frustrated (worth nothing). 800 satisfied, 150 tolerating and 50 frustrated out of 1,000 gives (800 + 75) ÷ 1,000 = 0.875.",
    ],
    [
      "What is a good Apdex score?",
      "By the commonly used bands, 0.94 and above is Excellent, 0.85–0.93 is Good, 0.70–0.84 is Fair, 0.50–0.69 is Poor and anything below 0.50 is Unacceptable. Many teams set their alerting threshold in the 0.85–0.94 range, but the score is only meaningful relative to the T value it was measured against.",
    ],
    [
      "Why is the tolerating threshold always 4 times T?",
      "The factor of 4 is fixed by the Apdex Technical Specification so that scores are comparable across tools — you choose only T, the response time users find satisfying. With T = 0.5 s, requests up to 2 s count as tolerating and anything slower (or an error) counts as frustrated.",
    ],
    [
      "Can I compare Apdex scores between two services with different T values?",
      "No — the score is defined relative to its target time, so 0.90 at T = 0.1 s reflects a far stricter standard than 0.90 at T = 2 s. Compare services either by aligning them on the same T or by tracking each service's own score over time; treat the number as an informational index, not a universal grade.",
    ],
  ],
};

export default seo;
