const seo = {
  title: "English Pronunciation Practice with Your Microphone",
  metaDescription:
    "Hear 30 tricky English words and phrases read aloud, then say them back — your browser transcribes the attempt and marks it against the target.",
  steps: [
    "Pick a deck in the Categories sidebar — Commonly Mispronounced, Tongue Twisters, Business & Tech or Advanced Vocabulary — and the card shows the word, its IPA and a Pronunciation Hint such as \"Wuss-ter-sheer.\" for Worcestershire.",
    "Press Listen to hear the model reading through your browser's speech synthesis, then press Speak and say it — the button switches to \"Listening...\" while the microphone is open.",
    "The feedback panel marks the attempt correct or replies `You said: \"...\". Try again.`, and Previous and Next move you through the deck against the counter in the card's top-left corner.",
  ],
  intro:
    "Pronunciation Practice plays a model reading of a tricky English word through your browser's speech synthesis, then listens through your microphone with the Web Speech API and tells you whether what you said matched the target. It ships with 30 items across four decks - Commonly Mispronounced, Tongue Twisters, Business & Tech, and Advanced Vocabulary - each with IPA phonetics and a plain-English hint like \"Wuss-ter-sheer\" for Worcestershire. Learners, presenters and anyone rehearsing a word before a meeting get instant spoken feedback without an account.",
  useCases: [
    "You have to say \"entrepreneur\" and \"paradigm\" out loud in a pitch tomorrow and want to hear the model pronunciation and check your own attempt before you are in the room.",
    "An ESL learner is stuck on silent letters, so they work through the Commonly Mispronounced deck - colonel, choir, queue, draught - where each card shows the IPA and a spelled-out hint.",
    "A speaker warming up before recording a podcast runs the Tongue Twisters deck to drill sibilant contrasts with lines like \"She sells seashells by the seashore.\"",
  ],
  benefits: [
    ["Model audio and grading in one card", "Speech synthesis reads the target at 0.9x rate for clarity, and the microphone check compares your transcript against it right below."],
    ["IPA plus a readable hint", "Every single-word card carries both the phonetic transcription, such as /ˈkɜːrnəl/ for colonel, and a spelled-out cue you can actually say."],
    ["Forgiving match, not a strict string test", "Your speech transcript is lowercased and stripped of punctuation, and it passes if either string contains the other - so a longer utterance still counts."],
  ],
  faqs: [
    [
      "How many words and phrases are included?",
      "30 items in four categories: 10 Commonly Mispronounced words, 6 Tongue Twisters, 8 Business & Tech terms, and 6 Advanced Vocabulary words. You move through a category one card at a time with a counter showing your position in the deck.",
    ],
    [
      "Which browsers support the microphone practice?",
      "Speech recognition needs the Web Speech API, which is available in Chrome and other Chromium-based browsers; where it is missing the page shows a notice and recommends Chrome. Playback still works everywhere, because the Listen button uses speech synthesis, which is far more widely supported.",
    ],
    [
      "Does my voice recording get uploaded anywhere?",
      "The page itself never stores or transmits audio - recognition runs through your browser's built-in Web Speech API and only the returned text transcript is used to grade the attempt. Note that some browsers implement that API as a cloud service, so check your browser's own speech settings if that matters to you.",
    ],
    [
      "Why did it mark my answer correct when I said extra words?",
      "The check passes if the cleaned transcript contains the target phrase or the target contains the transcript, after both are lowercased and stripped of punctuation. That tolerance stops filler words and trailing sounds from failing an otherwise correct attempt.",
    ],
  ],
};

export default seo;
