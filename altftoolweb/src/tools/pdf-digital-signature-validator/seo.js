const seo = {
  intro:
    "PDF Digital Signature Validator inspects the signature dictionaries inside a local PDF and checks that each /ByteRange actually covers the file the way a signature requires — starting at offset zero, in ordered non-overlapping pairs, leaving exactly one gap that lines up with the /Contents hex string. It then computes a SHA-256 digest of precisely the bytes ByteRange selects, so you can fingerprint the signed revision. It is a structural check only: it never claims the CMS signature, signer identity, certificate chain or timestamp is trustworthy.",
  useCases: [
    "A signed contract came back from the other side and Acrobat shows a green check, but you want to know whether bytes were appended after the signed revision ended.",
    "You are debugging a signing integration that produces PDFs some readers reject, and need to see whether the ByteRange gap matches the Contents string exactly.",
    "An auditor asks you to record which exact bytes a signature covered, and you need a reproducible SHA-256 of the signed range rather than a hash of the whole file.",
  ],
  benefits: [
    ["Checks the gap, not just the numbers", "It confirms the single ByteRange gap starts and ends exactly on the /Contents string and its delimiters, the classic place a forged range hides."],
    ["Flags bytes added after signing", "Each signature reports whether its covered range reaches the current end of file and how many trailing bytes follow it."],
    ["States what it cannot prove", "Every result ships with explicit limitations, so a range-consistent verdict is never mistaken for cryptographic or PKI validation."],
  ],
  faqs: [
    [
      "Does this tool prove a PDF signature is valid?",
      "No. It validates ByteRange structure and hashes the signed bytes; it does not parse the CMS/PKCS#7 blob in /Contents, check the certificate chain, revocation status, or timestamp authority. For legal or evidentiary reliance, verify in a full PKI validator and consult the relying party's requirements.",
    ],
    [
      "What does a ByteRange have to look like to pass?",
      "It must be an array of 4 to 32 non-negative integers in offset-length pairs, with the first offset equal to zero, every length greater than zero, pairs ordered and non-overlapping, none extending past the end of the file, and exactly one gap between them matching the /Contents string.",
    ],
    [
      "How big a PDF can I inspect, and how many signatures?",
      "Up to 20 MB per file, with the first 12 candidate signature dictionaries inspected and a total hashing budget of 64 MB across their signed ranges. Files or signature counts beyond those bounds are reported as truncated rather than silently skipped.",
    ],
    [
      "What is the signed-range SHA-256 digest for?",
      "It fingerprints exactly the bytes that ByteRange selects, letting you prove two copies of a document cover identical signed content. It is not the message digest authenticated inside /Contents, so matching it does not by itself verify the signature.",
    ],
  ],
};

export default seo;
