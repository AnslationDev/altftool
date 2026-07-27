const seo = {
  intro:
    "This builder turns a UPSC Mains question into a structured AI practice prompt using the exam's real parameters: 150-word 10-markers and 250-word 15-markers inside a 250-mark, 180-minute paper — which works out to 0.72 minutes per mark — plus the conventional 15/70/15 intro-body-conclusion split. It is for Civil Services aspirants who want model answers and examiner-style feedback that respect the actual constraints of the answer booklet.",
  useCases: [
    "An aspirant practising a GS Paper II 15-marker who wants a 250-word model answer with the directive 'critically examine' actually obeyed",
    "A candidate drilling answer structure by generating the 38/174/38-word intro-body-conclusion split for every 250-word answer",
    "An essay-paper aspirant getting a 1,000-1,200-word model essay and a strict scored evaluation out of 125 with named improvements",
  ],
  benefits: [
    ["Real exam arithmetic", "Time budgets come from the actual paper: 10 marks earns 7.2 minutes, 15 marks earns 10.8, essays earn 90."],
    ["Directive-first prompting", "Each of the seven directive words carries its UPSC meaning, so 'analyse' and 'comment' produce different answers."],
    ["Built-in evaluation", "The prompt ends by asking for a strict examiner score, weakest points and one enrichment that would lift marks."],
  ],
  faqs: [
    [
      "What is the word limit for UPSC Mains answers?",
      "150 words for 10-mark questions and 250 words for 15-mark questions in the General Studies papers — the limit is printed on the question paper itself. The Essay paper asks for two essays of 1,000-1,200 words each, carrying 125 marks apiece.",
    ],
    [
      "How much time should I spend per question in UPSC Mains?",
      "About 0.72 minutes per mark: each GS paper packs 250 marks into 180 minutes, so a 10-marker earns roughly 7 minutes and a 15-marker roughly 11. Overshooting on early questions is the most common reason candidates leave later questions unattempted.",
    ],
    [
      "Can I use AI like ChatGPT to prepare for UPSC answer writing?",
      "Yes, as a practice mirror — generate model answers under the real word limits and ask for a strict scored evaluation — but never as a source of facts. Language models fabricate committee reports, case names and data, so verify every citation against standard sources before it enters your notes.",
    ],
    [
      "What do directive words like 'critically examine' mean in UPSC questions?",
      "They prescribe the answer's shape: 'discuss' wants both sides reasoned to a view, 'critically examine' wants merits and faults probed with a final judgement, 'analyse' wants the issue broken into interacting components, and 'evaluate' wants worth weighed against criteria. Answering a 'critically examine' question with plain description is one of the costliest Mains mistakes.",
    ],
  ],
};

export default seo;
