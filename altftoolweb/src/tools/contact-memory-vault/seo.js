const seo = {
  title: "Contact Memory Vault: Private Notes Saved In-Browser",
  metaDescription:
    "A two-field Contact and Memory notebook stored in your browser's localStorage — search both fields, export and reimport as a JSON file. No account.",
  steps: [
    "Type into the Contact and Memory boxes and press Add record — records are saved to this browser's localStorage under a single key.",
    "Filter the Saved records list with the \"Search records\" box, which matches text across the Contact and Memory fields together.",
    "Press Export JSON to download contact-memory-vault.json, or Import JSON to restore a backup — importing replaces every record currently saved.",
  ],
  intro:
    "Contact Memory Vault is a two-field notebook — Contact and Memory — for recording what you know about the people in your life: coffee order, kids' names, the surgery they mentioned, a gift idea you overheard. Records are stored in your own browser's localStorage under a single key, searched with a plain-text filter across both fields, and exported or reimported as a JSON file you control. It suits anyone who keeps meaning to remember these details and would rather not put them in a cloud CRM.",
  useCases: [
    "You want to note that a colleague is allergic to shellfish and prefers being called Kat, not Katherine, before the next team dinner where you pick the restaurant.",
    "A friend mentioned in March that they want a particular record on vinyl, and you need somewhere to park that until their birthday in November.",
    "You are moving to a new laptop and want to carry the whole set of notes across as one JSON file instead of retyping them or syncing them through an account.",
  ],
  benefits: [
    ["Search spans both fields at once", "The filter matches across the contact name and the memory text together, so typing 'vinyl' finds the note even when you have forgotten whose it was."],
    ["Your file, your move", "Export writes a plain JSON array you can read, edit or back up yourself, and import restores it — there is no account and no proprietary format."],
    ["Free-form memories, not fixed CRM fields", "The Memory box is a textarea, so a single record can hold a paragraph of context instead of being forced into 'job title' and 'company'."],
  ],
  faqs: [
    [
      "Where are my notes actually stored?",
      "In your browser's localStorage, under one key belonging to this tool on this site. Nothing is uploaded, but that also means the notes live in that specific browser profile — clearing site data or using a different browser or device shows an empty vault until you import your JSON export.",
    ],
    [
      "Are the notes encrypted?",
      "No. They are stored as readable JSON in browser storage, so anyone with access to your unlocked computer and browser profile can read them. Treat it as a private notebook rather than a secrets manager, and keep genuinely sensitive information out of it.",
    ],
    [
      "How do I move my vault to another computer?",
      "Use Export JSON on the old browser, move the downloaded file across however you like, then use Import JSON on the new one. Importing replaces the current list with the file's contents, so export first if the new browser already has records you want to keep.",
    ],
    [
      "Is it rude to write down details about friends?",
      "Most people find the opposite — remembering that someone's mother was in hospital or that they do not drink is a form of attention, not surveillance. The useful test is whether you would be comfortable with them reading the note; if not, do not write it.",
    ],
  ],
};

export default seo;
