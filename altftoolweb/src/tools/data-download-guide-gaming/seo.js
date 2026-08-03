const seo = {
  intro:
    "This guide turns a gaming data-access request into a dated plan: it gives the exact export route for Steam, PlayStation, Xbox, Nintendo, Epic Games and Discord, then counts down the statutory deadline the platform must answer by under GDPR Article 12(3), the CCPA as amended by the CPRA, or Brazil's LGPD Article 19. A weighted 12-step audit covers what the archive reveals once it arrives — sign-in records, linked accounts, purchase history, friends lists and retained chat. It is for players who want to see what a platform holds, spot an account takeover, or clean up before selling or closing an account.",
  useCases: [
    "Prove when an account was compromised by matching the sign-in IP records in a Steam export, or the sign-in history in a PlayStation export, against dates you were not playing.",
    "Reconcile a year of small in-game currency charges against a card statement before disputing them with the bank.",
    "Find every console, storefront and social identity still linked to an Epic or Discord account before you stop using it.",
    "Track a Sony or Nintendo privacy request that has gone quiet and know the exact date you can escalate to a regulator.",
  ],
  benefits: [
    ["Real deadlines, not guesses", "Counts calendar months for GDPR and calendar days for the CCPA, so the date is the one the law actually gives."],
    ["Route per platform", "Each service hides the export somewhere different; the exact menu path and file format are listed for all six."],
    ["Audit that ranks risk", "Sign-in records, linked accounts and payment history are weighted above cosmetic settings, so you read the dangerous files first."],
  ],
  faqs: [
    [
      "How do I download my Steam data?",
      "Sign in on the web and open Steam Support > My Account > Data Related to Your Steam Account, then generate each category separately. Most categories are ready within a few days, but because the page is split by category people commonly download one file and miss chat, purchase and community data entirely.",
    ],
    [
      "How long does a gaming company have to send my data?",
      "Under GDPR Article 12(3) it is one calendar month from the request, extendable by two further months for complex requests if they tell you why inside the first month. In California the CCPA gives 45 calendar days with one 45-day extension, so 90 days at the outside, plus an acknowledgement within 10 business days.",
    ],
    [
      "Does a PlayStation or Xbox export include voice chat?",
      "Generally no — live voice is not recorded, so what you get is metadata: who was in the party, when, and for how long. On PlayStation, the exception is a clip captured because someone reported it, which appears in the moderation and enforcement section of the export. Xbox's export does not include an equivalent moderation section, so do not expect to find retained voice clips there the same way.",
    ],
    [
      "What should I look at first in a gaming data export?",
      "The sign-in and IP history, then the linked-accounts list. Those two files show whether anyone else has used the account and which third-party identities can still get back in, which matters far more than play statistics. Store the archive somewhere encrypted afterwards, because it contains purchase records and private messages in plain files.",
    ],
  ],
};

export default seo;
