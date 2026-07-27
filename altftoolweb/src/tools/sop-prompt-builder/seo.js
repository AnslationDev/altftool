const seo = {
  intro:
    "The SOP Prompt Builder turns an application's word or character cap into a section-by-section writing plan and an AI prompt that will not invent credentials. It converts between the two limit systems at six characters per word — the convention used in typing-speed measurement, where a word is five characters plus a space — so a 4,000-character UCAS cap and a 650-word Common App cap can be planned identically. It then splits the limit across the six sections of a statement of purpose using the largest-remainder method, counts your programme-specific anchors, and flags the stock openings admissions readers see hundreds of times a cycle.",
  useCases: [
    "Plan a 4,000-character UCAS personal statement and see roughly how many words each section can afford.",
    "Check whether you have named enough real faculty, modules and labs for the statement to read as written for one department.",
    "Find and replace openings like 'from a young age' or 'I have always been passionate about' before a reader does.",
    "Build a prompt for a 500-word MBA essay that refuses to add achievements you did not list.",
  ],
  benefits: [
    [
      "Both limit systems handled",
      "Word caps and character caps convert into each other so you can plan either the same way.",
    ],
    [
      "Anchors counted, not assumed",
      "The tool counts your named people, modules and resources and warns below two.",
    ],
    [
      "Refuses to fabricate",
      "The prompt tells the model to leave bracketed placeholders rather than invent a lab or a grade.",
    ],
  ],
  faqs: [
    [
      "How long should a statement of purpose be?",
      "It depends on the form, which is why this tool asks for the actual limit. The Common Application personal essay is capped at 650 words and the form will not accept more. UCAS personal statements are limited to 4,000 characters including spaces. Taught master's programmes commonly ask for 500 to 1,000 words and PhD statements for 800 to 1,500 — but those are conventions, not rules, so confirm the figure on the programme page.",
    ],
    [
      "How do I convert a character limit into a word count?",
      "Divide by six. The convention comes from typing-speed measurement, where one word is defined as five characters plus the space that follows it. A 4,000-character limit is therefore about 667 words. Treat it as a planning figure and count the finished draft in the application form itself, since forms differ on whether they count spaces and line breaks.",
    ],
    [
      "What should you never write in a statement of purpose?",
      "Anything the reader has seen a hundred times that morning: childhood origin stories, dictionary definitions, famous quotations, and praise for how prestigious the institution is. Also avoid any claim you cannot attach to a specific project, course or job. This tool matches seventeen of the most common stock phrases and suggests what to write instead.",
    ],
    [
      "Is it acceptable to use AI to write my statement of purpose?",
      "Many institutions treat a submitted statement that is not substantially your own work as academic misconduct, and some now ask applicants to declare AI use. Use a prompt like this to plan structure, budget words and test your own draft — not to generate text you paste unchanged. Check the specific policy of every institution you apply to.",
    ],
  ],
};

export default seo;
