const seo = {
  title: "Indian Document Regex: PAN, GSTIN, IFSC, Aadhaar",
  metaDescription:
    "Structure-checked regex for PAN, GSTIN, IFSC, UPI, PIN codes, vehicle numbers and Aadhaar, with a live tester and notes on what regex cannot verify.",
  steps: [
    "Choose a 'Document type' - PAN, GSTIN, IFSC, UPI ID / VPA, PIN code, vehicle number or Aadhaar - to load its structure-checked pattern.",
    "Type a sample value in 'Test a value' (avoid real identity numbers) for an instant 'Valid format' or 'Invalid format' verdict against that pattern.",
    "Press 'Copy regex' to copy the /pattern/flags string, and read 'What this pattern cannot check' - checksums and issuance need the issuer's verification service.",
  ],
  intro:
    "This library provides structure-checked regular expressions for the identifiers Indian applications validate every day: PAN (with the 4th-character holder-status rule), 15-character GSTIN with the 01–38 state-code range, RBI's 11-character IFSC, NPCI UPI IDs, 6-digit India Post PIN codes, standard and Bharat-series vehicle registrations, and the 12-digit Aadhaar shape. Every pattern has a live tester and states exactly what a regex cannot verify — checksums, issuance and active status.",
  useCases: [
    "A fintech onboarding flow validating PAN and IFSC format client-side before calling paid verification APIs",
    "A GST billing tool checking that a customer's GSTIN has a valid state code and the mandatory Z in position 14 before saving",
    "A logistics app validating delivery PIN codes and vehicle registration numbers at data entry",
  ],
  benefits: [
    ["Deeper than the usual patterns", "PAN's 4th letter is restricted to the 10 valid holder types and GSTIN's state code to 01–38 — most copied patterns skip both."],
    ["Checksum honesty", "PAN, GSTIN and Aadhaar carry check characters no regex can compute; every pattern says so instead of implying verification."],
    ["Privacy-aware guidance", "Notes on masking and lawful collection accompany the Aadhaar pattern rather than treating it as just another string."],
  ],
  faqs: [
    [
      "What is the regex for PAN card validation?",
      "The common pattern is ^[A-Z]{5}[0-9]{4}[A-Z]$, but the stricter ^[A-Z]{3}[PCHFATBLJG][A-Z][0-9]{4}[A-Z]$ also enforces that the 4th character is a valid holder-status letter — P for individuals, C for companies, H for HUF, F for firms and so on. Neither can check the final character, which is a check letter, nor whether the PAN is actually issued.",
    ],
    [
      "How do I validate a GSTIN with regex?",
      "A GSTIN is 15 characters: a 2-digit state code (01–38), the holder's 10-character PAN, an entity code of 1–9 or A–Z, the letter Z in position 14, and a checksum character — ^(0[1-9]|[1-2][0-9]|3[0-8])[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$ encodes all of that except the checksum value. Confirm active registration on the GST portal, since format-valid GSTINs can be cancelled or fake.",
    ],
    [
      "What is the format of an IFSC code?",
      "11 characters defined by RBI: a 4-letter bank code, the digit 0 reserved in the 5th position, and a 6-character alphanumeric branch code — regex ^[A-Z]{4}0[A-Z0-9]{6}$. For payments, still resolve the code against the RBI/NPCI branch directory because the regex cannot know whether the branch exists.",
    ],
    [
      "Can regex verify an Aadhaar number?",
      "No — regex can only confirm the shape: 12 digits not starting with 0 or 1, optionally grouped 4-4-4, per ^[2-9][0-9]{3}[ -]?[0-9]{4}[ -]?[0-9]{4}$. The last digit is a Verhoeff checksum and real verification requires UIDAI's authentication services; also note Aadhaar is sensitive personal data that should only be collected with a lawful basis and stored masked.",
    ],
  ],
};

export default seo;
