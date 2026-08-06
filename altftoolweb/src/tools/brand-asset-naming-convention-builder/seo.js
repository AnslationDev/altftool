const seo = {
  intro:
    "Brand Asset Naming Convention Builder turns a chosen set of tokens — brand, campaign, asset type, variant, dimensions, date and version — into a single filename pattern, then validates the result against the limits that actually break files: the POSIX portable filename character set, the Windows reserved device names, the 255-byte path component limit shared by NTFS, ext4 and APFS, the 260-character legacy MAX_PATH, and the 1024-byte Amazon S3 object key cap. Design and marketing teams get a copyable rules document plus worked examples across a real export set.",
  useCases: [
    "Agree one filename pattern before a rebrand dumps several hundred logo exports into shared storage.",
    "Stop a Windows colleague from being unable to open files that a Mac designer named with a colon or a question mark.",
    "Set zero-padded version numbers so v02 sorts before v10 in every file browser.",
    "Check that a deeply nested campaign folder plus filename still fits inside the 260-character Windows path limit.",
  ],
  benefits: [
    ["Validated, not just generated", "Every token value is sanitized to the portable filename character set as you type, then the finished name is still checked against the reserved-name, length and path limits sanitizing alone can't fix."],
    ["Sortable by design", "ISO 8601 dates and padded versions make an alphabetical file list a chronological one."],
    ["Shareable rules", "Copies out as a Markdown page you can paste straight into a brand book or team wiki."],
  ],
  faqs: [
    [
      "What characters are safe in a filename?",
      "Stick to A-Z, a-z, 0-9, dot, underscore and hyphen — the POSIX portable filename character set defined in IEEE Std 1003.1. Windows additionally forbids < > : \" / \\ | ? * and control characters, so anything outside the portable set risks failing on at least one platform.",
    ],
    [
      "How long can a filename be?",
      "A single path component is capped at 255 bytes on NTFS, ext4 and APFS, and the legacy Windows MAX_PATH limits a whole path to 260 characters. In practice keep filenames under about 80 characters so they are not truncated in file browsers and email clients.",
    ],
    [
      "Should I use hyphens or underscores in asset filenames?",
      "Use hyphens if the file may ever be served from a URL — search engines treat a hyphen as a word separator and an underscore as a joiner. Underscores are equally safe on disk, but they can be hidden by the underline in a hyperlink.",
    ],
    [
      "Why do some filenames break on Windows?",
      "Windows reserves the device names CON, PRN, AUX, NUL, COM1-COM9 and LPT1-LPT9, and rejects them even with an extension, so CON.png cannot be created. It also silently strips a trailing dot or space from the very end of the name, so a file saved as \"logo.png.\" or \"logo.png \" is written to disk as plain \"logo.png\" instead.",
    ],
  ],
};

export default seo;
