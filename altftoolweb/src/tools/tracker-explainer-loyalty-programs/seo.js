const seo = {
  intro:
    "Loyalty Program Data Explainer maps 23 real supermarket and airline record patterns to the inferences they support — a due date from a change in period-product buying, coeliac disease from a standing gluten-free line, religious observance from an IATA meal code such as KSML or MOML, a house move from a change of usual store. Each inference is classified against Article 9 of the GDPR, which covers health, religion or belief, ethnicity, politics, trade union membership, genetics, biometrics and sex life, and treats data from which those can be inferred as in scope. You also get an estimate of how many itemised transactions and item lines the operator holds, and the specific rights you can use to see or stop it.",
  useCases: [
    "Understanding why a supermarket started sending baby offers before you had told anyone.",
    "Deciding which purchases are worth keeping off the card — pharmacy collections, alcohol, anything health-related.",
    "Preparing a subject access request and knowing what to ask for, including the inferences and profiles rather than just the receipts.",
    "Explaining to someone why an airline meal code is a record of their religion, not a catering preference.",
  ],
  benefits: [
    [
      "Concrete, not vague",
      "Each entry names the buying pattern, the inference it supports, and why the pattern is readable.",
    ],
    [
      "Legal classification included",
      "Marks which inferences are Article 9 special-category data and which are merely unexpected.",
    ],
    [
      "Sizes the record",
      "Turns your shopping frequency and membership length into the number of itemised lines held.",
    ],
  ],
  faqs: [
    [
      "What data do supermarket loyalty cards collect?",
      "Every scanned transaction, itemised to product level, with the store, date, time, payment method and any promotion used, all attached to your name, address, email and phone. Two card-scanned shops a week over six years is roughly 620 transactions and, at 15 items each, around 9,000 individual item lines — which is what makes the sequence readable, not any single purchase.",
    ],
    [
      "Can a supermarket work out that I am pregnant?",
      "Yes, and the signals are well documented: prenatal vitamins, a switch to unscented products, an interruption to a regular period-product purchase, and later a move into infant formula. Because the inference concerns health, it is special-category data under Article 9 of the GDPR, and the European Data Protection Board's position is that inferred characteristics fall in scope just as stated ones do.",
    ],
    [
      "What does an airline know about me from my frequent flyer account?",
      "Your repeat city pairs, which suggest where you live and work; your fare classes and how tickets are paid for, which suggest income and whether an employer pays; the people who appear on your bookings, which builds a relationship graph; and any meal or assistance codes. Codes such as KSML, MOML, HNML and VGML record religious or dietary belief, and requests such as WCHR record a mobility need — both are special-category data.",
    ],
    [
      "How do I find out what my loyalty programme holds about me?",
      "Make a subject access request under Article 15 of the GDPR. The operator must give you the personal data it holds, including profiles and inferences derived from it, normally within one month and free of charge. You can separately object to processing for direct marketing under Article 21(2), which has no balancing test — the processing must stop. This is general information rather than legal advice; contact your data protection authority if a request is refused.",
    ],
  ],
};

export default seo;
