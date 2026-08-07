const seo = {
  intro:
    "An emergency medical card is a wallet-size summary of the facts a paramedic needs in the first sixty seconds: your name, blood group, allergies, diagnoses, current medicines and who to phone. This builder lays those fields out on a standard ID-1 card (85.60 × 53.98 mm, the same size as a bank card), scores how complete the card is, and shows which red-cell donor groups match your blood type. Everything is computed in your browser, so nothing you type is uploaded.",
  useCases: [
    "Carry a card for an elderly parent who takes six medicines and cannot always recall the doses at a hospital desk.",
    "Give a trekking or marathon organiser a card listing your asthma inhaler, adrenaline auto-injector and next-of-kin number.",
    "Keep a card in a child's school bag with the allergy list, paediatrician's number and both parents' mobiles.",
    "Prepare a card before surgery so the anaesthetist has your allergy list and implant history on paper as well as on file.",
  ],
  benefits: [
    ["Wallet-standard size", "Laid out for the ISO/IEC 7810 ID-1 card, so it fits any wallet card slot without folding."],
    ["Completeness score", "Weighted scoring flags the six critical fields a responder checks before anything else."],
    ["Stays on your device", "The card is built in the browser — no account, no upload, no server copy of your health data."],
  ],
  faqs: [
    [
      "What should an emergency medical card include?",
      "At minimum: full name, blood group, allergies (write “None known” if none), current diagnoses, current medicines with doses, and one reachable emergency contact with a dialable number. Date of birth and a second emergency contact are strongly recommended but not required. Add implants or devices such as a pacemaker or stent, your regular doctor, insurer and policy number, and the languages you speak.",
    ],
    [
      "Which blood types can I receive red cells from?",
      "It follows the ABO and RhD rules: O− can receive only O−, A+ can receive O−, O+, A− and A+, and AB+ can receive all eight groups, which is why AB+ is called the universal recipient. O− is the universal red-cell donor. Hospitals still cross-match before transfusing, so treat the card as a prompt, not a clearance.",
    ],
    [
      "Why write “None known” instead of leaving allergies blank?",
      "A blank line is ambiguous — a responder cannot tell whether you have no allergies or simply never filled it in. Writing “None known” records that the question was actually answered, which is why the completeness score treats an empty allergy line as a missing critical field.",
    ],
    [
      "How often should I update the card?",
      "Re-check it whenever a prescription, dose or contact number changes, and review it at least every six months even if nothing has changed. The card carries a review date so anyone reading it can judge how current the information is; ask your doctor or pharmacist to confirm the medicine list at your next appointment.",
    ],
  ],
};

export default seo;
