const seo = {
  title: "Compare a File's SHA-256 Checksum in Your Browser",
  metaDescription:
    "Hash a local file up to 512 MB with SHA-256, 384 or 512 and match it to the publisher's hex digest. Read via Web Crypto in the tab, never uploaded.",
  steps: [
    "Under \"1. Choose the file\", select any local file up to 512 MB — it is read and hashed inside this browser tab, not uploaded.",
    "In \"2. Paste and compare\", paste the publisher's value into Expected checksum, leave Algorithm on \"Detect from checksum length\", and press Compare checksum.",
    "The page returns \"Checksums match\" or \"Checksums do not match\" and shows the Calculated SHA-256/384/512 digest with a Copy calculated hash button.",
  ],
  intro:
    "File Checksum Comparator hashes a file you choose with SHA-256, SHA-384 or SHA-512 using the browser's Web Crypto API and compares the resulting hex digest against the checksum a publisher gave you, in a constant-time character comparison. Paste the expected value and the algorithm is inferred from its length — 64 hex characters for SHA-256, 96 for SHA-384, 128 for SHA-512 — with the file read locally and never uploaded. It is for anyone verifying an installer, ISO, firmware image or archive actually matches what the vendor published.",
  useCases: [
    "You downloaded a Linux ISO over a mirror you had never heard of and the project's page lists a SHA-256 line, so you hash the local file and confirm the two strings match before writing it to a USB stick.",
    "A vendor sent a firmware update as an email attachment plus a checksum in a separate message, and you want to know the attachment was not altered or truncated in transit before you flash a device.",
    "A large archive downloaded twice on a flaky connection and the two copies differ in size by a few kilobytes, so you hash both against the published digest to see which one completed cleanly.",
  ],
  benefits: [
    ["Algorithm inferred from your paste", "Leave the selector on auto and the SHA-2 variant is chosen by the checksum's length, so you cannot accidentally compare a SHA-512 value against a SHA-256 digest."],
    ["Tolerant of how checksums are published", "Leading labels like \"SHA256:\" or \"checksum =\", stray whitespace and uppercase hex are all stripped before comparison, so you can paste a line straight off a release page."],
    ["Constant-time comparison", "The two digests are compared with an XOR accumulation over every character rather than an early-exit string equality, so the check does not leak timing information."],
  ],
  faqs: [
    [
      "How long should a SHA-256 checksum be?",
      "64 hexadecimal characters. SHA-384 is 96 and SHA-512 is 128, and the tool rejects any pasted value whose length does not match the selected algorithm or contains non-hex characters.",
    ],
    [
      "Is my file uploaded anywhere to be hashed?",
      "No. The file is read into memory in your own browser and digested with crypto.subtle.digest, so nothing about it leaves the machine — which is why you can safely verify confidential builds and licensed installers here.",
    ],
    [
      "How large a file can I check?",
      "Up to 512 MB. The whole file is loaded into memory to be hashed, so very large images may be slow or may fail on a low-memory device even under that limit.",
    ],
    [
      "What should I do if the checksum does not match?",
      "Do not open or run the file. A mismatch means the bytes you have differ from the bytes the publisher hashed, most often from an incomplete or corrupted download — re-download from the official source and check again; if it still fails, treat the file as untrusted and report it to the publisher.",
    ],
  ],
};

export default seo;
