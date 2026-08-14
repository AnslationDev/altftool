const seo = {
  title: "Ad Copy A/B Test Sample Size and Run-Time Planner",
  metaDescription:
    "Sizes a two-variant ad test with the pooled two-proportion formula: sample per variant, whole-week schedule, media cost and platform character limits.",
  intro:
    "The Ad Copy A/B Planner works out how many impressions or clicks a two-variant copy test needs before its winner is trustworthy, using the standard two-proportion sample-size formula with a pooled null variance. Give it your current click-through or conversion rate, the smallest lift worth acting on, and your daily traffic, and it returns the sample per variant, the run time in days and whole weeks, and the media cost at your CPM or CPC. It also checks both variants against the published character limits for Google responsive search ads, Meta, LinkedIn and X.",
  useCases: [
    "Find out that lifting a 2% click-through rate by 20% relative needs 21,109 impressions per variant at 95% confidence and 80% power — nine days at 5,000 impressions a day.",
    "Decide whether a one-week test is worth starting by seeing the smallest lift that week of traffic could actually detect.",
    "Check that a challenger headline fits Google's 30-character responsive search ad limit before it is queued for review.",
  ],
  benefits: [
    ["Real sample maths", "Uses z(1-a/2) and z(power) quantiles in the pooled two-proportion formula, not a rule of thumb."],
    ["Schedule in whole weeks", "Rounds the run time up to full weeks so weekday and weekend behaviour are both represented."],
    ["Difference check", "Scores how much the two variants actually differ in wording, because near-identical copy produces a tie."],
  ],
  faqs: [
    [
      "How long should an ad copy A/B test run?",
      "Long enough to collect the calculated sample, and never less than 7 full days. A 2% baseline with a 20% relative lift target needs about 42,000 impressions in total at 95% confidence and 80% power, which is nine days at 5,000 impressions a day.",
    ],
    [
      "How many conversions do I need per variant for a valid test?",
      "It depends on the lift you want to detect, not on a fixed count. At a 2% baseline and 80% power, detecting a 20% relative lift takes roughly 422 conversions per variant; detecting a 10% lift takes about four times that, because sample size scales with the inverse square of the effect.",
    ],
    [
      "What is the character limit for a Google responsive search ad headline?",
      "30 characters per headline and 90 characters per description, plus 15 characters for each display path segment. Meta allows 40 characters for a headline and recommends 125 for primary text, LinkedIn allows 70 for a headline, and X allows 280 for the post.",
    ],
    [
      "Why is checking the test daily and stopping early a problem?",
      "Because every extra look is another chance to cross the significance line by luck, so repeated peeking pushes the real false-positive rate well above the 5% a 95% confidence level implies. Fix the sample and the end date first, then read the result once.",
    ],
  ],
  steps: [
    "Fill the Test inputs panel: pick a Platform and choose Impressions (testing CTR) or Clicks (testing conversion rate). The volume and cost labels change with that choice — Daily impressions plus CPM, or Daily clicks plus CPC — and you can then set Current rate, minimum relative lift, confidence and statistical power.",
    "Write Variant A (control) and Variant B (challenger) side by side. Each box is checked against the selected platform's first listed field and shows its own character count, limit, number, call-to-action and question diagnostics; changing copy updates those diagnostics and the Wording difference, but the sample plan depends on the numeric test inputs above.",
    "Read Run the test for and the rows beneath it, including sample per variant, total sample, whole-week schedule, expected events, estimated media cost and the lift a 7-day test could detect. Copy plan copies a text summary, while Reset restores every field to its defaults.",
  ],
};

export default seo;
