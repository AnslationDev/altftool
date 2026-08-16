const seo = {
  title: "JSON to TOML Converter: Tables & Arrays of Tables",
  metaDescription:
    "Convert JSON to TOML v1.0.0 with [table] sections, [[array of tables]] and quoted keys. Choose to omit or fail on nulls, since TOML has no null.",
  steps: [
    "Paste your JSON into the JSON input box — the root must be an object, and an example config is loaded for you to replace.",
    "Pick a policy under \"Null values (TOML has no null)\": \"Omit null keys (report them)\" or \"Fail on null values\". The TOML output updates as you type, with counts of keys converted, tables and array-of-table entries.",
    "Press Copy TOML to copy the converted document, or Reset to restore the example JSON.",
  ],
  intro:
    "This converter serializes JSON into idiomatic TOML v1.0.0 — nested objects become [table] headers, arrays of objects become [[array of tables]] blocks, and keys outside the bare-key alphabet are emitted as quoted keys with correct escaping. Because TOML has no null, the tool makes null handling explicit: omit the key with a report, or fail the conversion. It is built for developers moving app config from JSON into TOML files such as pyproject.toml, Cargo.toml or netlify.toml.",
  useCases: [
    "Converting a JSON config exported from a dashboard into a netlify.toml or wrangler.toml file",
    "Migrating tool settings from package.json-style JSON blocks into pyproject.toml sections",
    "Producing readable TOML fixtures from JSON API responses for a Rust or Python project's tests",
  ],
  benefits: [
    ["Idiomatic structure", "Nested objects become [table] sections and arrays of objects become [[array of tables]], not one giant inline blob."],
    ["Safe key quoting", "Keys with spaces, dots or unicode are emitted as quoted basic-string keys per the TOML spec."],
    ["Explicit null policy", "TOML has no null, so nulls are either omitted with a count or rejected — never silently mangled."],
  ],
  faqs: [
    [
      "How do I represent null in TOML?",
      "You cannot — the TOML specification has no null value, which is why this converter asks you to choose between omitting null keys and failing the conversion. The idiomatic TOML approach is to leave the key out entirely and treat absence as null in application code.",
    ],
    [
      "Why must the JSON root be an object to convert to TOML?",
      "Because a TOML document is itself a table (a set of key/value pairs), so a top-level JSON array or bare scalar has no TOML equivalent. Wrap a root array in an object first, for example {\"items\": [...]}, and it will convert as an array or an array of tables.",
    ],
    [
      "How does a JSON array of objects convert to TOML?",
      "Each object becomes one [[name]] block — TOML's array-of-tables syntax — so \"products\": [{...}, {...}] turns into two [[products]] sections. An object inside a mixed array (one that also holds numbers or strings) is emitted as a single-line inline table instead, because the spec only allows array-of-tables syntax when the whole array is objects.",
    ],
    [
      "When does a TOML key need quotes?",
      "Whenever it contains anything beyond ASCII letters, digits, underscore and dash — the only characters allowed in a bare key. This converter automatically writes such keys as quoted basic strings, so \"my key.v2\" = 1 comes out valid rather than breaking the file.",
    ],
  ],
};

export default seo;
