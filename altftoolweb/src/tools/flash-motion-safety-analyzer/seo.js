const seo = {
  intro:
    "This screener steps through a local MP4 or WebM file at 8 to 15 sampled frames per second, converts each sample to relative luminance and CIE u'v' chromaticity, and counts the transitions that look like general flash pairs, saturated-red flash pairs or large frame changes. It applies the thresholds used in flash-safety guidance: a general flash pair needs a relative-luminance change of at least 0.10 with the darker state below 0.80, a red flash pair needs a saturated red where R ÷ (R+G+B) is at least 0.80 plus a u'v' shift of at least 0.20, and a large frame-change cue fires when 25% or more of the frame changes luminance at once. It is a bounded screening pass that reports counts and timings — not a WCAG conformance ruling, a medical assessment or a safety guarantee.",
  useCases: [
    "You are about to publish a game trailer with strobing cuts and want to know whether any one-second window carries more than three flash pairs before it goes live",
    "An accessibility reviewer flagged a scene as a seizure risk and you need the timestamps of the specific transitions so you can re-cut just those seconds",
    "You are checking a clip with a lot of saturated red — explosions, sirens, blood effects — and want the red-flash cues counted separately from the general ones",
  ],
  benefits: [
    [
      "Counts against a rolling one-second window",
      "It reports the maximum number of general and red flash pairs in any rolling second, which is the figure the three-flash guidance is actually stated in — not just a total for the clip.",
    ],
    [
      "Red flashes are measured on chromaticity, not hue names",
      "Saturated red is detected from the linearised R ÷ (R+G+B) ratio and the change is measured as a u'v' distance, so a red transition is scored separately from a brightness change.",
    ],
    [
      "Reports what it could not see",
      "Every run lists sampling gaps, the frames compared, and warnings when your sample rate sits below the declared source frame rate, so an all-clear is qualified rather than absolute.",
    ],
  ],
  faqs: [
    [
      "What counts as a general flash here?",
      "A pair of opposing transitions where relative luminance changes by 0.10 or more and the darker of the two states is below 0.80 relative luminance. That is the general flash definition from flash-safety guidance, and the tool reports how many such pairs fall inside the worst rolling second.",
    ],
    [
      "How big does the flashing area have to be to matter?",
      "The small-area boundary is 21,824 CSS pixels — roughly a quarter of the central 10-degree field of vision at a standard viewing setup. Enter your intended display width and height and the tool maps each cue's affected area fraction onto that pixel budget and flags the cues that reach or exceed it.",
    ],
    [
      "Can it miss a flash?",
      "Yes, and that is the main limitation. It seeks through a paused video at 8 to 15 samples per second, so anything happening between samples or across a sub-frame interval is not seen, and gradual multi-frame ramps that peak between samples can also be missed. Treat a clean result as one screening pass, not proof of safety.",
    ],
    [
      "What are the file limits and does anything get uploaded?",
      "Nothing is uploaded — decoding and pixel analysis run in your browser. The bounds are MP4 or WebM up to 80 MB and 120 seconds, analysed at a working resolution capped at a 160-pixel edge and 14,400 pixels, with a hard cap of 1,802 sampled frames. The downloadable report contains counts and timings only: no filename, no frames and no pixel data.",
    ],
  ],
};

export default seo;
