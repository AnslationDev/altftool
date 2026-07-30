const seo = {
  intro:
    "The Vertical Video Safe-Zone Previewer overlays a 9:16 frame with dashed top and bottom boundary guides so you can see which parts of a Reel, Short or TikTok will sit under the platform's own interface. Load a reference frame or clip from your device, position it against the guides, write your review notes, and export the whole review as a plain-text report. It is a visual staging aid for creators and editors, not a scraper of platform layout specs — the guides are yours to adjust against a real platform preview before you publish.",
  useCases: [
    "You have cut a 9:16 product demo and want to check the price caption you burned into the bottom third is not sitting where the caption and control bar land.",
    "A client sends a vertical ad frame and you need to mark, in writing, which on-screen text they should move up before you re-export it.",
    "You are handing a batch of Shorts to a junior editor and want one exported review report per clip listing exactly which elements crossed a boundary.",
  ],
  benefits: [
    [
      "Frame-accurate 9:16 staging",
      "Your reference image or video sits inside a true 9:16 box, so what you judge is the shape the platform actually plays.",
    ],
    [
      "Review notes travel with the check",
      "Every boundary call you type is exported as a dated plain-text report you can attach to the edit ticket.",
    ],
    [
      "No layout guesswork presented as fact",
      "The overlay is an adjustable review aid and says so, instead of hard-coding pixel margins that platforms change without notice.",
    ],
  ],
  faqs: [
    [
      "What is a safe zone in a vertical video?",
      "It is the part of a 9:16 frame that no platform interface covers — usually the middle band, with the top status area and the lower caption, handle and action-button strip at risk. Anything you need a viewer to read, such as a price, a caption or a logo, belongs inside that middle band.",
    ],
    [
      "Does this tool know the exact safe-zone pixels for TikTok, Reels and Shorts?",
      "No, and that is deliberate. The overlay gives you an adjustable 9:16 frame with top and bottom boundary guides; each platform moves its interface between app versions, so confirm your final placement in that app's own upload preview before publishing.",
    ],
    [
      "Is my video uploaded anywhere?",
      "No. The reference image or clip you select is rendered in your browser from a local object URL and never leaves the device, and the review report is generated and downloaded locally.",
    ],
    [
      "What do I get when I export?",
      "A plain-text report containing the tool name, an ISO timestamp, your typed review notes, and a reminder to verify every safe-zone assumption against a real platform preview — suitable for pasting into an edit ticket or handover doc.",
    ],
  ],
};

export default seo;
