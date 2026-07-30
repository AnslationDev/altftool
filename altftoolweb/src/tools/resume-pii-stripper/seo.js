const seo = {
  intro:
    "The Resume PII Stripper redacts a resume for blind hiring by detecting eight categories of personal data — names, emails, phone numbers, addresses, profile links, social handles, dates of birth and identity numbers — and either deleting them or replacing them with stable placeholders such as [NAME_1] and [EMAIL_2]. The same value always maps to the same token, so a candidate stays traceable through the document without ever being identifiable. It is for recruiters and hiring panels who need anonymised CVs, and for candidates who want to share a work history without handing over contact details.",
  useCases: [
    "You run first-round screening blind and need every incoming CV stripped of name, email, phone and LinkedIn URL before it reaches the panel, while still being able to tell which mention refers to the same person.",
    "A candidate has pasted a passport or national ID number into their resume and you need it gone before the file is stored or forwarded.",
    "You want to post an anonymised sample CV in a job-search community and need the header name, address line and portfolio links removed without hand-editing the text.",
  ],
  benefits: [
    ["Consistent placeholders, not blanket blackouts", "Each distinct value gets a numbered token like [PHONE_1] that is reused everywhere it appears, so the redacted resume still reads coherently."],
    ["Catches the header name, not just labelled fields", "Beyond patterns like \"Name:\", it scans the first eight non-empty lines for a 2-to-4-word capitalised line and skips section headings such as Summary, Experience or Skills."],
    ["Audit report contains no PII", "The exportable report is counts-only: detections per category and how many distinct values, with the resume text and the detected values deliberately left out."],
  ],
  faqs: [
    [
      "What personal information does it remove from a resume?",
      "Eight categories: names, email addresses, phone numbers, postal addresses, profile and portfolio URLs, @ social handles, dates of birth, and identity or candidate identifiers such as passport, employee ID and national ID numbers. Each category can be toggled off if you want to keep it.",
    ],
    [
      "What is the difference between placeholder mode and remove mode?",
      "Placeholder mode substitutes a numbered token — [NAME_1], [EMAIL_1], [URL_2] — and reuses that token for every occurrence of the same value, so the document stays readable and internally consistent. Remove mode deletes the text outright and then tidies up trailing punctuation, empty labels and runs of three or more blank lines.",
    ],
    [
      "How does it decide something is a phone number?",
      "A candidate number must contain 10 to 15 digits, must not be all the same repeated digit, and must either start with + , contain separators like spaces, dots, dashes or brackets, or be a 10-digit number starting 6 to 9. That keeps ordinary numbers such as years, salaries and metrics from being redacted.",
    ],
    [
      "Is automated redaction safe enough to rely on?",
      "No automated detector is complete — an unusual name format, an address with no street keyword, or an identifier written in an unexpected pattern can slip through. Always read the redacted output before sharing it, and treat the detection summary as a checklist rather than a guarantee.",
    ],
  ],
};

export default seo;
