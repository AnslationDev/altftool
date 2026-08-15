const seo = {
  title: "Chain of Custody Log with SHA-256 Event Hash Chain",
  metaDescription:
    "Register items with SHA-256 or SHA-512 digests, log custody events with offset timestamps, and export canonical JSON plus an optional hash chain.",
  steps: [
    "Register each evidence item with its ID, recorded digest algorithm — SHA-256 at 64 hex characters or SHA-512 at 128 — and the hexadecimal digest.",
    "Add custody events with a timestamp carrying Z or a numeric UTC offset such as 2026-07-24T14:30:00+05:30, plus the actor and, for transfer or return, the recipient.",
    "Press Validate & prepare, then download the private full export or the counts-only JSON that omits IDs, digests, timestamps, people and notes.",
  ],
  intro:
    "This organizer builds a structured chain-of-custody record: you register evidence items with their identifiers and recorded digests, then log custody events — acquisition, copy, transfer, access, return and seal — each with an offset-bearing timestamp, actor, recipient, location and note, and it validates that every event references a real item, that acquisition comes first and only once per item, and that timestamps never run backwards. An optional SHA-256 chain links the events together, each hash computed as SHA-256 of the previous event hash, a newline, and the canonical JSON of the event. It is for investigators, IT and security staff and anyone documenting how a file or device was handled, who needs the record to be consistent and machine-checkable rather than a free-text log.",
  useCases: [
    "Documenting a forensic disk image from acquisition through each copy and analyst handover, with the SHA-256 digest recorded against the item at every step",
    "Recording who accessed a device held in an office safe during an internal investigation, in a form that shows no gaps or out-of-order entries",
    "Producing a counts-only summary — how many items, how many transfers, how many events carry a note — that can be shared without exposing case references, identifiers or names",
  ],
  benefits: [
    ["The record is validated, not just stored", "Every event must reference a registered item, acquisition must be the first event for that item and appear once, and an event dated before the preceding one is reported as an error."],
    ["Canonical JSON, so exports are comparable", "Object keys are sorted, evidence items ordered by ID and text encoded as UTF-8, so two exports of the same record produce byte-identical output."],
    ["A summary you can share safely", "The counts-only report includes totals by event type and validation counts while deliberately excluding case reference, identifiers, digests, timestamps, actors, locations and notes."],
  ],
  faqs: [
    [
      "What timestamp format does it require?",
      "YYYY-MM-DDTHH:mm:ss followed by Z or a numeric UTC offset such as +05:30 — for example 2026-03-08T14:22:05+05:30. The offset is mandatory because a custody record without one cannot be ordered reliably across time zones; a separate timezone label is recorded alongside it.",
    ],
    [
      "How is the hash chain computed?",
      "Each event hash is SHA-256 over the previous event's hash, a line feed, and the canonical JSON of that event, starting from the literal string GENESIS. The chain covers event payloads only — the evidence-item registry and top-level metadata are outside it — and the final event hash is exported so a later copy can be compared against it.",
    ],
    [
      "Does a matching hash chain prove the evidence is authentic?",
      "No. The chain detects changes relative to this exported sequence and nothing more; anyone able to edit the record can simply recompute it. It is not a digital signature, a notarization or a trusted timestamp, and it says nothing about who actually handled an item or whether an event really happened.",
    ],
    [
      "Which digest algorithms and limits does it accept?",
      "Recorded digests may be SHA-256, which is 64 hexadecimal characters, or SHA-512, which is 128, and the value is checked for the right length. A single record holds up to 100 evidence items and 1,000 events, with notes up to 2,000 characters. This is a documentation aid, not legal advice — admissibility is a matter for your jurisdiction and your lawyers.",
    ],
  ],
};

export default seo;
