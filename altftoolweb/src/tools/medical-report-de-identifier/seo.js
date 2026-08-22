const seo = {
  title: "Medical Report De-identifier: 9 Categories",
  metaDescription:
    "Replace patient names, MRNs, dates, phones and clinician or facility names with numbered placeholders like [PATIENT_NAME_1], in your browser.",
  steps: [
    "Paste the report under 'Report text', or press 'Choose file' for a TXT, DOCX or text-layer PDF up to 15 MB — 'Load demo' fills in the synthetic sample.",
    "Switch any of the nine identifier categories off, or use 'Select all' / 'Select none', and watch the Anonymized preview rebuild with tokens like [PATIENT_NAME_1].",
    "Use 'Copy text' or 'Download TXT' for the scrubbed report, and 'Download counts JSON' for a counts-only log that carries no source text.",
  ],
  intro:
    "The Medical Report De-identifier finds and replaces labelled identifiers in clinical text across nine categories — patient names, MRN and patient IDs, dates of birth, phone numbers, email addresses, addresses, other dates, clinician names and facility names — swapping each one for a numbered placeholder such as [PATIENT_NAME_1]. The same value always gets the same placeholder, so relationships in the report survive while the identity does not. Text you paste, or a TXT, DOCX or text-layer PDF you load, is processed entirely in your browser; this is a redaction aid, not a certified HIPAA de-identification service.",
  useCases: [
    "You want to share a discharge summary with a colleague for a second opinion and need the patient's name, MRN and contact details out of it before it leaves your machine.",
    "You are assembling teaching cases from real reports and need the same patient referred to consistently throughout a document — every mention of one name becoming the same numbered token rather than a different one each time.",
    "You need to record that a document was scrubbed without recording what was in it, so you export the counts-only report that lists how many identifiers were replaced per category and nothing else.",
  ],
  benefits: [
    ["Consistent pseudonyms, not blanket blackouts", "Repeat mentions of a value collapse to one placeholder using NFKC and case-insensitive matching, so \"Dr. Rao\" and \"dr rao\" become the same token."],
    ["Category-by-category control", "Each of the nine categories can be switched off independently — keep visit dates for a chronology while still removing names and IDs."],
    ["A log that leaks nothing", "The counts-only export is explicitly built without the source text or any detected value, so it is safe to attach to a ticket or audit trail."],
  ],
  faqs: [
    [
      "Which identifiers does it detect?",
      "Nine categories: patient names, MRN/UHID/patient and hospital IDs, dates of birth, phone numbers, email addresses, addresses, other numeric and written dates, clinician names, and facility names. Apart from email addresses and free-standing dates, detection relies on a label followed by a separator — for example `MRN: 123456` or `Attending physician: Dr. Rao` — so an identifier buried in a narrative sentence with no label will not be caught.",
    ],
    [
      "Is this enough for HIPAA compliance?",
      "No. The HIPAA Safe Harbor method requires removing 18 categories of identifier, including items this tool does not attempt such as social security numbers, device serial numbers, biometric identifiers, full-face photographs, vehicle and licence numbers, IP addresses and URLs. Always review the output line by line, and involve your privacy officer or a qualified expert before releasing clinical data.",
    ],
    [
      "What file types can I load, and how large?",
      "Plain TXT, DOCX and PDFs that contain a real text layer, up to 15 MB per file. Scanned PDFs that are only images have no extractable text, so nothing will be detected — there is no OCR step.",
    ],
    [
      "Does my report get uploaded to a server?",
      "No. DOCX extraction, PDF text extraction and the detection pass all run inside your browser tab, and the anonymised result is downloaded locally as a .txt file. The document never leaves your device.",
    ],
  ],
};

export default seo;
