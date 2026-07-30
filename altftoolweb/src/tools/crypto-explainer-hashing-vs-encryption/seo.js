const seo = {
  intro:
    "This explainer pushes one piece of text through three operations at once — a real SHA-256 hash implemented to FIPS 180-4, a reversible cipher, and RFC 4648 Base64 — so the difference is demonstrated rather than described. Hashing is one-way and keyless: SHA-256 emits exactly 256 bits whatever the input size, so there is nothing left to reverse. It also measures the avalanche effect live, changing a single character and counting how many of the 256 digest bits flip, which for a sound hash lands close to half.",
  useCases: [
    "Settle the argument about whether a leaked password hash can be decrypted.",
    "Show a junior developer why Base64 in a config file is not a security control.",
    "Demonstrate to a class that flipping one letter changes roughly half the digest bits.",
    "Explain why encrypting passwords is worse than hashing them, before a design review makes the wrong call.",
  ],
  benefits: [
    ["Real algorithms, not diagrams", "SHA-256 and Base64 are implemented from the specifications and run in your browser."],
    ["Avalanche measured, not claimed", "The tool counts the exact Hamming distance between two digests after a one-character edit."],
    ["Salt demonstrated separately", "The same input under three salts shows what salt fixes and, just as importantly, what it does not."],
  ],
  faqs: [
    [
      "Can a hash be decrypted back to the original?",
      "No. A hash is not encryption and has no key, so there is no inverse operation. SHA-256 outputs 256 bits regardless of input size, so most of the original information no longer exists in the digest. What hash crackers actually do is hash guesses until one matches.",
    ],
    [
      "What is the difference between hashing and encryption?",
      "Encryption is two-way and needs a key: with the key you get the plaintext back, and that is the point of it. Hashing is one-way and keyless: it produces a fixed-length fingerprint used to check that two things are identical, not to store data you need to read again.",
    ],
    [
      "Is Base64 a form of encryption?",
      "No. Base64 is an encoding defined in RFC 4648 with a published 64-character alphabet and no key at all, so anyone can decode it instantly. It exists to carry binary data through text-only channels, and Base64 output should be treated as plaintext.",
    ],
    [
      "Should I use SHA-256 to store passwords?",
      "No. SHA-256 is deliberately fast, which is exactly wrong for passwords because it lets an attacker test billions of guesses per second on commodity hardware. Use bcrypt, scrypt or Argon2 with a per-user salt and a tuned work factor, and follow current guidance from a source such as OWASP.",
    ],
  ],
};

export default seo;
