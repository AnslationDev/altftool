const seo = {
  intro:
    "The YouTube Video Analyzer works on the two things you can actually hold in your hand: the link, and the metadata you wrote. It pulls the 11-character video id out of any YouTube URL shape — watch, youtu.be, Shorts, embed, live, legacy /v/ — reads the t, start, end, list and index parameters, separates playback parameters from tracking ones such as the si token the share button now appends, and rebuilds the canonical watch link, the timestamped share link, the youtube-nocookie embed and the fixed i.ytimg.com thumbnail paths. Paste your title and description as well and they are measured against YouTube's published limits: 100 characters for a title, 5000 for a description, 15 hashtags before all of them are ignored, and the three chapter rules — first marker at 0:00, at least three markers, every chapter 10 seconds or longer. Everything runs locally in the page; it never contacts YouTube, so it cannot report view counts, durations, channel names or publish dates.",
  useCases: [
    "Strip the si= share token and feature= parameter off a link before pasting it into a newsletter, brief or public document.",
    "Work out why your chapters are not showing up, by checking the first marker, the count and every chapter length against YouTube's rules.",
    "Generate a youtube-nocookie embed with rel=0 and a start time for a site that has to keep cookies off the page until the viewer presses play.",
    "Check a title someone dictated to you over the phone: an id whose last character is not one of the 16 legal terminators has been mistyped.",
  ],
  benefits: [
    [
      "Every URL shape handled",
      "watch, youtu.be, Shorts, embed, live, legacy /v/ and /e/, attribution_link wrappers, playlists and clips are each recognised and named.",
    ],
    [
      "Structural id validation",
      "A YouTube id is a 64-bit value in 11 base64url characters, which restricts the final character to 16 of the 64 symbols — a typo is caught before you publish the link.",
    ],
    [
      "Nothing leaves the page",
      "No API key, no quota, no request to YouTube, and no fabricated view counts standing in for data the page cannot see.",
    ],
  ],
  faqs: [
    [
      "Why does this not show the video's title, views or duration?",
      "Because it never calls YouTube. Reading a title or a view count requires a request to the YouTube Data API or a scrape of the watch page, and this tool deliberately does neither — every figure on the page is derived from the text you paste. If you want the title and description audited, copy them out of YouTube Studio and paste them in.",
    ],
    [
      "What is the si= parameter that YouTube adds to shared links?",
      "It is a share-session token attached by the copy-link button, which ties the click back to the share event. It is not needed for playback, so the clean watch link and short share link this tool rebuilds both leave it out, along with feature=, pp=, ab_channel= and any utm_ parameters that came along for the ride.",
    ],
    [
      "How can the tool tell a video id is invalid without checking YouTube?",
      "It checks structure, not existence. Ids are 11 characters from the base64url alphabet encoding a 64-bit number, so the last character carries only four significant bits and its alphabet index is always a multiple of four — leaving exactly 16 characters that can end an id. A well-formed id can still point at a deleted or private video; the tool says so rather than implying otherwise.",
    ],
    [
      "What are YouTube's chapter rules exactly?",
      "Three of them. The first timestamp in the description must be 0:00, there must be at least three timestamps in ascending order, and each resulting chapter must run for at least ten seconds. Break any one and YouTube silently renders the timestamps as ordinary links instead of chapters. The tool checks all three and, if you enter the video's total run time, measures the final chapter too.",
    ],
  ],
};

export default seo;
