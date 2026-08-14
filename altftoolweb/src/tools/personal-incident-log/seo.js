const seo = {
  title: "Personal Incident Log Kept in Your Own Browser",
  metaDescription:
    "Keep a dated incident record in this browser's localStorage: one entry per event, searchable by any word in it, exportable as a JSON file you keep.",
  steps: [
    "Put a short label in the Incident field and the date, what happened and where the supporting evidence sits in \"Date, details, and evidence\".",
    "Press Add record to append it to the log in this browser's localStorage; Export JSON downloads personal-incident-log.json and Import JSON replaces every saved record after a confirm prompt.",
    "\"Saved records\" lists every entry with a running count, the Search records box filters on any text an entry contains, and each record carries its own Delete button behind a confirmation.",
  ],
  intro:
    "Personal Incident Log is a private record keeper for documenting incidents one at a time: each entry pairs a short incident title with a free-text field for the date, what happened, and where the supporting evidence sits. Entries are written to this browser's own localStorage rather than to an account, and the whole log can be searched by any word in it or exported as a single JSON file. It is built for anyone keeping a contemporaneous written record — of harassment, a dispute, or a run of service failures — before the details blur.",
  useCases: [
    "Logging each instance of workplace harassment as it happens — the date, what was said, who else was in the room — so the account is written down while it is still fresh rather than reconstructed months later.",
    "Building a dated noise or nuisance record for a landlord, housing society or HOA, with one entry per night and a note of which phone recording or photo backs it up.",
    "Tracking a repeating billing error or service failure with a provider, so that when you escalate you can quote every occurrence and its reference number instead of saying 'this keeps happening'.",
  ],
  benefits: [
    [
      "Search across the whole log",
      "The search box filters entries on any text they contain, so one date, one name or one reference number pulls up the relevant records out of hundreds.",
    ],
    [
      "Portable JSON you own",
      "Export JSON writes every record to a file you keep, and Import JSON reads it back — the log moves between browsers and devices without an account.",
    ],
    [
      "Consistent entry structure",
      "Every record uses the same two fields and stays where you added it — new entries append to the end of the list — so a log built over months still reads as one ordered account instead of scattered notes.",
    ],
  ],
  faqs: [
    [
      "Where is my incident log actually stored?",
      "In this browser's localStorage, under a key specific to this tool — there is no account, no upload and no sync. That also means clearing site data, using private browsing, or switching browsers removes it, so export the JSON whenever the log matters.",
    ],
    [
      "Can a log like this be used as evidence?",
      "That is decided by the court, tribunal, HR process or regulator you bring it to, not by the format of the notes. Contemporaneous records written close to the event are generally regarded as more reliable than later recollection, but this is general information only — talk to a lawyer or your jurisdiction's advice service about your specific situation.",
    ],
    [
      "How do I move the log to another device?",
      "Use Export JSON on the first browser and Import JSON on the second; the import asks you to confirm because it replaces every record already saved there. The export is a plain JSON array with one object per record, so it also opens in any text editor and can be attached to an email or archived as a backup.",
    ],
    [
      "What should go into each entry?",
      "Put a short identifying label in the first field and everything else in the second: date and time, a plain factual description of what happened, who was present, and a pointer to the supporting evidence such as a photo filename or email subject line. Write what was said and done rather than how it felt — factual entries hold up better on re-reading.",
    ],
  ],
};

export default seo;
