const seo = {
  intro:
    "A filler word detector scans prose for the four kinds of padding that weaken it: intensifiers such as very and really that prop up a weak word instead of replacing it, hedges such as just and I think that withdraw the claim, filler adverbs such as basically and obviously, and wordy phrases such as \"due to the fact that\" that use five words for one. It reports how many appear per 100 words, marks every hit in your text, gives a specific fix for each, and produces a stripped draft with the safely deletable ones removed and the wordy phrases swapped for their short forms.",
  useCases: [
    "Cut an email from 38 words to 21 before sending it, without changing what it says.",
    "Find that 'just' appears six times in a 400-word cover letter and is apologising for the whole application.",
    "Replace 'due to the fact that' with 'because' and 'in order to' with 'to' across a report in one pass.",
    "Check a personal statement against a word limit by seeing exactly how many words the padding is costing.",
  ],
  benefits: [
    ["A fix, not just a flag", "Every hit says whether to delete it, what to replace it with, or why it is a judgement call."],
    ["Clean punctuation", "Deletions take the commas that only existed to fence the filler off, so the stripped draft still reads."],
    ["Density in context", "Reports filler per 100 words against a stated band rather than a bare count."],
  ],
  faqs: [
    [
      "What are filler words in writing?",
      "Words that add length without adding meaning. In written prose they fall into four groups: intensifiers (very, really, extremely), hedges (just, kind of, I think), filler adverbs (basically, actually, obviously) and wordy phrases (in order to, due to the fact that).",
    ],
    [
      "Why should I remove 'very' and 'really'?",
      "Because they usually signal that the adjective is doing too little work. \"Very cold\" is weaker than \"freezing\" and one word longer; deleting the intensifier either loses nothing or exposes an adjective that needs replacing, and both outcomes improve the sentence.",
    ],
    [
      "Is 'just' really a problem word?",
      "In requests and professional writing, often yes — \"I just wanted to check\" apologises for the message before it starts. It is not always wrong, but if it appears three or more times in a short piece it has stopped being a choice and become a tic.",
    ],
    [
      "How many filler words is too many?",
      "This tool treats under two per 100 words as tight, two to four as ordinary, and above four as worth a cutting pass — an editorial judgement rather than a published standard. Dialogue and first-person voice legitimately run higher, because people hedge when they speak.",
    ],
  ],
};

export default seo;
