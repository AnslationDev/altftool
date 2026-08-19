const seo = {
  title: "Voiceover Script Duration Estimator with Pauses",
  metaDescription:
    "Paste a script or a word count, pick a pace from 100 to 175 wpm, and get runtime including pauses plus the words to cut to hit a 30-second spot.",
  steps: [
    "Choose Paste a script or Enter a word count, then drop your copy into the Script box.",
    "Pick a Delivery style from Meditation / relaxation at 100 wpm to Commercial / promo at 175 wpm, tick \"Add pause time for punctuation and paragraph breaks\", and set Target minutes and seconds or a 30s spot chip.",
    "Read Estimated runtime with Reading time, Pause time and Effective pace with pauses, then \"Fit to a target length\" gives the word budget and the words to cut.",
  ],
  intro:
    "Spoken runtime is word count divided by speaking pace, plus the time spent in pauses: seconds = words / wpm x 60, with roughly half a second added per sentence end, a fifth of a second per comma and a little under a second per paragraph break. This estimator applies that to a pasted script or a plain word count, then tells you the word budget and the pace you would need to land on a target length such as a 30-second spot. Written for voice artists, video editors and e-learning producers who have to fit a fixed slot.",
  useCases: [
    "Check whether a 30-second radio script is actually recordable before booking studio time.",
    "Work out how many words a 10-minute e-learning module needs at an instructional 135 words per minute.",
    "Compare the same script read as an audiobook at 155 wpm against a promo read at 175 wpm.",
    "Find how many words to cut when a first read comes in eight seconds over the slot.",
  ],
  benefits: [
    ["Pauses counted", "Punctuation and paragraph breaks are added on top of the raw reading time, not ignored."],
    ["Target fitting", "Shows the word budget, the words to cut, and the pace that would make the script fit."],
    ["Real pace presets", "Seven delivery styles from meditation at 100 wpm to commercial reads at 175 wpm."],
  ],
  faqs: [
    [
      "How many words is a 30-second voiceover?",
      "About 75 words at a neutral 150 words per minute, or roughly 85-90 at a faster commercial read of 170-180 wpm. Directed pauses, product names and legal lines all eat into that, so most 30-second commercial scripts are written closer to 65-75 words.",
    ],
    [
      "How long does it take to read 1,000 words aloud?",
      "Around 6 minutes 40 seconds at 150 words per minute. At a slower instructional 120 wpm it is about 8 minutes 20 seconds, and at a fast 180 wpm about 5 minutes 30 seconds. Sentence and paragraph pauses typically add another 5-15%.",
    ],
    [
      "What speaking rate should I use for an audiobook?",
      "Publishers commonly expect narration in the 150-160 words-per-minute range, which is close to unhurried conversational speech. Non-fiction with dense terminology usually sits at the lower end, and dialogue-heavy fiction at the higher end.",
    ],
    [
      "Why is my recorded take longer than the estimate?",
      "Estimates assume steady delivery with no retakes. Breaths, directed beats, music stings, an emphasised product name and any ad-libbed pickup all add time. Use the estimate to plan, then time an actual read before locking to a fixed slot.",
    ],
  ],
};

export default seo;
