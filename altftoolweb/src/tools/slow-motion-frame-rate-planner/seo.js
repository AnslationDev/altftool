const seo = {
  title: "Slow Motion FPS Calculator: Speed %, Shutter Angle",
  metaDescription:
    "Enter capture and timeline fps for the slow-motion factor, editor speed %, shutter speed from your shutter angle, and the stops of light it costs.",
  steps: [
    "Set Project fps, which opens on 24, and Capture fps, which opens on 120, then the Shutter angle field at 180 degrees.",
    "Choose 50 Hz (India, Europe, Australia), 60 Hz (North America, Japan east) or Flicker-free / daylight only in Mains Hz, and enter Real seconds; every readout recalculates as you type.",
    "Read Slow factor, Speed, Shutter, Screen duration and Light cost in stops, plus the flicker advice line, then press Copy plan or Reset.",
  ],
  intro:
    "This planner converts between capture frame rate and slow-motion factor, because slow motion is nothing more than the ratio of the two: factor = capture fps ÷ timeline fps, and the speed percentage you type into an editor is 100 ÷ that factor. It then works out the two things that actually decide whether the shot is achievable — the shutter speed implied by your shutter angle (angle ÷ 360 ÷ fps, so 1/480 s at 240 fps with a 180° shutter), the stops of light that costs against the 1/48 s of 24 fps, and whether the capture rate will band under mains lighting, which pulses at 100 Hz on a 50 Hz supply and 120 Hz on 60 Hz.",
  useCases: [
    "Deciding what frame rate to set for a 5x slow-motion shot destined for a 24 fps timeline",
    "Checking how many stops of extra light a jump from 60 fps to 240 fps will demand on set",
    "Finding out why 120 fps footage under Indian mains lighting shows rolling brightness bands",
  ],
  benefits: [
    ["Every number from two frame rates", "Enter your capture rate and timeline fps and get the slow-motion factor, speed percentage, shutter speed and light cost together."],
    ["Exposes the light cost", "Shows the shutter speed and the stops lost before you discover them on location."],
    ["Flicker checked properly", "Tests both the frame interval and the shutter against the 100 Hz or 120 Hz light pulse."],
  ],
  faqs: [
    [
      "What frame rate do I shoot for 5x slow motion?",
      "Multiply your timeline frame rate by 5. For a 24 fps timeline that is 120 fps, which you then play at 20% speed in your editor; for a 25 fps timeline it is 125 fps, so most people shoot 120 or 150 and accept the slightly different factor.",
    ],
    [
      "How much light does slow motion cost?",
      "Each doubling of frame rate at the same shutter angle costs one stop. Going from 24 fps to 240 fps with a 180° shutter takes the exposure from 1/48 s to 1/480 s — 3.3 stops, or about ten times less light reaching the sensor, which is why high-speed work is usually lit hard or shot in daylight.",
    ],
    [
      "Why does my high frame rate footage flicker under lights?",
      "Mains-powered lighting pulses at twice the supply frequency — 100 Hz on a 50 Hz supply, 120 Hz on 60 Hz. Exposure only stays even when the frame interval or the open shutter spans a whole number of those pulses. Above the pulse frequency that becomes impossible, so any capture rate over 100 or 120 fps needs flicker-free DC or high-frequency ballast fixtures.",
    ],
    [
      "What shutter angle should I use for slow motion?",
      "Keep 180° unless you have a reason not to. It preserves the same proportion of motion blur per frame as normal-speed footage, so the slowed shot still looks natural. Opening towards 360° buys back a stop of light at the cost of softer motion; closing towards 45° gives a crisp, strobing look and costs light you probably cannot spare.",
    ],
  ],
};

export default seo;
