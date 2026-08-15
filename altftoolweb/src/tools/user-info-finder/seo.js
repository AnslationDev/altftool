const seo = {
  title: "User Info Finder: Search Your Own CSV or JSON List",
  metaDescription:
    "Not a people-search. Paste your own CSV, TSV or JSON export and query it with field:value, quoted phrases and -exclusions, all inside the browser.",
  steps: [
    "Paste CSV, TSV or a JSON array into Your records, or press Load a file to open a .csv, .tsv, .txt or .json export from your CRM or admin panel.",
    "Type a query such as city:Berlin plan:Team -role:Viewer, then narrow it with the filter chips built from the real distinct values in your columns.",
    "Read the ranked rows with the matching field highlighted and the What is in each field profile, then press Copy this page as CSV.",
  ],
  intro:
    "This is a search engine for a user list you already have, not a people-search service. Paste a CSV export from a CRM, an admin panel, a billing system or a support desk — or a JSON array of records — and it parses the file properly (quoted fields, embedded commas and newlines, tab, semicolon and pipe separators all handled), works out what each column holds, then lets you query it with field terms, quoted phrases, exclusions and one-click filters built from the real distinct values in your data. Results are ranked by a fixed published rule: an exact field match scores 100, a field that starts with your term 60, a word inside the field 40, and a match anywhere 20. Nothing is looked up online, nothing is inferred and no detail about a person is ever generated — if it is not in your file, it does not appear.",
  useCases: [
    "A 4,000-row CSV export lands in your inbox and you need the three accounts on the Business plan in Berlin before the call starts, without loading it into a spreadsheet and building filters",
    "Support asks whether a customer exists in the export under a slightly different spelling, so you search the surname alone and see which field matched — name, billing contact or email local part",
    "Before an import you want to know which rows have a broken email address or a blank phone number, which the field profile lists explicitly rather than leaving you to eyeball 40 columns",
  ],
  benefits: [
    ["A real query language", "field:value narrows to one column, \"quoted text\" keeps a phrase together, and -term drops matching rows. Several terms combine, so city:Berlin plan:Team -role:Viewer works as written."],
    ["Ranking you can audit", "The four match weights are printed on the page and applied identically every time. There is no learned relevance model, no randomness and no hidden tie-break — equal scores keep your file's original order."],
    ["Your list never leaves the browser", "Parsing, typing, filtering and ranking all run locally. There is no upload, no API key and no account, so a customer export stays on your machine."],
  ],
  faqs: [
    [
      "Can it find someone's email address or phone number from just a name?",
      "No. This tool has no directory, no data broker feed and no internet access — it makes no network request at all. It only searches records you provide. Any page that claims to conjure a stranger's contact details from a name is either querying a scraped database or making them up, and neither is something this does.",
    ],
    [
      "What file formats does it read?",
      "A header row plus data, separated by commas, tabs, semicolons or pipes — the separator is detected from the header line — with full RFC 4180 quoting so a field containing a comma, a quote mark or a line break survives intact. It also takes a JSON array of objects, or an object wrapping one under users, records, data, results, items or rows. Fields present on only some records become columns that are blank elsewhere.",
    ],
    [
      "How is the match score worked out?",
      "Per term, it takes the best match across the fields you allowed: 100 if a field equals the term exactly, 60 if a field starts with it, 40 if any word inside a field starts with it, and 20 if it appears anywhere. Words are split on spaces, commas, slashes, at-signs, dots, underscores and hyphens, so searching \"okafor\" finds ben.okafor@example.com. Term scores are summed, and rows that fail any term are dropped rather than ranked low.",
    ],
    [
      "Is it safe to paste a customer export in here?",
      "The processing is entirely local — no request leaves the page, and nothing is written to a server or to storage. The usual caution still applies to the machine itself: a customer list in a browser tab is still a customer list, so mind who can see the screen, close the tab when you are finished, and check that your own policy allows the export to be opened outside your internal tools in the first place.",
    ],
  ],
};

export default seo;
