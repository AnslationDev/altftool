const seo = {
  title: "Notion AI Prompt Builder for Pages & Databases",
  metaDescription:
    "Build Notion AI prompts for a page, selection or database autofill — length checked against the 2,000-character property limit, run count included.",
  steps: [
    "Choose Where it runs (a single page, a selected block, a database property or a whole database view) and an Action such as Summarise or Classify into a Select property.",
    "Set the Target length (words); for database scopes also fill the property it writes into, its type, allowed values, Rows in the view and AI properties per row.",
    "Check the estimated characters against Notion's 2,000-character property limit and the generations-in-one-run count, then click Copy prompt to paste it into Notion AI.",
  ],
  intro:
    "The Notion AI Prompt Builder writes prompts shaped by where they will run — a page, a highlighted selection, or a database property filled once per row. It converts your target length into an estimated character count and checks it against Notion's 2,000-character rich text property limit, and multiplies rows by AI properties to show how many generations a single autofill run will trigger. The output is plain text you paste straight into the Notion AI box.",
  useCases: [
    "Write an AI Summary property that returns the same two or three sentences for every row in an interview database.",
    "Classify support tickets into an existing Select property without the AI inventing a new category.",
    "Check whether a 500-word summary will fit in a text property before running it across 1,200 rows.",
    "Turn raw meeting notes on a page into minutes with owners and dates, without inventing decisions.",
  ],
  benefits: [
    ["Scope-aware", "A database prompt gets shape and consistency rules; a page prompt does not need them."],
    ["Length checked against the real limit", "Target words convert to characters and are tested against Notion's 2,000-character property cap."],
    ["Property-type rules", "Select, Date, Checkbox, Number and URL properties each get the exact output constraint they need."],
  ],
  faqs: [
    [
      "How do I write a good Notion AI prompt for a database?",
      "State the action, name the property it writes into and its type, fix the output format, and require every row to come out in the same shape. Consistency is what keeps the column sortable and filterable — an unconstrained prompt gives you a different format in every row.",
    ],
    [
      "What is Notion's character limit for a text property?",
      "Notion's API caps a single rich text content value at 2,000 characters, and longer values are truncated. At roughly six characters per word that is about 333 words, so an AI-filled summary property should target well under that.",
    ],
    [
      "How do I stop Notion AI inventing categories in a Select property?",
      "List the allowed values in the prompt and instruct it to return exactly one of them with no explanation, punctuation or quotation marks. Anything the model adds around the value — a full stop, a reason, quote marks — creates a new option in the property.",
    ],
    [
      "Should I run AI autofill on a whole database at once?",
      "Test on a filtered view of about ten rows first, especially past a few hundred generations, because a formatting mistake repeated across every row is tedious to undo. Run count is simply rows multiplied by the number of AI properties, so two AI columns over 600 rows is 1,200 generations.",
    ],
  ],
};

export default seo;
