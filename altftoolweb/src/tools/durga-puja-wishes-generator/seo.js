const seo = {
  intro:
    "This generator writes Durga Puja greetings for a specific day of the festival — Mahalaya, Maha Shashthi, Saptami, Ashtami, Navami or Bijoya Dashami — in Bengali script, Banglish or English. Each message pairs the correct greeting for that tithi with a line about the ritual that actually happens on it, such as the Nabapatrika bath on Saptami or the 108 lamps of Sandhi Puja, and then a closing chosen for the tone you pick. It also counts characters and shows how many SMS segments the message will use, since Bengali text is sent as Unicode and fits only 70 characters per segment.",
  useCases: [
    "Send the right greeting on the right day instead of one generic message for all five days.",
    "Write a Bijoya Dashami message to relatives in Bengali script when you cannot type in Bengali yourself.",
    "Prepare a short, neutral Sharadiya greeting for clients and colleagues that does not read as a personal message.",
    "Get a caption under 700 characters for a WhatsApp status or Instagram post on Ashtami morning.",
  ],
  benefits: [
    [
      "Day-accurate wording",
      "Shashthi says Bodhon, Saptami says Nabapatrika, Dashami says Devi Boron — no mismatched greetings.",
    ],
    ["Three scripts", "The same message in Bengali script, Banglish transliteration or plain English."],
    [
      "Length is checked",
      "Character count, SMS segment count and WhatsApp status fit are shown for every message.",
    ],
  ],
  faqs: [
    [
      "What is the correct greeting for each day of Durga Puja?",
      "Use Shubho Mahalaya on Mahalaya, then Shubho Shashthi, Shubho Saptami, Shubho Ashtami and Shubho Nabami on the four puja days, and Shubho Bijoya Dashami on the tenth day. Shubho Sharodiya works across the whole festival and is the safest choice when you are not sure which tithi it is.",
    ],
    [
      "What is Sandhi Puja and when is it performed?",
      "Sandhi Puja is performed in the 48-minute window that straddles the end of Ashtami and the start of Navami — the last 24 minutes of the Ashtami tithi and the first 24 minutes of Navami. It is offered to Chamunda with 108 earthen lamps and 108 lotuses, and the exact clock time changes every year.",
    ],
    [
      "Why does a Bengali message cost more SMS credits than an English one?",
      "A message written only in Latin characters is encoded as GSM-7 and fits 160 characters in one SMS segment. A single Bengali character forces the whole message into UCS-2 encoding, which allows only 70 characters per segment, so the same greeting can cost three segments instead of one.",
    ],
    [
      "Does Durga Puja fall on the same dates every year?",
      "No. The festival follows the lunar tithis in the bright fortnight of Ashwin, so it moves between late September and October in the Gregorian calendar — Shashthi fell on 28 September in 2025 and in October in 2026. Check a panjika or your local puja committee for the exact tithi and Sandhi Puja timings.",
    ],
  ],
};

export default seo;
