const seo = {
  intro:
    "Describe the reel you are editing — \"gym progress clip\", \"aesthetic travel montage\", \"rainy day emotional\" — and this finder maps that phrasing onto one of twelve short-form mood categories and returns up to five matching background tracks, each with its vibe and the kind of footage it is typically cut to. Matching runs in two tiers: your words are first mapped to a standard mood such as Motivational Workout or Relaxed Cooking, and if nothing maps, the text is searched against every track's vibe and trending-use description. It works from a curated offline list rather than a live chart, so results are instant and consistent, and every suggestion is a starting point you then locate inside your platform's own licensed audio library.",
  useCases: [
    "You have a finished 20-second cooking clip and no idea what to put under it, so you type \"recipe tutorial\" and get lo-fi piano and jazz-swing options that suit close-up food shots",
    "You are cutting an outfit-transition reel and want the vibe named before you go hunting — house beat versus R&B versus confident pop — instead of scrolling the in-app audio list blind",
    "You want three different moods for the same travel footage so you can test which edit lands, and need suggestions grouped by feel rather than by chart position",
  ],
  benefits: [
    ["Understands how you describe your video", "\"Gym vlog\", \"pre-workout\" and \"fitness montage\" all resolve to the same mood category, so you do not have to guess the right label."],
    ["Tells you what the track is used for", "Every suggestion names its vibe and the footage it typically scores — drone shots, quick cuts, morning routines — so you can judge fit before you listen."],
    ["Short, de-duplicated shortlists", "Results are capped at five unique tracks so you get a decision, not a scroll."],
  ],
  faqs: [
    [
      "Does this show what is trending on Instagram or TikTok right now?",
      "No — it searches a curated internal list of tracks and mood categories, not a live trending chart. That is a deliberate trade-off: no API rate limits or outages, instant results, but the shortlist reflects durable short-form vibes such as lo-fi, chillwave and EDM plus recent viral picks, rather than today's chart movement.",
    ],
    [
      "Can I legally use these songs in my reel?",
      "Only if you add them from the platform's own in-app music library, which is where the licence for personal or commercial use comes from. The link on each result is a plain web search to help you identify the track — downloading an audio file from elsewhere and uploading it with your video can infringe copyright, and business or promotional accounts often have a narrower catalogue than personal ones.",
    ],
    [
      "What kinds of moods can I search for?",
      "Twelve categories are recognised by keyword: motivational workout, scenic drive or roadtrip, aesthetic travel, relaxed cooking, tutorial or explainer, funny and meme, product reveal or unboxing, fashion and style, personal vlog, romantic, sad or emotional, and dancing or upbeat. Words such as gym, OOTD, drone, unboxing, breakup or challenge each route into one of these.",
    ],
    [
      "Why did I get general suggestions instead of a match?",
      "Because your phrasing did not hit any mood keyword or appear in a track's vibe or usage text, so it falls back to a general set and tells you it did. Simplify the query — \"sad emotional\" or \"relaxed cooking\" rather than a long specific description like \"ASMR soft whispering rainy day\" — and the mood matcher will catch it.",
    ],
  ],
  steps: [
    "Type how you would describe your reel into the required search field, whose placeholder reads \"e.g., Aesthetic travel montage, motivational gym clip, sad video\".",
    "Click Suggest Music. The page shows \"Searching internal database with smart matching...\" while your words are mapped to a mood category such as Motivational Workout, Relaxed Cooking or Sad/Emotional, then — if nothing maps — searched against each track's vibe and trending-use text.",
    "Up to five unique tracks appear under \"Top Suggested Audio Tracks\", each with its artist, a Mood and a Vibe badge, and a Trending Use line; the \"Listen/Find Track (Playable)\" button opens a Google search for that track and artist. If nothing matched, a Notice banner says no highly specific match was found and general trending suggestions are shown instead.",
  ],
};

export default seo;
