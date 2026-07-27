const seo = {
  intro:
    "A knowledge base article prompt builder converts a rough list of steps, prerequisites and screenshot notes into a structured AI prompt that produces a publishable help-centre article. It shapes the output using the OASIS DITA 1.3 information types — task, concept, reference and troubleshooting — so each article answers one reader question with the right sections, and it flags steps that are not written in the imperative mood before the model expands them. Support leads, technical writers and founders writing their own docs get a consistent article skeleton instead of a different structure every time.",
  useCases: [
    "Turn a support agent's five-line macro reply into a full task article with prerequisites, numbered steps and a verification result.",
    "Rewrite an inconsistent help centre by re-generating each article against one topic type so navigation and headings match across the whole site.",
    "Draft a troubleshooting article from a recurring ticket, with the symptom stated as the user sees it and causes ordered by likelihood.",
    "Brief a contract writer by handing over the generated prompt as the spec, including where screenshots and alt text are required.",
  ],
  benefits: [
    [
      "Structure from a real standard",
      "Section lists come from the DITA task, concept, reference and troubleshooting topic types, not an invented template.",
    ],
    [
      "Accessible screenshots by default",
      "Every screenshot marker asks for a caption and alt text, the text alternative WCAG 2.2 SC 1.1.1 requires.",
    ],
    [
      "No invented facts",
      "Missing menu names, limits and error codes come back as TODO(verify) markers instead of confident guesses.",
    ],
  ],
  faqs: [
    [
      "How do I write a good knowledge base article prompt?",
      "Give the model four things: the topic type, the reader's expertise, the ordered steps you already know, and an explicit instruction to mark unknown details as TODO(verify). The topic type matters most — a task article and a concept article need different sections, and mixing them is the usual reason a generated article reads like filler.",
    ],
    [
      "What are the four DITA topic types?",
      "Task (how do I do it), concept (what is it), reference (what are the values) and troubleshooting (why is it broken). They come from the OASIS DITA standard; troubleshooting was added as a topic type in DITA 1.3. Keeping one type per article is what makes a help centre scannable.",
    ],
    [
      "Should every step in a help article have a screenshot?",
      "No. Screenshot every step only for first-time-user flows; otherwise capture just the steps where the control is hard to find or the screen changes shape. Every image you keep needs alt text, because WCAG 2.2 SC 1.1.1 requires a text alternative that serves the same purpose.",
    ],
    [
      "How many steps should one article have?",
      "Aim for twelve or fewer. Past that, group the steps under two to four named stages so a reader who stops half-way can find their place, or split the procedure into separate linked articles. This builder flags any procedure over twelve steps and asks the model to add stage headings.",
    ],
  ],
};

export default seo;
