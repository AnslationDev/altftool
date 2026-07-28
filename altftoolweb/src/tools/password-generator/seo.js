const seo = {
  title: "Password Generator — Free Strong Random Passwords",
  h1: "Free Password Generator",
  metaDescription:
    "Free password generator built on the browser's Web Crypto CSPRNG. Set length 8-64, pick character sets, generate up to 50 at once. Nothing leaves your tab.",
  intro:
    "This password generator draws every character index from crypto.getRandomValues(), the Web Crypto API's cryptographically secure random source — not Math.random() — and applies rejection sampling, discarding any 32-bit draw that falls in the biased tail so no character in the alphabet is favoured over another. You choose a length from 8 to 64 and toggle four sets: uppercase, lowercase, digits, and 26 symbols (!@#$%^&*()_+-=[]{}|;:,.<>?). With ambiguous characters excluded by default the alphabet is 83 characters, so the 18-character default carries roughly 115 bits of entropy. Generation, the strength readout, the clipboard copy and the .txt download all run as client-side JavaScript in your own tab — the page makes no network request, so no password is ever sent to a server.",
  useCases: [
    "Create a unique 20-character password for a new account and paste it straight into your password manager",
    "Provision a team by generating 50 distinct passwords in one pass and downloading them as a single text file",
    "Produce a letters-and-digits-only password for a router, legacy database or terminal that rejects punctuation",
  ],
  benefits: [
    [
      "Web Crypto, not Math.random()",
      "Every character index comes from crypto.getRandomValues(), with out-of-range draws rejected so the distribution stays uniform and unpredictable.",
    ],
    [
      "Entropy shown in bits",
      "The badge reports length x log2(alphabet size) — about 115 bits at the 18-character default — and labels it Basic, Good, Strong or Excellent.",
    ],
    [
      "Batches of up to 50",
      "Generate a whole list at once, click any entry to copy it, copy the batch one-per-line, or save it as altftool-passwords.txt.",
    ],
    [
      "Nothing is uploaded",
      "The generator is client-side JavaScript with no API calls; passwords exist only in your browser tab and clipboard.",
    ],
  ],
  faqs: [
    [
      "Is this password generator safe to use?",
      "Yes, on the point that matters most: nothing is transmitted. Randomness comes from crypto.getRandomValues() inside your own browser and the page makes no network requests, so generated passwords are never sent to or stored on a server. Normal handling still applies — move the password into a password manager rather than leaving it on screen, and generate only on a device you trust.",
    ],
    [
      "How long should a password be?",
      "16 characters or more with all four character sets enabled. Against the default 83-character alphabet that works out to roughly 102 bits of entropy, which this tool labels Excellent. 12 characters gives about 77 bits (Strong) and the 8-character minimum gives about 51 bits (Good). The slider goes up to 64 characters if the site you are using allows it.",
    ],
    [
      "What does the entropy number in bits mean?",
      "It is log2 of how many different passwords your current settings could produce, calculated as length x log2(alphabet size) and rounded. 115 bits means roughly 2^115 equally likely outcomes. The label follows fixed cut-offs: under 48 bits Basic, 48 or more Good, 72 or more Strong, 96 or more Excellent. It rates the settings, not the specific string on screen.",
    ],
    [
      "Why does it leave out characters like l, 1, O and 0?",
      "So the password can be read back correctly when it is written down or shown in a font where those glyphs look alike. The Exclude ambiguous switch is on by default and strips I, l, 1, O and 0, taking the full 88-character alphabet down to 83. Turn it off to use all 88 characters and gain a little more entropy per character.",
    ],
    [
      "Does it guarantee at least one number and one symbol?",
      "Yes. One character is drawn from each enabled set first, the remaining positions are filled from the combined alphabet, and the whole string is shuffled before display. With all four sets on, every password contains at least one uppercase letter, one lowercase letter, one digit and one symbol — which is exactly what most signup forms check for.",
    ],
    [
      "Which symbols does it use?",
      "These 26: !@#$%^&*()_+-=[]{}|;:,.<>? — there is no space, quote, apostrophe, backslash or backtick, the characters that most often break shell commands, CSV exports and web forms. If a service still rejects punctuation, untick Symbols and generate from letters and digits only.",
    ],
    [
      "Can I generate several passwords at once and save them?",
      "Yes. Set Batch count anywhere from 1 to 50. The first password is shown large at the top and the rest are listed underneath; clicking any one of them copies it. Copy all puts the entire batch on the clipboard, one per line, and Download saves the same list as a plain text file named altftool-passwords.txt.",
    ],
    [
      "Do I need an account or a download?",
      "Neither. The generator is a client-side React component that runs the moment the page loads — no sign-up, no install, no usage cap, and no request to any API. Passwords are produced locally and disappear when you close the tab.",
    ],
  ],
  steps: [
    "Drag the length slider anywhere from 8 to 64 characters and tick the character sets you want: uppercase, lowercase, numbers, symbols.",
    "Leave Exclude ambiguous on to drop I, l, 1, O and 0, and set Batch count up to 50 if you need more than one password.",
    "Check the entropy badge, then hit Copy, click any password in the list to copy it, or Download the batch as altftool-passwords.txt.",
  ],
};

export default seo;
