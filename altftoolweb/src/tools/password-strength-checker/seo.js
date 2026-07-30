const seo = {
  intro:
    "This password strength checker scores a password by entropy — raw bits are computed as length x log2(character pool size), where the pool is 26 for lowercase, 26 for uppercase, 10 for digits and 33 for symbols — and then subtracts for patterns a real cracker exploits. It matches the entry against a list of 100 of the most-used passwords, a dictionary of common words and names, keyboard runs like qwerty and 1qaz2wsx, repeats and date-shaped digits, and converts the surviving entropy into estimated crack times across five attack speeds. The password is analysed in the page and is never transmitted.",
  useCases: [
    "You are about to set a password for a work account and want to know whether it survives an offline GPU attack rather than just whether it satisfies the form's rules.",
    "A colleague insists that P@ssw0rd123 is strong because it has upper case, a digit and a symbol, and you want the pattern findings that show why substitutions barely help.",
    "You are switching to a passphrase and want to compare the entropy of a four-word phrase against your current twelve-character password before you commit to it.",
  ],
  benefits: [
    [
      "Patterns cap the score, not just the length",
      "A dictionary word, a keyboard run of four or more keys, a repeated block or a leading capital plus trailing digits each apply an explicit penalty and can cap the rating, so predictable structure cannot be hidden behind character variety.",
    ],
    [
      "Crack times across five real attack speeds",
      "The same password is timed against 100 guesses per second for a rate-limited login, 10 thousand per second for a bcrypt hash, 10 billion per second on a GPU and 1 trillion on a dedicated rig.",
    ],
    [
      "Shows the arithmetic",
      "The character pool, raw bits, effective bits after penalties, and the log2 formula behind them are all displayed, so the verdict can be checked rather than trusted.",
    ],
  ],
  faqs: [
    [
      "How many bits of entropy does a password need?",
      "Below 28 bits is treated as very weak and 28 to 36 bits as weak; 60 bits or more is where a password becomes genuinely strong, and 128 bits and above is excellent. A 12-character password mixing all four character types reaches about 79 bits before any pattern penalties are applied.",
    ],
    [
      "How long would it take to crack my password?",
      "It depends entirely on how the password is stored. The same password that would take centuries against a rate-limited login at 100 guesses per second can fall in minutes at the 10 billion guesses per second a GPU manages against a fast hash like MD5 or unsalted SHA-1.",
    ],
    [
      "Does replacing letters with symbols like a to @ make a password stronger?",
      "Barely. Common substitutions are the first transformation every cracking tool applies, so a word with them is treated as the dictionary word plus a couple of bits, not as a random string. Adding length or an extra unrelated word helps far more.",
    ],
    [
      "Is it safe to type my real password into a strength checker?",
      "Here it is analysed entirely in your browser with no upload and no network request, and the wordlists are bundled into the page. As a general habit, never type a live password into a checker that submits it to a server, and change any password you have pasted somewhere you are unsure about.",
    ],
  ],
};

export default seo;
