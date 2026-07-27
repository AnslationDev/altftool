/**
 * AI Policy One Pager Generator — assembles a single-page acceptable-use guide for
 * staff AI use from a clause library.
 *
 * The clause set mirrors the sections that published corporate AI acceptable-use
 * policies and guidance frameworks (e.g. NIST AI RMF's govern function, ISO/IEC
 * 42001 Annex controls, national privacy regulators' staff-AI guidance) repeatedly
 * cover: approved tools, confidential and personal data handling, human review,
 * disclosure, IP, and incident reporting.
 */

/**
 * Clause library. `core: true` clauses appear in every policy; the rest are
 * toggleable. `type` places the clause under DO or DON'T.
 */
export const CLAUSES = [
  {
    id: "approved-tools",
    type: "do",
    core: true,
    label: "Use approved tools only",
    text: "Use only the AI tools on the approved list below, signed in with your work account.",
  },
  {
    id: "review",
    type: "do",
    core: true,
    label: "Human review duty",
    text: "Review and verify every AI output before it is sent to a customer, published, or used in a decision. You own what you ship, not the tool.",
  },
  {
    id: "incident",
    type: "do",
    core: true,
    label: "Report incidents",
    text: "Report suspected data leaks, harmful outputs or policy breaches to the contact below immediately — early reports are never punished.",
  },
  {
    id: "cite-check",
    type: "do",
    core: false,
    label: "Verify facts and citations",
    text: "Independently check facts, figures, quotes and citations in AI output — models fabricate plausible-looking sources.",
  },
  {
    id: "disclosure",
    type: "do",
    core: false,
    label: "Disclose AI-assisted work",
    text: "Say when a deliverable is substantially AI-generated where the recipient would reasonably want to know (clients, hiring, published content).",
  },
  {
    id: "prompt-hygiene",
    type: "do",
    core: false,
    label: "Prefer anonymised inputs",
    text: "Strip names, identifiers and account details from prompts when the task works without them.",
  },
  {
    id: "no-confidential",
    type: "dont",
    core: true,
    label: "No confidential data",
    text: "Don't paste confidential business information (financials, contracts, source code, unreleased plans) into tools that are not on the approved list.",
  },
  {
    id: "no-personal-data",
    type: "dont",
    core: true,
    label: "No personal data",
    text: "Don't enter customer or employee personal data into AI tools unless the tool is approved for it and a lawful basis exists under applicable privacy law.",
  },
  {
    id: "no-sole-decisions",
    type: "dont",
    core: false,
    label: "No unreviewed decisions about people",
    text: "Don't let AI alone decide anything that affects a person — hiring, discipline, credit, medical or legal outcomes all require human judgement.",
  },
  {
    id: "no-impersonation",
    type: "dont",
    core: false,
    label: "No impersonation or deepfakes",
    text: "Don't generate content that impersonates a real person or fabricates events, images or voices of colleagues, customers or public figures.",
  },
  {
    id: "no-ip-infringe",
    type: "dont",
    core: false,
    label: "Respect IP and licences",
    text: "Don't use AI output that reproduces third-party copyrighted material, and don't feed the company's licensed content into tools whose terms allow training on it.",
  },
  {
    id: "no-bypass",
    type: "dont",
    core: false,
    label: "No security bypasses",
    text: "Don't use personal accounts, VPN workarounds or unapproved plugins to reach blocked AI tools.",
  },
];

export const CORE_CLAUSE_IDS = CLAUSES.filter((c) => c.core).map((c) => c.id);

function clean(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

/**
 * Builds the one-pager as markdown-flavoured plain text.
 * `clauseIds` — optional clause ids to include on top of the core set.
 * Returns { text, doCount, dontCount, wordCount, approvedToolsList } or { error }.
 */
export function buildPolicyOnePager({
  companyName,
  approvedTools = "",
  contact = "",
  effectiveDate = "",
  clauseIds = [],
}) {
  const name = clean(companyName);
  if (!name) return { error: "Enter the company or team name for the policy header." };

  const tools = String(approvedTools ?? "")
    .split(/[\n,]+/)
    .map((t) => t.trim())
    .filter(Boolean);
  if (tools.length === 0) {
    return { error: "List at least one approved AI tool — a policy with no approved tools bans everything." };
  }

  const included = CLAUSES.filter((c) => c.core || clauseIds.includes(c.id));
  const dos = included.filter((c) => c.type === "do");
  const donts = included.filter((c) => c.type === "dont");

  const contactClean = clean(contact);
  const dateClean = clean(effectiveDate);

  const lines = [];
  lines.push(`# ${name} — Staff AI Use: The One-Pager`);
  if (dateClean) lines.push(`Effective: ${dateClean}`);
  lines.push("");
  lines.push(
    "AI tools are encouraged for drafting, summarising, coding and analysis — inside the rules below. When unsure, ask before you paste.",
  );
  lines.push("");
  lines.push("## DO");
  dos.forEach((c) => lines.push(`- ${c.text}`));
  lines.push("");
  lines.push("## DON'T");
  donts.forEach((c) => lines.push(`- ${c.text}`));
  lines.push("");
  lines.push("## Approved tools");
  tools.forEach((t) => lines.push(`- ${t}`));
  lines.push("");
  if (contactClean) {
    lines.push(`## Questions or incidents`);
    lines.push(`Contact: ${contactClean}`);
    lines.push("");
  }
  lines.push(
    "_This one-pager summarises the rules; it does not replace the full policy or legal advice. Breaches are handled under the normal conduct process._",
  );

  const text = lines.join("\n");
  return {
    text,
    doCount: dos.length,
    dontCount: donts.length,
    approvedToolsList: tools,
    wordCount: text.split(/\s+/).filter(Boolean).length,
  };
}
