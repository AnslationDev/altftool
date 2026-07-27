/**
 * Cloud tagging policy generator.
 *
 * Encodes the tag/label limits each provider documents:
 *  - AWS: max 50 tags per resource, key <= 128 chars, value <= 256 chars,
 *    case-sensitive (docs.aws.amazon.com "Tag naming limits and requirements").
 *  - Azure: max 50 tags, key <= 512 chars, value <= 256 chars, keys
 *    case-insensitive (learn.microsoft.com "Use tags to organize resources").
 *  - GCP: max 64 labels, keys/values <= 63 chars, lowercase letters, digits,
 *    underscores and hyphens only (cloud.google.com "Requirements for labels").
 * The mandatory tag set follows FinOps Foundation cost-allocation guidance:
 * every resource carries environment, owner, cost centre, application and
 * project so 100% of spend can be allocated.
 */

export const PROVIDERS = [
  {
    id: "aws",
    label: "AWS",
    keyMax: 128, // AWS tag key limit
    valueMax: 256, // AWS tag value limit
    maxTags: 50, // AWS tags per resource
    lowercaseOnly: false,
    separator: ":", // AWS convention: namespace with "prefix:key"
    enforcement:
      "Enforce with AWS Organizations Tag Policies plus an SCP that denies ec2:RunInstances and s3:CreateBucket when mandatory tags are missing (aws:RequestTag / aws:TagKeys conditions).",
  },
  {
    id: "azure",
    label: "Azure",
    keyMax: 512, // Azure tag name limit (most resource types)
    valueMax: 256, // Azure tag value limit
    maxTags: 50, // Azure tags per resource or resource group
    lowercaseOnly: false,
    separator: "-",
    enforcement:
      'Enforce with Azure Policy: assign the built-in "Require a tag and its value on resources" definition per mandatory tag, and "Inherit a tag from the resource group" to propagate values.',
  },
  {
    id: "gcp",
    label: "Google Cloud",
    keyMax: 63, // GCP label key limit
    valueMax: 63, // GCP label value limit
    maxTags: 64, // GCP labels per resource
    lowercaseOnly: true, // GCP labels must be lowercase
    separator: "_", // GCP labels forbid ":" — underscore is the convention
    enforcement:
      "GCP labels cannot be enforced natively at create time for all services — enforce in Terraform (a required labels variable + validation block) and audit with Cloud Asset Inventory queries.",
  },
];

/** Optional tags teams commonly add beyond the mandatory five. */
export const OPTIONAL_TAGS = [
  {
    id: "data-classification",
    key: "data-classification",
    description: "Sensitivity of data the resource stores or processes.",
    values: ["public", "internal", "confidential", "restricted"],
    example: "confidential",
  },
  {
    id: "managed-by",
    key: "managed-by",
    description: "How the resource is provisioned, so manual drift is visible.",
    values: ["terraform", "pulumi", "cloudformation", "console", "cli"],
    example: "terraform",
  },
  {
    id: "team",
    key: "team",
    description: "Owning team name from the org chart.",
    values: null, // free text
    example: "platform-engineering",
  },
  {
    id: "expiry-date",
    key: "expiry-date",
    description: "ISO date after which the resource can be reaped (for sandboxes).",
    values: null,
    example: "2026-12-31",
  },
];

/** Org prefix must be short, lowercase and DNS-ish so it is legal on every provider. */
export const PREFIX_PATTERN = /^[a-z][a-z0-9-]{0,15}$/;

