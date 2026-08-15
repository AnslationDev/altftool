const seo = {
  title: "Cybercrime Evidence Pack Builder: SHA-256",
  metaDescription:
    "Hash evidence copies with SHA-256 in your browser and build a numbered incident timeline into a JSON manifest, plus a counts-only summary.",
  steps: [
    "Fill Short incident title, the Factual narrative box and Timeline — one event per line, as date/time | observed event | optional evidence reference, with a vertical bar or tab separator.",
    "Press Choose copies to add up to 100 evidence files, 25 MB each and 100 MB total; each one is fingerprinted with SHA-256 by the browser's Web Crypto, then press Build evidence manifest.",
    "Download private manifest saves cybercrime-evidence-manifest.json with every filename, media type, size, last-modified date and digest; Download counts-only summary saves cybercrime-evidence-summary.json holding totals alone.",
  ],
  intro:
    "The Cybercrime Evidence Pack Builder turns a scam or fraud incident into a structured JSON manifest: it records a numbered timeline, your factual narrative, and a SHA-256 digest of every evidence copy you add, computed locally with the browser's Web Crypto API. It is for someone who has been targeted online and needs their screenshots, chat exports and payment records organised before they talk to a bank, an employer or the police. Nothing is submitted anywhere — you get a downloadable manifest and a separate counts-only summary you can share when you do not want to reveal the contents.",
  useCases: [
    "You were defrauded on a marketplace and need to hand a bank dispute team a dated sequence of what happened, with each screenshot tied to a specific event",
    "A colleague is being harassed on a work account and you must preserve chat exports now, so you can later show the files you kept have not been edited since",
    "Your insurer or lawyer asks how many items you hold before you disclose them, and you want to send counts only — no filenames, no digests, no incident text",
  ],
  benefits: [
    ["Every file gets a verifiable fingerprint", "SHA-256 is computed over the file's own bytes, so any later change to that copy produces a different digest."],
    ["Timeline and exhibits stay linked", "Each line takes date/time, the observed event and an evidence reference, so the manifest reads as one numbered sequence."],
    ["A shareable version that discloses nothing", "The counts-only summary carries totals alone — no incident text, filenames or hashes — for when you only need to state scope."],
  ],
  faqs: [
    [
      "Does a file hash prove my evidence is genuine?",
      "No. A SHA-256 digest proves only that a file has not changed since you hashed it — recompute the hash later and a single altered byte gives a completely different value. It cannot show who made the file, when the event happened, or whether the content is true, which is why the manifest states those limits explicitly. Preserve the originals untouched and work from copies.",
    ],
    [
      "How many files and events can one pack hold?",
      "Up to 100 evidence files and 250 timeline events. Each file must be 25 MB or smaller with 100 MB across the whole selection, and file content is never embedded in the manifest — only the filename, media type, size, last-modified date, digest and the optional note you type next to that file. Keep that note factual and non-sensitive, since it is included in the downloadable manifest (though never in the counts-only summary).",
    ],
    [
      "How do I format the timeline?",
      "One event per line as date/time | event | optional evidence reference, using either a vertical bar or a tab as the separator. Dates are stored exactly as you type them and no timezone is inferred, so write them in a consistent form such as 2026-07-20 10:00 and note the timezone in the narrative if it matters.",
    ],
    [
      "Will this report the crime for me?",
      "No. It only organises material you already hold; it does not file a report, contact any authority, recover funds or give legal advice. Use the manifest as a preparation aid, then follow your country's official reporting channel and consult a lawyer or law-enforcement officer about what evidence they need and in what form.",
    ],
  ],
};

export default seo;
