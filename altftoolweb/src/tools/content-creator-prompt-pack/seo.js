const seo = {
  intro:
    "Content Creator Prompt Pack turns a topic, a target runtime and a speaking pace into a complete AI prompt for hooks, full scripts, titles and thumbnail text, descriptions with chapters, or a repurposing plan. The word budget is calculated directly from runtime and pace using words = seconds ÷ 60 × words-per-minute, so the script the AI returns actually fits the cut. Each prompt also carries the target platform's published title, caption and hashtag limits.",
  useCases: [
    "Get ten different opening hooks for the same 30-second Reel instead of rewriting one line twenty times.",
    "Write a 45-second script that comes in at the right length because the word budget was set before drafting.",
    "Generate eight YouTube title options that all stay inside the 100-character title limit.",
    "Break one long-form video into a week of shorts, a LinkedIn post and a carousel with a plan for what changes in each.",
  ],
  benefits: [
    ["Length that survives the edit", "The word budget comes from arithmetic on your runtime and pace, not a vague 'keep it short'."],
    ["Real platform ceilings", "Instagram's 2,200-character caption and 30 hashtags, YouTube's 100-character title, X's 280 characters."],
    ["No invented facts", "The prompt forbids statistics and quotes you did not supply and asks for a [CHECK] marker instead."],
  ],
  faqs: [
    [
      "How many words is a 60-second video script?",
      "About 145 words at a normal conversational pace of 145 words per minute, or roughly 175 words if you deliver it at short-form energy. The formula is words = seconds ÷ 60 × words-per-minute, so a 30-second Reel at 175 wpm needs about 88 words.",
    ],
    [
      "How long can an Instagram caption be?",
      "Instagram allows up to 2,200 characters and 30 hashtags per post, but the feed collapses the caption after roughly 125 characters. Put the hook and any call to action before that break so people see it without tapping 'more'.",
    ],
    [
      "What is the character limit for a YouTube title?",
      "100 characters, and YouTube truncates the visible part sooner in search and on mobile — around 60 characters is the safe zone for the words that must be read. Descriptions allow up to 5,000 characters, with only the first ~157 shown above the fold.",
    ],
    [
      "How fast should I speak in a short-form video?",
      "Short-form delivery usually lands between 160 and 200 words per minute, versus 120 to 150 for an explainer or a podcast. Faster delivery buys you more content per second but reduces comprehension, so slow down for anything with numbers or instructions in it.",
    ],
  ],
};

export default seo;
