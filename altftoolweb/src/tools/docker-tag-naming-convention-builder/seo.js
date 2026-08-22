const seo = {
  title: "Docker Tag Naming Convention Builder (OCI-Valid)",
  metaDescription:
    "Compose Docker image tags from SemVer, branch, SHA, date and environment parts, validated against the OCI 128-character grammar with branches sanitised.",
  steps: [
    "Enter the registry host, namespace and repository name, and pick the separator between tag parts — hyphen, dot or underscore.",
    "Tick tag components — \"SemVer version (e.g. 1.4.2)\", \"Git branch (sanitised)\", \"Git commit SHA (short)\", build date or environment — and fill each value.",
    "Check the full image reference and the tag-length count out of 128 characters, then click \"Copy result\".",
  ],
  intro:
    "This tool builds a Docker image tagging convention from the parts teams actually use — SemVer version, git branch, short commit SHA, build date and environment — and validates the result against the OCI reference grammar used by Docker (tags of at most 128 characters from letters, digits, '_', '.' and '-', never starting with '.' or '-'). It is for platform and CI engineers standardising how images are named across pipelines, so every tag is legal, sortable and traceable to a commit.",
  useCases: [
    "A CI engineer defining one tag pattern like 1.4.2-9fceb02 for every service in a GitHub Actions or GitLab pipeline",
    "Turning per-branch preview builds into valid tags — feature/login is illegal in a tag and must become feature-login",
    "Auditing an existing scheme: checking length limits, lowercase repository rules and whether tags trace back to a commit",
  ],
  benefits: [
    ["Grammar-checked", "Every part is validated against the distribution/reference rules Docker itself enforces, so the tag never fails at push time."],
    ["Branch-safe", "Slashes, spaces and other illegal characters in branch names are sanitised to hyphens automatically."],
    ["Convention warnings", "Flags mutable 'latest', untraceable tags with no SHA or version, and unusual combinations."],
  ],
  faqs: [
    [
      "What characters are allowed in a Docker image tag?",
      "ASCII letters, digits, underscore, period and hyphen — the pattern [A-Za-z0-9_][A-Za-z0-9._-]* — with a maximum length of 128 characters, and the first character cannot be a period or hyphen. Anything else, including the '/' in branch names like feature/login, must be replaced before tagging.",
    ],
    [
      "Why should I avoid the latest tag in production?",
      "Because 'latest' is mutable: it silently moves to whatever image was pushed most recently, so two deployments of 'latest' can run different code and rollbacks become guesswork. Immutable tags built from a version or commit SHA, or digest pinning with @sha256:, make every deployment reproducible.",
    ],
    [
      "Should I tag images with the git SHA or a version number?",
      "Use both for different purposes: a short SHA tag (7-12 hex characters) on every CI build gives exact commit traceability, while a SemVer tag like 1.4.2 marks human-meaningful releases. Many teams push the same image with both tags, since tags are just pointers to one image digest.",
    ],
    [
      "Are uppercase letters allowed in Docker repository names?",
      "No. The repository path (namespace and name) must be lowercase — components match [a-z0-9]+ separated by '.', '_', '__' or '-', with the whole path limited to 255 characters. Tags may contain uppercase letters, but repository names may not, which is why MyApp fails to push while myapp works.",
    ],
  ],
};

export default seo;
