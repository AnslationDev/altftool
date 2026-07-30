const seo = {
  intro:
    "The Audio-Transcript Alignment Checker measures your audio in 50 ms RMS windows, marks every window above -40 dBFS as speech activity, and reports what percentage of that activity falls inside an SRT or WebVTT cue — plus the specific stretches of audio that no cue covers. Paste a second transcript and it also pairs cues by time overlap and flags text differences using a Dice token-similarity score below 0.85 and boundary shifts beyond 500 ms. It is for captioners, QC reviewers and accessibility teams who need to find the missing or drifted cue rather than proofread the whole file.",
  useCases: [
    "Checking a captioner's delivery before you accept it: if active audio coverage comes back at 91% you know roughly a tenth of the speech has no cue over it, and the uncovered ranges tell you where.",
    "Finding out why captions on a re-cut episode feel late, by diffing the new SRT against the pre-cut reference and reading the start and end delta in milliseconds for each shifted cue.",
    "Catching cues that were left over from an earlier edit — timings that sit past the end of the audio, or cues placed over near-silence, both of which are listed separately.",
  ],
  benefits: [
    [
      "Finds the gaps, not just a pass/fail",
      "Uncovered speech is merged into contiguous ranges and reported with its peak dB and in/out times, so you get a worklist of timestamps instead of a single score.",
    ],
    [
      "Diffs two transcripts by time, then by words",
      "Cues are paired by greatest time overlap first, so a renumbered or re-split file still matches up, and only then is the text compared — a rename does not read as a rewrite.",
    ],
    [
      "Separates the four ways a transcript goes wrong",
      "Findings are typed as reference-unmatched, candidate-extra, text-difference or timing-shift and counted individually, so a missing cue is never confused with a mistyped one.",
    ],
  ],
  faqs: [
    [
      "What do the alignment settings control?",
      "Five values. Activity threshold (default -40 dBFS, range -80 to -6) decides what counts as speech; window size (default 50 ms, range 20-200) sets the measurement resolution; minimum uncovered length (default 250 ms) suppresses trivial gaps; timing tolerance (default 500 ms) is how far a cue boundary may drift before it is flagged; text similarity threshold (default 0.85) is the score below which two cue texts are reported as different.",
    ],
    [
      "How is text similarity between two cues scored?",
      "As a Dice coefficient over word tokens: twice the number of shared tokens divided by the combined token count of both cues, giving 1.0 for identical wording and 0 for no shared words. Comparison is case-insensitive and ignores punctuation and markup, so `Hello, world!` and `hello world` score 1.0.",
    ],
    [
      "What transcript formats and sizes does it accept?",
      "SRT and WebVTT blocks with `-->` timing lines in HH:MM:SS,mmm or MM:SS.mmm form, up to 1,000,000 characters and 5,000 cues; WEBVTT, NOTE, STYLE and REGION headers are skipped and tags and entities are stripped before comparison. Audio is limited to 30 MB, 10 minutes, mono or stereo, up to 96 kHz.",
    ],
    [
      "Does this check whether my captions are accurate or WCAG compliant?",
      "No, and the exported report says so explicitly. No speech recognition is performed, so the tool never knows what was actually said — it only compares energy in the audio against cue timings, and compares your two transcripts against each other. Semantic accuracy and WCAG conformance still need a human reviewer.",
    ],
  ],
};

export default seo;
