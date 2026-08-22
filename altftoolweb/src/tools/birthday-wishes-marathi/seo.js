const seo = {
  title: "Marathi Birthday Wishes with Romanisation",
  metaDescription:
    "Full Marathi birthday messages in the correct तू or तुम्ही form, with romanised text, English meaning and the SMS part count for each wish.",
  steps: [
    "Pick who it is for from 11 relationships (friend, mother, manager, teacher and more), a tone, the Politeness register (तू, तुम्ही or Automatic) and 1-6 messages.",
    "Optionally add their name, a Sign it from name, and tick Show romanised Marathi; use Other wordings to reshuffle.",
    "Read each message with its English meaning and SMS segment count (Devanagari is UCS-2: 70 chars single, 67 per part), then Copy one or Copy all.",
  ],
  intro:
    "Marathi Birthday Wishes Generator builds a full Marathi birthday message — greeting line, wish and sign-off — from the relationship you choose and the tone you want. Marathi separates तू from तुम्ही, and that choice changes the possessive (तुझं versus तुमचं) and the verb agreement, so each wording is stored in both registers instead of being patched. Every message arrives with romanised Marathi, an English meaning and the number of SMS parts it will take.",
  useCases: [
    "Wish an elder relative or a manager in the तुम्ही form without sounding over-familiar.",
    "Send a close friend a light-hearted वाढदिवसाच्या शुभेच्छा message that still reads naturally.",
    "Get romanised Marathi for a phone with no Devanagari keyboard.",
    "See whether a long Marathi wish will go out as one SMS or three.",
  ],
  benefits: [
    ["तू and तुम्ही handled properly", "Both registers are written out in full, so possessives and verbs agree."],
    ["Roman Marathi included", "A transliteration ships with every message for keyboards without Devanagari."],
    ["SMS cost shown", "Devanagari is UCS-2 over SMS, so the tool counts the 70/67-character parts for you."],
  ],
  faqs: [
    [
      "How do you say happy birthday in Marathi?",
      "वाढदिवसाच्या हार्दिक शुभेच्छा (vāḍhadivasācyā hārdik shubhecchā) — literally 'heartfelt wishes on your birthday' — is the standard phrase. जन्मदिनाच्या शुभेच्छा is the slightly more formal alternative, and जन्मदिनाच्या लाख लाख शुभेच्छा is the warm, emphatic version.",
    ],
    [
      "What is the difference between वाढदिवस and जन्मदिन?",
      "Both mean birthday. वाढदिवस is the everyday native Marathi word — literally 'growing day' — and is what most people say and write. जन्मदिन is the Sanskrit-derived form, common in formal writing, invitations and printed cards.",
    ],
    [
      "Should I use तू or तुम्ही in a Marathi birthday message?",
      "Use तुम्ही for parents, teachers, managers and anyone older or senior; use तू for friends, younger siblings and children. तुम्ही changes the possessive to तुमचं and the verb to the plural form, which is why the two versions are written out separately here.",
    ],
    [
      "Why does a Marathi message take more than one SMS?",
      "Devanagari is outside the GSM 03.38 7-bit alphabet, so the message is encoded as UCS-2. Under 3GPP TS 23.038 that gives 70 characters in a single SMS and 67 per part once it is concatenated, so a two-line Marathi wish often costs two parts. Data apps such as WhatsApp are unaffected.",
    ],
  ],
};

export default seo;
