const seo = {
  title: "SMS Sender ID Explained: DLT Header Prefix",
  metaDescription:
    "Splits an Indian SMS header into provider and service-area prefix, six-character header code and -P, -S, -T or -G suffix. Format only, never proof.",
  steps: [
    "Paste sender IDs into \"Enter sender IDs or headers\", one entry per line and up to 100 entries — the box shows the shape it expects, such as VD-KOTAKB-S — or press \"Load sample\" for synthetic examples.",
    "Press \"Explain formats\" and each entry is split into its two-letter provider and service-area prefix, six-character header code and -P, -S, -T or -G category suffix, with any segment it cannot match flagged rather than the whole string rejected.",
    "\"Structural explanations\" cards appear beside the \"Current suffix guide\", and \"Download format counts\" saves altftool-sms-header-format-counts.json — a counts-only report that excludes the sender IDs, header codes and phone numbers you entered.",
  ],
  intro:
    "The DLT SMS Sender ID Explainer breaks an Indian commercial SMS header such as VZ-HDFCBK-T into its three documented parts — a two-letter provider and service-area prefix, a six-character Principal Entity header code, and a -P, -S, -T or -G category suffix — and explains what each segment means using TRAI's published 2020 prefix reference. It also recognises the 127xxx consent short-code family and plain ten-digit numbers, and it can explain up to 100 header lines at once. It describes format only: it performs no live DLT or Header Information Portal lookup and never claims a sender is genuine.",
  useCases: [
    "A text arrives from AX-SBIINB-T and you want to know what the AX prefix and the -T suffix are supposed to mean before deciding whether the message fits a transactional pattern.",
    "A compliance reviewer pastes a column of sender IDs from a campaign log to see how many are correctly shaped headers, how many are bare six-character codes with no prefix, and how many are ordinary ten-digit numbers.",
    "A message claiming to be a bank comes from a 10-digit mobile number, and you want confirmation that this is not the documented alphanumeric header structure commercial senders are meant to use.",
  ],
  benefits: [
    [
      "Segment-by-segment breakdown",
      "Splits provider code, service-area code, header code and category suffix separately, and flags exactly which one it could not match rather than rejecting the whole string.",
    ],
    [
      "Honest about what a format proves",
      "Every result carries a notice that recognisable structure is a format cue only, not evidence of registration, consent, sender identity or link safety.",
    ],
    [
      "Counts-only export",
      "The JSON report contains format and category tallies with the entered sender IDs, header codes and phone numbers deliberately excluded.",
    ],
  ],
  faqs: [
    [
      "What does the -P, -S, -T or -G at the end of an SMS sender ID mean?",
      "They are the documented category cues: -P is promotional, -S is a non-promotional service message, -T is transactional and -G is government. A suffix outside these four is reported as an unknown category rather than being read as one of them.",
    ],
    [
      "What do the two letters before the sender ID stand for?",
      "The first letter is the originating access provider and the second is the telecom service area — for example J is Reliance Jio and Z is Maharashtra, giving a JZ prefix. These mappings come from TRAI's 2020 prefix reference, so later reassignments may not be reflected.",
    ],
    [
      "Does a correctly formatted header mean the SMS is genuine?",
      "No. A well-formed header only shows the text matches a documented shape. Headers can be misused or visually imitated, and this tool makes no live DLT registration, routing, consent or content-template check — verify anything financial directly with the organisation through a number you already trust.",
    ],
    [
      "What is a 127xxx SMS number?",
      "It matches the six-digit short-code family prescribed for consent-seeking messages, so a 127 prefix followed by three digits is flagged as that format. Matching the pattern does not prove the consent request itself, or the sender behind it, is authentic.",
    ],
  ],
};

export default seo;
