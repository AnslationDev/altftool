const seo = {
  intro:
    "The Audio Edit Boundary Visualizer draws a 1,000-bucket waveform envelope of a local audio file and flags the moments where the sample-to-sample jump or the local DC offset changes abruptly enough to deserve a human listen. It scans in 10 ms bins, takes the largest first-difference in each bin, and converts it to a robust modified z-score against the median and MAD of the whole file, so a click that is loud relative to that particular recording gets flagged even if it would be quiet in another. It is aimed at editors, podcast producers and reviewers who want a shortlist of suspicious timestamps rather than a claim about whether a file was edited.",
  useCases: [
    "Checking a delivered interview recording for the seam left by a hard cut, before you sign off on it, by jumping straight to the flagged timestamps instead of listening end to end.",
    "Tracking down an audible click in a 40-minute podcast export: the discontinuity shows up as a high-score sample-jump candidate you can read off in seconds.",
    "Screening a voiceover file for DC-offset steps that suggest two takes were butted together at different noise floors, which the waveform view alone would not make obvious.",
  ],
  benefits: [
    [
      "Robust statistics, not a fixed loudness cutoff",
      "The detection baseline is the median of per-bin maximum jumps and the scale is the median absolute deviation times 1.4826, so a noisy recording does not drown the threshold and a very clean one does not flood you with false hits.",
    ],
    [
      "Two independent cues, labelled separately",
      "Each candidate is tagged sample-jump, dc-shift or both, so a hard waveform discontinuity is distinguishable from a slow offset step between two takes.",
    ],
    [
      "Nearby hits collapse to one timestamp",
      "Candidates within the merge window (50 ms by default, adjustable 10-500 ms) collapse to the single strongest one, so one click does not appear as a cluster of near-identical rows.",
    ],
  ],
  faqs: [
    [
      "What do the detection settings actually mean?",
      "There are four. Score threshold (default 6, range 3-20) is the modified z-score a jump must clear; absolute jump (default 0.08, range 0.01-1) is the minimum raw sample-to-sample step in normalised amplitude; DC shift (default 0.025, range 0.005-0.5) is the minimum change in local mean across the point; merge window (default 50 ms) collapses neighbouring hits. A candidate is reported if it clears the jump pair or the DC rule.",
    ],
    [
      "How large a file can I analyse?",
      "Up to 30 MB and 10 minutes, mono or stereo, at a decoded sample rate no higher than 96 kHz, with a ceiling of 24 million total sample values. Results are capped at 500 candidates, and the report tells you when that cap was reached so you know the list is truncated.",
    ],
    [
      "Can this prove a recording was edited?",
      "No, and the exported report states so explicitly — it records that authenticity was not established and no edit was proven. Legitimate production choices such as gates, fades, splices between silent regions and codec artefacts all produce discontinuities, so every flag is a candidate for review, not evidence.",
    ],
    [
      "Does anything from my audio leave the browser or end up in the report?",
      "No. Decoding and analysis run locally, and the JSON report deliberately excludes the file name, the audio samples and the waveform data — it carries only timestamps, jump and DC values, scores, cue labels and your settings.",
    ],
  ],
};

export default seo;