const splitList = (text) =>
  String(text ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const normalizeValue = (value, provider) => {
  let v = value.trim();
  if (provider.lowercaseOnly) v = v.toLowerCase().replace(/[^a-z0-9_-]+/g, "-");
  return v;
};

/**
 * Build the tagging policy.
 *
 * @param {object} input
 * @param {string} input.orgPrefix     Short lowercase namespace, e.g. "acme".
 * @param {string} input.providerId    One of PROVIDERS ids.
 * @param {string} input.environments  Comma-separated environment names.
 * @param {string} input.costCenters   Comma-separated cost-centre codes.
 * @param {string} input.ownerDomain   Email domain owners must use, e.g. "acme.com".
 * @param {string[]} input.optionalIds Ids from OPTIONAL_TAGS to include.
 * @returns {object} { tags, markdown, json, provider } or { error }.
 */
export function generateTaggingPolicy({
  orgPrefix,
  providerId = "aws",
  environments,
  costCenters,
  ownerDomain,
  optionalIds = [],
}) {
  const prefix = String(orgPrefix ?? "").trim().toLowerCase();
  if (!PREFIX_PATTERN.test(prefix)) {
    return {
      error:
        "Org prefix must start with a letter and use only lowercase letters, digits and hyphens (max 16 chars).",
    };
  }

  const provider = PROVIDERS.find((p) => p.id === providerId);
  if (!provider) return { error: "Choose a valid cloud provider." };

  const envs = splitList(environments).map((v) => normalizeValue(v, provider));
  if (envs.length === 0) {
    return { error: "List at least one environment (for example: prod, staging, dev)." };
  }

  const centers = splitList(costCenters).map((v) => normalizeValue(v, provider));
  if (centers.length === 0) {
    return { error: "List at least one cost-centre code (for example: cc-1010, cc-2040)." };
  }

  const domain = String(ownerDomain ?? "").trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/.test(domain)) {
    return { error: "Enter the owner email domain, for example acme.com." };
  }

  const key = (name) => `${prefix}${provider.separator}${name}`;
  // GCP label values may not contain "@" or "." — owners are recorded as the
  // mailbox local-part with double-underscore standing in for "@".
  const ownerExample = provider.lowercaseOnly
    ? `jane-doe__${domain.replace(/\./g, "-")}`
    : `jane.doe@${domain}`;

  const mandatory = [
    {
      key: key("environment"),
      required: true,
      description: "Deployment stage the resource belongs to.",
      values: envs,
      example: envs[0],
    },
    {
      key: key("owner"),
      required: true,
      description: provider.lowercaseOnly
        ? `Accountable person, encoded as local-part__domain (labels forbid "@" and ".").`
        : `Accountable person's work email at @${domain}.`,
      values: null,
      example: ownerExample,
    },
    {
      key: key("cost-center"),
      required: true,
      description: "Finance cost-centre code that pays for the resource.",
      values: centers,
      example: centers[0],
    },
    {
      key: key("application"),
      required: true,
      description: "Application or service the resource serves.",
      values: null,
      example: "checkout-api",
    },
    {
      key: key("project"),
      required: true,
      description: "Initiative or workstream that created the resource.",
      values: null,
      example: "q3-replatform",
    },
  ];

  const optional = OPTIONAL_TAGS.filter((tag) => optionalIds.includes(tag.id)).map((tag) => ({
    key: key(tag.key),
    required: false,
    description: tag.description,
    values: tag.values,
    example: tag.example,
  }));

  const tags = [...mandatory, ...optional];

  const tooLong = tags.find((t) => t.key.length > provider.keyMax);
  if (tooLong) {
    return {
      error: `Tag key "${tooLong.key}" exceeds ${provider.label}'s ${provider.keyMax}-character key limit — shorten the org prefix.`,
    };
  }

  const markdown = [
    `# ${prefix} cloud tagging policy (${provider.label})`,
    "",
    `Every billable resource MUST carry the ${mandatory.length} mandatory tags below.`,
    `${provider.label} limits: keys <= ${provider.keyMax} chars, values <= ${provider.valueMax} chars, max ${provider.maxTags} ${provider.id === "gcp" ? "labels" : "tags"} per resource.${provider.lowercaseOnly ? " Keys and values must be lowercase." : ""}`,
    "",
    "| Tag key | Required | Allowed values | Example | Purpose |",
    "|---|---|---|---|---|",
    ...tags.map(
      (t) =>
        `| \`${t.key}\` | ${t.required ? "yes" : "no"} | ${
          t.values ? t.values.map((v) => `\`${v}\``).join(", ") : "free text"
        } | \`${t.example}\` | ${t.description} |`,
    ),
    "",
    "## Enforcement",
    "",
    provider.enforcement,
    "",
    "## Rules",
    "",
    "- Untagged resources are quarantined after 7 days and deleted after 30 in non-production.",
    "- Tag values come from this policy only; new values are added by pull request to this file.",
    "- Cost reports group by `" + key("cost-center") + "` first, then `" + key("application") + "`.",
  ].join("\n");

  const json = JSON.stringify(
    {
      policy: `${prefix}-tagging-policy`,
      provider: provider.id,
      limits: {
        keyMax: provider.keyMax,
        valueMax: provider.valueMax,
        maxTags: provider.maxTags,
        lowercaseOnly: provider.lowercaseOnly,
      },
      tags: tags.map((t) => ({
        key: t.key,
        required: t.required,
        allowedValues: t.values,
        example: t.example,
        description: t.description,
      })),
    },
    null,
    2,
  );

  return {
    provider: provider.label,
    enforcement: provider.enforcement,
    mandatoryCount: mandatory.length,
    optionalCount: optional.length,
    totalCount: tags.length,
    tags,
    markdown,
    json,
  };
}
