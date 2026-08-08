const seo = {
  title: "Tetanus Booster Due Checker: 5- or 10-Year Rule",
  metaDescription:
    "Enter your last tetanus dose and wound type to get the due date — the 10-year routine interval, the 5-year dirty-wound rule, and when TIG is indicated.",
  steps: [
    "Set \"Date of last tetanus dose\" and, if you are checking against another day, \"Assessment date\".",
    "Pick \"Previous doses\" (3 or more previous doses / Fewer than 3 previous doses / Unknown vaccination history) and \"Wound type\" (No wound — routine check, Clean, minor wound, or Dirty, deep, puncture, burn or crush wound), and tick \"Currently pregnant\" to add the Tdap-in-pregnancy check.",
    "Read the Booster status headline with rows for Time since last dose, Interval that applies, Next routine 10-year booster, 5-year wound cut-off and Tetanus immune globulin (TIG); \"Copy result\" copies the whole assessment with its reasons.",
  ],
  intro:
    "This checker tells you whether a tetanus booster is due by measuring the gap between your last tetanus-containing dose and today against the two intervals used in tetanus wound management: 10 years for routine cover after a complete primary course, and 5 years when the wound is dirty, deep, a puncture, a burn or a crush injury. It also flags the cases where a single booster is not enough — fewer than three lifetime doses or an unknown history, which call for completing the primary course and, for contaminated wounds, tetanus immune globulin alongside the vaccine. It is for anyone who has just cut themselves on something rusty or muddy, or who simply wants to know when their next Td or Tdap is due.",
  useCases: [
    "Someone who stood on a nail in the garden checking whether their 2019 booster still covers a puncture wound under the 5-year rule",
    "An adult with a routine dose recorded in 2014 working out the exact date their 10-year booster fell due",
    "A pregnant woman confirming that Tdap is recommended in this pregnancy even though her last tetanus dose was only two years ago",
  ],
  benefits: [
    [
      "Both intervals, one answer",
      "Applies the 10-year routine rule or the 5-year dirty-wound rule automatically from the wound type you pick.",
    ],
    [
      "Flags immune globulin",
      "Shows when TIG is indicated as well as the vaccine — contaminated wounds with fewer than 3 doses or an unknown history.",
    ],
    [
      "Exact due dates",
      "Returns the calendar date your next booster falls due and how many days away it is, not a vague 'about ten years'.",
    ],
  ],
  faqs: [
    [
      "How often do you need a tetanus booster?",
      "Every 10 years once you have completed the 3-dose primary course. The clock runs from your most recent tetanus-containing dose (Td or Tdap), so a dose given on 12 March 2018 puts the next routine booster on 12 March 2028.",
    ],
    [
      "Do I need a tetanus shot for a rusty nail if I had one 6 years ago?",
      "Yes — a puncture wound falls under the 5-year rule, so at 6 years since your last dose a booster is indicated. Rust itself is not the problem; the risk comes from soil, dust and faeces carrying Clostridium tetani spores into a deep or dirty wound.",
    ],
    [
      "How long is too long between tetanus shots — do I have to restart the course?",
      "You do not restart. If you completed 3 or more doses at any point in your life, a single booster restores protection no matter how many years have lapsed. A course only has to be completed when you have had fewer than 3 lifetime doses or your history is unknown.",
    ],
    [
      "What is tetanus immune globulin and when is it given?",
      "TIG is ready-made antibody that gives immediate protection while the vaccine takes effect, and it is given alongside the vaccine for dirty, deep or contaminated wounds when the person has had fewer than 3 doses or an unknown vaccination history. It is not used for clean, minor wounds, and it is not needed for anyone with a documented primary course.",
    ],
  ],
};

export default seo;
