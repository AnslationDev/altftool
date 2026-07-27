const seo = {
  intro:
    "The Viva Question Prompt Builder turns your thesis abstract and methods summary into a mock-examiner prompt that generates the questions a viva panel is actually likely to ask. It distributes 4 to 40 questions across the seven areas oral examinations predictably cover — opening summary, originality, literature, methodology, findings, limitations and implications — the recurring clusters identified in doctoral-viva research by Trafford and Leshem. It is built for PhD, MPhil, master's and final-year students preparing for a thesis defence.",
  useCases: [
    "A PhD candidate three weeks from their viva pastes their abstract and gets 14 grouped questions, each quoting the exact claim it probes, plus a follow-up for weak answers.",
    "A master's student whose abstract never mentions sample size sees the generated examiner ask about that gap explicitly, and fixes the abstract before submission.",
    "A supervisor running a departmental mock viva generates question sets for five candidates in one sitting, each grounded in that candidate's own methods summary.",
  ],
  benefits: [
    [
      "Questions from your work, not a template",
      "The prompt forces the model to quote the specific phrase of your abstract each question probes, so nothing generic slips in.",
    ],
    [
      "Gap detection",
      "Where the abstract is silent on something examiners expect — sample size, rival explanations, ethics — the prompt instructs the model to ask about the gap and label it as one.",
    ],
    [
      "Even area coverage",
      "The question count is split across your selected defence areas so limitations and future work get probed, not just the findings you rehearsed.",
    ],
  ],
  faqs: [
    [
      "What questions are asked in a thesis viva?",
      "Viva questions are largely predictable and cluster into recurring areas: summarising the thesis, originality and contribution, positioning in the literature, methodology choices, how findings follow from data, limitations, and implications for future work. Research on doctoral examinations by Trafford and Leshem found examiners return to these same clusters across disciplines, which is why this tool distributes questions across exactly those areas.",
    ],
    [
      "How many questions should I prepare for in a viva?",
      "A typical doctoral viva lasts one to three hours and covers roughly 10 to 40 substantive questions with follow-ups. This tool caps the mock set at 40 and requires at least 4 so every selected area gets at least one question.",
    ],
    [
      "Can AI predict my actual viva questions?",
      "It can generate realistic questions in the areas examiners predictably probe, because those areas are well documented — but it cannot know your specific examiners or read your full thesis. Use the output for rehearsal alongside mock vivas with your supervisor, not as a forecast.",
    ],
    [
      "Why does the tool require my abstract instead of just the topic?",
      "Because useful viva questions attack specific claims, numbers and design choices, and only your abstract contains them. The tool requires at least 100 characters of abstract and instructs the model to quote the phrase each question probes, so a topic name alone would only produce generic questions.",
    ],
  ],
};

export default seo;
