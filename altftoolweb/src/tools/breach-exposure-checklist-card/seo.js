const seo = {
  intro:
    "The Card Number Exposure Checklist is for the specific case of a leaked card number without the CVV or expiry date — a lower-risk exposure than a full card dump, but not a harmless one. It scores two things: how far through the 16-step response you are, weighted towards killing the old number before card-testing scripts find it, and how much worse the leak gets if the dump also included the CVV, expiry, PIN or other identity fields. Unlike a home address or a date of birth, a card number can be rotated, and getting the issuer to reissue a genuinely new number — not just a new expiry on the same digits — is the single step that fully closes the leak.",
  useCases: [
    "A retailer or payment processor disclosed a breach and confirmed card numbers were exposed without CVV or expiry.",
    "You want to know whether to panic or just reissue quietly, based on what else leaked with the number.",
    "You are checking your statement for the small, odd-amount test charges that card-testing scripts leave behind.",
    "You are helping a family member work through reissuing a card and updating every subscription on the new number.",
  ],
  benefits: [
    [
      "Scoped to the bare-number case",
      "Distinguishes a leaked number alone from a full card number plus CVV and expiry, which needs a faster, harder response.",
    ],
    [
      "Weighted towards killing the number",
      "Reporting the card compromised and confirming the replacement has a different number outweigh clean-up tasks, and missing either caps the score.",
    ],
    [
      "No data collected",
      "You never type your actual card number — you tick which categories leaked, and nothing leaves the browser.",
    ],
  ],
  faqs: [
    [
      "Is a leaked card number dangerous without the CVV and expiry date?",
      "Less dangerous than a full card dump, but not safe. A bare number still passes the Luhn checksum, reveals your issuing bank through its first six to eight digits, and can be run through card-testing scripts against merchants that accept CVV-optional or recurring stored-card charges. Reissue it rather than assuming it is unusable.",
    ],
    [
      "How do I know if someone is testing my leaked card number?",
      "Watch pending authorisations, not just settled transactions. Card-testing typically shows up as one or more small, oddly specific charges — sometimes under a dollar or a few units of local currency — used to confirm a number and any guessed CVV or expiry work before a larger charge follows.",
    ],
    [
      "Will my bank give me a new card number, or just a new card?",
      "It depends how you report it. A routine \"lost or damaged card\" replacement or an expiry-date renewal sometimes keeps the same underlying number. Telling the issuer the number was exposed in a breach gets it treated as compromised, which normally triggers a full number change, not just a new physical card.",
    ],
    [
      "Am I liable for fraud on a card number that leaked in a breach?",
      "Generally no, if you report it promptly. Visa's and Mastercard's zero-liability policies, and most card-issuer terms, cover unauthorised transactions you report in good time. This is general information, not legal advice — check your specific card's terms, and involve your bank immediately if a charge you did not make has already posted.",
    ],
  ],
};

export default seo;
