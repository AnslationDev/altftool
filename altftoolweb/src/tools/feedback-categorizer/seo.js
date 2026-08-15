const seo = {
  title: "Feedback Categorizer: Theme, Sentiment, Priority Tags",
  metaDescription:
    "Paste one comment per line and get a theme (Usability, Reliability, Feature request, Pricing, Praise or General) plus sentiment and priority.",
  steps: [
    "Paste your comments into the \"One feedback item per line\" box — it opens with five sample comments, and blank lines are skipped.",
    "Tagging runs as you type with no button to press: each line is matched in order against the Usability, Reliability, Feature request, Pricing and Praise keyword patterns, falling through to General.",
    "The Items, High priority and Themes counters and the Theme summary badges update live, and Categorized feedback lists every comment with its theme, its Positive/Negative/Mixed sentiment and a High or Normal priority badge.",
  ],
  intro:
    "Feedback Categorizer takes one customer comment per line and tags each one with a theme, a sentiment and a priority using keyword matching — themes are Usability, Reliability, Feature request, Pricing and Praise, with anything unmatched falling to General. Sentiment is Positive, Negative or Mixed depending on which cue words appear, and a line is flagged High priority if it reads negative or mentions checkout, billing or pricing. It is for product managers, founders and support leads who need a first pass over a pile of raw comments before deciding what to read closely.",
  useCases: [
    "A month of app-store reviews and support replies has piled up in a spreadsheet, so you paste the comment column in and see immediately whether the complaints cluster around reliability or around pricing.",
    "You are writing the agenda for a product review and need to say which themes moved, so you run last sprint's feedback and this sprint's separately and compare the theme counts.",
    "Someone forwards 40 responses from a survey's free-text box and you want the ones worth a same-day reply, so you sort by the High priority flag and read those first.",
  ],
  benefits: [
    ["Three labels per comment", "Every line gets a theme, a sentiment and a priority at once, so you can slice the same list by topic or by urgency without re-tagging."],
    ["Counts before you read", "The items, high-priority and themes tallies update live, which tells you the shape of the batch in a second — 40 items across two themes is a very different meeting from 40 across five."],
    ["Deterministic and inspectable", "Tagging is keyword-driven, not a model guess, so the same comment always lands in the same bucket and you can see why by the words it contains."],
  ],
  faqs: [
    [
      "What themes does it sort feedback into?",
      "Five: Usability, Reliability, Feature request, Pricing and Praise, plus a General bucket for anything that matches none of them. Each line is assigned to the first theme whose keywords it hits, checked in that order, so a comment can only carry one theme.",
    ],
    [
      "How does it decide what is high priority?",
      "A line is flagged High if its sentiment comes out Negative, or if it mentions a failure, checkout, billing or pricing — the areas where a single unresolved comment usually maps to lost revenue. Everything else is marked Normal.",
    ],
    [
      "What does the Mixed sentiment label mean?",
      "Mixed means the comment contains both positive and negative cue words, or neither. A line like praise for a new design followed by a complaint about pricing hits both sets, so it is labelled Mixed rather than being forced into one side.",
    ],
    [
      "How should I format the feedback before pasting it?",
      "One comment per line, with blank lines ignored. Multi-line comments should be flattened to a single line first, otherwise each of their lines is treated as a separate item and the counts will overstate your volume.",
    ],
  ],
};

export default seo;
