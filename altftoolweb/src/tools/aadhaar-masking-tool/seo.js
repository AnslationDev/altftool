const seo = {
  intro:
    "This tool masks Aadhaar numbers and checks their structure locally: it strips formatting to 12 digits, runs the Verhoeff checksum that Aadhaar numbers are built on, and rewrites each number with only the digits you choose left visible. Four masking modes are available — full mask, last 2, last 4 (the convention UIDAI's own masked Aadhaar uses), or first and last 4 — with a mask character of your choosing. Paste a whole list separated by newlines, commas, semicolons, pipes or tabs and export the masked results as CSV; the numbers are processed in the page and never sent anywhere.",
  useCases: [
    "You have to attach an ID copy to a form and want the number reduced to XXXX XXXX 1234 before it goes into a document that will be forwarded on",
    "An onboarding spreadsheet arrived with full Aadhaar numbers in a column and you need a masked version, plus a list of which rows are malformed, before it goes any further",
    "A support agent needs to confirm the last four digits a customer read out actually belong to a well-formed number without storing the whole thing",
  ],
  benefits: [
    ["Real Verhoeff validation, not a digit count", "Every 12-digit entry is run through the Verhoeff dihedral-group checksum, so transposed or mistyped digits are caught, not just wrong-length input."],
    ["Four masking levels for different documents", "Full mask, last 2, last 4 or first-and-last-4, so you can match whatever the receiving form actually requires."],
    ["Bulk in, CSV out", "A pasted list is split on newlines, commas, semicolons, pipes or tabs, and exports with the masked value, format status, checksum result and the specific issue for each row."],
  ],
  faqs: [
    [
      "How many digits of an Aadhaar number can be shown?",
      "The standard masked form leaves only the last four digits visible and hides the first eight, which is what UIDAI's own masked Aadhaar download produces. This tool defaults to that pattern and also offers last-2 and full masking when even four digits is more than the recipient needs.",
    ],
    [
      "What makes a number fail the check?",
      "Four things are flagged: fewer or more than 12 digits, any letters in the input, a first digit of 0 or 1 (Aadhaar numbers do not begin with either), and a failed Verhoeff checksum. All twelve digits being identical is flagged separately as an unrealistic pattern.",
    ],
    [
      "Does this confirm an Aadhaar number is genuine?",
      "No. It only confirms the number is well-formed and its checksum is internally consistent. A number can pass every check here and still not be issued to anyone — real verification requires UIDAI's own authentication or offline eKYC channels, not arithmetic on the digits.",
    ],
    [
      "Is it safe to paste real Aadhaar numbers here?",
      "The numbers are read, masked and exported entirely in your browser — there is no upload, no server call and no storage. Even so, treat Aadhaar data as sensitive: close the tab when you are done, and remember that under Indian rules only masked or authorised forms of the number should be shared or retained by most organisations.",
    ],
  ],
};

export default seo;
