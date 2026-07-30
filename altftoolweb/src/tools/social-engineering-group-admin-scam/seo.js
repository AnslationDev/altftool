const seo = {
  intro:
    "The WhatsApp Group Admin Scam Explainer scores a suspicious group message against the tells that define four known frauds: a fake or hijacked admin, a forged payment or refund, an investment or task exit scam, and outright credential theft. You tick what you can see in the chat — a private DM from the 'admin', a new number behind a familiar photo, a payment screenshot, a fee demanded before withdrawal — and it returns a weighted risk score, the pattern the message best matches, and the verification step for each tell. It is written around one rule that has no exceptions in India: no bank, payment app, platform or admin ever needs your OTP, UPI PIN, CVV or WhatsApp registration code.",
  useCases: [
    "A member of your society or school group is DMed by someone using the admin's photo, asking for an urgent transfer to a personal UPI ID.",
    "Explaining to a parent why the small early payouts from a 'trading group' are the setup for the fee demand that follows.",
    "Checking a 'wrong transfer, please send it back' message against the collect-request trick before returning any money.",
    "Training a new community moderator on which admin-change messages WhatsApp actually generates and which are impersonation.",
  ],
  benefits: [
    ["Names the pattern", "Instead of a vague warning, it tells you which of four fraud shapes the message matches."],
    ["Decisive tells override the score", "An OTP or UPI PIN request forces a stop verdict regardless of anything else present."],
    ["Every tell has a check", "Each observation comes with the specific verification step that settles it in under a minute."],
  ],
  faqs: [
    [
      "How do I know if a WhatsApp group admin is fake?",
      "Check the phone number against the group's participant list and look for the system message WhatsApp posts whenever an admin is added — a real promotion always leaves that line in the chat history. Impersonators copy the display name and photo but cannot fake either of those, which is why they move the conversation into a private DM.",
    ],
    [
      "Can someone take money from me just by adding me to a group?",
      "No. Being added to a group cannot move money on its own; the loss happens only after you send a payment, approve a UPI collect request, enter your PIN, or share an OTP. Set Settings > Privacy > Groups to 'My contacts' to stop unsolicited additions in the first place.",
    ],
    [
      "Why does entering my UPI PIN to receive money never work?",
      "A UPI PIN authorises money leaving your account, never money arriving — receiving needs no PIN and no approval at all. Any message telling you to enter a PIN, scan a QR code or approve a request in order to get a refund or prize is a debit dressed up as a credit.",
    ],
    [
      "What should I do if I have already paid a scammer in India?",
      "Call the national cyber-fraud helpline 1930 and file a complaint at cybercrime.gov.in the same day, then inform your bank in writing so the transaction can be flagged and the beneficiary account frozen. Reporting within the first hours materially improves the chance of a hold on the funds; this is general information, not legal advice.",
    ],
  ],
};

export default seo;
