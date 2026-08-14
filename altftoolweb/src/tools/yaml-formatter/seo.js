const seo = {
  title: "YAML Formatter: Re-indent, Key Paths, JSON Output",
  metaDescription:
    "Re-indent YAML at 2 or 4 spaces, list every key as a dotted path, and convert to JSON. YAML 1.2 core schema keeps enabled: no a string.",
  steps: [
    "Paste a Kubernetes manifest, GitHub Actions workflow or docker-compose file into the YAML input box.",
    "Pick an Indent width of 2 or 4 spaces, set \"Fold long scalars at\" to 80 columns, 120 columns or Never fold, and optionally tick \"Sort mapping keys A–Z\".",
    "Switch between Formatted YAML, JSON and Key list — which shows each dotted Key path with its Type — then press Copy result.",
  ],
  intro:
    "A YAML formatter re-indents a YAML document to a consistent structure, reports every mapping key as a dotted path, and converts the same data to JSON. This one parses with the YAML 1.2 core schema — the tag-resolution rules in §10.2 of the spec, which recognise null, bool, int, float and str and nothing else — so `enabled: no` and `2024-01-01` stay strings instead of silently becoming a boolean or a date. It is for engineers cleaning up Kubernetes manifests, GitHub Actions workflows, Ansible playbooks and docker-compose files.",
  useCases: [
    "Normalise a hand-edited Kubernetes manifest to 2-space indentation before opening a pull request",
    "Find the exact dotted path of a buried setting, such as spec.template.spec.containers[0].image, to reference in a patch or a yq query",
    "Convert a docker-compose or GitHub Actions snippet to JSON so it can be pasted into a tool that only accepts JSON",
  ],
  benefits: [
    ["Indentation you choose", "Re-emit at 2 or 4 spaces, with sequences indented under their parent key."],
    ["Every key, with its path", "Each mapping key is listed as a dotted path with its type and a value preview."],
    ["Errors point at the line", "A parse failure names the line and column and the reason, instead of just failing."],
  ],
  faqs: [
    [
      "How many spaces should YAML be indented with?",
      "Two. The YAML 1.2 spec only requires one or more spaces per block level, but 2 is the convention in Kubernetes manifests, GitHub Actions workflows, Ansible playbooks and docker-compose files, so it is the default here. Tabs are never allowed for indentation — the spec forbids them outright, which is the single most common reason a YAML file fails to parse.",
    ],
    [
      "Why did my `no` value stay a string instead of becoming false?",
      "Because this tool uses the YAML 1.2 core schema, where only the literal words `true` and `false` are booleans. YAML 1.1 treated `y`, `yes`, `no`, `on` and `off` as booleans too — the notorious 'Norway problem', where the country code `NO` becomes `false`. Quote the value as `\"no\"` if you need it to survive an older parser unchanged.",
    ],
    [
      "Is YAML valid JSON, or JSON valid YAML?",
      "JSON is a subset of YAML: since YAML 1.2 every valid JSON document is also a valid YAML document, so you can paste JSON in and it will parse. The reverse is not true — YAML has comments, anchors, multiple documents in one stream and unquoted strings, none of which JSON allows, which is why converting YAML to JSON drops comments entirely.",
    ],
    [
      "What happens if the same key appears twice in a mapping?",
      "It is reported as an error on the second occurrence. The YAML spec requires keys within a single mapping to be unique, and duplicates are a common source of silent bugs because many parsers just keep the last value. Rename or remove one of the two keys to format the document.",
    ],
  ],
};

export default seo;
