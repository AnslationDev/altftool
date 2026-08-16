const seo = {
  title: "UGC Brief Generator: Shot Lists & Delivery Specs",
  metaDescription:
    "Build a creator brief with scene timings that sum exactly to the runtime, word budgets at 150 wpm, platform delivery specs, and dos and don'ts.",
  steps: [
    "Enter the Product, 'Who the ad is for', 'One key message' and 'Call to action', then pick an 'Ad structure' (problem/solution, unboxing, testimonial, before/after or listicle) and a Placement.",
    "Set 'Runtime (seconds)' between 5 and 180 plus 'Hook variants' and 'CTA variants' — the brief, the 'Cuts to deliver' count and the timed shot list recalculate as you type.",
    "Review the shot list with per-scene word budgets, the delivery spec and the do/do-not lists, then press 'Copy brief' to copy the full text shown under 'Brief to send'.",
  ],
  intro:
    "UGC Brief Generator produces the document a creator actually needs to shoot a paid ad: a shot list where scene durations are allocated from the runtime and always sum to it exactly, a spoken word budget per scene at 150 words per minute, the delivery spec for the placement you are buying, and explicit dos and don'ts. Pick a structure — problem/solution, unboxing, testimonial, before/after or listicle — and the beats, timings and on-screen text cues are laid out for you.",
  useCases: [
    "Brief three creators on the same 30-second ad so the cuts are comparable instead of wildly different.",
    "Work out how many words fit in a five-second hook before the creator writes a paragraph.",
    "Specify a modular shoot — three hooks by two CTAs — and see the six cuts and the hours it costs.",
    "Catch a 90-second concept that will not run as a TikTok in-feed ad before anyone books a shoot day.",
  ],
  benefits: [
    [
      "Timings that add up",
      "Scene seconds are allocated by largest remainder, so a 30-second brief is exactly 30 seconds of scenes.",
    ],
    [
      "Spec per placement",
      "Ratio, resolution, frame rate, codec, file-size cap and safe zones for the placement you selected.",
    ],
    [
      "Reshoot-proof rules",
      "Music licensing, competitor logos, unapproved claims and burned-in captions are called out up front.",
    ],
  ],
  faqs: [
    [
      "What should a UGC brief include?",
      "Five things: the product and one key message, the audience, a timed shot list with what happens in each scene, the delivery spec (ratio, resolution, codec, file size, raw footage), and the dos and don'ts. Anything missing from that list becomes a reshoot.",
    ],
    [
      "How long should a UGC ad be?",
      "Most direct-response UGC lands between 15 and 30 seconds. Check the ceiling for the placement: TikTok in-feed ads run 5 to 60 seconds, Meta Reels placements take up to 90, and YouTube Shorts up to 3 minutes.",
    ],
    [
      "What video specs do UGC ads need?",
      "For vertical placements, 1080 x 1920 at 9:16, 30 fps, H.264 video with AAC audio in an .mp4 or .mov. TikTok caps ad uploads at 500 MB and Meta at 4 GB. Always ask for the raw clips as well as the finished cut so the ad can be re-edited without another shoot.",
    ],
    [
      "Why should creators not add captions or music themselves?",
      "Platform-native captions and effects are burned into the exported file and cannot be removed, which blocks localisation and re-editing. Trending music is licensed for organic use only — running it in a paid ad risks a takedown, so audio must come from a cleared library the advertiser supplies.",
    ],
  ],
};

export default seo;
