const seo = {
  intro:
    "This planner builds a deadline-ordered rotation calendar for API keys, service tokens, database passwords, TLS certificates and signing keys from each secret's last-rotation date and interval. Recommended intervals follow published guidance — 90 days for cloud access keys under the CIS AWS Foundations Benchmark, a 200-day maximum lifetime for public TLS certificates issued from 15 March 2026 under CA/Browser Forum ballot SC-081, and NIST SP 800-57 cryptoperiods for keys. It is for platform, security and DevOps teams who track rotation in a spreadsheet today; everything runs in the browser and only secret names are entered, never values.",
  useCases: [
    "A platform team listing every production credential with an owner and getting a single calendar of who must rotate what, by when",
    "A security engineer preparing for an audit who needs to show which secrets are overdue against a 90-day access-key policy",
    "An SRE planning certificate renewals ahead of the CA/Browser Forum's shortened TLS lifetimes so nothing expires unnoticed",
  ],
  benefits: [
    ["Guidance-based defaults", "Each secret type carries a recommended interval from CIS, CA/Browser Forum or NIST SP 800-57 that you can override per secret."],
    ["Overdue and due-soon flags", "Every secret is classified against a configurable warning window, sorted by soonest deadline with owner attached."],
    ["Local and value-free", "You enter secret names and dates only — no secret values, and nothing leaves the browser."],
  ],
  faqs: [
    [
      "How often should API keys be rotated?",
      "Common published guidance is every 90 days or less: the CIS AWS Foundations Benchmark and AWS IAM best practices both use a 90-day maximum for access keys. Shorter is better for high-privilege keys, and immediate rotation is required whenever a key may have been exposed.",
    ],
    [
      "How often do TLS certificates need to be renewed now?",
      "Public TLS certificates issued on or after 15 March 2026 have a maximum validity of 200 days under CA/Browser Forum ballot SC-081, dropping to 100 days in March 2027 and 47 days in March 2029. In practice teams automate renewal well before expiry — Let's Encrypt, for example, recommends renewing with a third of the lifetime remaining.",
    ],
    [
      "Should passwords be rotated on a schedule too?",
      "For human passwords, NIST SP 800-63B advises against forced periodic changes unless there is evidence of compromise. Machine credentials are different: database passwords, service-account tokens and API keys are shared, long-lived and often leaked in logs or config, so scheduled rotation (30-90 days is typical) plus event-driven rotation after any suspected exposure remains standard practice.",
    ],
    [
      "Is it safe to type my secrets into this tool?",
      "You should never enter secret values anywhere, including here — this planner only needs a name like 'Payments API key', its type, owner and last-rotation date. All computation happens locally in your browser; nothing is uploaded or stored on a server.",
    ],
  ],
};

export default seo;
