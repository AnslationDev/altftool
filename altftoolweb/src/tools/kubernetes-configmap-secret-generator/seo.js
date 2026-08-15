const seo = {
  title: "Kubernetes ConfigMap & Secret Generator from .env",
  metaDescription:
    "Paste .env KEY=VALUE lines to get a ConfigMap and a base64 Secret manifest, keys checked against Kubernetes API rules and the 1 MiB cap — in your browser.",
  steps: [
    "Paste KEY=VALUE lines into the .env box (# comments, quotes and export prefixes handled) and set the Object name and optional Namespace.",
    "Pick a Secret type — Opaque, kubernetes.io/dockerconfigjson, kubernetes.io/tls or kubernetes.io/basic-auth; both manifests regenerate as you type.",
    "Copy the ConfigMap or the base64 Secret with its Copy YAML button; the Keys encoded card tracks bytes against the 1,048,576-byte limit.",
  ],
  intro:
    "This generator converts .env-style KEY=VALUE lines into ready-to-apply Kubernetes ConfigMap and Secret manifests, base64-encoding Secret values per RFC 4648 exactly as kubectl create secret does. Keys are validated against the API rule [-._a-zA-Z0-9]+ (max 253 characters) and the total payload against the 1 MiB object limit, so the YAML applies cleanly the first time. Everything runs locally in the browser — configuration values never leave the page.",
  useCases: [
    "Migrating a Docker Compose .env file into a ConfigMap for non-sensitive settings and a Secret for passwords and API keys",
    "Hand-writing a kubernetes.io/tls or basic-auth Secret and getting the base64 encoding right without piping through base64 -w0",
    "Checking why kubectl rejects a ConfigMap — usually a key with a space or colon that violates the [-._a-zA-Z0-9]+ rule",
  ],
  benefits: [
    ["Correct base64, in-browser", "Values are UTF-8 base64-encoded with a pure JS encoder verified against Node's Buffer — nothing is uploaded."],
    ["API-grade key validation", "Keys are checked against the exact apimachinery regex and 253-character cap before you ever run kubectl."],
    ["Both manifests at once", "One paste produces a plaintext ConfigMap and an encoded Secret, plus type-specific checks for tls and basic-auth."],
  ],
  faqs: [
    [
      "Are Kubernetes Secrets encrypted?",
      "No — by default Secret values are only base64-encoded, which anyone can reverse instantly. Real protection comes from RBAC limiting who can read Secrets, enabling encryption at rest for etcd, and using external stores (Vault, cloud secret managers, sealed-secrets) for anything committed to git.",
    ],
    [
      "What characters are allowed in ConfigMap and Secret keys?",
      "Letters, digits, hyphen, underscore and dot — the pattern [-._a-zA-Z0-9]+ — with a maximum length of 253 characters. Spaces, slashes and colons are rejected by the API server, which is the most common reason a generated manifest fails to apply.",
    ],
    [
      "What is the size limit for a ConfigMap or Secret?",
      "1 MiB (1,048,576 bytes) per object, a limit imposed by etcd's default maximum object size. Anything larger — certificates bundles, ML models, large JSON files — belongs in a volume, an image layer or object storage, not in a ConfigMap.",
    ],
    [
      "What is the difference between data and stringData in a Secret?",
      "data holds base64-encoded values and is what the API stores and returns; stringData is a write-only convenience field where you provide plaintext and the API server encodes and merges it into data on write. If the same key appears in both, stringData wins.",
    ],
  ],
};

export default seo;
