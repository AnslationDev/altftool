const seo = {
  intro:
    "This builder turns one list of allowed values into every artefact that must agree with it: an LLM prompt rule ordering the model to answer with exactly one value verbatim, a JSON Schema enum (draft 2020-12, where matching is exact and case-sensitive), a TypeScript string union, a Zod enum, a Python typing.Literal and a SQL CHECK constraint. It is for developers building structured LLM outputs who are tired of the prompt, the validator and the database silently drifting apart.",
  useCases: [
    "A developer classifying support tickets with an LLM who needs the prompt's allowed labels and the Zod validator generated from the same list",
    "A data engineer adding a SQL CHECK constraint that mirrors the exact enum the extraction pipeline's JSON Schema enforces",
    "A team spotting that 'Open' and 'open' both crept into their label set and collapsing them before models start tripping on case",
  ],
  benefits: [
    ["One source of truth", "Prompt, JSON Schema, TypeScript, Zod, Pydantic and SQL are all emitted from the same de-duplicated list."],
    ["Case traps caught", "Warns when values differ only by case, because JSON Schema enum matching is case-sensitive."],
    ["Fallback discipline", "The prompt rule always says what to answer when nothing fits — a chosen fallback or a detectable ERROR token."],
  ],
  faqs: [
    [
      "How do I force an LLM to answer with only specific values?",
      "Combine two layers: a prompt rule listing the exact values and ordering the model to copy one verbatim with no explanation, and a JSON Schema enum (or provider structured-output mode) that validates the response. The prompt alone is a request, not a guarantee — always validate.",
    ],
    [
      "Is a JSON Schema enum case-sensitive?",
      "Yes — the enum keyword requires the instance to equal one of the listed values exactly, so \"Open\" does not match \"open\". That is why prompt rules should tell the model to copy the value with the same spelling and case, and why label sets differing only by case are a defect.",
    ],
    [
      "What should the model answer when none of the enum values fits?",
      "Give it an explicit escape hatch: either add a real member like \"unknown\" or \"other\" to the enum, or instruct it to output a fixed token such as ERROR that your code detects and handles. Without one, models pick the least-wrong value and the mistake is invisible downstream.",
    ],
    [
      "Should the same enum be enforced in the database too?",
      "Yes — a SQL CHECK constraint (or a native enum type) mirroring the schema list is the last line of defence when application code or a model slips a bad value through. The generated CHECK uses standard IN-list syntax with single quotes doubled, which works across PostgreSQL, MySQL and SQLite.",
    ],
  ],
};

export default seo;
