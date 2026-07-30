const seo = {
  intro:
    "Indian Mobile Number Validator checks whether a phone number is a syntactically valid Indian mobile number: exactly 10 national digits starting with 6, 7, 8 or 9, normalised to E.164 as +91XXXXXXXXXX. It strips spaces, dashes and brackets, drops a leading 91 country code or a leading trunk 0, then reports the cleaned number, its length and whether the prefix passes. It is a format check only — it says nothing about who owns the number or whether the SIM is active.",
  useCases: [
    "Cleaning a signup or lead list before importing it into a CRM, where entries arrive as +91 98765 43210, 098765 43210 and 9876543210 and all need to become the same E.164 string.",
    "Writing a registration form and needing to confirm the exact rule to enforce before you send an OTP — 10 digits with a 6–9 first digit — so genuine numbers are not rejected and landlines are.",
    "Someone gave you a number over the phone and it looks one digit short; paste it in to see the length count and whether the prefix is in the mobile range at all.",
  ],
  benefits: [
    ["Normalises before it judges", "A leading 91 on a 12-digit string and a leading 0 on an 11-digit string are both stripped, so the same number passes in whichever format it was typed."],
    ["Shows the E.164 form you can store", "Output includes the +91-prefixed international form, which is what SMS gateways and most APIs expect rather than the raw local digits."],
    ["Strict prefix rule is optional", "Turn the 6–9 requirement off when you are checking legacy or non-mobile numbering and only want the 10-digit length check."],
  ],
  faqs: [
    [
      "How many digits is an Indian mobile number?",
      "Ten digits nationally, or twelve with the 91 country code. Written in full international form it is +91 followed by the 10 national digits, for example +919876543210.",
    ],
    [
      "Which digits can an Indian mobile number start with?",
      "Mobile numbers in India begin with 6, 7, 8 or 9. The 6 series was opened up as the earlier 9, 8 and 7 series filled, and any 10-digit number starting with 0 to 5 is not a mobile number.",
    ],
    [
      "Should I write the number with a leading 0 or with +91?",
      "Use +91 for storage and for anything that crosses a network — the leading 0 is a domestic trunk prefix and is dropped in international format. This tool removes a leading 0 from an 11-digit entry and a leading 91 from a 12-digit entry before validating the remaining 10 digits.",
    ],
    [
      "Can this tell me if the number is real or who it belongs to?",
      "No. It only checks the shape of the number — length, country code handling and the 6–9 prefix rule. Whether a SIM is active, which operator holds it after portability, and who the subscriber is are all things only the operator can confirm.",
    ],
  ],
};

export default seo;
