/**
 * Terraform resource naming convention generator.
 *
 * Name-length and character rules below come from each cloud provider's published
 * naming documentation:
 *  - AWS S3 bucket naming rules (docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html)
 *  - AWS Lambda CreateFunction API (FunctionName max 64 chars)
 *  - AWS IAM CreateRole API (RoleName max 64 chars, pattern [\w+=,.@-]+)
 *  - Azure resource naming rules (learn.microsoft.com/azure/azure-resource-manager/management/resource-name-rules)
 *  - Google Cloud Storage bucket naming (cloud.google.com/storage/docs/buckets#naming)
 *  - Terraform identifier rules for the resource label itself (developer.hashicorp.com/terraform/language/syntax/configuration)
 */

/** Common environment short codes used in the {env} token. */
export const ENVIRONMENT_OPTIONS = [
  { id: "dev", label: "Development (dev)" },
  { id: "test", label: "Test (test)" },
  { id: "stg", label: "Staging (stg)" },
  { id: "uat", label: "UAT (uat)" },
  { id: "prod", label: "Production (prod)" },
];

/**
 * Widely used short region codes (pattern popularised by the Azure Cloud Adoption
 * Framework abbreviation list and common AWS community conventions).
 */
export const REGION_OPTIONS = [
  { id: "use1", label: "AWS us-east-1 (use1)" },
  { id: "usw2", label: "AWS us-west-2 (usw2)" },
  { id: "euw1", label: "AWS eu-west-1 (euw1)" },
  { id: "aps1", label: "AWS ap-south-1 (aps1)" },
  { id: "eus", label: "Azure East US (eus)" },
  { id: "weu", label: "Azure West Europe (weu)" },
  { id: "inc", label: "Azure Central India (inc)" },
  { id: "usc1", label: "GCP us-central1 (usc1)" },
  { id: "global", label: "Global / region-less (global)" },
];

export const SEPARATOR_OPTIONS = [
  { id: "-", label: "Hyphen (-)" },
  { id: "_", label: "Underscore (_)" },
  { id: "", label: "None (compact)" },
];

/**
 * Per-resource naming rules. `abbrev` is the resource-type token appended to the
 * pattern. `sepOverride` is used when the platform forbids the chosen separator
 * (null = keep user separator, "" = strip separators entirely).
 */
export const RESOURCE_RULES = [
  {
    id: "tf_label",
    label: "Terraform resource label",
    abbrev: "", // the label names the resource inside code, no type token needed
    min: 1,
    max: 255, // practical limit; HCL identifiers have no hard published max, 255 keeps state keys sane
    allowUnderscore: true,
    allowHyphen: false, // idiomatic Terraform labels use underscores, not hyphens
    lowercaseOnly: true,
    sepOverride: "_",
    note: "Idiomatic HCL: lowercase with underscores, must not start with a digit.",
  },
  {
    id: "aws_s3_bucket",
    label: "AWS S3 bucket",
    abbrev: "s3",
    min: 3, // AWS S3 bucket naming rules
    max: 63, // AWS S3 bucket naming rules
    allowUnderscore: false, // S3 forbids underscores
    allowHyphen: true,
    lowercaseOnly: true, // S3 forbids uppercase
    sepOverride: null,
    note: "3-63 chars, lowercase letters, numbers and hyphens; globally unique.",
  },
  {
    id: "aws_lambda_function",
    label: "AWS Lambda function",
    abbrev: "fn",
    min: 1,
    max: 64, // Lambda CreateFunction FunctionName limit
    allowUnderscore: true,
    allowHyphen: true,
    lowercaseOnly: false,
    sepOverride: null,
    note: "Max 64 chars; letters, numbers, hyphens and underscores.",
  },
  {
    id: "aws_iam_role",
    label: "AWS IAM role",
    abbrev: "role",
    min: 1,
    max: 64, // IAM CreateRole RoleName limit
    allowUnderscore: true,
    allowHyphen: true,
    lowercaseOnly: false,
    sepOverride: null,
    note: "Max 64 chars; IAM names are case-sensitive but lowercase keeps them portable.",
  },
  {
    id: "azurerm_resource_group",
    label: "Azure resource group",
    abbrev: "rg",
    min: 1,
    max: 90, // Azure resource-name-rules: Microsoft.Resources/resourceGroups
    allowUnderscore: true,
    allowHyphen: true,
    lowercaseOnly: false,
    sepOverride: null,
    note: "Max 90 chars; alphanumerics, underscores, hyphens, periods.",
  },
  {
    id: "azurerm_storage_account",
    label: "Azure storage account",
    abbrev: "st",
    min: 3, // Azure resource-name-rules: Microsoft.Storage/storageAccounts
    max: 24, // Azure resource-name-rules: Microsoft.Storage/storageAccounts
    allowUnderscore: false,
    allowHyphen: false, // storage accounts allow lowercase letters and numbers ONLY
    lowercaseOnly: true,
    sepOverride: "",
    note: "3-24 chars, lowercase letters and numbers only — separators are stripped.",
  },
  {
    id: "azurerm_key_vault",
    label: "Azure Key Vault",
    abbrev: "kv",
    min: 3, // Azure resource-name-rules: Microsoft.KeyVault/vaults
    max: 24, // Azure resource-name-rules: Microsoft.KeyVault/vaults
    allowUnderscore: false,
    allowHyphen: true,
    lowercaseOnly: false,
    sepOverride: "-",
    note: "3-24 chars, alphanumerics and hyphens, must start with a letter; globally unique.",
  },
  {
    id: "google_storage_bucket",
    label: "GCS bucket",
    abbrev: "gcs",
    min: 3, // GCS bucket naming
    max: 63, // GCS bucket naming (single component without dots)
    allowUnderscore: true,
    allowHyphen: true,
    lowercaseOnly: true,
    sepOverride: null,
    note: "3-63 chars, lowercase letters, numbers, hyphens, underscores; globally unique.",
  },
];

