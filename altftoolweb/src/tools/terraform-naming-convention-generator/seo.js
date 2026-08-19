const seo = {
  title: "Terraform Naming Convention Generator",
  metaDescription:
    "Build a {org}-{app}-{env}-{region}-{type} standard, check names against S3, Lambda, IAM, Azure storage and GCS limits, and copy a Terraform locals block.",
  steps: [
    "Enter your Organisation / team code and Workload / application, then pick Environment, Region code and Separator (or untick 'Include a region token').",
    "Check the results table - every generated name shows its length against the platform cap, such as 63 characters for S3 buckets and 24 for Azure storage accounts.",
    "Copy the ready-to-paste snippet under 'Terraform locals block', or click Copy result for the pattern, name list and locals together.",
  ],
  intro:
    "This generator produces a consistent Terraform resource naming standard of the form {org}-{app}-{env}-{region}-{type} and validates every generated name against real platform limits, such as the 63-character S3 bucket rule and the 24-character lowercase-only Azure storage account rule. It is built for platform and DevOps engineers who want one naming convention that works across AWS, Azure and Google Cloud without hitting provider errors at apply time.",
  useCases: [
    "A platform team standardising names before splitting a monolithic Terraform codebase into per-environment stacks",
    "An engineer checking whether a proposed prefix will still fit Azure's 24-character storage account limit in every region",
    "A consultancy generating a locals block and naming doc to hand to a client as part of a landing-zone engagement",
  ],
  benefits: [
    ["Real platform limits", "Every name is checked against documented rules: S3 3-63 chars, Lambda and IAM 64, Azure storage 24, Key Vault 24, GCS 63."],
    ["Separator-aware", "Automatically strips hyphens or underscores where a platform forbids them, like underscores in S3 buckets."],
    ["Ready-to-paste locals", "Outputs a Terraform locals block with a name_prefix you can interpolate in every resource."],
  ],
  faqs: [
    [
      "What is a good naming convention for Terraform resources?",
      "A widely used pattern is {org}-{app}-{env}-{region}-{type}, for example acme-billing-prod-use1-s3. Keeping tokens short, lowercase and in a fixed order makes names sortable in cloud consoles and lets you derive them from a single name_prefix local in Terraform.",
    ],
    [
      "How long can an S3 bucket name be?",
      "Between 3 and 63 characters. S3 bucket names must use only lowercase letters, numbers, hyphens and dots, cannot look like an IP address, and are globally unique across all AWS accounts, so a short org token or account-id suffix helps avoid collisions.",
    ],
    [
      "Why does my Azure storage account name fail validation?",
      "Azure storage account names allow only lowercase letters and numbers, 3 to 24 characters, with no hyphens or underscores. A convention that works for resource groups will usually be too long or contain separators, which is why this tool strips separators and re-checks the length for storage accounts specifically.",
    ],
    [
      "Should Terraform resource labels use hyphens or underscores?",
      "Underscores. The HCL style convention is lowercase_with_underscores for resource labels (the name in code), while the cloud-facing name argument typically uses hyphens. The two are independent, and this tool generates both forms.",
    ],
  ],
};

export default seo;
