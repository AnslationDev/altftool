const seo = {
  intro:
    "This calculator works out the level a music bed should be ducked to so it sits a chosen number of decibels below the voiceover, then power-sums the two to show where the combined mix lands. It uses the standard decibel relationships — amplitude ratio 10^(dB/20) for the fader move and 10·log10 power summing for the mix — so the answers match what a meter will read. Podcasters, video editors and radio producers use it to set an intro duck without guessing at the fader.",
  useCases: [
    "Setting an intro bed for a −16 LUFS podcast so the music sits 20 dB under the host and stays intelligible on phone speakers",
    "Checking that a busy promo mix with only 12 dB of separation still leaves headroom under a −1 dBTP ceiling",
    "Converting a decibel duck into the fader percentage a DAW or stream mixer actually asks for",
  ],
  benefits: [
    ["Fader value, not just dB", "Shows the amplitude multiplier and percentage, ready to type into a mixer."],
    ["Correct summing", "Uses power summing, so two equal sources add 3 dB rather than 6."],
    ["Ceiling check", "Flags when the combined mix would break your true-peak ceiling."],
  ],
  faqs: [
    [
      "How many dB should background music be below a voiceover?",
      "Around 18 to 20 dB below the voice for spoken-word content, which keeps the bed audible but never competes. Promos and adverts often sit closer at 12 to 15 dB, and cinematic trailers can go as tight as 8 dB where clarity matters less than impact.",
    ],
    [
      "What loudness should a podcast or video be delivered at?",
      "Apple Podcasts asks for about −16 LUFS integrated for stereo, Spotify and YouTube normalise near −14 LUFS, EBU R128 broadcast is −23 LUFS and US ATSC A/85 is −24 LKFS. Keep true peaks at or under −1 dBTP for streaming, or −2 dBTP for A/85 broadcast.",
    ],
    [
      "Why does adding music barely change the mix level?",
      "Because uncorrelated sources add in power, not amplitude. A bed 20 dB below the voice raises the combined level by only about 0.04 dB, while a bed at the same level as the voice adds a full 3 dB.",
    ],
    [
      "What attack and release should a ducker use?",
      "A duck-down of roughly 80 to 250 ms and a return of 400 to 900 ms is a safe starting range. Faster attacks catch the first syllable but can sound pumped; slower releases stop the bed bouncing between short words.",
    ],
  ],
};

export default seo;
