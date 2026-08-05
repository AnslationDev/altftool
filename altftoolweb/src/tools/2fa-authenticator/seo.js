const seo = {
  intro:
    "This is a browser-based TOTP authenticator that turns a Base32 secret into the same six-digit code Google Authenticator or Authy would show, using the RFC 6238 time-step algorithm over HMAC and RFC 4226 dynamic truncation. Paste a secret or an otpauth:// URI and it derives the counter from the current 30-second window, signs it with HMAC-SHA1, SHA-256 or SHA-512 via the Web Crypto API, and shows the code with a live countdown. Secrets you choose to keep are stored as AES-256-GCM ciphertext in IndexedDB, never in plaintext and never sent anywhere.",
  useCases: [
    "You are setting up 2FA on a laptop and the QR code is on the same screen — paste the otpauth:// URI or the secret shown under it and get the code without reaching for your phone",
    "Your phone is lost or wiped and you still have the backup secret written down, so you need a working code to get back into the account and re-enrol a device",
    "You are building a login flow and want to check that your server's TOTP validation accepts codes generated with 8 digits, a 60-second period or SHA-256 instead of the defaults",
  ],
  benefits: [
    ["Full RFC 6238 parameter set", "Switch between SHA1, SHA256 and SHA512, 6 or 8 digits, and 15, 30, 45 or 60-second periods."],
    ["Encrypted vault, not plaintext storage", "Saved secrets are AES-256-GCM encrypted behind either a non-extractable device key or a PBKDF2-SHA256 passphrase key at 600,000 iterations."],
    ["Reads otpauth:// URIs directly", "Paste the URI behind a setup QR code and the issuer, account label, algorithm, digit count and period are filled in for you."],
  ],
  faqs: [
    [
      "Why does my code keep getting rejected?",
      "Nine times out of ten the clock is off. TOTP divides Unix time by the period — 30 seconds by default — so a device more than about 30 seconds out of sync produces a code for the wrong time step. Check that your system clock is set to network time, and confirm the algorithm, digit count and period match what the service issued.",
    ],
    [
      "Can I use this as my only authenticator app?",
      "You can, but keep the original secret or the service's recovery codes somewhere else as well. Vault data lives in this browser profile's IndexedDB, so clearing site data, using a different browser or losing the passphrase means the encrypted secrets are gone with no server-side copy to restore from.",
    ],
    [
      "Is it safe to paste my 2FA secret into a web page?",
      "Here the secret stays in the page: code generation runs through the browser's Web Crypto API and nothing is transmitted, logged or placed in the URL. That said, the general rule still applies — only paste a secret into a page you trust and have loaded over HTTPS, because any page you paste a TOTP seed into can generate codes forever.",
    ],
    [
      "What is the difference between TOTP and HOTP?",
      "The counter. HOTP (RFC 4226) increments a counter each time you request a code, while TOTP (RFC 6238) computes the counter from the clock as floor(unix_time / period), which is why the code rotates on its own every 30 seconds. Both then run the same HMAC and dynamic-truncation step to produce the digits.",
    ],
  ],
  steps: [
    "On the Enter Secret Key tab, paste your seed into the Secret Key (Base32) field — the hint under it reads Format: 16–32 character Base32 key (letters A–Z, digits 2–7), and the eye icon reveals what you typed. Or switch to the Scan QR Code tab and press Upload QR code image to pick any image file: it is decoded on your device and an otpauth:// URI fills in the secret, the Account Name and the algorithm, digits and period for you.",
    "Optionally open Advanced Options to set Algorithm, Digits and Period, then click Generate Code. The code appears under Your Authentication Code with a ring counting down the Seconds remaining in the current window; an unusable seed shows Enter a valid Base32 secret key (letters A-Z and digits 2-7). in place of the digits.",
    "Press Copy Code — it reads Copied! for a moment, and the clipboard is overwritten again 30 seconds later. The + button beside Saved Accounts stores the secret in the encrypted vault and confirms with Account saved & encrypted, clearing the entered secret; every code generated is also listed with its timestamp under Recent Codes.",
  ],
};

export default seo;
