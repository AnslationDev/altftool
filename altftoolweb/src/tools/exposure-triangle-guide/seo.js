const seo = {
  intro:
    "The Exposure Triangle Guide computes the exposure value of any aperture, shutter and ISO combination using the standard formula EV100 = log2(N² ÷ t), then subtracts log2(ISO ÷ 100) and your metering bias to give the adjusted EV. Alongside the number it reads out what each setting is doing to the picture — depth of field, motion rendering, noise, handheld blur risk and whether your shutter is fast enough for the subject — so you can see why a change to one leg of the triangle forces a change in another. Five scene presets, from Bright Sun at f/8, 1/500, ISO 100 to Indoor Portrait at f/2, 1/125, ISO 800, give you a working starting point.",
  useCases: [
    "You are shooting a school sports day handheld at 200 mm and want to know before the race starts whether 1/250 will actually freeze a sprinter — set subject speed to Sports and watch the freeze verdict flip.",
    "You have a well-exposed frame at f/2.8 and want more of the group in focus — step down to f/8 and see exactly how many stops of shutter or ISO you need to give back.",
    "You are learning why your indoor photos are noisy, and want to compare ISO 800 at f/2 against ISO 3200 at f/5.6 as EV numbers rather than as guesswork.",
  ],
  benefits: [
    ["Real EV maths, not a mood chart", "Values come from log2(N²/t) with ISO and exposure-compensation terms applied, so two different settings that share an EV really are equivalent exposures."],
    ["Checks the shot, not just the brightness", "Handheld risk uses the reciprocal rule against your focal length, and subject freeze is judged against the speed of what you are photographing."],
    ["Portable settings", "Copy the whole setup — aperture, shutter, ISO, adjusted EV and verdicts — as text, or export the full analysis as JSON to keep with the shoot notes."],
  ],
  faqs: [
    [
      "How is exposure value calculated?",
      "EV100 = log2(aperture² ÷ shutter time in seconds) — so f/8 at 1/500 is log2(64 × 500) = EV 15. Raising ISO lowers the adjusted EV by log2(ISO ÷ 100), which is one stop per doubling: ISO 400 sits two stops below ISO 100.",
    ],
    [
      "What shutter speed do I need to avoid camera shake?",
      "At least 1 over your focal length — 1/50 s on a 50 mm lens, 1/200 s on a 200 mm. The tool flags handheld risk as High when you are slower than that with stabilisation off, and Moderate when stabilisation is on, because stabilisation buys back stops but does not remove the limit.",
    ],
    [
      "What shutter speed freezes a moving subject?",
      "The thresholds used here are 1/60 for a still subject, 1/160 for someone walking, 1/500 for sports and 1/1000 for fast action. Anything slower than the threshold for your subject is reported as weak freeze, regardless of how good the exposure looks.",
    ],
    [
      "What does the meter bias setting do?",
      "It shifts the adjusted EV by the amount you choose, in third-stop increments from -1 to +1 EV, exactly like exposure compensation on a camera. Positive values brighten the result for backlit or snowy scenes; negative values protect highlights.",
    ],
  ],
};

export default seo;
