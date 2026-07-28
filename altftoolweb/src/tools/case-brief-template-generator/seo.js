const seo = {
  intro:
    "A case brief is a one-page summary of a judicial decision that records the material facts, the legal issue, the rule applied, the court's holding, its reasoning and the final order. This generator lays those components out in IRAC, FIRAC or CREAC order, formats the citation in Bluebook, SCC or neutral-citation form, and flags any required component you have left blank. Built for law students, paralegals and moot participants who need consistent briefs across a whole reading list.",
  useCases: [
    "Brief the assigned reading for a first-year contracts or constitutional law class in a repeatable format your professor can follow.",
    "Prepare a case list for a moot problem where every authority needs the same headings so you can compare holdings side by side.",
    "Convert a long judgment you have already read into a revision card that keeps only the facts the court actually relied on.",
  ],
  benefits: [
    ["Framework you choose", "Switch between FIRAC, IRAC and CREAC ordering without retyping any section."],
    ["Citation built for you", "Bluebook, Indian SCC and neutral-citation formats, with the court parenthetical dropped when the reporter already identifies it."],
    ["Completeness check", "Shows which of the nine required components are still empty and whether the brief has grown past one page."],
  ],
  faqs: [
    [
      "What should a case brief include?",
      "Nine components: case name and citation, court and year, procedural history, material facts, the issue, the rule of law, the holding, the reasoning, and the disposition. Concurring and dissenting opinions plus your own notes are optional but are frequently where exam questions come from.",
    ],
    [
      "What is the difference between IRAC and FIRAC?",
      "FIRAC is IRAC with a Facts section placed first. IRAC opens with the Issue and is better for doctrine revision; FIRAC opens with the facts and is the ordering most law-school case briefs use because the issue only makes sense once the facts are on the page.",
    ],
    [
      "How long should a case brief be?",
      "About one page — roughly 250 to 700 words depending on spacing. If you are past that you are summarising the judgment rather than briefing it; the usual fix is to cut facts the court did not rely on and to compress the procedural history to a single sentence.",
    ],
    [
      "What is the difference between the holding and the disposition?",
      "The holding is the court's answer to the legal issue and is the part that becomes precedent; the disposition is the order that follows from it, such as affirmed, reversed and remanded, or appeal dismissed. A court can reverse the judgment below while holding for the party who lost on one of the issues.",
    ],
  ],
};

export default seo;
