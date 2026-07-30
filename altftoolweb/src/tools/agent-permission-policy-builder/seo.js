const seo = {
  intro:
    "The Agent Permission Policy Builder turns plain lists into a validated JSON permission policy for an AI agent, covering seven rule groups: allowed tools, denied tools, allowed filesystem path prefixes, allowed domains, allowed message recipients, named numeric ceilings, and which tools require a confirmation flag before they run. It validates as you type — hostnames are parsed properly so a URL with a path or port is rejected, numeric limits must be non-negative numbers, and requiring confirmation without naming an accepted flag is treated as an error rather than a silent gap. It is for developers and platform owners writing the guardrail file itself; the document is generated in your browser and enforces nothing on its own.",
  useCases: [
    "You are giving an agent filesystem access for the first time and want the allowed path prefixes written down as an absolute-path allowlist before you hand over the keys",
    "Your agent can send email, and you want a recipient allowlist plus a confirmation requirement on the send tool encoded in one reviewable file",
    "You need a spending ceiling and a per-run row limit expressed as named numeric fields your runtime can check, rather than a comment in a README",
  ],
  benefits: [
    ["Validates the rules, not just the syntax", "Domain entries are parsed as hostnames and rejected if they carry a path, port or whitespace, so an entry like example.com/api never silently becomes a rule that matches nothing."],
    ["Catches the contradictions you would ship", "Overlapping allow and deny entries raise a warning that says deny wins, relative path prefixes are flagged as ambiguous, and a policy with no enforceable rule at all is called out."],
    ["Confirmation must be answerable", "If any tool is marked as needing confirmation, the builder refuses to produce a policy until you list the flag values that count as confirmation."],
  ],
  faqs: [
    [
      "What goes into the generated policy file?",
      "A single JSON object with allowedTools, deniedTools, allowedPathPrefixes, allowedDomains, allowedRecipients, numericLimits and a confirmation block holding requiredForTools and acceptedFlags. Each list accepts up to 200 entries of up to 500 characters, split on newlines or commas and deduplicated case-insensitively.",
    ],
    [
      "What happens if a tool appears in both the allow and deny lists?",
      "Deny wins, and the builder raises a warning naming how many patterns collide. Deny-by-default is the safer resolution, but a rule sitting in both lists usually means two people edited the policy with different intentions, so it is worth resolving rather than leaving.",
    ],
    [
      "How should I write domain and numeric-limit rules?",
      "Domains are hostnames only — example.com, or *.example.com to include subdomains — with no scheme, path or port. Numeric limits are one per line in the form 'field = maximum' or 'field: maximum', such as max_transfer_amount = 5000, and the value must be a finite non-negative number; if the same field appears twice, the last value is used and you are told.",
    ],
    [
      "Does this policy actually stop my agent doing something?",
      "No. It is a configuration document, and it constrains only the checks that your linter, runtime or agent framework actually reads and enforces. Generating a policy is the first step; wiring it into the execution path, and testing that a denied call is genuinely refused, is the step that provides the protection.",
    ],
  ],
};

export default seo;
