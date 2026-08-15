const seo = {
  title: "SRT Subtitle Timing Adjuster: Shift, Scale & Fix FPS Drift",
  metaDescription:
    "Shift SRT subtitles by milliseconds, scale by percent, or convert 23.976 to 25 fps drift — with cue-range targeting, overlap fixes and SRT/VTT export.",
  steps: [
    "Paste your subtitle file into the Input SRT box, or click Load Demo SRT to try three sample cues.",
    "Set Offset ms (+/-), Scale % or a source-to-target fps conversion such as 23.976 to 25, optionally confined to a start and end cue index.",
    "Check the QA counts for overlaps and cues over 20 characters per second, then click Download Adjusted SRT (saved as adjusted-subtitles.srt) or Download WebVTT.",
  ],
  intro:
    "The Subtitle Timing Adjuster re-times an SRT file by applying a millisecond offset, a percentage speed scale, or a frame-rate ratio such as 23.976 to 25 fps, to every cue or only to a chosen cue range. It parses standard hh:mm:ss,mmm timecodes, recalculates them, and rewrites a clean, renumbered SRT you can paste straight back into your player or editor. Editors and fansubbers use it when captions drift or arrive out of sync with a re-encoded video.",
  useCases: [
    "Subtitles run exactly 2.4 seconds ahead of the dialogue for the whole film, so you enter an offset of -2400 ms and export a corrected file.",
    "A caption file made for a 23.976 fps source is progressively later and later against a 25 fps PAL copy — the frame-rate ratio fixes the drift that a flat offset cannot.",
    "Only the second half of an episode is off because a scene was trimmed, so you target cues from a given index onward and leave the opening untouched.",
  ],
  benefits: [
    ["Fixes drift, not just delay", "A percentage scale and a source-to-target fps ratio stretch or compress the whole timeline, which is what progressive desync actually needs."],
    ["Edits a range, not always the file", "Start and end cue numbers confine the shift, so one bad section can be corrected without disturbing timings that are already right."],
    ["Runs QA before you export", "It counts overlapping cues, cues shorter than 0.7 seconds and lines exceeding 20 characters per second, so readability problems surface before delivery."],
  ],
  faqs: [
    [
      "How do I shift subtitles that appear too early?",
      "Enter a positive offset in milliseconds to push every cue later, and a negative one to pull them earlier — 2 seconds is 2000. A constant offset is the right fix only when the gap stays the same from the first line to the last.",
    ],
    [
      "Why do my subtitles start in sync and drift later on?",
      "That is a frame-rate mismatch, usually a file timed for 23.976 fps played against 25 fps or the reverse. Timecodes are rescaled by the source-over-target ratio, which corrects the drift proportionally instead of moving everything by a fixed amount.",
    ],
    [
      "What counts as too fast to read?",
      "The QA panel flags any cue above 20 characters per second, along with cues that last under 0.7 seconds. Broadcast guidelines typically sit in the 17–20 cps range for adult programming, and lower for children's content.",
    ],
    [
      "Can it stop subtitles from overlapping after a shift?",
      "Yes. With overlap removal on, any cue that would start before the previous one ends is pushed back to leave a minimum gap, 20 ms by default, and cue numbering is rebuilt sequentially on export.",
    ],
  ],
};

export default seo;
