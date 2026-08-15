const seo = {
  title: "Personal Data Export Auditor - Schema Only",
  metaDescription:
    "Scan a downloaded data export of JSON, CSV and TXT files for eight personal-data categories. Reads field names and counts only, never the values.",
  steps: [
    "Press 'Choose files' under 'Select extracted export files' and pick up to 24 JSON, CSV or TXT files (8 MB per file, 24 MB per batch), or press 'Load safe sample'; ZIP, TAR, GZ, RAR and 7Z are inventoried as unsupported only.",
    "Each JSON file is walked for its property names and each CSV for its first non-empty header row, and those names are matched against eight category rules: location, contacts, messages, ads, searches, devices, identifiers and security.",
    "Check the 'Files inventoried', 'Category signals', 'Records counted' and 'Fields counted' cards plus the per-file 'File inventory', then press 'Download metadata report' to save altftool-personal-data-export-audit.json.",
  ],
  intro:
    "This auditor takes the JSON, CSV and TXT files from a 'download your data' export and tells you what categories of personal data the export actually contains, by matching JSON property names, CSV header rows and file names against keyword rules for eight categories: location, contacts and connections, messages, ads and inferred interests, searches and activity history, devices and network signals, account identifiers, and security and authentication. It reads structure only — field names, record counts and file sizes — and never records a single field value, replacing any key that looks like a value (an email address, a URL, a UUID, a long number) with a [dynamic key] placeholder. The output is a JSON metadata report you can keep or hand to someone else without leaking the contents.",
  useCases: [
    "You requested your data from a social network, got a 40-file export, and want to know which files hold message content before you decide what to delete",
    "Checking whether a service's export includes precise location fields such as latitude and longitude, rather than reading through the raw JSON to find out",
    "Documenting for a subject-access or privacy complaint which categories a company returned and in how many files, without attaching the personal data itself",
  ],
  benefits: [
    ["Schema-only by design", "Field names and counts are analysed; values, message bodies and text lines are never read into the report."],
    ["Evidence for every match", "Each detected category lists up to 10 supporting signals — the exact schema path or CSV header that triggered it — so you can check the classification."],
    ["Tells you what it could not see", "Files that were skipped, truncated at the traversal limit or left unparsed are counted separately instead of silently dropping out of the totals."],
  ],
  faqs: [
    [
      "What file types can it analyse?",
      "JSON, CSV and plain text, up to 8 MB per file. Archives such as .zip, .tar and .7z are not opened — extract them yourself first — and TXT files are only counted by non-empty lines and characters, not classified.",
    ],
    [
      "Does it read the actual contents of my export?",
      "No values are retained. JSON is walked for property names, CSV for the first non-empty header row, and everything else is reduced to counts; the report explicitly excludes field values and text lines. Parsing happens in your browser, so the export is never uploaded.",
    ],
    [
      "Why does my huge export come back marked partial?",
      "Because traversal stops at safe browser limits: 18 levels of nesting, 75,000 nodes per file, and 60 sampled schema paths. When a limit is hit the file is flagged partial and the reason is written into the report, so you know the counts are a floor rather than a total.",
    ],
    [
      "Does a category match prove the company holds that data?",
      "No. Matches are keyword indicators drawn from field names — a column called 'place' is evidence of location data, not proof of how it was collected or used. Treat the report as a map of your export for further reading, and take legal or regulatory questions to a qualified adviser.",
    ],
  ],
};

export default seo;
