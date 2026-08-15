const seo = {
  title: "Morse Code Translator with ITU Timing and WPM",
  metaDescription:
    "Encodes and decodes International Morse to ITU-R M.1677-1, then times the message in dot units against PARIS at your words-per-minute speed.",
  steps: [
    "Choose 'Text → Morse' or 'Morse → Text', then type into 'Text to encode' or into 'Morse to decode (space between letters, / between words)'.",
    "Set 'Sending speed (words per minute)', or press 'Swap sides' to carry the result across and translate it back.",
    "Read the output with 'Dot units in the signal', 'Length of one dot at this speed' and 'Time to send the whole message', then press 'Copy result'.",
  ],
  intro:
    "This Morse code translator encodes plain text into International Morse code and decodes Morse back into text, using the character set and timing defined in ITU-R Recommendation M.1677-1. It also reports transmission time: a dash is three dot units, gaps inside a character are one unit, between characters three and between words seven, and the standard word PARIS is exactly 50 units, which is what defines words per minute. Useful for amateur radio operators, scouts, escape-room designers and anyone decoding a signal from a puzzle.",
  useCases: [
    "Decode a string of dots and dashes found in a game or puzzle without hunting through a printed chart.",
    "Check how many seconds it takes to send a distress call at 20 words per minute before keying it on air.",
    "Teach a scout group the letter shapes and let them verify their own hand-written encoding instantly.",
  ],
  benefits: [
    ["ITU character set", "Letters, figures and the full punctuation list from ITU-R M.1677-1, not a partial chart."],
    ["Real timing, not an estimate", "Counts every dot, dash and gap, then prices it at your chosen words-per-minute speed."],
    ["Forgiving decoder", "Accepts middots, en dashes, underscores and pipes, and flags any sequence it cannot resolve."],
  ],
  faqs: [
    [
      "What is SOS in Morse code?",
      "SOS is ... --- ... — three dots, three dashes, three dots, sent as one unbroken character with no letter gaps. It is 27 dot units long, which is 1.6 seconds at 20 words per minute.",
    ],
    [
      "How is Morse code speed measured?",
      "In words per minute against the standard word PARIS, which is exactly 50 dot units including the word gap. So one dot lasts 60 ÷ (50 × wpm) seconds — 60 ms at 20 wpm and 20 ms at 60 wpm.",
    ],
    [
      "How long is a dash compared with a dot?",
      "Exactly three times as long. The space between elements of the same character is one dot, between two characters three dots, and between two words seven dots — the rules set out in ITU-R M.1677-1.",
    ],
    [
      "Can Morse code handle accented letters or emoji?",
      "No. International Morse defines 26 unaccented letters, the ten figures and about 18 punctuation signs. This translator lists any character it had to skip rather than silently dropping it.",
    ],
  ],
};

export default seo;
