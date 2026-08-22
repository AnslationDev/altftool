const seo = {
  title: "Private Journal in Your Browser - No Account",
  metaDescription:
    "Write diary entries that stay in your browser's localStorage - full-text search across titles and bodies, JSON export and import, nothing uploaded.",
  steps: [
    "Type your entry into the Entry title and Journal entry fields at the top of the workspace.",
    "Click Add record - the entry is saved to this browser's localStorage and listed under Saved records, where the Search records box matches titles and bodies together.",
    "Click Export JSON to download encrypted-private-journal.json as a backup, and use Import JSON on another machine (import replaces the current list).",
  ],
  intro:
    "The Encrypted Private Journal keeps diary entries — a title and a body per entry — in this browser's own localStorage, with full-text search across everything you have written and JSON export for backup. There is no account, no sync and no server: nothing you type is transmitted, which is what makes it private. Privacy here comes from the data never leaving the device, not from a passphrase, so treat it as a personal notebook on a machine only you use.",
  useCases: [
    "You want to keep a daily work log or mood diary without creating an account on a journalling app that syncs your writing to someone else's servers.",
    "You are trying to remember when a recurring symptom, argument or idea first came up, and you search your own entries for the word rather than scrolling months of them — matches stay in the order you wrote them, so the earliest sits at the top.",
    "You are switching laptops and export the whole journal as one JSON file, then import it on the new machine to carry every entry across.",
  ],
  benefits: [
    [
      "Search covers the whole entry",
      "The filter matches against titles and bodies together, so one word finds an entry you cannot date.",
    ],
    [
      "Your writing stays in a readable format",
      "Export produces a plain JSON array of your entries — no proprietary container, so the text is still yours if you stop using this tool.",
    ],
    [
      "No account, no network call",
      "Entries are written to localStorage as you add them; there is nothing to sign into and nothing to leak in transit.",
    ],
  ],
  faqs: [
    [
      "Are my journal entries encrypted?",
      "No — despite the name, entries are stored as plain text in this browser's localStorage and there is no passphrase or key. The protection is that the data never leaves your device. If you need entries unreadable to anyone with access to your computer, keep the exported JSON inside an encrypted disk image or container instead.",
    ],
    [
      "Where are my entries saved, and will I lose them?",
      "In localStorage under a single key tied to this site, in the one browser and profile you used. Clearing browsing data or site storage, using private or incognito windows, or opening the tool in a different browser all mean the entries are gone or invisible — export the JSON regularly if the journal matters.",
    ],
    [
      "Can I read my journal on my phone as well as my laptop?",
      "Only by moving the file yourself. There is no sync, so the way to share a journal across devices is to export the JSON on one and import it on the other, which replaces the list rather than merging entries.",
    ],
    [
      "Is anything I write sent to a server or used to train anything?",
      "No. All adding, searching, exporting and importing happens in the page with no network request, so the text is never uploaded, analysed or shared.",
    ],
  ],
};

export default seo;
