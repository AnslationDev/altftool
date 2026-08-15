const seo = {
  title: "Therapy Notes Tracker — Private In-Browser Journal",
  metaDescription:
    "A two-field log for therapy sessions and homework, saved only in your browser's local storage — searchable, with JSON export and import. No account.",
  steps: [
    "Write the session in the 'Session' box and what you agreed to practise in 'Takeaways and exercises', then click 'Add record' — entries save to this browser's local storage only.",
    "Find past entries with the 'Search records' box, which matches text in both the Session and Takeaways fields across every saved record.",
    "Click 'Export JSON' to download your history as therapy-notes-tracker.json, and use 'Import JSON' to load it back in another browser.",
  ],
  intro:
    "Therapy Notes Tracker is a private, two-field log for your own therapy sessions: one box for the session and one for the takeaways and exercises that came out of it. Records are saved to this browser's local storage only, searchable across both fields, and exportable as a JSON file you control. It is for clients keeping track of what they discussed and what they agreed to practise between appointments — not a clinical record system.",
  useCases: [
    "Writing down the two or three things you actually want to raise next session, right after this one ends, while they are still fresh rather than reconstructing them in the waiting room.",
    "Logging a homework exercise your therapist suggested — a breathing sequence, a thought record, a boundary script — so you can search the word later and find the exact instructions instead of half-remembering them.",
    "Looking back over several months of entries before a review appointment to see whether the same trigger keeps recurring, using the search box to pull up every record that mentions it.",
  ],
  benefits: [
    [
      "Nothing leaves the browser unless you export it",
      "Entries are written to this browser's local storage under a single key; there is no account, no sync and no server copy, so the notes are not sitting in someone else's inbox.",
    ],
    [
      "Search across the whole log, not just titles",
      "The filter matches text in both the session field and the takeaways field, so a single word pulls up every entry that mentions it.",
    ],
    [
      "Portable JSON in and out",
      "Export writes a plain readable JSON file and import reads one back, so you can move your history to another browser or keep an encrypted backup yourself.",
    ],
  ],
  faqs: [
    [
      "Where are my therapy notes stored?",
      "In your browser's local storage on this device, under the key altftool-private-records:therapy-notes-tracker. They are never uploaded. That also means clearing site data, using private browsing, or switching devices loses them — export the JSON if you want a backup.",
    ],
    [
      "Is this secure enough for sensitive mental-health notes?",
      "Local storage is not encrypted and is readable by anyone with access to your unlocked user account on this device. Use a device lock and a per-user OS account, and if you export the JSON, store it somewhere encrypted. For anything you would not want a housemate or a lost laptop to expose, keep it on paper or in a dedicated encrypted vault instead.",
    ],
    [
      "Can my therapist use this for clinical records?",
      "No. This is a personal journal for your own use, with no audit trail, access controls, retention policy or encryption at rest, so it does not meet HIPAA, GDPR or professional record-keeping requirements. Clinicians should use their practice's compliant EHR.",
    ],
    [
      "What should I write down after a session?",
      "Most people find it useful to capture three things while they are fresh: what came up, what the therapist suggested you try, and what you want to raise next time. This is a note-keeping tool and not a substitute for professional guidance — if something in your notes worries you, take it to your therapist or, in a crisis, to local emergency services.",
    ],
  ],
};

export default seo;
