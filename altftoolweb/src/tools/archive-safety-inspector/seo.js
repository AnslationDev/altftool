const seo = {
  title: "ZIP Safety Inspector: Preflight Without",
  metaDescription:
    "Reads a ZIP's central directory for path traversal, symlinks, encryption and 200:1 ratios — up to 30 MB, and nothing is decompressed.",
  steps: [
    "Press Choose file under ZIP-compatible archive and pick a zip, jar, apk, epub, whl, OOXML (docx, xlsx, pptx) or ODF file up to 30 MB",
    "Press Run local inspection; it parses the end-of-central-directory record and per-entry headers only, stopping at 3,000 entries and an 8 MB central directory, and never decompresses an archived byte",
    "The panel reports Entries, Files, Review markers and Declared expanded alongside findings such as Path traversal names, Symbolic links, Encrypted entries, Double extensions and High compression ratios; Download report saves archive-central-directory-counts-only.json, Copy report copies it and Reset clears the file",
  ],
  intro:
    "The Archive Safety Inspector reads a ZIP file's end-of-central-directory record and per-entry headers to flag risky structure before you extract anything — path traversal (..), absolute paths, Unix symlink entries, encrypted or masked entries, control and bidi characters in filenames, double extensions like invoice.pdf.exe, duplicate names, central-versus-local header mismatches, and declared compression ratios of 200:1 or more. It never decompresses, opens or executes a single archived byte; every finding comes from metadata. It accepts ZIP and ZIP-based packages — JAR, APK, EPUB, DOCX/XLSX/PPTX, ODF, WHL — up to 30 MB.",
  useCases: [
    "A ZIP arrived attached to an email you were not expecting, and you want to see the entry names and whether anything executable or symlinked is inside before deciding to open it.",
    "You are about to unzip a downloaded archive into a build directory and want to be sure no entry escapes it with ../ or an absolute path.",
    "A 200 KB archive claims to expand to several gigabytes, and you want the declared ratio per entry to confirm a zip-bomb pattern before your extractor tries.",
  ],
  benefits: [
    ["Nothing is extracted", "Findings come from the central directory and local file headers only, so a hostile archive never gets its content decompressed on your machine."],
    ["Cross-checks central against local headers", "Each entry's flags, compression method and filename are compared between the central directory and its local header, catching the mismatch trick that makes tools disagree about what an archive contains."],
    ["Hard bounds on the parse itself", "Inspection stops at 3,000 entries, an 8 MB central directory and 4,096-byte entry names, so a malformed archive cannot turn the inspector into the denial-of-service vector."],
  ],
  faqs: [
    [
      "What counts as a zip bomb here?",
      "An entry whose declared uncompressed size divided by its compressed size is 200 or more, an entry declaring over 64 MB expanded, or a whole archive declaring over 160 MB expanded. Those are metadata claims, not measured extraction, and a crafted archive can lie about them in either direction.",
    ],
    [
      "Does a clean result mean the archive is safe?",
      "No. A result with no review markers means nothing in the header structure matched the checks — it says nothing about whether the contents are malicious. There is no malware scanning, no content inspection and no signature verification here; treat a clean report as one preflight signal among several.",
    ],
    [
      "What is the file size limit and which formats work?",
      "Up to 30 MB, and the file must be a ZIP or a common ZIP-based package: zip, jar, apk, epub, whl, the OOXML formats (docx, xlsx, pptx and their macro-enabled docm, xlsm, pptm, xlam variants) and the ODF formats (odt, ods, odp). Split and multi-disk archives are rejected rather than partially parsed.",
    ],
    [
      "Which file extensions are flagged as suspicious?",
      "Roughly 30 executable and script types including exe, dll, msi, bat, cmd, ps1, vbs, js, jar, apk, scr, lnk, hta, iso, dmg and the macro-enabled Office formats. An entry is additionally flagged for a double extension when one of those follows a decoy such as .pdf, .docx or .jpg in the same filename.",
    ],
  ],
};

export default seo;
