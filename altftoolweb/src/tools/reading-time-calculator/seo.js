const seo = {
  title: "Reading Time Calculator — Words to Minutes, Free",
  h1: "Reading Time Calculator",
  metaDescription:
    "Paste text for reading time at 150–300 WPM plus word, sentence and paragraph counts, keyword density and a difficulty grade. All in your browser.",
  intro:
    "The Reading Time Calculator turns any pasted text into minutes using Math.ceil(words ÷ words-per-minute), with presets of 150, 200, 250 and 300 WPM and a custom field that accepts any value from 1 to 1000. Words are matched with the regular expression /\\b[\\w'-]+\\b/, sentences are split on runs of . ! ?, and paragraphs on blank lines, so counts update on every keystroke. It also reports a separate speaking time fixed at 150 WPM, unique-word vocabulary richness, the top five keywords by density, and a difficulty band from the score (average word length × 0.5) + (average sentence length × 0.3). Every calculation runs in a React useMemo inside your own browser tab — the tool makes no network requests, so your text is never uploaded.",
  useCases: [
    "Add an accurate \"5 min read\" label to a blog post or newsletter before you publish, using the same 200 WPM default most publishing platforms assume.",
    "Time a speech, podcast script or presentation with the dedicated speaking-time figure, which is always calculated at 150 words per minute.",
    "Check a draft's density before handing it over: average sentence length, vocabulary richness and the top five keywords with their percentage density.",
  ],
  benefits: [
    [
      "Twelve metrics from one paste",
      "A single text box produces reading time, speaking time, words, characters, characters without spaces, sentences, paragraphs, average word length, average sentence length, unique words, vocabulary richness and the active WPM — all recalculated live as you type.",
    ],
    [
      "Your own reading speed, not a fixed guess",
      "Switch between Slow (150), Average (200), Fast (250) and Professional (300) WPM, or type any custom rate from 1 to 1000. The reading-time card updates instantly; speaking time stays pinned at 150 WPM for narration.",
    ],
    [
      "Nothing leaves your browser",
      "The page is a client-side React component with no fetch calls, no upload step and no storage — your text lives only in the open tab and disappears when you close or reload it.",
    ],
    [
      "Take the numbers with you",
      "Copy the full report to the clipboard, download it as a .txt file, print it, or use Download PDF, which opens a formatted print-ready page and hands off to your browser's print dialog for Save as PDF.",
    ],
  ],
  faqs: [
    [
      "how long does it take to read 1000 words",
      "Five minutes at the default 200 WPM. The calculator rounds up with Math.ceil, so 1,000 words is exactly 5 minutes and 1,001 words shows as 6. The same 1,000 words come out as 7 minutes at the Slow preset (150 WPM), 4 minutes at Fast (250 WPM) and 4 minutes at Professional (300 WPM).",
    ],
    [
      "what reading speed should I use for a blog post",
      "200 words per minute is the tool's default and the rate most blog \"X min read\" labels assume, so leave it there for general web writing. Drop to 150 WPM for technical documentation or unfamiliar subject matter, and raise it to 250–300 WPM for light or familiar material. Any value from 1 to 1000 can be typed into the custom WPM box.",
    ],
    [
      "what is the difference between reading time and speaking time here",
      "Reading time follows whichever WPM you select; speaking time is always words ÷ 150, rounded up, no matter which preset is active. That gives you a narration or presentation estimate alongside the silent-reading estimate from the same text, which is why the two figures differ.",
    ],
    [
      "how does this tool count words sentences and paragraphs",
      "Words are matched with the regular expression /\\b[\\w'-]+\\b/, so hyphenated and apostrophised forms such as \"well-known\" and \"don't\" each count as one word. Sentences are counted by splitting on one or more of . ! ? and discarding empty fragments, and paragraphs by splitting on two or more consecutive line breaks. Characters are reported both with and without whitespace.",
    ],
    [
      "what does the reading difficulty rating mean",
      "It is a simple length-based score, not Flesch-Kincaid: (average word length × 0.5) + (average sentence length × 0.3). Below 4 is Easy, below 5.5 is Medium, below 7 is Hard, and 7 or above is Very Hard. Each band comes with a plain-language note, such as shortening sentences and replacing jargon for dense text.",
    ],
    [
      "is my text uploaded or stored anywhere",
      "No. The calculator is a client-side component that computes everything in memory in your browser; there is no API call, no upload and no localStorage write anywhere in the code. Reloading the page clears what you pasted and restores the built-in sample text.",
    ],
    [
      "how is keyword density calculated",
      "Density is each word's count ÷ total words × 100, shown to two decimals for the top five terms. Only words of four or more characters qualify, and a built-in stop-word list (the, and, your, with, this and about 50 others) is excluded. A separate Top terms panel shows the six most repeated words of three characters or more using the same stop-word filter.",
    ],
    [
      "is the reading time calculator free and is there a word limit",
      "It is free, needs no account or sign-up, and the text box has no character or word cap in the code — you can paste a full article or chapter. Because the statistics recalculate on every keystroke, extremely long documents will simply feel less snappy while typing.",
    ],
  ],
  steps: [
    "Paste or type your text into the input box. Sample text is loaded to start with — click Clear to empty it, or Sample to bring it back. Word, character and sentence counts update on every keystroke.",
    "Choose a reading speed: Slow (150 WPM), Average (200), Fast (250) or Professional (300), or type your own rate from 1 to 1000 into the custom WPM field.",
    "Read the stat cards for reading time, speaking time, counts, vocabulary richness, difficulty band and keyword density — then Copy results, Download TXT, Download PDF (via your browser's print dialog) or Print report.",
  ],
};

export default seo;
