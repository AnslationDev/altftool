const seo = {
  title: "Form Abandonment Simulator: Multiply Step Rates",
  metaDescription:
    "Paste one line per step as name, visitors, completion %. Rates chain through the funnel to give end-to-end conversion and the biggest leak.",
  steps: [
    "Paste one step per line into the \"Steps: name, visitors, completion %\" box, for example Account fields,8600,72.",
    "Edit any completion rate and the Step funnel re-models instantly, feeding each step's survivors into the next step.",
    "Read Conversion, Completions and Biggest leak at the top, with entered, dropped and continued counts under every step.",
  ],
  intro:
    "This simulator chains per-step completion rates into an end-to-end form conversion, so you can see what a multi-step signup actually loses. You paste one line per step as name, visitors, completion percentage; it takes the visitor count from the first step only, then feeds each step's survivors into the next — completed = entered x rate — and reports the final conversion, the number of completions, and the step that loses the most people in absolute terms. Because the rates multiply, five steps at 86, 72, 58, 61 and 88 percent come out at roughly 19 percent overall.",
  useCases: [
    "You are proposing to split a long signup into four screens and want to show stakeholders what four sequential 85% steps compound to before anyone builds it",
    "Analytics gives you a completion rate per screen but not a combined number, and you need the end-to-end figure for a forecast",
    "You want to argue for deleting the business-info step, so you model the funnel with and without it and compare the completions at the end",
  ],
  benefits: [
    ["Compounds the rates for you", "Step percentages multiply rather than average, which is the arithmetic people get wrong when they eyeball a funnel."],
    ["Ranks leaks by people, not percent", "The biggest-leak callout uses absolute drop count, so a modest percentage loss on a high-traffic early step is not hidden behind a dramatic late one."],
    ["Re-models instantly as you edit", "Change one rate in the text box and every downstream entered, dropped and continued figure recalculates, so what-ifs take seconds."],
  ],
  faqs: [
    [
      "What format does the input take?",
      "One step per line, comma separated: step name, visitors, completion percentage — for example 'Account fields,8600,72'. Completion is clamped to 0-100, and any line missing one of the three values is ignored.",
    ],
    [
      "Why does only the first row's visitor count matter?",
      "Because the model chains the funnel: every step after the first receives the number of people who completed the step before it. The visitor column on later rows is there so you can paste real analytics exports, but the simulation overrides it with the modelled survivors.",
    ],
    [
      "How is the overall conversion calculated?",
      "Final completions divided by the first step's visitors, rounded to a whole percent — which is mathematically the product of all the step rates. This is why adding a step with a 90 percent completion rate still costs you a tenth of everyone who reached it.",
    ],
    [
      "How does it choose the biggest leak?",
      "By the largest number of people dropped at a single step, not the lowest completion rate. In the sample funnel a 72 percent step reached by 8,600 people loses 2,408 of them, while a worse-looking 61 percent step further down loses only about 1,400 because far fewer people ever reach it.",
    ],
  ],
};

export default seo;
