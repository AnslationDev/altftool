const seo = {
  intro:
    "The Bionic Reading Converter bolds the opening characters of every word in your text — by default the first 45% of each word, adjustable from 25% to 75% — so the eye has a fixed anchor at the start of each word. The underlying words are untouched; only the weight of the first few letters changes, and you can compare the emphasised view against the original at any time. It is aimed at readers who want to try front-loaded emphasis on their own material and judge for themselves whether it helps.",
  useCases: [
    "You have a long article to get through and want to test whether emphasising the first part of each word makes it easier to hold your place, so you paste a few paragraphs and try 35%, 45% and 60%.",
    "A student with a reading difficulty wants to see a study passage in a different visual treatment before deciding to ask for it as an accommodation.",
    "You are preparing handout text and want to view it with word-initial emphasis to see how heavy the page looks before choosing a formatting style for the printed version.",
  ],
  benefits: [
    ["The emphasis strength is yours to set", "The bolded prefix runs from 25% to 75% of each word in 5% steps, so you can find a level that helps instead of accepting one fixed setting."],
    ["Nothing is rewritten", "Words, punctuation and spacing are preserved exactly; only the font weight of the leading characters changes, so the passage stays readable to anyone else."],
    ["Short words stay legible", "The prefix length rounds up with a minimum of one character, so a two-letter word gets one bold letter rather than the whole word turning bold."],
  ],
  faqs: [
    [
      "What is bionic reading?",
      "It is a text-display technique that bolds the first part of each word so the reader's eye fixates there and the brain completes the rest. It is a formatting style, not a proven treatment — independent studies have not consistently shown faster reading, so treat it as a preference to test rather than a guaranteed improvement.",
    ],
    [
      "How much of each word gets bolded?",
      "45% by default, rounded up, with a floor of one character. You can move it anywhere from 25% to 75% — so in a six-letter word, 45% bolds three letters and 25% bolds two.",
    ],
    [
      "Can I copy the bolded text into a document?",
      "The copy button returns your original plain text, because the emphasis is applied as on-screen styling rather than embedded formatting. To carry the look into a document you would need to apply bold formatting there yourself.",
    ],
    [
      "Does this help people with dyslexia?",
      "There is no reliable evidence that it does, and reading research has not found a consistent benefit. Some readers still find it comfortable, so it is worth trying, but for a diagnosed reading difficulty an educational psychologist or specialist teacher should guide which supports to use.",
    ],
  ],
};

export default seo;
