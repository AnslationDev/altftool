const seo = {
  title: "AES-256-GCM Text Encryptor with PBKDF2 & SHA Hashes",
  metaDescription:
    "Encrypt text with AES-256-GCM in the browser, keyed by PBKDF2-HMAC-SHA256 at 600,000 rounds with a fresh salt and IV. SHA-1 to SHA-512 too.",
  steps: [
    "Paste into Text to encrypt and set a Password — the entropy estimate under the field flags a weak one.",
    "Press Encrypt: PBKDF2-HMAC-SHA256 runs 600,000 rounds over a fresh 16-byte salt, then AES-256-GCM seals it with a 12-byte IV.",
    "Copy result takes the ALTFT1 payload; the card lists Cipher, Key derivation, Salt, IV and Ciphertext size, and Decrypt reverses it.",
  ],
  intro:
    "This tool encrypts text with AES-256-GCM using a key derived from your password by PBKDF2-HMAC-SHA256 at 600,000 iterations — the count the OWASP Password Storage Cheat Sheet recommends — and it also produces SHA-1, SHA-256, SHA-384 and SHA-512 digests. A fresh 128-bit salt and 96-bit IV are generated for every message, and everything runs in the browser through the Web Crypto API, so no password, key or message ever leaves the page. It is for anyone who needs to put a short secret into an email, a ticket or a chat without trusting the channel.",
  useCases: [
    "Send a short credential or a note through a chat you do not control, sharing the password out of band",
    "Verify a downloaded file's published SHA-256 checksum by hashing a known string and comparing formats",
    "Keep a sensitive paragraph in a plain-text notes file as an encrypted payload rather than as readable text",
  ],
  benefits: [
    ["Authenticated encryption", "AES-GCM detects tampering: an altered payload fails to decrypt instead of returning wrong text."],
    ["Slow key derivation", "600,000 PBKDF2 rounds make a brute-force guess of your password hundreds of thousands of times more expensive."],
    ["Nothing transmitted", "Web Crypto runs locally; there is no request, no key escrow and no recovery path."],
  ],
  faqs: [
    [
      "Is AES-256-GCM secure enough for this?",
      "Yes for the job it is doing. AES-256 in Galois/Counter Mode is an approved NIST authenticated cipher: it both encrypts and authenticates, so a modified ciphertext is rejected rather than decrypted into garbage. The weak link is almost always the password, not the cipher — a 21-character passphrase drawn from letters and symbols carries about 123 bits of entropy, which is where you want to be.",
    ],
    [
      "Why does encrypting the same text twice give different output?",
      "Because a new random 16-byte salt and 12-byte IV are generated each time. Reusing an IV with the same key breaks GCM completely, so fresh randomness per message is mandatory. Both values are stored in the payload in the clear — they are not secrets, they just have to be unique.",
    ],
    [
      "Can I recover my text if I forget the password?",
      "No. The key is derived from the password alone; there is no backup copy, no reset and no server that holds anything. Losing the password means losing the plaintext permanently. Store the password in a password manager before you rely on an encrypted payload.",
    ],
    [
      "What is the difference between hashing and encrypting?",
      "Encryption is reversible with the key; hashing is not reversible at all. SHA-256 turns any input into a fixed 256-bit fingerprint used for integrity checks and comparisons. Note that SHA-1 has had a practical collision attack since the SHAttered research in 2017, so use it only to match a legacy checksum, never for security.",
    ],
  ],
};

export default seo;
