const seo = {
  title: ".env to .env.example Generator - Strip Secrets Safely",
  metaDescription:
    "Paste a real .env, get a commit-safe .env.example: keys, comments and order kept, credential-pattern keys always blanked. Runs entirely in your browser.",
  steps: [
    "Paste your file into the 'Your .env file' box - it opens with a sample containing NODE_ENV, DATABASE_URL and STRIPE_API_KEY lines. [pages/index.jsx:20-29, 108-117]",
    "Choose a Placeholder style - KEY= (blank value), KEY=<KEY> (angle-bracket placeholder) or KEY=changeme - and tick Keep comment lines, Keep blank lines or Keep non-secret values (NODE_ENV, PORT, true/false...). [pages/index.jsx:122-169; lib.js:16-20]",
    "Read the Generated .env.example panel with its Variables found, Values stripped and Values kept (non-secret) counts, then press Copy result. [pages/index.jsx:74-87, 182-237]",
  ],
  intro:
    "This tool converts a real .env file into a commit-safe .env.example by stripping every value while preserving keys, comments, blank lines and ordering — the convention documented by dotenv and used across Laravel, Rails and Node starter templates. Keys that match common credential patterns (SECRET, TOKEN, API_KEY, PASSWORD, DSN and similar, drawn from secret-scanner rule sets) are always blanked, and you can optionally keep obviously non-secret values like NODE_ENV or PORT.",
  useCases: [
    "Generate the .env.example for a new repository so contributors know exactly which variables to set without ever seeing production credentials.",
    "Refresh a stale .env.example after adding new variables to the real .env, keeping section comments and ordering intact.",
    "Sanitise an environment file before pasting it into a bug report, ticket or documentation page.",
  ],
  benefits: [
    ["Structure preserved", "Comments, blank lines, ordering and export prefixes survive, so the example file documents itself."],
    ["Secrets always stripped", "Keys matching credential patterns are blanked even when the keep-non-secret-values option is on."],
    ["Three placeholder styles", "Choose blank values (KEY=), angle placeholders (KEY=<KEY>) or KEY=changeme to suit your team's convention."],
  ],
  faqs: [
    [
      "What is a .env.example file and why commit one?",
      "A .env.example is a copy of your .env with the same keys but no secret values, committed to the repository so new developers know which environment variables the app needs. The real .env stays in .gitignore; the example file is safe to share because it contains structure, not credentials.",
    ],
    [
      "Which keys does the tool always treat as secrets?",
      "Keys containing fragments such as SECRET, TOKEN, PASSWORD, API_KEY, PRIVATE, CREDENTIAL, AUTH, DSN, ACCESS_KEY, CLIENT_SECRET, SALT, CERT or WEBHOOK are always stripped, regardless of options. The list mirrors the naming patterns secret scanners like gitleaks flag by default.",
    ],
    [
      "Can I keep some values in the generated example file?",
      "Yes — enable the keep-non-secret-values option and well-known configuration keys (NODE_ENV, PORT, LOG_LEVEL, TZ, DEBUG and similar) plus plain boolean or mode values like true, false and production are preserved. Anything matching a secret pattern is still blanked.",
    ],
    [
      "Does the tool upload my .env file anywhere?",
      "No. The conversion runs entirely in your browser with no network requests, so pasted values never leave your machine. Still review the output before committing, since a value can be sensitive even under an innocent-looking key name.",
    ],
  ],
};

export default seo;
