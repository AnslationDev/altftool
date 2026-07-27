const seo = {
  intro:
    "This calculator finds the latest time you can have a caffeinated drink by applying first-order decay — remaining = dose × 0.5^(hours ÷ half-life) — and working backwards from your bedtime to the residual dose you are willing to sleep on. It uses a default 5-hour half-life for healthy adults, lets you set your own, and cross-checks the answer against trial evidence showing 400 mg still disrupts sleep 6 hours before bed. Built for anyone who sleeps badly and is not sure whether the afternoon coffee is the reason.",
  useCases: [
    "You have a 4 pm meeting coffee and want to know how much of it is still circulating at your 11 pm bedtime.",
    "You are moving your bedtime earlier and need to shift your last-coffee time by the same amount.",
    "You switched from an energy drink to green tea and want to see how much the cutoff time moves.",
    "You know you metabolise caffeine slowly and want the cutoff recalculated on a 7-hour half-life.",
  ],
  benefits: [
    ["Pharmacokinetic, not a rule of thumb", "Uses the exponential decay equation rather than a fixed 'no coffee after 2 pm' rule."],
    ["Personal half-life", "Half-life is adjustable between 1.5 and 12 hours because clearance varies several-fold between people."],
    ["Evidence cross-check", "Never suggests a gap shorter than the 6 hours shown to disturb sleep in controlled testing."],
  ],
  faqs: [
    [
      "How many hours before bed should I stop drinking coffee?",
      "At least 6 hours, and longer for bigger doses or slower metabolisers. A controlled trial found 400 mg of caffeine taken 6 hours before bedtime still reduced total sleep time measurably, so 6 hours is the floor rather than a safe margin.",
    ],
    [
      "How long does caffeine stay in your system?",
      "The half-life in healthy adults averages about 5 hours, with an individual range of roughly 3 to 7 hours. After 5 hours half the dose remains, after 10 hours a quarter, and traces persist well beyond that — so a 200 mg coffee still leaves about 25 mg on board 15 hours later.",
    ],
    [
      "How much caffeine is in a cup of coffee?",
      "A 240 ml cup of brewed coffee contains roughly 95 mg, instant coffee about 62 mg, a single espresso about 63 mg, black tea about 47 mg and a 355 ml cola about 34 mg. Actual strength varies with the bean, grind and brew time, so treat these as typical rather than exact.",
    ],
    [
      "How much caffeine a day is too much?",
      "The FDA describes up to 400 mg a day as not generally associated with negative effects for healthy adults, and pregnancy guidance is usually under 200 mg a day. These are population figures — if caffeine gives you palpitations, anxiety or reflux, or you take interacting medication, discuss your own limit with a doctor.",
    ],
  ],
};

export default seo;
