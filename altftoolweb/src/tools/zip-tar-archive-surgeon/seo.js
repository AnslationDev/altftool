const seo = {
  intro:
    "The ZIP/TAR Archive Surgeon opens a ZIP file in your browser, lists every entry with its uncompressed size and readability status, and rebuilds the archive without the entries you name — recompressed with DEFLATE at level 6 and downloaded as altftool-rebuilt.zip. Entries are verified with a CRC32 check as they are read, so anything encrypted or corrupt is flagged rather than silently dropped. Note that the current build reads ZIP containers only; TAR archives are not parsed.",
  useCases: [
    "Strip a stray .env, node_modules folder or set of .DS_Store files out of a ZIP you are about to send to a client, without unpacking and rezipping the whole thing.",
    "Check whether an archive someone sent you is fully readable — the entry table marks encrypted or unreadable members before you rely on the backup.",
    "Cut an oversized attachment down under a mail server limit by removing the few large entries you can identify from the size column.",
  ],
  benefits: [
    [
      "Entry-level surgery instead of unpack-and-rezip",
      "Paste the exact entry names to drop, comma- or newline-separated, and get a rebuilt ZIP back; everything else keeps its original path inside the archive.",
    ],
    [
      "CRC32 verification while reading",
      "Each member is decompressed and checksummed, so damaged or password-protected entries surface as 'Encrypted or unreadable' in the table rather than failing quietly.",
    ],
    [
      "A readable manifest of what is inside",
      "Every entry is listed with its byte size, whether it is a directory or a file, and whether this run will keep or remove it — a review pass before anything is written.",
    ],
  ],
  faqs: [
    [
      "Can this tool edit TAR or tar.gz archives?",
      "No — despite the name, the current implementation loads ZIP containers only. TAR, tar.gz and 7z files are not parsed, so use a ZIP or repackage first.",
    ],
    [
      "How do I remove a file from a ZIP without extracting it?",
      "Load the archive, then paste the exact entry names into the removal box, separated by commas or line breaks. Names must match the path as stored inside the archive, including any folder prefix such as docs/old.pdf, and the rebuilt ZIP downloads automatically.",
    ],
    [
      "Are my archives uploaded to a server?",
      "No. The ZIP is parsed and rebuilt entirely in your browser with JSZip, and the output is generated as a local blob download. Nothing is transmitted, which is why large archives are limited only by your own device memory.",
    ],
    [
      "Does rebuilding change the compression of my files?",
      "Yes — every kept entry is recompressed with DEFLATE at level 6, a balanced middle setting, rather than preserving each entry's original compression method. Stored (uncompressed) members and already-compressed media may therefore come out at a slightly different size.",
    ],
  ],
};

export default seo;
