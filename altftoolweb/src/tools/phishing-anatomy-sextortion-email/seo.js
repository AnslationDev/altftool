const seo = {
  title: "Sextortion Check: Is That Password Threat Real?",
  metaDescription:
    "Score the email against the 10 hallmarks of the mass-mailed bluff: an old leaked password, no evidence attached, a crypto demand, a forged From line.",
  steps: [
    "Under \"Check the message against the pattern\", tick each hallmark your email shows — a password you stopped using years ago, no video or file included, a bitcoin demand, a 24 to 72 hour deadline, a From line showing your own address — and tick the separate red box only if genuine intimate images were actually shown.",
    "Read the \"Bluff hallmarks present\" count out of 10 and the band beside it, from \"Matches the mass-mailed bluff almost exactly\" down to \"Does not fit the bluff pattern\", then fill \"Accounts using that password\" and \"Of those, with two-factor authentication\".",
    "\"Openable with the password alone\" shows what the leak actually costs you, \"Copy result\" puts the score, band and \"What not to do\" list on the clipboard, and \"Where to get help\" gives ic3.gov, Action Fraud and cybercrime.gov.in.",
  ],
  intro:
    "An email that opens with a password you recognise and demands cryptocurrency is a mass-mailed extortion attempt built on a leaked credential list, not on access to your device. This page lists the ten hallmarks of that automated version — an old password, no evidence attached, nothing personal beyond the password, a crypto address, a 48-hour clock, a forged From line showing your own address — and reports how many of them your message matches. It also separates the real risk, which is password reuse and credential stuffing, from the claimed one, and gives the reporting routes for the US, UK and India.",
  useCases: [
    "An email arrives quoting a password you used years ago and you need to know whether anything is actually compromised.",
    "The message appears to come from your own address and you want to understand how that is possible without a break-in.",
    "Helping a friend or relative who is frightened by one of these emails and considering paying.",
    "Working out which accounts genuinely need a password change after an old credential leak.",
  ],
  benefits: [
    ["Separates fact from claim", "The password is real and the surveillance is not — the tool makes that distinction explicit instead of leaving you to guess."],
    ["Turns fear into a task list", "The output is a concrete clean-up: which accounts share the password, which have a second factor, and how long changing them takes."],
    ["Handles the serious case properly", "If genuine intimate material was actually shown, the guidance switches to image-based abuse reporting rather than treating it as a bluff."],
  ],
  faqs: [
    [
      "Someone emailed me my real password and says they recorded me — is it true?",
      "Almost certainly not. These campaigns take address-and-password pairs from old website breaches and send millions of identical messages; the password is the only genuine item in the email. If no video or screenshot was actually attached and the message contains nothing personal beyond that password, there is no evidence of any access to your devices.",
    ],
    [
      "The email came from my own address — does that mean my account is hacked?",
      "No. The From header of an email is free text and can be forged by any sender, which is why domains publish SPF, DKIM and DMARC records to fight it. Check your Sent folder: the message will not be there. Changing your password and turning on two-factor authentication is still worth doing.",
    ],
    [
      "Should I pay the bitcoin demand?",
      "No. There is nothing to buy back — the recording does not exist — and paying identifies your address as one that responds, which usually brings more demands. Instead, change the quoted password everywhere it is still used, enable two-factor authentication, and report the message.",
    ],
    [
      "What should I actually do after receiving one?",
      "Change the leaked password on every account that still uses it and stop reusing it; turn on two-factor authentication on email and banking first; check a breach-notification service to see which site exposed the password; and report the message to your national cybercrime body — ic3.gov in the US, Action Fraud in the UK, or cybercrime.gov.in and the 1930 helpline in India. If someone has genuinely shared intimate images of you, that is a crime — contact the police, and use StopNCII.org, or NCMEC's Take It Down service if the person depicted is under 18.",
    ],
  ],
};

export default seo;
