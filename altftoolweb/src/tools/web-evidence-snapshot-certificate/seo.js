const seo = {
  title: "Screenshot Hash Certificate: SHA-256 + Source URL",
  metaDescription:
    "Hash a PNG, JPEG or WebP screenshot up to 25 MB locally and bind the digest to the URL, title and time in a canonical JSON manifest. Not notarisation.",
  steps: [
    "Choose a local screenshot — PNG, JPEG or WebP up to 25 MB, checked by its file signature rather than its extension.",
    "Add the source URL, page title (max 500 characters) and observation time, then press \"Create certificate\" to hash the bytes and the canonical JSON.",
    "Use \"Copy digest\", \"Copy manifest\" or \"Download JSON\" to save web-snapshot-metadata-certificate.json and keep it beside the unmodified image.",
  ],
  intro:
    "Web Evidence Snapshot Certificate takes a screenshot you already captured, computes its SHA-256 digest with the browser's Web Crypto API, and wraps that digest together with the source URL, page title, observation time and your notes into a canonical JSON manifest that is itself hashed. The result is a self-recorded record that ties a specific set of image bytes to what you say you saw and when — useful for anyone keeping a chain of custody over screenshots, such as a moderation log, a defamation file, or an internal incident record. It does not visit the URL, capture the page, or contact a timestamping authority, and it is not notarisation.",
  useCases: [
    "You screenshot a post that you expect to be deleted, and you want a fixed digest of that exact file recorded alongside the URL and the time you saw it, before anything gets re-saved or edited",
    "A compliance team keeps a folder of vendor pricing-page captures and needs each one accompanied by a manifest that proves the stored image has not been swapped since it was logged",
    "You are handing screenshots to a lawyer and want to demonstrate that the copy they received is byte-identical to the one you filed on the day of capture",
  ],
  benefits: [
    [
      "The manifest is hashed too, not just the image",
      "The payload is serialised as canonical JSON with sorted keys and digested with SHA-256, so altering any recorded field — URL, title, time, notes — changes the manifest digest.",
    ],
    [
      "Credentials are refused rather than recorded",
      "URLs carrying fragments, embedded usernames or passwords, or query keys matching token, code, session, signature, secret and similar patterns are rejected outright, so a session URL cannot be captured into evidence by accident.",
    ],
    [
      "Its own limitations ship inside the file",
      "Every manifest carries an explicit limitations list stating that the digest identifies bytes only, that the metadata is user-entered and unverified, and that nothing was notarised or independently timestamped.",
    ],
  ],
  faqs: [
    [
      "Does this prove the screenshot is genuine?",
      "No. SHA-256 identifies the exact bytes of the file you uploaded — it proves the image has not changed since hashing, not who made it, whether it depicts a real page, or when it was captured. The URL, title, time and notes are values you typed and nothing verifies them, so the manifest evidences integrity, not authenticity.",
    ],
    [
      "What goes into the manifest?",
      "The screenshot's filename, media type, size in bytes and 64-character SHA-256 digest; the source URL, page title, your declared observation time and its UTC equivalent; your notes; counts; a limitations list; and an integrity block holding the SHA-256 of the canonical JSON of everything else. The image itself is never embedded — the manifest is metadata only, so you must keep the original file alongside it.",
    ],
    [
      "What files and formats does it accept?",
      "PNG, JPEG or WebP screenshots up to 25 MB, detected from the file's magic bytes rather than its extension. Page titles are capped at 500 characters, notes at 5,000, and the URL at 2,048 characters, HTTP or HTTPS only.",
    ],
    [
      "Will a court accept this as evidence?",
      "That is not something any tool can promise — admissibility depends on the jurisdiction, the rules of evidence, and how the material was collected and stored, and the manifest explicitly states it is not notarisation, authentication, or proof of capture time. This is general information rather than legal advice; if the material matters to a case, involve a lawyer and consider a qualified digital forensics service or a trusted timestamping authority.",
    ],
  ],
};

export default seo;
