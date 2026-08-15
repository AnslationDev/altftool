const seo = {
  title: "Hashtag Generator From Your Caption",
  metaDescription:
    "Build a hashtag set from the words in your own caption, capped to each platform limit: 30 on Instagram, 15 on YouTube, one on Threads.",
  steps: [
    "Paste the caption into Post copy or topic - hashtags you already typed with a # are kept and cleaned.",
    "Pick a Platform (Instagram caps at 30, YouTube at 15, Threads at 1), set How many hashtags, add Extra keywords (optional), and choose lowercase or CamelCase Casing.",
    "Read the generated set with each tag's reach band, the Where each hashtag came from list and the Platform rules panel, then press Copy hashtags.",
  ],
  intro:
    "This hashtag builder reads the post you paste, pulls out the phrases and keywords it actually contains, and turns them into a hashtag set sized for the platform you are publishing on — 30 on an Instagram post, 15 before YouTube ignores every hashtag on a video, one topic tag on Threads. Each tag is sorted into a reach band by how it was built: a two-word phrase lifted from your copy is specific, a repeated single keyword is topical, and a keyword joined to a community word such as tips or daily is broad. It is for creators and social managers writing the caption right now, and it runs entirely in your browser, so nothing you paste leaves the page.",
  useCases: [
    "Check a finished Instagram caption plus its tag block against the 2,200-character caption limit before the app truncates it.",
    "Turn a single topic word into a spread of phrase, keyword and community hashtags instead of retyping the same five tags on every post.",
    "Trim a 40-tag block down to the 15 YouTube allows, since going over makes YouTube ignore all of them.",
    "Clean up hashtags pasted from a doc — spaces, hyphens and punctuation are stripped to the characters the platforms accept.",
  ],
  benefits: [
    [
      "Built from your words, not a stock list",
      "Every hashtag names the phrase or keyword in your copy that produced it, so you can see why it is there.",
    ],
    [
      "Real platform limits",
      "Hashtag caps and caption budgets come from the platforms' published rules, including the YouTube 15-tag rule and the single topic tag on Threads.",
    ],
    [
      "No invented popularity numbers",
      "There is no trend feed here and the tool never shows a made-up reach or engagement score — reach bands describe how a tag was constructed.",
    ],
  ],
  faqs: [
    [
      "How many hashtags can you put on an Instagram post?",
      "Thirty. Instagram allows up to 30 hashtags on a post and another 30 on a comment, which is why many accounts move the tag block into the first comment. Going over does not silently drop the extras — the caption or comment is rejected. Instagram's own creator guidance suggests 3 to 5 rather than filling all 30.",
    ],
    [
      "What happens if a YouTube video has more than 15 hashtags?",
      "YouTube ignores every hashtag on that video, not just the ones past the fifteenth. The first three hashtags in the description are also the ones displayed above the video title, so order matters.",
    ],
    [
      "Does this tool know which hashtags are trending?",
      "No. It has no network access and no search-volume data, so it cannot tell you how many posts use a tag or whether a tag is restricted. It builds tags from your own copy, checks them against each platform's published limits, and labels their breadth by how they were constructed. Search a shortlisted tag inside the app itself before committing to it.",
    ],
    [
      "Should hashtags be lowercase or CamelCase?",
      "Either — hashtags are case-insensitive, so #slowmorning and #SlowMorning reach the same feed. CamelCase is the accessible choice, because screen readers pronounce the separate words instead of running them together, which is why accessibility guidance recommends it for multi-word tags.",
    ],
  ],
};

export default seo;
