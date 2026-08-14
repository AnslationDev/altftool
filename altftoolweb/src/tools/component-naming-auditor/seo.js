const seo = {
  title: "React Component Naming Auditor: PascalCase Check",
  metaDescription:
    "Paste file paths and React snippets to flag non-PascalCase components, kebab-case file names and duplicate declarations as you type.",
  intro:
    "The Component Naming Auditor scans pasted file paths and React snippets for three specific kinds of naming drift: declarations after function, const or class that are not PascalCase, file names whose basename contains a kebab-case hyphen, and the same component name declared more than once. It is aimed at reviewers and anyone tidying a codebase that grew through several hands, and it returns a count of files, a count of components and a labelled list of findings. It reads only the text you paste, so it is a convention check rather than a compiler or linter.",
  useCases: [
    "You are reviewing a pull request that touches fifteen component files and want to confirm none of them slipped in a lowercase declaration before you approve.",
    "A codebase mixes UserCard.jsx and profile-card.jsx, and you need a concrete list of the mismatched file names to attach to the ticket proposing one convention.",
    "Two teammates independently created a component called Modal in different folders, and you want the duplicate declaration surfaced before the imports start resolving to the wrong one.",
  ],
  benefits: [
    [
      "Files and declarations checked together",
      "It matches paths ending in .js, .jsx, .ts or .tsx alongside the declarations in the same paste, so a PascalCase component sitting in a kebab-case file is caught as its own finding.",
    ],
    [
      "Duplicates surfaced by name",
      "Any component name appearing twice in the pasted text is listed explicitly, which is the failure that import autocomplete hides until something renders the wrong thing.",
    ],
    [
      "No project setup",
      "You paste a fragment and get findings, with no config file, dependency install or lint rule to wire up first, which suits a review of code you do not have checked out.",
    ],
  ],
  faqs: [
    [
      "what naming convention does it check for React components",
      "PascalCase, tested as a leading uppercase letter followed only by letters and digits. Names like userCard, user_card or UserCard2 behave differently under that rule: the first two are flagged, digits are allowed, and underscores or leading lowercase are not.",
    ],
    [
      "why is React strict about capital letters in component names",
      "JSX treats a lowercase tag as a built-in HTML element and an uppercase tag as a variable reference, so <userCard /> compiles to a literal userCard element rather than your component. That is the practical reason the PascalCase check matters more than style preference.",
    ],
    [
      "does it flag kebab-case file names as errors",
      "It flags them as a suggestion, not an error. Any file whose basename contains a lowercase letter immediately followed by a hyphen, such as profile-card.jsx, is listed with a note to consider matching your component-style file naming — plenty of teams deliberately use kebab-case files, so treat it as a consistency prompt.",
    ],
    [
      "does this replace ESLint",
      "No. It applies three regex checks to text you paste and never parses the code or resolves imports, so it will not catch hook rule violations, unused variables or anything requiring a real AST. Use it as a quick review pass and keep eslint-plugin-react in the repo for enforcement.",
    ],
  ],
};

export default seo;
