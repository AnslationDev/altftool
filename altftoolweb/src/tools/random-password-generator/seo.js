const seo = {
  title: "Random Password Generator with Entropy in Bits",
  steps: [
    "Drag Password Length anywhere from 8 to 128, then tick the Character Options you want: Uppercase (A–Z), Lowercase (a–z), Numbers (0–9) and Symbols (!@#$%).",
    "Press Generate New; the Password Strength panel reports the entropy in bits and a crack-time estimate for that exact pool.",
    "Press Copy Password to take the result, or the show/hide button to reveal it first.",
  ],
  intro:
    "Random Password Generator builds passwords of 8 to 128 characters using the browser's cryptographic random source (crypto.getRandomValues) with rejection sampling, so no character is more likely than another, then guarantees at least one character from every set you enabled and shuffles the result. It scores each password by true entropy — length x log2(pool size) — rather than by a checklist, so the default 24-character password drawn from uppercase, lowercase, digits and 26 symbols reports about 155 bits. Nothing is transmitted or stored: the password is generated in the page and disappears when you close it.",
  useCases: [
    "You are setting up a new account and want a password you will paste straight into a password manager, so length and randomness matter far more than being able to type it.",
    "A site rejects your password because it bans certain punctuation, so you switch off symbols and raise the length instead — the entropy readout shows you exactly what that trade costs.",
    "You are writing down a recovery code by hand and turn off similar characters so I, l, 1, L, O and 0 can never appear and be misread later.",
  ],
  benefits: [
    ["Cryptographic randomness, not Math.random", "Characters come from crypto.getRandomValues with modulo bias rejected, which is the difference between an unpredictable password and a guessable one."],
    ["Every enabled set is guaranteed to appear", "One character is reserved from each selected pool before the rest is filled and the whole string is shuffled, so a password never silently misses the digit a site requires."],
    ["Entropy in bits, not a vague meter", "The strength readout shows the actual bit count for your length and character-set choice, so you can see that adding four characters beats adding one symbol type."],
  ],
  faqs: [
    [
      "How long should a password be?",
      "Aim for at least 60 bits of entropy and preferably 80 or more; with the default uppercase, lowercase, digits and symbols pool of 88 characters that is roughly 10 and 13 characters respectively. The generator defaults to 24 characters, about 155 bits, because anything you store in a password manager costs nothing extra to make longer.",
    ],
    [
      "What do the strength labels mean?",
      "They are entropy bands: under 40 bits is Weak, 40 to 59 is Fair, 60 to 79 is Strong and 80 bits or more is Very Strong. Entropy is calculated as the password length multiplied by log2 of the number of characters available, so it rises with both length and character variety.",
    ],
    [
      "Is the password sent anywhere or saved?",
      "No. Generation happens entirely in your browser tab with no network request, and the on-screen history exists only while the page is open — refreshing or closing it clears everything.",
    ],
    [
      "Why would I exclude similar characters?",
      "Turning off similar characters removes I, l, 1, L, O, o and 0 from every pool, which prevents transcription mistakes when a password has to be read aloud or typed from paper. It does shrink the pool and therefore the entropy slightly, so add a couple of characters to length to compensate.",
    ],
  ],
};

export default seo;
