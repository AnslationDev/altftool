const seo = {
  title: "Podcast Description Writer with Chapter",
  metaDescription:
    "Assembles summary, takeaways, chapters, links and CTA, then checks the 4,000-char Apple/Spotify limit, 5,000 on YouTube, and chapter rules.",
  steps: [
    "Fill What the episode is about, Guest name and Focus phrase, then paste Takeaways, one per line and Chapters, one per line as \"0:00 Label\".",
    "Read the Description length counter and the Platform / Limit / Remaining table for Apple Podcasts, Spotify (4,000) and YouTube (5,000), plus Chapters parsed and Focus phrase in the preview.",
    "Fix anything in the flagged list — a first chapter not at 0:00, fewer than three timestamps, a chapter under 10 seconds — then press Copy description to take the Draft description.",
  ],
  intro:
    "A podcast episode description is the block of text that has to sell the episode in a list view and stay findable in search, and this writer assembles one from your notes in a fixed order: summary first, then takeaways, chapters, links and a call to action. It then checks the result against the 4,000-character description limit used by Apple Podcasts and Spotify, the 5,000-character limit on a YouTube description, the YouTube chapter rules, and whether your focus phrase lands in the opening text a listener actually sees. Aimed at independent podcasters publishing to several platforms from one set of show notes.",
  useCases: [
    "Turn a rough list of talking points into a publishable description without rewriting the same structure every week.",
    "Confirm a video version's chapter list will actually register, since YouTube needs a 0:00 start, at least three timestamps and ten seconds per chapter.",
    "Check that the guest's name and the episode subject appear in the first 150 characters, which is roughly all a podcast app shows before 'more'.",
    "Spot a description that has drifted past 4,000 characters after links and sponsor copy were added.",
  ],
  benefits: [
    ["Structure that holds up", "Summary, takeaways, chapters, links, call to action — the order search and listeners both read best."],
    ["Real platform limits", "4,000 characters for Apple Podcasts and Spotify, 5,000 for YouTube, checked live as you type."],
    ["Chapter validation", "Timestamps are parsed and tested against the rules that decide whether chapters appear at all."],
  ],
  faqs: [
    [
      "How long should a podcast episode description be?",
      "Aim for 200 to 800 characters of real summary before the links and chapters. The hard ceiling is 4,000 characters on Apple Podcasts and Spotify and 5,000 on YouTube, but most apps only show around the first 150 characters before a 'more' tap, so the opening sentence carries the most weight.",
    ],
    [
      "What are the YouTube chapter requirements?",
      "The first timestamp must be 00:00, there must be at least three timestamps in ascending order, and each chapter must run for at least 10 seconds. If any of those fails, YouTube silently shows no chapters at all.",
    ],
    [
      "Where should the keyword go in an episode description?",
      "In the first sentence, phrased the way someone would say it out loud. Repetition beyond two or three natural mentions does not help and reads badly to a human, which matters more here because the description is short enough to be read in full.",
    ],
    [
      "Should the description include links and timestamps?",
      "Yes, but below the summary. A description that opens with a URL wastes the preview space that decides whether anyone presses play, and some directories strip or linkify markup differently, so keep plain text near the top.",
    ],
  ],
};

export default seo;
