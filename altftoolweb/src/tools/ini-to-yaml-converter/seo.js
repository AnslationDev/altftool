const seo = {
  title: "INI to YAML Converter with Nested Dotted Sections",
  metaDescription:
    "Paste INI and get YAML 1.2: [database.primary] nests into a hierarchy, true/false and numbers become real types, and every duplicate key is reported.",
  steps: [
    "Paste your config into INI input — both = and : delimit keys, and ; or # start a comment line.",
    "Tick Nest dotted section names ([a.b] becomes a: b:) and Infer types (true/false, numbers, empty = null), or untick to keep every value a string.",
    "Check the key count, the output size and any duplicate-key warnings beside the YAML, then use Copy YAML.",
  ],
  intro:
    "This converter turns INI configuration into structured YAML 1.2, nesting dotted section names like [database.primary] into a real hierarchy and inferring booleans, integers and floats from the text values. Because INI has no formal specification, it follows the de facto rules of Python's configparser and git config: = and : both work as delimiters, ; and # start comments, and the last duplicate key wins with a warning. It is built for developers migrating legacy INI config into YAML for Docker Compose, Kubernetes, CI pipelines or modern app frameworks.",
  useCases: [
    "Migrating a legacy PHP or Windows-style .ini application config to YAML for a containerised deployment",
    "Converting an alembic.ini or supervisord-style config into YAML to consolidate settings in one format",
    "Turning flat [section] files into nested YAML by using dotted section names as the hierarchy",
  ],
  benefits: [
    ["Real hierarchy", "Dotted sections such as [database.primary] become nested YAML maps instead of flat keys."],
    ["Type inference you control", "true/false, integers, floats and empty values become YAML types — or switch it off to keep everything as strings."],
    ["Honest duplicate handling", "A repeated key follows the common last-wins rule, and every override is listed so nothing changes silently."],
  ],
  faqs: [
    [
      "How do INI sections map to YAML?",
      "Each [section] becomes a YAML mapping key with its key=value pairs nested under it, and keys written before any section stay at the top level. With nesting enabled, a dotted name like [database.primary] becomes database: primary:, giving you a real hierarchy YAML tools can query.",
    ],
    [
      "Does the converter turn INI values into real YAML types?",
      "Yes, when type inference is on: true and false become booleans, 8080 becomes an integer, 2.5 becomes a float and an empty value becomes null. Values wrapped in quotes always stay strings, and ambiguous text such as 007 or yes is left as a string rather than guessed.",
    ],
    [
      "What happens when the same key appears twice in an INI file?",
      "The last occurrence wins, matching what Python's configparser does with strict=False and what most INI readers do in practice. This converter additionally reports every overridden key with its line number, so a duplicate never slips through unnoticed.",
    ],
    [
      "Are both = and : valid INI delimiters?",
      "Yes — Python's configparser accepts both by default, so this converter does too, splitting each line at the first = or : it finds. Full-line comments can start with either ; (the classic INI marker) or #.",
    ],
  ],
};

export default seo;
