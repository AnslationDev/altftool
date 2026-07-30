const seo = {
  intro:
    "Gujarati Birthday Wishes Generator writes a complete Gujarati birthday message — greeting line, wish and sign-off — from the relationship you pick and the tone you want. Gujarati distinguishes તું from તમે, and that choice changes the possessive (તારું versus તમારું) and the verb ending, so each of the twelve wordings here is written out twice rather than word-swapped, and the register is set automatically from the relationship you choose. Every message is shown with romanised Gujarati, an English meaning, the same wish in the opposite register, and the number of SMS parts it will cost.",
  useCases: [
    "Send a manager, a teacher or an older relative a wish in the તમે form without accidentally sounding over-familiar.",
    "Write a light-hearted message for a close friend or sibling in the તું form that still reads like natural Gujarati.",
    "Get a romanised version to type on a phone that has no Gujarati keyboard, with an English gloss so you can check what you are sending.",
  ],
  benefits: [
    [
      "તું and તમે handled properly",
      "Both registers are written out in full, so possessives and verb endings agree instead of being patched pronoun-first.",
    ],
    [
      "Roman Gujarati and English included",
      "Every message ships with a transliteration and a plain-English meaning, so you can send it even if you cannot read the script.",
    ],
    [
      "SMS cost shown",
      "Gujarati is UCS-2 over SMS, so the tool counts the 70/67-character parts before you send.",
    ],
  ],
  faqs: [
    [
      "How do you say happy birthday in Gujarati?",
      "The everyday forms are જન્મદિવસની હાર્દિક શુભેચ્છા (janmadivasnī hārdik shubhecchā), literally 'heartfelt birthday wishes', and જન્મદિન મુબારક (janmadin mubārak), which is the more casual, Urdu-derived phrasing you will hear among friends. A formal card usually opens with શુભેચ્છા rather than મુબારક.",
    ],
    [
      "Should I use તું or તમે in a Gujarati birthday message?",
      "Use તમે for parents, teachers, managers, clients and anyone older or senior; use તું for close friends, a partner, younger siblings and children. તમે changes the possessive to તમારું and the verb to the plural ending, which is why the two versions here are stored separately rather than swapped word by word. In very formal writing Gujarati also uses આપ, a step above તમે, which this tool uses in the formal wordings.",
    ],
    [
      "Why does a Gujarati message cost more than one SMS?",
      "The Gujarati script falls outside the GSM 03.38 7-bit alphabet, so the message is encoded as UCS-2. That drops the limit from 160 characters to 70 in a single SMS, and to 67 per part once the message has to be split, under 3GPP TS 23.038 and 23.040. WhatsApp and other data messaging apps are not affected.",
    ],
    [
      "What is the difference between શુભેચ્છા and અભિનંદન?",
      "શુભેચ્છા means good wishes for what lies ahead, so it fits a birthday, a new job or an exam. અભિનંદન is congratulation on something already achieved — a promotion, a wedding, a result. On a birthday card શુભેચ્છા is the natural choice; અભિનંદન on its own would read as if you were congratulating someone on having had the birthday.",
    ],
  ],
};

export default seo;
