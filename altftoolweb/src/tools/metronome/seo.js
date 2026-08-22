const seo = {
  title: "Metronome: 30-260 BPM, Tap Tempo, Subdivisions",
  metaDescription:
    "Web Audio metronome from 30 to 260 BPM with 2/4, 3/4, 4/4 and 6/8 time, eighth to sixteenth subdivisions, tap tempo and an accented downbeat.",
  steps: [
    "Set the Tempo slider anywhere from 30 to 260 BPM, nudge it with the -5, -1, +1 and +5 buttons, or hit 'Tap tempo' — your last 6 taps are averaged.",
    "Choose a 2/4, 3/4, 4/4 or 6/8 time signature, a Quarter, Eighth, Triplet or Sixteenth subdivision, and set the Volume slider.",
    "Press Play (or the Space key) to start the click — the accented beat 1 sounds at a higher pitch, beat dots light up in turn, and your setup is saved for the next visit.",
  ],
  intro:
    "This online metronome plays a click from 30 to 260 BPM using the Web Audio API's own clock, scheduling each tick about 100 milliseconds ahead so the pulse does not drift the way a JavaScript timer would. It supports 2/4, 3/4, 4/4 and 6/8 time, quarter, eighth, triplet and sixteenth subdivisions, tap tempo averaged over your last six taps, and an accented downbeat at a higher pitch. Musicians practising at home get a steady reference with the tempo, meter and volume remembered between visits.",
  useCases: [
    "You are learning a passage that keeps falling apart and want to loop it at 60 BPM, then nudge upward a few BPM at a time until it holds at performance tempo.",
    "You know how a song feels but not its tempo, so you tap along on the tap-tempo button until the reading settles and note it down for the band.",
    "Your teacher told you to subdivide, so you switch from one click per beat to triplets in 6/8 to hear where the inner pulse actually sits.",
  ],
  benefits: [
    ["Audio-clock timing, not setInterval", "Ticks are scheduled on the Web Audio timeline roughly 100 ms in advance by a 25 ms lookahead loop, so the click stays even when the browser tab gets busy."],
    ["Downbeats you can hear", "The accent, the plain beat and the subdivision tick use different pitches and volumes, so you can tell where beat one is without watching the screen."],
    ["It remembers your setup", "Tempo, time signature, subdivision and volume are saved locally, so the next practice session starts where the last one ended."],
  ],
  faqs: [
    [
      "What tempo range does it cover?",
      "30 to 260 BPM. The current tempo is also labelled with its Italian marking: Largo below 60, Adagio 60-75, Andante 76-107, Moderato 108-119, Allegro 120-155, Vivace 156-175 and Presto from 176 up.",
    ],
    [
      "How does tap tempo work?",
      "Tap the button in time and it averages the intervals between your most recent taps, up to six, then converts that average to BPM. If you pause for more than 2 seconds the tap history resets, so a fresh series does not get blended with the old one.",
    ],
    [
      "What tempo should I practise a difficult passage at?",
      "Slow enough to play it accurately every time, then raise the tempo in small steps — many teachers suggest around 5 BPM per pass, dropping back if accuracy breaks down. The point is that the click exposes where you rush or drag, not that you reach the target tempo quickly.",
    ],
    [
      "Why does 6/8 click differently from 3/4?",
      "6/8 is set up as six beats with accents on beats 1 and 4, giving the two-group compound feel, while 3/4 accents only beat 1 across three beats. Same number of eighth notes, different grouping — which is exactly what the accent pattern is there to make audible.",
    ],
  ],
};

export default seo;
