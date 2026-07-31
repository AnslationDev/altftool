const seo = {
  intro:
    "The Agent Audit Log Integrity Verifier checks a JSON or JSONL audit log for internal continuity — duplicate or missing entry IDs, gaps and reordering in the sequence numbers, timestamps that run backwards, and broken previous-hash links where one entry's previousHash should equal the prior entry's hash — and can optionally recompute a SHA-256 hash chain using a recipe you select explicitly. It is for anyone who has to answer 'has this agent's log been altered or truncated?' with something better than a visual scan: platform engineers, auditors and incident responders. Parsing, canonicalisation and hashing all run locally through the browser's Web Crypto API, and the exportable report contains counts and states only, never log contents.",
  useCases: [
    "An agent run ended badly and you need to know whether entries were dropped in the middle, so you check the sequence numbers for gaps before reading the log at all",
    "Your platform writes a hash chain into every audit entry and you want to confirm the stored digests still match what the entries currently contain",
    "You are handing a log to an auditor and want a counts-only summary of which continuity checks passed, without disclosing what the entries actually say",
  ],
  benefits: [
    ["Four independent continuity checks, reported separately", "IDs, sequence, timestamps and previous-hash links each get their own verified, mismatch or not-checkable state, so you can tell a missing field apart from a real break."],
    ["Hash recipes are chosen, never guessed", "You pick either canonical-entry or previous-hash-plus-entry, and the tool canonicalises with sorted keys and omits the hash field itself — so a match means a match against a stated rule rather than a lucky heuristic."],
    ["Honest about what it cannot prove", "Entries that lack a well-formed digest are marked not-checkable rather than quietly passing, and the report never reads a null result as a clean bill of health."],
  ],
  faqs: [
    [
      "What log formats does it accept?",
      "A JSON array of objects, a JSON object containing an entries, events, logs, records, auditLog or audit_log array, or newline-delimited JSONL. Up to 25,000 entries are checked in one pass, and field paths for ID, sequence, timestamp, hash and previousHash are auto-discovered from the first 50 entries down to three levels of nesting — you can override any of them.",
    ],
    [
      "How does the SHA-256 chain verification work?",
      "It recomputes each entry's digest and compares it to the stored one. The canonical-entry recipe hashes the entry with its own hash field removed and all object keys sorted; the previous-plus-entry recipe hashes the previous hash, a newline, then the canonical entry with both the hash and previousHash fields removed. A stored value must be exactly 64 hexadecimal characters (case-insensitive) to be checkable at all, since that is the length of a SHA-256 digest.",
    ],
    [
      "Does a verified chain prove the log was not tampered with?",
      "No, and this is the important limit. A hash chain only proves internal consistency: anyone who could edit an entry could also recompute every hash after it and produce a perfectly verified log. Tamper-evidence requires something outside the file — a digital signature, a write-once store, or a digest anchored with a third party — so treat a pass as 'no accidental corruption or truncation found', not as proof of authenticity.",
    ],
    [
      "What does 'not-checkable' mean next to a check?",
      "That the data needed for that check was absent, not that the check passed. A missing sequence field, an unconfigured hash path, a digest that is not 64 hex characters, or a single-entry log with no genesis hash all produce not-checkable — which is a prompt to configure the field or fix the writer, not a clean result.",
    ],
  ],
};

export default seo;
