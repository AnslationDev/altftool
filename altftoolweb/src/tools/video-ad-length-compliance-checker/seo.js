const seo = {
  title: "Video Ad Length Checker: YouTube, Reels, TikTok",
  metaDescription:
    "Test one cut against the accepted min–max and recommended length of every placement you tick, find a single master-cut window, and convert to frames.",
  steps: [
    "Enter the clip length in the 'Clip length (seconds or mm:ss)' field, or switch 'How do you know the length?' to Frame count and pick a 'Frame rate (fps)' from 23.976 to 60 fps.",
    "Tick the placements under 'Placements to check' — each checkbox shows its accepted length range — or add a whole platform at once with the '+ all YouTube'-style buttons.",
    "Read the 'Placements cleared' count, the per-placement Pass/Warning/Reject table with its Trim/extend column, and the 'One cut clears everything between' window; 'Copy report' copies the full report.",
  ],
  intro:
    "This checker takes one video ad duration and tests it against the accepted minimum and maximum length of each placement you plan to buy, plus the shorter band each platform recommends in its own creative guidance. It also works out whether a single master cut could clear every placement at once, converts the length to frames at your delivery frame rate, and shows the nearest standard broadcast slot. It is aimed at media buyers and editors doing a pre-flight check before delivery.",
  useCases: [
    "Confirming a 6-second bumper is exactly 6 seconds before uploading to Google Ads, where a single extra frame is rejected",
    "Finding the one length that clears Reels, TikTok in-feed and Meta feed so you deliver one master instead of three",
    "Checking whether a 28-second social cut can be trafficked into a 30-second CTV slot or needs re-cutting",
  ],
  benefits: [
    ["Hard limits and soft advice split", "Shows separately what a platform rejects and what it merely discourages."],
    ["One-cut window", "Calculates the overlapping length range across every placement you tick."],
    ["Frames as well as seconds", "Converts at 23.976 through 60 fps so you can check the timeline, not just the clock."],
  ],
  faqs: [
    [
      "How long can a YouTube bumper ad be?",
      "Six seconds, and that is a hard cap — the format is non-skippable and Google Ads rejects assets over 6 seconds outright. Bumpers also cannot be skipped, so the whole message has to land inside those six seconds.",
    ],
    [
      "What is the maximum length of an Instagram Reels ad?",
      "Reels ads run up to 90 seconds. Stories ads are capped at 60 seconds and anything over 15 seconds is split into consecutive story cards on playback, so the natural unit is still 15 seconds.",
    ],
    [
      "What is the shortest video TikTok will accept as an in-feed ad?",
      "Five seconds. TikTok's in-feed ad spec accepts 5 to 60 seconds, and its own creative guidance points at 9 to 15 seconds because completion falls sharply beyond that.",
    ],
    [
      "Can I use one video for every social placement?",
      "Often yes for length, rarely for framing. Tick the placements you plan to run and the tool shows the overlapping length window — for example a cut between 5 and 6 seconds clears a YouTube bumper and TikTok in-feed together. Aspect ratio and safe zones still differ, so the same length may still need separate crops.",
    ],
  ],
};

export default seo;
