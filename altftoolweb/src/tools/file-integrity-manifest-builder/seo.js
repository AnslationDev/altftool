const seo = {
  title: "File Integrity Manifest Builder: SHA-256 in Your Browser",
  metaDescription:
    "Hash up to 200 files with SHA-256 into a deterministic JSON manifest, then diff it against an earlier one — files never leave the tab.",
  steps: [
    "Press Choose files or Choose folder to select up to 200 files, 64.0 MB per file and 256.0 MB combined; folder selection keeps the browser-provided relative paths.",
    "Optionally press Import manifest to load an earlier JSON manifest (up to 2.0 MB), then press Build manifest to read each file in turn and digest it locally with SHA-256.",
    "Review Ordered file entries, Duplicate digest visibility and the Earlier-manifest comparison, then press Download manifest for file-integrity-manifest.json or Download counts only for file-integrity-counts-only.json.",
  ],
  intro:
    "File Integrity Manifest Builder hashes every file in a folder or selection with SHA-256 and writes a deterministic JSON manifest listing each file's relative path, size, media type, last-modified time and 64-character digest, sorted by path so the same set always produces the same file. Load a manifest you saved earlier and it diffs the two, reporting digest matches, digest differences, files present only now, files present only in the baseline, and metadata-only changes. It is for anyone who needs to prove a set of files has not changed between two points in time — archives, evidence sets, design masters, release bundles — without uploading any of them.",
  useCases: [
    "You are handing a folder of project masters to a client and want a record of exactly what you sent, so you build a manifest, keep a copy, and can later show that a file they claim was altered still has the digest you recorded.",
    "A backup drive has been in a cupboard for a year and you want to know whether any file has silently rotted, so you compare a fresh manifest of the folder against the one you generated when you archived it.",
    "You suspect a photo library has the same shot saved under three names in different folders, so you build a manifest and read the duplicate-digest groups, which list every set of files whose bytes are byte-for-byte identical.",
  ],
  benefits: [
    ["Byte-level diff, not date comparison", "A digest difference means the contents actually changed; a metadata-only difference means the bytes are identical and only the timestamp or media type moved, and the report separates the two."],
    ["Deterministic output you can commit", "Entries are sorted by relative path in ascending UTF-16 order with a fixed schema, so two manifests of the same folder are identical files and diff cleanly in version control."],
    ["Duplicate detection for free", "Because every file is digested, identical content under different names groups automatically — you see which files are exact copies of each other without a separate dedupe pass."],
  ],
  faqs: [
    [
      "How many files can I include in one manifest?",
      "Up to 200 files, with a per-file limit of 64 MB and a combined limit of 256 MB per run. Larger sets need to be split into several manifests, for example one per top-level folder.",
    ],
    [
      "Are my files uploaded to build the manifest?",
      "No. Each file is read locally and digested with the browser's Web Crypto SHA-256, and the manifest records only paths, sizes, timestamps and digests — file contents are never embedded and never leave the device.",
    ],
    [
      "What does it mean if a digest matches but the metadata differs?",
      "The file's bytes are unchanged and only its recorded size, media type or last-modified value differs — usually the result of a copy, a restore from backup, or a different browser reporting the type differently. The content is intact; the report lists these separately from real digest differences.",
    ],
    [
      "Does a matching SHA-256 digest mean a file is safe?",
      "No. A digest match only proves the bytes are the same as the ones you recorded; it says nothing about who made the file, where it came from, or whether it is malicious. A manifest is a change-detection record, not a digital signature or a trust decision.",
    ],
  ],
};

export default seo;
