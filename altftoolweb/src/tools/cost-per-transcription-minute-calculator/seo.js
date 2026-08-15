const seo = {
  title: "Transcription Cost Calculator: Per Minute + AI",
  metaDescription:
    "Combine speech-to-text billed per audio minute with per-token summarisation and optional proofing to get cost per minute, per hour and per file.",
  steps: [
    "Set Number of recordings, Minutes per recording, Speech-to-text price per audio minute and Speaking rate, or tap the Conversation 150 wpm preset.",
    "Tick Summarise the transcript to add Instruction tokens per file, Summary length (% of transcript) and the input and output token prices per 1M.",
    "Read Cost per audio minute with the estimated transcript words and tokens, speech-to-text, summarisation and proofing costs, then Copy result.",
  ],
  intro:
    "This calculator works out what one minute of recorded audio costs to process end to end, combining speech-to-text billed per audio minute with language-model summarisation billed per token. It converts audio duration into an estimated transcript using your speaking rate, then applies the standard English approximation of roughly three-quarters of a word per token to size the input and output token bills. Useful for podcast teams, support and sales-call analysts, researchers and anyone budgeting a transcription pipeline before turning it on.",
  useCases: [
    "Budget a support pipeline that transcribes and summarises 400 call hours a month.",
    "Compare a $0.006 per minute speech-to-text API against a flat monthly plan at your real volume.",
    "Show finance the per-file cost of transcribing a 45-minute interview with an AI summary attached.",
    "Test whether adding human proofing at 4x real time changes the unit cost more than switching models.",
  ],
  benefits: [
    ["Two pricing units, one answer", "Per-audio-minute transcription and per-token summarisation are normalised to a single cost per minute."],
    ["Transcript size is derived", "Speaking rate turns duration into words and tokens, so you do not need a transcript to estimate token spend."],
    ["Shows where the money goes", "A share breakdown makes it obvious when human proofing, not the API, is the real cost driver."],
  ],
  faqs: [
    [
      "How much does it cost to transcribe one hour of audio?",
      "Multiply the price per audio minute by 60. At $0.006 per minute that is $0.36 an hour for speech-to-text alone; adding an AI summary of a 9,000-word transcript typically costs well under a cent more at current small-model token prices. Human proofing is usually the largest line item once it is involved.",
    ],
    [
      "How many words are in an hour of audio?",
      "About 9,000 words at a conversational 150 words per minute. Dictated or slow speech runs nearer 110 words per minute (6,600 words an hour) and fast interviews around 180 (10,800 words an hour), which is why the speaking rate is an input here rather than a fixed assumption.",
    ],
    [
      "How do I convert a transcript into tokens?",
      "Divide the word count by about 0.75, since one token averages roughly four characters or three-quarters of an English word. A 9,000-word hour is therefore around 12,000 tokens. Non-English text, code and heavy punctuation tokenise less efficiently, so treat this as an estimate rather than an exact count.",
    ],
    [
      "How long does it take to proofread a transcript by hand?",
      "Commonly quoted ratios run from about 2x to 6x real time depending on audio quality and the number of speakers, so a one-hour recording can take two to six hours to clean fully. Enter your own measured minutes per audio hour rather than a default, as this figure dominates the total when a person is paid to do it.",
    ],
  ],
};

export default seo;
