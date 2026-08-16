const seo = {
  title: "Indian Number Plate Check: State, BH, Diplomatic",
  metaDescription:
    "Check an Indian registration number against the state series, BH series, diplomatic and defence formats — with each part parsed and the regex to reuse.",
  steps: [
    "Type a Registration number like MH 12 AB 1234 (spaces, hyphens and the defence arrow are ignored), or switch to 'A list' mode and paste up to 500 lines, one number per line.",
    "Read the Canonical form with the format family, the state or issuer, and every parsed block — state code, RTO office code, letter series and serial — or the valid/invalid count for a batch.",
    "Press Copy result for the verdict, and take the regular expression for any of the four formats from the 'Patterns used' table into your own form validation.",
  ],
  intro:
    "This validator parses an Indian vehicle registration number and tells you whether it is well formed, which family it belongs to, and what each block means. It covers the standard state series (two-letter state code, RTO office code, letter series and four-digit serial), the Bharat BH series introduced by GSR 594(E) in 2021, diplomatic CD, CC and UN plates, and Ministry of Defence plates. The regular expression behind each format is shown so you can drop the same rule into your own form validation.",
  useCases: [
    "Validating a registration field on a booking, insurance or parking form before it is submitted",
    "Cleaning a spreadsheet of registration numbers and finding the rows with a bad state code or a five-digit serial",
    "Checking whether a BH-series number a seller quoted is even a legal shape",
  ],
  benefits: [
    ["Four formats, one check", "Standard, BH, diplomatic and defence plates are all recognised and labelled."],
    ["Explains the failure", "Tells you the state code is unknown or that I and O are not allowed, rather than just rejecting."],
    ["Regex you can reuse", "Every pattern is printed so the same rule can go straight into your own code."],
  ],
  faqs: [
    [
      "What is the format of an Indian number plate?",
      "Two letters for the state or union territory, one or two digits for the RTO office, up to three letters of series, and a four-digit serial — for example MH 12 AB 1234. The serial is padded with leading zeros, so number 7 appears as 0007.",
    ],
    [
      "What does a BH series number look like?",
      "Two digits for the year of first registration, the letters BH, a four-digit number and a one or two letter series — for example 22 BH 1234 AA. The letter block runs from AA to ZZ but leaves out I and O so they are not read as 1 and 0. BH numbers were introduced in 2021 and move with the owner between states without re-registration.",
    ],
    [
      "Why is my valid-looking number rejected?",
      "Most often the state code is not on the official list, the serial has five digits instead of four, or the RTO code has three digits. The tool names the exact reason, and legacy codes such as OR for Odisha and UA for Uttarakhand are accepted but marked as legacy.",
    ],
    [
      "Does a valid format mean the vehicle is registered?",
      "No. This is a syntax check done entirely in your browser with no lookup against any database, so a well-formed number may belong to no vehicle at all. Use the government's Parivahan or mParivahan service to confirm that a registration exists and to see its details.",
    ],
  ],
};

export default seo;
