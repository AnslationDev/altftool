const seo = {
  intro:
    "The Driving Licence Number Decoder splits an Indian driving licence number into its four parts — a two-letter state code, a two-digit RTO code, a four-digit issue-year field and a seven-digit serial — and names the state the code belongs to. Enter DL-0420110012345 and it returns Delhi, RTO 04, year field 2011 and serial 0012345, after stripping hyphens and spaces if you leave normalisation on. It is for anyone checking whether a licence number they have been given is even structurally plausible before they act on it.",
  useCases: [
    "You are filling in a form that rejects your licence number and want to see whether the 15 characters actually parse or whether a digit is missing.",
    "An HR or fleet team is validating driver records in a spreadsheet and needs to know which entries do not match the standard state-RTO-year-serial layout at all.",
    "Someone sent you a licence number over chat with random spacing and you want it normalised into one clean uppercase string before you copy it anywhere.",
  ],
  benefits: [
    [
      "Shows each field separately",
      "State, RTO code, year field and serial are broken out into their own rows, so you can see exactly which segment is malformed rather than being told the whole number is wrong.",
    ],
    [
      "Says when the format is not recognised",
      "Numbers that do not fit the two-letter, two-digit, four-digit, seven-digit pattern are reported as unrecognised instead of being force-fitted into fields.",
    ],
    [
      "Normalisation is explicit",
      "Hyphens and spaces are stripped and letters uppercased only when you leave the toggle on, so you can also test the raw string exactly as it was written.",
    ],
  ],
  faqs: [
    [
      "What does an Indian driving licence number mean?",
      "The common format is 15 characters: two letters for the state, two digits for the issuing RTO, four digits for the year, and a seven-digit serial. In DL0420110012345 that reads as Delhi, RTO 04, year 2011, serial 0012345.",
    ],
    [
      "Why does my licence number not decode?",
      "Older licences and several state-specific formats do not follow the state-RTO-year-serial layout, so a valid licence can still be reported as unrecognised here. Check the number against the RTO or the Parivahan Sarathi portal rather than assuming the licence is invalid.",
    ],
    [
      "How long is an Indian driving licence valid?",
      "A licence for non-transport vehicles is generally valid for 20 years from issue or until the holder turns 50, whichever comes first, and is then renewed in five-year terms. A learner's licence is valid for six months. Confirm the current position and any state variation with your RTO.",
    ],
    [
      "Does this confirm the licence is genuine?",
      "No. It only checks the structure of the number and identifies the state code; it does not verify that the licence exists, is currently valid, or belongs to the person who gave it to you. For that, use the official government verification service.",
    ],
  ],
};

export default seo;
