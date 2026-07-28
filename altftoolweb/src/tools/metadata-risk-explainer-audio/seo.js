const seo = {
  intro:
    "The Audio Metadata Risk Explainer shows what MP3, M4A voice notes and WAV files can reveal before you share them: artist/title tags, timestamps, recorder app, device model, GPS or location titles, filenames, embedded artwork, transcript tracks, voices and ambient sounds.",
  useCases: [
    "Check a voice note before sending it to a workplace, journalist, lawyer or support desk.",
    "Prepare a podcast clip or public audio download without accidental private tags.",
    "Explain why metadata stripping does not remove names spoken aloud or background location clues.",
    "Create a short cleanup list for MP3, M4A, WAV and field-recorder files.",
  ],
  benefits: [
    ["Channel-aware scoring", "See what survives email, work chat, public uploads, podcasts and messaging apps."],
    ["Hidden tags plus audible content", "The model covers both metadata and the sounds that survive every export."],
    ["Copyable cleanup plan", "Export top remaining risks and fixes as a concise checklist."],
  ],
  faqs: [
    [
      "Can audio files reveal location?",
      "Yes. Some apps and recorders can store location titles or GPS-like metadata, and the audio itself may contain announcements, traffic, room tone or background speech that reveals place.",
    ],
    [
      "Does converting to MP3 remove metadata?",
      "Not automatically. Many converters write new encoder tags and preserve artist, title, artwork or comments unless you choose a clean export preset.",
    ],
    [
      "Is this a file scanner?",
      "No. It is a local reference model. You tick the signals you believe are present and the tool explains what could survive each sharing channel.",
    ],
  ],
};

export default seo;
