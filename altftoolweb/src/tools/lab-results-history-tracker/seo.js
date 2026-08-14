const seo = {
  intro:
    "The Lab Results History Tracker is a private local logbook for blood work and other lab measurements: you record a test name and its result with the date, and every entry is kept in your own browser's local storage rather than on a server. Records can be searched, deleted, exported to a JSON file and imported back, so a history built up over years of check-ups stays under your control. It stores and organises what you type — it does not interpret results or flag values, and reference ranges should come from your lab report and your clinician.",
  useCases: [
    "You have three years of annual health-check PDFs and want one searchable list of your HbA1c, vitamin D and ferritin values — new entries are appended to the end of the list, so typing them in oldest-first keeps the whole run in order before your next appointment.",
    "You are switching to a new doctor or lab and want to type up your past results into a single file you can export and take with you, instead of carrying a folder of printouts.",
    "You are tracking one measurement between visits — thyroid TSH after a dose change, for example — and want a running log you can search by test name without putting your health data into a cloud account.",
  ],
  benefits: [
    ["Nothing leaves the browser", "Entries are written to this browser's local storage only; there is no account, no upload and no server copy to delete later."],
    ["Search across every entry", "The search box matches on the full text of a record, so typing a test name pulls up every date you logged it."],
    ["Portable JSON export", "Export JSON writes the whole history to lab-results-history-tracker.json, a file you can back up, move to another device, or import again to restore the list."],
  ],
  faqs: [
    [
      "Where are my lab results stored?",
      "In your browser's local storage on the device you are using, under a single key for this tool. Nothing is transmitted, so clearing site data or using a different browser or device means the list will be empty there — export the JSON file if you want a copy that survives.",
    ],
    [
      "What do I enter for each record?",
      "Two fields: the test name and the result together with its date. Keeping the units and the lab's reference range in the result field is worth doing, because ranges differ between laboratories and a bare number is hard to interpret later.",
    ],
    [
      "Can I move my history to another device?",
      "Yes — use Export JSON to download the full list as a file, then use Import JSON on the other device to load it. Importing replaces the current list, so export first if that browser already holds records you want to keep.",
    ],
    [
      "Does this tell me whether a result is normal?",
      "No. It records and organises what you enter and does not evaluate values, apply reference ranges or offer any interpretation. Read results against the range printed on your own lab report and discuss anything unexpected with the clinician who ordered the test.",
    ],
  ],
};

export default seo;
