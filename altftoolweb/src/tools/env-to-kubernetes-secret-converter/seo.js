const seo = {
  title: ".env to Kubernetes Secret Converter (base64 YAML)",
  metaDescription:
    "Paste a .env and get a ready-to-apply Secret manifest with base64 data or plain stringData, validated against DNS-1123 name rules and the 1 MiB limit.",
  steps: [
    "Paste your variables into the '.env contents' box and set a Secret name (validated as a DNS-1123 subdomain) plus an optional Namespace.",
    "Tick 'Use stringData' to keep values readable instead of base64-encoding them into data, or 'Mark immutable'; keys are checked against the [-._a-zA-Z0-9]+ rule and the 1 MiB Secret limit.",
    "Press Copy YAML to grab the manifest for kubectl apply; the result panel confirms how many keys were converted and the approximate value bytes.",
  ],
  intro:
    "This tool converts a .env file into a Kubernetes Secret manifest, base64-encoding each value into the data field (or emitting plain stringData) exactly as kubectl expects. It validates the Secret name against the DNS-1123 subdomain rule and every key against the [-._a-zA-Z0-9]+ pattern the Kubernetes API server enforces, so the generated YAML applies cleanly on the first try.",
  useCases: [
    "Migrate a docker-compose service's .env to Kubernetes by generating the equivalent Opaque Secret for envFrom: secretRef.",
    "Hand-craft a Secret for a cluster without kubectl access, then apply it later or paste it into a dashboard.",
    "Produce a stringData manifest during code review so reviewers can read the values, letting the API server handle base64 on write.",
  ],
  benefits: [
    ["Correct base64", "Values are encoded from their UTF-8 bytes per RFC 4648 — identical output to echo -n value | base64."],
    ["API-server validation", "Secret names (DNS-1123, max 253 chars) and data keys ([-._a-zA-Z0-9]+) are checked before YAML is produced."],
    ["dotenv-aware parsing", "Comments, export prefixes, quoting and multiline values are parsed the way dotenv loaders read them."],
  ],
  faqs: [
    [
      "How do I convert a .env file to a Kubernetes Secret?",
      "Paste the .env, choose a Secret name, and copy the generated manifest — each variable becomes a key under data with its value base64-encoded, in the same shape kubectl create secret generic --from-env-file produces. Apply it with kubectl apply -f secret.yaml and reference it from a pod via envFrom.secretRef.",
    ],
    [
      "What is the difference between data and stringData in a Kubernetes Secret?",
      "data holds base64-encoded values, while stringData accepts plain text that the API server encodes into data on write. stringData is write-only convenience — when you read the Secret back you always see base64 in data, and if the same key exists in both fields, stringData wins.",
    ],
    [
      "Is base64 in a Kubernetes Secret encryption?",
      "No — base64 is a reversible encoding, decodable by anyone with base64 -d, and offers zero confidentiality. Real protection comes from RBAC on the Secret, encryption at rest for etcd, and keeping manifests with real values out of git (or using sealed-secrets/external-secrets for GitOps).",
    ],
    [
      "What are the naming rules for Secret keys and names?",
      "The Secret's metadata.name must be a DNS-1123 subdomain: lowercase letters, digits, '-' and '.', at most 253 characters, starting and ending alphanumeric. Each data key may contain letters, digits, '-', '_' and '.' — so typical UPPER_SNAKE_CASE env names are valid as-is. The whole Secret is limited to 1 MiB.",
    ],
  ],
};

export default seo;
