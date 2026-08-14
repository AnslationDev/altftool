const seo = {
  title: "Video Ad Specs Checker for 10 Social Placements",
  metaDescription:
    "Test a cut's length, frame size, file size and container against Meta, YouTube, TikTok, LinkedIn, X, Snapchat and Pinterest rules, pass or fail per rule.",
  steps: [
    "Enter the cut's \"Length (seconds)\", \"File size (MB)\", \"Frame width (px)\" and \"Frame height (px)\", or press a shape preset such as \"Vertical 1080x1920\" or \"Square 1080x1080\".",
    "Pick the Container — .mp4, .mov, .m4v, .webm, .avi or .mpeg — and tick the entries under \"Placements to check\", from Instagram & Facebook Reels ads to YouTube Bumper ad.",
    "\"Placements this cut can run in\" gives the accepted count, and \"Placement by placement\" names the exact length, aspect, resolution, file size or container rule each failure breaks.",
  ],
  intro:
    "The Video Ad Specs Comparator takes one cut — its length, frame size, file size and container — and tests it against the published upload rules for ten major ad placements across Meta, YouTube, TikTok, LinkedIn, X, Snapchat and Pinterest. Instead of a static table it returns a pass or fail per rule, naming the exact limit each placement breaks, so you know whether you need a new crop, a shorter edit or just a lower bitrate. Built for social and performance marketers deciding how many versions of a hero video they actually have to cut.",
  useCases: [
    "Find out how many placements a single 30-second vertical master can run in before you brief more edits.",
    "Check whether a 1080x1080 square cut will be rejected by Reels and Stories, which only take 9:16.",
    "Diagnose why a file uploads to Meta but fails on LinkedIn, whose ceiling is 200 MB.",
    "Plan a cutdown schedule by seeing which placements need six seconds or less.",
  ],
  benefits: [
    [
      "Rule-level answers",
      "Each placement reports length, aspect, resolution, file size and container separately.",
    ],
    [
      "Ten placements at once",
      "Feed, Reels, Stories, in-stream, bumper, in-feed and sponsored video side by side.",
    ],
    [
      "Performance ranges too",
      "Flags cuts that will upload but sit outside the length each placement actually rewards.",
    ],
  ],
  faqs: [
    [
      "What aspect ratio should a social video ad be?",
      "9:16 for Reels, Stories, TikTok and Snapchat, which are vertical-only; 1:1 or 4:5 for the Meta and LinkedIn feed, where 4:5 fills the most screen without cropping; and 16:9 for YouTube in-stream. One 9:16 master plus one 4:5 crop covers the majority of placements.",
    ],
    [
      "How long can a video ad be?",
      "It depends entirely on the placement: a YouTube bumper is capped at 6 seconds, Stories ads at 60 seconds, TikTok in-feed at 60 seconds, X promoted video at 140 seconds, and the Meta feed accepts up to 241 minutes. Uploading is not the same as performing — most placements reward 15 seconds or less.",
    ],
    [
      "Why does my video ad get rejected for file size?",
      "LinkedIn's 200 MB ceiling and TikTok's 500 MB ceiling are the two that catch people out, because Meta allows up to 4 GB. Re-encoding to H.264 at a delivery bitrate rather than uploading a ProRes or high-bitrate master almost always solves it without visible quality loss.",
    ],
    [
      "Do these specifications change?",
      "Yes, frequently, and some limits also vary by country, campaign objective and buying type. Use this as a first-pass check and confirm against the platform's current specification page before a campaign goes live.",
    ],
  ],
};

export default seo;
