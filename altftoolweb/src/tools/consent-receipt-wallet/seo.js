const seo = {
  title: "Consent Receipt Wallet: Log Who Has Your Data",
  metaDescription:
    "Keep your own record of every organization you gave data to, with purpose and expiry, stored in your browser's localStorage and exportable as JSON.",
  steps: [
    "Type who received the data in the Organization field and what for in Purpose and expiry, then click Add record.",
    "Filter the Saved records list with the Search records box, which matches text in both fields at once.",
    "Click Export JSON to download consent-receipt-wallet.json as your backup; Import JSON reads it back in another browser, replacing what is saved there.",
  ],
  intro:
    "The Consent Receipt Wallet is a private log of who you gave data to: each record holds the organization and a free-text note on the purpose and expiry, saved in this browser's localStorage and searchable across both fields. It is for people who want their own copy of what they agreed to — the gym that took an ID scan, the app that asked for contacts, the shop that kept a phone number — rather than trusting each company's records. Nothing is uploaded, and the whole list exports to a JSON file you keep.",
  useCases: [
    "You signed up for a trial that keeps card details for 14 days and want a note of the cancellation deadline and who to contact, outside that company's own inbox.",
    "A landlord photographed your passport during a viewing and you record the date, the stated purpose and how long they said they would hold it, in case you need to ask for deletion later.",
    "Before submitting a data subject access request, you want a list of every organization you have handed personal data to in the last year, in one place.",
  ],
  benefits: [
    [
      "The record is yours, not the company's",
      "Entries live in your browser's storage and export to a JSON file you control, so you keep evidence of what you agreed to even if the other side's account is closed.",
    ],
    [
      "Search across every field",
      "The filter matches text in both the organization and the purpose note, so typing a month, a purpose or a company name narrows a long list instantly.",
    ],
    [
      "Portable between devices",
      "Export writes consent-receipt-wallet.json and import reads it back, which is how you move the log to another browser or keep an offline backup.",
    ],
  ],
  faqs: [
    [
      "where is my consent data stored",
      "In your own browser's localStorage, under a single key for this tool, and nowhere else — no account, no server, no sync. Clearing site data or browsing history for this site deletes the whole list, which is why the JSON export exists.",
    ],
    [
      "will it remind me when consent expires",
      "No. Expiry is text you write into the purpose and expiry field, and nothing here sends alerts or counts down. Put the date in the note and set a matching reminder in your calendar if the deadline matters.",
    ],
    [
      "what is a consent receipt",
      "A record of a specific permission you granted: who received the data, what it is used for, and how long it is held. Keeping your own version is useful because you can cite the stated purpose and date when asking an organization to stop processing or delete what it holds.",
    ],
    [
      "can I get my data back if I switch browsers",
      "Only via the export. Click Export JSON before you switch, then use Import JSON in the new browser — records saved in one browser or profile are invisible to any other, including a private window on the same machine.",
    ],
  ],
};

export default seo;
