const seo = {
  title: "Note Frequency Chart: MIDI, Hz and Cents Lookup",
  steps: [
    "Set Tuning reference A4 (Hz), or tap a preset chip such as A4 = 432 Hz or A4 = 442 Hz, and pick a Selected note (MIDI number) from 0 to 127.",
    "Bound the table with Chart from (MIDI) and Chart to (MIDI), and tick Show flats instead of sharps for flat spellings.",
    "Read the note's frequency with its period and Wavelength in air at 20 °C, or type a pitch into Reverse lookup — measured frequency (Hz) for the nearest note and its error in cents.",
  ],
  intro:
    "The Note Frequency Chart lists the exact frequency of every musical note in twelve-tone equal temperament, using f = A4 x 2^((n - 69) / 12) where n is the MIDI note number and A4 is the tuning reference. It covers the full MIDI range from C-1 at 8.18 Hz to G9 at 12,543.85 Hz, shows each note's octave, MIDI number, period and wavelength in air, and works backwards from a measured frequency to the nearest note and its error in cents. The A4 reference is adjustable, so it also serves Baroque pitch at 415 Hz and the 442 Hz used by many European orchestras.",
  useCases: [
    "Set a synthesiser oscillator or filter to an exact note frequency instead of eyeballing a knob.",
    "Check whether a recorded bass note sits at 41.20 Hz for E1 or has drifted sharp.",
    "Place an EQ notch on the fundamental of a ringing room mode by looking up the note it matches.",
    "Teach the octave relationship by showing that every octave is exactly double the frequency.",
  ],
  benefits: [
    [
      "Adjustable reference",
      "Switch between 415, 432, 440, 442 and 443 Hz and the whole table retunes with it.",
    ],
    [
      "Cents accuracy",
      "The reverse lookup reports how far a measured pitch is from the nearest note, in cents.",
    ],
    [
      "Physics included",
      "Period and wavelength in air at 20 °C sit next to every frequency for acoustic work.",
    ],
  ],
  faqs: [
    [
      "What is the frequency of middle C?",
      "Middle C, written C4 in scientific pitch notation and MIDI note 60, is 261.63 Hz when A4 is tuned to 440 Hz. Drop the reference to 432 Hz and middle C becomes 256.87 Hz; the whole scale shifts by the same ratio.",
    ],
    [
      "How do you calculate the frequency of a note?",
      "Multiply the reference by two raised to the power of the semitone distance divided by twelve: f = 440 x 2^((n - 69) / 12), where n is the MIDI note number and 69 is A4. Twelve semitones up multiplies the frequency by exactly two, which is one octave.",
    ],
    [
      "What is a cent in tuning?",
      "A cent is one hundredth of an equal-tempered semitone, so an octave is 1200 cents. Most listeners cannot reliably hear an error below about 5 cents on a sustained note, which is why tuners usually treat that as in tune.",
    ],
    [
      "Why do some musicians tune to 432 Hz instead of 440 Hz?",
      "440 Hz is the standard set by ISO 16, and 432 Hz is an alternative that some players prefer for its slightly darker character. Claims that 432 Hz has measurable health or resonance benefits are not supported by evidence; the practical effect is simply that everything sounds about 32 cents flatter.",
    ],
  ],
};

export default seo;
