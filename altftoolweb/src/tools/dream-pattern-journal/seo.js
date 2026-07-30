const seo = {
  intro:
    "Dream Pattern Journal is a private dream log: you record a dream title and a free-text notes-and-tags field, and every entry is saved in this browser's local storage rather than to an account. Because the search box matches across the whole entry, tagging dreams with your own words — falling, teeth, that house, a person's name — turns the journal into a way to pull up every occurrence of a recurring theme later. It is for anyone tracking recurring dreams over months who does not want that material sitting on someone else's server.",
  useCases: [
    "You keep having a variant of the same anxiety dream and want to search back through six months of entries to see what was going on the nights it turned up.",
    "A therapist has asked you to note your dreams between sessions and you want a log you can export and bring, without it living in a cloud app.",
    "You are trying to build the habit of writing dreams down on waking and need something you can open on your phone in ten seconds with no login.",
  ],
  benefits: [
    [
      "Tags are just words you type",
      "There is no fixed tag list to maintain — the search matches anything in the title or notes, so a theme you only notice after fifty entries is still findable.",
    ],
    [
      "Nothing is submitted anywhere",
      "Entries are written to this browser's local storage as you add them, so a dream journal never becomes an account someone else can read.",
    ],
    [
      "Yours to take away",
      "Export the whole journal as a JSON file and import it back on another browser or device, so the log outlives any single machine.",
    ],
  ],
  faqs: [
    [
      "Where are my dream entries stored?",
      "In this browser's local storage, under a single key for this tool. They are not uploaded, but that also means clearing site data, using private browsing, or switching browser or device will leave them behind — export the JSON file if you want a copy that survives.",
    ],
    [
      "How do I find recurring dream themes?",
      "Type a consistent word into the notes field each time a theme appears — one word per theme works best — then search that word to pull up every matching entry. The count of results is shown next to the saved-records heading.",
    ],
    [
      "When should I write a dream down?",
      "As soon as you wake, before getting up if you can, because dream recall fades quickly once you start moving and thinking about the day. A title plus a few fragments beats a polished account written hours later.",
    ],
    [
      "Can recurring dreams tell me something about my mental health?",
      "Dream content is not a diagnostic tool, and this journal makes no interpretation of what you write. If recurring dreams or nightmares are disturbing your sleep or distressing you during the day, a doctor or a qualified therapist is the right place to take the pattern — the exported journal can be useful material for that conversation.",
    ],
  ],
};

export default seo;
