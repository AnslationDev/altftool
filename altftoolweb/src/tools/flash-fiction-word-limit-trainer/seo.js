const seo = {
  title: "Flash Fiction Word Counter: 50-1000 Word Limits",
  metaDescription:
    "Count words against drabble (100), dribble (50) and 300/500/1000-word contest caps, with hyphen rules plus the intensifiers and hedges to cut first.",
  steps: [
    "Pick a 'Form / limit' — Dribble exactly 50, Drabble exactly 100, Micro fiction up to 300, Flash fiction up to 500, Long flash up to 1000 — or set a custom limit between 10 and 5,000 words.",
    "Paste the story body into 'Your draft'; toggle 'Count each half of a hyphenated compound separately' only if your contest counts them as two words.",
    "Watch the live word count against the budget and the 'Cut these first' table of flagged intensifiers, hedges and filter verbs, then click 'Copy report'.",
  ],
  intro:
    "A live word counter built around the fixed limits flash fiction actually uses — 50 words for a dribble, exactly 100 for a drabble, and 300, 500 or 1000 word ceilings for competitions. It counts by the standard submission rule (a hyphenated compound is one word, numerals count as one), then flags the intensifiers, hedges and filter verbs that are usually the first thing to cut when you are over budget.",
  useCases: [
    "Write a drabble to the exact 100-word requirement and confirm the count matches before submitting.",
    "Trim a 640-word draft down to a 500-word contest cap by cutting the flagged filler first.",
    "Check how long a piece runs when read aloud before entering an open-mic or recording a podcast segment.",
    "Practise compression by setting a custom limit and rewriting the same scene at 300, 150 and 75 words.",
  ],
  benefits: [
    ["Counts the way contests count", "Hyphenated compounds count as one word by default, with a toggle for guidelines that say otherwise."],
    ["Tells you what to cut", "Groups every flagged word as an intensifier, hedge, filter verb, empty adverb or throat-clearing, with the reason."],
    ["Exact-length forms handled", "For a drabble or dribble the tool demands the precise number rather than treating it as a ceiling."],
  ],
  faqs: [
    [
      "How many words is flash fiction?",
      "There is no single number, but the common bands are 50 words (dribble), exactly 100 (drabble), up to 300 (micro fiction) and up to 500 or 1000 words for most competitions. Anything above roughly 1,000 words is usually called a short story rather than flash.",
    ],
    [
      "Does a hyphenated word count as one word or two?",
      "Most competitions count a hyphenated compound such as 'well-lit' as a single word, which is the default here. A minority split it, so read the guidelines and flip the toggle if your target publication says two.",
    ],
    [
      "Does the title count towards the word limit?",
      "Usually not — the majority of journals and competitions exclude the title and any byline from the count. Paste only the body of the story here, and check the specific guidelines because a few competitions do include the title.",
    ],
    [
      "How long does it take to read 500 words aloud?",
      "About three and a half to four minutes at an unhurried 130 words per minute, which is the pace this tool uses for its read-aloud estimate. Silent reading is much faster: roughly 238 words per minute for English fiction, the average reported in Brysbaert's 2019 review of reading-rate research.",
    ],
  ],
};

export default seo;
