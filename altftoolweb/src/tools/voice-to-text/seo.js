const seo = {
  title: "Voice to Text with Translation into 9 Languages",
  metaDescription:
    "Dictate with the browser's Web Speech Recognition API, watch the words appear live, and translate the transcript into one of nine languages.",
  steps: [
    "Pick a target from the Translate to dropdown — Hindi, English, Spanish, French, Bengali, Arabic, Russian, Japanese or German.",
    "Tap the mic and start speaking; the mic turns into a square you click to stop.",
    "Watch the words build up under Original Text, then read Translated Output and press the copy button on that panel.",
  ],
  intro:
    "Voice to Text turns speech into written text using the browser's built-in Web Speech Recognition API, showing the words live as you talk and then translating the finished transcript into one of nine target languages — Hindi, English, Spanish, French, Bengali, Arabic, Russian, Japanese or German. It is for anyone who would rather dictate than type: students capturing a thought, support staff drafting a reply, or someone speaking one language and needing the message in another. Recognition starts and stops on a single mic button, and the translated output has a one-click copy.",
  useCases: [
    "You are walking and want to capture a paragraph before you forget it — tap the mic, speak it, and the transcript appears word by word as you go.",
    "You need to send a short message to a Hindi-speaking colleague but type slowly in Devanagari, so you dictate it in English and copy the Hindi translation straight into your chat app.",
    "You are drafting notes for a document in a language you speak better than you write, and you want the spelling and accents handled for you rather than fighting an unfamiliar keyboard layout.",
  ],
  benefits: [
    ["Dictate and translate in one pass", "Translation fires automatically when you stop speaking, so you never have to copy the transcript into a second tool."],
    ["Live interim results", "Interim results are enabled, so the text updates as you speak instead of appearing only after you finish the sentence."],
    ["Switch target language without re-speaking", "Change the target from the dropdown and the existing transcript is re-translated, so you can produce the same message in a second language immediately."],
  ],
  faqs: [
    [
      "Which browsers support voice to text?",
      "Chrome and other Chromium-based browsers such as Edge, plus Safari, which expose the Web Speech Recognition API (as webkitSpeechRecognition). Firefox does not enable it by default, so the microphone button will not produce a transcript there.",
    ],
    [
      "How many languages can it translate into?",
      "Nine: Hindi, English, Spanish, French, Bengali, Arabic, Russian, Japanese and German. Hindi is the default target, and the source language is auto-detected rather than chosen from a list.",
    ],
    [
      "Is my audio private?",
      "Not entirely. Speech recognition is handled by your browser, and most desktop browsers do that by sending audio to the vendor's cloud service; the transcript is then sent to the MyMemory translation API to be translated. Do not dictate passwords, medical details or other confidential information into it.",
    ],
    [
      "Why does it stop listening on its own?",
      "Recognition is set to non-continuous mode, so it ends after a natural pause in speech rather than recording indefinitely. Tap the mic again for the next passage, and note that starting a new session clears the previous transcript and translation.",
    ],
  ],
};

export default seo;
