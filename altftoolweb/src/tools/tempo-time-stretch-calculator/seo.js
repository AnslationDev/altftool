const seo = {
  title: "BPM Time Stretch Calculator: Length and Pitch Shift",
  metaDescription:
    "Enter two tempos to get the stretch percentage, new clip length, and the resampled pitch shift in semitones and cents — 120 to 128 BPM is 93.75%.",
  steps: [
    "Enter Original tempo (BPM) and Target tempo (BPM), or tap a BPM preset chip, then the Clip length in Minutes and Seconds.",
    "Pick a Sample rate (Hz) from 44,100 up to 192,000 so the varispeed rate is worked out for the same move.",
    "Read the stretch percentage, New clip length and Pitch shift if resampled in semitones and cents, then press Copy result.",
  ],
  intro:
    "Tempo Time Stretch Calculator shows what happens to length and pitch when audio recorded at one tempo is played at another. Length scales by the ratio of the two tempos — a 120 BPM loop played at 128 BPM becomes 93.75% of its original duration — and if the change is done by resampling rather than elastic stretching, pitch moves by 12·log2 of the speed ratio, which is 1.117 semitones in that example. It reports the stretch percentage DAWs display, the new clip length, the shift in semitones and cents, and the varispeed sample rate.",
  useCases: [
    "Fitting a 90 BPM drum break into a 174 BPM track and checking how far the pitch would drift on a plain resample.",
    "Reading off the exact stretch percentage to type into a sampler or a time-stretch plugin that wants a ratio.",
    "Working out the pitch correction in semitones needed to put a varispeeded loop back in key.",
    "Estimating the new runtime of a bed or stinger before conforming a session to a different tempo.",
  ],
  benefits: [
    ["Length and pitch together", "One ratio drives both, so you see the trade-off resampling forces on you."],
    ["Cents-level precision", "Small tempo moves produce fractional semitones — shown to the cent, not rounded away."],
    ["Artefact warning", "Flags shifts beyond about three semitones, where stretch algorithms usually start to show."],
  ],
  faqs: [
    [
      "How do I calculate time stretch percentage between two tempos?",
      "Divide the original tempo by the new tempo and multiply by 100. Going from 120 BPM to 128 BPM gives 120 ÷ 128 = 0.9375, so the audio becomes 93.75% of its original length while playing at 106.67% speed.",
    ],
    [
      "How much does pitch change when I speed audio up?",
      "If you resample, semitones = 12 × log2(new speed ÷ old speed). Doubling the speed raises pitch by exactly 12 semitones (one octave); a 6.67% speed increase raises it by about 1.12 semitones, or 112 cents.",
    ],
    [
      "Can I change tempo without changing pitch?",
      "Yes — elastic time-stretch modes such as Ableton Warp, Logic Flex Time and Pro Tools Elastic Audio decouple length from pitch. They work by resynthesising the signal, so large shifts introduce smearing or a metallic quality even though the key is preserved.",
    ],
    [
      "How far can I stretch audio before it sounds bad?",
      "As a working guideline, changes within about ±3 semitones (roughly +19% or −16% speed) hold up on most material, and percussive or single-instrument sources stretch further than dense full mixes. There is no hard threshold — audition the result rather than trusting a number.",
    ],
  ],
};

export default seo;
