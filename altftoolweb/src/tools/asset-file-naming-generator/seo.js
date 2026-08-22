const seo = {
  title: "Asset File Naming Generator: ISO Dates & Padding",
  metaDescription:
    "Build sortable file names from tokens with hyphen, underscore or dot separators, ISO 8601 or year-quarter dates and zero-padded sequence numbers.",
  steps: [
    "Type your tokens into 'Name parts, one per line', then pick a Separator (Hyphen — my-file, Underscore — my_file, Dot — my.file or None) and a Case style (lowercase, UPPERCASE, Title Case, camelCase or PascalCase).",
    "Set the Date, its Date format (No date, ISO 8601, compact, year-month or year-quarter) and Date position — 'Start of the name (sorts by date)' or 'End of the name (sorts by project)' — plus Extension, Sequence start, Sequence padding (1-10) and Batch count (up to 200).",
    "Read the whole run under 'Generated names', which reports how many characters are in the first file name and warns about illegal Windows characters, reserved device names or a trailing period. Copy puts the list on your clipboard and Reset restores the defaults.",
  ],
  intro:
    "An asset file naming generator assembles a file name from ordered tokens — client, asset, variant, date and sequence number — under a chosen separator and case convention. It enforces the rules that actually break files in the wild: Windows rejects the characters \\ / : * ? \" < > | and reserves device names like CON and NUL, no name may end in a space or period, and NTFS, APFS and ext4 all cap one path component at 255 characters. ISO 8601 dates are used because YYYY-MM-DD sorts alphabetically in chronological order.",
  useCases: [
    "Name a batch of 30 exports for one client so they stay in shot order in Finder and Explorer.",
    "Standardise a shared drive where some files use spaces, some use underscores and nothing sorts.",
    "Generate delivery names for social cutdowns that carry the aspect ratio and version in the file name.",
    "Rename archive footage with a year-quarter token so a decade of projects groups cleanly.",
  ],
  benefits: [
    ["Sorts the way you expect", "ISO dates and zero-padded numbers mean 002 comes before 010 in every file browser."],
    ["Cross-platform safe", "Illegal Windows characters, reserved device names and trailing periods are caught before you rename anything."],
    ["Batch preview", "See the whole numbered run at once and copy it as a list for a rename script."],
  ],
  faqs: [
    [
      "What characters are not allowed in a file name?",
      "Windows rejects \\ / : * ? \" < > | and all control characters, and forbids a name that ends with a space or a period. macOS and Linux are more permissive but a forward slash is still illegal, so sticking to letters, digits, hyphens and underscores keeps a file portable everywhere.",
    ],
    [
      "Should I use hyphens or underscores in file names?",
      "Either is safe; be consistent. Hyphens are preferred for anything that may become a URL because search engines treat a hyphen as a word separator and an underscore as a joiner. Underscores survive double-click word selection better in code editors.",
    ],
    [
      "Why put the date at the start of a file name?",
      "Because a YYYY-MM-DD date sorts alphabetically in chronological order, so a plain A-Z listing becomes a timeline. Putting the date at the end instead groups files by project first, which is better when one folder holds several clients.",
    ],
    [
      "How long can a file name be?",
      "NTFS, APFS and ext4 all allow up to 255 characters for a single name, but the classic Windows full-path limit is 260 characters including folders. Keeping names under about 100 characters avoids sync and zip failures on deeply nested drives.",
    ],
  ],
};

export default seo;
