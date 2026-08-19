const seo = {
  title: "Programming Terms Dictionary: 53 Definitions",
  metaDescription:
    "53 core programming terms — closure, Big O, CRUD, polymorphism, webpack — one plain sentence each, 12 category filters, search matches definitions.",
  steps: [
    "Type into the 'Search terms or definitions...' box — it matches the term name and the definition text, so typing index surfaces Array — or leave it empty to browse all 53 entries.",
    "Narrow with the category chips: All, AI, CS Basics, Data, Data Structures, DevOps, General, JavaScript, Methodology, OOP, Tools, UI and Web. The 'terms found' counter under the chips updates as you filter.",
    "Click a term row to expand its one-sentence definition, with the category tag shown beside the name. When nothing matches, the list is replaced by 'No terms found matching your search.'",
  ],
  intro:
    "This is a searchable glossary of 53 core programming terms — from Abstraction and Big O Notation through Closure, CRUD, Polymorphism and Webpack — each with a one-sentence plain-English definition and a category tag. Search matches the term name and the definition text, so you can find an entry by what it does even when you cannot remember what it is called, and the twelve category filters (CS Basics, OOP, Web, JavaScript, Data Structures, DevOps, UI, Data, Tools, AI, Methodology, General) narrow the list to one area at a time. It is aimed at people early in learning to code, or coming into a dev team from another discipline.",
  useCases: [
    "A standup mentions CI/CD, a closure and refactoring in the same two minutes and you want the three definitions without opening three tabs.",
    "You are studying for a junior developer interview and want to work through the OOP category — abstraction, encapsulation, inheritance, polymorphism — as a set.",
    "A product manager or designer reading an engineering ticket that assumes they know what the DOM, a component and state mean.",
  ],
  benefits: [
    ["Search hits the definitions too", "Typing 'index' finds Array even though the word is not in the term name, so you can look things up by description."],
    ["One sentence per term", "Every entry is a single definition you can read in a meeting, not an encyclopaedia article you have to skim."],
    ["Filter to the area you are learning", "Twelve category tags let you study just Data Structures or just DevOps rather than scrolling an alphabetical wall."],
  ],
  faqs: [
    [
      "How many terms does it cover?",
      "53 terms across 12 categories. It is a curated core vocabulary — the words that come up in a first job or a first course — rather than an exhaustive reference, so specialised terms in one language or framework will not all be here.",
    ],
    [
      "Is the search case-sensitive?",
      "No. Search is case-insensitive and matches any part of a term or its definition, so 'api', 'API' and 'interface' all surface the API entry.",
    ],
    [
      "Which categories are included?",
      "CS Basics, OOP, Web, JavaScript, Data Structures, DevOps, UI, Data, Tools, AI, Methodology and General. Selecting All clears the filter and shows every term, with a live count of how many match your current search.",
    ],
    [
      "Can I use this for study or teaching?",
      "Yes — the definitions are written to be quotable in notes, flashcards or an onboarding doc. For anything you will be examined on, pair it with your course material, since a one-line definition deliberately leaves out the caveats a full treatment would cover.",
    ],
  ],
};

export default seo;
