const seo = {
  title: "Video Script Timer: Words to Minutes at 130-250",
  metaDescription:
    "Paste a script to see its read-aloud time at five speaking rates from 130 to 250 WPM, with a 2-second pause added per 45 seconds of speech.",
  steps: [
    "Paste your script into the 'Paste or type your script here...' box — the word and character count updates below it as you type.",
    "Pick a 'Speaking Speed' button from 130 to 250 WPM and tick 'Include pauses for punctuation and paragraph breaks (~2s per 45s of speech)' if you want breathing room counted.",
    "Read the 'Estimated Duration' panel — Total Duration, Speaking Time, Pauses and Speaking Rate tiles — and press Copy to grab the summary.",
  ],
  intro:
    "The Video Script Timer estimates how long a script will take to read aloud by dividing its word count by a speaking rate of 130 to 250 words per minute, then adding a 2-second pause allowance for every 45 seconds of speech. Paste a script and you get total duration, pure speaking time, the number of pauses added and the rate used, all recalculating as you type. It is for voiceover artists, YouTubers, presenters and course creators who need to hit a slot before they step to the mic.",
  useCases: [
    "You are writing a 60-second explainer for a paid ad slot and need to know how many words to cut before recording rather than after.",
    "A podcast intro has to land under 90 seconds at your usual unhurried delivery, so you set the rate to 130 WPM and trim until the estimate fits.",
    "You are quoting a voiceover job by finished minute and want a duration figure from the client's script before you agree a price.",
  ],
  benefits: [
    [
      "Pauses are counted, not ignored",
      "Word-count timers assume you never breathe; this one adds 2 seconds per 45 seconds of speech, which is usually the difference between fitting a slot and overrunning it.",
    ],
    [
      "Five named delivery speeds",
      "130 WPM podcast, 150 conversational, 175 standard, 200 fast and 250 rapid, so you time against how you actually talk rather than one generic average.",
    ],
    [
      "Speaking time and total shown separately",
      "You can see how much of the runtime is words and how much is the pause allowance, which tells you whether to cut copy or tighten delivery.",
    ],
  ],
  faqs: [
    [
      "How many words is a 60-second video script?",
      "About 145 words at the 150 WPM conversational rate with pauses enabled, or 150 words if you read straight through with no pause allowance. At the 175 WPM standard rate the same minute holds roughly 170 words.",
    ],
    [
      "How long does it take to read 500 words aloud?",
      "Roughly 2 minutes 57 seconds at the 175 WPM standard setting: 171 seconds of speech plus 3 pauses totalling 6 seconds. At the 130 WPM podcast setting the same script stretches to about 4 minutes 1 second.",
    ],
    [
      "How is the pause allowance calculated?",
      "It adds 2 seconds for every complete 45 seconds of speaking time, so a 3-minute read gains about 8 seconds. Untick the option and the estimate is pure word count divided by rate, which suits tightly edited scripts where every breath is cut.",
    ],
    [
      "Does choosing a different language change the duration?",
      "No. The language selector reports an average syllables-per-word figure for reference — 1.5 for English, 2.2 for Spanish, 1.1 for Mandarin — but the duration is driven entirely by word count and the words-per-minute rate you pick. For a syllable-dense language, lower the WPM setting to compensate.",
    ],
  ],
};

export default seo;
