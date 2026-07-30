const seo = {
  intro:
    "This tool reads a pasted DigiLocker-style consent or requester payload and sorts it into eight scope items — requester, document types, requested fields, purpose, access duration, access frequency, retention, and revocation — marking each one explicitly stated, needs clarification, or not stated. It is for anyone deciding whether to approve a document-sharing request and wanting to see, item by item, what the wording actually commits to. Nothing connects to a DigiLocker account: the page parses the JSON or labeled text you supply, locally, and treats vague phrasing like \"as required\", \"indefinitely\" or \"ongoing\" as ambiguous rather than as an answer.",
  useCases: [
    "A college admissions portal asks for your degree certificate and marksheet — you paste its consent JSON to check whether retention period and revocation method are actually named or just implied",
    "You are reviewing a partner integration before sign-off and need to list which of the eight scope items the request leaves unstated so you can send one clarification email",
    "A request says \"purpose: service\" and \"duration: as needed\" — you want a written record that both were flagged as too broad before you decline",
  ],
  benefits: [
    ["Eight named scope items, not a verdict", "Each of requester, documents, fields, purpose, duration, frequency, retention and revocation gets its own explicit / ambiguous / missing status."],
    ["Vague wording is caught, not accepted", "Phrases such as \"as required\", \"legitimate purposes\", \"indefinitely\" and \"until no longer needed\" are marked as needing clarification instead of counting as stated."],
    ["Counts-only export", "The downloadable report carries the four summary counts and notice count — no requester names, document names, URLs or identifiers travel with it."],
  ],
  faqs: [
    [
      "What does this tool check in a DigiLocker consent request?",
      "Eight scope items: requester, document types, requested fields, purpose, access duration, access frequency, retention, and revocation or withdrawal. Each is labelled explicitly stated, needs clarification, or not stated, and the summary counts how many fall in each bucket out of the eight.",
    ],
    [
      "Does it connect to my DigiLocker account or verify the request?",
      "No. It never signs in, fetches documents, or contacts DigiLocker, and it cannot confirm that a requester is genuine, authorised, or lawful. It only describes the wording of the text you paste, so treat the output as informational and check the official DigiLocker requester terms — or ask a lawyer — before acting on a request that matters.",
    ],
    [
      "Why does a consent field marked \"true\" not count as approval?",
      "Because a consent, approval, authorization, or permission flag only says a field exists — it does not describe what was agreed to. When one is found, the tool adds a notice saying it is not being treated as valid consent or proof of approval, and the eight scope items are still judged on their own labelled wording.",
    ],
    [
      "Can I paste raw text instead of JSON?",
      "Yes. Anything starting with { or [ is parsed as JSON; otherwise the page scans line by line for labelled pairs such as \"Purpose: admission verification\" or \"Retention period: 30 days\". Input is capped at 120,000 characters, JSON is walked to a depth of 10 across at most 5,000 fields, and unlabelled prose or a bare OAuth scope token is never expanded into document or field permissions.",
    ],
  ],
};

export default seo;
