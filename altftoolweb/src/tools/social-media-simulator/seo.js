const seo = {
  title: "Social Media Post Preview for Seven Feeds",
  metaDescription:
    "Preview one draft as an X, Bluesky, Mastodon, Threads, Instagram, LinkedIn and Facebook card, with each platform's own count and where the feed crops.",
  steps: [
    "Type the draft into 'Post body' and fill 'Display name', 'Handle' and, for LinkedIn, 'Headline or subtitle'.",
    "Pick a network under 'Preview as' — X, Bluesky, Mastodon, Threads, Instagram, LinkedIn or Facebook — and the meter recounts using that platform's own rule, charging a flat 23 units for any link on X and Mastodon.",
    "The mock card marks what sits behind 'see more', 'What is in the post' lists Graphemes, Code points, UTF-8 bytes, Links, Hashtags, Mentions and Emoji, and 'The same post everywhere' tables all seven; press 'Copy report' to save it.",
  ],
  intro:
    "Write a post once and see what seven networks will actually do to it. This renders your draft as a mock feed card for X, Bluesky, Mastodon, Threads, Instagram, LinkedIn and Facebook, and counts it the way each one genuinely counts: X through the twitter-text weighted-length algorithm, where most Latin characters cost one unit, CJK and emoji cost two, and any link is charged a flat 23 whatever its length; Bluesky against both a 300-grapheme and a 3000-byte cap; Mastodon charging 23 per link and ignoring the server half of a remote mention. It also marks where the feed crops the body, so you can see which sentence — or which link — ends up hidden behind 'see more'. Everything runs in the browser on the text you typed. No account, no API call, nothing uploaded.",
  useCases: [
    "You wrote one announcement for every channel and want to know before scheduling it which platforms will cut it off mid-sentence and where",
    "A caption is packed with emoji and a long tracking URL, and the X composer says it is over 280 while your character counter says it is fine — the weighted count shows exactly where the extra units went",
    "You put the call-to-action link at the bottom of a LinkedIn post and want to check whether it falls above or below the point where the feed stops showing text",
  ],
  benefits: [
    ["The real counting algorithms, not a length check", "Weighted units for X, grapheme clusters plus a UTF-8 byte cap for Bluesky, flat link cost for Mastodon and X, plain code points elsewhere — each modelled from the platform's own rule."],
    ["Shows the crop, not just the cap", "Instagram, LinkedIn and Facebook cut the visible body long before their character limits. The preview highlights exactly which text, links and hashtags land on the wrong side of that cut."],
    ["Nothing leaves the page", "There is no login, no scheduling integration and no upload. The draft is analysed in your browser, so unpublished copy stays unpublished."],
  ],
  faqs: [
    [
      "Why does X say my post is longer than the character count I see elsewhere?",
      "Because X does not count characters. It runs the twitter-text weighted algorithm: every code point costs 200 units except four ranges that cost 100, and the total is divided by 100. In practice that means Latin, Arabic and Devanagari text costs 1 per character while emoji, Chinese, Japanese and Korean all cost 2. A link is separately replaced by a flat 23 units because it is rewritten to a t.co address, so a 90-character tracking URL costs the same as a 12-character one.",
    ],
    [
      "Are the crop points exact?",
      "No, and the page says so where it shows them. Character caps are published limits and are exact. The point at which the feed replaces the rest of a post with 'more' is rendering behaviour that varies with viewport width, font size and the app version, so the figures used here — roughly 125 characters on Instagram, 210 on LinkedIn desktop and around 140 on mobile, 477 on Facebook — are the commonly observed cut points, not guarantees.",
    ],
    [
      "Does it post, schedule or connect to my accounts?",
      "None of those. It never asks for a login and makes no network request at all. It is a preview and a length checker, so you copy the finished text into whichever composer or scheduler you already use.",
    ],
    [
      "How are emoji and flags counted?",
      "As one user-perceived character wherever the platform does. A family emoji built from four people joined by zero-width joiners, or a flag built from two regional indicators, is a single grapheme cluster, so Bluesky and the grapheme counters treat it as one. X treats the same cluster as one emoji at the full double weight, so it costs 2 of the 280. Byte counts are separate again: that family emoji is 25 UTF-8 bytes, which is why a long emoji-heavy Bluesky post can hit the 3000-byte cap before the 300-character one.",
    ],
  ],
};

export default seo;
