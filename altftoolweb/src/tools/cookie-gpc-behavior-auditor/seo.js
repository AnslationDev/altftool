const seo = {
  title: "Cookie Banner & GPC Auditor — 6-Signal Checklist",
  metaDescription:
    "Grade your reject-button and Sec-GPC test notes against six consent signals for a coverage percentage. It reviews pasted evidence, not the live site.",
  intro:
    "Cookie & GPC Behavior Auditor scans the notes, request logs or response headers you paste in for six consent signals — a reject option exists, reject actually stops non-essential tags, the Sec-GPC signal was tested, the preference persists, there is a route back to change it, and nothing was preselected — and reports which were found as a percentage of coverage. It is a structured review of evidence you gathered yourself, not a crawler, so it works on whatever you recorded from DevTools or a manual test pass. It suits privacy engineers and compliance reviewers who want the same six questions asked of every banner they check.",
  useCases: [
    "You clicked Reject on a site's banner, recorded in DevTools which tags still fired, and want that write-up graded against a fixed checklist rather than your memory of what matters.",
    "You are checking whether a vendor honours Global Privacy Control and need the Sec-GPC test to be a named line item in the report, not something you notice you forgot afterwards.",
    "You audit a dozen client sites a quarter and want each one summarised in the same six rows so the results can be compared and re-run after a fix.",
  ],
  benefits: [
    ["Reject is tested as behaviour, not presence", "A separate check looks for evidence that non-essential tags stopped loading, because a Reject button that changes nothing is the most common failure."],
    ["GPC gets its own line", "The Sec-GPC / Global Privacy Control signal is checked independently of the banner, so a site that only honours in-banner clicks does not score as compliant."],
    ["Strict mode names what is missing", "With strict review on, the summary counts the unmet signals and lists each one as a review item instead of averaging them away into a single score."],
  ],
  faqs: [
    [
      "Does this tool visit the site and test it for me?",
      "No — it reviews text you paste in. You run the test yourself in the browser, capture the requests, headers or notes, and this grades that evidence against the six checklist signals; nothing is fetched from the audited site.",
    ],
    [
      "What is Global Privacy Control?",
      "GPC is a browser-level opt-out signal sent as the HTTP header `Sec-GPC: 1` and exposed to scripts as `navigator.globalPrivacyControl`. It tells a site the visitor objects to the sale or sharing of their personal information, and some US state privacy regimes — California's among them — treat it as a valid opt-out request that must be honoured.",
    ],
    [
      "How is the coverage percentage worked out?",
      "It is the number of signals found divided by six, rounded to a whole percent, so each signal is worth about 17 points. A 100 percent score means every checklist keyword appeared in your notes — it does not mean the site is compliant.",
    ],
    [
      "Can I rely on this as a compliance sign-off?",
      "No. It is an informational checklist that catches obvious gaps in your own testing notes; consent law, lawful bases and the treatment of opt-out signals vary by jurisdiction and change over time. Have a qualified privacy counsel or DPO review anything you intend to rely on.",
    ],
  ],
};

export default seo;
