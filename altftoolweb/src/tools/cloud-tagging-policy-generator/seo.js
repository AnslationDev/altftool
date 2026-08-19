const seo = {
  title: "Cloud Tag Policy Generator for AWS, Azure & GCP",
  metaDescription:
    "Build a mandatory cloud tag schema — environment, owner, cost-center, application, project — with provider-legal keys, exported as Markdown or JSON.",
  steps: [
    "Enter your Org prefix, Environments, Cost-centre codes and Owner email domain, then pick AWS, Azure or Google Cloud in the Cloud provider dropdown.",
    "Tick the Optional tags to include (e.g. managed-by) and switch the output between the Markdown and JSON format buttons.",
    "Review the Tags in the policy count and the schema with its enforcement recipe, then click Copy policy to copy it.",
  ],
  intro:
    "This generator produces a ready-to-adopt cloud tagging policy: a mandatory tag schema (environment, owner, cost-center, application, project) with allowed values, provider-legal key names and an enforcement recipe, exported as Markdown or JSON. It encodes the documented tag limits of AWS (128-character keys), Azure (512) and Google Cloud (63, lowercase labels only), so platform and FinOps teams get a schema that will not be rejected at resource creation.",
  useCases: [
    "A platform team standardising tags before enabling AWS cost allocation tags and Tag Policies across an organisation",
    "A FinOps lead who needs a cost-center and owner schema finance can group invoices by, with allowed values agreed up front",
    "A DevOps engineer converting an informal tagging habit into a JSON schema that Terraform validation blocks can enforce",
  ],
  benefits: [
    ["Provider-legal keys", "Namespaced keys respect AWS, Azure and GCP character limits and GCP's lowercase-only label rules."],
    ["Enforcement included", "Each provider gets a concrete recipe: Tag Policies + SCPs, Azure Policy definitions, or Terraform validation."],
    ["Two export formats", "Copy the policy as a Markdown doc for humans or JSON for pipelines and linters."],
  ],
  faqs: [
    [
      "What tags should be mandatory for cloud cost allocation?",
      "Five tags cover most cost-allocation needs: environment, owner, cost-center, application and project. With those on every billable resource, finance can attribute 100% of spend by cost centre and drill into any line item, which is the baseline FinOps Foundation guidance recommends before adding optional tags like data-classification or managed-by.",
    ],
    [
      "What are the tag limits on AWS, Azure and GCP?",
      "AWS allows 50 tags per resource with keys up to 128 characters and values up to 256; Azure allows 50 tags with keys up to 512 characters; Google Cloud allows 64 labels with keys and values up to 63 characters, restricted to lowercase letters, digits, underscores and hyphens. GCP is the strictest, which is why a portable schema should be validated against its rules first.",
    ],
    [
      "How do I enforce mandatory tags in AWS?",
      "Combine AWS Organizations Tag Policies (which standardise keys and values) with a Service Control Policy that denies resource creation when required tags are missing, using the aws:RequestTag and aws:TagKeys condition keys. Tag Policies alone only report non-compliance — the SCP is what actually blocks untagged resources.",
    ],
    [
      "Why can't I use email addresses in GCP labels?",
      'Google Cloud label values forbid "@" and "." characters, so a raw email address is an invalid label value. The common workaround this tool applies is encoding the owner as local-part plus a separator and the domain with dots replaced (for example jane-doe__acme-com), or storing the full email in an inventory system keyed by the label.',
    ],
  ],
};

export default seo;
