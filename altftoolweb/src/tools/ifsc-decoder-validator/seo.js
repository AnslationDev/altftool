const seo = {
  title: "IFSC Code Validator: Check Format, Bank",
  metaDescription:
    "Tests an IFSC against the RBI pattern — 4 letters, a 0, then 6 alphanumerics — then splits bank prefix from branch code. Catches O-for-zero typos.",
  steps: [
    "Type or paste the code into the 'IFSC code' field, or load the 'HDFC example' or 'SBI example' preset.",
    "Leave 'Normalize input' on so spaces are removed and the code is upper-cased before the 4 letters + 0 + 6 alphanumerics test runs.",
    "The result reads 'Structurally valid IFSC' or 'Invalid IFSC structure', with rows for Normalized, Bank prefix, Bank and Branch identifier.",
  ],
  intro:
    "The IFSC Decoder & Validator checks an Indian Financial System Code against the RBI's 11-character structure — four letters for the bank, a reserved 0 in the fifth position, then six letters or digits for the branch — and splits out the bank prefix and branch identifier. It normalises what you paste by stripping spaces and upper-casing, then names the bank for 14 common prefixes such as SBIN, HDFC, ICIC and UTIB. Anyone typing an IFSC into a NEFT, RTGS or IMPS form can catch a malformed code before the transfer is attempted.",
  useCases: [
    "You are adding a payee for a salary transfer and the IFSC on the cancelled cheque is handwritten, so you want to confirm the character pattern is even possible before saving the beneficiary.",
    "A finance assistant is cleaning a vendor master sheet and needs to spot the rows where someone typed the letter O instead of the zero that must sit in position five.",
    "A developer is writing form validation for a payments screen and wants to see the exact regex shape a real IFSC has to match, with the bank and branch parts separated.",
  ],
  benefits: [
    [
      "Checks the actual RBI structure",
      "Applies the 4 letters + 0 + 6 alphanumeric rule rather than a plain length check, so O-for-zero and short codes are caught.",
    ],
    [
      "Splits bank prefix from branch identifier",
      "Shows the first four characters and the trailing six separately, which is what you need when comparing two branches of the same bank.",
    ],
    [
      "Says when it does not know",
      "Prefixes outside its 14-bank convenience list are reported as unknown instead of being guessed at, pointing you to the RBI or the bank.",
    ],
  ],
  faqs: [
    [
      "What is the correct format of an IFSC code?",
      "Exactly 11 characters: the first four are letters identifying the bank, the fifth is always 0 (reserved for future use), and the last six are letters or digits identifying the branch. HDFC0001234 and SBIN0000456 both follow that pattern.",
    ],
    [
      "Why does my IFSC show as invalid?",
      "Most often because the fifth character is the letter O rather than the digit 0, or because the code is not 11 characters long. Spaces and lower-case letters are handled for you when normalisation is on, so anything still failing is a genuine structural problem with the code.",
    ],
    [
      "Does a structurally valid IFSC mean the branch exists?",
      "No. Passing this check only proves the code has the right shape; it cannot confirm the branch is real, open, or the one you intend to pay. Branches merge and close, so verify the active code against the RBI list or the bank's own site before sending money.",
    ],
    [
      "Which bank does an IFSC prefix belong to?",
      "The first four letters are the bank identifier — SBIN is State Bank of India, HDFC is HDFC Bank, ICIC is ICICI Bank, UTIB is Axis Bank, PUNB is Punjab National Bank, BARB is Bank of Baroda. This tool recognises 14 such prefixes and tells you plainly when a prefix is not on that list.",
    ],
  ],
};

export default seo;
