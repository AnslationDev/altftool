const seo = {
  intro:
    "Email Extractor pulls every email address out of a block of pasted text, HTML source or log output using the pattern local-part@domain.tld, lowercases them, and can deduplicate, sort alphabetically and filter to a single domain. Alongside the list it counts how many addresses belong to each domain, and lets you export the result separated by new lines, commas or semicolons so it drops straight into a mail client's To field or a CSV column. It is for anyone who has a messy paste — a forwarded thread, a scraped page, a support export — and needs the addresses out of it cleanly.",
  useCases: [
    "You have a forwarded email thread with dozens of addresses buried in From, To and CC lines, and you need them as a comma-separated list to paste into a new message.",
    "You copied a team page's HTML source and want only the addresses on the company domain, filtered out from the personal Gmail and Yahoo ones also on the page.",
    "You are auditing a signup export and want to see the domain breakdown — how many are gmail.com versus corporate domains — before deciding how to segment the list.",
  ],
  benefits: [
    [
      "Domain frequency counted automatically",
      "Every extraction comes with a per-domain tally, so you can see the shape of a list rather than just its contents.",
    ],
    [
      "Filter to one domain in place",
      "A domain filter narrows the results to addresses ending in what you type, without needing a second pass through a spreadsheet.",
    ],
    [
      "Output separator to match the destination",
      "New line, comma or semicolon — the same extraction feeds a mail client's recipient field, a CSV cell or a config file without reformatting.",
    ],
  ],
  faqs: [
    [
      "What counts as an email address here?",
      "Anything matching local-part@domain.tld, where the local part may contain letters, digits and the characters . _ % + -, and the top-level domain is at least two letters. That covers plus-addressing like user+tag@example.com and subdomains like name@sub.domain.org.",
    ],
    [
      "Does it remove duplicate addresses?",
      "Yes, by default. Every match is lowercased first, so Support@Example.com and support@example.com collapse to one entry — turn the deduplicate option off if you need every raw occurrence, including repeats.",
    ],
    [
      "Can I extract emails from HTML source code?",
      "Yes. Paste the raw markup and the pattern picks up addresses in mailto: links, visible text and attribute values alike, since it scans the text rather than parsing the DOM. Obfuscated forms such as 'name [at] domain [dot] com' will not be matched.",
    ],
    [
      "Is the pasted text sent anywhere?",
      "No. Matching, deduplication and the domain counts all run in your browser, so lists containing customer or employee addresses never leave your machine — which is what makes the tool usable on data you could not paste into a hosted service.",
    ],
  ],
};

export default seo;
