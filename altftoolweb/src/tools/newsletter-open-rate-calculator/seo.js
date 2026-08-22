const seo = {
  title: "Newsletter Open Rate Calculator: Opens/Delivered",
  metaDescription:
    "Open, click, click-to-open, bounce, unsubscribe and complaint rates on their correct bases, plus an open rate with privacy-proxy opens removed.",
  steps: [
    "Enter \"Emails sent\", \"Bounces (hard + soft)\", \"Unique opens\", \"Unique clicks\", \"Unsubscribes\" and \"Spam complaints\" from the campaign report.",
    "Add \"Machine / privacy-proxy opens\", then set \"Your benchmark open rate (%)\" and \"Target open rate for the next send (%)\".",
    "Read the open rate of delivered plus the adjusted open, click, click-to-open, bounce, unsubscribe and complaint rows, then press \"Copy result\".",
  ],
  intro:
    "Newsletter Open Rate Calculator converts raw campaign counts into the six rates that matter — open, click, click-to-open, bounce, unsubscribe and spam complaint — each on the denominator the industry actually uses. Engagement rates are measured against delivered mail, which is sent minus bounces, while the bounce rate itself is measured against sent; mixing the two is the most common reporting mistake. It also produces an adjusted open rate with privacy-proxy opens removed, because pixel tracking counts prefetches as reads.",
  useCases: [
    "Report a campaign correctly when your platform quotes open rate against sent rather than delivered.",
    "Strip Apple Mail Privacy Protection prefetches out of an open rate that suddenly jumped.",
    "Check a complaint rate against the 0.1% level mailbox providers watch before scaling a send.",
    "Work out how many extra opens the next issue needs to hit a target rate on the same list size.",
  ],
  benefits: [
    ["Correct denominators", "Every rate states the base it uses, so open and click rates are comparable across platforms."],
    ["Privacy-proxy adjustment", "Enter machine opens and get a second open rate that reflects human reads."],
    ["Deliverability guardrails", "Flags a bounce rate above 2% and a complaint rate above 0.1%, the levels that put sending reputation at risk."],
  ],
  faqs: [
    [
      "How do you calculate email open rate?",
      "Divide unique opens by delivered emails and multiply by 100. Delivered means sent minus bounces, so 4,100 opens from 11,820 delivered is 34.69%. Using sent instead of delivered understates the rate.",
    ],
    [
      "Why did my open rate suddenly jump in 2021?",
      "Apple Mail Privacy Protection began pre-fetching tracking pixels for users who enable it, registering an open whether or not the message was read. Any pixel-based open rate since then is inflated by an unknown share, which is why click and click-to-open rates are more reliable.",
    ],
    [
      "What is the difference between click rate and click-to-open rate?",
      "Click rate is unique clicks divided by delivered emails; click-to-open rate is unique clicks divided by unique opens. Click rate measures the campaign end to end, while click-to-open isolates how persuasive the content was for people who actually opened it.",
    ],
    [
      "What spam complaint rate is too high?",
      "Mailbox providers generally treat complaints above 0.1% of delivered mail as a warning sign and 0.3% as severe enough to affect delivery. Bounce rates above about 2% point to list hygiene problems and should be cleared before the next send.",
    ],
  ],
};

export default seo;
