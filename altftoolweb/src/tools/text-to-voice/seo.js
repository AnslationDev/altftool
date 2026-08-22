const seo = {
  title: "Text to Voice Reader — Browser Text-to-Speech",
  metaDescription:
    "Read any pasted text aloud with your system's own voices. Adjust speed from 0.1 to 3.0 plus pitch and volume, with real pause and resume controls.",
  steps: [
    "Paste or type into the Text Input box (\"Enter text to convert to speech...\").",
    "In Voice Settings, choose a voice from the dropdown — each option shows its name and language tag — and set the Speed slider (0.1 to 3.0 in 0.1 steps) plus the separate Pitch and Volume sliders.",
    "Press Speak to hear the text through your device's speech engine; Pause holds the current position, Resume continues from there, and Stop cancels playback.",
  ],
  intro:
    "Text to Voice reads pasted text aloud through the Web Speech API's SpeechSynthesis engine, using the voices your own operating system and browser already provide, with speak, pause, resume and stop controls. It suits anyone proofreading a draft by ear, rehearsing a script, or making written material listenable. Speed is adjustable from 0.1 to 3.0 in 0.1 steps, with separate pitch and volume sliders, and the voice list shows each voice's language tag so you can match the text.",
  useCases: [
    "Proofreading a blog post or email before sending it — hearing the sentence read back catches the duplicated word and the missing verb that your eye skims over.",
    "Timing a presentation script: set the rate near 1.0, hit Speak, and check whether the section actually fits the five minutes you were given before you rehearse it out loud.",
    "Making a long article listenable while you cook or commute at your desk, choosing a voice whose language tag matches the text so the pronunciation rules are right.",
  ],
  benefits: [
    [
      "Every voice your system has installed",
      "The list is populated from the browser's own voice inventory and reloads on the voiceschanged event, so voices added by your OS appear without any extra download.",
    ],
    [
      "Independent speed and pitch",
      "Rate runs 0.1 to 3.0 and pitch is a separate slider, so you can slow a technical passage down without the chipmunk effect that comes from changing playback speed alone.",
    ],
    [
      "Real pause and resume, not restart",
      "Pausing holds the utterance at its current position and Resume carries on from there, so you can stop to take a note mid-paragraph without replaying from the top.",
    ],
  ],
  faqs: [
    [
      "Can I download the audio as an MP3?",
      "No. SpeechSynthesis plays audio directly through the system's speech engine and exposes no recording stream, so there is no file to save. To get an audio file you need a server-side or desktop TTS engine that writes to disk.",
    ],
    [
      "Why are there no voices in the dropdown?",
      "The voice list comes from your operating system and browser, so an empty list means none are installed or the browser has not finished loading them. Voices often arrive a moment after page load via the voiceschanged event — wait a second and reopen the dropdown; on Linux you may need to install a speech engine such as espeak first.",
    ],
    [
      "What speed should I use for listening to long text?",
      "Start at 1.0, which is the engine's normal rate, and nudge up in 0.1 steps; most people settle between 1.2 and 1.5 for familiar material. The slider tops out at 3.0, but intelligibility drops sharply above roughly 2.0 on most system voices.",
    ],
    [
      "Is the text I paste sent anywhere?",
      "No. The text stays in the page and is handed to the browser's built-in speech synthesiser. Note that some platform voices are cloud-backed by the OS vendor rather than local — if that matters for sensitive text, pick a voice your system marks as local.",
    ],
  ],
};

export default seo;
