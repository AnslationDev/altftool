const seo = {
  title: "Video Render Time Estimator: Codec, Effects",
  metaDescription:
    "Estimate a video export from timeline length, resolution, frame rate, codec, effects coverage and machine class - as a range, with a finish time.",
  steps: [
    "Enter the timeline as Hours, Minutes and Seconds, then set Export resolution, Frame rate (fps), Output codec and Hardware class.",
    "Under Effects load, drag each slider to the share of the timeline it covers - Colour correction and LUTs, Warp or gyro stabiliser, Temporal noise reduction or grain, Optical-flow retiming.",
    "Estimated export time shows a likely range plus Finishes at, Speed versus realtime and Timeline rendered per minute; set Start the render at (24 h clock) and press Copy result.",
  ],
  intro:
    "The Render Time Estimator predicts how long a video export will take, from timeline length, resolution, frame rate, output codec, effects load and hardware class. It uses a transparent multiplicative model — render time scales linearly with timeline length and with pixel rate, then multiplies by encoder cost, an effects factor built from what fraction of the timeline each effect covers, and divides by a machine speed index — anchored on a reference job of 1080p30 to hardware H.264 with no effects, which runs at about five times realtime. Because encoder speed and machine performance vary, the answer is given as a range rather than a single number.",
  useCases: [
    "Deciding whether a 4K export will finish before a client deadline or needs to run overnight",
    "Seeing how much time a full-timeline noise reduction pass adds before committing to it",
    "Comparing a hardware H.264 export against software x265 when the delivery spec allows either",
  ],
  benefits: [
    ["Shows every factor", "Pixel rate, encoder cost, effects multiplier and machine index are listed separately, not hidden in one number."],
    ["Effects priced by coverage", "A stabiliser on two shots costs far less than a grade on every clip, and the model reflects that."],
    ["Tells you when it lands", "Enter a start time and get the finishing clock time, including overnight rollover."],
  ],
  faqs: [
    [
      "How long does it take to render a 10 minute video?",
      "For a straightforward 1080p30 timeline exported to H.264 through a hardware encoder on a desktop with a dedicated GPU, roughly 2 minutes — around five times faster than realtime. The same 10 minutes at 4K60 through a software HEVC encoder with a full grade and noise reduction can run past four hours on a mainstream laptop.",
    ],
    [
      "Why is my export so much slower than realtime?",
      "Almost always the effects graph or a software encoder rather than the codec itself. Temporal noise reduction, optical-flow retiming and heavy compositing each multiply the per-frame cost several times over, and software encoders like x265 and AV1 cost many times what a hardware encoder does for the same output.",
    ],
    [
      "Does exporting at 4K take four times longer than 1080p?",
      "Close to it, all else equal — 4K has exactly four times the pixels of 1080p, and encode time scales with pixel rate. Doubling the frame rate as well, to 4K60 against 1080p30, gives eight times the pixel rate and roughly eight times the render time.",
    ],
    [
      "Is a hardware encoder always the better choice?",
      "Not always. Hardware encoders such as NVENC, Quick Sync and VideoToolbox are dramatically faster, but at a given bitrate a good software encoder produces a cleaner picture. Use hardware for review copies and deadline work; use software when the file is the final deliverable and quality per megabyte matters more than time.",
    ],
  ],
};

export default seo;
