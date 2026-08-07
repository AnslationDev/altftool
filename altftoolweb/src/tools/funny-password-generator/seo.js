const seo = {
  intro:
    "Funny Password Generator builds memorable passphrase-style passwords on a fixed pattern: a silly adjective, a noun, a three-digit number from 100 to 999, and one symbol from !@#$%^&* — producing results like \"WobblyPlatypus472$\". It draws from roughly 290 adjectives and 320 nouns, with a length slider from 6 to 30 characters that the output always matches exactly: the tool trims the combination if it runs long and pads it with extra random characters if it comes up short. A built-in strength meter grades the output by length: Weak under 6, Fair under 10, Good under 14, and Strong at 14 characters or more.",
  useCases: [
    "Setting up a Wi-Fi guest password you will have to read aloud to visitors — \"SnazzyWaffle318!\" is far easier to dictate than a random character string.",
    "Creating a throwaway login for a forum or trial signup where you want something you can retype from memory without opening a password manager.",
    "Helping a child or an older relative pick a first account password that they can actually remember but that still mixes case, digits and a symbol.",
  ],
  benefits: [
    ["Memorable by construction", "The adjective-noun-number-symbol pattern gives you a mental image to hang the password on, unlike a random character dump."],
    ["Length is enforced, not suggested", "The slider sets an exact target: the tool truncates the assembled password if it runs long and pads it with extra random characters if it comes up short, so the output always matches your chosen length exactly — never over, never under."],
    ["Honest strength read-out", "The meter shows exactly where your chosen length falls against the Weak/Fair/Good/Strong thresholds instead of implying an unearned score."],
  ],
  faqs: [
    [
      "What pattern do the passwords follow?",
      "Adjective + Noun + a random three-digit number (100-999) + a single symbol from !@#$%^&*. The number and symbol are optional toggles. If the assembled password exceeds your chosen length it is cut from the end — which at short lengths can remove the symbol and digits — and if it comes up short of your chosen length, random letters, digits, and (when symbols are enabled) symbols are appended until it matches exactly.",
    ],
    [
      "How long should I make the password?",
      "Choose at least 14 characters, which is where the tool's meter switches to Strong; below 10 it reports only Fair. Because the strength label here is based purely on length, longer is always the safer setting when the site allows it.",
    ],
    [
      "Are these passwords safe to use for my bank or email?",
      "No — use a password manager's cryptographically random generator for high-value accounts. This tool generates with the browser's ordinary random function and follows a publicly known word-plus-number pattern, which makes it suitable for low-stakes and guest logins rather than accounts holding money or identity.",
    ],
    [
      "Is my generated password sent anywhere?",
      "No. Generation happens in the page itself, the field can be masked with the show/hide toggle, and nothing is stored after you leave — so the only copy is the one you place on your clipboard.",
    ],
  ],
};

export default seo;
