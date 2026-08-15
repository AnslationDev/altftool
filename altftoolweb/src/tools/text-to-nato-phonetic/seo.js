const seo = {
  title: "Text to NATO Phonetic Alphabet with Spoken",
  steps: [
    "Type or paste into English Input Text — the counter caps the field at 500 chars — and the NATO Phonetic Output panel fills in as you type, with a slash at every word break.",
    "Set the Reading Speed and Voice Pitch sliders, then press LISTEN PHONETIC to hear each code word spoken one at a time while the sequencer highlights the character it is on.",
    "Press Copy to take the phonetic string, or Download to save it as nato-phonetics.txt.",
  ],
  intro:
    "This spells text out in the NATO phonetic alphabet, replacing each letter with its code word — A becomes Alpha, B Bravo, C Charlie — and each digit with its spoken form, covering all 26 letters and the numbers 0 to 9. Spaces are marked with a slash so word boundaries survive when the string is read aloud, and a playback engine speaks the code words one at a time while highlighting the character it is currently on. It is for anyone who has to give a reference number, a postcode or a surname over a bad phone line and be understood first time.",
  useCases: [
    "You are reading a booking reference or a serial number to a call-centre agent and 'M' keeps being heard as 'N'",
    "You are on a radio net or a flight-training exercise and need to check your spelling of a callsign against the standard code words",
    "You are learning the alphabet for a role that requires it and want to drill each letter with audio rather than a printed chart",
  ],
  benefits: [
    ["Letters and numbers, not just A to Z", "Digits are mapped too, using the aviation forms where three is spoken 'tree', five is 'fife' and nine is 'niner' to keep them distinct over noise."],
    ["Speaks one code word at a time", "Playback pauses between characters and inserts a longer gap at word breaks, so it sounds like someone spelling to you rather than reading a sentence."],
    ["Follow along character by character", "The sequencer highlights the tile for the character being spoken and shows its stress-marked respelling, such as AL-fah or hoh-TELL."],
  ],
  faqs: [
    [
      "What is the full NATO phonetic alphabet?",
      "Alpha, Bravo, Charlie, Delta, Echo, Foxtrot, Golf, Hotel, India, Juliet, Kilo, Lima, Mike, November, Oscar, Papa, Quebec, Romeo, Sierra, Tango, Uniform, Victor, Whiskey, X-ray, Yankee, Zulu — 26 code words, one per letter, plus spoken forms for the ten digits. The full reference chart is on the page with a speaker button on every entry.",
    ],
    [
      "Why are numbers pronounced differently?",
      "To stop them being confused with each other over a noisy channel: three is said 'tree', five is 'fife' and nine is 'niner', which keeps nine clearly apart from the German 'nein' and from five. Four is drawn out as 'FOW-er' for the same reason.",
    ],
    [
      "How do I show where one word ends and the next begins?",
      "Spaces in your input are converted to a forward slash in the output, and playback holds a pause there — about 470 milliseconds at the default Reading Speed of 0.85x, scaling with whatever speed you set. That way 'MAYDAY 123' reads as a spelled word, a break, then the digits.",
    ],
    [
      "Is there a limit on how much text I can convert?",
      "500 characters per conversion. That is deliberate — spelling out a long passage letter by letter takes minutes of audio, and the format is designed for reference numbers, names and short codes rather than prose.",
    ],
  ],
};

export default seo;
