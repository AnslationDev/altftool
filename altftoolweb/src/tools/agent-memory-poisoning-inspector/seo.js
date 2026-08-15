const seo = {
  title: "Agent Memory Poisoning Inspector: Diff Two",
  metaDescription:
    "Compare an earlier and newer AI memory export and flag added or modified entries carrying instruction overrides, hidden Unicode or permission expansion.",
  steps: [
    "Paste or Open file the Earlier snapshot and the Newer snapshot — JSON, or one memory entry per line — up to 1 MB each.",
    "Press Inspect changes to diff them and run six rules across every added or modified path: overrides, zero-width Unicode, identity, permissions, secrecy, links.",
    "Read the Added, Modified, Removed and high, medium and low cue counts, then Counts-only report saves agent-memory-audit.json without any memory value.",
  ],
  intro:
    "The Agent Memory Poisoning Inspector diffs two exports of an AI assistant's stored memory — a before and an after — and runs six detection rules over everything that was added or modified, flagging instruction-override language, invisible or direction-changing Unicode, identity and role rewrites, permission expansion, secrecy or forced-persistence phrasing, and instructions that point at an external URL. It exists because persistent memory is a durable injection surface: a single line written during one conversation keeps steering every later one. Both snapshots are parsed and compared in the browser, and the exportable report deliberately contains counts and rule IDs only — never your memory values or their paths.",
  useCases: [
    "You pasted a long document or browsed an untrusted page in a chat session, and want to check what that session quietly wrote into long-term memory afterwards",
    "You are reviewing a shared or team assistant and need to see whether anyone's session added a line granting it broader tool access than it had last week",
    "You suspect a copy-pasted block carried hidden characters, and want a rule that actually catches zero-width and right-to-left override codepoints rather than eyeballing the text",
  ],
  benefits: [
    ["Diff first, then inspect", "Only the entries that actually changed between the two snapshots are scanned, so a large memory store does not drown the findings that matter."],
    ["Catches what the eye cannot see", "The hidden-control rule matches zero-width, bidirectional-override and word-joiner codepoints in the U+200B–U+200F, U+202A–U+202E, U+2066–U+2069 and U+FEFF ranges, which render as nothing at all in a normal text view."],
    ["Reports without disclosing", "The exportable report lists change counts, severities and which rules fired — not the memory contents — so you can escalate a finding without circulating the sensitive text."],
  ],
  faqs: [
    [
      "What does it actually look for?",
      "Six rules across three severities. Two are high: instruction-override phrasing such as ignore, disregard, override or bypass placed near words like previous, system, policy or safety; and invisible or directional Unicode control characters. Three are medium: identity or role changes, permission and authority expansion, and secrecy or 'never forget' persistence cues. One is low: instructions that reference an external http or https URL.",
    ],
    [
      "What memory formats can I paste in?",
      "Either JSON, which is flattened to dotted paths so nested objects and arrays are compared field by field, or plain text, where each non-empty line is treated as one entry. Each snapshot is capped at 1,000,000 characters and 10,000 entries, and the tool tells you when it truncated rather than silently dropping data.",
    ],
    [
      "Does a flagged finding mean my assistant was actually poisoned?",
      "No. These are pattern matches on text, and legitimate memory entries trigger them constantly — a note that says 'call me Sam' fires the identity rule, and a saved bookmark fires the external-instruction rule. The value is in narrowing thousands of lines down to the handful worth reading yourself; the judgement stays with you.",
    ],
    [
      "Why does it only scan additions and modifications, not deletions?",
      "Because a removed entry has no new text that could carry an injection — there is nothing left to match against. Removals are still counted and shown in the diff, since a deletion can matter for other reasons, such as a safety instruction quietly disappearing from the store.",
    ],
  ],
};

export default seo;
