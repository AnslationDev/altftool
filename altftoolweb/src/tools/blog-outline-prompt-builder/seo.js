const seo = {
  intro:
    "The Blog Outline Prompt Builder converts a target article length into an explicit word budget per outline block — introduction, H2 sections, H3 subsections, FAQ and conclusion — and writes an AI outline prompt with that budget embedded. It is built for content writers and SEO teams who want an outline that actually fits the word count they were briefed, using a 10% introduction share, an 8% conclusion share and the 238 words-per-minute average silent reading rate from Brysbaert's 2019 meta-analysis to estimate reading time.",
  useCases: [
    "A freelance writer briefed for a 1,500-word how-to article splits it into five H2 sections of about 180 words each before prompting a model for the outline.",
    "An SEO lead plans a 3,000-word comparison page with subsections and a 6-question FAQ, and checks no section falls under the 120-word usefulness floor.",
    "A content manager standardises outline prompts across a team so every draft arrives with the same structure: one point per section, evidence noted, [source needed] instead of invented statistics.",
  ],
  benefits: [
    [
      "Budget-first outlines",
      "Every H2 and H3 in the prompt carries its own word allocation, so the drafted article lands near the target length instead of overshooting.",
    ],
    [
      "Structure warnings",
      "The tool flags sections thinner than about 120 words or fatter than about 500, before you waste a generation on an unbalanced outline.",
    ],
    [
      "Intent-matched directives",
      "Choosing informational, how-to, comparison, opinion or list intent swaps in a structural directive written for that reader, not generic filler.",
    ],
  ],
  faqs: [
    [
      "How many words should each section of a blog post be?",
      "A workable range is roughly 120 to 500 words per H2 section: below about 120 words a section cannot develop a point, and above about 500 readers lose the thread. This tool divides your body word budget evenly across sections and warns when the result falls outside that range.",
    ],
    [
      "How is the reading time on my article estimated?",
      "Reading time is the total word count divided by 238 words per minute, the mean silent reading rate for English non-fiction found in Brysbaert's 2019 meta-analysis of 190 reading-rate studies. A 1,500-word article therefore reads in about 6 minutes.",
    ],
    [
      "Why does the prompt give the model a word budget instead of just a word count?",
      "A single total lets the model distribute words however it likes, which usually inflates the introduction and starves the later sections. Handing it a per-block budget — for example 150 words of introduction, five 180-word sections, a 240-word FAQ and a 120-word conclusion for a 1,500-word piece — constrains the plan so the draft fits the brief.",
    ],
    [
      "Does the outline prompt stop the AI from inventing statistics?",
      "The generated prompt instructs the model to write [source needed] wherever evidence is required rather than fabricate figures, studies or quotations. You still need to verify and fill those markers yourself before publishing — no prompt makes model output trustworthy on its own.",
    ],
  ],
};

export default seo;
