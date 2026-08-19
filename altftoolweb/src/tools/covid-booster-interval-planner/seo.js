const seo = {
  title: "COVID Booster Interval Planner: Earliest Date",
  metaDescription:
    "Enter your last dose and any recent infection, pick a 2, 3 or 6-month rule or custom day counts, and get your earliest eligible date and countdown.",
  steps: [
    "Enter the date of your last COVID vaccine dose and, optionally, the date of a recent infection (symptom onset or positive test).",
    "Pick an Interval rule preset or set your own \"Minimum days since the last dose\" and \"Days to defer after infection\".",
    "Read the Earliest eligible date — the later of the two rules, with the governing rule named — and click Copy result.",
  ],
  intro:
    "Booster timing comes down to one comparison: the minimum gap since your last COVID-19 vaccine dose versus the deferral period after a recent infection, whichever falls later. This planner takes both dates, applies the interval rule you select — 2 months since a dose and 3 months after infection, a 3-month programme rule, or a 6-month seasonal spacing — and returns the earliest eligible date with a countdown. Intervals are inputs rather than fixed values because national guidance differs and changes.",
  useCases: [
    "You had COVID six weeks after your last dose and need to know which of the two rules pushes your date later.",
    "You are booking a seasonal campaign appointment and want to check you clear the 6-month spacing.",
    "You are travelling and need the earliest date you can be boosted before you leave.",
    "You want to compare a 2-month and a 3-month interval rule side by side because you moved country.",
  ],
  benefits: [
    ["Both rules at once", "Shows the dose-interval date and the post-infection date, and tells you which one governs."],
    ["Country-agnostic", "Presets for the common 2-month, 3-month and 6-month rules, plus custom day counts."],
    ["Plain countdown", "Reports days remaining, or how long you have already been eligible."],
  ],
  faqs: [
    [
      "How long should I wait after COVID infection to get a booster?",
      "Guidance commonly suggests considering a delay of about 3 months from symptom onset or a positive test, because recent infection provides short-term protection. It is a recommendation rather than a hard contraindication, so ask your clinician if you are at high risk or in an outbreak.",
    ],
    [
      "What is the minimum gap between COVID vaccine doses?",
      "For most people the commonly published minimum for an additional updated dose is 2 months (about 56 days) since the previous COVID-19 vaccine, while seasonal programmes in many countries space doses about 6 months apart for eligible groups. Check the interval your own health service is using.",
    ],
    [
      "Which date wins if both a dose and an infection are recent?",
      "The later of the two. If your last dose was 1 January with a 56-day interval and you were infected on 1 February with a 90-day deferral, the dose rule clears on 26 February but the infection rule clears on 2 May — so 2 May is the earliest date.",
    ],
    [
      "Do immunocompromised people follow the same intervals?",
      "Not always — additional doses are often offered on a shorter schedule and without the post-infection wait, and the number of doses can differ. This is a case where the specialist looking after your condition should set the schedule rather than a general rule.",
    ],
  ],
};

export default seo;
