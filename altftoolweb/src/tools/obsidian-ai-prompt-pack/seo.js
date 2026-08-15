const seo = {
  title: "Obsidian AI Prompt Pack: 12 Prompts + Syntax",
  metaDescription:
    "Twelve Obsidian prompts for linking, splitting and weekly review, with a live checker for wikilinks, tags, forbidden filename characters and date tokens.",
  steps: [
    "Under \"Fill the slots\" enter a Vault name plus Topic, Note title, Date range, Frontmatter properties and Max flashcards — anything left blank is pasted through as a {{placeholder}}.",
    "Under \"Choose your prompts\" tick the prompts you want from the Linking, Structure, Review and Research groups; the Pack size figure updates to show how many prompts and words are ready to paste.",
    "\"Your pack\" shows the combined text and \"Copy pack\" copies it, while the \"Vault syntax checker\" previews the daily note file name from your Daily note format and Sample date, the Wikilink built from Link to note / Heading / Alias, and whether your Tag is valid.",
  ],
  intro:
    "Obsidian AI Prompt Pack is a set of twelve ready prompts for the work a vault actually needs — surfacing links you have not made, splitting overgrown notes into atomic ones, consolidating duplicate tags, and reviewing a week of daily notes honestly. Each prompt carries its own constraints, and the page includes a live checker for Obsidian's real syntax rules: the characters forbidden in file names, wikilink forms such as [[Note#Heading]] and [[Note#^blockId|Alias]], tag rules, and daily note date tokens like YYYY-MM-DD. It is for people whose vault has quietly become a folder of orphaned notes.",
  useCases: [
    "Ask for link suggestions across twenty notes and get connections with the [[wikilink]] sentence already written, instead of 'both mention productivity'.",
    "Split a 3,000-word brain dump into atomic notes with declarative titles that state a claim rather than name a topic.",
    "Review a week of daily notes and find the item that has reappeared five times without moving.",
    "Merge overlapping tags by working out which name is already used most, before you run a vault-wide find and replace.",
  ],
  benefits: [
    ["Syntax checked live", "See the exact wikilink, tag and daily note file name your inputs produce before you use them."],
    ["Prompts with constraints", "Each one states what not to do, which is what stops an assistant inventing notes that do not exist."],
    ["Nothing leaves the browser", "Your notes are never read here — you paste them into your own assistant alongside the prompt."],
  ],
  faqs: [
    [
      "What characters can't be used in an Obsidian note title?",
      "Obsidian rejects * \" \\ / < > : | and ? in a note file name. Inside a wikilink you also cannot use #, ^, [, ] or | as part of the target, because those characters mean heading, block reference and alias respectively.",
    ],
    [
      "How do I link to a specific heading or block in Obsidian?",
      "Use [[Note Name#Heading]] for a heading and [[Note Name#^blockId]] for a block, where the block id is letters, digits and hyphens only. Add a display alias with a pipe: [[Note Name#Heading|what the reader sees]]. You cannot target a heading and a block in the same link.",
    ],
    [
      "Why is my Obsidian tag not working?",
      "The most common causes are a space in the tag and a tag made only of numbers — neither is allowed. Tags accept letters, digits, underscores, hyphens and forward slashes for nesting, so #year-2026 works where #2026 does not.",
    ],
    [
      "What date format do Obsidian daily notes use?",
      "The daily note file name uses Moment.js format tokens, and the default is YYYY-MM-DD. YYYY is the four-digit year, MM and DD are zero-padded month and day, MMM and MMMM give the short and full month name, and ddd and dddd give the short and full weekday name.",
    ],
  ],
};

export default seo;
