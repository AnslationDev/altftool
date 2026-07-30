const seo = {
  intro:
    "The Document Expiry Tracker is a private register for renewal dates: you add one record per document — passport, visa, driving licence, insurance policy, professional certificate — with its expiry date and the reminder you want against it, and the list is saved in your own browser rather than an account. Records stay searchable across every field, and the whole set exports to a JSON file you can back up or import into another browser. It suits anyone whose renewals are scattered across email, wallet and filing cabinet with no single list.",
  useCases: [
    "A family has four passports, two driving licences and a car insurance policy renewing at different points in the year, and needs one place that says what runs out next.",
    "A contractor holds professional certifications and a work visa with separate renewal windows, and wants a note against each one saying how early the paperwork has to start.",
    "You are moving to a new laptop and want your renewal list to travel with you — export the JSON, import it on the new machine, and nothing goes through a server.",
  ],
  benefits: [
    [
      "Kept in your browser, not an account",
      "Records live in this browser's local storage under one key, with no sign-up and nothing transmitted, so expiry dates for identity documents are not sitting in someone else's database.",
    ],
    [
      "Free-text reminders, not a fixed schema",
      "The reminder field takes whatever the document actually needs — 'renew 9 months early, appointments book out' — instead of forcing every record into the same lead time.",
    ],
    [
      "Portable JSON in and out",
      "Export writes the full list as readable JSON and import reads it back, so a backup is a file you own rather than a vendor export request.",
    ],
  ],
  faqs: [
    [
      "How early should I renew my passport?",
      "Many destinations require a passport valid for at least six months beyond your date of entry, so treat the practical expiry as six months before the printed one. Renewal processing times swing with demand, so record the date you want to start the application, not just the expiry, and check your issuing authority's current turnaround.",
    ],
    [
      "Where is my data stored?",
      "In this browser's local storage, under a single key for this tool. It is not sent anywhere and is not synced between browsers or devices — clearing site data or using a different browser profile means the records are gone, which is why the JSON export exists.",
    ],
    [
      "Will it send me a reminder notification?",
      "No. It does not email, push or alert — the reminder you type is a note stored with the record. Pair it with a calendar entry on the date you want to be prompted, and use this list as the master register of what is due.",
    ],
    [
      "Can I move my list to another device?",
      "Yes. Export JSON on the first browser and use Import JSON on the second; every record keeps its fields and is given an id if it lacks one. Transfer the file over a channel you trust, since it contains your own expiry dates.",
    ],
  ],
};

export default seo;
