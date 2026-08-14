const seo = {
  title: "SRT & VTT Caption Checker: CPS, Overlaps, Lines",
  metaDescription:
    "Audit SRT or WebVTT cues for overlaps, 20 CPS and 180 WPM reading speed, 1-7 second duration and line limits — tags stripped before counting.",
  steps: [
    "Use Open file for a local .srt or .vtt, paste the cues into the caption box, or press Load sample.",
    "Set Maximum CPS, Maximum WPM, Minimum and Maximum duration (seconds), Maximum visible lines and Maximum characters per line, then press Check captions.",
    "Read the per-cue findings for overlaps in milliseconds and over-speed cues, then press Download counts-only report to save caption-audit-counts-only.json.",
  ],
  intro:
    "The Caption Speed & Collision Checker parses an SRT or WebVTT file and flags every cue that overlaps the previous one, runs too fast to read, or breaks your line limits — using editorial defaults of 20 characters per second, 180 words per minute, 1–7 second cue duration, 2 lines, and 42 characters per line. It strips markup tags and HTML entities before counting, so styling like <i> or &amp; never inflates a reading-speed number. Subtitlers, localisation QA and accessibility reviewers get a per-cue finding list plus a counts-only report that contains no caption text at all.",
  useCases: [
    "A subtitle file came back from a vendor and you need to know, before it goes to the platform, whether any cue starts before the previous one ends — the overlap check lists every collision with the exact millisecond of overlap.",
    "Your broadcaster's style guide says 2 lines of 42 characters and nothing under one second on screen; you set those thresholds once and get a list of the cues that break them instead of scrubbing the timeline.",
    "A translated track reads fine to you but testers say it flies past — checking CPS and WPM per cue shows which specific lines are above 20 CPS and by how much.",
  ],
  benefits: [
    [
      "Counts what viewers actually read",
      "Tags and entities are stripped before characters and words are counted, so <i>italics</i> and &nbsp; do not distort CPS or line length.",
    ],
    [
      "Thresholds you control",
      "CPS, WPM, minimum and maximum duration, line count and characters per line are all editable, so the audit matches your house style rather than a fixed preset.",
    ],
    [
      "A report you can share safely",
      "The exportable report holds only aggregate counts and your threshold settings — no cue text, timestamps, identifiers or filenames.",
    ],
  ],
  faqs: [
    [
      "What is a good reading speed for subtitles?",
      "The tool defaults to a maximum of 20 characters per second and 180 words per minute, which sits in the range most broadcast and streaming style guides use for adult content. Guides for children's programming are usually slower, so lower the CPS threshold if you are working to one.",
    ],
    [
      "How long should a subtitle stay on screen?",
      "The default window is 1,000 ms minimum and 7,000 ms maximum per cue; anything shorter is flagged as too brief to read and anything longer as lingering. Both limits are configurable if your delivery spec differs.",
    ],
    [
      "Does it detect overlapping subtitles?",
      "Yes — every cue that begins before the previous positive-duration cue ends is reported as an error, along with the size of the overlap in milliseconds. Cues whose end time is not after their start time are separately flagged as nonpositive duration.",
    ],
    [
      "Does it work with both SRT and WebVTT?",
      "Yes. The format is auto-detected from the WEBVTT header or the timestamp separator — a comma before the milliseconds means SRT, a period means WebVTT — and WebVTT NOTE, STYLE and REGION blocks are skipped rather than audited as cues.",
    ],
  ],
};

export default seo;
