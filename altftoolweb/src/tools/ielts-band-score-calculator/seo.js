const seo = {
  title: "IELTS Band Score Calculator: Overall & Raw Score",
  metaDescription:
    "Average the four skill bands with the official IELTS rounding - .25 up to the next half band - and convert Listening and Reading scores out of 40.",
  steps: [
    "For Listening and Reading choose \"Raw score out of 40\" or \"Band score\"; on raw, set the Reading module to Academic or General Training and type the score, then pick a Writing band and a Speaking band.",
    "Raw scores convert through the indicative IELTS tables and the four skill bands are averaged with the official rounding — an average ending in .25 goes up to the next half band, .75 to the next whole band.",
    "The Overall Band Score appears with the unrounded mean beneath it and a row per skill; Copy result copies the summary and Reset returns every input to its default.",
  ],
  intro:
    "This calculator computes the IELTS Overall Band Score — the mean of your Listening, Reading, Writing and Speaking bands rounded to the nearest half band, with averages ending in .25 rounding up to the next half band and .75 up to the next whole band, as defined by IELTS. It also converts Listening and Reading raw scores out of 40 into bands using the indicative tables IELTS publishes, with separate tables for Academic and General Training Reading. Test-takers use it to score practice tests and check what Writing or Speaking band they need for a target overall.",
  useCases: [
    "A candidate who got 32/40 in Listening and 29/40 in Academic Reading on a practice test estimating their overall band",
    "A student needing overall 7.0 for a university offer checking whether 6.5 in Writing still gets them there",
    "A General Training candidate comparing how the same raw Reading score converts to a lower band than on Academic",
  ],
  benefits: [
    ["Official rounding", "Applies the IELTS rule exactly — a 6.25 mean becomes 6.5, while 6.125 rounds down to 6.0."],
    ["Raw score tables", "Converts Listening and Reading scores out of 40 with the published indicative tables, Academic and General."],
    ["Target planning", "See the unrounded mean, so you know how close the next half band is."],
  ],
  faqs: [
    [
      "How is the IELTS overall band score calculated?",
      "It is the mean of the four skill bands (Listening, Reading, Writing, Speaking) rounded to the nearest whole or half band. Averages ending in .25 round up to the next half band and .75 rounds up to the next whole band — so 6.5 + 6.5 + 5.0 + 7.0 gives a mean of 6.25 and an overall band of 6.5.",
    ],
    [
      "How many correct answers do I need for band 7 in IELTS Listening?",
      "About 30 out of 40 questions, per the indicative conversion published by IELTS — 32–34 gives 7.5 and 26–29 gives 6.5. Actual test versions are equated for difficulty, so the boundary can shift by a question either way.",
    ],
    [
      "Is the Reading conversion different for Academic and General Training?",
      "Yes. General Training Reading requires more correct answers for the same band — band 6 needs roughly 30/40 on General Training but about 23/40 on Academic, because the Academic texts are harder. The Listening conversion is identical for both modules.",
    ],
    [
      "Does IELTS round 6.75 up or down?",
      "Up — an average of 6.75 becomes overall band 7.0. IELTS rounds averages ending in .25 up to the next half band and .75 up to the next whole band; only fractions below .25 or between .5 and .75 round down.",
    ],
  ],
};

export default seo;
