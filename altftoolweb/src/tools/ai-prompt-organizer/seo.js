const seo = {
  intro:
    "AI Prompt Organizer is a local prompt library: save each prompt with a title, description, category, target model and tags, then search across titles, descriptions, content and tags, and copy any one to the clipboard in a click. While you write, it scores the draft out of 5 against the structural checks that separate a working prompt from a wish — does it assign a role, give context, state the task, use a [VARIABLE], and define an output format. Everything lives in your browser's localStorage, with Markdown, CSV, JSON and PDF export so the library is portable.",
  useCases: [
    "The prompt that finally produced the right output is buried three chats back and you want it saved, tagged and findable next time",
    "Your team keeps rewriting the same code-review and meeting-summary prompts, and you want one exportable Markdown file everyone works from",
    "You are learning prompt engineering and want feedback on whether a draft actually specifies a role and an output format, not just a vague request",
  ],
  benefits: [
    [
      "Structural quality score while you type",
      "Five live checks — role, context, task, [VARIABLE] placeholder, output format — turn 'this prompt feels weak' into a specific missing piece.",
    ],
    [
      "Six insertable building blocks",
      "Role, Context, Task, Steps, Output format and Constraints snippets append to the draft, so a rough idea becomes a structured prompt without retyping the scaffolding.",
    ],
    [
      "Four export formats, no lock-in",
      "Markdown for docs, CSV for a spreadsheet, JSON for a full backup and a print-to-PDF view — per prompt or across whatever your current filter shows.",
    ],
  ],
  faqs: [
    [
      "Where are my saved prompts stored?",
      "In your browser's localStorage under the key premium_prompts_replica_v2 — nothing is sent to a server or tied to an account. They are therefore specific to this browser and profile, and clearing site data removes them, so take a JSON export as a backup.",
    ],
    [
      "What makes a prompt score 5 out of 5?",
      "It must assign a role ('You are…', 'Act as…'), supply context or background, state the task with an action verb, include at least one [VARIABLE] placeholder in capitals and brackets, and name an output format such as Markdown, JSON, a table or a bullet list. The checks are pattern matches on your text, so they measure structure, not whether the prompt gets a good answer.",
    ],
    [
      "How do I organise a large library?",
      "Use the eight built-in categories — Writing, Coding, Marketing, Design, Business, SEO, Social Media and Productivity — plus free-form comma-separated tags, and the five filter chips for All, Recent, Favorites, Personal and Team. Search matches title, description, full prompt content and tags at once, so a distinctive phrase inside the prompt body finds it.",
    ],
    [
      "Can I share a prompt with someone else?",
      "Yes — copy the content, download that single prompt as a .md file, or open a prefilled email or post. Sharing produces a file or a message you send yourself; there is no hosted copy, since nothing is stored outside your browser.",
    ],
  ],
};

export default seo;
