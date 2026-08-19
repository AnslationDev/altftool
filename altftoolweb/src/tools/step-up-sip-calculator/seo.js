const seo = {
  title: "Step-Up SIP Calculator: Month-by-Month Corpus",
  metaDescription:
    "Raise your SIP a fixed % each year and see the corpus month by month, next to a flat SIP. Goal seek solves the starting instalment for a target.",
  steps: [
    "Enter your Monthly SIP, drag Annual step-up (10% by default), and set Expected return (% a year) and the Horizon slider up to 40 years.",
    "Switch to the Goal seek tab and enter a Target corpus — it binary-searches the starting SIP over the same month-by-month simulation.",
    "Compare the Step-up SIP card against Flat SIP (no step-up), scan the Year-wise breakdown table, then press Copy summary.",
  ],
  intro:
    "The Step-Up SIP Calculator projects a systematic investment plan whose instalment rises by a fixed percentage every year, running the maths month by month — each contribution is added and then grown at the annual return divided by 12 — and comparing the result against the same starting SIP left flat. It also works backwards: give it a target corpus and it solves, by bisection, for the monthly amount you would need to start with at your chosen step-up rate. It is for salaried investors who get an annual increment and want to know what routing part of it into an existing SIP is actually worth.",
  useCases: [
    "Your appraisal lands next month and you want to see whether raising your SIP by 10% a year beats keeping it flat by enough to justify the reduced take-home.",
    "You have a ₹1 crore goal 15 years out and want to know the starting instalment that gets you there with a 10% annual step-up, rather than the much larger flat instalment.",
    "You are deciding between stepping up 5% and 15% a year and want to see the final instalment each choice ends at, so you can check it is still affordable in year 12.",
  ],
  benefits: [
    ["Month-by-month, not a closed formula", "Every instalment is compounded individually, so the projection handles a contribution that changes each year instead of approximating it with a single annuity formula."],
    ["Always shows the flat SIP alongside", "The same starting amount left unstepped is calculated in parallel, so the extra corpus attributable to the step-up is stated in rupees rather than implied."],
    ["Goal-seek in both modes", "Enter a target and it solves for the required starting SIP with and without a step-up, which is the number most people actually want when a goal has a fixed deadline."],
  ],
  faqs: [
    [
      "How much difference does a step-up SIP really make?",
      "Substantially more than the step-up percentage suggests. Starting at ₹10,000 a month for 15 years at a 12% assumed return, a flat SIP reaches about ₹50.5 lakh while a 10% annual step-up reaches about ₹86.8 lakh — roughly 72% more, because the later, larger instalments still get several years of compounding.",
    ],
    [
      "What step-up percentage should I choose?",
      "Match it to your expected annual salary increment so the higher instalment stays affordable — 10% is the common default, and this calculator uses it as the starting value. Remember the instalment compounds too: ₹10,000 stepped up 10% a year becomes about ₹37,975 a month by year 15.",
    ],
    [
      "When during the year does the instalment increase?",
      "Once a year, on the anniversary — the amount is held constant for all 12 months of a year and then multiplied by (1 + step-up) for the next. That matches how fund houses implement step-up mandates, and it is why the invested total grows faster than the number of months would suggest.",
    ],
    [
      "Is the 12% return assumption realistic?",
      "It is a commonly used long-run equity assumption, not a promise — actual returns vary year to year and can be negative over shorter periods. Try the projection at 10% and 14% to see how wide the range of outcomes is, and treat all of it as informational rather than as investment advice; a SEBI-registered adviser can assess your own situation.",
    ],
  ],
};

export default seo;
