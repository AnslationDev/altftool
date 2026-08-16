const seo = {
  title: "Headphone Left/Right Balance Test: 440 Hz Tone",
  metaDescription:
    "Play a hard-panned 440 Hz sine tone that switches ears every 1.5 seconds to catch dead or swapped channels, with a timestamped log of each side.",
  steps: [
    "Put on your headphones or earbuds and click 'Start with permission' — the tone is synthesised by the browser, so nothing downloads or streams.",
    "Listen as the 440 Hz sine tone starts hard-panned to the left channel, then flips to the other ear every 1.5 seconds.",
    "Match what each ear heard against the 'Live local readings' log, which timestamps every Left/Right switch, then click 'Stop sensor'.",
  ],
  intro:
    "This test plays a 440 Hz sine tone through the Web Audio API and pans it hard to one ear at a time, switching sides every 1.5 seconds, so you can hear whether both channels of a headphone, earbud or speaker pair actually work and whether left and right are the right way round. Each switch is written to a timestamped log showing which side is live, so you can match what you heard against what was sent. It is a routing and channel check you can run in a minute on any device with a browser.",
  useCases: [
    "New earbuds arrive and you want to confirm the left bud is really playing the left channel before the return window closes",
    "One side of a wired headphone sounds dead and you need to tell whether it is the driver, the cable or the source device",
    "You have just wired a desk speaker pair or a USB-C adapter and want to verify the channels did not get swapped",
  ],
  benefits: [
    [
      "Hard-panned, so there is no ambiguity",
      "The tone is panned fully to one side rather than mixed, so a channel that is dead or crossed is obvious on the first switch.",
    ],
    [
      "A log you can check against",
      "Every side change is recorded with a timestamp and the side that went live, so you can confirm afterwards which ear should have had it.",
    ],
    [
      "Generated, not streamed",
      "The tone is synthesised by an oscillator in the browser, so there is no download, no codec and no file to load before testing.",
    ],
  ],
  faqs: [
    [
      "What tone does the test use?",
      "A 440 Hz sine wave — concert pitch A4 — which sits in the middle of the range every headphone reproduces cleanly, so any difference you hear between the ears comes from the hardware rather than the tone.",
    ],
    [
      "How do I know if my left and right are swapped?",
      "Start the test and note which ear hears the first tone: it is sent to the left channel first, then alternates to the right every 1.5 seconds. If the first tone arrives in your right ear, the channels are crossed somewhere between the source and the drivers.",
    ],
    [
      "Does this measure how balanced the two sides are?",
      "Not as a number. It confirms that each channel is routed and audible, but perceived loudness differences depend on your ears and the fit, so a side that sounds quieter is worth re-testing with the buds swapped between ears before blaming the hardware.",
    ],
    [
      "Why does nothing play until I press start?",
      "Browsers block audio until you interact with the page, so the audio context can only be created by a click. If you still hear nothing after starting, check that the browser tab is not muted and that the right output device is selected in your system settings.",
    ],
  ],
};

export default seo;
