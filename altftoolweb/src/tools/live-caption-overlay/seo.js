const seo = {
  title: "Live Caption Overlay: 18-54px Mic Captions",
  metaDescription:
    "Turns mic speech into large captions via the browser's own Web Speech Recognition API — English (India, US, UK) or Hindi, 18-54px, nothing saved.",
  steps: [
    "Choose a Recognition language — English (India), Hindi (India), English (US) or English (UK) — and set the \"Caption size\" slider anywhere from 18px to 54px in 2px steps; the language selector locks once recognition is running.",
    "Press \"Start captions\" and grant the browser's microphone permission; recognition runs continuously with interim results, so words appear before the sentence is finished.",
    "Captions fill the high-contrast panel, which is an aria-live polite region so screen readers announce new text; \"Stop captions\" ends the session and Clear wipes the transcript, which is never saved or exported.",
  ],
  intro:
    "Live Caption Overlay turns speech picked up by your microphone into large on-screen captions using the browser's own Web Speech Recognition API, in continuous mode with interim results so words appear while the sentence is still being spoken. Caption text sizes from 18px to 54px on a high-contrast panel, and you can set the recognition language to English (India, US or UK) or Hindi before starting. It is a quick accessibility aid for a room or a call — not a transcription service, and it works only in browsers that expose the speech-recognition API, which today mainly means Chromium-based ones.",
  useCases: [
    "Following a colleague speaking at a whiteboard or a meeting without captions of its own, with the caption panel open on a laptop beside you",
    "Sitting through a lecture or a talk where the room audio is clear but the speaker's accent or pace is hard to follow in real time",
    "Setting caption size to 44px or more so someone across the table, not just the person holding the laptop, can read along",
  ],
  benefits: [
    ["Words appear before the sentence ends", "Interim results are shown as they are recognised and then replaced by the final text, so the caption keeps pace with the speaker."],
    ["Sized for the room, not the screen", "Caption text scales from 18px up to 54px in 2px steps on an inverted high-contrast panel, readable from a distance."],
    ["Announced to screen readers too", "The caption area is an aria-live polite region, so assistive technology picks up new text without you refocusing it."],
  ],
  faqs: [
    [
      "Which browsers support live captions here?",
      "Only browsers that implement the Web Speech Recognition API — SpeechRecognition or webkitSpeechRecognition — which in practice means Chrome, Edge and other Chromium browsers. If the API is missing, the tool says so instead of failing silently, and no captions will appear.",
    ],
    [
      "Is my audio sent to a server?",
      "That depends entirely on your browser's speech engine, not on this page. Several browsers send audio to a cloud recognition service, so do not use live captions for confidential conversations unless you know your browser recognises speech on-device.",
    ],
    [
      "What languages can it recognise?",
      "Four options are offered: English (India), Hindi (India), English (US) and English (UK). The language must be chosen before you press Start, because the setting is locked while recognition is running — stop, switch, and start again to change it.",
    ],
    [
      "Are the captions saved anywhere?",
      "No. Text accumulates on screen while the session runs and disappears when you press Clear or leave the page — there is no file, no history and no export. Copy anything you want to keep before closing the tab.",
    ],
  ],
};

export default seo;
