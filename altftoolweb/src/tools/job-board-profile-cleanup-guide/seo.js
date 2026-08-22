const seo = {
  title: "Resume Privacy Scanner: PAN, Aadhaar, Salary",
  metaDescription:
    "Paste résumé text to flag Aadhaar, PAN, passport, DOB and salary lines, score exposure and copy a redacted version. Nothing leaves your browser.",
  steps: [
    "Paste up to 50,000 characters of résumé text into the Paste résumé text box and set how many job portals hold a copy.",
    "Read the exposure score and the flagged categories — Aadhaar verified by Verhoeff checksum, PAN, passport, phone, date of birth, salary lines.",
    "Press Copy redacted text to take the rewritten résumé with every flagged field swapped for a plain placeholder.",
  ],
  intro:
    "The Job Board Profile Cleanup Guide scans the plain text of a résumé for the personal data that a public job portal does not need — Aadhaar, PAN and passport numbers, phone numbers, email addresses, full postal addresses, date of birth, marital status and other protected characteristics, salary history, photo references and referee contact details. Each category is scored by how abusable it is if a recruiter account or a data breach exposes it, and the tool builds a redacted copy of the text with every flagged field replaced so you can compare before and after without retyping anything. The scan and the redaction both run in your browser tab; nothing you paste is uploaded.",
  useCases: [
    "You are about to re-upload an old résumé to a new job portal and want to check what is in it before it goes live.",
    "You listed the same résumé on several job boards years ago and want a quick way to see how much personal data is currently searchable.",
    "A recruiter's request for your CV made you look at it again and you noticed a date of birth or a home address you no longer want public.",
    "You are helping a friend or family member tidy up a résumé that still has a passport number or expected-salary line from an older application cycle.",
  ],
  benefits: [
    [
      "Built for résumé-specific fields",
      "Detectors cover Aadhaar (with a real Verhoeff checksum, not just 12 digits), PAN, Indian passport numbers, phone, email, PIN-coded addresses, date of birth, protected characteristics, salary lines, photo references and referee contacts — the exact fields a job portal profile exposes.",
    ],
    [
      "A weighted score, not a flat count",
      "A résumé is scored on the categories it contains, not on how many times each one repeats, so listing a phone number three times is not penalised three times over.",
    ],
    [
      "A ready-to-use redacted copy",
      "Flagged text is replaced with a plain placeholder in a second box you can copy straight out, so cleanup is a paste-and-review step instead of manual line-by-line editing.",
    ],
  ],
  faqs: [
    [
      "What counts as an Aadhaar number here, and why not just any 12 digits?",
      "The scanner checks the last digit against the real Verhoeff checksum UIDAI uses for Aadhaar, so an arbitrary 12-digit number in a résumé — a phone number written without spaces, for instance — is not mistakenly flagged, while a genuine Aadhaar number is.",
    ],
    [
      "Why does date of birth matter on a résumé at all?",
      "Employers in many places are not supposed to ask for date of birth before an offer because it invites age discrimination, and it is also a standard answer used in identity-verification questions. Neither reason requires it to sit in a document recruiters can download.",
    ],
    [
      "Does redacting the file remove my data from the job portal?",
      "No — redacting the text only fixes the document you copy back out of this tool. The portal profile has its own structured fields for phone, email and address that recruiter search matches independently, and older uploaded versions of your résumé usually stay on the account until you delete them, which is why the checklist below covers the portal settings as well as the file.",
    ],
    [
      "Is anything I paste here sent anywhere?",
      "No. The scan and the redaction both run in your browser tab using pattern matching, with no upload, network request or storage involved. Closing or refreshing the tab clears everything.",
    ],
  ],
};

export default seo;
