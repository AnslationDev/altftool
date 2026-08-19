const seo = {
  title: "Text Summarizer: Extractive, No AI, In-Browser",
  metaDescription:
    "Pulls the first, middle and last sentences from your text — nothing rewritten, nothing uploaded. Three fixed lengths, with your last 10 summaries kept.",
  steps: [
    "Paste your text under the \"Paste your text\" label and pick short, medium or long — exactly one, two or three sentences of output.",
    "Click Summarize: the tool splits sentences at . ? ! boundaries and keeps them by position (first, middle, last) with no rewriting.",
    "Copy the result or click Download to save it as summary.txt; your last 10 runs stay available under History.",
  ],
  intro:
    "This is an extractive summarizer: it splits your text into sentences at full stops, question marks and exclamation marks, then pulls out sentences by position rather than rewriting anything. Short returns the opening sentence, Medium returns the first and the last, and Long returns the first, the middle and the last, so every word in the summary is a word you wrote. It suits a quick skim of an article, a set of notes or a long email when you want the framing sentences without reading the whole thing.",
  useCases: [
    "You have pasted a long news article and want the lead sentence and the conclusion to decide whether the whole piece is worth reading",
    "You are pulling a one-line gist out of your own meeting notes to drop at the top of a summary email",
    "You are triaging a wall-of-text support message or forum post and need the opening ask and the closing point before you reply",
  ],
  benefits: [
    ["Nothing is invented", "Only sentences that appear in your text can appear in the summary, so there is no risk of a paraphrase drifting from what was actually written."],
    ["Three fixed lengths", "Short, Medium and Long map to exactly one, two and three sentences, so the output length is predictable rather than variable."],
    ["Recent summaries stay to hand", "The last ten summaries are kept during your session so you can compare two passes or recover one you cleared."],
  ],
  faqs: [
    [
      "How does it decide which sentences to keep?",
      "By position, not by meaning. Short takes sentence one; Medium takes the first and the last; Long takes the first, the sentence at the midpoint of the text, and the last. There is no scoring of keywords or importance, which is why it works best on writing that puts its point up front.",
    ],
    [
      "Why did my text come back unchanged?",
      "Because it contained two sentences or fewer. Below that threshold there is nothing to condense, so the original is returned as-is. Sentence boundaries are detected at a full stop, question mark or exclamation mark followed by a space, so text with no terminal punctuation counts as one sentence.",
    ],
    [
      "Does this use AI or send my text to a server?",
      "Neither. The summary is produced by sentence splitting and positional selection running in your browser, so nothing is uploaded — which makes it safe for confidential notes, but also means it will not paraphrase, translate or restructure the way a language model would.",
    ],
    [
      "What kind of text does it work best on?",
      "News writing, reports and structured notes, where the opening sentence states the point and the closing sentence restates or resolves it. It does poorly on dialogue, bulleted lists and text where the key fact sits in the middle, because those sentences are only picked up on the Long setting.",
    ],
  ],
};

export default seo;
