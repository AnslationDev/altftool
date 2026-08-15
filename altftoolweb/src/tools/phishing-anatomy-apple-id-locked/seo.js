const seo = {
  title: "Is the ‘Apple ID Locked’ Email Real? Phishing Check",
  metaDescription:
    "Check an Apple ID account-locked email, text or call: the link’s real domain against apple.com and icloud.com, plus what Apple never asks for.",
  steps: [
    "Set \"How did it arrive?\" to Email, SMS / text message, iMessage or \"Phone call or voicemail\", and paste the \"Sender address\".",
    "Paste the real link target into \"Where the button or link goes\" - long press on a phone, or right click then \"Copy link address\" - and the wording into \"Message text\", ticking the attachment box if one came with it.",
    "The \"Red-flag score\" out of 100 names a band from \"No strong signals found\" to \"Phishing - do not interact\", with every finding tagged Red flag, Caution, Note or Reassuring; \"Copy result\" copies the analysis.",
  ],
  intro:
    "Account-locked messages are judged on two things: the registrable domain the link actually goes to, and whether the message asks for something Apple never asks for. This page checks both — sender and link domains against apple.com, icloud.com and Apple's other account domains, and the wording against Apple's published position that it does not request passwords, verification codes or security answers by email, message or phone. It also covers the SMS, iMessage and cold-call versions of the same script, and the anatomy of the email itself, from the fake case number to the 24-hour deadline.",
  useCases: [
    "An 'Apple ID locked' email lands and you want to check the button's real destination before tapping it.",
    "A parent or grandparent forwards a suspicious text and you need a plain explanation to send back.",
    "Someone calls claiming to be Apple Support about suspicious activity and asks to install remote-access software.",
    "You already entered your Apple ID password on a copied sign-in page and need the recovery steps in order.",
  ],
  benefits: [
    ["Checks the destination, not the styling", "A pixel-perfect copy of an Apple page is trivial; the registrable domain is the part that cannot be faked."],
    ["Covers text and phone versions", "SMS sender IDs are forgeable and cold calls have no header at all, so the tool weights those channels differently."],
    ["Gives the safe route back", "Every finding points to checking your account from Settings or a hand-typed address instead of any link."],
  ],
  faqs: [
    [
      "Is the 'Your Apple ID has been locked' email real?",
      "Almost always no. A genuine Apple ID hold is cleared from your own device or at iforgot.apple.com, and Apple's account mail comes from apple.com or icloud.com domains. Check the link's registrable domain — the last two parts of the host, right before the first slash, not the whole host string — and if it is anything other than apple.com or icloud.com (or Apple's other account domains), delete the message.",
    ],
    [
      "What email address does Apple actually send from?",
      "Apple sends account and receipt mail from hosts under its own domains, such as email.apple.com and icloud.com. The From header can still be forged, so treat a matching sender as one weak signal and judge the link and the request instead. When in doubt, open Settings, tap your name, and check Purchase History and Sign-In and Security there.",
    ],
    [
      "Will Apple ever ask for my verification code?",
      "No. Apple states it does not ask for passwords, verification codes or security answers by email, message or phone. A request for a two-factor code is the most serious version of this scam, because it means the caller already has your password and needs only the code to complete a sign-in.",
    ],
    [
      "I entered my Apple ID password on a fake page — what now?",
      "Change your Apple Account password immediately from Settings on your device or by typing appleid.apple.com yourself, then review the trusted devices and trusted phone numbers listed there and remove anything you do not recognise. Check Purchase History for unfamiliar charges, and forward the phishing email to reportphishing@apple.com. If money has moved, contact your bank the same day.",
    ],
  ],
};

export default seo;
