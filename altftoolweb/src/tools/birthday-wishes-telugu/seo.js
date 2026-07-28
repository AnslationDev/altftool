const seo = {
  intro:
    "Telugu Birthday Wishes Generator writes a complete Telugu birthday message — greeting line, wish and sign-off — from the relationship you choose and the tone you want. Telugu separates నువ్వు from మీరు, and that choice changes the possessive (నీ versus మీ) and the verb ending, so each wording is stored in both registers instead of being patched. Every message arrives with romanised Telugu, an English meaning and the number of SMS parts it needs.",
  useCases: [
    "Wish a manager, a teacher or an elder in the మీరు form without sounding over-familiar.",
    "Send a close friend a playful పుట్టినరోజు శుభాకాంక్షలు message in natural spoken Telugu.",
    "Get romanised Telugu to type on a keyboard with no Telugu layout.",
    "Check whether a long Telugu wish will send as one SMS or three.",
  ],
  benefits: [
    ["నువ్వు and మీరు handled properly", "Both registers are written out in full, so possessives and verb endings agree."],
    ["Roman Telugu included", "Each message ships with a transliteration for keyboards without a Telugu layout."],
    ["SMS cost shown", "Telugu script is UCS-2 over SMS, so the tool counts the 70/67-character parts for you."],
  ],
  faqs: [
    [
      "How do you say happy birthday in Telugu?",
      "పుట్టినరోజు శుభాకాంక్షలు (puṭṭinarōju śubhākāṅkṣalu) is the everyday phrase — literally 'birthday good wishes'. జన్మదిన శుభాకాంక్షలు is the more formal Sanskrit-derived version used on cards and in printed messages.",
    ],
    [
      "Should I use నువ్వు or మీరు in a Telugu birthday message?",
      "Use మీరు for parents, teachers, managers, elders and anyone you address with గారు; use నువ్వు for close friends, younger siblings and children. మీరు changes the possessive to మీ and takes the plural verb form, which is why the two versions are written out separately here.",
    ],
    [
      "What does adding గారు to a name do?",
      "గారు is the Telugu honorific suffix, roughly equivalent to Mr or Ms but usable for anyone you respect regardless of age or gender. Attaching it — as in కిరణ్ గారూ in a greeting line — is the normal way to open a polite message to a colleague, a senior or someone you do not know well.",
    ],
    [
      "Why does a Telugu message take more than one SMS?",
      "Telugu script is outside the GSM 03.38 7-bit alphabet, so the message goes out as UCS-2. Under 3GPP TS 23.038 that gives 70 characters in a single SMS and 67 per part once concatenated, so a two-line Telugu wish often costs two or three parts. Data apps such as WhatsApp are unaffected.",
    ],
  ],
};

export default seo;
