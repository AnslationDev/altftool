const seo = {
  intro:
    "The Secret Message Encoder converts text between eight reversible schemes — Caesar shift (C = P + k mod 26), ROT13, Atbash, Vigenere, Base64 per RFC 4648, percent-encoding per RFC 3986, International Morse per ITU-R M.1677-1, and 8-bit binary — and adds genuine AES-256-GCM encryption with a PBKDF2-HMAC-SHA256 key at 600,000 iterations, the OWASP-recommended figure. Everything runs in the browser with nothing uploaded. It is aimed at puzzle makers, teachers demonstrating classical cryptography, and developers who need a quick encode or decode.",
  useCases: [
    "Building a treasure-hunt clue in Caesar or Atbash and decoding the answer to check it",
    "Decoding a Base64 blob pasted out of an API response or a config file",
    "Sending a note that genuinely must stay private, using the AES-256-GCM panel and a shared passphrase",
  ],
  benefits: [
    ["Standards, not approximations", "Base64 matches the RFC 4648 test vectors and Morse follows the ITU letter set."],
    ["Honest about security", "Classical ciphers are labelled as puzzles; only the AES panel claims confidentiality."],
    ["Nothing leaves the browser", "All encoding and the Web Crypto AES work happen locally on your device."],
  ],
  faqs: [
    [
      "Is ROT13 or Base64 actually secure?",
      "No — neither hides anything. ROT13 is a Caesar shift of 13 with no key at all, and Base64 is a printable representation of bytes that any tool can reverse in a keystroke. Use the AES-256-GCM option when the message genuinely needs to stay private.",
    ],
    [
      "How does the Vigenere cipher work?",
      "Each plaintext letter is shifted by the letter of a repeating keyword: C = (P + K) mod 26, where A shifts by 0 and Z by 25. With the keyword LEMON, the classic example ATTACKATDAWN encrypts to LXFOPVEFRNHR. Punctuation and spaces pass through and do not consume key letters.",
    ],
    [
      "How many PBKDF2 iterations should be used for AES encryption?",
      "600,000 for PBKDF2-HMAC-SHA256, which is the current OWASP Password Storage Cheat Sheet recommendation and the figure this tool uses. Each message also gets a fresh 16-byte random salt and a 12-byte IV, the IV length NIST SP 800-38D specifies for GCM.",
    ],
    [
      "What does SOS look like in Morse code?",
      "Three dots, three dashes, three dots — written ... --- ... with single spaces between letters. This tool uses the ITU-R M.1677-1 letter set, separates letters with one space and words with a forward slash, so HI THERE encodes as .... .. / - .... . .-. .",
    ],
  ],
};

export default seo;
