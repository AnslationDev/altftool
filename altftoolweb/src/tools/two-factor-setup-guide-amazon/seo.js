const seo = {
  title: "Amazon 2-Step Verification Setup Checklist",
  metaDescription:
    "15 weighted controls for your Amazon account: authenticator 2SV, backup method, device deregistration and voice-purchase codes, with 4 critical steps.",
  steps: [
    "Tick each of the 15 controls as you complete it on Amazon — grouped by area, with a red Critical badge and a point weight (+N) on each item.",
    "Set a 'Target score (%)' to get the shortest route there: the remaining controls listed highest-weight first.",
    "Watch the Hardening score update — it stays capped at 69% while any of the 4 critical controls is open — then click 'Copy result' to export what is left.",
  ],
  "intro": "This guide is a weighted, 15-control checklist for an Amazon account: two-step verification with an authenticator app, the backup method Amazon requires, passkeys, device deregistration, saved cards, gift-card balance and Alexa voice purchasing. Amazon accounts are attacked for what they can spend rather than what they contain, so payment and ordering controls are scored alongside the sign-in ones. Four controls are marked critical and the score is held at 69% until all four are complete.",
  "useCases": [
    "Securing the account after an order you did not place appears in your order history.",
    "Setting up two-step verification before a big sale period, when phishing that copies Amazon order emails peaks.",
    "Deregistering a Kindle or Fire TV Stick before selling or gifting it.",
    "Putting a voice-purchase code on an Echo in a house with children or frequent visitors."
  ],
  "benefits": [
    [
      "Money controls included",
      "Stored cards, gift-card balance and one-click ordering are scored, not just the login, because that is what a takeover spends."
    ],
    [
      "Backup method handled properly",
      "Amazon requires a backup verification method, and the checklist insists it lives on different hardware from your authenticator app."
    ],
    [
      "Nothing is collected",
      "The page runs locally, never asks for your Amazon sign-in, and stores no order or payment information."
    ]
  ],
  "faqs": [
    [
      "How do I turn on two-step verification on Amazon?",
      "Go to Your Account > Login & Security > Two-Step Verification (2SV) Settings and choose Get Started. Pick Authenticator App and scan the QR code with any TOTP app rather than choosing Phone Number, then add the backup method Amazon asks for before finishing."
    ],
    [
      "Does Amazon require a backup phone number for 2FA?",
      "Yes. Amazon will not complete two-step verification setup without a backup method, normally a phone number that can receive a code by SMS or voice call. Use a number on a different handset from your authenticator app so a single lost phone does not remove both routes in."
    ],
    [
      "Someone ordered from my Amazon account. What should I do first?",
      "Change the password, then use the Secure Your Account option under Login & Security to sign out existing sessions, and check Your Addresses and Your Payments for entries you did not add. Report the order through Amazon's own help pages, and never call a phone number given in the suspicious email."
    ],
    [
      "Is the 'don't ask for codes on this browser' option safe?",
      "It is safe on a device only you use and unsafe anywhere else, because it stops that browser asking for the second factor at all. Leave it unticked on work, hotel, library and shared family computers, and clear trusted browsers if one of those machines changes hands."
    ]
  ]
};

export default seo;