/** Strip a free-text token down to lowercase letters and digits. */
export function sanitizeToken(raw) {
  if (typeof raw !== "string") return "";
  return raw.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Build the concrete name for one resource rule from ordered tokens.
 * Returns { name, length, valid, issues: string[] }.
 */
export function buildResourceName(tokens, separator, rule) {
  const sep = rule.sepOverride === null || rule.sepOverride === undefined ? separator : rule.sepOverride;
  const usableSep =
    (sep === "-" && !rule.allowHyphen) || (sep === "_" && !rule.allowUnderscore) ? "" : sep;
  const parts = tokens.filter(Boolean);
  if (rule.abbrev) parts.push(rule.abbrev);
  const name = parts.join(usableSep);
  const issues = [];
  if (name.length < rule.min) {
    issues.push(`Shorter than the ${rule.min}-character minimum.`);
  }
  if (name.length > rule.max) {
    issues.push(`Exceeds the ${rule.max}-character limit by ${name.length - rule.max}.`);
  }
  if (/^\d/.test(name)) {
    issues.push("Starts with a digit — most platforms require a leading letter.");
  }
  return { name, length: name.length, valid: issues.length === 0, issues };
}

/**
 * Build the full naming convention.
 * @returns {object} { pattern, results, localsBlock, validCount, totalCount } or { error }
 */
export function buildConvention({ org, app, env, region, separator, includeRegion = true }) {
  const orgToken = sanitizeToken(org);
  const appToken = sanitizeToken(app);
  const envToken = sanitizeToken(env);
  const regionToken = sanitizeToken(region);

  if (!orgToken) return { error: "Enter an organisation or team code (letters and digits)." };
  if (!appToken) return { error: "Enter a workload or application name (letters and digits)." };
  if (!envToken) return { error: "Choose an environment code." };
  if (includeRegion && !regionToken) {
    return { error: "Choose a region code or turn the region token off." };
  }
  if (!SEPARATOR_OPTIONS.some((option) => option.id === separator)) {
    return { error: "Choose a separator style." };
  }

  const tokens = includeRegion
    ? [orgToken, appToken, envToken, regionToken]
    : [orgToken, appToken, envToken];

  const patternTokens = includeRegion
    ? ["{org}", "{app}", "{env}", "{region}", "{type}"]
    : ["{org}", "{app}", "{env}", "{type}"];
  const displaySep = separator === "" ? "" : separator;
  const pattern = patternTokens.join(displaySep === "" ? "·" : displaySep);

  const results = RESOURCE_RULES.map((rule) => ({
    id: rule.id,
    label: rule.label,
    note: rule.note,
    max: rule.max,
    ...buildResourceName(tokens, separator, rule),
  }));

  const localsLines = [
    "locals {",
    `  org    = "${orgToken}"`,
    `  app    = "${appToken}"`,
    `  env    = "${envToken}"`,
    ...(includeRegion ? [`  region = "${regionToken}"`] : []),
    `  name_prefix = "${tokens.join(separator)}"`,
    "}",
    "",
    "# Example usage",
    `resource "aws_s3_bucket" "artifacts" {`,
    `  bucket = "\${local.name_prefix}${separator}s3"`,
    "}",
  ];

  return {
    pattern,
    results,
    localsBlock: localsLines.join("\n"),
    validCount: results.filter((entry) => entry.valid).length,
    totalCount: results.length,
    prefix: tokens.join(separator),
  };
}
