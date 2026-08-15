const seo = {
  title: "Terraform Workspaces vs Directories: Strategy Planner",
  metaDescription:
    "Score CLI workspaces, a directory per environment and separate backends against your isolation, divergence and team answers. Each gets 0-10.",
  steps: [
    "Enter Number of environments (opens at 3) and answer the How much do environments differ?, Isolation requirement and Team shape dropdowns.",
    "Tick 'Each environment lives in its own cloud account / subscription' and 'Changes are promoted through a CI pipeline' where they apply — scores rerun on every change, with no submit button.",
    "Read the Recommended strategy and the 0-10 score for CLI workspaces, Directory per environment and Separate backend / account per environment, open 'Why this score, and a layout sketch' for the directory tree, then press Copy result.",
  ],
  intro:
    "This planner scores the three standard ways of separating Terraform environments — CLI workspaces, a directory per environment, and fully separate state backends — against your answers about divergence, isolation, team shape and account layout. The heuristics follow HashiCorp's published guidance that workspaces suit multiple states of the same configuration behind one backend, while strong isolation calls for separate backends. It is for DevOps engineers deciding a repo layout before the codebase grows around the wrong one.",
  useCases: [
    "A team about to add a staging environment deciding whether terraform workspace new is enough or a directory split is safer",
    "An engineer migrating dev and prod into separate AWS accounts who needs to know why CLI workspaces stop being viable",
    "A consultant documenting the trade-offs of workspaces versus Terragrunt-style separate state for a client review",
  ],
  benefits: [
    ["Scored, not vague", "Each strategy gets a 0-10 score with every plus and minus itemised, so you can challenge the reasoning."],
    ["Grounded in HashiCorp guidance", "Encodes the documented rule that workspaces share one backend and one credential set."],
    ["Layout sketches included", "Each strategy ships with a copyable directory tree and the commands that drive it."],
  ],
  faqs: [
    [
      "Should I use Terraform workspaces for dev and prod?",
      "Only when both environments run the same configuration with different variable values and share one backend and credential set. HashiCorp's own documentation notes workspaces are not suited to strong isolation; once prod lives in a separate account or needs separate credentials, use separate directories or separate backends instead.",
    ],
    [
      "What is the difference between Terraform workspaces and directories per environment?",
      "Workspaces keep one root module and switch state files with terraform workspace select, while directories give each environment its own root module and its own state. Workspaces minimise duplication; directories allow environments to diverge and to point at different backends or accounts.",
    ],
    [
      "How do I isolate Terraform state between environments?",
      "Give each environment its own backend — for example a separate S3 bucket and DynamoDB lock table per account — wired via partial backend configuration, Terragrunt remote_state blocks, or one HCP Terraform workspace per environment. This is the strongest isolation because a bad apply or leaked credential in dev cannot reach prod state.",
    ],
    [
      "Is terraform.workspace in conditionals a bad practice?",
      "It is a warning sign. A few lookups keyed on terraform.workspace are fine, but once resources are created conditionally per workspace the configurations have effectively diverged, and most teams are better served splitting into per-environment root modules before the conditional logic compounds.",
    ],
  ],
};

export default seo;
