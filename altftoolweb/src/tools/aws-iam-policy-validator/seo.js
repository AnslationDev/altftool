const seo = {
  title: "AWS IAM Policy Validator: Wildcards & PassRole",
  metaDescription:
    "Paste a policy JSON and get per-statement high, medium and review findings for wildcard Action, NotAction, wildcard Principal and iam:PassRole.",
  steps: [
    "Paste an identity or resource policy into the IAM policy JSON box — the local limit is 200,000 characters — or press Choose file to pick a .json, or Load policy sample for a scoped S3 example.",
    "Press Run local inspection; the policy is parsed in the tab and each statement is graded high, medium or review, with no call out to AWS.",
    "Read the Statements, High, Medium and Review counts and the per-statement entries under Review findings, then press Download report to save aws-iam-policy-counts-only.json, or Copy report.",
  ],
  intro:
    "The AWS IAM Policy Validator parses a pasted identity or resource policy JSON in your browser and returns per-statement findings graded high, medium or review — covering structural mistakes, broad Allow patterns such as Action \"*\" or a service-wide wildcard, wildcard Principal, the inverted NotAction, NotPrincipal and NotResource selectors, iam:PassRole, and ten privilege-management action patterns. It is for engineers reviewing a policy in a pull request or a console tab who want the risky lines pointed at before it ships. Nothing is sent to AWS: it is a lexical review of the one document you paste, so it flags cues to check rather than deciding what access is actually authorised.",
  useCases: [
    "Reviewing a teammate's Terraform-generated policy in a PR and wanting to know quickly whether any Allow statement widened to Action \"*\" or Resource \"*\" without a Condition block.",
    "Checking a cross-account S3 bucket policy before you apply it, because `\"Principal\": \"*\"` in a resource policy is the one line you cannot afford to get wrong.",
    "Auditing a deployment role that includes iam:PassRole, to confirm the pass is constrained by a condition rather than left open across every role in the account.",
  ],
  benefits: [
    [
      "Catches the inverted selectors people miss",
      "An Allow built on NotAction, NotPrincipal or NotResource looks short but grants everything except a small list; each is raised as a high finding rather than passing as a tidy statement.",
    ],
    [
      "Severity depends on combination, not just keywords",
      "Resource \"*\" alone is a medium cue, but the same statement is escalated to high when it also carries iam:PassRole or a privilege-management action — the pairing is what makes it dangerous.",
    ],
    [
      "Structure and risk in one pass",
      "Grammar problems such as an unsupported Effect, Action and NotAction both present, or an empty Condition are reported alongside the risk cues, so a policy that would fail to apply is caught at the same time.",
    ],
  ],
  faqs: [
    [
      "What counts as a high-priority finding?",
      "Eight patterns, all on Allow statements: Action \"*\", a service-wide wildcard like `s3:*`, NotAction, Principal \"*\", NotPrincipal, NotResource, iam:PassRole, and any privilege-management action. Resource \"*\" joins them when the statement also has PassRole or a privilege-management cue; on its own it is medium.",
    ],
    [
      "Which actions count as privilege management?",
      "Ten patterns: iam:Attach*Policy and iam:Detach*Policy, iam:Put*Policy and iam:Delete*Policy, iam:CreatePolicyVersion, iam:SetDefaultPolicyVersion, iam:UpdateAssumeRolePolicy, iam:CreateAccessKey, iam:UpdateLoginProfile, iam:AddUserToGroup, iam:CreateUser/Role/Group, and sts:AssumeRole. Each can be a step in granting further permissions to oneself or another identity.",
    ],
    [
      "How large a policy can I check?",
      "Up to 200,000 characters and 500 statements, with a maximum of 600 findings reported (higher-severity findings displace lower ones when that cap is hit). AWS's own managed-policy character limit is far smaller, so real policies rarely approach it.",
    ],
    [
      "Does a clear result mean the policy is safe or least-privilege?",
      "No. This is a lexical review of one document — it does not call AWS, resolve accounts or ARNs, or consider SCPs, permission boundaries, session policies, other attached policies, or explicit denies elsewhere. Effective authorisation depends on all of those, so use IAM Access Analyzer and a human reviewer for the real decision.",
    ],
  ],
};

export default seo;
