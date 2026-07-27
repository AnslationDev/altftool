const seo = {
  intro:
    "A glossary prompt builder scans a body of documentation for glossary candidates — acronyms, capitalised multi-word phrases and repeated domain nouns — and writes an AI prompt that defines each one under the terminology rules of ISO 704. That means intensional definitions built as a broader class plus the characteristics that distinguish the term, wording that could be substituted for the term in a sentence, and a hard ban on circular definitions. Product, docs and data teams use it to agree on one definition per concept before the disagreement shows up in a report.",
  useCases: [
    "Pull the acronyms and named metrics out of an internal spec and turn them into a glossary the whole team can cite.",
    "Settle a metric dispute by defining GMV, take rate and active user once, with the confusable neighbour named for each.",
    "Write a customer-facing glossary in plain language from the same source terms used internally.",
    "Prepare a terminology list for translators or an auditor, with the source of each definition recorded.",
  ],
  benefits: [
    [
      "Candidates found for you",
      "Acronyms, capitalised phrases and words repeated three or more times are extracted from your own text, so nothing obvious is missed.",
    ],
    [
      "Definitions that hold up",
      "The prompt enforces genus-plus-differentia form, substitutability and no circular wording — the rules ISO 704 sets for terminology work.",
    ],
    [
      "One concept, one term",
      "Older or informal names are recorded as deprecated rather than as equal alternatives, which is how a glossary actually reduces confusion.",
    ],
  ],
  faqs: [
    [
      "What makes a good glossary definition?",
      "Name the broader class first, then the characteristics that separate the term from its siblings — \"a payout window that opens once an order is marked complete\", not \"this is when we pay sellers\". A good test is substitution: if you can drop the definition into a sentence in place of the term and the meaning survives, it works.",
    ],
    [
      "What is a circular definition?",
      "One that uses the term, or a word built from it, to define itself — \"settlement window: the window in which settlement happens\". It tells the reader nothing. Rewriting it forces you to find the actual superordinate concept, which is where most glossary disagreements surface.",
    ],
    [
      "What does ISO 704 say about definitions?",
      "ISO 704 is the international standard for terminology work. It distinguishes intensional definitions, which give the superordinate concept plus delimiting characteristics, from extensional definitions, which list the members of the concept. It recommends intensional definitions as the default, and requires that a definition be substitutable for the term in context.",
    ],
    [
      "How many terms should a glossary have?",
      "Start with the terms that are actually contested or repeatedly explained — usually twenty to fifty for a product. A glossary that defines every noun in the product goes unread; one that defines the six metrics people argue about in meetings gets used.",
    ],
  ],
};

export default seo;
