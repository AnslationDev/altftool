const seo = {
  title: "Security Question Answer Generator with Entropy Bits",
  metaDescription:
    "Builds false but recordable answers as a passphrase, short story or random string, and reports each one's entropy in bits and possible-answer count.",
  steps: [
    "Pick a style — 'Memorable passphrase', 'Short false story' or 'High-entropy string' — and set 'Words per answer' or 'Characters per answer' plus 'How many answers'.",
    "Press 'New answers' to reseed the generator, and choose the real prompt under 'Question you are being asked' to compare its bits with an honest answer.",
    "Read 'Strength of each answer' in bits alongside 'Possible answers', then press 'Copy all' and paste them into your password manager's notes field.",
  ],
  intro:
    "Security Question Answer Generator produces false but recordable answers — hyphenated passphrases, short invented stories, or high-entropy strings — for questions like 'mother's maiden name' that are matters of public record rather than secrets. It reports the exact strength of each answer in bits of entropy, calculated as log2 of the number of equally likely outcomes, and compares that with how guessable an honest answer would be. NIST SP 800-63B tells verifiers not to use knowledge-based authentication at all; where a service still insists, the accepted fix is to treat the answer as a second password.",
  useCases: [
    "Filling in the three mandatory security questions a bank forces on you at account opening.",
    "Replacing honest answers on an old email account after you realise your pet's name is all over your photo captions.",
    "Setting answers you may have to read aloud to a phone support agent, where a random string would be unusable.",
    "Showing a family member why 'what street did you grow up on' is not a secret when the electoral roll is searchable.",
  ],
  benefits: [
    [
      "Strength you can check",
      "Every style shows its entropy in bits and the number of possible answers, not a vague strength bar.",
    ],
    [
      "Readable when it has to be",
      "Passphrase and sentence styles can be dictated over the phone; the random style is there when you can paste.",
    ],
    [
      "Nothing leaves the browser",
      "Answers are generated locally from a seeded generator — no request is made and nothing is stored.",
    ],
  ],
  faqs: [
    [
      "Is it OK to lie on security questions?",
      "Yes, and it is the standard security recommendation. The question is a shared secret, not a legal declaration, so the only requirement is that you can reproduce the answer later — which means recording it in a password manager next to the account. The one exception is a form that is part of a legal identity check, where you should give truthful information.",
    ],
    [
      "Why are security questions considered insecure?",
      "Because the answers are facts other people can find. NIST SP 800-63B states that verifiers shall not prompt for knowledge-based authentication, and Google's own research found a large share of answers to questions like favourite food were guessable within ten attempts. Maiden names sit in public marriage records, and pet names sit in your photo captions.",
    ],
    [
      "How strong does a fake security answer need to be?",
      "Around 35 to 40 bits of entropy is comfortable for an answer that is only ever checked through a rate-limited form — a five-word passphrase from this tool's 176-word list gives about 37 bits, roughly 169 billion possibilities. Use the high-entropy string style for anything protecting money or your primary email, since that is the account everything else resets through.",
    ],
    [
      "Where should I store my fake answers?",
      "In the notes field of the password manager entry for that account, with the exact question wording copied alongside it. Storing them in a document, an email draft or your browser's autofill defeats the point, because those are the places an attacker who already has partial access will look first.",
    ],
  ],
};

export default seo;
