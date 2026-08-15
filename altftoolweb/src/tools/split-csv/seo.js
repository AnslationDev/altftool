const seo = {
  title: "Split CSV into Multiple Files – Rows or Column Value",
  metaDescription:
    "Split a CSV by max rows per file, equal parts, or one file per column value. The header repeats in every part; download files singly or as a ZIP.",
  steps: [
    "Upload a .csv file or paste into the 'CSV content' box, pick a Delimiter (Auto-detect, comma, semicolon, tab or pipe) and tick 'First row is a header'.",
    "Choose a 'Split mode' — 'Max rows per file', 'Equal number of files' or 'One file per column value' (capped at 500 output files) — and set the output file name prefix.",
    "Download each part (named like prefix-part-1.csv) from the Parts table, or click 'Download ZIP' to save every file in one archive.",
  ],
  intro:
    "Split CSV breaks one large comma-separated file into several smaller CSV files that each open cleanly in Excel, Google Sheets or a database importer. It parses the file with RFC 4180 rules, so quoted fields containing commas or line breaks are never cut in half, and it repeats the header row at the top of every output part. Use it when an upload limit, a row cap or a per-region hand-off means one file has to become many.",
  useCases: [
    "Breaking a 50,000-row export into 5,000-row chunks because an import tool rejects anything larger",
    "Splitting a national sales export into one CSV per city so each regional manager only gets their own rows",
    "Cutting a contact list into four equal files to divide outreach evenly across a four-person team",
  ],
  benefits: [
    ["Header kept in every part", "Each output file starts with the original header row, so column names survive the split."],
    ["Quoted fields stay intact", "RFC 4180 parsing means a comma or newline inside quotes never becomes an accidental split point."],
    ["Nothing leaves your device", "Parsing, splitting and ZIP packaging all happen in the browser — no upload, no server copy."],
  ],
  faqs: [
    [
      "How do I split a large CSV file into smaller files?",
      "Load the CSV, choose 'Max rows per file' and enter a row limit — a 12,000-row file split at 5,000 rows produces three files of 5,000, 5,000 and 2,000 rows. The header row is copied into each one, then you download them individually or as a single ZIP.",
    ],
    [
      "Does splitting a CSV keep the header row in every file?",
      "Yes, as long as 'First row is a header' is ticked. That first row is treated as column names rather than data and is written to the top of every output part, so all files import with the same schema.",
    ],
    [
      "Can I split a CSV by the value in a column?",
      "Yes — pick 'One file per column value' and choose the column. Every distinct value becomes its own CSV named after that value, with blank cells grouped into a '(blank)' file. The split is capped at 500 output files to keep the browser responsive.",
    ],
    [
      "Is my CSV uploaded anywhere when I split it?",
      "No. The file is read with the browser's own File API and split with JavaScript running on your machine; no request carries the file contents to a server, which is why the tool also works with the tab offline once loaded.",
    ],
  ],
};

export default seo;
