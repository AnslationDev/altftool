const seo = {
  title: "Travel Document Checklist with Deadlines",
  metaDescription:
    "Six trip profiles, per-document due dates 21/14/7/3 days before departure, a readiness percentage and a passport flag under 180 days. Exports CSV.",
  steps: [
    "Choose a Checklist type — International Trip, Domestic Trip, Visa File, Family Travel, Business Travel or Student Travel — then fill Destination, Departure, Return, Travelers and Passport expiry.",
    "Press Rebuild Dates to give each document its own deadline: 21 days before departure for Critical, 14 for High, 7 for Medium and 3 for Low.",
    "Watch the Readiness, Critical Pending and Departure In tiles as you mark rows ready, then press CSV to save travel-document-checklist.csv.",
  ],
  intro:
    "The Travel Document Checklist builds a dated, priority-ranked list of everything you have to carry — passport, visa, tickets, stay proof, insurance, IDs, forex and emergency copies — and works backwards from your departure date to give each item its own deadline: Critical documents are due 21 days before you fly, High 14 days, Medium 7 and Low 3. Pick one of six trip profiles (international, domestic, visa file, family, business or student), enter your departure date and passport expiry, and you get a readiness percentage, a count of critical items still pending, and a warning if your passport has under six months of validity left. It is for the traveller who wants the paperwork finished weeks early instead of the night before.",
  useCases: [
    "You fly in five weeks and want to know today which documents are already late — the visa application and passport renewal have earlier deadlines than the hotel booking.",
    "You are assembling an embassy visa file and need the identity, finance, travel-plan and purpose documents grouped, with bank statements and photos marked as print originals.",
    "You are travelling with children and one parent, so you need the birth certificate, consent letter and matching-name ticket checks tracked alongside the adult IDs.",
  ],
  benefits: [
    [
      "Deadlines derived from your departure date",
      "Each item gets its own due date by priority — 21, 14, 7 or 3 days before you fly — so a visa is never treated as a last-week task.",
    ],
    [
      "Passport validity checked, not just ticked",
      "Enter the expiry date and international, visa and student trips flag automatically when fewer than 180 days remain, which is the threshold most destinations apply.",
    ],
    [
      "Format and copies specified per document",
      "Every row records whether the original, a print or a digital copy is required, and Critical and High items default to two copies rather than one.",
    ],
  ],
  faqs: [
    [
      "How many months of passport validity do I need to travel?",
      "Many countries require at least six months of validity beyond your entry or departure date, and this checklist flags any international, visa or student trip where fewer than 180 days remain on the passport. The exact requirement varies by destination, so confirm it with that country's embassy or official visa portal before booking.",
    ],
    [
      "When should I start preparing travel documents?",
      "Start with the critical items about three weeks out — that is the 21-day deadline the checklist assigns to passports, visas and primary IDs — then High-priority items at 14 days, Medium at 7 and Low at 3. Visa processing itself can run far longer than three weeks, so check the consulate's stated turnaround and work back from that instead.",
    ],
    [
      "What counts as a critical travel document?",
      "The ones you cannot board or enter without: your passport or government ID, the visa or entry permit where one applies, and your tickets. The checklist marks these Critical, defaults them to two copies, and keeps a running count of how many are still not ready.",
    ],
    [
      "How is the readiness percentage calculated?",
      "It is the number of documents marked Ready divided by the number of active documents, where anything you set to 'Not needed' is excluded from both. Items still Pending or in Review count against you, so the figure reflects only what is genuinely done.",
    ],
  ],
};

export default seo;
