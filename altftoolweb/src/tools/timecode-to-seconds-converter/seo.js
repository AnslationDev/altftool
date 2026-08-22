const seo = {
  title: "SMPTE Timecode to Seconds Converter (Drop-Frame)",
  metaDescription:
    "Convert HH:MM:SS:FF to real seconds and frame numbers at 23.976-60 fps, with SMPTE drop-frame rules and exact 1000/1001 NTSC rates — both directions.",
  steps: [
    "Choose 'Timecode → seconds' or 'Seconds → timecode' and pick the frame rate — 23.976 through 60 fps, drop-frame or non-drop.",
    "Type the timecode as HH:MM:SS:FF (one-click presets like 01:00:00;00 included) or the duration in seconds; illegal drop-frame labels are rejected.",
    "Read the real elapsed seconds, frame number and pulldown drift versus the literal digits, then click 'Copy result'.",
  ],
  intro:
    "SMPTE timecode counts frames, not seconds, so converting HH:MM:SS:FF to a duration means turning the label into a frame number and dividing by the true frame rate. This converter does both directions at 23.976 through 60 fps, applies the SMPTE ST 12-1 drop-frame rule (skip two frame numbers at the start of every minute except every tenth, four at 59.94), and divides by the exact 1000/1001 NTSC rate rather than the rounded one.",
  useCases: [
    "Turning an EDL or subtitle in-point like 00:04:12;18 into the seconds value a web player or FFmpeg seek expects",
    "Checking why a 29.97 non-drop programme measured an hour on the timeline but ran 3.6 seconds long on air",
    "Finding the exact frame number to type into a conform or VFX pull sheet from a duration in seconds",
  ],
  benefits: [
    ["Correct drop-frame arithmetic", "Illegal labels such as 00:01:00;00 are rejected rather than quietly converted."],
    ["Exact NTSC rates", "Uses 30000/1001 and 24000/1001, not 29.97 and 23.98, so long durations do not accumulate error."],
    ["Frame numbers alongside seconds", "Every result shows the sequential frame index, which is what conform tools actually match on."],
  ],
  faqs: [
    [
      "How do I convert timecode to seconds?",
      "Turn the timecode into a total frame count, then divide by the real frame rate. At 25 fps, 00:01:30:12 is (90 × 25) + 12 = 2262 frames, and 2262 ÷ 25 = 90.48 seconds. At NTSC rates divide by 30000/1001 rather than 30.",
    ],
    [
      "What is the difference between drop-frame and non-drop timecode?",
      "Both count exactly the same frames; only the labelling differs. Drop-frame skips frame numbers 00 and 01 at the start of every minute except every tenth minute, which keeps the label within about 2 frames of the wall clock. Non-drop 29.97 labels every frame, so one hour of timecode takes 3603.6 real seconds — 3.6 seconds long.",
    ],
    [
      "Does drop-frame timecode delete frames?",
      "No. It drops frame numbers, never pictures. A drop-frame and a non-drop version of the same clip contain an identical number of frames; the drop-frame version simply never uses certain labels, which is why 00:01:00;00 does not exist while 00:01:00;02 does.",
    ],
    [
      "Why is 29.97 not exactly 30 frames per second?",
      "When colour was added to NTSC the frame rate was pulled down by a factor of 1000/1001 to keep the colour subcarrier from beating against the audio carrier. The exact rate is 30000/1001 ≈ 29.970030 fps, and the same 1.001 factor gives 23.976 and 59.94.",
    ],
  ],
};

export default seo;
