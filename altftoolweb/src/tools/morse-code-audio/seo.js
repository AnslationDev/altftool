const seo = {
  intro:
    "Morse Code Audio converts typed text into International Morse and plays it as a real tone, using the standard PARIS timing where one dot lasts 1.2 ÷ WPM seconds, a dash is three dots, and the gaps run 1 unit inside a letter, 3 between letters and 7 between words. Speed is adjustable from 5 to 40 words per minute, pitch from 300 Hz to 1 kHz, and the character and symbol currently sounding are highlighted as it plays. It is for someone learning to hear Morse rather than read it — the sound, the spacing and the written symbols lined up on one screen.",
  useCases: [
    "You are training your ear for amateur radio and want to hear a call sign at 12 WPM before working up to the speed the licence exam expects.",
    "A puzzle or escape-room prop needs a recorded Morse message, so you type the phrase, pick a 700 Hz tone and play it back to check it is decodable.",
    "You are teaching a scout group why 'dot dot dot dash dash dash dot dot dot' is SOS and want the letters to light up in time with the beeps.",
  ],
  benefits: [
    ["Standard timing, not arbitrary beeps", "Element lengths follow the accepted 1:3 dot-to-dash ratio with 1, 3 and 7 unit gaps, so what you hear matches what a real operator sends."],
    ["Follow the sound on the page", "The active character and the exact dot or dash being sounded are highlighted as playback moves, which is how the mapping between sound and letter sticks."],
    ["Tone shaped to your ear", "Pitch and volume are separate controls, so you can pick the frequency you hear most clearly instead of accepting one fixed beep."],
  ],
  faqs: [
    [
      "How fast is 15 words per minute in Morse?",
      "One dot lasts 80 milliseconds at 15 WPM, since the dot length is 1.2 ÷ WPM seconds under the standard PARIS convention. A dash is three times that at 240 ms, and the gap between two words is seven dot lengths, or 560 ms.",
    ],
    [
      "Which characters can it send?",
      "The 26 letters A–Z, the digits 0–9, and 18 punctuation and symbol characters including full stop, comma, question mark, slash, brackets, colon, semicolon, equals, plus, hyphen, underscore, quotation marks, dollar and at-sign. Letters are case-insensitive, and a space between words is written as a forward slash in the Morse output.",
    ],
    [
      "What pitch should I use for practice?",
      "Anywhere in the 300 Hz to 1000 Hz range the tool offers; 600 Hz is the default and sits close to the 600–800 Hz sidetone most amateur radio operators train with. Choose whatever frequency you can pick out most easily against background noise — it does not affect timing.",
    ],
    [
      "Why does the tool insist a dash is exactly three dots long?",
      "Because Morse is defined by ratio, not by absolute duration. A dash is three units, the silence inside a letter is one unit, between letters three, and between words seven — get those proportions wrong and a receiving operator hears different letters, no matter how neat the individual beeps sound.",
    ],
  ],
};

export default seo;
