const seo = {
  title: "MICR Code Decoder: City, Bank & Branch Codes",
  metaDescription:
    "Paste a cheque's 9-digit MICR number and see the city (first 3), bank (middle 3) and branch (last 3) codes, with spaces stripped automatically.",
  steps: [
    "Paste the number from the cheque's MICR band into the \"9-digit MICR code\" field, or try the \"Mumbai example\" preset (400002001).",
    "Leave the \"Normalize pasted code\" toggle on so spaces and non-digit characters are stripped before the exactly-9-digits check runs.",
    "Read the \"City code\", \"Bank code\" and \"Branch code\" rows; anything else reports \"Invalid MICR structure\".",
  ],
  intro:
    "The MICR Cheque Code Decoder splits the 9-digit MICR number printed along the bottom of an Indian cheque into its three standard parts: the first 3 digits are the city code, the next 3 the bank code and the last 3 the branch code. Paste the number with or without spaces and it normalises the input, checks that exactly 9 digits remain, and shows each field separately. It is for anyone filling a form, matching a cheque to a branch, or simply working out what the numbers under the signature line mean.",
  useCases: [
    "A bank form asks for the MICR code and the city, bank and branch parts separately, and you only have the cheque leaf in front of you.",
    "You are reconciling several cheques and want to confirm they were all drawn on the same branch by comparing the last three digits rather than the whole number.",
    "You typed a MICR code into a mandate form and it was rejected, so you check whether the number you copied is actually 9 digits once spaces are stripped.",
  ],
  benefits: [
    ["Field split, not just validation", "It labels which digits are city, bank and branch instead of only telling you whether the code looks right."],
    ["Handles pasted formatting", "The normalise toggle strips spaces and any non-digit characters, so a code copied off a scanned cheque still parses."],
    ["Structure check up front", "Anything that is not exactly 9 digits after normalisation is reported as an invalid structure before any field is decoded."],
  ],
  faqs: [
    [
      "What do the 9 digits of a MICR code mean?",
      "The first 3 digits are the city code, which matches the first three digits of the city's PIN code; digits 4 to 6 are the bank code; digits 7 to 9 are the branch code. So 400002001 reads as Mumbai (400), bank 002, branch 001.",
    ],
    [
      "Where is the MICR code printed on a cheque?",
      "In the MICR band at the very bottom of the leaf, printed in magnetic ink. Reading left to right the band carries the cheque number, then the 9-digit MICR code, then the account number and the transaction code — the MICR code is the second block.",
    ],
    [
      "What is the difference between MICR code and IFSC?",
      "MICR is a 9-digit numeric code used for clearing physical cheques; IFSC is an 11-character alphanumeric code used to route electronic transfers such as NEFT, RTGS and IMPS. Both identify a specific branch, but they are issued and formatted differently and are not interchangeable on forms.",
    ],
    [
      "Does a valid structure mean the cheque or account is genuine?",
      "No. This only confirms that the number has the standard 3+3+3 shape and splits it — it does not check the code against any bank directory, and it says nothing about whether a cheque, account or branch exists. Confirm branch details with the issuing bank before acting on them.",
    ],
  ],
};

export default seo;
