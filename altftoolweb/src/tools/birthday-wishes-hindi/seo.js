const seo = {
  title: "Birthday Wishes in Hindi: Generator with आप/तुम",
  metaDescription:
    "Complete Hindi birthday messages written separately for आप and तुम, with romanised Hindi, English meaning and the SMS part count for each wish.",
  steps: [
    "Type their name, pick the relationship under \"Who is it for?\", and set Politeness (Automatic, or a fixed आप/तुम register) and Tone.",
    "Choose how many messages (1 to 6), optionally fill \"Sign it from\", and press \"Other wordings\" to shuffle in alternatives.",
    "Each message shows Devanagari, romanised Hindi, an English meaning and its SMS segment count; \"Copy all\" copies every generated message.",
  ],
  intro:
    "Hindi Birthday Wishes Generator writes a complete Hindi birthday message — greeting line, wish and sign-off — from the relationship you pick and the tone you want. Hindi distinguishes आप from तुम, and that choice changes the possessive (आपका versus तुम्हारा) and the verb ending, so each wording here is stored twice rather than patched, and the register is set automatically from the relationship. Every message comes with romanised Hindi, an English meaning, and the number of SMS parts it needs.",
  useCases: [
    "Send a manager or an older relative a wish in the आप form without accidentally sounding over-familiar.",
    "Write a light-hearted message for a close friend in the तुम form that still reads like natural Hindi.",
    "Get a romanised version to type on a phone that has no Devanagari keyboard.",
    "Check whether a long Hindi wish will go out as one SMS or three before you send it.",
  ],
  benefits: [
    ["आप and तुम handled properly", "Both registers are written out in full, so possessives and verb endings agree."],
    ["Roman Hindi included", "Every message ships with a transliteration for phones without a Devanagari keyboard."],
    ["SMS cost shown", "Devanagari is UCS-2 over SMS, so the tool counts the 70/67-character parts for you."],
  ],
  faqs: [
    [
      "How do you say happy birthday in Hindi?",
      "The two everyday forms are जन्मदिन की हार्दिक शुभकामनाएँ (janmadin kī hārdik shubhkāmnāeṁ), literally 'heartfelt birthday wishes', and जन्मदिन मुबारक हो (janmadin mubārak ho). For 'many happy returns', Hindi speakers say जन्मदिन की बहुत-बहुत बधाई.",
    ],
    [
      "Should I use आप or तुम in a Hindi birthday message?",
      "Use आप for parents, teachers, managers, clients and anyone older or senior; use तुम for friends, siblings of your own age or younger, and children. आप changes the possessive to आपका and the verb to the -एँ form, which is why the two versions are written separately rather than swapped word by word.",
    ],
    [
      "Why does a Hindi message cost more than one SMS?",
      "Devanagari falls outside the GSM 03.38 7-bit alphabet, so the message is encoded as UCS-2. That drops the limit from 160 characters to 70 in a single SMS, and to 67 per part once the message is split, under 3GPP TS 23.038. WhatsApp and other data apps are unaffected.",
    ],
    [
      "What is the difference between शुभकामनाएँ and बधाई?",
      "शुभकामनाएँ means good wishes for what lies ahead, so it suits a birthday, a new job or an exam. बधाई is congratulation on something already achieved, and on a birthday it carries the sense of 'many happy returns'. Both are correct on a birthday card; शुभकामनाएँ is the safer formal choice.",
    ],
  ],
};

export default seo;
