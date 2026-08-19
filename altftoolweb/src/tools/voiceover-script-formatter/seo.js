const seo = {
  title: "Voiceover Script Formatter: Timecoded Cue Sheet",
  steps: [
    "Paste the narration into the Script box, keeping any stage direction in [square brackets] on its own line.",
    "Set 'Words per cue (max)' between 5 and 120 and 'Reading pace (words per minute)' - or press the Slow / audiobook 130, Standard narration 150, Conversational 165 or Fast / promo 185 chip - and a Cue label prefix such as CUE.",
    "The Cue sheet numbers each block with its start timecode, word count and seconds and marks bracketed lines 'not spoken', while Estimated read time, Cues generated and Longest cue sit above; 'Copy cue sheet' copies the formatted script.",
  ],
  intro:
    "A voiceover cue sheet is a script broken into short numbered blocks a narrator can read in one breath group without losing their place, and this formatter builds one automatically. It groups whole sentences up to your chosen word limit, splits an over-long sentence at clause punctuation rather than mid-phrase, and stamps each cue with a word count and running timecode derived from the standard words-per-minute model (seconds = words divided by pace, times 60). Text inside square brackets is preserved as a direction and excluded from the spoken word count.",
  useCases: [
    "Preparing an e-learning module script so each cue matches one slide and can be re-recorded independently",
    "Checking whether a 30-second radio read actually fits before booking studio time",
    "Handing a narrator a numbered script so a client's revision note can say 'cue 14' instead of 'the bit about pricing'",
  ],
  benefits: [
    ["Sentences stay intact", "Blocks break between sentences, and only fall back to comma and dash splits when one sentence is too long."],
    ["Timecode per cue", "Each block shows where it lands in the read, so you can spot the section that overruns."],
    ["Directions kept separate", "Bracketed notes stay visible for the narrator but never inflate the word count or the timing."],
  ],
  faqs: [
    [
      "How many words is a 60 second voiceover?",
      "At a standard 150 words per minute a 60-second read is about 150 words; at a fast promo pace of 185 wpm it is around 185. Trim to roughly 140 words if the spot needs music breathing room or a legal tag at the end.",
    ],
    [
      "What is a good words-per-minute pace for narration?",
      "Most finished narration lands between 130 and 165 words per minute. Audiobooks and technical e-learning sit nearer 130-150 so listeners can follow, conversational podcast reads run 150-165, and advertising promos push 180 and above.",
    ],
    [
      "How long should each voiceover cue be?",
      "Around 25 to 40 words works for most reads — roughly 10 to 16 seconds at 150 wpm, which is one comfortable breath group plus a pause. Shorter blocks of 15 to 20 words suit line-by-line ADR or heavily edited e-learning where each cue is recorded separately.",
    ],
    [
      "How do I mark stage directions in a voiceover script?",
      "Put them in square brackets on their own line, such as [Pause for two seconds] or [Warmer, slower here]. This formatter recognises a bracketed line as a direction, labels the cue accordingly and leaves those words out of both the word count and the estimated duration.",
    ],
  ],
};

export default seo;
