const seo = {
  title: "AI Chat Privacy Scanner: Redact PII In Browser",
  steps: [
    "Paste the log into Chat text or export JSON, or use Open file to load a .json or .txt export of up to 2 MB; anything past 5,000 messages is cut off with a truncation warning.",
    "Pick a Redaction style — Stable labels, Partial masking or Remove values — narrow the list under Choose detector categories, then press Scan locally.",
    "Read Messages, Flagged, Signals and Format above the redacted transcript, then use Copy transcript, Download TXT for redacted-ai-conversation.txt, or Counts-only report for ai-conversation-privacy-report.json.",
  ],
  intro:
    "The AI Conversation Privacy Scanner reads a pasted chat log or an exported ChatGPT/Claude-style JSON file in your browser and flags personal data and credentials across 15 detector categories — names, emails, phone numbers, addresses, dates of birth, Aadhaar, Indian PAN, passport numbers, US SSN, payment cards, bank accounts, IBAN, IP addresses, MAC addresses, and API keys, tokens and passwords. It rebuilds the conversation as a redacted transcript you can copy or download, plus a counts-only JSON report that contains no conversation text. Nothing is uploaded — the parsing and the pattern matching both run in the tab.",
  useCases: [
    "You want to paste a debugging session with an AI assistant into a public bug report, and need to know whether an API key or a customer email slipped into it first",
    "Your team archives support-chat exports, and you need a version with account numbers and phone numbers masked before it goes into the shared drive",
    "You are handing a conversation log to a vendor or auditor and need a counts-only summary — how many signals of each type were found — without disclosing the text itself",
  ],
  benefits: [
    [
      "Understands export formats, not just plain text",
      "Parses ChatGPT-style mapping trees, messages arrays and role-labelled transcripts, ordering messages by timestamp and normalising user/assistant/system roles.",
    ],
    [
      "Three redaction styles",
      "Stable labels keep the same placeholder for the same value, partial masking leaves a recognisable tail, and remove strips the value outright.",
    ],
    [
      "Report separated from content",
      "The downloadable JSON carries only per-category counts, message totals and flagged-message counts — the transcript stays in a separate file you control.",
    ],
  ],
  faqs: [
    [
      "Does the scanner upload my AI conversation anywhere?",
      "No. Both the file you open and the text you paste are parsed and scanned by JavaScript inside the page, and no request carries the conversation off the device. That also means the scan works with the network disconnected.",
    ],
    [
      "How large a conversation can it handle?",
      "Up to a 2 MB file, 2,000,000 characters of source text, and 5,000 messages. Anything past those limits is cut off and the results panel shows a truncation warning, so a very large export should be split before scanning.",
    ],
    [
      "What is the difference between the three redaction modes?",
      "Stable labels replace each value with a consistent placeholder so you can still tell two mentions apart; partial masking keeps a fragment of the original so a human reviewer can recognise which record it was; remove deletes the value with no trace. Pick labels when the transcript still has to make sense, remove when it must not.",
    ],
    [
      "Can I trust it to catch everything sensitive?",
      "No — treat it as a first pass, not a guarantee. Pattern matching misses unusual identifiers, personal details implied by context, and anything inside images or attachments, so read the full redacted transcript yourself before sharing. If a conversation contains live credentials, rotate them rather than relying on redaction.",
    ],
  ],
};

export default seo;
