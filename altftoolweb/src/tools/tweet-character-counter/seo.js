const seo = {
  title: "Tweet Character Counter — 280 Limit and Posts Needed",
  metaDescription:
    "Live count against the 280-character post limit: how many characters remain or overshoot, plus words, lines and how many posts a long draft needs.",
  intro:
    "The Tweet Character Counter counts your text against the standard 280-character post limit and tells you how many characters are left or how many you are over, alongside the word count, line count, and how many posts the text would need if split at 280 characters each. Paste or type a draft and the numbers update as you write, so you can trim before you hit the composer. It is for anyone writing a post, a thread or an ad line where the cut-off matters more than the prose.",
  useCases: [
    "You have written a 340-character announcement and need to know exactly how many characters to cut to land inside a single post rather than a thread.",
    "You are drafting a thread and want to see up front that the text needs four posts, so you can decide where the natural breaks fall.",
    "A client approved copy in a document and you need to confirm it fits before it goes into the scheduler, where the limit is enforced without warning.",
  ],
  benefits: [
    [
      "Overshoot stated as a number",
      "Past 280 it reports exactly how many characters over you are, rather than just refusing to accept the text.",
    ],
    [
      "Thread length worked out for you",
      "The post count is the character count divided by 280 and rounded up, so a long draft immediately tells you how many parts it becomes.",
    ],
    [
      "Words and lines counted alongside",
      "Line breaks matter to how a post renders, and they are counted here with the characters instead of being invisible until you paste.",
    ],
  ],
  faqs: [
    [
      "What is the character limit for a tweet?",
      "280 characters for a standard post — doubled from the original 140 in 2017. Paid subscription tiers on X allow considerably longer posts, but 280 remains the limit that unpaid accounts and most scheduling tools enforce, and it is the limit counted here.",
    ],
    [
      "Do links count towards the 280 characters?",
      "Yes, but X counts every link as a fixed length regardless of how long the URL is, because links are wrapped by its own shortener — currently 23 characters. This counter measures your raw text, so a long URL in your draft will read as more characters here than X will actually charge you.",
    ],
    [
      "Do emoji and non-Latin characters count as one character?",
      "Not always on X. Its weighted counting charges two units for characters in ranges such as Chinese, Japanese, Korean and some symbols, and an emoji can consume more than one unit. This tool counts characters directly, so treat the figure as a close guide and leave a small margin when your text is emoji-heavy or not in Latin script.",
    ],
    [
      "How many tweets do I need for a long post?",
      "Divide the character count by 280 and round up — 900 characters becomes 4 posts, which is what the tweets-needed row reports. In practice allow a little extra per post for numbering like 1/4 and for any handles you tag at the start.",
    ],
  ],
};

export default seo;
