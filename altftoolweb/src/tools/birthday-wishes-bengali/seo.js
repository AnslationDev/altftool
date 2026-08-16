const seo = {
  title: "Bengali Birthday Wishes with Tumi/Apni Forms",
  metaDescription:
    "Bengali birthday messages by relationship and tone, written separately for tumi and apni, with romanised text, English meaning and SMS part count.",
  steps: [
    "Pick who it's for and the Politeness register — Automatic, আপনি (respectful) or তুমি (familiar) — plus a tone and 1 to 6 messages.",
    "Add their name and Sign it from (optional), and keep Show romanised Bengali ticked for a transliteration under each wish.",
    "Click Copy on one message or Copy all for the set; each wish shows its English meaning and SMS length, with Other wordings to reshuffle.",
  ],
  intro:
    "Bengali Birthday Wishes Generator builds a full Bengali birthday message — greeting line, wish and sign-off — from the relationship you pick and the tone you want. Bengali separates তুমি from আপনি, and that choice changes the possessive (তোমার versus আপনার) and the verb ending, so every wording is stored in both registers instead of being patched. Each message comes with romanised Bengali, an English meaning and the number of SMS parts it will use.",
  useCases: [
    "Wish a teacher, a manager or an elder in the আপনি form without sounding over-familiar.",
    "Send a close friend a warm শুভ জন্মদিন message in natural everyday Bengali.",
    "Get romanised Bengali to type on a keyboard with no Bangla layout.",
    "Check whether a long Bengali wish will send as one SMS or three.",
  ],
  benefits: [
    ["তুমি and আপনি handled properly", "Both registers are written out in full, so possessives and verb endings agree."],
    ["Roman Bengali included", "Each message ships with a transliteration for keyboards without a Bangla layout."],
    ["SMS cost shown", "Bengali script is UCS-2 over SMS, so the tool counts the 70/67-character parts for you."],
  ],
  faqs: [
    [
      "How do you say happy birthday in Bengali?",
      "শুভ জন্মদিন (shubho jonmodin) is the direct equivalent, and জন্মদিনের অনেক শুভেচ্ছা (jonmodiner onek shubhechchha), 'many birthday wishes', is the warmer everyday phrase. Both are used in West Bengal and Bangladesh.",
    ],
    [
      "What is the difference between তুমি, আপনি and তুই?",
      "Bengali has three second-person forms. আপনি is respectful — elders, teachers, managers, strangers. তুমি is the ordinary familiar form for friends, siblings and family of your own generation. তুই is intimate and used only with very close friends or younger siblings; used with the wrong person it sounds rude, so this tool offers তুমি and আপনি only.",
    ],
    [
      "Why do Bengali sentences end with a vertical bar?",
      "That character is the দাঁড়ি (danda, U+0964) — the Bengali full stop. It closes a declarative sentence exactly as a period does in English, and it is what you should type at the end of a Bengali line rather than a dot.",
    ],
    [
      "Why does a Bengali message take more than one SMS?",
      "Bengali script is outside the GSM 03.38 7-bit alphabet, so the message goes out as UCS-2. Under 3GPP TS 23.038 that means 70 characters in a single SMS and 67 per part once concatenated, so a two-line Bengali wish often costs two or three parts. Data apps such as WhatsApp are unaffected.",
    ],
  ],
};

export default seo;
