const seo = {
  title: "Flash Guide Number Calculator: Aperture, Distance",
  metaDescription:
    "Solve GN = f-number x distance for the missing value, scaled for ISO and manual flash power, in metres and feet — with a working-distance table.",
  steps: [
    "Enter the Guide number at ISO 100, choose Metres or Feet, and set ISO and the Flash power fraction.",
    "Set Solve for to 'Aperture, from a known distance' or 'Distance, from a chosen aperture' and fill in the known value.",
    "Read the correct f-stop or flash distance with the effective guide number and per-aperture distance table, or click Copy result.",
  ],
  intro:
    "Flash Guide Number Calculator solves the relationship GN = f-number × distance, so entering any two of guide number, aperture and flash-to-subject distance returns the third. It scales the guide number by the square root of ISO ÷ 100 and by the square root of the manual power fraction, which is why quadrupling the ISO doubles the reach and quarter power halves it. Written for manual flash and studio strobe work where no TTL metering is involved.",
  useCases: [
    "Setting the aperture for a bare speedlight of GN 32 (metres, ISO 100) fired at a subject 4 m away — f/8.",
    "Finding how far back a light can sit at f/5.6 before it stops being able to expose the subject.",
    "Adjusting for quarter power on a strobe and seeing the working distance halve.",
    "Measuring the real guide number of an old manual flash from one correctly exposed test frame.",
  ],
  benefits: [
    ["Three-way solver", "Aperture, distance or guide number — whichever one you are missing."],
    ["ISO and power scaling", "Both follow square-root laws, applied correctly instead of by rule of thumb."],
    ["Metres and feet", "Guide numbers are published in both; the result is shown in each so nothing is misread."],
  ],
  faqs: [
    [
      "What is a flash guide number?",
      "It is the product of the f-number and the flash-to-subject distance that gives a correct exposure, quoted at ISO 100 for a stated distance unit. A GN of 32 in metres means f/8 at 4 m, f/4 at 8 m, or f/16 at 2 m.",
    ],
    [
      "How does ISO change the guide number?",
      "The guide number scales with the square root of ISO ÷ 100, so ISO 400 doubles it and ISO 1600 quadruples it. A GN 32 flash behaves like GN 64 at ISO 400, letting you shoot the same distance two stops smaller.",
    ],
    [
      "How much does dropping to 1/4 power cost?",
      "Two stops of light, which halves the guide number because GN scales with the square root of the power fraction. A GN 32 head at 1/4 power behaves like GN 16, so the working distance at a given aperture halves.",
    ],
    [
      "Why does my flash underexpose compared with its published guide number?",
      "Published figures assume bare direct flash with the head zoomed to its longest setting, and manufacturers tend to quote optimistically. Bouncing off a ceiling, adding a diffuser or zooming wide can each cost one to three stops — measure your own guide number from a test frame instead.",
    ],
  ],
};

export default seo;
