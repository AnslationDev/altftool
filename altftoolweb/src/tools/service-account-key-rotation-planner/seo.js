const seo = {
  title: "Service Account Key Rotation Planner (CIS 90-Day)",
  metaDescription:
    "Turn a key's last rotation date into a dated zero-downtime cutover plan — notify, create, disable, delete — checked against the CIS 90-day ceiling.",
  steps: [
    "Set \"Current key created / last rotated on\" and \"Rotation period (days)\" — cadences over 90 days are flagged against CIS AWS Benchmark 1.14.",
    "Fill in the \"Overlap window (days both keys valid)\", \"Notice to owners before due date (days)\" and \"Keys managed on this cadence\" fields.",
    "Read the \"Next rotation due\" date and the dated Cutover schedule — notify, create, deploy, disable, delete — then click \"Copy plan\".",
  ],
  intro:
    "This planner turns a key's last rotation date and your chosen cadence into a dated, zero-downtime cutover schedule: notify owners, create the new key, deploy and verify during an overlap window, disable the old key on the due date, and delete it after a quarantine period. It applies the CIS AWS Foundations Benchmark ceiling of rotating access keys every 90 days or less, and works equally for AWS IAM access keys, GCP service account keys and Azure client secrets.",
  useCases: [
    "A platform engineer scheduling the next rotation for a fleet of 12 service account keys and estimating yearly rotation workload",
    "A security lead checking which keys are already past the CIS 90-day ceiling and how overdue they are",
    "A DevOps team writing a runbook that needs concrete dates for create, deploy, disable and delete steps with a 7-day overlap",
  ],
  benefits: [
    ["Zero-downtime cutover", "Uses the two-active-keys overlap pattern so services never authenticate with a dead credential."],
    ["Compliance-aware", "Flags any cadence longer than the CIS benchmark's 90-day maximum for access key rotation."],
    ["Disable before delete", "Schedules a quarantine window so a missed dependency can be re-enabled instead of lost."],
  ],
  faqs: [
    [
      "How often should service account keys be rotated?",
      "The CIS AWS Foundations Benchmark (control 1.14) requires access keys to be rotated every 90 days or less, and auditors commonly apply the same 90-day ceiling to GCP service account keys and Azure client secrets. Shorter periods (30-60 days) reduce exposure further but multiply operational work, which is why automation or keyless identity is preferred at scale.",
    ],
    [
      "How do I rotate a service account key without downtime?",
      "Create the new key while the old one is still active, deploy it through your secret store, verify traffic is authenticating with the new key ID, then disable the old key and delete it only after a quarantine period. This works because providers allow multiple concurrent keys — AWS permits 2 access keys per IAM user and GCP up to 10 keys per service account.",
    ],
    [
      "Why disable a key before deleting it?",
      "Disabling is reversible; deletion is not. If a forgotten cron job or legacy service was still using the old key, a disabled key can be re-enabled in seconds to restore service, whereas a deleted key forces an emergency re-issue. A 7-day disabled quarantine with log monitoring is a common operational default before permanent deletion.",
    ],
    [
      "Can I avoid key rotation entirely?",
      "Often, yes — replace static keys with short-lived credentials: IAM roles for EC2/Lambda, GCP workload identity federation, or Azure managed identities all issue automatically rotating tokens, and CI systems can use OIDC federation instead of stored secrets. Rotation planning should apply only to the residual keys that genuinely cannot be made keyless.",
    ],
  ],
};

export default seo;
