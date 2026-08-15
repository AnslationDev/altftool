const seo = {
  title: "Consent Inventory Mapper: Collection",
  metaDescription:
    "Paste pipe-separated lines to build a five-column consent record - collection point, purpose, action, withdrawal route, owner - with gaps counted.",
  steps: [
    "Type one record per line into Records (one per line), using | between collection point, purpose, consent action, withdrawal route and owner.",
    "Leave Require complete rows ticked so every line missing one of the five fields is flagged as needs-review.",
    "Read the Structured inventory table, which lists the first 100 records with complete and needs-review counts, then Copy or Download it.",
  ],
  intro:
    "The Consent Inventory Mapper turns pipe-separated lines into a five-column table — collection point, purpose, consent action, withdrawal route and owner — and counts how many rows are missing a field so gaps are visible before an audit finds them. It is built for the person inside a small business who has to write down where consent is actually captured: the signup checkbox, the newsletter opt-in, the cookie banner, and who owns each one. It organises what you type and is general information, not legal advice on whether any of it is lawful.",
  useCases: [
    "You are preparing for a privacy review and need one sheet listing every place your product asks for consent and the exact route a user takes to withdraw it.",
    "Marketing added a newsletter opt-in inside the signup flow and you want to record whether it is a separate action or bundled into account creation before anyone sends to that list.",
    "Ownership is unclear after a reorg, so you map each consent point to a named team to find the ones nobody has looked at in a year.",
  ],
  benefits: [
    [
      "Withdrawal route is a required column",
      "The way out is captured next to the way in, which is the half of a consent record that most inventories leave blank until someone asks for it.",
    ],
    [
      "Gaps counted, not just displayed",
      "Rows missing any of the five fields are tallied as needs-review, so a fifty-line inventory tells you immediately how much of it is unfinished.",
    ],
    [
      "One line per record",
      "The whole inventory is plain text separated by the pipe character, so it lives in a ticket, a doc or a repo without needing a compliance platform.",
    ],
  ],
  faqs: [
    [
      "what should a consent record contain",
      "This tool tracks five fields per record: where consent is collected, the purpose it covers, the action the person took, how they can withdraw it, and who owns it internally. Regimes that require demonstrable consent generally expect you to also retain who consented and when, which belongs in your system of record rather than a mapping sheet.",
    ],
    [
      "how do I format the records",
      "One record per line with the pipe character between fields, in the order collection point, purpose, consent action, withdrawal route, owner — for example: Newsletter | Marketing email | Separate opt-in | Email footer | Marketing. Missing trailing fields render as a dash and count toward the incomplete total.",
    ],
    [
      "does consent have to be as easy to withdraw as to give",
      "Under the GDPR, yes — Article 7(3) says the data subject has the right to withdraw consent at any time and that it must be as easy to withdraw as to give. That is why the withdrawal route is its own column here. Requirements differ across jurisdictions, so confirm your obligations with a qualified privacy adviser.",
    ],
    [
      "how many records can I map at once",
      "Every line you paste is parsed and counted, and the displayed table shows the first 100 records. For inventories longer than that, split the list by product area or business unit and map each one separately.",
    ],
  ],
};

export default seo;
