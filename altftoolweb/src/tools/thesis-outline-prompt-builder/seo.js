const seo = {
  title: "Thesis Outline Prompt Builder: 6-Chapter Word",
  metaDescription:
    "Split a thesis word count across six chapters (10/25/20/20/15/10%) and build an AI outline prompt that traces every research question through them.",
  steps: [
    "Enter the thesis topic or working title, the field / discipline, and a methodology: quantitative, qualitative, mixed methods, systematic review or design project.",
    "Pick a degree preset to fill the word count, adjust 'Total length (words)', set research questions (1-6) and the scope — population, place, period.",
    "Read the per-chapter word budget table, then press 'Copy prompt' to take the generated outline prompt to your AI assistant.",
  ],
  intro:
    "The Thesis Outline Prompt Builder allocates a thesis word count across the conventional six-chapter dissertation structure — introduction, literature review, methodology, results, discussion, conclusion — and writes an AI outline prompt that embeds the budget, numbered research questions and an explicit scope statement. It is built for undergraduate, master's and doctoral students who want a chapter plan that traces every research question through all six chapters, using the common 10% introduction / 25% literature review share guidance found in university dissertation handbooks.",
  useCases: [
    "A master's student with a 20,000-word limit splits it into a 2,000-word introduction, 5,000-word literature review and four further budgeted chapters before prompting for the outline.",
    "A PhD student planning an 80,000-word thesis generates an outline prompt that forces each of three research questions to appear in the introduction, methodology, results and discussion.",
    "A final-year undergraduate defines scope as one industry, one country and one time period so the generated outline states a delimitation instead of sprawling.",
  ],
  benefits: [
    [
      "Budget per chapter",
      "Every chapter in the prompt carries its own word allocation using the largest-remainder method, so the six budgets always sum exactly to your total.",
    ],
    [
      "Research-question tracing",
      "The prompt requires each numbered RQ to be introduced, grounded, operationalised, answered and interpreted — and flags any RQ that disappears mid-thesis.",
    ],
    [
      "Methodology-aware outlines",
      "Choosing quantitative, qualitative, mixed methods, systematic review or design project swaps in a directive written for that research design.",
    ],
  ],
  faqs: [
    [
      "How many words should each thesis chapter be?",
      "A widely used planning split is 10% introduction, 25% literature review, 20% methodology, 20% results, 15% discussion and 10% conclusion. For a 20,000-word master's thesis that gives 2,000 / 5,000 / 4,000 / 4,000 / 3,000 / 2,000 words. Treat it as a starting point — your university handbook and supervisor override any rule of thumb.",
    ],
    [
      "How many research questions should a thesis have?",
      "Most theses work best with one to three research questions, and this tool caps the count at six because more cannot each be answered properly in a single thesis. Each question should be answerable with your chosen methodology and name its unit of analysis.",
    ],
    [
      "How long is a typical bachelor's, master's or PhD thesis?",
      "Common norms are 8,000–12,000 words for an undergraduate dissertation, 15,000–20,000 for a taught master's, and up to 80,000 words for a doctoral thesis — the 80,000 cap appears in the regulations of many universities, including Oxford and Cambridge for humanities doctorates. Always confirm the limit in your own institution's regulations.",
    ],
    [
      "Will the generated outline invent citations?",
      "The prompt explicitly instructs the model to write [source needed] wherever literature must be filled in rather than fabricate authors, papers or datasets. You still must find and verify real sources yourself — AI-invented references are a common cause of academic misconduct findings.",
    ],
  ],
};

export default seo;
