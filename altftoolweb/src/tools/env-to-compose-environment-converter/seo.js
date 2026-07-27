const seo = {
  intro:
    "This tool converts .env entries into a docker compose environment block, in either of the two syntaxes the Compose Specification defines: the list form (- KEY=value) or the map form (KEY: value). It escapes literal dollar signs as $$ so compose interpolation cannot mangle values, quotes YAML-ambiguous scalars like NO, true and 3000, and can emit an env_file reference when you would rather keep values out of the compose file.",
  useCases: [
    "Inline a service's .env into docker-compose.yml for a self-contained example or reproduction case.",
    "Convert between list and map environment syntax when standardising a repo's compose files.",
    "Fix a value like PASSWORD=pa$$word or PRICE=$5 that docker compose keeps mangling, by generating the correctly $$-escaped form.",
  ],
  benefits: [
    ["Both compose syntaxes", "Generates the exact list or map form defined in the Compose Specification services element."],
    ["Interpolation-safe", "Literal $ becomes $$, the documented escape that stops compose from substituting ${VAR} patterns."],
    ["Norway-problem proof", "Values YAML 1.1 would reparse — NO, true, off, 3000, 1.10 — are quoted so they stay strings."],
  ],
  faqs: [
    [
      "Should I use the list or map form of environment in docker compose?",
      "Both are equivalent per the Compose Specification, so it is a style choice: the list form (- KEY=value) looks like .env lines, while the map form (KEY: value) is easier to merge across override files. The map form needs more care with quoting, since unquoted values like NO or 3000 are parsed by YAML as boolean and number.",
    ],
    [
      "Why does docker compose replace $ in my environment values?",
      "Compose interpolates ${VAR} and $VAR patterns in the compose file itself before starting containers. To pass a literal dollar sign through — common in password hashes and cron-like strings — the Compose spec requires doubling it: pa$$word in the file yields pa$word in the container. This tool applies that escape automatically.",
    ],
    [
      "What is the difference between environment and env_file in compose?",
      "environment inlines the variables in docker-compose.yml, where they are visible in version control and to anyone reading the file; env_file points at an external file that is loaded at container start and can stay gitignored. Values set in environment take precedence over the same keys from env_file.",
    ],
    [
      "Why is COUNTRY=NO quoted in the generated YAML?",
      "Because YAML 1.1, which compose parsers historically follow, reads unquoted NO as the boolean false — the well-known Norway problem. The same applies to yes, on, off, null and bare numbers, so the tool double-quotes any value that would change type when unquoted.",
    ],
  ],
};

export default seo;
