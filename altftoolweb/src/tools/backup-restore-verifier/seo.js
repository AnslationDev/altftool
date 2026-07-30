const seo = {
  intro:
    "The Backup Restore Verifier opens a ZIP backup in your browser and actually decompresses every entry with CRC32 checking on, so each file is reported as Readable, Directory, or Encrypted or unreadable along with its true uncompressed byte size. It is for anyone who keeps ZIP backups of photos, documents, exports or archives and has never confirmed that the archive still restores. The result is a per-entry table plus a count of how many files came back readable — a restore test rather than a file listing.",
  useCases: [
    "You found a 2019 backup ZIP on an old external drive and want to know whether the files inside still decompress before you delete the drive.",
    "A password-protected archive is refusing to open and you need to see which specific entries are encrypted rather than just getting a generic failure.",
    "Before handing a client or family member an archive, you want proof that every entry in it survives extraction and matches its stored CRC32.",
  ],
  benefits: [
    [
      "It extracts, it does not just read the index",
      "Every non-directory entry is decompressed to a Uint8Array, so a corrupt deflate stream or a bad CRC32 shows up as unreadable instead of hiding behind a valid-looking central directory.",
    ],
    [
      "Per-entry verdicts, not one pass or fail",
      "The table names each entry with its size and status, so a mostly-good archive with three broken files tells you exactly which three.",
    ],
    [
      "Encrypted entries are called out honestly",
      "Entries that cannot be decoded are labelled Encrypted or unreadable rather than being silently skipped or counted as fine.",
    ],
  ],
  faqs: [
    [
      "How do I check if a ZIP backup is corrupted?",
      "Select the ZIP and run the workbench — it decompresses every entry with CRC32 verification enabled, and any entry whose data fails to decode is listed as Encrypted or unreadable. The summary line tells you how many entries came back readable.",
    ],
    [
      "Can it open password-protected ZIP files?",
      "No. There is no password field, and standard ZIP encryption is not decrypted here, so encrypted members are reported as unreadable. Use the archiver that created the backup to test those with the password.",
    ],
    [
      "Does my backup get uploaded anywhere?",
      "No. The archive is parsed by JSZip inside your browser tab and never leaves the device — nothing is sent to a server, which also means very large archives are limited by your available memory.",
    ],
    [
      "Which archive formats work?",
      "ZIP only. TAR, 7z, RAR, and disk-image formats are not parsed, and an encrypted or non-ZIP file will simply fail to load rather than producing a partial report.",
    ],
  ],
};

export default seo;
