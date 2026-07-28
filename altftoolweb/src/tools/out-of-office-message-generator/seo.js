const seo = {
  intro:
    "This generator writes an out-of-office auto-reply from your absence dates and turns those dates into the numbers people actually need: how many working days you are away, and the first Monday-to-Friday date you are back. Weekends are excluded automatically and any public holidays you list are removed from the count and skipped when picking the return date. It covers the four things a good auto-reply must state — the exact range, whether you are reading email, who to contact instead, and when a reply will arrive.",
  useCases: [
    "Set a two-week annual leave reply that names a colleague and tells senders you have no email access.",
    "Write a one-day reply for a conference where you are still checking mail once in the evening.",
    "Work out the true return date when your last day off is a Friday or falls next to a public holiday.",
    "Produce a neutral version that gives dates and a backup contact without saying why you are away.",
  ],
  benefits: [
    [
      "Return date that is a working day",
      "The first working day after your last day off is calculated for you, skipping weekends and listed holidays.",
    ],
    [
      "Backup contact enforced on long absences",
      "Absences over three working days flag a missing delegate, because 'I will reply on my return' is not a handover.",
    ],
    [
      "Length kept readable",
      "A character count warns when the reply grows past 500 characters and stops fitting a phone preview.",
    ],
  ],
  faqs: [
    [
      "What should an out of office message say?",
      "Four things: the exact first and last day you are away, whether you are checking email, who to contact for anything urgent with their email address, and the date you will start replying again. Anything beyond that — the reason, your itinerary, personal details — is optional and usually better left out.",
    ],
    [
      "Should I say why I am out of the office?",
      "Only if it helps the sender set expectations, such as business travel or a conference. Leave out medical, family or personal reasons: an auto-reply goes to every sender including strangers and mailing lists, and the reason rarely changes what they do next.",
    ],
    [
      "What return date should I put in an out of office reply?",
      "Use the first working day you are genuinely back at your desk, not the day you land or the weekend day your leave technically ends. If your last day off is a Friday, the return date is the following Monday — and a public holiday pushes it further.",
    ],
    [
      "Should the out of office go to internal or external senders?",
      "Gmail and Outlook both let you limit the reply to your contacts or to internal colleagues only. Restrict external replies if your inbox receives client or confidential mail, since an auto-reply confirms a live address and reveals that you are away.",
    ],
  ],
};

export default seo;
