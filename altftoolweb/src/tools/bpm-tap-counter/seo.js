const seo = {
  intro:
    "A tap tempo counter works out a song's beats per minute from the timing of your own taps: BPM = 60000 divided by the average number of milliseconds between your last 8 taps, timed with the browser's high-resolution clock. Tap the pad or press any key along with the music and you get the live tempo to one decimal, the classical tempo marking for that speed, a steadiness score, and the nearest common set tempo. It is for DJs matching tracks, musicians setting a metronome, and anyone who needs a number for a track that does not list one.",
  useCases: [
    "You are preparing a DJ set and need to know whether a track sits close enough to 128 BPM to mix with the rest of your house selections.",
    "You are learning a song by ear and want the tempo to punch into a metronome or a DAW project before you start recording.",
    "You are choosing music for a workout or a run and want to check whether a track is in the 170–180 BPM drum-and-bass band or half that at 85–90.",
  ],
  benefits: [
    ["Rolling 8-tap average", "The reading tracks the last 8 taps rather than your whole take, so it follows a tempo you are still finding instead of being dragged down by your first clumsy taps."],
    ["Tells you how even your tapping was", "A steadiness percentage derived from the standard deviation of your tap intervals shows whether the number is trustworthy — 100% means perfectly even taps."],
    ["Names the tempo, not just the number", "Maps the result onto classical markings from Largo to Presto and highlights the genres whose typical range it falls inside, from Hip-hop at 85–95 to Drum & Bass at 170–180."],
  ],
  faqs: [
    [
      "How many taps do I need for an accurate BPM?",
      "Two taps give a first reading, but tap at least eight — the rolling average is taken over the last 8 intervals, so eight taps is where the number stops jumping. Stop for 2.5 seconds and the count clears itself so your next take starts fresh.",
    ],
    [
      "How is BPM calculated from taps?",
      "By dividing 60000 milliseconds by the average gap between taps. If your taps average 500 ms apart the tempo is 120 BPM; at 469 ms it is about 128 BPM. Timing uses performance.now() rather than the system clock, so it is not affected by clock adjustments.",
    ],
    [
      "Why does my result look twice as fast or half as fast as expected?",
      "Because you are tapping in half time or double time. Tempo is ambiguous by a factor of two, so a track you hear as 87 BPM may be notated at 174 — simply halve or double the reading to match the kick drum, and check it against the common tempos shown, such as 120, 128, 140 and 174 BPM.",
    ],
    [
      "What do the tempo markings like Allegro and Andante mean?",
      "They are the traditional Italian tempo names mapped to BPM bands: Largo below 60, Adagio 60–76, Andante 76–108, Moderato 108–120, Allegro 120–156, Vivace 156–176 and Presto 176 and above. The tool labels your tapped tempo with whichever band it falls into.",
    ],
  ],
};

export default seo;
