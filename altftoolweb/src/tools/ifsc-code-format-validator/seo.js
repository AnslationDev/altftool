const seo = {
  title: "IFSC Code Format Validator: 11-Character RBI Structure",
  metaDescription:
    "Checks all 11 characters — four bank letters, the reserved 0, six branch characters — in your browser, and suggests a fix for the letter-O typo.",
  steps: [
    "Type or paste the code into the 'IFSC code' box — spaces and hyphens are ignored and lowercase is upper-cased.",
    "For a list, press Show under 'Check a list of codes' and paste one IFSC per line.",
    "Read the Valid format or Invalid format verdict and the 'Character by character' table, then click the suggested code to correct a typo.",
  ],
  intro:
    "An IFSC is an eleven-character code laid down by the Reserve Bank of India: four letters identifying the bank, the digit zero in the fifth position reserved for future use, and six alphanumeric characters identifying the branch. This validator checks that structure character by character in the browser without any network call, flags the two typos that cause most rejections — the letter O typed for the reserved zero, and a zero typed inside the bank code — and suggests the corrected code. A batch mode checks a whole list at once.",
  useCases: [
    "A developer validating an IFSC field in a payments form before the request reaches the bank API.",
    "An accounts team cleaning a vendor master where some codes were typed from scanned cheques.",
    "Someone about to make an NEFT transfer who wants to be sure the code was copied correctly.",
  ],
  benefits: [
    ["Runs entirely offline", "Nothing is sent to a server, so bank details in a vendor list never leave the browser."],
    ["Explains each failure", "The output names the position that is wrong and why, rather than just returning false."],
    ["Fixes the classic typos", "Letter O in the reserved position and zero inside the bank code are detected and a corrected code is offered."],
  ],
  faqs: [
    [
      "What is the correct format of an IFSC code?",
      "Eleven characters: four letters for the bank, the digit 0 in the fifth position, and six alphanumeric characters for the branch. The regular expression is ^[A-Z]{4}0[A-Z0-9]{6}$ — for example HDFC0000123, where HDFC is the bank, 0 is the reserved character and 000123 is the branch.",
    ],
    [
      "Is the fifth character of an IFSC a zero or the letter O?",
      "Always the digit zero. The RBI reserved that position for future use and fixed it at 0, so any code with the letter O there is invalid. It is the single most common IFSC typing error, particularly when a code is read off a printed cheque or a scanned document.",
    ],
    [
      "Can this tool tell me which branch an IFSC belongs to?",
      "No. It validates structure only and does not look the code up. A code such as ZZZZ0ABC123 is structurally perfect but belongs to no bank, so always confirm the branch against the RBI IFSC directory, the bank's own website or your cheque leaf before sending money.",
    ],
    [
      "What is the difference between IFSC and MICR code?",
      "IFSC is the eleven-character alphanumeric code used to route NEFT, RTGS and IMPS transfers electronically. MICR is a nine-digit numeric code printed in magnetic ink at the foot of a cheque — the first three digits are the city, the next three the bank and the last three the branch — and it is used for physical cheque clearing.",
    ],
  ],
};

export default seo;
