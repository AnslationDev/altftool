const seo = {
  intro:
    "The Voter ID Format Validator checks whether an Indian EPIC number matches the common pattern of three letters followed by seven digits, and can normalize what you paste by stripping spaces and forcing uppercase before it tests. It splits the number into its three-character functional letter block and its seven-digit serial block so you can see exactly where a typo sits. This is a format check only — it confirms nothing about enrolment, identity, constituency or the current status of the record.",
  useCases: [
    "You are collecting voter ID numbers on a form and want to reject obviously malformed entries — a missing digit, an O typed for a zero — before they reach your database.",
    "You have EPIC numbers copied out of a spreadsheet with stray spaces and inconsistent casing, and you need them normalized to a single clean format before import.",
    "Someone reads a voter ID out to you over the phone and you want to check the shape is right — three letters, seven digits — before you go and look it up on the official portal.",
  ],
  benefits: [
    ["Shows you the two blocks separately", "The three-letter functional code and the seven-digit serial are displayed apart, so a wrong-length serial is obvious at a glance."],
    ["Normalizes as it validates", "Spaces are removed and letters uppercased before the pattern test, so a number that is merely untidy is not reported as invalid."],
    ["Clear about its own limits", "A pass is labelled as format-only with official verification still required, so nobody mistakes it for confirmation that a voter record exists."],
  ],
  faqs: [
    [
      "What is the format of an Indian voter ID number?",
      "The common EPIC format is three letters followed by seven digits, for example ABC1234567 — ten characters in total. The first three characters are the Functional Constituency Code and the remaining seven are the serial number.",
    ],
    [
      "Does a valid result mean my voter ID is genuine?",
      "No. It only means the ten characters match the expected letter-and-digit pattern. A fabricated number in the right shape passes this check, so genuineness has to be confirmed through the Election Commission of India's own services.",
    ],
    [
      "Why is my EPIC number reported as invalid?",
      "Most often because it is not exactly three letters plus seven digits — a common cause is a letter O typed in place of a zero in the serial block, or a digit in the first three characters. Turn on normalization first so spaces and lowercase are not the cause.",
    ],
    [
      "Is the number I type sent anywhere?",
      "No. The pattern test runs in your browser and nothing is transmitted or stored. Even so, treat voter ID numbers as personal data and avoid pasting other people's numbers into tools you do not control.",
    ],
  ],
};

export default seo;
