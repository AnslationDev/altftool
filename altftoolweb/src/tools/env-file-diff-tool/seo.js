const seo = {
  intro:
    "This tool compares two .env files and lists every variable that is missing, extra or changed between them. It parses both files with standard dotenv rules — comments, export prefixes, quoting and escape sequences — so it reports real configuration drift rather than cosmetic formatting differences. It is built for developers reconciling staging against production, or a teammate's .env against .env.example.",
  useCases: [
    "Before a deploy, diff the staging .env against production to confirm a new SENTRY_DSN or FEATURE_FLAG variable was actually added to production.",
    "Compare your local .env against the repo's .env.example after pulling, to find variables new commits introduced that you have not set yet.",
    "Audit two microservice configs to spot a LOG_LEVEL or DATABASE_URL that silently diverged between environments.",
  ],
  benefits: [
    ["Semantic comparison", "FOO=bar and FOO=\"bar\" compare as equal because values are diffed after dotenv parsing, not as raw text."],
    ["Three-way classification", "Every key lands in exactly one bucket: only in A, only in B, or changed — with identical keys counted separately."],
    ["Duplicate detection", "Keys defined twice in one file are flagged, with dotenv's last-assignment-wins rule applied."],
  ],
  faqs: [
    [
      "How do I compare two .env files?",
      "Paste one file into each panel and the diff appears instantly: variables only in file A, only in file B, and keys whose values changed. Line order does not matter — comparison is by variable name, the way your runtime actually reads the file.",
    ],
    [
      "Does quoting matter when diffing .env files?",
      "No. Values are compared after dotenv parsing, so PORT=3000, PORT='3000' and PORT=\"3000\" are all the same value. Inside double quotes, escape sequences like \\n are expanded first, matching what dotenv-style loaders hand to your application.",
    ],
    [
      "What happens if the same key appears twice in one .env file?",
      "The last assignment wins, which is how dotenv's parser behaves when scanning down a file. The tool uses that final value for the comparison and separately warns you which keys were duplicated so you can clean them up.",
    ],
    [
      "Is it safe to paste secrets into this tool?",
      "The comparison runs entirely in your browser; nothing you paste is transmitted or stored. Still, treat any .env containing production credentials carefully — clear the page when done and avoid pasting secrets on shared machines.",
    ],
  ],
};

export default seo;
