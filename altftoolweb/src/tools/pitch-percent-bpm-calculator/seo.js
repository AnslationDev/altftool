const seo = {
  intro:
    "The Pitch Percent BPM Calculator converts a turntable or CDJ pitch fader position into the tempo the record actually plays at, using resulting BPM = written BPM x (1 + pitch / 100). Because pitch changes the playback rate, it also reports the musical side of the same move: the key shift is logarithmic at 1200 x log2(1 + pitch / 100) cents, which is why +6% raises the track by about one semitone rather than by 6% of an octave. The running time shortens by the same ratio, so a five-minute record at +8% finishes 22 seconds early.",
  useCases: [
    "See what a 128 BPM track becomes at +4% before you drop it against something faster.",
    "Work out the exact pitch needed to bring a 124 BPM record up to a 130 BPM set.",
    "Check how much a mix will overrun if you play a whole hour slightly slowed down.",
    "Understand the key clash before it happens by reading the shift in cents.",
  ],
  benefits: [
    [
      "Tempo, key and time together",
      "One move changes all three, and all three are shown side by side.",
    ],
    [
      "Fader range aware",
      "Flags whether the pitch you need fits ±6, ±8, ±10, ±16 or ±50% hardware.",
    ],
    [
      "Vinyl speed swaps",
      "Includes the exact +35% and -25.93% figures for playing a record at the wrong platter speed.",
    ],
  ],
  faqs: [
    [
      "How do I calculate BPM from pitch percentage?",
      "Multiply the written tempo by one plus the pitch divided by a hundred. A 128 BPM track at +8% plays at 128 x 1.08 = 138.24 BPM; at -6% it plays at 120.32 BPM. The same ratio applies to the running time, which divides rather than multiplies.",
    ],
    [
      "How much does pitch change the key of a track?",
      "The shift is 1200 x log2(1 + pitch / 100) cents, so +6% is 100.9 cents — almost exactly one semitone — and +8% is 133.2 cents, a little over a semitone. Half a semitone, roughly ±3%, is where most listeners start to hear the vocal change.",
    ],
    [
      "What percentage is 45 rpm on a 33 rpm record?",
      "Exactly +35%, because 45 divided by 33 1/3 is 1.35. Played the other way, a 45 rpm record on the 33 1/3 setting runs at -25.93%, which is a drop of just over four semitones.",
    ],
    [
      "Should I use key lock when pitching a track?",
      "Turn it on when the shift crosses about 50 cents — roughly ±3% — and the track is harmonically mixed or has a prominent vocal. Key lock time-stretches instead of changing the rate, so it preserves pitch at the cost of some smearing on transients, which becomes noticeable past around ±8%.",
    ],
  ],
};

export default seo;
