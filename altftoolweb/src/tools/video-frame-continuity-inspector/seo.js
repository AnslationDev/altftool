const seo = {
  title: "Video Frame Continuity Inspector — Local, up to 80 MB",
  metaDescription:
    "Sample up to 60 frames from a local MP4, WebM, MOV or M4V and compare pixel and 16-bin luminance differences — nothing is uploaded, JSON export.",
  steps: [
    "Press 'Choose a local video' and pick an MP4, WebM, Ogg, MOV or M4V up to 80 MB and 10 minutes; duration and dimensions are checked before sampling.",
    "Set the 'Sampling interval' slider between 0.25 and 30 seconds, then press 'Run continuity screen' — the plan is capped at 60 sampled frames.",
    "Review the near-duplicate and high-change cue counts on the sample-to-sample timeline and press 'Download JSON' for video-continuity-counts-and-timing.json.",
  ],
  intro:
    "The Video Frame Continuity Inspector samples up to 60 frames from a local video at an interval you choose, compares each adjacent pair by mean RGB pixel difference and 16-bin luminance histogram distance, and flags the runs that read as near-duplicate or high-change. It is a sparse visual-change screen for editors, reviewers and researchers who want a defensible starting point for where to look in a clip — not edit detection, deepfake detection or an authenticity claim, and the exported report says so in its own limitations list. Everything decodes and compares in your browser; the video is never uploaded.",
  useCases: [
    "A 6-minute screen recording of a meeting was supposed to run unbroken, and you want to see whether any stretch reads as a held or frozen frame before you rely on it.",
    "You are reviewing a submitted clip and need a timestamped list of the moments with the largest visual jumps, so you can watch those seconds yourself instead of scrubbing the whole file.",
    "A colleague claims a video is continuous; you want a machine-readable JSON screen you can attach to your notes, with its own caveats included so nobody over-reads it.",
  ],
  benefits: [
    [
      "Two independent change measures, not one",
      "Each pair gets both a per-channel pixel difference and a 16-bin luminance histogram distance, so a lighting shift and a content shift are distinguishable.",
    ],
    [
      "Cues merged into time ranges",
      "Consecutive pairs carrying the same cue collapse into a single start/end range with its peak values, so you get a handful of intervals to review rather than 59 rows.",
    ],
    [
      "A report that states its own limits",
      "The exported JSON carries the schema version, sample counts, cue ranges and an explicit limitations list, so the screen cannot be quoted as a verdict it never made.",
    ],
  ],
  faqs: [
    [
      "What counts as a near-duplicate or a high-change frame pair?",
      "A pair is near-duplicate when the normalised pixel difference is at or below 0.008 and the histogram distance is at or below 0.012; it is high-change when the pixel difference reaches 0.18 or the histogram distance reaches 0.28. Anything in between is recorded as an ordinary change.",
    ],
    [
      "What video files can I inspect and how long can they be?",
      "MP4, WebM, Ogg, QuickTime MOV and M4V files up to 80 MB and 10 minutes, with source dimensions no larger than 4,096 pixels on an edge. Frames are downscaled to a working copy of at most 320 pixels on the long edge before comparison, which keeps the pass fast and memory-bounded.",
    ],
    [
      "Can this detect deepfakes or prove a video was edited?",
      "No. It is a screening aid only. Cuts, flashes, fades, camera motion, lighting changes, graphics and even codec or browser decoding differences all produce high-change cues, while static scenes and coarse compression produce near-duplicate cues without any editing freeze — and only the sampled instants are inspected, so an absence of cues proves nothing.",
    ],
    [
      "How many frames should I sample?",
      "The interval ranges from 0.25 to 30 seconds and the pass is capped at 60 sampled frames, so a 10-minute video needs roughly a 10-second interval to cover the whole runtime. Thumbnail previews are shown for up to 24 sampled frames; beyond that the numeric results still run.",
    ],
  ],
};

export default seo;
